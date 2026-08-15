"use client";

import { useEffect, useMemo, useState } from "react";
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
  Armchair,
  Users,
  Wallet,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { formatRupiah } from "@/lib/seed-data/derived";

type DashboardStats = {
  packageCount: number;
  totalSeatQuota: number;
  customerCount: number;
  activeCustomerCount: number;
  bookingCount: number;
  bookingsNeedingFollowUp: number;
  totalBookedSeats: number;
  umrahMeActiveBookingCount: number;
  totalRevenue: number;
  paymentCount: number;
  revenueBars: { day: string; amount: number; height: number; active: boolean }[];
};

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
      bg: "bg-rose-50/80 text-rose-800",
      border: "border-rose-200/60",
      dot: "bg-rose-500",
    },
  };

  const style = styles[status] || styles["Belum Bayar"];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${style.bg} ${style.border}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
      {status}
    </span>
  );
}

function UmrahMeBadge({ status }: { status: string }) {
  const isActive = (status || "").toLowerCase().startsWith("aktif");

  const style = isActive
    ? { bg: "bg-emerald-50 text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500 animate-pulse" }
    : { bg: "bg-stone-100 text-stone-500", border: "border-stone-200", dot: "bg-stone-400" };

  return (
    <span
      className={`inline-flex items-center gap-1 font-mono text-[10px] px-2 py-0.5 rounded-full border font-bold whitespace-nowrap ${style.bg} ${style.border}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
      UmrahMe {status || "Nonaktif"}
    </span>
  );
}

function DashboardLiveCalendar() {
  const [currentDate, setCurrentDate] = useState<Date | null>(null);

  useEffect(() => {
    setCurrentDate(new Date());
  }, []);

  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  if (!currentDate) return null;

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const prevMonthTotalDays = new Date(year, month, 0).getDate();

  const today = new Date();
  const isCurrentMonthReal = today.getFullYear() === year && today.getMonth() === month;
  const realTodayDate = today.getDate();

  const daysGrid: { day: number; isCurrentMonth: boolean; isToday?: boolean }[] = [];

  for (let i = firstDayIndex - 1; i >= 0; i--) {
    daysGrid.push({ day: prevMonthTotalDays - i, isCurrentMonth: false });
  }

  for (let i = 1; i <= totalDays; i++) {
    daysGrid.push({ day: i, isCurrentMonth: true, isToday: isCurrentMonthReal && i === realTodayDate });
  }

  const remaining = 35 - daysGrid.length;
  const fillCount = remaining >= 0 ? remaining : 42 - daysGrid.length;
  for (let i = 1; i <= fillCount; i++) {
    daysGrid.push({ day: i, isCurrentMonth: false });
  }

  return (
    <article className="rounded-2xl border border-stone-200/70 bg-white p-5 sm:p-6 shadow-2xs font-sans">
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={handlePrevMonth}
          className="grid h-6 w-6 place-items-center rounded-md text-stone-400 hover:bg-stone-100 transition active:scale-95 cursor-pointer"
          aria-label="Bulan sebelumnya"
        >
          <ChevronLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
        </button>
        <p className="text-xs font-bold text-brand-cocoa">
          {monthNames[month]}, {year}
        </p>
        <button
          type="button"
          onClick={handleNextMonth}
          className="grid h-6 w-6 place-items-center rounded-md text-stone-400 hover:bg-stone-100 transition active:scale-95 cursor-pointer"
          aria-label="Bulan selanjutnya"
        >
          <ChevronRight className="h-3.5 w-3.5" strokeWidth={1.5} />
        </button>
      </div>

      <div className="grid grid-cols-7 text-center text-[10px] font-bold text-stone-400 mb-2">
        <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
      </div>

      <div className="grid grid-cols-7 text-center text-[11px] font-normal gap-y-1.5 text-stone-700">
        {daysGrid.map((item, idx) => {
          if (!item.isCurrentMonth) {
            return (
              <span key={idx} className="text-stone-300">
                {item.day}
              </span>
            );
          }
          if (item.isToday) {
            return (
              <span
                key={idx}
                className="grid h-5 w-5 mx-auto place-items-center rounded-full bg-brand-pink text-white font-bold text-[10px] shadow-2xs"
              >
                {item.day}
              </span>
            );
          }
          return <span key={idx}>{item.day}</span>;
        })}
      </div>
    </article>
  );
}

export default function DashboardPage() {
  const [activeFilter, setActiveFilter] = useState<string>("Semua");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [publishedPackages, setPublishedPackages] = useState<any[]>([]);
  const [realBookings, setRealBookings] = useState<any[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  /**
   * Kartu sorotan & rekomendasi di tampilan ponsel dulu berisi paket karangan
   * ("Umrah Spesial Oktober", rating 4.9 dari 128 ulasan) yang tidak ada di
   * database -- dan sistem ini memang tidak punya fitur rating sama sekali.
   * Keduanya sekarang memakai grup yang benar-benar terbit, diurutkan dari
   * keberangkatan terdekat.
   */
  const paketTerdekat = useMemo(() => {
    return [...publishedPackages]
      .filter((p) => p?.name)
      .sort((a, b) => String(a.departureDate ?? "").localeCompare(String(b.departureDate ?? "")));
  }, [publishedPackages]);

  const heroPaket = paketTerdekat[0] ?? null;

  const heroTanggal = useMemo(() => {
    const iso = String(heroPaket?.departureDate ?? "");
    const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!m) return heroPaket?.departuresDate?.slice(0, 22) || "";
    const bulan = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
    return `${Number(m[3])} ${bulan[Number(m[2]) - 1]} ${m[1]}`;
  }, [heroPaket]);

  useEffect(() => {
    // Supabase is the record for all three -- no localStorage fallback or
    // merge. A cached copy that outlives what the server actually has (e.g.
    // a booking deleted on another device) used to keep showing up here.
    fetch("/api/dashboard/stats")
      .then((res) => res.json())
      .then((res) => setStats(res.data))
      .catch((e) => console.error("Failed to load dashboard stats:", e));

    fetch("/api/packages")
      .then((res) => res.json())
      .then((res) => {
        if (res.ok && Array.isArray(res.data)) setPublishedPackages(res.data);
      })
      .catch((e) => console.error("Failed to load packages:", e));

    fetch("/api/bookings")
      .then((res) => res.json())
      .then((res) => {
        if (res.ok && Array.isArray(res.data)) setRealBookings(res.data);
      })
      .catch((e) => console.error("Failed to load bookings:", e));
  }, []);

  const allBookings = useMemo(() => {
    return realBookings.map((b) => ({
      code: b.code || "BK-908709",
      customer: b.customer || "Jamaah Terdaftar",
      packageName: b.packageName || "Umrah Spesial El Massa",
      departure: b.departure || "30 Sep 2026",
      status: b.status || (b.remainingAmount <= 0 ? "Lunas" : b.paidAmount > 0 ? "DP" : "Belum Bayar"),
      totalAmount: b.totalDisplay || `Rp ${(b.totalAmount || 33500000).toLocaleString("id-ID")}`,
      paidAmount: b.paidDisplay || `Rp ${(b.paidAmount || 0).toLocaleString("id-ID")}`,
      umrahMeStatus: b.umrahMeStatus || "Aktif 🟢",
      phone: b.phone || "0812-3456-7890",
      participants: b.participants || 1,
    }));
  }, [realBookings]);

  const filteredBookings = useMemo(() => {
    return allBookings.filter((booking) => {
      const matchesFilter = activeFilter === "Semua" || booking.status === activeFilter;
      const matchesSearch =
        booking.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.packageName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [allBookings, activeFilter, searchQuery]);

  const bookingCount = stats?.bookingCount ?? allBookings.length;
  const customerCount = stats?.customerCount ?? 0;
  const totalGrupTersedia = stats?.packageCount ?? publishedPackages.length;
  const totalRev = stats?.totalRevenue ?? 0;

  const totalBookedSeats = stats?.totalBookedSeats ?? 0;
  const totalTargetSeats = stats?.totalSeatQuota ?? 0;
  const totalRemainingSeats = Math.max(0, totalTargetSeats - totalBookedSeats);

  const umrahMeActiveBookingCount = stats?.umrahMeActiveBookingCount ?? 0;
  const umrahMeActivePercent = bookingCount > 0 ? Math.round((umrahMeActiveBookingCount / bookingCount) * 100) : 0;

  const revenueBars = stats?.revenueBars ?? [
    { day: "Su", amount: 0, height: 10, active: false },
    { day: "Mo", amount: 0, height: 10, active: false },
    { day: "Tu", amount: 0, height: 10, active: false },
    { day: "We", amount: 0, height: 10, active: false },
    { day: "Th", amount: 0, height: 10, active: false },
    { day: "Fr", amount: 0, height: 10, active: false },
    { day: "Sa", amount: 0, height: 10, active: false },
  ];

  const metricsConfig = [
    {
      key: "grup_tersedia",
      title: "Total Grup Tersedia",
      value: `${totalGrupTersedia} Grup`,
      subtext: `${totalGrupTersedia} grup aktif di Jadwal Keberangkatan`,
      trend: "Live",
      icon: Plane,
      iconColor: "text-brand-pink",
      iconBg: "bg-rose-50/80 border-brand-pink/20",
      solidBar: "bg-brand-pink",
      progress: 100,
      href: "/paket",
    },
    {
      key: "update_seat",
      title: "Update Seat",
      value: `${totalRemainingSeats} Seat`,
      subtext: `Sisa seat kuota dari ${totalGrupTersedia} grup paket`,
      trend: "Ready",
      icon: Armchair,
      iconColor: "text-amber-700",
      iconBg: "bg-amber-50/80 border-amber-200/60",
      solidBar: "bg-amber-500",
      progress: Math.min(100, Math.round((totalBookedSeats / (totalTargetSeats || 1)) * 100)),
      href: "/paket/seat",
    },
    {
      key: "customers",
      title: "Jamaah Terdaftar",
      value: String(customerCount),
      subtext:
        customerCount > 0
          ? `${umrahMeActivePercent > 0 ? "🟢 " : ""}${umrahMeActivePercent}% Akun UmrahMe Aktif`
          : "0 jamaah terdaftar",
      trend: "UmrahMe",
      icon: Users,
      iconColor: "text-emerald-700",
      iconBg: "bg-emerald-50/80 border-emerald-200/60",
      solidBar: "bg-emerald-600",
      progress: customerCount > 0 ? umrahMeActivePercent : 0,
      href: "/pelanggan",
    },
    {
      key: "revenue",
      title: "Est. Total Revenue",
      value: formatRupiah(totalRev),
      subtext: "Total pembayaran lunas & DP",
      trend: "Live",
      icon: Wallet,
      iconColor: "text-stone-700",
      iconBg: "bg-stone-100 border-stone-200",
      solidBar: "bg-stone-800",
      progress: totalRev > 0 ? 85 : 0,
      href: "/pembayaran",
    },
  ];

  return (
    <AppShell>
      <div className="font-sans">

        {/* ========================================================================= */}
        {/* 🖥️ 1. DESKTOP MODE LAYOUT (100% UNTOUCHED ORIGINAL 2-COLUMN EDITORIAL) */}
        {/* ========================================================================= */}
        <div className="hidden lg:block space-y-5">
          
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
                <Link key={stat.key} href={stat.href} className="block group">
                  <article className="rounded-2xl border border-stone-200/70 bg-white p-5 shadow-2xs flex flex-col justify-between h-full transition group-hover:border-pink-300 group-hover:shadow-xs cursor-pointer">
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
                        <p className="text-2xl font-bold tracking-tight text-brand-cocoa group-hover:text-brand-pink transition">{stat.value}</p>
                        <p className="text-[11px] text-stone-400 font-normal">{stat.subtext}</p>
                      </div>
                    </div>

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
                </Link>
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
                  {publishedPackages.length === 0 ? (
                    <div className="col-span-3 py-6 text-center text-xs text-stone-400 font-medium bg-stone-50/50 rounded-xl border border-stone-200/50">
                      Belum ada paket wisata aktif. Terbitkan paket baru dari{" "}
                      <Link href="/paket/kalkulator" className="text-brand-pink font-semibold underline">
                        Kalkulator HPP
                      </Link>
                      .
                    </div>
                  ) : (
                    publishedPackages.slice(0, 3).map((pkg, idx) => (
                      <div key={pkg.id || idx} className="rounded-xl border border-stone-200/60 bg-stone-50/50 p-3 flex flex-col justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-rose-50 text-brand-pink border border-brand-pink/20">
                            <Plane className="h-4 w-4" strokeWidth={1.5} />
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-xs font-bold text-brand-cocoa">{pkg.name}</p>
                            <p className="text-[10px] text-stone-500">{pkg.duration || "9 Hari"} • {pkg.airline || "Garuda"}</p>
                          </div>
                        </div>
                        <div className="mt-3 flex items-center justify-between border-t border-stone-200/50 pt-2 text-[10px]">
                          <span className="font-semibold text-emerald-700">{pkg.price || "Rp 0"}</span>
                          <span className="rounded-md bg-rose-50 px-2 py-0.5 font-medium text-brand-pink">{pkg.category || "Wisata Halal"}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </article>

              {/* Table "Booking Terbaru" */}
              <article className="rounded-2xl border border-stone-200/70 bg-white p-5 shadow-2xs">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-brand-cocoa">Booking Terbaru</h3>
                    <p className="text-xs text-stone-500">Daftar transaksi pemesanan jamaah El Massa</p>
                  </div>

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

                <div className="overflow-x-auto rounded-xl border border-stone-200/60">
                  <table className="w-full min-w-[640px] border-collapse text-left text-xs">
                    <thead>
                      <tr className="border-b border-stone-200/60 bg-stone-50/70 font-semibold text-stone-500 text-[11px] uppercase tracking-wider">
                        <th className="py-2.5 pl-3 pr-2">Kode & Jamaah</th>
                        <th className="py-2.5 pr-2">Paket Wisata</th>
                        <th className="py-2.5 pr-2">Tgl Berangkat</th>
                        <th className="py-2.5 pr-2">Status Pembayaran</th>
                        <th className="py-2.5 pr-2">Akun UmrahMe</th>
                        <th className="py-2.5 pr-2">Total Biaya</th>
                        <th className="py-2.5 pr-3 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 font-normal">
                      {filteredBookings.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-6 text-center text-stone-400">
                            Tidak ada data booking yang sesuai.
                          </td>
                        </tr>
                      ) : (
                        filteredBookings.map((booking) => {
                          const initials = (booking.customer || "Jamaah")
                            .split(" ")
                            .map((n: string) => n[0])
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
                                {(booking as any).departure || (booking as any).departureLabel || "30 Sep 2026"}
                              </td>

                              <td className="py-3 pr-2">
                                <StatusBadge status={booking.status} />
                              </td>

                              <td className="py-3 pr-2">
                                <UmrahMeBadge status={booking.umrahMeStatus} />
                              </td>

                              <td className="py-3 pr-2 font-semibold text-brand-cocoa">
                                {(booking as any).totalAmount || (booking as any).paidDisplay || "Rp 0"}
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

            {/* RIGHT COLUMN: SIDEBAR WIDGETS */}
            <aside className="space-y-5">
              
              {/* Slim Chart Card */}
              <article className="rounded-2xl border border-stone-200/70 bg-white p-5 sm:p-6 shadow-2xs">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold text-brand-cocoa uppercase tracking-wider">Pemasukan Mingguan</h3>
                  <span className="text-[11px] font-semibold text-stone-600 bg-stone-50 px-2 py-0.5 rounded-md border border-stone-200/60">
                    {totalRev > 0 ? "+18%" : "0%"}
                  </span>
                </div>

                <div className="flex h-36 items-end gap-2 pt-6 px-1">
                  {revenueBars.map((item) => (
                    <div key={item.day} className="relative flex flex-1 flex-col items-center gap-1.5 h-full justify-end group">
                      {item.active && item.amount > 0 && (
                        <div className="absolute -top-7 left-1/2 -translate-x-1/2 z-10 rounded-md bg-brand-cocoa px-2 py-0.5 text-[9px] font-semibold text-white shadow-xs whitespace-nowrap">
                          Rp {(item.amount / 1000000).toFixed(0)}M
                        </div>
                      )}
                      <div
                        className={`w-2.5 rounded-full transition-all ${
                          item.active ? "bg-brand-pink" : "bg-stone-100 group-hover:bg-stone-200"
                        }`}
                        style={{ height: `${item.height}%` }}
                      />
                      <span className="text-[10px] font-medium text-stone-400">{item.day}</span>
                    </div>
                  ))}
                </div>
              </article>

              {/* Dynamic Realtime Interactive Calendar Widget */}
              <DashboardLiveCalendar />

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

        {/* ========================================================================= */}
        {/* 📱 2. MOBILE NATIVE DASHBOARD LAYOUT (PERSIS GAMBAR REFERENSI BRO) */}
        {/* ========================================================================= */}
        <div className="block lg:hidden space-y-4">
          
          {/* 📍 NATIVE TOP HEADER BAR (LOKASI & LEGALITAS) */}
          <section className="flex items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-stone-200/80 shadow-2xs">
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
                  PT. AL MASSA AZKA WISATA • PPIU 10032300465890002
                </p>
              </div>
            </div>

            <Link
              href="/pengaturan/identitas"
              className="grid h-8 w-8 place-items-center rounded-full border border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100 transition shrink-0"
            >
              <Building2 className="h-4 w-4" strokeWidth={1.5} />
            </Link>
          </section>

          {/* 🔍 NATIVE FULL-WIDTH SEARCH BAR WITH FILTER SLIDERS */}
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

          {/* 🌟 FEATURED HERO CAROUSEL BANNER CARD (EMERALD GRADIENT PERSIS REFERENSI) */}
          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-teal-900 to-stone-950 p-5 text-white shadow-xl border border-emerald-800/40">
            <div className="absolute right-0 top-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />

            <div className="relative z-10 space-y-3.5">
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-3 py-0.5 text-[10px] font-extrabold uppercase tracking-widest text-emerald-300 border border-emerald-400/30">
                  <Sparkles className="h-3 w-3 text-amber-300" strokeWidth={2} />
                  Keberangkatan Terdekat
                </span>
                <span className="shrink-0 whitespace-nowrap text-[10px] font-bold text-stone-300">{heroTanggal || "Belum dijadwalkan"}</span>
              </div>

              <div>
                <h2 className="text-base font-black text-white leading-snug">
                  {heroPaket?.name || "Belum ada grup keberangkatan"}
                </h2>
                <p className="text-[11px] font-normal text-emerald-100/90 mt-1 line-clamp-2">
                  {heroPaket
                    ? [heroPaket.duration, heroPaket.makkahHotel && `Hotel ${heroPaket.makkahHotel}`, heroPaket.airline]
                        .filter(Boolean).join(" · ")
                    : "Buat grup lewat Kalkulator HPP untuk menampilkannya di sini."}
                </p>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <Link
                  href="/booking/form"
                  className="inline-flex h-8 items-center gap-1 rounded-full bg-white px-3.5 text-xs font-black text-emerald-950 shadow-md active:scale-95 transition"
                >
                  <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                  <span>Booking</span>
                </Link>
                <Link
                  href="/jadwal"
                  className="inline-flex h-8 items-center gap-1 rounded-full border border-white/30 bg-white/10 backdrop-blur-md px-3.5 text-xs font-bold text-white active:scale-95 transition"
                >
                  <CalendarDays className="h-3.5 w-3.5" strokeWidth={1.5} />
                  <span>Flight</span>
                </Link>
              </div>

              <div className="flex items-center justify-center gap-1.5 pt-1">
                <span className="h-1.5 w-4 rounded-full bg-white" />
                <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
                <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
              </div>
            </div>
          </section>

          {/* 🎛️ GRID 8 ICON QUICK SERVICES (PERSIS GAMBAR REFERENSI 4x2 GRID) */}
          <section className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold text-stone-900 uppercase tracking-wider">Layanan Utama</h3>
              <Link href="/paket" className="text-[11px] font-bold text-brand-pink hover:underline flex items-center gap-0.5">
                Lihat semua <ChevronRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[
                { label: "Jadwal Grup", icon: Plane, href: "/paket", color: "bg-rose-50 text-brand-pink border-rose-200/60" },
                { label: "Booking", icon: ClipboardList, href: "/booking", color: "bg-amber-50 text-amber-800 border-amber-200/60" },
                { label: "Kalender", icon: CalendarDays, href: "/jadwal", color: "bg-emerald-50 text-emerald-700 border-emerald-200/60" },
                { label: "Kasir Cicilan", icon: CircleDollarSign, href: "/pembayaran", color: "bg-blue-50 text-blue-700 border-blue-200/60" },
                { label: "Dokumen", icon: FileText, href: "/dokumen", color: "bg-purple-50 text-purple-700 border-purple-200/60" },
                { label: "Kalkulator", icon: Calculator, href: "/paket/kalkulator", color: "bg-indigo-50 text-indigo-700 border-indigo-200/60" },
                { label: "Manifest", icon: Layers, href: "/manifest", color: "bg-teal-50 text-teal-700 border-teal-200/60" },
                { label: "Staf & Role", icon: Users, href: "/pengaturan/staf", color: "bg-stone-100 text-stone-700 border-stone-200/60" },
              ].map((srv) => {
                const Icon = srv.icon;
                return (
                  <Link
                    key={srv.label}
                    href={srv.href}
                    className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-stone-200/70 bg-white p-2.5 shadow-2xs active:scale-95 transition text-center"
                  >
                    <span className={`grid h-9 w-9 place-items-center rounded-xl border ${srv.color}`}>
                      <Icon className="h-4.5 w-4.5" strokeWidth={1.75} />
                    </span>
                    <span className="text-[10px] font-bold text-stone-800 leading-tight">
                      {srv.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* 📦 HORIZONTAL CAROUSEL CARDS ("REKOMENDASI PAKET UTAMA") */}
          <section className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold text-stone-900 uppercase tracking-wider">Rekomendasi Paket</h3>
              <Link href="/paket" className="text-[11px] font-bold text-brand-pink hover:underline flex items-center gap-0.5">
                Lihat semua <ChevronRight className="h-3 w-3" />
              </Link>
            </div>

            {paketTerdekat.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-6 text-center">
                <p className="text-xs font-bold text-stone-700">Belum ada grup keberangkatan</p>
                <Link href="/paket/kalkulator" className="mt-1 inline-block text-[11px] font-bold text-brand-pink">
                  Buat lewat Kalkulator HPP →
                </Link>
              </div>
            ) : (
              /* Ditumpuk ke bawah, bukan digeser ke samping. Deret horizontal
                 memaksa lebar kartu tetap, sehingga satu grup pun tetap harus
                 digeser untuk dibaca -- padahal layar ponsel punya ruang
                 vertikal berlimpah dan hampir tidak punya ruang mendatar. */
              <div className="space-y-2">
                {paketTerdekat.slice(0, 4).map((paket) => (
                  <Link
                    key={paket.id}
                    href={`/paket/${encodeURIComponent(paket.id)}`}
                    className="block rounded-2xl border border-stone-200/80 bg-white p-3 shadow-xs active:scale-[0.99] transition"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="min-w-0 flex-1 text-xs font-black leading-snug text-stone-900">
                        {paket.name}
                      </h4>
                      <span className="shrink-0 rounded-full bg-rose-50 px-2 py-0.5 text-[9px] font-black text-brand-pink border border-brand-pink/20">
                        {paket.duration || paket.category || "Umrah"}
                      </span>
                    </div>

                    <p className="mt-1 flex items-center gap-1 text-[10px] font-medium text-stone-500">
                      <Clock className="h-3 w-3 shrink-0 text-stone-400" />
                      <span className="truncate">{paket.departureDate || paket.departuresDate || "Jadwal belum diisi"}</span>
                    </p>
                    {paket.airline ? (
                      <p className="mt-0.5 flex items-center gap-1 text-[10px] font-medium text-stone-500">
                        <Plane className="h-3 w-3 shrink-0 text-stone-400" />
                        <span className="truncate">{paket.airline}</span>
                      </p>
                    ) : null}

                    <div className="mt-2 flex items-center justify-between gap-2 border-t border-stone-100 pt-2">
                      <span className="truncate text-sm font-black text-brand-pink">{paket.price}</span>
                      <span className="shrink-0 text-[10px] font-bold text-stone-400">
                        Sisa {Math.max((Number(paket.targetPax) || 0) - realBookings.filter((b) => b.packageId === paket.id).reduce((n, b) => n + (Number(b.participants) || 1), 0), 0)} seat
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* 📋 BOOKING TERBARU JAMAAH MOBILE CARDS */}
          <section className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold text-stone-900 uppercase tracking-wider">Booking Terbaru</h3>
              <Link href="/booking" className="text-[11px] font-bold text-brand-pink hover:underline flex items-center gap-0.5">
                Lihat semua <ChevronRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="space-y-2.5">
              {filteredBookings.slice(0, 3).map((booking) => {
                const initials = (booking.customer || "Jamaah")
                  .split(" ")
                  .map((n: string) => n[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase();

                return (
                  <div
                    key={booking.code}
                    className="rounded-xl border border-stone-200/80 bg-white p-3 shadow-2xs space-y-2 active:bg-stone-50 transition"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-rose-50 text-brand-pink font-extrabold text-xs border border-brand-pink/20">
                          {initials}
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-stone-900">{booking.customer}</h4>
                          <p className="font-mono text-[10px] text-stone-400">{booking.code}</p>
                        </div>
                      </div>
                      <StatusBadge status={booking.status} />
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-stone-100 text-[11px]">
                      <span className="text-stone-500 truncate max-w-[170px]">{booking.packageName}</span>
                      <Link
                        href={`/booking/${booking.code}`}
                        className="font-bold text-brand-pink hover:underline text-[11px] flex items-center gap-0.5"
                      >
                        Detail <ArrowUpRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

        </div>

      </div>
    </AppShell>
  );
}
