import { NextRequest, NextResponse } from "next/server";
import { deletePayment, findPayment, updatePayment } from "@/lib/payments/store";

type PaymentDetailRouteProps = {
  params: Promise<{
    paymentId: string;
  }>;
};

export async function GET(_: NextRequest, { params }: PaymentDetailRouteProps) {
  const { paymentId } = await params;
  const data = await findPayment(decodeURIComponent(paymentId));

  if (!data) {
    return NextResponse.json({ error: "Pembayaran tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json({ data });
}

export async function PATCH(request: NextRequest, { params }: PaymentDetailRouteProps) {
  const { paymentId } = await params;
  const body = await request.json().catch(() => ({}));

  if (body.amount !== undefined && (!Number.isFinite(Number(body.amount)) || Number(body.amount) <= 0)) {
    return NextResponse.json({ error: "amount harus lebih dari 0" }, { status: 400 });
  }

  try {
    const data = await updatePayment(decodeURIComponent(paymentId), {
      date: body.date === undefined ? undefined : String(body.date),
      amount: body.amount === undefined ? undefined : Number(body.amount),
      method: body.method === undefined ? undefined : String(body.method),
      referenceNumber: body.referenceNumber === undefined ? undefined : String(body.referenceNumber),
      proofUrl: body.proofUrl === undefined ? undefined : String(body.proofUrl),
      status: body.status === undefined ? undefined : String(body.status),
      receivedBy: body.receivedBy === undefined ? undefined : String(body.receivedBy),
      notes: body.notes === undefined ? undefined : String(body.notes),
    });

    if (!data) {
      return NextResponse.json({ error: "Pembayaran tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ data });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Gagal memperbarui pembayaran" }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: PaymentDetailRouteProps) {
  const { paymentId } = await params;

  try {
    const deleted = await deletePayment(decodeURIComponent(paymentId));

    if (!deleted) {
      return NextResponse.json({ error: "Pembayaran tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ data: { id: decodeURIComponent(paymentId), deleted: true } });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Gagal menghapus pembayaran" }, { status: 500 });
  }
}
