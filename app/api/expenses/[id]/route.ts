import { NextResponse } from "next/server";
import { EXPENSE_CATEGORIES, deleteExpense, findExpense, updateExpense } from "@/lib/expenses/store";

type RouteProps = { params: Promise<{ id: string }> };

export async function GET(_: Request, { params }: RouteProps) {
  const { id } = await params;
  const expense = await findExpense(id);

  if (!expense) return NextResponse.json({ error: "Pengeluaran tidak ditemukan" }, { status: 404 });
  return NextResponse.json({ data: expense }, { headers: { "Cache-Control": "no-store" } });
}

export async function PATCH(request: Request, { params }: RouteProps) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));

  if (body.amount !== undefined) {
    const amount = Number(body.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        { error: "Nominal tidak valid", fields: { amount: "Nominal harus lebih dari 0" } },
        { status: 400 },
      );
    }
  }

  if (body.category !== undefined && !(EXPENSE_CATEGORIES as readonly string[]).includes(String(body.category))) {
    return NextResponse.json(
      { error: "Kategori tidak valid", fields: { category: `Pilih salah satu: ${EXPENSE_CATEGORIES.join(", ")}` } },
      { status: 400 },
    );
  }

  const updated = await updateExpense(id, body);
  if (!updated) return NextResponse.json({ error: "Pengeluaran tidak ditemukan" }, { status: 404 });

  return NextResponse.json({ data: updated });
}

export async function DELETE(_: Request, { params }: RouteProps) {
  const { id } = await params;
  const deleted = await deleteExpense(id);

  if (!deleted) return NextResponse.json({ error: "Pengeluaran tidak ditemukan" }, { status: 404 });
  return NextResponse.json({ data: { id, deleted: true } });
}
