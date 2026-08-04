import { NextRequest, NextResponse } from "next/server";
import { createInstallment, listInstallments } from "@/lib/installments/store";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q")?.trim().toLowerCase() ?? "";
  const status = searchParams.get("status")?.trim();
  const bookingCode = searchParams.get("bookingCode")?.trim();
  const startDate = searchParams.get("startDate")?.trim();
  const endDate = searchParams.get("endDate")?.trim();
  const page = Math.max(Number(searchParams.get("page") ?? 1), 1);
  const pageSize = Math.min(Math.max(Number(searchParams.get("pageSize") ?? 10), 1), 100);

  const all = await listInstallments();

  const filtered = all
    .filter((item) => {
      const searchable = `${item.id} ${item.bookingCode} ${item.customer} ${item.packageName} ${item.sequence}`.toLowerCase();
      const matchesQuery = query.length === 0 || searchable.includes(query);
      const matchesStatus = !status || status === "Semua" || item.status === status;
      const matchesBooking = !bookingCode || item.bookingCode === bookingCode;
      const matchesStart = !startDate || item.dueDate >= startDate;
      const matchesEnd = !endDate || item.dueDate <= endDate;

      return matchesQuery && matchesStatus && matchesBooking && matchesStart && matchesEnd;
    })
    .sort((first, second) => first.dueDate.localeCompare(second.dueDate));

  const start = (page - 1) * pageSize;
  const data = filtered.slice(start, start + pageSize);
  const totalAmount = filtered.reduce((total, item) => total + Number(item.amount), 0);
  const totalPaid = filtered.reduce((total, item) => total + Number(item.paidAmount), 0);

  return NextResponse.json(
    {
      data,
      summary: {
        installmentCount: filtered.length,
        totalAmount,
        totalAmountDisplay: `Rp ${totalAmount.toLocaleString("id-ID")}`,
        totalPaid,
        totalPaidDisplay: `Rp ${totalPaid.toLocaleString("id-ID")}`,
      },
      meta: {
        total: filtered.length,
        page,
        pageSize,
        totalPages: Math.max(Math.ceil(filtered.length / pageSize), 1),
        source: "supabase",
        filters: {
          bookingCode: bookingCode ?? null,
          endDate: endDate ?? null,
          q: query,
          startDate: startDate ?? null,
          status: status ?? null,
        },
      },
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));

  const sequence = Number(body.sequence);
  const amount = Number(body.amount);

  if (!body.bookingCode || !body.dueDate || !Number.isFinite(sequence) || !Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json(
      { error: "bookingCode, sequence, dueDate, dan amount (>0) wajib diisi" },
      { status: 400 },
    );
  }

  try {
    const data = await createInstallment({
      bookingCode: String(body.bookingCode),
      sequence,
      label: body.label === undefined ? undefined : String(body.label),
      dueDate: String(body.dueDate),
      amount,
      notes: body.notes === undefined ? undefined : String(body.notes),
    });

    return NextResponse.json({ data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Gagal menyimpan cicilan" }, { status: 500 });
  }
}
