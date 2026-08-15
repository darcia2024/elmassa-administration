import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, FileText, Layers, Mail, MapPin, Phone, Plane, QrCode, ShieldCheck, UserCheck } from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { findCustomer } from "@/lib/customers/store";
import { listBookingsByPhone } from "@/lib/bookings/store";
import { listParticipants } from "@/lib/participants/store";

type CustomerDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

// Read fresh on every visit — same reasoning as the list page: a jamaah's
// data can change from another device and this page must not serve a stale
// build-time snapshot.
export const dynamic = "force-dynamic";

const documentStatusStyles: Record<string, string> = {
  Lengkap: "border-emerald-200/60 bg-emerald-50/80 text-emerald-800",
  "Proses Visa": "border-amber-200/60 bg-amber-50/80 text-amber-800",
  "Belum Lengkap": "border-rose-200/60 bg-rose-50/80 text-rose-700",
};

const bookingStatusStyles: Record<string, string> = {
  Lunas: "border-emerald-200/60 bg-emerald-50/80 text-emerald-800",
  DP: "border-amber-200/60 bg-amber-50/80 text-amber-800",
  "Belum Bayar": "border-rose-200/60 bg-rose-50/80 text-rose-700",
};

function formatVisaExpiry(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(date.getTime())) return isoDate;
  return date.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}

export default async function CustomerDetailPage({ params }: CustomerDetailPageProps) {
  const { id } = await params;
  const customer = await findCustomer(id);

  if (!customer) {
    notFound();
  }

  const [bookings, phoneParticipants] = await Promise.all([
    listBookingsByPhone(customer.phone),
    listParticipants({ phone: customer.phone }),
  ]);

  const normalisedName = customer.name.trim().toLowerCase();
  const participantDoc =
    phoneParticipants.find((p) => p.name.trim().toLowerCase() === normalisedName) ?? null;

  return (
    <AppShell eyebrow="Database Pelanggan CRM" title={`Profil CRM ${customer.name}`}>
      <div className="space-y-5">
        
        {/* Top Header Card */}
        <section className="rounded-2xl border border-stone-200/70 bg-white p-5 sm:p-6 shadow-2xs">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand-pink text-white font-extrabold text-base shadow-xs">
                {customer.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-extrabold text-brand-cocoa tracking-tight">{customer.name}</h1>
                  <span className="rounded-full border border-emerald-200/60 bg-emerald-50/80 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800">
                    Jamaah Terdaftar
                  </span>
                </div>
                <p className="text-xs text-stone-500 mt-0.5">
                  {customer.groupName ?? "Belum tergabung di grup keberangkatan"} • {customer.city}
                </p>
              </div>
            </div>

            <Link
              href="/pelanggan"
              className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3.5 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition shrink-0"
            >
              <ArrowLeft className="h-3.5 w-3.5 text-stone-500" strokeWidth={1.5} />
              Kembali ke Daftar Pelanggan
            </Link>
          </div>
        </section>

        {/* 2 Columns Grid */}
        <section className="grid gap-5 xl:grid-cols-[360px_1fr]">
          
          {/* Customer CRM Profile Card */}
          <aside className="rounded-2xl border border-stone-200/70 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-stone-400">Informasi Kontak Jamaah</h3>

            <div className="space-y-3 text-xs">
              <div className="rounded-xl border border-stone-200/60 bg-stone-50/50 p-3 space-y-1">
                <span className="text-[10px] font-semibold text-stone-400 uppercase">Grup Rombongan</span>
                <p className="font-bold text-brand-pink flex items-center gap-1">
                  <Layers className="h-3.5 w-3.5" strokeWidth={1.5} />
                  {customer.groupName ?? "Belum tergabung di grup keberangkatan"}
                </p>
              </div>

              <div className="rounded-xl border border-stone-200/60 bg-stone-50/50 p-3 space-y-1">
                <span className="text-[10px] font-semibold text-stone-400 uppercase">No. WhatsApp</span>
                <p className="font-mono font-bold text-emerald-700 flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5" strokeWidth={1.5} />
                  {customer.phone}
                </p>
              </div>

              <div className="rounded-xl border border-stone-200/60 bg-stone-50/50 p-3 space-y-1">
                <span className="text-[10px] font-semibold text-stone-400 uppercase">Email</span>
                <p className="font-medium text-stone-800 flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5 text-stone-400" strokeWidth={1.5} />
                  {customer.email || "jamaah.babel@elmassa.test"}
                </p>
              </div>

              <div className="rounded-xl border border-stone-200/60 bg-stone-50/50 p-3 space-y-1">
                <span className="text-[10px] font-semibold text-stone-400 uppercase">Alamat Domisili</span>
                <p className="font-medium text-stone-800 flex items-start gap-1">
                  <MapPin className="h-3.5 w-3.5 text-brand-pink shrink-0 mt-0.5" strokeWidth={1.5} />
                  {customer.address}
                </p>
              </div>
            </div>
          </aside>

          {/* Booking History & Digital Passport/Visa Inspection */}
          <main className="space-y-5">
            
            {/* Digital Immigration Card */}
            <article className="rounded-2xl border border-stone-200/70 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <h3 className="text-base font-bold text-brand-cocoa">Dokumen Imigrasi Digital Jamaah</h3>
                {participantDoc ? (
                  <span
                    className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${
                      documentStatusStyles[participantDoc.documentStatus] ?? "border-stone-200 bg-stone-50 text-stone-600"
                    }`}
                  >
                    <CheckCircle2 className="h-3 w-3" strokeWidth={1.5} />
                    {participantDoc.documentStatus}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full border border-stone-200 bg-stone-50 px-2.5 py-0.5 text-[11px] font-semibold text-stone-500">
                    Belum Ada Data
                  </span>
                )}
              </div>

              {participantDoc ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-emerald-200/70 bg-emerald-50/30 p-3.5 space-y-2">
                    <div className="flex items-center justify-between border-b border-emerald-200/50 pb-1.5">
                      <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1">
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-700" strokeWidth={1.5} /> Paspor RI
                      </span>
                    </div>
                    <div className="text-xs space-y-1">
                      <p className="text-[10px] text-stone-400 uppercase font-semibold">Nomor Paspor RI</p>
                      <p className="font-mono font-bold text-stone-900 text-sm">{participantDoc.passportNumber || "-"}</p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-sky-200/70 bg-sky-50/30 p-3.5 space-y-2">
                    <div className="flex items-center justify-between border-b border-sky-200/50 pb-1.5">
                      <span className="text-xs font-bold text-sky-900 uppercase tracking-wider flex items-center gap-1">
                        <QrCode className="h-3.5 w-3.5 text-sky-700" strokeWidth={1.5} /> E-Visa Umrah KSA
                      </span>
                    </div>
                    <div className="text-xs space-y-1">
                      <p className="text-[10px] text-stone-400 uppercase font-semibold">Nomor E-Visa</p>
                      <p className="font-mono font-bold text-sky-900 text-sm">{participantDoc.visaNumber || "-"}</p>
                      <p className="text-[11px] text-stone-500">
                        {participantDoc.visaExpiry
                          ? `Masa Berlaku s.d. ${formatVisaExpiry(participantDoc.visaExpiry)}`
                          : "Masa berlaku belum diisi"}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="rounded-xl border border-stone-200/60 bg-stone-50/50 p-4 text-center text-xs text-stone-400">
                  Belum ada data paspor/visa yang tercatat untuk jamaah ini di Manifest.
                </p>
              )}
            </article>

            {/* Booking History Table */}
            <article className="rounded-2xl border border-stone-200/70 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
              <h3 className="text-base font-bold text-brand-cocoa">Riwayat Booking & Transaksi</h3>

              <div className="overflow-x-auto rounded-xl border border-stone-200/60">
                <table className="w-full min-w-[640px] border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b border-stone-200/60 bg-stone-50/70 font-semibold text-stone-500 text-[11px] uppercase tracking-wider">
                      <th className="py-2.5 pl-3 pr-2">Kode Booking</th>
                      <th className="py-2.5 pr-2">Paket Wisata</th>
                      <th className="py-2.5 pr-2">Keberangkatan</th>
                      <th className="py-2.5 pr-2">Total Harga</th>
                      <th className="py-2.5 pr-3 text-right">Status Bayar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 font-normal">
                    {bookings.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-stone-400">
                          Belum ada riwayat booking untuk pelanggan ini.
                        </td>
                      </tr>
                    )}
                    {bookings.map((b) => (
                      <tr key={b.code} className="transition hover:bg-stone-50/60">
                        <td className="py-3 pl-3 pr-2 font-mono font-bold text-brand-cocoa">{b.code}</td>
                        <td className="py-3 pr-2 font-semibold text-brand-cocoa">{b.packageName}</td>
                        <td className="py-3 pr-2 text-stone-500">{b.departure || "-"}</td>
                        <td className="py-3 pr-2 font-bold text-brand-pink">Rp {Number(b.totalAmount).toLocaleString("id-ID")}</td>
                        <td className="py-3 pr-3 text-right">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${
                              bookingStatusStyles[b.status] ?? "border-stone-200 bg-stone-50 text-stone-600"
                            }`}
                          >
                            {b.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>

          </main>
        </section>

      </div>
    </AppShell>
  );
}
