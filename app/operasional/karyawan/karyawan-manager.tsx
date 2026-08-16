"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { BadgeCheck, Loader2, Pencil, Plus, Search, Trash2, Users, X } from "lucide-react";

type Employee = {
  id: string;
  employeeNumber: string;
  name: string;
  nik: string;
  position: string;
  division: string;
  joinDate: string | null;
  employmentStatus: string;
  salary: number;
  phone: string;
  email: string;
  address: string;
  emergencyContact: string;
  emergencyPhone: string;
  status: string;
  notes: string;
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

function formatIDR(value: number) {
  return `Rp ${Math.round(Number(value) || 0).toLocaleString("id-ID")}`;
}

function formatDateID(iso: string | null) {
  if (!iso) return "—";
  const match = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return iso;
  const [, year, month, day] = match;
  return `${Number(day)} ${MONTHS[Number(month) - 1]} ${year}`;
}

const emptyForm = {
  id: "",
  employeeNumber: "",
  name: "",
  nik: "",
  position: "",
  division: "",
  joinDate: "",
  employmentStatus: "Kontrak",
  salary: "",
  phone: "",
  email: "",
  address: "",
  emergencyContact: "",
  emergencyPhone: "",
  status: "Aktif",
  notes: "",
};

const STATUS_STYLES: Record<string, string> = {
  Aktif: "border-emerald-200 bg-emerald-50 text-emerald-800",
  Cuti: "border-amber-200 bg-amber-50 text-amber-800",
  Nonaktif: "border-stone-200 bg-stone-100 text-stone-600",
};

export function KaryawanManager() {
  const [rows, setRows] = useState<Employee[]>([]);
  const [meta, setMeta] = useState<{ employmentStatuses: string[]; statuses: string[] }>({
    employmentStatuses: [],
    statuses: [],
  });
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
      const res = await fetch("/api/employees", { cache: "no-store" });
      const json = await res.json();

      if (!res.ok) {
        setLoadError(json?.error || "Gagal memuat data karyawan");
        return;
      }

      setRows(json.data ?? []);
      setMeta({
        employmentStatuses: json.meta?.employmentStatuses ?? ["Tetap", "Kontrak", "Harian", "Magang"],
        statuses: json.meta?.statuses ?? ["Aktif", "Cuti", "Nonaktif"],
      });
      setLoadError("");
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Gagal memuat data karyawan");
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
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.position.toLowerCase().includes(q) ||
        r.division.toLowerCase().includes(q) ||
        r.employeeNumber.toLowerCase().includes(q),
    );
  }, [rows, query]);

  const summary = useMemo(
    () => ({
      total: rows.length,
      aktif: rows.filter((r) => r.status === "Aktif").length,
      tetap: rows.filter((r) => r.employmentStatus === "Tetap").length,
      payroll: rows.filter((r) => r.status === "Aktif").reduce((sum, r) => sum + r.salary, 0),
    }),
    [rows],
  );

  const openCreate = () => {
    setForm(emptyForm);
    setFormError("");
    setIsFormOpen(true);
  };

  const openEdit = (row: Employee) => {
    setForm({
      ...emptyForm,
      ...row,
      joinDate: row.joinDate ?? "",
      salary: String(row.salary || ""),
    });
    setFormError("");
    setIsFormOpen(true);
  };

  const handleSubmit = async () => {
    setIsSaving(true);
    setFormError("");

    const payload = { ...form, salary: Number(form.salary) || 0, joinDate: form.joinDate || null };

    try {
      const res = await fetch(form.id ? `/api/employees/${encodeURIComponent(form.id)}` : "/api/employees", {
        method: form.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (!res.ok) {
        const fieldMessage = json?.fields ? Object.values(json.fields)[0] : null;
        setFormError(String(fieldMessage || json?.error || "Gagal menyimpan karyawan"));
        return;
      }

      setIsFormOpen(false);
      await load();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Gagal menyimpan karyawan");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (row: Employee) => {
    if (!confirm(`Hapus data karyawan "${row.name}"?`)) return;

    setDeletingId(row.id);
    try {
      const res = await fetch(`/api/employees/${encodeURIComponent(row.id)}`, { method: "DELETE" });
      if (res.ok) await load();
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-stone-200/70 bg-white p-10 text-center shadow-2xs">
        <p className="text-xs font-medium text-stone-500">Memuat data karyawan…</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 font-sans">

      <section className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        {[
          { label: "Total Karyawan", value: `${summary.total}` },
          { label: "Aktif", value: `${summary.aktif}` },
          { label: "Karyawan Tetap", value: `${summary.tetap}` },
          { label: "Payroll Bulanan", value: formatIDR(summary.payroll) },
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
              <Users className="h-4 w-4 text-brand-pink" strokeWidth={1.5} />
              <span>Data Kepegawaian</span>
            </h2>
            <p className="text-[11px] text-stone-500 mt-0.5">
              Terpisah dari akun login di Pengaturan &gt; Staf — karyawan tanpa akun sistem tetap tercatat di sini.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-stone-400" strokeWidth={1.5} />
              <input
                type="text"
                placeholder="Cari nama / jabatan / divisi…"
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
              <span>Tambah Karyawan</span>
            </button>
          </div>
        </header>

        {loadError ? (
          <p className="rounded-xl border border-rose-200 bg-rose-50/60 px-3 py-2 text-[11px] font-semibold text-rose-700">{loadError}</p>
        ) : null}

        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-stone-300 bg-stone-50/60 p-8 text-center space-y-2">
            <p className="text-xs font-extrabold text-stone-700">
              {rows.length === 0 ? "Belum ada data karyawan" : "Tidak ada karyawan yang cocok"}
            </p>
            <p className="text-[11px] text-stone-500">Catat jabatan, divisi, status kontrak, dan gaji tiap karyawan.</p>
          </div>
        ) : (
          <>
          {/* Kartu mobile -- tabel karyawan di bawah butuh 900px */}
          <div className="block space-y-3 md:hidden">
            {filtered.map((row) => (
              <div key={row.id} className="space-y-2.5 rounded-2xl border border-stone-200/80 bg-white p-4 shadow-2xs">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h4 className="truncate text-xs font-bold text-brand-cocoa">{row.name}</h4>
                    <p className="truncate text-[10px] text-stone-400">
                      {[row.employeeNumber, row.phone].filter(Boolean).join(" · ") || "—"}
                    </p>
                  </div>
                  <span
                    className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${STATUS_STYLES[row.status] ?? STATUS_STYLES.Nonaktif}`}
                  >
                    {row.status === "Aktif" ? <BadgeCheck className="h-3 w-3" /> : null}
                    {row.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 rounded-xl border border-stone-100 bg-stone-50 p-2.5 text-[11px]">
                  <div className="min-w-0">
                    <span className="block text-[10px] font-medium text-stone-400">Jabatan</span>
                    <span className="block truncate text-stone-700">{row.position || "—"}</span>
                  </div>
                  <div className="min-w-0">
                    <span className="block text-[10px] font-medium text-stone-400">Divisi</span>
                    <span className="block truncate text-stone-700">{row.division || "—"}</span>
                  </div>
                  <div className="min-w-0">
                    <span className="block text-[10px] font-medium text-stone-400">Gaji</span>
                    <span className="block truncate font-bold text-brand-cocoa">
                      {row.salary > 0 ? formatIDR(row.salary) : "—"}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <span className="block text-[10px] font-medium text-stone-400">Masuk</span>
                    <span className="block truncate text-stone-700">{formatDateID(row.joinDate)}</span>
                    <span className="mt-0.5 inline-flex rounded-full border border-stone-200 bg-white px-1.5 py-0.5 text-[10px] font-bold text-stone-700">
                      {row.employmentStatus}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 border-t border-stone-100 pt-2">
                  <button
                    type="button"
                    onClick={() => openEdit(row)}
                    className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl border border-stone-200 bg-white text-[11px] font-bold text-stone-700 transition active:bg-stone-100"
                  >
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(row)}
                    disabled={deletingId === row.id}
                    className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 text-[11px] font-bold text-rose-600 transition active:bg-rose-100 disabled:opacity-40"
                  >
                    {deletingId === row.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                    Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden overflow-x-auto rounded-xl border border-stone-200/60 md:block">
            <table className="w-full min-w-[900px] border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-stone-200/60 bg-stone-50/70 text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                  <th className="py-2.5 pl-3 pr-2">Karyawan</th>
                  <th className="py-2.5 pr-2">Jabatan</th>
                  <th className="py-2.5 pr-2">Divisi</th>
                  <th className="py-2.5 pr-2">Masuk</th>
                  <th className="py-2.5 pr-2">Kontrak</th>
                  <th className="py-2.5 pr-2 text-right">Gaji</th>
                  <th className="py-2.5 pr-2">Status</th>
                  <th className="py-2.5 pr-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filtered.map((row) => (
                  <tr key={row.id} className="transition hover:bg-stone-50/60">
                    <td className="py-2.5 pl-3 pr-2">
                      <p className="font-bold text-brand-cocoa">{row.name}</p>
                      <p className="text-[10px] text-stone-400">
                        {[row.employeeNumber, row.phone].filter(Boolean).join(" · ") || "—"}
                      </p>
                    </td>
                    <td className="py-2.5 pr-2 text-stone-700">{row.position || "—"}</td>
                    <td className="py-2.5 pr-2 text-stone-600">{row.division || "—"}</td>
                    <td className="py-2.5 pr-2 whitespace-nowrap text-stone-600">{formatDateID(row.joinDate)}</td>
                    <td className="py-2.5 pr-2">
                      <span className="rounded-full border border-stone-200 bg-stone-50 px-2 py-0.5 text-[10px] font-bold text-stone-700">
                        {row.employmentStatus}
                      </span>
                    </td>
                    <td className="py-2.5 pr-2 text-right font-bold text-brand-cocoa whitespace-nowrap">
                      {row.salary > 0 ? formatIDR(row.salary) : "—"}
                    </td>
                    <td className="py-2.5 pr-2">
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${STATUS_STYLES[row.status] ?? STATUS_STYLES.Nonaktif}`}>
                        {row.status === "Aktif" ? <BadgeCheck className="h-3 w-3" /> : null}
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
          </>
        )}
      </section>

      {isFormOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-stone-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-stone-200 bg-white p-5 sm:p-6 shadow-2xl space-y-4">

            <div className="flex items-start justify-between border-b border-stone-100 pb-3">
              <h3 className="text-sm font-extrabold text-brand-cocoa">
                {form.id ? "Edit Data Karyawan" : "Tambah Karyawan"}
              </h3>
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
                ["name", "Nama Lengkap", "text", "Zubaidah Rahman"],
                ["employeeNumber", "No. Karyawan", "text", "EMT-007"],
                ["nik", "NIK", "text", "1901025508820001"],
                ["position", "Jabatan", "text", "Kasir Keuangan"],
                ["division", "Divisi", "text", "Keuangan"],
                ["joinDate", "Tanggal Masuk", "date", ""],
                ["salary", "Gaji Bulanan (Rp)", "number", "4500000"],
                ["phone", "No. HP", "text", "081277712345"],
                ["email", "Email", "text", "zubaidah@elmassa.test"],
                ["emergencyContact", "Kontak Darurat", "text", "Hj. Marlina"],
                ["emergencyPhone", "HP Kontak Darurat", "text", "081399987654"],
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
                <span className="text-[11px] font-bold uppercase tracking-wide text-stone-500">Status Kontrak</span>
                <select
                  value={form.employmentStatus}
                  onChange={(e) => setForm((prev) => ({ ...prev, employmentStatus: e.target.value }))}
                  className="w-full h-9 rounded-xl border border-stone-200 bg-stone-50/50 px-2.5 text-xs font-medium text-brand-cocoa outline-none focus:border-brand-pink focus:bg-white transition"
                >
                  {meta.employmentStatuses.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </label>

              <label className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wide text-stone-500">Status Karyawan</span>
                <select
                  value={form.status}
                  onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
                  className="w-full h-9 rounded-xl border border-stone-200 bg-stone-50/50 px-2.5 text-xs font-medium text-brand-cocoa outline-none focus:border-brand-pink focus:bg-white transition"
                >
                  {meta.statuses.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </label>
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
                <span>{isSaving ? "Menyimpan…" : form.id ? "Simpan Perubahan" : "Tambah Karyawan"}</span>
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
