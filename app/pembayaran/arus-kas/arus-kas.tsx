"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowDownCircle,
  ArrowUpCircle,
  Loader2,
  Plus,
  Trash2,
  Wallet,
  X,
} from "lucide-react";
import Link from "next/link";

type ExpenseRow = {
  id: string;
  date: string;
  category: string;
  description: string;
  amount: number;
  method: string;
  referenceNumber: string;
  packageName: string;
  notes: string;
};

type ReceivableRow = {
  bookingCode: string;
  customer: string;
  packageName: string;
  remaining: number;
  dueDate: string | null;
  ageDays: number;
  priority: "Tinggi" | "Normal";
};

type Cashflow = {
  totalPemasukan: number;
  totalPengeluaran: number;
  selisih: number;
  months: Array<{ month: string; pemasukan: number; pengeluaran: number; selisih: number }>;
  byCategory: Array<{ category: string; total: number }>;
  piutang: {
    rows: ReceivableRow[];
    count: number;
    outstanding: number;
    overdueCount: number;
    overdueAmount: number;
  };
};

const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
];

function formatIDR(value: number): string {
  return `Rp ${Math.round(Number(value) || 0).toLocaleString("id-ID")}`;
}

function formatMonth(ym: string): string {
  const [year, month] = ym.split("-");
  return `${MONTH_LABELS[Number(month) - 1] ?? month} ${year}`;
}

function formatDateID(iso: string | null): string {
  if (!iso) return "—";
  const match = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return iso;
  const [, year, month, day] = match;
  return `${Number(day)} ${MONTH_LABELS[Number(month) - 1]} ${year}`;
}

const emptyForm = {
  date: "",
  category: "Operasional Kantor",
  description: "",
  amount: "",
  method: "Transfer",
  referenceNumber: "",
  notes: "",
};

export function ArusKas() {
  const [cashflow, setCashflow] = useState<Cashflow | null>(null);
  const [expenses, setExpenses] = useState<ExpenseRow[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [tab, setTab] = useState<"ringkasan" | "pengeluaran" | "piutang">("ringkasan");

  const [form, setForm] = useState(emptyForm);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [flowRes, expenseRes] = await Promise.all([
        fetch("/api/expenses/cashflow", { cache: "no-store" }),
        fetch("/api/expenses", { cache: "no-store" }),
      ]);
      const [flowJson, expenseJson] = await Promise.all([flowRes.json(), expenseRes.json()]);

      if (!flowRes.ok) {
        setLoadError(flowJson?.error || "Gagal memuat arus kas");
        return;
      }

      setCashflow(flowJson.data);
      setExpenses(expenseJson.data ?? []);
      setCategories(expenseJson.meta?.categories ?? []);
      setLoadError("");
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Gagal memuat arus kas");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  /** Bar heights are relative to the biggest single value across both series. */
  const chartMax = useMemo(() => {
    if (!cashflow) return 1;
    return Math.max(1, ...cashflow.months.flatMap((m) => [m.pemasukan, m.pengeluaran]));
  }, [cashflow]);

  const handleSubmit = async () => {
    setIsSaving(true);
    setFormError("");

    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, amount: Number(form.amount) }),
      });
      const json = await res.json();

      if (!res.ok) {
        const fieldMessage = json?.fields ? Object.values(json.fields)[0] : null;
        setFormError(String(fieldMessage || json?.error || "Gagal menyimpan pengeluaran"));
        return;
      }

      setIsFormOpen(false);
      setForm(emptyForm);
      await load();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Gagal menyimpan pengeluaran");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (row: ExpenseRow) => {
    if (!confirm(`Hapus pengeluaran "${row.description}" (${formatIDR(row.amount)})?`)) return;

    setDeletingId(row.id);
    try {
      const res = await fetch(`/api/expenses/${encodeURIComponent(row.id)}`, { method: "DELETE" });
      if (res.ok) await load();
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-stone-200/70 bg-white p-10 text-center shadow-2xs">
        <p className="text-xs font-medium text-stone-500">Memuat arus kas…</p>
      </div>
    );
  }

  if (loadError || !cashflow) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-6 text-center shadow-2xs">
        <p className="text-xs font-bold text-rose-800">{loadError || "Data tidak tersedia"}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 font-sans">

      {/* KPI */}
      <section className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        {[
          { label: "Total Pemasukan", value: formatIDR(cashflow.totalPemasukan), tone: "text-emerald-700", icon: ArrowUpCircle },
          { label: "Total Pengeluaran", value: formatIDR(cashflow.totalPengeluaran), tone: "text-rose-700", icon: ArrowDownCircle },
          { label: "Selisih Kas", value: formatIDR(cashflow.selisih), tone: cashflow.selisih >= 0 ? "text-brand-cocoa" : "text-rose-700", icon: Wallet },
          { label: "Piutang Berjalan", value: formatIDR(cashflow.piutang.outstanding), tone: "text-brand-pink", icon: AlertTriangle },
        ].map((card) => (
          <article key={card.label} className="rounded-2xl border border-stone-200/70 bg-white p-3.5 shadow-2xs">
            <p className="text-[10px] font-bold uppercase tracking-wide text-stone-400 flex items-center gap-1">
              <card.icon className="h-3 w-3" strokeWidth={1.5} /> {card.label}
            </p>
            <p className={`mt-1 text-sm font-black leading-tight ${card.tone}`}>{card.value}</p>
          </article>
        ))}
      </section>

      <section className="rounded-2xl border border-stone-200/70 bg-white p-4 sm:p-5 shadow-2xs space-y-4">

        <header className="flex flex-col gap-3 border-b border-stone-100 pb-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar rounded-xl border border-stone-200 bg-stone-50 p-1 max-w-full">
            {([
              { id: "ringkasan", label: "Ringkasan Bulanan" },
              { id: "pengeluaran", label: `Pengeluaran (${expenses.length})` },
              { id: "piutang", label: `Piutang & Jatuh Tempo (${cashflow.piutang.count})` },
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

          <button
            type="button"
            onClick={() => {
              setForm({ ...emptyForm, date: new Date().toISOString().slice(0, 10) });
              setFormError("");
              setIsFormOpen(true);
            }}
            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-xl bg-brand-pink px-4 text-xs font-bold text-white shadow-2xs hover:bg-brand-pinkHover transition"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={2} />
            <span>Catat Pengeluaran</span>
          </button>
        </header>

        {tab === "ringkasan" ? (
          cashflow.months.length === 0 ? (
            <p className="py-8 text-center text-xs text-stone-500">
              Belum ada pemasukan maupun pengeluaran tercatat.
            </p>
          ) : (
            <div className="space-y-4">
              <p className="text-[11px] text-stone-500">
                Pemasukan dihitung dari pembayaran jamaah yang tercatat di Kasir — bukan angka terpisah.
              </p>

              {/* Monthly bars */}
              <div className="space-y-2.5">
                {cashflow.months.map((m) => (
                  <div key={m.month} className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-brand-cocoa">{formatMonth(m.month)}</span>
                      <span className={`font-bold ${m.selisih >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
                        {m.selisih >= 0 ? "+" : ""}{formatIDR(m.selisih)}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-14 shrink-0 text-[10px] font-semibold text-stone-500">Masuk</span>
                        <div className="h-3.5 flex-1 overflow-hidden rounded-full bg-stone-100">
                          <div className="h-full rounded-full bg-emerald-500" style={{ width: `${(m.pemasukan / chartMax) * 100}%` }} />
                        </div>
                        <span className="w-32 shrink-0 text-right text-[10px] font-bold text-emerald-700">{formatIDR(m.pemasukan)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-14 shrink-0 text-[10px] font-semibold text-stone-500">Keluar</span>
                        <div className="h-3.5 flex-1 overflow-hidden rounded-full bg-stone-100">
                          <div className="h-full rounded-full bg-rose-400" style={{ width: `${(m.pengeluaran / chartMax) * 100}%` }} />
                        </div>
                        <span className="w-32 shrink-0 text-right text-[10px] font-bold text-rose-700">{formatIDR(m.pengeluaran)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {cashflow.byCategory.length > 0 ? (
                <div className="rounded-xl border border-stone-200/70 bg-stone-50/60 p-3 space-y-2">
                  <p className="text-[11px] font-extrabold uppercase tracking-wide text-stone-500">Pengeluaran per Kategori</p>
                  <div className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
                    {cashflow.byCategory.map((c) => (
                      <div key={c.category} className="flex items-center justify-between rounded-lg bg-white px-2.5 py-1.5 text-[11px] border border-stone-200/60">
                        <span className="truncate text-stone-600">{c.category}</span>
                        <span className="ml-2 shrink-0 font-bold text-brand-cocoa">{formatIDR(c.total)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          )
        ) : tab === "pengeluaran" ? (
          expenses.length === 0 ? (
            <div className="rounded-xl border border-dashed border-stone-300 bg-stone-50/60 p-8 text-center space-y-2">
              <p className="text-xs font-extrabold text-stone-700">Belum ada pengeluaran tercatat</p>
              <p className="text-[11px] text-stone-500">Catat biaya visa, tiket, hotel, gaji, atau operasional kantor di sini.</p>
            </div>
          ) : (
            <>
            {/* Kartu mobile -- tabel pengeluaran di bawah butuh 780px */}
            <div className="block space-y-3 md:hidden">
              {expenses.map((row) => (
                <div key={row.id} className="space-y-2.5 rounded-2xl border border-stone-200/80 bg-white p-4 shadow-2xs">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h4 className="truncate text-xs font-semibold text-stone-800">{row.description}</h4>
                      {row.packageName ? <p className="truncate text-[10px] text-stone-400">{row.packageName}</p> : null}
                    </div>
                    <span className="shrink-0 rounded-full border border-stone-200 bg-stone-50 px-2 py-0.5 text-[10px] font-bold text-stone-700">
                      {row.category}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 rounded-xl border border-stone-100 bg-stone-50 p-2.5 text-[11px]">
                    <div className="min-w-0">
                      <span className="block text-[10px] font-medium text-stone-400">Nominal</span>
                      <span className="block truncate font-black text-rose-700">{formatIDR(row.amount)}</span>
                    </div>
                    <div className="min-w-0">
                      <span className="block text-[10px] font-medium text-stone-400">Metode</span>
                      <span className="block truncate text-stone-700">{row.method}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 border-t border-stone-100 pt-2">
                    <span className="text-[11px] font-semibold text-brand-cocoa">{formatDateID(row.date)}</span>
                    <button
                      type="button"
                      onClick={() => handleDelete(row)}
                      disabled={deletingId === row.id}
                      className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 text-[11px] font-bold text-rose-600 transition active:bg-rose-100 disabled:opacity-40"
                    >
                      {deletingId === row.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                      Hapus
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="hidden overflow-x-auto rounded-xl border border-stone-200/60 md:block">
              <table className="w-full min-w-[780px] border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-200/60 bg-stone-50/70 text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                    <th className="py-2.5 pl-3 pr-2">Tanggal</th>
                    <th className="py-2.5 pr-2">Keterangan</th>
                    <th className="py-2.5 pr-2">Kategori</th>
                    <th className="py-2.5 pr-2">Metode</th>
                    <th className="py-2.5 pr-2 text-right">Nominal</th>
                    <th className="py-2.5 pr-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {expenses.map((row) => (
                    <tr key={row.id} className="transition hover:bg-stone-50/60">
                      <td className="py-2.5 pl-3 pr-2 whitespace-nowrap font-semibold text-brand-cocoa">{formatDateID(row.date)}</td>
                      <td className="py-2.5 pr-2">
                        <p className="font-semibold text-stone-800">{row.description}</p>
                        {row.packageName ? <p className="text-[10px] text-stone-400">{row.packageName}</p> : null}
                      </td>
                      <td className="py-2.5 pr-2">
                        <span className="rounded-full border border-stone-200 bg-stone-50 px-2 py-0.5 text-[10px] font-bold text-stone-700">
                          {row.category}
                        </span>
                      </td>
                      <td className="py-2.5 pr-2 text-stone-600">{row.method}</td>
                      <td className="py-2.5 pr-2 text-right font-black text-rose-700">{formatIDR(row.amount)}</td>
                      <td className="py-2.5 pr-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleDelete(row)}
                          disabled={deletingId === row.id}
                          className="grid h-7 w-7 place-items-center rounded-lg border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 disabled:opacity-40 transition ml-auto"
                          title="Hapus"
                        >
                          {deletingId === row.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            </>
          )
        ) : cashflow.piutang.rows.length === 0 ? (
          <p className="py-8 text-center text-xs text-stone-500">Tidak ada piutang berjalan — semua jamaah sudah lunas.</p>
        ) : (
          <div className="space-y-3">
            {cashflow.piutang.overdueCount > 0 ? (
              <p className="rounded-xl border border-amber-200 bg-amber-50/60 px-3 py-2 text-[11px] font-semibold text-amber-900">
                {cashflow.piutang.overdueCount} tagihan prioritas tinggi (lewat jatuh tempo atau &gt; 14 hari) senilai{" "}
                {formatIDR(cashflow.piutang.overdueAmount)}.
              </p>
            ) : null}

            {/* Kartu mobile -- tabel piutang di bawah butuh 760px */}
            <div className="block space-y-3 md:hidden">
              {cashflow.piutang.rows.map((row) => (
                <Link
                  key={row.bookingCode}
                  href={`/booking/${encodeURIComponent(row.bookingCode)}`}
                  className="block space-y-2.5 rounded-2xl border border-stone-200/80 bg-white p-4 shadow-2xs active:bg-stone-50"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h4 className="truncate text-xs font-bold text-brand-cocoa">{row.customer}</h4>
                      <p className="truncate font-mono text-[10px] text-stone-400">{row.bookingCode}</p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold ${
                        row.priority === "Tinggi"
                          ? "border-rose-200 bg-rose-50 text-rose-700"
                          : "border-stone-200 bg-stone-50 text-stone-600"
                      }`}
                    >
                      {row.priority}
                    </span>
                  </div>

                  <div className="rounded-xl border border-stone-100 bg-stone-50 p-2.5">
                    <span className="block text-[10px] font-medium text-stone-400">Sisa Tagihan</span>
                    <span className="text-sm font-black text-brand-pink">{formatIDR(row.remaining)}</span>
                  </div>

                  <div className="flex items-center justify-between gap-2 border-t border-stone-100 pt-1 text-[11px] text-stone-600">
                    <span className="min-w-0 truncate">{row.packageName}</span>
                    <span className="shrink-0">{formatDateID(row.dueDate)} · {row.ageDays} hari</span>
                  </div>
                </Link>
              ))}
            </div>

            <div className="hidden overflow-x-auto rounded-xl border border-stone-200/60 md:block">
              <table className="w-full min-w-[760px] border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-200/60 bg-stone-50/70 text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                    <th className="py-2.5 pl-3 pr-2">Jamaah</th>
                    <th className="py-2.5 pr-2">Program</th>
                    <th className="py-2.5 pr-2">Jatuh Tempo</th>
                    <th className="py-2.5 pr-2">Umur</th>
                    <th className="py-2.5 pr-2 text-right">Sisa</th>
                    <th className="py-2.5 pr-3 text-right">Prioritas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {cashflow.piutang.rows.map((row) => (
                    <tr key={row.bookingCode} className="transition hover:bg-stone-50/60">
                      <td className="py-2.5 pl-3 pr-2">
                        <Link href={`/booking/${encodeURIComponent(row.bookingCode)}`} className="font-bold text-brand-cocoa hover:text-brand-pink hover:underline">
                          {row.customer}
                        </Link>
                        <p className="text-[10px] text-stone-400">{row.bookingCode}</p>
                      </td>
                      <td className="py-2.5 pr-2 max-w-[170px] truncate text-stone-600">{row.packageName}</td>
                      <td className="py-2.5 pr-2 whitespace-nowrap text-stone-600">{formatDateID(row.dueDate)}</td>
                      <td className="py-2.5 pr-2 text-stone-600">{row.ageDays} hari</td>
                      <td className="py-2.5 pr-2 text-right font-black text-brand-pink">{formatIDR(row.remaining)}</td>
                      <td className="py-2.5 pr-3 text-right">
                        <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold ${
                          row.priority === "Tinggi"
                            ? "border-rose-200 bg-rose-50 text-rose-700"
                            : "border-stone-200 bg-stone-50 text-stone-600"
                        }`}>
                          {row.priority}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* Expense form */}
      {isFormOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-stone-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-stone-200 bg-white p-5 sm:p-6 shadow-2xl space-y-4">

            <div className="flex items-start justify-between border-b border-stone-100 pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-brand-cocoa">Catat Pengeluaran</h3>
                <p className="text-[11px] text-stone-500 mt-0.5">Biaya keluar yang mengurangi kas perusahaan.</p>
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
              <span className="text-[11px] font-bold uppercase tracking-wide text-stone-500">Keterangan</span>
              <input
                type="text"
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Biaya visa 39 pax rombongan Oktober"
                className="w-full h-9 rounded-xl border border-stone-200 bg-stone-50/50 px-3 text-xs font-medium text-brand-cocoa placeholder:text-stone-400 outline-none focus:border-brand-pink focus:bg-white transition"
              />
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
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
                <span className="text-[11px] font-bold uppercase tracking-wide text-stone-500">Nominal (Rp)</span>
                <input
                  type="number"
                  min={0}
                  value={form.amount}
                  onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))}
                  placeholder="8123456"
                  className="w-full h-9 rounded-xl border border-stone-200 bg-stone-50/50 px-3 text-xs font-medium text-brand-cocoa placeholder:text-stone-400 outline-none focus:border-brand-pink focus:bg-white transition"
                />
              </label>

              <label className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wide text-stone-500">Kategori</span>
                <select
                  value={form.category}
                  onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                  className="w-full h-9 rounded-xl border border-stone-200 bg-stone-50/50 px-2.5 text-xs font-medium text-brand-cocoa outline-none focus:border-brand-pink focus:bg-white transition"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </label>

              <label className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wide text-stone-500">Metode</span>
                <input
                  type="text"
                  value={form.method}
                  onChange={(e) => setForm((prev) => ({ ...prev, method: e.target.value }))}
                  placeholder="Transfer BSI"
                  className="w-full h-9 rounded-xl border border-stone-200 bg-stone-50/50 px-3 text-xs font-medium text-brand-cocoa placeholder:text-stone-400 outline-none focus:border-brand-pink focus:bg-white transition"
                />
              </label>
            </div>

            <label className="block space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wide text-stone-500">No. Referensi (opsional)</span>
              <input
                type="text"
                value={form.referenceNumber}
                onChange={(e) => setForm((prev) => ({ ...prev, referenceNumber: e.target.value }))}
                placeholder="TRX-889201"
                className="w-full h-9 rounded-xl border border-stone-200 bg-stone-50/50 px-3 text-xs font-medium text-brand-cocoa placeholder:text-stone-400 outline-none focus:border-brand-pink focus:bg-white transition"
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
                {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                <span>{isSaving ? "Menyimpan…" : "Simpan Pengeluaran"}</span>
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
