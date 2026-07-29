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
      <div className="space-y-6 font-sans">
        
        {/* 1. 📍 NATIVE TOP HEADER BAR (LOKASI & PERUSAHAAN PERSIS GAMBAR REFERENSI) */}
        <section className="flex items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-stone-200/80 shadow-2xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/60">
              <MapPin className="h-4.5 w-4.5" strokeWidth={2} />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <span className="text-xs font-black text-stone-900 truncate">
                  Komplek Ruko Best Cinema, Pangkalpinang
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-stone-400 shrink-0" />
              </div>
              <p className="text-[10px] font-bold text-stone-500 truncate">
                PT. AL MASSA AZKA WISATA • PPIU No. 10032300465890002
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/pengaturan/identitas"
              className="grid h-8 w-8 place-items-center rounded-full border border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100 transition"
              title="Profil Perusahaan"
            >
              <Building2 className="h-4 w-4" strokeWidth={1.5} />
            </Link>
          </div>
        </section>

        {/* 2. 🔍 NATIVE FULL-WIDTH SEARCH BAR (PERSIS GAMBAR REFERENSI) */}
        <section className="relative">
          <div className="flex items-center gap-2.5 rounded-full border border-stone-200/90 bg-white px-4 h-11 shadow-2xs focus-within:border-brand-pink focus-within:ring-2 focus-within:ring-rose-100 transition">
            <Search className="h-4 w-4 text-stone-400 shrink-0" strokeWidth={1.5} />
            <input
              type="text"
              placeholder="Cari paket umrah, jamaah, invoice, atau jadwal..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent outline-none text-xs font-medium text-stone-900 placeholder:text-stone-400"
            />
            <button
              type="button"
              className="grid h-7 w-7 place-items-center rounded-full bg-stone-100 text-stone-500 hover:bg-stone-200 transition shrink-0"
              title="Filter"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" strokeWidth={1.5} />
            </button>
          </div>
        </section>

        {/* 3. 🌟 FEATURED HERO CAROUSEL BANNER CARD (EMERALD GREEN GRADIENT PERSIS GAMBAR REFERENSI) */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-teal-900 to-stone-950 p-5 sm:p-7 text-white shadow-xl border border-emerald-800/40">
          {/* Subtle Background Pattern & Glow */}
          <div className="absolute right-0 top-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="absolute left-0 bottom-0 -mb-10 -ml-10 h-48 w-48 rounded-full bg-amber-500/10 blur-2xl" />

          <div className="relative z-10 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-emerald-300 border border-emerald-400/30">
                <Sparkles className="h-3 w-3 text-amber-300" strokeWidth={2} />
                Keberangkatan Terdekat 2026
              </span>
              <span className="text-[10px] font-bold text-stone-300">1-12 Oktober 2026</span>
            </div>

            <div>
              <h2 className="text-lg sm:text-xl font-black text-white leading-snug">
                Umrah Spesial Oktober (12 Hari)
              </h2>
              <p className="text-xs font-normal text-emerald-100/90 mt-1 line-clamp-2">
                Program Umrah 3x + 2x Jum'at di Makkah. Free City Tour Thaif, Nasi Arab Nampan, & Air Zam-zam 5 Liter.
              </p>
            </div>

            {/* Action Buttons Inside Hero Banner */}
            <div className="flex items-center gap-2.5 pt-1">
              <Link
                href="/booking/form"
                className="inline-flex h-9 items-center gap-1.5 rounded-full bg-white px-4 text-xs font-black text-emerald-950 shadow-md hover:bg-emerald-50 transition active:scale-95"
              >
                <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                <span>Booking Sekarang</span>
              </Link>
              <Link
                href="/jadwal"
                className="inline-flex h-9 items-center gap-1.5 rounded-full border border-white/30 bg-white/10 backdrop-blur-md px-4 text-xs font-bold text-white hover:bg-white/20 transition active:scale-95"
              >
                <CalendarDays className="h-3.5 w-3.5" strokeWidth={1.5} />
                <span>Lihat Flight</span>
              </Link>
            </div>

            {/* Pagination Dots Indicator */}
            <div className="flex items-center justify-center gap-1.5 pt-2">
              <span className="h-2 w-5 rounded-full bg-white" />
              <span className="h-2 w-2 rounded-full bg-white/40" />
              <span className="h-2 w-2 rounded-full bg-white/40" />
            </div>
          </div>
        </section>

        {/* 4. 🎛️ GRID 8 ICON QUICK SERVICES (PERSIS GAMBAR REFERENSI 4x2 GRID) */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-stone-900">Layanan Utama Operasional</h3>
            <Link href="/paket" className="text-xs font-bold text-brand-pink hover:underline flex items-center gap-0.5">
              Lihat semua <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-4 gap-2.5 sm:gap-3">
            {[
              { label: "Paket Umrah", icon: Plane, href: "/paket", color: "bg-rose-50 text-brand-pink border-rose-200/60" },
              { label: "Booking", icon: ClipboardList, href: "/booking", color: "bg-amber-50 text-amber-800 border-amber-200/60" },
              { label: "Jadwal Flight", icon: CalendarDays, href: "/jadwal", color: "bg-emerald-50 text-emerald-700 border-emerald-200/60" },
              { label: "Kasir Cicilan", icon: CircleDollarSign, href: "/pembayaran", color: "bg-blue-50 text-blue-700 border-blue-200/60" },
              { label: "Dokumen", icon: FileText, href: "/dokumen", color: "bg-purple-50 text-purple-700 border-purple-200/60" },
              { label: "Kalkulator HPP", icon: Calculator, href: "/paket/kalkulator", color: "bg-indigo-50 text-indigo-700 border-indigo-200/60" },
              { label: "Manifest", icon: Layers, href: "/manifest", color: "bg-teal-50 text-teal-700 border-teal-200/60" },
              { label: "Staf & Role", icon: Users, href: "/pengaturan/staf", color: "bg-stone-100 text-stone-700 border-stone-200/60" },
            ].map((srv) => {
              const Icon = srv.icon;
              return (
                <Link
                  key={srv.label}
                  href={srv.href}
                  className="flex flex-col items-center justify-center gap-1.5 rounded-2xl border border-stone-200/70 bg-white p-3 shadow-2xs hover:shadow-md hover:border-brand-pink/40 active:scale-95 transition text-center"
                >
                  <span className={`grid h-10 w-10 place-items-center rounded-2xl border ${srv.color}`}>
                    <Icon className="h-5 w-5" strokeWidth={1.75} />
                  </span>
                  <span className="text-[11px] font-bold text-stone-800 leading-tight">
                    {srv.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* 5. 📦 HORIZONTAL CAROUSEL CARDS ("REKOMENDASI PAKET UTAMA" PERSIS GAMBAR REFERENSI) */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-stone-900">Rekomendasi Paket Utama</h3>
            <Link href="/paket" className="text-xs font-bold text-brand-pink hover:underline flex items-center gap-0.5">
              Lihat semua <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="flex gap-3.5 overflow-x-auto pb-2 no-scrollbar scroll-smooth">
            {/* Card 1 */}
            <article className="min-w-[280px] sm:min-w-[320px] rounded-2xl border border-stone-200/80 bg-white p-4 shadow-xs space-y-3 shrink-0 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-black text-emerald-700 border border-emerald-200/60">
                    Bestseller
                  </span>
                  <span className="text-[10px] font-bold text-amber-600 flex items-center gap-0.5">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> 4.9 (128 Jamaah)
                  </span>
                </div>
                <h4 className="text-sm font-black text-stone-900 leading-snug">
                  Umrah Spesial Oktober (12 Hari)
                </h4>
                <p className="text-[11px] font-medium text-stone-500 flex items-center gap-1">
                  <Clock className="h-3 w-3 text-stone-400" /> 1-12 Oktober 2026 • Saudia / Garuda
                </p>
                <div className="flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50/60 px-2 py-0.5 rounded-md border border-emerald-100">
                  <CheckCircle2 className="h-3 w-3" /> Hotel Grand Al Massa Makkah
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                <div>
                  <span className="text-[9px] font-bold uppercase text-stone-400 block">Harga Paket</span>
                  <span className="text-sm font-black text-brand-cocoa">Rp 33.500.000</span>
                </div>
                <Link
                  href="/booking/form"
                  className="inline-flex h-8 items-center gap-1 rounded-xl bg-brand-pink px-3.5 text-xs font-bold text-white shadow-2xs hover:bg-brand-pinkHover transition"
                >
                  Booking
                </Link>
              </div>
            </article>

            {/* Card 2 */}
            <article className="min-w-[280px] sm:min-w-[320px] rounded-2xl border border-stone-200/80 bg-white p-4 shadow-xs space-y-3 shrink-0 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-[10px] font-black text-brand-pink border border-brand-pink/20">
                    Populer
                  </span>
                  <span className="text-[10px] font-bold text-amber-600 flex items-center gap-0.5">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> 4.8 (95 Jamaah)
                  </span>
                </div>
                <h4 className="text-sm font-black text-stone-900 leading-snug">
                  Umrah Berkah Spesial November (11 Hari)
                </h4>
                <p className="text-[11px] font-medium text-stone-500 flex items-center gap-1">
                  <Clock className="h-3 w-3 text-stone-400" /> 8-18 November 2026 • Garuda Indonesia
                </p>
                <div className="flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50/60 px-2 py-0.5 rounded-md border border-emerald-100">
                  <CheckCircle2 className="h-3 w-3" /> Hotel Daar El Naeem Madinah
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                <div>
                  <span className="text-[9px] font-bold uppercase text-stone-400 block">Harga Paket</span>
                  <span className="text-sm font-black text-brand-cocoa">Rp 35.500.000</span>
                </div>
                <Link
                  href="/booking/form"
                  className="inline-flex h-8 items-center gap-1 rounded-xl bg-stone-900 px-3.5 text-xs font-bold text-white shadow-2xs hover:bg-stone-800 transition"
                >
                  Booking
                </Link>
              </div>
            </article>
          </div>
        </section>

        {/* 6. 📊 KPI METRIC CARDS (4 GRID BOXES) */}
        <section className="grid gap-3 grid-cols-2 lg:grid-cols-4">
          {metricsConfig.map((stat) => {
            const Icon = stat.icon;
            return (
              <article
                key={stat.key}
                className="rounded-2xl border border-stone-200/70 bg-white p-4 shadow-2xs flex flex-col justify-between transition hover:border-stone-300"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className={`grid h-8 w-8 place-items-center rounded-xl border ${stat.iconBg} ${stat.iconColor}`}>
                      <Icon className="h-4 w-4" strokeWidth={1.5} />
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                      {stat.trend}
                    </span>
                  </div>

                  <div className="mt-3 space-y-0.5">
                    <p className="text-[11px] font-semibold text-stone-500">{stat.title}</p>
                    <p className="text-xl sm:text-2xl font-black tracking-tight text-stone-900">{stat.value}</p>
                    <p className="text-[10px] text-stone-400 truncate">{stat.subtext}</p>
                  </div>
                </div>
              </article>
            );
          })}
        </section>

        {/* 7. 🛡️ TRUST & FEATURE GUARANTEE BADGES BAR (PERSIS BARIS KEAMANAN PADA GAMBAR REFERENSI) */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-stone-100/70 p-2.5 rounded-2xl border border-stone-200/60 text-center">
          <div className="p-2 bg-white rounded-xl border border-stone-200/50">
            <ShieldCheck className="h-4 w-4 text-emerald-600 mx-auto mb-1" strokeWidth={2} />
            <p className="text-[10px] font-extrabold text-stone-800">Izin PPIU Resmi</p>
            <p className="text-[9px] text-stone-500">10032300465890002</p>
          </div>
          <div className="p-2 bg-white rounded-xl border border-stone-200/50">
            <Wallet className="h-4 w-4 text-amber-600 mx-auto mb-1" strokeWidth={2} />
            <p className="text-[10px] font-extrabold text-stone-800">Transparan 100%</p>
            <p className="text-[9px] text-stone-500">Tanpa Hidden Fee</p>
          </div>
          <div className="p-2 bg-white rounded-xl border border-stone-200/50">
            <UserCheck className="h-4 w-4 text-blue-600 mx-auto mb-1" strokeWidth={2} />
            <p className="text-[10px] font-extrabold text-stone-800">Muthawwif Resmi</p>
            <p className="text-[9px] text-stone-500">Pembimbing Ustadz</p>
          </div>
          <div className="p-2 bg-white rounded-xl border border-stone-200/50">
            <CheckCircle2 className="h-4 w-4 text-purple-600 mx-auto mb-1" strokeWidth={2} />
            <p className="text-[10px] font-extrabold text-stone-800">Hotel Terjamin</p>
            <p className="text-[9px] text-stone-500">Grand Al Massa Makkah</p>
          </div>
        </section>

        {/* 8. 📋 BOOKING TERBARU TRANSAKSI LIST */}
        <section className="rounded-2xl border border-stone-200/80 bg-white p-4 sm:p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-stone-900">Booking Terbaru Jamaah</h3>
              <p className="text-[11px] text-stone-500">Daftar transaksi pendaftaran & pelunasan</p>
            </div>
            <Link href="/booking" className="text-xs font-bold text-brand-pink hover:underline flex items-center gap-0.5">
              Lihat semua <ChevronRight className="h-3.5 w-3.5" />
            </Link>
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
                    className="rounded-2xl border border-stone-200/80 bg-white p-3.5 shadow-2xs space-y-3 active:bg-stone-50 transition"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-rose-50 text-brand-pink font-extrabold text-xs border border-brand-pink/20">
                          {initials}
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-stone-900">{booking.customer}</h4>
                          <p className="font-mono text-[10px] text-stone-400">{booking.code}</p>
                        </div>
                      </div>
                      <StatusBadge status={booking.status} />
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] bg-stone-50/70 p-2.5 rounded-xl border border-stone-100">
                      <div>
                        <span className="text-[10px] text-stone-400 font-medium block">Paket Wisata</span>
                        <span className="font-semibold text-stone-800 truncate block">{booking.packageName}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-stone-400 font-medium block">Terbayar</span>
                        <span className="font-bold text-emerald-700 block">{booking.paidDisplay}</span>
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
                              <p className="font-semibold text-stone-900">{booking.customer}</p>
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

                        <td className="py-3 pr-2 font-semibold text-emerald-700">
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
        </section>

      </div>
    </AppShell>
  );
}
