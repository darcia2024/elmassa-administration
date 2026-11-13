"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { KatalogPackage } from "@/lib/katalog/store";
import type { KatalogContact } from "@/lib/katalog/contact";
import { cleanText, dateRange, displayName, monthKey, seatTone, shortPrice, whatsappLink } from "@/lib/katalog/present";
import { FloatingWhatsApp, ShopFooter, ShopHeader, WhatsAppIcon } from "./shop-chrome";

type Sort = "terdekat" | "termurah" | "termahal" | "seat";
const SORTS: Array<{ key: Sort; label: string }> = [
  { key: "terdekat", label: "Keberangkatan terdekat" },
  { key: "termurah", label: "Harga termurah" },
  { key: "termahal", label: "Harga tertinggi" },
  { key: "seat", label: "Seat terbanyak" },
];

type Props = {
  packages: KatalogPackage[] | null;
  contact: KatalogContact;
  lunasDays: number;
  includes: string[];
  excludes: string[];
};

export function KatalogHome({ packages, contact, lunasDays, includes, excludes }: Props) {
  const list = useMemo(() => packages ?? [], [packages]);
  const [query, setQuery] = useState("");
  const [month, setMonth] = useState("semua");
  const [sort, setSort] = useState<Sort>("terdekat");

  // The header search on detail pages submits ?q= here.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("q");
    if (q) setQuery(q);
  }, []);

  const months = useMemo(() => {
    const out: Array<{ key: string; label: string }> = [];
    for (const p of list) {
      const m = monthKey(p.departureDate);
      if (!out.some((x) => x.key === m.key)) out.push(m);
    }
    return out;
  }, [list]);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = list.filter((p) => {
      if (month !== "semua" && monthKey(p.departureDate).key !== month) return false;
      if (!q) return true;
      const hay = [p.name, p.category, p.makkahHotel, p.madinahHotel, p.airline, monthKey(p.departureDate).label, ...(p.meta.tags ?? [])]
        .join(" ")
        .toLowerCase();
      return q.split(/\s+/).every((w) => hay.includes(w));
    });
    const byDate = (a: KatalogPackage, b: KatalogPackage) => a.departureDate.localeCompare(b.departureDate);
    const sorted = [...filtered];
    if (sort === "terdekat") sorted.sort(byDate);
    if (sort === "termurah") sorted.sort((a, b) => (a.numericPrice || Infinity) - (b.numericPrice || Infinity));
    if (sort === "termahal") sorted.sort((a, b) => b.numericPrice - a.numericPrice);
    if (sort === "seat") sorted.sort((a, b) => b.seats.remaining - a.seats.remaining);
    return sorted;
  }, [list, query, month, sort]);

  // Banner: the soonest departure that still has seats.
  const featured = list.find((p) => p.seats.remaining > 0) ?? list[0] ?? null;
  const cheapest = list.reduce<KatalogPackage | null>((min, p) => (p.numericPrice > 0 && (!min || p.numericPrice < min.numericPrice) ? p : min), null);
  const dp = list.find((p) => p.dpMinimum)?.dpMinimum ?? "Rp 5.000.000";
  const waGeneral = whatsappLink(contact.whatsapp);

  return (
    <>
      <ShopHeader contact={contact} query={query} onQuery={setQuery} />

      <main className="mx-auto max-w-7xl px-4 sm:px-6">
        <h1 className="sr-only">Paket umrah El Massa Tour &amp; Travel</h1>

        {/* Banner: soonest departure */}
        {featured && (
          <section aria-label="Keberangkatan terdekat" className="mt-5 overflow-hidden rounded-3xl bg-[var(--stage)] text-[var(--on-dark)] sm:mt-6">
            <div className="grid items-center gap-6 md:grid-cols-[1.15fr_1fr]">
              <div className="order-2 px-6 pb-8 md:order-1 md:px-10 md:py-10 lg:px-14">
                <p className="inline-flex rounded-full bg-[var(--brand)] px-3 py-1 text-[13px] font-bold">Keberangkatan terdekat</p>
                <h2 className="mt-4 text-[28px] font-semibold leading-[1.08] tracking-[-0.03em] sm:text-[40px]">{displayName(featured.name)}</h2>
                <p className="mt-3 text-[16px] text-[#e9d6cd]">
                  {dateRange(featured.departureDate, featured.returnDate)} · {featured.duration} · {featured.startPoint.replace(/^Start\s+/i, "") || "Pangkal Pinang"}
                </p>
                <div className="mt-6 flex flex-wrap items-end gap-x-6 gap-y-2">
                  <p>
                    <span className="block text-[13px] text-[#e9d6cd]">Mulai dari</span>
                    <span className="k-num text-[34px] font-semibold leading-none text-white">{shortPrice(featured)}</span>
                  </p>
                  <SeatPill remaining={featured.seats.remaining} quota={featured.seats.quota} dark />
                </div>
                <div className="mt-7 flex flex-wrap gap-3">
                  <Link
                    href={`/poster-katalog/${encodeURIComponent(featured.id)}`}
                    className="k-press inline-flex items-center rounded-full bg-[var(--brand)] px-6 py-3.5 text-[16px] font-bold text-white no-underline hover:bg-[var(--accent)]"
                  >
                    Lihat paket
                  </Link>
                  <a
                    href={whatsappLink(contact.whatsapp, featured)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="k-press inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-[16px] font-bold text-[var(--ink)] no-underline hover:bg-[var(--accent-soft)]"
                  >
                    <WhatsAppIcon className="h-5 w-5 text-[#1fa855]" />
                    Tanya seat
                  </a>
                </div>
              </div>
              <Link href={`/poster-katalog/${encodeURIComponent(featured.id)}`} className="order-1 block p-4 md:order-2 md:p-8">
                <Poster pkg={featured} priority className="mx-auto aspect-[4/5] w-full max-w-[380px] rounded-2xl" />
              </Link>
            </div>
          </section>
        )}

        {/* Why book here */}
        <ul className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            { t: "Resmi PPIU", d: `Izin ${contact.ppiu}` },
            { t: "Berangkat dari Pangkal Pinang", d: "Transit Jakarta, didampingi tim" },
            { t: `DP mulai ${dp}`, d: `Lunas H-${lunasDays} sebelum berangkat` },
            { t: "Seat real-time", d: "Sesuai data booking El Massa" },
          ].map((x) => (
            <li key={x.t} className="rounded-2xl bg-white px-4 py-4 ring-1 ring-[var(--line)]">
              <p className="text-[15px] font-semibold leading-snug">{x.t}</p>
              <p className="mt-1 text-[13px] leading-snug text-[var(--muted)]">{x.d}</p>
            </li>
          ))}
        </ul>

        {/* Catalogue */}
        <section id="paket" aria-labelledby="paket-title" className="mt-12 scroll-mt-24">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 id="paket-title" className="text-[26px] font-semibold tracking-[-0.02em] sm:text-[30px]">Paket umrah</h2>
              <p className="mt-1 text-[15px] text-[var(--muted)]">
                {packages === null
                  ? "Jadwal sedang tidak bisa dimuat."
                  : `${shown.length} paket${cheapest ? ` · mulai ${shortPrice(cheapest)}` : ""}`}
              </p>
            </div>
            <label className="flex items-center gap-2 text-[14px] text-[var(--muted)]">
              Urutkan
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as Sort)}
                className="h-10 rounded-full border border-[var(--line)] bg-white px-4 text-[14px] font-semibold text-[var(--ink)]"
              >
                {SORTS.map((s) => (
                  <option key={s.key} value={s.key}>{s.label}</option>
                ))}
              </select>
            </label>
          </div>

          {months.length > 1 && (
            <div role="group" aria-label="Pilih bulan keberangkatan" className="k-scrollbar-none -mx-4 mt-5 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
              {[{ key: "semua", label: "Semua bulan" }, ...months].map((m) => (
                <button
                  key={m.key}
                  type="button"
                  aria-pressed={month === m.key}
                  onClick={() => setMonth(m.key)}
                  className={`k-press shrink-0 rounded-full px-4 py-2 text-[14px] font-semibold ring-1 ${
                    month === m.key
                      ? "bg-[var(--ink)] text-white ring-[var(--ink)]"
                      : "bg-white text-[var(--ink)] ring-[var(--line)] hover:ring-[var(--accent)]"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          )}

          {packages === null ? (
            <p className="mt-8 rounded-2xl bg-white p-6 text-[16px] ring-1 ring-[var(--line)]">
              Jadwal sedang tidak bisa dimuat. Silakan{" "}
              <a href={waGeneral} className="font-bold text-[var(--accent-ink)] underline">tanya lewat WhatsApp</a>.
            </p>
          ) : shown.length === 0 ? (
            <div className="mt-8 rounded-2xl bg-white p-8 text-center ring-1 ring-[var(--line)]">
              <p className="text-[17px] font-bold">Paket tidak ditemukan</p>
              <p className="mt-1 text-[15px] text-[var(--muted)]">Coba kata lain, atau lihat semua bulan.</p>
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setMonth("semua");
                }}
                className="k-press mt-4 rounded-full bg-[var(--ink)] px-5 py-2.5 text-[14px] font-bold text-white"
              >
                Tampilkan semua paket
              </button>
            </div>
          ) : (
            <ul className="mt-6 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
              {shown.map((p, i) => (
                <li key={p.id} className="k-up" style={{ ["--i" as string]: Math.min(i, 12) }}>
                  <ProductCard pkg={p} eager={i < 4} />
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* FAQ */}
        <section aria-labelledby="faq-title" className="mt-16 grid gap-6 rounded-3xl bg-white p-6 ring-1 ring-[var(--line)] sm:p-10 lg:grid-cols-[1fr_2fr]">
          <div>
            <h2 id="faq-title" className="text-[26px] font-semibold tracking-[-0.02em] sm:text-[30px]">Pertanyaan umum</h2>
            <p className="mt-2 text-[15px] text-[var(--muted)]">Belum terjawab? Tim CS kami siap membantu.</p>
            <a
              href={waGeneral}
              target="_blank"
              rel="noopener noreferrer"
              className="k-press mt-5 inline-flex items-center gap-2 rounded-full bg-[#1fa855] px-5 py-3 text-[15px] font-bold text-white no-underline hover:bg-[#178a45]"
            >
              <WhatsAppIcon className="h-5 w-5" /> Chat CS
            </a>
          </div>
          <div className="divide-y divide-[var(--line)]">
            <Faq q="Bagaimana cara daftarnya?">
              Pilih paket, lalu tekan &ldquo;Pesan lewat WhatsApp&rdquo;. Tim kami mengirimkan link pendataan untuk mengisi biodata dan mengunggah dokumen, lalu seat dikunci setelah DP masuk.
            </Faq>
            <Faq q="Berapa DP dan kapan pelunasan?">
              DP mulai {dp} per jamaah. Sisanya bisa dicicil, dengan pelunasan paling lambat {lunasDays} hari sebelum berangkat.
            </Faq>
            <Faq q="Apakah sisa seat yang tertulis benar?">
              Ya. Angka sisa seat diambil langsung dari data booking El Massa dan diperbarui sekitar setiap menit.
            </Faq>
            {includes.length > 0 && <Faq q="Harga sudah termasuk apa saja?">{includes.join(", ")}.</Faq>}
            {excludes.length > 0 && <Faq q="Apa yang belum termasuk?">{excludes.join(", ")}.</Faq>}
            <Faq q="Apakah El Massa travel resmi?">
              {contact.legalName} terdaftar dengan SK Kemenkumham {contact.kemenkumham} dan izin PPIU nomor {contact.ppiu}.
            </Faq>
          </div>
        </section>
      </main>

      <ShopFooter contact={contact} />
      <FloatingWhatsApp href={waGeneral} />
    </>
  );
}

function ProductCard({ pkg, eager }: { pkg: KatalogPackage; eager?: boolean }) {
  const tone = seatTone(pkg.seats.remaining);
  return (
    <Link
      href={`/poster-katalog/${encodeURIComponent(pkg.id)}`}
      className="k-card group flex h-full flex-col overflow-hidden rounded-2xl bg-white no-underline ring-1 ring-[var(--line)]"
    >
      <div className="relative overflow-hidden">
        <Poster pkg={pkg} thumb priority={eager} className="aspect-[4/5] w-full" />
        <span className="absolute left-2 top-2 rounded-full bg-white/95 px-2.5 py-1 text-[12px] font-bold text-[var(--ink)]">{pkg.duration}</span>
        {tone !== "open" && (
          <span
            className={`absolute bottom-2 left-2 rounded-full px-2.5 py-1 text-[12px] font-bold text-white ${
              tone === "full" ? "bg-[var(--stage)]" : "bg-[var(--accent)]"
            }`}
          >
            {tone === "full" ? "Seat penuh" : `Sisa ${pkg.seats.remaining} seat`}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <h3 className="line-clamp-2 text-[15px] font-bold leading-snug text-[var(--ink)] sm:text-[16px]">{displayName(pkg.name)}</h3>
        <p className="mt-1 text-[13px] text-[var(--muted)]">{dateRange(pkg.departureDate, pkg.returnDate)}</p>
        <p className="k-num mt-auto pt-3 text-[19px] font-semibold text-[var(--accent-ink)] sm:text-[21px]">{shortPrice(pkg)}</p>
        <p className="text-[12px] text-[var(--muted)]">DP {pkg.dpMinimum}</p>
        {tone === "open" && <SeatBar remaining={pkg.seats.remaining} quota={pkg.seats.quota} />}
      </div>
    </Link>
  );
}

export function SeatBar({ remaining, quota }: { remaining: number; quota: number }) {
  const filled = quota > 0 ? Math.min(100, Math.round(((quota - remaining) / quota) * 100)) : 0;
  return (
    <div className="mt-3">
      <div className="h-1.5 overflow-hidden rounded-full bg-[var(--tone)]">
        <div className="h-full rounded-full bg-[var(--brand)]" style={{ width: `${Math.max(filled, 4)}%` }} />
      </div>
      <p className="mt-1 text-[12px] font-semibold text-[var(--muted)]">Sisa {remaining} dari {quota} seat</p>
    </div>
  );
}

function SeatPill({ remaining, quota, dark }: { remaining: number; quota: number; dark?: boolean }) {
  const tone = seatTone(remaining);
  const text = tone === "full" ? "Seat penuh" : `Sisa ${remaining} dari ${quota} seat`;
  return (
    <span
      className={`rounded-full px-3 py-1.5 text-[14px] font-bold ${
        tone === "open" ? (dark ? "bg-white/15 text-white" : "bg-emerald-50 text-emerald-800") : "bg-[var(--brand)] text-white"
      }`}
    >
      {text}
    </span>
  );
}

/** The package poster, or a typeset stand-in until staff upload one. */
export function Poster({ pkg, thumb, priority, className = "" }: { pkg: KatalogPackage; thumb?: boolean; priority?: boolean; className?: string }) {
  const src = thumb ? pkg.thumbUrl : pkg.posterUrl;
  if (!src) {
    return (
      <div className={`flex flex-col justify-between bg-[var(--brand)] p-4 text-white ${className}`}>
        <span className="text-[13px] font-semibold tracking-[-0.02em]">el massa</span>
        <span>
          <span className="block text-[18px] font-semibold leading-tight tracking-[-0.02em]">{displayName(pkg.name)}</span>
          <span className="mt-2 block text-[13px] font-semibold">{dateRange(pkg.departureDate, pkg.returnDate)}</span>
        </span>
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={`Poster ${cleanText(pkg.name)}`}
      width={thumb ? 480 : 1200}
      height={thumb ? 600 : 1500}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding="async"
      className={`bg-[var(--tone)] object-cover ${className}`}
    />
  );
}

function Faq({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <details className="group py-4 first:pt-0">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[16px] font-bold">
        {q}
        <span aria-hidden="true" className="text-[22px] leading-none text-[var(--accent)] transition-transform group-open:rotate-45">+</span>
      </summary>
      <p className="mt-2 text-[15px] leading-relaxed text-[var(--muted)]">{children}</p>
    </details>
  );
}
