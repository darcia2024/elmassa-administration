import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Sora } from "next/font/google";
import "./katalog.css";

// Same face as temantiket.com. Self-hosted by next/font (no request to Google
// at runtime) and scoped to the katalog; the staff app keeps Manrope.
const sora = Sora({ subsets: ["latin"], display: "swap", variable: "--font-sora" });

const SITE = process.env.NEXT_PUBLIC_APP_URL || "https://elmassa-administration.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: "Paket Umrah El Massa Tour & Travel",
  description: "Pilih paket umrah El Massa dari Pangkal Pinang: harga, jadwal, itinerary, dan sisa seat yang diperbarui otomatis.",
};

export default function KatalogLayout({ children }: { children: ReactNode }) {
  return <div className={`katalog ${sora.variable} ${sora.className} min-h-screen`}>{children}</div>;
}
