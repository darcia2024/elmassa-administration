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
  const [companyName, setCompanyName] = useState("El Massa Tour & Travel");
  const [companyAddress, setCompanyAddress] = useState("");

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

    // Replaces a hardcoded "Jl. Kemang Pratama No. 12, Bekasi" that was never
    // this company's real address (it's Pangkalpinang, Bangka Belitung).
    fetch("/api/company-identity")
      .then((res) => res.json())
      .then((json) => {
        if (json.data?.name) setCompanyName(json.data.name);
        if (json.data?.address) setCompanyAddress(json.data.address);
      })
      .catch((e) => console.error("Failed loading company identity:", e));
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
            {/* 🏢 KOP SURAT RESMI PT AL MASSA AZKA WISATA */}
            <div className="w-full pb-2 border-b border-stone-800">
              <img
                src="/kop-surat-el-massa.png"
                alt="Kop Surat Resmi PT Al Massa Azka Wisata"
                className="w-full max-w-full h-auto object-contain block mx-auto rounded-none"
              />
              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-stone-600 pt-1.5 font-medium">
                <span>Email: <strong className="text-stone-900">elmassatour@gmail.com</strong></span>
                <span>No. Admin Kantor: <strong className="text-stone-900">+62 811-7171-5125</strong></span>
              </div>
            </div>

            <div className="flex flex-col gap-4 border-b border-stone-200/60 pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-black uppercase text-stone-900 tracking-tight">Kuitansi Pembayaran</h1>
                <p className="text-xs text-stone-500 mt-0.5">Tanda bukti penerimaan pembayaran resmi PT Al Massa Azka Wisata</p>
              </div>

              <div className="rounded-xl border border-stone-200/60 bg-stone-50/50 p-3 text-xs space-y-1 shrink-0 min-w-[200px]">
                <div className="flex justify-between">
                  <span className="text-stone-400 font-bold uppercase text-[10px]">No. Kuitansi:</span>
                  <span className="font-mono font-bold text-stone-900">{receipt.number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400 font-bold uppercase text-[10px]">Tgl Terbit:</span>
                  <span className="font-semibold text-stone-800">{receipt.date}</span>
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
