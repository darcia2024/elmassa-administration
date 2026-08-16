"use client";

import { useEffect, useState } from "react";
import { ArrowDownCircle, ArrowUpCircle, BarChart3, Download, FileSpreadsheet, Search } from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { ReportNav } from "@/components/report-nav";
import { exportToCSV } from "@/lib/export-excel";

function formatRupiah(value: number) {
  return `Rp ${value.toLocaleString("id-ID")}`;
}

type TransactionItem = {
  id: string;
  date: string;
  type: string;
  category: string;
  bookingCode: string;
  customer: string;
  amount: number;
  amountDisplay: string;
  status: string;
};

export default function TransactionReportPage() {
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/payments")
      .then((res) => res.json())
      .then((json) => {
        const rows = (json.data ?? []) as any[];
        setTransactions(
          rows.map((p) => ({
            id: p.receiptNumber ?? p.id,
            date: p.date,
            type: "Pemasukan",
            category: p.method,
            bookingCode: p.bookingCode,
            customer: p.customerName,
            amount: Number(p.amount),
            amountDisplay: formatRupiah(Number(p.amount)),
            status: p.status,
          })),
        );
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  const totalPemasukan = transactions.reduce((sum, t) => sum + t.amount, 0);

  return (
    <AppShell eyebrow="Laporan" title="Laporan Transaksi Arus Kas">
      <div className="space-y-5">
        <ReportNav />

        {/* Metric Cards Row */}
        <section className="grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-4">
          <article className="rounded-2xl border border-stone-200/70 bg-white p-3.5 sm:p-5 shadow-2xs">
            <p className="text-[11px] sm:text-xs font-semibold text-stone-500 truncate">Total Transaksi</p>
            <p className="mt-1 text-lg sm:text-2xl font-bold text-brand-cocoa">{transactions.length}</p>
            <p className="mt-1 text-[10px] sm:text-[11px] text-stone-400 truncate">Periode operasional</p>
          </article>
          <article className="rounded-2xl border border-stone-200/70 bg-white p-3.5 sm:p-5 shadow-2xs">
            <div className="flex items-center justify-between gap-1.5">
              <p className="text-[11px] sm:text-xs font-semibold text-stone-500 truncate">Total Pemasukan</p>
              <ArrowDownCircle className="h-4 w-4 text-emerald-600 shrink-0" strokeWidth={1.5} />
            </div>
            <p className="mt-1 text-base sm:text-2xl font-bold text-emerald-700">
              {formatRupiah(totalPemasukan)}
            </p>
            <p className="mt-1 text-[10px] sm:text-[11px] text-stone-400 truncate">Pembayaran jamaah masuk</p>
          </article>
          <article className="rounded-2xl border border-stone-200/70 bg-white p-3.5 sm:p-5 shadow-2xs">
            <div className="flex items-center justify-between gap-1.5">
              <p className="text-[11px] sm:text-xs font-semibold text-stone-500 truncate">Total Pengeluaran</p>
              <ArrowUpCircle className="h-4 w-4 text-rose-600 shrink-0" strokeWidth={1.5} />
            </div>
            <p className="mt-1 text-base sm:text-2xl font-bold text-rose-600">
              {formatRupiah(0)}
            </p>
            <p className="mt-1 text-[10px] sm:text-[11px] text-stone-400">Belum ada fitur pencatatan biaya operasional</p>
          </article>
          <article className="rounded-2xl border border-stone-200/70 bg-white p-3.5 sm:p-5 shadow-2xs">
            <p className="text-[11px] sm:text-xs font-semibold text-stone-500 truncate">Saldo Arus Kas</p>
            <p className="mt-1 text-base sm:text-2xl font-bold text-brand-cocoa">
              {formatRupiah(totalPemasukan)}
            </p>
            <p className="mt-1 text-[10px] sm:text-[11px] text-stone-400 truncate">Net selisih arus kas</p>
          </article>
        </section>

        {/* Transaction Table Card */}
        <section className="rounded-2xl border border-stone-200/70 bg-white p-5 sm:p-6 shadow-2xs">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-base font-bold text-brand-cocoa">Daftar Transaksi Arus Kas</h3>
              <p className="text-xs text-stone-500">Rincian arus kas masuk dan keluar terkait booking & invoice.</p>
            </div>
            <button
              onClick={() => {
                const headers = ["ID Transaksi", "Tanggal", "Tipe", "Kategori", "Kode Booking", "Pelanggan", "Nominal", "Status"];
                const rows = transactions.map((t) => [
                  t.id,
                  t.date,
                  t.type,
                  t.category,
                  t.bookingCode,
                  t.customer,
                  t.amountDisplay,
                  t.status,
                ]);
                exportToCSV("Laporan_Arus_Kas_Transaksi_El_Massa", headers, rows);
              }}
              className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-emerald-600 px-4 text-xs font-semibold text-white shadow-2xs hover:bg-emerald-700 transition cursor-pointer"
              type="button"
            >
              <FileSpreadsheet className="h-3.5 w-3.5" strokeWidth={1.5} />
              Export Excel CSV
            </button>
          </div>

          {/* Kartu mobile -- tabel 8 kolom di bawah tidak muat di layar HP */}
          <div className="block space-y-3 md:hidden">
            {loading && <p className="py-6 text-center text-xs text-stone-400">Memuat transaksi...</p>}

            {!loading && transactions.length === 0 && (
              <p className="py-6 text-center text-xs text-stone-400">Belum ada transaksi.</p>
            )}

            {transactions.map((trx) => (
              <div key={trx.id} className="space-y-2.5 rounded-2xl border border-stone-200/80 bg-white p-4 shadow-2xs">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span className="block font-mono text-[10px] font-bold text-stone-400">{trx.id}</span>
                    <h4 className="truncate text-xs font-bold text-stone-900">{trx.customer}</h4>
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-emerald-200/60 bg-emerald-50/80 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    {trx.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 rounded-xl border border-stone-100 bg-stone-50 p-2.5 text-[11px]">
                  <div>
                    <span className="block text-[10px] font-medium text-stone-400">Nominal</span>
                    <span className="font-bold text-emerald-700">{trx.amountDisplay}</span>
                  </div>
                  <div className="min-w-0">
                    <span className="block text-[10px] font-medium text-stone-400">Tipe & Kategori</span>
                    <span className="block truncate font-bold text-stone-800">{trx.type}</span>
                    <span className="block truncate text-stone-500">{trx.category}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 border-t border-stone-100 pt-1 text-[11px] text-stone-500">
                  <span className="truncate font-mono">{trx.bookingCode}</span>
                  <span className="shrink-0">{trx.date}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden overflow-x-auto rounded-xl border border-stone-200/60 md:block">
            <table className="w-full min-w-[800px] border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-stone-200/60 bg-stone-50/70 font-semibold text-stone-500 text-[11px] uppercase tracking-wider">
                  <th className="py-2.5 pl-3 pr-2">ID Transaksi</th>
                  <th className="py-2.5 pr-2">Tanggal</th>
                  <th className="py-2.5 pr-2">Tipe</th>
                  <th className="py-2.5 pr-2">Kategori</th>
                  <th className="py-2.5 pr-2">Kode Booking</th>
                  <th className="py-2.5 pr-2">Pelanggan</th>
                  <th className="py-2.5 pr-2">Nominal</th>
                  <th className="py-2.5 pr-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-normal">
                {loading && (
                  <tr>
                    <td colSpan={8} className="py-6 text-center text-stone-400">Memuat transaksi...</td>
                  </tr>
                )}
                {!loading && transactions.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-6 text-center text-stone-400">Belum ada transaksi.</td>
                  </tr>
                )}
                {transactions.map((trx) => (
                  <tr key={trx.id} className="transition hover:bg-stone-50/60">
                    <td className="py-3 pl-3 pr-2 font-mono font-semibold text-brand-cocoa whitespace-nowrap">{trx.id}</td>
                    <td className="py-3 pr-2 text-stone-500 whitespace-nowrap">{trx.date}</td>
                    <td className="py-3 pr-2 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200/60 bg-emerald-50/80 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800">
                        {trx.type}
                      </span>
                    </td>
                    <td className="py-3 pr-2 font-medium text-stone-700">{trx.category}</td>
                    <td className="py-3 pr-2 font-mono text-stone-500 whitespace-nowrap">{trx.bookingCode}</td>
                    <td className="py-3 pr-2 font-medium text-brand-cocoa whitespace-nowrap">{trx.customer}</td>
                    <td className="py-3 pr-2 font-semibold text-emerald-700 whitespace-nowrap">{trx.amountDisplay}</td>
                    <td className="py-3 pr-3 text-right whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200/60 bg-emerald-50/80 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        {trx.status}
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
