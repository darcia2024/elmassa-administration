import { NextRequest, NextResponse } from "next/server";
import { deleteInstallmentRow, findInstallmentRow, updateInstallmentRow } from "@/lib/seed-data/installments";

type InstallmentDetailRouteProps = {
  params: Promise<{
    installmentId: string;
  }>;
};

export async function GET(_: NextRequest, { params }: InstallmentDetailRouteProps) {
  const { installmentId } = await params;
  const data = findInstallmentRow(decodeURIComponent(installmentId));

  if (!data) {
    return NextResponse.json({ error: "Cicilan tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json({ data });
}

export async function PATCH(request: NextRequest, { params }: InstallmentDetailRouteProps) {
  const { installmentId } = await params;
  const body = await request.json();
  const data = updateInstallmentRow(decodeURIComponent(installmentId), {
    bookingCode: body.bookingCode === undefined ? undefined : String(body.bookingCode),
    customer: body.customer === undefined ? undefined : String(body.customer),
    packageName: body.packageName === undefined ? undefined : String(body.packageName),
    sequence: body.sequence === undefined ? undefined : String(body.sequence),
    dueDate: body.dueDate === undefined ? undefined : String(body.dueDate),
    dueDateValue: body.dueDateValue === undefined ? undefined : String(body.dueDateValue),
    amount: body.amount === undefined ? undefined : Number(body.amount),
    paidAmount: body.paidAmount === undefined ? undefined : Number(body.paidAmount),
    status: body.status === undefined ? undefined : String(body.status),
    notes: body.notes === undefined ? undefined : String(body.notes),
  });

  if (!data) {
    return NextResponse.json({ error: "Cicilan tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json({ data });
}

export async function DELETE(_: NextRequest, { params }: InstallmentDetailRouteProps) {
  const { installmentId } = await params;
  const decodedId = decodeURIComponent(installmentId);
  const deleted = deleteInstallmentRow(decodedId);

  if (!deleted) {
    return NextResponse.json({ error: "Cicilan tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json({ data: { id: decodedId, deleted: true } });
}
