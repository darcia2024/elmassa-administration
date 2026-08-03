"use client";

import { use } from "react";
import { ArrowLeft, CheckCircle2, Download, Printer } from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";

type InvoiceItemDetail = {
  number: string;
  bookingCode: string;
  customer: string;
  phone: string;
  address: string;
  issueDate: string;
  dueDate: string;
  status: "Lunas" | "Sebagian" | "Belum Bayar";
  packageName: string;
  packagePrice: string;
  paxQty: number;
  roomUpgrade: string;
  packageTotal: string;
  historyLogs: {
    date: string;
    description: string;
    nominal: string;
    notes: string;
    remainingTotal: string;
  }[];
  discountDisplay: string;
  totalPaidDisplay: string;
  totalDueDisplay: string;
};

import React, { useEffect, useState } from "react";

const emptyInvoice: InvoiceItemDetail = {
  number: "INV-0000-00",
  bookingCode: "-",
  customer: "- (Belum Ada Data)",
  phone: "-",
  address: "Bangka Belitung",
  issueDate: "Hari ini",
  dueDate: "Terjadwal",
  status: "Belum Bayar",
  packageName: "-",
  packagePrice: "Rp 0",
  paxQty: 1,
  roomUpgrade: "Quad Standard (Rp 0)",
  packageTotal: "Rp 0",
  historyLogs: [],
  discountDisplay: "Rp 0",
  totalPaidDisplay: "Rp 0",
  totalDueDisplay: "Rp 0",
};

type InvoiceDetailPageProps = {
  params: Promise<{
    number: string;
  }>;
};

export default function MinimalistEditorialInvoicePage({ params }: InvoiceDetailPageProps) {
  const resolvedParams = use(params);
  const decodedNumber = decodeURIComponent(resolvedParams.number);

  const [invoice, setInvoice] = useState<InvoiceItemDetail>(() => ({
    ...emptyInvoice,
    number: decodedNumber.startsWith("INV-") ? decodedNumber : `INV-${decodedNumber}`,
    bookingCode: decodedNumber,
  }));

  useEffect(() => {
    try {
      const savedStr = localStorage.getItem("el_massa_real_bookings");
      if (savedStr) {
        const savedBookings = JSON.parse(savedStr);
        if (Array.isArray(savedBookings) && savedBookings.length > 0) {
          const found =
            savedBookings.find(
              (b: any) =>
                b.code === decodedNumber ||
                `INV-${b.code}` === decodedNumber ||
                decodedNumber.includes(b.code) ||
                b.code.includes(decodedNumber)
            ) || savedBookings[0];

          if (found) {
            const pax = found.participants || 1;
            const total = found.totalAmount || 0;
            const pricePerPax = Math.round(total / pax);
            const paid = found.paidAmount || 0;
            const remaining = found.remainingAmount ?? Math.max(0, total - paid);

            const logs: InvoiceItemDetail["historyLogs"] = [];
            if (paid > 0) {
              logs.push({
                date: found.createdDate || "Hari ini",
                description: "Pembayaran DP / Cicilan Booking",
                nominal: found.paidDisplay || `Rp ${paid.toLocaleString("id-ID")}`,
                notes: "Transfer Bank El Massa (Terverifikasi Kasir)",
                remainingTotal: remaining <= 0 ? "Rp 0 (LUNAS)" : `Rp ${remaining.toLocaleString("id-ID")}`,
              });
            }
            if (remaining <= 0 && paid > 0) {
              logs.push({
                date: found.createdDate || "Hari ini",
                description: "Pelunasan Tahap Akhir",
                nominal: found.paidDisplay || `Rp ${paid.toLocaleString("id-ID")}`,
                notes: "Verifikasi Tim Keuangan (Lunas 100%)",
                remainingTotal: "Rp 0 (LUNAS)",
              });
            }

            setInvoice({
              number: `INV-${found.code}`,
              bookingCode: found.code,
              customer: found.customer || "Jamaah Terdaftar",
              phone: found.phone || "-",
              address: found.address || "Selindung Baru, Pangkalpinang",
              issueDate: found.createdDate || new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" }),
              dueDate: found.departure || "Terjadwal 2026",
              status: remaining <= 0 ? "Lunas" : paid > 0 ? "Sebagian" : "Belum Bayar",
              packageName: found.packageName || "Umrah Spesial El Massa",
              packagePrice: `Rp ${pricePerPax.toLocaleString("id-ID")}`,
              paxQty: pax,
              roomUpgrade: "Quad Standard (Rp 0)",
              packageTotal: found.totalDisplay || `Rp ${total.toLocaleString("id-ID")}`,
              historyLogs: logs.length > 0 ? logs : [
                {
                  date: found.createdDate || "Hari ini",
                  description: "Registrasi Booking Baru",
                  nominal: "Rp 0",
                  notes: "Belum Pembayaran",
                  remainingTotal: found.totalDisplay || `Rp ${total.toLocaleString("id-ID")}`,
                }
              ],
              discountDisplay: "Rp 0",
              totalPaidDisplay: found.paidDisplay || `Rp ${paid.toLocaleString("id-ID")}`,
              totalDueDisplay: found.remainingDisplay || `Rp ${remaining.toLocaleString("id-ID")}`,
            });
          }
        }
      }
    } catch (e) {
      console.error("Failed loading invoice from real bookings:", e);
    }
  }, [decodedNumber]);

  return (
    <AppShell eyebrow="Dokumen Keuangan" title={`Invoice ${invoice.number}`}>
      <div className="space-y-5">
        
        {/* Top Control Bar */}
        <div className="flex items-center justify-between">
          <Link
            href="/dokumen/invoice"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-brand-pink transition"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
            <span>Kembali ke Daftar Invoice</span>
          </Link>

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-stone-900 px-4 text-xs font-semibold text-white shadow-2xs hover:bg-black transition"
          >
            <Printer className="h-4 w-4" strokeWidth={1.5} />
            <span>Cetak Invoice</span>
          </button>
        </div>

        {/* 📄 MINIMALIST EDITORIAL INVOICE SHEET (LENGKAP PERSIS REFERENSI DOKUMEN EL MASSA) */}
        <section className="mx-auto max-w-4xl rounded-xl border border-stone-300 bg-[#f4f6f0] p-8 sm:p-12 text-stone-900 shadow-md space-y-8 font-sans">
          
          {/* OFFICIAL KOP SURAT IMAGE RESMI EL MASSA */}
          <div className="w-full pb-2 border-b border-stone-800">
            <img
              src="/kop-surat-el-massa.png"
              alt="Kop Surat Resmi PT Al Massa Azka Wisata"
              className="w-full max-w-full h-auto object-contain block mx-auto rounded-none"
            />
          </div>

          {/* INVOICE META & GIANT INVOICE TITLE */}
          <div className="grid gap-6 sm:grid-cols-3 items-end pt-2">
            
            {/* Invoice to */}
            <div className="space-y-1 text-xs">
              <p className="font-bold uppercase tracking-wider text-stone-500 text-[11px]">Invoice to</p>
              <p className="font-extrabold text-sm text-stone-950">{invoice.customer}</p>
              <p className="text-stone-700">{invoice.address}</p>
              <p className="font-mono text-stone-600 text-[11px]">{invoice.phone}</p>
            </div>

            {/* Tanggal */}
            <div className="space-y-1 text-xs">
              <p className="font-bold uppercase tracking-wider text-stone-500 text-[11px]">Tanggal Terbit</p>
              <p className="font-bold text-sm text-stone-900">{invoice.issueDate}</p>
              <p className="text-[11px] font-semibold text-stone-600">Kode Booking: <span className="font-mono font-bold text-stone-900">{invoice.bookingCode}</span></p>
            </div>

            {/* Giant Title */}
            <div className="sm:text-right">
              <h1 className="text-5xl sm:text-6xl font-black tracking-tighter text-stone-950 font-serif">
                Invoice<span className="text-brand-pink">.</span>
              </h1>
            </div>

          </div>

          {/* TABEL 1: PILIHAN PAKET (PACKAGE SELECTION TABLE) */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">Rincian Paket & Pilihan Kamar</h3>
            <div className="overflow-hidden border border-stone-800 rounded-sm">
              <table className="w-full border-collapse text-left text-xs divide-y divide-stone-800">
                <thead className="bg-[#e9ebe4] font-bold text-stone-900 border-b border-stone-800">
                  <tr>
                    <th className="p-3 border-r border-stone-800">Pilihan Paket</th>
                    <th className="p-3 text-right border-r border-stone-800 w-32">Harga Paket</th>
                    <th className="p-3 text-center border-r border-stone-800 w-16">Jumlah</th>
                    <th className="p-3 text-center border-r border-stone-800 w-36">Upgrade Kamar</th>
                    <th className="p-3 text-right w-36">Total Harga</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800 font-medium">
                  <tr className="bg-transparent">
                    <td className="p-3 border-r border-stone-800 font-bold text-stone-950">{invoice.packageName}</td>
                    <td className="p-3 text-right border-r border-stone-800 font-mono">{invoice.packagePrice}</td>
                    <td className="p-3 text-center border-r border-stone-800 font-bold">{invoice.paxQty} Pax</td>
                    <td className="p-3 text-center border-r border-stone-800 font-semibold text-stone-700">{invoice.roomUpgrade}</td>
                    <td className="p-3 text-right font-mono font-bold text-stone-950">{invoice.packageTotal}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* TABEL 2: RIWAYAT PEMBAYARAN & CICILAN (PAYMENT HISTORY LOG TABLE) */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">Riwayat Transaksi Pembayaran & Cicilan</h3>
            <div className="overflow-hidden border border-stone-800 rounded-sm">
              <table className="w-full border-collapse text-left text-xs divide-y divide-stone-800">
                <thead className="bg-[#e9ebe4] font-bold text-stone-900 border-b border-stone-800">
                  <tr>
                    <th className="p-3 border-r border-stone-800 w-28">Tanggal</th>
                    <th className="p-3 border-r border-stone-800">Deskripsi</th>
                    <th className="p-3 text-right border-r border-stone-800 w-32">Nominal</th>
                    <th className="p-3 border-r border-stone-800">Keterangan</th>
                    <th className="p-3 text-right w-36">Sisa Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800 font-medium bg-rose-50/20">
                  {invoice.historyLogs.map((log, lIdx) => (
                    <tr key={lIdx}>
                      <td className="p-3 border-r border-stone-800 font-mono font-bold text-stone-900">{log.date}</td>
                      <td className="p-3 border-r border-stone-800 font-semibold text-stone-900">{log.description}</td>
                      <td className="p-3 text-right border-r border-stone-800 font-mono font-bold text-emerald-800">{log.nominal}</td>
                      <td className="p-3 border-r border-stone-800 text-stone-700">{log.notes}</td>
                      <td className="p-3 text-right font-mono font-bold text-stone-950">{log.remainingTotal}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* CATATAN PELUNASAN (TERMS) */}
          <div className="rounded-sm border-l-4 border-stone-900 bg-[#eef0ea] p-3 text-xs space-y-0.5">
            <p className="font-extrabold uppercase tracking-wider text-stone-900">Catatan :</p>
            <p className="font-semibold text-stone-800">
              Pelunasan paling lambat 30 Hari sebelum keberangkatan rombongan. Dokumen kuitansi resmi hanya berlaku setelah diverifikasi oleh kasir keuangan.
            </p>
          </div>

          {/* SECTION BAWAH: REKENING PEMBAYARAN & TOTAL KALKULASI */}
          <div className="grid gap-6 sm:grid-cols-2 pt-2 items-start">
            
            {/* Kiri: Rekening Pembayaran Resmi BTN & PT. ALMASSA AZKA WISATA */}
            <div className="rounded-sm border border-stone-800 bg-white p-4 space-y-2 text-xs">
              <p className="font-semibold text-stone-600">Silahkan Melakukan Pembayaran Melalui Rekening Berikut :</p>
              <div className="border-t border-stone-200 pt-2 space-y-1 font-mono">
                <p className="text-lg font-black tracking-wider text-stone-950">20901880001965</p>
                <p className="font-bold text-stone-900">Bank BTN</p>
                <p className="font-bold text-brand-pink text-xs uppercase">PT. ALMASSA AZKA WISATA</p>
              </div>
              <p className="text-[10px] text-stone-500 pt-1 border-t border-stone-100">
                Atau Rekening BCA: 534-567-8901 (a.n PT. ALMASSA AZKA WISATA)
              </p>
            </div>

            {/* Kanan: Diskon, Total Pembayaran & Sisa Pelunasan */}
            <div className="space-y-3 text-xs sm:pl-8">
              <div className="flex items-center justify-between py-1 border-b border-stone-300">
                <span className="font-bold text-stone-700">Diskon :</span>
                <span className="font-mono font-bold text-stone-900">{invoice.discountDisplay}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-stone-300">
                <span className="font-bold text-stone-700">Total Pembayaran (Terbayar) :</span>
                <span className="font-mono font-bold text-emerald-800 text-sm">{invoice.totalPaidDisplay}</span>
              </div>

              <div className="flex items-center justify-between py-2 border-b-2 border-stone-900 font-extrabold text-sm">
                <span className="text-stone-950 uppercase tracking-wider">Sisa Pelunasan :</span>
                <span className="font-mono text-brand-pink text-lg">{invoice.totalDueDisplay}</span>
              </div>
            </div>

          </div>

          {/* CLOSING GREETING & SIGNATURE BLOCK */}
          <div className="grid gap-6 sm:grid-cols-2 pt-4 items-end border-t border-stone-800">
            
            {/* Left: Closing Islamic Greeting */}
            <div className="space-y-1">
              <h3 className="text-2xl font-black text-stone-950 font-serif">Terima Kasih!</h3>
              <p className="text-xs font-semibold italic text-stone-700">
                Semoga Perjalanan Ibadah Umrah Anda Dipermudah oleh Allah SWT
              </p>
            </div>

            {/* Right: Signature Azriandri */}
            <div className="text-right space-y-2 sm:pl-12">
              <div className="inline-block text-center">
                <svg className="h-16 w-44 mx-auto text-stone-900" viewBox="0 0 200 70" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 45 C30 10, 50 65, 75 25 C90 5, 110 55, 135 20 C145 35, 160 15, 185 40 M45 40 L165 40" />
                </svg>
                <p className="text-sm font-extrabold text-stone-950 tracking-tight">Azriandri</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-stone-600">
                  CEO / Founder
                </p>
              </div>
            </div>

          </div>

        </section>

      </div>
    </AppShell>
  );
}
