import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";

const bookingDetails = [
  {
    code: "BK-2407-018",
    customer: "Siti Rahma",
    phone: "0812-4455-7788",
    packageName: "Umrah Reguler 12 Hari",
    departure: "12 Agu 2026",
    status: "DP",
    totalDisplay: "Rp 32.500.000",
    paidDisplay: "Rp 12.500.000",
    remainingDisplay: "Rp 20.000.000",
    participants: [
      { name: "Siti Rahma", passport: "C1234567", contact: "0812-4455-7788", documentStatus: "Lengkap" },
    ],
    payments: [
      { receipt: "KW-2407-044", date: "25 Jul 2026", amountDisplay: "Rp 7.500.000", account: "BCA El Massa" },
      { receipt: "KW-2407-011", date: "10 Jul 2026", amountDisplay: "Rp 5.000.000", account: "Mandiri El Massa" },
    ],
  },
];

const statusStyles: Record<string, string> = {
  Lunas: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  DP: "bg-amber-50 text-amber-700 ring-amber-200",
  "Belum Bayar": "bg-rose-50 text-rose-700 ring-rose-200",
  Lengkap: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  "Belum Lengkap": "bg-amber-50 text-amber-700 ring-amber-200",
};

type BookingDetailPageProps = {
  params: Promise<{
    code: string;
  }>;
};

export default async function BookingDetailPage({ params }: BookingDetailPageProps) {
  const { code } = await params;
  const booking = bookingDetails.find((item) => item.code === decodeURIComponent(code));

  if (!booking) {
    notFound();
  }

  return (
    <AppShell eyebrow="Operasional Booking" title={`Detail ${booking.code}`}>
      <section className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <aside className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
          <p className="text-xs font-bold uppercase text-brand-brown">Kode Booking</p>
          <h3 className="mt-2 text-2xl font-bold text-brand-cocoa">{booking.code}</h3>
          <span className={`mt-4 inline-flex rounded-full px-3 py-1 text-xs font-bold ring-1 ${statusStyles[booking.status]}`}>
            {booking.status}
          </span>

          <div className="mt-6 space-y-4 text-sm">
            <div>
              <p className="text-xs font-bold uppercase text-stone-400">Pelanggan</p>
              <p className="mt-1 font-semibold text-brand-cocoa">{booking.customer}</p>
              <p className="mt-1 text-stone-500">{booking.phone}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-stone-400">Paket</p>
              <p className="mt-1 font-semibold text-brand-cocoa">{booking.packageName}</p>
              <p className="mt-1 text-stone-500">Berangkat {booking.departure}</p>
            </div>
          </div>
        </aside>

        <div className="space-y-6">
          <section className="grid gap-4 md:grid-cols-3">
            {[
              ["Total Tagihan", booking.totalDisplay],
              ["Terbayar", booking.paidDisplay],
              ["Sisa", booking.remainingDisplay],
            ].map(([label, value]) => (
              <article key={label} className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
                <p className="text-sm font-semibold text-stone-500">{label}</p>
                <p className="mt-3 text-xl font-bold text-brand-cocoa">{value}</p>
              </article>
            ))}
          </section>

          <section className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
            <h3 className="text-lg font-bold text-brand-cocoa">Peserta</h3>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[700px] border-collapse text-left text-sm">
                <thead className="border-b border-stone-200 text-xs uppercase text-stone-500">
                  <tr>
                    <th className="py-3 pr-4 font-bold">Nama</th>
                    <th className="py-3 pr-4 font-bold">Paspor</th>
                    <th className="py-3 pr-4 font-bold">Kontak</th>
                    <th className="py-3 font-bold">Dokumen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {booking.participants.map((participant) => (
                    <tr key={participant.name}>
                      <td className="py-4 pr-4 font-bold text-brand-cocoa">{participant.name}</td>
                      <td className="py-4 pr-4">{participant.passport}</td>
                      <td className="py-4 pr-4">{participant.contact}</td>
                      <td className="py-4">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${statusStyles[participant.documentStatus]}`}>
                          {participant.documentStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
            <h3 className="text-lg font-bold text-brand-cocoa">Pembayaran</h3>
            <div className="mt-4 grid gap-3">
              {booking.payments.map((payment) => (
                <article key={payment.receipt} className="grid gap-3 rounded-lg border border-stone-200 bg-brand-cream p-4 sm:grid-cols-[1fr_auto] sm:items-center">
                  <div>
                    <p className="font-bold text-brand-cocoa">{payment.receipt}</p>
                    <p className="mt-1 text-sm text-stone-500">{payment.date} - {payment.account}</p>
                  </div>
                  <p className="text-sm font-bold text-brand-cocoa">{payment.amountDisplay}</p>
                </article>
              ))}
            </div>
          </section>
        </div>
      </section>
    </AppShell>
  );
}
