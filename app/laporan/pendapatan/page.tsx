"use client";

import {
  BarChart3,
  Calendar,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Plane,
  Printer,
  Search,
  TrendingUp,
  WalletCards,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { ReportNav } from "@/components/report-nav";
import { exportToCSV } from "@/lib/export-excel";

type IncomeRowItem = {
  id: string;
  serviceType: string;
  packageName: string;
  bookingCode: string;
  customer: string;
  date: string;
  gross: number;
  grossDisplay: string;
  paid: number;
  paidDisplay: string;
  status: string;
};

const statusStyles: Record<string, string> = {
  "Final / Lunas": "bg-emerald-50/80 text-emerald-800 border border-emerald-200/60",
  "DP / Parsial": "bg-amber-50/80 text-amber-800 border border-amber-200/60",
  "Belum Bayar": "bg-rose-50/80 text-rose-700 border border-rose-200/60",
};

export default function IncomeReportPage() {
  const [incomeRows, setIncomeRows] = useState<IncomeRowItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetch("/api/reports/income")
      .then((res) => res.json())
      .then((json) => {
        const rows = (json.data ?? []) as any[];
        setIncomeRows(
          rows.map((r) => ({
            id: r.id,
            serviceType: r.serviceType,
            packageName: r.packageName,
            bookingCode: r.bookingCode,
            customer: r.customer,
            date: r.date,
            gross: r.amount,
            grossDisplay: r.amountDisplay,
            paid: r.paid,
            paidDisplay: r.paidDisplay,
            status: r.status,
          })),
        );
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  const filteredRows = useMemo(() => {
    return incomeRows.filter((r) => {
      const q = query.toLowerCase().trim();
      if (!q) return true;
      return (
        r.customer.toLowerCase().includes(q) ||
        r.bookingCode.toLowerCase().includes(q) ||
        r.packageName.toLowerCase().includes(q)
      );
    });
  }, [incomeRows, query]);

  const totalOmzet = useMemo(() => filteredRows.reduce((sum, r) => sum + r.gross, 0), [filteredRows]);
  const totalKasMasuk = useMemo(() => filteredRows.reduce((sum, r) => sum + r.paid, 0), [filteredRows]);

  return (
    <AppShell eyebrow="Laporan & Analytics" title="Laporan Pendapatan & Gross Profit Omzet">
      <div className="space-y-5">
        <ReportNav />

        {/* Header Hero Banner */}
        <section className="rounded-2xl border border-stone-200/70 bg-white p-5 sm:p-6 shadow-2xs">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-brand-cocoa sm:text-2xl">
                Rekapitulasi Pendapatan Omzet & Estimasi Margin Profit
              </h1>
              <p className="text-xs text-stone-500 mt-1 sm:text-sm">
                Analisa omzet kotor penjualan paket wisata, realisasi dana masuk, serta proyeksi keuntungan bersih travel.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3.5 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition"
              >
                <Printer className="h-3.5 w-3.5 text-stone-500" strokeWidth={1.5} />
                Cetak PDF
              </button>

              <button
                type="button"
                onClick={() => {
                  const headers = ["ID", "Jenis Layanan", "Paket Umrah", "Kode Booking", "Jamaah", "Tgl Transaksi", "Total Omzet", "Realisasi Kas", "Status"];
                  const rows = filteredRows.map((r) => [
                    r.id,
                    r.serviceType,
                    r.packageName,
                    r.bookingCode,
                    r.customer,
                    r.date,
                    r.grossDisplay,
                    r.paidDisplay,
                    r.status,
                  ]);
                  exportToCSV("Laporan_Pendapatan_Omset_El_Massa", headers, rows);
                }}
                className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-emerald-600 px-4 text-xs font-semibold text-white shadow-2xs hover:bg-emerald-700 transition cursor-pointer"
              >
                <FileSpreadsheet className="h-3.5 w-3.5" strokeWidth={1.5} />
                Export Excel CSV
              </button>
            </div>
          </div>
        </section>

        {/* 📊 KPI Metric Cards Grid */}
        <section className="grid gap-4 md:grid-cols-4">
          <article className="rounded-2xl border border-stone-200/70 bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-stone-500">Total Project Omzet</p>
              <WalletCards className="h-4 w-4 text-brand-pink" strokeWidth={1.5} />
            </div>
            <p className="mt-1 text-xl font-extrabold text-brand-cocoa">
              Rp {totalOmzet.toLocaleString("id-ID")}
            </p>
            <p className="mt-1 text-[11px] text-stone-400">Total nilai kontrak paket</p>
          </article>

          <article className="rounded-2xl border border-stone-200/70 bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-stone-500">Kas Masuk (Realisasi)</p>
              <BarChart3 className="h-4 w-4 text-emerald-600" strokeWidth={1.5} />
            </div>
            <p className="mt-1 text-xl font-extrabold text-emerald-700">
              Rp {totalKasMasuk.toLocaleString("id-ID")}
            </p>
            <p className="mt-1 text-[11px] text-stone-400">Pemasukan kas terverifikasi</p>
          </article>

          <article className="rounded-2xl border border-stone-200/70 bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-stone-500">Estimasi Gross Margin</p>
              <TrendingUp className="h-4 w-4 text-brand-pink" strokeWidth={1.5} />
            </div>
            <p className="mt-1 text-sm font-semibold text-stone-400">
              Data belum tersedia
            </p>
            <p className="mt-1 text-[11px] text-stone-400">Kalkulator HPP belum menyimpan breakdown biaya ke database</p>
          </article>

          <article className="rounded-2xl border border-stone-200/70 bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-stone-500">Total Booking</p>
              <Plane className="h-4 w-4 text-sky-600" strokeWidth={1.5} />
            </div>
            <p className="mt-1 text-2xl font-bold text-sky-800">{filteredRows.length} Booking</p>
            <p className="mt-1 text-[11px] text-stone-400">Periode real operasional</p>
          </article>
        </section>

        {/* Table Card */}
        <section className="rounded-2xl border border-stone-200/70 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-stone-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-brand-cocoa">Rincian Pendapatan Per Booking</h3>
              <p className="text-xs text-stone-500">Data omzet, realisasi kas terbayar, dan estimasi margin kotor per transaksi.</p>
            </div>

            <label className="flex h-9 items-center gap-2 rounded-xl border border-stone-200 bg-stone-50/70 px-3 text-xs text-stone-500 w-full sm:w-64">
              <Search className="h-3.5 w-3.5 text-stone-400" strokeWidth={1.5} />
              <input
                className="w-full bg-transparent outline-none text-xs placeholder:text-stone-400"
                placeholder="Cari kode booking / nama..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>
          </div>

          <div className="overflow-x-auto rounded-xl border border-stone-200/60">
            <table className="w-full min-w-[900px] border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-stone-200/60 bg-stone-50/70 font-semibold text-stone-500 text-[11px] uppercase tracking-wider">
                  <th className="py-2.5 pl-3 pr-2">ID & Kode</th>
                  <th className="py-2.5 pr-2">Nama Jamaah / Rombongan</th>
                  <th className="py-2.5 pr-2">Kategori Paket</th>
                  <th className="py-2.5 pr-2">Tgl Berangkat</th>
                  <th className="py-2.5 pr-2">Total Omzet Gross</th>
                  <th className="py-2.5 pr-2">Kas Terbayar</th>
                  <th className="py-2.5 pr-3 text-right">Status Bayar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-normal">
                {loading && (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-stone-400">Memuat laporan pendapatan...</td>
                  </tr>
                )}
                {!loading && filteredRows.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-stone-400">Belum ada data booking.</td>
                  </tr>
                )}
                {filteredRows.map((r) => (
                  <tr key={r.id} className="transition hover:bg-stone-50/60">
                    <td className="py-3 pl-3 pr-2 font-mono font-bold text-brand-cocoa whitespace-nowrap">{r.bookingCode}</td>
                    <td className="py-3 pr-2 font-semibold text-brand-cocoa whitespace-nowrap">{r.customer}</td>
                    <td className="py-3 pr-2 text-stone-700 whitespace-nowrap">{r.serviceType}</td>
                    <td className="py-3 pr-2 text-stone-500 whitespace-nowrap">{r.date}</td>
                    <td className="py-3 pr-2 font-bold text-stone-900 whitespace-nowrap">{r.grossDisplay}</td>
                    <td className="py-3 pr-2 font-semibold text-emerald-700 whitespace-nowrap">{r.paidDisplay}</td>
                    <td className="py-3 pr-3 text-right whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${statusStyles[r.status]}`}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </AppShell>
  );
}
