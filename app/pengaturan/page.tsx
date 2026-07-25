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
  { label: "Sub-pengaturan", value: "6", detail: "Menu master aktif", icon: Settings },
  { label: "Data aktif", value: "24", detail: "Layanan, rekening, staf", icon: BadgeCheck },
  { label: "Perlu dicek", value: "3", detail: "Status dan template dokumen", icon: FileCog },
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
    description: "Bank, kas kantor, dan kanal pembayaran yang muncul di form transaksi.",
    href: "/pengaturan/rekening",
    icon: CreditCard,
    count: "3 rekening",
    status: "Aktif",
  },
  {
    title: "Jenis Layanan",
    description: "Kategori layanan untuk paket, laporan pendapatan, dan segmentasi booking.",
    href: "/pengaturan/layanan",
    icon: Tags,
    count: "5 jenis",
    status: "Data dummy",
  },
  {
    title: "Status Booking",
    description: "Daftar status operasional untuk booking, pembayaran, dan follow-up.",
    href: "/pengaturan/status-booking",
    icon: ListChecks,
    count: "7 status",
    status: "Data dummy",
  },
  {
    title: "Staf Pengguna",
    description: "Admin operasional, sales, dan penanggung jawab dokumen.",
    href: "/pengaturan/staf",
    icon: UserCog,
    count: "4 staf",
    status: "Data dummy",
  },
  {
    title: "Hak Akses",
    description: "Ringkasan role untuk membatasi akses kas, laporan, dan pengaturan.",
    href: "/pengaturan/hak-akses",
    icon: ShieldCheck,
    count: "3 role",
    status: "Draft",
  },
];

const auditRows = [
  {
    module: "Identitas Perusahaan",
    owner: "Maya Safitri",
    updatedAt: "25 Jul 2026",
    status: "Siap",
  },
  {
    module: "Rekening Pembayaran",
    owner: "Admin Keuangan",
    updatedAt: "24 Jul 2026",
    status: "Aktif",
  },
  {
    module: "Jenis Layanan",
    owner: "Admin Operasional",
    updatedAt: "22 Jul 2026",
    status: "Perlu review",
  },
  {
    module: "Status Booking",
    owner: "Admin Operasional",
    updatedAt: "21 Jul 2026",
    status: "Draft",
  },
];

const statusStyles: Record<string, string> = {
  Aktif: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Siap: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  "Data dummy": "bg-amber-50 text-amber-700 ring-amber-200",
  Draft: "bg-stone-100 text-stone-600 ring-stone-200",
  "Perlu review": "bg-rose-50 text-rose-700 ring-rose-200",
};

export default function SettingsPage() {
  return (
    <AppShell eyebrow="Kontrol" title="Pengaturan Master">
      <section className="grid gap-4 md:grid-cols-3">
        {masterStats.map((item) => (
          <article key={item.label} className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-stone-500">{item.label}</p>
              <item.icon className="h-5 w-5 text-brand-brown" aria-hidden="true" />
            </div>
            <p className="mt-3 text-2xl font-bold text-brand-cocoa">{item.value}</p>
            <p className="mt-2 text-sm text-stone-500">{item.detail}</p>
          </article>
        ))}
      </section>

      <section className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-bold text-brand-cocoa">Navigasi Sub-pengaturan</h3>
            <p className="mt-1 text-sm text-stone-500">Pusat data master untuk operasional paket, booking, pembayaran, dan dokumen.</p>
          </div>
          <Link className="inline-flex h-10 w-fit items-center justify-center gap-2 rounded-md bg-brand-pink px-4 text-sm font-bold text-white" href="/pengaturan/identitas">
            <Building2 className="h-4 w-4" aria-hidden="true" />
            Identitas
          </Link>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {settingSections.map((section) => (
            <Link
              key={section.title}
              className="group grid gap-4 rounded-lg border border-stone-200 bg-white p-5 transition hover:border-brand-pink hover:bg-brand-cream"
              href={section.href}
            >
              <div className="flex items-start gap-4">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-brand-rose text-brand-pink">
                  <section.icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <h4 className="font-bold text-brand-cocoa">{section.title}</h4>
                    <span className={`w-fit rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${statusStyles[section.status]}`}>
                      {section.status}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-stone-600">{section.description}</p>
                </div>
                <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-brand-brown transition group-hover:translate-x-0.5 group-hover:text-brand-pink" aria-hidden="true" />
              </div>
              <div className="flex items-center justify-between border-t border-stone-100 pt-3 text-sm">
                <span className="font-semibold text-stone-500">Data tersedia</span>
                <span className="font-bold text-brand-cocoa">{section.count}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-brand-cocoa">Ringkasan Pembaruan</h3>
          <p className="mt-1 text-sm text-stone-500">Data dummy untuk melihat prioritas pengaturan yang perlu ditinjau.</p>
        </div>

        <div className="overflow-x-auto rounded-lg border border-stone-200">
          <table className="w-full min-w-[760px] border-collapse text-left text-sm">
            <thead className="bg-brand-cream text-xs uppercase text-stone-500">
              <tr>
                <th className="px-4 py-3 font-bold">Modul</th>
                <th className="px-4 py-3 font-bold">Penanggung Jawab</th>
                <th className="px-4 py-3 font-bold">Terakhir Update</th>
                <th className="px-4 py-3 font-bold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 bg-white">
              {auditRows.map((row) => (
                <tr key={row.module} className="text-stone-700 hover:bg-brand-cream">
                  <td className="px-4 py-4 font-bold text-brand-cocoa">{row.module}</td>
                  <td className="px-4 py-4">{row.owner}</td>
                  <td className="px-4 py-4">{row.updatedAt}</td>
                  <td className="px-4 py-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${statusStyles[row.status]}`}>
                      {row.status}
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
