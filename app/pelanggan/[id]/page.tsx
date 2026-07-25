import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";

const customerDetails = [
  {
    id: "cust-001",
    name: "Siti Rahma",
    phone: "0812-4455-7788",
    email: "siti.rahma@email.com",
    type: "Individu",
    status: "Aktif",
    city: "Bekasi",
    address: "Jl. Kemang Pratama No. 12, Bekasi",
    bookings: [
      {
        code: "BK-2407-018",
        packageName: "Umrah Reguler 12 Hari",
        departure: "12 Agu 2026",
        status: "DP",
        totalDisplay: "Rp 32.500.000",
        remainingDisplay: "Rp 20.000.000",
      },
      {
        code: "BK-2311-041",
        packageName: "Umrah Plus Thaif",
        departure: "18 Nov 2025",
        status: "Lunas",
        totalDisplay: "Rp 36.000.000",
        remainingDisplay: "Rp 0",
      },
    ],
    payments: [
      { receipt: "KW-2407-044", date: "25 Jul 2026", amountDisplay: "Rp 7.500.000", method: "BCA El Massa" },
      { receipt: "KW-2407-011", date: "10 Jul 2026", amountDisplay: "Rp 5.000.000", method: "Mandiri El Massa" },
      { receipt: "KW-2311-082", date: "28 Nov 2025", amountDisplay: "Rp 36.000.000", method: "Tunai" },
    ],
  },
];

const statusStyles: Record<string, string> = {
  Aktif: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  "Follow-up": "bg-amber-50 text-amber-700 ring-amber-200",
  Prospek: "bg-brand-rose text-brand-cocoa ring-brand-pink/30",
  Nonaktif: "bg-stone-100 text-stone-700 ring-stone-200",
  DP: "bg-amber-50 text-amber-700 ring-amber-200",
  Lunas: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  "Belum Bayar": "bg-rose-50 text-rose-700 ring-rose-200",
};

type CustomerDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function CustomerDetailPage({ params }: CustomerDetailPageProps) {
  const { id } = await params;
  const customer = customerDetails.find((item) => item.id === id);

  if (!customer) {
    notFound();
  }

  return (
    <AppShell eyebrow="Data Pelanggan" title={`Detail ${customer.name}`}>
      <section className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <aside className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
          <div className="grid h-14 w-14 place-items-center rounded-lg bg-brand-rose text-lg font-black text-brand-pink">
            {customer.name
              .split(" ")
              .slice(0, 2)
              .map((part) => part[0])
              .join("")}
          </div>
          <h3 className="mt-4 text-xl font-bold text-brand-cocoa">{customer.name}</h3>
          <p className="mt-1 text-sm text-stone-500">{customer.type} - {customer.city}</p>
          <span className={`mt-4 inline-flex rounded-full px-3 py-1 text-xs font-bold ring-1 ${statusStyles[customer.status]}`}>
            {customer.status}
          </span>

          <div className="mt-6 space-y-4 text-sm">
            <div>
              <p className="text-xs font-bold uppercase text-stone-400">Telepon</p>
              <p className="mt-1 font-semibold text-brand-cocoa">{customer.phone}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-stone-400">Email</p>
              <p className="mt-1 font-semibold text-brand-cocoa">{customer.email}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-stone-400">Alamat</p>
              <p className="mt-1 leading-6 text-stone-600">{customer.address}</p>
            </div>
          </div>
        </aside>

        <div className="space-y-6">
          <section className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
            <h3 className="text-lg font-bold text-brand-cocoa">Riwayat Booking</h3>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse text-left text-sm">
                <thead className="border-b border-stone-200 text-xs uppercase text-stone-500">
                  <tr>
                    <th className="py-3 pr-4 font-bold">Kode</th>
                    <th className="py-3 pr-4 font-bold">Paket</th>
                    <th className="py-3 pr-4 font-bold">Berangkat</th>
                    <th className="py-3 pr-4 font-bold">Total</th>
                    <th className="py-3 pr-4 font-bold">Sisa</th>
                    <th className="py-3 font-bold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {customer.bookings.map((booking) => (
                    <tr key={booking.code}>
                      <td className="py-4 pr-4 font-bold text-brand-cocoa">{booking.code}</td>
                      <td className="py-4 pr-4">{booking.packageName}</td>
                      <td className="py-4 pr-4">{booking.departure}</td>
                      <td className="py-4 pr-4 font-semibold">{booking.totalDisplay}</td>
                      <td className="py-4 pr-4">{booking.remainingDisplay}</td>
                      <td className="py-4">
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

          <section className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
            <h3 className="text-lg font-bold text-brand-cocoa">Riwayat Pembayaran</h3>
            <div className="mt-4 grid gap-3">
              {customer.payments.map((payment) => (
                <article key={payment.receipt} className="grid gap-3 rounded-lg border border-stone-200 bg-brand-cream p-4 sm:grid-cols-[1fr_auto] sm:items-center">
                  <div>
                    <p className="font-bold text-brand-cocoa">{payment.receipt}</p>
                    <p className="mt-1 text-sm text-stone-500">{payment.date} - {payment.method}</p>
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
