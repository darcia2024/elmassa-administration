import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./katalog.css";

const SITE = process.env.NEXT_PUBLIC_APP_URL || "https://elmassa-administration.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: "Paket Umrah El Massa Tour & Travel",
  description: "Pilih paket umrah El Massa dari Pangkal Pinang: harga, jadwal, itinerary, dan sisa seat yang diperbarui otomatis.",
};

export default function KatalogLayout({ children }: { children: ReactNode }) {
  return <div className="katalog min-h-screen">{children}</div>;
}
