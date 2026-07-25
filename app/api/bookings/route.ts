import { NextRequest, NextResponse } from "next/server";
import { createBookingRow, listBookingRows } from "@/lib/seed-data/bookings";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q")?.trim().toLowerCase() ?? "";
  const status = searchParams.get("status")?.trim();
  const page = Math.max(Number(searchParams.get("page") ?? 1), 1);
  const pageSize = Math.min(Math.max(Number(searchParams.get("pageSize") ?? 10), 1), 100);

  const filtered = listBookingRows().filter((item) => {
    const searchable = `${item.code} ${item.customerName} ${item.packageName}`.toLowerCase();
    const matchesQuery = query.length === 0 || searchable.includes(query);
    const matchesStatus = !status || status === "Semua" || item.status === status;

    return matchesQuery && matchesStatus;
  });

  const start = (page - 1) * pageSize;
  const data = filtered.slice(start, start + pageSize);

  return NextResponse.json(
    {
      data,
      meta: {
        total: filtered.length,
        page,
        pageSize,
        totalPages: Math.max(Math.ceil(filtered.length / pageSize), 1),
        source: "dummy",
        filters: {
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

  if (!body.customerId || !body.customerName || !body.packageName || !body.scheduleId || body.totalPrice === undefined) {
    return NextResponse.json(
      {
        error: "customerId, customerName, packageName, scheduleId, dan totalPrice wajib diisi",
      },
      {
        status: 400,
      },
    );
  }

  const data = createBookingRow({
    customerId: String(body.customerId),
    customerName: String(body.customerName),
    packageName: String(body.packageName),
    scheduleId: String(body.scheduleId),
    departureDate: String(body.departureDate ?? ""),
    status: String(body.status ?? "Belum Bayar"),
    totalPrice: Number(body.totalPrice),
    paidAmount: Number(body.paidAmount ?? 0),
    bookingDate: String(body.bookingDate ?? new Date().toISOString().slice(0, 10)),
    participants: Array.isArray(body.participants) ? body.participants : [],
  });

  return NextResponse.json({ data }, { status: 201 });
}
