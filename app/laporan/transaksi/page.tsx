"use client";

import { ArrowDownCircle, ArrowUpCircle, BarChart3, Download, FileSpreadsheet, Search } from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { ReportNav } from "@/components/report-nav";
import { exportToCSV } from "@/lib/export-excel";
import { formatRupiah } from "@/lib/seed-data/derived";

type TransactionItem = {
  id: string;
  date: string;
  type: string;
  category: string;
  bookingCode: string;
  customer: string;
  account: string;
  amountDisplay: string;
  status: string;
};

const transactions: TransactionItem[] = [];

export default function TransactionReportPage() {
  return (
    <AppShell eyebrow="Laporan" title="Laporan Transaksi Arus Kas">
      <div className="space-y-5">
        <ReportNav />

        {/* Metric Cards Row */}
        <section className="grid gap-4 md:grid-cols-4">
          <article className="rounded-2xl border border-stone-200/70 bg-white p-5 shadow-2xs">
            <p className="text-xs font-semibold text-stone-500">Total Transaksi</p>
            <p className="mt-1 text-2xl font-bold text-brand-cocoa">{transactions.length}</p>
            <p className="mt-1 text-[11px] text-stone-400">Periode operasional</p>
          </article>
          <article className="rounded-2xl border border-stone-200/70 bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-stone-500">Total Pemasukan</p>
              <ArrowDownCircle className="h-4 w-4 text-emerald-600" strokeWidth={1.5} />
            </div>
            <p className="mt-1 text-2xl font-bold text-emerald-700">
              {formatRupiah(
                transactions
                  .filter((t) => t.type === "Pemasukan")
                  .reduce((acc, t) => acc + (t.amount || 0), 0)
              )}
            </p>
            <p className="mt-1 text-[11px] text-stone-400">Pembayaran jamaah masuk</p>
          </article>
          <article className="rounded-2xl border border-stone-200/70 bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-stone-500">Total Pengeluaran</p>
              <ArrowUpCircle className="h-4 w-4 text-rose-600" strokeWidth={1.5} />
            </div>
            <p className="mt-1 text-2xl font-bold text-rose-600">
              {formatRupiah(
                transactions
                  .filter((t) => t.type === "Pengeluaran")
                  .reduce((acc, t) => acc + (t.amount || 0), 0)
              )}
            </p>
            <p className="mt-1 text-[11px] text-stone-400">Operasional perjalanan</p>
          </article>
          <article className="rounded-2xl border border-stone-200/70 bg-white p-5 shadow-2xs">
            <p className="text-xs font-semibold text-stone-500">Saldo Arus Kas</p>
            <p className="mt-1 text-2xl font-bold text-brand-cocoa">
              {formatRupiah(
                transactions
                  .filter((t) => t.type === "Pemasukan")
                  .reduce((acc, t) => acc + (t.amount || 0), 0) -
                transactions
                  .filter((t) => t.type === "Pengeluaran")
                  .reduce((acc, t) => acc + (t.amount || 0), 0)
              )}
            </p>
            <p className="mt-1 text-[11px] text-stone-400">Pemasukan bersih</p>
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
                const headers = ["ID Transaksi", "Tanggal", "Tipe", "Kategori", "Kode Booking", "Pelanggan", "Akun Bank", "Nominal", "Status"];
                const rows = transactions.map((t) => [
                  t.id,
                  t.date,
                  t.type,
                  t.category,
                  t.bookingCode,
                  t.customer,
                  t.account,
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

          <div className="overflow-x-auto rounded-xl border border-stone-200/60">
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
