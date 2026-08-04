import { NextRequest, NextResponse } from "next/server";
import { listIncome } from "@/lib/reports/store";

function formatRupiah(value: number) {
  return `Rp ${value.toLocaleString("id-ID")}`;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q")?.trim().toLowerCase() ?? "";
  const startDate = searchParams.get("startDate")?.trim();
  const endDate = searchParams.get("endDate")?.trim();
  const status = searchParams.get("status")?.trim();

  const all = await listIncome();

  const data = all
    .filter((item) => !startDate || item.date >= startDate)
    .filter((item) => !endDate || item.date <= endDate)
    .filter((item) => !status || status === "Semua" || item.status === status)
    .filter((item) => {
      const searchable = `${item.bookingCode} ${item.customer} ${item.packageName}`.toLowerCase();
      return query.length === 0 || searchable.includes(query);
    })
    .map((item) => ({
      id: item.bookingCode,
      bookingCode: item.bookingCode,
      customer: item.customer,
      packageName: item.packageName,
      serviceType: "Umrah",
      date: item.date,
      amount: item.total,
      amountDisplay: formatRupiah(item.total),
      paid: item.paid,
      paidDisplay: formatRupiah(item.paid),
      status: item.status,
    }));

  const totalIncome = data.reduce((total, item) => total + item.amount, 0);
  const totalPaid = data.reduce((total, item) => total + item.paid, 0);

  return NextResponse.json(
    {
      data,
      summary: {
        incomeCount: data.length,
        totalIncome,
        totalIncomeDisplay: formatRupiah(totalIncome),
        totalPaid,
        totalPaidDisplay: formatRupiah(totalPaid),
        marginNote: "Data margin/HPP per booking belum tersedia -- Kalkulator HPP belum menyimpan breakdown biaya ke database.",
      },
      meta: {
        source: "supabase",
        filters: {
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
