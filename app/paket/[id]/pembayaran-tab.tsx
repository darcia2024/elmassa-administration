"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronRight, CircleDollarSign, Download, Plus, Search } from "lucide-react";
import Link from "next/link";
import { exportToCSV } from "@/lib/export-excel";

import { formatDateID, formatIDR, type GroupPaymentRow, type PackageDetail } from "./types";

type Meta = {
  bookings: number;
  jamaah: number;
  totalBilled: number;
  totalPaid: number;
  totalOutstanding: number;
  settled: number;
  unsettled: number;
};

export function PembayaranTab({ pkg }: { pkg: PackageDetail }) {
  const [rows, setRows] = useState<GroupPaymentRow[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"semua" | "lunas" | "belum">("semua");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setIsLoading(true);
    fetch(`/api/payments/group/${encodeURIComponent(pkg.id)}`, { cache: "no-store" })
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || "Gagal memuat data pembayaran");
        setRows(json.data ?? []);
        setMeta(json.meta ?? null);
        setError("");
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Gagal memuat data pembayaran"))
      .finally(() => setIsLoading(false));
  }, [pkg.id]);

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();

    return rows.filter((row) => {
      const matchesQuery =
        !q ||
        row.customerName.toLowerCase().includes(q) ||
        row.bookingCode.toLowerCase().includes(q) ||
        row.phone.toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === "semua" || (statusFilter === "lunas" ? row.isSettled : !row.isSettled);

      return matchesQuery && matchesStatus;
    });
  }, [rows, query, statusFilter]);

  /** One row per payment, so the export keeps the DP / cicilan ke-N breakdown
   *  instead of flattening every jamaah down to a single total. */
  const handleExport = () => {
    const exportRows: (string | number)[][] = [];

    for (const row of filteredRows) {
      if (row.installments.length === 0) {
        exportRows.push([
          row.bookingCode, row.customerName, row.phone, row.participants,
          "", "", "", "", "",
          row.totalAmount, row.paidAmount, row.remainingAmount,
          row.isSettled ? "Lunas" : "Belum Lunas",
        ]);
        continue;
      }

      for (const inst of row.installments) {
        exportRows.push([
          row.bookingCode, row.customerName, row.phone, row.participants,
          inst.label, inst.date, inst.amount, inst.method, inst.receiptNumber ?? "",
          row.totalAmount, row.paidAmount, row.remainingAmount,
          row.isSettled ? "Lunas" : "Belum Lunas",
        ]);
      }
    }

    exportToCSV(
      `pembayaran-${pkg.name}`,
      [
        "Kode Booking", "Nama Jamaah", "No. HP", "Jumlah Pax",
        "Termin", "Tanggal Bayar", "Nominal", "Metode", "No. Kuitansi",
        "Total Tagihan", "Total Dibayar", "Sisa Pembayaran", "Status",
      ],
      exportRows,
    );
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-stone-200/70 bg-white p-10 text-center shadow-2xs">
        <p className="text-xs font-medium text-stone-500">Memuat data pembayaran…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-6 text-center shadow-2xs">
        <p className="text-xs font-bold text-rose-800">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">

      {/* Summary */}
      <section className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        {[
          { label: "Total Tagihan", value: formatIDR(meta?.totalBilled ?? 0), tone: "text-brand-cocoa" },
          { label: "Sudah Dibayar", value: formatIDR(meta?.totalPaid ?? 0), tone: "text-emerald-700" },
          { label: "Sisa Pembayaran", value: formatIDR(meta?.totalOutstanding ?? 0), tone: "text-brand-pink" },
          {
            label: "Status Jamaah",
            value: `${meta?.settled ?? 0} Lunas · ${meta?.unsettled ?? 0} Belum`,
            tone: "text-stone-800",
          },
        ].map((card) => (
          <article key={card.label} className="rounded-2xl border border-stone-200/70 bg-white p-3.5 shadow-2xs">
            <p className="text-[10px] font-bold uppercase tracking-wide text-stone-400">{card.label}</p>
            <p className={`mt-1 text-sm font-black leading-tight ${card.tone}`}>{card.value}</p>
          </article>
        ))}
      </section>

      <section className="rounded-2xl border border-stone-200/70 bg-white p-4 sm:p-5 shadow-2xs space-y-3">

        <header className="flex flex-col gap-3 border-b border-stone-100 pb-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-brand-cocoa flex items-center gap-2">
              <CircleDollarSign className="h-4 w-4 text-brand-pink" strokeWidth={1.5} />
              <span>Pembayaran per Jamaah</span>
            </h3>
            <p className="text-[11px] text-stone-500 mt-0.5">
              {meta?.bookings ?? 0} booking · {meta?.jamaah ?? 0} pax. Klik baris untuk melihat rincian DP & cicilan.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-stone-400" strokeWidth={1.5} />
              <input
                type="text"
                placeholder="Cari nama / kode booking…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-9 w-56 rounded-xl border border-stone-200 bg-stone-50/50 pl-8 pr-3 text-xs font-medium text-brand-cocoa placeholder:text-stone-400 outline-none focus:border-brand-pink focus:bg-white transition"
              />
            </div>

            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar rounded-xl border border-stone-200 bg-stone-50 p-1 max-w-full">
              {([
                { id: "semua", label: "Semua" },
                { id: "lunas", label: "Lunas" },
                { id: "belum", label: "Belum Lunas" },
              ] as const).map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setStatusFilter(f.id)}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
                    statusFilter === f.id ? "bg-white text-brand-cocoa shadow-2xs" : "text-stone-500 hover:text-stone-800"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleExport}
              disabled={filteredRows.length === 0}
              className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-stone-200 bg-stone-50 px-3 text-xs font-bold text-stone-700 hover:bg-stone-100 disabled:opacity-40 transition"
            >
              <Download className="h-3.5 w-3.5 text-stone-500" strokeWidth={1.5} />
              <span>Export</span>
            </button>
          </div>
        </header>

        {rows.length === 0 ? (
          <div className="rounded-xl border border-dashed border-stone-300 bg-stone-50/60 p-8 text-center space-y-3">
            <p className="text-xs font-extrabold text-stone-700">Belum ada jamaah yang booking di grup ini</p>
            <p className="text-[11px] text-stone-500">
              Data pembayaran muncul otomatis begitu ada booking masuk untuk grup ini.
            </p>
            <Link
              href="/booking/form"
              className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-brand-pink px-4 text-xs font-bold text-white shadow-2xs hover:bg-brand-pinkHover transition"
            >
              <Plus className="h-3.5 w-3.5" strokeWidth={2} />
              <span>Daftarkan Jamaah</span>
            </Link>
          </div>
        ) : filteredRows.length === 0 ? (
          <p className="py-8 text-center text-xs text-stone-500">Tidak ada jamaah yang cocok dengan filter ini.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-stone-200/60">
            <table className="w-full min-w-[880px] border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-stone-200/60 bg-stone-50/70 text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                  <th className="py-2.5 pl-3 pr-2">Jamaah</th>
                  <th className="py-2.5 pr-2">Total Tagihan</th>
                  <th className="py-2.5 pr-2">DP Awal</th>
                  <th className="py-2.5 pr-2">Cicilan Lanjutan</th>
                  <th className="py-2.5 pr-2">Sudah Dibayar</th>
                  <th className="py-2.5 pr-2">Sisa</th>
                  <th className="py-2.5 pr-3 text-right">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-stone-100">
                {filteredRows.map((row) => {
                  const isOpen = expanded[row.bookingCode] ?? false;
                  const dp = row.installments[0];
                  const rest = row.installments.slice(1);
                  const restTotal = rest.reduce((sum, i) => sum + i.amount, 0);

                  return (
                    <Fragment key={row.bookingCode}>
                      <tr
                        className="cursor-pointer transition hover:bg-stone-50/60"
                        onClick={() => setExpanded((prev) => ({ ...prev, [row.bookingCode]: !isOpen }))}
                      >
                        <td className="py-3 pl-3 pr-2">
                          <div className="flex items-center gap-1.5">
                            {isOpen ? (
                              <ChevronDown className="h-3.5 w-3.5 shrink-0 text-stone-400" />
                            ) : (
                              <ChevronRight className="h-3.5 w-3.5 shrink-0 text-stone-400" />
                            )}
                            <div className="min-w-0">
                              <p className="font-bold text-brand-cocoa truncate">{row.customerName}</p>
                              <p className="text-[10px] text-stone-400">
                                {row.bookingCode} · {row.participants} pax
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 pr-2 font-semibold text-stone-800">{formatIDR(row.totalAmount)}</td>

                        <td className="py-3 pr-2">
                          {dp ? (
                            <>
                              <p className="font-semibold text-emerald-700">{formatIDR(dp.amount)}</p>
                              <p className="text-[10px] text-stone-400">{formatDateID(dp.date)}</p>
                            </>
                          ) : (
                            <span className="text-[11px] font-semibold text-rose-600">Belum ada DP</span>
                          )}
                        </td>

                        <td className="py-3 pr-2">
                          {rest.length > 0 ? (
                            <>
                              <p className="font-semibold text-stone-800">{formatIDR(restTotal)}</p>
                              <p className="text-[10px] text-stone-400">{rest.length}x pembayaran</p>
                            </>
                          ) : (
                            <span className="text-[11px] text-stone-400">—</span>
                          )}
                        </td>

                        <td className="py-3 pr-2 font-bold text-emerald-700">{formatIDR(row.paidAmount)}</td>

                        <td className="py-3 pr-2 font-bold text-brand-pink">{formatIDR(row.remainingAmount)}</td>

                        <td className="py-3 pr-3 text-right">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${
                              row.isSettled
                                ? "border-emerald-200/60 bg-emerald-50/80 text-emerald-800"
                                : "border-amber-200/60 bg-amber-50/80 text-amber-800"
                            }`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${row.isSettled ? "bg-emerald-500" : "bg-amber-500"}`} />
                            {row.isSettled ? "Lunas" : "Belum Lunas"}
                          </span>
                        </td>
                      </tr>

                      {isOpen ? (
                        <tr className="bg-stone-50/50">
                          <td colSpan={7} className="px-3 py-3">
                            {row.installments.length === 0 ? (
                              <p className="text-[11px] font-semibold text-stone-500">
                                Belum ada pembayaran tercatat untuk booking ini.
                              </p>
                            ) : (
                              <div className="space-y-1.5">
                                {row.installments.map((inst) => (
                                  <div
                                    key={inst.id}
                                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-stone-200/70 bg-white px-3 py-2"
                                  >
                                    <div className="flex items-center gap-2">
                                      <span className="rounded-md bg-brand-cocoa px-2 py-0.5 text-[9px] font-black uppercase text-white">
                                        {inst.label}
                                      </span>
                                      <span className="text-[11px] text-stone-500">{formatDateID(inst.date)}</span>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-3 text-[11px]">
                                      <span className="text-stone-500">{inst.method}</span>
                                      {inst.receiptNumber ? (
                                        <span className="font-mono font-bold text-stone-600">{inst.receiptNumber}</span>
                                      ) : null}
                                      <span className="rounded-full border border-stone-200 bg-stone-50 px-2 py-0.5 font-bold text-stone-600">
                                        {inst.status}
                                      </span>
                                      <span className="font-black text-emerald-700">{formatIDR(inst.amount)}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            <Link
                              href={`/booking/${encodeURIComponent(row.bookingCode)}`}
                              className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-brand-pink hover:underline"
                            >
                              Buka detail booking →
                            </Link>
                          </td>
                        </tr>
                      ) : null}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
