import { ArrowUpRight, CircleDollarSign, CreditCard, FileText, Plus, ReceiptText, Search, WalletCards } from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";

const payments = [
  {
    receipt: "KW-2407-044",
    bookingCode: "BK-2407-018",
    customer: "Siti Rahma",
    packageName: "Umrah Reguler 12 Hari",
    date: "25 Jul 2026",
    amountDisplay: "Rp 7.500.000",
    method: "Transfer",
    account: "BCA El Massa",
    status: "Terverifikasi",
  },
  {
    receipt: "KW-2407-045",
    bookingCode: "BK-2407-019",
    customer: "Ahmad Fauzi",
    packageName: "Umrah Reguler 12 Hari",
    date: "26 Jul 2026",
    amountDisplay: "Rp 10.000.000",
    method: "Transfer",
    account: "Mandiri El Massa",
    status: "Menunggu Cek",
  },
];

const paymentSummary = [
  { label: "Pembayaran Masuk", value: "Rp 151.500.000", note: "Total dana diterima", icon: CircleDollarSign },
  { label: "Menunggu Cek", value: "Rp 25.000.000", note: "Perlu validasi staf", icon: WalletCards },
  { label: "Rekening Bank", value: "3 Rekening", note: "BCA, Mandiri, Kas", icon: CreditCard },
  { label: "Kuitansi Diterbitkan", value: "6 Kuitansi", note: "Siap cetak & kirim", icon: ReceiptText },
];

export default function PaymentsPage() {
  return (
    <AppShell eyebrow="Keuangan" title="Pembayaran & Cicilan">
      <div className="space-y-5">
        {/* Metric Cards Row */}
        <section className="grid gap-4 md:grid-cols-4">
          {paymentSummary.map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.label} className="rounded-2xl border border-stone-200/70 bg-white p-5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-stone-500">{item.label}</p>
                  <Icon className="h-4 w-4 text-brand-pink" strokeWidth={1.5} />
                </div>
                <p className="mt-1 text-2xl font-bold text-brand-cocoa">{item.value}</p>
                <p className="mt-1 text-[11px] text-stone-400">{item.note}</p>
              </article>
            );
          })}
        </section>

        {/* Payments Table Card */}
        <section className="rounded-2xl border border-stone-200/70 bg-white p-5 sm:p-6 shadow-2xs">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-base font-bold text-brand-cocoa">Daftar Transaksi Pembayaran</h3>
              <p className="text-xs text-stone-500">Navigasi pembayaran masuk, cicilan, rekening tujuan, dan kuitansi operasional.</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <Link className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-stone-200 bg-stone-50 px-3.5 text-xs font-semibold text-stone-700 hover:bg-stone-100 transition" href="/dokumen/invoice">
                <FileText className="h-3.5 w-3.5 text-stone-500" strokeWidth={1.5} />
                Invoice
              </Link>
              <Link className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-stone-200 bg-stone-50 px-3.5 text-xs font-semibold text-stone-700 hover:bg-stone-100 transition" href="/dokumen/kuitansi">
                <ReceiptText className="h-3.5 w-3.5 text-stone-500" strokeWidth={1.5} />
                Kuitansi
              </Link>
              <Link className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-brand-pink px-4 text-xs font-semibold text-white shadow-2xs hover:bg-brand-pinkHover transition" href="/pembayaran/form">
                <Plus className="h-4 w-4" strokeWidth={1.5} />
                Catat Pembayaran
              </Link>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-stone-200/60">
            <table className="w-full min-w-[800px] border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-stone-200/60 bg-stone-50/70 font-semibold text-stone-500 text-[11px] uppercase tracking-wider">
                  <th className="py-2.5 pl-3 pr-2">Kuitansi & Booking</th>
                  <th className="py-2.5 pr-2">Pelanggan</th>
                  <th className="py-2.5 pr-2">Paket Wisata</th>
                  <th className="py-2.5 pr-2">Tanggal Bayar</th>
                  <th className="py-2.5 pr-2">Nominal</th>
                  <th className="py-2.5 pr-2">Metode & Rekening</th>
                  <th className="py-2.5 pr-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-normal">
                {payments.map((item) => (
                  <tr key={item.receipt} className="transition hover:bg-stone-50/60">
                    <td className="py-3 pl-3 pr-2">
                      <p className="font-semibold text-brand-cocoa">{item.receipt}</p>
                      <p className="font-mono text-[10px] text-stone-400">{item.bookingCode}</p>
                    </td>
                    <td className="py-3 pr-2 font-medium text-stone-700">{item.customer}</td>
                    <td className="py-3 pr-2 text-stone-500">{item.packageName}</td>
                    <td className="py-3 pr-2 text-stone-600">{item.date}</td>
                    <td className="py-3 pr-2 font-semibold text-emerald-700">{item.amountDisplay}</td>
                    <td className="py-3 pr-2 font-medium text-stone-700">
                      <p>{item.method}</p>
                      <p className="text-[10px] text-stone-400">{item.account}</p>
                    </td>
                    <td className="py-3 pr-3 text-right">
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${
                        item.status === "Terverifikasi"
                          ? "bg-emerald-50/80 text-emerald-800 border-emerald-200/60"
                          : "bg-amber-50/80 text-amber-800 border-amber-200/60"
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${item.status === "Terverifikasi" ? "bg-emerald-500" : "bg-amber-500"}`} />
                        {item.status}
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
