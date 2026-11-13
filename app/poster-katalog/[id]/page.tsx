import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getKatalogPackage, type KatalogItineraryDay } from "@/lib/katalog/store";
import { loadKatalogContact } from "@/lib/katalog/contact";
import { cleanText, dateRange, displayName, seatLabel, seatTone, shortPrice, whatsappLink } from "@/lib/katalog/present";

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
    title: `${pkg.name} — El Massa Tour & Travel`,
    description,
    openGraph: { title: pkg.name, description, images: pkg.posterUrl ? [{ url: pkg.posterUrl }] : undefined },
  };
}

function activityText(a: NonNullable<KatalogItineraryDay["activities"]>[number]) {
  if (typeof a === "string") return { time: "", text: a };
  return { time: a.time ?? "", text: a.description ?? a.activity ?? "" };
}

export default async function KatalogDetailPage({ params }: Params) {
  const { id } = await params;
  const [pkg, contact] = await Promise.all([getKatalogPackage(decodeURIComponent(id)).catch(() => null), loadKatalogContact()]);
  if (!pkg) notFound();

  const tone = seatTone(pkg.seats.remaining);
  const wa = whatsappLink(contact.whatsapp, pkg);

  return (
    <div className="lg:grid lg:grid-cols-[47%_minmax(0,1fr)]">
      <div className="bg-[var(--stage)] lg:sticky lg:top-0 lg:h-svh">
        <div className="flex h-[64svh] min-h-[420px] flex-col p-4 sm:p-6 lg:h-full lg:p-10">
          <div className="relative min-h-0 flex-1">
            {pkg.posterUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={pkg.posterUrl}
                alt={`Poster ${pkg.name}`}
                width={1200}
                height={1500}
                fetchPriority="high"
                className="k-poster absolute inset-0 h-full w-full object-contain"
              />
            ) : (
              <div className="k-poster absolute inset-0 flex flex-col justify-between bg-[var(--accent)] p-8 text-white lg:p-12">
                <span className="text-[17px] font-extrabold tracking-[-0.03em]">el massa</span>
                <span>
                  <span className="block text-[30px] lg:text-[52px] font-extrabold leading-[1.02] tracking-[-0.03em]">{displayName(pkg.name)}</span>
                  <span className="mt-3 block text-[17px] font-semibold">{dateRange(pkg.departureDate, pkg.returnDate)}</span>
                  <span className="mt-1 block text-[30px] font-extrabold">{shortPrice(pkg)}</span>
                </span>
              </div>
            )}
          </div>
          {pkg.posterUrl && (
            <a href={pkg.posterUrl} download className="mt-3 self-start text-[15px] text-[var(--on-dark)] underline">
              Unduh poster
            </a>
          )}
        </div>
      </div>

      <main className="min-w-0 px-5 pb-16 sm:px-10 lg:px-16">
        <nav aria-label="Navigasi katalog" className="flex items-center justify-between gap-4 py-6 text-[15px]">
          <Link href="/poster-katalog#jadwal" className="font-bold text-[var(--ink)] no-underline hover:underline">
            ← Semua jadwal
          </Link>
          <a href={wa} target="_blank" rel="noopener noreferrer" className="k-press bg-[var(--accent)] px-4 py-2.5 font-bold text-white no-underline hover:bg-[var(--accent-ink)]">
            Chat WhatsApp
          </a>
        </nav>

        <header className="max-w-[46rem] pt-6">
          <h1 className="k-rise text-[30px] lg:text-[52px] font-extrabold leading-[1.04] tracking-[-0.03em]">{displayName(pkg.name)}</h1>
          <p className="k-rise mt-4 text-[17px] font-semibold" data-d="1">
            {dateRange(pkg.departureDate, pkg.returnDate)} · {pkg.duration} · {pkg.price}
          </p>
          <p className={`k-rise mt-1 text-[17px] ${tone === "open" ? "" : "font-bold text-[var(--accent-ink)]"}`} data-d="1">
            {pkg.seats.remaining > 0 ? `Sisa ${pkg.seats.remaining} dari ${pkg.seats.quota} seat` : "Seat penuh, tanyakan daftar tunggu"}
          </p>
          {pkg.programUmrah && <p className="k-rise mt-6 max-w-[60ch] text-[17px] leading-[1.6]" data-d="2">{cleanText(pkg.programUmrah)}</p>}
        </header>

        <section aria-labelledby="ringkas-title" className="mt-12 max-w-[46rem] bg-[var(--tone)] px-6 py-7 sm:px-8">
          <h2 id="ringkas-title" className="text-[30px] font-extrabold tracking-[-0.02em]">Perjalanan</h2>
          <dl className="mt-5 grid grid-cols-1 gap-x-8 gap-y-4 text-[17px] sm:grid-cols-2">
            {[
              ["Berangkat dari", pkg.startPoint.replace(/^Start\s+/i, "")],
              ["Maskapai", pkg.airline],
              ["Rute", pkg.flightRoute],
              ["Kamar", pkg.meta.roomType ?? ""],
              ["Hotel Makkah", pkg.makkahHotel],
              ["Hotel Madinah", pkg.madinahHotel],
              ["DP mulai", pkg.dpMinimum],
              ["Bonus", pkg.meta.highlight ?? ""],
            ]
              .filter(([, v]) => v)
              .map(([k, v]) => (
                <div key={k}>
                  <dt className="text-[15px] text-[var(--muted)]">{k}</dt>
                  <dd className="mt-0.5 font-semibold">{cleanText(v)}</dd>
                </div>
              ))}
          </dl>
          <a href={wa} target="_blank" rel="noopener noreferrer" className="k-press mt-8 flex min-h-[64px] items-center justify-center bg-[var(--accent)] px-5 text-[17px] font-bold text-white no-underline hover:bg-[var(--accent-ink)]">
            {pkg.seats.remaining > 0 ? "Pesan lewat WhatsApp" : "Masuk daftar tunggu"}
          </a>
        </section>

        {pkg.itinerary.length > 0 && (
          <section aria-labelledby="itin-title" className="mt-20 max-w-[46rem]">
            <h2 id="itin-title" className="k-rise text-[30px] font-extrabold tracking-[-0.02em]">Itinerary</h2>
            <ol className="mt-8 space-y-9">
              {pkg.itinerary.map((day) => (
                <li key={day.day} className="k-rise grid gap-x-6 gap-y-2 sm:grid-cols-[7.5rem_1fr]">
                  <p className="text-[15px] font-bold text-[var(--accent-ink)]">
                    Hari {day.day}
                    {day.date ? <span className="block font-semibold text-[var(--muted)]">{day.date}</span> : null}
                  </p>
                  <div>
                    <h3 className="text-[17px] font-extrabold leading-snug">{day.title}</h3>
                    {day.location && <p className="mt-0.5 text-[15px] text-[var(--muted)]">{day.location}</p>}
                    {(day.activities ?? []).length > 0 && (
                      <ul className="mt-3 space-y-2 text-[17px] leading-[1.55]">
                        {(day.activities ?? []).map((a, i) => {
                          const { time, text } = activityText(a);
                          return text ? (
                            <li key={i}>
                              {time && <span className="font-semibold">{time.replace(/^Pukul\s+/i, "")} </span>}
                              {text}
                            </li>
                          ) : null;
                        })}
                      </ul>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </section>
        )}

        {(pkg.includes.length > 0 || pkg.excludes.length > 0) && (
          <section aria-labelledby="biaya-title" className="mt-20 max-w-[46rem]">
            <h2 id="biaya-title" className="k-rise text-[30px] font-extrabold tracking-[-0.02em]">Sudah dan belum termasuk</h2>
            <div className="mt-8 grid gap-10 sm:grid-cols-2">
              {pkg.includes.length > 0 && (
                <div>
                  <h3 className="text-[17px] font-extrabold">Sudah termasuk</h3>
                  <ul className="mt-3 list-disc space-y-1.5 pl-5 text-[17px] leading-[1.5] marker:text-emerald-700">
                    {pkg.includes.map((x) => <li key={x}>{x}</li>)}
                  </ul>
                </div>
              )}
              {pkg.excludes.length > 0 && (
                <div>
                  <h3 className="text-[17px] font-extrabold">Belum termasuk</h3>
                  <ul className="mt-3 list-disc space-y-1.5 pl-5 text-[17px] leading-[1.5] marker:text-[var(--accent)]">
                    {pkg.excludes.map((x) => <li key={x}>{x}</li>)}
                  </ul>
                </div>
              )}
            </div>
          </section>
        )}

        <footer className="mt-24 text-[15px] text-[var(--muted)]">
          {contact.name} · Izin PPIU {contact.ppiu} · {contact.address}
        </footer>
      </main>
    </div>
  );
}
