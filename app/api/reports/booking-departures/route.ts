import { NextRequest, NextResponse } from "next/server";
import { formatRupiah, getBookingDepartureReportRows } from "@/lib/seed-data/derived";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q")?.trim().toLowerCase() ?? "";
  const startDate = searchParams.get("startDate")?.trim();
  const endDate = searchParams.get("endDate")?.trim();
  const status = searchParams.get("status")?.trim();

  const data = getBookingDepartureReportRows()
    .filter((item) => !startDate || item.departureDateValue >= startDate)
    .filter((item) => !endDate || item.departureDateValue <= endDate)
    .filter((item) => !status || status === "Semua" || item.status === status)
    .filter((item) => {
      const searchable = `${item.scheduleId} ${item.packageName} ${item.status}`.toLowerCase();
      return query.length === 0 || searchable.includes(query);
    })
    .map((item) => ({
      ...item,
      occupancy: item.quota > 0 ? Math.round((item.booked / item.quota) * 100) : 0,
      receivableDisplay: formatRupiah(item.receivable),
    }));

  const totalBooked = data.reduce((total, item) => total + item.booked, 0);
  const totalQuota = data.reduce((total, item) => total + item.quota, 0);
  const totalPaidBookings = data.reduce((total, item) => total + item.paidBookings, 0);
  const totalReceivable = data.reduce((total, item) => total + item.receivable, 0);
  const averageOccupancy = data.length > 0 ? Math.round(data.reduce((total, item) => total + item.occupancy, 0) / data.length) : 0;

  return NextResponse.json(
    {
      data,
      summary: {
        scheduleCount: data.length,
        totalBooked,
        totalQuota,
        totalPaidBookings,
        totalReceivable,
        totalReceivableDisplay: formatRupiah(totalReceivable),
        averageOccupancy,
      },
      meta: {
        source: "dummy",
        filters: {
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
