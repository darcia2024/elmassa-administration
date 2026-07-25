import { BarChart3, Download, Plane, TrendingUp, WalletCards } from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { ReportNav } from "@/components/report-nav";

const incomeRows = [
  {
    id: "INC-001",
    serviceType: "Umrah",
    packageName: "Umrah Reguler 12 Hari",
    bookingCode: "BK-2407-018",
    customer: "Siti Rahma",
    date: "25 Jul 2026",
    amountDisplay: "Rp 12.500.000",
    marginDisplay: "Rp 2.100.000",
    status: "Parsial",
  },
];

const serviceSummary = [
  { label: "Umrah", value: "Rp 12.500.000", count: "1 booking" },
];

const statusStyles: Record<string, string> = {
  Final: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Parsial: "bg-amber-50 text-amber-700 ring-amber-200",
};

export default function IncomeReportPage() {
  return (
    <AppShell eyebrow="Laporan" title="Laporan Pendapatan">
      <ReportNav />

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-stone-500">Pendapatan Tercatat</p>
            <WalletCards className="h-5 w-5 text-brand-brown" aria-hidden="true" />
          </div>
          <p className="mt-3 text-2xl font-bold text-brand-cocoa">Rp 151.500.000</p>
          <p className="mt-2 text-sm text-stone-500">Transaksi masuk dummy</p>
        </article>
        <article className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-stone-500">Estimasi Margin</p>
            <TrendingUp className="h-5 w-5 text-emerald-600" aria-hidden="true" />
          </div>
          <p className="mt-3 text-2xl font-bold text-brand-cocoa">Rp 24.300.000</p>
          <p className="mt-2 text-sm text-stone-500">Ringkasan simulasi</p>
        </article>
        <article className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-stone-500">Layanan Aktif</p>
            <Plane className="h-5 w-5 text-brand-brown" aria-hidden="true" />
          </div>
          <p className="mt-3 text-2xl font-bold text-brand-cocoa">{serviceSummary.length}</p>
          <p className="mt-2 text-sm text-stone-500">Kategori layanan</p>
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-4">
        {serviceSummary.map((item) => (
          <article key={item.label} className="rounded-lg border border-brand-rose bg-white p-5 shadow-soft">
            <p className="text-sm font-semibold text-stone-500">{item.label}</p>
            <p className="mt-3 text-xl font-bold text-brand-cocoa">{item.value}</p>
            <p className="mt-2 text-sm text-stone-500">{item.count}</p>
          </article>
        ))}
      </section>

      <section className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
        <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h3 className="text-lg font-bold text-brand-cocoa">Pendapatan per Booking</h3>
            <p className="mt-1 text-sm text-stone-500">Data dummy pendapatan masuk, kategori layanan, dan estimasi margin.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-stone-200 bg-white px-4 text-sm font-bold text-brand-cocoa" href="/laporan/transaksi">
              <BarChart3 className="h-4 w-4" aria-hidden="true" />
              Transaksi
            </Link>
            <button className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-brand-cocoa px-4 text-sm font-bold text-white" type="button">
              <Download className="h-4 w-4" aria-hidden="true" />
              Export
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-stone-200">
          <table className="w-full min-w-[940px] border-collapse text-left text-sm">
            <thead className="bg-brand-cream text-xs uppercase text-stone-500">
              <tr>
                <th className="px-4 py-3 font-bold">ID</th>
                <th className="px-4 py-3 font-bold">Tanggal</th>
                <th className="px-4 py-3 font-bold">Layanan</th>
                <th className="px-4 py-3 font-bold">Paket</th>
                <th className="px-4 py-3 font-bold">Booking</th>
                <th className="px-4 py-3 font-bold">Pelanggan</th>
                <th className="px-4 py-3 font-bold">Pendapatan</th>
                <th className="px-4 py-3 font-bold">Margin</th>
                <th className="px-4 py-3 font-bold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 bg-white">
              {incomeRows.map((row) => (
                <tr key={row.id} className="text-stone-700 hover:bg-brand-cream">
                  <td className="px-4 py-4 font-bold text-brand-cocoa">{row.id}</td>
                  <td className="px-4 py-4">{row.date}</td>
                  <td className="px-4 py-4">{row.serviceType}</td>
                  <td className="px-4 py-4">{row.packageName}</td>
                  <td className="px-4 py-4">
                    <Link className="font-bold text-brand-cocoa hover:text-brand-pink" href={`/booking/${row.bookingCode}`}>
                      {row.bookingCode}
                    </Link>
                  </td>
                  <td className="px-4 py-4">{row.customer}</td>
                  <td className="px-4 py-4 font-bold text-brand-cocoa">{row.amountDisplay}</td>
                  <td className="px-4 py-4 font-semibold text-brand-cocoa">{row.marginDisplay}</td>
                  <td className="px-4 py-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${statusStyles[row.status]}`}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AppShell>
  );
}
