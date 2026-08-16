"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Download,
  FileCheck,
  FileSpreadsheet,
  FileText,
  Filter,
  FolderOpen,
  Globe2,
  MessageSquare,
  Plane,
  Plus,
  Printer,
  Receipt,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";

type DocumentItem = {
  id: string;
  number: string;
  type: "Invoice" | "Kuitansi" | "Manifest Flight" | "Surat Rekomendasi Paspor";
  customerName: string;
  bookingCode: string;
  date: string;
  amountDisplay: string;
  status: "Sah & Diverifikasi" | "Pending Pelunasan";
  targetUrl: string;
  phone: string;
  badgeColor: string;
};

export default function EasyDocumentsPage() {
  const [docs, setDocs] = useState<DocumentItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Semua");
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [printedLetterJamaah, setPrintedLetterJamaah] = useState("");
  const [printedLetterKTP, setPrintedLetterKTP] = useState("");
  const [isLetterPreviewOpen, setIsLetterPreviewOpen] = useState(false);

  // Manifest Flight and Surat Rekomendasi Paspor aren't backed by any table
  // yet, so this hub only aggregates the two document types that are real:
  // invoices and kuitansi (receipts).
  useEffect(() => {
    Promise.all([
      fetch("/api/invoices").then((res) => res.json()),
      fetch("/api/receipts").then((res) => res.json()),
    ])
      .then(([invoicesJson, receiptsJson]) => {
        const invoiceDocs: DocumentItem[] = ((invoicesJson.data ?? []) as any[]).map((inv) => ({
          id: `inv-${inv.id}`,
          number: inv.number,
          type: "Invoice" as const,
          customerName: inv.customer,
          bookingCode: inv.bookingCode,
          date: inv.issueDate,
          amountDisplay: `Rp ${Number(inv.total).toLocaleString("id-ID")}`,
          status: inv.remaining <= 0 ? ("Sah & Diverifikasi" as const) : ("Pending Pelunasan" as const),
          targetUrl: `/dokumen/invoice/${inv.number}`,
          phone: inv.phone ?? "",
          badgeColor: "bg-purple-50 text-purple-700 border-purple-200/60",
        }));

        const receiptDocs: DocumentItem[] = ((receiptsJson.data ?? []) as any[]).map((r) => ({
          id: `kw-${r.receipt.id}`,
          number: r.receipt.number,
          type: "Kuitansi" as const,
          customerName: r.receipt.receivedFrom,
          bookingCode: r.payment.bookingCode,
          date: r.receipt.date,
          amountDisplay: `Rp ${Number(r.receipt.amount).toLocaleString("id-ID")}`,
          status: "Sah & Diverifikasi" as const,
          targetUrl: "/dokumen/kuitansi",
          phone: r.payment.customerPhone ?? "",
          badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
        }));

        setDocs(
          [...invoiceDocs, ...receiptDocs].sort((a, b) => b.date.localeCompare(a.date)),
        );
      })
      .catch((e) => console.error(e));
  }, []);

  const filteredDocs = useMemo(() => {
    return docs.filter((doc) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        doc.number.toLowerCase().includes(q) ||
        doc.customerName.toLowerCase().includes(q) ||
        doc.bookingCode.toLowerCase().includes(q);

      const matchesCat =
        selectedCategory === "Semua" || doc.type === selectedCategory;

      return matchesSearch && matchesCat;
    });
  }, [docs, searchQuery, selectedCategory]);

  const handlePrintLetter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!printedLetterJamaah) return;
    setIsGeneratorOpen(false);
    setIsLetterPreviewOpen(true);
  };

  return (
    <AppShell eyebrow="Pusat Dokumen Praktis" title="Pusat Cetak & Arsip Dokumen">
      <div className="space-y-5">
        
        {/* Header Hero Section */}
        <section className="rounded-2xl border border-stone-200/70 bg-white p-5 sm:p-6 shadow-2xs">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold tracking-tight text-brand-cocoa">
                  Pusat Dokumen Resmi & Generator Surat
                </h1>
                <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-[11px] font-bold text-brand-pink border border-brand-pink/20">
                  Mudah & Cepat
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-1 max-w-2xl">
                Cetak Invoice, Kuitansi Sah, Flight Manifest, dan Surat Rekomendasi Paspor Imigrasi dalam 1 klik.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsGeneratorOpen(true)}
                className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-brand-pink px-4 text-xs font-semibold text-white shadow-2xs hover:bg-brand-pinkHover transition shrink-0"
              >
                <Sparkles className="h-4 w-4" strokeWidth={1.5} />
                <span>+ Buat Surat Paspor Kemenag</span>
              </button>
            </div>
          </div>
        </section>

        {/* 🚀 4 Quick Access Cards with Clear Explanations */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/dokumen/invoice"
            className="group rounded-2xl border border-stone-200/70 bg-white p-4 shadow-2xs hover:border-purple-300 hover:shadow-md transition space-y-2.5"
          >
            <div className="flex items-center justify-between">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-purple-50 text-purple-700 border border-purple-200/60">
                <FileText className="h-4 w-4" strokeWidth={1.5} />
              </div>
              <span className="text-[11px] font-bold text-stone-400 group-hover:text-purple-700">Lihat →</span>
            </div>
            <div>
              <h3 className="text-xs font-bold text-brand-cocoa group-hover:text-purple-900">
                1. Invoice Pemesanan
              </h3>
              <p className="text-[11px] text-stone-500 mt-0.5">
                Tagihan paket umrah & rekening bank.
              </p>
            </div>
          </Link>

          <Link
            href="/dokumen/kuitansi"
            className="group rounded-2xl border border-stone-200/70 bg-white p-4 shadow-2xs hover:border-emerald-300 hover:shadow-md transition space-y-2.5"
          >
            <div className="flex items-center justify-between">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                <Receipt className="h-4 w-4" strokeWidth={1.5} />
              </div>
              <span className="text-[11px] font-bold text-stone-400 group-hover:text-emerald-700">Lihat →</span>
            </div>
            <div>
              <h3 className="text-xs font-bold text-brand-cocoa group-hover:text-emerald-900">
                2. Kuitansi Pembayaran
              </h3>
              <p className="text-[11px] text-stone-500 mt-0.5">
                Bukti bayar sah bertanda tangan staf Azri.
              </p>
            </div>
          </Link>

          <Link
            href="/manifest"
            className="group rounded-2xl border border-stone-200/70 bg-white p-4 shadow-2xs hover:border-sky-300 hover:shadow-md transition space-y-2.5"
          >
            <div className="flex items-center justify-between">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-sky-50 text-sky-700 border border-sky-200/60">
                <Plane className="h-4 w-4" strokeWidth={1.5} />
              </div>
              <span className="text-[11px] font-bold text-stone-400 group-hover:text-sky-700">Lihat →</span>
            </div>
            <div>
              <h3 className="text-xs font-bold text-brand-cocoa group-hover:text-sky-900">
                3. Manifest Penerbangan
              </h3>
              <p className="text-[11px] text-stone-500 mt-0.5">
                Dokumen paspor & e-visa Garuda GA-980.
              </p>
            </div>
          </Link>

          <button
            type="button"
            onClick={() => setIsGeneratorOpen(true)}
            className="group text-left rounded-2xl border border-amber-200 bg-amber-50/40 p-4 shadow-2xs hover:border-amber-400 hover:shadow-md transition space-y-2.5"
          >
            <div className="flex items-center justify-between">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-amber-100 text-amber-800 border border-amber-300">
                <ShieldCheck className="h-4 w-4" strokeWidth={1.5} />
              </div>
              <span className="text-[11px] font-bold text-amber-700 group-hover:underline">Cetak →</span>
            </div>
            <div>
              <h3 className="text-xs font-bold text-amber-950">
                4. Surat Rekomendasi Paspor
              </h3>
              <p className="text-[11px] text-amber-800 mt-0.5">
                Surat keterangan imigrasi izin Kemenag.
              </p>
            </div>
          </button>
        </section>

        {/* 🔎 Search Toolbar & Category Filter Tabs */}
        <section className="rounded-2xl border border-stone-200/70 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" strokeWidth={1.5} />
              <input
                type="text"
                placeholder="Ketik No. Dokumen INV / KW / Nama Jamaah..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 rounded-xl border border-stone-200 bg-stone-50/50 pl-9 pr-3 text-xs text-brand-cocoa font-medium placeholder:text-stone-400 outline-none focus:border-brand-pink focus:bg-white transition"
              />
            </div>

            {/* Filter Pill Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
              {(["Semua", "Invoice", "Kuitansi", "Manifest Flight", "Surat Rekomendasi Paspor"] as const).map((cat) => {
                const count = cat === "Semua" ? docs.length : docs.filter((d) => d.type === cat).length;

                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`h-8 rounded-xl px-3 text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
                      selectedCategory === cat
                        ? "bg-rose-50 text-brand-pink border border-brand-pink/20 font-bold shadow-2xs"
                        : "text-stone-600 hover:bg-stone-50"
                    }`}
                  >
                    <span>{cat === "Surat Rekomendasi Paspor" ? "Surat Paspor" : cat}</span>
                    <span className="rounded-full bg-stone-200/60 px-1.5 py-0.2 text-[10px] text-stone-700">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 📱 NATIVE MOBILE TOUCH CARDS (Hidden on Desktop) */}
          <div className="space-y-3 block md:hidden">
            {filteredDocs.length === 0 ? (
              <div className="py-6 text-center text-stone-400 text-xs rounded-xl border border-stone-200/60 bg-stone-50/50">
                Tidak ada dokumen yang ditemukan.
              </div>
            ) : (
              filteredDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-2xs space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-mono text-[10px] font-bold text-stone-400 block">{doc.number}</span>
                      <h4 className="font-bold text-xs text-stone-900">{doc.customerName}</h4>
                    </div>
                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold ${doc.badgeColor}`}>
                      {doc.type}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                    <span className="text-stone-500 font-medium">Tanggal: {doc.date}</span>
                    <span className="font-bold text-emerald-700">{doc.amountDisplay}</span>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-xs">
                    <span className="text-[10px] font-medium text-stone-400">Kode: {doc.bookingCode}</span>
                    <Link
                      href={doc.targetUrl}
                      className="inline-flex items-center gap-1 font-bold text-brand-pink hover:underline text-[11px]"
                    >
                      Cetak / Lihat <ArrowUpRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* 🖥️ DESKTOP DATA TABLE (Hidden on Mobile) */}
          <div className="hidden md:block overflow-x-auto rounded-xl border border-stone-200/60">
            <table className="w-full min-w-[880px] border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-stone-200/60 bg-stone-50/70 font-semibold text-stone-500 text-[11px] uppercase tracking-wider">
                  <th className="py-2.5 pl-3 pr-2">No. Dokumen</th>
                  <th className="py-2.5 pr-2">Jenis Dokumen</th>
                  <th className="py-2.5 pr-2">Nama Pemesan / Jamaah</th>
                  <th className="py-2.5 pr-2">Tanggal Terbit</th>
                  <th className="py-2.5 pr-2">Nilai / Rincian</th>
                  <th className="py-2.5 pr-2">Status</th>
                  <th className="py-2.5 pr-3 text-right">Aksi 1-Klik</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-normal">
                {filteredDocs.map((doc) => {
                  const waText = encodeURIComponent(
                    `Assalamu'alaikum wr. wb. Yth. Bapak/Ibu ${doc.customerName},\n\nBerikut dokumen resmi *${doc.type}* (No: ${doc.number}) dari *PT El Massa Tour & Travel*.\n\nTerima kasih.`,
                  );

                  return (
                    <tr key={doc.id} className="transition hover:bg-stone-50/60">
                      <td className="py-3 pl-3 pr-2">
                        <Link href={doc.targetUrl} className="group">
                          <p className="font-mono font-bold text-brand-cocoa group-hover:text-brand-pink transition">
                            {doc.number}
                          </p>
                          <p className="font-mono text-[10px] text-stone-400">{doc.bookingCode}</p>
                        </Link>
                      </td>
                      <td className="py-3 pr-2 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${doc.badgeColor}`}>
                          {doc.type}
                        </span>
                      </td>
                      <td className="py-3 pr-2 font-semibold text-stone-800 whitespace-nowrap">
                        {doc.customerName}
                      </td>
                      <td className="py-3 pr-2 text-stone-500 font-medium whitespace-nowrap">{doc.date}</td>
                      <td className="py-3 pr-2 font-bold text-brand-cocoa whitespace-nowrap">{doc.amountDisplay}</td>
                      <td className="py-3 pr-2 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 border border-emerald-200/60">
                          <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                          {doc.status}
                        </span>
                      </td>
                      <td className="py-3 pr-3 text-right whitespace-nowrap space-x-1">
                        <Link
                          href={doc.targetUrl}
                          className="inline-flex items-center gap-1 rounded-lg border border-stone-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-stone-700 hover:bg-stone-50 transition"
                        >
                          <Printer className="h-3 w-3 text-stone-500" strokeWidth={1.5} />
                          <span>Cetak / Lihat</span>
                        </Link>

                        <a
                          href={`https://wa.me/${doc.phone.replace(/[^0-9]/g, "")}?text=${waText}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center h-7 w-7 rounded-lg border border-emerald-200 bg-emerald-600 text-white hover:bg-emerald-700 transition"
                          title="Kirim Dokumen via WhatsApp"
                        >
                          <MessageSquare className="h-3.5 w-3.5" strokeWidth={1.5} />
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

      </div>

      {/* 📜 MODAL GENERATOR SURAT REKOMENDASI PASPOR */}
      {isGeneratorOpen && (
        <div className="fixed inset-0 z-50 el-modal flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <form onSubmit={handlePrintLetter} className="relative w-full max-w-lg rounded-2xl border border-stone-200 bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-amber-600" strokeWidth={1.5} />
                <h3 className="text-base font-bold text-brand-cocoa">
                  Cetak Surat Rekomendasi Paspor Imigrasi
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsGeneratorOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-xl border border-stone-200 bg-stone-50 text-stone-500 hover:bg-stone-100 transition"
              >
                <X className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="rounded-xl border border-stone-200/60 bg-stone-50/70 p-3 text-[11px] space-y-1">
                <p className="font-bold text-brand-cocoa">PT El Massa Tour & Travel</p>
                <p className="text-stone-500">Izin PPIU No: <span className="font-mono font-bold text-stone-700">10032300465890002</span></p>
                <p className="text-stone-500">SK Kemenkumham: <span className="font-mono font-bold text-stone-700">AHU-0112355.AH.01.01</span></p>
              </div>

              <label className="block space-y-1">
                <span className="font-semibold text-stone-700">Nama Lengkap Jamaah (Sesuai KTP)</span>
                <input
                  required
                  placeholder="Ketik nama calon jamaah umrah..."
                  className="w-full h-9 rounded-xl border border-stone-200 bg-stone-50/50 px-3 text-xs text-brand-cocoa font-bold outline-none focus:border-brand-pink focus:bg-white"
                  value={printedLetterJamaah}
                  onChange={(e) => setPrintedLetterJamaah(e.target.value)}
                />
              </label>

              <label className="block space-y-1">
                <span className="font-semibold text-stone-700">No. NIK KTP Jamaah</span>
                <input
                  required
                  placeholder="Contoh: 1971021508820003"
                  className="w-full h-9 rounded-xl border border-stone-200 bg-stone-50/50 px-3 text-xs font-mono outline-none focus:border-brand-pink focus:bg-white"
                  value={printedLetterKTP}
                  onChange={(e) => setPrintedLetterKTP(e.target.value)}
                />
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-stone-100 pt-3">
              <button
                type="button"
                onClick={() => setIsGeneratorOpen(false)}
                className="h-9 rounded-xl border border-stone-200 bg-white px-4 text-xs font-semibold text-stone-600 hover:bg-stone-50"
              >
                Batal
              </button>
              <button
                type="submit"
                className="h-9 rounded-xl bg-brand-pink px-5 text-xs font-semibold text-white shadow-2xs hover:bg-brand-pinkHover"
              >
                Cetak Surat Resmi
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 🖨️ PREVIEW CETAK SURAT REKOMENDASI PASPOR (A4 PAPER FORMAT & FULL VERSION PREVIEW) */}
      {isLetterPreviewOpen && (
        <div className="fixed inset-0 z-50 el-modal overflow-y-auto bg-stone-950/80 backdrop-blur-sm p-4 sm:p-8 flex flex-col items-center justify-start">
          
          {/* Top Floating Control Bar (Non-printable) */}
          <div className="sticky top-0 z-10 mb-4 flex items-center justify-between gap-4 w-full max-w-[210mm] rounded-2xl border border-stone-800 bg-stone-900/90 backdrop-blur-md p-3 text-white shadow-xl">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-brand-pink/20 px-2.5 py-0.5 text-[10px] font-bold text-brand-pink uppercase tracking-widest border border-brand-pink/30">
                A4 Paper Format
              </span>
              <span className="text-xs font-semibold text-stone-300">Pratinjau Surat Rekomendasi Paspor</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex h-8 items-center gap-1.5 rounded-xl bg-brand-pink px-4 text-xs font-semibold text-white shadow-2xs hover:bg-brand-pinkHover transition"
              >
                <Printer className="h-3.5 w-3.5" strokeWidth={1.5} />
                <span>Cetak / PDF (A4)</span>
              </button>
              <button
                type="button"
                onClick={() => setIsLetterPreviewOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-xl border border-stone-700 bg-stone-800 text-stone-300 hover:bg-stone-700 transition"
              >
                <X className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>
          </div>

          {/* 📄 FULL VERSION A4 SHEET PAPER PREVIEW (EXACT 210mm x 297mm PROPORTION) */}
          <div className="print:m-0 print:p-0 print:shadow-none print:w-full relative w-full max-w-[210mm] bg-white p-4 sm:p-14 text-stone-900 shadow-2xl space-y-5 font-sans border border-stone-200 rounded-xl sm:rounded-none">
            
            {/* 🎨 PRINT STYLES FOR EXACT A4 PAPER OUTPUT */}
            <style jsx global>{`
              @media print {
                @page {
                  size: A4 portrait;
                  margin: 12mm 15mm;
                }
                body {
                  background: white !important;
                  color: black !important;
                }
              }
            `}</style>

            {/* 🏢 OFFICIAL KOP SURAT IMAGE RESMI EL MASSA */}
            <div className="w-full pb-2">
              <img
                src="/kop-surat-el-massa.png"
                alt="Kop Surat Resmi PT Al Massa Azka Wisata"
                className="w-full max-w-full h-auto object-contain block mx-auto rounded-none"
              />
            </div>

            {/* METADATA NOMOR, LAMPIRAN & PERIHAL (KIRI) */}
            <div className="space-y-1 text-xs font-semibold text-stone-900 pt-1">
              <div className="flex gap-4">
                <span className="w-16">No</span>
                <span>: 421/SR-PASPOR/EM/X/2026</span>
              </div>
              <div className="flex gap-4">
                <span className="w-16">Lamp</span>
                <span>: -</span>
              </div>
              <div className="flex gap-4">
                <span className="w-16">Hal</span>
                <span>: <strong className="underline">Surat Rekomendasi Pembuatan Paspor RI (Umrah)</strong></span>
              </div>
            </div>

            {/* BLOCK ALAMAT KEPADA YTH (KIRI) */}
            <div className="space-y-1 text-xs font-medium text-stone-900 pt-2">
              <p className="font-bold">Kepada Yth.</p>
              <p className="font-extrabold text-stone-950">Kepala Kantor Imigrasi Kelas I TPI Pangkalpinang</p>
              <p>Di -</p>
              <p className="pl-6 font-semibold">Tempat</p>
            </div>

            {/* ISI SURAT FORMAL (PERSIS PARAGRAF REFERENSI) */}
            <div className="space-y-3 text-xs text-stone-900 leading-relaxed font-sans pt-2">
              <p>Dengan hormat,</p>
              <p>
                Bersama dengan surat ini, kami dari <strong className="font-black text-stone-950">PT. AL MASSA AZKA WISATA (El Massa Tour & Travel)</strong> selaku Penyelenggara Perjalanan Ibadah Umrah (PPIU) resmi Kemenag RI memberitahukan bahwa calon jamaah berikut:
              </p>

              {/* RINCIAN DATA JAMAAH FORMAL */}
              <div className="pl-6 py-2.5 space-y-1.5 font-semibold text-xs border-l-2 border-stone-800 bg-stone-50/70 p-3.5 rounded-r-xl">
                <div className="grid grid-cols-[140px_1fr]">
                  <span className="text-stone-600">Nama Lengkap</span>
                  <span className="font-black text-stone-950 uppercase">{printedLetterJamaah || "SITI RAHMA"}</span>
                </div>
                <div className="grid grid-cols-[140px_1fr]">
                  <span className="text-stone-600">NIK / No. KTP</span>
                  <span className="font-mono font-extrabold text-stone-950">{printedLetterKTP || "1901025508820001"}</span>
                </div>
                <div className="grid grid-cols-[140px_1fr]">
                  <span className="text-stone-600">Tempat, Tgl Lahir</span>
                  <span>Pangkalpinang, 15 Agustus 1982</span>
                </div>
                <div className="grid grid-cols-[140px_1fr]">
                  <span className="text-stone-600">Alamat Lengkap</span>
                  <span>Selindung Baru, Kec. Gabek, Pangkalpinang</span>
                </div>
                <div className="grid grid-cols-[140px_1fr]">
                  <span className="text-stone-600">Program Paket</span>
                  <span className="font-extrabold text-brand-pink">Umrah Spesial Oktober (12 Hari)</span>
                </div>
                <div className="grid grid-cols-[140px_1fr]">
                  <span className="text-stone-600">Tanggal Flight</span>
                  <span className="font-mono font-bold">01 Oktober 2026 - 12 Oktober 2026</span>
                </div>
              </div>

              <p>
                Adalah benar calon jamaah umrah terdaftar yang akan berangkat beribadah ke Tanah Suci Makkah & Madinah bersama travel kami. Oleh karena itu, kami memberikan rekomendasi untuk penerbitan/pembuatan Paspor RI jamaah bersangkutan.
              </p>

              <p>
                Demikianlah rekomendasi ini kami sampaikan agar dapat dipergunakan sebagaimana mestinya pada Kantor Imigrasi RI. Atas perhatian dan kesediaannya kami ucapkan terima kasih.
              </p>
            </div>

            {/* TANDA TANGAN & STEMPEL FORMAL (KANAN BAWAH PERSIS GAMBAR REFERENSI) */}
            <div className="pt-6 flex justify-end text-xs text-stone-900">
              <div className="text-center space-y-2 min-w-[220px]">
                <p className="font-bold">Pangkalpinang, 29 Juli 2026</p>
                <p className="font-extrabold text-stone-950">PT. AL MASSA AZKA WISATA</p>
                <p className="text-[11px] font-semibold text-stone-600">Direktur Utama / CEO,</p>
                
                {/* SVG Handwritten Signature Block */}
                <div className="py-1">
                  <svg className="h-16 w-44 mx-auto text-stone-900" viewBox="0 0 200 70" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 45 C30 10, 50 65, 75 25 C90 5, 110 55, 135 20 C145 35, 160 15, 185 40 M45 40 L165 40" />
                  </svg>
                </div>

                <div>
                  <p className="font-black text-stone-950 underline uppercase tracking-tight text-sm">AZRIANDRI</p>
                  <p className="text-[10px] font-mono font-bold text-stone-500">NIK: 190101010190001</p>
                </div>
              </div>
            </div>

            {/* NB / CATATAN KAKAI (KIRI BAWAH PERSIS GAMBAR REFERENSI) */}
            <div className="border-t border-stone-300 pt-4 text-[11px] text-stone-600 space-y-0.5 font-sans">
              <p className="font-extrabold uppercase text-stone-900">NB :</p>
              <p>1. Jamaah wajib membawa KTP, KK, & Akta Lahir/Buku Nikah asli saat wawancara di Kantor Imigrasi.</p>
              <p>2. Surat Rekomendasi ini sah diterbitkan resmi oleh PT. AL MASSA AZKA WISATA.</p>
            </div>

          </div>
        </div>
      )}

    </AppShell>
  );
}
