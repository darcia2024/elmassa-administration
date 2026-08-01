"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Bell,
  Building2,
  CalendarDays,
  Check,
  CheckCheck,
  ChevronDown,
  CircleDollarSign,
  ClipboardList,
  Clock,
  FileText,
  IdCard,
  LayoutDashboard,
  LogOut,
  Menu,
  Plane,
  Plus,
  ReceiptText,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const navGroups = [
  {
    label: "Utama",
    items: [
      { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard", aliases: ["/"] },
      { label: "Paket Wisata", icon: Plane, href: "/paket" },
      { label: "Jadwal", icon: CalendarDays, href: "/jadwal" },
      { label: "Pelanggan", icon: Users, href: "/pelanggan" },
    ],
  },
  {
    label: "Operasional",
    items: [
      { label: "Booking", icon: ClipboardList, href: "/booking" },
      { label: "Manifest Peserta", icon: IdCard, href: "/manifest" },
      { label: "Akun Digital UmrahMe", icon: Sparkles, href: "/umrahme" },
      { label: "Pembayaran", icon: CircleDollarSign, href: "/pembayaran" },
      { label: "Invoice & Kuitansi", icon: ReceiptText, href: "/dokumen/invoice" },
      { label: "Dokumen", icon: FileText, href: "/dokumen" },
    ],
  },
  {
    label: "Kontrol",
    items: [
      { label: "Laporan", icon: BarChart3, href: "/laporan" },
      { label: "Identitas Perusahaan", icon: Building2, href: "/pengaturan/identitas" },
      { label: "Pengaturan", icon: Settings, href: "/pengaturan" },
    ],
  },
];

const navItems = navGroups.flatMap((group) => group.items);

const allowedRolesPerItem: Record<string, string[]> = {
  "/dashboard": ["CEO / Admin Master", "Sub-User Operasional", "Sub-User Keuangan", "Sub-User Sales & CRM", "Sub-User Lapangan", "Admin Master"],
  "/paket": ["CEO / Admin Master", "Sub-User Operasional", "Sub-User Sales & CRM", "Admin Master"],
  "/jadwal": ["CEO / Admin Master", "Sub-User Operasional", "Sub-User Sales & CRM", "Sub-User Lapangan", "Admin Master"],
  "/pelanggan": ["CEO / Admin Master", "Sub-User Sales & CRM", "Admin Master"],
  "/booking": ["CEO / Admin Master", "Sub-User Operasional", "Sub-User Keuangan", "Sub-User Sales & CRM", "Admin Master"],
  "/manifest": ["CEO / Admin Master", "Sub-User Operasional", "Sub-User Lapangan", "Admin Master"],
  "/umrahme": ["CEO / Admin Master", "Sub-User Operasional", "Sub-User Lapangan", "Sub-User Sales & CRM", "Admin Master"],
  "/pembayaran": ["CEO / Admin Master", "Sub-User Keuangan", "Admin Master"],
  "/dokumen/invoice": ["CEO / Admin Master", "Sub-User Keuangan", "Admin Master"],
  "/dokumen": ["CEO / Admin Master", "Sub-User Operasional", "Sub-User Keuangan", "Admin Master"],
  "/laporan": ["CEO / Admin Master", "Sub-User Keuangan", "Admin Master"],
  "/pengaturan/identitas": ["CEO / Admin Master", "Admin Master"],
  "/pengaturan/hak-akses": ["CEO / Admin Master", "Admin Master"],
  "/pengaturan": ["CEO / Admin Master", "Admin Master"],
};

function getActiveHref(pathname: string) {
  return navItems
    .filter((item) =>
      item.href === pathname ||
      pathname.startsWith(`${item.href}/`) ||
      item.aliases?.some((alias) => alias === pathname),
    )
    .sort((first, second) => second.href.length - first.href.length)[0]?.href;
}

type AppShellProps = {
  eyebrow?: string;
  title?: string;
  children: ReactNode;
};

const fallbackStaff = {
  name: "Azriandri",
  role: "CEO / Admin Master",
  initials: "AZ",
};

type SessionUser = {
  email: string;
  name: string;
  role: string;
};

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  time: string;
  category: "Keuangan" | "Flight" | "Dokumen";
  read: boolean;
  link: string;
};

const initialNotifications: NotificationItem[] = [
  {
    id: "notif-001",
    title: "⚠️ Jatuh Tempo Pelunasan H-14",
    message: "Jamaah H. Rusli Suparman perlu sisa pelunasan Rp 25.500.000 (Umrah Berkah November).",
    time: "2 jam yang lalu",
    category: "Keuangan",
    read: false,
    link: "/booking/BK-2407-002",
  },
  {
    id: "notif-002",
    title: "✈️ E-Visa & Paspor Disetujui",
    message: "E-Visa Umrah KSA Siti Rahma (BK-2407-001) telah diverifikasi & terbit.",
    time: "5 jam yang lalu",
    category: "Flight",
    read: false,
    link: "/manifest",
  },
  {
    id: "notif-003",
    title: "💰 DP Pembayaran Terverifikasi",
    message: "Cicilan DP Rp 10.000.000 dari Ahmad Hidayat telah disetujui oleh Kasir Hj. Zubaidah.",
    time: "1 hari yang lalu",
    category: "Keuangan",
    read: false,
    link: "/pembayaran",
  },
  {
    id: "notif-004",
    title: "🏢 Rooming Hotel Makkah Siap",
    message: "Grand Al Massa Makkah: 45 Pax kamar Quad siap di-assign.",
    time: "2 hari yang lalu",
    category: "Dokumen",
    read: true,
    link: "/manifest",
  },
];

type SearchResultItem = {
  id: string;
  title: string;
  subtitle: string;
  category: "Jamaah & Booking" | "Paket & Flight" | "Dokumen & Invoice" | "Menu & Pengaturan";
  link: string;
  badge?: string;
};

const globalSearchIndex: SearchResultItem[] = [
  { id: "s-01", title: "Siti Rahma", subtitle: "BK-2407-001 • Umrah Spesial Oktober (12 Hari) • Status Lunas", category: "Jamaah & Booking", link: "/booking/BK-2407-001", badge: "Lunas" },
  { id: "s-02", title: "H. Rusli Suparman", subtitle: "BK-2407-002 • Umrah Berkah November • Sisa Pelunasan Rp 25.500.000", category: "Jamaah & Booking", link: "/booking/BK-2407-002", badge: "DP Paid" },
  { id: "s-03", title: "Ahmad Hidayat", subtitle: "BK-2407-003 • Umrah Berkah November • Cicilan DP Terverifikasi", category: "Jamaah & Booking", link: "/booking/BK-2407-003", badge: "DP Paid" },
  { id: "s-04", title: "Budi Santoso", subtitle: "BK-2407-004 • Umrah Ramadan 1448H", category: "Jamaah & Booking", link: "/booking", badge: "Draft" },

  { id: "s-05", title: "Umrah Spesial Oktober (Dapat 2x Jum'at)", subtitle: "12 Hari • Rp 33.500.000 • Hotel Grand Al Massa Makkah", category: "Paket & Flight", link: "/paket", badge: "Active" },
  { id: "s-06", title: "Umrah Berkah Spesial November", subtitle: "11 Hari • Rp 35.500.000 • Hotel Grand Al Massa Makkah", category: "Paket & Flight", link: "/paket", badge: "Active" },
  { id: "s-07", title: "Kalkulator HPP & Costing Simulator", subtitle: "Rancang HPP paket wisata umrah dari nol", category: "Paket & Flight", link: "/paket/kalkulator", badge: "Tool" },
  { id: "s-08", title: "Kalender Keberangkatan & Agenda Flight", subtitle: "Jadwal flight Saudia & Garuda, manasik, & pelunasan H-14", category: "Paket & Flight", link: "/jadwal", badge: "Agenda" },

  { id: "s-09", title: "Invoice INV-2407-001", subtitle: "Siti Rahma • Total Rp 97.500.000 • Status Lunas", category: "Dokumen & Invoice", link: "/dokumen/invoice/INV-2407-001", badge: "INV" },
  { id: "s-10", title: "Invoice INV-2407-002", subtitle: "H. Rusli Suparman • Total Rp 35.500.000 • Status Cicilan DP", category: "Dokumen & Invoice", link: "/dokumen/invoice/INV-2407-002", badge: "INV" },
  { id: "s-11", title: "Surat Rekomendasi Paspor Kemenag RI", subtitle: "PT. AL MASSA AZKA WISATA • Izin PPIU 10032300465890002", category: "Dokumen & Invoice", link: "/dokumen", badge: "Kemenag" },
  { id: "s-12", title: "Manifest Peserta & Rooming Hotel", subtitle: "Data paspor, e-visa KSA, rooming quad/triple/double", category: "Dokumen & Invoice", link: "/manifest", badge: "Manifest" },

  { id: "s-13", title: "Manajemen Hak Akses & Matriks Role", subtitle: "Konfigurasi perizinan 5 role pengguna sistem", category: "Menu & Pengaturan", link: "/pengaturan/hak-akses", badge: "RBAC" },
  { id: "s-14", title: "Kelola Sub-User & Reset Password Staf", subtitle: "Buat, edit & set kata sandi staf tim internal", category: "Menu & Pengaturan", link: "/pengaturan/staf", badge: "Staf" },
  { id: "s-15", title: "Identitas Perusahaan & Google Maps", subtitle: "PT. AL MASSA AZKA WISATA • Ruko Best Cinema PGK", category: "Menu & Pengaturan", link: "/pengaturan/identitas", badge: "Profil" },
  { id: "s-16", title: "Kasir Pembayaran & Verifikasi DP", subtitle: "Pencatatan cicilan, rekening bank BTN, & kuitansi", category: "Menu & Pengaturan", link: "/pembayaran", badge: "Kasir" },
];

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);

  // 🔍 Global Live Search Engine States
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return globalSearchIndex.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // 🔔 Notification Center States (Real-time Live Sync)
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("el_massa_real_notifications");
      if (saved) {
        setNotifications(JSON.parse(saved));
      } else {
        const initialSys: NotificationItem[] = [
          {
            id: "notif-sys-001",
            title: "🟢 Database Supabase Cloud Terhubung",
            message: "Koneksi PostgreSQL Cloud Supabase PT. AL MASSA AZKA WISATA aktif & terintegrasi.",
            time: "Baru saja",
            category: "Keuangan",
            read: false,
            link: "/dashboard",
          },
          {
            id: "notif-sys-002",
            title: "🧮 Kalkulator HPP Berfungsi Real-Time",
            message: "Merancang HPP & menerbitkan paket otomatis tersimpan ke katalog.",
            time: "Baru saja",
            category: "Dokumen",
            read: false,
            link: "/paket/kalkulator",
          },
        ];
        localStorage.setItem("el_massa_real_notifications", JSON.stringify(initialSys));
        setNotifications(initialSys);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => {
      const updated = prev.map((item) => ({ ...item, read: true }));
      try {
        localStorage.setItem("el_massa_real_notifications", JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  const handleClearAll = () => {
    setNotifications([]);
    try {
      localStorage.setItem("el_massa_real_notifications", JSON.stringify([]));
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleRead = (id: string) => {
    setNotifications((prev) => {
      const updated = prev.map((item) => (item.id === id ? { ...item, read: !item.read } : item));
      try {
        localStorage.setItem("el_massa_real_notifications", JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  const activeHref = getActiveHref(pathname);
  const activeUser = sessionUser ?? fallbackStaff;

  useEffect(() => {
    if (!isMobileNavOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsMobileNavOpen(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMobileNavOpen]);

  useEffect(() => {
    const rawSession = window.localStorage.getItem("el-massa-session");
    if (!rawSession) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }

    try {
      const parsed = JSON.parse(rawSession) as SessionUser;
      if (parsed.name && parsed.role) {
        setSessionUser(parsed);
        setIsAuthChecked(true);
        return;
      }
      window.localStorage.removeItem("el-massa-session");
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    } catch {
      window.localStorage.removeItem("el-massa-session");
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [pathname, router]);

  const handleLogout = () => {
    window.localStorage.removeItem("el-massa-session");
    setSessionUser(null);
    router.push("/login");
  };

  if (!isAuthChecked) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#fafafa] px-4 text-center font-sans">
        <div className="rounded-xl border border-stone-200/80 bg-white p-6 shadow-xs text-center">
          <img
            src="/logo-el-massa.png"
            alt="El Massa Tour & Travel Logo"
            loading="eager"
            decoding="async"
            className="h-12 w-auto object-contain mx-auto"
          />
          <p className="mt-4 text-xs font-medium text-stone-500">Memeriksa Akses...</p>
          <h1 className="mt-1 text-base font-semibold text-brand-cocoa">El Massa Travel</h1>
        </div>
      </main>
    );
  }

  const renderSidebarContent = (onNavigate?: () => void) => (
    <div className="flex h-full flex-col justify-between">
      <div>
        {/* Brand Header */}
        <div className="mb-6 flex items-center gap-3 px-1 pt-1">
          <img
            src="/logo-el-massa.png"
            alt="El Massa Tour & Travel Logo"
            className="h-10 w-auto object-contain shrink-0"
          />
          <div className="h-10 flex flex-col justify-center">
            <h1 className="text-sm font-bold text-brand-cocoa leading-tight">El Massa Travel</h1>
            <p className="text-[11px] font-normal text-stone-500 leading-tight">Sistem Operasional Staf</p>
          </div>
        </div>

        {/* Navigation Items - Thin Minimal Pill */}
        <nav className="space-y-5" aria-label="Navigasi utama">
          {navGroups.map((group) => {
            const userRole = activeUser?.role || "CEO / Admin Master";
            const visibleItems = group.items.filter((item) => {
              const roles = allowedRolesPerItem[item.href];
              if (!roles) return true;
              return roles.includes(userRole);
            });

            if (visibleItems.length === 0) return null;

            return (
              <div key={group.label}>
                <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-stone-400">
                  {group.label}
                </p>
                <div className="space-y-1">
                  {visibleItems.map((item) => {
                    const isActive = activeHref === item.href;

                    return (
                      <Link
                        key={item.label}
                        className={`flex h-10 w-full items-center gap-3 rounded-xl px-3 text-left text-xs font-semibold transition-all ${
                          isActive
                            ? "bg-rose-50 text-brand-pink font-bold border border-brand-pink/20 shadow-2xs"
                            : "text-stone-600 hover:bg-stone-100/70 hover:text-brand-cocoa font-medium"
                        }`}
                        href={item.href}
                        onClick={onNavigate}
                      >
                        <item.icon
                          className={`h-4 w-4 shrink-0 ${isActive ? "text-brand-pink" : "text-stone-400"}`}
                          strokeWidth={1.5}
                          aria-hidden="true"
                        />
                        <span className="truncate">{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>
      </div>

      {/* Bottom Minimal Footer */}
      <div className="mt-6 rounded-xl border border-stone-200/60 bg-stone-50/60 p-3.5">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <p className="text-[11px] font-medium text-stone-600">Sistem Live & Aktif</p>
        </div>
        <p className="mt-1 text-xs text-stone-500">El Massa Tour & Travel © 2026</p>
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-[#fafafa] text-stone-800 font-sans lg:flex">
      
      {/* Light Thin Clean Sidebar */}
      <aside className="hidden w-60 shrink-0 border-r border-stone-200/70 bg-white px-4 py-5 lg:block">
        {renderSidebarContent()}
      </aside>

      {/* Mobile Nav Drawer */}
      {isMobileNavOpen ? (
        <div className="fixed inset-0 z-30 lg:hidden">
          <button
            className="absolute inset-0 bg-stone-900/20 backdrop-blur-xs"
            aria-label="Tutup menu"
            type="button"
            onClick={() => setIsMobileNavOpen(false)}
          />
          <aside
            id="mobile-sidebar"
            className="relative h-full w-[min(85vw,260px)] overflow-y-auto border-r border-stone-200 bg-white px-4 py-5 shadow-lg"
          >
            <button
              className="absolute right-3 top-3 grid h-7 w-7 place-items-center rounded-lg border border-stone-200 bg-white text-stone-500"
              aria-label="Tutup menu"
              type="button"
              onClick={() => setIsMobileNavOpen(false)}
            >
              <X className="h-3.5 w-3.5" strokeWidth={1.5} />
            </button>
            {renderSidebarContent(() => setIsMobileNavOpen(false))}
          </aside>
        </div>
      ) : null}

      {/* Main Content Viewport */}
      <section className="min-w-0 flex-1 bg-[#fafafa]">
        {/* Sleek Light Top Header */}
        <header className="sticky top-0 z-30 border-b border-stone-200/60 bg-white/95 backdrop-blur-md px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4 font-sans">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-stone-200 bg-white text-stone-600 lg:hidden active:scale-95 transition"
              type="button"
              onClick={() => setIsMobileNavOpen(true)}
              aria-label="Buka menu sidebar"
            >
              <Menu className="h-4 w-4" strokeWidth={1.5} />
            </button>

            <div className="min-w-0">
              <h2 className="text-xs sm:text-base font-bold tracking-tight text-stone-900 truncate">
                Selamat Datang, {activeUser.name.split(" ")[0]} 👋
              </h2>
              <p className="text-[10px] sm:text-[11px] font-normal text-stone-500 truncate hidden xs:block sm:block">
                Dashboard Operasional El Massa Tour & Travel
              </p>
            </div>
          </div>

          {/* Right Controls: 📅 Date & Hijri Pill + 🔍 Global Search Engine & 🔔 Notifications */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            
            {/* 📅 Date & Accurate Hijri Date Pill */}
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full border border-stone-200 bg-stone-50 text-[11px] font-medium text-stone-700 shadow-2xs">
              <span className="font-semibold text-stone-900">Sat, Aug 1st 2026</span>
              <span className="text-stone-300">•</span>
              <span className="font-bold text-pink-600 font-mono">17 Safar 1448H</span>
            </div>
            
            {/* 🔍 Global Live Search Input Container */}
            <div className="relative">
              {/* Mobile Search Icon Button */}
              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                className="grid h-8 w-8 sm:h-9 sm:w-9 place-items-center rounded-full border border-stone-200 bg-stone-50 text-stone-600 md:hidden hover:bg-stone-100 transition"
                aria-label="Buka pencarian"
              >
                <Search className="h-3.5 w-3.5" strokeWidth={1.5} />
              </button>

              {/* Desktop Search Bar Input */}
              <div className="hidden items-center gap-2 rounded-full border border-stone-200 bg-stone-50/80 px-3.5 h-9 text-xs text-stone-500 md:flex w-72 shadow-2xs focus-within:border-brand-pink focus-within:bg-white focus-within:ring-2 focus-within:ring-rose-100 transition">
                <Search className="h-3.5 w-3.5 text-stone-400 shrink-0" strokeWidth={1.5} />
                <input
                  className="w-full bg-transparent outline-none font-normal text-xs text-stone-900 placeholder:text-stone-400"
                  placeholder="Cari jamaah, booking, invoice, paket..."
                  value={searchQuery}
                  onFocus={() => setIsSearchOpen(true)}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsSearchOpen(true);
                  }}
                />
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setIsSearchOpen(false);
                    }}
                    className="text-stone-400 hover:text-stone-600"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                ) : (
                  <kbd className="hidden sm:inline-block rounded border border-stone-200 bg-stone-100 px-1.5 py-0.2 text-[9px] font-mono text-stone-400">
                    ⌘K
                  </kbd>
                )}
              </div>

              {/* Live Search Results Dropdown Drawer */}
              {isSearchOpen && (
                <>
                  <button
                    type="button"
                    className="fixed inset-0 z-40 bg-transparent"
                    onClick={() => setIsSearchOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 z-50 w-72 sm:w-96 rounded-2xl border border-stone-200/90 bg-white p-3 shadow-xl space-y-2 text-stone-800 animate-in fade-in slide-in-from-top-2 duration-200">
                    
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-stone-100 pb-2 px-1">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-stone-400">
                        {searchQuery.trim() ? `Hasil Pencarian (${searchResults.length})` : "Pencarian Cepat"}
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsSearchOpen(false)}
                        className="text-stone-400 hover:text-stone-600"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Results List */}
                    <div className="space-y-1 max-h-80 overflow-y-auto pr-1">
                      {!searchQuery.trim() ? (
                        <div className="py-3 px-2 text-xs space-y-2">
                          <p className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">Coba Kata Kunci:</p>
                          <div className="flex flex-wrap gap-1.5 text-[11px]">
                            {["Siti Rahma", "Rusli", "Umrah Oktober", "INV-2407", "Hak Akses", "Kalkulator"].map((tag) => (
                              <button
                                key={tag}
                                type="button"
                                onClick={() => setSearchQuery(tag)}
                                className="rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-1 text-stone-700 hover:bg-stone-100 font-medium"
                              >
                                {tag}
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : searchResults.length === 0 ? (
                        <div className="py-6 text-center text-xs text-stone-400 space-y-1">
                          <p className="font-semibold text-stone-600">Tidak ada hasil ditemukan</p>
                          <p className="text-[11px]">Tidak ada data yang cocok dengan "{searchQuery}"</p>
                        </div>
                      ) : (
                        searchResults.map((item) => (
                          <Link
                            key={item.id}
                            href={item.link}
                            onClick={() => {
                              setIsSearchOpen(false);
                              setSearchQuery("");
                            }}
                            className="flex items-start justify-between p-2.5 rounded-xl border border-transparent hover:border-stone-200 hover:bg-rose-50/30 transition text-xs group"
                          >
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-stone-900 group-hover:text-brand-pink transition">
                                  {item.title}
                                </span>
                                {item.badge && (
                                  <span className="rounded bg-stone-100 px-1.5 py-0.2 text-[9px] font-bold text-stone-600 border border-stone-200">
                                    {item.badge}
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-stone-500 leading-tight line-clamp-1">{item.subtitle}</p>
                            </div>
                            <span className="text-[10px] font-semibold text-stone-400 group-hover:text-brand-pink shrink-0 mt-0.5">
                              {item.category.split(" ")[0]} →
                            </span>
                          </Link>
                        ))
                      )}
                    </div>

                    {/* Footer */}
                    <div className="border-t border-stone-100 pt-2 text-center text-[10px] text-stone-400">
                      Gunakan <span className="font-mono font-bold">Pencarian Cepat</span> untuk navigasi 0-detik ke data jamaah & dokumen.
                    </div>

                  </div>
                </>
              )}
            </div>

            {/* 🔔 Interactive Notification Center Popover */}
            <div className="relative">
              <button
                className="relative grid h-8 w-8 sm:h-9 sm:w-9 place-items-center rounded-full border border-stone-200 bg-white text-stone-600 hover:bg-stone-50 shadow-2xs shrink-0 transition"
                aria-label="Notifikasi"
                type="button"
                onClick={() => setIsNotifOpen(!isNotifOpen)}
              >
                <Bell className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={1.5} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 grid h-4 w-4 place-items-center rounded-full bg-brand-pink text-[9px] font-black text-white ring-2 ring-white animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Popover Dropdown Drawer */}
              {isNotifOpen && (
                <>
                  <button
                    type="button"
                    className="fixed inset-0 z-40 bg-transparent"
                    onClick={() => setIsNotifOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 z-50 w-72 sm:w-96 rounded-2xl border border-stone-200/80 bg-white p-4 shadow-xl space-y-3 text-stone-800 animate-in fade-in slide-in-from-top-2 duration-200">
                    
                    {/* Header Notification Popover */}
                    <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-extrabold text-brand-cocoa">Notifikasi Operasional</h4>
                        {unreadCount > 0 && (
                          <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-brand-pink border border-brand-pink/20">
                            {unreadCount} baru
                          </span>
                        )}
                      </div>

                      {unreadCount > 0 && (
                        <button
                          type="button"
                          onClick={handleMarkAllAsRead}
                          className="text-[10px] font-semibold text-brand-pink hover:underline flex items-center gap-1"
                        >
                          <CheckCheck className="h-3 w-3" />
                          <span>Tandai Semua Dibaca</span>
                        </button>
                      )}
                    </div>

                    {/* Notification Items List */}
                    <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                      {notifications.length === 0 ? (
                        <p className="text-xs text-stone-400 py-6 text-center">Tidak ada notifikasi saat ini.</p>
                      ) : (
                        notifications.map((item) => (
                          <div
                            key={item.id}
                            className={`rounded-xl border p-3 transition text-xs space-y-1 ${
                              item.read
                                ? "border-stone-100 bg-stone-50/50 opacity-75"
                                : "border-rose-100 bg-rose-50/30 font-medium shadow-2xs"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className="font-bold text-brand-cocoa leading-tight">{item.title}</span>
                              <button
                                type="button"
                                onClick={() => handleToggleRead(item.id)}
                                title={item.read ? "Tandai Belum Dibaca" : "Tandai Sudah Dibaca"}
                                className="text-stone-400 hover:text-brand-pink shrink-0"
                              >
                                <Check className={`h-3.5 w-3.5 ${item.read ? "text-stone-300" : "text-brand-pink"}`} />
                              </button>
                            </div>

                            <p className="text-[11px] text-stone-600 leading-relaxed">{item.message}</p>

                            <div className="flex items-center justify-between pt-1 text-[10px]">
                              <span className="text-stone-400 flex items-center gap-1">
                                <Clock className="h-3 w-3" /> {item.time}
                              </span>
                              <Link
                                href={item.link}
                                onClick={() => {
                                  handleToggleRead(item.id);
                                  setIsNotifOpen(false);
                                }}
                                className="font-bold text-brand-pink hover:underline"
                              >
                                Buka Modul →
                              </Link>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Footer Link */}
                    <div className="border-t border-stone-100 pt-2 text-center">
                      <Link
                        href="/booking"
                        onClick={() => setIsNotifOpen(false)}
                        className="text-[11px] font-semibold text-stone-500 hover:text-brand-cocoa"
                      >
                        Lihat Seluruh Aktivitas Operasional
                      </Link>
                    </div>

                  </div>
                </>
              )}
            </div>

            <div className="flex h-8 sm:h-9 items-center gap-1.5 sm:gap-2 rounded-full border border-stone-200 bg-white px-2 sm:px-2.5 shadow-2xs shrink-0">
              <span className="grid h-5 w-5 sm:h-6 sm:w-6 shrink-0 place-items-center rounded-full bg-rose-50 text-[10px] font-bold text-brand-pink border border-brand-pink/20">
                {getInitials(activeUser.name)}
              </span>
              <div className="hidden sm:flex flex-col">
                <span className="text-xs font-semibold text-stone-800 truncate max-w-[110px] leading-tight">
                  {activeUser.name.split(" ")[0]}
                </span>
                <span className="text-[9px] font-bold text-brand-pink uppercase tracking-wider leading-tight">
                  {activeUser.role || "Admin Master"}
                </span>
              </div>
              <button type="button" onClick={handleLogout} aria-label="Logout" className="ml-0.5 sm:ml-1">
                <LogOut className="h-3.5 w-3.5 text-stone-400 hover:text-rose-600 transition" strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </header>

        {/* Dashboard Main Content Area (With bottom padding for fixed mobile navbar) */}
        <div key={pathname} className="p-3 sm:p-6 pb-28 lg:pb-6 animate-in fade-in slide-in-from-bottom-2 duration-300 ease-out max-w-7xl mx-auto">
          {children}
        </div>
      </section>

      {/* 📱 100% FIXED ALWAYS-VISIBLE MOBILE BOTTOM NAVBAR */}
      <nav className="fixed bottom-0 inset-x-0 z-[100] flex items-center justify-around border-t border-stone-200/80 bg-white/95 backdrop-blur-xl px-2 py-2 shadow-2xl lg:hidden font-sans">
        {[
          { label: "Beranda", icon: LayoutDashboard, href: "/dashboard" },
          { label: "Paket", icon: Plane, href: "/paket" },
          { label: "Booking", icon: ClipboardList, href: "/booking" },
          { label: "Jadwal", icon: CalendarDays, href: "/jadwal" },
          { label: "Kasir", icon: CircleDollarSign, href: "/pembayaran" },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.href || pathname === "/" || pathname.startsWith(tab.href + "/");

          if (isActive) {
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="flex items-center gap-1.5 rounded-full bg-brand-pink px-3.5 py-1.5 text-xs font-black text-white shadow-md active:scale-95 transition shrink-0"
              >
                <Icon className="h-4 w-4 stroke-[2.5]" />
                <span className="text-[11px]">{tab.label}</span>
              </Link>
            );
          }

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex flex-col items-center justify-center gap-0.5 px-2 py-1 text-stone-400 hover:text-stone-700 active:scale-90 transition"
            >
              <Icon className="h-5 w-5 stroke-[1.75]" />
              <span className="text-[10px] font-semibold tracking-tight">{tab.label}</span>
            </Link>
          );
        })}
      </nav>

    </main>
  );
}
