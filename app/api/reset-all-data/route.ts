import { NextResponse } from "next/server";
import { Pool } from "pg";

const connectionString =
  "postgresql://postgres.dekeoqlowiozsjpsqdsl:l7FItz7zmhhB2Yfo@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres";

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

export async function POST() {
  const client = await pool.connect();
  try {
    await client.query("TRUNCATE TABLE published_packages;");
    await client.query("TRUNCATE TABLE real_bookings;");
    await client.query("TRUNCATE TABLE real_customers;");

    return NextResponse.json({
      ok: true,
      message: "Seluruh data paket, booking, & jamaah di Cloud Supabase telah dibersihkan total.",
      purgedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  } finally {
    client.release();
  }
}
