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
    participants?: number;
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

          {/* 📄 FORMAT RESMI KWITANSI EL MASSA TOUR & TRAVEL */}
          <article className="receipt-print mx-auto w-full max-w-[920px] border border-black bg-white p-6 sm:p-8 text-black shadow-sm font-sans space-y-3 print:shadow-none print:border-none print:p-0 print:m-0 print:max-w-none">
            {/* Box Atas: Logo Kiri & Kotak Penerima Kanan */}
            <div className="grid grid-cols-[38%_62%] border border-black">
              <div className="flex items-center justify-center p-3 border-r border-black">
                <img
                  src="/logo-el-massa-horizontal.png"
                  alt="El Massa Tour & Travel"
                  className="h-16 w-auto object-contain"
                />
              </div>

              <div className="flex flex-col text-xs font-sans">
                <div className="p-1.5 border-b border-black text-stone-600 text-[11px]">
                  Telah diterima Dari:
                </div>
                <div className="p-1.5 border-b border-black font-extrabold uppercase text-sm tracking-wide text-stone-950">
                  {receipt.receivedFrom}
                </div>
                <div className="h-5 border-b border-black"></div>
                <div className="h-5"></div>
              </div>
            </div>

            {/* Banner Judul Pink: KWITANSI */}
            <div className="w-full bg-[#fce7f3] border border-black py-1 text-center">
              <h1 className="text-base sm:text-lg font-black tracking-widest uppercase text-stone-950 font-serif">
                KWITANSI
              </h1>
            </div>

            {/* Tanggal */}
            <div className="text-xs font-semibold text-stone-900 pt-0.5">
              <span>Tanggal:{receipt.date}</span>
            </div>

            {/* Tabel Transaksi */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-black text-xs text-left">
                <thead>
                  <tr className="border-b border-black text-center font-bold">
                    <th className="border-r border-black p-1.5 w-16">UNIT</th>
                    <th className="border-r border-black p-1.5">DESKRIPSI</th>
                    <th className="border-r border-black p-1.5 w-28">TANGGAL</th>
                    <th className="border-r border-black p-1.5 w-36">UANG SEJUMLAH</th>
                    <th className="p-1.5 w-28">KETERANGAN</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-black font-medium">
                    <td className="border-r border-black p-1.5 text-center font-bold">
                      {payment.participants ? `${payment.participants} PAX` : "1 PAX"}
                    </td>
                    <td className="border-r border-black p-1.5 font-semibold">
                      {receipt.paymentFor || `Pembayaran Paket ${payment.packageName}`}
                    </td>
                    <td className="border-r border-black p-1.5 text-center font-mono">
                      {receipt.date}
                    </td>
                    <td className="border-r border-black p-1.5 font-mono font-bold">
                      <div className="flex justify-between px-1">
                        <span>Rp</span>
                        <span>{receipt.amount.toLocaleString("id-ID")}</span>
                      </div>
                    </td>
                    <td className="p-1.5 text-center font-bold uppercase">
                      {receipt.paymentMethod.toUpperCase().includes("TUNAI") ? "TUNAI" : "TRANSFER"}
                    </td>
                  </tr>

                  {/* 5 baris kosong bergaris ledger mengikuti template resmi */}
                  <tr className="border-b border-black h-5">
                    <td className="border-r border-black"></td><td className="border-r border-black"></td><td className="border-r border-black"></td><td className="border-r border-black"></td><td></td>
                  </tr>
                  <tr className="border-b border-black h-5">
                    <td className="border-r border-black"></td><td className="border-r border-black"></td><td className="border-r border-black"></td><td className="border-r border-black"></td><td></td>
                  </tr>
                  <tr className="border-b border-black h-5">
                    <td className="border-r border-black"></td><td className="border-r border-black"></td><td className="border-r border-black"></td><td className="border-r border-black"></td><td></td>
                  </tr>
                  <tr className="border-b border-black h-5">
                    <td className="border-r border-black"></td><td className="border-r border-black"></td><td className="border-r border-black"></td><td className="border-r border-black"></td><td></td>
                  </tr>
                  <tr className="border-b border-black h-5">
                    <td className="border-r border-black"></td><td className="border-r border-black"></td><td className="border-r border-black"></td><td className="border-r border-black"></td><td></td>
                  </tr>

                  {/* Baris Total Pembayaran Pink */}
                  <tr className="bg-[#fce7f3] border-t-2 border-black font-bold">
                    <td colSpan={3} className="border-r border-black p-1.5 text-center font-extrabold text-xs">
                      Total Pembayaran
                    </td>
                    <td className="border-r border-black p-1.5 font-mono font-extrabold text-xs">
                      <div className="flex justify-between px-1">
                        <span>Rp</span>
                        <span>{receipt.amount.toLocaleString("id-ID")}</span>
                      </div>
                    </td>
                    <td className="p-1.5"></td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Bagian Bawah: Terbilang, Metode, & TTD Stempel */}
            <div className="grid grid-cols-[65%_35%] pt-3 items-start gap-4">
              <div className="space-y-3 text-xs">
                <div>
                  <p className="text-[10px] font-bold text-stone-600 tracking-wider">TERBILANG</p>
                  <p className="font-extrabold uppercase text-stone-950 text-xs">
                    &ldquo;{receipt.amountWords.toUpperCase()}&rdquo;
                  </p>
                </div>

                <div className="space-y-0.5">
                  <p className="text-[10px] font-bold text-stone-600 tracking-wider">DIBAYARKAN</p>
                  <p className="font-extrabold uppercase text-stone-950 text-xs">
                    {receipt.paymentMethod.toUpperCase().includes("TUNAI")
                      ? "SECARA TUNAI DI KANTOR ELMASSA"
                      : `TRANSFER KE REKENING PT. ALMASSA AZKA WISATA`}
                  </p>
                  <p className="font-extrabold text-xs text-stone-950 uppercase pt-0.5 font-sans">
                    PT. ALMASSA AZKA WISATA
                  </p>
                </div>
              </div>

              {/* Tanda Tangan & Stempel Resmi */}
              <div className="text-center flex flex-col items-center">
                <img
                  src="/stempel-ttd-el-massa.png"
                  alt="Stempel & Tanda Tangan Direktur PT Al Massa Azka Wisata"
                  className="h-24 w-auto object-contain my-[-6px]"
                />
                <p className="text-xs font-bold uppercase text-stone-950 underline underline-offset-2">
                  AZRIANDRI.LC
                </p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-stone-700">
                  DIREKTUR
                </p>
              </div>
            </div>
          </article>
        </section>
        )}

        <style jsx global>{`
          @media print {
            body {
              background: white !important;
            }
            @page {
              size: A4 landscape;
              margin: 8mm;
            }
          }
        `}</style>
      </div>
    </AppShell>
  );
}
