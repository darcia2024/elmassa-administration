"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Banknote,
  Building2,
  Calculator,
  Calendar as CalendarIcon,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  ClipboardList,
  Clock,
  Download,
  FileCheck,
  FileText,
  Filter,
  Layers,
  MapPin,
  Plane,
  Plus,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Star,
  TrendingUp,
  UserCheck,
  Users,
  Wallet,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { formatRupiah, getDashboardStats } from "@/lib/seed-data/derived";

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, { bg: string; border: string; dot: string }> = {
    Lunas: {
      bg: "bg-emerald-50/80 text-emerald-700",
      border: "border-emerald-200/60",
      dot: "bg-emerald-500",
    },
    DP: {
      bg: "bg-amber-50/80 text-amber-800",
      border: "border-amber-200/60",
      dot: "bg-amber-500",
    },
    "Belum Bayar": {
      bg: "bg-rose-50/80 text-rose-700",
      border: "border-rose-200/60",
      dot: "bg-rose-500",
    },
  };

  const style = styles[status] ?? {
    bg: "bg-stone-50 text-stone-600",
    border: "border-stone-200",
    dot: "bg-stone-400",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${style.bg} ${style.border}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
      {status}
    </span>
  );
}

export default function DashboardPage() {
  const dashboard = getDashboardStats();
  const [activeFilter, setActiveFilter] = useState<string>("Semua");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredBookings = useMemo(() => {
    return dashboard.recentBookings.filter((booking) => {
      const matchesFilter = activeFilter === "Semua" || booking.status === activeFilter;
      const matchesSearch =
        booking.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.packageName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [dashboard.recentBookings, activeFilter, searchQuery]);

  const maxRevenue = Math.max(...dashboard.weeklyRevenue.map((item) => item.amount), 1);
  const revenueBars = [
    { day: "Su", amount: 12000000, height: 40 },
    { day: "Mo", amount: 28000000, height: 65 },
    { day: "Tu", amount: 35000000, height: 75 },
    { day: "We", amount: 18000000, height: 45 },
    { day: "Th", amount: 48000000, height: 95, active: true },
    { day: "Fr", amount: 22000000, height: 50 },
    { day: "Sa", amount: 31000000, height: 70 },
  ];

  const metricsConfig = [
    {
      key: "bookings",
      title: "Total Booking",
      value: dashboard.metrics.find((m) => m.key === "bookings")?.displayValue ?? "0",
      subtext: `${dashboard.recentBookings.filter((b) => b.status !== "Lunas").length} perlu tindak lanjut`,
      trend: "+12.4%",
      icon: ClipboardList,
      iconColor: "text-brand-pink",
      iconBg: "bg-rose-50/80 border-brand-pink/20",
      solidBar: "bg-brand-pink",
      progress: 78,
    },
    {
      key: "customers",
      title: "Jamaah Terdaftar",
      value: dashboard.metrics.find((m) => m.key === "customers")?.displayValue ?? "0",
      subtext: "85% paspor terverifikasi",
      trend: "+8.1%",
      icon: Users,
      iconColor: "text-brand-brown",
      iconBg: "bg-amber-50/80 border-amber-200/60",
      solidBar: "bg-brand-brown",
      progress: 85,
    },
    {
      key: "packages",
      title: "Paket Wisata",
      value: dashboard.metrics.find((m) => m.key === "packages")?.displayValue ?? "0",
      subtext: "Katalog Umrah & Tour aktif",
      trend: "Aktif",
      icon: Plane,
      iconColor: "text-stone-700",
      iconBg: "bg-stone-100/80 border-stone-200/60",
      solidBar: "bg-brand-cocoa",
      progress: 92,
    },
    {
      key: "revenue",
      title: "Est. Total Revenue",
      value: dashboard.metrics.find((m) => m.key === "revenue")?.displayValue ?? "Rp 0",
      subtext: "Total pembayaran lunas & DP",
      trend: "+15.2%",
      icon: Banknote,
      iconColor: "text-emerald-700",
      iconBg: "bg-emerald-50/80 border-emerald-200/60",
      solidBar: "bg-emerald-600",
      progress: 68,
    },
  ];

  return (
    <AppShell>
      <div className="space-y-5 font-sans">
        
        {/* 🌟 SLEEK LIGHT HERO BANNER */}
        <section className="rounded-2xl border border-stone-200/70 bg-white p-5 shadow-2xs">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-brand-cocoa sm:text-2xl">
                Ringkasan Penjualan & Operasional Jamaah
              </h1>
              <p className="text-xs font-normal text-stone-500 mt-1">
                Pantau jadwal keberangkatan, status pelunasan booking, dan kelengkapan dokumen paspor secara terpusat.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Link
                href="/booking/form"
                className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-brand-pink px-4 text-xs font-semibold text-white shadow-2xs hover:bg-brand-pinkHover transition"
              >
                <Plus className="h-3.5 w-3.5" strokeWidth={1.5} />
                Tambah Booking
              </Link>
              <Link
                href="/manifest"
                className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-stone-200 bg-stone-50 px-3.5 text-xs font-semibold text-stone-700 hover:bg-stone-100 transition"
              >
                <Download className="h-3.5 w-3.5 text-stone-500" strokeWidth={1.5} />
                Manifest
              </Link>
            </div>
          </div>
        </section>

        {/* 📊 KPI METRIC CARDS (UNIFORM HEIGHT & PERFECT ALIGNMENT) */}
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metricsConfig.map((stat) => {
            const Icon = stat.icon;
            return (
              <article
                key={stat.key}
                className="rounded-2xl border border-stone-200/70 bg-white p-5 shadow-2xs flex flex-col justify-between h-full transition hover:border-stone-300"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className={`grid h-9 w-9 place-items-center rounded-xl border ${stat.iconBg} ${stat.iconColor}`}>
                      <Icon className="h-4.5 w-4.5" strokeWidth={1.5} />
                    </span>

                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50/80 px-2.5 py-0.5 rounded-md border border-emerald-200/60">
                      <TrendingUp className="h-3 w-3" strokeWidth={1.5} />
                      {stat.trend}
                    </span>
                  </div>

                  <div className="mt-4 space-y-1">
                    <p className="text-xs font-semibold text-stone-500">{stat.title}</p>
                    <p className="text-2xl font-bold tracking-tight text-brand-cocoa">{stat.value}</p>
                    <p className="text-[11px] text-stone-400 font-normal">{stat.subtext}</p>
                  </div>
                </div>

                {/* Clean Progress Bar inside padded section */}
                <div className="mt-5 pt-3 border-t border-stone-100">
                  <div className="flex items-center justify-between text-[10px] font-semibold text-stone-400 mb-1.5">
                    <span>Progres Operasional</span>
                    <span className="font-bold text-stone-700">{stat.progress}%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-stone-100">
                    <div
                      className={`h-full rounded-full ${stat.solidBar} transition-all duration-500`}
                      style={{ width: `${stat.progress}%` }}
                    />
                  </div>
                </div>
              </article>
            );
          })}
        </section>

        {/* 🗂️ MAIN CONTENT GRID (2 COLUMNS: TABLE & SIDEBAR) */}
        <section className="grid gap-5 xl:grid-cols-[1fr_320px]">
          
          {/* LEFT COLUMN: KATALOG & BOOKING TABLE */}
          <div className="space-y-5">
            
            {/* Catalog Cards Row */}
            <article className="rounded-2xl border border-stone-200/70 bg-white p-5 shadow-2xs">
              <div className="mb-3.5 flex items-center justify-between">
                <h3 className="text-sm font-bold text-brand-cocoa">Katalog Paket Wisata Populer</h3>
                <Link href="/paket" className="text-xs font-semibold text-brand-pink hover:underline">
                  Lihat Semua
                </Link>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-stone-200/60 bg-stone-50/50 p-3 flex flex-col justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-rose-50 text-brand-pink border border-brand-pink/20">
                      <Plane className="h-4 w-4" strokeWidth={1.5} />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold text-brand-cocoa">Umrah 12 Hari Garuda</p>
                      <p className="text-[10px] text-stone-500">12 Hari • Garuda Indonesia</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-stone-200/50 pt-2 text-[10px]">
                    <span className="font-semibold text-amber-600">★ 4.8</span>
                    <span className="rounded-md bg-rose-50 px-2 py-0.5 font-medium text-brand-pink">Wisata Halal</span>
                  </div>
                </div>

                <div className="rounded-xl border border-stone-200/60 bg-stone-50/50 p-3 flex flex-col justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-amber-50 text-amber-800 border border-amber-200/60">
                      <Sparkles className="h-4 w-4" strokeWidth={1.5} />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold text-brand-cocoa">Umrah VIP Executive</p>
                      <p className="text-[10px] text-stone-500">9 Hari Perjalanan</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-stone-200/50 pt-2 text-[10px]">
                    <span className="font-semibold text-amber-600">★ 5.0</span>
                    <span className="rounded-md bg-amber-50 px-2 py-0.5 font-medium text-amber-800">Bintang 5</span>
                  </div>
                </div>

                <div className="rounded-xl border border-stone-200/60 bg-stone-50/50 p-3 flex flex-col justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-purple-50 text-purple-700 border border-purple-200/60">
                      <ShieldCheck className="h-4 w-4" strokeWidth={1.5} />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold text-brand-cocoa">Umrah Ramadan 1448H</p>
                      <p className="text-[10px] text-stone-500">25 Hari Perjalanan</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-stone-200/50 pt-2 text-[10px]">
                    <span className="font-semibold text-amber-600">★ 4.9</span>
                    <span className="rounded-md bg-purple-50 px-2 py-0.5 font-medium text-purple-800">Quota Terbatas</span>
                  </div>
                </div>
              </div>
            </article>

            {/* Table "Booking Terbaru" */}
            <article className="rounded-2xl border border-stone-200/70 bg-white p-5 shadow-2xs">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-sm font-bold text-brand-cocoa">Booking Terbaru</h3>
                  <p className="text-xs text-stone-500">Daftar transaksi pemesanan jamaah El Massa</p>
                </div>

                {/* Filter Pills Capsule */}
                <div className="flex items-center gap-1 bg-stone-100/80 p-1 rounded-xl border border-stone-200/50">
                  {["Semua", "Lunas", "DP", "Belum Bayar"].map((filter) => (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => setActiveFilter(filter)}
                      className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ${
                        activeFilter === filter
                          ? "bg-white text-brand-pink shadow-2xs"
                          : "text-stone-600 hover:text-stone-900"
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>

              {/* 📱 NATIVE MOBILE CARD LIST (Hidden on Desktop) */}
              <div className="space-y-3 block md:hidden">
                {filteredBookings.length === 0 ? (
                  <div className="py-6 text-center text-stone-400 text-xs rounded-xl border border-stone-200/60 bg-stone-50/50">
                    Tidak ada data booking yang sesuai.
                  </div>
                ) : (
                  filteredBookings.map((booking) => {
                    const initials = booking.customer
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase();

                    return (
                      <div
                        key={booking.code}
                        className="rounded-xl border border-stone-200/80 bg-white p-3.5 shadow-2xs space-y-3 active:bg-stone-50 transition"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-rose-50 text-brand-pink font-extrabold text-xs border border-brand-pink/20">
                              {initials}
                            </div>
                            <div>
                              <h4 className="font-bold text-xs text-brand-cocoa">{booking.customer}</h4>
                              <p className="font-mono text-[10px] text-stone-400">{booking.code}</p>
                            </div>
                          </div>
                          <StatusBadge status={booking.status} />
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[11px] bg-stone-50/70 p-2.5 rounded-lg border border-stone-100">
                          <div>
                            <span className="text-[10px] text-stone-400 font-medium block">Paket Wisata</span>
                            <span className="font-semibold text-stone-800 truncate block">{booking.packageName}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-stone-400 font-medium block">Terbayar</span>
                            <span className="font-bold text-brand-cocoa block">{booking.paidDisplay}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[10px] font-medium text-stone-500">🛫 {booking.departureLabel}</span>
                          <Link
                            href={`/booking/${booking.code}`}
                            className="inline-flex items-center gap-1 h-7 px-3 rounded-lg bg-stone-900 text-white font-bold text-[11px] hover:bg-stone-800 transition"
                          >
                            Detail
                            <ArrowUpRight className="h-3 w-3" strokeWidth={2} />
                          </Link>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* 🖥️ DESKTOP DATA TABLE (Hidden on Mobile) */}
              <div className="hidden md:block overflow-x-auto rounded-xl border border-stone-200/60">
                <table className="w-full min-w-[640px] border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b border-stone-200/60 bg-stone-50/70 font-semibold text-stone-500 text-[11px] uppercase tracking-wider">
                      <th className="py-2.5 pl-3 pr-2">Kode & Jamaah</th>
                      <th className="py-2.5 pr-2">Paket Wisata</th>
                      <th className="py-2.5 pr-2">Tgl Berangkat</th>
                      <th className="py-2.5 pr-2">Status</th>
                      <th className="py-2.5 pr-2">Pembayaran</th>
                      <th className="py-2.5 pr-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 font-normal">
                    {filteredBookings.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-6 text-center text-stone-400">
                          Tidak ada data booking yang sesuai.
                        </td>
                      </tr>
                    ) : (
                      filteredBookings.map((booking) => {
                        const initials = booking.customer
                          .split(" ")
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join("")
                          .toUpperCase();

                        return (
                          <tr key={booking.code} className="transition hover:bg-stone-50/60">
                            <td className="py-3 pl-3 pr-2">
                              <div className="flex items-center gap-2.5">
                                <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-rose-50 text-brand-pink font-bold text-[11px] border border-brand-pink/20">
                                  {initials}
                                </div>
                                <div>
                                  <p className="font-semibold text-brand-cocoa">{booking.customer}</p>
                                  <p className="font-mono text-[10px] text-stone-400">{booking.code}</p>
                                </div>
                              </div>
                            </td>

                            <td className="py-3 pr-2 font-medium text-stone-700">
                              <span className="truncate max-w-[160px] inline-block">{booking.packageName}</span>
                            </td>

                            <td className="py-3 pr-2 text-stone-500">
                              {booking.departureLabel}
                            </td>

                            <td className="py-3 pr-2">
                              <StatusBadge status={booking.status} />
                            </td>

                            <td className="py-3 pr-2 font-semibold text-brand-cocoa">
                              {booking.paidDisplay}
                            </td>

                            <td className="py-3 pr-3 text-right">
                              <Link
                                href={`/booking/${booking.code}`}
                                className="inline-flex items-center gap-1 h-7 px-2.5 rounded-lg border border-stone-200 bg-white font-medium text-[11px] text-stone-700 hover:border-brand-pink hover:text-brand-pink transition"
                              >
                                Detail
                                <ArrowUpRight className="h-3 w-3" strokeWidth={1.5} />
                              </Link>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </article>

          </div>

          {/* RIGHT COLUMN: SIDEBAR WIDGETS (SLIM CHART, CALENDAR & DOCUMENT VERIFICATION) */}
          <aside className="space-y-5">
            
            {/* Slim Chart Card */}
            <article className="rounded-2xl border border-stone-200/70 bg-white p-5 sm:p-6 shadow-2xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold text-brand-cocoa uppercase tracking-wider">Pemasukan Mingguan</h3>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                  +18%
                </span>
              </div>

              <div className="flex h-36 items-end gap-2 pt-6 px-1">
                {revenueBars.map((item) => (
                  <div key={item.day} className="relative flex flex-1 flex-col items-center gap-1.5 h-full justify-end group">
                    {item.active && (
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 z-10 rounded-md bg-brand-cocoa px-2 py-0.5 text-[9px] font-semibold text-white shadow-xs whitespace-nowrap">
                        Rp 48M
                      </div>
                    )}
                    <div
                      className={`w-2.5 rounded-full transition-all ${
                        item.active ? "bg-brand-pink" : "bg-stone-200 group-hover:bg-stone-300"
                      }`}
                      style={{ height: `${item.height}%` }}
                    />
                    <span className="text-[10px] font-medium text-stone-400">{item.day}</span>
                  </div>
                ))}
              </div>
            </article>

            {/* Flat Light Calendar Widget */}
            <article className="rounded-2xl border border-stone-200/70 bg-white p-5 sm:p-6 shadow-2xs">
              <div className="mb-4 flex items-center justify-between">
                <button type="button" className="grid h-6 w-6 place-items-center rounded-md text-stone-400 hover:bg-stone-100">
                  <ChevronLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
                </button>
                <p className="text-xs font-bold text-brand-cocoa">Juli, 2026</p>
                <button type="button" className="grid h-6 w-6 place-items-center rounded-md text-stone-400 hover:bg-stone-100">
                  <ChevronRight className="h-3.5 w-3.5" strokeWidth={1.5} />
                </button>
              </div>

              <div className="grid grid-cols-7 text-center text-[10px] font-medium text-stone-400 mb-2">
                <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
              </div>
              <div className="grid grid-cols-7 text-center text-[11px] font-normal gap-y-1.5 text-stone-700">
                <span className="text-stone-300">29</span><span className="text-stone-300">30</span>
                <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
                <span>6</span><span>7</span><span>8</span>
                <span className="grid h-5 w-5 mx-auto place-items-center rounded-full bg-brand-pink text-white font-bold text-[10px]">9</span>
                <span>10</span><span>11</span><span>12</span>
                <span>13</span><span>14</span><span>15</span><span>16</span><span>17</span><span>18</span><span>19</span>
                <span>20</span><span>21</span><span>22</span><span>23</span><span>24</span><span>25</span>
                <span>26</span><span>27</span><span>28</span><span>29</span><span>30</span><span>31</span>
              </div>
            </article>

            {/* Document Status Widget */}
            <article className="rounded-2xl border border-stone-200/70 bg-white p-5 sm:p-6 shadow-2xs">
              <h4 className="text-xs font-bold text-brand-cocoa uppercase tracking-wider mb-4">
                Verifikasi Dokumen
              </h4>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between rounded-xl border border-stone-100 bg-stone-50/50 p-2.5">
                  <div className="flex items-center gap-2">
                    <FileCheck className="h-3.5 w-3.5 text-purple-600" strokeWidth={1.5} />
                    <span className="font-medium text-stone-700">Verifikasi Paspor</span>
                  </div>
                  <span className="text-[10px] font-medium text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">Proses</span>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-stone-100 bg-stone-50/50 p-2.5">
                  <div className="flex items-center gap-2">
                    <Wallet className="h-3.5 w-3.5 text-emerald-600" strokeWidth={1.5} />
                    <span className="font-medium text-stone-700">Pelunasan Visa</span>
                  </div>
                  <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">Selesai</span>
                </div>
              </div>
            </article>

          </aside>

        </section>

      </div>
    </AppShell>
  );
}
