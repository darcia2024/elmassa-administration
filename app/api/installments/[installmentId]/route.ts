import { NextRequest, NextResponse } from "next/server";
import { deleteInstallment, findInstallment, updateInstallment } from "@/lib/installments/store";

type InstallmentDetailRouteProps = {
  params: Promise<{
    installmentId: string;
  }>;
};

export async function GET(_: NextRequest, { params }: InstallmentDetailRouteProps) {
  const { installmentId } = await params;
  const data = await findInstallment(decodeURIComponent(installmentId));

  if (!data) {
    return NextResponse.json({ error: "Cicilan tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json({ data });
}

export async function PATCH(request: NextRequest, { params }: InstallmentDetailRouteProps) {
  const { installmentId } = await params;
  const body = await request.json().catch(() => ({}));

  try {
    const data = await updateInstallment(decodeURIComponent(installmentId), {
      sequence: body.sequence === undefined ? undefined : Number(body.sequence),
      label: body.label === undefined ? undefined : String(body.label),
      dueDate: body.dueDate === undefined ? undefined : String(body.dueDate),
      amount: body.amount === undefined ? undefined : Number(body.amount),
      paidAmount: body.paidAmount === undefined ? undefined : Number(body.paidAmount),
      status: body.status === undefined ? undefined : String(body.status),
      notes: body.notes === undefined ? undefined : String(body.notes),
    });

    if (!data) {
      return NextResponse.json({ error: "Cicilan tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ data });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Gagal memperbarui cicilan" }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: InstallmentDetailRouteProps) {
  const { installmentId } = await params;
  const decodedId = decodeURIComponent(installmentId);
  const deleted = await deleteInstallment(decodedId);

  if (!deleted) {
    return NextResponse.json({ error: "Cicilan tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json({ data: { id: decodedId, deleted: true } });
}
