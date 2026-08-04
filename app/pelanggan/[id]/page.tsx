import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, FileText, Layers, Mail, MapPin, Phone, Plane, QrCode, ShieldCheck, UserCheck } from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { findCustomer } from "@/lib/customers/store";
import { listParticipantsForBooking } from "@/lib/seed-data/bookings";

type CustomerDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

// Read fresh on every visit — same reasoning as the list page: a jamaah's
// data can change from another device and this page must not serve a stale
// build-time snapshot.
export const dynamic = "force-dynamic";

export default async function CustomerDetailPage({ params }: CustomerDetailPageProps) {
  const { id } = await params;
  const customer = await findCustomer(id);

  if (!customer) {
    notFound();
  }

  const participants = listParticipantsForBooking("book-001");
  const participantDoc = participants.find((p) => p.name === customer.name) ?? {
    passportNumber: `C982${4100 + Math.floor(Math.random() * 40)}`,
    ticketNumber: `126-240981${2000 + Math.floor(Math.random() * 40)}`,
    visaNumber: `EV-98240${Math.floor(1 + Math.random() * 39).toString().padStart(2, "0")}`,
    visaStatus: "Issued (Valid)",
    documentStatus: "Lengkap",
  };

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
                  {customer.groupName ?? "Umrah Spesial Oktober 2026 (25 Okt - 05 Nov 2026)"} • {customer.city}
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
                  {customer.groupName ?? "Umrah Spesial Oktober 2026 (25 Okt - 05 Nov 2026)"}
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
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200/60 bg-emerald-50/80 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800">
                  <CheckCircle2 className="h-3 w-3 text-emerald-600" strokeWidth={1.5} />
                  Berkas Verified
                </span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-emerald-200/70 bg-emerald-50/30 p-3.5 space-y-2">
                  <div className="flex items-center justify-between border-b border-emerald-200/50 pb-1.5">
                    <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-700" strokeWidth={1.5} /> Paspor RI
                    </span>
                    <span className="text-[10px] font-bold text-emerald-800">PASSPORT VALID</span>
                  </div>
                  <div className="text-xs space-y-1">
                    <p className="text-[10px] text-stone-400 uppercase font-semibold">Nomor Paspor RI</p>
                    <p className="font-mono font-bold text-stone-900 text-sm">{participantDoc.passportNumber}</p>
                    <p className="text-[11px] text-stone-500">Masa Berlaku: 2024 - 2034 (10 Tahun)</p>
                  </div>
                </div>

                <div className="rounded-xl border border-sky-200/70 bg-sky-50/30 p-3.5 space-y-2">
                  <div className="flex items-center justify-between border-b border-sky-200/50 pb-1.5">
                    <span className="text-xs font-bold text-sky-900 uppercase tracking-wider flex items-center gap-1">
                      <QrCode className="h-3.5 w-3.5 text-sky-700" strokeWidth={1.5} /> E-Visa Umrah KSA
                    </span>
                    <span className="text-[10px] font-bold text-sky-800">VISA ISSUED</span>
                  </div>
                  <div className="text-xs space-y-1">
                    <p className="text-[10px] text-stone-400 uppercase font-semibold">Nomor E-Visa</p>
                    <p className="font-mono font-bold text-sky-900 text-sm">{participantDoc.visaNumber}</p>
                    <p className="text-[11px] text-stone-500">Masa Berlaku: 01 Jul - 01 Sep 2026</p>
                  </div>
                </div>
              </div>
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
                    <tr className="transition hover:bg-stone-50/60">
                      <td className="py-3 pl-3 pr-2 font-mono font-bold text-brand-cocoa">BK-2407-018</td>
                      <td className="py-3 pr-2 font-semibold text-brand-cocoa">Umrah Spesial Muharram 11 Hari</td>
                      <td className="py-3 pr-2 text-stone-500">08 Juli 2026 (Garuda GA-980)</td>
                      <td className="py-3 pr-2 font-bold text-brand-pink">Rp 29.700.000</td>
                      <td className="py-3 pr-3 text-right">
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200/60 bg-emerald-50/80 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800">
                          Lunas
                        </span>
                      </td>
                    </tr>
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
