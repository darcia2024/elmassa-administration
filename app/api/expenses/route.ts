import { NextResponse } from "next/server";
import { EXPENSE_CATEGORIES, createExpense, listExpenses } from "@/lib/expenses/store";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const data = await listExpenses({
    from: searchParams.get("from") ?? undefined,
    to: searchParams.get("to") ?? undefined,
    category: searchParams.get("category") ?? undefined,
  });

  return NextResponse.json(
    {
      data,
      meta: {
        total: data.length,
        totalAmount: data.reduce((sum, e) => sum + e.amount, 0),
        categories: EXPENSE_CATEGORIES,
      },
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));

  const description = String(body.description ?? "").trim();
  if (!description) {
    return NextResponse.json(
      { error: "Keterangan wajib diisi", fields: { description: "Keterangan tidak boleh kosong" } },
      { status: 400 },
    );
  }

  const date = String(body.date ?? "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json(
      { error: "Tanggal tidak valid", fields: { date: "Format tanggal harus YYYY-MM-DD" } },
      { status: 400 },
    );
  }

  const amount = Number(body.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json(
      { error: "Nominal tidak valid", fields: { amount: "Nominal harus lebih dari 0" } },
      { status: 400 },
    );
  }

  const category = String(body.category ?? "Lainnya");
  if (!(EXPENSE_CATEGORIES as readonly string[]).includes(category)) {
    return NextResponse.json(
      { error: "Kategori tidak valid", fields: { category: `Pilih salah satu: ${EXPENSE_CATEGORIES.join(", ")}` } },
      { status: 400 },
    );
  }

  const expense = await createExpense({ ...body, description, date, amount, category });
  return NextResponse.json({ data: expense }, { status: 201 });
}
