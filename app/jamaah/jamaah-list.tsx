"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Contact,
  Folder,
  FolderOpen,
  Layers,
  LayoutGrid,
  List,
  Plus,
  Search,
  Users,
} from "lucide-react";
import {
  COMPLETENESS_STATUSES,
  STATUS_STYLES,
  type Completeness,
  type CompletenessStatus,
} from "@/lib/jamaah/rules";

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
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}

function StatusBadge({ status }: { status: CompletenessStatus }) {
  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full border px-2 py-0.5 text-[10px] font-bold ${STATUS_STYLES[status]}`}
    >
      {status}
    </span>
  );
}

function JamaahTable({
  items,
  showGroupColumn = true,
}: {
  items: JamaahRow[];
  showGroupColumn?: boolean;
}) {
  if (items.length === 0) {
    return (
      <div className="space-y-2 rounded-xl border border-dashed border-stone-300 bg-stone-50/60 p-8 text-center">
        <p className="text-xs font-extrabold text-stone-700">Tidak ada jamaah dalam tampilan ini</p>
        <p className="mx-auto max-w-md text-[11px] text-stone-500">
          Tambahkan jamaah baru atau sesuaikan filter pencarian.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Mobile Card List */}
      <div className="block space-y-2.5 md:hidden">
        {items.map((row) => (
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
                  {showGroupColumn && row.departureNames[0] ? ` · ${row.departureNames[0]}` : ""}
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

      {/* Desktop Table */}
      <div className="hidden overflow-x-auto rounded-xl border border-stone-200/60 md:block">
        <table className="w-full min-w-[800px] border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-stone-200/60 bg-stone-50/70 text-[10px] font-semibold uppercase tracking-wider text-stone-500">
              <th className="py-2.5 pl-3 pr-2">Jamaah</th>
              <th className="py-2.5 pr-2">Paspor</th>
              <th className="py-2.5 pr-2">Berlaku s/d</th>
              {showGroupColumn && <th className="py-2.5 pr-2">Grup</th>}
              <th className="py-2.5 pr-2 text-center">Dokumen</th>
              <th className="py-2.5 pr-2">Status</th>
              <th className="py-2.5 pr-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {items.map((row) => (
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
                {showGroupColumn && (
                  <td className="max-w-[200px] truncate py-2.5 pr-2 text-stone-600" title={row.departureNames.join(", ")}>
                    {row.departureNames.join(", ") || "—"}
                  </td>
                )}
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
  );
}

export function JamaahList() {
  const [rows, setRows] = useState<JamaahRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<CompletenessStatus | "">("");

  // Group-First State
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"group" | "accordion" | "flat">("group");
  const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>({});

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

  // Group Mapping: Group Name -> JamaahRow[]
  const groupMap = useMemo(() => {
    const map = new Map<string, JamaahRow[]>();
    for (const r of rows) {
      const deps = r.departureNames.length > 0 ? r.departureNames : ["Belum Masuk Paket Keberangkatan"];
      for (const d of deps) {
        if (!map.has(d)) map.set(d, []);
        map.get(d)!.push(r);
      }
    }
    return map;
  }, [rows]);

  const groupNames = useMemo(() => {
    return Array.from(groupMap.keys()).sort((a, b) => {
      // Keep "Belum Masuk Paket" at the end
      if (a.includes("Belum")) return 1;
      if (b.includes("Belum")) return -1;
      return a.localeCompare(b);
    });
  }, [groupMap]);

  // Scoped Jamaah Rows based on selection or view
  const currentScopedRows = useMemo(() => {
    if (selectedGroup) {
      return groupMap.get(selectedGroup) ?? [];
    }
    return rows;
  }, [selectedGroup, groupMap, rows]);

  // Global and Scoped Status Counts
  const counts = useMemo(
    () =>
      Object.fromEntries(
        COMPLETENESS_STATUSES.map((s) => [
          s,
          currentScopedRows.filter((r) => r.completeness.status === s).length,
        ]),
      ),
    [currentScopedRows],
  );

  // Filtered Jamaah Rows
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return currentScopedRows.filter((r) => {
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
  }, [currentScopedRows, query, statusFilter]);

  const toggleAccordion = (name: string) => {
    setOpenAccordions((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const expandAllAccordions = () => {
    const all: Record<string, boolean> = {};
    for (const name of groupNames) all[name] = true;
    setOpenAccordions(all);
  };

  const collapseAllAccordions = () => {
    setOpenAccordions({});
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-stone-200/70 bg-white p-10 text-center shadow-2xs">
        <p className="text-xs font-medium text-stone-500">Memuat database jamaah…</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 font-sans">
      {/* ── Top Group Quick Selector & View Switcher ── */}
      <section className="flex flex-col gap-2.5 rounded-2xl border border-stone-200/70 bg-white p-3.5 shadow-2xs sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 mr-1 flex items-center gap-1">
            <Layers className="h-3.5 w-3.5 text-brand-pink" />
            Grup:
          </span>

          <button
            type="button"
            onClick={() => {
              setSelectedGroup(null);
              if (viewMode === "flat") setViewMode("group");
            }}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
              selectedGroup === null && viewMode === "group"
                ? "bg-brand-pink text-white shadow-2xs"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200"
            }`}
          >
            📁 Semua Grup ({groupNames.length})
          </button>

          {groupNames.map((name) => {
            const isSelected = selectedGroup === name;
            const count = groupMap.get(name)?.length ?? 0;
            return (
              <button
                key={name}
                type="button"
                onClick={() => {
                  setSelectedGroup(name);
                  setViewMode("group");
                }}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition whitespace-nowrap ${
                  isSelected
                    ? "bg-brand-pink text-white shadow-2xs"
                    : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                }`}
              >
                <span>🕋 {name}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                    isSelected ? "bg-white/25 text-white" : "bg-stone-200 text-stone-700"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 border-t border-stone-100 pt-2 sm:border-t-0 sm:pt-0">
          <button
            type="button"
            onClick={() => {
              setViewMode("group");
              setSelectedGroup(null);
            }}
            title="Tampilan Folder Grup (Group First)"
            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
              viewMode === "group" && selectedGroup === null
                ? "bg-stone-800 text-white"
                : "text-stone-500 hover:bg-stone-100"
            }`}
          >
            <LayoutGrid className="h-3 w-3" />
            <span>Kartu Grup</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setViewMode("accordion");
              setSelectedGroup(null);
            }}
            title="Tampilan Akordion Semua Grup"
            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
              viewMode === "accordion"
                ? "bg-stone-800 text-white"
                : "text-stone-500 hover:bg-stone-100"
            }`}
          >
            <Layers className="h-3 w-3" />
            <span>Akordion</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setViewMode("flat");
              setSelectedGroup(null);
            }}
            title="Tampilan Tabel Lengkap Semua Jamaah"
            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
              viewMode === "flat"
                ? "bg-stone-800 text-white"
                : "text-stone-500 hover:bg-stone-100"
            }`}
          >
            <List className="h-3 w-3" />
            <span>Semua Data</span>
          </button>
        </div>
      </section>

      {/* ── Status Counts Bar ── */}
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
                active
                  ? "border-brand-pink ring-2 ring-brand-pink/20"
                  : "border-stone-200/70 hover:border-stone-300"
              }`}
            >
              <p className="text-[10px] font-bold uppercase tracking-wide text-stone-400">{status}</p>
              <p className="mt-1 text-sm font-black leading-tight text-brand-cocoa">
                {counts[status] ?? 0} Jamaah
              </p>
            </button>
          );
        })}
      </section>

      {/* ── Level 1: Default Group-First Directory (Cards View) ── */}
      {viewMode === "group" && selectedGroup === null && (
        <section className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-sm font-black text-brand-cocoa flex items-center gap-2">
                <FolderOpen className="h-4 w-4 text-brand-pink" />
                <span>Pilih Grup Keberangkatan</span>
              </h3>
              <p className="text-[11px] text-stone-500">
                Pilih grup di bawah ini untuk membuka dan mengelola data jamaah dalam rombongan tersebut.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-stone-400" strokeWidth={1.5} />
                <input
                  type="text"
                  placeholder="Cari nama / paspor / grup…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="h-9 w-56 rounded-xl border border-stone-200 bg-stone-50/50 pl-8 pr-3 text-xs font-medium text-brand-cocoa outline-none transition placeholder:text-stone-400 focus:border-brand-pink focus:bg-white"
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
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {groupNames.map((gName) => {
              const members = groupMap.get(gName) ?? [];
              const q = query.trim().toLowerCase();
              const matchingMembers = q
                ? members.filter(
                    (m) =>
                      m.fullName.toLowerCase().includes(q) ||
                      m.passportNumber.toLowerCase().includes(q) ||
                      m.phone.includes(q),
                  )
                : members;

              const readyCount = members.filter((m) => m.completeness.status === "Siap Masuk Manifest").length;
              const pendingCount = members.length - readyCount;

              return (
                <div
                  key={gName}
                  onClick={() => setSelectedGroup(gName)}
                  className="group relative flex flex-col justify-between rounded-2xl border border-stone-200/80 bg-white p-5 shadow-2xs transition hover:-translate-y-0.5 hover:border-brand-pink hover:shadow-md cursor-pointer"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-pink-50 text-pink-700 font-bold group-hover:bg-brand-pink group-hover:text-white transition">
                        <Users className="h-5 w-5" />
                      </div>
                      <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-black text-stone-800">
                        {members.length} Jamaah
                      </span>
                    </div>

                    <div>
                      <h4 className="font-extrabold text-sm text-brand-cocoa group-hover:text-brand-pink transition line-clamp-2">
                        {gName}
                      </h4>
                      <p className="mt-1 text-[11px] text-stone-500">
                        {readyCount} Siap Manifest · {pendingCount} Perlu Kelengkapan
                      </p>
                    </div>

                    {/* Member names preview */}
                    <div className="space-y-1 pt-1 border-t border-stone-100">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Daftar Anggota:</p>
                      <div className="flex flex-wrap gap-1">
                        {members.slice(0, 3).map((m) => (
                          <span
                            key={m.id}
                            className="inline-block rounded-md bg-stone-50 px-2 py-0.5 text-[11px] font-medium text-stone-700 border border-stone-100"
                          >
                            {m.fullName.split(" ").slice(0, 2).join(" ")}
                          </span>
                        ))}
                        {members.length > 3 && (
                          <span className="inline-block rounded-md bg-stone-100 px-1.5 py-0.5 text-[10px] font-bold text-stone-500">
                            +{members.length - 3} lainnya
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Query matching indicator */}
                    {q && matchingMembers.length > 0 && (
                      <p className="rounded-lg bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700">
                        ✓ {matchingMembers.length} jamaah cocok dengan pencarian &quot;{q}&quot;
                      </p>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-brand-pink group-hover:text-brand-pinkHover">
                    <span>Buka Data Jamaah</span>
                    <ChevronRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Level 2: Detail Data Jamaah di dalam Grup Terpilih ── */}
      {viewMode === "group" && selectedGroup !== null && (
        <section className="space-y-4 rounded-2xl border border-stone-200/70 bg-white p-4 shadow-2xs sm:p-5">
          {/* Header Grup Terpilih */}
          <header className="flex flex-col gap-3 border-b border-stone-100 pb-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => setSelectedGroup(null)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-pink hover:text-brand-pinkHover transition"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Kembali ke Semua Grup</span>
              </button>

              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-brand-cocoa flex items-center gap-2">
                  <span>🕋 {selectedGroup}</span>
                </h2>
                <span className="rounded-full bg-pink-100 px-2.5 py-0.5 text-xs font-bold text-pink-800">
                  {currentScopedRows.length} Jamaah
                </span>
              </div>
              <p className="text-[11px] text-stone-500">
                Menampilkan data seluruh jamaah yang terdaftar dalam rombongan keberangkatan ini.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Quick switch to another group */}
              <select
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                className="h-9 rounded-xl border border-stone-200 bg-stone-50 px-3 text-xs font-bold text-stone-800 outline-none focus:border-brand-pink"
              >
                {groupNames.map((g) => (
                  <option key={g} value={g}>
                    Pindah ke: {g} ({groupMap.get(g)?.length ?? 0})
                  </option>
                ))}
              </select>

              <div className="relative min-w-0 flex-1 sm:flex-none">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-stone-400" strokeWidth={1.5} />
                <input
                  type="text"
                  placeholder="Cari dalam grup ini…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="h-9 w-full rounded-xl border border-stone-200 bg-stone-50/50 pl-8 pr-3 text-xs font-medium text-brand-cocoa outline-none transition placeholder:text-stone-400 focus:border-brand-pink focus:bg-white sm:w-56"
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
            <p className="rounded-xl border border-rose-200 bg-rose-50/60 px-3 py-2 text-[11px] font-semibold text-rose-700">
              {loadError}
            </p>
          ) : null}

          {/* Table without redundant group column since group is in header */}
          <JamaahTable items={filtered} showGroupColumn={false} />
        </section>
      )}

      {/* ── Mode Akordion: Semua Grup Ditampilkan Bertingkat ── */}
      {viewMode === "accordion" && (
        <section className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-sm font-black text-brand-cocoa flex items-center gap-2">
                <Layers className="h-4 w-4 text-brand-pink" />
                <span>Tampilan Akordion Grup Jamaah</span>
              </h3>
              <p className="text-[11px] text-stone-500">
                Setiap grup dapat dibuka atau ditutup secara mandiri.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={expandAllAccordions}
                className="rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-xs font-bold text-stone-700 hover:bg-stone-50 transition"
              >
                Buka Semua
              </button>
              <button
                type="button"
                onClick={collapseAllAccordions}
                className="rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-xs font-bold text-stone-700 hover:bg-stone-50 transition"
              >
                Tutup Semua
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {groupNames.map((gName) => {
              const members = groupMap.get(gName) ?? [];
              const isOpen = openAccordions[gName] ?? true; // open by default in accordion mode
              const q = query.trim().toLowerCase();
              const filteredMembers = members.filter((m) => {
                if (statusFilter && m.completeness.status !== statusFilter) return false;
                if (!q) return true;
                return (
                  m.fullName.toLowerCase().includes(q) ||
                  m.passportNumber.toLowerCase().includes(q) ||
                  m.phone.includes(q)
                );
              });

              return (
                <div
                  key={gName}
                  className="overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-2xs transition"
                >
                  <button
                    type="button"
                    onClick={() => toggleAccordion(gName)}
                    className="flex w-full items-center justify-between bg-stone-50/80 px-4 py-3.5 text-left transition hover:bg-stone-100"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-base">🕋</span>
                      <div className="min-w-0">
                        <h4 className="font-bold text-xs text-brand-cocoa truncate">{gName}</h4>
                        <p className="text-[10px] text-stone-500">
                          {members.length} Jamaah terdaftar
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="rounded-full bg-brand-pink/10 px-2 py-0.5 text-[11px] font-bold text-brand-pink">
                        {filteredMembers.length} ditampilkan
                      </span>
                      {isOpen ? (
                        <ChevronUp className="h-4 w-4 text-stone-400" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-stone-400" />
                      )}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="p-4 border-t border-stone-100">
                      <JamaahTable items={filteredMembers} showGroupColumn={false} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Mode Datar: Semua Jamaah dalam Satu Tabel (Sesuai Versi Lama) ── */}
      {viewMode === "flat" && (
        <section className="space-y-3 rounded-2xl border border-stone-200/70 bg-white p-4 shadow-2xs sm:p-5">
          <header className="flex flex-col gap-3 border-b border-stone-100 pb-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-sm font-extrabold text-brand-cocoa">
                <Contact className="h-4 w-4 text-brand-pink" strokeWidth={1.5} />
                <span>Seluruh Profil Master Jamaah ({filtered.length})</span>
              </h2>
              <p className="mt-0.5 text-[11px] text-stone-500">
                Menampilkan seluruh jamaah dari semua grup dalam satu tabel tunggal.
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

          <JamaahTable items={filtered} showGroupColumn={true} />
        </section>
      )}
    </div>
  );
}
