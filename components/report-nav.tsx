"use client";

import { BarChart3, FileText, Plane, TrendingUp, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const reportItems = [
  { label: "Sisa Tagihan", href: "/laporan", icon: FileText },
  { label: "Transaksi", href: "/laporan/transaksi", icon: BarChart3 },
  { label: "Pendapatan", href: "/laporan/pendapatan", icon: TrendingUp },
  { label: "Booking", href: "/laporan/booking", icon: Plane },
  { label: "Manifest", href: "/laporan/manifest", icon: Users },
];

export function ReportNav() {
  const pathname = usePathname();

  return (
    <nav className="print-hidden overflow-x-auto rounded-2xl border border-stone-200/70 bg-white p-1.5 shadow-2xs" aria-label="Navigasi laporan">
      <div className="flex min-w-max items-center gap-1">
        {reportItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              className={`inline-flex h-9 items-center gap-2 rounded-xl px-3.5 text-xs font-semibold transition-all ${
                isActive
                  ? "bg-rose-50 text-brand-pink border border-brand-pink/20 font-bold shadow-2xs"
                  : "text-stone-600 hover:bg-stone-50 hover:text-stone-900"
              }`}
              href={item.href}
            >
              <item.icon className={`h-3.5 w-3.5 ${isActive ? "text-brand-pink" : "text-stone-400"}`} strokeWidth={1.5} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
