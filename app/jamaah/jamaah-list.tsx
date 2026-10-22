"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertCircle,
  Armchair,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  CircleDollarSign,
  Compass,
  Contact,
  CreditCard,
  Edit3,
  ExternalLink,
  FileCheck,
  FileText,
  Folder,
  FolderOpen,
  Hotel,
  Layers,
  LayoutGrid,
  List,
  MessageSquare,
  Plane,
  Plus,
  Receipt,
  Search,
  Ticket,
  UserCheck,
  Users,
  Wallet,
} from "lucide-react";
import {
  COMPLETENESS_STATUSES,
  STATUS_STYLES,
  type Completeness,
  type CompletenessStatus,
} from "@/lib/jamaah/rules";
import type { PaymentSummaryResponse, JamaahPaymentStatus, PaymentSummaryStats } from "@/lib/payments/summary";
import {
  ModalDetailTiket,
  ModalDetailRoomlist,
  ModalUploadDokumen,
  DEFAULT_DOMESTIC_04NOV,
  DEFAULT_INTERNATIONAL_04NOV,
  DEFAULT_ROOMLIST_04NOV,
  type TicketDocument,
  type RoomlistDocument,
} from "./group-documents-modal";
import { ModalDetailJamaahPembayaran } from "./payment-detail-modal";

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

function formatIDR(value: number) {
  return `Rp ${Math.round(Number(value) || 0).toLocaleString("id-ID")}`;
}

function PaymentBadge({ status }: { status?: string }) {
  const current = status || "Belum Bayar";
  if (current === "Lunas") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 text-[10px] font-extrabold text-emerald-800 shadow-2xs">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        Lunas 100%
      </span>
    );
  }
  if (current === "Sudah 50%") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 border border-indigo-200/80 px-2 py-0.5 text-[10px] font-extrabold text-indigo-800 shadow-2xs">
        <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
        Sudah 50%
      </span>
    );
  }
  if (current === "DP") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200/80 px-2 py-0.5 text-[10px] font-extrabold text-amber-800 shadow-2xs">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
        DP
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 border border-stone-200/80 px-2 py-0.5 text-[10px] font-medium text-stone-500">
      <span className="h-1.5 w-1.5 rounded-full bg-stone-400" />
      Belum Bayar
    </span>
  );
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
  paymentStatusMap = {},
  onProcessStatusChange,
}: {
  items: JamaahRow[];
  showGroupColumn?: boolean;
  processStatusMap?: Record<string, string>;
  paymentStatusMap?: Record<string, JamaahPaymentStatus>;
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
              <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                <PaymentBadge status={paymentStatusMap[row.id]?.status} />
                <StatusBadge status={row.completeness.status} />
              </div>
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
              <th className="py-2.5 pr-2">Pembayaran</th>
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
                <td className="py-2.5 pr-2 whitespace-nowrap">
                  <PaymentBadge status={paymentStatusMap[row.id]?.status} />
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
  const [processFilter, setProcessFilter] = useState<string>("");
  const [paymentFilter, setPaymentFilter] = useState<string>("");
  const [paymentDetailModal, setPaymentDetailModal] = useState<{
    isOpen: boolean;
    status: "Lunas" | "Sudah 50%" | "DP" | "Belum Bayar" | "Belum Lunas" | null;
  }>({ isOpen: false, status: null });

  // Group-First State
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"group" | "accordion" | "flat">("group");
  const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>({});

  const router = useRouter();
  const searchParams = useSearchParams();
  const grupParam = searchParams ? searchParams.get("grup") : null;

  const handleSelectGroup = (name: string | null) => {
    setSelectedGroup(name);
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (name) {
        params.set("grup", name);
      } else {
        params.delete("grup");
      }
      const qs = params.toString();
      router.push(qs ? `/jamaah?${qs}` : "/jamaah");
    }
  };

  const [packages, setPackages] = useState<any[]>([]);
  const [paymentSummaryData, setPaymentSummaryData] = useState<PaymentSummaryResponse | null>(null);

  const load = useCallback(async () => {
    try {
      const [resJamaah, resPackages, resPayments] = await Promise.all([
        fetch("/api/jamaah", { cache: "no-store" }),
        fetch("/api/packages", { cache: "no-store" }),
        fetch("/api/jamaah/payments-summary", { cache: "no-store" }).catch(() => null),
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
      if (resPayments && resPayments.ok) {
        const jsonPayments = await resPayments.json();
        setPaymentSummaryData(jsonPayments);
      }
      setLoadError("");
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Gagal memuat database jamaah");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
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

  // React to URL ?grup= parameter changes (e.g. clicking sidebar Group links)
  useEffect(() => {
    if (grupParam) {
      let raw = String(grupParam).replace(/\+/g, " ");
      try {
        raw = decodeURIComponent(raw);
      } catch {}
      const decoded = raw.trim().toLowerCase();

      // Match exact or fuzzy against available group names
      const matched =
        groupNames.find((gn) => {
          const l = gn.toLowerCase().trim();
          return l === decoded || l.includes(decoded) || decoded.includes(l);
        }) || raw;

      setSelectedGroup(matched);
      setViewMode("group");
    } else {
      // If no ?grup in URL, reset to show all groups
      setSelectedGroup(null);
    }
  }, [grupParam, groupNames]);

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

  // Rekapan Status Dokumen & Paspor per Rombongan / Global
  const docProcessCounts = useMemo(() => {
    let melengkapi = 0;
    let prosesPaspor = 0;
    let punyaPaspor = 0;
    let dokumenLengkap = 0;

    for (const r of currentScopedRows) {
      const status =
        docProcessStatusMap[r.id] ||
        (r.completeness?.status === "Siap Masuk Manifest" || r.documentCount >= 7
          ? "Dokumen lengkap"
          : r.passportNumber && r.passportNumber.trim().length >= 5
          ? "Jamaah sudah memiliki paspor"
          : "Melengkapi dokumen");

      if (status === "Dokumen lengkap") dokumenLengkap++;
      else if (status === "Jamaah sudah memiliki paspor") punyaPaspor++;
      else if (status === "Proses pembuatan paspor") prosesPaspor++;
      else melengkapi++;
    }

    return {
      melengkapi,
      prosesPaspor,
      punyaPaspor,
      dokumenLengkap,
      total: currentScopedRows.length,
    };
  }, [currentScopedRows, docProcessStatusMap]);

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

  // Scoped Payment Summary Stats per Selected Group or Global
  const scopedPaymentStats = useMemo<PaymentSummaryStats>(() => {
    if (!paymentSummaryData) {
      return {
        totalBookings: 0,
        totalPax: 0,
        totalBilled: 0,
        totalPaid: 0,
        totalOutstanding: 0,
        countLunas: 0,
        count50: 0,
        countDp: 0,
        countBelumBayar: 0,
        jamaahLunas: 0,
        jamaah50: 0,
        jamaahDp: 0,
        jamaahBelumBayar: 0,
      };
    }
    if (!selectedGroup) return paymentSummaryData.global;
    const s = selectedGroup.toLowerCase().trim();
    const byName = paymentSummaryData.byPackageName;
    const foundKey = Object.keys(byName).find(
      (k) => k.toLowerCase() === s || s.includes(k.toLowerCase()) || k.toLowerCase().includes(s),
    );
    if (foundKey && byName[foundKey]) return byName[foundKey];
    if (activePackage?.id && paymentSummaryData.byPackageId[activePackage.id]) {
      return paymentSummaryData.byPackageId[activePackage.id];
    }
    return paymentSummaryData.global;
  }, [paymentSummaryData, selectedGroup, activePackage]);

  // Total Jamaah Belum Lunas (Sisa tagihan > 0 atau status !== 'Lunas')
  const belumLunasCount = useMemo(() => {
    return currentScopedRows.filter((r) => {
      const pay = paymentSummaryData?.byJamaahId[r.id];
      if (!pay) return true;
      return pay.status !== "Lunas" || pay.remainingAmount > 0;
    }).length;
  }, [currentScopedRows, paymentSummaryData]);

  // Tour Leader & Muthawwif Info for selected group
  const currentLeaders = useMemo(() => {
    const defaults = {
      tlName: activePackage?.tourLeaderName || "Ahmad Hidayat",
      tlPhone: activePackage?.tourLeaderWhatsapp || "0812-7199-1002",
      muthawwifName: activePackage?.guideName || "Ust. Abdullah Mansur",
      muthawwifPhone: activePackage?.guideWhatsapp || "0812-7199-1001",
    };

    if (!selectedGroup) return defaults;
    try {
      const saved = typeof window !== "undefined" ? localStorage.getItem(`elmassa_group_leaders_${selectedGroup}`) : null;
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === "object") {
          return {
            tlName: parsed.tlName || defaults.tlName,
            tlPhone: parsed.tlPhone || defaults.tlPhone,
            muthawwifName: parsed.muthawwifName || defaults.muthawwifName,
            muthawwifPhone: parsed.muthawwifPhone || defaults.muthawwifPhone,
          };
        }
      }
    } catch {}
    return defaults;
  }, [selectedGroup, activePackage, leadersUpdateKey]);

  // Document Modals State & Storage (Tiket Domestik, Tiket Saudia, Roomlist 3 Kota)
  const [ticketModal, setTicketModal] = useState<{
    isOpen: boolean;
    type: "domestic" | "international";
  }>({ isOpen: false, type: "domestic" });

  const [roomlistModalOpen, setRoomlistModalOpen] = useState(false);

  const [uploadModal, setUploadModal] = useState<{
    isOpen: boolean;
    type: "domestic" | "international" | "roomlist";
  }>({ isOpen: false, type: "domestic" });

  const [groupDocsState, setGroupDocsState] = useState<
    Record<
      string,
      {
        domestic?: TicketDocument;
        international?: TicketDocument;
        roomlist?: RoomlistDocument;
      }
    >
  >({});

  useEffect(() => {
    try {
      const saved = localStorage.getItem("elmassa_group_documents");
      if (saved) setGroupDocsState(JSON.parse(saved));
    } catch {}
  }, []);

  const handleDocumentUploaded = ({
    fileName,
    fileUrl,
    type,
  }: {
    fileName: string;
    fileUrl: string;
    type: string;
  }) => {
    const groupKey = selectedGroup || activePackage?.name || "default";
    setGroupDocsState((prev) => {
      const existing = prev[groupKey] || {};
      const updatedGroup = { ...existing };
      if (type === "domestic") {
        updatedGroup.domestic = {
          ...(existing.domestic || DEFAULT_DOMESTIC_04NOV),
          hasTicket: true,
          fileName,
          fileUrl,
          uploadedAt: "Baru saja diunggah",
        };
      } else if (type === "international") {
        updatedGroup.international = {
          ...(existing.international || DEFAULT_INTERNATIONAL_04NOV),
          hasTicket: true,
          fileName,
          fileUrl,
          uploadedAt: "Baru saja diunggah",
        };
      } else if (type === "roomlist") {
        updatedGroup.roomlist = {
          ...(existing.roomlist || DEFAULT_ROOMLIST_04NOV),
          hasRoomlist: true,
          fileName,
          fileUrl,
          uploadedAt: "Baru saja diunggah",
        };
      }
      const updatedAll = { ...prev, [groupKey]: updatedGroup };
      try {
        localStorage.setItem("elmassa_group_documents", JSON.stringify(updatedAll));
      } catch {}
      return updatedAll;
    });
  };

  const currentDocs = useMemo(() => {
    const groupKey = selectedGroup || activePackage?.name || "default";
    const custom = groupDocsState[groupKey];

    // Dokumen aktif: gunakan dokumen kustom jika pernah diunggah/diperbarui,
    // atau gunakan dokumen resmi 04 November (Tiket Garuda 36 Pax, Saudia PNR 7QO8KT, Roomlist 40 Pax)
    const domestic: TicketDocument = {
      ...DEFAULT_DOMESTIC_04NOV,
      ...(custom?.domestic || {}),
      airline: custom?.domestic?.airline || DEFAULT_DOMESTIC_04NOV.airline,
      flightNo: custom?.domestic?.flightNo || DEFAULT_DOMESTIC_04NOV.flightNo,
      route: custom?.domestic?.route || DEFAULT_DOMESTIC_04NOV.route,
      passengers: custom?.domestic?.passengers || DEFAULT_DOMESTIC_04NOV.passengers,
    };
    const international: TicketDocument = {
      ...DEFAULT_INTERNATIONAL_04NOV,
      ...(custom?.international || {}),
      airline: custom?.international?.airline || DEFAULT_INTERNATIONAL_04NOV.airline,
      flightNo: custom?.international?.flightNo || DEFAULT_INTERNATIONAL_04NOV.flightNo,
      route: custom?.international?.route || DEFAULT_INTERNATIONAL_04NOV.route,
      passengers: custom?.international?.passengers || DEFAULT_INTERNATIONAL_04NOV.passengers,
    };
    const roomlist: RoomlistDocument = {
      ...DEFAULT_ROOMLIST_04NOV,
      ...(custom?.roomlist || {}),
    };

    return { domestic, international, roomlist };
  }, [selectedGroup, activePackage, groupDocsState]);

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
      if (processFilter) {
        const pStatus =
          docProcessStatusMap[r.id] ||
          (r.completeness?.status === "Siap Masuk Manifest" || r.documentCount >= 7
            ? "Dokumen lengkap"
            : r.passportNumber && r.passportNumber.trim().length >= 5
            ? "Jamaah sudah memiliki paspor"
            : "Melengkapi dokumen");
        if (pStatus !== processFilter) return false;
      }
      if (paymentFilter) {
        if (paymentFilter === "Belum Lunas") {
          const pay = paymentSummaryData?.byJamaahId[r.id];
          const isLunas = pay?.status === "Lunas" && pay?.remainingAmount === 0;
          if (isLunas) return false;
        } else {
          const payStatus = paymentSummaryData?.byJamaahId[r.id]?.status || "Belum Bayar";
          if (payStatus !== paymentFilter) return false;
        }
      }
      if (!q) return true;
      return (
        r.fullName.toLowerCase().includes(q) ||
        r.nik.includes(q) ||
        r.passportNumber.toLowerCase().includes(q) ||
        r.phone.includes(q) ||
        r.departureNames.some((n) => n.toLowerCase().includes(q))
      );
    });
  }, [currentScopedRows, query, statusFilter, processFilter, paymentFilter, docProcessStatusMap, paymentSummaryData]);

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
      tlName: currentLeaders?.tlName || "",
      tlPhone: currentLeaders?.tlPhone || "",
      muthawwifName: currentLeaders?.muthawwifName || "",
      muthawwifPhone: currentLeaders?.muthawwifPhone || "",
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
            <div
              onClick={() => setTicketModal({ isOpen: true, type: "domestic" })}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setTicketModal({ isOpen: true, type: "domestic" });
                }
              }}
              className="flex items-start gap-2.5 rounded-xl border border-stone-200/80 bg-white p-2.5 shadow-2xs hover:border-blue-400 hover:bg-blue-50/20 active:scale-[0.99] transition cursor-pointer group"
              title="Klik untuk membuka Detail Tiket Domestik Feeder"
            >
              <div className="rounded-lg bg-blue-100 p-2 text-blue-700 shrink-0 group-hover:scale-105 transition">
                <Plane className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Tiket Domestik</p>
                  {currentDocs.domestic.hasTicket ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setTicketModal({ isOpen: true, type: "domestic" });
                      }}
                      className="inline-flex items-center gap-1 rounded-md bg-blue-100/80 px-2 py-0.5 text-[10px] font-black text-blue-800 border border-blue-200 shadow-2xs hover:bg-blue-200 transition cursor-pointer"
                    >
                      <span>Cek Detail Tiket</span>
                      <ExternalLink className="h-2.5 w-2.5" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setUploadModal({ isOpen: true, type: "domestic" });
                      }}
                      className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-1.5 py-0.5 text-[9px] font-bold text-blue-700 border border-blue-200/60 hover:bg-blue-100 transition cursor-pointer"
                    >
                      <Plus className="h-2.5 w-2.5" />
                      <span>Tambahkan Tiket</span>
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-black text-brand-cocoa leading-tight truncate" title={currentDocs?.domestic?.airline || "Garuda Indonesia"}>
                    {currentDocs?.domestic?.airline || "Garuda Indonesia"}
                  </p>
                  {currentDocs.domestic.hasTicket ? (
                    <span className="shrink-0 rounded-sm bg-blue-50 px-1 py-0.2 text-[9px] font-black text-blue-700 border border-blue-200/50">
                      ✓ {currentDocs.domestic.paxCount} Pax
                    </span>
                  ) : (
                    <span className="shrink-0 rounded-sm bg-stone-100 px-1 py-0.2 text-[9px] font-medium text-stone-500">
                      Belum Ada
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-stone-500 truncate mt-0.5">
                  {currentDocs.domestic.hasTicket ? "PGK ⇄ CGK (PP) · E-Ticket Terbit" : "Feeder Domestik PP"}
                </p>
              </div>
            </div>

            {/* 3. Tiket Internasional */}
            <div
              onClick={() => setTicketModal({ isOpen: true, type: "international" })}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setTicketModal({ isOpen: true, type: "international" });
                }
              }}
              className="flex items-start gap-2.5 rounded-xl border border-stone-200/80 bg-white p-2.5 shadow-2xs hover:border-emerald-400 hover:bg-emerald-50/20 active:scale-[0.99] transition cursor-pointer group"
              title="Klik untuk membuka Detail Tiket Internasional Saudia"
            >
              <div className="rounded-lg bg-emerald-100 p-2 text-emerald-700 shrink-0 group-hover:scale-105 transition">
                <Compass className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Tiket Internasional</p>
                  {currentDocs.international.hasTicket ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setTicketModal({ isOpen: true, type: "international" });
                      }}
                      className="inline-flex items-center gap-1 rounded-md bg-emerald-100/80 px-2 py-0.5 text-[10px] font-black text-emerald-800 border border-emerald-200 shadow-2xs hover:bg-emerald-200 transition cursor-pointer"
                    >
                      <span>Cek Detail Tiket</span>
                      <ExternalLink className="h-2.5 w-2.5" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setUploadModal({ isOpen: true, type: "international" });
                      }}
                      className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700 border border-emerald-200/60 hover:bg-emerald-100 transition cursor-pointer"
                    >
                      <Plus className="h-2.5 w-2.5" />
                      <span>Tambahkan Tiket</span>
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-black text-brand-cocoa leading-tight truncate" title={currentDocs?.international?.airline || "Saudia Airlines"}>
                    {String(currentDocs?.international?.airline || "Saudia Airlines").split("(")[0]?.trim() || "Saudia Airlines"}
                  </p>
                  {currentDocs.international.hasTicket ? (
                    <span className="shrink-0 rounded-sm bg-emerald-50 px-1 py-0.2 text-[9px] font-black text-emerald-700 border border-emerald-200/50">
                      ✓ PNR: {currentDocs.international.pnr || "Confirmed"}
                    </span>
                  ) : (
                    <span className="shrink-0 rounded-sm bg-stone-100 px-1 py-0.2 text-[9px] font-medium text-stone-500">
                      Belum Ada
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-stone-500 truncate mt-0.5">
                  {currentDocs.international.hasTicket ? "SV 817/826 · CGK ⇄ JED Direct (36 Pax)" : "CGK ➔ JED / MED (Direct)"}
                </p>
              </div>
            </div>

            {/* 4. Roomlist & Hotel */}
            <div
              onClick={() => setRoomlistModalOpen(true)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setRoomlistModalOpen(true);
                }
              }}
              className="flex items-start gap-2.5 rounded-xl border border-stone-200/80 bg-white p-2.5 shadow-2xs hover:border-amber-400 hover:bg-amber-50/20 active:scale-[0.99] transition cursor-pointer group"
              title="Klik untuk membuka Roomlist & Distribusi Kamar Hotel 3 Kota"
            >
              <div className="rounded-lg bg-amber-100 p-2 text-amber-700 shrink-0 group-hover:scale-105 transition">
                <Hotel className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Roomlist & Hotel</p>
                  {currentDocs.roomlist.hasRoomlist ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setRoomlistModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1 rounded-md bg-amber-100/80 px-2 py-0.5 text-[10px] font-black text-amber-800 border border-amber-200 shadow-2xs hover:bg-amber-200 transition cursor-pointer"
                    >
                      <span>Cek Detail Roomlist</span>
                      <ExternalLink className="h-2.5 w-2.5" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setRoomlistModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-1.5 py-0.5 text-[9px] font-bold text-amber-800 border border-amber-200/60 hover:bg-amber-100 transition cursor-pointer"
                    >
                      <Plus className="h-2.5 w-2.5" />
                      <span>Tambahkan Roomlist</span>
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-black text-brand-cocoa leading-tight truncate" title={activePackage?.makkahHotel ? `Makkah: ${activePackage.makkahHotel}` : "Grand Al Massa"}>
                    🕋 {activePackage?.makkahHotel || "Grand Al Massa"}
                  </p>
                  {currentDocs.roomlist.hasRoomlist ? (
                    <span className="shrink-0 rounded-sm bg-amber-50 px-1 py-0.2 text-[9px] font-black text-amber-800 border border-amber-200/50">
                      ✓ 3 Kota ({currentDocs.roomlist.paxCount} Pax)
                    </span>
                  ) : (
                    <span className="shrink-0 rounded-sm bg-stone-100 px-1 py-0.2 text-[9px] font-medium text-stone-500">
                      Belum Ada
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-stone-500 truncate mt-0.5" title={activePackage?.madinahHotel ? `Madinah: ${activePackage.madinahHotel}` : "Daar El Naeem"}>
                  🕌 {activePackage?.madinahHotel || "Daar El Naeem"} · 🏨 JKT Transit
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

      {/* ── Informasi Umum Pembayaran (Permintaan Owner) ── */}
      <section className="rounded-2xl border border-stone-200/80 bg-white p-3.5 sm:p-4 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-pink-100 p-1.5 text-brand-pink">
              <Wallet className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-brand-cocoa flex items-center gap-1.5">
                Informasi Umum Pembayaran Rombongan
                {selectedGroup ? (
                  <span className="text-brand-pink font-extrabold">· {selectedGroup}</span>
                ) : (
                  <span className="text-stone-400 font-bold">· Seluruh Rombongan</span>
                )}
              </h3>
              <p className="text-[10px] text-stone-500">
                Terkoneksi langsung ke manajemen keuangan kasir & aplikasi UmrahMe jamaah
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {paymentFilter && (
              <button
                type="button"
                onClick={() => setPaymentFilter("")}
                className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-[11px] font-bold text-rose-700 hover:bg-rose-100 transition shadow-2xs cursor-pointer"
                title="Hapus filter pembayaran tabel"
              >
                <span>Filter Bayar: {paymentFilter}</span>
                <span className="rounded-full bg-rose-200 px-1.5 py-0.2 text-[9px] font-black">✕ Reset</span>
              </button>
            )}
            <Link
              href="/pembayaran/rekap-grup"
              className="inline-flex items-center gap-1 rounded-xl border border-stone-200 bg-stone-50 px-3 py-1.5 text-[11px] font-bold text-stone-700 hover:bg-stone-100 transition shadow-2xs"
            >
              <Layers className="h-3.5 w-3.5 text-stone-500" />
              <span>Rekap Keuangan Grup ↗</span>
            </Link>
            <Link
              href="/pembayaran"
              className="inline-flex items-center gap-1 rounded-xl bg-brand-pink px-3 py-1.5 text-[11px] font-bold text-white hover:bg-brand-pinkHover transition shadow-2xs"
            >
              <CreditCard className="h-3.5 w-3.5" />
              <span>Kasir & Pembayaran ↗</span>
            </Link>
          </div>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
          {/* Card 1: Total Jamaah DP */}
          <div
            onClick={() => setPaymentDetailModal({ isOpen: true, status: "DP" })}
            role="button"
            tabIndex={0}
            className="rounded-xl border border-amber-200/80 bg-gradient-to-br from-amber-50/50 to-white p-3 shadow-2xs hover:border-amber-400 hover:shadow-md hover:scale-[1.01] active:scale-[0.99] transition cursor-pointer group"
            title="Klik untuk melihat daftar nama jamaah yang baru membayar DP"
          >
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Total Jamaah DP</p>
              <div className="rounded-lg bg-amber-100 p-1 text-amber-800 group-hover:scale-105 transition">
                <CreditCard className="h-3.5 w-3.5" />
              </div>
            </div>
            <p className="mt-1 text-lg font-black leading-tight text-amber-900">
              {scopedPaymentStats.jamaahDp || scopedPaymentStats.countDp}{" "}
              <span className="text-xs font-semibold text-stone-500">Jamaah</span>
            </p>
            <p className="mt-1 text-[10px] text-amber-700/80 font-medium">Uang muka terverifikasi kasir</p>
            <div className="mt-2 pt-1.5 border-t border-amber-100/80 flex items-center justify-between text-amber-800">
              <span className="text-[10px] font-bold group-hover:underline flex items-center gap-1">
                <span>Lihat daftar nama</span>
                <ExternalLink className="h-2.5 w-2.5" />
              </span>
              <span className="text-[9px] font-bold bg-amber-100 text-amber-800 rounded px-1.5 py-0.2">
                Buka ↗
              </span>
            </div>
          </div>

          {/* Card 2: Jamaah Belum Lunas */}
          <div
            onClick={() => setPaymentDetailModal({ isOpen: true, status: "Belum Lunas" })}
            role="button"
            tabIndex={0}
            className="rounded-xl border border-rose-200/80 bg-gradient-to-br from-rose-50/50 to-white p-3 shadow-2xs hover:border-rose-400 hover:shadow-md hover:scale-[1.01] active:scale-[0.99] transition cursor-pointer group"
            title="Klik untuk melihat daftar & cetak jamaah yang belum lunas (sisa tagihan)"
          >
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-wider text-rose-700">Jamaah Belum Lunas</p>
              <div className="rounded-lg bg-rose-100 p-1 text-rose-800 group-hover:scale-105 transition">
                <AlertCircle className="h-3.5 w-3.5" />
              </div>
            </div>
            <p className="mt-1 text-lg font-black leading-tight text-rose-900">
              {belumLunasCount}{" "}
              <span className="text-xs font-semibold text-stone-500">Jamaah</span>
            </p>
            <p className="mt-1 text-[10px] text-rose-700/80 font-medium truncate" title={`Sisa: ${formatIDR(scopedPaymentStats.totalOutstanding)}`}>
              Sisa tagihan: {formatIDR(scopedPaymentStats.totalOutstanding)}
            </p>
            <div className="mt-2 pt-1.5 border-t border-rose-100/80 flex items-center justify-between text-rose-800">
              <span className="text-[10px] font-bold group-hover:underline flex items-center gap-1">
                <span>Daftar & cetak data</span>
                <ExternalLink className="h-2.5 w-2.5" />
              </span>
              <span className="text-[9px] font-bold bg-rose-100 text-rose-800 rounded px-1.5 py-0.2">
                Buka 🖨️
              </span>
            </div>
          </div>

          {/* Card 3: Jamaah Yang Lunas */}
          <div
            onClick={() => setPaymentDetailModal({ isOpen: true, status: "Lunas" })}
            role="button"
            tabIndex={0}
            className="rounded-xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50/50 to-white p-3 shadow-2xs hover:border-emerald-400 hover:shadow-md hover:scale-[1.01] active:scale-[0.99] transition cursor-pointer group"
            title="Klik untuk melihat daftar nama jamaah yang sudah lunas (100%)"
          >
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Jamaah Yang Lunas</p>
              <div className="rounded-lg bg-emerald-100 p-1 text-emerald-800 group-hover:scale-105 transition">
                <CheckCircle2 className="h-3.5 w-3.5" />
              </div>
            </div>
            <p className="mt-1 text-lg font-black leading-tight text-emerald-900">
              {scopedPaymentStats.jamaahLunas || scopedPaymentStats.countLunas}{" "}
              <span className="text-xs font-semibold text-stone-500">Jamaah</span>
            </p>
            <p className="mt-1 text-[10px] text-emerald-700/80 font-medium">Pelunasan penuh (100%)</p>
            <div className="mt-2 pt-1.5 border-t border-emerald-100/80 flex items-center justify-between text-emerald-800">
              <span className="text-[10px] font-bold group-hover:underline flex items-center gap-1">
                <span>Lihat daftar nama</span>
                <ExternalLink className="h-2.5 w-2.5" />
              </span>
              <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 rounded px-1.5 py-0.2">
                Buka ↗
              </span>
            </div>
          </div>

          {/* Card 4: Total Terhimpun & Sisa Tagihan */}
          <div className="rounded-xl border border-pink-200/80 bg-gradient-to-br from-rose-50/40 to-white p-3 shadow-2xs transition hover:border-pink-300">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-wider text-brand-cocoa">Total Dana Terhimpun</p>
              <div className="rounded-lg bg-pink-100 p-1 text-brand-pink">
                <Wallet className="h-3.5 w-3.5" />
              </div>
            </div>
            <p className="mt-1 text-sm sm:text-base font-black leading-tight text-brand-pink truncate" title={formatIDR(scopedPaymentStats.totalPaid)}>
              {formatIDR(scopedPaymentStats.totalPaid)}
            </p>
            <p className="mt-1 text-[10px] text-stone-500 truncate" title={`Sisa: ${formatIDR(scopedPaymentStats.totalOutstanding)}`}>
              Sisa Tagihan: <span className="font-bold text-stone-700">{formatIDR(scopedPaymentStats.totalOutstanding)}</span>
            </p>
          </div>
        </div>
      </section>

      {/* ── Scoped Dokumen & Paspor Summary Stats Bar (Rekapan Kelengkapan Dokumen & Paspor) ── */}
      <section className="space-y-3 rounded-2xl border border-stone-200/80 bg-white p-4 shadow-2xs">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-700 font-bold shrink-0">
              <FileCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-brand-cocoa flex items-center gap-2">
                <span>Rekapan Kelengkapan Dokumen & Paspor</span>
                {selectedGroup ? (
                  <span className="text-brand-pink font-extrabold">· {selectedGroup}</span>
                ) : (
                  <span className="text-stone-400 font-bold">· Seluruh Rombongan</span>
                )}
              </h3>
              <p className="text-[10px] text-stone-500">
                Monitoring progres paspor, berkas administrasi & kesiapan manifest (klik kartu untuk filter data)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {processFilter ? (
              <button
                type="button"
                onClick={() => setProcessFilter("")}
                className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-[11px] font-bold text-rose-700 hover:bg-rose-100 transition shadow-2xs cursor-pointer"
                title="Klik untuk menghapus filter dan menampilkan semua jamaah"
              >
                <span>Filter: {processFilter}</span>
                <span className="rounded-full bg-rose-200 px-1.5 py-0.2 text-[9px] font-black">✕ Reset</span>
              </button>
            ) : (
              <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-bold text-stone-700">
                Total {docProcessCounts.total} Jamaah Terdata
              </span>
            )}
          </div>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
          {/* Card 1: Melengkapi Dokumen */}
          <div
            onClick={() => setProcessFilter((prev) => prev === "Melengkapi dokumen" ? "" : "Melengkapi dokumen")}
            role="button"
            tabIndex={0}
            className={`rounded-xl border p-3 shadow-2xs transition cursor-pointer group ${
              processFilter === "Melengkapi dokumen"
                ? "border-amber-400 bg-amber-50 ring-2 ring-amber-300"
                : "border-amber-200/80 bg-gradient-to-br from-amber-50/50 to-white hover:border-amber-300"
            }`}
            title="Klik untuk memfilter jamaah yang masih melengkapi dokumen"
          >
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700">1. Melengkapi Dokumen</p>
              <div className="rounded-lg bg-amber-100 p-1 text-amber-800 group-hover:scale-105 transition">
                <FileText className="h-3.5 w-3.5" />
              </div>
            </div>
            <p className="mt-1 text-lg font-black leading-tight text-amber-900">
              {docProcessCounts.melengkapi}{" "}
              <span className="text-xs font-semibold text-stone-500">Jamaah</span>
            </p>
            <p className="mt-1 text-[10px] text-amber-700/80 font-medium">KTP, KK, Buku Nikah, Pas Foto</p>
          </div>

          {/* Card 2: Proses Pembuatan Paspor */}
          <div
            onClick={() => setProcessFilter((prev) => prev === "Proses pembuatan paspor" ? "" : "Proses pembuatan paspor")}
            role="button"
            tabIndex={0}
            className={`rounded-xl border p-3 shadow-2xs transition cursor-pointer group ${
              processFilter === "Proses pembuatan paspor"
                ? "border-purple-400 bg-purple-50 ring-2 ring-purple-300"
                : "border-purple-200/80 bg-gradient-to-br from-purple-50/50 to-white hover:border-purple-300"
            }`}
            title="Klik untuk memfilter jamaah dalam proses paspor"
          >
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-wider text-purple-700">2. Proses Paspor</p>
              <div className="rounded-lg bg-purple-100 p-1 text-purple-800 group-hover:scale-105 transition">
                <Compass className="h-3.5 w-3.5" />
              </div>
            </div>
            <p className="mt-1 text-lg font-black leading-tight text-purple-900">
              {docProcessCounts.prosesPaspor}{" "}
              <span className="text-xs font-semibold text-stone-500">Jamaah</span>
            </p>
            <p className="mt-1 text-[10px] text-purple-700/80 font-medium">Rekom Kemenag & proses imigrasi</p>
          </div>

          {/* Card 3: Sudah Punya Paspor */}
          <div
            onClick={() => setProcessFilter((prev) => prev === "Jamaah sudah memiliki paspor" ? "" : "Jamaah sudah memiliki paspor")}
            role="button"
            tabIndex={0}
            className={`rounded-xl border p-3 shadow-2xs transition cursor-pointer group ${
              processFilter === "Jamaah sudah memiliki paspor"
                ? "border-blue-400 bg-blue-50 ring-2 ring-blue-300"
                : "border-blue-200/80 bg-gradient-to-br from-blue-50/50 to-white hover:border-blue-300"
            }`}
            title="Klik untuk memfilter jamaah yang sudah punya paspor"
          >
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-wider text-blue-700">3. Sudah Punya Paspor</p>
              <div className="rounded-lg bg-blue-100 p-1 text-blue-800 group-hover:scale-105 transition">
                <Contact className="h-3.5 w-3.5" />
              </div>
            </div>
            <p className="mt-1 text-lg font-black leading-tight text-blue-900">
              {docProcessCounts.punyaPaspor}{" "}
              <span className="text-xs font-semibold text-stone-500">Jamaah</span>
            </p>
            <p className="mt-1 text-[10px] text-blue-700/80 font-medium">Nomor paspor aktif & terverifikasi</p>
          </div>

          {/* Card 4: Dokumen Lengkap */}
          <div
            onClick={() => setProcessFilter((prev) => prev === "Dokumen lengkap" ? "" : "Dokumen lengkap")}
            role="button"
            tabIndex={0}
            className={`rounded-xl border p-3 shadow-2xs transition cursor-pointer group ${
              processFilter === "Dokumen lengkap"
                ? "border-emerald-400 bg-emerald-50 ring-2 ring-emerald-300"
                : "border-emerald-200/80 bg-gradient-to-br from-emerald-50/50 to-white hover:border-emerald-300"
            }`}
            title="Klik untuk memfilter jamaah yang berkasnya 100% lengkap"
          >
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">4. Dokumen Lengkap</p>
              <div className="rounded-lg bg-emerald-100 p-1 text-emerald-800 group-hover:scale-105 transition">
                <CheckCircle2 className="h-3.5 w-3.5" />
              </div>
            </div>
            <p className="mt-1 text-lg font-black leading-tight text-emerald-900">
              {docProcessCounts.dokumenLengkap}{" "}
              <span className="text-xs font-semibold text-stone-500">Jamaah</span>
            </p>
            <p className="mt-1 text-[10px] text-emerald-700/80 font-medium">100% berkas lengkap & siap manifest</p>
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
                            {(m.fullName || "Jamaah").split(" ").slice(0, 2).join(" ")}
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
                      {currentLeaders?.tlName || "Ahmad Hidayat"}
                    </p>
                    <a
                      href={`https://wa.me/${String(currentLeaders?.tlPhone || "081271991002").replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] font-bold text-emerald-600 hover:underline flex items-center gap-1 mt-0.5"
                    >
                      <MessageSquare className="h-2.5 w-2.5" />
                      <span>{currentLeaders?.tlPhone || "0812-7199-1002"}</span>
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
                      {currentLeaders?.muthawwifName || "Ust. Abdullah Mansur"}
                    </p>
                    <a
                      href={`https://wa.me/${String(currentLeaders?.muthawwifPhone || "081271991001").replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] font-bold text-emerald-600 hover:underline flex items-center gap-1 mt-0.5"
                    >
                      <MessageSquare className="h-2.5 w-2.5" />
                      <span>{currentLeaders?.muthawwifPhone || "0812-7199-1001"}</span>
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

                {/* Dokumen Rombongan (Tiket & Roomlist) */}
                <button
                  type="button"
                  onClick={() => {
                    if (currentDocs.domestic.hasTicket) {
                      setTicketModal({ isOpen: true, type: "domestic" });
                    } else {
                      setUploadModal({ isOpen: true, type: "domestic" });
                    }
                  }}
                  className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50/80 px-2.5 text-[10px] font-bold text-blue-700 hover:bg-blue-100 transition shrink-0 cursor-pointer"
                  title="Tiket Domestik Feeder PGK - CGK"
                >
                  <Plane className="h-3 w-3" />
                  <span>{currentDocs.domestic.hasTicket ? `Tiket Domestik (${currentDocs.domestic.paxCount} Pax) ↗` : "+ Tambah Tiket Domestik"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (currentDocs.international.hasTicket) {
                      setTicketModal({ isOpen: true, type: "international" });
                    } else {
                      setUploadModal({ isOpen: true, type: "international" });
                    }
                  }}
                  className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50/80 px-2.5 text-[10px] font-bold text-emerald-700 hover:bg-emerald-100 transition shrink-0 cursor-pointer"
                  title="Tiket Internasional Saudia CGK - JED"
                >
                  <Compass className="h-3 w-3" />
                  <span>{currentDocs.international.hasTicket ? `Tiket Saudia (${currentDocs.international.pnr || "Confirmed"}) ↗` : "+ Tambah Tiket Saudia"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (currentDocs.roomlist.hasRoomlist) {
                      setRoomlistModalOpen(true);
                    } else {
                      setUploadModal({ isOpen: true, type: "roomlist" });
                    }
                  }}
                  className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50/80 px-2.5 text-[10px] font-bold text-amber-800 hover:bg-amber-100 transition shrink-0 cursor-pointer"
                  title="Roomlist 3 Kota: Jakarta, Madinah, Mekkah"
                >
                  <Hotel className="h-3 w-3" />
                  <span>{currentDocs.roomlist.hasRoomlist ? `Roomlist 3 Kota (${currentDocs.roomlist.paxCount} Pax) ↗` : "+ Tambah Roomlist"}</span>
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
          <JamaahTable
            items={filtered}
            showGroupColumn={false}
            processStatusMap={docProcessStatusMap}
            paymentStatusMap={paymentSummaryData?.byJamaahId}
            onProcessStatusChange={handleDocProcessChange}
          />
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
                      <JamaahTable
                        items={filteredMembers}
                        showGroupColumn={false}
                        processStatusMap={docProcessStatusMap}
                        paymentStatusMap={paymentSummaryData?.byJamaahId}
                        onProcessStatusChange={handleDocProcessChange}
                      />
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

          <JamaahTable
            items={filtered}
            showGroupColumn={true}
            processStatusMap={docProcessStatusMap}
            paymentStatusMap={paymentSummaryData?.byJamaahId}
            onProcessStatusChange={handleDocProcessChange}
          />
        </section>
      )}
      {/* Modal Edit Petugas Tour Leader & Muthawwif */}
      {isEditLeadersOpen && mounted && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs font-sans"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsEditLeadersOpen(false);
          }}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
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
        </div>,
        document.body
      )}

      {/* ── Document Modals: Detail Tiket, Detail Roomlist, Upload Dokumen ── */}
      <ModalDetailTiket
        isOpen={ticketModal.isOpen}
        onClose={() => setTicketModal((prev) => ({ ...prev, isOpen: false }))}
        type={ticketModal.type}
        data={ticketModal.type === "domestic" ? currentDocs.domestic : currentDocs.international}
        groupName={selectedGroup || activePackage?.name || "UMRAH REGULER 04 NOVEMBER 2026"}
        onOpenUpload={() => setUploadModal({ isOpen: true, type: ticketModal.type })}
      />

      <ModalDetailRoomlist
        isOpen={roomlistModalOpen}
        onClose={() => setRoomlistModalOpen(false)}
        data={currentDocs.roomlist}
        groupName={selectedGroup || activePackage?.name || "UMRAH REGULER 04 NOVEMBER 2026"}
        onOpenUpload={() => setUploadModal({ isOpen: true, type: "roomlist" })}
      />

      <ModalUploadDokumen
        isOpen={uploadModal.isOpen}
        onClose={() => setUploadModal((prev) => ({ ...prev, isOpen: false }))}
        type={uploadModal.type}
        groupName={selectedGroup || activePackage?.name || "UMRAH REGULER 04 NOVEMBER 2026"}
        onSuccess={handleDocumentUploaded}
      />

      {/* ── Payment Detail Modal (Daftar Nama Jamaah Lunas, 50%, DP) ── */}
      <ModalDetailJamaahPembayaran
        isOpen={paymentDetailModal.isOpen}
        onClose={() => setPaymentDetailModal((prev) => ({ ...prev, isOpen: false }))}
        status={paymentDetailModal.status}
        groupName={selectedGroup}
        items={currentScopedRows}
        paymentSummaryData={paymentSummaryData}
        onFilterTable={(st) => setPaymentFilter(st)}
      />
    </div>
  );
}
