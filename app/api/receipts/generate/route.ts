import { NextRequest, NextResponse } from "next/server";
import { findReceiptDetail } from "@/lib/receipts/store";

// Every payment auto-generates its receipt at creation time (see
// lib/payments/store.ts createPayment) so there is nothing left to "generate"
// here — this just looks the receipt back up for callers still using this
// endpoint's contract (paymentId in, receipt out).
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const paymentId = typeof body.paymentId === "string" ? body.paymentId.trim() : "";

  if (!paymentId) {
    return NextResponse.json({ error: "paymentId wajib diisi" }, { status: 400 });
  }

  const data = await findReceiptDetail(paymentId);

  if (!data) {
    return NextResponse.json(
      { error: "Pembayaran tidak ditemukan, atau kuitansinya belum terbit" },
      { status: 404 },
    );
  }

  return NextResponse.json(
    {
      data,
      meta: {
        generated: false,
        source: "supabase",
      },
    },
    { status: 200 },
  );
}
