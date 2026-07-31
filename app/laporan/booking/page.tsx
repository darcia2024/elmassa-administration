"use client";

import {
  CalendarDays,
  Download,
  FileSpreadsheet,
  Plane,
  Printer,
  Search,
  Users,
  WalletCards,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { ReportNav } from "@/components/report-nav";

type DepartureReportItem = {
  scheduleId: string;
  packageName: string;
  departureDate: string;
  airline: string;
  quota: number;
  booked: number;
  paidBookings: number;
  receivableDisplay: string;
  status: string;
};

const departureReports: DepartureReportItem[] = [];

const statusStyles: Record<string, string> = {
  "Terjadwal (Full)": "bg-emerald-50/80 text-emerald-800 border border-emerald-200/60",
  Terjadwal: "bg-sky-50/80 text-sky-800 border border-sky-200/60",
  Draft: "bg-stone-50 text-stone-700 border border-stone-200",
};

export default function BookingDepartureReportPage() {
  const [query, setQuery] = useState("");

  const filteredReports = useMemo(() => {
    return departureReports.filter((r) => {
      const q = query.toLowerCase().trim();
      if (!q) return true;
      return (
        r.packageName.toLowerCase().includes(q) ||
        r.airline.toLowerCase().includes(q) ||
        r.scheduleId.toLowerCase().includes(q)
      );
    });
  }, [query]);

  const totalBooked = useMemo(() => filteredReports.reduce((total, row) => total + row.booked, 0), [filteredReports]);
  const totalQuota = useMemo(() => filteredReports.reduce((total, row) => total + row.quota, 0), [filteredReports]);
  const totalPaidBookings = useMemo(() => filteredReports.reduce((total, row) => total + row.paidBookings, 0), [filteredReports]);
  const avgOccupancy = totalQuota > 0 ? Math.round((totalBooked / totalQuota) * 100) : 0;

  return (
    <AppShell eyebrow="Laporan & Analytics" title="Laporan Penjualan Booking & Okupansi Seat">
      <div className="space-y-5">
        <ReportNav />

        {/* Header Hero Banner */}
        <section className="rounded-2xl border border-stone-200/70 bg-white p-5 sm:p-6 shadow-2xs">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-brand-cocoa sm:text-2xl">
                Rekapitulasi Penjualan Seat & Okupansi Keberangkatan
              </h1>
              <p className="text-xs text-stone-500 mt-1 sm:text-sm">
                Pantau keterisian seat per jadwal pesawat, jumlah jamaah lunas, dan status okupansi penerbangan.
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
                className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-brand-pink px-4 text-xs font-semibold text-white shadow-2xs hover:bg-brand-pinkHover transition"
              >
                <Download className="h-3.5 w-3.5" strokeWidth={1.5} />
                Export Excel CSV
              </button>
            </div>
          </div>
        </section>

        {/* 📊 KPI Metric Cards Grid */}
        <section className="grid gap-4 md:grid-cols-4">
          <article className="rounded-2xl border border-stone-200/70 bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-stone-500">Grup Keberangkatan</p>
              <CalendarDays className="h-4 w-4 text-brand-pink" strokeWidth={1.5} />
            </div>
            <p className="mt-1 text-2xl font-bold text-brand-cocoa">{departureReports.length} Jadwal</p>
            <p className="mt-1 text-[11px] text-stone-400">Penerbangan aktif</p>
          </article>

          <article className="rounded-2xl border border-stone-200/70 bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-stone-500">Booking Seat Terisi</p>
              <Users className="h-4 w-4 text-brand-pink" strokeWidth={1.5} />
            </div>
            <p className="mt-1 text-2xl font-bold text-brand-pink">{totalBooked} Seat</p>
            <p className="mt-1 text-[11px] text-stone-400">Dari total {totalQuota} kuota</p>
          </article>

          <article className="rounded-2xl border border-stone-200/70 bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-stone-500">Seat Lunas Ready Manifest</p>
              <WalletCards className="h-4 w-4 text-emerald-600" strokeWidth={1.5} />
            </div>
            <p className="mt-1 text-2xl font-bold text-emerald-700">{totalPaidBookings} Seat</p>
            <p className="mt-1 text-[11px] text-stone-400">Berkas verified 100%</p>
          </article>

          <article className="rounded-2xl border border-stone-200/70 bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-stone-500">Rata-rata Okupansi</p>
              <Plane className="h-4 w-4 text-sky-600" strokeWidth={1.5} />
            </div>
            <p className="mt-1 text-2xl font-bold text-sky-800">{avgOccupancy}%</p>
            <p className="mt-1 text-[11px] text-stone-400">Target keterisian tercapai</p>
          </article>
        </section>

        {/* Table Card */}
        <section className="rounded-2xl border border-stone-200/70 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-stone-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-brand-cocoa">Rincian Penjualan Seat & Okupansi Per Jadwal</h3>
              <p className="text-xs text-stone-500">Laporan realtime jumlah booking seat, kuota, persentase okupansi, dan penerbangan.</p>
            </div>

            <label className="flex h-9 items-center gap-2 rounded-xl border border-stone-200 bg-stone-50/70 px-3 text-xs text-stone-500 w-full sm:w-64">
              <Search className="h-3.5 w-3.5 text-stone-400" strokeWidth={1.5} />
              <input
                className="w-full bg-transparent outline-none text-xs placeholder:text-stone-400"
                placeholder="Cari jadwal / maskapai..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>
          </div>

          <div className="overflow-x-auto rounded-xl border border-stone-200/60">
            <table className="w-full min-w-[900px] border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-stone-200/60 bg-stone-50/70 font-semibold text-stone-500 text-[11px] uppercase tracking-wider">
                  <th className="py-2.5 pl-3 pr-2">ID Jadwal</th>
                  <th className="py-2.5 pr-2">Paket Wisata</th>
                  <th className="py-2.5 pr-2">Keberangkatan Flight</th>
                  <th className="py-2.5 pr-2">Terisi / Kuota</th>
                  <th className="py-2.5 pr-2">Okupansi %</th>
                  <th className="py-2.5 pr-2">Booking Lunas</th>
                  <th className="py-2.5 pr-2">Sisa Tagihan Piutang</th>
                  <th className="py-2.5 pr-3 text-right">Status Flight</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-normal">
                {filteredReports.map((row) => {
                  const occupancy = Math.round((row.booked / row.quota) * 100);

                  return (
                    <tr key={row.scheduleId} className="transition hover:bg-stone-50/60">
                      <td className="py-3 pl-3 pr-2 font-mono font-bold text-brand-cocoa whitespace-nowrap">{row.scheduleId}</td>
                      <td className="py-3 pr-2 font-semibold text-brand-cocoa whitespace-nowrap">{row.packageName}</td>
                      <td className="py-3 pr-2 text-stone-600 whitespace-nowrap">
                        {row.departureDate} ({row.airline})
                      </td>
                      <td className="py-3 pr-2 font-bold text-stone-900 whitespace-nowrap">
                        {row.booked} / {row.quota} Pax
                      </td>
                      <td className="py-3 pr-2 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 rounded-full bg-stone-100 overflow-hidden border border-stone-200/60">
                            <div className="h-full bg-brand-pink transition-all" style={{ width: `${occupancy}%` }} />
                          </div>
                          <span className="font-bold text-brand-pink text-[11px]">{occupancy}%</span>
                        </div>
                      </td>
                      <td className="py-3 pr-2 font-semibold text-emerald-700 whitespace-nowrap">{row.paidBookings} Seat</td>
                      <td className="py-3 pr-2 font-bold text-rose-600 whitespace-nowrap">{row.receivableDisplay}</td>
                      <td className="py-3 pr-3 text-right whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${statusStyles[row.status]}`}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </AppShell>
  );
}
