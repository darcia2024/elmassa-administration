"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import {
  BarChart3,
  Bell,
  Building2,
  CalendarDays,
  ChevronDown,
  CircleDollarSign,
  ClipboardList,
  FileText,
  IdCard,
  LayoutDashboard,
  LogOut,
  Menu,
  Plane,
  ReceiptText,
  Search,
  Settings,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";

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
  eyebrow: string;
  title: string;
  children: ReactNode;
};

const fallbackStaff = {
  name: "Maya Safitri",
  role: "Admin Operasional",
  initials: "MS",
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

export function AppShell({ eyebrow, title, children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);
  const activeHref = getActiveHref(pathname);
  const activeUser = sessionUser ?? fallbackStaff;

  useEffect(() => {
    if (!isMobileNavOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMobileNavOpen(false);
      }
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
      <main className="grid min-h-screen place-items-center bg-brand-cream px-4 text-center">
        <div className="rounded-lg border border-stone-200 bg-white p-6 shadow-soft">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-lg bg-brand-rose text-lg font-black text-brand-pink">
            EM
          </div>
          <p className="mt-4 text-sm font-bold uppercase text-brand-brown">Memeriksa akses</p>
          <h1 className="mt-2 text-xl font-bold text-brand-cocoa">El Massa Travel Admin</h1>
        </div>
      </main>
    );
  }

  const renderSidebarContent = (onNavigate?: () => void) => (
    <>
      <div className="mb-8 flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-lg bg-brand-pink text-lg font-black text-white">
          EM
        </div>
        <div>
          <p className="text-sm font-semibold uppercase text-brand-brown">El Massa</p>
          <h1 className="text-lg font-bold text-brand-cocoa">Tour & Travel</h1>
        </div>
      </div>

      <nav className="space-y-6" aria-label="Navigasi utama">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-wide text-brand-brown/70">
              {group.label}
            </p>
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = activeHref === item.href;

                return (
                  <Link
                    key={item.label}
                    className={`relative flex h-11 w-full items-center gap-3 rounded-md px-3 text-left text-sm font-medium transition ${
                      isActive
                        ? "bg-brand-rose text-brand-cocoa shadow-sm ring-1 ring-brand-pink/20"
                        : "text-stone-600 hover:bg-stone-100 hover:text-brand-cocoa"
                    }`}
                    href={item.href}
                    onClick={onNavigate}
                  >
                    {isActive ? (
                      <span className="absolute left-0 h-6 w-1 rounded-r-full bg-brand-pink" aria-hidden="true" />
                    ) : null}
                    <item.icon
                      className={`h-4 w-4 ${isActive ? "text-brand-pink" : "text-brand-brown/70"}`}
                      aria-hidden="true"
                    />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="mt-8 rounded-lg border border-brand-rose bg-brand-cream p-4">
        <p className="text-xs font-semibold uppercase text-brand-brown">MVP Internal</p>
        <p className="mt-1 text-sm font-bold text-brand-cocoa">El Massa Travel</p>
        <p className="mt-2 text-xs leading-5 text-stone-600">
          Operasional paket, booking, dokumen, dan cicilan dalam satu sistem.
        </p>
      </div>
    </>
  );

  return (
    <main className="min-h-screen lg:flex">
      <aside className="hidden w-72 shrink-0 border-r border-stone-200/80 bg-white/82 px-5 py-6 shadow-soft lg:block">
        {renderSidebarContent()}
      </aside>

      {isMobileNavOpen ? (
        <div className="fixed inset-0 z-30 lg:hidden">
          <button
            className="absolute inset-0 bg-brand-cocoa/40"
            aria-label="Tutup menu"
            type="button"
            onClick={() => setIsMobileNavOpen(false)}
          />
          <aside
            id="mobile-sidebar"
            className="relative h-full w-[min(86vw,320px)] overflow-y-auto border-r border-stone-200 bg-white px-5 py-6 shadow-soft"
          >
            <button
              className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-md border border-stone-200 bg-white text-brand-cocoa"
              aria-label="Tutup menu"
              type="button"
              onClick={() => setIsMobileNavOpen(false)}
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
            {renderSidebarContent(() => setIsMobileNavOpen(false))}
          </aside>
        </div>
      ) : null}

      <section className="min-w-0 flex-1">
        <header className="sticky top-0 z-10 border-b border-stone-200/80 bg-brand-cream/85 backdrop-blur">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
            <button
              className="grid h-10 w-10 place-items-center rounded-md border border-stone-200 bg-white text-brand-cocoa lg:hidden"
              aria-label="Buka menu"
              aria-expanded={isMobileNavOpen}
              aria-controls="mobile-sidebar"
              type="button"
              onClick={() => setIsMobileNavOpen(true)}
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>
            <div className="flex shrink-0 items-center gap-2">
              <div className="grid h-9 w-9 place-items-center rounded-md bg-brand-pink text-sm font-black text-white">
                EM
              </div>
              <div className="hidden min-w-0 xl:block">
                <p className="text-xs font-semibold uppercase text-brand-brown">El Massa</p>
                <p className="truncate text-sm font-bold text-brand-cocoa">Travel Admin</p>
              </div>
            </div>
            <span className="hidden h-8 w-px bg-stone-200 xl:block" aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase text-brand-brown">{eyebrow}</p>
              <h2 className="truncate text-lg font-bold text-brand-cocoa sm:text-xl">{title}</h2>
            </div>
            <label className="hidden h-10 w-72 items-center gap-2 rounded-md border border-stone-200 bg-white px-3 text-sm text-stone-500 md:flex">
              <Search className="h-4 w-4" aria-hidden="true" />
              <input className="w-full bg-transparent outline-none" placeholder="Cari booking atau pelanggan" />
            </label>
            <button
              className="hidden h-10 w-10 place-items-center rounded-md border border-stone-200 bg-white text-brand-cocoa sm:grid"
              aria-label="Notifikasi"
              type="button"
            >
              <Bell className="h-4 w-4" aria-hidden="true" />
            </button>
            <button className="flex h-10 min-w-0 items-center gap-2 rounded-md border border-stone-200 bg-white px-2.5 text-left text-sm font-semibold text-brand-cocoa sm:px-3" type="button">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-brand-rose text-xs font-black text-brand-pink">
                {sessionUser ? getInitials(sessionUser.name) : fallbackStaff.initials}
              </span>
              <span className="hidden min-w-0 sm:block">
                <span className="block truncate leading-4">{activeUser.name}</span>
                <span className="block truncate text-xs font-medium text-stone-500">{activeUser.role}</span>
              </span>
              <ChevronDown className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              className="grid h-10 w-10 place-items-center rounded-md border border-stone-200 bg-white text-brand-cocoa"
              aria-label="Logout"
              type="button"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </header>

        <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">{children}</div>
      </section>
    </main>
  );
}
