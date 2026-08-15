"use client";

import { useEffect, useMemo, useState } from "react";
import { Calculator, ImageIcon, Loader2, Save, Sparkles, Upload, X } from "lucide-react";

import { formatIDR, type PackageDetail } from "./types";

/** Base64 art lands in a TEXT column and is re-sent on every catalogue load, so
 *  an unbounded upload would quietly slow down every page that lists groups. */
const MAX_IMAGE_BYTES = 1_500_000;

type FlyerField = {
  key: keyof PackageDetail;
  label: string;
  placeholder?: string;
};

const FLYER_FIELDS: FlyerField[] = [
  { key: "name", label: "Nama Grup", placeholder: "UMRAH 01 OKTOBER 2026" },
  { key: "category", label: "Kategori / Bulan", placeholder: "Oktober" },
  { key: "duration", label: "Durasi Program", placeholder: "12 Hari" },
  { key: "departuresDate", label: "Label Tanggal di Flyer", placeholder: "01 Oktober 2026" },
  { key: "price", label: "Harga Tampil", placeholder: "Rp 34.526.744" },
  { key: "dpMinimum", label: "DP Minimum", placeholder: "Rp 5.000.000" },
  { key: "airline", label: "Maskapai", placeholder: "Saudia Airlines" },
  { key: "makkahHotel", label: "Hotel Makkah", placeholder: "Grand Al Massa" },
  { key: "madinahHotel", label: "Hotel Madinah", placeholder: "Daar El Naeem" },
];

/** The HPP inputs worth surfacing next to the flyer. The authoritative editor
 *  is still the calculator -- recomputing HPP here would mean a second copy of
 *  that logic that can drift from the one that actually publishes the price. */
const HPP_SUMMARY: Array<{ key: string; label: string; kind: "idr" | "sar" | "plain" }> = [
  { key: "sarExchangeRate", label: "Kurs SAR", kind: "idr" },
  { key: "targetPax", label: "Target Pax", kind: "plain" },
  { key: "makkahNights", label: "Malam Makkah", kind: "plain" },
  { key: "madinahNights", label: "Malam Madinah", kind: "plain" },
  { key: "makkahRoomSarPerNight", label: "Kamar Makkah / Malam", kind: "sar" },
  { key: "madinahRoomSarPerNight", label: "Kamar Madinah / Malam", kind: "sar" },
  { key: "flightPtkCgk", label: "Tiket PGK ⇄ CGK", kind: "idr" },
  { key: "flightCgkJed", label: "Tiket CGK ⇄ JED", kind: "idr" },
  { key: "visaAndInsuranceSar", label: "Visa & Asuransi", kind: "sar" },
  { key: "marginNominalPerPax", label: "Margin / Pax", kind: "idr" },
];

export function FlyerTab({ pkg, onSaved }: { pkg: PackageDetail; onSaved: () => void }) {
  const [draft, setDraft] = useState({
    name: pkg.name,
    category: pkg.category,
    duration: pkg.duration,
    departuresDate: pkg.departuresDate,
    price: pkg.price,
    dpMinimum: pkg.dpMinimum,
    airline: pkg.airline,
    makkahHotel: pkg.makkahHotel,
    madinahHotel: pkg.madinahHotel,
    posterImg: pkg.posterImg || "",
    bannerImg: pkg.bannerImg || "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [savedAt, setSavedAt] = useState("");

  useEffect(() => {
    setDraft({
      name: pkg.name,
      category: pkg.category,
      duration: pkg.duration,
      departuresDate: pkg.departuresDate,
      price: pkg.price,
      dpMinimum: pkg.dpMinimum,
      airline: pkg.airline,
      makkahHotel: pkg.makkahHotel,
      madinahHotel: pkg.madinahHotel,
      posterImg: pkg.posterImg || "",
      bannerImg: pkg.bannerImg || "",
    });
  }, [pkg]);

  const isDirty = useMemo(
    () =>
      draft.name !== pkg.name ||
      draft.category !== pkg.category ||
      draft.duration !== pkg.duration ||
      draft.departuresDate !== pkg.departuresDate ||
      draft.price !== pkg.price ||
      draft.dpMinimum !== pkg.dpMinimum ||
      draft.airline !== pkg.airline ||
      draft.makkahHotel !== pkg.makkahHotel ||
      draft.madinahHotel !== pkg.madinahHotel ||
      draft.posterImg !== (pkg.posterImg || "") ||
      draft.bannerImg !== (pkg.bannerImg || ""),
    [draft, pkg],
  );

  const handleUpload = (field: "posterImg" | "bannerImg") => (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = ""; // let the same file be re-picked after an error
    if (!file) return;

    if (file.size > MAX_IMAGE_BYTES) {
      setError(
        `Gambar terlalu besar (${(file.size / 1_000_000).toFixed(1)} MB). Maksimal 1,5 MB — kompres dulu biar halaman katalog nggak berat.`,
      );
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        setDraft((prev) => ({ ...prev, [field]: reader.result as string }));
        setError("");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError("");

    try {
      const res = await fetch(`/api/packages/${encodeURIComponent(pkg.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const json = await res.json();

      if (!res.ok) {
        setError(json?.error || "Gagal menyimpan flyer");
        return;
      }

      setSavedAt(new Date().toLocaleTimeString("id-ID"));
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan flyer");
    } finally {
      setIsSaving(false);
    }
  };

  const costing = pkg.costingData ?? {};
  const hppRows = HPP_SUMMARY.filter((row) => costing[row.key] !== undefined && costing[row.key] !== null);

  return (
    <div className="space-y-5">

      {/* Flyer art */}
      <section className="rounded-2xl border border-stone-200/70 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
        <header className="flex items-center justify-between gap-3 border-b border-stone-100 pb-3">
          <h3 className="text-sm font-extrabold text-brand-cocoa flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-brand-pink" strokeWidth={1.5} />
            <span>Flyer Grup</span>
          </h3>
          <p className="text-[11px] text-stone-400">Poster & banner yang dibagikan ke jamaah</p>
        </header>

        <div className="grid gap-4 md:grid-cols-2">
          {([
            { field: "posterImg" as const, label: "Poster (Portrait)", aspect: "aspect-3/4" },
            { field: "bannerImg" as const, label: "Banner (Landscape)", aspect: "aspect-video" },
          ]).map(({ field, label, aspect }) => (
            <div key={field} className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold uppercase tracking-wide text-stone-500">{label}</p>
                {draft[field] ? (
                  <button
                    type="button"
                    onClick={() => setDraft((prev) => ({ ...prev, [field]: "" }))}
                    className="inline-flex items-center gap-1 text-[10px] font-bold text-stone-400 hover:text-rose-600 transition"
                  >
                    <X className="h-3 w-3" /> Hapus
                  </button>
                ) : null}
              </div>

              <div className={`relative ${aspect} w-full overflow-hidden rounded-xl border border-stone-200 bg-stone-50 grid place-items-center`}>
                {draft[field] ? (
                  <img src={draft[field]} alt={label} className="h-full w-full object-cover" />
                ) : (
                  <div className="text-center text-stone-400 p-4">
                    <ImageIcon className="h-7 w-7 mx-auto text-stone-300" strokeWidth={1.5} />
                    <p className="mt-1.5 text-[11px] font-bold">Belum ada {label.toLowerCase()}</p>
                  </div>
                )}
              </div>

              <label className="flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-stone-200 bg-stone-50 text-xs font-bold text-stone-700 hover:bg-stone-100 transition">
                <Upload className="h-3.5 w-3.5 text-stone-500" strokeWidth={1.5} />
                <span>{draft[field] ? "Ganti Gambar" : "Upload Gambar"}</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleUpload(field)} />
              </label>
            </div>
          ))}
        </div>
      </section>

      {/* Flyer copy */}
      <section className="rounded-2xl border border-stone-200/70 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
        <header className="border-b border-stone-100 pb-3">
          <h3 className="text-sm font-extrabold text-brand-cocoa">Keterangan di Flyer</h3>
          <p className="text-[11px] text-stone-500 mt-0.5">
            Teks yang tampil di kartu grup, brosur, dan katalog jamaah.
          </p>
        </header>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {FLYER_FIELDS.map((field) => (
            <label key={String(field.key)} className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wide text-stone-500">{field.label}</span>
              <input
                type="text"
                value={String(draft[field.key as keyof typeof draft] ?? "")}
                placeholder={field.placeholder}
                onChange={(e) => setDraft((prev) => ({ ...prev, [field.key]: e.target.value }))}
                className="w-full h-9 rounded-xl border border-stone-200 bg-stone-50/50 px-3 text-xs font-medium text-brand-cocoa placeholder:text-stone-400 outline-none focus:border-brand-pink focus:bg-white transition"
              />
            </label>
          ))}
        </div>

        {error ? (
          <p className="rounded-xl border border-rose-200 bg-rose-50/60 px-3 py-2 text-[11px] font-semibold text-rose-700">
            {error}
          </p>
        ) : null}

        <div className="flex flex-wrap items-center gap-2 border-t border-stone-100 pt-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={!isDirty || isSaving}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-brand-pink px-4 text-xs font-bold text-white shadow-2xs hover:bg-brand-pinkHover disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            <span>{isSaving ? "Menyimpan…" : "Simpan Flyer"}</span>
          </button>

          {savedAt && !isDirty ? (
            <span className="text-[11px] font-semibold text-emerald-700">Tersimpan {savedAt}</span>
          ) : null}
          {isDirty && !isSaving ? (
            <span className="text-[11px] font-semibold text-amber-700">Ada perubahan belum disimpan</span>
          ) : null}
        </div>
      </section>

      {/* HPP */}
      <section className="rounded-2xl border border-stone-200/70 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
        <header className="flex flex-col gap-3 border-b border-stone-100 pb-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-brand-cocoa flex items-center gap-2">
              <Calculator className="h-4 w-4 text-emerald-600" strokeWidth={1.5} />
              <span>Komponen HPP Grup Ini</span>
            </h3>
            <p className="text-[11px] text-stone-500 mt-0.5">
              Angka yang dipakai saat paket ini diterbitkan. Ubah lewat Kalkulator HPP, lalu terbitkan ulang.
            </p>
          </div>

          <a
            href={`/paket/kalkulator?edit=${encodeURIComponent(pkg.id)}`}
            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-xl bg-gradient-to-r from-pink-600 via-rose-600 to-brand-pink px-4 text-xs font-black text-white shadow-md shadow-pink-500/20 hover:brightness-110 active:scale-95 transition border border-pink-400/30"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Ubah HPP di Kalkulator</span>
          </a>
        </header>

        {hppRows.length === 0 ? (
          <p className="rounded-xl border border-amber-200 bg-amber-50/50 px-3 py-2.5 text-[11px] font-semibold text-amber-900">
            Grup ini belum punya data HPP tersimpan — kemungkinan dibuat sebelum Kalkulator HPP dipakai. Buka
            Kalkulator HPP untuk menghitung & menerbitkan ulang.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
            {hppRows.map((row) => {
              const raw = Number(costing[row.key]) || 0;
              const display =
                row.kind === "idr" ? formatIDR(raw) : row.kind === "sar" ? `SAR ${raw.toLocaleString("id-ID")}` : String(raw);

              return (
                <div key={row.key} className="rounded-xl border border-stone-200/60 bg-stone-50/60 p-2.5">
                  <p className="text-[10px] font-semibold uppercase text-stone-400 leading-tight">{row.label}</p>
                  <p className="mt-0.5 text-xs font-bold text-brand-cocoa">{display}</p>
                </div>
              );
            })}
          </div>
        )}

        <div className="rounded-xl border border-stone-200/70 bg-stone-50/70 p-3 text-[11px] text-stone-600">
          Harga jual terbit sekarang: <span className="font-bold text-brand-cocoa">{formatIDR(pkg.numericPrice)}</span>
          {" · "}Target <span className="font-bold text-brand-cocoa">{pkg.targetPax} pax</span>
        </div>
      </section>
    </div>
  );
}
