import { NextResponse } from "next/server";
import { findReceiptDetail } from "@/lib/receipts/store";

type ReceiptRouteProps = {
  params: Promise<{
    paymentId: string;
  }>;
};

export async function GET(_: Request, { params }: ReceiptRouteProps) {
  const { paymentId } = await params;
  const data = await findReceiptDetail(decodeURIComponent(paymentId));

  if (!data) {
    return NextResponse.json({ error: "Kuitansi tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json(
    {
      data,
      meta: {
        source: "supabase",
      },
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
