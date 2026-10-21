import { NextRequest, NextResponse } from "next/server";
import { getPaymentSummary } from "@/lib/payments/summary";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const packageId = searchParams.get("packageId") || null;
    const group = searchParams.get("group") || null;

    const data = await getPaymentSummary({ packageId, group });
    return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Gagal memuat rekap pembayaran" }, { status: 500 });
  }
}
