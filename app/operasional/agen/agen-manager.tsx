"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Handshake, Loader2, Pencil, Plus, Search, Trash2, X } from "lucide-react";

type Agent = {
  id: string;
  agentCode: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  commissionType: string;
  commissionValue: number;
  bankName: string;
  bankAccount: string;
  status: string;
  notes: string;
  bookingCount: number;
  jamaahCount: number;
  grossValue: number;
  estimatedCommission: number;
};

function formatIDR(value: number) {
  return `Rp ${Math.round(Number(value) || 0).toLocaleString("id-ID")}`;
}

const emptyForm = {
  id: "",
  agentCode: "",
  name: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  commissionType: "nominal",
  commissionValue: "",
  bankName: "",
  bankAccount: "",
  status: "Aktif",
  notes: "",
};

export function AgenManager() {
  const [rows, setRows] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [query, setQuery] = useState("");

  const [form, setForm] = useState(emptyForm);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/agents", { cache: "no-store" });
      const json = await res.json();

      if (!res.ok) {
        setLoadError(json?.error || "Gagal memuat data agen");
        return;
      }

      setRows(json.data ?? []);
      setLoadError("");
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Gagal memuat data agen");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) => r.name.toLowerCase().includes(q) || r.agentCode.toLowerCase().includes(q) || r.city.toLowerCase().includes(q),
    );
  }, [rows, query]);

  const summary = useMemo(
    () => ({
      total: rows.length,
      aktif: rows.filter((r) => r.status === "Aktif").length,
      jamaah: rows.reduce((sum, r) => sum + r.jamaahCount, 0),
      komisi: rows.reduce((sum, r) => sum + r.estimatedCommission, 0),
    }),
    [rows],
  );

  const openEdit = (row: Agent) => {
    setForm({ ...emptyForm, ...row, commissionValue: String(row.commissionValue || "") });
    setFormError("");
    setIsFormOpen(true);
  };

  const handleSubmit = async () => {
    setIsSaving(true);
    setFormError("");

    try {
      const res = await fetch(form.id ? `/api/agents/${encodeURIComponent(form.id)}` : "/api/agents", {
        method: form.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, commissionValue: Number(form.commissionValue) || 0 }),
      });
      const json = await res.json();

      if (!res.ok) {
        const fieldMessage = json?.fields ? Object.values(json.fields)[0] : null;
        setFormError(String(fieldMessage || json?.error || "Gagal menyimpan agen"));
        return;
      }

      setIsFormOpen(false);
      await load();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Gagal menyimpan agen");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (row: Agent) => {
    if (!confirm(`Hapus agen "${row.name}"?`)) return;

    setDeletingId(row.id);
    try {
      const res = await fetch(`/api/agents/${encodeURIComponent(row.id)}`, { method: "DELETE" });
      if (res.ok) await load();
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-stone-200/70 bg-white p-10 text-center shadow-2xs">
        <p className="text-xs font-medium text-stone-500">Memuat data agen…</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 font-sans">

      <section className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        {[
          { label: "Total Agen", value: `${summary.total}` },
          { label: "Agen Aktif", value: `${summary.aktif}` },
          { label: "Jamaah Direkrut", value: `${summary.jamaah} Pax` },
          { label: "Estimasi Komisi", value: formatIDR(summary.komisi) },
        ].map((card) => (
          <article key={card.label} className="rounded-2xl border border-stone-200/70 bg-white p-3.5 shadow-2xs">
            <p className="text-[10px] font-bold uppercase tracking-wide text-stone-400">{card.label}</p>
            <p className="mt-1 text-sm font-black text-brand-cocoa leading-tight">{card.value}</p>
          </article>
        ))}
      </section>

      <section className="rounded-2xl border border-stone-200/70 bg-white p-4 sm:p-5 shadow-2xs space-y-3">

        <header className="flex flex-col gap-3 border-b border-stone-100 pb-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-sm font-extrabold text-brand-cocoa flex items-center gap-2">
              <Handshake className="h-4 w-4 text-brand-pink" strokeWidth={1.5} />
              <span>Agen & Mitra Perekrut</span>
            </h2>
            <p className="text-[11px] text-stone-500 mt-0.5">
              Jumlah rekrutan & komisi dihitung dari booking yang memakai kode agen — bukan angka yang diketik manual.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-stone-400" strokeWidth={1.5} />
              <input
                type="text"
                placeholder="Cari nama / kode agen / kota…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-9 w-56 rounded-xl border border-stone-200 bg-stone-50/50 pl-8 pr-3 text-xs font-medium text-brand-cocoa placeholder:text-stone-400 outline-none focus:border-brand-pink focus:bg-white transition"
              />
            </div>

            <button
              type="button"
              onClick={() => {
                setForm(emptyForm);
                setFormError("");
                setIsFormOpen(true);
              }}
              className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-brand-pink px-4 text-xs font-bold text-white shadow-2xs hover:bg-brand-pinkHover transition"
            >
              <Plus className="h-3.5 w-3.5" strokeWidth={2} />
              <span>Tambah Agen</span>
            </button>
          </div>
        </header>

        {loadError ? (
          <p className="rounded-xl border border-rose-200 bg-rose-50/60 px-3 py-2 text-[11px] font-semibold text-rose-700">{loadError}</p>
        ) : null}

        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-stone-300 bg-stone-50/60 p-8 text-center space-y-2">
            <p className="text-xs font-extrabold text-stone-700">
              {rows.length === 0 ? "Belum ada agen terdaftar" : "Tidak ada agen yang cocok"}
            </p>
            <p className="text-[11px] text-stone-500 max-w-md mx-auto">
              Setelah agen dibuat, isi <b>kode agen</b> pada booking jamaah agar rekrutan & komisinya terhitung otomatis.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-stone-200/60">
            <table className="w-full min-w-[900px] border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-stone-200/60 bg-stone-50/70 text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                  <th className="py-2.5 pl-3 pr-2">Agen</th>
                  <th className="py-2.5 pr-2">Kode</th>
                  <th className="py-2.5 pr-2">Kota</th>
                  <th className="py-2.5 pr-2">Skema Komisi</th>
                  <th className="py-2.5 pr-2 text-right">Rekrutan</th>
                  <th className="py-2.5 pr-2 text-right">Estimasi Komisi</th>
                  <th className="py-2.5 pr-2">Status</th>
                  <th className="py-2.5 pr-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filtered.map((row) => (
                  <tr key={row.id} className="transition hover:bg-stone-50/60">
                    <td className="py-2.5 pl-3 pr-2">
                      <p className="font-bold text-brand-cocoa">{row.name}</p>
                      <p className="text-[10px] text-stone-400">{row.phone || "—"}</p>
                    </td>
                    <td className="py-2.5 pr-2 font-mono font-bold text-stone-700">{row.agentCode || "—"}</td>
                    <td className="py-2.5 pr-2 text-stone-600">{row.city || "—"}</td>
                    <td className="py-2.5 pr-2 text-stone-700">
                      {row.commissionType === "persen"
                        ? `${row.commissionValue}% dari omzet`
                        : `${formatIDR(row.commissionValue)} / jamaah`}
                    </td>
                    <td className="py-2.5 pr-2 text-right text-stone-700 whitespace-nowrap">
                      {row.jamaahCount} pax
                      <span className="block text-[10px] text-stone-400">{row.bookingCount} booking</span>
                    </td>
                    <td className="py-2.5 pr-2 text-right font-black text-emerald-700 whitespace-nowrap">
                      {formatIDR(row.estimatedCommission)}
                    </td>
                    <td className="py-2.5 pr-2">
                      <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold ${
                        row.status === "Aktif"
                          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                          : "border-stone-200 bg-stone-100 text-stone-600"
                      }`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="py-2.5 pr-3 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => openEdit(row)}
                          className="grid h-7 w-7 place-items-center rounded-lg border border-stone-200 bg-white text-stone-500 hover:bg-stone-100 transition"
                          title="Edit"
                        >
                          <Pencil className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(row)}
                          disabled={deletingId === row.id}
                          className="grid h-7 w-7 place-items-center rounded-lg border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 disabled:opacity-40 transition"
                          title="Hapus"
                        >
                          {deletingId === row.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {isFormOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-stone-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-stone-200 bg-white p-5 sm:p-6 shadow-2xl space-y-4">

            <div className="flex items-start justify-between border-b border-stone-100 pb-3">
              <h3 className="text-sm font-extrabold text-brand-cocoa">{form.id ? "Edit Agen" : "Tambah Agen"}</h3>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-stone-200 bg-stone-50 text-stone-500 hover:bg-stone-100 transition"
              >
                <X className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {([
                ["name", "Nama Agen", "text", "Ustadz Hendra Wijaya"],
                ["agentCode", "Kode Agen", "text", "AG-PGK-01"],
                ["phone", "No. HP", "text", "081277712345"],
                ["email", "Email", "text", "hendra@example.com"],
                ["city", "Kota", "text", "Pangkalpinang"],
                ["commissionValue", "Nilai Komisi", "number", "750000"],
                ["bankName", "Bank", "text", "BSI"],
                ["bankAccount", "No. Rekening", "text", "7001234567"],
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

              <label className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wide text-stone-500">Tipe Komisi</span>
                <select
                  value={form.commissionType}
                  onChange={(e) => setForm((prev) => ({ ...prev, commissionType: e.target.value }))}
                  className="w-full h-9 rounded-xl border border-stone-200 bg-stone-50/50 px-2.5 text-xs font-medium text-brand-cocoa outline-none focus:border-brand-pink focus:bg-white transition"
                >
                  <option value="nominal">Nominal per jamaah</option>
                  <option value="persen">Persen dari omzet</option>
                </select>
              </label>

              <label className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wide text-stone-500">Status</span>
                <select
                  value={form.status}
                  onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
                  className="w-full h-9 rounded-xl border border-stone-200 bg-stone-50/50 px-2.5 text-xs font-medium text-brand-cocoa outline-none focus:border-brand-pink focus:bg-white transition"
                >
                  <option value="Aktif">Aktif</option>
                  <option value="Nonaktif">Nonaktif</option>
                </select>
              </label>
            </div>

            <label className="block space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wide text-stone-500">Alamat</span>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))}
                placeholder="Jl. Merdeka No. 12, Pangkalpinang"
                className="w-full h-9 rounded-xl border border-stone-200 bg-stone-50/50 px-3 text-xs font-medium text-brand-cocoa placeholder:text-stone-400 outline-none focus:border-brand-pink focus:bg-white transition"
              />
            </label>

            {formError ? (
              <p className="rounded-xl border border-rose-200 bg-rose-50/60 px-3 py-2 text-[11px] font-semibold text-rose-700">{formError}</p>
            ) : null}

            <div className="flex items-center gap-2 border-t border-stone-100 pt-3">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSaving}
                className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-brand-pink px-4 text-xs font-bold text-white shadow-2xs hover:bg-brand-pinkHover disabled:opacity-40 transition"
              >
                {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                <span>{isSaving ? "Menyimpan…" : form.id ? "Simpan Perubahan" : "Tambah Agen"}</span>
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
