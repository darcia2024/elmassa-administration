import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getKatalogPackage, listKatalogPackages, type KatalogItineraryDay, type KatalogPackage } from "@/lib/katalog/store";
import { loadKatalogContact } from "@/lib/katalog/contact";
import { cleanText, dateRange, displayName, seatLabel, seatTone, shortPrice, whatsappLink } from "@/lib/katalog/present";
import { Poster, SeatBar } from "../katalog-home";
import { FloatingWhatsApp, ShopFooter, ShopHeader, WhatsAppIcon } from "../shop-chrome";

export const revalidate = 60;

// No paths at build time (the build should not need the database); each
// package page is rendered on its first visit and then served from cache like
// the list, so a detail link shared in a WhatsApp group costs one query a minute.
export async function generateStaticParams() {
  return [];
}

type Params = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const pkg = await getKatalogPackage(decodeURIComponent(id)).catch(() => null);
  if (!pkg) return { title: "Paket tidak ditemukan — El Massa" };
  const description = `${dateRange(pkg.departureDate, pkg.returnDate)} · ${pkg.duration} · ${pkg.price} · ${seatLabel(pkg.seats.remaining)}`;
  return {
    title: `${displayName(pkg.name)} — El Massa Tour & Travel`,
    description,
    openGraph: { title: displayName(pkg.name), description, images: pkg.posterUrl ? [{ url: pkg.posterUrl }] : undefined },
  };
}

function activityText(a: NonNullable<KatalogItineraryDay["activities"]>[number]) {
  if (typeof a === "string") return { time: "", text: a };
  return { time: a.time ?? "", text: a.description ?? a.activity ?? "" };
}

export default async function KatalogDetailPage({ params }: Params) {
  const { id } = await params;
  const [pkg, contact, all] = await Promise.all([
    getKatalogPackage(decodeURIComponent(id)).catch(() => null),
    loadKatalogContact(),
    listKatalogPackages().catch(() => [] as KatalogPackage[]),
  ]);
  if (!pkg) notFound();

  const tone = seatTone(pkg.seats.remaining);
  const wa = whatsappLink(contact.whatsapp, pkg);
  const others = all.filter((p) => p.id !== pkg.id).slice(0, 4);
  const facts: Array<[string, string]> = (
    [
      ["Tanggal", `${dateRange(pkg.departureDate, pkg.returnDate)} · ${pkg.duration}`],
      ["Berangkat dari", pkg.startPoint.replace(/^Start\s+/i, "")],
      ["Maskapai", pkg.airline],
      ["Rute", pkg.flightRoute],
      ["Hotel Makkah", pkg.makkahHotel],
      ["Hotel Madinah", pkg.madinahHotel],
      ["Kamar", pkg.meta.roomType ?? ""],
      ["Bonus", pkg.meta.highlight ?? ""],
    ] as Array<[string, string]>
  ).filter(([, v]) => v);

  return (
    <>
      <ShopHeader contact={contact} />

      <main className="mx-auto max-w-7xl px-4 pb-8 sm:px-6">
        <nav aria-label="Breadcrumb" className="py-4 text-[14px] text-[var(--muted)]">
          <Link href="/poster-katalog" className="text-[var(--ink)] no-underline hover:underline">Paket umrah</Link>
          <span aria-hidden="true"> / </span>
          <span>{displayName(pkg.name)}</span>
        </nav>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-10">
          {/* Poster */}
          <div>
            <div className="overflow-hidden rounded-3xl bg-white p-3 ring-1 ring-[var(--line)] sm:p-5">
              <Poster pkg={pkg} priority className="mx-auto aspect-[4/5] w-full max-w-[640px] rounded-2xl object-contain" />
            </div>
            {pkg.posterUrl && (
              <a href={pkg.posterUrl} download className="mt-3 inline-block text-[14px] font-semibold text-[var(--accent-ink)] underline-offset-4 hover:underline">
                Unduh poster untuk dibagikan
              </a>
            )}
          </div>

          {/* Buy box */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-3xl bg-white p-6 ring-1 ring-[var(--line)]">
              <p className="text-[14px] font-semibold text-[var(--muted)]">{pkg.category}</p>
              <h1 className="mt-1 text-[26px] font-extrabold leading-[1.1] tracking-[-0.02em]">{displayName(pkg.name)}</h1>
              <p className="mt-2 text-[15px] text-[var(--muted)]">{dateRange(pkg.departureDate, pkg.returnDate)} · {pkg.duration}</p>

              <div className="mt-5 rounded-2xl bg-[var(--accent-soft)] p-4">
                <p className="text-[13px] font-semibold text-[var(--muted)]">Harga per jamaah{pkg.meta.roomType ? ` · ${cleanText(pkg.meta.roomType).split("(")[0].trim()}` : ""}</p>
                <p className="k-num mt-1 text-[32px] font-extrabold leading-none text-[var(--accent-ink)]">{pkg.price || shortPrice(pkg)}</p>
                <p className="mt-2 text-[14px] font-semibold">DP mulai {pkg.dpMinimum}</p>
              </div>

              <div className="mt-4">
                {tone === "full" ? (
                  <p className="rounded-xl bg-[var(--stage)] px-4 py-3 text-[15px] font-bold text-white">Seat penuh, daftar tunggu masih dibuka</p>
                ) : (
                  <>
                    <SeatBar remaining={pkg.seats.remaining} quota={pkg.seats.quota} />
                    {tone === "low" && <p className="mt-1 text-[14px] font-bold text-[var(--accent-ink)]">Seat hampir habis</p>}
                  </>
                )}
              </div>

              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                className="k-press mt-5 flex min-h-[56px] items-center justify-center gap-2 rounded-full bg-[var(--brand)] px-6 text-[17px] font-bold text-white no-underline hover:bg-[var(--accent)]"
              >
                <WhatsAppIcon className="h-5 w-5" />
                {pkg.seats.remaining > 0 ? "Pesan lewat WhatsApp" : "Masuk daftar tunggu"}
              </a>
              <a
                href={whatsappLink(contact.whatsapp, pkg)}
                target="_blank"
                rel="noopener noreferrer"
                className="k-press mt-2 flex min-h-[48px] items-center justify-center rounded-full bg-white px-6 text-[15px] font-bold text-[var(--ink)] no-underline ring-1 ring-[var(--line)] hover:ring-[var(--accent)]"
              >
                Tanya dulu ke CS
              </a>
              <p className="mt-4 text-[13px] leading-snug text-[var(--muted)]">
                Izin PPIU {contact.ppiu}. Sisa seat diperbarui otomatis dari data booking.
              </p>
            </div>
          </aside>
        </div>

        {/* Details */}
        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-10">
          <div className="space-y-6">
            <section aria-labelledby="ringkas-title" className="rounded-3xl bg-white p-6 ring-1 ring-[var(--line)] sm:p-8">
              <h2 id="ringkas-title" className="text-[22px] font-extrabold tracking-[-0.02em]">Detail perjalanan</h2>
              <dl className="mt-5 grid gap-x-8 gap-y-4 text-[15px] sm:grid-cols-2">
                {facts.map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-[13px] font-semibold text-[var(--muted)]">{k}</dt>
                    <dd className="mt-0.5 font-semibold">{cleanText(v)}</dd>
                  </div>
                ))}
              </dl>
              {pkg.programUmrah && <p className="mt-6 text-[15px] leading-relaxed">{cleanText(pkg.programUmrah)}</p>}
              {(pkg.meta.tags ?? []).length > 0 && (
                <ul className="mt-5 flex flex-wrap gap-2">
                  {(pkg.meta.tags ?? []).map((t) => (
                    <li key={t} className="rounded-full bg-[var(--tone)] px-3 py-1 text-[13px] font-semibold">{t}</li>
                  ))}
                </ul>
              )}
            </section>

            {pkg.itinerary.length > 0 && (
              <section aria-labelledby="itin-title" className="rounded-3xl bg-white p-6 ring-1 ring-[var(--line)] sm:p-8">
                <h2 id="itin-title" className="text-[22px] font-extrabold tracking-[-0.02em]">Itinerary {pkg.itinerary.length} hari</h2>
                <ol className="mt-5 space-y-2">
                  {pkg.itinerary.map((day, i) => (
                    <li key={day.day}>
                      <details className="group rounded-2xl bg-[var(--ground)] px-4 py-3" open={i === 0}>
                        <summary className="flex cursor-pointer list-none items-start gap-3">
                          <span className="mt-0.5 shrink-0 rounded-full bg-[var(--brand)] px-2.5 py-0.5 text-[12px] font-bold text-white">Hari {day.day}</span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-[15px] font-bold leading-snug">{day.title}</span>
                            {(day.date || day.location) && (
                              <span className="mt-0.5 block text-[13px] text-[var(--muted)]">{[day.date, day.location].filter(Boolean).join(" · ")}</span>
                            )}
                          </span>
                          <span aria-hidden="true" className="text-[20px] leading-none text-[var(--accent)] transition-transform group-open:rotate-45">+</span>
                        </summary>
                        {(day.activities ?? []).length > 0 && (
                          <ul className="mt-3 space-y-1.5 pl-1 text-[14px] leading-relaxed">
                            {(day.activities ?? []).map((a, j) => {
                              const { time, text } = activityText(a);
                              return text ? (
                                <li key={j} className="flex gap-2">
                                  <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--brand)]" />
                                  <span>
                                    {time && <span className="font-semibold">{time.replace(/^Pukul\s+/i, "")} · </span>}
                                    {text}
                                  </span>
                                </li>
                              ) : null;
                            })}
                          </ul>
                        )}
                      </details>
                    </li>
                  ))}
                </ol>
              </section>
            )}
          </div>

          {(pkg.includes.length > 0 || pkg.excludes.length > 0) && (
            <section aria-labelledby="biaya-title" className="self-start rounded-3xl bg-white p-6 ring-1 ring-[var(--line)] sm:p-8">
              <h2 id="biaya-title" className="text-[22px] font-extrabold tracking-[-0.02em]">Fasilitas</h2>
              {pkg.includes.length > 0 && (
                <>
                  <h3 className="mt-5 text-[15px] font-extrabold text-emerald-800">Sudah termasuk</h3>
                  <ul className="mt-2 space-y-1.5 text-[14px] leading-snug">
                    {pkg.includes.map((x) => (
                      <li key={x} className="flex gap-2"><span aria-hidden="true" className="font-bold text-emerald-700">✓</span>{x}</li>
                    ))}
                  </ul>
                </>
              )}
              {pkg.excludes.length > 0 && (
                <>
                  <h3 className="mt-6 text-[15px] font-extrabold text-[var(--accent-ink)]">Belum termasuk</h3>
                  <ul className="mt-2 space-y-1.5 text-[14px] leading-snug">
                    {pkg.excludes.map((x) => (
                      <li key={x} className="flex gap-2"><span aria-hidden="true" className="font-bold text-[var(--accent-ink)]">–</span>{x}</li>
                    ))}
                  </ul>
                </>
              )}
            </section>
          )}
        </div>

        {others.length > 0 && (
          <section aria-labelledby="lain-title" className="mt-12">
            <h2 id="lain-title" className="text-[22px] font-extrabold tracking-[-0.02em]">Paket lainnya</h2>
            <ul className="mt-4 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-4">
              {others.map((p) => (
                <li key={p.id}>
                  <Link href={`/poster-katalog/${encodeURIComponent(p.id)}`} className="k-card flex h-full flex-col overflow-hidden rounded-2xl bg-white no-underline ring-1 ring-[var(--line)]">
                    <Poster pkg={p} thumb className="aspect-[4/5] w-full" />
                    <div className="p-3">
                      <p className="line-clamp-2 text-[14px] font-bold leading-snug text-[var(--ink)]">{displayName(p.name)}</p>
                      <p className="mt-1 text-[12px] text-[var(--muted)]">{dateRange(p.departureDate, p.returnDate)}</p>
                      <p className="k-num mt-2 text-[17px] font-extrabold text-[var(--accent-ink)]">{shortPrice(p)}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>

      <ShopFooter contact={contact} />
      <FloatingWhatsApp href={wa} label="Pesan" />
    </>
  );
}
