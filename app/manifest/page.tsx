"use client";

import { AppShell } from "@/components/app-shell";
import { CheckCircle2, IdCard, Plane, Printer, Save, Search, Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Departure = {
  id: string;
  name: string;
  departureDate: string;
  returnDate: string;
  airline: string;
  targetPax: number;
  bookingCount: number;
  bookedSeats: number;
  manifestCount: number;
  documentsCompleted: number;
};

type Participant = {
  id: string;
  bookingCode: string;
  customerName: string;
  packageId: string;
  packageName: string;
  departure: string;
  name: string;
  passportNumber: string;
  contact: string;
  documentStatus: "Belum Lengkap" | "Proses Visa" | "Lengkap";
  visaNumber: string;
  visaExpiry: string | null;
  ticketNumber: string;
  roomType: string;
};

type Draft = {
  passportNumber: string;
  contact: string;
  documentStatus: string;
  visaNumber: string;
  visaExpiry: string;
  ticketNumber: string;
  roomType: string;
};

const DOCUMENT_STATUSES = ["Belum Lengkap", "Proses Visa", "Lengkap"] as const;
const ROOM_TYPES = ["Quad (Sekamar Ber-4)", "Triple (Sekamar Ber-3)", "Double (Sekamar Ber-2)"];

const statusStyles: Record<string, string> = {
  Lengkap: "bg-emerald-50/80 text-emerald-800 border border-emerald-200/60",
  "Proses Visa": "bg-amber-50/80 text-amber-800 border border-amber-200/60",
  "Belum Lengkap": "bg-rose-50/80 text-rose-700 border border-rose-200/60",
};

function toDraft(p: Participant): Draft {
  return {
    passportNumber: p.passportNumber,
    contact: p.contact,
    documentStatus: p.documentStatus,
    visaNumber: p.visaNumber,
    visaExpiry: p.visaExpiry ?? "",
    ticketNumber: p.ticketNumber,
    roomType: p.roomType,
  };
}

export default function ManifestPage() {
  const [departures, setDepartures] = useState<Departure[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [rowError, setRowError] = useState<Record<string, string>>({});
  const [loadingDepartures, setLoadingDepartures] = useState(true);
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetch("/api/manifest/departures")
      .then((res) => res.json())
      .then((json) => {
        const rows = (json.data ?? []) as Departure[];
        setDepartures(rows);
        if (rows.length > 0) setSelectedId(rows[0].id);
      })
      .catch((e) => console.error("Failed loading departures:", e))
      .finally(() => setLoadingDepartures(false));
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    setLoadingParticipants(true);
    fetch(`/api/manifest/departures/${encodeURIComponent(selectedId)}/participants`)
      .then((res) => res.json())
      .then((json) => {
        const rows = (json.data ?? []) as Participant[];
        setParticipants(rows);
        setDrafts(Object.fromEntries(rows.map((p) => [p.id, toDraft(p)])));
      })
      .catch((e) => console.error("Failed loading manifest participants:", e))
      .finally(() => setLoadingParticipants(false));
  }, [selectedId]);

  const filteredParticipants = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return participants;
    return participants.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.passportNumber.toLowerCase().includes(q) ||
        p.customerName.toLowerCase().includes(q) ||
        p.bookingCode.toLowerCase().includes(q),
    );
  }, [participants, query]);

  const selectedDeparture = departures.find((d) => d.id === selectedId);
  const totalJamaah = departures.reduce((sum, d) => sum + d.manifestCount, 0);
  const totalCompleted = departures.reduce((sum, d) => sum + d.documentsCompleted, 0);

  const handleDraftChange = (id: string, field: keyof Draft, value: string) => {
    setDrafts((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  };

  const handleSaveRow = async (id: string) => {
    const draft = drafts[id];
    if (!draft) return;

    setSavingId(id);
    setRowError((prev) => ({ ...prev, [id]: "" }));
    try {
      const res = await fetch(`/api/manifest/participants/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          passportNumber: draft.passportNumber,
          contact: draft.contact,
          documentStatus: draft.documentStatus,
          visaNumber: draft.visaNumber,
          visaExpiry: draft.visaExpiry || null,
          ticketNumber: draft.ticketNumber,
          roomType: draft.roomType,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Gagal menyimpan data manifest");

      const updated = json.data as Participant;
      setParticipants((prev) => prev.map((p) => (p.id === id ? updated : p)));
      setDrafts((prev) => ({ ...prev, [id]: toDraft(updated) }));

      // Departure completion counters live in a separate fetch -- refresh them
      // so the KPI cards and dropdown badge don't drift from what was just saved.
      fetch("/api/manifest/departures")
        .then((r) => r.json())
        .then((j) => setDepartures((j.data ?? []) as Departure[]))
        .catch(() => {});
    } catch (e: any) {
      setRowError((prev) => ({ ...prev, [id]: e.message || "Gagal menyimpan" }));
    } finally {
      setSavingId(null);
    }
  };

  return (
    <AppShell eyebrow="Database Operasional" title="Jamaah Manifest & Flight System">
      <div className="space-y-5">
        {/* Header Hero */}
        <section className="rounded-2xl border border-stone-200/70 bg-white p-5 sm:p-6 shadow-2xs">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-brand-cocoa sm:text-2xl">
                Manifest Peserta per Keberangkatan
              </h1>
              <p className="text-xs text-stone-500 mt-1 sm:text-sm">
                Paspor, e-visa, e-tiket, dan rooming hotel per jamaah -- diisi bertahap seiring dokumen masuk.
              </p>
            </div>

            {selectedId ? (
              <Link
                href={`/manifest/cetak?packageId=${encodeURIComponent(selectedId)}`}
                target="_blank"
                className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3.5 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition shrink-0"
              >
                <Printer className="h-3.5 w-3.5 text-stone-500" strokeWidth={1.5} />
                Cetak Manifest
              </Link>
            ) : null}
          </div>
        </section>

        {/* KPI Cards */}
        <section className="grid gap-4 md:grid-cols-4">
          <article className="rounded-2xl border border-stone-200/70 bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-stone-500">Total Keberangkatan</p>
              <Plane className="h-4 w-4 text-sky-600" strokeWidth={1.5} />
            </div>
            <p className="mt-1 text-xl font-extrabold text-brand-cocoa">{departures.length}</p>
            <p className="mt-1 text-[11px] text-stone-400">Paket dengan jadwal terbit</p>
          </article>

          <article className="rounded-2xl border border-stone-200/70 bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-stone-500">Total Jamaah Manifest</p>
              <Users className="h-4 w-4 text-brand-pink" strokeWidth={1.5} />
            </div>
            <p className="mt-1 text-xl font-extrabold text-brand-cocoa">{totalJamaah}</p>
            <p className="mt-1 text-[11px] text-stone-400">Peserta tercatat dari booking</p>
          </article>

          <article className="rounded-2xl border border-stone-200/70 bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-stone-500">Dokumen Lengkap</p>
              <CheckCircle2 className="h-4 w-4 text-emerald-600" strokeWidth={1.5} />
            </div>
            <p className="mt-1 text-xl font-extrabold text-emerald-700">{totalCompleted}</p>
            <p className="mt-1 text-[11px] text-stone-400">Paspor, visa & tiket beres</p>
          </article>

          <article className="rounded-2xl border border-stone-200/70 bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-stone-500">Belum Lengkap</p>
              <IdCard className="h-4 w-4 text-amber-600" strokeWidth={1.5} />
            </div>
            <p className="mt-1 text-xl font-extrabold text-amber-700">{Math.max(totalJamaah - totalCompleted, 0)}</p>
            <p className="mt-1 text-[11px] text-stone-400">Masih perlu ditindaklanjuti</p>
          </article>
        </section>

        {/* Departure Selector + Table */}
        <section className="rounded-2xl border border-stone-200/70 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-stone-100 pb-4">
            <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3 min-w-0">
              <label className="text-[11px] font-bold uppercase tracking-wider text-stone-400 shrink-0">Pilih Keberangkatan</label>
              <select
                className="h-9 rounded-xl border border-stone-200 bg-stone-50/70 px-3 text-xs font-semibold text-brand-cocoa outline-none focus:border-brand-pink min-w-0 sm:min-w-[320px]"
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                disabled={loadingDepartures || departures.length === 0}
              >
                {departures.length === 0 && <option value="">Belum ada paket terbit</option>}
                {departures.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} -- {d.departureDate || "Tanggal belum diatur"} ({d.bookedSeats}/{d.targetPax} pax)
                  </option>
                ))}
              </select>
            </div>

            <label className="flex h-9 items-center gap-2 rounded-xl border border-stone-200 bg-stone-50/70 px-3 text-xs text-stone-500 w-full sm:w-64">
              <Search className="h-3.5 w-3.5 text-stone-400" strokeWidth={1.5} />
              <input
                className="w-full bg-transparent outline-none text-xs placeholder:text-stone-400"
                placeholder="Cari nama / paspor / kode booking..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>
          </div>

          {selectedDeparture ? (
            <p className="text-[11px] text-stone-500">
              Maskapai <span className="font-semibold text-stone-700">{selectedDeparture.airline || "-"}</span> -- Kembali {selectedDeparture.returnDate || "-"} -- Kuota Sisa{" "}
              <span className="font-semibold text-stone-700">{Math.max(selectedDeparture.targetPax - selectedDeparture.bookedSeats, 0)} seat</span>
            </p>
          ) : null}

          <div className="overflow-x-auto rounded-xl border border-stone-200/60">
            <table className="w-full min-w-[1100px] border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-stone-200/60 bg-stone-50/70 font-semibold text-stone-500 text-[11px] uppercase tracking-wider">
                  <th className="py-2.5 pl-3 pr-2">Nama & Booking</th>
                  <th className="py-2.5 pr-2 w-36">No. Paspor</th>
                  <th className="py-2.5 pr-2 w-36">Kontak</th>
                  <th className="py-2.5 pr-2 w-32">No. E-Visa</th>
                  <th className="py-2.5 pr-2 w-32">Exp. Visa</th>
                  <th className="py-2.5 pr-2 w-32">No. E-Tiket</th>
                  <th className="py-2.5 pr-2 w-40">Tipe Kamar</th>
                  <th className="py-2.5 pr-2 w-36">Status Dokumen</th>
                  <th className="py-2.5 pr-3 w-16 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-normal">
                {loadingParticipants && (
                  <tr>
                    <td colSpan={9} className="py-6 text-center text-stone-400">Memuat manifest...</td>
                  </tr>
                )}
                {!loadingParticipants && filteredParticipants.length === 0 && (
                  <tr>
                    <td colSpan={9} className="py-6 text-center text-stone-400">
                      {participants.length === 0 ? "Belum ada jamaah terdaftar untuk keberangkatan ini." : "Tidak ada hasil yang cocok."}
                    </td>
                  </tr>
                )}
                {filteredParticipants.map((p) => {
                  const draft = drafts[p.id] ?? toDraft(p);
                  const isSaving = savingId === p.id;

                  return (
                    <tr key={p.id} className="align-top hover:bg-stone-50/40">
                      <td className="py-2.5 pl-3 pr-2">
                        <p className="font-bold text-brand-cocoa whitespace-nowrap">{p.name}</p>
                        <p className="text-[10px] text-stone-400 font-mono whitespace-nowrap">{p.bookingCode} -- {p.customerName}</p>
                      </td>
                      <td className="py-2.5 pr-2">
                        <input
                          className="w-full rounded-lg border border-stone-200 px-2 py-1.5 text-xs font-mono outline-none focus:border-brand-pink"
                          value={draft.passportNumber}
                          onChange={(e) => handleDraftChange(p.id, "passportNumber", e.target.value)}
                          placeholder="C1234567"
                        />
                      </td>
                      <td className="py-2.5 pr-2">
                        <input
                          className="w-full rounded-lg border border-stone-200 px-2 py-1.5 text-xs outline-none focus:border-brand-pink"
                          value={draft.contact}
                          onChange={(e) => handleDraftChange(p.id, "contact", e.target.value)}
                        />
                      </td>
                      <td className="py-2.5 pr-2">
                        <input
                          className="w-full rounded-lg border border-stone-200 px-2 py-1.5 text-xs font-mono outline-none focus:border-brand-pink"
                          value={draft.visaNumber}
                          onChange={(e) => handleDraftChange(p.id, "visaNumber", e.target.value)}
                          placeholder="-"
                        />
                      </td>
                      <td className="py-2.5 pr-2">
                        <input
                          type="date"
                          className="w-full rounded-lg border border-stone-200 px-2 py-1.5 text-xs outline-none focus:border-brand-pink"
                          value={draft.visaExpiry}
                          onChange={(e) => handleDraftChange(p.id, "visaExpiry", e.target.value)}
                        />
                      </td>
                      <td className="py-2.5 pr-2">
                        <input
                          className="w-full rounded-lg border border-stone-200 px-2 py-1.5 text-xs font-mono outline-none focus:border-brand-pink"
                          value={draft.ticketNumber}
                          onChange={(e) => handleDraftChange(p.id, "ticketNumber", e.target.value)}
                          placeholder="-"
                        />
                      </td>
                      <td className="py-2.5 pr-2">
                        <select
                          className="w-full rounded-lg border border-stone-200 px-2 py-1.5 text-xs outline-none focus:border-brand-pink"
                          value={draft.roomType}
                          onChange={(e) => handleDraftChange(p.id, "roomType", e.target.value)}
                        >
                          {!ROOM_TYPES.includes(draft.roomType) && draft.roomType && (
                            <option value={draft.roomType}>{draft.roomType}</option>
                          )}
                          {ROOM_TYPES.map((rt) => (
                            <option key={rt} value={rt}>{rt}</option>
                          ))}
                        </select>
                      </td>
                      <td className="py-2.5 pr-2">
                        <select
                          className={`w-full rounded-lg border px-2 py-1.5 text-xs font-semibold outline-none focus:border-brand-pink ${statusStyles[draft.documentStatus] ?? "border-stone-200"}`}
                          value={draft.documentStatus}
                          onChange={(e) => handleDraftChange(p.id, "documentStatus", e.target.value)}
                        >
                          {DOCUMENT_STATUSES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </td>
                      <td className="py-2.5 pr-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleSaveRow(p.id)}
                          disabled={isSaving}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand-cocoa text-white hover:bg-black transition disabled:opacity-50"
                          title="Simpan"
                        >
                          <Save className="h-3.5 w-3.5" strokeWidth={1.5} />
                        </button>
                        {rowError[p.id] ? (
                          <p className="mt-1 max-w-[120px] text-[10px] font-semibold text-rose-600">{rowError[p.id]}</p>
                        ) : null}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
