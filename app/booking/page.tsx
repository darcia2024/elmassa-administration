import { ClipboardList, Plus, Users } from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { getBookingListRows } from "@/lib/seed-data/derived";

const statusStyles: Record<string, string> = {
  Lunas: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  DP: "bg-amber-50 text-amber-700 ring-amber-200",
  "Belum Bayar": "bg-rose-50 text-rose-700 ring-rose-200",
};

export default function BookingsPage() {
  const bookings = getBookingListRows();
  const totalParticipants = bookings.reduce((total, booking) => total + booking.participants, 0);

  return (
    <AppShell eyebrow="Operasional" title="Manajemen Booking & Peserta">
      <section className="grid gap-4 md:grid-cols-4">
        <article className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
          <p className="text-sm font-semibold text-stone-500">Total Booking</p>
          <p className="mt-3 text-2xl font-bold text-brand-cocoa">{bookings.length}</p>
          <p className="mt-2 text-sm text-stone-500">Data booking dummy</p>
        </article>
        <article className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
          <p className="text-sm font-semibold text-stone-500">Peserta</p>
          <p className="mt-3 text-2xl font-bold text-brand-cocoa">{totalParticipants}</p>
          <p className="mt-2 text-sm text-stone-500">Total peserta rombongan</p>
        </article>
        <article className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
          <p className="text-sm font-semibold text-stone-500">DP / Cicilan</p>
          <p className="mt-3 text-2xl font-bold text-brand-cocoa">
            {bookings.filter((booking) => booking.status === "DP").length}
          </p>
          <p className="mt-2 text-sm text-stone-500">Perlu dipantau</p>
        </article>
        <article className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
          <p className="text-sm font-semibold text-stone-500">Lunas</p>
          <p className="mt-3 text-2xl font-bold text-brand-cocoa">
            {bookings.filter((booking) => booking.status === "Lunas").length}
          </p>
          <p className="mt-2 text-sm text-stone-500">Siap dokumen akhir</p>
        </article>
      </section>

      <section className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-bold text-brand-cocoa">Daftar Booking</h3>
            <p className="mt-1 text-sm text-stone-500">Ringkasan reservasi, peserta, pembayaran, dan sisa tagihan.</p>
          </div>
          <Link className="inline-flex h-10 w-fit items-center gap-2 rounded-md bg-brand-pink px-4 text-sm font-bold text-white" href="/booking/form">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Buat booking
          </Link>
        </div>

        <div className="overflow-x-auto rounded-lg border border-stone-200">
          <table className="w-full min-w-[980px] border-collapse text-left text-sm">
            <thead className="bg-brand-cream text-xs uppercase text-stone-500">
              <tr>
                <th className="px-4 py-3 font-bold">Kode</th>
                <th className="px-4 py-3 font-bold">Pelanggan</th>
                <th className="px-4 py-3 font-bold">Paket</th>
                <th className="px-4 py-3 font-bold">Berangkat</th>
                <th className="px-4 py-3 font-bold">Peserta</th>
                <th className="px-4 py-3 font-bold">Total</th>
                <th className="px-4 py-3 font-bold">Terbayar</th>
                <th className="px-4 py-3 font-bold">Sisa</th>
                <th className="px-4 py-3 font-bold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 bg-white">
              {bookings.map((booking) => (
                <tr key={booking.code} className="text-stone-700 hover:bg-brand-cream">
                  <td className="px-4 py-4">
                    <Link className="font-bold text-brand-cocoa hover:text-brand-pink" href={`/booking/${booking.code}`}>
                      {booking.code}
                    </Link>
                  </td>
                  <td className="px-4 py-4">{booking.customer}</td>
                  <td className="px-4 py-4">{booking.packageName}</td>
                  <td className="px-4 py-4 font-semibold">{booking.departure}</td>
                  <td className="px-4 py-4">
                    <span className="inline-flex items-center gap-2 font-semibold">
                      <Users className="h-4 w-4 text-brand-brown" aria-hidden="true" />
                      {booking.participants}
                    </span>
                  </td>
                  <td className="px-4 py-4 font-semibold">{booking.totalDisplay}</td>
                  <td className="px-4 py-4">{booking.paidDisplay}</td>
                  <td className="px-4 py-4 font-bold text-brand-cocoa">{booking.remainingDisplay}</td>
                  <td className="px-4 py-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${statusStyles[booking.status]}`}>
                      {booking.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {bookings.slice(0, 3).map((booking) => (
          <article key={booking.code} className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
            <div className="mb-4 flex items-center justify-between">
              <span className="grid h-10 w-10 place-items-center rounded-md bg-brand-rose text-brand-pink">
                <ClipboardList className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className={`rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${statusStyles[booking.status]}`}>
                {booking.status}
              </span>
            </div>
            <h4 className="font-bold text-brand-cocoa">{booking.code}</h4>
            <p className="mt-1 text-sm text-stone-500">{booking.customer}</p>
            <p className="mt-3 text-sm font-semibold text-brand-cocoa">{booking.packageName}</p>
          </article>
        ))}
      </section>
    </AppShell>
  );
}
