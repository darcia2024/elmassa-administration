import { AlertTriangle, CalendarClock, CheckCircle2, Plus, WalletCards } from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";

const installments = [
  {
    id: "CIC-001",
    bookingCode: "BK-2407-018",
    customer: "Siti Rahma",
    packageName: "Umrah Reguler 12 Hari",
    sequence: "Cicilan 2",
    dueDate: "28 Jul 2026",
    amountDisplay: "Rp 10.000.000",
    paidDisplay: "Rp 0",
    status: "Jatuh Tempo",
  },
];

const statusStyles: Record<string, string> = {
  "Jatuh Tempo": "bg-rose-50 text-rose-700 ring-rose-200",
  Terjadwal: "bg-amber-50 text-amber-700 ring-amber-200",
  Lunas: "bg-emerald-50 text-emerald-700 ring-emerald-200",
};

export default function InstallmentsPage() {
  const dueCount = installments.filter((item) => item.status === "Jatuh Tempo").length;
  const scheduledCount = installments.filter((item) => item.status === "Terjadwal").length;
  const paidCount = installments.filter((item) => item.status === "Lunas").length;

  return (
    <AppShell eyebrow="Keuangan" title="Kelola Cicilan">
      <section className="grid gap-4 md:grid-cols-4">
        <article className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-stone-500">Total Cicilan</p>
            <WalletCards className="h-5 w-5 text-brand-brown" aria-hidden="true" />
          </div>
          <p className="mt-3 text-2xl font-bold text-brand-cocoa">{installments.length}</p>
          <p className="mt-2 text-sm text-stone-500">Data rencana dummy</p>
        </article>
        <article className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-stone-500">Jatuh Tempo</p>
            <AlertTriangle className="h-5 w-5 text-rose-600" aria-hidden="true" />
          </div>
          <p className="mt-3 text-2xl font-bold text-brand-cocoa">{dueCount}</p>
          <p className="mt-2 text-sm text-stone-500">Perlu follow-up</p>
        </article>
        <article className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-stone-500">Terjadwal</p>
            <CalendarClock className="h-5 w-5 text-brand-brown" aria-hidden="true" />
          </div>
          <p className="mt-3 text-2xl font-bold text-brand-cocoa">{scheduledCount}</p>
          <p className="mt-2 text-sm text-stone-500">Belum masuk tempo</p>
        </article>
        <article className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-stone-500">Lunas</p>
            <CheckCircle2 className="h-5 w-5 text-emerald-600" aria-hidden="true" />
          </div>
          <p className="mt-3 text-2xl font-bold text-brand-cocoa">{paidCount}</p>
          <p className="mt-2 text-sm text-stone-500">Sudah dibayar</p>
        </article>
      </section>

      <section className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-bold text-brand-cocoa">Jadwal Cicilan</h3>
            <p className="mt-1 text-sm text-stone-500">Rencana cicilan per booking dengan status jatuh tempo dan nominal tagihan.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link className="inline-flex h-10 items-center justify-center rounded-md border border-stone-200 bg-white px-4 text-sm font-bold text-brand-cocoa" href="/pembayaran">
              Daftar pembayaran
            </Link>
            <Link className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-brand-pink px-4 text-sm font-bold text-white" href="/pembayaran/form">
              <Plus className="h-4 w-4" aria-hidden="true" />
              Catat pembayaran
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-stone-200">
          <table className="w-full min-w-[980px] border-collapse text-left text-sm">
            <thead className="bg-brand-cream text-xs uppercase text-stone-500">
              <tr>
                <th className="px-4 py-3 font-bold">ID</th>
                <th className="px-4 py-3 font-bold">Booking</th>
                <th className="px-4 py-3 font-bold">Pelanggan</th>
                <th className="px-4 py-3 font-bold">Paket</th>
                <th className="px-4 py-3 font-bold">Termin</th>
                <th className="px-4 py-3 font-bold">Tempo</th>
                <th className="px-4 py-3 font-bold">Tagihan</th>
                <th className="px-4 py-3 font-bold">Terbayar</th>
                <th className="px-4 py-3 font-bold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 bg-white">
              {installments.map((installment) => (
                <tr key={installment.id} className="text-stone-700 hover:bg-brand-cream">
                  <td className="px-4 py-4 font-bold text-brand-cocoa">{installment.id}</td>
                  <td className="px-4 py-4">
                    <Link className="font-bold text-brand-cocoa hover:text-brand-pink" href={`/booking/${installment.bookingCode}`}>
                      {installment.bookingCode}
                    </Link>
                  </td>
                  <td className="px-4 py-4">{installment.customer}</td>
                  <td className="px-4 py-4">{installment.packageName}</td>
                  <td className="px-4 py-4 font-semibold">{installment.sequence}</td>
                  <td className="px-4 py-4">{installment.dueDate}</td>
                  <td className="px-4 py-4 font-bold text-brand-cocoa">{installment.amountDisplay}</td>
                  <td className="px-4 py-4">{installment.paidDisplay}</td>
                  <td className="px-4 py-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${statusStyles[installment.status]}`}>
                      {installment.status}
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
