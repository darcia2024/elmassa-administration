"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  BarChart3,
  Bell,
  Boxes,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Compass,
  CreditCard,
  DollarSign,
  Download,
  ExternalLink,
  FileCheck,
  FileSpreadsheet,
  FileText,
  Handshake,
  Heart,
  Hotel,
  Layers,
  Lock,
  Luggage,
  Mails,
  MapPin,
  MessageSquare,
  Monitor,
  PhoneCall,
  Plane,
  Plus,
  Printer,
  QrCode,
  Receipt,
  ReceiptText,
  RefreshCw,
  Search,
  Send,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Sparkles,
  TrendingUp,
  UserCheck,
  UserCog,
  Users,
  Wallet,
  Zap,
} from "lucide-react";

// Skenario Uji Interaktif untuk Bagian #contoh
const SCENARIOS = [
  {
    q: "1. Agen daftarkan jamaah dari HP, apa yang terjadi di kantor?",
    title: "Pendaftaran Otomatis Terikat Kode Agen",
    sum: "Data calon jamaah langsung masuk ke menu Booking kantor dengan status 'Belum Bayar'. Komisi agen otomatis dihitung (Rp 1.500.000/pax), dan kuota seat paket langsung berkurang.",
    type: "bars",
    bars: [
      { label: "Sisa Kuota Paket", val: 14, max: 45, unit: "14 Seat Sisa", isLow: true },
      { label: "Pax Didaftarkan Agen", val: 2, max: 10, unit: "2 Pax Baru", isLow: false },
      { label: "Estimasi Komisi Agen", val: 3000000, max: 5000000, unit: "Rp 3.000.000", isLow: false },
    ],
    src: "Sumber: real_bookings.agent_code ➔ agents (Tersinkron Real-Time)",
    rec: {
      found: "Booking baru masuk dari agen AG-ELMASSA-01 (Ustadz H. Ahmad Sobri) untuk 2 jamaah paket Oktober.",
      evidence: "Kode Booking BK-MYE-XXXXXX tercatat di tabel real_bookings dengan status 'Belum Bayar'.",
      action: "Bagian kasir kantor menunggu transfer DP dari jamaah/agen sebelum mengonfirmasi pembayaran.",
      confidence: "Terkunci Aman: Akun UmrahMe jamaah belum aktif sampai kasir mengonfirmasi DP.",
    },
  },
  {
    q: "2. Kasir menerima transfer DP, bagaimana status kuitansi & UmrahMe?",
    title: "Verifikasi Kasir & Aktivasi Otomatis UmrahMe",
    sum: "Saat kasir menginput DP, sistem otomatis menerbitkan Kuitansi resmi (KW-2610-0012) lengkap dengan kalimat terbilang rupiah dan stempel sah. Seketika itu juga, akun aplikasi UmrahMe milik jamaah otomatis DIAKTIFKAN.",
    type: "kpis",
    kpis: [
      { num: "KW-2610-0012", label: "Nomor Kwitansi Resmi Otomatis Terbit" },
      { num: "Rp 10.000.000", label: "DP Terverifikasi Masuk Rekening Kasir" },
      { num: "Aktif 🟢", label: "Status Akun Digital UmrahMe Jamaah" },
      { num: "100% Sinkron", label: "Kuitansi Terhubung Langsung ke Invoice" },
    ],
    src: "Sumber: payments ➔ receipts ➔ real_bookings.umrah_me_status",
    rec: {
      found: "Pembayaran DP berhasil dicocokkan dengan rekening bank resmi PT El Massa Tour & Travel.",
      evidence: "Tersimpan di tabel payments dan otomatis membuat baris bukti sah di tabel receipts.",
      action: "Kirim PDF kuitansi ke jamaah via WhatsApp dan instruksikan jamaah login ke aplikasi UmrahMe.",
      confidence: "Anti-Bocor: Kwitansi tidak bisa dibuat tanpa transaksi uang masuk di kasir.",
    },
  },
  {
    q: "3. Bagaimana cara menerbitkan Surat Rekomendasi Paspor Kemenag?",
    title: "Otomasi Dokumen Resmi Ber-Kop Surat Asli",
    sum: "Staf kantor cukup memilih nama jamaah dari database. Sistem otomatis mengisi Nama, NIK, Tempat/Tgl Lahir, dan Paket Keberangkatan ke dalam format surat resmi Kemenag dengan kop motif pink-coklat asli.",
    type: "bars",
    bars: [
      { label: "Surat Rekomendasi Paspor Baru", val: 100, max: 100, unit: "Siap Cetak PDF", isLow: false },
      { label: "Surat Penambahan Nama (3 Kata)", val: 100, max: 100, unit: "Format Baku Imigrasi", isLow: false },
      { label: "Surat Izin Cuti Kerja Jamaah", val: 100, max: 100, unit: "Otomatis Tanggal", isLow: false },
    ],
    src: "Sumber: jamaah_profiles ➔ letters (Arsip Resmi Surat Menyurat)",
    rec: {
      found: "Jamaah membutuhkan surat rekomendasi ke kantor imigrasi untuk pembuatan paspor umrah.",
      evidence: "Data NIK dan nama jamaah sudah ditarik otomatis dari formulir booking/jamaah.",
      action: "Klik tombol 'Cetak PDF' di menu Surat Menyurat. Surat langsung bertanda tangan & stempel resmi.",
      confidence: "Nol Ketik Ulang: 100% bebas dari kesalahan ketik nama atau NIK di Word.",
    },
  },
  {
    q: "4. Bagaimana Owner melihat laba kotor per rombongan keberangkatan?",
    title: "Rekapitulasi Keuangan & Margin Laba Grup",
    sum: "Di menu Rekap Keuangan Grup, Owner dapat melihat total uang masuk dari jamaah rombongan dikurangi seluruh realisasi biaya (tiket penerbangan, hotel Makkah-Madinah, visa, muthawwif, & perlengkapan).",
    type: "kpis",
    kpis: [
      { num: "Rp 1.346.543.000", label: "Total Nilai Booking Grup (45 Pax)" },
      { num: "Rp 1.189.200.000", label: "Realisasi Biaya Tiket, Hotel & Handling" },
      { num: "Rp 157.343.000", label: "Estimasi Margin Laba Kotor Rombongan" },
      { num: "11.7%", label: "Persentase Margin Keuntungan" },
    ],
    src: "Sumber: real_bookings + published_packages.costing_data ➔ /pembayaran/rekap-grup",
    rec: {
      found: "Owner membutuhkan kepastian kesehatan finansial sebelum rombongan terbang ke Saudi.",
      evidence: "Data terintegrasi antara penerimaan kasir dengan simulator HPP paket yang sudah ditetapkan.",
      action: "Owner dapat memantau sisa piutang jamaah yang belum lunas menjelang batas akhir pelunasan.",
      confidence: "Akurat: Angka dihitung dari data transaksi riil, bukan estimasi kasar.",
    },
  },
];

// Data Rincian 6 Modul Kantor & Keuangan
const OFFICE_MODULES = [
  {
    id: "paket-kuota",
    number: "01",
    title: "Manajemen Paket Umrah & Simulasi HPP / Costing",
    tagline: "Penetapan harga berbasis HPP riil, alokasi kursi otomatis, dan proteksi margin.",
    bullets: [
      "Penetapan kuota target seat per paket (contoh: 45 seat) yang otomatis berkurang saat booking masuk.",
      "Simulator kalkulator HPP: Harga Tiket Pesawat + Hotel Madinah + Hotel Makkah + Visa & Asuransi + Handling + Muthawwif + Margin Target.",
      "Katalog paket aktif otomatis tersinkronisasi ke portal agen My El Massa secara real-time.",
      "Fitur penutupan otomatis (Auto-Lock) jika kuota kursi paket telah terpenuhi.",
    ],
    path: "/paket",
    badge: "Fondasi Bisnis",
  },
  {
    id: "booking-jamaah",
    number: "02",
    title: "Booking Jamaah Terpadu & Manifest Maskapai",
    tagline: "Satu pintu pendaftaran jamaah, auto-generate kode booking, dan integrasi kamar.",
    bullets: [
      "Kode booking instan otomatis berurutan (contoh: BK-2610-0012).",
      "Pencatatan data keluarga & mahram, jenis kamar (Quad, Triple, Double), dan kebutuhan khusus lansia.",
      "Deteksi kelengkapan dokumen paspor, foto KTP, kartu keluarga, dan buku nikah dalam satu layar.",
      "Export Manifest Keberangkatan sesuai standar maskapai penerbangan (Saudia, Garuda) dan muassasah Saudi.",
    ],
    path: "/booking",
    badge: "Administrasi Utama",
  },
  {
    id: "kasir-kuitansi",
    number: "03",
    title: "Kasir Anti-Bocor (Zero Leakage) & Kuitansi Otomatis",
    tagline: "Kwitansi resmi hanya terbit saat ada pembayaran sah yang diverifikasi kasir.",
    bullets: [
      "Pencatatan pembayaran DP, cicilan berkala, dan pelunasan dengan invoice resmi ber-kop.",
      "Otomasi Kuitansi Resmi (KW-2610-XXXX) dengan kalimat terbilang Rupiah otomatis (contoh: 'Sepuluh Juta Rupiah').",
      "Stempel digital sah dan QR Code verifikasi keaslian bukti pembayaran.",
      "Gating System Anti-Bocor: Kwitansi kasir menjadi pemicu tunggal aktifnya akun aplikasi UmrahMe jamaah.",
    ],
    path: "/pembayaran",
    badge: "Keamanan Finansial",
  },
  {
    id: "surat-kemenag",
    number: "04",
    title: "Generator Dokumen Resmi Kemenag & Imigrasi",
    tagline: "Otomasi surat menyurat ber-kop resmi asli El Massa tanpa perlu ketik ulang di Word.",
    bullets: [
      "Kop surat resmi asli motif kotak pink-coklat PT El Massa Tour & Travel (Izin Kemenag U.412).",
      "Surat Rekomendasi Pembuatan Paspor Baru ke Kantor Imigrasi.",
      "Surat Penambahan 3 Suku Kata Nama untuk kepatuhan visa haji/umrah Kerajaan Arab Saudi.",
      "Surat Izin Cuti Kerja Jamaah ke kantor/instansi tempat jamaah bekerja.",
      "Nol salah ketik: Nama, NIK, dan tanggal lahir ditarik otomatis dari database jamaah.",
    ],
    path: "/administrasi/surat",
    badge: "Legalitas & Imigrasi",
  },
  {
    id: "stok-gudang",
    number: "05",
    title: "Manajemen Gudang Perlengkapan (Metode FIFO)",
    tagline: "Kontrol fisik mutasi koper bagasi, kain ihram, mukena, dan batik resmi El Massa.",
    bullets: [
      "Kartu stok digital untuk Koper Bagasi 24\", Koper Kabin 20\", Tas Paspor, Kain Ihram, Mukena, dan Batik.",
      "Pencatatan mutasi barang masuk dari vendor dan barang keluar ke tangan jamaah.",
      "Metode FIFO (First In, First Out) mencegah penumpukan barang lama di gudang.",
      "Peringatan stok menipis (Low Stock Alert) sebelum rombongan diberangkatkan.",
    ],
    path: "/operasional/stok",
    badge: "Logistik Fisik",
  },
  {
    id: "rekap-grup",
    number: "06",
    title: "Rekapitulasi Keuangan Grup & Margin Laba Rombongan",
    tagline: "Visibilitas total bagi Owner atas laba kotor riil setiap rombongan keberangkatan.",
    bullets: [
      "Total Penerimaan Uang Kasir Jamaah dikurangi Realisasi Beban Riil (Tiket + Hotel + Visa + Bus + Muthawwif + Handling).",
      "Perhitungan margin laba kotor (Gross Margin) dan persentase keuntungan rombongan secara riil.",
      "Monitoring sisa piutang jamaah yang belum melunasi menjelang batas waktu penutupan.",
      "Memberikan kepastian kesehatan finansial rombongan sebelum terbang ke Arab Saudi.",
    ],
    path: "/pembayaran/rekap-grup",
    badge: "Owner Dashboard",
  },
];

// Data Rincian Fitur UmrahMe
const UMRAHME_FEATURES = [
  {
    title: "1. Digital Itinerary & Timeline Harian",
    desc: "Jadwal detail dari Hari 1 (CGK ➔ JED ➔ Madinah) sampai Hari 12 (Kepulangan). Jamaah tahu persis kapan jadwal ziarah Raudhah, ziarah Makkah-Madinah, waktu manasik, dan waktu ibadah bebas.",
    tag: "Kepastian Waktu",
  },
  {
    title: "2. Info Penerbangan & Boarding Pass Alert",
    desc: "Detail maskapai (Saudia Airlines / Garuda), kode penerbangan (SV-819), terminal keberangkatan Bandara Soekarno-Hatta, jam check-in, dan batas bagasi 2x23 kg jamaah tercantum rapi.",
    tag: "Kenyamanan Terbang",
  },
  {
    title: "3. Akomodasi Hotel & Alokasi Kamar (Rooming)",
    desc: "Nama hotel Makkah & Madinah, bintang hotel, jarak langkah kaki ke pelataran Masjidil Haram/Nabawi, serta nama teman satu kamar (Quad/Triple/Double) langsung tampil di HP jamaah.",
    tag: "Anti-Bingung Hotel",
  },
  {
    title: "4. Audio Panduan Doa & Manasik Offline",
    desc: "Kumpulan audio doa tawaf, sa'i, tahallul, dan niat ihram yang bisa diputar di Tanah Suci tanpa kuota internet. Dilengkapi teks Arab, transliterasi Latin, dan terjemahan bahasa Indonesia.",
    tag: "Khusyuk Ibadah",
  },
  {
    title: "5. Tombol Darurat & Kontak Muthawwif WhatsApp",
    desc: "Tombol panggilan darurat satu-klik untuk langsung menghubungi Muthawwif (Ustadz pembimbing) dan Tour Leader rombongan via WhatsApp jika jamaah terpisah dari rombongan di Masjidil Haram.",
    tag: "Keamanan Jamaah",
  },
  {
    title: "6. Upload Mandiri Dokumen & Paspor Jamaah",
    desc: "Jamaah atau keluarganya dapat mengunggah foto paspor, buku nikah, dan kartu vaksin meningitis secara mandiri dari smartphone, langsung tersimpan aman di database cloud kantor.",
    tag: "Mandiri & Praktis",
  },
];

// Data Rincian Fitur My El Massa
const MY_ELMASSA_FEATURES = [
  {
    title: "1. Dompet Komisi Agen Transparan (Rp 1.500.000 / Pax)",
    desc: "Agen memantau saldo komisi riil, komisi per jamaah yang didaftarkan, riwayat komisi yang telah dicairkan, dan saldo siap tarik. Mengeliminasi kecurigaan atau selisih komisi manual.",
    tag: "Hak Agen Terkunci",
  },
  {
    title: "2. Pendaftaran Mandiri Calon Jamaah dari HP",
    desc: "Agen cukup mengisi formulir ringkas: Nama jamaah, NIK, No WA, dan paket yang diminati. Data langsung masuk ke menu Booking kantor pusat dan kuota kursi paket otomatis berkurang.",
    tag: "Kecepatan Closing",
  },
  {
    title: "3. Katalog Paket & Kuota Kursi Real-Time",
    desc: "Agen melihat langsung sisa kursi paket yang masih tersedia tanpa perlu bertanya bolak-balik via WhatsApp ke admin kantor pusat ('Mbak, paket Oktober masih ada sisa kursi?').",
    tag: "Real-Time Seat",
  },
  {
    title: "4. Pelacakan Status Jamaah Binaan (Tracking)",
    desc: "Agen dapat memantau apakah jamaah binaannya sudah mentransfer DP ke kasir, apakah kuitansi resmi sudah terbit, dan apakah akun UmrahMe jamaah sudah aktif.",
    tag: "Transparansi Penuh",
  },
  {
    title: "5. Pusat Media Promosi & Brosur Resmi",
    desc: "Agen dapat mengunduh materi promosi, flyer resmi ber-logo El Massa, dan rincian harga paket untuk langsung dibagikan ke majelis taklim, keluarga, atau status WhatsApp.",
    tag: "Dukungan Penjualan",
  },
];

export default function PitchPresentationPage() {
  // State untuk Hero Interactive Device Switcher
  const [heroDeviceMode, setHeroDeviceMode] = useState<"admin" | "agen" | "umrahme" | "kuitansi">("admin");

  // State untuk Interactive Tab Modul Kantor
  const [activeOfficeModulIdx, setActiveOfficeModulIdx] = useState(0);

  // State untuk Interactive Chat Mockup
  const [chatInput, setChatInput] = useState("");
  const [chatAnswers, setChatAnswers] = useState<Array<{ role: "user" | "sys"; text: string; time: string }>>([
    {
      role: "user",
      text: "Berapa sisa kuota seat Paket Umrah 01 Oktober 2026 dan posisi uang masuk di kasir?",
      time: "09:12",
    },
    {
      role: "sys",
      text: "Paket 01 Oktober 2026: Terisi 31 dari 45 Pax (Sisa 14 Seat). Kasir telah mencatat DP terverifikasi sebesar Rp 310.000.000 untuk 31 jamaah aktif.",
      time: "09:12",
    },
  ]);

  // State untuk Interactive Kasir Mockup
  const [isKasirVerified, setIsKasirVerified] = useState(false);

  // State untuk Scenario Selector
  const [activeScenarioIdx, setActiveScenarioIdx] = useState(0);
  const activeScenario = SCENARIOS[activeScenarioIdx];

  const handleSendChatPrompt = (promptText: string) => {
    setChatInput("");
    setChatAnswers((prev) => [
      ...prev,
      { role: "user", text: promptText, time: "Sekarang" },
      {
        role: "sys",
        text: promptText.includes("komisi")
          ? "Mitra AG-01 (Ustadz Ahmad) membukukan 8 jamaah (Komisi Rp 12.000.000, telah dicairkan Rp 5.000.000, sisa saldo dompet Rp 7.000.000)."
          : promptText.includes("paspor")
          ? "Terdapat 6 jamaah Paket Oktober yang belum memiliki paspor. 4 surat rekomendasi Kemenag sudah diterbitkan hari ini."
          : "Data sistem tersinkronisasi 100% dengan database cloud Supabase.",
        time: "Sekarang",
      },
    ]);
  };

  return (
    <>
      {/* SCOPED CSS IDENTIK DENGAN ARTIFACT-DAR: Stacked panels, warm canvas, rich mockups & lively animations */}
      <style jsx global>{`
        :root {
          --page: #dad8d3;
          --surface: #f5f4ef;
          --card: #ffffff;
          --ink: #141414;
          --muted: #64635d;
          --line: #e2e0da;
          --accent: #d83b7d;
          --accent-hover: #be2c6c;
          --accent-soft: #fdf2f8;
          --brand-cocoa: #3c2920;
          --hero-a: #2a1b18;
          --hero-b: #543931;
          --track: #eeede8;
          --bad: #b3402e;
          --success: #15803d;
          --gold: #b45309;
          --font: "Inter Tight", "Segoe UI", system-ui, -apple-system, sans-serif;
          color-scheme: light;
        }

        body {
          background: var(--page);
          color: var(--ink);
          font: 400 17px/1.55 var(--font);
          padding-block: 16px 40px;
          padding-left: max(16px, env(safe-area-inset-left, 0px));
          padding-right: max(16px, env(safe-area-inset-right, 0px));
          margin: 0;
          overflow-x: hidden;
        }

        /* KEYFRAME ANIMATIONS */
        @keyframes growx {
          from {
            transform: scaleX(0);
          }
          to {
            transform: scaleX(1);
          }
        }

        @keyframes growy {
          from {
            transform: scaleY(0);
          }
          to {
            transform: scaleY(1);
          }
        }

        @keyframes rise {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slidein {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes pulseGreen {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(22, 163, 74, 0.45);
          }
          50% {
            box-shadow: 0 0 0 8px rgba(22, 163, 74, 0);
          }
        }

        @keyframes pulsePink {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(216, 59, 125, 0.45);
          }
          50% {
            box-shadow: 0 0 0 8px rgba(216, 59, 125, 0);
          }
        }

        @keyframes floatBadge {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-6px);
          }
        }

        @keyframes blinkdot {
          0%, 100% {
            opacity: 0.25;
          }
          50% {
            opacity: 1;
          }
        }

        @keyframes stampPop {
          0% {
            transform: scale(2.2) rotate(-15deg);
            opacity: 0;
          }
          100% {
            transform: scale(1) rotate(-8deg);
            opacity: 1;
          }
        }

        .anim-rise {
          animation: rise 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        .anim-pulse-green {
          animation: pulseGreen 2s infinite ease-in-out;
        }

        .anim-float {
          animation: floatBadge 3.5s ease-in-out infinite;
        }

        .anim-stamp {
          animation: stampPop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
        }

        .pitch-container {
          max-width: 1260px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 14px;
          min-width: 0;
        }

        /* TOP NAVIGATION */
        .pitch-nav {
          background: var(--card);
          border-radius: 14px;
          padding: 10px 16px 10px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
        }

        .pitch-nav .logo {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 700;
          font-size: 1.05rem;
          color: var(--ink);
          text-decoration: none;
          letter-spacing: -0.02em;
        }

        .pitch-nav .links {
          display: flex;
          gap: 20px;
        }

        .pitch-nav .links a {
          color: var(--muted);
          text-decoration: none;
          font-size: 0.86rem;
          font-weight: 500;
          transition: color 0.15s;
        }

        .pitch-nav .links a:hover {
          color: var(--ink);
        }

        /* MOBILE HORIZONTAL PILL SUBNAV */
        .mobile-pill-nav {
          display: none;
          gap: 6px;
          overflow-x: auto;
          padding: 2px 4px 6px;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
        }

        .mobile-pill-nav::-webkit-scrollbar {
          display: none;
        }

        .mobile-pill-nav a {
          flex-shrink: 0;
          background: var(--card);
          color: var(--muted);
          border: 1px solid var(--line);
          border-radius: 20px;
          padding: 6px 12px;
          font-size: 0.76rem;
          font-weight: 600;
          text-decoration: none;
          white-space: nowrap;
          transition: all 0.15s;
        }

        .mobile-pill-nav a:hover,
        .mobile-pill-nav a:active {
          background: var(--ink);
          color: #ffffff;
          border-color: var(--ink);
        }

        /* BUTTONS */
        .pitch-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 42px;
          padding: 0 18px;
          border-radius: 10px;
          font: 600 0.88rem/1 var(--font);
          text-decoration: none;
          border: 1px solid transparent;
          cursor: pointer;
          transition: all 0.15s;
          gap: 8px;
        }

        .pitch-btn-accent {
          background: var(--accent);
          color: #ffffff;
          box-shadow: 0 2px 8px rgba(216, 59, 125, 0.25);
        }

        .pitch-btn-accent:hover {
          background: var(--accent-hover);
          color: #ffffff;
        }

        .pitch-btn-ghost {
          border-color: rgba(255, 255, 255, 0.4);
          color: #ffffff;
        }

        .pitch-btn-ghost:hover {
          background: rgba(255, 255, 255, 0.12);
        }

        /* HERO COVER */
        .pitch-hero {
          border-radius: 22px;
          background: linear-gradient(130deg, var(--hero-a), var(--hero-b));
          color: #ffffff;
          padding: clamp(28px, 5.5vw, 64px) clamp(20px, 4.5vw, 48px);
          display: grid;
          grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
          gap: 36px;
          align-items: center;
          overflow: hidden;
          position: relative;
        }

        .pitch-hero h1 {
          font-weight: 500;
          letter-spacing: -0.035em;
          font-size: clamp(2rem, 4.8vw, 3.8rem);
          line-height: 1.08;
          margin: 0;
          text-wrap: balance;
        }

        .pitch-hero p.sub {
          color: rgba(255, 255, 255, 0.88);
          max-width: 48ch;
          margin-top: 16px;
          font-size: 1rem;
          line-height: 1.5;
        }

        .pitch-hero .ctas {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          margin-top: 24px;
        }

        .pitch-trust {
          margin-top: 28px;
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 0.84rem;
          color: rgba(255, 255, 255, 0.9);
        }

        .pitch-trust b {
          display: inline-grid;
          place-items: center;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: var(--ink);
          color: #ffffff;
          font-weight: 700;
          font-size: 0.82rem;
          border: 1px solid rgba(255, 255, 255, 0.2);
          flex-shrink: 0;
        }

        /* DEVICE MOCKUP (HERO INTERACTIVE SIMULATOR) */
        .device-wrapper {
          position: relative;
          width: 100%;
          min-width: 0;
        }

        .device-bezel {
          background: var(--card);
          color: var(--ink);
          border-radius: 24px;
          padding: 16px;
          box-shadow: 0 32px 64px -18px rgba(10, 8, 8, 0.45);
          border: 8px solid #1f1614;
          position: relative;
          min-height: 420px;
          display: flex;
          flex-direction: column;
          width: 100%;
          box-sizing: border-box;
        }

        .device-top-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 10px;
          border-bottom: 1px solid var(--line);
          margin-bottom: 12px;
          gap: 8px;
          overflow: hidden;
        }

        .window-dots {
          display: flex;
          gap: 5px;
          align-items: center;
          flex-shrink: 0;
        }

        .window-dot {
          width: 9px;
          height: 9px;
          border-radius: 50%;
        }

        .device-modes {
          display: flex;
          background: var(--surface);
          border-radius: 8px;
          padding: 2px;
          gap: 2px;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
        }

        .device-modes::-webkit-scrollbar {
          display: none;
        }

        .mode-tab {
          border: none;
          background: transparent;
          font: 600 0.72rem/1 var(--font);
          padding: 6px 9px;
          border-radius: 6px;
          color: var(--muted);
          cursor: pointer;
          transition: all 0.15s;
          display: flex;
          align-items: center;
          gap: 4px;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .mode-tab[data-active="true"] {
          background: var(--ink);
          color: #ffffff;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
        }

        /* PANELS */
        .pitch-panel {
          background: var(--surface);
          border-radius: 20px;
          padding: clamp(24px, 4.5vw, 54px);
          min-width: 0;
        }

        .panel-head {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 26px;
        }

        .split-head {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
          flex-wrap: wrap;
        }

        .eyebrow {
          font-size: 0.74rem;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--muted);
          margin: 0;
        }

        h2 {
          font-size: clamp(1.5rem, 2.8vw, 2.35rem);
          font-weight: 500;
          line-height: 1.18;
          letter-spacing: -0.025em;
          margin: 0;
          text-wrap: balance;
        }

        .lead {
          color: var(--muted);
          max-width: 58ch;
          font-size: 0.98rem;
          margin: 0;
          line-height: 1.5;
        }

        /* STATS GRID */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 12px;
          margin-top: 32px;
        }

        .stat-card {
          background: var(--card);
          border-radius: 14px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          gap: 28px;
          min-height: 155px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);
        }

        .stat-card b {
          font-size: 2.1rem;
          font-weight: 500;
          letter-spacing: -0.03em;
          line-height: 1;
          color: var(--ink);
        }

        /* CARDS & GRIDS */
        .grid-3 {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 14px;
        }

        .card {
          background: var(--card);
          border-radius: 14px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
          min-width: 0;
          overflow-wrap: anywhere;
        }

        .card h3 {
          font-size: 1.1rem;
          font-weight: 600;
          letter-spacing: -0.01em;
          margin: 0;
          line-height: 1.3;
        }

        .card p {
          color: var(--muted);
          font-size: 0.88rem;
          line-height: 1.5;
          margin: 0;
        }

        .card .ic {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: var(--surface);
          color: var(--accent);
          display: grid;
          place-items: center;
          margin-bottom: 4px;
          flex-shrink: 0;
        }

        /* FITUR GRID & SCREEN MOCKUPS */
        .feat-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 14px;
        }

        .feat-card {
          background: var(--card);
          border-radius: 16px;
          padding: 14px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          min-width: 0;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
          border: 1px solid var(--line);
        }

        .feat-screen {
          background: var(--surface);
          border-radius: 12px;
          min-height: 310px;
          padding: 14px;
          position: relative;
          font-size: 0.8rem;
          display: flex;
          flex-direction: column;
          gap: 10px;
          border: 1px solid rgba(0, 0, 0, 0.04);
        }

        .feat-stop {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 8px;
          font-size: 0.72rem;
          color: var(--muted);
          font-weight: 600;
        }

        .feat-chip {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 3px 8px;
          background: var(--card);
          border-radius: 20px;
          font-size: 0.68rem;
          font-weight: 600;
          color: var(--ink);
          border: 1px solid var(--line);
          flex-shrink: 0;
        }

        .feat-chip .dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #16a34a;
        }

        .feat-txt {
          padding: 2px 6px 8px;
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .feat-txt h3 {
          font-size: 1.1rem;
          font-weight: 600;
          letter-spacing: -0.015em;
          margin: 0;
        }

        .feat-txt p {
          color: var(--muted);
          font-size: 0.88rem;
          line-height: 1.45;
          margin: 0;
        }

        /* CHAT STYLING DI SCREEN */
        .chat-msgs {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 8px;
          overflow-y: auto;
          padding-right: 2px;
        }

        .chat-bubble-u {
          align-self: flex-end;
          background: var(--ink);
          color: #ffffff;
          border-radius: 12px 12px 3px 12px;
          padding: 7px 11px;
          max-width: 90%;
          font-size: 0.76rem;
          line-height: 1.4;
        }

        .chat-bubble-s {
          align-self: flex-start;
          background: var(--card);
          border-radius: 12px 12px 12px 3px;
          padding: 8px 11px;
          width: 96%;
          display: flex;
          flex-direction: column;
          gap: 5px;
          font-size: 0.76rem;
          line-height: 1.4;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
        }

        .chat-inbar {
          background: var(--card);
          border: 1px solid var(--line);
          border-radius: 10px;
          padding: 4px 6px 4px 10px;
          display: flex;
          align-items: center;
          gap: 6px;
          min-height: 36px;
        }

        .chat-inbar input {
          flex: 1;
          border: none;
          background: transparent;
          font: 400 0.78rem var(--font);
          color: var(--ink);
          outline: none;
          min-width: 0;
        }

        .chat-inbar .send-btn {
          width: 28px;
          height: 28px;
          border-radius: 7px;
          background: var(--accent);
          color: #ffffff;
          display: grid;
          place-items: center;
          border: none;
          cursor: pointer;
          flex-shrink: 0;
        }

        /* KPI GRID SCREEN */
        .screen-kgrid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6px;
          margin-top: 2px;
        }

        .screen-k {
          background: var(--card);
          border-radius: 9px;
          padding: 8px 10px;
          display: flex;
          flex-direction: column;
          gap: 2px;
          border: 1px solid var(--line);
        }

        .screen-k b {
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--ink);
        }

        .screen-k span {
          font-size: 0.66rem;
          color: var(--muted);
        }

        /* BARS SCREEN */
        .mbar {
          display: grid;
          grid-template-columns: 74px minmax(0, 1fr) 38px;
          gap: 6px;
          align-items: center;
          font-size: 0.7rem;
        }

        .mbar .tr {
          height: 8px;
          background: var(--track);
          border-radius: 3px;
          overflow: hidden;
          position: relative;
        }

        .mbar .tr i {
          display: block;
          height: 100%;
          background: var(--accent);
          border-radius: 3px;
          transform-origin: left;
          animation: growx 0.9s cubic-bezier(0.2, 0.7, 0.2, 1) both;
        }

        /* INTERACTIVE SIMULATOR (SECTION #contoh) */
        .demo-box {
          display: grid;
          grid-template-columns: 310px minmax(0, 1fr);
          gap: 14px;
          margin-top: 8px;
        }

        .qs-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .qs-btn {
          background: var(--card);
          border: 1px solid var(--line);
          border-radius: 12px;
          padding: 12px 14px;
          text-align: left;
          font: 500 0.86rem/1.35 var(--font);
          color: var(--ink);
          cursor: pointer;
          transition: all 0.15s;
        }

        .qs-btn[aria-pressed="true"] {
          background: var(--ink);
          color: #ffffff;
          border-color: var(--ink);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .ans-card {
          background: var(--card);
          border-radius: 16px;
          padding: 22px;
          display: flex;
          flex-direction: column;
          gap: 18px;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
          min-width: 0;
        }

        .ans-card h3 {
          font-size: 1.2rem;
          font-weight: 600;
          margin: 0 0 6px 0;
        }

        .ans-card p.sum {
          color: var(--muted);
          font-size: 0.88rem;
          margin: 0 0 14px 0;
          line-height: 1.5;
        }

        .kpi-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 10px;
          margin: 12px 0;
        }

        .kpi-card {
          background: var(--surface);
          border-radius: 10px;
          padding: 12px;
        }

        .kpi-card b {
          display: block;
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--ink);
        }

        .kpi-card span {
          font-size: 0.74rem;
          color: var(--muted);
        }

        .rec-box {
          background: #fff8f5;
          border-left: 4px solid var(--accent);
          border-radius: 12px;
          padding: 14px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .rec-box .tag {
          font-size: 0.68rem;
          text-transform: uppercase;
          font-weight: 700;
          letter-spacing: 0.1em;
          color: var(--accent);
        }

        .rec-box dl {
          display: grid;
          grid-template-columns: 140px minmax(0, 1fr);
          gap: 6px 12px;
          font-size: 0.84rem;
          margin: 0;
        }

        .rec-box dt {
          color: var(--muted);
          font-weight: 500;
        }

        .rec-box dd {
          color: var(--ink);
          font-weight: 600;
          margin: 0;
        }

        /* 5 LANGKAH */
        .steps-row {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 12px;
        }

        .step-card {
          background: var(--card);
          border-radius: 14px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .step-card .n {
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--accent);
        }

        .step-card h3 {
          font-size: 1rem;
          font-weight: 600;
          margin: 0;
        }

        .step-card p {
          font-size: 0.8rem;
          color: var(--muted);
          margin: 0;
          line-height: 1.45;
        }

        /* TABLE */
        .tablewrap {
          overflow-x: auto;
          background: var(--card);
          border-radius: 14px;
          padding: 6px;
          -webkit-overflow-scrolling: touch;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.86rem;
          text-align: left;
        }

        th {
          padding: 10px 14px;
          font-weight: 600;
          color: var(--muted);
          border-bottom: 1px solid var(--line);
          font-size: 0.76rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          white-space: nowrap;
        }

        td {
          padding: 12px 14px;
          border-bottom: 1px solid var(--line);
          color: var(--ink);
        }

        tr:last-child td {
          border-bottom: none;
        }

        /* CLOSING */
        .closing-banner {
          border-radius: 20px;
          background: linear-gradient(135deg, #1c1917, #292524);
          color: #ffffff;
          padding: clamp(32px, 5vw, 60px) clamp(18px, 4vw, 44px);
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 14px;
        }

        .closing-banner h2 {
          color: #ffffff;
          font-size: clamp(1.8rem, 4vw, 2.9rem);
          max-width: 24ch;
        }

        .closing-banner p {
          color: rgba(255, 255, 255, 0.8);
          max-width: 50ch;
          margin: 0;
          font-size: 0.95rem;
        }

        /* ========================================================
           RESPONSIVE MOBILE BREAKPOINTS (<= 860px, <= 640px, <= 480px)
           ======================================================== */
        @media (max-width: 920px) {
          .pitch-nav .links {
            display: none;
          }
          .mobile-pill-nav {
            display: flex;
          }
          .pitch-hero {
            grid-template-columns: minmax(0, 1fr);
            gap: 28px;
          }
          .grid-3 {
            grid-template-columns: 1fr;
          }
          .demo-box {
            grid-template-columns: 1fr;
          }
          .steps-row {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 640px) {
          body {
            padding-block: 10px 32px;
            padding-left: max(10px, env(safe-area-inset-left, 0px));
            padding-right: max(10px, env(safe-area-inset-right, 0px));
          }

          .pitch-container {
            gap: 10px;
          }

          .pitch-nav {
            padding: 8px 12px;
            border-radius: 12px;
          }

          .pitch-nav .logo span {
            font-size: 0.85rem;
          }

          .pitch-btn {
            min-height: 38px;
            padding: 0 14px;
            font-size: 0.8rem;
          }

          .pitch-hero {
            padding: 24px 16px;
            border-radius: 18px;
            gap: 22px;
          }

          .pitch-hero h1 {
            font-size: clamp(1.85rem, 7.5vw, 2.45rem);
            line-height: 1.1;
          }

          .pitch-hero p.sub {
            font-size: 0.92rem;
            margin-top: 12px;
          }

          .pitch-hero .ctas {
            flex-direction: column;
            width: 100%;
          }

          .pitch-hero .ctas .pitch-btn {
            width: 100%;
          }

          .pitch-trust {
            margin-top: 20px;
            font-size: 0.78rem;
          }

          /* DEVICE BEZEL PADA MOBILE */
          .device-bezel {
            border: 4px solid #1f1614;
            padding: 10px;
            border-radius: 16px;
            min-height: auto;
          }

          .device-top-bar {
            padding-bottom: 8px;
            margin-bottom: 8px;
          }

          .mode-tab {
            padding: 5px 7px;
            font-size: 0.65rem;
            gap: 3px;
          }

          .pitch-panel {
            padding: 20px 14px;
            border-radius: 16px;
          }

          .panel-head {
            margin-bottom: 20px;
            gap: 6px;
          }

          h2 {
            font-size: clamp(1.4rem, 5.8vw, 1.85rem);
            line-height: 1.2;
          }

          .lead {
            font-size: 0.88rem;
          }

          /* STATS GRID 2-KOLOM PADA MOBILE */
          .stats-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 8px;
            margin-top: 24px;
          }

          .stats-grid > :last-child:nth-child(odd) {
            grid-column: 1 / -1;
          }

          .stat-card {
            padding: 14px;
            min-height: auto;
            gap: 16px;
            border-radius: 12px;
          }

          .stat-card b {
            font-size: 1.6rem;
          }

          .stat-card span {
            font-size: 0.72rem !important;
          }

          /* FITUR GRID & SCREEN PADA MOBILE */
          .feat-grid {
            grid-template-columns: minmax(0, 1fr) !important;
            gap: 10px;
          }

          .feat-card {
            padding: 12px;
            border-radius: 14px;
          }

          .feat-screen {
            padding: 10px;
            min-height: 290px;
          }

          /* SIMULATOR RESPONSE PADA MOBILE */
          .ans-card {
            padding: 16px;
            border-radius: 14px;
          }

          .kpi-row {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 6px;
          }

          .kpi-card {
            padding: 9px;
          }

          .kpi-card b {
            font-size: 1.05rem;
          }

          .kpi-card span {
            font-size: 0.68rem;
          }

          .rec-box {
            padding: 12px;
          }

          .rec-box dl {
            grid-template-columns: 1fr;
            gap: 2px;
          }

          .rec-box dd {
            margin-bottom: 8px;
            font-size: 0.8rem;
          }

          /* STEPS PADA MOBILE */
          .steps-row {
            grid-template-columns: 1fr;
            gap: 8px;
          }

          .step-card {
            padding: 12px;
          }

          /* CLOSING BANNER */
          .closing-banner {
            padding: 28px 14px;
            border-radius: 16px;
          }

          .closing-banner .pitch-btn {
            width: 100%;
          }
        }

        @media (max-width: 480px) {
          .pitch-nav .logo span {
            display: none;
          }

          .mode-tab span {
            display: none;
          }

          .mode-tab {
            padding: 6px;
          }

          .sim-bar-grid {
            grid-template-columns: minmax(0, 1fr) auto !important;
            gap: 4px 6px !important;
          }

          .sim-bar-title {
            grid-column: 1 / -1 !important;
            font-size: 0.78rem !important;
          }
        }
      `}</style>

      <div className="pitch-container">
        {/* TOP NAVIGATION BAR */}
        <nav className="pitch-nav" aria-label="Navigasi">
          <Link className="logo" href="#atas">
            <div className="relative h-7 w-24 sm:h-8 sm:w-28 shrink-0">
              <Image
                src="/logo-el-massa-horizontal.png"
                alt="El Massa Logo"
                fill
                className="object-contain object-left"
                priority
              />
            </div>
            <span>Transformasi Digital</span>
          </Link>
          <div className="links">
            <a href="#kebutuhan">Kebutuhan</a>
            <a href="#prinsip">Prinsip</a>
            <a href="#modul-kantor">Modul Kantor</a>
            <a href="#detail-umrahme">UmrahMe</a>
            <a href="#detail-myelmassa">My El Massa</a>
            <a href="#fitur">6 Layar Mockup</a>
            <a href="#contoh">Simulasi</a>
            <a href="#cara">Cara Kerja</a>
            <a href="#akses">Hak Akses</a>
          </div>
          <Link className="pitch-btn pitch-btn-accent" href="/dashboard">
            Buka Sistem Kantor
          </Link>
        </nav>

        {/* MOBILE HORIZONTAL PILL SUBNAV (KHUSUS TAMPILAN HP) */}
        <div className="mobile-pill-nav" aria-label="Navigasi Cepat Mobile">
          <a href="#atas">Top</a>
          <a href="#kebutuhan">Kebutuhan</a>
          <a href="#prinsip">6 Prinsip</a>
          <a href="#modul-kantor">Modul Kantor (6 Modul)</a>
          <a href="#detail-umrahme">Detail UmrahMe</a>
          <a href="#detail-myelmassa">Detail My El Massa</a>
          <a href="#fitur">6 Layar Mockup</a>
          <a href="#contoh">Simulasi Alur</a>
          <a href="#cara">5 Langkah</a>
          <a href="#jadwal">Kesiapan Senin</a>
          <a href="#akses">Hak Akses</a>
        </div>

        {/* HERO SECTION DENGAN REALISTIC MULTI-DEVICE MOCKUP & ANIMASI */}
        <header className="pitch-hero" id="atas">
          <div>
            <div className="mb-3 sm:mb-4 inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-pink-400/30 bg-pink-500/10 px-2.5 sm:px-3 py-1 text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-pink-300">
              <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-pink-400" />
              Sistem Terpadu PT El Massa Tour &amp; Travel
            </div>
            <h1>
              Bang Azri &amp; Tim Bertanya.
              <br />
              Sistem El Massa Menjawab.
            </h1>
            <p className="sub">
              Satu ekosistem terpadu tempat Owner, Admin Kantor, Kasir Keuangan, Agen/Mitra Daerah, dan Jamaah terhubung real-time. Tanpa nota tercecer di WA, tanpa hitung komisi manual, dan tanpa selisih kas.
            </p>
            <div className="ctas">
              <Link className="pitch-btn pitch-btn-accent" href="/dashboard">
                Buka Sistem Kantor
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link className="pitch-btn pitch-btn-ghost" href="/my-elmassa" target="_blank">
                Tes Portal Agen HP
                <ExternalLink className="h-4 w-4" />
              </Link>
              <a className="pitch-btn pitch-btn-ghost" href="#modul-kantor">
                Pelajari Fitur Detail
              </a>
            </div>
            <div className="pitch-trust">
              <b>100%</b>
              <span>Cloud Database Supabase • Seluruh Modul Siap Input Data Hari Senin</span>
            </div>
          </div>

          {/* SIMULATED DEVICE BEZEL DENGAN TABS INTERAKTIF */}
          <div className="device-wrapper">
            <div className="device-bezel">
              {/* TOP BAR / WINDOW CONTROLS */}
              <div className="device-top-bar">
                <div className="window-dots">
                  <span className="window-dot" style={{ background: "#ef4444" }}></span>
                  <span className="window-dot" style={{ background: "#f59e0b" }}></span>
                  <span className="window-dot" style={{ background: "#10b981" }}></span>
                </div>
                {/* INTERACTIVE DEVICE SWITCHER */}
                <div className="device-modes" role="tablist">
                  <button
                    type="button"
                    role="tab"
                    data-active={heroDeviceMode === "admin"}
                    onClick={() => setHeroDeviceMode("admin")}
                    className="mode-tab"
                    title="Admin Web Kantor"
                  >
                    <Monitor className="h-3.5 w-3.5 shrink-0" />
                    <span>Admin Kantor</span>
                  </button>
                  <button
                    type="button"
                    role="tab"
                    data-active={heroDeviceMode === "agen"}
                    onClick={() => setHeroDeviceMode("agen")}
                    className="mode-tab"
                    title="HP Agen (My El Massa)"
                  >
                    <Smartphone className="h-3.5 w-3.5 shrink-0" />
                    <span>HP Agen</span>
                  </button>
                  <button
                    type="button"
                    role="tab"
                    data-active={heroDeviceMode === "umrahme"}
                    onClick={() => setHeroDeviceMode("umrahme")}
                    className="mode-tab"
                    title="UmrahMe Jamaah"
                  >
                    <Heart className="h-3.5 w-3.5 shrink-0" />
                    <span>UmrahMe</span>
                  </button>
                  <button
                    type="button"
                    role="tab"
                    data-active={heroDeviceMode === "kuitansi"}
                    onClick={() => setHeroDeviceMode("kuitansi")}
                    className="mode-tab"
                    title="Kwitansi KW Resmi"
                  >
                    <ReceiptText className="h-3.5 w-3.5 shrink-0" />
                    <span>Kwitansi</span>
                  </button>
                </div>
              </div>

              {/* MOCKUP CONTENT 1: ADMIN WEB KANTOR */}
              {heroDeviceMode === "admin" && (
                <div className="anim-rise flex flex-col gap-2.5 sm:gap-3">
                  <div className="flex items-center justify-between rounded-lg bg-stone-100 p-2 sm:p-2.5 text-xs font-semibold text-stone-800">
                    <span className="flex items-center gap-1.5 truncate">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 anim-pulse-green shrink-0"></span>
                      Kantor: Booking Real-Time
                    </span>
                    <span className="rounded bg-white px-2 py-0.5 text-[10px] sm:text-[11px] font-bold text-stone-600 shadow-xs shrink-0">
                      14 Seat Sisa
                    </span>
                  </div>

                  <div className="space-y-1.5 sm:space-y-2 rounded-xl border border-stone-200 bg-stone-50/50 p-2.5 sm:p-3 text-xs">
                    <div className="flex justify-between font-medium text-stone-500 text-[11px] sm:text-xs">
                      <span>Paket 01 Okt 2026</span>
                      <span className="font-bold text-stone-900">45 Pax Target</span>
                    </div>
                    {/* PROGRESS BAR DENGAN ANIMASI */}
                    <div className="relative h-2 sm:h-2.5 w-full overflow-hidden rounded-full bg-stone-200">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-pink-600 to-rose-500 transition-all duration-1000 ease-out"
                        style={{ width: "69%" }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-[10px] sm:text-[11px] text-stone-600">
                      <span>31 Terisi (DP Masuk)</span>
                      <span className="font-bold text-rose-600">69% Terpenuhi</span>
                    </div>
                  </div>

                  {/* MINI TABLE BOOKING TERBARU */}
                  <div className="rounded-xl border border-stone-200 bg-white p-2 sm:p-2.5 shadow-xs">
                    <div className="mb-1.5 flex items-center justify-between text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-stone-400">
                      <span>Booking Terbaru</span>
                      <span className="text-emerald-600">3 Menit Lalu</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-stone-100 pb-2 text-xs gap-1 sm:gap-2">
                      <div>
                        <p className="font-semibold text-stone-800">Hj. Siti Aminah + 1</p>
                        <p className="text-[10px] sm:text-[11px] text-stone-500">Agen: Ust. Ahmad (AG-01)</p>
                      </div>
                      <span className="self-start sm:self-auto rounded-md bg-emerald-50 px-2 py-0.5 sm:py-1 text-[10px] sm:text-[11px] font-bold text-emerald-700">
                        DP Rp 10 Juta (Lunas)
                      </span>
                    </div>
                  </div>

                  <div className="mt-auto rounded-xl border border-pink-200 bg-pink-50/70 p-2 sm:p-2.5 text-[11px] sm:text-xs text-pink-950">
                    <span className="mb-0.5 block text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-pink-600">
                      Aksi Otomatis Sistem
                    </span>
                    Kwitansi KW-2610-0012 terbit otomatis, komisi agen Rp 3.000.000 masuk dompet mitra, dan akun UmrahMe jamaah aktif.
                  </div>
                </div>
              )}

              {/* MOCKUP CONTENT 2: SMARTPHONE MY EL MASSA (AGEN) */}
              {heroDeviceMode === "agen" && (
                <div className="anim-rise mx-auto flex w-full max-w-full sm:max-w-[320px] flex-col gap-2.5 sm:gap-3 rounded-2xl border-2 sm:border-4 border-stone-800 bg-white p-2.5 sm:p-3 shadow-md">
                  {/* PHONE NOTCH / STATUS */}
                  <div className="flex items-center justify-between px-1 text-[10px] font-bold text-stone-500">
                    <span>09:14</span>
                    <div className="h-2.5 sm:h-3 w-12 sm:w-16 rounded-full bg-stone-800"></div>
                    <span>5G 100%</span>
                  </div>

                  {/* AGENT IDENTITY */}
                  <div className="rounded-xl bg-gradient-to-r from-stone-900 to-stone-800 p-2.5 sm:p-3 text-white shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] sm:text-[10px] text-stone-400">Kode: AG-ELMASSA-01</span>
                      <span className="rounded-full bg-emerald-500/20 px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold text-emerald-300">
                        Aktif 🟢
                      </span>
                    </div>
                    <p className="mt-1 font-bold text-xs sm:text-sm">Ust. H. Ahmad Sobri</p>
                    <div className="mt-1.5 sm:mt-2 border-t border-stone-700/80 pt-1.5 flex justify-between items-baseline">
                      <span className="text-[10px] sm:text-[11px] text-stone-300">Saldo Komisi:</span>
                      <span className="text-sm sm:text-base font-extrabold text-pink-400">Rp 12.500.000</span>
                    </div>
                  </div>

                  {/* RECRUITMENT BUTTON */}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="flex-1 rounded-lg bg-pink-600 py-2 text-center text-xs font-bold text-white shadow-xs hover:bg-pink-700"
                    >
                      + Daftarkan Jamaah
                    </button>
                    <button
                      type="button"
                      className="rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-2 text-xs font-bold text-stone-700"
                    >
                      Brosur PDF
                    </button>
                  </div>

                  {/* AGENT FEED */}
                  <div className="rounded-xl border border-stone-100 bg-stone-50 p-2 text-xs">
                    <div className="flex justify-between text-[10px] sm:text-[11px] font-semibold text-stone-600">
                      <span>Paket Oktober</span>
                      <span className="text-pink-600">14 Seat Tersedia</span>
                    </div>
                    <p className="mt-0.5 text-[10px] sm:text-[11px] text-stone-400">Komisi: Rp 1.500.000 / pax</p>
                  </div>
                </div>
              )}

              {/* MOCKUP CONTENT 3: UMRAHME (JAMAAH) */}
              {heroDeviceMode === "umrahme" && (
                <div className="anim-rise mx-auto flex w-full max-w-full sm:max-w-[320px] flex-col gap-2.5 sm:gap-3 rounded-2xl border-2 sm:border-4 border-stone-800 bg-white p-2.5 sm:p-3 shadow-md">
                  <div className="flex items-center justify-between px-1 text-[10px] font-bold text-stone-500">
                    <span>09:14</span>
                    <div className="h-2.5 sm:h-3 w-12 sm:w-16 rounded-full bg-stone-800"></div>
                    <span className="text-purple-600 font-bold">UmrahMe</span>
                  </div>

                  {/* ITINERARY COUNTDOWN */}
                  <div className="rounded-xl bg-gradient-to-r from-purple-900 to-indigo-900 p-2.5 sm:p-3 text-white shadow-xs">
                    <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-purple-300">
                      Menuju Baitullah
                    </span>
                    <p className="mt-0.5 text-base sm:text-lg font-bold">Hj. Siti Aminah</p>
                    <p className="text-[11px] sm:text-xs text-purple-200">Paket Reguler 12 Hari • 01 Okt</p>
                    <div className="mt-1.5 sm:mt-2 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2 py-0.5 text-[9px] sm:text-[10px] font-semibold text-purple-100">
                      <Clock className="h-3 w-3" /> 23 Hari Menuju Manasik Akbar
                    </div>
                  </div>

                  {/* TRIP HIGHLIGHTS */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-lg border border-stone-200 bg-stone-50 p-2">
                      <div className="flex items-center gap-1 font-bold text-stone-800 text-[11px]">
                        <Plane className="h-3.5 w-3.5 text-purple-600 shrink-0" /> Terbang
                      </div>
                      <p className="mt-0.5 text-[10px] text-stone-500">Saudia SV-819</p>
                    </div>
                    <div className="rounded-lg border border-stone-200 bg-stone-50 p-2">
                      <div className="flex items-center gap-1 font-bold text-stone-800 text-[11px]">
                        <Hotel className="h-3.5 w-3.5 text-purple-600 shrink-0" /> Hotel
                      </div>
                      <p className="mt-0.5 text-[10px] text-stone-500">Elaf Kinda (5★)</p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-1.5 sm:p-2 text-center text-[10px] sm:text-xs font-bold text-emerald-800">
                    ✓ Paspor &amp; Vaksin Terverifikasi
                  </div>
                </div>
              )}

              {/* MOCKUP CONTENT 4: KWITANSI RESMI BERSTEMPEL */}
              {heroDeviceMode === "kuitansi" && (
                <div className="anim-rise relative flex flex-col gap-2 rounded-xl border border-stone-300 bg-white p-3 sm:p-4 shadow-sm overflow-hidden">
                  {/* KWITANSI HEADER */}
                  <div className="flex items-center justify-between border-b border-stone-200 pb-1.5 sm:pb-2">
                    <div className="flex items-center gap-2 truncate">
                      <div className="h-5 w-5 sm:h-6 sm:w-6 rounded bg-amber-700 shrink-0"></div>
                      <div className="truncate">
                        <p className="font-extrabold text-[11px] sm:text-xs text-stone-900 leading-none truncate">PT EL MASSA TOUR &amp; TRAVEL</p>
                        <p className="text-[8px] sm:text-[9px] text-stone-500 truncate">Izin Umrah Kemenag U.412</p>
                      </div>
                    </div>
                    <span className="rounded bg-stone-100 px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-[11px] font-mono font-bold text-stone-700 shrink-0">
                      KW-2610-0012
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 sm:gap-2 py-0.5 sm:py-1 text-[10px] sm:text-[11px]">
                    <div>
                      <span className="text-stone-400 block text-[9px] sm:text-[10px]">Telah Diterima Dari:</span>
                      <p className="font-bold text-stone-800">Hj. Siti Aminah</p>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[9px] sm:text-[10px]">Untuk Pembayaran:</span>
                      <p className="font-bold text-stone-800 truncate">DP Umrah 01 Okt</p>
                    </div>
                  </div>

                  <div className="rounded-lg bg-stone-50 p-2">
                    <span className="text-[9px] sm:text-[10px] text-stone-400 block">Jumlah Uang:</span>
                    <span className="text-sm sm:text-base font-extrabold text-stone-900">Rp 10.000.000</span>
                    <p className="text-[9px] sm:text-[10px] italic text-stone-600 mt-0.5">
                      Terbilang: &quot;Sepuluh Juta Rupiah&quot;
                    </p>
                  </div>

                  {/* STEMPEL WATERMARK RESMI (UKURAN RESPONSIF DI MOBILE) */}
                  <div className="anim-stamp absolute bottom-3 right-3 sm:bottom-6 sm:right-6 flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full border-2 border-dashed border-rose-600/80 bg-rose-50/50 text-center text-[8px] sm:text-[10px] font-extrabold uppercase text-rose-700 shadow-xs pointer-events-none">
                    <span>
                      PT EL MASSA
                      <br />
                      ★ LUNAS ★
                      <br />
                      KASIR
                    </span>
                  </div>

                  <div className="mt-1 sm:mt-2 flex items-center justify-between text-[9px] sm:text-[10px] text-stone-400 pt-1 border-t border-stone-100">
                    <span className="flex items-center gap-1">
                      <QrCode className="h-3 w-3 text-stone-700" /> Tervalidasi Sistem
                    </span>
                    <span>25 Okt 09:14</span>
                  </div>
                </div>
              )}
            </div>

            {/* FLOATING PILL BADGE DECORATION (DESKTOP ONLY) */}
            <div className="anim-float absolute -bottom-4 -left-4 hidden lg:flex items-center gap-2 rounded-xl border border-stone-200 bg-white/95 px-3 py-2 text-xs font-bold text-stone-800 shadow-lg backdrop-blur-md">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 anim-pulse-green"></span>
              Live Sync Cloud Supabase
            </div>
            <div className="anim-float absolute -top-4 -right-4 hidden lg:flex items-center gap-2 rounded-xl border border-stone-200 bg-white/95 px-3 py-2 text-xs font-bold text-pink-700 shadow-lg backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-pink-500" />
              Anti-Bocor Kasir 100%
            </div>
          </div>
        </header>

        {/* SECTION 1: TANTANGAN & SASARAN OPERASIONAL */}
        <section className="pitch-panel" id="kebutuhan">
          <div className="split-head">
            <div className="panel-head" style={{ margin: 0 }}>
              <p className="eyebrow">Tantangan &amp; Sasaran Operasional</p>
              <h2>Mengapa Sistem Ini Dibuat: Mengakhiri Catatan Tercecer Menjadi Satu Kendali Terpadu.</h2>
            </div>
            <p className="lead" style={{ maxWidth: "38ch" }}>
              Ukuran keberhasilannya konkret: Hari Senin besok staf kantor langsung input data riil, kasir tertib kuitansi resmi, dokumen paspor selesai 1-klik, dan Owner memantau omset dari HP.
            </p>
          </div>

          {/* 4 METRIK RUANG LINGKUP & KESIAPAN SISTEM */}
          <div className="stats-grid">
            <div className="stat-card">
              <p className="eyebrow">Modul Kantor Siap Pakai</p>
              <b>6 Modul</b>
              <span style={{ fontSize: "0.82rem", color: "var(--muted)" }}>Paket, Booking, Kasir, Dokumen, Stok, &amp; Laba</span>
            </div>
            <div className="stat-card">
              <p className="eyebrow">Pengguna Terhubung</p>
              <b>3 Jalur</b>
              <span style={{ fontSize: "0.82rem", color: "var(--muted)" }}>Kantor Pusat (Web), Agen Daerah (HP), &amp; Jamaah (UmrahMe)</span>
            </div>
            <div className="stat-card">
              <p className="eyebrow">Jadwal Go-Live</p>
              <b>Senin Besok</b>
              <span style={{ fontSize: "0.82rem", color: "var(--muted)" }}>Staf kantor mulai mencatat pendaftaran jamaah &amp; kuitansi riil</span>
            </div>
            <div className="stat-card">
              <p className="eyebrow">Penyimpanan Data</p>
              <b>100% Cloud</b>
              <span style={{ fontSize: "0.82rem", color: "var(--muted)" }}>Database Supabase terpusat, aman, &amp; nol risiko berkas hilang</span>
            </div>
          </div>

          {/* KOMPARASI 6 MASALAH LAMA VS SOLUSI SISTEM BARU */}
          <div className="mt-8 pt-8 border-t border-stone-200">
            <div className="mb-4">
              <p className="eyebrow text-stone-500">Transformasi Kerja Harian</p>
              <h3 className="text-lg sm:text-xl font-bold text-stone-900 mt-1">Perubahan Nyata Dari Cara Kerja Manual ke Sistem Terpadu</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="rounded-xl border border-stone-200 bg-white p-3.5 shadow-2xs space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">1. Pendaftaran Jamaah</span>
                <div className="text-xs text-rose-700 bg-rose-50/70 p-2 rounded-lg border border-rose-100">
                  <strong>Sebelum:</strong> Data tercecer di chat WA &amp; buku manual, rawan lupa diinput.
                </div>
                <div className="text-xs text-emerald-800 bg-emerald-50/70 p-2 rounded-lg border border-emerald-100">
                  <strong>Sekarang:</strong> Terpusat di menu Booking dengan Kode Booking unik otomatis.
                </div>
              </div>

              <div className="rounded-xl border border-stone-200 bg-white p-3.5 shadow-2xs space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">2. Pembayaran Kasir</span>
                <div className="text-xs text-rose-700 bg-rose-50/70 p-2 rounded-lg border border-rose-100">
                  <strong>Sebelum:</strong> Nota kuitansi manual kertas, rawan selisih uang di kasir.
                </div>
                <div className="text-xs text-emerald-800 bg-emerald-50/70 p-2 rounded-lg border border-emerald-100">
                  <strong>Sekarang:</strong> Kwitansi resmi KW berstempel &amp; terbilang rupiah otomatis.
                </div>
              </div>

              <div className="rounded-xl border border-stone-200 bg-white p-3.5 shadow-2xs space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">3. Dokumen Paspor Kemenag</span>
                <div className="text-xs text-rose-700 bg-rose-50/70 p-2 rounded-lg border border-rose-100">
                  <strong>Sebelum:</strong> Ketik ulang NIK &amp; nama jamaah di Word, sering salah ketik.
                </div>
                <div className="text-xs text-emerald-800 bg-emerald-50/70 p-2 rounded-lg border border-emerald-100">
                  <strong>Sekarang:</strong> 1-Klik cetak PDF surat Kemenag resmi ber-kop pink-coklat asli.
                </div>
              </div>

              <div className="rounded-xl border border-stone-200 bg-white p-3.5 shadow-2xs space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">4. Kuota Kursi Paket</span>
                <div className="text-xs text-rose-700 bg-rose-50/70 p-2 rounded-lg border border-rose-100">
                  <strong>Sebelum:</strong> Agen tanya sisa kursi bolak-balik via chat WA admin kantor.
                </div>
                <div className="text-xs text-emerald-800 bg-emerald-50/70 p-2 rounded-lg border border-emerald-100">
                  <strong>Sekarang:</strong> Sisa kursi paket terpantau real-time langsung di smartphone agen.
                </div>
              </div>

              <div className="rounded-xl border border-stone-200 bg-white p-3.5 shadow-2xs space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">5. Komisi Mitra Daerah</span>
                <div className="text-xs text-rose-700 bg-rose-50/70 p-2 rounded-lg border border-rose-100">
                  <strong>Sebelum:</strong> Hitung manual di Excel, rawan selisih &amp; saling curiga.
                </div>
                <div className="text-xs text-emerald-800 bg-emerald-50/70 p-2 rounded-lg border border-emerald-100">
                  <strong>Sekarang:</strong> Dompet komisi agen Rp 1.500.000/pax tercatat otomatis &amp; transparan.
                </div>
              </div>

              <div className="rounded-xl border border-stone-200 bg-white p-3.5 shadow-2xs space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">6. Pantauan Owner</span>
                <div className="text-xs text-rose-700 bg-rose-50/70 p-2 rounded-lg border border-rose-100">
                  <strong>Sebelum:</strong> Owner harus tunggu rombongan pulang baru tahu margin laba.
                </div>
                <div className="text-xs text-emerald-800 bg-emerald-50/70 p-2 rounded-lg border border-emerald-100">
                  <strong>Sekarang:</strong> Rekap margin laba kotor grup terlihat otomatis sebelum terbang.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: ENAM PRINSIP OPERASIONAL */}
        <section className="pitch-panel" id="prinsip">
          <div className="panel-head">
            <p className="eyebrow">Yang Kami Pegang</p>
            <h2>Enam prinsip agar sistem aman, transparan &amp; anti-bocor</h2>
          </div>
          <div className="grid-3">
            <div className="card">
              <span className="ic">
                <CreditCard className="h-5 w-5" />
              </span>
              <h3>1. Kasir Anti-Bocor (Zero Leakage)</h3>
              <p>Kwitansi hanya terbit jika pembayaran dicatat kasir, berformat nomor unik KW-XXXXXX dan kalimat terbilang rupiah otomatis.</p>
            </div>
            <div className="card">
              <span className="ic">
                <Handshake className="h-5 w-5" />
              </span>
              <h3>2. Transparansi Komisi Agen</h3>
              <p>Mitra melihat rekrutan dan komisi (Rp 1.500.000 / pax) secara transparan di HP mereka, tanpa perlu curiga atau hitung manual.</p>
            </div>
            <div className="card">
              <span className="ic">
                <Sparkles className="h-5 w-5" />
              </span>
              <h3>3. Jamaah Terverifikasi Aman</h3>
              <p>Akun UmrahMe jamaah terkunci otomatis sebelum DP diverifikasi kasir kantor. Mencegah jamaah tanpa komitmen masuk ke fasilitas manasik.</p>
            </div>
            <div className="card">
              <span className="ic">
                <FileText className="h-5 w-5" />
              </span>
              <h3>4. Dokumen Kemenag Resmi</h3>
              <p>Kop surat resmi motif kotak pink-coklat asli otomatis terpasang pada Invoice, Kwitansi, Surat Rekomendasi Paspor, dan Izin Cuti.</p>
            </div>
            <div className="card">
              <span className="ic">
                <Boxes className="h-5 w-5" />
              </span>
              <h3>5. Kontrol Fisik Stok (FIFO)</h3>
              <p>Koper bagasi, kain ihram, mukena, dan batik dihitung dari mutasi riil kartu stok gudang masuk/keluar, bukan tebakan angka.</p>
            </div>
            <div className="card">
              <span className="ic">
                <Zap className="h-5 w-5" />
              </span>
              <h3>6. Efisiensi Kerja Staf Kantor</h3>
              <p>Tidak ada lagi ketik ulang nama atau NIK di Word. Sekali pendaftaran masuk, kuitansi, manifest, dan surat izin langsung siap cetak.</p>
            </div>
          </div>
        </section>

        {/* SECTION 3: BEDAH DETAIL FITUR SISTEM KANTOR (MODUL PER MODUL) */}
        <section className="pitch-panel" id="modul-kantor">
          <div className="split-head" style={{ marginBottom: "26px" }}>
            <div className="panel-head" style={{ margin: 0 }}>
              <p className="eyebrow">Bedah Fitur Sistem Kantor</p>
              <h2>Enam Modul Inti: Otomasi Dari Pendaftaran Hingga Rekap Laba</h2>
            </div>
            <p className="lead" style={{ maxWidth: "42ch" }}>
              Seluruh modul saling mengunci (*integrated*). Satu input di kasir atau operasional otomatis memperbarui kuitansi, manifest, kuota kursi, dan laporan pimpinan.
            </p>
          </div>

          {/* TAB SELECTOR MODUL KANTOR */}
          <div className="flex gap-2 overflow-x-auto pb-2 -webkit-overflow-scrolling-touch mb-4">
            {OFFICE_MODULES.map((m, idx) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setActiveOfficeModulIdx(idx)}
                className={`flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all shrink-0 border ${
                  activeOfficeModulIdx === idx
                    ? "bg-stone-900 text-white border-stone-900 shadow-sm"
                    : "bg-white text-stone-600 border-stone-200 hover:bg-stone-50"
                }`}
              >
                <span className="rounded bg-pink-500/20 px-1.5 py-0.5 text-[10px] text-pink-400 font-mono">
                  {m.number}
                </span>
                <span>{m.title.split("&")[0]}</span>
              </button>
            ))}
          </div>

          {/* ACTIVE MODULE DETAIL SHOWCASE */}
          {(() => {
            const m = OFFICE_MODULES[activeOfficeModulIdx];
            return (
              <div className="anim-rise rounded-2xl border border-stone-200 bg-white p-5 sm:p-7 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-4 mb-4">
                  <div>
                    <span className="rounded-full bg-pink-50 px-2.5 py-1 text-[11px] font-bold text-pink-700 uppercase tracking-wider">
                      Modul {m.number} • {m.badge}
                    </span>
                    <h3 className="mt-2 text-lg sm:text-xl font-bold text-stone-900">{m.title}</h3>
                    <p className="text-sm text-stone-500 mt-0.5">{m.tagline}</p>
                  </div>
                  <Link
                    href={m.path}
                    className="self-start sm:self-auto inline-flex items-center gap-1.5 rounded-lg bg-stone-900 px-3.5 py-2 text-xs font-bold text-white hover:bg-stone-800 transition-colors"
                  >
                    Buka Modul Ini <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {m.bullets.map((b, i) => (
                    <div key={i} className="flex items-start gap-2.5 rounded-xl bg-stone-50 p-3.5 text-xs text-stone-700">
                      <CheckCircle2 className="h-4 w-4 text-pink-600 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{b}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </section>

        {/* SECTION 4: BEDAH DETAIL "UMRAHME" (APLIKASI JAMAAH) */}
        <section className="pitch-panel" id="detail-umrahme" style={{ background: "#faf5ff", border: "1px solid #e9d5ff" }}>
          <div className="split-head" style={{ marginBottom: "26px" }}>
            <div className="panel-head" style={{ margin: 0 }}>
              <div className="inline-flex items-center gap-2 rounded-full bg-purple-100 px-3 py-1 text-xs font-bold text-purple-800">
                <Heart className="h-3.5 w-3.5 text-purple-600" /> Ekosistem Jamaah Digital
              </div>
              <h2 className="mt-2 text-purple-950">UmrahMe: Pengalaman Ibadah Modern di Genggaman Jamaah</h2>
            </div>
            <p className="lead text-purple-800/80" style={{ maxWidth: "42ch" }}>
              Jamaah tidak lagi membawa buku panduan tebal atau bertanya jadwal berulang kali. Seluruh panduan manasik, nomor kamar hotel, jadwal penerbangan, dan kontak muthawwif ada di HP jamaah.
            </p>
          </div>

          {/* GATING CALLOUT BOX */}
          <div className="mb-6 rounded-xl border border-purple-200 bg-white p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                <Lock className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bold text-xs sm:text-sm text-purple-950">Mekanisme Gating Kasir (Anti-Bocor)</p>
                <p className="text-[11px] sm:text-xs text-stone-500">
                  Akun UmrahMe jamaah TERKUNCI secara otomatis sebelum kasir kantor memverifikasi transfer DP. Mencegah jamaah tanpa komitmen masuk ke fasilitas manasik.
                </p>
              </div>
            </div>
            <Link
              href="/umrahme"
              target="_blank"
              className="rounded-lg bg-purple-700 px-3.5 py-2 text-xs font-bold text-white hover:bg-purple-800 transition-colors shrink-0"
            >
              Lihat Menu UmrahMe ↗
            </Link>
          </div>

          {/* 6 FITUR LENGKAP UMRAHME */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {UMRAHME_FEATURES.map((f, i) => (
              <div key={i} className="rounded-xl border border-purple-100 bg-white p-4 shadow-xs flex flex-col justify-between gap-3">
                <div>
                  <span className="rounded bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-700">
                    {f.tag}
                  </span>
                  <h4 className="mt-2 font-bold text-sm text-purple-950">{f.title}</h4>
                  <p className="mt-1 text-xs text-stone-600 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 5: BEDAH DETAIL "MY EL MASSA" (PORTAL AGEN MANDIRI) */}
        <section className="pitch-panel" id="detail-myelmassa" style={{ background: "#fffafc", border: "1px solid #fbcfe8" }}>
          <div className="split-head" style={{ marginBottom: "26px" }}>
            <div className="panel-head" style={{ margin: 0 }}>
              <div className="inline-flex items-center gap-2 rounded-full bg-pink-100 px-3 py-1 text-xs font-bold text-pink-800">
                <Smartphone className="h-3.5 w-3.5 text-pink-600" /> Portal Mandiri Mitra &amp; Agen
              </div>
              <h2 className="mt-2 text-stone-900">My El Massa: Senjata Penjualan Mitra Daerah Tanpa Ribet</h2>
            </div>
            <p className="lead text-stone-600" style={{ maxWidth: "42ch" }}>
              Ujung tombak penjualan El Massa kini memiliki portal web mandiri di smartphone. Tidak perlu tanya sisa kursi bolak-balik via WA, dan komisi agen Rp 1.500.000/pax tercatat transparan.
            </p>
          </div>

          {/* CALLOUT BOX LOGIN MITRA */}
          <div className="mb-6 rounded-xl border border-pink-200 bg-white p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-pink-100 text-pink-700 flex items-center justify-center shrink-0">
                <Handshake className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bold text-xs sm:text-sm text-stone-900">Akses Cepat Web-App HP (Tanpa Perlu Install)</p>
                <p className="text-[11px] sm:text-xs text-stone-500">
                  Agen login menggunakan Kode Agen Resmi (contoh: <code className="bg-stone-100 px-1 py-0.5 rounded font-mono">AG-ELMASSA-01</code>) dan PIN keamanan.
                </p>
              </div>
            </div>
            <Link
              href="/my-elmassa"
              target="_blank"
              className="rounded-lg bg-pink-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-pink-700 transition-colors shrink-0"
            >
              Uji Coba Portal Agen ↗
            </Link>
          </div>

          {/* 5 FITUR LENGKAP MY EL MASSA */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {MY_ELMASSA_FEATURES.map((f, i) => (
              <div key={i} className="rounded-xl border border-pink-100 bg-white p-4 shadow-xs flex flex-col justify-between gap-3">
                <div>
                  <span className="rounded bg-pink-50 px-2 py-0.5 text-[10px] font-bold text-pink-700">
                    {f.tag}
                  </span>
                  <h4 className="mt-2 font-bold text-sm text-stone-900">{f.title}</h4>
                  <p className="mt-1 text-xs text-stone-600 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 6: PANEL FITUR & MOCKUP SCREEN ANIMATIF */}
        <section className="pitch-panel" id="fitur">
          <div className="panel-head">
            <p className="eyebrow">Mockup &amp; Layar Aplikasi</p>
            <h2>Enam Layar Utama Sistem Dalam Operasional Harian</h2>
            <p className="lead">
              Setiap layar dirancang untuk tugas spesifik. Tampilan responsif di komputer kantor, tablet pimpinan, maupun smartphone tim lapangan.
            </p>
          </div>

          <div className="feat-grid">
            {/* FITUR 1: TANYA JAWAB OPERASIONAL */}
            <article className="feat-card" id="f-chat">
              <div className="feat-screen" aria-label="Contoh tampilan tanya jawab">
                <div className="feat-stop">
                  <span>Asisten Operasional El Massa</span>
                  <span className="feat-chip">
                    <span className="dot"></span>Live
                  </span>
                </div>
                <div className="chat-msgs">
                  {chatAnswers.map((m, i) => (
                    <div key={i} className={m.role === "user" ? "chat-bubble-u" : "chat-bubble-s"}>
                      <span>{m.text}</span>
                      <small className="text-[9px] opacity-70 block text-right">{m.time}</small>
                    </div>
                  ))}
                </div>
                <div className="chat-inbar">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Tanya kuota / komisi / paspor..."
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && chatInput.trim()) {
                        handleSendChatPrompt(chatInput);
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="send-btn"
                    onClick={() => {
                      if (chatInput.trim()) handleSendChatPrompt(chatInput);
                    }}
                    aria-label="Kirim pertanyaan"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </div>
                {/* PROMPT CHIPS */}
                <div className="flex gap-1.5 overflow-x-auto pt-1 -webkit-overflow-scrolling-touch">
                  <button
                    type="button"
                    onClick={() => handleSendChatPrompt("Cek saldo komisi Ustadz Ahmad")}
                    className="rounded bg-white px-2 py-0.5 text-[9px] sm:text-[10px] font-semibold text-stone-600 border border-stone-200 shadow-2xs whitespace-nowrap"
                  >
                    Komisi Ustadz Ahmad
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSendChatPrompt("Cek progress paspor paket Oktober")}
                    className="rounded bg-white px-2 py-0.5 text-[9px] sm:text-[10px] font-semibold text-stone-600 border border-stone-200 shadow-2xs whitespace-nowrap"
                  >
                    Status Paspor Kemenag
                  </button>
                </div>
              </div>
              <div className="feat-txt">
                <h3>1. Tanya-Jawab Operasional Pintar</h3>
                <p>Ketik pertanyaan seperti mengirim pesan. Jawaban seketika merujuk data riil di sistem tanpa perlu mencari manual di buku besar.</p>
              </div>
            </article>

            {/* FITUR 2: RINGKASAN PIMPINAN & OWNER */}
            <article className="feat-card" id="f-dash">
              <div className="feat-screen" aria-label="Contoh ringkasan eksekutif">
                <div className="feat-stop">
                  <span>Executive Ringkasan Owner</span>
                  <span className="feat-chip">Bang Azri</span>
                </div>
                <div className="screen-kgrid">
                  <div className="screen-k">
                    <b>39 Jamaah</b>
                    <span>Total Jamaah</span>
                  </div>
                  <div className="screen-k">
                    <b>3 Paket</b>
                    <span>Paket Dibuka</span>
                  </div>
                  <div className="screen-k">
                    <b>Rp 1.34 M</b>
                    <span>Omset Terkunci</span>
                  </div>
                  <div className="screen-k">
                    <b>11.7%</b>
                    <span>Margin Bersih</span>
                  </div>
                </div>
                {/* SEAT TRACKER BARS */}
                <div className="mt-2 space-y-1.5 rounded-lg bg-white p-2.5 border border-stone-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                    Penjualan Kursi Rombongan
                  </span>
                  <div className="mbar">
                    <span className="truncate">01 Okt 2026</span>
                    <span className="tr">
                      <i style={{ width: "69%" }}></i>
                    </span>
                    <span className="font-bold text-pink-600 text-right">31/45</span>
                  </div>
                  <div className="mbar">
                    <span className="truncate">15 Nov 2026</span>
                    <span className="tr">
                      <i style={{ width: "40%", background: "#f59e0b" }}></i>
                    </span>
                    <span className="font-bold text-amber-600 text-right">18/45</span>
                  </div>
                </div>
              </div>
              <div className="feat-txt">
                <h3>2. Layar Pantau Owner (Command Center)</h3>
                <p>Status pendaftaran, realisasi biaya tiket/hotel, dan margin laba rombongan dapat dipantau langsung dalam satu layar di HP.</p>
              </div>
            </article>

            {/* FITUR 3: KASIR & KWITANSI OTOMATIS */}
            <article className="feat-card" id="f-kasir">
              <div className="feat-screen" aria-label="Contoh verifikasi kasir">
                <div className="feat-stop">
                  <span>Kasir &amp; Pembayaran</span>
                  <span className="feat-chip">Rek. Mandiri</span>
                </div>
                <div className="flex-1 flex flex-col justify-between rounded-xl bg-white p-2.5 sm:p-3 border border-stone-200">
                  <div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-stone-700 truncate">Hj. Siti Aminah</span>
                      <span className="font-bold text-pink-600 shrink-0">DP Rp 10 Jt</span>
                    </div>
                    <p className="text-[10px] text-stone-400 mt-0.5">Ref: Bank Mandiri 2610-9981</p>
                  </div>

                  <div className="rounded-lg bg-stone-50 p-2 text-center my-1">
                    {isKasirVerified ? (
                      <div className="anim-rise space-y-0.5">
                        <div className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold text-emerald-700">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                          KW-2610-0012 Terbit Lunas
                        </div>
                        <p className="text-[9px] sm:text-[10px] text-emerald-800">
                          UmrahMe aktif • Komisi Rp 3 Jt tercatat.
                        </p>
                      </div>
                    ) : (
                      <p className="text-[11px] text-stone-600">Menunggu konfirmasi kasir.</p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsKasirVerified(!isKasirVerified)}
                    className="w-full rounded-lg py-2 text-xs font-bold text-white shadow-xs transition-all"
                    style={{ background: isKasirVerified ? "#15803d" : "var(--accent)" }}
                  >
                    {isKasirVerified ? "✓ Terverifikasi (Klik Reset)" : "Verifikasi DP Kasir (Klik)"}
                  </button>
                </div>
              </div>
              <div className="feat-txt">
                <h3>3. Kasir Anti-Bocor &amp; Kuitansi Otomatis</h3>
                <p>Kwitansi hanya bisa keluar jika ada mutasi kasir yang sah. Mencegah manipulasi kuitansi manual di luar pencatatan resmi.</p>
              </div>
            </article>

            {/* FITUR 4: SMARTPHONE AGEN MANDIRI */}
            <article className="feat-card" id="f-agen">
              <div className="feat-screen" aria-label="Contoh aplikasi agen">
                <div className="feat-stop">
                  <span>Portal Agen My El Massa</span>
                  <span className="feat-chip">Akses HP</span>
                </div>
                <div className="rounded-xl bg-stone-900 text-white p-2.5 sm:p-3 space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-stone-400">Ust. Ahmad (AG-01)</span>
                    <span className="text-emerald-400 font-bold">Terverifikasi</span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-[10px] sm:text-[11px] text-stone-300">Komisi Belum Cair:</span>
                    <span className="text-xs sm:text-sm font-extrabold text-pink-400">Rp 7.000.000</span>
                  </div>
                </div>

                <div className="space-y-1 rounded-xl bg-white p-2.5 border border-stone-200 text-xs">
                  <div className="flex justify-between font-bold text-stone-800 text-[11px]">
                    <span>Jamaah Terdaftar Agen:</span>
                    <span className="text-pink-600">8 Jamaah</span>
                  </div>
                  <p className="text-[10px] text-stone-500">2 jamaah baru sedang menunggu verifikasi kasir.</p>
                </div>
              </div>
              <div className="feat-txt">
                <h3>4. Portal Mandiri Mitra &amp; Agen Daerah</h3>
                <p>Mitra daerah memiliki link pendaftaran mandiri. Mereka melihat sisa kursi dan komisi secara transparan langsung di smartphone.</p>
              </div>
            </article>

            {/* FITUR 5: OTOMASI DOKUMEN KEMENAG */}
            <article className="feat-card" id="f-dokumen">
              <div className="feat-screen" aria-label="Contoh dokumen resmi">
                <div className="feat-stop">
                  <span>Dokumen Resmi Kantor</span>
                  <span className="feat-chip">Kop Resmi Asli</span>
                </div>
                <div className="flex-1 rounded-xl bg-white p-2.5 sm:p-3 border border-stone-200 flex flex-col justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-1.5 text-stone-900 font-bold border-b border-stone-100 pb-1.5 text-[11px] sm:text-xs">
                      <FileCheck className="h-4 w-4 text-pink-600 shrink-0" />
                      Surat Rekomendasi Paspor Kemenag
                    </div>
                    <div className="mt-1.5 space-y-1 text-[10px] sm:text-[11px] text-stone-600">
                      <p><strong>Nama:</strong> Hj. Siti Aminah</p>
                      <p><strong>NIK:</strong> 3201123456780001</p>
                      <p><strong>Paket:</strong> Umrah Reguler 01 Okt 2026</p>
                    </div>
                  </div>
                  <div className="rounded bg-emerald-50 p-1.5 text-center text-[10px] font-bold text-emerald-800 mt-2">
                    ✓ Format Baku Imigrasi Kemenag RI
                  </div>
                </div>
              </div>
              <div className="feat-txt">
                <h3>5. Dokumen Kemenag Tanpa Ketik Ulang</h3>
                <p>Surat rekomendasi paspor, penambahan tiga suku kata nama, dan surat cuti tercetak lengkap dengan kop surat pink-coklat asli.</p>
              </div>
            </article>

            {/* FITUR 6: LAYANAN DIGITAL UMRAHME */}
            <article className="feat-card" id="f-umrahme">
              <div className="feat-screen" aria-label="Contoh aplikasi jamaah">
                <div className="feat-stop">
                  <span>Pendamping Digital Jamaah</span>
                  <span className="feat-chip">UmrahMe</span>
                </div>
                <div className="rounded-xl bg-purple-900 text-white p-2.5 sm:p-3 space-y-1">
                  <p className="text-[9px] text-purple-300 uppercase">Jadwal Perjalanan</p>
                  <p className="font-bold text-xs sm:text-sm">Hari 1: CGK ➔ JED ➔ Madinah</p>
                  <p className="text-[10px] sm:text-xs text-purple-200">Hotel Taiba Front (Pelataran Nabawi)</p>
                </div>
                <div className="rounded-xl bg-white p-2 sm:p-2.5 border border-stone-200 text-xs space-y-0.5">
                  <div className="flex justify-between font-bold text-stone-800 text-[11px]">
                    <span>Muthawwif:</span>
                    <span className="text-purple-700">Ust. M. Rizky, Lc</span>
                  </div>
                  <p className="text-[10px] text-stone-500">Audio panduan manasik siap diputar offline.</p>
                </div>
              </div>
              <div className="feat-txt">
                <h3>6. Pengalaman Ibadah Modern (UmrahMe)</h3>
                <p>Jamaah merasa tenang dan terlayani dengan jadwal manasik, nomor kamar hotel, dan kontak muthawwif selalu tersedia di genggaman.</p>
              </div>
            </article>
          </div>
        </section>

        {/* SECTION 7: COBA SENDIRI (INTERACTIVE SIMULATOR) */}
        <section className="pitch-panel" id="contoh">
          <div className="panel-head">
            <p className="eyebrow">Coba Sendiri Alur Operasional</p>
            <h2>Klik salah satu skenario operasional berikut</h2>
            <p className="lead">
              Empat skenario ini mewakili alur bisnis nyata yang dibahas bersama Bang Azri. Klik untuk melihat bagaimana sistem merespons secara otomatis dan aman.
            </p>
          </div>

          <div className="demo-box">
            {/* Sisi Kiri: Tombol Pilihan Skenario */}
            <div className="qs-list" role="tablist">
              {SCENARIOS.map((sc, idx) => (
                <button
                  key={sc.q}
                  type="button"
                  role="tab"
                  aria-pressed={activeScenarioIdx === idx}
                  onClick={() => setActiveScenarioIdx(idx)}
                  className="qs-btn"
                >
                  {sc.q}
                </button>
              ))}
            </div>

            {/* Sisi Kanan: Jawaban Dinamis & Visualisasi Status */}
            <div className="ans-card anim-rise" key={activeScenarioIdx} aria-live="polite">
              <div>
                <h3>{activeScenario.title}</h3>
                <p className="sum">{activeScenario.sum}</p>

                {/* Render KPI Grid jika tipe skenario KPI */}
                {activeScenario.type === "kpis" && activeScenario.kpis && (
                  <div className="kpi-row">
                    {activeScenario.kpis.map((k) => (
                      <div key={k.label} className="kpi-card anim-rise">
                        <b>{k.num}</b>
                        <span>{k.label}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Render Bar Chart jika tipe skenario BARS (RESPONSIF MOBILE DENGAN sim-bar-grid) */}
                {activeScenario.type === "bars" && activeScenario.bars && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", margin: "14px 0" }}>
                    {activeScenario.bars.map((b) => (
                      <div
                        key={b.label}
                        className="sim-bar-grid"
                        style={{
                          display: "grid",
                          gridTemplateColumns: "180px minmax(0, 1fr) 120px",
                          gap: "10px",
                          alignItems: "center",
                          fontSize: "0.82rem",
                        }}
                      >
                        <span className="sim-bar-title" style={{ fontWeight: 600 }}>{b.label}</span>
                        <div style={{ height: "10px", background: "var(--track)", borderRadius: "4px", position: "relative", overflow: "hidden" }}>
                          <div
                            style={{
                              position: "absolute",
                              inset: "0 auto 0 0",
                              width: `${Math.min(100, Math.round((b.val / b.max) * 100))}%`,
                              background: b.isLow ? "var(--bad)" : "var(--accent)",
                              borderRadius: "4px",
                              animation: "growx 0.8s ease-out both",
                            }}
                          />
                        </div>
                        <span style={{ fontWeight: 700, color: b.isLow ? "var(--bad)" : "var(--ink)", textAlign: "right" }}>{b.unit}</span>
                      </div>
                    ))}
                  </div>
                )}

                <p style={{ fontSize: "0.76rem", color: "var(--muted)", margin: "10px 0 0 0" }}>
                  {activeScenario.src}
                </p>
              </div>

              {/* Rekomendasi & Mekanisme Pengamanan */}
              <div className="rec-box">
                <span className="tag">Saran Sistem &amp; Mekanisme Pengamanan</span>
                <dl>
                  <dt>Yang Ditemukan</dt>
                  <dd>{activeScenario.rec.found}</dd>
                  <dt>Buktinya</dt>
                  <dd>{activeScenario.rec.evidence}</dd>
                  <dt>Tindakan Staf</dt>
                  <dd>{activeScenario.rec.action}</dd>
                  <dt>Jaminan Sistem</dt>
                  <dd>{activeScenario.rec.confidence}</dd>
                </dl>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 8: CARA KERJANYA (5 LANGKAH OPERASIONAL) */}
        <section className="pitch-panel" id="cara">
          <div className="panel-head">
            <p className="eyebrow">Cara Kerjanya</p>
            <h2>Dari pendaftaran calon jamaah sampai kepulangan, dalam lima langkah</h2>
          </div>
          <div className="steps-row">
            <div className="step-card">
              <span className="n">Langkah 1</span>
              <h3>Pendaftaran Agen</h3>
              <p>Agen daerah login via My El Massa di HP, cek sisa seat paket, dan input data calon jamaah binaannya.</p>
            </div>
            <div className="step-card">
              <span className="n">Langkah 2</span>
              <h3>Verifikasi Kasir</h3>
              <p>Data masuk ke kantor. Kasir mencocokkan transfer DP jamaah dan menekan tombol verifikasi.</p>
            </div>
            <div className="step-card">
              <span className="n">Langkah 3</span>
              <h3>Kwitansi &amp; UmrahMe</h3>
              <p>Kwitansi resmi terbit otomatis. Saat itu juga, akun aplikasi UmrahMe jamaah aktif untuk persiapan.</p>
            </div>
            <div className="step-card">
              <span className="n">Langkah 4</span>
              <h3>Surat &amp; Perlengkapan</h3>
              <p>Staf cetak rekomendasi paspor Kemenag sekali klik, dan gudang mencatat serah-terima koper/ihram.</p>
            </div>
            <div className="step-card">
              <span className="n">Langkah 5</span>
              <h3>Manifest &amp; Terbang</h3>
              <p>Data visa &amp; rooming hotel Makkah-Madinah terkunci di manifest. Jamaah berangkat dengan tenang.</p>
            </div>
          </div>
        </section>

        {/* SECTION 9: KESIAPAN HARI SENIN & ROADMAP */}
        <section className="pitch-panel" id="jadwal">
          <div className="split-head" style={{ marginBottom: "24px" }}>
            <div className="panel-head" style={{ margin: 0 }}>
              <p className="eyebrow">Kesiapan Hari Senin &amp; Roadmap</p>
              <h2>Hari Senin anak-anak kantor mulai input data. Hasilnya langsung terlihat.</h2>
            </div>
            <p className="lead" style={{ maxWidth: "38ch" }}>
              Sesuai arahan Bang Azri, kita dampingi staf kantor menguji alur kasir dan administrasi secara riil.
            </p>
          </div>

          <div className="grid-3">
            <div className="card" style={{ borderTop: "4px solid var(--accent)" }}>
              <span className="eyebrow" style={{ color: "var(--accent)" }}>Fase 1 • Hari Senin Besok</span>
              <h3>Input Data Administrasi &amp; Kasir</h3>
              <p>Staf kantor mulai memasukkan data jamaah riil, mencatat transaksi pembayaran di kasir, dan menerbitkan kwitansi serta invoice resmi.</p>
              <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--success)", marginTop: "auto" }}>
                ✓ Sistem 100% Siap Dipakai
              </div>
            </div>

            <div className="card" style={{ borderTop: "4px solid #d97706" }}>
              <span className="eyebrow" style={{ color: "#d97706" }}>Fase 2 • Minggu Berjalan</span>
              <h3>Finalisasi UmrahMe &amp; Stok</h3>
              <p>Menguji coba penerbitan akun UmrahMe untuk jamaah yang lunas dan memasukkan saldo stok awal koper, mukena, dan ihram ke sistem gudang.</p>
              <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#d97706", marginTop: "auto" }}>
                ⏳ Pendampingan Tim Lapangan
              </div>
            </div>

            <div className="card" style={{ borderTop: "4px solid #16a34a" }}>
              <span className="eyebrow" style={{ color: "#16a34a" }}>Fase 3 • Skalabilitas Mitra</span>
              <h3>Distribusi Akun &quot;My El Massa&quot;</h3>
              <p>Membagikan kode agen resmi ke seluruh perwakilan mitra daerah agar mereka bisa mulai mendaftarkan jamaah mandiri dari smartphone.</p>
              <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--muted)", marginTop: "auto" }}>
                🚀 Pertumbuhan Omset Travel
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 10: MATRIKS HAK AKSES SISTEM */}
        <section className="pitch-panel" id="akses">
          <div className="panel-head">
            <p className="eyebrow">Tata Kelola &amp; Hak Akses</p>
            <h2>Setiap peran memiliki akses yang aman sesuai tugas dan tanggung jawabnya</h2>
          </div>
          <div className="tablewrap">
            <div className="text-[10px] text-stone-400 pb-1.5 md:hidden text-right italic">
              ← Geser ke kanan untuk melihat rincian tabel →
            </div>
            <table>
              <thead>
                <tr>
                  <th>Peran Pengguna</th>
                  <th>Yang Dikerjakan</th>
                  <th>Hak Akses di Sistem</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Owner / CEO (Bang Azri)</strong></td>
                  <td>Memantau seluruh omset, rekap margin laba grup, dan kinerja mitra</td>
                  <td>Akses Penuh Semua Modul &amp; Laporan Eksekutif</td>
                </tr>
                <tr>
                  <td><strong>Kasir / Keuangan</strong></td>
                  <td>Verifikasi pembayaran DP/cicilan, cetak kwitansi, dan arus kas</td>
                  <td>Modul Pembayaran, Invoice, Kuitansi, &amp; Rekap Grup</td>
                </tr>
                <tr>
                  <td><strong>Staf Operasional</strong></td>
                  <td>Manajemen booking, cetak surat rekomendasi paspor Kemenag, dan manifest</td>
                  <td>Modul Paket, Booking, Dokumen Surat, &amp; Manifest</td>
                </tr>
                <tr>
                  <td><strong>Tim Gudang / Logistik</strong></td>
                  <td>Mencatat serah terima koper, kain ihram, mukena, dan seragam batik</td>
                  <td>Modul Manajemen Stok Perlengkapan (FIFO)</td>
                </tr>
                <tr>
                  <td><strong>Mitra / Agen Resmi</strong></td>
                  <td>Melihat sisa kursi paket umrah dan mendaftarkan calon jamaah binaan</td>
                  <td>Portal Khusus Mandiri My El Massa di Smartphone</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* SECTION 11: CLOSING CALL TO ACTION BANNER */}
        <section className="closing-banner">
          <p className="eyebrow" style={{ color: "var(--accent)" }}>Siap Melangkah Maju</p>
          <h2>Seluruh Sistem Telah Siap. Mari Mulai Hari Senin.</h2>
          <p>
            Sistem terpadu ini siap menjadi fondasi operasional yang kokoh bagi kemajuan dan nama besar PT El Massa Tour &amp; Travel.
          </p>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "center", marginTop: "10px", width: "100%" }}>
            <Link className="pitch-btn pitch-btn-accent" href="/dashboard">
              Masuk ke Dashboard Sistem
            </Link>
            <Link className="pitch-btn pitch-btn-ghost" href="/my-elmassa" target="_blank">
              Simulasikan Portal Agen
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
