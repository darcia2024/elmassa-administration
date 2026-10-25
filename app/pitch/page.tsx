"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Award,
  BarChart3,
  Boxes,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Compass,
  CreditCard,
  ExternalLink,
  Eye,
  FileCheck2,
  FileSpreadsheet,
  FileText,
  FolderOpen,
  Handshake,
  HelpCircle,
  Layers,
  Lock,
  Mails,
  Monitor,
  Plane,
  Play,
  Plus,
  Receipt,
  ReceiptText,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Sparkles,
  TrendingUp,
  UserCheck,
  UserCog,
  UserPlus,
  Users,
  Wallet,
  Zap,
} from "lucide-react";

export default function PitchPresentationPage() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [presentationMode, setPresentationMode] = useState<"slides" | "scroll">("slides");

  const slides = [
    {
      id: "intro",
      tag: "Visi & Transformasi Digital",
      title: "El Massa Integrated Ecosystem",
      subtitle: "Transformasi Operasional Travel Umrah: Dari Manual Tercecer Menjadi Satu Ekosistem Digital Terpadu",
      content: "overview",
    },
    {
      id: "triple-engine",
      tag: "Arsitektur Solusi",
      title: "The Triple-Engine Ecosystem",
      subtitle: "3 Sudut Sinergis: Kantor Pusat (Web) ↔ Mitra/Agen (My El Massa) ↔ Jamaah (UmrahMe)",
      content: "architecture",
    },
    {
      id: "finance",
      tag: "Pilar Keuangan & Kasir",
      title: "Sistem Kasir Anti-Bocor & Verifikasi Berjenjang",
      subtitle: "Arus Kas Terpusat, Invoice Terintegrasi, Kwitansi Otomatis & Rekap Margin Laba Grup",
      content: "finance",
    },
    {
      id: "administrasi",
      tag: "Pilar Dokumen & Kemenag",
      title: "Otomasi Administrasi & Surat Kemenag Resmi",
      subtitle: "Kop Surat Resmi Motif Pink-Coklat, Surat Rekomendasi Paspor, Tambah Nama, & Izin Cuti Sekali Klik",
      content: "administrasi",
    },
    {
      id: "my-elmassa",
      tag: "Pilar Agen & Mitra",
      title: "Portal Mitra 'My El Massa' (Live & Teruji)",
      subtitle: "Pemberdayaan Agen Daerah: Pantau Sisa Seat Real-Time, Daftarkan Jamaah dari HP, & Komisi Transparan",
      content: "my-elmassa",
    },
    {
      id: "umrahme",
      tag: "Pilar Jamaah Digital",
      title: "Aplikasi Jamaah 'UmrahMe' & Self-Service Data",
      subtitle: "Aktivasi Terkunci Otomatis Pasca-Bayar, Form Mandiri Paspor, Live Itinerary, & Muthawwif",
      content: "umrahme",
    },
    {
      id: "operations",
      tag: "Pilar Operasional & Logistik",
      title: "Manajemen Karyawan, Inventaris Stok & Manifest",
      subtitle: "Pengendalian Fisik Koper, Kain Ihram & Mukena (FIFO) serta Manifest Penerbangan Makkah-Madinah",
      content: "operations",
    },
    {
      id: "roadmap",
      tag: "Eksekusi & Action Plan",
      title: "Roadmap Kesiapan Input Data Hari Senin",
      subtitle: "Rencana Bertahap Kick-Off Tim Kantor, Sosialisasi Agen, dan Go-Live Keberangkatan",
      content: "roadmap",
    },
  ];

  const totalSlides = slides.length;

  const nextSlide = () => {
    if (activeSlide < totalSlides - 1) setActiveSlide((prev) => prev + 1);
  };

  const prevSlide = () => {
    if (activeSlide > 0) setActiveSlide((prev) => prev - 1);
  };

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 flex flex-col font-sans selection:bg-brand-pink selection:text-white">
      {/* Top Presentation Bar */}
      <header className="sticky top-0 z-40 border-b border-stone-800 bg-stone-950/90 backdrop-blur-md px-4 py-3">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative h-9 w-28 sm:w-32 shrink-0">
              <Image
                src="/logo-el-massa-horizontal.png"
                alt="El Massa Logo"
                fill
                className="object-contain object-left"
                priority
              />
            </div>
            <div className="h-5 w-px bg-stone-800 hidden sm:block" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-white tracking-tight text-xs sm:text-sm">EXECUTIVE PITCH</span>
                <span className="rounded-full bg-brand-pink/20 text-pink-300 border border-brand-pink/30 px-2 py-0.2 text-[9px] font-black uppercase tracking-wider">
                  Owner & Manajemen
                </span>
              </div>
              <p className="text-[10px] text-stone-400 font-medium hidden sm:block">
                Presentasi Transformasi Sistem El Massa
              </p>
            </div>
          </div>

          {/* Mode Switcher & Navigation */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="inline-flex rounded-xl bg-stone-800/80 p-0.5 border border-stone-700/60 text-xs">
              <button
                type="button"
                onClick={() => setPresentationMode("slides")}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-bold transition cursor-pointer ${
                  presentationMode === "slides"
                    ? "bg-brand-pink text-white shadow-xs"
                    : "text-stone-400 hover:text-white"
                }`}
              >
                <Monitor className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Slide Mode</span>
              </button>
              <button
                type="button"
                onClick={() => setPresentationMode("scroll")}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-bold transition cursor-pointer ${
                  presentationMode === "scroll"
                    ? "bg-brand-pink text-white shadow-xs"
                    : "text-stone-400 hover:text-white"
                }`}
              >
                <Layers className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Executive Doc</span>
              </button>
            </div>

            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 rounded-xl border border-stone-700 bg-stone-800 px-3 py-1.5 text-xs font-semibold text-stone-300 hover:bg-stone-700 hover:text-white transition"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Buka Sistem Kantor</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ------------------------------------------------------------------- */}
      {/* MODE A: INTERACTIVE SLIDES FOR PROJECTOR / SCREENCAST PRESENTATION */}
      {/* ------------------------------------------------------------------- */}
      {presentationMode === "slides" ? (
        <div className="flex-1 flex flex-col justify-between max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8">
          {/* Slide Indicator Bar */}
          <div className="flex items-center justify-between pb-4 border-b border-stone-800/80">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
              {slides.map((s, idx) => (
                <button
                  key={s.id}
                  onClick={() => setActiveSlide(idx)}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    activeSlide === idx
                      ? "w-8 bg-brand-pink"
                      : "w-2 bg-stone-700 hover:bg-stone-500"
                  }`}
                  title={`${idx + 1}. ${s.title}`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-stone-400">
              <span>SLIDE {activeSlide + 1} OF {totalSlides}</span>
            </div>
          </div>

          {/* Slide Main Stage */}
          <div className="my-auto py-6 sm:py-8 space-y-6">
            {/* Slide Header */}
            <div className="space-y-2 max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-pink-500/10 border border-brand-pink/30 px-3 py-1 text-xs font-bold text-pink-300">
                <Sparkles className="h-3.5 w-3.5 text-brand-pink" />
                <span>{slides[activeSlide].tag}</span>
              </div>
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                {slides[activeSlide].title}
              </h1>
              <p className="text-sm sm:text-base text-stone-300 leading-relaxed font-medium">
                {slides[activeSlide].subtitle}
              </p>
            </div>

            {/* Slide Content Dynamic Renderer */}
            <div className="pt-2">
              {/* SLIDE 1: OVERVIEW */}
              {slides[activeSlide].content === "overview" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="rounded-3xl border border-rose-500/20 bg-linear-to-b from-rose-950/20 to-stone-900/60 p-5 space-y-3">
                    <div className="h-10 w-10 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
                      <ShieldAlert className="h-5 w-5" />
                    </div>
                    <h3 className="text-base font-extrabold text-white">Tantangan Lama</h3>
                    <ul className="text-xs text-stone-400 space-y-2 leading-relaxed">
                      <li>• Rekap booking & manifest tercecer di chat WA & Excel.</li>
                      <li>• Kwitansi & invoice diketik manual di Word, rawan selisih angka.</li>
                      <li>• Agen kesulitan tahu sisa kuota seat yang pasti.</li>
                      <li>• Jamaah belum bayar tapi sudah masuk grup manasik.</li>
                    </ul>
                  </div>

                  <div className="rounded-3xl border border-brand-pink/40 bg-linear-to-b from-brand-pink/15 to-stone-900/60 p-5 space-y-3 shadow-lg shadow-brand-pink/10">
                    <div className="h-10 w-10 rounded-2xl bg-brand-pink/30 border border-brand-pink/40 flex items-center justify-center text-pink-200">
                      <Zap className="h-5 w-5" />
                    </div>
                    <h3 className="text-base font-extrabold text-white">Solusi Ekosistem El Massa</h3>
                    <ul className="text-xs text-stone-300 space-y-2 leading-relaxed">
                      <li>• <strong>1 Database Terpusat</strong> di Cloud Supabase yang real-time.</li>
                      <li>• <strong>Kasir Terverifikasi</strong>: DP/Lunas otomatis cetak kuitansi ber-QR/nomor resmi.</li>
                      <li>• <strong>Portal Mitra 'My El Massa'</strong> di smartphone agen.</li>
                      <li>• <strong>Aplikasi Jamaah 'UmrahMe'</strong> aktif otomatis pasca-DP.</li>
                    </ul>
                  </div>

                  <div className="rounded-3xl border border-emerald-500/30 bg-linear-to-b from-emerald-950/20 to-stone-900/60 p-5 space-y-3">
                    <div className="h-10 w-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      <TrendingUp className="h-5 w-5" />
                    </div>
                    <h3 className="text-base font-extrabold text-white">Nilai Bisnis untuk Owner</h3>
                    <ul className="text-xs text-stone-400 space-y-2 leading-relaxed">
                      <li>• <strong>Zero Cash Leakage</strong>: uang kasir selalu cocok dengan kuitansi & invoice.</li>
                      <li>• <strong>Scale Up Mitra</strong>: agen daerah bisa jual paket tanpa tanya admin kantor berulang kali.</li>
                      <li>• <strong>Brand Value Premium</strong>: kop surat resmi, slip kuitansi, & app jamaah berstandar modern.</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* SLIDE 2: TRIPLE ENGINE ARCHITECTURE */}
              {slides[activeSlide].content === "architecture" && (
                <div className="rounded-3xl border border-stone-800 bg-stone-950/60 p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5 relative">
                    {/* Engine 1: My El Massa */}
                    <div className="rounded-2xl border border-pink-500/30 bg-stone-900/80 p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="rounded-md bg-pink-500/20 px-2 py-0.5 text-[10px] font-bold text-pink-300 uppercase">
                          Front-End Mitra
                        </span>
                        <Smartphone className="h-4 w-4 text-brand-pink" />
                      </div>
                      <h4 className="text-base font-black text-white">1. My El Massa (Agen)</h4>
                      <p className="text-xs text-stone-400 leading-relaxed">
                        Diakses oleh agen/mitra lewat HP di mana saja. Melihat katalog paket aktif, sisa kuota seat, dan mendaftarkan calon jamaah langsung ke sistem.
                      </p>
                      <div className="pt-2 border-t border-stone-800 text-[11px] text-pink-300 font-semibold">
                        ➜ Output: Booking berkode agen & estimasi komisi otomatis.
                      </div>
                    </div>

                    {/* Engine 2: El Massa Web Central */}
                    <div className="rounded-2xl border border-amber-500/30 bg-stone-900/80 p-5 space-y-3 shadow-md">
                      <div className="flex items-center justify-between">
                        <span className="rounded-md bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300 uppercase">
                          Central Command
                        </span>
                        <Monitor className="h-4 w-4 text-amber-400" />
                      </div>
                      <h4 className="text-base font-black text-white">2. El Massa Web (Kantor)</h4>
                      <p className="text-xs text-stone-400 leading-relaxed">
                        Pusat kendali operasional staf, admin, dan keuangan. Verifikasi pembayaran kasir, terbitkan invoice & kuitansi resmi, mutasi stok, serta manifest.
                      </p>
                      <div className="pt-2 border-t border-stone-800 text-[11px] text-amber-300 font-semibold">
                        ➜ Output: Verifikasi pembayaran DP / Lunas & validasi berkas.
                      </div>
                    </div>

                    {/* Engine 3: UmrahMe App */}
                    <div className="rounded-2xl border border-purple-500/30 bg-stone-900/80 p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="rounded-md bg-purple-500/20 px-2 py-0.5 text-[10px] font-bold text-purple-300 uppercase">
                          Digital Jamaah
                        </span>
                        <Sparkles className="h-4 w-4 text-purple-400" />
                      </div>
                      <h4 className="text-base font-black text-white">3. UmrahMe (Jamaah)</h4>
                      <p className="text-xs text-stone-400 leading-relaxed">
                        Aplikasi mobile jamaah resmi. Jamaah login mandiri setelah DP diverifikasi kantor untuk melihat jadwal manasik, hotel, muthawwif, & live itinerary.
                      </p>
                      <div className="pt-2 border-t border-stone-800 text-[11px] text-purple-300 font-semibold">
                        ➜ Output: Jamaah mandiri lengkapi paspor & dokumen.
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-stone-900 p-4 border border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                    <span className="text-stone-300">
                      💡 <strong>Harmonisasi Keamanan Data:</strong> Jamaah tidak bisa login ke UmrahMe sebelum kantor memverifikasi pembayaran. Tidak ada jamaah &quot;bodong&quot; masuk ke manifes.
                    </span>
                    <Link
                      href="/my-elmassa"
                      target="_blank"
                      className="inline-flex items-center gap-1.5 rounded-xl bg-brand-pink px-3.5 py-1.5 font-bold text-white shadow-xs hover:bg-rose-600 transition shrink-0"
                    >
                      <span>Tes Portal Agen</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              )}

              {/* SLIDE 3: KEUANGAN & KASIR */}
              {slides[activeSlide].content === "finance" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-3xl border border-stone-800 bg-stone-950/60 p-5 space-y-4">
                    <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                      <Wallet className="h-4 w-4 text-emerald-400" />
                      <span>Alur Kasir Berjenjang (Audit-Ready)</span>
                    </h3>
                    <div className="space-y-2.5 text-xs">
                      <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-stone-900 border border-stone-800">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[11px]">
                          1
                        </span>
                        <div>
                          <strong className="text-stone-200 block">Pencatatan Tagihan Lahir Otomatis</strong>
                          <span className="text-stone-400">Total amount dihitung dari harga paket × jumlah pax (+ surcharge kamar Quad/Triple/Double).</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-stone-900 border border-stone-800">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[11px]">
                          2
                        </span>
                        <div>
                          <strong className="text-stone-200 block">Verifikasi Pembayaran Kasir</strong>
                          <span className="text-stone-400">Staf mencatat DP atau pelunasan dengan metode transfer bank atau tunai. Status booking berubah otomatis.</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-stone-900 border border-stone-800">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[11px]">
                          3
                        </span>
                        <div>
                          <strong className="text-stone-200 block">Penerbitan Kwitansi Otomatis</strong>
                          <span className="text-stone-400">Nomor KW otomatis unik (KW-XXXXXX) lengkap dengan kalimat terbilang rupiah, kop surat, dan stempel digital.</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-stone-800 bg-stone-950/60 p-5 space-y-4">
                    <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-brand-pink" />
                      <span>Rekap Keuangan Grup Keberangkatan</span>
                    </h3>
                    <p className="text-xs text-stone-400 leading-relaxed">
                      Sistem menghitung laba-rugi kotor per rombongan (Total Penerimaan Jamaah minus Biaya Tiket, Hotel Saudi, Handling, & Perlengkapan).
                    </p>
                    <div className="rounded-2xl bg-stone-900 p-4 border border-stone-800 space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-stone-400">Contoh Grup:</span>
                        <span className="font-bold text-white">UMRAH 01 OKTOBER 2026</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-stone-400">Total Tagihan Bruto:</span>
                        <span className="font-bold text-emerald-400">Rp 1.346.543.000</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-stone-400">Status Pembayaran:</span>
                        <span className="rounded bg-blue-500/20 text-blue-300 px-1.5 py-0.2 text-[10px] font-bold">Terpantau Real-Time</span>
                      </div>
                    </div>

                    <div className="pt-1 flex gap-2">
                      <Link
                        href="/dokumen/invoice"
                        target="_blank"
                        className="flex-1 text-center py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold transition"
                      >
                        Lihat Invoice
                      </Link>
                      <Link
                        href="/dokumen/kuitansi"
                        target="_blank"
                        className="flex-1 text-center py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold transition"
                      >
                        Lihat Kwitansi
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* SLIDE 4: ADMINISTRASI & SURAT */}
              {slides[activeSlide].content === "administrasi" && (
                <div className="rounded-3xl border border-stone-800 bg-stone-950/60 p-6 space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="rounded-2xl bg-stone-900 p-4 border border-stone-800 space-y-2">
                      <div className="text-[10px] font-bold text-brand-pink uppercase">Kop Surat Resmi</div>
                      <h4 className="text-sm font-bold text-white">Motif Kotak Pink & Coklat</h4>
                      <p className="text-xs text-stone-400">
                        Kop surat resmi El Massa otomatis menempel pada Invoice, Kwitansi, dan Surat Rekomendasi tanpa perlu edit manual di Word.
                      </p>
                    </div>

                    <div className="rounded-2xl bg-stone-900 p-4 border border-stone-800 space-y-2">
                      <div className="text-[10px] font-bold text-amber-400 uppercase">Surat Kemenag & Paspor</div>
                      <h4 className="text-sm font-bold text-white">4 Varian Surat Resmi</h4>
                      <p className="text-xs text-stone-400">
                        Surat Rekomendasi Pembuatan Paspor Baru, Penambahan Nama (3 kata), Penggantian Paspor Habis Masa Berlaku, dan Izin Cuti Kerja.
                      </p>
                    </div>

                    <div className="rounded-2xl bg-stone-900 p-4 border border-stone-800 space-y-2">
                      <div className="text-[10px] font-bold text-emerald-400 uppercase">Arsip Otomatis</div>
                      <h4 className="text-sm font-bold text-white">Nomor Surat Urut Sistem</h4>
                      <p className="text-xs text-stone-400">
                        Setiap surat yang diterbitkan memiliki nomor urut resmi dan tersimpan permanen di basis data arsip kantor.
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-stone-900/90 p-4 border border-stone-800 flex items-center justify-between text-xs">
                    <span className="text-stone-300">
                      📄 Dokumen resmi siap cetak dan ekspor PDF langsung dari browser dengan stempel & tanda tangan pimpinan resmi.
                    </span>
                    <Link
                      href="/administrasi/surat"
                      target="_blank"
                      className="inline-flex items-center gap-1 text-brand-pink font-bold hover:underline shrink-0"
                    >
                      <span>Buka Modul Surat</span>
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              )}

              {/* SLIDE 5: MY EL MASSA */}
              {slides[activeSlide].content === "my-elmassa" && (
                <div className="rounded-3xl border border-brand-pink/30 bg-linear-to-b from-stone-950 via-stone-900 to-stone-950 p-6 space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-3">
                      <span className="rounded-md bg-brand-pink/20 text-brand-pink px-2.5 py-0.5 text-xs font-bold uppercase">
                        Kesiapan 100% Live
                      </span>
                      <h3 className="text-xl font-black text-white">Pemberdayaan Mitra di Ujung Jari</h3>
                      <p className="text-xs text-stone-300 leading-relaxed">
                        Mitra dan agen tidak perlu lagi menelepon kantor hanya untuk menanyakan: <em>&quot;Seat paket Oktober masih ada berapa?&quot;</em> atau <em>&quot;Komisi saya bulan ini berapa?&quot;</em>.
                      </p>
                      <ul className="text-xs text-stone-400 space-y-2">
                        <li>• <strong>Katalog Kuota Seat</strong>: Sisa kursi terhitung otomatis dari total kapasitas dikurangi jamaah terdaftar.</li>
                        <li>• <strong>Form Pendaftaran Multi-Pax</strong>: Agen bisa mendaftarkan satu keluarga sekaligus langsung dari HP.</li>
                        <li>• <strong>Transparansi Finansial</strong>: Agen melihat komisi per booking (Rp 1.500.000 / pax atau persentase).</li>
                      </ul>
                    </div>

                    <div className="rounded-2xl bg-stone-900/90 p-5 border border-stone-800 space-y-3">
                      <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
                        Akun Uji Coba Mitra Aktif
                      </span>
                      <div className="rounded-xl bg-stone-950 p-3 border border-stone-800 text-xs font-mono space-y-1">
                        <div>Kode Agen: <span className="text-brand-pink font-bold">AG-ELMASSA-01</span></div>
                        <div>WhatsApp : <span className="text-stone-300">081298765432</span></div>
                        <div>Nama     : <span className="text-white">Ustadz H. Ahmad Sobri (Pangkal Pinang)</span></div>
                        <div>Komisi   : <span className="text-emerald-400 font-bold">Rp 1.500.000 / jamaah</span></div>
                      </div>

                      <Link
                        href="/my-elmassa"
                        target="_blank"
                        className="w-full py-2.5 rounded-xl bg-brand-pink hover:bg-rose-600 text-white font-bold text-xs transition flex items-center justify-center gap-2"
                      >
                        <span>Buka & Simulasikan Pendaftaran</span>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* SLIDE 6: UMRAHME INTEGRATION */}
              {slides[activeSlide].content === "umrahme" && (
                <div className="rounded-3xl border border-purple-500/30 bg-stone-950/60 p-6 space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="rounded-2xl bg-stone-900 p-4 border border-stone-800 space-y-2">
                      <div className="text-[10px] font-bold text-purple-400 uppercase">Gerbang Pembayaran</div>
                      <h4 className="text-sm font-bold text-white">Aktivasi Terkunci Otomatis</h4>
                      <p className="text-xs text-stone-400">
                        Akun jamaah di UmrahMe hanya berstatus aktif setelah kasir kantor menerima pembayaran DP. Mencegah jamaah tanpa komitmen masuk ke fasilitas manasik.
                      </p>
                    </div>

                    <div className="rounded-2xl bg-stone-900 p-4 border border-stone-800 space-y-2">
                      <div className="text-[10px] font-bold text-purple-400 uppercase">Self-Service Data</div>
                      <h4 className="text-sm font-bold text-white">Token Pendataan Mandiri</h4>
                      <p className="text-xs text-stone-400">
                        Jamaah mendapatkan link token pribadi untuk melengkapi foto paspor, KTP, dan buku nikah sendiri dari HP tanpa membebani staf kantor.
                      </p>
                    </div>

                    <div className="rounded-2xl bg-stone-900 p-4 border border-stone-800 space-y-2">
                      <div className="text-[10px] font-bold text-purple-400 uppercase">Live Itinerary</div>
                      <h4 className="text-sm font-bold text-white">Sinkronisasi Jadwal Perjalanan</h4>
                      <p className="text-xs text-stone-400">
                        Agenda manasik, bus, muthawwif, dan hotel Makkah-Madinah di sistem kantor langsung tampil di aplikasi jamaah.
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-stone-900 p-4 border border-stone-800 flex items-center justify-between text-xs">
                    <span className="text-stone-300">
                      📱 Menggunakan basis integrasi API /api/pendataan dan sinkronisasi batch paket di database Supabase.
                    </span>
                    <Link
                      href="/umrahme"
                      target="_blank"
                      className="inline-flex items-center gap-1 text-purple-400 font-bold hover:underline shrink-0"
                    >
                      <span>Buka Akun Digital UmrahMe</span>
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              )}

              {/* SLIDE 7: OPERASIONAL & LOGISTIK */}
              {slides[activeSlide].content === "operations" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="rounded-3xl border border-stone-800 bg-stone-950/60 p-5 space-y-3">
                    <div className="h-9 w-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                      <UserCog className="h-5 w-5" />
                    </div>
                    <h3 className="text-base font-extrabold text-white">Data Karyawan & Tim</h3>
                    <p className="text-xs text-stone-400 leading-relaxed">
                      Pencatatan data staf kantor, muthawwif pembimbing ibadah, dan tour leader. Terpisah aman dari akun login sistem.
                    </p>
                    <Link
                      href="/operasional/karyawan"
                      target="_blank"
                      className="text-[11px] font-bold text-blue-400 hover:underline inline-flex items-center gap-1"
                    >
                      <span>Buka Data Karyawan</span>
                      <ChevronRight className="h-3 w-3" />
                    </Link>
                  </div>

                  <div className="rounded-3xl border border-stone-800 bg-stone-950/60 p-5 space-y-3">
                    <div className="h-9 w-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                      <Boxes className="h-5 w-5" />
                    </div>
                    <h3 className="text-base font-extrabold text-white">Stok Perlengkapan (FIFO)</h3>
                    <p className="text-xs text-stone-400 leading-relaxed">
                      Inventaris koper bagasi, kain ihram pria, mukena wanita, seragam batik, dan buku doa. Saldo dihitung dari mutasi riil keluar-masuk.
                    </p>
                    <Link
                      href="/operasional/stok"
                      target="_blank"
                      className="text-[11px] font-bold text-amber-400 hover:underline inline-flex items-center gap-1"
                    >
                      <span>Buka Manajemen Stok</span>
                      <ChevronRight className="h-3 w-3" />
                    </Link>
                  </div>

                  <div className="rounded-3xl border border-stone-800 bg-stone-950/60 p-5 space-y-3">
                    <div className="h-9 w-9 rounded-xl bg-brand-pink/20 text-pink-400 flex items-center justify-center">
                      <Plane className="h-5 w-5" />
                    </div>
                    <h3 className="text-base font-extrabold text-white">Manifest & Rooming Hotel</h3>
                    <p className="text-xs text-stone-400 leading-relaxed">
                      Roomlist Jakarta transit, Makkah, dan Madinah. Data visa dan nomor paspor terkoneksi langsung ke database profil jamaah.
                    </p>
                    <Link
                      href="/manifest"
                      target="_blank"
                      className="text-[11px] font-bold text-brand-pink hover:underline inline-flex items-center gap-1"
                    >
                      <span>Buka Manifest Peserta</span>
                      <ChevronRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              )}

              {/* SLIDE 8: ROADMAP */}
              {slides[activeSlide].content === "roadmap" && (
                <div className="rounded-3xl border border-stone-800 bg-stone-950/60 p-6 space-y-5">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-stone-900 border border-stone-800">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-brand-pink text-white font-black text-xs">
                        1
                      </div>
                      <div>
                        <strong className="text-sm font-bold text-white block">
                          Hari Senin: Kick-Off Input Data Administrasi & Keuangan
                        </strong>
                        <p className="text-xs text-stone-400 mt-0.5">
                          Anak-anak kantor mulai input data jamaah riil, riwayat pembayaran di kasir, dan penerbitan kwitansi untuk memverifikasi alur harian tanpa hambatan.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-stone-900 border border-stone-800">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-stone-950 font-black text-xs">
                        2
                      </div>
                      <div>
                        <strong className="text-sm font-bold text-white block">
                          Minggu Ini: Finalisasi UmrahMe & Stok Perlengkapan
                        </strong>
                        <p className="text-xs text-stone-400 mt-0.5">
                          Uji coba penerbitan akun UmrahMe untuk jamaah yang lunas, pengisian saldo stok awal koper/ihram di gudang, dan sinkronisasi jadwal manasik.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-stone-900 border border-stone-800">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-stone-950 font-black text-xs">
                        3
                      </div>
                      <div>
                        <strong className="text-sm font-bold text-white block">
                          Fase Lanjutan: Peluncuran Resmi Portal Mitra &quot;My El Massa&quot;
                        </strong>
                        <p className="text-xs text-stone-400 mt-0.5">
                          Sosialisasi link <code className="text-pink-300">/my-elmassa</code> dan pembagian ID agen ke seluruh mitra perwakilan daerah.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 text-center text-xs text-emerald-400 font-bold">
                    🚀 Seluruh fondasi teknis, database, dan antarmuka saat ini telah 100% lulus audit dan siap jalan!
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Slide Navigation Controls */}
          <div className="pt-6 border-t border-stone-800/80 flex items-center justify-between">
            <button
              type="button"
              onClick={prevSlide}
              disabled={activeSlide === 0}
              className="inline-flex items-center gap-2 rounded-2xl border border-stone-700 bg-stone-800 px-4 py-2.5 text-xs font-bold text-stone-200 hover:bg-stone-700 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Slide Sebelumnya</span>
            </button>

            {/* Quick Slide Jump Dropdown */}
            <div className="hidden sm:flex items-center gap-2 text-xs text-stone-400">
              <span className="font-semibold">Navigasi:</span>
              <select
                value={activeSlide}
                onChange={(e) => setActiveSlide(Number(e.target.value))}
                className="rounded-xl border border-stone-700 bg-stone-800 px-3 py-1.5 text-xs font-bold text-stone-200 focus:outline-none focus:border-brand-pink"
              >
                {slides.map((s, idx) => (
                  <option key={s.id} value={idx}>
                    {idx + 1}. {s.title}
                  </option>
                ))}
              </select>
            </div>

            {activeSlide < totalSlides - 1 ? (
              <button
                type="button"
                onClick={nextSlide}
                className="inline-flex items-center gap-2 rounded-2xl bg-brand-pink bg-gradient-to-r from-brand-pink to-rose-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-brand-pink/20 hover:brightness-110 active:scale-98 transition cursor-pointer"
              >
                <span>Slide Selanjutnya</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-500 transition cursor-pointer"
              >
                <span>Masuk ke Dashboard Sistem</span>
                <CheckCircle2 className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>
      ) : (
        /* ------------------------------------------------------------------- */
        /* MODE B: COMPREHENSIVE EXECUTIVE DOCUMENT FOR READING / SCREENING    */
        /* ------------------------------------------------------------------- */
        <div className="max-w-5xl mx-auto w-full p-4 sm:p-8 space-y-12">
          {/* Executive Header */}
          <div className="space-y-4 text-center border-b border-stone-800 pb-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-brand-pink/20 border border-brand-pink/30 px-3 py-1 text-xs font-bold text-pink-300">
              <ShieldCheck className="h-3.5 w-3.5 text-brand-pink" />
              <span>Executive Brief & Blueprint Operasional</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Transformasi Sistem Operasional Terpadu El Massa
            </h1>
            <p className="text-sm sm:text-base text-stone-400 max-w-2xl mx-auto leading-relaxed">
              Panduan lengkap implementasi sistem bagi Owner (Bang Azri), Dewan Direksi, dan seluruh staf operasional PT El Massa Tour & Travel.
            </p>
          </div>

          {/* Section 1: Executive Summary */}
          <section className="space-y-4">
            <h2 className="text-xl font-black text-white flex items-center gap-2 border-l-4 border-brand-pink pl-3">
              1. Ringkasan Eksekutif & Latar Belakang
            </h2>
            <div className="rounded-3xl border border-stone-800 bg-stone-950 p-6 space-y-4 text-xs sm:text-sm text-stone-300 leading-relaxed">
              <p>
                Sebelumnya, operasional harian travel umrah menghadapi tantangan umum di industri: <strong>data tercecer di file Excel, koordinasi pendaftaran via WhatsApp, penghitungan komisi agen yang rawan selisih, serta risiko kebocoran kasir karena invoice dan kwitansi dibuat manual di Word</strong>.
              </p>
              <p>
                Melalui ekosistem digital baru ini, seluruh kegiatan operasional disatukan ke dalam <strong>1 Database Cloud Terpadu</strong> dengan 3 gerbang akses yang saling mengunci:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                <div className="p-3.5 rounded-2xl bg-stone-900 border border-stone-800">
                  <strong className="text-brand-pink block mb-1">🏢 Kantor Pusat (El Massa Web)</strong>
                  <span className="text-xs text-stone-400">Verifikasi kasir, cetak invoice & kuitansi resmi, logistik, dan manifest.</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-stone-900 border border-stone-800">
                  <strong className="text-amber-400 block mb-1">📱 Mitra & Agen (My El Massa)</strong>
                  <span className="text-xs text-stone-400">Cek kuota seat real-time & daftarkan jamaah langsung dari HP.</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-stone-900 border border-stone-800">
                  <strong className="text-purple-400 block mb-1">✨ Aplikasi Jamaah (UmrahMe)</strong>
                  <span className="text-xs text-stone-400">Jadwal manasik, live itinerary, & pengisian berkas mandiri.</span>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Audit Integrity Report */}
          <section className="space-y-4">
            <h2 className="text-xl font-black text-white flex items-center gap-2 border-l-4 border-emerald-500 pl-3">
              2. Hasil Audit Teknis & Kesiapan Sistem
            </h2>
            <div className="rounded-3xl border border-stone-800 bg-stone-950 p-6 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 rounded-2xl bg-stone-900 border border-stone-800">
                  <span className="text-xs text-stone-400 block">Kompilasi TypeScript</span>
                  <span className="text-base font-black text-emerald-400">0 Error (Pass)</span>
                </div>
                <div className="p-3 rounded-2xl bg-stone-900 border border-stone-800">
                  <span className="text-xs text-stone-400 block">Next.js Production Build</span>
                  <span className="text-base font-black text-emerald-400">103 Routes OK</span>
                </div>
                <div className="p-3 rounded-2xl bg-stone-900 border border-stone-800">
                  <span className="text-xs text-stone-400 block">Integrasi Database</span>
                  <span className="text-base font-black text-emerald-400">Supabase Cloud</span>
                </div>
                <div className="p-3 rounded-2xl bg-stone-900 border border-stone-800">
                  <span className="text-xs text-stone-400 block">Uji Coba End-to-End</span>
                  <span className="text-base font-black text-emerald-400">100% Lulus</span>
                </div>
              </div>

              <div className="text-xs text-stone-400 space-y-1.5 pt-2">
                <p>✓ <strong>Relasi Kolom Agen:</strong> <code className="text-pink-300">real_bookings.agent_code</code> aktif dan mengaitkan setiap pendaftaran agen ke rekap komisi otomatis.</p>
                <p>✓ <strong>Kop Surat & Kwitansi:</strong> Format PDF dan cetak fisik menggunakan motif kotak pink-coklat resmi El Massa.</p>
                <p>✓ <strong>Sidebar Dinamis:</strong> Mendukung pengecilan ruang kerja dengan shortcut <code className="text-stone-200">Ctrl + B</code>.</p>
              </div>
            </div>
          </section>

          {/* Section 3: Live Quick Launcher */}
          <section className="space-y-4">
            <h2 className="text-xl font-black text-white flex items-center gap-2 border-l-4 border-amber-500 pl-3">
              3. Akses Langsung Seluruh Modul (Live Tour)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <Link
                href="/my-elmassa"
                target="_blank"
                className="p-4 rounded-2xl border border-pink-500/30 bg-stone-950 hover:bg-stone-900 transition space-y-1 group"
              >
                <div className="flex items-center justify-between text-brand-pink">
                  <Smartphone className="h-4 w-4" />
                  <ExternalLink className="h-3 w-3 opacity-60 group-hover:opacity-100" />
                </div>
                <strong className="text-sm font-bold text-white block">Portal My El Massa</strong>
                <span className="text-[11px] text-stone-400 block">Portal mandiri pendaftaran mitra & agen.</span>
              </Link>

              <Link
                href="/booking"
                target="_blank"
                className="p-4 rounded-2xl border border-stone-800 bg-stone-950 hover:bg-stone-900 transition space-y-1 group"
              >
                <div className="flex items-center justify-between text-amber-400">
                  <CreditCard className="h-4 w-4" />
                  <ExternalLink className="h-3 w-3 opacity-60 group-hover:opacity-100" />
                </div>
                <strong className="text-sm font-bold text-white block">Manajemen Booking</strong>
                <span className="text-[11px] text-stone-400 block">Daftar registrasi calon jamaah & status bayar.</span>
              </Link>

              <Link
                href="/dokumen/invoice"
                target="_blank"
                className="p-4 rounded-2xl border border-stone-800 bg-stone-950 hover:bg-stone-900 transition space-y-1 group"
              >
                <div className="flex items-center justify-between text-blue-400">
                  <FileSpreadsheet className="h-4 w-4" />
                  <ExternalLink className="h-3 w-3 opacity-60 group-hover:opacity-100" />
                </div>
                <strong className="text-sm font-bold text-white block">Invoice & Kwitansi</strong>
                <span className="text-[11px] text-stone-400 block">Cetak bukti bayar resmi ber-kop surat.</span>
              </Link>

              <Link
                href="/pembayaran/rekap-grup"
                target="_blank"
                className="p-4 rounded-2xl border border-stone-800 bg-stone-950 hover:bg-stone-900 transition space-y-1 group"
              >
                <div className="flex items-center justify-between text-emerald-400">
                  <BarChart3 className="h-4 w-4" />
                  <ExternalLink className="h-3 w-3 opacity-60 group-hover:opacity-100" />
                </div>
                <strong className="text-sm font-bold text-white block">Rekap Keuangan Grup</strong>
                <span className="text-[11px] text-stone-400 block">Laporan laba-rugi kotor per rombongan.</span>
              </Link>

              <Link
                href="/administrasi/surat"
                target="_blank"
                className="p-4 rounded-2xl border border-stone-800 bg-stone-950 hover:bg-stone-900 transition space-y-1 group"
              >
                <div className="flex items-center justify-between text-rose-400">
                  <Mails className="h-4 w-4" />
                  <ExternalLink className="h-3 w-3 opacity-60 group-hover:opacity-100" />
                </div>
                <strong className="text-sm font-bold text-white block">Surat Menyurat Resmi</strong>
                <span className="text-[11px] text-stone-400 block">Surat rekomendasi paspor Kemenag & cuti.</span>
              </Link>

              <Link
                href="/operasional/stok"
                target="_blank"
                className="p-4 rounded-2xl border border-stone-800 bg-stone-950 hover:bg-stone-900 transition space-y-1 group"
              >
                <div className="flex items-center justify-between text-purple-400">
                  <Boxes className="h-4 w-4" />
                  <ExternalLink className="h-3 w-3 opacity-60 group-hover:opacity-100" />
                </div>
                <strong className="text-sm font-bold text-white block">Stok Perlengkapan</strong>
                <span className="text-[11px] text-stone-400 block">Inventaris koper, ihram, mukena & batik.</span>
              </Link>
            </div>
          </section>

          {/* Section 4: Concluding Note */}
          <div className="text-center pt-8 border-t border-stone-800 space-y-2">
            <p className="text-xs text-stone-400">
              Disiapkan untuk Owner & Manajemen PT El Massa Tour & Travel • Siap Kick-Off Senin
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-2xl bg-brand-pink px-6 py-3 text-xs font-bold text-white shadow-lg hover:bg-rose-600 transition"
            >
              <span>Mulai Bekerja di Dashboard Kantor</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
