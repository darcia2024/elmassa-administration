"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BedDouble,
  Check,
  Download,
  FileSpreadsheet,
  IdCard,
  Loader2,
  Plus,
  Printer,
  Search,
} from "lucide-react";
import Link from "next/link";
import { exportToCSV } from "@/lib/export-excel";

import { formatDateID, type GroupParticipant, type PackageDetail } from "./types";

const DOCUMENT_STATUSES = ["Belum Lengkap", "Proses Visa", "Lengkap"] as const;
const ROOM_TYPES = ["", "Quad (4 Orang)", "Triple (3 Orang)", "Double (2 Orang)", "Single"];

const statusStyles: Record<string, string> = {
  Lengkap: "bg-emerald-50/80 text-emerald-800 border-emerald-200/60",
  "Proses Visa": "bg-amber-50/80 text-amber-800 border-amber-200/60",
  "Belum Lengkap": "bg-rose-50/80 text-rose-700 border-rose-200/60",
};

const ROOMLIST_VIEWS = [
  { id: "jakarta", label: "Roomlist Jakarta", typeKey: "jakartaRoomType", noKey: "jakartaRoomNo", hint: "Hotel transit sebelum penerbangan internasional" },
  { id: "makkah", label: "Roomlist Makkah", typeKey: "makkahRoomType", noKey: "makkahRoomNo", hint: "" },
  { id: "madinah", label: "Roomlist Madinah", typeKey: "madinahRoomType", noKey: "madinahRoomNo", hint: "" },
] as const;

type ViewId = "dokumen" | (typeof ROOMLIST_VIEWS)[number]["id"] | "siskopatuh";

type Draft = Partial<Record<keyof GroupParticipant, string>>;

export function ManifestTab({ pkg }: { pkg: PackageDetail }) {
  const [participants, setParticipants] = useState<GroupParticipant[]>([]);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [rowError, setRowError] = useState<Record<string, string>>({});
  const [savedIds, setSavedIds] = useState<Record<string, boolean>>({});
  const [view, setView] = useState<ViewId>("dokumen");
  const [query, setQuery] = useState("");

  useEffect(() => {
    setIsLoading(true);
    fetch(`/api/manifest/departures/${encodeURIComponent(pkg.id)}/participants`, { cache: "no-store" })
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || "Gagal memuat manifest jamaah");
        const rows = (json.data ?? []) as GroupParticipant[];
        setParticipants(rows);
        setDrafts(Object.fromEntries(rows.map((p) => [p.id, { ...p } as Draft])));
        setLoadError("");
      })
      .catch((err) => setLoadError(err instanceof Error ? err.message : "Gagal memuat manifest jamaah"))
      .finally(() => setIsLoading(false));
  }, [pkg.id]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return participants;
    return participants.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.passportNumber.toLowerCase().includes(q) ||
        p.bookingCode.toLowerCase().includes(q),
    );
  }, [participants, query]);

  const docSummary = useMemo(() => {
    const complete = participants.filter((p) => p.documentStatus === "Lengkap").length;
    const visa = participants.filter((p) => p.visaNumber.trim() !== "").length;
    const passport = participants.filter((p) => p.passportNumber.trim() !== "").length;
    return { total: participants.length, complete, visa, passport };
  }, [participants]);

  const setField = (id: string, field: keyof GroupParticipant, value: string) => {
    setDrafts((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
    setSavedIds((prev) => ({ ...prev, [id]: false }));
  };

  const saveRow = async (id: string) => {
    const draft = drafts[id];
    if (!draft) return;

    setSavingId(id);
    setRowError((prev) => ({ ...prev, [id]: "" }));

    try {
      const res = await fetch(`/api/manifest/participants/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: draft.name,
          passportNumber: draft.passportNumber,
          contact: draft.contact,
          documentStatus: draft.documentStatus,
          visaNumber: draft.visaNumber,
          visaExpiry: draft.visaExpiry || null,
          ticketNumber: draft.ticketNumber,
          jakartaRoomType: draft.jakartaRoomType,
          jakartaRoomNo: draft.jakartaRoomNo,
          makkahRoomType: draft.makkahRoomType,
          makkahRoomNo: draft.makkahRoomNo,
          madinahRoomType: draft.madinahRoomType,
          madinahRoomNo: draft.madinahRoomNo,
        }),
      });
      const json = await res.json();

      if (!res.ok) {
        setRowError((prev) => ({ ...prev, [id]: json?.error || "Gagal menyimpan" }));
        return;
      }

      setParticipants((prev) => prev.map((p) => (p.id === id ? json.data : p)));
      setSavedIds((prev) => ({ ...prev, [id]: true }));
    } catch (err) {
      setRowError((prev) => ({ ...prev, [id]: err instanceof Error ? err.message : "Gagal menyimpan" }));
    } finally {
      setSavingId(null);
    }
  };

  const exportDocuments = () => {
    exportToCSV(
      `manifest-dokumen-${pkg.name}`,
      ["No", "Nama Jamaah", "Kode Booking", "No. Paspor", "Kontak", "Status Dokumen", "No. Visa", "Berlaku Visa", "No. Tiket"],
      filtered.map((p, i) => [
        i + 1, p.name, p.bookingCode, p.passportNumber, p.contact,
        p.documentStatus, p.visaNumber, p.visaExpiry ?? "", p.ticketNumber,
      ]),
    );
  };

  const exportRoomlist = (cityId: (typeof ROOMLIST_VIEWS)[number]["id"]) => {
    const config = ROOMLIST_VIEWS.find((v) => v.id === cityId)!;
    const hotel =
      cityId === "makkah" ? pkg.makkahHotel : cityId === "madinah" ? pkg.madinahHotel : "Hotel Transit Jakarta";

    exportToCSV(
      `roomlist-${cityId}-${pkg.name}`,
      ["No", "Nama Jamaah", "Kode Booking", "No. Paspor", "Tipe Kamar", "No. Kamar", "Hotel"],
      filtered.map((p, i) => [
        i + 1, p.name, p.bookingCode, p.passportNumber,
        String(p[config.typeKey] ?? ""), String(p[config.noKey] ?? ""), hotel,
      ]),
    );
  };

  const exportRaw = () => {
    exportToCSV(
      `data-jamaah-mentah-${pkg.name}`,
      [
        "No", "Nama Jamaah", "Kode Booking", "Pemesan", "No. Paspor", "Kontak",
        "Status Dokumen", "No. Visa", "Berlaku Visa", "No. Tiket",
        "Kamar Jakarta", "No. Kamar Jakarta", "Kamar Makkah", "No. Kamar Makkah",
        "Kamar Madinah", "No. Kamar Madinah",
      ],
      participants.map((p, i) => [
        i + 1, p.name, p.bookingCode, p.customerName, p.passportNumber, p.contact,
        p.documentStatus, p.visaNumber, p.visaExpiry ?? "", p.ticketNumber,
        p.jakartaRoomType, p.jakartaRoomNo, p.makkahRoomType, p.makkahRoomNo,
        p.madinahRoomType, p.madinahRoomNo,
      ]),
    );
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-stone-200/70 bg-white p-10 text-center shadow-2xs">
        <p className="text-xs font-medium text-stone-500">Memuat manifest jamaah…</p>
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

  const activeRoomlist = ROOMLIST_VIEWS.find((v) => v.id === view);

  return (
    <div className="space-y-4">

      {/* Summary */}
      <section className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        {[
          { label: "Total Jamaah", value: `${docSummary.total} Pax` },
          { label: "Paspor Terisi", value: `${docSummary.passport} / ${docSummary.total}` },
          { label: "Visa Terbit", value: `${docSummary.visa} / ${docSummary.total}` },
          { label: "Dokumen Lengkap", value: `${docSummary.complete} / ${docSummary.total}` },
        ].map((card) => (
          <article key={card.label} className="rounded-2xl border border-stone-200/70 bg-white p-3.5 shadow-2xs">
            <p className="text-[10px] font-bold uppercase tracking-wide text-stone-400">{card.label}</p>
            <p className="mt-1 text-sm font-black text-brand-cocoa">{card.value}</p>
          </article>
        ))}
      </section>

      <section className="rounded-2xl border border-stone-200/70 bg-white p-4 sm:p-5 shadow-2xs space-y-3">

        {/* Sub-view switcher */}
        <nav className="flex items-center gap-1.5 overflow-x-auto rounded-xl border border-stone-200 bg-stone-50 p-1 no-scrollbar">
          {([
            { id: "dokumen" as const, label: "Dokumen & Visa", icon: IdCard },
            ...ROOMLIST_VIEWS.map((v) => ({ id: v.id, label: v.label, icon: BedDouble })),
            { id: "siskopatuh" as const, label: "Manifest Siskopatuh", icon: FileSpreadsheet },
          ]).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setView(tab.id as ViewId)}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-bold transition ${
                view === tab.id ? "bg-white text-brand-cocoa shadow-2xs" : "text-stone-500 hover:text-stone-900"
              }`}
            >
              <tab.icon className="h-3.5 w-3.5" strokeWidth={1.5} />
              <span className="whitespace-nowrap">{tab.label}</span>
            </button>
          ))}
        </nav>

        {participants.length === 0 ? (
          <div className="rounded-xl border border-dashed border-stone-300 bg-stone-50/60 p-8 text-center space-y-3">
            <p className="text-xs font-extrabold text-stone-700">Belum ada data jamaah di grup ini</p>
            <p className="text-[11px] text-stone-500 max-w-md mx-auto">
              Data manifest terisi otomatis dari nama & paspor yang diinput saat pendaftaran booking.
            </p>
            <Link
              href="/booking/form"
              className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-brand-pink px-4 text-xs font-bold text-white shadow-2xs hover:bg-brand-pinkHover transition"
            >
              <Plus className="h-3.5 w-3.5" strokeWidth={2} />
              <span>Daftarkan Jamaah</span>
            </Link>
          </div>
        ) : view === "siskopatuh" ? (
          <div className="space-y-3 pt-1">
            <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 space-y-2">
              <h4 className="text-xs font-extrabold text-amber-900">Menunggu template resmi Siskopatuh</h4>
              <p className="text-[11px] leading-relaxed text-amber-900">
                Export khusus Siskopatuh belum dibuat karena format kolomnya harus persis mengikuti template
                Kemenag. Selain itu, data jamaah di sistem ini <b>belum menyimpan NIK, tempat & tanggal lahir,
                jenis kelamin, dan nama ayah</b> — field yang biasanya wajib di Siskopatuh.
              </p>
              <p className="text-[11px] leading-relaxed text-amber-900">
                Kirim file template aslinya, nanti kolom & urutannya diikuti persis dan field yang kurang
                ditambahkan ke input manifest.
              </p>
            </div>

            <div className="rounded-xl border border-stone-200/70 bg-stone-50/60 p-4 space-y-2">
              <h4 className="text-xs font-extrabold text-brand-cocoa">Sementara: export data mentah</h4>
              <p className="text-[11px] text-stone-600">
                Semua field jamaah yang tersimpan sekarang ({participants.length} pax), buat ditempel manual ke
                template Siskopatuh.
              </p>
              <button
                type="button"
                onClick={exportRaw}
                className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3.5 text-xs font-bold text-stone-700 hover:bg-stone-100 transition"
              >
                <Download className="h-3.5 w-3.5 text-stone-500" strokeWidth={1.5} />
                <span>Export Data Jamaah (CSV)</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Toolbar */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-stone-400" strokeWidth={1.5} />
                <input
                  type="text"
                  placeholder="Cari nama / paspor / kode booking…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="h-9 w-full sm:w-64 rounded-xl border border-stone-200 bg-stone-50/50 pl-8 pr-3 text-xs font-medium text-brand-cocoa placeholder:text-stone-400 outline-none focus:border-brand-pink focus:bg-white transition"
                />
              </div>

              <div className="flex items-center gap-2">
                {view === "dokumen" ? (
                  <Link
                    href="/manifest/cetak"
                    className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-stone-200 bg-stone-50 px-3 text-xs font-bold text-stone-700 hover:bg-stone-100 transition"
                  >
                    <Printer className="h-3.5 w-3.5 text-stone-500" strokeWidth={1.5} />
                    <span>Cetak</span>
                  </Link>
                ) : null}

                <button
                  type="button"
                  onClick={() => (view === "dokumen" ? exportDocuments() : exportRoomlist(view as "jakarta" | "makkah" | "madinah"))}
                  disabled={filtered.length === 0}
                  className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-stone-200 bg-stone-50 px-3 text-xs font-bold text-stone-700 hover:bg-stone-100 disabled:opacity-40 transition"
                >
                  <Download className="h-3.5 w-3.5 text-stone-500" strokeWidth={1.5} />
                  <span>Export</span>
                </button>
              </div>
            </div>

            {activeRoomlist?.hint ? (
              <p className="text-[11px] text-stone-500">{activeRoomlist.hint}</p>
            ) : null}

            {filtered.length === 0 ? (
              <p className="py-8 text-center text-xs text-stone-500">Tidak ada jamaah yang cocok dengan pencarian ini.</p>
            ) : (
              <>
              {/* Kartu mobile -- tabel di bawah butuh 900px. Input 16px supaya
                  Safari iOS tidak auto-zoom tiap kali field disentuh. */}
              <div className="block space-y-3 md:hidden">
                {filtered.map((p, index) => {
                  const draft = drafts[p.id] ?? {};
                  const isSaving = savingId === p.id;
                  const hotel =
                    view === "makkah" ? pkg.makkahHotel : view === "madinah" ? pkg.madinahHotel : "Hotel Transit Jakarta";
                  const field =
                    "h-11 w-full rounded-lg border border-stone-200 bg-white px-2.5 text-[16px] text-brand-cocoa outline-none focus:border-brand-pink transition";

                  return (
                    <div key={p.id} className="space-y-3 rounded-2xl border border-stone-200/80 bg-white p-4 shadow-2xs">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h4 className="truncate text-xs font-bold text-brand-cocoa">
                            <span className="font-mono text-stone-400">{index + 1}.</span> {p.name}
                          </h4>
                          <p className="truncate font-mono text-[10px] text-stone-400">{p.bookingCode}</p>
                        </div>
                      </div>

                      {view === "dokumen" ? (
                        <div className="grid grid-cols-2 gap-2.5">
                          <label className="block min-w-0">
                            <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-stone-400">No. Paspor</span>
                            <input
                              type="text"
                              value={draft.passportNumber ?? ""}
                              onChange={(e) => setField(p.id, "passportNumber", e.target.value)}
                              placeholder="A1234567"
                              className={`${field} font-mono font-semibold`}
                            />
                          </label>

                          <label className="block min-w-0">
                            <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-stone-400">Status Dokumen</span>
                            <select
                              value={draft.documentStatus ?? "Belum Lengkap"}
                              onChange={(e) => setField(p.id, "documentStatus", e.target.value)}
                              className={`h-11 w-full rounded-lg border px-2.5 text-[16px] font-bold outline-none transition ${
                                statusStyles[draft.documentStatus ?? "Belum Lengkap"] ?? statusStyles["Belum Lengkap"]
                              }`}
                            >
                              {DOCUMENT_STATUSES.map((s) => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                          </label>

                          <label className="block min-w-0">
                            <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-stone-400">No. Visa</span>
                            <input
                              type="text"
                              value={draft.visaNumber ?? ""}
                              onChange={(e) => setField(p.id, "visaNumber", e.target.value)}
                              placeholder="Belum terbit"
                              className={`${field} font-mono font-semibold`}
                            />
                          </label>

                          <label className="block min-w-0">
                            <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-stone-400">Berlaku Visa</span>
                            <input
                              type="date"
                              value={draft.visaExpiry ?? ""}
                              onChange={(e) => setField(p.id, "visaExpiry", e.target.value)}
                              className={`${field} font-semibold`}
                            />
                          </label>

                          <label className="col-span-2 block min-w-0">
                            <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-stone-400">No. Tiket</span>
                            <input
                              type="text"
                              value={draft.ticketNumber ?? ""}
                              onChange={(e) => setField(p.id, "ticketNumber", e.target.value)}
                              placeholder="SV-817"
                              className={`${field} font-mono font-semibold`}
                            />
                          </label>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-2.5">
                          <label className="block min-w-0">
                            <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-stone-400">Tipe Kamar</span>
                            <select
                              value={String(draft[activeRoomlist!.typeKey] ?? "")}
                              onChange={(e) => setField(p.id, activeRoomlist!.typeKey, e.target.value)}
                              className={`${field} font-semibold`}
                            >
                              {ROOM_TYPES.map((t) => (
                                <option key={t} value={t}>{t || "— Belum diatur —"}</option>
                              ))}
                            </select>
                          </label>

                          <label className="block min-w-0">
                            <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-stone-400">No. Kamar</span>
                            <input
                              type="text"
                              value={String(draft[activeRoomlist!.noKey] ?? "")}
                              onChange={(e) => setField(p.id, activeRoomlist!.noKey, e.target.value)}
                              placeholder="812"
                              className={`${field} font-mono font-bold`}
                            />
                          </label>

                          <div className="col-span-2 grid grid-cols-2 gap-2 rounded-xl border border-stone-100 bg-stone-50 p-2.5 text-[11px]">
                            <div className="min-w-0">
                              <span className="block text-[10px] font-medium text-stone-400">No. Paspor</span>
                              <span className="block truncate font-mono text-stone-600">{p.passportNumber || "—"}</span>
                            </div>
                            <div className="min-w-0">
                              <span className="block text-[10px] font-medium text-stone-400">Hotel</span>
                              <span className="block truncate font-semibold text-stone-600" title={hotel}>
                                {hotel || "—"}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {rowError[p.id] ? (
                        <p className="text-[11px] font-bold text-rose-600">{rowError[p.id]}</p>
                      ) : null}

                      <button
                        type="button"
                        onClick={() => saveRow(p.id)}
                        disabled={isSaving}
                        className="inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-xl border border-stone-200 bg-stone-50 text-xs font-bold text-stone-700 transition active:bg-stone-100 disabled:opacity-40"
                      >
                        {isSaving ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : savedIds[p.id] ? (
                          <Check className="h-3.5 w-3.5 text-emerald-600" />
                        ) : null}
                        {isSaving ? "Menyimpan…" : savedIds[p.id] ? "Tersimpan" : "Simpan"}
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="hidden overflow-x-auto rounded-xl border border-stone-200/60 md:block">
                <table className="w-full min-w-[900px] border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b border-stone-200/60 bg-stone-50/70 text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                      <th className="py-2.5 pl-3 pr-2 w-8">No</th>
                      <th className="py-2.5 pr-2">Jamaah</th>

                      {view === "dokumen" ? (
                        <>
                          <th className="py-2.5 pr-2">No. Paspor</th>
                          <th className="py-2.5 pr-2">Status Dokumen</th>
                          <th className="py-2.5 pr-2">No. Visa</th>
                          <th className="py-2.5 pr-2">Berlaku Visa</th>
                          <th className="py-2.5 pr-2">No. Tiket</th>
                        </>
                      ) : (
                        <>
                          <th className="py-2.5 pr-2">No. Paspor</th>
                          <th className="py-2.5 pr-2">Tipe Kamar</th>
                          <th className="py-2.5 pr-2">No. Kamar</th>
                          <th className="py-2.5 pr-2">Hotel</th>
                        </>
                      )}

                      <th className="py-2.5 pr-3 text-right">Aksi</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-stone-100">
                    {filtered.map((p, index) => {
                      const draft = drafts[p.id] ?? {};
                      const isSaving = savingId === p.id;
                      const hotel =
                        view === "makkah" ? pkg.makkahHotel : view === "madinah" ? pkg.madinahHotel : "Hotel Transit Jakarta";

                      return (
                        <tr key={p.id} className="align-top transition hover:bg-stone-50/40">
                          <td className="py-2.5 pl-3 pr-2 text-stone-400 font-mono">{index + 1}</td>

                          <td className="py-2.5 pr-2">
                            <p className="font-bold text-brand-cocoa">{p.name}</p>
                            <p className="text-[10px] text-stone-400">{p.bookingCode}</p>
                            {rowError[p.id] ? (
                              <p className="mt-0.5 text-[10px] font-bold text-rose-600">{rowError[p.id]}</p>
                            ) : null}
                          </td>

                          {view === "dokumen" ? (
                            <>
                              <td className="py-2.5 pr-2">
                                <input
                                  type="text"
                                  value={draft.passportNumber ?? ""}
                                  onChange={(e) => setField(p.id, "passportNumber", e.target.value)}
                                  placeholder="A1234567"
                                  className="h-8 w-28 rounded-lg border border-stone-200 bg-white px-2 text-[11px] font-mono font-semibold text-brand-cocoa outline-none focus:border-brand-pink transition"
                                />
                              </td>

                              <td className="py-2.5 pr-2">
                                <select
                                  value={draft.documentStatus ?? "Belum Lengkap"}
                                  onChange={(e) => setField(p.id, "documentStatus", e.target.value)}
                                  className={`h-8 rounded-lg border px-2 text-[11px] font-bold outline-none transition ${
                                    statusStyles[draft.documentStatus ?? "Belum Lengkap"] ?? statusStyles["Belum Lengkap"]
                                  }`}
                                >
                                  {DOCUMENT_STATUSES.map((s) => (
                                    <option key={s} value={s}>{s}</option>
                                  ))}
                                </select>
                              </td>

                              <td className="py-2.5 pr-2">
                                <input
                                  type="text"
                                  value={draft.visaNumber ?? ""}
                                  onChange={(e) => setField(p.id, "visaNumber", e.target.value)}
                                  placeholder="Belum terbit"
                                  className="h-8 w-28 rounded-lg border border-stone-200 bg-white px-2 text-[11px] font-mono font-semibold text-brand-cocoa outline-none focus:border-brand-pink transition"
                                />
                              </td>

                              <td className="py-2.5 pr-2">
                                <input
                                  type="date"
                                  value={draft.visaExpiry ?? ""}
                                  onChange={(e) => setField(p.id, "visaExpiry", e.target.value)}
                                  className="h-8 w-32 rounded-lg border border-stone-200 bg-white px-2 text-[11px] font-semibold text-brand-cocoa outline-none focus:border-brand-pink transition"
                                />
                              </td>

                              <td className="py-2.5 pr-2">
                                <input
                                  type="text"
                                  value={draft.ticketNumber ?? ""}
                                  onChange={(e) => setField(p.id, "ticketNumber", e.target.value)}
                                  placeholder="SV-817"
                                  className="h-8 w-24 rounded-lg border border-stone-200 bg-white px-2 text-[11px] font-mono font-semibold text-brand-cocoa outline-none focus:border-brand-pink transition"
                                />
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="py-2.5 pr-2 font-mono text-[11px] text-stone-500">
                                {p.passportNumber || "—"}
                              </td>

                              <td className="py-2.5 pr-2">
                                <select
                                  value={String(draft[activeRoomlist!.typeKey] ?? "")}
                                  onChange={(e) => setField(p.id, activeRoomlist!.typeKey, e.target.value)}
                                  className="h-8 w-36 rounded-lg border border-stone-200 bg-white px-2 text-[11px] font-semibold text-brand-cocoa outline-none focus:border-brand-pink transition"
                                >
                                  {ROOM_TYPES.map((t) => (
                                    <option key={t} value={t}>{t || "— Belum diatur —"}</option>
                                  ))}
                                </select>
                              </td>

                              <td className="py-2.5 pr-2">
                                <input
                                  type="text"
                                  value={String(draft[activeRoomlist!.noKey] ?? "")}
                                  onChange={(e) => setField(p.id, activeRoomlist!.noKey, e.target.value)}
                                  placeholder="812"
                                  className="h-8 w-20 rounded-lg border border-stone-200 bg-white px-2 text-[11px] font-mono font-bold text-brand-cocoa outline-none focus:border-brand-pink transition"
                                />
                              </td>

                              <td className="py-2.5 pr-2 text-[11px] font-semibold text-stone-600 max-w-[160px] truncate" title={hotel}>
                                {hotel || "—"}
                              </td>
                            </>
                          )}

                          <td className="py-2.5 pr-3 text-right">
                            <button
                              type="button"
                              onClick={() => saveRow(p.id)}
                              disabled={isSaving}
                              className="inline-flex h-8 items-center gap-1 rounded-lg border border-stone-200 bg-stone-50 px-2.5 text-[11px] font-bold text-stone-700 hover:bg-stone-100 disabled:opacity-40 transition"
                            >
                              {isSaving ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : savedIds[p.id] ? (
                                <Check className="h-3 w-3 text-emerald-600" />
                              ) : null}
                              <span>{isSaving ? "…" : savedIds[p.id] ? "Tersimpan" : "Simpan"}</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              </>
            )}

            {view === "dokumen" && filtered.length > 0 ? (
              <p className="text-[11px] text-stone-400">
                Visa terakhir berlaku sampai{" "}
                {formatDateID(
                  filtered.map((p) => p.visaExpiry).filter(Boolean).sort().slice(-1)[0] ?? null,
                )}
              </p>
            ) : null}
          </>
        )}
      </section>
    </div>
  );
}
