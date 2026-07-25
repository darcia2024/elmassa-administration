import { NextRequest, NextResponse } from "next/server";
import { listBookingRows } from "@/lib/seed-data/bookings";

const dueDatesByBooking: Record<string, string> = {
  "BK-2407-014": "2026-08-05",
  "BK-2407-015": "2026-08-20",
  "BK-2407-016": "2026-07-31",
  "BK-2407-018": "2026-07-28",
};

const displayDatesByBooking: Record<string, string> = {
  "BK-2407-014": "05 Agu 2026",
  "BK-2407-015": "20 Agu 2026",
  "BK-2407-016": "31 Jul 2026",
  "BK-2407-018": "28 Jul 2026",
};

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    currency: "IDR",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(value);
}

function calculateRemainingAmount(totalPrice: number, paidAmount: number) {
  return Math.max(totalPrice - paidAmount, 0);
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const startDate = searchParams.get("startDate")?.trim();
  const endDate = searchParams.get("endDate")?.trim();
  const customer = searchParams.get("customer")?.trim().toLowerCase();
  const packageName = searchParams.get("package")?.trim().toLowerCase();
  const query = searchParams.get("q")?.trim().toLowerCase() ?? "";
  const status = searchParams.get("status")?.trim();

  const rows = listBookingRows()
    .map((booking) => {
      const remainingAmount = calculateRemainingAmount(booking.totalPrice, booking.paidAmount);
      const dueDateValue = dueDatesByBooking[booking.code] ?? booking.departureDate;

      return {
        bookingCode: booking.code,
        customerId: booking.customerId,
        customerName: booking.customerName,
        packageName: booking.packageName,
        scheduleId: booking.scheduleId,
        departureDate: booking.departureDate,
        bookingDate: booking.bookingDate,
        dueDate: displayDatesByBooking[booking.code] ?? dueDateValue,
        dueDateValue,
        totalPrice: booking.totalPrice,
        totalDisplay: formatRupiah(booking.totalPrice),
        paidAmount: booking.paidAmount,
        paidDisplay: formatRupiah(booking.paidAmount),
        remainingAmount,
        remainingDisplay: formatRupiah(remainingAmount),
        status: booking.status,
      };
    })
    .filter((row) => row.remainingAmount > 0)
    .filter((row) => !startDate || row.dueDateValue >= startDate)
    .filter((row) => !endDate || row.dueDateValue <= endDate)
    .filter((row) => !customer || customer === "semua pelanggan" || row.customerName.toLowerCase() === customer)
    .filter((row) => !packageName || packageName === "semua paket" || row.packageName.toLowerCase() === packageName)
    .filter((row) => !status || status === "Semua" || row.status === status)
    .filter((row) => {
      const searchable = `${row.bookingCode} ${row.customerName} ${row.packageName}`.toLowerCase();
      return query.length === 0 || searchable.includes(query);
    })
    .sort((first, second) => first.dueDateValue.localeCompare(second.dueDateValue));

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
        source: "dummy",
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
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
