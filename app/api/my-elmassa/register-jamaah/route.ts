import { NextResponse } from "next/server";
import { getPool } from "@/lib/db/connection";
import { findAgentByCode } from "@/lib/agents/store";
import { upsertCustomerFromBooking } from "@/lib/customers/store";
import { createParticipantsForBooking } from "@/lib/participants/store";
import { randomBytes } from "crypto";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const agentCode = String(body.agentCode ?? "").trim();

    if (!agentCode) {
      return NextResponse.json(
        { ok: false, error: "Identitas agen (agentCode) wajib disertakan" },
        { status: 400 },
      );
    }

    const agent = await findAgentByCode(agentCode);
    if (!agent || agent.status !== "Aktif") {
      return NextResponse.json(
        { ok: false, error: "Agen tidak ditemukan atau status keagenan tidak aktif" },
        { status: 403 },
      );
    }

    const packageId = String(body.packageId ?? "").trim();
    if (!packageId) {
      return NextResponse.json(
        { ok: false, error: "Pilih paket keberangkatan terlebih dahulu" },
        { status: 400 },
      );
    }

    const pool = getPool();

    // 1. Fetch package details
    const pkgRes = await pool.query(
      `SELECT id, name, departure_date, numeric_price, price, makkah_hotel, madinah_hotel 
       FROM published_packages 
       WHERE id = $1 LIMIT 1`,
      [packageId],
    );

    if (pkgRes.rows.length === 0) {
      return NextResponse.json(
        { ok: false, error: "Paket keberangkatan yang dipilih tidak valid" },
        { status: 404 },
      );
    }

    const pkg = pkgRes.rows[0];
    const basePrice = Number(pkg.numeric_price) || 34500000;

    const jamaahList: Array<{
      name: string;
      nik?: string;
      passport?: string;
      phone?: string;
      gender?: string;
      roomType?: string;
    }> = Array.isArray(body.jamaahList) && body.jamaahList.length > 0
      ? body.jamaahList
      : [
          {
            name: String(body.picName || "Jamaah Agen").trim(),
            nik: String(body.picNik || "").trim(),
            passport: String(body.picPassport || "").trim(),
            phone: String(body.picPhone || "").trim(),
            gender: String(body.picGender || "L").trim(),
            roomType: String(body.roomType || "Quad (4 Orang)").trim(),
          },
        ];

    const validJamaah = jamaahList.filter((j) => j && j.name && j.name.trim().length > 0);
    if (validJamaah.length === 0) {
      return NextResponse.json(
        { ok: false, error: "Minimal harus menyertakan 1 nama calon jamaah" },
        { status: 400 },
      );
    }

    const picName = String(body.picName || validJamaah[0].name).trim();
    const picPhone = String(body.picPhone || validJamaah[0].phone || "").trim();
    const picCity = String(body.picCity || agent.city || "").trim();
    const defaultRoomType = String(body.roomType || "Quad (4 Orang)").trim();

    // 2. Room surcharge computation
    // Quad = base, Triple = +Rp 1.500.000, Double = +Rp 3.000.000 per jamaah
    function getRoomSurcharge(rt: string) {
      const lower = rt.toLowerCase();
      if (lower.includes("double") || lower.includes("2 orang")) return 3000000;
      if (lower.includes("triple") || lower.includes("3 orang")) return 1500000;
      return 0;
    }

    let totalAmount = 0;
    for (const j of validJamaah) {
      const room = j.roomType || defaultRoomType;
      totalAmount += basePrice + getRoomSurcharge(room);
    }

    // 3. Generate Booking Code (BK-MYE-XXXXXX)
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const bookingCode = `BK-MYE-${randomSuffix}`;

    // 4. Insert into real_bookings
    // UmrahMe status starts as "Menunggu Verifikasi Kantor (Belum Aktif)"
    // Only after payment is received and approved by office will UmrahMe be activated.
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      await client.query(
        `INSERT INTO real_bookings (
          code, customer_name, phone, nik, package_id, package_name, departure, room_type, participants, total_amount, paid_amount, remaining_amount, status, umrah_me_status, agent_code
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 0, $10, 'Belum Bayar', $11, $12)`,
        [
          bookingCode,
          picName,
          picPhone,
          validJamaah[0].nik || "",
          pkg.id,
          pkg.name,
          pkg.departure_date ? new Date(pkg.departure_date).toISOString().split("T")[0] : "",
          defaultRoomType,
          validJamaah.length,
          totalAmount,
          "Menunggu Pembayaran",
          agent.agentCode,
        ],
      );

      // 5. Insert participants
      for (const j of validJamaah) {
        const participantRoom = j.roomType || defaultRoomType;
        await client.query(
          `INSERT INTO participants (booking_code, name, passport_number, contact, document_status, room_type)
           VALUES ($1, $2, $3, $4, 'Belum Lengkap', $5)`,
          [
            bookingCode,
            j.name.trim(),
            (j.passport || "").trim(),
            (j.phone || picPhone).trim(),
            participantRoom,
          ],
        );

        // 6. Register / link in jamaah_profiles with self_service_token
        const token = randomBytes(24).toString("hex");
        await client.query(
          `INSERT INTO jamaah_profiles (
            name, phone, nik, passport_number, gender, self_service_token, source
          )
          VALUES ($1, $2, $3, $4, $5, $6, 'my-elmassa')
          ON CONFLICT (phone) DO NOTHING`,
          [
            j.name.trim(),
            (j.phone || picPhone).trim(),
            (j.nik || "").trim(),
            (j.passport || "").trim(),
            j.gender || "L",
            token,
          ],
        ).catch(() => {});
      }

      await client.query("COMMIT");
    } catch (dbErr) {
      await client.query("ROLLBACK");
      throw dbErr;
    } finally {
      client.release();
    }

    // 7. Upsert CRM customer record
    await upsertCustomerFromBooking({
      customerName: picName,
      phone: picPhone,
      city: picCity,
    }).catch(() => {});

    // 8. Calculate estimated agent commission for this registration
    const commissionEstimate =
      agent.commissionType === "persen"
        ? Math.round((totalAmount * agent.commissionValue) / 100)
        : Math.round(agent.commissionValue * validJamaah.length);

    return NextResponse.json({
      ok: true,
      bookingCode,
      packageName: pkg.name,
      departureDate: pkg.departure_date,
      paxCount: validJamaah.length,
      totalAmount,
      commissionEstimate,
      umrahMeStatus: "Menunggu Pembayaran (Belum Aktif)",
      message: `Pendaftaran ${validJamaah.length} jamaah berhasil tercatat di sistem El Massa. Kode Booking: ${bookingCode}`,
      instructions: [
        "Data jamaah telah tersimpan langsung di sistem pusat El Massa Web.",
        "Tim admin & kasir kantor akan memverifikasi pendaftaran dan pembayaran DP.",
        "Setelah DP / pembayaran dikonfirmasi oleh kantor, akun aplikasi UmrahMe jamaah akan otomatis diaktifkan.",
      ],
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal mendaftarkan jamaah";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
