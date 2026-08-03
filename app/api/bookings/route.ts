import { NextResponse } from "next/server";
import { Pool } from "pg";

const connectionString =
  "postgresql://postgres.dekeoqlowiozsjpsqdsl:l7FItz7zmhhB2Yfo@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres";

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

async function ensureTable() {
  const client = await pool.connect();
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
    const res = await pool.query(`
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
export async function POST(req: Request) {
  try {
    await ensureTable();
    const b = await req.json();

    const client = await pool.connect();
    try {
      const code = b.code || `BK-${Math.floor(100000 + Math.random() * 900000)}`;
      const totalAmount = Number(b.totalAmount) || 33500000;
      const paidAmount = Number(b.paidAmount) || 0;
      const remainingAmount = Number(b.remainingAmount) ?? Math.max(0, totalAmount - paidAmount);
      const status = b.status || (remainingAmount <= 0 ? "Lunas" : paidAmount > 0 ? "DP" : "Belum Bayar");

      await client.query(
        `INSERT INTO real_bookings (
          code, customer_name, phone, nik, package_id, package_name, departure, room_type, participants, total_amount, paid_amount, remaining_amount, status, umrah_me_status
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
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
          paid_amount = EXCLUDED.paid_amount,
          remaining_amount = EXCLUDED.remaining_amount,
          status = EXCLUDED.status,
          umrah_me_status = EXCLUDED.umrah_me_status;`,
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
          paidAmount,
          remainingAmount,
          status,
          b.umrahMeStatus || "Aktif 🟢",
        ]
      );

      return NextResponse.json({ ok: true, message: "Booking saved to Supabase Cloud DB", code });
    } finally {
      client.release();
    }
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

// PATCH: Update booking payment or status
export async function PATCH(req: Request) {
  try {
    await ensureTable();
    const { code, status, paidAmount, remainingAmount } = await req.json();
    if (!code) return NextResponse.json({ ok: false, error: "code required" }, { status: 400 });

    if (paidAmount !== undefined && remainingAmount !== undefined) {
      await pool.query(
        `UPDATE real_bookings SET paid_amount = $1, remaining_amount = $2, status = $3 WHERE code = $4;`,
        [Number(paidAmount), Number(remainingAmount), status, code]
      );
    } else if (status) {
      await pool.query(`UPDATE real_bookings SET status = $1 WHERE code = $2;`, [status, code]);
    }

    return NextResponse.json({ ok: true, message: `Booking ${code} updated` });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

// DELETE: Remove booking or wipe all bookings
export async function DELETE(req: Request) {
  try {
    await ensureTable();
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code") || searchParams.get("id");
    const wipeAll = searchParams.get("all") === "true" || searchParams.get("clearAll") === "true" || code === "ALL";

    if (wipeAll) {
      await pool.query("TRUNCATE TABLE real_bookings;");
      return NextResponse.json({ ok: true, message: "All bookings wiped from Supabase Cloud DB" });
    }

    if (!code) return NextResponse.json({ ok: false, error: "code required" }, { status: 400 });

    await pool.query("DELETE FROM real_bookings WHERE code = $1;", [code]);
    return NextResponse.json({ ok: true, message: `Booking ${code} deleted from Supabase` });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
