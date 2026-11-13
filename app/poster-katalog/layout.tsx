import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./katalog.css";
import { KatalogReveal } from "./katalog-reveal";

const SITE = process.env.NEXT_PUBLIC_APP_URL || "https://elmassa-administration.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: "Jadwal Umrah El Massa Tour & Travel",
  description: "Jadwal keberangkatan umrah El Massa dari Pangkal Pinang: poster, harga, itinerary, dan sisa seat yang diperbarui otomatis.",
};

export default function KatalogLayout({ children }: { children: ReactNode }) {
  return (
    <div className="katalog min-h-screen">
      {children}
      <KatalogReveal />
    </div>
  );
}
