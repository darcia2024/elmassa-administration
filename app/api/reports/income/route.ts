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
      estimatedCost: item.estimatedCost,
      estimatedMargin: item.estimatedMargin,
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
        estimatedMargin: data.reduce((sum, item) => sum + (item.estimatedMargin ?? 0), 0),
        marginMissingCount: data.filter(item => item.estimatedMargin === null).length,
        marginNote: "Estimasi menggunakan HPP Quad terakhir di paket × jumlah peserta; belum termasuk realisasi biaya dan perubahan biaya historis. Paket lama perlu diterbitkan ulang dari kalkulator agar HPP tersedia.",
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
