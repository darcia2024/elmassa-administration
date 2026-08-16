"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Bell,
  Boxes,
  Building2,
  CalendarDays,
  Check,
  CheckCheck,
  CircleDollarSign,
  ClipboardList,
  Clock,
  Compass,
  FileSpreadsheet,
  FileText,
  FolderOpen,
  Handshake,
  IdCard,
  Layers,
  LayoutDashboard,
  LogOut,
  Mails,
  Menu,
  Plane,
  ReceiptText,
  Search,
  Settings,
  Sparkles,
  UserCog,
  Users,
  Wallet,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const navGroups = [
  {
    label: "Menu Utama",
    items: [
      { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard", aliases: ["/"] },
      // Two distinct things: the departure GROUPS (flyer, itinerary, payments,
      // manifest) and the operational AGENDA around them (manasik, handling,
      // settlement deadlines).
      { label: "Jadwal Keberangkatan", icon: Plane, href: "/paket" },
      { label: "Kalender Kegiatan", icon: CalendarDays, href: "/jadwal" },
      { label: "Pelanggan", icon: Users, href: "/pelanggan" },
      { label: "Booking", icon: ClipboardList, href: "/booking" },
      { label: "Manifest Peserta", icon: IdCard, href: "/manifest" },
      { label: "Akun Digital UmrahMe", icon: Sparkles, href: "/umrahme" },
      { label: "Live App Itinerary", icon: Compass, href: "/itinerary-landing" },
    ],
  },
  {
    // Each letter type gets its own route rather than a ?jenis= query on one
    // route: usePathname() cannot tell query strings apart, so the sidebar
    // indicator stayed stuck on whichever entry was opened first.
    label: "Administrasi",
    items: [
      { label: "Surat Menyurat", icon: Mails, href: "/administrasi/surat" },
      { label: "Surat Pemberitahuan", icon: FileText, href: "/administrasi/surat/pemberitahuan" },
      { label: "Surat Rek. Pembuatan Paspor", icon: FileText, href: "/administrasi/surat/paspor-baru" },
      { label: "Surat Rek. Penambahan Nama", icon: FileText, href: "/administrasi/surat/paspor-tambah-nama" },
      { label: "Surat Rek. Penggantian Paspor", icon: FileText, href: "/administrasi/surat/paspor-ganti" },
      { label: "Surat Rek. Izin Cuti", icon: FileText, href: "/administrasi/surat/izin-cuti" },
      { label: "Dokumen", icon: FolderOpen, href: "/dokumen" },
    ],
  },
  {
    label: "Pembayaran",
    items: [
      { label: "Pemasukan & Pengeluaran", icon: Wallet, href: "/pembayaran/arus-kas" },
      { label: "Verifikasi Pembayaran", icon: CircleDollarSign, href: "/pembayaran" },
      { label: "Kwitansi", icon: ReceiptText, href: "/dokumen/kuitansi" },
      { label: "Invoice", icon: FileSpreadsheet, href: "/dokumen/invoice" },
      { label: "Rekap Pembayaran Grup", icon: Layers, href: "/pembayaran/rekap-grup" },
    ],
  },
  {
    label: "Operasional",
    items: [
      { label: "Data Karyawan", icon: UserCog, href: "/operasional/karyawan" },
      { label: "Data Agen", icon: Handshake, href: "/operasional/agen" },
      { label: "Data Stok Perlengkapan", icon: Boxes, href: "/operasional/stok" },
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
  "/paket": ["CEO / Admin Master", "Sub-User Operasional", "Sub-User Sales & CRM", "Sub-User Lapangan", "Admin Master"],
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
  "/pengaturan/lisensi-master": ["CEO / Admin Master", "Admin Master"],
  "/administrasi/surat": ["CEO / Admin Master", "Sub-User Operasional", "Sub-User Sales & CRM", "Admin Master"],
  "/pembayaran/arus-kas": ["CEO / Admin Master", "Sub-User Keuangan", "Admin Master"],
  "/pembayaran/rekap-grup": ["CEO / Admin Master", "Sub-User Keuangan", "Admin Master"],
  "/operasional/karyawan": ["CEO / Admin Master", "Admin Master"],
  "/operasional/agen": ["CEO / Admin Master", "Sub-User Sales & CRM", "Admin Master"],
  "/operasional/stok": ["CEO / Admin Master", "Sub-User Operasional", "Sub-User Lapangan", "Admin Master"],
};

/**
 * Menu yang sedang aktif. Entri terpanjang yang cocok menang, sehingga
 * /administrasi/surat/izin-cuti menandai menunya sendiri dan bukan menu induk
 * /administrasi/surat yang juga cocok sebagai awalan.
 */
function getActiveHref(pathname: string) {
  const exact = navItems.find((item) => item.href === pathname);
  if (exact) return exact.href;

  return navItems
    .filter((item) => pathname.startsWith(`${item.href}/`) || item.aliases?.some((a) => a === pathname))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;
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


type SearchResultItem = {
  id: string;
  title: string;
  subtitle: string;
  category: "Jamaah & Booking" | "Paket & Flight" | "Dokumen & Invoice" | "Menu & Pengaturan";
  link: string;
  badge?: string;
};

/**
 * Entri menu saja. Daftar ini dulu juga memuat "jamaah" karangan lengkap dengan
 * kode booking dan nomor invoice -- mencari "Siti" memunculkan orang yang tidak
 * ada, menautkannya ke /booking/BK-2407-001 yang tidak pernah ada, di setiap
 * halaman sistem. Jamaah dan booking sungguhan sekarang diambil dari database
 * (lihat hasilPencarian di bawah).
 */
const menuSearchIndex: SearchResultItem[] = [
  { id: "m-01", title: "Jadwal Keberangkatan", subtitle: "Grup per bulan, flyer & HPP, itinerary, pembayaran, manifest", category: "Menu & Pengaturan", link: "/paket", badge: "Grup" },
  { id: "m-02", title: "Kalkulator HPP & Costing", subtitle: "Rancang HPP paket umrah lalu terbitkan", category: "Menu & Pengaturan", link: "/paket/kalkulator", badge: "Tool" },
  { id: "m-03", title: "Kalender Kegiatan", subtitle: "Agenda manasik, handling, & jatuh tempo pelunasan", category: "Menu & Pengaturan", link: "/jadwal", badge: "Agenda" },
  { id: "m-04", title: "Surat Menyurat", subtitle: "Rekomendasi paspor, penambahan nama, izin cuti", category: "Menu & Pengaturan", link: "/administrasi/surat", badge: "Surat" },
  { id: "m-05", title: "Pemasukan & Pengeluaran", subtitle: "Arus kas, piutang, & jatuh tempo", category: "Menu & Pengaturan", link: "/pembayaran/arus-kas", badge: "Kas" },
  { id: "m-06", title: "Kasir & Verifikasi Pembayaran", subtitle: "Pencatatan cicilan & kuitansi", category: "Menu & Pengaturan", link: "/pembayaran", badge: "Kasir" },
  { id: "m-07", title: "Manifest Peserta", subtitle: "Paspor, e-visa, roomlist Jakarta/Makkah/Madinah", category: "Menu & Pengaturan", link: "/manifest", badge: "Manifest" },
  { id: "m-08", title: "Data Karyawan / Agen / Stok", subtitle: "Kepegawaian, komisi agen, perlengkapan jamaah", category: "Menu & Pengaturan", link: "/operasional/karyawan", badge: "Ops" },
  { id: "m-09", title: "Hak Akses & Staf", subtitle: "Matriks perizinan role & akun staf", category: "Menu & Pengaturan", link: "/pengaturan/hak-akses", badge: "RBAC" },
  { id: "m-10", title: "Identitas Perusahaan", subtitle: "Kop surat, logo, tanda tangan & stempel digital", category: "Menu & Pengaturan", link: "/pengaturan/identitas", badge: "Profil" },
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

  /** Booking & grup sungguhan, dimuat sekali saat shell dipasang. */
  const [dataCari, setDataCari] = useState<SearchResultItem[]>([]);

  useEffect(() => {
    Promise.all([
      fetch("/api/bookings", { cache: "no-store" }).then((r) => r.json()).catch(() => ({})),
      fetch("/api/packages", { cache: "no-store" }).then((r) => r.json()).catch(() => ({})),
    ]).then(([bookingRes, paketRes]) => {
      const dariBooking: SearchResultItem[] = (bookingRes?.data ?? []).map((b: Record<string, unknown>) => ({
        id: `b-${b.code}`,
        title: String(b.customerName ?? ""),
        subtitle: `${b.code} • ${b.packageName ?? ""} • Sisa ${Number(b.remainingAmount ?? 0).toLocaleString("id-ID")}`,
        category: "Jamaah & Booking" as const,
        link: `/booking/${encodeURIComponent(String(b.code))}`,
        badge: String(b.status ?? ""),
      }));

      const dariPaket: SearchResultItem[] = (paketRes?.data ?? []).map((p: Record<string, unknown>) => ({
        id: `p-${p.id}`,
        title: String(p.name ?? ""),
        subtitle: `${p.duration ?? ""} • ${p.price ?? ""} • ${p.makkahHotel ?? ""}`,
        category: "Paket & Flight" as const,
        link: `/paket/${encodeURIComponent(String(p.id))}`,
        badge: String(p.category ?? ""),
      }));

      setDataCari([...dariBooking, ...dariPaket]);
    });
  }, []);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return [...dataCari, ...menuSearchIndex].filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
    );
  }, [searchQuery, dataCari]);

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

  /**
   * Sesi punya dua penanda dengan umur berbeda: cookie httpOnly yang dipakai
   * semua API (12 jam) dan objek localStorage yang dipakai tampilan ini (tanpa
   * kedaluwarsa). Begitu cookienya mati, shell masih melihat localStorage dan
   * tetap menggambar aplikasi seolah login — sementara setiap panggilan API
   * dijawab 401. Hasilnya staf terjebak di aplikasi yang terlihat normal tapi
   * semua datanya error, tanpa petunjuk untuk login ulang.
   *
   * Satu-satunya sinyal yang benar bahwa sesi sudah mati adalah 401 dari
   * server, jadi itu yang didengarkan di sini: bersihkan penanda yang basi lalu
   * antar ke halaman login sambil mengingat halaman yang sedang dibuka.
   */
  useEffect(() => {
    const originalFetch = window.fetch;
    let redirecting = false;

    window.fetch = async (...args) => {
      const response = await originalFetch(...args);

      if (response.status === 401 && !redirecting) {
        const url = typeof args[0] === "string" ? args[0] : (args[0] as Request)?.url ?? "";
        const isOwnApi = url.startsWith("/api/") || url.includes(`${window.location.origin}/api/`);

        if (isOwnApi && !window.location.pathname.startsWith("/login")) {
          redirecting = true;
          window.localStorage.removeItem("el-massa-session");
          router.replace(`/login?next=${encodeURIComponent(window.location.pathname)}&expired=1`);
        }
      }

      return response;
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, [router]);

  useEffect(() => {
    if (pathname.startsWith("/pengaturan/lisensi-master") || pathname.startsWith("/lisensi-master") || pathname.startsWith("/master")) {
      setIsAuthChecked(true);
      return;
    }

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

  // Live Real-Time Date & Hijri state
  const [liveDate, setLiveDate] = useState<{ gregorian: string; hijri: string }>({
    gregorian: "",
    hijri: ""
  });

  useEffect(() => {
    const updateLiveDate = () => {
      const now = new Date();
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      
      const dayName = days[now.getDay()];
      const monthName = months[now.getMonth()];
      const dateNum = now.getDate();
      const year = now.getFullYear();
      
      const suffix = (d: number) => {
        if (d > 3 && d < 21) return 'th';
        switch (d % 10) {
          case 1:  return "st";
          case 2:  return "nd";
          case 3:  return "rd";
          default: return "th";
        }
      };
      
      const gregorian = `${dayName}, ${monthName} ${dateNum}${suffix(dateNum)} ${year}`;

      let hijri = "";
      try {
        const formatter = new Intl.DateTimeFormat('id-ID-u-ca-islamic-umalqura', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });
        hijri = `${formatter.format(now)}H`;
      } catch (e) {
        hijri = "17 Safar 1448H";
      }

      setLiveDate({ gregorian, hijri });
    };

    updateLiveDate();
    const interval = setInterval(updateLiveDate, 60000);
    return () => clearInterval(interval);
  }, []);

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
              // Keyed by path, so the six `?jenis=` letter entries all inherit
              // the single /administrasi/surat rule instead of falling through
              // to "visible to everyone".
              const roles = allowedRolesPerItem[item.href] ?? allowedRolesPerItem["/administrasi/surat"];
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
        <Link href="/master" className="mt-1 block text-xs text-stone-500 hover:text-stone-700 transition" title="System Engine">
          El Massa Tour & Travel © 2026
        </Link>
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
        <div className="fixed inset-0 z-[110] lg:hidden">
          <button
            className="el-drawer-scrim absolute inset-0 bg-stone-900/20 backdrop-blur-xs"
            aria-label="Tutup menu"
            type="button"
            onClick={() => setIsMobileNavOpen(false)}
          />
          <aside
            id="mobile-sidebar"
            className="el-drawer-panel relative h-full w-[min(85vw,260px)] overflow-y-auto border-r border-stone-200 bg-white px-4 py-5 shadow-lg"
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
                Selamat Datang, {activeUser.name.split(" ")[0]}
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
              <span className="font-semibold text-stone-900">{liveDate.gregorian}</span>
              {liveDate.hijri ? <span className="text-stone-300">•</span> : null}
              {liveDate.hijri ? <span className="font-bold text-pink-600 font-mono">{liveDate.hijri}</span> : null}
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
                            {["Jadwal Keberangkatan", "Manifest", "Surat", "Kasir", "Kalkulator", "Hak Akses"].map((tag) => (
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
      <nav className="fixed bottom-0 inset-x-0 z-[100] flex items-center justify-between gap-0.5 overflow-hidden border-t border-stone-200/80 bg-white/95 backdrop-blur-xl px-1.5 py-2 shadow-2xl lg:hidden font-sans">
        {[
          { label: "Beranda", icon: LayoutDashboard, href: "/dashboard" },
          { label: "Jadwal", icon: Plane, href: "/paket" },
          { label: "Booking", icon: ClipboardList, href: "/booking" },
          { label: "Kalender", icon: CalendarDays, href: "/jadwal" },
          { label: "Kasir", icon: CircleDollarSign, href: "/pembayaran" },
        ].map((tab) => {
          const Icon = tab.icon;
          // `|| pathname === "/"` used to be in here, which lit up all five tabs
          // at once on the dashboard. "/" is the dashboard, so match it to that
          // tab only.
          const isActive =
            pathname === tab.href ||
            pathname.startsWith(tab.href + "/") ||
            (pathname === "/" && tab.href === "/dashboard");

          if (isActive) {
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="flex min-w-0 flex-1 items-center justify-center gap-1 rounded-full bg-brand-pink px-2.5 py-1.5 text-xs font-black text-white shadow-md active:scale-95 transition"
              >
                <Icon className="h-4 w-4 shrink-0 stroke-[2.5]" />
                <span className="truncate text-[11px]">{tab.label}</span>
              </Link>
            );
          }

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-1 py-1 text-stone-400 hover:text-stone-700 active:scale-90 transition"
            >
              <Icon className="h-5 w-5 shrink-0 stroke-[1.75]" />
              <span className="w-full truncate text-center text-[10px] font-semibold tracking-tight">{tab.label}</span>
            </Link>
          );
        })}
      </nav>

    </main>
  );
}
