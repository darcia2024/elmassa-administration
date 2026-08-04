import { NextResponse } from "next/server";
import { getPool } from "@/lib/db/connection";

export async function POST() {
  const client = await getPool().connect();
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
