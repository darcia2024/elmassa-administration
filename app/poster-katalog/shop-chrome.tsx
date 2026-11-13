"use client";

import Link from "next/link";
import type { KatalogContact } from "@/lib/katalog/contact";
import { whatsappLink } from "@/lib/katalog/present";

export const LOGO = "/poster-katalog/images/logo.webp";

export function WhatsAppIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2Zm5.8 14.08c-.24.68-1.43 1.32-1.96 1.37-.5.05-.98.24-3.31-.69-2.8-1.1-4.58-3.97-4.72-4.15-.14-.18-1.13-1.5-1.13-2.87 0-1.36.71-2.03.97-2.31.25-.27.55-.34.74-.34h.53c.17 0 .4-.06.62.48.24.56.8 1.94.87 2.08.07.14.12.3.02.48-.09.18-.14.3-.27.46-.14.16-.29.36-.41.48-.14.14-.28.28-.12.56.16.27.72 1.19 1.55 1.93 1.06.95 1.96 1.24 2.24 1.38.27.14.43.12.59-.07.16-.18.68-.79.86-1.07.18-.27.36-.23.61-.14.25.09 1.6.75 1.87.89.27.14.46.2.53.32.07.11.07.66-.17 1.33Z" />
    </svg>
  );
}

/** Top bar: logo, search (plain GET form, so it works without script), WhatsApp. */
export function ShopHeader({
  contact,
  query,
  onQuery,
}: {
  contact: KatalogContact;
  /** On the catalogue page the search filters live; elsewhere it submits to it. */
  query?: string;
  onQuery?: (q: string) => void;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-[var(--line)] bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:gap-5 sm:px-6">
        <Link href="/poster-katalog" className="flex shrink-0 items-center gap-2 no-underline">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={LOGO} alt="" width={33} height={40} className="h-9 w-auto" />
          <span className="hidden leading-tight sm:block">
            <span className="block text-[17px] font-semibold tracking-[-0.02em] text-[var(--ink)]">El Massa</span>
            <span className="block text-[12px] font-semibold text-[var(--muted)]">Tour &amp; Travel</span>
          </span>
        </Link>
        <form
          action="/poster-katalog"
          method="get"
          role="search"
          className="min-w-0 flex-1"
          onSubmit={(e) => {
            if (onQuery) {
              e.preventDefault();
              document.getElementById("paket")?.scrollIntoView({ behavior: "smooth" });
            }
          }}
        >
          <label htmlFor="cari-paket" className="sr-only">Cari paket umrah</label>
          <div className="flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--ground)] px-4 focus-within:border-[var(--accent)] focus-within:bg-white">
            <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 shrink-0 text-[var(--muted)]" fill="none" stroke="currentColor" strokeWidth="2.2">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" strokeLinecap="round" />
            </svg>
            <input
              id="cari-paket"
              name="q"
              type="search"
              {...(onQuery ? { value: query ?? "", onChange: (e: React.ChangeEvent<HTMLInputElement>) => onQuery(e.target.value) } : {})}
              placeholder="Cari paket, bulan, atau hotel"
              className="h-11 w-full min-w-0 bg-transparent text-[15px] text-[var(--ink)] outline-none placeholder:text-[var(--muted)]"
            />
          </div>
        </form>
        <a
          href={whatsappLink(contact.whatsapp)}
          target="_blank"
          rel="noopener noreferrer"
          className="k-press hidden shrink-0 items-center gap-2 rounded-full bg-[#1fa855] px-4 py-2.5 text-[15px] font-bold text-white no-underline hover:bg-[#178a45] sm:inline-flex"
        >
          <WhatsAppIcon className="h-5 w-5" />
          Tanya CS
        </a>
      </div>
    </header>
  );
}

export function ShopFooter({ contact }: { contact: KatalogContact }) {
  return (
    <footer className="mt-16 bg-[var(--stage)] text-[var(--on-dark)]">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-3">
        <div>
          <p className="text-[20px] font-semibold tracking-[-0.02em]">El Massa Tour &amp; Travel</p>
          <p className="mt-3 max-w-[34ch] text-[15px] leading-relaxed text-[#e9d6cd]">
            {contact.legalName}. Penyelenggara perjalanan ibadah umrah resmi, berangkat dari Pangkal Pinang.
          </p>
        </div>
        <div className="text-[15px] leading-relaxed text-[#e9d6cd]">
          <p className="font-bold text-[var(--on-dark)]">Legalitas</p>
          <p className="mt-2">Izin PPIU {contact.ppiu}</p>
          <p>SK Kemenkumham {contact.kemenkumham}</p>
        </div>
        <div className="text-[15px] leading-relaxed">
          <p className="font-bold">Kantor &amp; kontak</p>
          <a href={contact.mapsUrl} target="_blank" rel="noopener noreferrer" className="mt-2 block text-[#e9d6cd] underline-offset-4 hover:underline">
            {contact.address}
          </a>
          <a href={whatsappLink(contact.whatsapp)} target="_blank" rel="noopener noreferrer" className="mt-2 block font-semibold text-white underline-offset-4 hover:underline">
            WhatsApp {contact.phoneLabel}
          </a>
          <a href={contact.instagram} target="_blank" rel="noopener noreferrer" className="block text-[#e9d6cd] underline-offset-4 hover:underline">
            Instagram El Massa
          </a>
        </div>
      </div>
    </footer>
  );
}

/** Phone: WhatsApp always one thumb away. */
export function FloatingWhatsApp({ href, label = "Tanya CS" }: { href: string; label?: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="k-press fixed bottom-4 right-4 z-40 inline-flex items-center gap-2 rounded-full bg-[#1fa855] px-5 py-3.5 text-[15px] font-bold text-white no-underline shadow-[0_10px_25px_-8px_rgba(0,0,0,0.45)] hover:bg-[#178a45] sm:hidden"
    >
      <WhatsAppIcon className="h-5 w-5" />
      {label}
    </a>
  );
}
