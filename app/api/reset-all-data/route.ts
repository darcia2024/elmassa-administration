import { NextResponse } from "next/server";
import { Pool } from "pg";

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres.dekeoqlowiozsjpsqdsl:9I1er0NtdwzcZ81H@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres";

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

export async function POST() {
  const client = await pool.connect();
  try {
    // 1. Truncate published_packages table in Supabase
    await client.query("TRUNCATE TABLE published_packages;");

    return NextResponse.json({
      ok: true,
      message: "Seluruh data paket di Cloud Supabase telah dibersihkan total.",
      purgedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  } finally {
    client.release();
  }
}
