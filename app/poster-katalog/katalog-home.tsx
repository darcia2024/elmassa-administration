"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { KatalogPackage } from "@/lib/katalog/store";
import type { KatalogContact } from "@/lib/katalog/contact";
import {
  cleanText,
  dateRange,
  displayName,
  monthKey,
  seatLabel,
  seatTone,
  shortPrice,
  whatsappLink,
  type SeatTone,
} from "@/lib/katalog/present";

const TONE_DOT: Record<SeatTone, string> = {
  open: "bg-emerald-600",
  low: "bg-[var(--accent)]",
  full: "bg-[var(--muted)]",
};
const TONE_TEXT: Record<SeatTone, string> = {
  open: "text-[var(--ink)]",
  low: "text-[var(--accent-ink)] font-bold",
  full: "text-[var(--muted)]",
};

type Props = {
  packages: KatalogPackage[] | null;
  contact: KatalogContact;
  lunasDays: number;
  includes: string[];
  excludes: string[];
};

export function KatalogHome({ packages, contact, lunasDays, includes, excludes }: Props) {
  const list = useMemo(() => packages ?? [], [packages]);
  const [month, setMonth] = useState<string>("semua");
  const [selectedId, setSelectedId] = useState<string | null>(list[0]?.id ?? null);
  const panelRef = useRef<HTMLElement>(null);

  // Departures grouped by month, in date order (the list already is).
  const months = useMemo(() => {
    const out: Array<{ key: string; label: string; items: KatalogPackage[] }> = [];
    for (const p of list) {
      const m = monthKey(p.departureDate);
      const g = out.find((x) => x.key === m.key);
      if (g) g.items.push(p);
      else out.push({ key: m.key, label: m.label, items: [p] });
    }
    return out;
  }, [list]);
  const shownMonths = month === "semua" ? months : months.filter((m) => m.key === month);

  const selected = list.find((p) => p.id === selectedId) ?? list[0] ?? null;
  const cheapest = list.reduce<KatalogPackage | null>((min, p) => (p.numericPrice > 0 && (!min || p.numericPrice < min.numericPrice) ? p : min), null);
  const dpValues = Array.from(new Set(list.map((p) => p.dpMinimum).filter(Boolean)));
  const waGeneral = whatsappLink(contact.whatsapp);

  const choose = (id: string, from: "board" | "gallery") => {
    setSelectedId(id);
    // On a phone the poster is a screen away, so show the chosen departure's
    // panel (which carries its poster there). On desktop the board keeps the
    // poster in view; only the gallery, below the split, needs to scroll back.
    const desktop = window.matchMedia("(min-width: 1024px)").matches;
    if (!desktop || from === "gallery") {
      requestAnimationFrame(() => panelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
    }
  };

  const nav = (
    <nav aria-label="Navigasi katalog" className="flex items-center justify-between gap-4 py-5">
      <Link href="/poster-katalog" className="text-[17px] font-extrabold tracking-[-0.02em] text-[var(--ink)] no-underline">
        El Massa
      </Link>
      <div className="flex items-center gap-5 text-[15px]">
        <a href="#jadwal" className="hidden text-[var(--ink)] no-underline hover:underline sm:inline">Jadwal</a>
        <a href="#tanya-jawab" className="hidden text-[var(--ink)] no-underline hover:underline sm:inline">Tanya jawab</a>
        <a href="#kontak" className="hidden text-[var(--ink)] no-underline hover:underline sm:inline">Kontak</a>
        <a
          href={waGeneral}
          target="_blank"
          rel="noopener noreferrer"
          className="k-press bg-[var(--accent)] px-4 py-2.5 font-bold text-white no-underline hover:bg-[var(--accent-ink)]"
        >
          Chat WhatsApp
        </a>
      </div>
    </nav>
  );

  return (
    <>
      {/* On a phone the navigation comes first, above the poster. */}
      <div className="px-5 sm:px-10 lg:hidden">{nav}</div>

      {/* ------------------------------------------------------------------ */}
      {/* The split stage: the chosen departure's poster stays on the left */}
      <div className="lg:grid lg:grid-cols-[47%_minmax(0,1fr)]">
        <div className="bg-[var(--stage)] lg:sticky lg:top-0 lg:h-svh">
          <div className="flex h-[62svh] min-h-[400px] flex-col p-4 sm:p-6 lg:h-full lg:p-10">
            <div className="relative min-h-0 flex-1 overflow-hidden">
              {selected && <StagePoster key={selected.id} pkg={selected} />}
            </div>
            {selected && (
              <p className="mt-3 hidden flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-[15px] text-[var(--on-dark-muted)] lg:flex">
                <span className="font-semibold text-[var(--on-dark)]">{displayName(selected.name)}</span>
                <span>
                  {dateRange(selected.departureDate, selected.returnDate)} · {seatLabel(selected.seats.remaining)}
                </span>
              </p>
            )}
          </div>
        </div>

        <main className="min-w-0 px-5 pb-24 sm:px-10 lg:px-16">
          <div className="hidden lg:block">{nav}</div>

          {/* Hero */}
          <header className="max-w-[46rem] pb-14 pt-10 lg:pt-12">
            <p aria-hidden="true" className="k-mark k-rise text-[clamp(64px,10vw,136px)] font-extrabold leading-[0.9] tracking-[-0.05em] text-[var(--accent)]">
              el massa
            </p>
            <h1 className="k-rise mt-6 text-[30px] sm:text-[52px] font-extrabold leading-[1.02] tracking-[-0.03em]" data-d="1">
              Jadwal umrah dari Pangkal Pinang
            </h1>
            <p className="k-rise mt-6 max-w-[40ch] text-[17px] leading-[1.55]" data-d="2">
              {list.length > 0
                ? `${list.length} keberangkatan yang masih bisa dipesan${cheapest ? `, mulai ${shortPrice(cheapest)}` : ""}. Pilih tanggal, lihat posternya, lalu tanyakan seat lewat WhatsApp. Sisa seat mengikuti data booking kami.`
                : "Jadwal keberangkatan berikutnya sedang disiapkan. Tanyakan langsung lewat WhatsApp."}
            </p>
            <a
              href="#jadwal"
              className="k-press k-rise mt-8 inline-block bg-[var(--ink)] px-6 py-4 text-[17px] font-bold text-[var(--on-dark)] no-underline hover:bg-[var(--accent-ink)]"
              data-d="3"
            >
              Pilih keberangkatan
            </a>
          </header>

          {/* Departure board */}
          <section id="jadwal" aria-labelledby="jadwal-title" className="max-w-[46rem] scroll-mt-6 pt-6">
            <h2 id="jadwal-title" className="k-rise text-[30px] font-extrabold tracking-[-0.02em]">
              Jadwal keberangkatan
            </h2>

            {packages === null ? (
              <p className="mt-6 text-[17px]">
                Jadwal sedang tidak bisa dimuat. Silakan{" "}
                <a href={waGeneral} className="font-bold text-[var(--accent-ink)] underline">tanya lewat WhatsApp</a>.
              </p>
            ) : (
              <>
                {months.length > 1 && (
                  <div role="group" aria-label="Pilih bulan" className="k-rise -mx-3 mt-6 flex flex-wrap gap-1" data-d="1">
                    {[{ key: "semua", label: "Semua bulan" }, ...months.map((m) => ({ key: m.key, label: m.label }))].map((m) => (
                      <button
                        key={m.key}
                        type="button"
                        aria-pressed={month === m.key}
                        onClick={() => setMonth(m.key)}
                        className={`k-press px-3 py-2 text-[15px] ${
                          month === m.key ? "bg-[var(--ink)] font-bold text-[var(--on-dark)]" : "text-[var(--ink)] hover:bg-[var(--tone)]"
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                )}

                <div className="mt-8 space-y-10">
                  {shownMonths.map((g) => (
                    <div key={g.key} className="k-rise">
                      <h3 className="text-[15px] font-semibold text-[var(--muted)]">{g.label}</h3>
                      <ul className="mt-2">
                        {g.items.map((p) => {
                          const tone = seatTone(p.seats.remaining);
                          const active = selected?.id === p.id;
                          return (
                            <li key={p.id}>
                              <button
                                type="button"
                                onClick={() => choose(p.id, "board")}
                                aria-current={active ? "true" : undefined}
                                className={`k-press -mx-3 flex w-[calc(100%+1.5rem)] items-start justify-between gap-4 px-3 py-3 text-left ${
                                  active ? "bg-[var(--tone)]" : "hover:bg-[var(--tone)]"
                                }`}
                              >
                                <span className="flex min-w-0 items-start gap-3">
                                  <span aria-hidden="true" className={`mt-[7px] h-2.5 w-2.5 shrink-0 rounded-full ${TONE_DOT[tone]}`} />
                                  <span className="min-w-0">
                                    <span className={`block text-[17px] leading-snug ${active ? "font-extrabold" : "font-semibold"}`}>{displayName(p.name)}</span>
                                    <span className="mt-0.5 block text-[15px] text-[var(--muted)]">
                                      {dateRange(p.departureDate, p.returnDate)} · {p.duration}
                                    </span>
                                  </span>
                                </span>
                                <span className="shrink-0 text-right">
                                  <span className="block text-[17px] font-bold">{shortPrice(p)}</span>
                                  <span className={`block text-[15px] ${TONE_TEXT[tone]}`}>{seatLabel(p.seats.remaining)}</span>
                                </span>
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ))}
                </div>
              </>
            )}
          </section>

          {/* The chosen departure */}
          {selected && (
            <section ref={panelRef} aria-labelledby="pilihan-title" className="mt-20 max-w-[46rem] scroll-mt-4 bg-[var(--tone)] px-5 py-7 sm:px-8 sm:py-8">
              {/* On a phone the poster lives here, next to what it advertises. */}
              <div className="mb-6 bg-[var(--stage)] p-3 lg:hidden">
                <div className="relative aspect-[4/5] w-full">
                  <StagePoster key={selected.id} pkg={selected} />
                </div>
              </div>
              <h2 id="pilihan-title" className="text-[24px] sm:text-[30px] font-extrabold leading-tight tracking-[-0.02em]">
                {displayName(selected.name)}
              </h2>
              <dl className="mt-6 grid grid-cols-1 gap-x-8 gap-y-4 text-[17px] sm:grid-cols-2">
                <Fact label="Tanggal" value={`${dateRange(selected.departureDate, selected.returnDate)} · ${selected.duration}`} />
                <Fact label="Berangkat dari" value={selected.startPoint.replace(/^Start\s+/i, "") || "Pangkal Pinang"} />
                <Fact label="Maskapai" value={selected.airline} />
                <Fact label="Harga" value={`${selected.price}${selected.meta.roomType ? ` · ${selected.meta.roomType}` : ""}`} />
                <Fact label="Hotel Makkah" value={selected.makkahHotel} />
                <Fact label="Hotel Madinah" value={selected.madinahHotel} />
                <Fact label="DP mulai" value={selected.dpMinimum} />
                <Fact
                  label="Sisa seat"
                  value={selected.seats.remaining > 0 ? `${selected.seats.remaining} dari ${selected.seats.quota} seat` : "Penuh, tanyakan daftar tunggu"}
                  strong={seatTone(selected.seats.remaining) !== "open"}
                />
              </dl>
              {selected.programUmrah && <p className="mt-6 max-w-[60ch] text-[17px] leading-[1.6]">{cleanText(selected.programUmrah)}</p>}
              <div className="mt-8 grid gap-2 sm:grid-cols-2">
                <a
                  href={whatsappLink(contact.whatsapp, selected)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="k-press flex min-h-[64px] items-center justify-center bg-[var(--accent)] px-5 text-center text-[17px] font-bold text-white no-underline hover:bg-[var(--accent-ink)]"
                >
                  {selected.seats.remaining > 0 ? "Pesan lewat WhatsApp" : "Masuk daftar tunggu"}
                </a>
                <Link
                  href={`/poster-katalog/${encodeURIComponent(selected.id)}`}
                  className="k-press flex min-h-[64px] items-center justify-center bg-[var(--ground)] px-5 text-center text-[17px] font-bold text-[var(--ink)] no-underline hover:bg-white"
                >
                  Itinerary lengkap
                </Link>
              </div>
            </section>
          )}
        </main>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Full width: every poster, so the split never becomes monotonous */}
      {list.length > 0 && (
        <section aria-labelledby="poster-title" className="bg-[var(--stage)] px-5 py-20 text-[var(--on-dark)] sm:px-10 lg:px-16">
          <div className="lg:grid lg:grid-cols-12 lg:gap-x-8">
            <div className="lg:col-span-4">
              <h2 id="poster-title" className="k-rise text-[30px] font-extrabold tracking-[-0.02em]">
                Semua poster keberangkatan
              </h2>
              <p className="k-rise mt-3 max-w-[34ch] text-[17px] leading-[1.55] text-[var(--on-dark-muted)]" data-d="1">
                Simpan dan bagikan posternya ke keluarga. Ketuk poster untuk melihat detail dan sisa seat.
              </p>
            </div>
            <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:col-span-8 lg:mt-0 xl:grid-cols-4">
              {list.map((p, i) => (
                <li key={p.id} className="k-rise" data-d={String(i % 4)}>
                  <button type="button" onClick={() => choose(p.id, "gallery")} className="group block w-full text-left">
                    <span className="relative block aspect-[4/5] overflow-hidden bg-[#3a281f]">
                      {p.thumbUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.thumbUrl}
                          alt={`Poster ${p.name}`}
                          width={480}
                          height={600}
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        />
                      ) : (
                        <TextPoster pkg={p} compact />
                      )}
                    </span>
                    <span className="mt-3 block text-[17px] font-semibold leading-snug">{displayName(p.name)}</span>
                    <span className="mt-1 block text-[15px] text-[var(--on-dark-muted)]">
                      {dateRange(p.departureDate, p.returnDate)} · {seatLabel(p.seats.remaining)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Answers as reading text */}
      <section id="tanya-jawab" aria-labelledby="faq-title" className="scroll-mt-6 px-5 py-24 sm:px-10 lg:grid lg:grid-cols-12 lg:gap-x-8 lg:px-16">
        <h2 id="faq-title" className="k-rise text-[30px] font-extrabold tracking-[-0.02em] lg:col-span-3">
          Tanya jawab
        </h2>
        <div className="k-rise mt-8 text-[17px] leading-[1.6] lg:col-span-9 lg:mt-0 lg:columns-2 lg:gap-14" data-d="1">
          <Faq q="Berangkat dari mana?">
            Program El Massa berangkat dari Bandara Depati Amir, Pangkal Pinang, lalu transit di Jakarta. Titik berangkat tiap jadwal tertulis di detail keberangkatan.
          </Faq>
          <Faq q="Berapa DP-nya?">
            DP mulai {dpValues[0] ?? "Rp 5.000.000"} per jamaah. Sisanya bisa dicicil, dengan pelunasan paling lambat {lunasDays} hari sebelum berangkat.
          </Faq>
          <Faq q="Apakah sisa seat di sini benar?">
            Ya. Angka sisa seat diambil langsung dari data booking El Massa dan diperbarui sekitar setiap menit, jadi seat yang sudah dipesan jamaah lain langsung berkurang.
          </Faq>
          {includes.length > 0 && <Faq q="Harga sudah termasuk apa?">{includes.join(", ")}.</Faq>}
          {excludes.length > 0 && <Faq q="Apa yang belum termasuk?">{excludes.join(", ")}.</Faq>}
          <Faq q="Bagaimana cara mendaftar?">
            Chat kami lewat WhatsApp dengan menyebut jadwal yang dipilih. Tim kami mengirimkan link pendataan untuk mengisi biodata dan mengunggah dokumen, lalu Anda membayar DP untuk mengunci seat.
          </Faq>
          <Faq q="Apakah El Massa resmi?">
            {contact.legalName} terdaftar dengan SK Kemenkumham {contact.kemenkumham} dan izin PPIU nomor {contact.ppiu}.
          </Faq>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Contact */}
      <section id="kontak" aria-labelledby="kontak-title" className="scroll-mt-6 bg-[var(--tone)] px-5 py-24 sm:px-10 lg:px-16">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-x-8">
          <div className="lg:col-span-6">
            <h2 id="kontak-title" className="k-rise text-[30px] font-extrabold tracking-[-0.02em]">
              Kontak
            </h2>
            <p className="k-rise mt-5 max-w-[26ch] text-[24px] sm:text-[30px] font-semibold leading-[1.2]" data-d="1">
              Tanya jadwal, harga kamar, atau cicilan. Tim kami di Pangkal Pinang siap membantu.
            </p>
          </div>
          <div className="k-rise text-[17px] leading-[1.7] lg:col-span-5 lg:col-start-8" data-d="2">
            <a href={waGeneral} target="_blank" rel="noopener noreferrer" className="block font-bold text-[var(--accent-ink)] underline">
              WhatsApp {contact.phoneLabel}
            </a>
            <a href={contact.instagram} target="_blank" rel="noopener noreferrer" className="block text-[var(--ink)] underline">
              Instagram El Massa
            </a>
            <a href={contact.mapsUrl} target="_blank" rel="noopener noreferrer" className="mt-4 block text-[var(--ink)] underline">
              {contact.address}
            </a>
          </div>
        </div>
      </section>

      <footer className="grid gap-2 px-5 pb-8 pt-24 text-[15px] text-[var(--muted)] sm:px-10 md:grid-cols-[1fr_auto_1fr] md:items-baseline lg:px-16">
        <span>{contact.name} · Izin PPIU {contact.ppiu}</span>
        <span className="flex gap-6">
          <a href="#jadwal" className="text-[var(--ink)] no-underline hover:underline">Jadwal</a>
          <a href="#tanya-jawab" className="text-[var(--ink)] no-underline hover:underline">Tanya jawab</a>
          <a href="#kontak" className="text-[var(--ink)] no-underline hover:underline">Kontak</a>
        </span>
        <span className="md:text-right">© {contact.legalName}</span>
      </footer>
    </>
  );
}

/** Full poster on the stage, or a typeset poster when staff have not uploaded one yet. */
function StagePoster({ pkg }: { pkg: KatalogPackage }) {
  if (!pkg.posterUrl) return <TextPoster pkg={pkg} />;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={pkg.posterUrl}
      alt={`Poster ${pkg.name}`}
      width={1200}
      height={1500}
      fetchPriority="high"
      className="k-poster absolute inset-0 h-full w-full object-contain"
    />
  );
}

function TextPoster({ pkg, compact }: { pkg: KatalogPackage; compact?: boolean }) {
  return (
    <span className={`k-poster absolute inset-0 flex flex-col justify-between bg-[var(--accent)] text-white ${compact ? "p-4" : "p-8 lg:p-12"}`}>
      <span className={`font-extrabold tracking-[-0.03em] ${compact ? "text-[15px]" : "text-[17px]"}`}>el massa</span>
      <span>
        <span className={`block font-extrabold leading-[1.02] tracking-[-0.03em] ${compact ? "text-[17px]" : "text-[30px] lg:text-[52px]"}`}>
          {displayName(pkg.name)}
        </span>
        <span className={`mt-3 block font-semibold ${compact ? "text-[15px]" : "text-[17px]"}`}>
          {dateRange(pkg.departureDate, pkg.returnDate)}
        </span>
        <span className={`mt-1 block font-extrabold ${compact ? "text-[17px]" : "text-[30px]"}`}>{shortPrice(pkg)}</span>
      </span>
    </span>
  );
}

function Fact({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-[15px] text-[var(--muted)]">{label}</dt>
      <dd className={`mt-0.5 ${strong ? "font-bold text-[var(--accent-ink)]" : "font-semibold"}`}>{cleanText(value)}</dd>
    </div>
  );
}

function Faq({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <p className="mb-5 break-inside-avoid">
      <span className="font-bold">{q}</span> {children}
    </p>
  );
}
