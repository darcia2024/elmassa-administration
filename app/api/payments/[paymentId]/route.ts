import { NextRequest, NextResponse } from "next/server";
import { deletePaymentRow, findPaymentRow, updatePaymentRow } from "@/lib/seed-data/payments";

type PaymentDetailRouteProps = {
  params: Promise<{
    paymentId: string;
  }>;
};

export async function GET(_: NextRequest, { params }: PaymentDetailRouteProps) {
  const { paymentId } = await params;
  const data = findPaymentRow(decodeURIComponent(paymentId));

  if (!data) {
    return NextResponse.json({ error: "Pembayaran tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json({ data });
}

export async function PATCH(request: NextRequest, { params }: PaymentDetailRouteProps) {
  const { paymentId } = await params;
  const body = await request.json();
  const data = updatePaymentRow(decodeURIComponent(paymentId), {
    receiptNumber: body.receiptNumber === undefined ? undefined : String(body.receiptNumber),
    bookingCode: body.bookingCode === undefined ? undefined : String(body.bookingCode),
    customerName: body.customerName === undefined ? undefined : String(body.customerName),
    customerPhone: body.customerPhone === undefined ? undefined : String(body.customerPhone),
    packageName: body.packageName === undefined ? undefined : String(body.packageName),
    date: body.date === undefined ? undefined : String(body.date),
    amount: body.amount === undefined ? undefined : Number(body.amount),
    amountDisplay: body.amountDisplay === undefined ? undefined : String(body.amountDisplay),
    amountWords: body.amountWords === undefined ? undefined : String(body.amountWords),
    paymentFor: body.paymentFor === undefined ? undefined : String(body.paymentFor),
    paymentMethod: body.paymentMethod === undefined ? undefined : String(body.paymentMethod),
    account: body.account === undefined ? undefined : String(body.account),
    staff: body.staff === undefined ? undefined : String(body.staff),
    status: body.status === undefined ? undefined : String(body.status),
    referenceNumber: body.referenceNumber === undefined ? undefined : String(body.referenceNumber),
    proofUrl: body.proofUrl === undefined ? undefined : String(body.proofUrl),
    notes: body.notes === undefined ? undefined : String(body.notes),
  });

  if (!data) {
    return NextResponse.json({ error: "Pembayaran tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json({ data });
}

export async function DELETE(_: NextRequest, { params }: PaymentDetailRouteProps) {
  const { paymentId } = await params;
  const deleted = deletePaymentRow(decodeURIComponent(paymentId));

  if (!deleted) {
    return NextResponse.json({ error: "Pembayaran tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json({ data: { id: decodeURIComponent(paymentId), deleted: true } });
}
