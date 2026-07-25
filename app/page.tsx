import {
  Banknote,
  CalendarDays,
  CircleDollarSign,
  ClipboardList,
  Plane,
  Users,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { getDashboardStats } from "@/lib/seed-data/derived";

const statIcons = {
  bookings: ClipboardList,
  customers: Users,
  packages: Plane,
  revenue: Banknote,
};

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Lunas: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    DP: "bg-amber-50 text-amber-700 ring-amber-200",
    "Belum Bayar": "bg-rose-50 text-rose-700 ring-rose-200",
  };

  return (
    <span className={`inline-flex min-w-[92px] items-center justify-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ${styles[status]}`}>
      {status}
    </span>
  );
}

export default function DashboardPage() {
  const dashboard = getDashboardStats();
  const maxRevenue = Math.max(...dashboard.weeklyRevenue.map((item) => item.amount), 1);
  const revenueBars = dashboard.weeklyRevenue.map((item) => ({
    ...item,
    height: Math.max(Math.round((item.amount / maxRevenue) * 100), 8),
  }));

  return (
    <AppShell eyebrow="Dashboard Operasional" title="Ringkasan El Massa Tour & Travel">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {dashboard.metrics.map((stat) => {
              const StatIcon = statIcons[stat.key as keyof typeof statIcons] ?? CircleDollarSign;
              return (
              <article key={stat.label} className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-stone-600">{stat.label}</p>
                  <span className="grid h-10 w-10 place-items-center rounded-md bg-brand-rose text-brand-pink">
                    <StatIcon className="h-5 w-5" aria-hidden="true" />
                  </span>
                </div>
                <p className="text-2xl font-bold text-brand-cocoa">{stat.displayValue}</p>
                <p className="mt-2 text-sm text-stone-500">{stat.note}</p>
              </article>
            );
            })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_360px]">
            <article className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-brand-cocoa">Booking Terbaru</h3>
                  <p className="text-sm text-stone-500">Data dummy untuk validasi tampilan dan status.</p>
                </div>
                <button className="rounded-md bg-brand-cocoa px-4 py-2 text-sm font-semibold text-white" type="button">
                  Lihat semua
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-stone-200 text-xs uppercase text-stone-500">
                      <th className="py-3 pr-4 font-semibold">Kode</th>
                      <th className="py-3 pr-4 font-semibold">Pelanggan</th>
                      <th className="py-3 pr-4 font-semibold">Paket</th>
                      <th className="py-3 pr-4 font-semibold">Berangkat</th>
                      <th className="py-3 pr-4 font-semibold">Status</th>
                      <th className="py-3 font-semibold">Terbayar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {dashboard.recentBookings.map((booking) => (
                      <tr key={booking.code} className="text-stone-700">
                        <td className="py-4 pr-4 font-semibold text-brand-cocoa">{booking.code}</td>
                        <td className="py-4 pr-4">{booking.customer}</td>
                        <td className="py-4 pr-4">{booking.packageName}</td>
                        <td className="py-4 pr-4">{booking.departureLabel}</td>
                        <td className="py-4 pr-4">
                          <StatusBadge status={booking.status} />
                        </td>
                        <td className="py-4 font-semibold">{booking.paidDisplay}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>

            <aside className="space-y-6">
              <article className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
                <div className="mb-5 flex items-center justify-between">
                  <h3 className="text-base font-bold text-brand-cocoa">Jadwal Dekat</h3>
                  <CalendarDays className="h-5 w-5 text-brand-pink" aria-hidden="true" />
                </div>
                <div className="space-y-4">
                  {dashboard.upcomingDepartures.map((item) => (
                    <div key={`${item.packageName}-${item.departureDate}`} className="flex items-center gap-3">
                      <span className="h-10 w-1.5 rounded-full bg-emerald-500" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-brand-cocoa">{item.packageName}</p>
                        <p className="text-xs text-stone-500">Kuota {item.bookedSeats}/{item.quota}</p>
                      </div>
                      <span className="rounded-md bg-stone-100 px-2.5 py-1 text-xs font-bold text-brand-brown">{item.dateLabel}</span>
                    </div>
                  ))}
                </div>
              </article>

              <article className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
                <div className="mb-5">
                  <h3 className="text-base font-bold text-brand-cocoa">Pemasukan Mingguan</h3>
                  <p className="text-sm text-stone-500">Simulasi pembayaran masuk.</p>
                </div>
                <div className="flex h-40 items-end gap-2">
                  {revenueBars.map((item) => (
                    <div key={item.day} className="flex flex-1 flex-col items-center gap-2">
                      <div
                        className="w-full rounded-t-md bg-gradient-to-t from-brand-brown to-brand-pink"
                        style={{ height: `${item.height}%` }}
                      />
                      <span className="text-xs font-medium text-stone-500">{item.day}</span>
                    </div>
                  ))}
                </div>
              </article>
            </aside>
      </section>
    </AppShell>
  );
}
