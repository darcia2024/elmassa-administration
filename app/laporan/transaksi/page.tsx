import { ArrowDownCircle, ArrowUpCircle, BarChart3, Download, Search } from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { ReportNav } from "@/components/report-nav";

const transactions = [
  {
    id: "TRX-2407-044",
    date: "25 Jul 2026",
    type: "Masuk",
    category: "Cicilan Booking",
    bookingCode: "BK-2407-018",
    customer: "Siti Rahma",
    account: "BCA El Massa",
    amountDisplay: "Rp 7.500.000",
    status: "Terverifikasi",
  },
];

const typeStyles: Record<string, string> = {
  Masuk: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Keluar: "bg-rose-50 text-rose-700 ring-rose-200",
};

const statusStyles: Record<string, string> = {
  Terverifikasi: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Draft: "bg-stone-100 text-stone-600 ring-stone-200",
};

export default function TransactionReportPage() {
  return (
    <AppShell eyebrow="Laporan" title="Laporan Transaksi">
      <ReportNav />

      <section className="grid gap-4 md:grid-cols-4">
        <article className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
          <p className="text-sm font-semibold text-stone-500">Transaksi</p>
          <p className="mt-3 text-2xl font-bold text-brand-cocoa">{transactions.length}</p>
          <p className="mt-2 text-sm text-stone-500">Data dummy periode Juli</p>
        </article>
        <article className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-stone-500">Pemasukan</p>
            <ArrowDownCircle className="h-5 w-5 text-emerald-600" aria-hidden="true" />
          </div>
          <p className="mt-3 text-2xl font-bold text-brand-cocoa">Rp 73.500.000</p>
          <p className="mt-2 text-sm text-stone-500">Pembayaran masuk</p>
        </article>
        <article className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-stone-500">Pengeluaran</p>
            <ArrowUpCircle className="h-5 w-5 text-rose-600" aria-hidden="true" />
          </div>
          <p className="mt-3 text-2xl font-bold text-brand-cocoa">Rp 27.750.000</p>
          <p className="mt-2 text-sm text-stone-500">Operasional booking</p>
        </article>
        <article className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
          <p className="text-sm font-semibold text-stone-500">Saldo Bersih</p>
          <p className="mt-3 text-2xl font-bold text-brand-cocoa">Rp 45.750.000</p>
          <p className="mt-2 text-sm text-stone-500">Pemasukan - pengeluaran</p>
        </article>
      </section>

      <section className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
        <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h3 className="text-lg font-bold text-brand-cocoa">Daftar Transaksi</h3>
            <p className="mt-1 text-sm text-stone-500">Arus kas masuk dan keluar terkait booking, invoice, dan kebutuhan operasional.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link className="inline-flex h-10 items-center justify-center rounded-md border border-stone-200 bg-white px-4 text-sm font-bold text-brand-cocoa" href="/laporan">
              Sisa tagihan
            </Link>
            <Link className="inline-flex h-10 items-center justify-center rounded-md border border-stone-200 bg-white px-4 text-sm font-bold text-brand-cocoa" href="/laporan/pendapatan">
              Pendapatan
            </Link>
            <Link className="inline-flex h-10 items-center justify-center rounded-md border border-stone-200 bg-white px-4 text-sm font-bold text-brand-cocoa" href="/laporan/booking">
              Booking
            </Link>
            <Link className="inline-flex h-10 items-center justify-center rounded-md border border-stone-200 bg-white px-4 text-sm font-bold text-brand-cocoa" href="/laporan/manifest">
              Manifest
            </Link>
            <button className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-brand-cocoa px-4 text-sm font-bold text-white" type="button">
              <Download className="h-4 w-4" aria-hidden="true" />
              Export
            </button>
          </div>
        </div>

        <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex gap-2 overflow-x-auto">
            {["Semua", "Masuk", "Keluar"].map((item) => (
              <button
                key={item}
                className={`h-10 shrink-0 rounded-md px-4 text-sm font-bold ${
                  item === "Semua"
                    ? "bg-brand-cocoa text-white"
                    : "border border-stone-200 bg-white text-brand-cocoa"
                }`}
                type="button"
              >
                {item}
              </button>
            ))}
          </div>
          <label className="flex h-10 min-w-0 items-center gap-2 rounded-md border border-stone-200 bg-white px-3 text-sm text-stone-500 lg:w-80">
            <Search className="h-4 w-4 shrink-0" aria-hidden="true" />
            <input className="min-w-0 flex-1 bg-transparent outline-none" placeholder="Cari transaksi atau booking" />
          </label>
        </div>

        <div className="overflow-x-auto rounded-lg border border-stone-200">
          <table className="w-full min-w-[980px] border-collapse text-left text-sm">
            <thead className="bg-brand-cream text-xs uppercase text-stone-500">
              <tr>
                <th className="px-4 py-3 font-bold">ID</th>
                <th className="px-4 py-3 font-bold">Tanggal</th>
                <th className="px-4 py-3 font-bold">Tipe</th>
                <th className="px-4 py-3 font-bold">Kategori</th>
                <th className="px-4 py-3 font-bold">Booking</th>
                <th className="px-4 py-3 font-bold">Pelanggan</th>
                <th className="px-4 py-3 font-bold">Rekening</th>
                <th className="px-4 py-3 font-bold">Nominal</th>
                <th className="px-4 py-3 font-bold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 bg-white">
              {transactions.map((transaction) => (
                <tr key={transaction.id} className="text-stone-700 hover:bg-brand-cream">
                  <td className="px-4 py-4 font-bold text-brand-cocoa">{transaction.id}</td>
                  <td className="px-4 py-4">{transaction.date}</td>
                  <td className="px-4 py-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${typeStyles[transaction.type]}`}>
                      {transaction.type}
                    </span>
                  </td>
                  <td className="px-4 py-4">{transaction.category}</td>
                  <td className="px-4 py-4">
                    <Link className="font-bold text-brand-cocoa hover:text-brand-pink" href={`/booking/${transaction.bookingCode}`}>
                      {transaction.bookingCode}
                    </Link>
                  </td>
                  <td className="px-4 py-4">{transaction.customer}</td>
                  <td className="px-4 py-4">{transaction.account}</td>
                  <td className="px-4 py-4 font-bold text-brand-cocoa">{transaction.amountDisplay}</td>
                  <td className="px-4 py-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${statusStyles[transaction.status]}`}>
                      {transaction.status}
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
