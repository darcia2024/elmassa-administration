import { CalendarDays, Plane, Users, WalletCards } from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { ReportNav } from "@/components/report-nav";

const departureReports = [
  {
    scheduleId: "dep-umr-20260812",
    packageName: "Umrah Reguler 12 Hari",
    departureDate: "12 Agu 2026",
    quota: 45,
    booked: 18,
    paidBookings: 9,
    receivableDisplay: "Rp 122.500.000",
    status: "Terjadwal",
  },
];

const statusStyles: Record<string, string> = {
  Terjadwal: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Draft: "bg-stone-100 text-stone-600 ring-stone-200",
};

export default function BookingDepartureReportPage() {
  const totalBooked = departureReports.reduce((total, row) => total + row.booked, 0);
  const totalQuota = departureReports.reduce((total, row) => total + row.quota, 0);
  const totalPaidBookings = departureReports.reduce((total, row) => total + row.paidBookings, 0);

  return (
    <AppShell eyebrow="Laporan" title="Booking & Keberangkatan">
      <ReportNav />

      <section className="grid gap-4 md:grid-cols-4">
        <article className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-stone-500">Jadwal</p>
            <CalendarDays className="h-5 w-5 text-brand-brown" aria-hidden="true" />
          </div>
          <p className="mt-3 text-2xl font-bold text-brand-cocoa">{departureReports.length}</p>
          <p className="mt-2 text-sm text-stone-500">Keberangkatan aktif</p>
        </article>
        <article className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-stone-500">Booking Seat</p>
            <Users className="h-5 w-5 text-brand-brown" aria-hidden="true" />
          </div>
          <p className="mt-3 text-2xl font-bold text-brand-cocoa">{totalBooked}</p>
          <p className="mt-2 text-sm text-stone-500">Dari {totalQuota} kuota</p>
        </article>
        <article className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-stone-500">Booking Lunas</p>
            <WalletCards className="h-5 w-5 text-emerald-600" aria-hidden="true" />
          </div>
          <p className="mt-3 text-2xl font-bold text-brand-cocoa">{totalPaidBookings}</p>
          <p className="mt-2 text-sm text-stone-500">Siap manifest final</p>
        </article>
        <article className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-stone-500">Okupansi</p>
            <Plane className="h-5 w-5 text-brand-brown" aria-hidden="true" />
          </div>
          <p className="mt-3 text-2xl font-bold text-brand-cocoa">57%</p>
          <p className="mt-2 text-sm text-stone-500">Rata-rata jadwal</p>
        </article>
      </section>

      <section className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-bold text-brand-cocoa">Keberangkatan per Paket</h3>
            <p className="mt-1 text-sm text-stone-500">Data dummy booking seat, kuota, dan sisa tagihan per jadwal.</p>
          </div>
          <Link className="inline-flex h-10 w-fit items-center justify-center rounded-md border border-stone-200 bg-white px-4 text-sm font-bold text-brand-cocoa" href="/laporan/transaksi">
            Transaksi
          </Link>
        </div>

        <div className="overflow-x-auto rounded-lg border border-stone-200">
          <table className="w-full min-w-[900px] border-collapse text-left text-sm">
            <thead className="bg-brand-cream text-xs uppercase text-stone-500">
              <tr>
                <th className="px-4 py-3 font-bold">Jadwal</th>
                <th className="px-4 py-3 font-bold">Paket</th>
                <th className="px-4 py-3 font-bold">Berangkat</th>
                <th className="px-4 py-3 font-bold">Booking</th>
                <th className="px-4 py-3 font-bold">Kuota</th>
                <th className="px-4 py-3 font-bold">Okupansi</th>
                <th className="px-4 py-3 font-bold">Lunas</th>
                <th className="px-4 py-3 font-bold">Sisa Tagihan</th>
                <th className="px-4 py-3 font-bold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 bg-white">
              {departureReports.map((row) => {
                const occupancy = Math.round((row.booked / row.quota) * 100);

                return (
                  <tr key={row.scheduleId} className="text-stone-700 hover:bg-brand-cream">
                    <td className="px-4 py-4 font-bold text-brand-cocoa">{row.scheduleId}</td>
                    <td className="px-4 py-4">{row.packageName}</td>
                    <td className="px-4 py-4 font-semibold">{row.departureDate}</td>
                    <td className="px-4 py-4">{row.booked}</td>
                    <td className="px-4 py-4">{row.quota}</td>
                    <td className="px-4 py-4">
                      <div className="h-2 w-28 rounded-full bg-brand-rose">
                        <div className="h-2 rounded-full bg-brand-pink" style={{ width: `${occupancy}%` }} />
                      </div>
                      <span className="mt-1 block text-xs font-bold text-brand-cocoa">{occupancy}%</span>
                    </td>
                    <td className="px-4 py-4">{row.paidBookings}</td>
                    <td className="px-4 py-4 font-bold text-brand-cocoa">{row.receivableDisplay}</td>
                    <td className="px-4 py-4">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${statusStyles[row.status]}`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </AppShell>
  );
}
