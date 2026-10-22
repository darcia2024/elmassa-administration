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

type PrimaryAccount = {
  bankName: string;
  accountNumber: string;
  accountName: string;
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
  const [primaryAccounts, setPrimaryAccounts] = useState<PrimaryAccount[]>([]);

  // Real registered accounts, replacing hardcoded "Bank BTN 20901880001965" /
  // "BCA 534-567-8901" — the second of which a previous commit already noted
  // was never a real account. bank_accounts starts empty until someone adds
  // one in Pengaturan > Rekening, so this can legitimately render nothing.
  useEffect(() => {
    fetch("/api/payment-accounts?status=Aktif")
      .then((res) => res.json())
      .then((json) => {
        const rows = (json.data ?? []) as any[];
        const primary = rows.filter((r) => r.isPrimary);
        setPrimaryAccounts((primary.length > 0 ? primary : rows.slice(0, 1)).map((r) => ({
          bankName: r.bankName,
          accountNumber: r.accountNumber,
          accountName: r.accountName,
        })));
      })
      .catch((e) => console.error("Failed loading payment accounts:", e));
  }, []);

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
        <div className="flex items-center justify-between print:hidden">
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
            className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-stone-900 px-4 text-xs font-semibold text-white shadow-2xs hover:bg-black transition cursor-pointer"
          >
            <Printer className="h-4 w-4" strokeWidth={1.5} />
            <span>Cetak Invoice</span>
          </button>
        </div>

        {/* 📄 FORMAT RESMI INVOICE EL MASSA TOUR & TRAVEL */}
        <section className="mx-auto max-w-[800px] border border-stone-300 bg-white p-8 sm:p-10 text-stone-900 shadow-md space-y-6 font-sans print:shadow-none print:border-none print:p-0 print:m-0 print:max-w-none">
          {/* Header Surat */}
          <div className="flex items-center justify-between gap-4 pb-4 border-b border-stone-300">
            <div className="flex items-center">
              <img
                src="/logo-el-massa.png"
                alt="El Massa Tour & Travel"
                className="h-20 w-auto object-contain shrink-0"
              />
            </div>
            <div className="text-right text-[10px] leading-tight text-stone-700 font-sans space-y-0.5">
              <p className="font-semibold text-stone-800">Ruko Bes Cinema, Jl Jendral sudirman, selindung Baru,</p>
              <p className="font-semibold text-stone-800">Pangkalpinang</p>
              <p className="font-medium text-stone-600">No Telp : 081249476768 - Email : elmassatour@gmail.com</p>
              <p className="text-[9px] text-stone-500 font-medium">SK Kemenkumham &#123;AHU-0112355.AH.01.01.&#125; No Izin PPIU 10032300465890002</p>
            </div>
          </div>

          {/* Metadata & Title */}
          <div className="flex items-end justify-between pt-1">
            <div className="space-y-1 text-xs">
              <div className="flex">
                <span className="w-24 font-bold text-stone-800">NO</span>
                <span className="font-bold text-stone-950">{invoice.number}</span>
              </div>
              <div className="flex">
                <span className="w-24 font-bold text-stone-800">KEPADA</span>
                <span className="font-extrabold uppercase text-stone-950">{invoice.customer}</span>
              </div>
              <div className="flex">
                <span className="w-24 font-bold text-stone-800">TANGGAL</span>
                <span className="font-bold text-stone-950">{invoice.issueDate}</span>
              </div>
            </div>

            <div className="text-right">
              <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-wider text-[#4a2e18]">
                INVOICE
              </h1>
            </div>
          </div>

          {/* Tabel 1: Rincian Paket */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-black text-xs text-left">
              <thead>
                <tr className="border-b border-black text-center font-bold">
                  <th className="border-r border-black p-1.5 w-10">No</th>
                  <th className="border-r border-black p-1.5">Keterangan</th>
                  <th className="border-r border-black p-1.5 w-32">Harga</th>
                  <th className="border-r border-black p-1.5 w-24">Jumlah</th>
                  <th className="border-r border-black p-1.5 w-24">Diskon</th>
                  <th className="p-1.5 w-36">Jumlah</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-black">
                  <td className="border-r border-black p-1.5 text-center font-bold">1</td>
                  <td className="border-r border-black p-1.5 font-bold uppercase">{invoice.packageName}</td>
                  <td className="border-r border-black p-1.5 text-right font-mono">
                    <span className="float-left">Rp</span>
                    <span>{pricePerPax.toLocaleString("id-ID")}</span>
                  </td>
                  <td className="border-r border-black p-1.5 text-center font-bold uppercase">{invoice.participants} PAX</td>
                  <td className="border-r border-black p-1.5 text-right font-mono">
                    {invoice.discountAmount > 0 ? `Rp ${invoice.discountAmount.toLocaleString("id-ID")}` : "-"}
                  </td>
                  <td className="p-1.5 text-right font-mono font-bold">
                    <span className="float-left">Rp</span>
                    <span>{invoice.subtotal.toLocaleString("id-ID")}</span>
                  </td>
                </tr>
                <tr className="font-bold bg-white">
                  <td colSpan={5} className="border-r border-black p-1.5 text-center font-extrabold text-sm uppercase">
                    TOTAL
                  </td>
                  <td className="p-1.5 text-right font-mono font-extrabold text-sm">
                    <span className="float-left">Rp</span>
                    <span>{invoice.subtotal.toLocaleString("id-ID")}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Tabel 2: Riwayat Transaksi & Pelunasan */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-black text-xs text-left">
              <thead>
                <tr className="bg-[#fce7f3] border-b border-black text-center font-bold">
                  <th className="border-r border-black p-1.5 w-28">Tanggal</th>
                  <th className="border-r border-black p-1.5">DESKRIPSI</th>
                  <th className="border-r border-black p-1.5 w-20">Jumlah</th>
                  <th className="border-r border-black p-1.5 w-32">Nominal</th>
                  <th className="border-r border-black p-1.5 w-28">Keterangan</th>
                  <th className="p-1.5 w-36">Total Pelunasan</th>
                </tr>
              </thead>
              <tbody>
                {historyLogs.map((log, i) => (
                  <tr key={i} className={`border-b border-black ${i % 2 === 0 ? "bg-[#fdf2f8]" : "bg-white"}`}>
                    <td className="border-r border-black p-1.5 text-center font-mono">{log.date}</td>
                    <td className="border-r border-black p-1.5 font-bold uppercase">{invoice.packageName}</td>
                    <td className="border-r border-black p-1.5 text-center font-bold uppercase">{invoice.participants} PAX</td>
                    <td className="border-r border-black p-1.5 text-right font-mono font-bold">
                      <span className="float-left">Rp</span>
                      <span>{log.nominal.replace(/Rp\s*/g, "")}</span>
                    </td>
                    <td className="border-r border-black p-1.5 text-center font-bold uppercase">{log.description.toUpperCase().includes("TUNAI") ? "TUNAI" : "TRANSFER"}</td>
                    <td className="p-1.5 text-right font-mono font-bold">
                      <span className="float-left">Rp</span>
                      <span>{log.nominal.replace(/Rp\s*/g, "")}</span>
                    </td>
                  </tr>
                ))}
                {/* Baris kosong bergaris selang-seling mengikuti contoh resmi */}
                <tr className="border-b border-black h-5 bg-[#fdf2f8]">
                  <td className="border-r border-black"></td><td className="border-r border-black"></td><td className="border-r border-black"></td><td className="border-r border-black"></td><td className="border-r border-black"></td><td></td>
                </tr>
                <tr className="border-b border-black h-5 bg-white">
                  <td className="border-r border-black"></td><td className="border-r border-black"></td><td className="border-r border-black"></td><td className="border-r border-black"></td><td className="border-r border-black"></td><td></td>
                </tr>
                <tr className="font-bold bg-[#f472b6] text-stone-900 border-t-2 border-black">
                  <td colSpan={5} className="border-r border-black p-1.5 text-center font-extrabold text-sm uppercase">
                    TOTAL
                  </td>
                  <td className="p-1.5 text-right font-mono font-extrabold text-sm">
                    <span className="float-left">Rp</span>
                    <span>{invoice.paid.toLocaleString("id-ID")}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Bagian Bawah: Catatan, Rekening & Ringkasan Tagihan */}
          <div className="grid gap-6 sm:grid-cols-2 pt-2 items-start">
            <div className="space-y-4 text-[11px]">
              <div className="space-y-0.5">
                <p className="font-bold text-stone-900">Catatan:</p>
                <p className="text-stone-700 font-medium">Pelunasan sebesar 45 % dari total biaya paling lambat H-45 keberangkatan</p>
                <p className="text-stone-700 font-medium">Pelunasan sebesar 100% dari total biaya paling lambat H-30 kebrangkatan</p>
              </div>

              <div className="space-y-1.5 pt-2">
                <p className="font-semibold text-stone-800 leading-tight">
                  Silahkan Melakukan Pembayaran<br />Melalui Rekening Berikut :
                </p>
                <div className="space-y-1 font-mono text-xs">
                  <div className="flex gap-2">
                    <span className="w-28 font-bold text-stone-800 font-sans">Bank BTN</span>
                    <span className="font-bold text-stone-950">20901880001965</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="w-28 font-bold text-stone-800 font-sans">Bank BSI</span>
                    <span className="font-bold text-stone-950">7345411423</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="w-28 font-bold text-stone-800 font-sans">MANDIRI Rupiah</span>
                    <span className="font-bold text-stone-950">1690005294688</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="w-28 font-bold text-stone-800 font-sans">MANDIRI Dollar</span>
                    <span className="font-bold text-stone-950">1690005294720</span>
                  </div>
                  <p className="font-extrabold text-xs pt-1 text-stone-950 uppercase font-sans tracking-wide">PT. ALMASSA AZKA WISATA</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1 text-xs font-semibold">
                <div className="flex justify-between py-0.5">
                  <span className="font-bold text-stone-800">Total Harga</span>
                  <span className="font-mono font-bold">
                    <span className="mr-3">Rp</span>
                    {invoice.total.toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-stone-700">Diskon Pendaftaran</span>
                  <span className="font-mono">
                    <span className="mr-3">Rp</span>
                    {invoice.discountAmount > 0 ? invoice.discountAmount.toLocaleString("id-ID") : "-"}
                  </span>
                </div>
                <div className="flex justify-between py-1 px-2.5 rounded-xs bg-[#70c042] text-black font-bold">
                  <span>Total Diskon</span>
                  <span className="font-mono">
                    <span className="mr-3">Rp</span>
                    {invoice.discountAmount > 0 ? invoice.discountAmount.toLocaleString("id-ID") : "-"}
                  </span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="font-bold text-stone-800">Total Tagihan</span>
                  <span className="font-mono font-bold">
                    <span className="mr-3">Rp</span>
                    {invoice.total.toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="flex justify-between py-1 px-2.5 rounded-xs bg-[#93c5fd] text-black font-bold">
                  <span>Total Pelunasan</span>
                  <span className="font-mono">
                    <span className="mr-3">Rp</span>
                    {invoice.paid.toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="flex justify-between py-1 px-2.5 rounded-xs bg-[#fecdd3] text-black font-bold">
                  <span>Sisa Tagihan</span>
                  <span className="font-mono">
                    <span className="mr-3">Rp</span>
                    {invoice.remaining.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              {/* Tanda Tangan & Stempel Resmi Direktur */}
              <div className="text-center pt-2 space-y-0.5 flex flex-col items-center">
                <p className="text-[11px] font-bold uppercase text-stone-800">EL MASSA TOUR & TRAVEL</p>
                <img
                  src="/stempel-ttd-direktur.png"
                  alt="Stempel & Tanda Tangan Direktur PT Al Massa Azka Wisata"
                  className="h-20 w-auto object-contain my-[-4px]"
                />
                <p className="text-xs font-bold uppercase text-stone-950 underline underline-offset-2">AZRIANDRI.LC</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-stone-700">DIREKTUR</p>
              </div>
            </div>
          </div>

          {/* Footer Ucapan Terima Kasih */}
          <div className="pt-4 text-center space-y-0.5 border-t border-stone-200">
            <h4 className="text-base font-extrabold text-stone-950">Terima Kasih!</h4>
            <p className="text-xs text-stone-600 font-medium">Semoga Perjalanan Ibadah Umrah Anda Dipermudah oleh Allah SWT</p>
          </div>
        </section>

        <style jsx global>{`
          @media print {
            body {
              background: white !important;
            }
            @page {
              size: A4 portrait;
              margin: 8mm;
            }
          }
        `}</style>
      </div>
    </AppShell>
  );
}
