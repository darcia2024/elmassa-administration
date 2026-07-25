import { CheckCircle2, FileText, Users } from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { ReportNav } from "@/components/report-nav";

const manifestRows = [
  { participant: "Siti Rahma", bookingCode: "BK-2407-018", packageName: "Umrah Reguler 12 Hari", departure: "12 Agu 2026", passport: "C1234567", documentStatus: "Lengkap", paymentStatus: "DP" },
];

const statusStyles: Record<string, string> = {
  Lengkap: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  "Belum Lengkap": "bg-amber-50 text-amber-700 ring-amber-200",
  Lunas: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  DP: "bg-amber-50 text-amber-700 ring-amber-200",
  "Belum Bayar": "bg-rose-50 text-rose-700 ring-rose-200",
};

export default function ManifestReportPage() {
  const completeDocuments = manifestRows.filter((row) => row.documentStatus === "Lengkap").length;
  const pendingDocuments = manifestRows.length - completeDocuments;

  return (
    <AppShell eyebrow="Laporan" title="Laporan Manifest Peserta">
      <ReportNav />

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-stone-500">Peserta</p>
            <Users className="h-5 w-5 text-brand-brown" aria-hidden="true" />
          </div>
          <p className="mt-3 text-2xl font-bold text-brand-cocoa">{manifestRows.length}</p>
          <p className="mt-2 text-sm text-stone-500">Manifest laporan dummy</p>
        </article>
        <article className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-stone-500">Dokumen Lengkap</p>
            <CheckCircle2 className="h-5 w-5 text-emerald-600" aria-hidden="true" />
          </div>
          <p className="mt-3 text-2xl font-bold text-brand-cocoa">{completeDocuments}</p>
          <p className="mt-2 text-sm text-stone-500">Siap berangkat</p>
        </article>
        <article className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-stone-500">Belum Lengkap</p>
            <FileText className="h-5 w-5 text-amber-600" aria-hidden="true" />
          </div>
          <p className="mt-3 text-2xl font-bold text-brand-cocoa">{pendingDocuments}</p>
          <p className="mt-2 text-sm text-stone-500">Perlu follow-up dokumen</p>
        </article>
      </section>

      <section className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-bold text-brand-cocoa">Manifest Peserta per Booking</h3>
            <p className="mt-1 text-sm text-stone-500">Data dummy untuk kebutuhan laporan transaksi dan operasional keberangkatan.</p>
          </div>
          <Link className="inline-flex h-10 w-fit items-center justify-center rounded-md border border-stone-200 bg-white px-4 text-sm font-bold text-brand-cocoa" href="/manifest">
            Buka manifest operasional
          </Link>
        </div>

        <div className="overflow-x-auto rounded-lg border border-stone-200">
          <table className="w-full min-w-[840px] border-collapse text-left text-sm">
            <thead className="bg-brand-cream text-xs uppercase text-stone-500">
              <tr>
                <th className="px-4 py-3 font-bold">Peserta</th>
                <th className="px-4 py-3 font-bold">Booking</th>
                <th className="px-4 py-3 font-bold">Paket</th>
                <th className="px-4 py-3 font-bold">Berangkat</th>
                <th className="px-4 py-3 font-bold">Paspor</th>
                <th className="px-4 py-3 font-bold">Dokumen</th>
                <th className="px-4 py-3 font-bold">Pembayaran</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 bg-white">
              {manifestRows.map((row) => (
                <tr key={`${row.bookingCode}-${row.participant}`} className="text-stone-700 hover:bg-brand-cream">
                  <td className="px-4 py-4 font-bold text-brand-cocoa">{row.participant}</td>
                  <td className="px-4 py-4">
                    <Link className="font-bold text-brand-cocoa hover:text-brand-pink" href={`/booking/${row.bookingCode}`}>
                      {row.bookingCode}
                    </Link>
                  </td>
                  <td className="px-4 py-4">{row.packageName}</td>
                  <td className="px-4 py-4 font-semibold">{row.departure}</td>
                  <td className="px-4 py-4">{row.passport}</td>
                  <td className="px-4 py-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${statusStyles[row.documentStatus]}`}>
                      {row.documentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${statusStyles[row.paymentStatus]}`}>
                      {row.paymentStatus}
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
