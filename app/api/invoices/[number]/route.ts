import { NextRequest, NextResponse } from "next/server";
import { findInvoiceRow } from "@/lib/seed-data/invoices";

type InvoiceDetailRouteProps = {
  params: Promise<{
    number: string;
  }>;
};

export async function GET(_: NextRequest, { params }: InvoiceDetailRouteProps) {
  const { number } = await params;
  const data = findInvoiceRow(decodeURIComponent(number));

  if (!data) {
    return NextResponse.json({ error: "Invoice tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json({
    data,
    summary: {
      total: data.total,
      paid: data.paid,
      remaining: data.remaining,
      status: data.status,
    },
  });
}
