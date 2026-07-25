import { FileText, Plus, ReceiptText, Search } from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";

const invoices = [
  {
    number: "INV-2407-018",
    bookingCode: "BK-2407-018",
    customer: "Siti Rahma",
    packageName: "Umrah Reguler 12 Hari",
    issueDate: "10 Jul 2026",
    dueDate: "28 Jul 2026",
    totalDisplay: "Rp 32.500.000",
    paidDisplay: "Rp 12.500.000",
    remainingDisplay: "Rp 20.000.000",
    status: "Sebagian",
  },
];

const statusStyles: Record<string, string> = {
  Lunas: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Sebagian: "bg-amber-50 text-amber-700 ring-amber-200",
  "Belum Bayar": "bg-rose-50 text-rose-700 ring-rose-200",
};

export default function InvoicePage() {
  return (
    <AppShell eyebrow="Dokumen" title="Invoice & Kuitansi">
      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
          <p className="text-sm font-semibold text-stone-500">Total Invoice</p>
          <p className="mt-3 text-2xl font-bold text-brand-cocoa">{invoices.length}</p>
          <p className="mt-2 text-sm text-stone-500">Data invoice dummy</p>
        </article>
        <article className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
          <p className="text-sm font-semibold text-stone-500">Belum Lunas</p>
          <p className="mt-3 text-2xl font-bold text-brand-cocoa">2</p>
          <p className="mt-2 text-sm text-stone-500">Perlu follow-up</p>
        </article>
        <article className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
          <p className="text-sm font-semibold text-stone-500">Total Tagihan</p>
          <p className="mt-3 text-2xl font-bold text-brand-cocoa">Rp 394.500.000</p>
          <p className="mt-2 text-sm text-stone-500">Akumulasi invoice</p>
        </article>
      </section>

      <section className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
        <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h3 className="text-lg font-bold text-brand-cocoa">Daftar Invoice</h3>
            <p className="mt-1 text-sm text-stone-500">Invoice booking dan status pembayaran dengan data dummy.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="flex h-10 min-w-0 items-center gap-2 rounded-md border border-stone-200 bg-white px-3 text-sm text-stone-500 sm:w-72">
              <Search className="h-4 w-4 shrink-0" aria-hidden="true" />
              <input className="min-w-0 flex-1 bg-transparent outline-none" placeholder="Cari invoice atau booking" />
            </label>
            <Link className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-stone-200 bg-white px-4 text-sm font-bold text-brand-cocoa" href="/dokumen/kuitansi">
              <ReceiptText className="h-4 w-4" aria-hidden="true" />
              Kuitansi
            </Link>
            <button className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-brand-pink px-4 text-sm font-bold text-white" type="button">
              <Plus className="h-4 w-4" aria-hidden="true" />
              Buat invoice
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-stone-200">
          <table className="w-full min-w-[980px] border-collapse text-left text-sm">
            <thead className="bg-brand-cream text-xs uppercase text-stone-500">
              <tr>
                <th className="px-4 py-3 font-bold">Invoice</th>
                <th className="px-4 py-3 font-bold">Booking</th>
                <th className="px-4 py-3 font-bold">Pelanggan</th>
                <th className="px-4 py-3 font-bold">Paket</th>
                <th className="px-4 py-3 font-bold">Terbit</th>
                <th className="px-4 py-3 font-bold">Tempo</th>
                <th className="px-4 py-3 font-bold">Total</th>
                <th className="px-4 py-3 font-bold">Terbayar</th>
                <th className="px-4 py-3 font-bold">Sisa</th>
                <th className="px-4 py-3 font-bold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 bg-white">
              {invoices.map((invoice) => (
                <tr key={invoice.number} className="text-stone-700 hover:bg-brand-cream">
                  <td className="px-4 py-4">
                    <Link className="inline-flex items-center gap-2 font-bold text-brand-cocoa hover:text-brand-pink" href={`/dokumen/invoice/${invoice.number}`}>
                      <FileText className="h-4 w-4" aria-hidden="true" />
                      {invoice.number}
                    </Link>
                  </td>
                  <td className="px-4 py-4">
                    <Link className="font-bold text-brand-cocoa hover:text-brand-pink" href={`/booking/${invoice.bookingCode}`}>
                      {invoice.bookingCode}
                    </Link>
                  </td>
                  <td className="px-4 py-4">{invoice.customer}</td>
                  <td className="px-4 py-4">{invoice.packageName}</td>
                  <td className="px-4 py-4">{invoice.issueDate}</td>
                  <td className="px-4 py-4">{invoice.dueDate}</td>
                  <td className="px-4 py-4 font-semibold">{invoice.totalDisplay}</td>
                  <td className="px-4 py-4">{invoice.paidDisplay}</td>
                  <td className="px-4 py-4 font-bold text-brand-cocoa">{invoice.remainingDisplay}</td>
                  <td className="px-4 py-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${statusStyles[invoice.status]}`}>
                      {invoice.status}
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
