"use client";

import { Download, Printer, ReceiptText } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";

const receipts = [
  {
    number: "KW-2407-044",
    date: "25 Juli 2026",
    bookingCode: "BK-2407-018",
    receivedFrom: "Siti Rahma",
    amountDisplay: "Rp 7.500.000",
    amountWords: "Tujuh juta lima ratus ribu rupiah",
    paymentFor: "Pembayaran cicilan paket Umrah Reguler 12 Hari",
    paymentMethod: "Transfer",
    account: "BCA El Massa",
    staff: "Maya Safitri",
    customerPhone: "0812-4455-7788",
    status: "Terverifikasi",
  },
];

export default function ReceiptPage() {
  const [selectedReceiptNumber, setSelectedReceiptNumber] = useState(receipts[0].number);
  const receipt = receipts.find((item) => item.number === selectedReceiptNumber) ?? receipts[0];
  const handlePrint = () => window.print();

  return (
    <AppShell eyebrow="Dokumen Keuangan" title="Kuitansi">
      <section className="print-hidden rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-lg font-bold text-brand-cocoa">Daftar & Preview Kuitansi</h3>
            <p className="mt-1 text-sm text-stone-500">Pilih kuitansi dummy untuk melihat pratinjau cetak.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link className="inline-flex h-10 items-center justify-center rounded-md border border-stone-200 bg-white px-4 text-sm font-bold text-brand-cocoa" href="/pembayaran">
              Kembali pembayaran
            </Link>
            <button className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-stone-200 bg-white px-4 text-sm font-bold text-brand-cocoa" type="button" onClick={handlePrint}>
              <Printer className="h-4 w-4" aria-hidden="true" />
              Cetak
            </button>
            <button className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-brand-pink px-4 text-sm font-bold text-white" type="button" onClick={handlePrint}>
              <Download className="h-4 w-4" aria-hidden="true" />
              Unduh PDF
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[320px_1fr]">
        <aside className="print-hidden rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
          <h3 className="text-lg font-bold text-brand-cocoa">Daftar Kuitansi</h3>
          <div className="mt-4 space-y-3">
            {receipts.map((item) => {
              const isSelected = item.number === receipt.number;

              return (
                <button
                  key={item.number}
                  className={`w-full rounded-lg border p-4 text-left text-sm transition ${
                    isSelected
                      ? "border-brand-pink bg-brand-rose text-brand-cocoa"
                      : "border-stone-200 bg-white text-stone-700 hover:bg-brand-cream"
                  }`}
                  type="button"
                  onClick={() => setSelectedReceiptNumber(item.number)}
                >
                  <span className="block font-bold">{item.number}</span>
                  <span className="mt-1 block text-xs">{item.receivedFrom}</span>
                  <span className="mt-3 flex justify-between gap-3">
                    <span>{item.amountDisplay}</span>
                    <span className="font-bold">{item.status}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        <section className="receipt-print rounded-lg border border-stone-200 bg-white p-8 shadow-soft">
        <div className="flex flex-col gap-6 border-b border-stone-200 pb-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="grid h-14 w-14 place-items-center rounded-lg bg-brand-rose text-brand-pink">
              <ReceiptText className="h-7 w-7" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-brand-brown">El Massa Tour & Travel</p>
              <h1 className="mt-1 text-3xl font-bold text-brand-cocoa">Kuitansi</h1>
              <p className="mt-2 text-sm text-stone-500">Jl. Kemang Pratama, Bekasi</p>
            </div>
          </div>
          <div className="rounded-lg border border-stone-200 bg-brand-cream p-4 text-sm">
            <p className="text-xs font-bold uppercase text-stone-500">Nomor</p>
            <p className="mt-1 font-bold text-brand-cocoa">{receipt.number}</p>
            <p className="mt-3 text-xs font-bold uppercase text-stone-500">Tanggal</p>
            <p className="mt-1 font-semibold text-brand-cocoa">{receipt.date}</p>
          </div>
        </div>

        <div className="mt-8 grid gap-5 text-sm">
          <div className="grid gap-2 sm:grid-cols-[180px_1fr]">
            <span className="font-semibold text-stone-500">Telah diterima dari</span>
            <span className="font-bold text-brand-cocoa">{receipt.receivedFrom}</span>
          </div>
          <div className="grid gap-2 sm:grid-cols-[180px_1fr]">
            <span className="font-semibold text-stone-500">Nominal</span>
            <span className="text-2xl font-bold text-brand-cocoa">{receipt.amountDisplay}</span>
          </div>
          <div className="grid gap-2 sm:grid-cols-[180px_1fr]">
            <span className="font-semibold text-stone-500">Terbilang</span>
            <span className="italic text-stone-700">{receipt.amountWords}</span>
          </div>
          <div className="grid gap-2 sm:grid-cols-[180px_1fr]">
            <span className="font-semibold text-stone-500">Untuk pembayaran</span>
            <span className="font-semibold text-brand-cocoa">{receipt.paymentFor}</span>
          </div>
          <div className="grid gap-2 sm:grid-cols-[180px_1fr]">
            <span className="font-semibold text-stone-500">Kode booking</span>
            <span className="font-bold text-brand-cocoa">{receipt.bookingCode}</span>
          </div>
        </div>

        <div className="mt-8 grid gap-4 rounded-lg border border-stone-200 bg-brand-cream p-5 text-sm sm:grid-cols-3">
          <div>
            <p className="text-xs font-bold uppercase text-stone-500">Metode</p>
            <p className="mt-1 font-bold text-brand-cocoa">{receipt.paymentMethod}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-stone-500">Rekening</p>
            <p className="mt-1 font-bold text-brand-cocoa">{receipt.account}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-stone-500">Kontak</p>
            <p className="mt-1 font-bold text-brand-cocoa">{receipt.customerPhone}</p>
          </div>
        </div>

        <div className="mt-12 grid gap-8 text-sm sm:grid-cols-2">
          <div>
            <p className="font-semibold text-stone-500">Penyetor</p>
            <div className="mt-16 border-t border-stone-300 pt-2 font-bold text-brand-cocoa">{receipt.receivedFrom}</div>
          </div>
          <div>
            <p className="font-semibold text-stone-500">Admin El Massa</p>
            <div className="mt-16 border-t border-stone-300 pt-2 font-bold text-brand-cocoa">{receipt.staff}</div>
          </div>
        </div>
        </section>
      </section>
    </AppShell>
  );
}
