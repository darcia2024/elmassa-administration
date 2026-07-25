import { NextRequest, NextResponse } from "next/server";
import { generateInvoiceFromBooking, listInvoiceRows } from "@/lib/seed-data/invoices";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q")?.trim().toLowerCase() ?? "";
  const status = searchParams.get("status")?.trim();
  const bookingCode = searchParams.get("bookingCode")?.trim();
  const page = Math.max(Number(searchParams.get("page") ?? 1), 1);
  const pageSize = Math.min(Math.max(Number(searchParams.get("pageSize") ?? 10), 1), 100);

  const filtered = listInvoiceRows().filter((item) => {
    const searchable = `${item.number} ${item.bookingCode} ${item.customer} ${item.packageName}`.toLowerCase();
    const matchesQuery = query.length === 0 || searchable.includes(query);
    const matchesStatus = !status || status === "Semua" || item.status === status;
    const matchesBooking = !bookingCode || item.bookingCode === bookingCode;

    return matchesQuery && matchesStatus && matchesBooking;
  });

  const start = (page - 1) * pageSize;
  const data = filtered.slice(start, start + pageSize);
  const totalAmount = filtered.reduce((total, item) => total + item.total, 0);
  const totalRemaining = filtered.reduce((total, item) => total + item.remaining, 0);

  return NextResponse.json(
    {
      data,
      summary: {
        invoiceCount: filtered.length,
        totalAmount,
        totalAmountDisplay: `Rp ${totalAmount.toLocaleString("id-ID")}`,
        totalRemaining,
        totalRemainingDisplay: `Rp ${totalRemaining.toLocaleString("id-ID")}`,
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

  if (!body.bookingCode) {
    return NextResponse.json(
      {
        error: "bookingCode wajib diisi",
      },
      {
        status: 400,
      },
    );
  }

  const data = generateInvoiceFromBooking(String(body.bookingCode), {
    dueDateValue: body.dueDateValue === undefined ? undefined : String(body.dueDateValue),
    forceNew: Boolean(body.forceNew),
    notes: body.notes === undefined ? undefined : String(body.notes),
  });

  if (!data) {
    return NextResponse.json({ error: "Booking tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json({ data }, { status: 201 });
}
