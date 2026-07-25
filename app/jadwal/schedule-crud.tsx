"use client";

import { useMemo, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";

type ScheduleDraft = {
  id: string;
  packageName: string;
  departureDate: string;
  returnDate: string;
  quota: string;
  priceDisplay: string;
  status: string;
};

const initialSchedules: ScheduleDraft[] = [
  {
    id: "local-1",
    packageName: "Umrah Reguler 12 Hari",
    departureDate: "2026-08-12",
    returnDate: "2026-08-24",
    quota: "45",
    priceDisplay: "Rp 32.500.000",
    status: "Terjadwal",
  },
];

const emptyDraft: ScheduleDraft = {
  id: "",
  packageName: "",
  departureDate: "",
  returnDate: "",
  quota: "",
  priceDisplay: "",
  status: "Draft",
};

export function ScheduleCrud() {
  const [items, setItems] = useState(initialSchedules);
  const [draft, setDraft] = useState<ScheduleDraft>(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof ScheduleDraft, string>>>({});

  const isEditing = editingId !== null;
  const totalQuota = useMemo(
    () => items.reduce((total, item) => total + Number(item.quota || 0), 0),
    [items],
  );

  function updateDraft(key: keyof ScheduleDraft, value: string) {
    setDraft((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  function resetDraft() {
    setDraft(emptyDraft);
    setEditingId(null);
    setErrors({});
  }

  function validateDraft() {
    const nextErrors: Partial<Record<keyof ScheduleDraft, string>> = {};

    if (!draft.packageName.trim()) {
      nextErrors.packageName = "Nama paket wajib diisi.";
    }

    if (!draft.departureDate) {
      nextErrors.departureDate = "Tanggal berangkat wajib diisi.";
    }

    if (!draft.returnDate) {
      nextErrors.returnDate = "Tanggal pulang wajib diisi.";
    }

    if (draft.departureDate && draft.returnDate && draft.returnDate < draft.departureDate) {
      nextErrors.returnDate = "Tanggal pulang tidak boleh sebelum berangkat.";
    }

    if (Number(draft.quota) <= 0) {
      nextErrors.quota = "Kuota harus lebih dari 0.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function saveDraft() {
    if (!validateDraft()) {
      return;
    }

    if (isEditing) {
      setItems((current) =>
        current.map((item) => (item.id === editingId ? { ...draft, id: editingId } : item)),
      );
      resetDraft();
      return;
    }

    setItems((current) => [
      ...current,
      {
        ...draft,
        id: `local-${Date.now()}`,
      },
    ]);
    resetDraft();
  }

  function editItem(item: ScheduleDraft) {
    setDraft(item);
    setEditingId(item.id);
  }

  function deleteItem(id: string) {
    setItems((current) => current.filter((item) => item.id !== id));
    if (editingId === id) {
      resetDraft();
    }
  }

  return (
    <section className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-lg font-bold text-brand-cocoa">Simulasi CRUD Jadwal Lokal</h3>
          <p className="mt-1 text-sm text-stone-500">
            State berjalan di browser untuk validasi alur tambah, edit, dan hapus sebelum backend aktif.
          </p>
        </div>
        <span className="w-fit rounded-md bg-brand-cream px-3 py-2 text-xs font-bold uppercase text-brand-brown ring-1 ring-brand-rose">
          {items.length} jadwal - {totalQuota} kuota
        </span>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_420px]">
        <div className="grid gap-3">
          {items.map((item) => (
            <article key={item.id} className="grid gap-3 rounded-lg border border-stone-200 bg-brand-cream p-4 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <p className="font-bold text-brand-cocoa">{item.packageName}</p>
                <p className="mt-1 text-sm text-stone-500">
                  {item.departureDate || "-"} sampai {item.returnDate || "-"} - {item.priceDisplay || "Harga belum diisi"}
                </p>
                <p className="mt-1 text-xs font-semibold uppercase text-brand-brown">
                  Kuota {item.quota || "0"} - {item.status}
                </p>
              </div>
              <div className="flex gap-2">
                <button className="grid h-9 w-9 place-items-center rounded-md bg-white text-brand-cocoa ring-1 ring-stone-200" type="button" onClick={() => editItem(item)}>
                  <Pencil className="h-4 w-4" aria-hidden="true" />
                </button>
                <button className="grid h-9 w-9 place-items-center rounded-md bg-white text-rose-700 ring-1 ring-rose-200" type="button" onClick={() => deleteItem(item.id)}>
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </article>
          ))}
        </div>

        <form className="rounded-lg border border-stone-200 bg-white p-4">
          <h4 className="font-bold text-brand-cocoa">{isEditing ? "Edit Jadwal Lokal" : "Tambah Jadwal Lokal"}</h4>
          <div className="mt-4 grid gap-3">
            <label className="block">
              <span className="sr-only">Nama paket</span>
              <input
                className={`h-10 w-full rounded-md border px-3 text-sm outline-none ${
                  errors.packageName ? "border-rose-300 bg-rose-50" : "border-stone-200 bg-brand-cream"
                }`}
                placeholder="Nama paket"
                value={draft.packageName}
                onChange={(event) => updateDraft("packageName", event.target.value)}
              />
              {errors.packageName ? <p className="mt-1 text-xs font-semibold text-rose-700">{errors.packageName}</p> : null}
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="sr-only">Tanggal berangkat</span>
                <input
                  className={`h-10 w-full rounded-md border px-3 text-sm outline-none ${
                    errors.departureDate ? "border-rose-300 bg-rose-50" : "border-stone-200 bg-brand-cream"
                  }`}
                  type="date"
                  value={draft.departureDate}
                  onChange={(event) => updateDraft("departureDate", event.target.value)}
                />
                {errors.departureDate ? <p className="mt-1 text-xs font-semibold text-rose-700">{errors.departureDate}</p> : null}
              </label>
              <label className="block">
                <span className="sr-only">Tanggal pulang</span>
                <input
                  className={`h-10 w-full rounded-md border px-3 text-sm outline-none ${
                    errors.returnDate ? "border-rose-300 bg-rose-50" : "border-stone-200 bg-brand-cream"
                  }`}
                  type="date"
                  value={draft.returnDate}
                  onChange={(event) => updateDraft("returnDate", event.target.value)}
                />
                {errors.returnDate ? <p className="mt-1 text-xs font-semibold text-rose-700">{errors.returnDate}</p> : null}
              </label>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="sr-only">Kuota</span>
                <input
                  className={`h-10 w-full rounded-md border px-3 text-sm outline-none ${
                    errors.quota ? "border-rose-300 bg-rose-50" : "border-stone-200 bg-brand-cream"
                  }`}
                  placeholder="Kuota"
                  type="number"
                  value={draft.quota}
                  onChange={(event) => updateDraft("quota", event.target.value)}
                />
                {errors.quota ? <p className="mt-1 text-xs font-semibold text-rose-700">{errors.quota}</p> : null}
              </label>
              <input className="h-10 rounded-md border border-stone-200 bg-brand-cream px-3 text-sm outline-none" placeholder="Harga" value={draft.priceDisplay} onChange={(event) => updateDraft("priceDisplay", event.target.value)} />
            </div>
            <select className="h-10 rounded-md border border-stone-200 bg-white px-3 text-sm outline-none" value={draft.status} onChange={(event) => updateDraft("status", event.target.value)}>
              <option>Draft</option>
              <option>Terjadwal</option>
              <option>Berangkat</option>
              <option>Selesai</option>
            </select>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button className="h-10 rounded-md border border-stone-200 bg-white px-4 text-sm font-bold text-brand-cocoa" type="button" onClick={resetDraft}>
              Reset
            </button>
            <button className="inline-flex h-10 items-center gap-2 rounded-md bg-brand-cocoa px-4 text-sm font-bold text-white" type="button" onClick={saveDraft}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              {isEditing ? "Update" : "Tambah"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
