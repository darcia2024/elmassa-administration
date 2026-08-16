"use client";

import {
  AlertTriangle,
  BarChart3,
  CalendarClock,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  FileText,
  Filter,
  MessageSquare,
  Phone,
  Printer,
  Search,
  Users,
  WalletCards,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { ReportNav } from "@/components/report-nav";
import { exportToCSV } from "@/lib/export-excel";

type ReceivableItem = {
  bookingCode: string;
  customer: string;
  packageName: string;
  departureDate: string;
  totalDisplay: string;
  paidDisplay: string;
  remainingDisplay: string;
  remainingAmount: number;
  dueDate: string;
  dueDateValue: string;
  age: string;
  status: string;
  priority: string;
  phone: string;
};

const priorityStyles: Record<string, string> = {
  Tinggi: "bg-rose-50/80 text-rose-700 border border-rose-200/60",
  Normal: "bg-emerald-50/80 text-emerald-700 border border-emerald-200/60",
};

const statusStyles: Record<string, string> = {
  Lunas: "bg-emerald-50/80 text-emerald-800 border border-emerald-200/60",
  DP: "bg-amber-50/80 text-amber-800 border border-amber-200/60",
  "Belum Bayar": "bg-rose-50/80 text-rose-700 border border-rose-200/60",
};

export default function ReportsPage() {
  const [receivables, setReceivables] = useState<ReceivableItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("2026-01-01");
  const [endDate, setEndDate] = useState("2026-12-31");
  const [selectedStatus, setSelectedStatus] = useState("Semua Status");
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetch("/api/reports/receivables")
      .then((res) => res.json())
      .then((json) => {
        const rows = (json.data ?? []) as any[];
        setReceivables(
          rows.map((r) => ({
            bookingCode: r.bookingCode,
            customer: r.customerName,
            packageName: r.packageName,
            departureDate: r.departureDate,
            totalDisplay: r.totalDisplay,
            paidDisplay: r.paidDisplay,
            remainingDisplay: r.remainingDisplay,
            remainingAmount: r.remainingAmount,
            dueDate: r.dueDate,
            dueDateValue: r.dueDateValue,
            age: `${r.ageDays} hari`,
            status: r.status,
            priority: r.priority,
            phone: r.phone,
          })),
        );
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  const filteredReceivables = useMemo(
    () =>
      receivables.filter((row) => {
        const matchesDate = !row.dueDateValue || (row.dueDateValue >= startDate && row.dueDateValue <= endDate);
        const matchesStatus = selectedStatus === "Semua Status" || row.status === selectedStatus;
        const searchable = `${row.bookingCode} ${row.customer} ${row.packageName}`.toLowerCase();
        const matchesQuery = query.trim().length === 0 || searchable.includes(query.trim().toLowerCase());

        return matchesDate && matchesStatus && matchesQuery;
      }),
    [receivables, startDate, endDate, selectedStatus, query],
  );

  const totalPiutang = useMemo(() => filteredReceivables.reduce((acc, r) => acc + r.remainingAmount, 0), [filteredReceivables]);
  const countTinggi = useMemo(() => filteredReceivables.filter((r) => r.priority === "Tinggi").length, [filteredReceivables]);

  return (
    <AppShell eyebrow="Laporan & Analytics" title="Laporan Piutang & Sisa Tagihan Jamaah">
      <div className="space-y-5">
        
        {/* Navigation Tabs */}
        <ReportNav />

        {/* Header Hero Banner */}
        <section className="print-hidden rounded-2xl border border-stone-200/70 bg-white p-5 sm:p-6 shadow-2xs">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-brand-cocoa sm:text-2xl">
                Pantau Sisa Tagihan & Piutang Jamaah
              </h1>
              <p className="text-xs text-stone-500 mt-1 sm:text-sm">
                Rekapitulasi sisa pembayaran jamaah berdasarkan tanggal jatuh tempo dan prioritas penagihan WhatsApp.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3.5 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition"
              >
                <Printer className="h-3.5 w-3.5 text-stone-500" strokeWidth={1.5} />
                Cetak Laporan
              </button>

              <button
                type="button"
                onClick={() => {
                  const headers = ["Kode Booking", "Nama Jamaah", "Paket Umrah", "Tgl Keberangkatan", "Total Biaya", "Terbayar", "Sisa Piutang", "Tgl Jatuh Tempo", "Status"];
                  const rows = filteredReceivables.map((r) => [
                    r.bookingCode,
                    r.customer,
                    r.packageName,
                    r.departureDate,
                    r.totalDisplay,
                    r.paidDisplay,
                    r.remainingDisplay,
                    r.dueDate,
                    r.status,
                  ]);
                  exportToCSV("Laporan_Piutang_Jamaah_El_Massa", headers, rows);
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
        <section className="grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-4">
          <article className="rounded-2xl border border-stone-200/70 bg-white p-3.5 sm:p-5 shadow-2xs">
            <div className="flex items-center justify-between gap-1.5">
              <p className="text-[11px] sm:text-xs font-semibold text-stone-500 truncate">Total Sisa Piutang</p>
              <WalletCards className="h-4 w-4 text-brand-pink shrink-0" strokeWidth={1.5} />
            </div>
            <p className="mt-1 text-base sm:text-xl font-extrabold text-brand-pink">Rp {totalPiutang.toLocaleString("id-ID")}</p>
            <p className="mt-1 text-[10px] sm:text-[11px] text-stone-400 truncate">Total tagihan belum terbayar</p>
          </article>

          <article className="rounded-2xl border border-stone-200/70 bg-white p-3.5 sm:p-5 shadow-2xs">
            <div className="flex items-center justify-between gap-1.5">
              <p className="text-[11px] sm:text-xs font-semibold text-stone-500 truncate">Jumlah Transaksi Piutang</p>
              <FileText className="h-4 w-4 text-amber-600 shrink-0" strokeWidth={1.5} />
            </div>
            <p className="mt-1 text-lg sm:text-2xl font-bold text-brand-cocoa">{filteredReceivables.length} Booking</p>
            <p className="mt-1 text-[10px] sm:text-[11px] text-stone-400 truncate">Sesuai filter tanggal</p>
          </article>

          <article className="rounded-2xl border border-stone-200/70 bg-white p-3.5 sm:p-5 shadow-2xs">
            <div className="flex items-center justify-between gap-1.5">
              <p className="text-[11px] sm:text-xs font-semibold text-stone-500 truncate">Prioritas Penagihan Tinggi</p>
              <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" strokeWidth={1.5} />
            </div>
            <p className="mt-1 text-lg sm:text-2xl font-bold text-rose-600">{countTinggi} Transaksi</p>
            <p className="mt-1 text-[10px] sm:text-[11px] text-stone-400 truncate">Perlu follow-up WhatsApp</p>
          </article>

          <article className="rounded-2xl border border-stone-200/70 bg-white p-3.5 sm:p-5 shadow-2xs">
            <div className="flex items-center justify-between gap-1.5">
              <p className="text-[11px] sm:text-xs font-semibold text-stone-500 truncate">Status Pelunasan</p>
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" strokeWidth={1.5} />
            </div>
            <p className="mt-1 text-lg sm:text-2xl font-bold text-emerald-700">
              {filteredReceivables.length > 0 ? `${(
                (filteredReceivables.filter((r) => r.remainingAmount === 0).length /
                  filteredReceivables.length) *
                100
              ).toFixed(0)}% Terbayar` : "0% Terbayar"}
            </p>
            <p className="mt-1 text-[10px] sm:text-[11px] text-stone-400 truncate">Rata-rata pelunasan rombongan</p>
          </article>
        </section>

        {/* Comprehensive Table Card & Filter Toolbar */}
        <section className="rounded-2xl border border-stone-200/70 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
          
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-stone-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-brand-cocoa">Filter & Tabel Rincian Piutang Jamaah</h3>
              <p className="text-xs text-stone-500">Saring berdasarkan periode tanggal jatuh tempo dan status pelunasan.</p>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="date"
                className="h-9 min-w-0 flex-1 rounded-xl border border-stone-200 bg-stone-50 px-2.5 text-xs text-stone-700 font-medium outline-none sm:flex-none"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <span className="text-xs text-stone-400">s/d</span>
              <input
                type="date"
                className="h-9 min-w-0 flex-1 rounded-xl border border-stone-200 bg-stone-50 px-2.5 text-xs text-stone-700 font-medium outline-none sm:flex-none"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />

              <select
                className="h-9 w-full rounded-xl border border-stone-200 bg-rose-50/60 px-3 text-xs font-bold text-brand-pink outline-none sm:w-auto"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="Semua Status">Semua Status</option>
                <option value="DP">Status DP</option>
                <option value="Belum Bayar">Belum Bayar</option>
                <option value="Lunas">Lunas</option>
              </select>

              <label className="flex h-9 w-full items-center gap-2 rounded-xl border border-stone-200 bg-stone-50/70 px-3 text-xs text-stone-500 sm:w-auto">
                <Search className="h-3.5 w-3.5 text-stone-400 shrink-0" strokeWidth={1.5} />
                <input
                  className="w-full bg-transparent outline-none text-xs placeholder:text-stone-400"
                  placeholder="Cari kode booking / nama..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </label>
            </div>
          </div>

          {/* Kartu mobile -- tabel 10 kolom di bawah tidak muat di layar HP */}
          <div className="block space-y-3 md:hidden">
            {loading && <p className="py-6 text-center text-xs text-stone-400">Memuat laporan piutang...</p>}

            {!loading && filteredReceivables.length === 0 && (
              <p className="py-6 text-center text-xs text-stone-400">Tidak ada piutang tersisa.</p>
            )}

            {filteredReceivables.map((r) => (
              <div key={r.bookingCode} className="space-y-2.5 rounded-2xl border border-stone-200/80 bg-white p-4 shadow-2xs">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span className="block font-mono text-[10px] font-bold text-stone-400">{r.bookingCode}</span>
                    <h4 className="truncate text-xs font-bold text-stone-900">{r.customer}</h4>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${statusStyles[r.status] || "bg-stone-50 text-stone-700"}`}
                  >
                    {r.status}
                  </span>
                </div>

                <div className="rounded-xl border border-stone-100 bg-stone-50 p-2.5">
                  <span className="block text-[10px] font-medium text-stone-400">Sisa Piutang</span>
                  <span className="text-sm font-bold text-rose-600">{r.remainingDisplay}</span>
                  <div className="mt-2 grid grid-cols-2 gap-2 border-t border-stone-200/70 pt-2 text-[11px]">
                    <div>
                      <span className="block text-[10px] font-medium text-stone-400">Total Harga</span>
                      <span className="font-bold text-stone-800">{r.totalDisplay}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-medium text-stone-400">Terbayar</span>
                      <span className="font-bold text-emerald-700">{r.paidDisplay}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-stone-500">
                  <div className="min-w-0">
                    <span className="block text-[10px] font-medium text-stone-400">Paket & Berangkat</span>
                    <span className="block truncate text-stone-700">{r.packageName}</span>
                    <span className="block truncate">{r.departureDate}</span>
                  </div>
                  <div className="min-w-0">
                    <span className="block text-[10px] font-medium text-stone-400">Jatuh Tempo</span>
                    <span className="font-mono text-stone-700">{r.dueDate}</span>
                  </div>
                </div>

                <a
                  href={`https://wa.me/${r.phone}?text=Halo%20${encodeURIComponent(r.customer)},%20kami%20dari%20El%20Massa%20Tour%20mengingatkan%20sisa%20tagihan%20booking%20${r.bookingCode}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 text-[11px] font-semibold text-emerald-800 transition active:bg-emerald-600 active:text-white"
                >
                  <MessageSquare className="h-3.5 w-3.5" strokeWidth={1.5} />
                  Kirim WA
                </a>
              </div>
            ))}
          </div>

          <div className="hidden overflow-x-auto rounded-xl border border-stone-200/60 md:block">
            <table className="w-full min-w-[960px] border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-stone-200/60 bg-stone-50/70 font-semibold text-stone-500 text-[11px] uppercase tracking-wider">
                  <th className="py-2.5 pl-3 pr-2">Kode Booking</th>
                  <th className="py-2.5 pr-2">Nama Jamaah / Rombongan</th>
                  <th className="py-2.5 pr-2">Paket Wisata</th>
                  <th className="py-2.5 pr-2">Keberangkatan</th>
                  <th className="py-2.5 pr-2">Total Harga</th>
                  <th className="py-2.5 pr-2">Terbayar</th>
                  <th className="py-2.5 pr-2">Sisa Piutang</th>
                  <th className="py-2.5 pr-2">Jatuh Tempo</th>
                  <th className="py-2.5 pr-2">Status</th>
                  <th className="py-2.5 pr-3 text-right">Follow-up WA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-normal">
                {loading && (
                  <tr>
                    <td colSpan={10} className="py-6 text-center text-stone-400">Memuat laporan piutang...</td>
                  </tr>
                )}
                {!loading && filteredReceivables.length === 0 && (
                  <tr>
                    <td colSpan={10} className="py-6 text-center text-stone-400">Tidak ada piutang tersisa.</td>
                  </tr>
                )}
                {filteredReceivables.map((r) => (
                  <tr key={r.bookingCode} className="transition hover:bg-stone-50/60">
                    <td className="py-3 pl-3 pr-2 font-mono font-bold text-brand-cocoa whitespace-nowrap">{r.bookingCode}</td>
                    <td className="py-3 pr-2 font-semibold text-brand-cocoa whitespace-nowrap">{r.customer}</td>
                    <td className="py-3 pr-2 text-stone-700 whitespace-nowrap">{r.packageName}</td>
                    <td className="py-3 pr-2 text-stone-500 whitespace-nowrap">{r.departureDate}</td>
                    <td className="py-3 pr-2 font-semibold text-stone-800 whitespace-nowrap">{r.totalDisplay}</td>
                    <td className="py-3 pr-2 font-semibold text-emerald-700 whitespace-nowrap">{r.paidDisplay}</td>
                    <td className="py-3 pr-2 font-bold text-rose-600 whitespace-nowrap">{r.remainingDisplay}</td>
                    <td className="py-3 pr-2 font-mono text-stone-600 whitespace-nowrap">{r.dueDate}</td>
                    <td className="py-3 pr-2 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${statusStyles[r.status] || "bg-stone-50 text-stone-700"}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3 pr-3 text-right whitespace-nowrap">
                      <a
                        href={`https://wa.me/${r.phone}?text=Halo%20${encodeURIComponent(r.customer)},%20kami%20dari%20El%20Massa%20Tour%20mengingatkan%20sisa%20tagihan%20booking%20${r.bookingCode}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 rounded-xl border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-800 hover:bg-emerald-600 hover:text-white transition"
                      >
                        <MessageSquare className="h-3 w-3" strokeWidth={1.5} />
                        <span>Kirim WA</span>
                      </a>
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
