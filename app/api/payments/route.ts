import { NextRequest, NextResponse } from "next/server";
import { createPayment, listPayments } from "@/lib/payments/store";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q")?.trim().toLowerCase() ?? "";
  const status = searchParams.get("status")?.trim();
  const bookingCode = searchParams.get("bookingCode")?.trim();
  const page = Math.max(Number(searchParams.get("page") ?? 1), 1);
  const pageSize = Math.min(Math.max(Number(searchParams.get("pageSize") ?? 10), 1), 100);

  const all = await listPayments();

  const filtered = all.filter((item) => {
    const searchable = `${item.receiptNumber ?? ""} ${item.bookingCode} ${item.customerName} ${item.packageName}`.toLowerCase();
    const matchesQuery = query.length === 0 || searchable.includes(query);
    const matchesStatus = !status || status === "Semua" || item.status === status;
    const matchesBooking = !bookingCode || item.bookingCode === bookingCode;

    return matchesQuery && matchesStatus && matchesBooking;
  });

  const start = (page - 1) * pageSize;
  const data = filtered.slice(start, start + pageSize);
  const totalAmount = filtered.reduce((total, item) => total + Number(item.amount), 0);

  return NextResponse.json(
    {
      data,
      summary: {
        paymentCount: filtered.length,
        totalAmount,
        totalAmountDisplay: `Rp ${totalAmount.toLocaleString("id-ID")}`,
      },
      meta: {
        total: filtered.length,
        page,
        pageSize,
        totalPages: Math.max(Math.ceil(filtered.length / pageSize), 1),
        source: "supabase",
        filters: {
          bookingCode: bookingCode ?? null,
          q: query,
          status: status ?? null,
        },
      },
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));

  if (!body.bookingCode || body.amount === undefined || !body.date) {
    return NextResponse.json(
      { error: "bookingCode, date, dan amount wajib diisi" },
      { status: 400 },
    );
  }

  const amount = Number(body.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: "amount harus lebih dari 0" }, { status: 400 });
  }

  try {
    const data = await createPayment({
      bookingCode: String(body.bookingCode),
      date: String(body.date),
      amount,
      method: body.method === undefined ? undefined : String(body.method),
      referenceNumber: body.referenceNumber === undefined ? undefined : String(body.referenceNumber),
      proofUrl: body.proofUrl === undefined ? undefined : String(body.proofUrl),
      status: body.status === undefined ? undefined : String(body.status),
      receivedBy: body.receivedBy === undefined ? undefined : String(body.receivedBy),
      notes: body.notes === undefined ? undefined : String(body.notes),
      paymentFor: body.paymentFor === undefined ? undefined : String(body.paymentFor),
    });

    return NextResponse.json({ data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Gagal menyimpan pembayaran" }, { status: 500 });
  }
}
