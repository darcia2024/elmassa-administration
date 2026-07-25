import { NextRequest, NextResponse } from "next/server";
import { generateReceiptFromPayment } from "@/lib/seed-data/receipts";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const paymentId = typeof body.paymentId === "string" ? body.paymentId.trim() : "";

  if (!paymentId) {
    return NextResponse.json(
      {
        error: "paymentId wajib diisi",
      },
      {
        status: 400,
      },
    );
  }

  const data = generateReceiptFromPayment(paymentId);

  if (!data) {
    return NextResponse.json({ error: "Pembayaran tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json(
    {
      data,
      meta: {
        generated: true,
        source: "dummy",
      },
    },
    {
      status: 201,
    },
  );
}
