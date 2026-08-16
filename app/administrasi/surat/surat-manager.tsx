"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { FileText, Loader2, Plus, Printer, Search, Trash2, UserSearch, X } from "lucide-react";

import { LetterDocument } from "./letter-document";
import { formatDateID, type LetterCandidate, type LetterRecord, type LetterTypeDef } from "./types";

const emptyForm = {
  letterType: "paspor-baru",
  recipientName: "",
  recipientNik: "",
  passportNumber: "",
  birthPlace: "",
  birthDate: "",
  address: "",
  bookingCode: "",
  packageId: "",
  packageName: "",
  departureDate: "",
  subject: "",
  body: "",
  issuedBy: "",
  issuedDate: "",
  employer: "",
  leaveDates: "",
  namaBaru: "",
  alasan: "",
};

export function SuratManager({ initialType }: { initialType?: string }) {
  const [letters, setLetters] = useState<LetterRecord[]>([]);
  const [types, setTypes] = useState<LetterTypeDef[]>([]);
  const [candidates, setCandidates] = useState<LetterCandidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [activeType, setActiveType] = useState<string>(initialType ?? "semua");
  const [query, setQuery] = useState("");

  const [form, setForm] = useState({ ...emptyForm, letterType: initialType ?? "paspor-baru" });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [preview, setPreview] = useState<LetterRecord | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [identity, setIdentity] = useState<{ signatureUrl?: string; signatureName?: string; signaturePosition?: string; stampUrl?: string } | null>(null);

  // Tanda tangan & stempel dipakai saat mencetak; diambil sekali di sini
  // supaya setiap pratinjau tidak perlu memuat ulang.
  useEffect(() => {
    fetch("/api/company-identity", { cache: "no-store" })
      .then((res) => res.json())
      .then((json) => setIdentity(json?.data ?? null))
      .catch(() => setIdentity(null));
  }, []);

  /**
   * The five per-type menu entries are the same route with a different
   * `?jenis=`, so React keeps this component mounted across them and the
   * useState initialiser above never runs again. Without this the sidebar
   * would highlight the new entry while the list stayed on whichever type
   * happened to be opened first.
   */
  useEffect(() => {
    setActiveType(initialType ?? "semua");
  }, [initialType]);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/letters", { cache: "no-store" });
      const json = await res.json();

      if (!res.ok) {
        setLoadError(json?.error || "Gagal memuat arsip surat");
        return;
      }

      setLetters(json.data ?? []);
      setTypes(json.meta?.types ?? []);
      setLoadError("");
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Gagal memuat arsip surat");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    fetch("/api/letters/candidates", { cache: "no-store" })
      .then((res) => res.json())
      .then((json) => setCandidates(json?.data ?? []))
      .catch(() => setCandidates([]));
  }, []);

  const activeTypeDef = useMemo(() => types.find((t) => t.id === form.letterType), [types, form.letterType]);

  /** The letter template needs the addressee, which lives on the type, not the row. */
  const withRecipient = useCallback(
    (letter: LetterRecord): LetterRecord => ({
      ...letter,
      recipientTo: types.find((t) => t.id === letter.letterType)?.recipient ?? "Kepada Yth.",
    }),
    [types],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return letters.filter((l) => {
      const matchesType = activeType === "semua" || l.letterType === activeType;
      const matchesQuery =
        !q ||
        l.recipientName.toLowerCase().includes(q) ||
        l.letterNumber.toLowerCase().includes(q) ||
        l.recipientNik.toLowerCase().includes(q);
      return matchesType && matchesQuery;
    });
  }, [letters, activeType, query]);

  const openCreate = () => {
    setForm({
      ...emptyForm,
      letterType: activeType === "semua" ? "paspor-baru" : activeType,
      issuedDate: new Date().toISOString().slice(0, 10),
    });
    setFormError("");
    setIsFormOpen(true);
  };

  const prefillFrom = (candidate: LetterCandidate) => {
    setForm((prev) => ({
      ...prev,
      recipientName: candidate.name,
      recipientNik: candidate.nik,
      passportNumber: candidate.passportNumber,
      bookingCode: candidate.bookingCode,
      packageId: candidate.packageId,
      packageName: candidate.packageName,
      departureDate: candidate.departureDate,
    }));
  };

  const [uploadingTtd, setUploadingTtd] = useState(false);

  /**
   * Tanda tangan itu milik perusahaan, bukan milik satu surat: diunggah sekali
   * lalu dipakai semua surat berikutnya. Panel unggahnya ditaruh di formulir
   * ini juga -- kalau hanya ada di Pengaturan, staf tidak punya cara tahu
   * apakah suratnya akan keluar bertanda tangan atau kosong.
   */
  const uploadTtd = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (file.size > 400_000) {
      setFormError(`Gambar tanda tangan terlalu besar (${(file.size / 1000).toFixed(0)} KB). Maksimal 400 KB.`);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      if (typeof reader.result !== "string") return;

      setUploadingTtd(true);
      setFormError("");
      try {
        const res = await fetch("/api/company-identity", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...identity, signatureUrl: reader.result }),
        });
        const json = await res.json();
        if (!res.ok) {
          setFormError(json?.error || "Gagal menyimpan tanda tangan");
          return;
        }
        setIdentity(json.data ?? null);
      } catch (err) {
        setFormError(err instanceof Error ? err.message : "Gagal menyimpan tanda tangan");
      } finally {
        setUploadingTtd(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    setIsSaving(true);
    setFormError("");

    try {
      const res = await fetch("/api/letters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          subject: form.subject || activeTypeDef?.subject,
          extra: { employer: form.employer, leaveDates: form.leaveDates, namaBaru: form.namaBaru, alasan: form.alasan },
        }),
      });
      const json = await res.json();

      if (!res.ok) {
        const fieldMessage = json?.fields ? Object.values(json.fields)[0] : null;
        setFormError(String(fieldMessage || json?.error || "Gagal menerbitkan surat"));
        return;
      }

      setIsFormOpen(false);
      await load();
      setPreview(withRecipient(json.data));
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Gagal menerbitkan surat");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (letter: LetterRecord) => {
    if (!confirm(`Hapus surat ${letter.letterNumber} atas nama ${letter.recipientName}?`)) return;

    setDeletingId(letter.id);
    try {
      const res = await fetch(`/api/letters/${encodeURIComponent(letter.id)}`, { method: "DELETE" });
      if (res.ok) await load();
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-stone-200/70 bg-white p-10 text-center shadow-2xs">
        <p className="text-xs font-medium text-stone-500">Memuat arsip surat…</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 font-sans print:space-y-0">

      {/* Summary */}
      <section className="grid grid-cols-2 gap-2.5 lg:grid-cols-4 print:hidden">
        {[
          { label: "Total Surat", value: `${letters.length}` },
          { label: "Bulan Ini", value: `${letters.filter((l) => l.issuedDate.slice(0, 7) === new Date().toISOString().slice(0, 7)).length}` },
          { label: "Jenis Surat", value: `${types.length}` },
          { label: "Jamaah Terdata", value: `${candidates.length}` },
        ].map((card) => (
          <article key={card.label} className="rounded-2xl border border-stone-200/70 bg-white p-3.5 shadow-2xs">
            <p className="text-[10px] font-bold uppercase tracking-wide text-stone-400">{card.label}</p>
            <p className="mt-1 text-lg font-black text-brand-cocoa leading-none">{card.value}</p>
          </article>
        ))}
      </section>

      <section className="rounded-2xl border border-stone-200/70 bg-white p-4 sm:p-5 shadow-2xs space-y-3 print:hidden">

        <header className="flex flex-col gap-3 border-b border-stone-100 pb-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-sm font-extrabold text-brand-cocoa flex items-center gap-2">
              <FileText className="h-4 w-4 text-brand-pink" strokeWidth={1.5} />
              <span>Arsip Surat Keluar</span>
            </h2>
            <p className="text-[11px] text-stone-500 mt-0.5">
              Setiap surat dapat nomor urut otomatis per jenis per tahun, dan bisa dicetak ulang kapan saja.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-stone-400" strokeWidth={1.5} />
              <input
                type="text"
                placeholder="Cari nama / nomor surat / NIK…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-9 w-56 rounded-xl border border-stone-200 bg-stone-50/50 pl-8 pr-3 text-xs font-medium text-brand-cocoa placeholder:text-stone-400 outline-none focus:border-brand-pink focus:bg-white transition"
              />
            </div>

            <button
              type="button"
              onClick={openCreate}
              className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-brand-pink px-4 text-xs font-bold text-white shadow-2xs hover:bg-brand-pinkHover transition"
            >
              <Plus className="h-3.5 w-3.5" strokeWidth={2} />
              <span>Terbitkan Surat</span>
            </button>
          </div>
        </header>

        {/* Type filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto rounded-xl border border-stone-200 bg-stone-50 p-1 no-scrollbar">
          {[{ id: "semua", shortLabel: "Semua" }, ...types].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveType(t.id)}
              className={`shrink-0 rounded-lg px-3 py-1.5 text-[11px] font-bold transition ${
                activeType === t.id ? "bg-white text-brand-cocoa shadow-2xs" : "text-stone-500 hover:text-stone-900"
              }`}
            >
              {t.shortLabel}
            </button>
          ))}
        </div>

        {loadError ? (
          <p className="rounded-xl border border-rose-200 bg-rose-50/60 px-3 py-2 text-[11px] font-semibold text-rose-700">
            {loadError}
          </p>
        ) : null}

        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-stone-300 bg-stone-50/60 p-8 text-center space-y-2">
            <p className="text-xs font-extrabold text-stone-700">
              {letters.length === 0 ? "Belum ada surat diterbitkan" : "Tidak ada surat yang cocok dengan filter"}
            </p>
            <p className="text-[11px] text-stone-500">
              Klik <b>Terbitkan Surat</b> — data jamaah bisa diambil otomatis dari booking yang sudah ada.
            </p>
          </div>
        ) : (
          <>
          {/* Kartu mobile -- tabel surat di bawah butuh 820px */}
          <div className="block space-y-3 md:hidden">
            {filtered.map((letter) => (
              <div key={letter.id} className="space-y-2.5 rounded-2xl border border-stone-200/80 bg-white p-4 shadow-2xs">
                <div className="flex items-start justify-between gap-2">
                  <span className="min-w-0 truncate font-mono text-xs font-bold text-brand-cocoa">
                    {letter.letterNumber}
                  </span>
                  <span className="shrink-0 rounded-full border border-stone-200 bg-stone-50 px-2 py-0.5 text-[10px] font-bold text-stone-700">
                    {types.find((t) => t.id === letter.letterType)?.shortLabel ?? letter.letterType}
                  </span>
                </div>

                <div>
                  <p className="truncate text-xs font-semibold text-stone-800">{letter.recipientName}</p>
                  {letter.recipientNik ? (
                    <p className="truncate font-mono text-[10px] text-stone-400">{letter.recipientNik}</p>
                  ) : null}
                </div>

                <div className="flex items-center justify-between gap-2 rounded-xl border border-stone-100 bg-stone-50 p-2.5 text-[11px]">
                  <span className="min-w-0 truncate text-stone-600" title={letter.packageName}>
                    {letter.packageName || "—"}
                  </span>
                  <span className="shrink-0 text-stone-600">{formatDateID(letter.issuedDate)}</span>
                </div>

                <div className="flex items-center gap-2 border-t border-stone-100 pt-2">
                  <button
                    type="button"
                    onClick={() => setPreview(withRecipient(letter))}
                    className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl border border-stone-200 bg-white text-[11px] font-bold text-stone-700 transition active:bg-stone-100"
                  >
                    <Printer className="h-3.5 w-3.5" /> Cetak
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(letter)}
                    disabled={deletingId === letter.id}
                    className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 text-[11px] font-bold text-rose-600 transition active:bg-rose-100 disabled:opacity-40"
                  >
                    {deletingId === letter.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                    Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden overflow-x-auto rounded-xl border border-stone-200/60 md:block">
            <table className="w-full min-w-[820px] border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-stone-200/60 bg-stone-50/70 text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                  <th className="py-2.5 pl-3 pr-2">Nomor Surat</th>
                  <th className="py-2.5 pr-2">Jenis</th>
                  <th className="py-2.5 pr-2">Penerima</th>
                  <th className="py-2.5 pr-2">Program</th>
                  <th className="py-2.5 pr-2">Terbit</th>
                  <th className="py-2.5 pr-3 text-right">Aksi</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-stone-100">
                {filtered.map((letter) => (
                  <tr key={letter.id} className="transition hover:bg-stone-50/60">
                    <td className="py-2.5 pl-3 pr-2 font-mono font-bold text-brand-cocoa whitespace-nowrap">
                      {letter.letterNumber}
                    </td>
                    <td className="py-2.5 pr-2">
                      <span className="rounded-full border border-stone-200 bg-stone-50 px-2 py-0.5 text-[10px] font-bold text-stone-700">
                        {types.find((t) => t.id === letter.letterType)?.shortLabel ?? letter.letterType}
                      </span>
                    </td>
                    <td className="py-2.5 pr-2">
                      <p className="font-semibold text-stone-800">{letter.recipientName}</p>
                      {letter.recipientNik ? (
                        <p className="text-[10px] font-mono text-stone-400">{letter.recipientNik}</p>
                      ) : null}
                    </td>
                    <td className="py-2.5 pr-2 max-w-[170px] truncate text-stone-600" title={letter.packageName}>
                      {letter.packageName || "—"}
                    </td>
                    <td className="py-2.5 pr-2 whitespace-nowrap text-stone-600">{formatDateID(letter.issuedDate)}</td>
                    <td className="py-2.5 pr-3 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setPreview(withRecipient(letter))}
                          className="inline-flex h-7 items-center gap-1 rounded-lg border border-stone-200 bg-white px-2.5 text-[11px] font-bold text-stone-700 hover:bg-stone-100 transition"
                        >
                          <Printer className="h-3 w-3" /> Cetak
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(letter)}
                          disabled={deletingId === letter.id}
                          className="grid h-7 w-7 place-items-center rounded-lg border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 disabled:opacity-40 transition"
                          title="Hapus surat"
                        >
                          {deletingId === letter.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </>
        )}
      </section>

      {/* Create form */}
      {isFormOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-stone-900/60 backdrop-blur-xs p-4 print:hidden">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-stone-200 bg-white p-5 sm:p-6 shadow-2xl space-y-4">

            <div className="flex items-start justify-between border-b border-stone-100 pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-brand-cocoa">Terbitkan Surat</h3>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  Nomor surat dibuat otomatis saat disimpan — tidak perlu diketik.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-stone-200 bg-stone-50 text-stone-500 hover:bg-stone-100 transition"
              >
                <X className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>

            <label className="block space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wide text-stone-500">Jenis Surat</span>
              <select
                value={form.letterType}
                onChange={(e) => setForm((prev) => ({ ...prev, letterType: e.target.value }))}
                className="w-full h-9 rounded-xl border border-stone-200 bg-stone-50/50 px-2.5 text-xs font-medium text-brand-cocoa outline-none focus:border-brand-pink focus:bg-white transition"
              >
                {types.map((t) => (
                  <option key={t.id} value={t.id}>{t.label}</option>
                ))}
              </select>
              {activeTypeDef ? <span className="block text-[10px] text-stone-500">{activeTypeDef.description}</span> : null}
            </label>

            {/* Prefill from existing jamaah */}
            {candidates.length > 0 ? (
              <label className="block space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wide text-stone-500 flex items-center gap-1">
                  <UserSearch className="h-3 w-3" /> Ambil Data Jamaah (opsional)
                </span>
                <select
                  onChange={(e) => {
                    const candidate = candidates[Number(e.target.value)];
                    if (candidate) prefillFrom(candidate);
                  }}
                  defaultValue=""
                  className="w-full h-9 rounded-xl border border-stone-200 bg-stone-50/50 px-2.5 text-xs font-medium text-brand-cocoa outline-none focus:border-brand-pink focus:bg-white transition"
                >
                  <option value="">— Isi manual —</option>
                  {candidates.map((c, i) => (
                    <option key={`${c.bookingCode}-${c.name}`} value={i}>
                      {c.name} · {c.bookingCode}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}

            <div className="grid gap-3 sm:grid-cols-2">
              {([
                ["recipientName", "Nama Penerima", "text", "Hj. Nur Aisyah Rahmawati"],
                ["recipientNik", "NIK", "text", "1901025508820001"],
                ["birthPlace", "Tempat Lahir", "text", "Pangkalpinang"],
                ["birthDate", "Tanggal Lahir", "date", ""],
                ["passportNumber", "No. Paspor", "text", "C4471290"],
                ["issuedDate", "Tanggal Terbit", "date", ""],
              ] as const).map(([key, label, type, placeholder]) => (
                <label key={key} className="space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wide text-stone-500">{label}</span>
                  <input
                    type={type}
                    value={form[key]}
                    placeholder={placeholder}
                    onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
                    className="w-full h-9 rounded-xl border border-stone-200 bg-stone-50/50 px-3 text-xs font-medium text-brand-cocoa placeholder:text-stone-400 outline-none focus:border-brand-pink focus:bg-white transition"
                  />
                </label>
              ))}
            </div>

            <label className="block space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wide text-stone-500">Alamat</span>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))}
                placeholder="Jl. Melati No. 4, Pangkalpinang"
                className="w-full h-9 rounded-xl border border-stone-200 bg-stone-50/50 px-3 text-xs font-medium text-brand-cocoa placeholder:text-stone-400 outline-none focus:border-brand-pink focus:bg-white transition"
              />
            </label>

            {form.letterType === "paspor-tambah-nama" ? (
              <label className="block space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wide text-stone-500">Nama Baru yang Dimohonkan</span>
                <input
                  type="text"
                  value={form.namaBaru}
                  onChange={(e) => setForm((prev) => ({ ...prev, namaBaru: e.target.value }))}
                  placeholder="Nur Aisyah Rahmawati Binti Sulaiman"
                  className="w-full h-9 rounded-xl border border-stone-200 bg-stone-50/50 px-3 text-xs font-medium text-brand-cocoa placeholder:text-stone-400 outline-none focus:border-brand-pink focus:bg-white transition"
                />
                <span className="block text-[10px] text-stone-500">Minimal 3 suku kata — syarat visa Arab Saudi.</span>
              </label>
            ) : null}

            {form.letterType === "paspor-ganti" ? (
              <label className="block space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wide text-stone-500">Alasan Penggantian</span>
                <select
                  value={form.alasan}
                  onChange={(e) => setForm((prev) => ({ ...prev, alasan: e.target.value }))}
                  className="w-full h-9 rounded-xl border border-stone-200 bg-stone-50/50 px-2.5 text-xs font-medium text-brand-cocoa outline-none focus:border-brand-pink focus:bg-white transition"
                >
                  <option value="">— Pilih alasan —</option>
                  <option value="Masa berlaku paspor telah habis">Masa berlaku habis</option>
                  <option value="Paspor rusak">Paspor rusak</option>
                  <option value="Paspor hilang">Paspor hilang</option>
                  <option value="Halaman paspor penuh">Halaman penuh</option>
                </select>
              </label>
            ) : null}

            {form.letterType === "izin-cuti" ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wide text-stone-500">Instansi / Perusahaan</span>
                  <input
                    type="text"
                    value={form.employer}
                    onChange={(e) => setForm((prev) => ({ ...prev, employer: e.target.value }))}
                    placeholder="PT Timah Tbk"
                    className="w-full h-9 rounded-xl border border-stone-200 bg-stone-50/50 px-3 text-xs font-medium text-brand-cocoa placeholder:text-stone-400 outline-none focus:border-brand-pink focus:bg-white transition"
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wide text-stone-500">Periode Cuti</span>
                  <input
                    type="text"
                    value={form.leaveDates}
                    onChange={(e) => setForm((prev) => ({ ...prev, leaveDates: e.target.value }))}
                    placeholder="1 – 12 Oktober 2026"
                    className="w-full h-9 rounded-xl border border-stone-200 bg-stone-50/50 px-3 text-xs font-medium text-brand-cocoa placeholder:text-stone-400 outline-none focus:border-brand-pink focus:bg-white transition"
                  />
                </label>
              </div>
            ) : null}

            {/* Tanda tangan yang akan tercetak pada surat ini */}
            <div className="flex items-center gap-3 rounded-xl border border-stone-200 bg-stone-50/60 p-3">
              <div className="grid h-16 w-28 shrink-0 place-items-center rounded-lg border border-stone-200 bg-[repeating-conic-gradient(#f5f5f4_0%_25%,#ffffff_0%_50%)] bg-[length:12px_12px]">
                {identity?.signatureUrl ? (
                  <img src={identity.signatureUrl} alt="Tanda tangan" className="max-h-14 w-auto object-contain" />
                ) : (
                  <span className="px-1 text-center text-[10px] font-bold leading-tight text-stone-400">Belum ada TTD</span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold uppercase tracking-wide text-stone-500">Tanda Tangan Digital</p>
                <p className="mt-0.5 text-[11px] leading-snug text-stone-600">
                  {identity?.signatureUrl
                    ? "Akan tercetak otomatis pada surat ini."
                    : "Belum diunggah — surat keluar dengan ruang tanda tangan kosong."}
                </p>

                <label className="mt-1.5 inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 text-[11px] font-bold text-stone-700 hover:bg-stone-100 transition">
                  {uploadingTtd ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                  <span>{uploadingTtd ? "Menyimpan…" : identity?.signatureUrl ? "Ganti TTD" : "Upload TTD"}</span>
                  <input type="file" accept="image/png,image/webp,image/jpeg" className="hidden" onChange={uploadTtd} disabled={uploadingTtd} />
                </label>
                <span className="ml-2 text-[10px] text-stone-400">PNG transparan, maks 400 KB</span>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wide text-stone-500">Penandatangan</span>
                <input
                  type="text"
                  value={form.issuedBy}
                  onChange={(e) => setForm((prev) => ({ ...prev, issuedBy: e.target.value }))}
                  placeholder="Azriandri"
                  className="w-full h-9 rounded-xl border border-stone-200 bg-stone-50/50 px-3 text-xs font-medium text-brand-cocoa placeholder:text-stone-400 outline-none focus:border-brand-pink focus:bg-white transition"
                />
              </label>
              <label className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wide text-stone-500">Perihal (opsional)</span>
                <input
                  type="text"
                  value={form.subject}
                  onChange={(e) => setForm((prev) => ({ ...prev, subject: e.target.value }))}
                  placeholder={activeTypeDef?.subject ?? ""}
                  className="w-full h-9 rounded-xl border border-stone-200 bg-stone-50/50 px-3 text-xs font-medium text-brand-cocoa placeholder:text-stone-400 outline-none focus:border-brand-pink focus:bg-white transition"
                />
              </label>
            </div>

            <label className="block space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wide text-stone-500">Isi Surat (opsional)</span>
              <textarea
                value={form.body}
                onChange={(e) => setForm((prev) => ({ ...prev, body: e.target.value }))}
                rows={3}
                placeholder="Kosongkan untuk memakai kalimat baku sesuai jenis surat."
                className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-3 py-2 text-xs font-medium text-brand-cocoa placeholder:text-stone-400 outline-none focus:border-brand-pink focus:bg-white transition resize-none"
              />
            </label>

            {formError ? (
              <p className="rounded-xl border border-rose-200 bg-rose-50/60 px-3 py-2 text-[11px] font-semibold text-rose-700">
                {formError}
              </p>
            ) : null}

            <div className="flex items-center gap-2 border-t border-stone-100 pt-3">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSaving}
                className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-brand-pink px-4 text-xs font-bold text-white shadow-2xs hover:bg-brand-pinkHover disabled:opacity-40 transition"
              >
                {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileText className="h-3.5 w-3.5" />}
                <span>{isSaving ? "Menerbitkan…" : "Terbitkan & Cetak"}</span>
              </button>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="inline-flex h-9 items-center rounded-xl border border-stone-200 bg-stone-50 px-3.5 text-xs font-bold text-stone-600 hover:bg-stone-100 transition"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Print preview */}
      {preview ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/70 backdrop-blur-xs p-4 print:static print:bg-white print:p-0">
          <div className="mx-auto w-fit space-y-3 print:w-auto print:space-y-0">

            <div className="flex w-[210mm] max-w-full items-center justify-between rounded-xl bg-stone-800 px-4 py-2.5 print:hidden">
              <span className="text-xs font-semibold text-stone-200">
                Pratinjau — {preview.letterNumber}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-white px-3 text-xs font-bold text-stone-900 hover:bg-stone-100 transition"
                >
                  <Printer className="h-3.5 w-3.5" /> Cetak
                </button>
                <button
                  type="button"
                  onClick={() => setPreview(null)}
                  className="grid h-8 w-8 place-items-center rounded-lg border border-stone-600 text-stone-300 hover:bg-stone-700 transition"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl bg-white shadow-2xl print:overflow-visible print:rounded-none print:shadow-none">
              <LetterDocument letter={preview} identity={identity ?? undefined} />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
