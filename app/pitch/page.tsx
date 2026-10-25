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

export default function PitchPresentationPage() {
  // State untuk Hero Interactive Device Switcher
  const [heroDeviceMode, setHeroDeviceMode] = useState<"admin" | "agen" | "umrahme" | "kuitansi">("admin");

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
          gap: 12px;
          font-weight: 700;
          font-size: 1.05rem;
          color: var(--ink);
          text-decoration: none;
          letter-spacing: -0.02em;
        }

        .pitch-nav .links {
          display: flex;
          gap: 22px;
        }

        .pitch-nav .links a {
          color: var(--muted);
          text-decoration: none;
          font-size: 0.88rem;
          font-weight: 500;
          transition: color 0.15s;
        }

        .pitch-nav .links a:hover {
          color: var(--ink);
        }

        @media (max-width: 920px) {
          .pitch-nav .links {
            display: none;
          }
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
          padding: clamp(32px, 5.5vw, 64px) clamp(24px, 4.5vw, 48px);
          display: grid;
          grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
          gap: 40px;
          align-items: center;
          overflow: hidden;
          position: relative;
        }

        @media (max-width: 960px) {
          .pitch-hero {
            grid-template-columns: minmax(0, 1fr);
          }
        }

        .pitch-hero h1 {
          font-weight: 500;
          letter-spacing: -0.035em;
          font-size: clamp(2.3rem, 4.8vw, 3.8rem);
          line-height: 1.06;
          margin: 0;
          text-wrap: balance;
        }

        .pitch-hero p.sub {
          color: rgba(255, 255, 255, 0.88);
          max-width: 48ch;
          margin-top: 18px;
          font-size: 1.02rem;
          line-height: 1.5;
        }

        .pitch-hero .ctas {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          margin-top: 28px;
        }

        .pitch-trust {
          margin-top: 32px;
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 0.84rem;
          color: rgba(255, 255, 255, 0.9);
        }

        .pitch-trust b {
          display: inline-grid;
          place-items: center;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: var(--ink);
          color: #ffffff;
          font-weight: 700;
          font-size: 0.82rem;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        /* DEVICE MOCKUP (HERO INTERACTIVE SIMULATOR) */
        .device-wrapper {
          position: relative;
        }

        .device-bezel {
          background: var(--card);
          color: var(--ink);
          border-radius: 24px;
          padding: 18px;
          box-shadow: 0 32px 64px -18px rgba(10, 8, 8, 0.45);
          border: 9px solid #1f1614;
          position: relative;
          min-height: 440px;
          display: flex;
          flex-direction: column;
        }

        .device-top-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 12px;
          border-bottom: 1px solid var(--line);
          margin-bottom: 12px;
        }

        .window-dots {
          display: flex;
          gap: 6px;
          align-items: center;
        }

        .window-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }

        .device-modes {
          display: flex;
          background: var(--surface);
          border-radius: 9px;
          padding: 3px;
          gap: 3px;
          overflow-x: auto;
        }

        .mode-tab {
          border: none;
          background: transparent;
          font: 600 0.72rem/1 var(--font);
          padding: 6px 10px;
          border-radius: 7px;
          color: var(--muted);
          cursor: pointer;
          transition: all 0.15s;
          display: flex;
          align-items: center;
          gap: 5px;
          white-space: nowrap;
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
          padding: clamp(26px, 4.8vw, 54px);
        }

        .panel-head {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 30px;
        }

        .split-head {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 24px;
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
          font-size: clamp(1.65rem, 2.9vw, 2.4rem);
          font-weight: 500;
          line-height: 1.16;
          letter-spacing: -0.025em;
          margin: 0;
          text-wrap: balance;
        }

        .lead {
          color: var(--muted);
          max-width: 58ch;
          font-size: 1.02rem;
          margin: 0;
        }

        /* STATS GRID */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
          gap: 14px;
          margin-top: 36px;
        }

        .stat-card {
          background: var(--card);
          border-radius: 14px;
          padding: 22px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          gap: 32px;
          min-height: 165px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);
        }

        .stat-card b {
          font-size: 2.3rem;
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

        @media (max-width: 900px) {
          .grid-3 {
            grid-template-columns: 1fr;
          }
        }

        .card {
          background: var(--card);
          border-radius: 14px;
          padding: 22px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
        }

        .card h3 {
          font-size: 1.12rem;
          font-weight: 600;
          letter-spacing: -0.01em;
          margin: 0;
          line-height: 1.3;
        }

        .card p {
          color: var(--muted);
          font-size: 0.9rem;
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
          margin-bottom: 6px;
        }

        /* FITUR GRID & SCREEN MOCKUPS IDENTIK DENGAN ARTIFACT-DAR */
        .feat-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 16px;
        }

        @media (max-width: 768px) {
          .feat-grid {
            grid-template-columns: 1fr;
          }
        }

        .feat-card {
          background: var(--card);
          border-radius: 16px;
          padding: 14px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          min-width: 0;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
          border: 1px solid var(--line);
        }

        .feat-screen {
          background: var(--surface);
          border-radius: 12px;
          height: 330px;
          padding: 14px;
          overflow: hidden;
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
          gap: 6px;
          padding: 3px 8px;
          background: var(--card);
          border-radius: 20px;
          font-size: 0.68rem;
          font-weight: 600;
          color: var(--ink);
          border: 1px solid var(--line);
        }

        .feat-chip .dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #16a34a;
        }

        .feat-txt {
          padding: 4px 8px 10px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .feat-txt h3 {
          font-size: 1.15rem;
          font-weight: 600;
          letter-spacing: -0.015em;
          margin: 0;
        }

        .feat-txt p {
          color: var(--muted);
          font-size: 0.9rem;
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
          padding-right: 4px;
        }

        .chat-bubble-u {
          align-self: flex-end;
          background: var(--ink);
          color: #ffffff;
          border-radius: 12px 12px 3px 12px;
          padding: 8px 11px;
          max-width: 86%;
          font-size: 0.78rem;
          line-height: 1.4;
        }

        .chat-bubble-s {
          align-self: flex-start;
          background: var(--card);
          border-radius: 12px 12px 12px 3px;
          padding: 9px 12px;
          width: 95%;
          display: flex;
          flex-direction: column;
          gap: 6px;
          font-size: 0.78rem;
          line-height: 1.4;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
        }

        .chat-inbar {
          background: var(--card);
          border: 1px solid var(--line);
          border-radius: 10px;
          padding: 5px 6px 5px 12px;
          display: flex;
          align-items: center;
          gap: 8px;
          min-height: 38px;
        }

        .chat-inbar input {
          flex: 1;
          border: none;
          background: transparent;
          font: 400 0.8rem var(--font);
          color: var(--ink);
          outline: none;
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
        }

        /* KPI GRID SCREEN */
        .screen-kgrid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-top: 4px;
        }

        .screen-k {
          background: var(--card);
          border-radius: 9px;
          padding: 10px;
          display: flex;
          flex-direction: column;
          gap: 2px;
          border: 1px solid var(--line);
        }

        .screen-k b {
          font-size: 1.15rem;
          font-weight: 700;
          color: var(--ink);
        }

        .screen-k span {
          font-size: 0.68rem;
          color: var(--muted);
        }

        /* BARS SCREEN */
        .mbar {
          display: grid;
          grid-template-columns: 80px minmax(0, 1fr) 42px;
          gap: 8px;
          align-items: center;
          font-size: 0.72rem;
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
          grid-template-columns: 320px minmax(0, 1fr);
          gap: 16px;
          margin-top: 10px;
        }

        @media (max-width: 860px) {
          .demo-box {
            grid-template-columns: 1fr;
          }
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
          padding: 14px 16px;
          text-align: left;
          font: 500 0.88rem/1.4 var(--font);
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
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
        }

        .ans-card h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin: 0 0 6px 0;
        }

        .ans-card p.sum {
          color: var(--muted);
          font-size: 0.92rem;
          margin: 0 0 16px 0;
          line-height: 1.5;
        }

        .kpi-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 12px;
          margin: 14px 0;
        }

        .kpi-card {
          background: var(--surface);
          border-radius: 12px;
          padding: 14px;
        }

        .kpi-card b {
          display: block;
          font-size: 1.35rem;
          font-weight: 700;
          color: var(--ink);
        }

        .kpi-card span {
          font-size: 0.76rem;
          color: var(--muted);
        }

        .rec-box {
          background: #fff8f5;
          border-left: 4px solid var(--accent);
          border-radius: 12px;
          padding: 16px;
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
          font-size: 0.85rem;
          margin: 0;
        }

        @media (max-width: 600px) {
          .rec-box dl {
            grid-template-columns: 1fr;
          }
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

        @media (max-width: 960px) {
          .steps-row {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 540px) {
          .steps-row {
            grid-template-columns: 1fr;
          }
        }

        .step-card {
          background: var(--card);
          border-radius: 14px;
          padding: 18px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .step-card .n {
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--accent);
        }

        .step-card h3 {
          font-size: 1.05rem;
          font-weight: 600;
          margin: 0;
        }

        .step-card p {
          font-size: 0.82rem;
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
        }

        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.88rem;
          text-align: left;
        }

        th {
          padding: 12px 16px;
          font-weight: 600;
          color: var(--muted);
          border-bottom: 1px solid var(--line);
          font-size: 0.78rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        td {
          padding: 14px 16px;
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
          padding: clamp(36px, 6vw, 64px) clamp(24px, 5vw, 48px);
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 16px;
        }

        .closing-banner h2 {
          color: #ffffff;
          font-size: clamp(2rem, 4vw, 3rem);
          max-width: 24ch;
        }

        .closing-banner p {
          color: rgba(255, 255, 255, 0.8);
          max-width: 50ch;
          margin: 0;
          font-size: 1rem;
        }
      `}</style>

      <div className="pitch-container">
        {/* TOP NAVIGATION BAR */}
        <nav className="pitch-nav" aria-label="Navigasi">
          <Link className="logo" href="#atas">
            <div className="relative h-8 w-28 shrink-0">
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
            <a href="#ekosistem">3 Gerbang</a>
            <a href="#fitur">Layar &amp; Mockup</a>
            <a href="#contoh">Coba Alur</a>
            <a href="#cara">Cara Kerja</a>
            <a href="#jadwal">Kesiapan Senin</a>
            <a href="#akses">Hak Akses</a>
          </div>
          <Link className="pitch-btn pitch-btn-accent" href="/dashboard">
            Buka Sistem Kantor
          </Link>
        </nav>

        {/* HERO SECTION DENGAN REALISTIC MULTI-DEVICE MOCKUP & ANIMASI */}
        <header className="pitch-hero" id="atas">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-pink-400/30 bg-pink-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-pink-300">
              <Sparkles className="h-3.5 w-3.5 text-pink-400" />
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
              <a className="pitch-btn pitch-btn-ghost" href="#fitur">
                Lihat Mockup Layar
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
                  >
                    <Monitor className="h-3.5 w-3.5" />
                    Admin Kantor
                  </button>
                  <button
                    type="button"
                    role="tab"
                    data-active={heroDeviceMode === "agen"}
                    onClick={() => setHeroDeviceMode("agen")}
                    className="mode-tab"
                  >
                    <Smartphone className="h-3.5 w-3.5" />
                    HP Agen (My El Massa)
                  </button>
                  <button
                    type="button"
                    role="tab"
                    data-active={heroDeviceMode === "umrahme"}
                    onClick={() => setHeroDeviceMode("umrahme")}
                    className="mode-tab"
                  >
                    <Heart className="h-3.5 w-3.5" />
                    UmrahMe
                  </button>
                  <button
                    type="button"
                    role="tab"
                    data-active={heroDeviceMode === "kuitansi"}
                    onClick={() => setHeroDeviceMode("kuitansi")}
                    className="mode-tab"
                  >
                    <ReceiptText className="h-3.5 w-3.5" />
                    Kwitansi KW
                  </button>
                </div>
              </div>

              {/* MOCKUP CONTENT 1: ADMIN WEB KANTOR */}
              {heroDeviceMode === "admin" && (
                <div className="anim-rise flex flex-col gap-3">
                  <div className="flex items-center justify-between rounded-lg bg-stone-100 p-2.5 text-xs font-semibold text-stone-800">
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 anim-pulse-green"></span>
                      Kantor Pusat: Booking Real-Time
                    </span>
                    <span className="rounded bg-white px-2 py-0.5 text-[11px] font-bold text-stone-600 shadow-xs">
                      14 Seat Sisa
                    </span>
                  </div>

                  <div className="space-y-2 rounded-xl border border-stone-200 bg-stone-50/50 p-3 text-xs">
                    <div className="flex justify-between font-medium text-stone-500">
                      <span>Paket Umrah 01 Oktober 2026</span>
                      <span className="font-bold text-stone-900">45 Pax Target</span>
                    </div>
                    {/* PROGRESS BAR DENGAN ANIMASI */}
                    <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-stone-200">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-pink-600 to-rose-500 transition-all duration-1000 ease-out"
                        style={{ width: "69%" }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-[11px] text-stone-600">
                      <span>31 Terisi (DP Masuk)</span>
                      <span className="font-bold text-rose-600">69% Terpenuhi</span>
                    </div>
                  </div>

                  {/* MINI TABLE BOOKING TERBARU */}
                  <div className="rounded-xl border border-stone-200 bg-white p-2.5 shadow-xs">
                    <div className="mb-2 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-stone-400">
                      <span>Booking Terbaru</span>
                      <span className="text-emerald-600">3 Menit Lalu</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-stone-100 pb-2 text-xs">
                      <div>
                        <p className="font-semibold text-stone-800">Hj. Siti Aminah + 1</p>
                        <p className="text-[11px] text-stone-500">Agen: Ustadz Ahmad Sobri (AG-01)</p>
                      </div>
                      <span className="rounded-md bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-700">
                        DP Rp 10.000.000 (Lunas)
                      </span>
                    </div>
                  </div>

                  <div className="mt-auto rounded-xl border border-pink-200 bg-pink-50/70 p-2.5 text-xs text-pink-950">
                    <span className="mb-0.5 block text-[10px] font-bold uppercase tracking-wider text-pink-600">
                      Aksi Otomatis Sistem
                    </span>
                    Kwitansi KW-2610-0012 terbit otomatis, komisi agen Rp 3.000.000 masuk dompet mitra, dan akun UmrahMe jamaah aktif.
                  </div>
                </div>
              )}

              {/* MOCKUP CONTENT 2: SMARTPHONE MY EL MASSA (AGEN) */}
              {heroDeviceMode === "agen" && (
                <div className="anim-rise mx-auto flex w-full max-w-[320px] flex-col gap-3 rounded-2xl border-4 border-stone-800 bg-white p-3 shadow-md">
                  {/* PHONE NOTCH / STATUS */}
                  <div className="flex items-center justify-between px-1 text-[10px] font-bold text-stone-500">
                    <span>09:14</span>
                    <div className="h-3 w-16 rounded-full bg-stone-800"></div>
                    <span>5G 100%</span>
                  </div>

                  {/* AGENT IDENTITY */}
                  <div className="rounded-xl bg-gradient-to-r from-stone-900 to-stone-800 p-3 text-white shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-stone-400">Kode Agen: AG-ELMASSA-01</span>
                      <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                        Aktif 🟢
                      </span>
                    </div>
                    <p className="mt-1 font-bold text-sm">Ust. H. Ahmad Sobri</p>
                    <div className="mt-2 border-t border-stone-700/80 pt-2 flex justify-between items-baseline">
                      <span className="text-[11px] text-stone-300">Saldo Komisi:</span>
                      <span className="text-base font-extrabold text-pink-400">Rp 12.500.000</span>
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
                      className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-xs font-bold text-stone-700"
                    >
                      Brosur PDF
                    </button>
                  </div>

                  {/* AGENT FEED */}
                  <div className="rounded-xl border border-stone-100 bg-stone-50 p-2 text-xs">
                    <div className="flex justify-between text-[11px] font-semibold text-stone-600">
                      <span>Paket Oktober</span>
                      <span className="text-pink-600">14 Seat Tersedia</span>
                    </div>
                    <p className="mt-0.5 text-[11px] text-stone-400">Komisi: Rp 1.500.000 / pax</p>
                  </div>
                </div>
              )}

              {/* MOCKUP CONTENT 3: UMRAHME (JAMAAH) */}
              {heroDeviceMode === "umrahme" && (
                <div className="anim-rise mx-auto flex w-full max-w-[320px] flex-col gap-3 rounded-2xl border-4 border-stone-800 bg-white p-3 shadow-md">
                  <div className="flex items-center justify-between px-1 text-[10px] font-bold text-stone-500">
                    <span>09:14</span>
                    <div className="h-3 w-16 rounded-full bg-stone-800"></div>
                    <span className="text-purple-600 font-bold">UmrahMe</span>
                  </div>

                  {/* ITINERARY COUNTDOWN */}
                  <div className="rounded-xl bg-gradient-to-r from-purple-900 to-indigo-900 p-3 text-white shadow-xs">
                    <span className="text-[10px] uppercase tracking-wider text-purple-300">
                      Menuju Baitullah
                    </span>
                    <p className="mt-0.5 text-lg font-bold">Hj. Siti Aminah</p>
                    <p className="text-xs text-purple-200">Paket Reguler 12 Hari • Keberangkatan 01 Okt</p>
                    <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-purple-100">
                      <Clock className="h-3 w-3" /> 23 Hari Menuju Manasik Akbar
                    </div>
                  </div>

                  {/* TRIP HIGHLIGHTS */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-lg border border-stone-200 bg-stone-50 p-2">
                      <div className="flex items-center gap-1 font-bold text-stone-800">
                        <Plane className="h-3.5 w-3.5 text-purple-600" /> Penerbangan
                      </div>
                      <p className="mt-1 text-[11px] text-stone-500">Saudia SV-819 (Direct JED)</p>
                    </div>
                    <div className="rounded-lg border border-stone-200 bg-stone-50 p-2">
                      <div className="flex items-center gap-1 font-bold text-stone-800">
                        <Hotel className="h-3.5 w-3.5 text-purple-600" /> Hotel Makkah
                      </div>
                      <p className="mt-1 text-[11px] text-stone-500">Elaf Kinda (Depan Pelataran)</p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-2 text-center text-xs font-bold text-emerald-800">
                    ✓ Paspor &amp; Vaksin Meningitis Terverifikasi
                  </div>
                </div>
              )}

              {/* MOCKUP CONTENT 4: KWITANSI RESMI BERSTEMPEL */}
              {heroDeviceMode === "kuitansi" && (
                <div className="anim-rise relative flex flex-col gap-2 rounded-xl border border-stone-300 bg-white p-4 shadow-sm">
                  {/* KWITANSI HEADER */}
                  <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded bg-amber-700"></div>
                      <div>
                        <p className="font-extrabold text-xs text-stone-900 leading-none">PT EL MASSA TOUR &amp; TRAVEL</p>
                        <p className="text-[9px] text-stone-500">Izin Umrah Kemenag No. U.412 Tahun 2020</p>
                      </div>
                    </div>
                    <span className="rounded bg-stone-100 px-2 py-0.5 text-[11px] font-mono font-bold text-stone-700">
                      KW-2610-0012
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 py-1 text-[11px]">
                    <div>
                      <span className="text-stone-400">Telah Diterima Dari:</span>
                      <p className="font-bold text-stone-800">Hj. Siti Aminah</p>
                    </div>
                    <div>
                      <span className="text-stone-400">Untuk Pembayaran:</span>
                      <p className="font-bold text-stone-800">DP Umrah 01 Okt 2026 (2 Pax)</p>
                    </div>
                  </div>

                  <div className="rounded-lg bg-stone-50 p-2">
                    <span className="text-[10px] text-stone-400 block">Jumlah Uang:</span>
                    <span className="text-base font-extrabold text-stone-900">Rp 10.000.000</span>
                    <p className="text-[10px] italic text-stone-600 mt-0.5">
                      Terbilang: &quot;Sepuluh Juta Rupiah&quot;
                    </p>
                  </div>

                  {/* STEMPEL WATERMARK RESMI */}
                  <div className="anim-stamp absolute bottom-6 right-6 flex h-20 w-20 items-center justify-center rounded-full border-2 border-dashed border-rose-600/80 bg-rose-50/40 text-center text-[10px] font-extrabold uppercase text-rose-700 shadow-xs pointer-events-none">
                    <span>
                      PT EL MASSA
                      <br />
                      ★ LUNAS ★
                      <br />
                      KASIR PUSAT
                    </span>
                  </div>

                  <div className="mt-2 flex items-center justify-between text-[10px] text-stone-400 pt-1 border-t border-stone-100">
                    <span className="flex items-center gap-1">
                      <QrCode className="h-3 w-3 text-stone-700" /> Tervalidasi Sistem
                    </span>
                    <span>Dicetak: 25 Okt 2026 09:14</span>
                  </div>
                </div>
              )}
            </div>

            {/* FLOATING PILL BADGE DECORATION */}
            <div className="anim-float absolute -bottom-4 -left-4 hidden md:flex items-center gap-2 rounded-xl border border-stone-200 bg-white/95 px-3 py-2 text-xs font-bold text-stone-800 shadow-lg backdrop-blur-md">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 anim-pulse-green"></span>
              Live Sync Cloud Supabase
            </div>
            <div className="anim-float absolute -top-4 -right-4 hidden md:flex items-center gap-2 rounded-xl border border-stone-200 bg-white/95 px-3 py-2 text-xs font-bold text-pink-700 shadow-lg backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-pink-500" />
              Anti-Bocor Kasir 100%
            </div>
          </div>
        </header>

        {/* SECTION 1: KEBUTUHAN NYATA EL MASSA */}
        <section className="pitch-panel" id="kebutuhan">
          <div className="split-head">
            <div className="panel-head" style={{ margin: 0 }}>
              <p className="eyebrow">Kebutuhan Nyata El Massa</p>
              <h2>Satu sistem terpadu yang menyatukan seluruh kegiatan kantor, kasir, mitra, dan jamaah.</h2>
            </div>
            <p className="lead" style={{ maxWidth: "34ch" }}>
              Ukuran keberhasilannya sederhana: Owner bisa memantau omset dari HP, kasir tertib kuitansi, dan agen bisa mendaftarkan jamaah tanpa repot.
            </p>
          </div>
          <div className="stats-grid">
            <div className="stat-card">
              <p className="eyebrow">Risiko Selisih Uang Kasir</p>
              <b>0% (Anti-Bocor)</b>
              <span style={{ fontSize: "0.82rem", color: "var(--muted)" }}>Kwitansi terbit otomatis saat uang masuk</span>
            </div>
            <div className="stat-card">
              <p className="eyebrow">Pintu Masuk Terpadu</p>
              <b>3 Gerbang</b>
              <span style={{ fontSize: "0.82rem", color: "var(--muted)" }}>Kantor (Web), Agen (My El Massa), Jamaah (UmrahMe)</span>
            </div>
            <div className="stat-card">
              <p className="eyebrow">Ketik Ulang di Word</p>
              <b>0 Kali</b>
              <span style={{ fontSize: "0.82rem", color: "var(--muted)" }}>Surat Kemenag &amp; invoice otomatis ber-kop surat resmi</span>
            </div>
            <div className="stat-card">
              <p className="eyebrow">Kepastian Sisa Kursi</p>
              <b>Real-Time</b>
              <span style={{ fontSize: "0.82rem", color: "var(--muted)" }}>Seat berkurang otomatis saat booking dicatat</span>
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

        {/* SECTION 3: THE TRIPLE ENGINE ARCHITECTURE */}
        <section className="pitch-panel" id="ekosistem">
          <div className="split-head" style={{ marginBottom: "28px" }}>
            <div className="panel-head" style={{ margin: 0 }}>
              <p className="eyebrow">Arsitektur Ekosistem 3 Sudut</p>
              <h2>The Triple-Engine: Tiga gerbang saling mengunci secara sinergis</h2>
            </div>
            <p className="lead" style={{ maxWidth: "38ch" }}>
              Memastikan data mengalir lancar dari calon jamaah di daerah, diproses kantor pusat, hingga terbang ke tanah suci.
            </p>
          </div>
          <div className="grid-3">
            <div className="card" style={{ border: "1px solid #fbcfe8", background: "#fffafc" }}>
              <span className="eyebrow" style={{ color: "var(--accent)" }}>Gerbang 1 • Mobile Mitra</span>
              <h3>My El Massa (Portal Agen)</h3>
              <p>Diakses agen/mitra di mana saja lewat smartphone. Melihat katalog paket aktif, sisa kuota seat, dan mendaftarkan jamaah mandiri.</p>
              <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid var(--line)" }}>
                <Link href="/my-elmassa" target="_blank" className="pitch-btn pitch-btn-accent" style={{ minHeight: "36px", fontSize: "0.82rem" }}>
                  Buka Portal Agen ↗
                </Link>
              </div>
            </div>

            <div className="card" style={{ border: "1px solid #fed7aa", background: "#fffdf9" }}>
              <span className="eyebrow" style={{ color: "#c2410c" }}>Gerbang 2 • Command Center</span>
              <h3>El Massa Web (Kantor Pusat)</h3>
              <p>Pusat kendali staf admin, kasir keuangan, dan operasional. Verifikasi DP, terbitkan invoice &amp; kuitansi, cetak surat Kemenag, dan atur stok.</p>
              <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid var(--line)" }}>
                <Link href="/dashboard" className="pitch-btn" style={{ minHeight: "36px", fontSize: "0.82rem", background: "var(--ink)", color: "#fff" }}>
                  Buka Web Kantor
                </Link>
              </div>
            </div>

            <div className="card" style={{ border: "1px solid #e9d5ff", background: "#faf5ff" }}>
              <span className="eyebrow" style={{ color: "#7e22ce" }}>Gerbang 3 • Mobile Jamaah</span>
              <h3>UmrahMe (Aplikasi Jamaah)</h3>
              <p>Aplikasi mobile jamaah resmi. Login mandiri pasca-DP untuk memantau jadwal manasik, hotel, muthawwif, dan upload paspor sendiri.</p>
              <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid var(--line)" }}>
                <Link href="/umrahme" target="_blank" className="pitch-btn" style={{ minHeight: "36px", fontSize: "0.82rem", background: "#7e22ce", color: "#fff" }}>
                  Buka Menu UmrahMe ↗
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4: PANEL FITUR & MOCKUP SCREEN ANIMATIF (IDENTIK DENGAN ARTIFACT-DAR) */}
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
                    <span className="dot"></span>Data Live
                  </span>
                </div>
                <div className="chat-msgs">
                  {chatAnswers.map((m, i) => (
                    <div key={i} className={m.role === "user" ? "chat-bubble-u" : "chat-bubble-s"}>
                      <span>{m.text}</span>
                      <small className="text-[10px] opacity-70 block text-right">{m.time}</small>
                    </div>
                  ))}
                </div>
                <div className="chat-inbar">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Tanya sisa seat / komisi / paspor..."
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
                  >
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </div>
                {/* PROMPT CHIPS */}
                <div className="flex gap-1.5 overflow-x-auto pt-1">
                  <button
                    type="button"
                    onClick={() => handleSendChatPrompt("Cek saldo komisi Ustadz Ahmad")}
                    className="rounded bg-white px-2 py-0.5 text-[10px] font-semibold text-stone-600 border border-stone-200 shadow-2xs whitespace-nowrap"
                  >
                    Komisi Ustadz Ahmad
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSendChatPrompt("Cek progress paspor paket Oktober")}
                    className="rounded bg-white px-2 py-0.5 text-[10px] font-semibold text-stone-600 border border-stone-200 shadow-2xs whitespace-nowrap"
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
                  <span className="feat-chip">Bang Azri (CEO)</span>
                </div>
                <div className="screen-kgrid">
                  <div className="screen-k">
                    <b>39 Jamaah</b>
                    <span>Total Jamaah Terdaftar</span>
                  </div>
                  <div className="screen-k">
                    <b>3 Paket</b>
                    <span>Paket Umrah Dibuka</span>
                  </div>
                  <div className="screen-k">
                    <b>Rp 1.34 M</b>
                    <span>Omset Terkunci</span>
                  </div>
                  <div className="screen-k">
                    <b>11.7%</b>
                    <span>Estimasi Margin Bersih</span>
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
                    <span className="font-bold text-pink-600">31/45</span>
                  </div>
                  <div className="mbar">
                    <span className="truncate">15 Nov 2026</span>
                    <span className="tr">
                      <i style={{ width: "40%", background: "#f59e0b" }}></i>
                    </span>
                    <span className="font-bold text-amber-600">18/45</span>
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
                  <span className="feat-chip">Rek. Mandiri &amp; BSI</span>
                </div>
                <div className="flex-1 flex flex-col justify-between rounded-xl bg-white p-3 border border-stone-200">
                  <div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-stone-700">Tagihan: Hj. Siti Aminah</span>
                      <span className="font-bold text-pink-600">DP Rp 10 Juta</span>
                    </div>
                    <p className="text-[11px] text-stone-400 mt-0.5">Bukti Transfer: Bank Mandiri (No. Ref: 2610-9981)</p>
                  </div>

                  <div className="rounded-lg bg-stone-50 p-2 text-center">
                    {isKasirVerified ? (
                      <div className="anim-rise space-y-1">
                        <div className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          KW-2610-0012 Terbit Berstempel
                        </div>
                        <p className="text-[10px] text-emerald-800">
                          Akun UmrahMe jamaah aktif • Komisi Agen Rp 3.000.000 tercatat.
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs text-stone-600">Uang masuk rekening kantor menunggu konfirmasi kasir.</p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsKasirVerified(!isKasirVerified)}
                    className="w-full rounded-lg py-2 text-xs font-bold text-white shadow-xs transition-all"
                    style={{ background: isKasirVerified ? "#15803d" : "var(--accent)" }}
                  >
                    {isKasirVerified ? "✓ Transaksi Sudah Terverifikasi (Reset)" : "Verifikasi DP Kasir (Klik di Sini)"}
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
                <div className="rounded-xl bg-stone-900 text-white p-3 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-stone-400">Ustadz Ahmad (AG-01)</span>
                    <span className="text-emerald-400 font-bold">Terverifikasi</span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-[11px] text-stone-300">Komisi Belum Cair:</span>
                    <span className="text-sm font-extrabold text-pink-400">Rp 7.000.000</span>
                  </div>
                </div>

                <div className="space-y-1.5 rounded-xl bg-white p-2.5 border border-stone-200 text-xs">
                  <div className="flex justify-between font-bold text-stone-800">
                    <span>Jamaah Terdaftar Agen:</span>
                    <span className="text-pink-600">8 Jamaah</span>
                  </div>
                  <p className="text-[11px] text-stone-500">2 jamaah baru sedang menunggu verifikasi kasir kantor pusat.</p>
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
                <div className="flex-1 rounded-xl bg-white p-3 border border-stone-200 flex flex-col justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-1.5 text-stone-900 font-bold border-b border-stone-100 pb-1.5">
                      <FileCheck className="h-4 w-4 text-pink-600" />
                      Surat Rekomendasi Paspor Kemenag
                    </div>
                    <div className="mt-2 space-y-1 text-[11px] text-stone-600">
                      <p><strong>Nama:</strong> Hj. Siti Aminah</p>
                      <p><strong>NIK:</strong> 3201123456780001</p>
                      <p><strong>Paket:</strong> Umrah Reguler 01 Oktober 2026</p>
                    </div>
                  </div>
                  <div className="rounded bg-emerald-50 p-2 text-center text-[11px] font-bold text-emerald-800">
                    ✓ Format Baku Imigrasi Sesuai Kemenag RI
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
                  <span className="feat-chip">UmrahMe App</span>
                </div>
                <div className="rounded-xl bg-purple-900 text-white p-3 space-y-1.5">
                  <p className="text-[10px] text-purple-300 uppercase">Jadwal Perjalanan</p>
                  <p className="font-bold text-sm">Hari 1: CGK ➔ JED ➔ Madinah</p>
                  <p className="text-xs text-purple-200">Hotel Taiba Front (50m ke Masjid Nabawi)</p>
                </div>
                <div className="rounded-xl bg-white p-2.5 border border-stone-200 text-xs space-y-1">
                  <div className="flex justify-between font-bold text-stone-800">
                    <span>Muthawwif Rombongan:</span>
                    <span className="text-purple-700">Ust. M. Rizky, Lc</span>
                  </div>
                  <p className="text-[11px] text-stone-500">Audio panduan manasik dan doa tawaf siap diputar offline.</p>
                </div>
              </div>
              <div className="feat-txt">
                <h3>6. Pengalaman Ibadah Modern (UmrahMe)</h3>
                <p>Jamaah merasa tenang dan terlayani dengan jadwal manasik, nomor kamar hotel, dan kontak muthawwif selalu tersedia di genggaman.</p>
              </div>
            </article>
          </div>
        </section>

        {/* SECTION 5: COBA SENDIRI (INTERACTIVE SIMULATOR) */}
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

                {/* Render Bar Chart jika tipe skenario BARS */}
                {activeScenario.type === "bars" && activeScenario.bars && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", margin: "16px 0" }}>
                    {activeScenario.bars.map((b) => (
                      <div key={b.label} style={{ display: "grid", gridTemplateColumns: "180px minmax(0, 1fr) 120px", gap: "10px", alignItems: "center", fontSize: "0.82rem" }}>
                        <span style={{ fontWeight: 600 }}>{b.label}</span>
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

                <p style={{ fontSize: "0.78rem", color: "var(--muted)", margin: "12px 0 0 0" }}>
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

        {/* SECTION 6: CARA KERJANYA (5 LANGKAH OPERASIONAL) */}
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

        {/* SECTION 7: KESIAPAN HARI SENIN & ROADMAP */}
        <section className="pitch-panel" id="jadwal">
          <div className="split-head" style={{ marginBottom: "28px" }}>
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

        {/* SECTION 8: MATRIKS HAK AKSES SISTEM */}
        <section className="pitch-panel" id="akses">
          <div className="panel-head">
            <p className="eyebrow">Tata Kelola &amp; Hak Akses</p>
            <h2>Setiap peran memiliki akses yang aman sesuai tugas dan tanggung jawabnya</h2>
          </div>
          <div className="tablewrap">
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

        {/* SECTION 9: CLOSING CALL TO ACTION BANNER */}
        <section className="closing-banner">
          <p className="eyebrow" style={{ color: "var(--accent)" }}>Siap Melangkah Maju</p>
          <h2>Seluruh Sistem Telah Siap. Mari Mulai Hari Senin.</h2>
          <p>
            Sistem terpadu ini siap menjadi fondasi operasional yang kokoh bagi kemajuan dan nama besar PT El Massa Tour &amp; Travel.
          </p>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center", marginTop: "12px" }}>
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
