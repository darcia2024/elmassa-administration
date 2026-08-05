import { NextResponse } from "next/server";
import { getPool } from "@/lib/db/connection";
import { upsertCustomerFromBooking } from "@/lib/customers/store";
import { createPayment } from "@/lib/payments/store";
import { dataResetBlockedResponse, isDataResetAllowed } from "@/lib/db/destructive-guard";
import { todayWIB } from "@/lib/format/date";

async function ensureTable() {
  const client = await getPool().connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS real_bookings (
        code VARCHAR(100) PRIMARY KEY,
        customer_name TEXT NOT NULL,
        phone TEXT DEFAULT '',
        nik TEXT DEFAULT '',
        package_id TEXT DEFAULT '',
        package_name TEXT NOT NULL,
        departure TEXT DEFAULT '',
        room_type TEXT DEFAULT 'Quad (4 Orang)',
        participants INT DEFAULT 1,
        total_amount NUMERIC DEFAULT 0,
        paid_amount NUMERIC DEFAULT 0,
        remaining_amount NUMERIC DEFAULT 0,
        status TEXT DEFAULT 'Belum Bayar',
        umrah_me_status TEXT DEFAULT 'Aktif 🟢',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
  } catch (err) {
    console.error("Error creating real_bookings table:", err);
  } finally {
    client.release();
  }
}

// GET: Fetch all bookings from Supabase Cloud DB
export async function GET() {
  try {
    await ensureTable();
    const res = await getPool().query(`
      SELECT 
        code,
        customer_name as "customerName",
        customer_name as "customer",
        phone,
        nik,
        package_id as "packageId",
        package_name as "packageName",
        departure,
        room_type as "roomType",
        participants,
        total_amount as "totalAmount",
        paid_amount as "paidAmount",
        remaining_amount as "remainingAmount",
        status,
        umrah_me_status as "umrahMeStatus",
        created_at as "createdAt"
      FROM real_bookings 
      ORDER BY created_at DESC;
    `);
    return NextResponse.json({ ok: true, data: res.rows });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

// POST: Save/Create booking to Supabase Cloud DB
//
// paid_amount is never accepted as a raw number here — a booking is always
// born unpaid. An initial DP goes through createPayment() below instead, so
// it produces a real payment + kuitansi row like any other payment does,
// instead of the booking silently claiming money that Pembayaran/Laporan/
// Kuitansi never saw. See HANDOFF.md 6.2 for how bad the old shortcut was.
export async function POST(req: Request) {
  try {
    await ensureTable();
    const b = await req.json();

    const client = await getPool().connect();
    let insertedCode: string | null = null;
    try {
      const code = b.code || `BK-${Math.floor(100000 + Math.random() * 900000)}`;
      const totalAmount = Number(b.totalAmount) || 33500000;
      const requestedDp = Math.max(0, Number(b.paidAmount) || 0);

      const res = await client.query(
        `INSERT INTO real_bookings (
          code, customer_name, phone, nik, package_id, package_name, departure, room_type, participants, total_amount, paid_amount, remaining_amount, status, umrah_me_status
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 0, $10, 'Belum Bayar', $11)
        ON CONFLICT (code) DO UPDATE SET
          customer_name = EXCLUDED.customer_name,
          phone = EXCLUDED.phone,
          nik = EXCLUDED.nik,
          package_id = EXCLUDED.package_id,
          package_name = EXCLUDED.package_name,
          departure = EXCLUDED.departure,
          room_type = EXCLUDED.room_type,
          participants = EXCLUDED.participants,
          total_amount = EXCLUDED.total_amount,
          umrah_me_status = EXCLUDED.umrah_me_status
        RETURNING (xmax = 0) AS inserted;`,
        [
          code,
          b.customerName || b.customer || "Jamaah Terdaftar",
          b.phone || "",
          b.nik || "",
          b.packageId || "",
          b.packageName || "Umrah Spesial El Massa",
          b.departure || "",
          b.roomType || "Quad (4 Orang)",
          Number(b.participants) || 1,
          totalAmount,
          b.umrahMeStatus || "Aktif 🟢",
        ]
      );

      // xmax = 0 means this row was just inserted, not updated via ON CONFLICT.
      // Only a genuinely new booking gets its DP turned into a payment — a
      // retried/duplicate submission of the same code must not double it.
      if (res.rows[0]?.inserted) insertedCode = code;

      // Keep the customer master list in step with reality. Without this the
      // Pelanggan page stays empty no matter how many jamaah register.
      await upsertCustomerFromBooking({
        customerName: b.customerName || b.customer,
        phone: b.phone,
        city: b.city,
      });

      if (insertedCode && requestedDp > 0) {
        await createPayment({
          bookingCode: insertedCode,
          date: todayWIB(),
          amount: requestedDp,
          method: "Transfer Bank",
          notes: "DP awal saat booking dibuat",
          paymentFor: "DP awal booking",
        });
      }

      return NextResponse.json({ ok: true, message: "Booking saved to Supabase Cloud DB", code });
    } finally {
      client.release();
    }
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

// Note: this route used to also export PATCH, accepting {code, paidAmount,
// remainingAmount, status} and writing paid_amount straight to the row —
// nothing in the UI called it (verified before removing), and it was the
// same money-integrity hole as the POST handler used to be, just via a
// different route. Editing a booking's own fields goes through
// PATCH /api/bookings/[code]; manual status overrides (Dibatalkan/Refund)
// go through PATCH /api/bookings/[code]/status. Money only ever moves
// through /api/payments now.

// DELETE: Remove booking or wipe all bookings
export async function DELETE(req: Request) {
  try {
    await ensureTable();
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code") || searchParams.get("id");
    const wipeAll = searchParams.get("all") === "true" || searchParams.get("clearAll") === "true" || code === "ALL";

    if (wipeAll) {
      if (!isDataResetAllowed()) {
        return dataResetBlockedResponse();
      }
      await getPool().query("TRUNCATE TABLE real_bookings;");
      return NextResponse.json({ ok: true, message: "All bookings wiped from Supabase Cloud DB" });
    }

    if (!code) return NextResponse.json({ ok: false, error: "code required" }, { status: 400 });

    await getPool().query("DELETE FROM real_bookings WHERE code = $1;", [code]);
    return NextResponse.json({ ok: true, message: `Booking ${code} deleted from Supabase` });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
