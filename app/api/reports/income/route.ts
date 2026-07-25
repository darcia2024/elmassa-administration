import { NextRequest, NextResponse } from "next/server";
import { formatRupiah, getIncomeReportRows } from "@/lib/seed-data/derived";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q")?.trim().toLowerCase() ?? "";
  const startDate = searchParams.get("startDate")?.trim();
  const endDate = searchParams.get("endDate")?.trim();
  const serviceType = searchParams.get("serviceType")?.trim();
  const status = searchParams.get("status")?.trim();

  const data = getIncomeReportRows()
    .filter((item) => !startDate || item.dateValue >= startDate)
    .filter((item) => !endDate || item.dateValue <= endDate)
    .filter((item) => !serviceType || serviceType === "Semua" || item.serviceType === serviceType)
    .filter((item) => !status || status === "Semua" || item.status === status)
    .filter((item) => {
      const searchable = `${item.id} ${item.bookingCode} ${item.customer} ${item.packageName} ${item.serviceType}`.toLowerCase();
      return query.length === 0 || searchable.includes(query);
    })
    .map((item) => ({
      ...item,
      amountDisplay: formatRupiah(item.amount),
      marginDisplay: formatRupiah(item.margin),
    }));

  const totalIncome = data.reduce((total, item) => total + item.amount, 0);
  const totalMargin = data.reduce((total, item) => total + item.margin, 0);
  const serviceSummary = data.reduce<Record<string, { count: number; total: number; margin: number }>>((summary, item) => {
    const current = summary[item.serviceType] ?? { count: 0, total: 0, margin: 0 };
    summary[item.serviceType] = {
      count: current.count + 1,
      total: current.total + item.amount,
      margin: current.margin + item.margin,
    };
    return summary;
  }, {});

  return NextResponse.json(
    {
      data,
      summary: {
        incomeCount: data.length,
        totalIncome,
        totalIncomeDisplay: formatRupiah(totalIncome),
        totalMargin,
        totalMarginDisplay: formatRupiah(totalMargin),
        serviceCount: Object.keys(serviceSummary).length,
        serviceSummary: Object.fromEntries(
          Object.entries(serviceSummary).map(([key, value]) => [
            key,
            {
              ...value,
              totalDisplay: formatRupiah(value.total),
              marginDisplay: formatRupiah(value.margin),
            },
          ]),
        ),
      },
      meta: {
        source: "dummy",
        filters: {
          endDate: endDate ?? null,
          q: query,
          serviceType: serviceType ?? null,
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
