import { NextRequest, NextResponse } from "next/server";
import { createInstallmentRow, listInstallmentRows } from "@/lib/seed-data/installments";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q")?.trim().toLowerCase() ?? "";
  const status = searchParams.get("status")?.trim();
  const bookingCode = searchParams.get("bookingCode")?.trim();
  const startDate = searchParams.get("startDate")?.trim();
  const endDate = searchParams.get("endDate")?.trim();
  const page = Math.max(Number(searchParams.get("page") ?? 1), 1);
  const pageSize = Math.min(Math.max(Number(searchParams.get("pageSize") ?? 10), 1), 100);

  const filtered = listInstallmentRows()
    .filter((item) => {
      const searchable = `${item.id} ${item.bookingCode} ${item.customer} ${item.packageName} ${item.sequence}`.toLowerCase();
      const matchesQuery = query.length === 0 || searchable.includes(query);
      const matchesStatus = !status || status === "Semua" || item.status === status;
      const matchesBooking = !bookingCode || item.bookingCode === bookingCode;
      const matchesStart = !startDate || item.dueDateValue >= startDate;
      const matchesEnd = !endDate || item.dueDateValue <= endDate;

      return matchesQuery && matchesStatus && matchesBooking && matchesStart && matchesEnd;
    })
    .sort((first, second) => first.dueDateValue.localeCompare(second.dueDateValue));

  const start = (page - 1) * pageSize;
  const data = filtered.slice(start, start + pageSize);
  const totalAmount = filtered.reduce((total, item) => total + item.amount, 0);
  const totalPaid = filtered.reduce((total, item) => total + item.paidAmount, 0);

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
        source: "dummy",
        filters: {
          bookingCode: bookingCode ?? null,
          endDate: endDate ?? null,
          q: query,
          startDate: startDate ?? null,
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

  if (!body.bookingCode || !body.customer || !body.packageName || !body.sequence || !body.dueDateValue || body.amount === undefined) {
    return NextResponse.json(
      {
        error: "bookingCode, customer, packageName, sequence, dueDateValue, dan amount wajib diisi",
      },
      {
        status: 400,
      },
    );
  }

  const data = createInstallmentRow({
    bookingCode: String(body.bookingCode),
    customer: String(body.customer),
    packageName: String(body.packageName),
    sequence: String(body.sequence),
    dueDate: String(body.dueDate ?? body.dueDateValue),
    dueDateValue: String(body.dueDateValue),
    amount: Number(body.amount),
    paidAmount: Number(body.paidAmount ?? 0),
    status: body.status === undefined ? undefined : String(body.status),
    notes: body.notes === undefined ? undefined : String(body.notes),
  });

  return NextResponse.json({ data }, { status: 201 });
}
