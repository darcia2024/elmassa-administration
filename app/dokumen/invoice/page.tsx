"use client";

import { useEffect, useMemo, useState } from "react";
import {
  MessageSquare,
  Plus,
  Printer,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { todayForDateInput } from "@/lib/format/date";

type InvoiceItem = {
  id: string;
  number: string;
  bookingCode: string;
  customer: string;
  phone: string;
  packageName: string;
  issueDate: string;
  dueDate: string;
  total: number;
  paid: number;
  remaining: number;
  status: "Lunas" | "Sebagian" | "Belum Bayar";
};

type BookingOption = {
  code: string;
  customer: string;
  packageName: string;
  totalAmount: number;
  phone: string;
};

export default function FastInvoicePage() {
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<BookingOption[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("Semua");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [selectedBookingCode, setSelectedBookingCode] = useState("");
  const [customDueDate, setCustomDueDate] = useState(() => todayForDateInput());

  function loadInvoices() {
    setLoading(true);
    fetch("/api/invoices")
      .then((res) => res.json())
      .then((json) => setInvoices(json.data ?? []))
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadInvoices();
    fetch("/api/bookings")
      .then((res) => res.json())
      .then((json) => {
        const rows = (json.data ?? []) as any[];
        const options = rows.map((b) => ({
          code: b.code,
          customer: b.customerName,
          packageName: b.packageName,
          totalAmount: Number(b.totalAmount),
          phone: b.phone,
        }));
        setBookings(options);
        if (options.length > 0) setSelectedBookingCode(options[0].code);
      })
      .catch((e) => console.error(e));
  }, []);

  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        inv.number.toLowerCase().includes(q) ||
        inv.bookingCode.toLowerCase().includes(q) ||
        inv.customer.toLowerCase().includes(q) ||
        inv.packageName.toLowerCase().includes(q);

      const matchesStatus =
        selectedStatus === "Semua" ||
        (selectedStatus === "Pending" && inv.status !== "Lunas") ||
        inv.status === selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }, [invoices, searchQuery, selectedStatus]);

  const selectedBooking = bookings.find((b) => b.code === selectedBookingCode) ?? null;

  async function handleCreateInvoice(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedBooking) return;

    setIsSubmitting(true);
    setFormError(null);

    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingCode: selectedBooking.code, dueDateValue: customDueDate }),
      });
      const json = await res.json();

      if (!res.ok) {
        setFormError(json.error ?? "Gagal membuat invoice");
        return;
      }

      setIsModalOpen(false);
      loadInvoices();
    } catch {
      setFormError("Gagal membuat invoice, cek koneksi.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AppShell eyebrow="Dokumen Keuangan" title="Generator Invoice Instan & Tagihan">
      <div className="space-y-5">

        {/* Header Hero Section */}
        <section className="rounded-2xl border border-stone-200/70 bg-white p-5 sm:p-6 shadow-2xs">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold tracking-tight text-brand-cocoa">
                  Generator Invoice Tagihan Ringan & Instan
                </h1>
              </div>
              <p className="text-xs text-stone-500 mt-1 max-w-2xl">
                Buat invoice tagihan jamaah secara otomatis hanya dengan memilih kode booking.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                disabled={bookings.length === 0}
                className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-brand-pink px-4 text-xs font-semibold text-white shadow-2xs hover:bg-brand-pinkHover transition shrink-0 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Plus className="h-4 w-4" strokeWidth={1.5} />
                <span>+ Buat Invoice 1-Klik</span>
              </button>
            </div>
          </div>
        </section>

        {/* 📊 KPI Summary Row */}
        <section className="grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl border border-stone-200/70 bg-white p-5 shadow-2xs">
            <p className="text-xs font-semibold text-stone-500">Total Invoice Terbit</p>
            <p className="mt-1 text-2xl font-bold text-brand-cocoa">{invoices.length} Invoice</p>
            <p className="mt-1 text-[11px] text-stone-400">Terdaftar di sistem</p>
          </article>
          <article className="rounded-2xl border border-stone-200/70 bg-white p-5 shadow-2xs">
            <p className="text-xs font-semibold text-stone-500">Pending Pelunasan</p>
            <p className="mt-1 text-2xl font-bold text-amber-700">
              {invoices.filter((i) => i.status !== "Lunas").length} Tagihan
            </p>
            <p className="mt-1 text-[11px] text-stone-400">Dalam masa tenggat jatuh tempo</p>
          </article>
          <article className="rounded-2xl border border-stone-200/70 bg-white p-5 shadow-2xs">
            <p className="text-xs font-semibold text-stone-500">Lunas Sempurna</p>
            <p className="mt-1 text-2xl font-bold text-emerald-700">
              {invoices.filter((i) => i.status === "Lunas").length} Tagihan
            </p>
            <p className="mt-1 text-[11px] text-stone-400">Terverifikasi 100%</p>
          </article>
        </section>

        {/* 🔎 Search Bar & Filter Tabs */}
        <section className="rounded-2xl border border-stone-200/70 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" strokeWidth={1.5} />
              <input
                type="text"
                placeholder="Ketik No. INV, nama jamaah, atau booking..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 rounded-xl border border-stone-200 bg-stone-50/50 pl-9 pr-3 text-xs text-brand-cocoa font-medium placeholder:text-stone-400 outline-none focus:border-brand-pink focus:bg-white transition"
              />
            </div>

            <div className="flex items-center gap-1.5 border-b border-stone-100 pb-2 md:border-none md:pb-0">
              {(["Semua", "Lunas", "Pending"] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setSelectedStatus(st)}
                  className={`h-8 rounded-xl px-3.5 text-xs font-semibold transition ${
                    selectedStatus === st
                      ? "bg-rose-50 text-brand-pink border border-brand-pink/20 font-bold shadow-2xs"
                      : "text-stone-600 hover:bg-stone-50"
                  }`}
                >
                  {st === "Pending" ? "Pending / Belum Lunas" : st}
                </button>
              ))}
            </div>
          </div>

          {/* Kartu mobile -- tabel 9 kolom di bawah butuh 880px */}
          <div className="block space-y-3 md:hidden">
            {loading && <p className="py-6 text-center text-xs text-stone-400">Memuat invoice...</p>}

            {!loading && filteredInvoices.length === 0 && (
              <p className="py-6 text-center text-xs text-stone-400">Belum ada invoice.</p>
            )}

            {filteredInvoices.map((inv) => {
              const waText = encodeURIComponent(
                `Assalamu'alaikum wr. wb. Yth. Bapak/Ibu ${inv.customer},\n\nBerikut tagihan *Invoice ${inv.number}* untuk *${inv.packageName}*.\nSisa tagihan pelunasan: *Rp ${inv.remaining.toLocaleString("id-ID")}* (Tenggat: ${inv.dueDate}).\n\nTerima kasih,\n*PT El Massa Tour & Travel*`,
              );

              return (
                <div key={inv.id} className="space-y-2.5 rounded-2xl border border-stone-200/80 bg-white p-4 shadow-2xs">
                  <div className="flex items-start justify-between gap-2">
                    <Link href={`/dokumen/invoice/${inv.number}`} className="min-w-0">
                      <p className="truncate font-mono text-xs font-bold text-brand-cocoa">{inv.number}</p>
                      <p className="truncate font-mono text-[10px] text-stone-400">{inv.bookingCode}</p>
                    </Link>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        inv.status === "Lunas"
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200/60"
                          : "bg-amber-50 text-amber-800 border border-amber-200/60"
                      }`}
                    >
                      {inv.status}
                    </span>
                  </div>

                  <p className="truncate text-xs font-semibold text-stone-800">{inv.customer}</p>

                  <div className="rounded-xl border border-stone-100 bg-stone-50 p-2.5">
                    <span className="block text-[10px] font-medium text-stone-400">Sisa Tagihan</span>
                    <span className="text-sm font-bold text-rose-600">Rp {inv.remaining.toLocaleString("id-ID")}</span>
                    <div className="mt-2 grid grid-cols-2 gap-2 border-t border-stone-200/70 pt-2 text-[11px]">
                      <div className="min-w-0">
                        <span className="block text-[10px] font-medium text-stone-400">Total Harga</span>
                        <span className="block truncate font-bold text-stone-900">Rp {inv.total.toLocaleString("id-ID")}</span>
                      </div>
                      <div className="min-w-0">
                        <span className="block text-[10px] font-medium text-stone-400">Terbayar</span>
                        <span className="block truncate font-semibold text-emerald-700">Rp {inv.paid.toLocaleString("id-ID")}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 text-[11px] text-stone-500">
                    <span className="min-w-0 truncate">{inv.packageName}</span>
                    <span className="shrink-0">Tempo {inv.dueDate}</span>
                  </div>

                  <div className="flex items-center gap-2 border-t border-stone-100 pt-2">
                    <Link
                      href={`/dokumen/invoice/${inv.number}`}
                      className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl border border-stone-200 bg-white text-[11px] font-semibold text-stone-700 transition active:bg-stone-100"
                    >
                      <Printer className="h-3.5 w-3.5 text-stone-500" strokeWidth={1.5} />
                      Cetak
                    </Link>

                    {inv.remaining > 0 && (
                      <a
                        href={`https://wa.me/${inv.phone.replace(/[^0-9]/g, "")}?text=${waText}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-600 text-[11px] font-semibold text-white transition active:bg-emerald-700"
                      >
                        <MessageSquare className="h-3.5 w-3.5" strokeWidth={1.5} />
                        Kirim WA
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="hidden overflow-x-auto rounded-xl border border-stone-200/60 md:block">
            <table className="w-full min-w-[880px] border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-stone-200/60 bg-stone-50/70 font-semibold text-stone-500 text-[11px] uppercase tracking-wider">
                  <th className="py-2.5 pl-3 pr-2">No. Invoice & Booking</th>
                  <th className="py-2.5 pr-2">Pelanggan Jamaah</th>
                  <th className="py-2.5 pr-2">Paket Wisata</th>
                  <th className="py-2.5 pr-2">Jatuh Tempo</th>
                  <th className="py-2.5 pr-2">Total Harga</th>
                  <th className="py-2.5 pr-2">Terbayar</th>
                  <th className="py-2.5 pr-2">Sisa Tagihan</th>
                  <th className="py-2.5 pr-2">Status</th>
                  <th className="py-2.5 pr-3 text-right">Aksi Instan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-normal">
                {loading && (
                  <tr>
                    <td colSpan={9} className="py-6 text-center text-stone-400">Memuat invoice...</td>
                  </tr>
                )}
                {!loading && filteredInvoices.length === 0 && (
                  <tr>
                    <td colSpan={9} className="py-6 text-center text-stone-400">Belum ada invoice.</td>
                  </tr>
                )}
                {filteredInvoices.map((inv) => {
                  const waText = encodeURIComponent(
                    `Assalamu'alaikum wr. wb. Yth. Bapak/Ibu ${inv.customer},\n\nBerikut tagihan *Invoice ${inv.number}* untuk *${inv.packageName}*.\nSisa tagihan pelunasan: *Rp ${inv.remaining.toLocaleString("id-ID")}* (Tenggat: ${inv.dueDate}).\n\nTerima kasih,\n*PT El Massa Tour & Travel*`,
                  );

                  return (
                    <tr key={inv.id} className="transition hover:bg-stone-50/60">
                      <td className="py-3 pl-3 pr-2">
                        <Link href={`/dokumen/invoice/${inv.number}`} className="group">
                          <p className="font-mono font-bold text-brand-cocoa group-hover:text-brand-pink transition">
                            {inv.number}
                          </p>
                          <p className="font-mono text-[10px] text-stone-400">{inv.bookingCode}</p>
                        </Link>
                      </td>
                      <td className="py-3 pr-2 font-semibold text-stone-800 whitespace-nowrap">
                        {inv.customer}
                      </td>
                      <td className="py-3 pr-2 text-stone-600 font-medium whitespace-nowrap">{inv.packageName}</td>
                      <td className="py-3 pr-2 text-stone-500 whitespace-nowrap">{inv.dueDate}</td>
                      <td className="py-3 pr-2 font-bold text-stone-900 whitespace-nowrap">Rp {inv.total.toLocaleString("id-ID")}</td>
                      <td className="py-3 pr-2 font-semibold text-emerald-700 whitespace-nowrap">Rp {inv.paid.toLocaleString("id-ID")}</td>
                      <td className="py-3 pr-2 font-bold text-rose-600 whitespace-nowrap">Rp {inv.remaining.toLocaleString("id-ID")}</td>
                      <td className="py-3 pr-2 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                            inv.status === "Lunas"
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-200/60"
                              : "bg-amber-50 text-amber-800 border border-amber-200/60"
                          }`}
                        >
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-3 pr-3 text-right whitespace-nowrap space-x-1">
                        <Link
                          href={`/dokumen/invoice/${inv.number}`}
                          className="inline-flex items-center gap-1 rounded-lg border border-stone-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-stone-700 hover:bg-stone-50 transition"
                        >
                          <Printer className="h-3 w-3 text-stone-500" strokeWidth={1.5} />
                          <span>Cetak</span>
                        </Link>

                        {inv.remaining > 0 && (
                          <a
                            href={`https://wa.me/${inv.phone.replace(/[^0-9]/g, "")}?text=${waText}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center h-7 w-7 rounded-lg border border-emerald-200 bg-emerald-600 text-white hover:bg-emerald-700 transition"
                            title="Kirim Tagihan Invoice via WhatsApp"
                          >
                            <MessageSquare className="h-3.5 w-3.5" strokeWidth={1.5} />
                          </a>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

      </div>

      {/* 📝 MODAL BUAT INVOICE INSTAN 1-KLIK */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <form onSubmit={handleCreateInvoice} className="relative w-full max-w-lg rounded-2xl border border-stone-200 bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-brand-pink" strokeWidth={1.5} />
                <h3 className="text-base font-bold text-brand-cocoa">
                  Buat Invoice Tagihan Instan (1-Klik)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-xl border border-stone-200 bg-stone-50 text-stone-500 hover:bg-stone-100 transition"
              >
                <X className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>

            {formError && (
              <p className="rounded-md bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">{formError}</p>
            )}

            <div className="space-y-3 text-xs">
              <label className="block space-y-1">
                <span className="font-semibold text-stone-700">Pilih Kode Booking Jamaah</span>
                <select
                  className="w-full h-9 rounded-xl border border-stone-200 bg-white px-3 text-xs font-bold text-brand-cocoa outline-none shadow-2xs"
                  value={selectedBookingCode}
                  onChange={(e) => setSelectedBookingCode(e.target.value)}
                >
                  {bookings.map((b) => (
                    <option key={b.code} value={b.code}>
                      {b.code} - {b.customer} ({b.packageName})
                    </option>
                  ))}
                </select>
              </label>

              {selectedBooking && (
                <div className="rounded-xl border border-stone-200/60 bg-stone-50/50 p-3 space-y-1">
                  <p className="text-stone-600">Paket: <span className="font-semibold text-stone-900">{selectedBooking.packageName}</span></p>
                  <p className="text-stone-600">Total tagihan: <span className="font-bold text-brand-cocoa">Rp {selectedBooking.totalAmount.toLocaleString("id-ID")}</span></p>
                </div>
              )}

              <label className="block space-y-1">
                <span className="font-semibold text-stone-700">Tenggat Jatuh Tempo</span>
                <input
                  type="date"
                  required
                  className="w-full h-9 rounded-xl border border-stone-200 bg-stone-50/50 px-3 text-xs font-medium outline-none"
                  value={customDueDate}
                  onChange={(e) => setCustomDueDate(e.target.value)}
                />
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-stone-100 pt-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="h-9 rounded-xl border border-stone-200 bg-white px-4 text-xs font-semibold text-stone-600 hover:bg-stone-50"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !selectedBooking}
                className="h-9 rounded-xl bg-brand-pink px-5 text-xs font-semibold text-white shadow-2xs hover:bg-brand-pinkHover disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? "Menyimpan..." : "Terbitkan Invoice"}
              </button>
            </div>
          </form>
        </div>
      )}

    </AppShell>
  );
}
