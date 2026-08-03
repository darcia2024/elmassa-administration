"use client";

import { useMemo, useState } from "react";
import {
  CheckCircle2,
  Clock,
  CreditCard,
  Download,
  FileText,
  MessageSquare,
  Plus,
  Printer,
  ReceiptText,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";

type InvoiceItem = {
  number: string;
  bookingCode: string;
  customer: string;
  phone: string;
  packageName: string;
  issueDate: string;
  dueDate: string;
  totalDisplay: string;
  paidDisplay: string;
  remainingDisplay: string;
  remainingAmount: number;
  status: "Lunas" | "Sebagian" | "Belum Bayar";
};

const initialInvoices: InvoiceItem[] = [];

const availableBookings: Array<{ code: string; customer: string; package: string; price: string; phone: string }> = [];

export default function FastInvoicePage() {
  const [invoices, setInvoices] = useState<InvoiceItem[]>(initialInvoices);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("Semua");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [selectedBookingCode, setSelectedBookingCode] = useState("BK-2407-001");
  const [customCustomer, setCustomCustomer] = useState("");
  const [customPackage, setCustomPackage] = useState("");
  const [customTotal, setCustomTotal] = useState("");
  const [customDueDate, setCustomDueDate] = useState("28 Agustus 2026");

  // Load real-time invoices dynamically from localStorage
  useEffect(() => {
    try {
      const savedStr = localStorage.getItem("el_massa_real_bookings");
      if (savedStr) {
        const savedBookings = JSON.parse(savedStr);
        if (Array.isArray(savedBookings) && savedBookings.length > 0) {
          const dynamicInvoices: InvoiceItem[] = savedBookings.map((b: any) => ({
            number: `INV-${b.code}`,
            bookingCode: b.code,
            customer: b.customer || "Jamaah Terdaftar",
            phone: b.phone || "-",
            packageName: b.packageName || "Umrah Spesial El Massa",
            issueDate: b.createdDate || "Hari ini",
            dueDate: b.departure || "Terjadwal 2026",
            totalDisplay: b.totalDisplay || `Rp ${(b.totalAmount || 0).toLocaleString("id-ID")}`,
            paidDisplay: b.paidDisplay || `Rp ${(b.paidAmount || 0).toLocaleString("id-ID")}`,
            remainingDisplay: b.remainingDisplay || `Rp ${(b.remainingAmount || 0).toLocaleString("id-ID")}`,
            remainingAmount: b.remainingAmount ?? 0,
            status: b.remainingAmount <= 0 ? "Lunas" : b.paidAmount > 0 ? "Sebagian" : "Belum Bayar",
          }));

          setInvoices(dynamicInvoices);
        }
      }
    } catch (e) {
      console.error(e);
    }
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

  const handleBookingSelect = (code: string) => {
    setSelectedBookingCode(code);
    const found = availableBookings.find((b) => b.code === code);
    if (found) {
      setCustomCustomer(found.customer);
      setCustomPackage(found.package);
      setCustomTotal(found.price);
    }
  };

  const handleCreateFastInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const newNumber = `INV-2407-${String(invoices.length + 1).padStart(3, "0")}`;
    const b = availableBookings.find((item) => item.code === selectedBookingCode);

    const newInv: InvoiceItem = {
      number: newNumber,
      bookingCode: selectedBookingCode,
      customer: customCustomer || b?.customer || "Jamaah Umrah",
      phone: b?.phone || "0812-3344-5566",
      packageName: customPackage || b?.package || "Umrah Reguler 12 Hari",
      issueDate: "29 Jul 2026",
      dueDate: customDueDate,
      totalDisplay: customTotal || b?.price || "Rp 32.500.000",
      paidDisplay: "Rp 0",
      remainingDisplay: customTotal || b?.price || "Rp 32.500.000",
      remainingAmount: 32500000,
      status: "Belum Bayar",
    };

    setInvoices([newInv, ...invoices]);
    setIsModalOpen(false);
  };

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
                <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 border border-emerald-200/60">
                  ⚡ 0 Jeda Latensi
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-1 max-w-2xl">
                Buat invoice tagihan jamaah secara otomatis hanya dengan memilih kode booking. Rincian biaya All In & nomor rekening bank terisi instan.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  handleBookingSelect("BK-2407-001");
                  setIsModalOpen(true);
                }}
                className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-brand-pink px-4 text-xs font-semibold text-white shadow-2xs hover:bg-brand-pinkHover transition shrink-0"
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
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" strokeWidth={1.5} />
              <input
                type="text"
                placeholder="Ketik No. INV-2407, nama jamaah, atau booking..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 rounded-xl border border-stone-200 bg-stone-50/50 pl-9 pr-3 text-xs text-brand-cocoa font-medium placeholder:text-stone-400 outline-none focus:border-brand-pink focus:bg-white transition"
              />
            </div>

            {/* Filter Pill Tabs */}
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

          {/* 📋 Fast Invoice Table */}
          <div className="overflow-x-auto rounded-xl border border-stone-200/60">
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
                {filteredInvoices.map((inv) => {
                  const waText = encodeURIComponent(
                    `Assalamu'alaikum wr. wb. Yth. Bapak/Ibu ${inv.customer},\n\nBerikut tagihan *Invoice ${inv.number}* untuk *${inv.packageName}*.\nSisa tagihan pelunasan: *${inv.remainingDisplay}* (Tenggat: ${inv.dueDate}).\n\nTerima kasih,\n*PT El Massa Tour & Travel*`,
                  );

                  return (
                    <tr key={inv.number} className="transition hover:bg-stone-50/60">
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
                      <td className="py-3 pr-2 font-bold text-stone-900 whitespace-nowrap">{inv.totalDisplay}</td>
                      <td className="py-3 pr-2 font-semibold text-emerald-700 whitespace-nowrap">{inv.paidDisplay}</td>
                      <td className="py-3 pr-2 font-bold text-rose-600 whitespace-nowrap">{inv.remainingDisplay}</td>
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

                        {inv.remainingAmount > 0 && (
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
          <form onSubmit={handleCreateFastInvoice} className="relative w-full max-w-lg rounded-2xl border border-stone-200 bg-white p-6 shadow-xl space-y-4">
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

            <div className="space-y-3 text-xs">
              <label className="block space-y-1">
                <span className="font-semibold text-stone-700">Pilih Kode Booking Jamaah</span>
                <select
                  className="w-full h-9 rounded-xl border border-stone-200 bg-white px-3 text-xs font-bold text-brand-cocoa outline-none shadow-2xs"
                  value={selectedBookingCode}
                  onChange={(e) => handleBookingSelect(e.target.value)}
                >
                  {availableBookings.map((b) => (
                    <option key={b.code} value={b.code}>
                      {b.code} - {b.customer} ({b.package})
                    </option>
                  ))}
                </select>
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="block space-y-1">
                  <span className="font-semibold text-stone-700">Nama Jamaah Pemesan</span>
                  <input
                    required
                    className="w-full h-9 rounded-xl border border-stone-200 bg-stone-50/50 px-3 text-xs font-bold text-brand-cocoa outline-none"
                    value={customCustomer}
                    onChange={(e) => setCustomCustomer(e.target.value)}
                  />
                </label>

                <label className="block space-y-1">
                  <span className="font-semibold text-stone-700">Paket Wisata</span>
                  <input
                    required
                    className="w-full h-9 rounded-xl border border-stone-200 bg-stone-50/50 px-3 text-xs font-medium text-stone-800 outline-none"
                    value={customPackage}
                    onChange={(e) => setCustomPackage(e.target.value)}
                  />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="block space-y-1">
                  <span className="font-semibold text-stone-700">Total Nominal Tagihan</span>
                  <input
                    required
                    className="w-full h-9 rounded-xl border border-stone-200 bg-stone-50/50 px-3 text-xs font-bold text-brand-cocoa outline-none"
                    value={customTotal}
                    onChange={(e) => setCustomTotal(e.target.value)}
                  />
                </label>

                <label className="block space-y-1">
                  <span className="font-semibold text-stone-700">Tenggat Jatuh Tempo</span>
                  <input
                    required
                    className="w-full h-9 rounded-xl border border-stone-200 bg-stone-50/50 px-3 text-xs font-medium outline-none"
                    value={customDueDate}
                    onChange={(e) => setCustomDueDate(e.target.value)}
                  />
                </label>
              </div>
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
                className="h-9 rounded-xl bg-brand-pink px-5 text-xs font-semibold text-white shadow-2xs hover:bg-brand-pinkHover"
              >
                Terbitkan Invoice (Instan)
              </button>
            </div>
          </form>
        </div>
      )}

    </AppShell>
  );
}
