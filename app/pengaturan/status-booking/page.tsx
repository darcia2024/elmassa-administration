import { AlertTriangle, CheckCircle2, CircleDashed, ClipboardList, Lock, RefreshCcw, XCircle } from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { listBookingStatuses } from "@/lib/settings/reference";

// Icons are presentation only; the statuses themselves come from the database.
const stageIcons: Record<string, typeof CircleDashed> = {
  Prospek: CircleDashed,
  "Belum Bayar": ClipboardList,
  DP: RefreshCcw,
  Lunas: CheckCircle2,
  Dibatalkan: XCircle,
  Refund: AlertTriangle,
};

const statusStyles: Record<string, string> = {
  Aktif: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Manual: "bg-amber-50 text-amber-700 ring-amber-200",
};

export const dynamic = "force-dynamic";

export default async function BookingStatusesPage() {
  const bookingStatuses = await listBookingStatuses();
  const activeCount = bookingStatuses.filter((item) => item.status === "Aktif").length;
  const manualCount = bookingStatuses.filter((item) => item.status === "Manual").length;
  const workflow = bookingStatuses
    .filter((item) => item.status === "Aktif")
    .map((item) => ({ label: item.name, icon: stageIcons[item.name] ?? CircleDashed }));

  return (
    <AppShell eyebrow="Pengaturan Master" title="Status Booking">
      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
          <p className="text-sm font-semibold text-stone-500">Total Status</p>
          <p className="mt-3 text-2xl font-bold text-brand-cocoa">{bookingStatuses.length}</p>
          <p className="mt-2 text-sm text-stone-500">Referensi baca-saja</p>
        </article>
        <article className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
          <p className="text-sm font-semibold text-stone-500">Status Otomatis</p>
          <p className="mt-3 text-2xl font-bold text-brand-cocoa">{activeCount}</p>
          <p className="mt-2 text-sm text-stone-500">Mengikuti pembayaran</p>
        </article>
        <article className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
          <p className="text-sm font-semibold text-stone-500">Override Manual</p>
          <p className="mt-3 text-2xl font-bold text-brand-cocoa">{manualCount}</p>
          <p className="mt-2 text-sm text-stone-500">Butuh otorisasi supervisor</p>
        </article>
      </section>

      <section className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-bold text-brand-cocoa">Alur Status Utama</h3>
            <p className="mt-1 text-sm text-stone-500">Urutan status otomatis yang dipakai booking aktif dan laporan sisa tagihan.</p>
          </div>
          <Link className="inline-flex h-10 w-fit items-center justify-center rounded-md border border-stone-200 bg-white px-4 text-sm font-bold text-brand-cocoa" href="/pengaturan">
            Pengaturan master
          </Link>
        </div>

        <div className="grid gap-3 md:grid-cols-4">
          {workflow.map((item, index) => (
            <article key={item.label} className="rounded-lg border border-brand-rose bg-brand-cream p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-white text-brand-pink">
                  <item.icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <span className="text-xs font-bold uppercase text-brand-brown">Tahap {index + 1}</span>
              </div>
              <p className="mt-4 font-bold text-brand-cocoa">{item.label}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
        <div className="mb-4 flex items-start gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-brand-rose text-brand-pink">
            <Lock className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-brand-cocoa">Daftar Status Baca-saja</h3>
            <p className="mt-1 text-sm text-stone-500">Status ini disiapkan sebagai referensi operasional dan belum bisa diedit dari frontend.</p>
          </div>
        </div>

        {/* Kartu mobile -- tabel 7 kolom di bawah butuh 980px */}
        <div className="block space-y-3 md:hidden">
          {bookingStatuses.map((item) => (
            <div key={item.name} className="space-y-2.5 rounded-xl border border-stone-200 bg-white p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h4 className="truncate text-sm font-bold text-brand-cocoa">{item.name}</h4>
                  <p className="truncate text-xs text-stone-500">{item.stage}</p>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ring-1 ${statusStyles[item.status]}`}>
                  {item.status}
                </span>
              </div>

              <p className="text-xs leading-5 text-stone-600">{item.description}</p>

              <div className="grid gap-2 rounded-lg border border-stone-100 bg-brand-cream/50 p-2.5 text-xs">
                <div>
                  <span className="block text-[10px] font-medium text-stone-500">Dampak Pembayaran</span>
                  <span className="text-stone-700">{item.paymentImpact}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-medium text-stone-500">Dampak Dokumen</span>
                  <span className="text-stone-700">{item.documentImpact}</span>
                </div>
              </div>

              <p className="border-t border-stone-100 pt-2 text-xs text-stone-500">
                Owner <span className="font-semibold text-stone-700">{item.owner}</span>
              </p>
            </div>
          ))}
        </div>

        <div className="hidden overflow-x-auto rounded-lg border border-stone-200 md:block">
          <table className="w-full min-w-[980px] border-collapse text-left text-sm">
            <thead className="bg-brand-cream text-xs uppercase text-stone-500">
              <tr>
                <th className="px-4 py-3 font-bold">Status</th>
                <th className="px-4 py-3 font-bold">Tahap</th>
                <th className="px-4 py-3 font-bold">Keterangan</th>
                <th className="px-4 py-3 font-bold">Dampak Pembayaran</th>
                <th className="px-4 py-3 font-bold">Dampak Dokumen</th>
                <th className="px-4 py-3 font-bold">Owner</th>
                <th className="px-4 py-3 font-bold">Mode</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 bg-white">
              {bookingStatuses.map((item) => (
                <tr key={item.name} className="text-stone-700 hover:bg-brand-cream">
                  <td className="px-4 py-4 font-bold text-brand-cocoa">{item.name}</td>
                  <td className="px-4 py-4">{item.stage}</td>
                  <td className="px-4 py-4 leading-6">{item.description}</td>
                  <td className="px-4 py-4">{item.paymentImpact}</td>
                  <td className="px-4 py-4">{item.documentImpact}</td>
                  <td className="px-4 py-4">{item.owner}</td>
                  <td className="px-4 py-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${statusStyles[item.status]}`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <XCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <p>Status booking dibuat baca-saja agar perubahan alur pembayaran tidak terjadi tanpa migrasi dan penyesuaian laporan.</p>
        </div>
      </section>
    </AppShell>
  );
}
