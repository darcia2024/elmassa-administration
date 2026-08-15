"use client";

import { useEffect, useMemo, useState } from "react";
import { BarChart3, Download, Plane, Users } from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { ReportNav } from "@/components/report-nav";
import { exportToCSV } from "@/lib/export-excel";

/**
 * Okupansi seat per grup keberangkatan.
 *
 * Halaman ini dulu berisi placeholder "Segera Hadir" dengan alasan booking
 * hanya menyimpan teks keberangkatan bebas, bukan jadwal dengan kuota kursi.
 * Alasan itu sudah tidak berlaku: booking sekarang menyimpan package_id dan
 * published_packages punya target_pax, jadi kuota dan keterisian bisa dihitung
 * -- persis agregat yang sudah dipakai halaman Manifest & Seat.
 */

type Departure = {
  id: string;
  name: string;
  departureDate: string;
  targetPax: number;
  bookedSeats: number;
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

function formatDateID(iso: string) {
  const m = String(iso).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return iso || "—";
  return `${Number(m[3])} ${MONTHS[Number(m[2]) - 1]} ${m[1]}`;
}

export default function BookingDepartureReportPage() {
  const [rows, setRows] = useState<Departure[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/manifest/departures", { cache: "no-store" })
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || "Gagal memuat data keberangkatan");
        setRows(json.data ?? []);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Gagal memuat data"))
      .finally(() => setIsLoading(false));
  }, []);

  const total = useMemo(() => {
    const kuota = rows.reduce((s, r) => s + (Number(r.targetPax) || 0), 0);
    const terisi = rows.reduce((s, r) => s + (Number(r.bookedSeats) || 0), 0);
    return { kuota, terisi, sisa: Math.max(kuota - terisi, 0), persen: kuota > 0 ? (terisi / kuota) * 100 : 0 };
  }, [rows]);

  const handleExport = () => {
    exportToCSV(
      "laporan-okupansi-seat",
      ["No", "Grup Keberangkatan", "Tanggal Berangkat", "Kuota Seat", "Terisi", "Sisa", "Okupansi (%)"],
      rows.map((r, i) => {
        const kuota = Number(r.targetPax) || 0;
        const terisi = Number(r.bookedSeats) || 0;
        return [i + 1, r.name, r.departureDate, kuota, terisi, Math.max(kuota - terisi, 0),
                kuota > 0 ? ((terisi / kuota) * 100).toFixed(1) : "0"];
      }),
    );
  };

  return (
    <AppShell eyebrow="Laporan & Analytics" title="Laporan Penjualan Booking & Okupansi Seat">
      <div className="space-y-5 font-sans">
        <ReportNav />

        {isLoading ? (
          <div className="rounded-2xl border border-stone-200/70 bg-white p-10 text-center shadow-2xs">
            <p className="text-xs font-medium text-stone-500">Memuat okupansi seat…</p>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-6 text-center shadow-2xs">
            <p className="text-xs font-bold text-rose-800">{error}</p>
          </div>
        ) : (
          <>
            <section className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
              {[
                { label: "Grup Keberangkatan", value: `${rows.length}`, tone: "text-brand-cocoa" },
                { label: "Total Kuota Seat", value: `${total.kuota} Pax`, tone: "text-brand-cocoa" },
                { label: "Seat Terisi", value: `${total.terisi} Pax`, tone: "text-emerald-700" },
                { label: "Okupansi", value: `${total.persen.toFixed(1)}%`, tone: "text-brand-pink" },
              ].map((c) => (
                <article key={c.label} className="rounded-2xl border border-stone-200/70 bg-white p-3.5 shadow-2xs">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-stone-400">{c.label}</p>
                  <p className={`mt-1 text-sm font-black leading-tight ${c.tone}`}>{c.value}</p>
                </article>
              ))}
            </section>

            <section className="rounded-2xl border border-stone-200/70 bg-white p-4 sm:p-5 shadow-2xs space-y-3">
              <header className="flex flex-col gap-3 border-b border-stone-100 pb-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-sm font-extrabold text-brand-cocoa flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-brand-pink" strokeWidth={1.5} />
                    <span>Okupansi per Grup</span>
                  </h2>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    Keterisian dihitung dari booking yang benar-benar masuk, bukan angka yang diketik manual.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleExport}
                  disabled={rows.length === 0}
                  className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-stone-200 bg-stone-50 px-3 text-xs font-bold text-stone-700 hover:bg-stone-100 disabled:opacity-40 transition"
                >
                  <Download className="h-3.5 w-3.5 text-stone-500" strokeWidth={1.5} />
                  <span>Export</span>
                </button>
              </header>

              {rows.length === 0 ? (
                <div className="rounded-xl border border-dashed border-stone-300 bg-stone-50/60 p-8 text-center space-y-2">
                  <p className="text-xs font-extrabold text-stone-700">Belum ada grup keberangkatan</p>
                  <Link href="/paket" className="inline-block text-[11px] font-bold text-brand-pink hover:underline">
                    Buka Jadwal Keberangkatan →
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-stone-200/60">
                  <table className="w-full min-w-[760px] border-collapse text-left text-xs">
                    <thead>
                      <tr className="border-b border-stone-200/60 bg-stone-50/70 text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                        <th className="py-2.5 pl-3 pr-2">Grup</th>
                        <th className="py-2.5 pr-2">Berangkat</th>
                        <th className="py-2.5 pr-2 text-right">Kuota</th>
                        <th className="py-2.5 pr-2 text-right">Terisi</th>
                        <th className="py-2.5 pr-2 text-right">Sisa</th>
                        <th className="py-2.5 pr-3">Okupansi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {rows.map((r) => {
                        const kuota = Number(r.targetPax) || 0;
                        const terisi = Number(r.bookedSeats) || 0;
                        const persen = kuota > 0 ? Math.min((terisi / kuota) * 100, 100) : 0;
                        const penuh = persen >= 90;

                        return (
                          <tr key={r.id} className="transition hover:bg-stone-50/60">
                            <td className="py-2.5 pl-3 pr-2 max-w-[220px]">
                              <Link href={`/paket/${encodeURIComponent(r.id)}`} className="font-bold text-brand-cocoa hover:text-brand-pink hover:underline block truncate" title={r.name}>
                                {r.name}
                              </Link>
                            </td>
                            <td className="py-2.5 pr-2 whitespace-nowrap text-stone-600">{formatDateID(r.departureDate)}</td>
                            <td className="py-2.5 pr-2 text-right text-stone-700">{kuota}</td>
                            <td className="py-2.5 pr-2 text-right font-bold text-emerald-700">{terisi}</td>
                            <td className="py-2.5 pr-2 text-right font-bold text-brand-pink">{Math.max(kuota - terisi, 0)}</td>
                            <td className="py-2.5 pr-3 min-w-[150px]">
                              <div className="flex items-center gap-2">
                                <div className="h-2 flex-1 overflow-hidden rounded-full bg-stone-100">
                                  <div className={`h-full rounded-full ${penuh ? "bg-emerald-500" : "bg-brand-pink"}`} style={{ width: `${persen}%` }} />
                                </div>
                                <span className="w-11 shrink-0 text-right text-[11px] font-bold text-stone-700">
                                  {persen.toFixed(0)}%
                                </span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </AppShell>
  );
}
