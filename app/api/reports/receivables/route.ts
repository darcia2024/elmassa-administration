import { NextRequest, NextResponse } from "next/server";
import { listReceivables } from "@/lib/reports/store";

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", { currency: "IDR", maximumFractionDigits: 0, style: "currency" }).format(value);
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const startDate = searchParams.get("startDate")?.trim();
  const endDate = searchParams.get("endDate")?.trim();
  const customer = searchParams.get("customer")?.trim().toLowerCase();
  const packageName = searchParams.get("package")?.trim().toLowerCase();
  const query = searchParams.get("q")?.trim().toLowerCase() ?? "";
  const status = searchParams.get("status")?.trim();

  const all = await listReceivables();

  const rows = all
    .map((row) => ({
      bookingCode: row.bookingCode,
      customerName: row.customer,
      packageName: row.packageName,
      departureDate: row.departureDate,
      dueDate: row.dueDate ?? "-",
      dueDateValue: row.dueDate ?? "",
      totalPrice: row.total,
      totalDisplay: formatRupiah(row.total),
      paidAmount: row.paid,
      paidDisplay: formatRupiah(row.paid),
      remainingAmount: row.remaining,
      remainingDisplay: formatRupiah(row.remaining),
      ageDays: row.ageDays,
      priority: row.priority,
      status: row.status,
      phone: row.phone,
    }))
    .filter((row) => !startDate || !row.dueDateValue || row.dueDateValue >= startDate)
    .filter((row) => !endDate || !row.dueDateValue || row.dueDateValue <= endDate)
    .filter((row) => !customer || customer === "semua pelanggan" || row.customerName.toLowerCase() === customer)
    .filter((row) => !packageName || packageName === "semua paket" || row.packageName.toLowerCase() === packageName)
    .filter((row) => !status || status === "Semua" || row.status === status)
    .filter((row) => {
      const searchable = `${row.bookingCode} ${row.customerName} ${row.packageName}`.toLowerCase();
      return query.length === 0 || searchable.includes(query);
    })
    .sort((first, second) => (first.dueDateValue || "9999").localeCompare(second.dueDateValue || "9999"));

  const totalRemaining = rows.reduce((total, row) => total + row.remainingAmount, 0);
  const totalPaid = rows.reduce((total, row) => total + row.paidAmount, 0);
  const totalPrice = rows.reduce((total, row) => total + row.totalPrice, 0);
  const statusBreakdown = rows.reduce<Record<string, number>>((breakdown, row) => {
    breakdown[row.status] = (breakdown[row.status] ?? 0) + 1;
    return breakdown;
  }, {});

  return NextResponse.json(
    {
      data: rows,
      summary: {
        bookingCount: rows.length,
        totalPrice,
        totalPriceDisplay: formatRupiah(totalPrice),
        totalPaid,
        totalPaidDisplay: formatRupiah(totalPaid),
        totalRemaining,
        totalRemainingDisplay: formatRupiah(totalRemaining),
        statusBreakdown,
      },
      meta: {
        source: "supabase",
        filters: {
          customer: customer ?? null,
          endDate: endDate ?? null,
          package: packageName ?? null,
          q: query,
          startDate: startDate ?? null,
          status: status ?? null,
        },
      },
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
