"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Check,
  Info,
  Loader2,
  LayoutList,
  MapPin,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import { AgendaCalendar, type CalendarEvent } from "@/components/agenda-calendar";

type AgendaEvent = {
  id: string;
  source: "manual" | "derived";
  packageId: string;
  packageName: string;
  title: string;
  category: string;
  date: string;
  time: string;
  location: string;
  notes: string;
  editable: boolean;
};

type PackageOption = { id: string; name: string };

const MANUAL_CATEGORIES = ["Manasik", "Handling", "Lainnya"] as const;

const CATEGORY_STYLES: Record<string, string> = {
  Keberangkatan: "bg-emerald-50 text-emerald-800 border-emerald-200/80",
  Kepulangan: "bg-blue-50 text-blue-800 border-blue-200/80",
  Pelunasan: "bg-rose-50 text-brand-pink border-rose-200/80",
  Manasik: "bg-purple-50 text-purple-800 border-purple-200/80",
  Handling: "bg-amber-50 text-amber-900 border-amber-200/80",
  Lainnya: "bg-stone-100 text-stone-700 border-stone-200/80",
};

/** The calendar component only knows four categories; map the rest onto them. */
function toCalendarCategory(category: string): CalendarEvent["category"] {
  if (category === "Keberangkatan" || category === "Kepulangan" || category === "Manasik" || category === "Pelunasan") {
    return category;
  }
  return "Manasik";
}

const emptyForm = {
  id: "",
  title: "",
  category: "Manasik" as string,
  date: "",
  time: "",
  location: "",
  notes: "",
  packageId: "",
};

function formatDateID(iso: string): string {
  const match = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return iso;
  const months = [
    "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
    "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
  ];
  const [, year, month, day] = match;
  return `${Number(day)} ${months[Number(month) - 1]} ${year}`;
}

export function AgendaManager() {
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [packages, setPackages] = useState<PackageOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [view, setView] = useState<"kalender" | "daftar">("kalender");

  const [form, setForm] = useState(emptyForm);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadEvents = useCallback(async () => {
    try {
      const res = await fetch("/api/agenda", { cache: "no-store" });
      const json = await res.json();

      if (!res.ok) {
        setLoadError(json?.error || "Gagal memuat kalender kegiatan");
        return;
      }

      setEvents(json.data ?? []);
      setLoadError("");
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Gagal memuat kalender kegiatan");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  useEffect(() => {
    fetch("/api/packages", { cache: "no-store" })
      .then((res) => res.json())
      .then((json) => {
        if (Array.isArray(json?.data)) {
          setPackages(json.data.map((p: PackageOption) => ({ id: p.id, name: p.name })));
        }
      })
      .catch(() => setPackages([]));
  }, []);

  const calendarEvents = useMemo<CalendarEvent[]>(
    () =>
      events.map((e) => ({
        id: e.id,
        date: e.date,
        title: e.title,
        category: toCalendarCategory(e.category),
        packageName: e.packageName || undefined,
        meetingPoint: e.location || undefined,
        time: e.time || undefined,
        notes: e.notes || undefined,
        link: e.packageId ? `/paket/${encodeURIComponent(e.packageId)}` : undefined,
      })),
    [events],
  );

  const upcoming = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return events.filter((e) => e.date >= today);
  }, [events]);

  const counts = useMemo(() => {
    const manual = events.filter((e) => e.source === "manual").length;
    return { total: events.length, manual, otomatis: events.length - manual, mendatang: upcoming.length };
  }, [events, upcoming]);

  const openCreate = () => {
    setForm({ ...emptyForm, date: new Date().toISOString().slice(0, 10) });
    setFormError("");
    setIsFormOpen(true);
  };

  const openEdit = (event: AgendaEvent) => {
    setForm({
      id: event.id,
      title: event.title,
      category: event.category,
      date: event.date,
      time: event.time,
      location: event.location,
      notes: event.notes,
      packageId: event.packageId,
    });
    setFormError("");
    setIsFormOpen(true);
  };

  const handleSubmit = async () => {
    setIsSaving(true);
    setFormError("");

    const payload = {
      title: form.title,
      category: form.category,
      date: form.date,
      time: form.time,
      location: form.location,
      notes: form.notes,
      packageId: form.packageId,
    };

    try {
      const res = await fetch(form.id ? `/api/agenda/${encodeURIComponent(form.id)}` : "/api/agenda", {
        method: form.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (!res.ok) {
        const fieldMessage = json?.fields ? Object.values(json.fields)[0] : null;
        setFormError(String(fieldMessage || json?.error || "Gagal menyimpan kegiatan"));
        return;
      }

      setIsFormOpen(false);
      setForm(emptyForm);
      await loadEvents();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Gagal menyimpan kegiatan");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (event: AgendaEvent) => {
    if (!confirm(`Hapus kegiatan "${event.title}"?`)) return;

    setDeletingId(event.id);
    try {
      const res = await fetch(`/api/agenda/${encodeURIComponent(event.id)}`, { method: "DELETE" });
      if (res.ok) await loadEvents();
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-stone-200/70 bg-white p-10 text-center shadow-2xs">
        <p className="text-xs font-medium text-stone-500">Memuat kalender kegiatan…</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 font-sans">

      {/* Summary */}
      <section className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        {[
          { label: "Total Kegiatan", value: `${counts.total}` },
          { label: "Mendatang", value: `${counts.mendatang}` },
          { label: "Dari Data Grup", value: `${counts.otomatis}` },
          { label: "Input Manual", value: `${counts.manual}` },
        ].map((card) => (
          <article key={card.label} className="rounded-2xl border border-stone-200/70 bg-white p-3.5 shadow-2xs">
            <p className="text-[10px] font-bold uppercase tracking-wide text-stone-400">{card.label}</p>
            <p className="mt-1 text-lg font-black text-brand-cocoa leading-none">{card.value}</p>
          </article>
        ))}
      </section>

      <section className="rounded-2xl border border-stone-200/70 bg-white p-4 sm:p-5 shadow-2xs space-y-4">

        <header className="flex flex-col gap-3 border-b border-stone-100 pb-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-sm font-extrabold text-brand-cocoa flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-brand-pink" strokeWidth={1.5} />
              <span>Kalender Kegiatan Operasional</span>
            </h2>
            <p className="text-[11px] text-stone-500 mt-0.5">
              Keberangkatan, kepulangan & batas pelunasan dihitung otomatis dari grup. Manasik & handling diinput manual.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar rounded-xl border border-stone-200 bg-stone-50 p-1 max-w-full">
              {([
                { id: "kalender", label: "Kalender", icon: CalendarDays },
                { id: "daftar", label: "Daftar", icon: LayoutList },
              ] as const).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setView(tab.id)}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-bold transition ${
                    view === tab.id ? "bg-white text-brand-cocoa shadow-2xs" : "text-stone-500 hover:text-stone-900"
                  }`}
                >
                  <tab.icon className="h-3.5 w-3.5" strokeWidth={1.5} />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={openCreate}
              className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-brand-pink px-4 text-xs font-bold text-white shadow-2xs hover:bg-brand-pinkHover transition"
            >
              <Plus className="h-3.5 w-3.5" strokeWidth={2} />
              <span>Tambah Kegiatan</span>
            </button>
          </div>
        </header>

        {loadError ? (
          <p className="rounded-xl border border-rose-200 bg-rose-50/60 px-3 py-2 text-[11px] font-semibold text-rose-700">
            {loadError}
          </p>
        ) : null}

        {view === "kalender" ? (
          <AgendaCalendar events={calendarEvents} />
        ) : events.length === 0 ? (
          <div className="rounded-xl border border-dashed border-stone-300 bg-stone-50/60 p-8 text-center space-y-2">
            <p className="text-xs font-extrabold text-stone-700">Belum ada kegiatan</p>
            <p className="text-[11px] text-stone-500 max-w-md mx-auto">
              Keberangkatan & kepulangan muncul otomatis begitu ada grup dengan tanggal. Manasik dan handling
              ditambahkan manual lewat tombol di atas.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-stone-200/60">
            <table className="w-full min-w-[760px] border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-stone-200/60 bg-stone-50/70 text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                  <th className="py-2.5 pl-3 pr-2">Tanggal</th>
                  <th className="py-2.5 pr-2">Kegiatan</th>
                  <th className="py-2.5 pr-2">Kategori</th>
                  <th className="py-2.5 pr-2">Grup</th>
                  <th className="py-2.5 pr-2">Lokasi</th>
                  <th className="py-2.5 pr-3 text-right">Aksi</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-stone-100">
                {events.map((event) => (
                  <tr key={event.id} className="transition hover:bg-stone-50/60">
                    <td className="py-2.5 pl-3 pr-2 whitespace-nowrap">
                      <p className="font-bold text-brand-cocoa">{formatDateID(event.date)}</p>
                      {event.time ? <p className="text-[10px] text-stone-400">{event.time}</p> : null}
                    </td>

                    <td className="py-2.5 pr-2">
                      <p className="font-semibold text-stone-800">{event.title}</p>
                      {event.notes ? <p className="text-[10px] text-stone-500">{event.notes}</p> : null}
                    </td>

                    <td className="py-2.5 pr-2">
                      <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold ${CATEGORY_STYLES[event.category] ?? CATEGORY_STYLES.Lainnya}`}>
                        {event.category}
                      </span>
                    </td>

                    <td className="py-2.5 pr-2 max-w-[180px]">
                      {event.packageId ? (
                        <Link
                          href={`/paket/${encodeURIComponent(event.packageId)}`}
                          className="block truncate font-semibold text-brand-pink hover:underline"
                          title={event.packageName}
                        >
                          {event.packageName || event.packageId}
                        </Link>
                      ) : (
                        <span className="text-stone-400">—</span>
                      )}
                    </td>

                    <td className="py-2.5 pr-2 text-stone-600 max-w-[160px] truncate" title={event.location}>
                      {event.location || "—"}
                    </td>

                    <td className="py-2.5 pr-3 text-right whitespace-nowrap">
                      {event.editable ? (
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => openEdit(event)}
                            className="grid h-7 w-7 place-items-center rounded-lg border border-stone-200 bg-white text-stone-500 hover:bg-stone-100 transition"
                            title="Edit kegiatan"
                          >
                            <Pencil className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(event)}
                            disabled={deletingId === event.id}
                            className="grid h-7 w-7 place-items-center rounded-lg border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 disabled:opacity-40 transition"
                            title="Hapus kegiatan"
                          >
                            {deletingId === event.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Trash2 className="h-3 w-3" />
                            )}
                          </button>
                        </div>
                      ) : (
                        <span
                          className="inline-flex items-center gap-1 text-[10px] font-bold text-stone-400"
                          title="Dihitung otomatis dari tanggal grup & status pembayaran"
                        >
                          <Info className="h-3 w-3" /> Otomatis
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Create / edit modal */}
      {isFormOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-stone-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl border border-stone-200 bg-white p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">

            <div className="flex items-start justify-between border-b border-stone-100 pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-brand-cocoa">
                  {form.id ? "Edit Kegiatan" : "Tambah Kegiatan"}
                </h3>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  Manasik, handling bandara, briefing, atau agenda internal lainnya.
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

            <div className="space-y-3">
              <label className="block space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wide text-stone-500">Judul Kegiatan</span>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Manasik Akbar Rombongan Oktober"
                  className="w-full h-9 rounded-xl border border-stone-200 bg-stone-50/50 px-3 text-xs font-medium text-brand-cocoa placeholder:text-stone-400 outline-none focus:border-brand-pink focus:bg-white transition"
                />
              </label>

              <div className="grid gap-3 sm:grid-cols-3">
                <label className="space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wide text-stone-500">Kategori</span>
                  <select
                    value={form.category}
                    onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                    className="w-full h-9 rounded-xl border border-stone-200 bg-stone-50/50 px-2.5 text-xs font-medium text-brand-cocoa outline-none focus:border-brand-pink focus:bg-white transition"
                  >
                    {MANUAL_CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </label>

                <label className="space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wide text-stone-500">Tanggal</span>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
                    className="w-full h-9 rounded-xl border border-stone-200 bg-stone-50/50 px-2.5 text-xs font-medium text-brand-cocoa outline-none focus:border-brand-pink focus:bg-white transition"
                  />
                </label>

                <label className="space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wide text-stone-500">Jam</span>
                  <input
                    type="text"
                    value={form.time}
                    onChange={(e) => setForm((prev) => ({ ...prev, time: e.target.value }))}
                    placeholder="08:30 WIB"
                    className="w-full h-9 rounded-xl border border-stone-200 bg-stone-50/50 px-2.5 text-xs font-medium text-brand-cocoa placeholder:text-stone-400 outline-none focus:border-brand-pink focus:bg-white transition"
                  />
                </label>
              </div>

              <label className="block space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wide text-stone-500">Grup Keberangkatan</span>
                <select
                  value={form.packageId}
                  onChange={(e) => setForm((prev) => ({ ...prev, packageId: e.target.value }))}
                  className="w-full h-9 rounded-xl border border-stone-200 bg-stone-50/50 px-2.5 text-xs font-medium text-brand-cocoa outline-none focus:border-brand-pink focus:bg-white transition"
                >
                  <option value="">— Umum (tidak terkait grup) —</option>
                  {packages.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </label>

              <label className="block space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wide text-stone-500">Lokasi</span>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
                  placeholder="Ruko Best Cinema, Pangkalpinang"
                  className="w-full h-9 rounded-xl border border-stone-200 bg-stone-50/50 px-3 text-xs font-medium text-brand-cocoa placeholder:text-stone-400 outline-none focus:border-brand-pink focus:bg-white transition"
                />
              </label>

              <label className="block space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wide text-stone-500">Catatan</span>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                  rows={2}
                  placeholder="Bawa kain ihram & buku doa. Konsumsi disediakan."
                  className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-3 py-2 text-xs font-medium text-brand-cocoa placeholder:text-stone-400 outline-none focus:border-brand-pink focus:bg-white transition resize-none"
                />
              </label>
            </div>

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
                {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                <span>{isSaving ? "Menyimpan…" : form.id ? "Simpan Perubahan" : "Tambah Kegiatan"}</span>
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
    </div>
  );
}
