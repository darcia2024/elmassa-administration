import { NextResponse } from "next/server";
import { getPool } from "@/lib/db/connection";
import { findAgentByCode } from "@/lib/agents/store";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const agentCode = String(searchParams.get("agentCode") ?? "").trim();

    if (!agentCode) {
      return NextResponse.json(
        { ok: false, error: "Parameter agentCode wajib diisi" },
        { status: 400 },
      );
    }

    const agent = await findAgentByCode(agentCode);
    if (!agent) {
      return NextResponse.json(
        { ok: false, error: "Data agen tidak ditemukan" },
        { status: 404 },
      );
    }

    const pool = getPool();

    // 1. Fetch available packages with active seats
    const packagesRes = await pool.query(`
      SELECT 
        p.id,
        p.name,
        p.category,
        p.duration,
        p.departures_date as "departuresDate",
        p.departure_date as "departureDate",
        p.return_date as "returnDate",
        p.price,
        p.numeric_price as "numericPrice",
        p.dp_minimum as "dpMinimum",
        p.makkah_hotel as "makkahHotel",
        p.madinah_hotel as "madinahHotel",
        p.airline,
        p.flight_route as "flightRoute",
        COALESCE(p.target_pax, 45)::int as "targetPax",
        COALESCE(bk.booked_pax, 0)::int as "bookedPax"
      FROM published_packages p
      LEFT JOIN (
        SELECT package_id, SUM(participants)::int as booked_pax
        FROM real_bookings
        WHERE package_id IS NOT NULL AND package_id <> ''
        GROUP BY package_id
      ) bk ON bk.package_id = p.id
      ORDER BY p.departure_date ASC;
    `);

    const packages = packagesRes.rows.map((row) => {
      const target = Number(row.targetPax) || 45;
      const booked = Number(row.bookedPax) || 0;
      const available = Math.max(0, target - booked);
      return {
        ...row,
        targetPax: target,
        bookedPax: booked,
        availableSeats: available,
      };
    });

    // 2. Fetch bookings registered by this agent
    const bookingsRes = await pool.query(
      `SELECT 
         b.code,
         b.customer_name as "customerName",
         b.phone,
         b.nik,
         b.package_id as "packageId",
         b.package_name as "packageName",
         b.departure,
         b.room_type as "roomType",
         b.participants,
         b.total_amount as "totalAmount",
         b.paid_amount as "paidAmount",
         b.remaining_amount as "remainingAmount",
         b.status,
         b.umrah_me_status as "umrahMeStatus",
         b.created_at as "createdAt",
         b.agent_code as "agentCode"
       FROM real_bookings b
       WHERE UPPER(TRIM(b.agent_code)) = UPPER($1)
       ORDER BY b.created_at DESC;`,
      [agentCode],
    );

    // 3. Fetch participants for each booking to show jamaah names
    const bookingCodes = bookingsRes.rows.map((b) => b.code);
    let participantsMap: Record<string, Array<{ id: string; name: string; passport: string; documentStatus: string }>> = {};

    if (bookingCodes.length > 0) {
      const partRes = await pool.query(
        `SELECT 
           p.id,
           p.booking_code as "bookingCode",
           p.name,
           p.passport_number as "passport",
           p.document_status as "documentStatus"
         FROM participants p
         WHERE p.booking_code = ANY($1)
         ORDER BY p.name ASC;`,
        [bookingCodes],
      );

      for (const row of partRes.rows) {
        if (!participantsMap[row.bookingCode]) {
          participantsMap[row.bookingCode] = [];
        }
        participantsMap[row.bookingCode].push({
          id: row.id,
          name: row.name,
          passport: row.passport,
          documentStatus: row.documentStatus,
        });
      }
    }

    const bookings = bookingsRes.rows.map((b) => ({
      ...b,
      totalAmount: Number(b.totalAmount) || 0,
      paidAmount: Number(b.paidAmount) || 0,
      remainingAmount: Number(b.remainingAmount) || 0,
      participantsCount: Number(b.participants) || 1,
      jamaahList: participantsMap[b.code] || [],
    }));

    // 4. Summarize statistics
    const totalBookings = bookings.length;
    const totalJamaah = bookings.reduce((sum, b) => sum + (b.participantsCount || 1), 0);
    const totalGross = bookings.reduce((sum, b) => sum + b.totalAmount, 0);
    const totalPaid = bookings.reduce((sum, b) => sum + b.paidAmount, 0);

    const commissionType = agent.commissionType;
    const commissionRate = agent.commissionValue;
    const estimatedCommission =
      commissionType === "persen"
        ? Math.round((totalGross * commissionRate) / 100)
        : Math.round(commissionRate * totalJamaah);

    const umrahMeActiveCount = bookings.filter((b) =>
      String(b.umrahMeStatus || "").toLowerCase().includes("aktif"),
    ).length;

    return NextResponse.json({
      ok: true,
      agent: {
        id: agent.id,
        agentCode: agent.agentCode,
        name: agent.name,
        phone: agent.phone,
        email: agent.email,
        city: agent.city,
        commissionType: agent.commissionType,
        commissionValue: agent.commissionValue,
        bankName: agent.bankName,
        bankAccount: agent.bankAccount,
      },
      stats: {
        totalBookings,
        totalJamaah,
        totalGross,
        totalPaid,
        estimatedCommission,
        umrahMeActiveCount,
      },
      packages,
      bookings,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal memuat dashboard My El Massa";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
