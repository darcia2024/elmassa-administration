"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronUp, Loader2, Plus, RotateCcw, Route, Save, Sparkles, Trash2 } from "lucide-react";
import type { ItineraryDayItem } from "@/lib/itinerary-generator";
import { generateDefaultItinerary } from "@/lib/itinerary-generator";

import type { PackageDetail } from "./types";

const HIGHLIGHTS: Array<{ value: ItineraryDayItem["highlight"]; label: string; className: string }> = [
  { value: "departure", label: "Keberangkatan", className: "bg-sky-50 text-sky-800 border-sky-200" },
  { value: "worship", label: "Ibadah", className: "bg-emerald-50 text-emerald-800 border-emerald-200" },
  { value: "ziarah", label: "Ziarah", className: "bg-purple-50 text-purple-800 border-purple-200" },
  { value: "umrah", label: "Umrah", className: "bg-amber-50 text-amber-900 border-amber-200" },
  { value: "travel", label: "Perjalanan", className: "bg-stone-100 text-stone-700 border-stone-200" },
];

function highlightClass(value: string) {
  return HIGHLIGHTS.find((h) => h.value === value)?.className ?? HIGHLIGHTS[4].className;
}

function emptyDay(dayNumber: number): ItineraryDayItem {
  return {
    day: dayNumber,
    date: "",
    title: `H${dayNumber}: `,
    location: "",
    highlight: "travel",
    activities: [{ time: "", description: "" }],
  };
}

export function ItineraryTab({ pkg, onSaved }: { pkg: PackageDetail; onSaved: () => void }) {
  const [days, setDays] = useState<ItineraryDayItem[]>(pkg.itinerary);
  const [openDay, setOpenDay] = useState<number | null>(pkg.itinerary.length > 0 ? 0 : null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [savedAt, setSavedAt] = useState("");

  useEffect(() => {
    setDays(pkg.itinerary);
  }, [pkg]);

  const isDirty = useMemo(() => JSON.stringify(days) !== JSON.stringify(pkg.itinerary), [days, pkg.itinerary]);

  const patchDay = (index: number, patch: Partial<ItineraryDayItem>) => {
    setDays((prev) => prev.map((day, i) => (i === index ? { ...day, ...patch } : day)));
  };

  const patchActivity = (dayIndex: number, actIndex: number, patch: { time?: string; description?: string }) => {
    setDays((prev) =>
      prev.map((day, i) =>
        i === dayIndex
          ? { ...day, activities: day.activities.map((act, j) => (j === actIndex ? { ...act, ...patch } : act)) }
          : day,
      ),
    );
  };

  const addActivity = (dayIndex: number) => {
    setDays((prev) =>
      prev.map((day, i) => (i === dayIndex ? { ...day, activities: [...day.activities, { time: "", description: "" }] } : day)),
    );
  };

  const removeActivity = (dayIndex: number, actIndex: number) => {
    setDays((prev) =>
      prev.map((day, i) =>
        i === dayIndex ? { ...day, activities: day.activities.filter((_, j) => j !== actIndex) } : day,
      ),
    );
  };

  /** Day numbers are renumbered on every structural change so they always read
   *  H1..Hn in order, no matter which day was inserted or deleted. */
  const renumber = (list: ItineraryDayItem[]) => list.map((day, i) => ({ ...day, day: i + 1 }));

  const addDay = () => {
    setDays((prev) => {
      const next = renumber([...prev, emptyDay(prev.length + 1)]);
      setOpenDay(next.length - 1);
      return next;
    });
  };

  const removeDay = (index: number) => {
    setDays((prev) => renumber(prev.filter((_, i) => i !== index)));
    setOpenDay(null);
  };

  const moveDay = (index: number, direction: -1 | 1) => {
    setDays((prev) => {
      const target = index + direction;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      setOpenDay(target);
      return renumber(next);
    });
  };

  const regenerate = () => {
    if (
      days.length > 0 &&
      !confirm("Ganti seluruh itinerary dengan template otomatis? Perubahan manual yang belum disimpan akan hilang.")
    ) {
      return;
    }

    const durationDays = Number(String(pkg.duration).replace(/\D/g, "")) || 12;
    setDays(
      generateDefaultItinerary(
        durationDays,
        pkg.departureDate || "2026-11-03",
        pkg.domesticAirline || "Garuda Indonesia",
        pkg.internationalAirline || "Saudia Airline",
        pkg.makkahHotel || "Grand Al Massa",
        pkg.madinahHotel || "Daar El Naeem",
      ),
    );
    setOpenDay(0);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError("");

    try {
      const res = await fetch(`/api/packages/${encodeURIComponent(pkg.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itinerary: days }),
      });
      const json = await res.json();

      if (!res.ok) {
        setError(json?.error || "Gagal menyimpan itinerary");
        return;
      }

      setSavedAt(new Date().toLocaleTimeString("id-ID"));
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan itinerary");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="rounded-2xl border border-stone-200/70 bg-white p-5 sm:p-6 shadow-2xs space-y-4">

      <header className="flex flex-col gap-3 border-b border-stone-100 pb-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-extrabold text-brand-cocoa flex items-center gap-2">
            <Route className="h-4 w-4 text-brand-pink" strokeWidth={1.5} />
            <span>Itinerary Grup — {days.length} Hari</span>
          </h3>
          <p className="text-[11px] text-stone-500 mt-0.5">
            Dipakai kartu grup, brosur, dan Live App Itinerary yang dibagikan ke jamaah.
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={regenerate}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-stone-200 bg-stone-50 px-3 text-xs font-bold text-stone-700 hover:bg-stone-100 transition"
            title="Isi ulang dari template otomatis El Massa"
          >
            <RotateCcw className="h-3.5 w-3.5 text-stone-500" strokeWidth={1.5} />
            <span>Template Otomatis</span>
          </button>

          <button
            type="button"
            onClick={addDay}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-3 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={2} />
            <span>Tambah Hari</span>
          </button>
        </div>
      </header>

      {days.length === 0 ? (
        <div className="rounded-xl border border-dashed border-stone-300 bg-stone-50/60 p-8 text-center space-y-3">
          <Sparkles className="h-7 w-7 mx-auto text-stone-300" strokeWidth={1.5} />
          <div>
            <p className="text-xs font-extrabold text-stone-700">Belum ada itinerary untuk grup ini</p>
            <p className="text-[11px] text-stone-500 mt-0.5">
              Mulai dari template otomatis, atau tambah hari satu per satu.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {days.map((day, dayIndex) => {
            const isOpen = openDay === dayIndex;

            return (
              <article key={dayIndex} className="rounded-xl border border-stone-200/80 bg-stone-50/40 overflow-hidden">

                {/* Day header row */}
                <div className="flex items-center gap-2 p-2.5">
                  <span className="grid h-7 w-8 shrink-0 place-items-center rounded-lg bg-brand-cocoa text-[10px] font-black text-white">
                    H{day.day}
                  </span>

                  <button
                    type="button"
                    onClick={() => setOpenDay(isOpen ? null : dayIndex)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <p className="truncate text-xs font-bold text-brand-cocoa">{day.title || "(judul belum diisi)"}</p>
                    <p className="truncate text-[10px] text-stone-500">
                      {day.location || "Lokasi belum diisi"} • {day.activities.length} kegiatan
                    </p>
                  </button>

                  <span className={`hidden shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-bold sm:inline ${highlightClass(day.highlight)}`}>
                    {HIGHLIGHTS.find((h) => h.value === day.highlight)?.label ?? "Perjalanan"}
                  </span>

                  <div className="flex shrink-0 items-center gap-0.5">
                    <button
                      type="button"
                      onClick={() => moveDay(dayIndex, -1)}
                      disabled={dayIndex === 0}
                      className="grid h-7 w-7 place-items-center rounded-lg border border-stone-200 bg-white text-stone-500 hover:bg-stone-100 disabled:opacity-30 transition"
                      title="Naikkan"
                    >
                      <ChevronUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveDay(dayIndex, 1)}
                      disabled={dayIndex === days.length - 1}
                      className="grid h-7 w-7 place-items-center rounded-lg border border-stone-200 bg-white text-stone-500 hover:bg-stone-100 disabled:opacity-30 transition"
                      title="Turunkan"
                    >
                      <ChevronDown className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeDay(dayIndex)}
                      className="grid h-7 w-7 place-items-center rounded-lg border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 transition"
                      title="Hapus hari ini"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Day editor */}
                {isOpen ? (
                  <div className="space-y-3 border-t border-stone-200/70 bg-white p-3">
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                      <label className="space-y-1 lg:col-span-2">
                        <span className="text-[10px] font-bold uppercase text-stone-500">Judul Hari</span>
                        <input
                          type="text"
                          value={day.title}
                          onChange={(e) => patchDay(dayIndex, { title: e.target.value })}
                          placeholder="H1 03 Nov: Pangkal Pinang (PGK) – Jakarta (CGK)"
                          className="w-full h-8 rounded-lg border border-stone-200 bg-stone-50/50 px-2.5 text-[11px] font-medium text-brand-cocoa outline-none focus:border-brand-pink focus:bg-white transition"
                        />
                      </label>

                      <label className="space-y-1">
                        <span className="text-[10px] font-bold uppercase text-stone-500">Tanggal</span>
                        <input
                          type="text"
                          value={day.date ?? ""}
                          onChange={(e) => patchDay(dayIndex, { date: e.target.value })}
                          placeholder="03 Okt 2026"
                          className="w-full h-8 rounded-lg border border-stone-200 bg-stone-50/50 px-2.5 text-[11px] font-medium text-brand-cocoa outline-none focus:border-brand-pink focus:bg-white transition"
                        />
                      </label>

                      <label className="space-y-1">
                        <span className="text-[10px] font-bold uppercase text-stone-500">Kategori</span>
                        <select
                          value={day.highlight}
                          onChange={(e) => patchDay(dayIndex, { highlight: e.target.value as ItineraryDayItem["highlight"] })}
                          className="w-full h-8 rounded-lg border border-stone-200 bg-stone-50/50 px-2 text-[11px] font-medium text-brand-cocoa outline-none focus:border-brand-pink focus:bg-white transition"
                        >
                          {HIGHLIGHTS.map((h) => (
                            <option key={h.value} value={h.value}>{h.label}</option>
                          ))}
                        </select>
                      </label>

                      <label className="space-y-1 sm:col-span-2 lg:col-span-4">
                        <span className="text-[10px] font-bold uppercase text-stone-500">Lokasi</span>
                        <input
                          type="text"
                          value={day.location}
                          onChange={(e) => patchDay(dayIndex, { location: e.target.value })}
                          placeholder="Pangkal Pinang (PGK) → Jakarta (CGK)"
                          className="w-full h-8 rounded-lg border border-stone-200 bg-stone-50/50 px-2.5 text-[11px] font-medium text-brand-cocoa outline-none focus:border-brand-pink focus:bg-white transition"
                        />
                      </label>
                    </div>

                    {/* Activities */}
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-bold uppercase text-stone-500">Kegiatan</p>

                      {day.activities.map((activity, actIndex) => (
                        <div key={actIndex} className="flex items-start gap-1.5">
                          <input
                            type="text"
                            value={activity.time ?? ""}
                            onChange={(e) => patchActivity(dayIndex, actIndex, { time: e.target.value })}
                            placeholder="09:00 WIB"
                            className="h-8 w-24 shrink-0 rounded-lg border border-stone-200 bg-stone-50/50 px-2 text-[11px] font-bold text-stone-600 outline-none focus:border-brand-pink focus:bg-white transition"
                          />
                          <input
                            type="text"
                            value={activity.description}
                            onChange={(e) => patchActivity(dayIndex, actIndex, { description: e.target.value })}
                            placeholder="Jemaah berkumpul di Bandara Depati Amir untuk check-in"
                            className="h-8 min-w-0 flex-1 rounded-lg border border-stone-200 bg-stone-50/50 px-2.5 text-[11px] font-medium text-brand-cocoa outline-none focus:border-brand-pink focus:bg-white transition"
                          />
                          <button
                            type="button"
                            onClick={() => removeActivity(dayIndex, actIndex)}
                            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-stone-200 bg-white text-stone-400 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 transition"
                            title="Hapus kegiatan"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={() => addActivity(dayIndex)}
                        className="inline-flex h-8 items-center gap-1 rounded-lg border border-dashed border-stone-300 bg-white px-3 text-[11px] font-bold text-stone-600 hover:border-brand-pink hover:text-brand-pink transition"
                      >
                        <Plus className="h-3 w-3" strokeWidth={2} />
                        <span>Tambah Kegiatan</span>
                      </button>
                    </div>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      )}

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
          <span>{isSaving ? "Menyimpan…" : "Simpan Itinerary"}</span>
        </button>

        {isDirty ? (
          <button
            type="button"
            onClick={() => setDays(pkg.itinerary)}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-stone-200 bg-stone-50 px-3 text-xs font-bold text-stone-600 hover:bg-stone-100 transition"
          >
            Batalkan Perubahan
          </button>
        ) : null}

        {savedAt && !isDirty ? (
          <span className="text-[11px] font-semibold text-emerald-700">Tersimpan {savedAt}</span>
        ) : null}
        {isDirty && !isSaving ? (
          <span className="text-[11px] font-semibold text-amber-700">Ada perubahan belum disimpan</span>
        ) : null}
      </div>
    </section>
  );
}
