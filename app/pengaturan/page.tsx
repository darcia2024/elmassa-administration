import {
  BadgeCheck,
  Building2,
  ChevronRight,
  CreditCard,
  FileCog,
  ListChecks,
  Settings,
  ShieldCheck,
  Tags,
  UserCog,
} from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";

const masterStats = [
  { label: "Sub-pengaturan", value: "6 Menu", detail: "Menu master aktif", icon: Settings },
  { label: "Data Master Aktif", value: "24 Item", detail: "Layanan, rekening, staf", icon: BadgeCheck },
  { label: "Status Template", value: "Tersimpan", detail: "Profil kop dokumen resmi", icon: FileCog },
];

const settingSections = [
  {
    title: "Identitas Perusahaan",
    description: "Logo, alamat, kontak, dan footer dokumen El Massa.",
    href: "/pengaturan/identitas",
    icon: Building2,
    count: "1 profil",
    status: "Siap",
  },
  {
    title: "Rekening Pembayaran",
    description: "Bank, kas kantor, dan kanal pembayaran transaksi.",
    href: "/pengaturan/rekening",
    icon: CreditCard,
    count: "3 rekening",
    status: "Aktif",
  },
  {
    title: "Jenis Layanan",
    description: "Kategori layanan untuk paket dan laporan pendapatan.",
    href: "/pengaturan/layanan",
    icon: Tags,
    count: "5 jenis",
    status: "Aktif",
  },
  {
    title: "Status Booking",
    description: "Daftar status operasional booking & pembayaran.",
    href: "/pengaturan/status-booking",
    icon: ListChecks,
    count: "7 status",
    status: "Aktif",
  },
  {
    title: "Staf Pengguna",
    description: "Admin operasional, sales, dan penanggung jawab.",
    href: "/pengaturan/staf",
    icon: UserCog,
    count: "4 staf",
    status: "Aktif",
  },
  {
    title: "Hak Akses",
    description: "Ringkasan role untuk membatasi akses kas & laporan.",
    href: "/pengaturan/hak-akses",
    icon: ShieldCheck,
    count: "5 role",
    status: "Aktif",
  },
];

export default function SettingsPage() {
  return (
    <AppShell eyebrow="Pengaturan Master" title="Pengaturan Sistem">
      <div className="space-y-5">
        {/* Metric Cards Row */}
        <section className="grid gap-4 md:grid-cols-3">
          {masterStats.map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.label} className="rounded-2xl border border-stone-200/70 bg-white p-5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-stone-500">{item.label}</p>
                  <Icon className="h-4 w-4 text-brand-pink" strokeWidth={1.5} />
                </div>
                <p className="mt-1 text-2xl font-bold text-brand-cocoa">{item.value}</p>
                <p className="mt-1 text-[11px] text-stone-400">{item.detail}</p>
              </article>
            );
          })}
        </section>

        {/* Settings Navigation Cards Grid */}
        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {settingSections.map((section) => {
            const Icon = section.icon;
            return (
              <Link
                key={section.title}
                href={section.href}
                className="group rounded-2xl border border-stone-200/70 bg-white p-5 shadow-2xs transition hover:border-brand-pink/50 hover:shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-rose-50 text-brand-pink border border-brand-pink/20 transition group-hover:bg-brand-pink group-hover:text-white">
                      <Icon className="h-4.5 w-4.5" strokeWidth={1.5} />
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full border border-stone-200 bg-stone-50 px-2.5 py-0.5 text-[11px] font-semibold text-stone-600">
                      {section.count}
                    </span>
                  </div>

                  <div className="mt-3.5 space-y-1">
                    <h3 className="text-sm font-bold text-brand-cocoa group-hover:text-brand-pink transition">
                      {section.title}
                    </h3>
                    <p className="text-xs text-stone-500 leading-relaxed">{section.description}</p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-stone-100 pt-3 text-[11px] font-semibold text-stone-400 group-hover:text-brand-pink">
                  <span>Buka Pengaturan</span>
                  <ChevronRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" strokeWidth={1.5} />
                </div>
              </Link>
            );
          })}
        </section>
      </div>
    </AppShell>
  );
}
