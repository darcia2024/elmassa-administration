import { NextRequest, NextResponse } from "next/server";
import { createPaymentRow, listPaymentRows } from "@/lib/seed-data/payments";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q")?.trim().toLowerCase() ?? "";
  const status = searchParams.get("status")?.trim();
  const bookingCode = searchParams.get("bookingCode")?.trim();
  const page = Math.max(Number(searchParams.get("page") ?? 1), 1);
  const pageSize = Math.min(Math.max(Number(searchParams.get("pageSize") ?? 10), 1), 100);

  const filtered = listPaymentRows().filter((item) => {
    const searchable = `${item.receiptNumber} ${item.bookingCode} ${item.customerName} ${item.packageName} ${item.account}`.toLowerCase();
    const matchesQuery = query.length === 0 || searchable.includes(query);
    const matchesStatus = !status || status === "Semua" || item.status === status;
    const matchesBooking = !bookingCode || item.bookingCode === bookingCode;

    return matchesQuery && matchesStatus && matchesBooking;
  });

  const start = (page - 1) * pageSize;
  const data = filtered.slice(start, start + pageSize);
  const totalAmount = filtered.reduce((total, item) => total + item.amount, 0);

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
        source: "dummy",
        filters: {
          bookingCode: bookingCode ?? null,
          q: query,
          status: status ?? null,
        },
      },
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  if (!body.bookingCode || !body.customerName || !body.packageName || body.amount === undefined) {
    return NextResponse.json(
      {
        error: "bookingCode, customerName, packageName, dan amount wajib diisi",
      },
      {
        status: 400,
      },
    );
  }

  const data = createPaymentRow({
    receiptNumber: body.receiptNumber === undefined ? undefined : String(body.receiptNumber),
    bookingCode: String(body.bookingCode),
    customerName: String(body.customerName),
    customerPhone: String(body.customerPhone ?? ""),
    packageName: String(body.packageName),
    date: String(body.date ?? new Date().toISOString().slice(0, 10)),
    amount: Number(body.amount),
    amountDisplay: body.amountDisplay === undefined ? undefined : String(body.amountDisplay),
    amountWords: String(body.amountWords ?? ""),
    paymentFor: String(body.paymentFor ?? "Pembayaran booking"),
    paymentMethod: String(body.paymentMethod ?? "Transfer"),
    account: String(body.account ?? ""),
    staff: String(body.staff ?? ""),
    status: String(body.status ?? "Menunggu Cek"),
    referenceNumber: body.referenceNumber === undefined ? undefined : String(body.referenceNumber),
    proofUrl: body.proofUrl === undefined ? undefined : String(body.proofUrl),
    notes: body.notes === undefined ? undefined : String(body.notes),
  });

  return NextResponse.json({ data }, { status: 201 });
}
