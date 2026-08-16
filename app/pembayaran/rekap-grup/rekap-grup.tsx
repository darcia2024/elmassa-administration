"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronRight, Layers, Users } from "lucide-react";
import Link from "next/link";

type Departure = {
  id: string;
  name: string;
  departureDate: string;
  targetPax: number;
  bookedSeats: number;
};

type GroupTotals = {
  bookings: number;
  jamaah: number;
  totalBilled: number;
  totalPaid: number;
  totalOutstanding: number;
  settled: number;
  unsettled: number;
};

type Row = Departure & { totals: GroupTotals | null };

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

function formatIDR(value: number) {
  return `Rp ${Math.round(Number(value) || 0).toLocaleString("id-ID")}`;
}

function formatDateID(iso: string) {
  const match = String(iso).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return iso || "—";
  const [, year, month, day] = match;
  return `${Number(day)} ${MONTHS[Number(month) - 1]} ${year}`;
}

export function RekapGrup() {
  const [rows, setRows] = useState<Row[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let cancelled = false;

    // Groups first, then each group's payment totals. The per-group endpoint is
    // the same one the group detail page uses, so a row here and that page can
    // never quote different numbers.
    fetch("/api/manifest/departures", { cache: "no-store" })
      .then((res) => res.json())
      .then(async (json) => {
        const departures = (json.data ?? []) as Departure[];

        const withTotals = await Promise.all(
          departures.map(async (d) => {
            try {
              const res = await fetch(`/api/payments/group/${encodeURIComponent(d.id)}`, { cache: "no-store" });
              const body = await res.json();
              return { ...d, totals: res.ok ? (body.meta as GroupTotals) : null };
            } catch {
              return { ...d, totals: null };
            }
          }),
        );

        if (!cancelled) setRows(withTotals);
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : "Gagal memuat rekap");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const grand = useMemo(
    () =>
      rows.reduce(
        (acc, r) => ({
          billed: acc.billed + (r.totals?.totalBilled ?? 0),
          paid: acc.paid + (r.totals?.totalPaid ?? 0),
          outstanding: acc.outstanding + (r.totals?.totalOutstanding ?? 0),
          jamaah: acc.jamaah + (r.totals?.jamaah ?? 0),
        }),
        { billed: 0, paid: 0, outstanding: 0, jamaah: 0 },
      ),
    [rows],
  );

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-stone-200/70 bg-white p-10 text-center shadow-2xs">
        <p className="text-xs font-medium text-stone-500">Memuat rekap pembayaran…</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-6 text-center shadow-2xs">
        <p className="text-xs font-bold text-rose-800">{loadError}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 font-sans">

      <section className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        {[
          { label: "Total Grup", value: `${rows.length}` },
          { label: "Total Jamaah", value: `${grand.jamaah} Pax` },
          { label: "Total Dibayar", value: formatIDR(grand.paid), tone: "text-emerald-700" },
          { label: "Total Sisa", value: formatIDR(grand.outstanding), tone: "text-brand-pink" },
        ].map((card) => (
          <article key={card.label} className="rounded-2xl border border-stone-200/70 bg-white p-3.5 shadow-2xs">
            <p className="text-[10px] font-bold uppercase tracking-wide text-stone-400">{card.label}</p>
            <p className={`mt-1 text-sm font-black leading-tight ${card.tone ?? "text-brand-cocoa"}`}>{card.value}</p>
          </article>
        ))}
      </section>

      <section className="rounded-2xl border border-stone-200/70 bg-white p-4 sm:p-5 shadow-2xs space-y-3">
        <header className="border-b border-stone-100 pb-3">
          <h2 className="text-sm font-extrabold text-brand-cocoa flex items-center gap-2">
            <Layers className="h-4 w-4 text-brand-pink" strokeWidth={1.5} />
            <span>Rekap Pembayaran per Grup Keberangkatan</span>
          </h2>
          <p className="text-[11px] text-stone-500 mt-0.5">
            Klik satu grup untuk melihat rincian per jamaah (DP awal, cicilan ke-1, ke-2, sisa, & status).
          </p>
        </header>

        {rows.length === 0 ? (
          <div className="rounded-xl border border-dashed border-stone-300 bg-stone-50/60 p-8 text-center space-y-2">
            <p className="text-xs font-extrabold text-stone-700">Belum ada grup keberangkatan</p>
            <Link href="/paket" className="inline-block text-[11px] font-bold text-brand-pink hover:underline">
              Buka Jadwal Keberangkatan →
            </Link>
          </div>
        ) : (
          <>
          {/* Kartu mobile -- tabel rekap di bawah butuh 900px */}
          <div className="block space-y-3 md:hidden">
            {rows.map((row) => {
              const t = row.totals;
              const progress = t && t.totalBilled > 0 ? Math.min((t.totalPaid / t.totalBilled) * 100, 100) : 0;

              return (
                <Link
                  key={row.id}
                  href={`/paket/${encodeURIComponent(row.id)}`}
                  className="block space-y-2.5 rounded-2xl border border-stone-200/80 bg-white p-4 shadow-2xs active:bg-stone-50"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="min-w-0 truncate text-xs font-bold text-brand-cocoa" title={row.name}>
                      {row.name}
                    </p>
                    <ChevronRight className="h-4 w-4 shrink-0 text-stone-400" />
                  </div>

                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-stone-100">
                    <div className="h-full rounded-full bg-emerald-500" style={{ width: `${progress}%` }} />
                  </div>

                  <div className="rounded-xl border border-stone-100 bg-stone-50 p-2.5">
                    <span className="block text-[10px] font-medium text-stone-400">Sisa Tagihan</span>
                    <span className="text-sm font-bold text-brand-pink">{formatIDR(t?.totalOutstanding ?? 0)}</span>
                    <div className="mt-2 grid grid-cols-2 gap-2 border-t border-stone-200/70 pt-2 text-[11px]">
                      <div className="min-w-0">
                        <span className="block text-[10px] font-medium text-stone-400">Tagihan</span>
                        <span className="block truncate font-semibold text-stone-800">{formatIDR(t?.totalBilled ?? 0)}</span>
                      </div>
                      <div className="min-w-0">
                        <span className="block text-[10px] font-medium text-stone-400">Dibayar</span>
                        <span className="block truncate font-bold text-emerald-700">{formatIDR(t?.totalPaid ?? 0)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 border-t border-stone-100 pt-1 text-[11px] text-stone-600">
                    <span className="inline-flex items-center gap-1">
                      <Users className="h-3 w-3 text-stone-400" />
                      {t?.jamaah ?? 0} / {row.targetPax} pax
                    </span>
                    <span>Lunas {t ? `${t.settled}/${t.bookings}` : "—"}</span>
                  </div>

                  <p className="text-[11px] text-stone-500">Berangkat {formatDateID(row.departureDate)}</p>
                </Link>
              );
            })}
          </div>

          <div className="hidden overflow-x-auto rounded-xl border border-stone-200/60 md:block">
            <table className="w-full min-w-[900px] border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-stone-200/60 bg-stone-50/70 text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                  <th className="py-2.5 pl-3 pr-2">Grup</th>
                  <th className="py-2.5 pr-2">Berangkat</th>
                  <th className="py-2.5 pr-2 text-right">Jamaah</th>
                  <th className="py-2.5 pr-2 text-right">Tagihan</th>
                  <th className="py-2.5 pr-2 text-right">Dibayar</th>
                  <th className="py-2.5 pr-2 text-right">Sisa</th>
                  <th className="py-2.5 pr-2">Lunas</th>
                  <th className="py-2.5 pr-3 text-right">Rincian</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-stone-100">
                {rows.map((row) => {
                  const t = row.totals;
                  const progress = t && t.totalBilled > 0 ? Math.min((t.totalPaid / t.totalBilled) * 100, 100) : 0;

                  return (
                    <tr key={row.id} className="transition hover:bg-stone-50/60">
                      <td className="py-2.5 pl-3 pr-2 max-w-[220px]">
                        <p className="truncate font-bold text-brand-cocoa" title={row.name}>{row.name}</p>
                        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-stone-100">
                          <div className="h-full rounded-full bg-emerald-500" style={{ width: `${progress}%` }} />
                        </div>
                      </td>
                      <td className="py-2.5 pr-2 whitespace-nowrap text-stone-600">{formatDateID(row.departureDate)}</td>
                      <td className="py-2.5 pr-2 text-right text-stone-700 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1">
                          <Users className="h-3 w-3 text-stone-400" />
                          {t?.jamaah ?? 0} / {row.targetPax}
                        </span>
                      </td>
                      <td className="py-2.5 pr-2 text-right font-semibold text-stone-800 whitespace-nowrap">
                        {formatIDR(t?.totalBilled ?? 0)}
                      </td>
                      <td className="py-2.5 pr-2 text-right font-bold text-emerald-700 whitespace-nowrap">
                        {formatIDR(t?.totalPaid ?? 0)}
                      </td>
                      <td className="py-2.5 pr-2 text-right font-bold text-brand-pink whitespace-nowrap">
                        {formatIDR(t?.totalOutstanding ?? 0)}
                      </td>
                      <td className="py-2.5 pr-2 whitespace-nowrap text-stone-700">
                        {t ? `${t.settled} / ${t.bookings}` : "—"}
                      </td>
                      <td className="py-2.5 pr-3 text-right">
                        <Link
                          href={`/paket/${encodeURIComponent(row.id)}`}
                          className="inline-flex h-7 items-center gap-1 rounded-lg border border-stone-200 bg-white px-2.5 text-[11px] font-bold text-stone-700 hover:bg-stone-100 transition"
                        >
                          Buka <ChevronRight className="h-3 w-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          </>
        )}
      </section>
    </div>
  );
}
