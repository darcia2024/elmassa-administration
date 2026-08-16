"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Boxes,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
  TriangleAlert,
  X,
} from "lucide-react";

type Item = {
  id: string;
  sku: string;
  name: string;
  category: string;
  unit: string;
  minimumStock: number;
  unitCost: number;
  notes: string;
  stockIn: number;
  stockOut: number;
  stock: number;
  isLow: boolean;
  stockValue: number;
};

type Movement = {
  id: string;
  itemId: string;
  itemName: string;
  movementType: "masuk" | "keluar";
  quantity: number;
  packageName: string;
  notes: string;
  movedAt: string;
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

function formatIDR(value: number) {
  return `Rp ${Math.round(Number(value) || 0).toLocaleString("id-ID")}`;
}

function formatDateID(iso: string) {
  const match = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return iso;
  const [, year, month, day] = match;
  return `${Number(day)} ${MONTHS[Number(month) - 1]} ${year}`;
}

const emptyItemForm = {
  id: "",
  name: "",
  sku: "",
  category: "Perlengkapan Jamaah",
  unit: "pcs",
  minimumStock: "",
  unitCost: "",
  notes: "",
};

const emptyMoveForm = {
  itemId: "",
  movementType: "masuk" as "masuk" | "keluar",
  quantity: "",
  movedAt: "",
  notes: "",
};

export function StokManager() {
  const [items, setItems] = useState<Item[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [tab, setTab] = useState<"barang" | "kartu">("barang");
  const [query, setQuery] = useState("");

  const [itemForm, setItemForm] = useState(emptyItemForm);
  const [isItemFormOpen, setIsItemFormOpen] = useState(false);
  const [moveForm, setMoveForm] = useState(emptyMoveForm);
  const [isMoveFormOpen, setIsMoveFormOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [itemsRes, movesRes] = await Promise.all([
        fetch("/api/inventory/items", { cache: "no-store" }),
        fetch("/api/inventory/movements", { cache: "no-store" }),
      ]);
      const [itemsJson, movesJson] = await Promise.all([itemsRes.json(), movesRes.json()]);

      if (!itemsRes.ok) {
        setLoadError(itemsJson?.error || "Gagal memuat stok");
        return;
      }

      setItems(itemsJson.data ?? []);
      setCategories(itemsJson.meta?.categories ?? []);
      setMovements(movesJson.data ?? []);
      setLoadError("");
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Gagal memuat stok");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) => i.name.toLowerCase().includes(q) || i.sku.toLowerCase().includes(q));
  }, [items, query]);

  const summary = useMemo(
    () => ({
      total: items.length,
      low: items.filter((i) => i.isLow).length,
      units: items.reduce((sum, i) => sum + i.stock, 0),
      value: items.reduce((sum, i) => sum + i.stockValue, 0),
    }),
    [items],
  );

  const submitItem = async () => {
    setIsSaving(true);
    setFormError("");

    try {
      const res = await fetch(itemForm.id ? `/api/inventory/items/${encodeURIComponent(itemForm.id)}` : "/api/inventory/items", {
        method: itemForm.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...itemForm,
          minimumStock: Number(itemForm.minimumStock) || 0,
          unitCost: Number(itemForm.unitCost) || 0,
        }),
      });
      const json = await res.json();

      if (!res.ok) {
        const fieldMessage = json?.fields ? Object.values(json.fields)[0] : null;
        setFormError(String(fieldMessage || json?.error || "Gagal menyimpan barang"));
        return;
      }

      setIsItemFormOpen(false);
      await load();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Gagal menyimpan barang");
    } finally {
      setIsSaving(false);
    }
  };

  const submitMovement = async () => {
    setIsSaving(true);
    setFormError("");

    try {
      const res = await fetch("/api/inventory/movements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...moveForm, quantity: Number(moveForm.quantity) }),
      });
      const json = await res.json();

      if (!res.ok) {
        const fieldMessage = json?.fields ? Object.values(json.fields)[0] : null;
        setFormError(String(fieldMessage || json?.error || "Gagal mencatat pergerakan stok"));
        return;
      }

      setIsMoveFormOpen(false);
      await load();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Gagal mencatat pergerakan stok");
    } finally {
      setIsSaving(false);
    }
  };

  const deleteItem = async (item: Item) => {
    if (!confirm(`Hapus barang "${item.name}" beserta seluruh riwayat stoknya?`)) return;

    setDeletingId(item.id);
    try {
      const res = await fetch(`/api/inventory/items/${encodeURIComponent(item.id)}`, { method: "DELETE" });
      if (res.ok) await load();
    } finally {
      setDeletingId(null);
    }
  };

  const openMove = (type: "masuk" | "keluar", itemId = "") => {
    setMoveForm({ ...emptyMoveForm, movementType: type, itemId, movedAt: new Date().toISOString().slice(0, 10) });
    setFormError("");
    setIsMoveFormOpen(true);
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-stone-200/70 bg-white p-10 text-center shadow-2xs">
        <p className="text-xs font-medium text-stone-500">Memuat stok perlengkapan…</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 font-sans">

      <section className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        {[
          { label: "Jenis Barang", value: `${summary.total}` },
          { label: "Stok Menipis", value: `${summary.low}`, tone: summary.low > 0 ? "text-rose-700" : "text-brand-cocoa" },
          { label: "Total Unit", value: `${summary.units}` },
          { label: "Nilai Stok", value: formatIDR(summary.value) },
        ].map((card) => (
          <article key={card.label} className="rounded-2xl border border-stone-200/70 bg-white p-3.5 shadow-2xs">
            <p className="text-[10px] font-bold uppercase tracking-wide text-stone-400">{card.label}</p>
            <p className={`mt-1 text-sm font-black leading-tight ${card.tone ?? "text-brand-cocoa"}`}>{card.value}</p>
          </article>
        ))}
      </section>

      <section className="rounded-2xl border border-stone-200/70 bg-white p-4 sm:p-5 shadow-2xs space-y-3">

        <header className="flex flex-col gap-3 border-b border-stone-100 pb-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar rounded-xl border border-stone-200 bg-stone-50 p-1 max-w-full">
            {([
              { id: "barang", label: `Daftar Barang (${items.length})` },
              { id: "kartu", label: `Kartu Stok (${movements.length})` },
            ] as const).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`rounded-lg px-3 py-1.5 text-[11px] font-bold whitespace-nowrap transition ${
                  tab === t.id ? "bg-white text-brand-cocoa shadow-2xs" : "text-stone-500 hover:text-stone-900"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-stone-400" strokeWidth={1.5} />
              <input
                type="text"
                placeholder="Cari barang…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-9 w-44 rounded-xl border border-stone-200 bg-stone-50/50 pl-8 pr-3 text-xs font-medium text-brand-cocoa placeholder:text-stone-400 outline-none focus:border-brand-pink focus:bg-white transition"
              />
            </div>

            <button
              type="button"
              onClick={() => openMove("masuk")}
              disabled={items.length === 0}
              className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-3 text-xs font-bold text-emerald-800 hover:bg-emerald-100 disabled:opacity-40 transition"
            >
              <ArrowDownLeft className="h-3.5 w-3.5" strokeWidth={2} /> Masuk
            </button>

            <button
              type="button"
              onClick={() => openMove("keluar")}
              disabled={items.length === 0}
              className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-3 text-xs font-bold text-amber-900 hover:bg-amber-100 disabled:opacity-40 transition"
            >
              <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2} /> Keluar
            </button>

            <button
              type="button"
              onClick={() => {
                setItemForm(emptyItemForm);
                setFormError("");
                setIsItemFormOpen(true);
              }}
              className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-brand-pink px-4 text-xs font-bold text-white shadow-2xs hover:bg-brand-pinkHover transition"
            >
              <Plus className="h-3.5 w-3.5" strokeWidth={2} />
              <span>Barang</span>
            </button>
          </div>
        </header>

        {loadError ? (
          <p className="rounded-xl border border-rose-200 bg-rose-50/60 px-3 py-2 text-[11px] font-semibold text-rose-700">{loadError}</p>
        ) : null}

        {tab === "barang" ? (
          filtered.length === 0 ? (
            <div className="rounded-xl border border-dashed border-stone-300 bg-stone-50/60 p-8 text-center space-y-2">
              <p className="text-xs font-extrabold text-stone-700">
                {items.length === 0 ? "Belum ada barang terdaftar" : "Tidak ada barang yang cocok"}
              </p>
              <p className="text-[11px] text-stone-500">Koper, kain ihram, buku doa, tas serut, bantal leher, dan sejenisnya.</p>
            </div>
          ) : (
            <>
            {/* Kartu mobile -- tabel stok di bawah butuh 860px */}
            <div className="block space-y-3 md:hidden">
              {filtered.map((item) => (
                <div key={item.id} className="space-y-2.5 rounded-2xl border border-stone-200/80 bg-white p-4 shadow-2xs">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h4 className="truncate text-xs font-bold text-brand-cocoa">{item.name}</h4>
                      <p className="truncate text-[10px] text-stone-400">
                        {[item.sku, `min. ${item.minimumStock} ${item.unit}`].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                    <span
                      className={`inline-flex shrink-0 items-center gap-1 text-xs font-black ${item.isLow ? "text-rose-700" : "text-brand-cocoa"}`}
                    >
                      {item.isLow ? <TriangleAlert className="h-3.5 w-3.5" /> : null}
                      {item.stock} {item.unit}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 rounded-xl border border-stone-100 bg-stone-50 p-2.5 text-center text-[11px]">
                    <div>
                      <span className="block text-[10px] font-medium text-stone-400">Masuk</span>
                      <span className="font-bold text-emerald-700">{item.stockIn}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-medium text-stone-400">Keluar</span>
                      <span className="font-bold text-amber-700">{item.stockOut}</span>
                    </div>
                    <div className="min-w-0">
                      <span className="block text-[10px] font-medium text-stone-400">Nilai</span>
                      <span className="block truncate font-bold text-stone-700">{formatIDR(item.stockValue)}</span>
                    </div>
                  </div>

                  <p className="truncate text-[11px] text-stone-500">{item.category}</p>

                  <div className="flex items-center gap-2 border-t border-stone-100 pt-2">
                    <button
                      type="button"
                      onClick={() => openMove("keluar", item.id)}
                      className="inline-flex h-10 flex-1 items-center justify-center rounded-xl border border-stone-200 bg-white text-[11px] font-bold text-stone-600 transition active:bg-stone-100"
                    >
                      Catat Keluar
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setItemForm({
                          ...emptyItemForm,
                          ...item,
                          minimumStock: String(item.minimumStock),
                          unitCost: String(item.unitCost),
                        });
                        setFormError("");
                        setIsItemFormOpen(true);
                      }}
                      className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-stone-200 bg-white text-stone-500 transition active:bg-stone-100"
                      title="Edit"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteItem(item)}
                      disabled={deletingId === item.id}
                      className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-rose-200 bg-rose-50 text-rose-600 transition active:bg-rose-100 disabled:opacity-40"
                      title="Hapus"
                    >
                      {deletingId === item.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="hidden overflow-x-auto rounded-xl border border-stone-200/60 md:block">
              <table className="w-full min-w-[860px] border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-200/60 bg-stone-50/70 text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                    <th className="py-2.5 pl-3 pr-2">Barang</th>
                    <th className="py-2.5 pr-2">Kategori</th>
                    <th className="py-2.5 pr-2 text-right">Masuk</th>
                    <th className="py-2.5 pr-2 text-right">Keluar</th>
                    <th className="py-2.5 pr-2 text-right">Sisa Stok</th>
                    <th className="py-2.5 pr-2 text-right">Nilai</th>
                    <th className="py-2.5 pr-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filtered.map((item) => (
                    <tr key={item.id} className="transition hover:bg-stone-50/60">
                      <td className="py-2.5 pl-3 pr-2">
                        <p className="font-bold text-brand-cocoa">{item.name}</p>
                        <p className="text-[10px] text-stone-400">
                          {[item.sku, `min. ${item.minimumStock} ${item.unit}`].filter(Boolean).join(" · ")}
                        </p>
                      </td>
                      <td className="py-2.5 pr-2 text-stone-600">{item.category}</td>
                      <td className="py-2.5 pr-2 text-right font-semibold text-emerald-700">{item.stockIn}</td>
                      <td className="py-2.5 pr-2 text-right font-semibold text-amber-700">{item.stockOut}</td>
                      <td className="py-2.5 pr-2 text-right">
                        <span className={`inline-flex items-center gap-1 font-black ${item.isLow ? "text-rose-700" : "text-brand-cocoa"}`}>
                          {item.isLow ? <TriangleAlert className="h-3 w-3" /> : null}
                          {item.stock} {item.unit}
                        </span>
                      </td>
                      <td className="py-2.5 pr-2 text-right font-semibold text-stone-700 whitespace-nowrap">
                        {formatIDR(item.stockValue)}
                      </td>
                      <td className="py-2.5 pr-3 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => openMove("keluar", item.id)}
                            className="h-7 rounded-lg border border-stone-200 bg-white px-2 text-[10px] font-bold text-stone-600 hover:bg-stone-100 transition"
                            title="Catat stok keluar"
                          >
                            Keluar
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setItemForm({
                                ...emptyItemForm,
                                ...item,
                                minimumStock: String(item.minimumStock),
                                unitCost: String(item.unitCost),
                              });
                              setFormError("");
                              setIsItemFormOpen(true);
                            }}
                            className="grid h-7 w-7 place-items-center rounded-lg border border-stone-200 bg-white text-stone-500 hover:bg-stone-100 transition"
                            title="Edit"
                          >
                            <Pencil className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteItem(item)}
                            disabled={deletingId === item.id}
                            className="grid h-7 w-7 place-items-center rounded-lg border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 disabled:opacity-40 transition"
                            title="Hapus"
                          >
                            {deletingId === item.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            </>
          )
        ) : movements.length === 0 ? (
          <p className="py-8 text-center text-xs text-stone-500">Belum ada pergerakan stok tercatat.</p>
        ) : (
          <>
          {/* Kartu mobile -- tabel pergerakan di bawah butuh 700px */}
          <div className="block space-y-3 md:hidden">
            {movements.map((m) => (
              <div key={m.id} className="space-y-2.5 rounded-2xl border border-stone-200/80 bg-white p-4 shadow-2xs">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h4 className="truncate text-xs font-bold text-brand-cocoa">{m.itemName}</h4>
                    <p className="text-[10px] text-stone-400">{formatDateID(m.movedAt)}</p>
                  </div>
                  <span
                    className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${
                      m.movementType === "masuk"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                        : "border-amber-200 bg-amber-50 text-amber-900"
                    }`}
                  >
                    {m.movementType === "masuk" ? <ArrowDownLeft className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3" />}
                    {m.movementType}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 rounded-xl border border-stone-100 bg-stone-50 p-2.5 text-[11px]">
                  <div>
                    <span className="block text-[10px] font-medium text-stone-400">Jumlah</span>
                    <span className="font-black text-brand-cocoa">{m.quantity}</span>
                  </div>
                  <div className="min-w-0">
                    <span className="block text-[10px] font-medium text-stone-400">Grup</span>
                    <span className="block truncate text-stone-600">{m.packageName || "—"}</span>
                  </div>
                </div>

                <p className="truncate border-t border-stone-100 pt-1 text-[11px] text-stone-500">{m.notes || "—"}</p>
              </div>
            ))}
          </div>

          <div className="hidden overflow-x-auto rounded-xl border border-stone-200/60 md:block">
            <table className="w-full min-w-[700px] border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-stone-200/60 bg-stone-50/70 text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                  <th className="py-2.5 pl-3 pr-2">Tanggal</th>
                  <th className="py-2.5 pr-2">Barang</th>
                  <th className="py-2.5 pr-2">Jenis</th>
                  <th className="py-2.5 pr-2 text-right">Jumlah</th>
                  <th className="py-2.5 pr-2">Grup</th>
                  <th className="py-2.5 pr-3">Catatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {movements.map((m) => (
                  <tr key={m.id} className="transition hover:bg-stone-50/60">
                    <td className="py-2.5 pl-3 pr-2 whitespace-nowrap font-semibold text-brand-cocoa">{formatDateID(m.movedAt)}</td>
                    <td className="py-2.5 pr-2 text-stone-700">{m.itemName}</td>
                    <td className="py-2.5 pr-2">
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${
                        m.movementType === "masuk"
                          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                          : "border-amber-200 bg-amber-50 text-amber-900"
                      }`}>
                        {m.movementType === "masuk" ? <ArrowDownLeft className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3" />}
                        {m.movementType}
                      </span>
                    </td>
                    <td className="py-2.5 pr-2 text-right font-black text-brand-cocoa">{m.quantity}</td>
                    <td className="py-2.5 pr-2 max-w-[150px] truncate text-stone-600">{m.packageName || "—"}</td>
                    <td className="py-2.5 pr-3 max-w-[180px] truncate text-stone-500">{m.notes || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </>
        )}
      </section>

      {/* Item form */}
      {isItemFormOpen ? (
        <div className="fixed inset-0 z-50 el-modal grid place-items-center bg-stone-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-stone-200 bg-white p-5 sm:p-6 shadow-2xl space-y-4">

            <div className="flex items-start justify-between border-b border-stone-100 pb-3">
              <h3 className="text-sm font-extrabold text-brand-cocoa flex items-center gap-2">
                <Boxes className="h-4 w-4 text-brand-pink" strokeWidth={1.5} />
                {itemForm.id ? "Edit Barang" : "Tambah Barang"}
              </h3>
              <button
                type="button"
                onClick={() => setIsItemFormOpen(false)}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-stone-200 bg-stone-50 text-stone-500 hover:bg-stone-100 transition"
              >
                <X className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {([
                ["name", "Nama Barang", "text", "Koper Bagasi 24 inch"],
                ["sku", "Kode / SKU", "text", "KPR-24"],
                ["unit", "Satuan", "text", "pcs"],
                ["minimumStock", "Stok Minimum", "number", "10"],
                ["unitCost", "Harga Satuan (Rp)", "number", "450000"],
              ] as const).map(([key, label, type, placeholder]) => (
                <label key={key} className="space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wide text-stone-500">{label}</span>
                  <input
                    type={type}
                    value={itemForm[key]}
                    placeholder={placeholder}
                    onChange={(e) => setItemForm((prev) => ({ ...prev, [key]: e.target.value }))}
                    className="w-full h-9 rounded-xl border border-stone-200 bg-stone-50/50 px-3 text-xs font-medium text-brand-cocoa placeholder:text-stone-400 outline-none focus:border-brand-pink focus:bg-white transition"
                  />
                </label>
              ))}

              <label className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wide text-stone-500">Kategori</span>
                <select
                  value={itemForm.category}
                  onChange={(e) => setItemForm((prev) => ({ ...prev, category: e.target.value }))}
                  className="w-full h-9 rounded-xl border border-stone-200 bg-stone-50/50 px-2.5 text-xs font-medium text-brand-cocoa outline-none focus:border-brand-pink focus:bg-white transition"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </label>
            </div>

            {formError ? (
              <p className="rounded-xl border border-rose-200 bg-rose-50/60 px-3 py-2 text-[11px] font-semibold text-rose-700">{formError}</p>
            ) : null}

            <div className="flex items-center gap-2 border-t border-stone-100 pt-3">
              <button
                type="button"
                onClick={submitItem}
                disabled={isSaving}
                className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-brand-pink px-4 text-xs font-bold text-white shadow-2xs hover:bg-brand-pinkHover disabled:opacity-40 transition"
              >
                {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                <span>{isSaving ? "Menyimpan…" : itemForm.id ? "Simpan Perubahan" : "Tambah Barang"}</span>
              </button>
              <button
                type="button"
                onClick={() => setIsItemFormOpen(false)}
                className="inline-flex h-9 items-center rounded-xl border border-stone-200 bg-stone-50 px-3.5 text-xs font-bold text-stone-600 hover:bg-stone-100 transition"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Movement form */}
      {isMoveFormOpen ? (
        <div className="fixed inset-0 z-50 el-modal grid place-items-center bg-stone-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-5 sm:p-6 shadow-2xl space-y-4">

            <div className="flex items-start justify-between border-b border-stone-100 pb-3">
              <h3 className="text-sm font-extrabold text-brand-cocoa">
                Catat Stok {moveForm.movementType === "masuk" ? "Masuk" : "Keluar"}
              </h3>
              <button
                type="button"
                onClick={() => setIsMoveFormOpen(false)}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-stone-200 bg-stone-50 text-stone-500 hover:bg-stone-100 transition"
              >
                <X className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>

            <label className="block space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wide text-stone-500">Barang</span>
              <select
                value={moveForm.itemId}
                onChange={(e) => setMoveForm((prev) => ({ ...prev, itemId: e.target.value }))}
                className="w-full h-9 rounded-xl border border-stone-200 bg-stone-50/50 px-2.5 text-xs font-medium text-brand-cocoa outline-none focus:border-brand-pink focus:bg-white transition"
              >
                <option value="">— Pilih barang —</option>
                {items.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.name} (sisa {i.stock} {i.unit})
                  </option>
                ))}
              </select>
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wide text-stone-500">Jumlah</span>
                <input
                  type="number"
                  min={1}
                  value={moveForm.quantity}
                  onChange={(e) => setMoveForm((prev) => ({ ...prev, quantity: e.target.value }))}
                  placeholder="39"
                  className="w-full h-9 rounded-xl border border-stone-200 bg-stone-50/50 px-3 text-xs font-medium text-brand-cocoa placeholder:text-stone-400 outline-none focus:border-brand-pink focus:bg-white transition"
                />
              </label>

              <label className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wide text-stone-500">Tanggal</span>
                <input
                  type="date"
                  value={moveForm.movedAt}
                  onChange={(e) => setMoveForm((prev) => ({ ...prev, movedAt: e.target.value }))}
                  className="w-full h-9 rounded-xl border border-stone-200 bg-stone-50/50 px-2.5 text-xs font-medium text-brand-cocoa outline-none focus:border-brand-pink focus:bg-white transition"
                />
              </label>
            </div>

            <label className="block space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wide text-stone-500">Catatan</span>
              <input
                type="text"
                value={moveForm.notes}
                onChange={(e) => setMoveForm((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder="Dibagikan ke rombongan Oktober"
                className="w-full h-9 rounded-xl border border-stone-200 bg-stone-50/50 px-3 text-xs font-medium text-brand-cocoa placeholder:text-stone-400 outline-none focus:border-brand-pink focus:bg-white transition"
              />
            </label>

            {formError ? (
              <p className="rounded-xl border border-rose-200 bg-rose-50/60 px-3 py-2 text-[11px] font-semibold text-rose-700">{formError}</p>
            ) : null}

            <div className="flex items-center gap-2 border-t border-stone-100 pt-3">
              <button
                type="button"
                onClick={submitMovement}
                disabled={isSaving}
                className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-brand-pink px-4 text-xs font-bold text-white shadow-2xs hover:bg-brand-pinkHover disabled:opacity-40 transition"
              >
                {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                <span>{isSaving ? "Menyimpan…" : "Catat"}</span>
              </button>
              <button
                type="button"
                onClick={() => setIsMoveFormOpen(false)}
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
