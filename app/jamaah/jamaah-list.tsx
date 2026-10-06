"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronRight, Contact, Plus, Search } from "lucide-react";
import { COMPLETENESS_STATUSES, STATUS_STYLES, type Completeness, type CompletenessStatus } from "@/lib/jamaah/rules";

type JamaahRow = {
  id: string;
  fullName: string;
  gender: string;
  birthDate: string | null;
  nik: string;
  passportNumber: string;
  passportExpiry: string | null;
  phone: string;
  source: string;
  updatedAt: string;
  documentCount: number;
  departureNames: string[];
  companionCount: number;
  completeness: Completeness;
};

function formatDate(iso: string | null) {
  if (!iso) return "—";
  const d = new Date(`${iso.slice(0, 10)}T00:00:00`);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}

function StatusBadge({ status }: { status: CompletenessStatus }) {
  return (
    <span className={`inline-flex whitespace-nowrap rounded-full border px-2 py-0.5 text-[10px] font-bold ${STATUS_STYLES[status]}`}>
      {status}
    </span>
  );
}

export function JamaahList() {
  const [rows, setRows] = useState<JamaahRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<CompletenessStatus | "">("");

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/jamaah", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) {
        setLoadError(json?.error || "Gagal memuat database jamaah");
        return;
      }
      setRows(json.data ?? []);
      setLoadError("");
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Gagal memuat database jamaah");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const counts = useMemo(
    () => Object.fromEntries(COMPLETENESS_STATUSES.map((s) => [s, rows.filter((r) => r.completeness.status === s).length])),
    [rows],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (statusFilter && r.completeness.status !== statusFilter) return false;
      if (!q) return true;
      return (
        r.fullName.toLowerCase().includes(q) ||
        r.nik.includes(q) ||
        r.passportNumber.toLowerCase().includes(q) ||
        r.phone.includes(q) ||
        r.departureNames.some((n) => n.toLowerCase().includes(q))
      );
    });
  }, [rows, query, statusFilter]);

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-stone-200/70 bg-white p-10 text-center shadow-2xs">
        <p className="text-xs font-medium text-stone-500">Memuat database jamaah…</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 font-sans">
      <section className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        {COMPLETENESS_STATUSES.map((status) => {
          const active = statusFilter === status;
          return (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(active ? "" : status)}
              aria-pressed={active}
              className={`rounded-2xl border bg-white p-3.5 text-left shadow-2xs transition ${
                active ? "border-brand-pink ring-2 ring-brand-pink/20" : "border-stone-200/70 hover:border-stone-300"
              }`}
            >
              <p className="text-[10px] font-bold uppercase tracking-wide text-stone-400">{status}</p>
              <p className="mt-1 text-sm font-black leading-tight text-brand-cocoa">{counts[status] ?? 0} Jamaah</p>
            </button>
          );
        })}
      </section>

      <section className="space-y-3 rounded-2xl border border-stone-200/70 bg-white p-4 shadow-2xs sm:p-5">
        <header className="flex flex-col gap-3 border-b border-stone-100 pb-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-sm font-extrabold text-brand-cocoa">
              <Contact className="h-4 w-4 text-brand-pink" strokeWidth={1.5} />
              <span>Profil Master Jamaah</span>
            </h2>
            <p className="mt-0.5 text-[11px] text-stone-500">
              Satu profil per jamaah — diisi kantor maupun jamaah sendiri lewat UmrahMe. Status dihitung otomatis dari data & dokumen.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-0 flex-1 sm:flex-none">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-stone-400" strokeWidth={1.5} />
              <input
                type="text"
                placeholder="Cari nama / NIK / paspor / grup…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-9 w-full rounded-xl border border-stone-200 bg-stone-50/50 pl-8 pr-3 text-xs font-medium text-brand-cocoa outline-none transition placeholder:text-stone-400 focus:border-brand-pink focus:bg-white sm:w-64"
              />
            </div>
            <Link
              href="/jamaah/baru"
              className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-brand-pink px-4 text-xs font-bold text-white shadow-2xs transition hover:bg-brand-pinkHover"
            >
              <Plus className="h-3.5 w-3.5" strokeWidth={2} />
              <span>Tambah Jamaah</span>
            </Link>
          </div>
        </header>

        {loadError ? (
          <p className="rounded-xl border border-rose-200 bg-rose-50/60 px-3 py-2 text-[11px] font-semibold text-rose-700">{loadError}</p>
        ) : null}

        {filtered.length === 0 ? (
          <div className="space-y-2 rounded-xl border border-dashed border-stone-300 bg-stone-50/60 p-8 text-center">
            <p className="text-xs font-extrabold text-stone-700">
              {rows.length === 0 ? "Belum ada jamaah di database" : "Tidak ada jamaah yang cocok"}
            </p>
            <p className="mx-auto max-w-md text-[11px] text-stone-500">
              Tambahkan jamaah dari sini, atau kirim link pendataan supaya jamaah mengisi datanya sendiri.
            </p>
          </div>
        ) : (
          <>
            <div className="block space-y-2.5 md:hidden">
              {filtered.map((row) => (
                <Link
                  key={row.id}
                  href={`/jamaah/${row.id}`}
                  className="block space-y-2 rounded-2xl border border-stone-200/80 bg-white p-3.5 shadow-2xs active:bg-stone-50"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h4 className="truncate text-xs font-bold text-brand-cocoa">{row.fullName}</h4>
                      <p className="truncate text-[10px] text-stone-400">
                        <span className="font-mono">{row.passportNumber || "Paspor —"}</span>
                        {row.departureNames[0] ? ` · ${row.departureNames[0]}` : ""}
                      </p>
                    </div>
                    <StatusBadge status={row.completeness.status} />
                  </div>
                  <p className="text-[10px] text-stone-500">
                    Dokumen {row.documentCount}/7 · Paspor s/d {formatDate(row.passportExpiry)}
                  </p>
                </Link>
              ))}
            </div>

            <div className="hidden overflow-x-auto rounded-xl border border-stone-200/60 md:block">
              <table className="w-full min-w-[860px] border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-200/60 bg-stone-50/70 text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                    <th className="py-2.5 pl-3 pr-2">Jamaah</th>
                    <th className="py-2.5 pr-2">Paspor</th>
                    <th className="py-2.5 pr-2">Berlaku s/d</th>
                    <th className="py-2.5 pr-2">Grup</th>
                    <th className="py-2.5 pr-2 text-center">Dokumen</th>
                    <th className="py-2.5 pr-2">Status</th>
                    <th className="py-2.5 pr-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filtered.map((row) => (
                    <tr key={row.id} className="transition hover:bg-stone-50/60">
                      <td className="py-2.5 pl-3 pr-2">
                        <Link href={`/jamaah/${row.id}`} className="font-bold text-brand-cocoa hover:text-brand-pink">
                          {row.fullName}
                        </Link>
                        <p className="text-[10px] text-stone-400">
                          {row.phone || "—"}
                          {row.companionCount > 0 ? ` · ${row.companionCount} penyerta` : ""}
                          {row.source === "umrahme" ? " · daftar via UmrahMe" : ""}
                        </p>
                      </td>
                      <td className="py-2.5 pr-2 font-mono text-stone-700">{row.passportNumber || "—"}</td>
                      <td className="whitespace-nowrap py-2.5 pr-2 text-stone-600">{formatDate(row.passportExpiry)}</td>
                      <td className="max-w-[200px] truncate py-2.5 pr-2 text-stone-600" title={row.departureNames.join(", ")}>
                        {row.departureNames.join(", ") || "—"}
                      </td>
                      <td className="py-2.5 pr-2 text-center font-bold text-stone-700">{row.documentCount}/7</td>
                      <td className="py-2.5 pr-2">
                        <StatusBadge status={row.completeness.status} />
                      </td>
                      <td className="py-2.5 pr-3 text-right">
                        <Link
                          href={`/jamaah/${row.id}`}
                          className="inline-grid h-7 w-7 place-items-center rounded-lg border border-stone-200 bg-white text-stone-500 transition hover:bg-stone-100"
                          aria-label={`Buka profil ${row.fullName}`}
                        >
                          <ChevronRight className="h-3.5 w-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
