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
    <nav className="print-hidden overflow-x-auto rounded-lg border border-brand-rose bg-white p-2 shadow-soft" aria-label="Navigasi laporan">
      <div className="flex min-w-max gap-2">
        {reportItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              className={`inline-flex h-10 items-center gap-2 rounded-md px-3 text-sm font-bold transition ${
                isActive
                  ? "bg-brand-pink text-white"
                  : "text-brand-cocoa hover:bg-brand-cream"
              }`}
              href={item.href}
            >
              <item.icon className="h-4 w-4" aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
