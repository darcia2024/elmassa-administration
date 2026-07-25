import { CircleDollarSign, CreditCard, FileText, Plus, ReceiptText, Search, WalletCards } from "lucide-react";
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
];

const paymentSummary = [
  { label: "Pembayaran Masuk", value: "Rp 151.500.000", note: "6 transaksi dummy", icon: CircleDollarSign },
  { label: "Menunggu Cek", value: "Rp 25.000.000", note: "1 pembayaran perlu validasi", icon: WalletCards },
  { label: "Rekening Aktif", value: "3", note: "BCA, Mandiri, Kas Kantor", icon: CreditCard },
  { label: "Kuitansi", value: "6", note: "Siap dicetak dari detail", icon: ReceiptText },
];

const statusStyles: Record<string, string> = {
  Terverifikasi: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  "Menunggu Cek": "bg-amber-50 text-amber-700 ring-amber-200",
};

const tabs = ["Semua", "Terverifikasi", "Menunggu Cek"];

export default function PaymentsPage() {
  return (
    <AppShell eyebrow="Keuangan" title="Pembayaran & Cicilan">
      <section className="grid gap-4 md:grid-cols-4">
        {paymentSummary.map((item) => (
          <article key={item.label} className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-stone-500">{item.label}</p>
              <item.icon className="h-5 w-5 text-brand-brown" aria-hidden="true" />
            </div>
            <p className="mt-3 text-2xl font-bold text-brand-cocoa">{item.value}</p>
            <p className="mt-2 text-sm text-stone-500">{item.note}</p>
          </article>
        ))}
      </section>

      <section className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
        <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h3 className="text-lg font-bold text-brand-cocoa">Daftar Pembayaran</h3>
            <p className="mt-1 text-sm text-stone-500">Navigasi pembayaran masuk, cicilan, rekening tujuan, dan kuitansi operasional.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-stone-200 bg-white px-4 text-sm font-bold text-brand-cocoa" href="/dokumen/invoice">
              <FileText className="h-4 w-4" aria-hidden="true" />
              Invoice
            </Link>
            <Link className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-stone-200 bg-white px-4 text-sm font-bold text-brand-cocoa" href="/dokumen/kuitansi">
              <ReceiptText className="h-4 w-4" aria-hidden="true" />
              Kuitansi
            </Link>
            <Link className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-stone-200 bg-white px-4 text-sm font-bold text-brand-cocoa" href="/pembayaran/cicilan">
              <WalletCards className="h-4 w-4" aria-hidden="true" />
              Cicilan
            </Link>
            <Link className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-stone-200 bg-white px-4 text-sm font-bold text-brand-cocoa" href="/pengaturan/rekening">
              <CreditCard className="h-4 w-4" aria-hidden="true" />
              Rekening
            </Link>
            <Link className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-brand-pink px-4 text-sm font-bold text-white" href="/pembayaran/form">
              <Plus className="h-4 w-4" aria-hidden="true" />
              Catat pembayaran
            </Link>
          </div>
        </div>

        <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex gap-2 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab}
                className={`h-10 shrink-0 rounded-md px-4 text-sm font-bold ${
                  tab === "Semua"
                    ? "bg-brand-cocoa text-white"
                    : "border border-stone-200 bg-white text-brand-cocoa"
                }`}
                type="button"
              >
                {tab}
              </button>
            ))}
          </div>
          <label className="flex h-10 min-w-0 items-center gap-2 rounded-md border border-stone-200 bg-white px-3 text-sm text-stone-500 lg:w-80">
            <Search className="h-4 w-4 shrink-0" aria-hidden="true" />
            <input className="min-w-0 flex-1 bg-transparent outline-none" placeholder="Cari kuitansi, booking, pelanggan" />
          </label>
        </div>

        <div className="overflow-x-auto rounded-lg border border-stone-200">
          <table className="w-full min-w-[980px] border-collapse text-left text-sm">
            <thead className="bg-brand-cream text-xs uppercase text-stone-500">
              <tr>
                <th className="px-4 py-3 font-bold">Kuitansi</th>
                <th className="px-4 py-3 font-bold">Tanggal</th>
                <th className="px-4 py-3 font-bold">Booking</th>
                <th className="px-4 py-3 font-bold">Pelanggan</th>
                <th className="px-4 py-3 font-bold">Paket</th>
                <th className="px-4 py-3 font-bold">Nominal</th>
                <th className="px-4 py-3 font-bold">Metode</th>
                <th className="px-4 py-3 font-bold">Rekening</th>
                <th className="px-4 py-3 font-bold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 bg-white">
              {payments.map((payment) => (
                <tr key={payment.receipt} className="text-stone-700 hover:bg-brand-cream">
                  <td className="px-4 py-4 font-bold text-brand-cocoa">{payment.receipt}</td>
                  <td className="px-4 py-4">{payment.date}</td>
                  <td className="px-4 py-4">
                    <Link className="font-bold text-brand-cocoa hover:text-brand-pink" href={`/booking/${payment.bookingCode}`}>
                      {payment.bookingCode}
                    </Link>
                  </td>
                  <td className="px-4 py-4">{payment.customer}</td>
                  <td className="px-4 py-4">{payment.packageName}</td>
                  <td className="px-4 py-4 font-bold text-brand-cocoa">{payment.amountDisplay}</td>
                  <td className="px-4 py-4">{payment.method}</td>
                  <td className="px-4 py-4">{payment.account}</td>
                  <td className="px-4 py-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${statusStyles[payment.status]}`}>
                      {payment.status}
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
