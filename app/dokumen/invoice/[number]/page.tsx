"use client";

import { use, useEffect, useState } from "react";
import { ArrowLeft, Printer } from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";

type InvoiceDetail = {
  id: string;
  number: string;
  bookingCode: string;
  customer: string;
  phone: string;
  address: string;
  packageName: string;
  participants: number;
  issueDate: string;
  dueDate: string;
  subtotal: number;
  discountAmount: number;
  total: number;
  paid: number;
  remaining: number;
  status: "Lunas" | "Sebagian" | "Belum Bayar";
};

type PaymentRow = {
  id: string;
  date: string;
  amount: number;
  method: string;
  notes: string;
  createdAt: string;
};

type HistoryLog = {
  date: string;
  description: string;
  nominal: string;
  notes: string;
  remainingTotal: string;
};

type InvoiceDetailPageProps = {
  params: Promise<{
    number: string;
  }>;
};

export default function MinimalistEditorialInvoicePage({ params }: InvoiceDetailPageProps) {
  const { number } = use(params);
  const decodedNumber = decodeURIComponent(number);

  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
  const [historyLogs, setHistoryLogs] = useState<HistoryLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/invoices/${decodedNumber}`)
      .then(async (res) => {
        if (!res.ok) {
          setNotFound(true);
          return null;
        }
        const json = await res.json();
        return json.data as InvoiceDetail;
      })
      .then((data) => {
        if (!data) return;
        setInvoice(data);

        fetch(`/api/payments?bookingCode=${encodeURIComponent(data.bookingCode)}`)
          .then((res) => res.json())
          .then((json) => {
            const payments = ((json.data ?? []) as PaymentRow[])
              .slice()
              .sort((a, b) => a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt));

            let runningPaid = 0;
            const logs: HistoryLog[] = payments.map((p) => {
              runningPaid += Number(p.amount);
              const remaining = Math.max(data.total - runningPaid, 0);
              return {
                date: p.date,
                description: `Pembayaran (${p.method})`,
                nominal: `Rp ${Number(p.amount).toLocaleString("id-ID")}`,
                notes: p.notes || "-",
                remainingTotal: remaining <= 0 ? "Rp 0 (LUNAS)" : `Rp ${remaining.toLocaleString("id-ID")}`,
              };
            });

            setHistoryLogs(
              logs.length > 0
                ? logs
                : [
                    {
                      date: data.issueDate,
                      description: "Invoice diterbitkan",
                      nominal: "Rp 0",
                      notes: "Belum ada pembayaran",
                      remainingTotal: `Rp ${data.total.toLocaleString("id-ID")}`,
                    },
                  ],
            );
          })
          .catch((e) => console.error(e));
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, [decodedNumber]);

  if (loading) {
    return (
      <AppShell eyebrow="Dokumen Keuangan" title="Memuat Invoice...">
        <p className="text-xs text-stone-400">Memuat invoice...</p>
      </AppShell>
    );
  }

  if (notFound || !invoice) {
    return (
      <AppShell eyebrow="Dokumen Keuangan" title="Invoice Tidak Ditemukan">
        <div className="rounded-2xl border border-stone-200/70 bg-white p-8 text-center space-y-3">
          <p className="text-sm font-semibold text-stone-700">Invoice {decodedNumber} tidak ditemukan.</p>
          <Link href="/dokumen/invoice" className="inline-flex text-xs font-semibold text-brand-pink hover:underline">
            Kembali ke daftar invoice
          </Link>
        </div>
      </AppShell>
    );
  }

  const pricePerPax = Math.round(invoice.subtotal / Math.max(invoice.participants, 1));

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

        {/* 📄 MINIMALIST EDITORIAL INVOICE SHEET */}
        <section className="mx-auto max-w-4xl rounded-xl border border-stone-300 bg-[#f4f6f0] p-8 sm:p-12 text-stone-900 shadow-md space-y-8 font-sans">

          <div className="w-full pb-2 border-b border-stone-800">
            <img
              src="/kop-surat-el-massa.png"
              alt="Kop Surat Resmi PT Al Massa Azka Wisata"
              className="w-full max-w-full h-auto object-contain block mx-auto rounded-none"
            />
          </div>

          <div className="grid gap-6 sm:grid-cols-3 items-end pt-2">
            <div className="space-y-1 text-xs">
              <p className="font-bold uppercase tracking-wider text-stone-500 text-[11px]">Invoice to</p>
              <p className="font-extrabold text-sm text-stone-950">{invoice.customer}</p>
              <p className="text-stone-700">{invoice.address || "-"}</p>
              <p className="font-mono text-stone-600 text-[11px]">{invoice.phone}</p>
            </div>

            <div className="space-y-1 text-xs">
              <p className="font-bold uppercase tracking-wider text-stone-500 text-[11px]">Tanggal Terbit</p>
              <p className="font-bold text-sm text-stone-900">{invoice.issueDate}</p>
              <p className="text-[11px] font-semibold text-stone-600">Kode Booking: <span className="font-mono font-bold text-stone-900">{invoice.bookingCode}</span></p>
            </div>

            <div className="sm:text-right">
              <h1 className="text-5xl sm:text-6xl font-black tracking-tighter text-stone-950 font-serif">
                Invoice<span className="text-brand-pink">.</span>
              </h1>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">Rincian Paket</h3>
            <div className="overflow-hidden border border-stone-800 rounded-sm">
              <table className="w-full border-collapse text-left text-xs divide-y divide-stone-800">
                <thead className="bg-[#e9ebe4] font-bold text-stone-900 border-b border-stone-800">
                  <tr>
                    <th className="p-3 border-r border-stone-800">Pilihan Paket</th>
                    <th className="p-3 text-right border-r border-stone-800 w-32">Harga / Pax</th>
                    <th className="p-3 text-center border-r border-stone-800 w-16">Jumlah</th>
                    <th className="p-3 text-right w-36">Total Harga</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800 font-medium">
                  <tr className="bg-transparent">
                    <td className="p-3 border-r border-stone-800 font-bold text-stone-950">{invoice.packageName}</td>
                    <td className="p-3 text-right border-r border-stone-800 font-mono">Rp {pricePerPax.toLocaleString("id-ID")}</td>
                    <td className="p-3 text-center border-r border-stone-800 font-bold">{invoice.participants} Pax</td>
                    <td className="p-3 text-right font-mono font-bold text-stone-950">Rp {invoice.subtotal.toLocaleString("id-ID")}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

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
                  {historyLogs.map((log, lIdx) => (
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

          <div className="rounded-sm border-l-4 border-stone-900 bg-[#eef0ea] p-3 text-xs space-y-0.5">
            <p className="font-extrabold uppercase tracking-wider text-stone-900">Catatan :</p>
            <p className="font-semibold text-stone-800">
              Pelunasan paling lambat 30 Hari sebelum keberangkatan rombongan. Dokumen kuitansi resmi hanya berlaku setelah diverifikasi oleh kasir keuangan.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 pt-2 items-start">
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

            <div className="space-y-3 text-xs sm:pl-8">
              <div className="flex items-center justify-between py-1 border-b border-stone-300">
                <span className="font-bold text-stone-700">Diskon :</span>
                <span className="font-mono font-bold text-stone-900">Rp {invoice.discountAmount.toLocaleString("id-ID")}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-stone-300">
                <span className="font-bold text-stone-700">Total Pembayaran (Terbayar) :</span>
                <span className="font-mono font-bold text-emerald-800 text-sm">Rp {invoice.paid.toLocaleString("id-ID")}</span>
              </div>

              <div className="flex items-center justify-between py-2 border-b-2 border-stone-900 font-extrabold text-sm">
                <span className="text-stone-950 uppercase tracking-wider">Sisa Pelunasan :</span>
                <span className="font-mono text-brand-pink text-lg">Rp {invoice.remaining.toLocaleString("id-ID")}</span>
              </div>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 pt-4 items-end border-t border-stone-800">
            <div className="space-y-1">
              <h3 className="text-2xl font-black text-stone-950 font-serif">Terima Kasih!</h3>
              <p className="text-xs font-semibold italic text-stone-700">
                Semoga Perjalanan Ibadah Umrah Anda Dipermudah oleh Allah SWT
              </p>
            </div>

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
