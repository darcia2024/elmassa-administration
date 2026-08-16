"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, CalendarClock, CheckCircle2, Plus, WalletCards, X } from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { todayForDateInput } from "@/lib/format/date";

type InstallmentItem = {
  id: string;
  bookingCode: string;
  customer: string;
  packageName: string;
  sequence: number;
  label: string;
  dueDate: string;
  amount: number;
  paidAmount: number;
  status: string;
};

type BookingOption = {
  code: string;
  customer: string;
};

const statusStyles: Record<string, string> = {
  "Jatuh Tempo": "bg-rose-50 text-rose-700 ring-rose-200",
  Terjadwal: "bg-amber-50 text-amber-700 ring-amber-200",
  Lunas: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Dibatalkan: "bg-stone-100 text-stone-500 ring-stone-200",
};

export default function InstallmentsPage() {
  const [installments, setInstallments] = useState<InstallmentItem[]>([]);
  const [bookings, setBookings] = useState<BookingOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [pendingActionId, setPendingActionId] = useState<string | null>(null);

  const [bookingCode, setBookingCode] = useState("");
  const [sequence, setSequence] = useState(1);
  const [label, setLabel] = useState("");
  const [dueDate, setDueDate] = useState(() => todayForDateInput());
  const [amount, setAmount] = useState(0);

  function loadInstallments() {
    setLoading(true);
    fetch("/api/installments")
      .then((res) => res.json())
      .then((json) => setInstallments(json.data ?? []))
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadInstallments();
    fetch("/api/bookings")
      .then((res) => res.json())
      .then((json) => {
        const rows = (json.data ?? []) as any[];
        const options = rows.map((b) => ({ code: b.code, customer: b.customerName }));
        setBookings(options);
        if (options.length > 0) setBookingCode(options[0].code);
      })
      .catch((e) => console.error(e));
  }, []);

  const dueCount = installments.filter((item) => item.status === "Jatuh Tempo").length;
  const scheduledCount = installments.filter((item) => item.status === "Terjadwal").length;
  const paidCount = installments.filter((item) => item.status === "Lunas").length;

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!bookingCode || amount <= 0) return;

    setIsSubmitting(true);
    setFormError(null);

    try {
      const res = await fetch("/api/installments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingCode, sequence, label, dueDate, amount }),
      });
      const json = await res.json();

      if (!res.ok) {
        setFormError(json.error ?? "Gagal menyimpan cicilan");
        return;
      }

      setShowForm(false);
      setSequence((s) => s + 1);
      setAmount(0);
      setLabel("");
      loadInstallments();
    } catch {
      setFormError("Gagal menyimpan cicilan, cek koneksi.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleMarkPaid(id: string) {
    setPendingActionId(id);
    try {
      await fetch(`/api/installments/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Lunas" }),
      });
      loadInstallments();
    } catch (e) {
      console.error(e);
    } finally {
      setPendingActionId(null);
    }
  }

  return (
    <AppShell eyebrow="Keuangan" title="Kelola Cicilan">
      <section className="grid gap-4 md:grid-cols-4">
        <article className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-stone-500">Total Cicilan</p>
            <WalletCards className="h-5 w-5 text-brand-brown" aria-hidden="true" />
          </div>
          <p className="mt-3 text-2xl font-bold text-brand-cocoa">{installments.length}</p>
          <p className="mt-2 text-sm text-stone-500">Jadwal cicilan tercatat</p>
        </article>
        <article className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-stone-500">Jatuh Tempo</p>
            <AlertTriangle className="h-5 w-5 text-rose-600" aria-hidden="true" />
          </div>
          <p className="mt-3 text-2xl font-bold text-brand-cocoa">{dueCount}</p>
          <p className="mt-2 text-sm text-stone-500">Perlu follow-up</p>
        </article>
        <article className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-stone-500">Terjadwal</p>
            <CalendarClock className="h-5 w-5 text-brand-brown" aria-hidden="true" />
          </div>
          <p className="mt-3 text-2xl font-bold text-brand-cocoa">{scheduledCount}</p>
          <p className="mt-2 text-sm text-stone-500">Belum masuk tempo</p>
        </article>
        <article className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-stone-500">Lunas</p>
            <CheckCircle2 className="h-5 w-5 text-emerald-600" aria-hidden="true" />
          </div>
          <p className="mt-3 text-2xl font-bold text-brand-cocoa">{paidCount}</p>
          <p className="mt-2 text-sm text-stone-500">Sudah dibayar</p>
        </article>
      </section>

      {showForm && (
        <section className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold text-brand-cocoa">Tambah Cicilan</h3>
            <button type="button" onClick={() => setShowForm(false)} className="text-stone-400 hover:text-stone-600">
              <X className="h-4 w-4" />
            </button>
          </div>

          {formError && (
            <p className="mb-3 rounded-md bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">{formError}</p>
          )}

          <form onSubmit={handleCreate} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <label className="block space-y-1 sm:col-span-2 lg:col-span-1">
              <span className="text-xs font-semibold text-stone-700">Booking</span>
              <select
                className="h-9 w-full rounded-md border border-stone-200 px-2.5 text-xs"
                value={bookingCode}
                onChange={(e) => setBookingCode(e.target.value)}
                disabled={bookings.length === 0}
              >
                {bookings.length === 0 && <option>Belum ada booking</option>}
                {bookings.map((b) => (
                  <option key={b.code} value={b.code}>
                    {b.code} — {b.customer}
                  </option>
                ))}
              </select>
            </label>

            <label className="block space-y-1">
              <span className="text-xs font-semibold text-stone-700">Termin ke-</span>
              <input
                type="number"
                min={1}
                className="h-9 w-full rounded-md border border-stone-200 px-2.5 text-xs"
                value={sequence}
                onChange={(e) => setSequence(Number(e.target.value))}
              />
            </label>

            <label className="block space-y-1">
              <span className="text-xs font-semibold text-stone-700">Label (opsional)</span>
              <input
                placeholder="mis. DP, Pelunasan"
                className="h-9 w-full rounded-md border border-stone-200 px-2.5 text-xs"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
              />
            </label>

            <label className="block space-y-1">
              <span className="text-xs font-semibold text-stone-700">Jatuh Tempo</span>
              <input
                type="date"
                className="h-9 w-full rounded-md border border-stone-200 px-2.5 text-xs"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </label>

            <label className="block space-y-1">
              <span className="text-xs font-semibold text-stone-700">Nominal (Rp)</span>
              <input
                type="number"
                min={1}
                className="h-9 w-full rounded-md border border-stone-200 px-2.5 text-xs"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
              />
            </label>

            <div className="flex items-end sm:col-span-2 lg:col-span-3">
              <button
                type="submit"
                disabled={isSubmitting || !bookingCode || amount <= 0}
                className="inline-flex h-9 items-center justify-center rounded-md bg-brand-pink px-4 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? "Menyimpan..." : "Simpan Cicilan"}
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-bold text-brand-cocoa">Jadwal Cicilan</h3>
            <p className="mt-1 text-sm text-stone-500">Rencana cicilan per booking dengan status jatuh tempo dan nominal tagihan.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link className="inline-flex h-10 items-center justify-center rounded-md border border-stone-200 bg-white px-4 text-sm font-bold text-brand-cocoa" href="/pembayaran">
              Daftar pembayaran
            </Link>
            <button
              type="button"
              onClick={() => setShowForm((v) => !v)}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-brand-pink px-4 text-sm font-bold text-white"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Tambah cicilan
            </button>
          </div>
        </div>

        {/* Kartu mobile -- tabel 9 kolom di bawah butuh 1080px */}
        <div className="block space-y-3 md:hidden">
          {loading && <p className="py-6 text-center text-xs text-stone-400">Memuat cicilan...</p>}

          {!loading && installments.length === 0 && (
            <p className="py-6 text-center text-xs text-stone-400">Belum ada cicilan tercatat.</p>
          )}

          {installments.map((installment) => (
            <div key={installment.id} className="space-y-2.5 rounded-xl border border-stone-200 bg-white p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <Link className="block truncate font-mono text-xs font-bold text-brand-cocoa" href={`/booking/${installment.bookingCode}`}>
                    {installment.bookingCode}
                  </Link>
                  <p className="truncate text-xs text-stone-600">{installment.customer}</p>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ring-1 ${statusStyles[installment.status] ?? ""}`}>
                  {installment.status}
                </span>
              </div>

              <p className="truncate text-[11px] font-semibold text-stone-700">
                Termin {installment.sequence}
                {installment.label ? ` · ${installment.label}` : ""}
              </p>

              <div className="grid grid-cols-2 gap-2 rounded-lg border border-stone-100 bg-brand-cream/50 p-2.5 text-xs">
                <div className="min-w-0">
                  <span className="block text-[10px] font-medium text-stone-500">Tagihan</span>
                  <span className="block truncate font-bold text-brand-cocoa">
                    Rp {Number(installment.amount).toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="min-w-0">
                  <span className="block text-[10px] font-medium text-stone-500">Terbayar</span>
                  <span className="block truncate text-stone-700">
                    Rp {Number(installment.paidAmount).toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 border-t border-stone-100 pt-2 text-[11px] text-stone-500">
                <span className="min-w-0 truncate">{installment.packageName}</span>
                <span className="shrink-0">Tempo {installment.dueDate}</span>
              </div>

              {installment.status !== "Lunas" && installment.status !== "Dibatalkan" && (
                <button
                  type="button"
                  onClick={() => handleMarkPaid(installment.id)}
                  disabled={pendingActionId === installment.id}
                  className="inline-flex h-10 w-full items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-xs font-bold text-emerald-700 transition active:bg-emerald-100 disabled:opacity-50"
                >
                  {pendingActionId === installment.id ? "..." : "Tandai Lunas"}
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="hidden overflow-x-auto rounded-lg border border-stone-200 md:block">
          <table className="w-full min-w-[1080px] border-collapse text-left text-sm">
            <thead className="bg-brand-cream text-xs uppercase text-stone-500">
              <tr>
                <th className="px-4 py-3 font-bold">Booking</th>
                <th className="px-4 py-3 font-bold">Pelanggan</th>
                <th className="px-4 py-3 font-bold">Paket</th>
                <th className="px-4 py-3 font-bold">Termin</th>
                <th className="px-4 py-3 font-bold">Tempo</th>
                <th className="px-4 py-3 font-bold">Tagihan</th>
                <th className="px-4 py-3 font-bold">Terbayar</th>
                <th className="px-4 py-3 font-bold">Status</th>
                <th className="px-4 py-3 font-bold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 bg-white">
              {loading && (
                <tr>
                  <td colSpan={9} className="px-4 py-6 text-center text-stone-400">Memuat cicilan...</td>
                </tr>
              )}
              {!loading && installments.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-6 text-center text-stone-400">Belum ada cicilan tercatat.</td>
                </tr>
              )}
              {installments.map((installment) => (
                <tr key={installment.id} className="text-stone-700 hover:bg-brand-cream">
                  <td className="px-4 py-4">
                    <Link className="font-bold text-brand-cocoa hover:text-brand-pink" href={`/booking/${installment.bookingCode}`}>
                      {installment.bookingCode}
                    </Link>
                  </td>
                  <td className="px-4 py-4">{installment.customer}</td>
                  <td className="px-4 py-4">{installment.packageName}</td>
                  <td className="px-4 py-4 font-semibold">
                    Termin {installment.sequence}
                    {installment.label ? ` · ${installment.label}` : ""}
                  </td>
                  <td className="px-4 py-4">{installment.dueDate}</td>
                  <td className="px-4 py-4 font-bold text-brand-cocoa">Rp {Number(installment.amount).toLocaleString("id-ID")}</td>
                  <td className="px-4 py-4">Rp {Number(installment.paidAmount).toLocaleString("id-ID")}</td>
                  <td className="px-4 py-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${statusStyles[installment.status] ?? ""}`}>
                      {installment.status}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    {installment.status !== "Lunas" && installment.status !== "Dibatalkan" && (
                      <button
                        type="button"
                        onClick={() => handleMarkPaid(installment.id)}
                        disabled={pendingActionId === installment.id}
                        className="text-xs font-bold text-emerald-700 hover:underline disabled:opacity-50"
                      >
                        {pendingActionId === installment.id ? "..." : "Tandai Lunas"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AppShell>
  );
}
