"use client";

import { Download, Printer, ReceiptText } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";

type ReceiptDetail = {
  receipt: {
    id: string;
    number: string;
    date: string;
    receivedFrom: string;
    amount: number;
    amountWords: string;
    paymentFor: string;
    paymentMethod: string;
    staff: string;
    status: string;
  };
  payment: {
    id: string;
    bookingCode: string;
    customerName: string;
    customerPhone: string;
    packageName: string;
  };
};

export default function ReceiptPage() {
  const [receipts, setReceipts] = useState<ReceiptDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReceiptNumber, setSelectedReceiptNumber] = useState("");

  useEffect(() => {
    fetch("/api/receipts")
      .then((res) => res.json())
      .then((json) => {
        const data = (json.data ?? []) as ReceiptDetail[];
        setReceipts(data);
        if (data.length > 0) setSelectedReceiptNumber(data[0].receipt.number);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  const item = receipts.find((r) => r.receipt.number === selectedReceiptNumber) ?? receipts[0];
  const receipt = item?.receipt;
  const payment = item?.payment;
  const handlePrint = () => window.print();
  const handleDownload = () => {
    if (payment) window.open(`/api/receipts/${payment.id}/pdf`, "_blank");
  };

  return (
    <AppShell eyebrow="Dokumen Keuangan" title="Kuitansi Operasional">
      <div className="space-y-5">
        <section className="print-hidden rounded-2xl border border-stone-200/70 bg-white p-5 sm:p-6 shadow-2xs">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-base font-bold text-brand-cocoa">Pratinjau Kuitansi Cetak</h3>
              <p className="text-xs text-stone-500">Pilih kuitansi pembayaran untuk dicetak atau diunduh ke PDF.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Link className="inline-flex h-9 items-center justify-center rounded-xl border border-stone-200 bg-stone-50 px-3.5 text-xs font-semibold text-stone-700 hover:bg-stone-100 transition" href="/pembayaran">
                Kembali
              </Link>
              <button className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3.5 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition" type="button" onClick={handlePrint}>
                <Printer className="h-3.5 w-3.5 text-stone-500" strokeWidth={1.5} />
                Cetak
              </button>
              <button className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-brand-pink px-4 text-xs font-semibold text-white shadow-2xs hover:bg-brand-pinkHover transition" type="button" onClick={handleDownload}>
                <Download className="h-3.5 w-3.5" strokeWidth={1.5} />
                Unduh PDF
              </button>
            </div>
          </div>
        </section>

        {loading ? (
          <p className="text-center text-xs text-stone-400 py-12">Memuat kuitansi...</p>
        ) : receipts.length === 0 || !receipt || !payment ? (
          <div className="rounded-2xl border border-stone-200/70 bg-white p-12 text-center shadow-2xs space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-brand-pink">
              <ReceiptText className="h-7 w-7" strokeWidth={1.5} />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-bold text-brand-cocoa">Belum Ada Kuitansi Pembayaran Terbit</h4>
              <p className="text-xs text-stone-500 max-w-md mx-auto">
                Kuitansi resmi akan dibuat otomatis saat Anda mencatat pembayaran baru dari jamaah.
              </p>
            </div>
            <Link
              href="/pembayaran/form"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-brand-pink px-5 text-xs font-bold text-white shadow-2xs hover:bg-brand-pinkHover transition"
            >
              + Catat Pembayaran Baru
            </Link>
          </div>
        ) : (
          <section className="grid gap-5 xl:grid-cols-[300px_1fr]">
            <aside className="print-hidden rounded-2xl border border-stone-200/70 bg-white p-5 shadow-2xs">
              <h3 className="text-xs font-bold text-brand-cocoa uppercase tracking-wider mb-3">Daftar Kuitansi</h3>
              <div className="space-y-2">
                {receipts.map((r) => {
                  const isSelected = r.receipt.number === receipt.number;

                  return (
                    <button
                      key={r.receipt.number}
                      className={`w-full rounded-xl border p-3.5 text-left text-xs transition ${
                        isSelected
                          ? "border-brand-pink bg-rose-50/40 text-brand-cocoa font-semibold"
                          : "border-stone-200/70 bg-white text-stone-700 hover:border-stone-300"
                      }`}
                      type="button"
                      onClick={() => setSelectedReceiptNumber(r.receipt.number)}
                    >
                      <span className="block font-bold text-brand-cocoa">{r.receipt.number}</span>
                      <span className="mt-0.5 block text-[11px] text-stone-500">{r.receipt.receivedFrom}</span>
                      <span className="mt-2 flex justify-between gap-3 text-[11px]">
                        <span className="font-semibold text-emerald-700">Rp {r.receipt.amount.toLocaleString("id-ID")}</span>
                        <span className="text-stone-400">{r.receipt.status}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </aside>

          {/* Receipt Viewport */}
          <article className="receipt-print rounded-2xl border border-stone-200/70 bg-white p-6 sm:p-8 shadow-2xs space-y-6">
            <div className="flex flex-col gap-6 border-b border-stone-200/60 pb-6 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-4">
                <img
                  src="/logo-el-massa.png"
                  alt="El Massa Tour & Travel Logo"
                  className="h-12 w-auto object-contain shrink-0"
                />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-brand-brown">El Massa Tour & Travel</p>
                  <h1 className="mt-0.5 text-2xl font-extrabold text-brand-cocoa">Kuitansi Pembayaran</h1>
                  <p className="mt-1 text-xs text-stone-500">Jl. Kemang Pratama No. 12, Bekasi</p>
                </div>
              </div>

              <div className="rounded-xl border border-stone-200/60 bg-stone-50/50 p-4 text-xs space-y-2 shrink-0 min-w-[180px]">
                <div>
                  <p className="text-[10px] font-bold uppercase text-stone-400">Nomor Kuitansi</p>
                  <p className="font-bold font-mono text-brand-cocoa text-sm">{receipt.number}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-stone-400">Tanggal Terbit</p>
                  <p className="font-medium text-stone-700">{receipt.date}</p>
                </div>
              </div>
            </div>

            {/* Receipt Details Grid */}
            <div className="space-y-4 text-xs">
              <div className="grid gap-2 border-b border-stone-100 pb-3 sm:grid-cols-[140px_1fr]">
                <span className="font-semibold text-stone-500">Telah Diterima Dari</span>
                <span className="font-bold text-brand-cocoa">{receipt.receivedFrom} ({payment.customerPhone})</span>
              </div>

              <div className="grid gap-2 border-b border-stone-100 pb-3 sm:grid-cols-[140px_1fr]">
                <span className="font-semibold text-stone-500">Uang Sejumlah</span>
                <span className="font-semibold italic text-brand-cocoa bg-rose-50/50 px-3 py-1 rounded-lg border border-brand-pink/20">
                  {receipt.amountWords}
                </span>
              </div>

              <div className="grid gap-2 border-b border-stone-100 pb-3 sm:grid-cols-[140px_1fr]">
                <span className="font-semibold text-stone-500">Untuk Pembayaran</span>
                <span className="font-medium text-stone-700">{receipt.paymentFor} (Kode: {payment.bookingCode})</span>
              </div>
            </div>

            {/* Total Footer Box */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-t border-stone-200/60 pt-4">
              <div className="rounded-xl border border-stone-200/60 bg-stone-50/60 px-4 py-2.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Total Terbayar</span>
                <p className="text-xl font-extrabold text-brand-pink">Rp {receipt.amount.toLocaleString("id-ID")}</p>
              </div>

              <div className="text-right text-xs">
                <p className="text-stone-500">Penerima Kasir</p>
                <p className="mt-4 font-bold text-brand-cocoa">{receipt.staff}</p>
                <p className="text-[10px] text-stone-400">Admin Operasional</p>
              </div>
            </div>
          </article>
        </section>
        )}
      </div>
    </AppShell>
  );
}
