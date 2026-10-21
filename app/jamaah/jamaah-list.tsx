"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Armchair,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Compass,
  Contact,
  Edit3,
  FileCheck,
  Folder,
  FolderOpen,
  Hotel,
  Layers,
  LayoutGrid,
  List,
  MessageSquare,
  Plane,
  Plus,
  Search,
  Ticket,
  UserCheck,
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

function formatDateRange(dep?: string | null, ret?: string | null, duration?: string | null) {
  if (!dep) return "Jadwal Belum Ditentukan";
  const d1 = new Date(dep);
  const d1Str = !isNaN(d1.getTime())
    ? d1.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })
    : dep;
  if (!ret) return `${d1Str} (${duration || "12 Hari"})`;
  const d2 = new Date(ret);
  const d2Str = !isNaN(d2.getTime())
    ? d2.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })
    : ret;
  return `${d1Str} – ${d2Str} (${duration || "12 Hari"})`;
}

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
  processStatusMap = {},
  onProcessStatusChange,
}: {
  items: JamaahRow[];
  showGroupColumn?: boolean;
  processStatusMap?: Record<string, string>;
  onProcessStatusChange?: (id: string, status: string) => void;
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
            {(() => {
              const currentStatus =
                processStatusMap[row.id] ||
                (row.completeness?.status === "Siap Masuk Manifest" || row.documentCount >= 7
                  ? "Dokumen lengkap"
                  : row.passportNumber && row.passportNumber.trim().length >= 5
                  ? "Jamaah sudah memiliki paspor"
                  : "Melengkapi dokumen");
              return (
                <div className="flex items-center justify-between pt-1.5 border-t border-stone-100">
                  <span className="text-[10px] text-stone-400 font-semibold">Proses Dokumen:</span>
                  <select
                    value={currentStatus}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => onProcessStatusChange?.(row.id, e.target.value)}
                    className={`rounded-md border px-2 py-0.5 text-[10px] font-bold outline-none ${
                      currentStatus === "Dokumen lengkap"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                        : currentStatus === "Jamaah sudah memiliki paspor"
                        ? "border-blue-200 bg-blue-50 text-blue-800"
                        : currentStatus === "Proses pembuatan paspor"
                        ? "border-purple-200 bg-purple-50 text-purple-800"
                        : "border-amber-200 bg-amber-50 text-amber-800"
                    }`}
                  >
                    <option value="Melengkapi dokumen">⏳ Melengkapi dokumen</option>
                    <option value="Proses pembuatan paspor">🛂 Proses pembuatan paspor</option>
                    <option value="Jamaah sudah memiliki paspor">📘 Jamaah sudah memiliki paspor</option>
                    <option value="Dokumen lengkap">✅ Dokumen lengkap</option>
                  </select>
                </div>
              );
            })()}
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
              <th className="py-2.5 pr-2">Proses Kelengkapan Dokumen & Paspor</th>
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
                <td className="py-2.5 pr-2">
                  {(() => {
                    const currentStatus =
                      processStatusMap[row.id] ||
                      (row.completeness?.status === "Siap Masuk Manifest" || row.documentCount >= 7
                        ? "Dokumen lengkap"
                        : row.passportNumber && row.passportNumber.trim().length >= 5
                        ? "Jamaah sudah memiliki paspor"
                        : "Melengkapi dokumen");
                    return (
                      <select
                        value={currentStatus}
                        onChange={(e) => onProcessStatusChange?.(row.id, e.target.value)}
                        className={`rounded-lg border px-2.5 py-1 text-[11px] font-bold outline-none transition cursor-pointer shadow-2xs ${
                          currentStatus === "Dokumen lengkap"
                            ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                            : currentStatus === "Jamaah sudah memiliki paspor"
                            ? "border-blue-200 bg-blue-50 text-blue-800"
                            : currentStatus === "Proses pembuatan paspor"
                            ? "border-purple-200 bg-purple-50 text-purple-800"
                            : "border-amber-200 bg-amber-50 text-amber-800"
                        }`}
                      >
                        <option value="Melengkapi dokumen">⏳ Melengkapi dokumen</option>
                        <option value="Proses pembuatan paspor">🛂 Proses pembuatan paspor</option>
                        <option value="Jamaah sudah memiliki paspor">📘 Jamaah sudah memiliki paspor</option>
                        <option value="Dokumen lengkap">✅ Dokumen lengkap</option>
                      </select>
                    );
                  })()}
                </td>
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

  useEffect(() => {
    if (typeof window !== "undefined") {
      const p = new URLSearchParams(window.location.search);
      const g = p.get("grup");
      if (g) {
        setSelectedGroup(decodeURIComponent(g));
        setViewMode("group");
      }
    }
  }, []);

  const handleSelectGroup = (name: string | null) => {
    setSelectedGroup(name);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (name) {
        url.searchParams.set("grup", name);
      } else {
        url.searchParams.delete("grup");
      }
      window.history.pushState({}, "", url.toString());
    }
  };

  const [packages, setPackages] = useState<any[]>([]);

  const load = useCallback(async () => {
    try {
      const [resJamaah, resPackages] = await Promise.all([
        fetch("/api/jamaah", { cache: "no-store" }),
        fetch("/api/packages", { cache: "no-store" }),
      ]);
      const jsonJamaah = await resJamaah.json();
      const jsonPackages = await resPackages.json();
      if (!resJamaah.ok) {
        setLoadError(jsonJamaah?.error || "Gagal memuat database jamaah");
        return;
      }
      setRows(jsonJamaah.data ?? []);
      if (resPackages.ok && Array.isArray(jsonPackages.data)) {
        setPackages(jsonPackages.data);
      }
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

  // Dokumen & Paspor Process Status Map per Jamaah
  const [docProcessStatusMap, setDocProcessStatusMap] = useState<Record<string, string>>({});

  useEffect(() => {
    try {
      const saved = localStorage.getItem("elmassa_doc_process_status");
      if (saved) setDocProcessStatusMap(JSON.parse(saved));
    } catch {}
  }, []);

  const handleDocProcessChange = (jamaahId: string, status: string) => {
    setDocProcessStatusMap((prev) => {
      const updated = { ...prev, [jamaahId]: status };
      try {
        localStorage.setItem("elmassa_doc_process_status", JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Tour Leader & Muthawwif State per Group
  const [leadersUpdateKey, setLeadersUpdateKey] = useState(0);
  const [isEditLeadersOpen, setIsEditLeadersOpen] = useState(false);
  const [leaderForm, setLeaderForm] = useState({
    tlName: "",
    tlPhone: "",
    muthawwifName: "",
    muthawwifPhone: "",
  });

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

  // Active Package Info for selected group
  const activePackage = useMemo(() => {
    if (!selectedGroup) return null;
    const s = selectedGroup.toLowerCase().trim();
    return (
      packages.find((p) => {
        const pName = String(p.name || "").toLowerCase().trim();
        return pName === s || s.includes(pName) || pName.includes(s);
      }) ?? null
    );
  }, [selectedGroup, packages]);

  // Tour Leader & Muthawwif Info for selected group
  const currentLeaders = useMemo(() => {
    if (!selectedGroup) return { tlName: "Ahmad Hidayat", tlPhone: "0812-7199-1002", muthawwifName: "Ust. Abdullah Mansur", muthawwifPhone: "0812-7199-1001" };
    try {
      const saved = typeof window !== "undefined" ? localStorage.getItem(`elmassa_group_leaders_${selectedGroup}`) : null;
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      tlName: activePackage?.tourLeaderName || "Ahmad Hidayat",
      tlPhone: activePackage?.tourLeaderWhatsapp || "0812-7199-1002",
      muthawwifName: activePackage?.guideName || "Ust. Abdullah Mansur",
      muthawwifPhone: activePackage?.guideWhatsapp || "0812-7199-1001",
    };
  }, [selectedGroup, activePackage, leadersUpdateKey]);

  // Capacity / Seat calculations (Lingkaran Merah)
  const totalSeat = useMemo(() => {
    if (activePackage) {
      return Number(activePackage.targetPax) || 45;
    }
    if (selectedGroup) {
      return 45;
    }
    if (packages.length > 0) {
      return packages.reduce((sum, p) => sum + (Number(p.targetPax) || 45), 0);
    }
    return Math.max(rows.length, 45);
  }, [activePackage, selectedGroup, packages, rows]);

  const jamaahTerdaftar = currentScopedRows.length;
  const sisaSeat = Math.max(0, totalSeat - jamaahTerdaftar);
  const percentFilled = totalSeat > 0 ? Math.round((jamaahTerdaftar / totalSeat) * 100) : 0;
  const siapManifestCount = currentScopedRows.filter((r) => r.completeness.status === "Siap Masuk Manifest").length;
  const belumLengkapCount = currentScopedRows.filter(
    (r) => r.completeness.status === "Data Belum Lengkap" || r.completeness.status === "Dokumen Belum Lengkap"
  ).length;

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

  const openEditLeaders = () => {
    setLeaderForm({
      tlName: currentLeaders.tlName,
      tlPhone: currentLeaders.tlPhone,
      muthawwifName: currentLeaders.muthawwifName,
      muthawwifPhone: currentLeaders.muthawwifPhone,
    });
    setIsEditLeadersOpen(true);
  };

  const handleSaveLeaders = () => {
    if (!selectedGroup) return;
    try {
      localStorage.setItem(`elmassa_group_leaders_${selectedGroup}`, JSON.stringify(leaderForm));
      setLeadersUpdateKey((k) => k + 1);
    } catch {}
    setIsEditLeadersOpen(false);
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
      <section className="flex flex-col gap-2.5 rounded-2xl border border-stone-200/70 bg-white p-3.5 shadow-2xs">
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 mr-1 flex items-center gap-1">
              <Layers className="h-3.5 w-3.5 text-brand-pink" />
              Grup:
            </span>

            <button
              type="button"
              onClick={() => {
                handleSelectGroup(null);
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
                    handleSelectGroup(name);
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
          <div className="flex items-center gap-1 border-t border-stone-100 pt-2 sm:border-t-0 sm:pt-0 shrink-0">
            <button
              type="button"
              onClick={() => {
                setViewMode("group");
                handleSelectGroup(null);
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
                handleSelectGroup(null);
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
                handleSelectGroup(null);
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
        </div>

        {/* ── Informasi Dasar Grup & Jadwal Keberangkatan (Lingkaran Hijau) ── */}
        <div className="mt-1 rounded-xl border border-stone-200/80 bg-gradient-to-r from-stone-50 via-rose-50/25 to-stone-50 p-3.5">
          <div className="mb-2.5 flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-brand-cocoa flex items-center gap-1.5">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Informasi Dasar Grup & Jadwal Keberangkatan
              {activePackage?.name ? (
                <span className="text-brand-pink font-black truncate max-w-xs sm:max-w-md">
                  · {activePackage.name}
                </span>
              ) : (
                <span className="text-stone-400 font-bold">· Seluruh Rombongan Aktif</span>
              )}
            </span>

            {activePackage?.id ? (
              <Link
                href={`/paket/${activePackage.id}`}
                className="text-[11px] font-bold text-brand-pink hover:text-brand-pinkHover hover:underline shrink-0"
              >
                Rincian Paket & Itinerary ↗
              </Link>
            ) : null}
          </div>

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
            {/* 1. Jadwal Keberangkatan */}
            <div className="flex items-start gap-2.5 rounded-lg border border-stone-200/60 bg-white p-2.5 shadow-2xs">
              <div className="rounded-lg bg-pink-100 p-2 text-pink-700 shrink-0">
                <CalendarDays className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Jadwal Keberangkatan</p>
                <p className="text-xs font-black text-brand-cocoa leading-tight truncate">
                  {activePackage
                    ? formatDateRange(activePackage.departureDate, activePackage.returnDate, activePackage.duration)
                    : "Jadwal 3 Grup Aktif (Okt – Nov 2026)"}
                </p>
                <p className="text-[10px] text-stone-500 truncate mt-0.5">
                  {activePackage?.duration || "12 Hari"} · {activePackage?.startPoint || "Start PGK / CGK"}
                </p>
              </div>
            </div>

            {/* 2. Tiket Domestik */}
            <div className="flex items-start gap-2.5 rounded-lg border border-stone-200/60 bg-white p-2.5 shadow-2xs">
              <div className="rounded-lg bg-blue-100 p-2 text-blue-700 shrink-0">
                <Plane className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Tiket Domestik</p>
                <p className="text-xs font-black text-brand-cocoa leading-tight truncate" title={activePackage?.domesticAirline || "Garuda Indonesia (Feeder PGK ⇄ CGK)"}>
                  {activePackage?.domesticAirline || "Garuda Indonesia (Feeder PGK ⇄ CGK)"}
                </p>
                <p className="text-[10px] text-stone-500 truncate mt-0.5">
                  {activePackage?.flightRoute ? activePackage.flightRoute.split("➔")[0]?.trim() + " ➔ CGK (PP)" : "Feeder Domestik PP"}
                </p>
              </div>
            </div>

            {/* 3. Tiket Internasional */}
            <div className="flex items-start gap-2.5 rounded-lg border border-stone-200/60 bg-white p-2.5 shadow-2xs">
              <div className="rounded-lg bg-emerald-100 p-2 text-emerald-700 shrink-0">
                <Compass className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Tiket Internasional</p>
                <p className="text-xs font-black text-brand-cocoa leading-tight truncate" title={activePackage?.internationalAirline || activePackage?.airline || "Saudia Airlines (SV-815)"}>
                  {activePackage?.internationalAirline || activePackage?.airline || "Saudia Airlines (SV-815)"}
                </p>
                <p className="text-[10px] text-stone-500 truncate mt-0.5">
                  {activePackage?.flightRoute || "CGK ➔ JED / MED (Direct)"}
                </p>
              </div>
            </div>

            {/* 4. Roomlist & Hotel */}
            <div className="flex items-start gap-2.5 rounded-lg border border-stone-200/60 bg-white p-2.5 shadow-2xs">
              <div className="rounded-lg bg-amber-100 p-2 text-amber-700 shrink-0">
                <Hotel className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Roomlist & Hotel</p>
                  <Link
                    href={activePackage?.id ? `/paket/${activePackage.id}` : "/manifest"}
                    className="text-[9px] font-bold text-pink-600 hover:underline"
                  >
                    Roomlist ↗
                  </Link>
                </div>
                <p className="text-xs font-black text-brand-cocoa leading-tight truncate" title={activePackage?.makkahHotel ? `Makkah: ${activePackage.makkahHotel}` : "Grand Al Massa"}>
                  🕋 {activePackage?.makkahHotel || "Grand Al Massa"}
                </p>
                <p className="text-[10px] text-stone-500 truncate mt-0.5" title={activePackage?.madinahHotel ? `Madinah: ${activePackage.madinahHotel}` : "Daar El Naeem"}>
                  🕌 {activePackage?.madinahHotel || "Daar El Naeem"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Status Counts Bar (Lingkaran Merah: Seat & Kapasitas) ── */}
      <section className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        {/* Card 1: Total Seat Keseluruhan */}
        <div className="rounded-2xl border border-stone-200/70 bg-white p-3.5 shadow-2xs transition hover:border-pink-300">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-wide text-stone-400">Total Seat Keseluruhan</p>
            <div className="rounded-lg bg-pink-50 p-1 text-pink-600">
              <Armchair className="h-3.5 w-3.5" />
            </div>
          </div>
          <p className="mt-1 text-base font-black leading-tight text-brand-cocoa">
            {totalSeat} <span className="text-xs font-semibold text-stone-500">Seat</span>
          </p>
          <p className="mt-1 text-[10px] font-medium text-stone-400">
            Kapasitas kuota {selectedGroup ? "grup ini" : "seluruh grup"}
          </p>
        </div>

        {/* Card 2: Jamaah Terdaftar */}
        <div className="rounded-2xl border border-stone-200/70 bg-white p-3.5 shadow-2xs transition hover:border-blue-300">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-wide text-stone-400">Jamaah Terdaftar</p>
            <div className="rounded-lg bg-blue-50 p-1 text-blue-600">
              <UserCheck className="h-3.5 w-3.5" />
            </div>
          </div>
          <p className="mt-1 text-base font-black leading-tight text-blue-900">
            {jamaahTerdaftar} <span className="text-xs font-semibold text-stone-500">Jamaah</span>
          </p>
          <div className="mt-1 flex items-center gap-1.5">
            <span className="rounded-full bg-blue-100 px-1.5 py-0.2 text-[9px] font-black text-blue-700">
              {percentFilled}% Terisi
            </span>
            <span className="text-[10px] text-stone-400">masuk database</span>
          </div>
        </div>

        {/* Card 3: Sisa Seat Tersedia */}
        <div className="rounded-2xl border border-stone-200/70 bg-white p-3.5 shadow-2xs transition hover:border-emerald-300">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-wide text-stone-400">Sisa Seat Tersedia</p>
            <div className="rounded-lg bg-emerald-50 p-1 text-emerald-600">
              <Ticket className="h-3.5 w-3.5" />
            </div>
          </div>
          <p className="mt-1 text-base font-black leading-tight text-emerald-800">
            {sisaSeat} <span className="text-xs font-semibold text-stone-500">Seat</span>
          </p>
          <div className="mt-1 flex items-center gap-1.5">
            <span
              className={`rounded-full px-1.5 py-0.2 text-[9px] font-black ${
                sisaSeat > 0 ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
              }`}
            >
              {sisaSeat > 0 ? "Open Booking" : "Seat Penuh"}
            </span>
            <span className="text-[10px] text-stone-400">tersedia dipesan</span>
          </div>
        </div>

        {/* Card 4: Kesiapan Dokumen & Manifest */}
        <div className="rounded-2xl border border-stone-200/70 bg-white p-3.5 shadow-2xs transition hover:border-amber-300">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-wide text-stone-400">Siap Masuk Manifest</p>
            <div className="rounded-lg bg-amber-50 p-1 text-amber-600">
              <FileCheck className="h-3.5 w-3.5" />
            </div>
          </div>
          <p className="mt-1 text-base font-black leading-tight text-brand-cocoa">
            {siapManifestCount} <span className="text-xs font-semibold text-stone-500">/ {jamaahTerdaftar} Jamaah</span>
          </p>
          <div className="mt-1 flex items-center gap-1.5">
            <span className="rounded-full bg-amber-100 px-1.5 py-0.2 text-[9px] font-black text-amber-800">
              {belumLengkapCount} Belum Lengkap
            </span>
            <Link href="/manifest" className="text-[10px] font-bold text-pink-600 hover:underline">
              Cek Manifest ↗
            </Link>
          </div>
        </div>
      </section>

      {/* ── Status Dokumen Filter Bar ── */}
      <div className="flex flex-wrap items-center gap-1.5 px-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mr-1">
          Filter Dokumen:
        </span>
        <button
          type="button"
          onClick={() => setStatusFilter("")}
          className={`rounded-full px-2.5 py-1 text-[10px] font-bold transition ${
            !statusFilter ? "bg-stone-800 text-white" : "bg-stone-100 text-stone-600 hover:bg-stone-200"
          }`}
        >
          Semua ({currentScopedRows.length})
        </button>
        {COMPLETENESS_STATUSES.map((status) => {
          const active = statusFilter === status;
          const count = counts[status] ?? 0;
          return (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(active ? "" : status)}
              className={`rounded-full px-2.5 py-1 text-[10px] font-bold transition ${
                active ? "bg-brand-pink text-white shadow-2xs" : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              {status} ({count})
            </button>
          );
        })}
      </div>

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
                  onClick={() => handleSelectGroup(gName)}
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
                onClick={() => handleSelectGroup(null)}
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

              {/* Petugas Pendamping Rombongan: Tour Leader & Muthawwif */}
              <div className="mt-2.5 flex flex-wrap items-center gap-2 pt-2 border-t border-stone-100">
                {/* Tour Leader Badge */}
                <div className="flex items-center gap-2 rounded-xl border border-stone-200/80 bg-stone-50/90 px-3 py-1.5 shadow-2xs">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-pink-100 text-pink-700 font-bold shrink-0">
                    <UserCheck className="h-3.5 w-3.5" />
                  </div>
                  <div className="text-left min-w-0">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-stone-400 leading-tight">Tour Leader</p>
                    <p className="text-xs font-black text-brand-cocoa leading-tight truncate">
                      {currentLeaders.tlName}
                    </p>
                    <a
                      href={`https://wa.me/${currentLeaders.tlPhone.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] font-bold text-emerald-600 hover:underline flex items-center gap-1 mt-0.5"
                    >
                      <MessageSquare className="h-2.5 w-2.5" />
                      <span>{currentLeaders.tlPhone}</span>
                    </a>
                  </div>
                </div>

                {/* Muthawwif Badge */}
                <div className="flex items-center gap-2 rounded-xl border border-stone-200/80 bg-stone-50/90 px-3 py-1.5 shadow-2xs">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 font-bold shrink-0">
                    <Users className="h-3.5 w-3.5" />
                  </div>
                  <div className="text-left min-w-0">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-stone-400 leading-tight">Muthawwif</p>
                    <p className="text-xs font-black text-brand-cocoa leading-tight truncate">
                      {currentLeaders.muthawwifName}
                    </p>
                    <a
                      href={`https://wa.me/${currentLeaders.muthawwifPhone.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] font-bold text-emerald-600 hover:underline flex items-center gap-1 mt-0.5"
                    >
                      <MessageSquare className="h-2.5 w-2.5" />
                      <span>{currentLeaders.muthawwifPhone}</span>
                    </a>
                  </div>
                </div>

                {/* Tombol Ubah Petugas */}
                <button
                  type="button"
                  onClick={openEditLeaders}
                  className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-2.5 text-[10px] font-bold text-stone-600 hover:bg-stone-50 hover:text-brand-pink transition shrink-0 cursor-pointer"
                  title="Atur Nama & Kontak Tour Leader dan Muthawwif"
                >
                  <Edit3 className="h-3 w-3" />
                  <span>Ubah Petugas</span>
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Quick switch to another group */}
              <select
                value={selectedGroup}
                onChange={(e) => handleSelectGroup(e.target.value)}
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
          <JamaahTable items={filtered} showGroupColumn={false} processStatusMap={docProcessStatusMap} onProcessStatusChange={handleDocProcessChange} />
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

          <JamaahTable items={filtered} showGroupColumn={true} processStatusMap={docProcessStatusMap} onProcessStatusChange={handleDocProcessChange} />
        </section>
      )}
      {/* Modal Edit Petugas Tour Leader & Muthawwif */}
      {isEditLeadersOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="text-sm font-black text-brand-cocoa flex items-center gap-2">
                <span>🕋 Atur Petugas Rombongan</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsEditLeadersOpen(false)}
                className="h-8 w-8 rounded-lg text-stone-400 hover:bg-stone-100 hover:text-stone-700 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-stone-500">
              Atur nama dan nomor kontak resmi Tour Leader serta Muthawwif untuk grup{" "}
              <strong className="text-stone-800">{selectedGroup}</strong>.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                  Nama Tour Leader
                </label>
                <input
                  type="text"
                  value={leaderForm.tlName}
                  onChange={(e) => setLeaderForm({ ...leaderForm, tlName: e.target.value })}
                  placeholder="Contoh: Ahmad Hidayat"
                  className="w-full h-9 rounded-xl border border-stone-200 px-3 font-semibold text-stone-800 outline-none focus:border-brand-pink"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                  No. WhatsApp Tour Leader
                </label>
                <input
                  type="text"
                  value={leaderForm.tlPhone}
                  onChange={(e) => setLeaderForm({ ...leaderForm, tlPhone: e.target.value })}
                  placeholder="Contoh: 0812-7199-1002"
                  className="w-full h-9 rounded-xl border border-stone-200 px-3 font-semibold text-stone-800 outline-none focus:border-brand-pink"
                />
              </div>

              <div className="border-t border-stone-100 pt-2">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                  Nama Muthawwif
                </label>
                <input
                  type="text"
                  value={leaderForm.muthawwifName}
                  onChange={(e) => setLeaderForm({ ...leaderForm, muthawwifName: e.target.value })}
                  placeholder="Contoh: Ust. Abdullah Mansur"
                  className="w-full h-9 rounded-xl border border-stone-200 px-3 font-semibold text-stone-800 outline-none focus:border-brand-pink"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                  No. WhatsApp Muthawwif
                </label>
                <input
                  type="text"
                  value={leaderForm.muthawwifPhone}
                  onChange={(e) => setLeaderForm({ ...leaderForm, muthawwifPhone: e.target.value })}
                  placeholder="Contoh: 0812-7199-1001"
                  className="w-full h-9 rounded-xl border border-stone-200 px-3 font-semibold text-stone-800 outline-none focus:border-brand-pink"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setIsEditLeadersOpen(false)}
                className="h-9 px-4 rounded-xl border border-stone-200 text-xs font-bold text-stone-600 hover:bg-stone-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveLeaders}
                className="h-9 px-5 rounded-xl bg-brand-pink text-xs font-bold text-white hover:bg-brand-pinkHover shadow-2xs"
              >
                Simpan Petugas
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
