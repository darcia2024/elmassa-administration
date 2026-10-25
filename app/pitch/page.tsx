"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  BarChart3,
  Boxes,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  ExternalLink,
  FileSpreadsheet,
  FileText,
  Handshake,
  Layers,
  Lock,
  Mails,
  Monitor,
  Plane,
  Plus,
  ReceiptText,
  Search,
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

// Data skenario uji interaktif (mirip dengan var D di referensi)
const SCENARIOS = [
  {
    q: "1. Agen daftarkan jamaah dari HP, apa yang terjadi di kantor?",
    title: "Pendaftaran Otomatis Terikat Kode Agen",
    sum: "Data jamaah langsung masuk ke menu Booking kantor dengan status 'Belum Bayar'. Komisi agen otomatis dihitung di sistem (Rp 1.500.000/pax), dan kuota seat paket langsung berkurang.",
    type: "bars",
    bars: [
      { label: "Sisa Kuota Paket", val: 14, max: 45, unit: "Seat", isLow: true },
      { label: "Pax Didaftarkan Agen", val: 2, max: 10, unit: "Pax", isLow: false },
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
    sum: "Saat kasir menginput DP, sistem otomatis menerbitkan Kuitansi resmi (KW-XXXXXX) lengkap dengan terbilang rupiah dan stempel. Seketika itu juga, akun aplikasi UmrahMe milik jamaah otomatis DIAKTIFKAN.",
    type: "kpis",
    kpis: [
      { num: "KW-2610-0012", label: "Nomor Kwitansi Resmi Otomatis Terbit" },
      { num: "Rp 10.000.000", label: "DP Terverifikasi Masuk Kasir" },
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
  const [activeScenarioIdx, setActiveScenarioIdx] = useState(0);
  const activeScenario = SCENARIOS[activeScenarioIdx];

  return (
    <>
      {/* SCOPED CSS IDENTIK DENGAN ARTIFACT-DAR: Tumpukan panel bersudut bulat di atas latar abu hangat */}
      <style jsx global>{`
        :root {
          --page: #dad8d3;
          --surface: #f5f4ef;
          --card: #ffffff;
          --ink: #141414;
          --muted: #64635d;
          --line: #e2e0da;
          --accent: #d83b7d;
          --accent-soft: #fdf2f8;
          --brand-cocoa: #3c2920;
          --hero-a: #2e1f1c;
          --hero-b: #5b3d34;
          --track: #eeede8;
          --bad: #b3402e;
          --success: #15803d;
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

        .pitch-container {
          max-width: 1240px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .pitch-nav {
          background: var(--card);
          border-radius: 14px;
          padding: 10px 14px 10px 20px;
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
          gap: 24px;
        }

        .pitch-nav .links a {
          color: var(--muted);
          text-decoration: none;
          font-size: 0.9rem;
          font-weight: 500;
          transition: color 0.15s;
        }

        .pitch-nav .links a:hover {
          color: var(--ink);
        }

        @media (max-width: 860px) {
          .pitch-nav .links {
            display: none;
          }
        }

        .pitch-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 42px;
          padding: 0 18px;
          border-radius: 10px;
          font: 600 0.9rem/1 var(--font);
          text-decoration: none;
          border: 1px solid transparent;
          cursor: pointer;
          transition: all 0.15s;
        }

        .pitch-btn-accent {
          background: var(--accent);
          color: #ffffff;
          box-shadow: 0 2px 8px rgba(216, 59, 125, 0.25);
        }

        .pitch-btn-accent:hover {
          background: #c22c6c;
          color: #ffffff;
        }

        .pitch-btn-ghost {
          border-color: rgba(255, 255, 255, 0.4);
          color: #ffffff;
        }

        .pitch-btn-ghost:hover {
          background: rgba(255, 255, 255, 0.12);
        }

        .pitch-hero {
          border-radius: 20px;
          background: linear-gradient(125deg, var(--hero-a), var(--hero-b));
          color: #ffffff;
          padding: clamp(32px, 6vw, 68px) clamp(24px, 5vw, 48px);
          display: grid;
          grid-template-columns: minmax(0, 1.15fr) minmax(0, 0.85fr);
          gap: 40px;
          align-items: center;
          overflow: hidden;
        }

        @media (max-width: 920px) {
          .pitch-hero {
            grid-template-columns: minmax(0, 1fr);
          }
        }

        .pitch-hero h1 {
          font-weight: 500;
          letter-spacing: -0.035em;
          font-size: clamp(2.4rem, 5vw, 4.1rem);
          line-height: 1.06;
          margin: 0;
          text-wrap: balance;
        }

        .pitch-hero p.sub {
          color: rgba(255, 255, 255, 0.88);
          max-width: 48ch;
          margin-top: 20px;
          font-size: 1.05rem;
          line-height: 1.5;
        }

        .pitch-hero .ctas {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          margin-top: 28px;
        }

        .pitch-trust {
          margin-top: 36px;
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 0.86rem;
          color: rgba(255, 255, 255, 0.9);
        }

        .pitch-trust b {
          display: inline-grid;
          place-items: center;
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: var(--ink);
          color: #ffffff;
          font-weight: 700;
          font-size: 0.85rem;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .pitch-device {
          background: var(--card);
          color: var(--ink);
          border-radius: 22px;
          padding: 22px;
          box-shadow: 0 30px 60px -20px rgba(20, 20, 20, 0.35);
          border: 8px solid #231916;
        }

        .pitch-device .q {
          background: var(--surface);
          border-radius: 12px;
          padding: 12px 14px;
          font-size: 0.88rem;
          font-weight: 600;
        }

        .pitch-device .t {
          font-size: 0.78rem;
          color: var(--muted);
          margin: 16px 0 10px;
        }

        .pitch-mini {
          display: grid;
          grid-template-columns: minmax(80px, auto) minmax(0, 1fr) 40px;
          gap: 7px 10px;
          align-items: center;
          font-size: 0.78rem;
        }

        .pitch-mini .tr {
          height: 10px;
          background: var(--track);
          border-radius: 3px;
          position: relative;
        }

        .pitch-mini .tr i {
          position: absolute;
          inset: 0 auto 0 0;
          background: var(--accent);
          border-radius: 3px;
        }

        .pitch-mini .tr s {
          position: absolute;
          top: -4px;
          bottom: -4px;
          left: 69%;
          width: 2px;
          background: var(--bad);
        }

        .pitch-device .rec {
          margin-top: 16px;
          background: var(--accent-soft);
          border: 1px solid #fbcfe8;
          border-radius: 12px;
          padding: 12px 14px;
          font-size: 0.82rem;
          color: #831843;
        }

        .pitch-device .rec span {
          display: block;
          font-size: 0.66rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          font-weight: 700;
          margin-bottom: 4px;
          color: var(--accent);
        }

        .pitch-panel {
          background: var(--surface);
          border-radius: 20px;
          padding: clamp(28px, 5vw, 56px);
        }

        .panel-head {
          display: flex;
          flex-direction: column;
          gap: 14px;
          margin-bottom: 32px;
        }

        .split-head {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 24px;
          flex-wrap: wrap;
        }

        .eyebrow {
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--muted);
          margin: 0;
        }

        h2 {
          font-size: clamp(1.65rem, 3vw, 2.45rem);
          font-weight: 500;
          line-height: 1.16;
          letter-spacing: -0.025em;
          margin: 0;
          text-wrap: balance;
        }

        .lead {
          color: var(--muted);
          max-width: 58ch;
          font-size: 1.05rem;
          margin: 0;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
          gap: 14px;
          margin-top: 40px;
        }

        .stat-card {
          background: var(--card);
          border-radius: 14px;
          padding: 22px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          gap: 36px;
          min-height: 170px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
        }

        .stat-card b {
          font-size: 2.3rem;
          font-weight: 500;
          letter-spacing: -0.03em;
          line-height: 1;
          color: var(--ink);
        }

        .grid-3 {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 14px;
        }

        .grid-4 {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 14px;
        }

        @media (max-width: 900px) {
          .grid-3, .grid-4 {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 600px) {
          .grid-3, .grid-4, .stats-grid {
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
          font-size: 1.15rem;
          font-weight: 600;
          letter-spacing: -0.01em;
          margin: 0;
          line-height: 1.3;
        }

        .card p {
          color: var(--muted);
          font-size: 0.92rem;
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

        /* Interactive Simulator (Section #contoh) */
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
            <a href="#ekosistem">Ekosistem</a>
            <a href="#contoh">Coba Alur</a>
            <a href="#cara">Cara Kerja</a>
            <a href="#jadwal">Kesiapan Senin</a>
            <a href="#akses">Hak Akses</a>
          </div>
          <Link className="pitch-btn pitch-btn-accent" href="/dashboard">
            Buka Sistem Kantor
          </Link>
        </nav>

        {/* HERO SECTION DENGAN INTERACTIVE DEVICE PREVIEW */}
        <header className="pitch-hero" id="atas">
          <div>
            <h1>
              Bang Azri & Tim Bertanya.
              <br />
              Sistem El Massa Menjawab.
            </h1>
            <p className="sub">
              Satu ekosistem terpadu tempat Owner, Admin Kantor, Kasir Keuangan, Agen/Mitra Daerah, dan Jamaah terhubung real-time. Tanpa nota tercecer di WA, tanpa hitung komisi manual, dan tanpa selisih kas.
            </p>
            <div className="ctas">
              <Link className="pitch-btn pitch-btn-accent" href="/dashboard">
                Buka Sistem Kantor
              </Link>
              <Link className="pitch-btn pitch-btn-ghost" href="/my-elmassa" target="_blank">
                Tes Portal Agen My El Massa
              </Link>
              <a className="pitch-btn pitch-btn-ghost" href="#contoh">
                Coba Contoh Skenario
              </a>
            </div>
            <div className="pitch-trust">
              <b>100%</b>
              <span>Cloud Database Supabase • Seluruh Modul Siap Input Data Hari Senin</span>
            </div>
          </div>

          {/* SIMULATED DEVICE PREVIEW DI SISI KANAN */}
          <div className="pitch-device" aria-label="Contoh tampilan di tablet pimpinan">
            <p className="q">Berapa sisa kuota seat Paket Umrah 01 Oktober 2026 dan status kasir?</p>
            <p className="t">Paket Umrah 01 Oktober 2026 — Kuota Target 45 Pax</p>
            <div className="pitch-mini">
              <span>Terisi Seat</span>
              <span className="tr">
                <i style={{ width: "69%" }}></i>
                <s></s>
              </span>
              <span>31 Pax</span>
              <span>Sisa Kursi</span>
              <span className="tr">
                <i style={{ width: "31%", background: "var(--bad)" }}></i>
              </span>
              <span style={{ color: "var(--bad)", fontWeight: 700 }}>14 Seat</span>
              <span>Kasir (DP)</span>
              <span className="tr">
                <i style={{ width: "100%", background: "var(--success)" }}></i>
              </span>
              <span>Lunas</span>
            </div>
            <div className="rec">
              <span>Saran Sistem Otomatis</span>
              Kasir mengonfirmasi pembayaran DP, 31 Akun UmrahMe jamaah aktif otomatis. 14 Seat tersisa siap ditawarkan oleh mitra via My El Massa.
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
              <span style={{ fontSize: "0.82rem", color: "var(--muted)" }}>Surat Kemenag & invoice otomatis ber-kop surat resmi</span>
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
            <h2>Enam prinsip agar sistem aman, transparan & anti-bocor</h2>
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
              <p>Pusat kendali staf admin, kasir keuangan, dan operasional. Verifikasi DP, terbitkan invoice & kuitansi, cetak surat Kemenag, dan atur stok.</p>
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

        {/* SECTION 4: COBA SENDIRI (INTERACTIVE SIMULATOR) */}
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
            <div className="ans-card" aria-live="polite">
              <div>
                <h3>{activeScenario.title}</h3>
                <p className="sum">{activeScenario.sum}</p>

                {/* Render KPI Grid jika tipe skenario KPI */}
                {activeScenario.type === "kpis" && activeScenario.kpis && (
                  <div className="kpi-row">
                    {activeScenario.kpis.map((k) => (
                      <div key={k.label} className="kpi-card">
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
                      <div key={b.label} style={{ display: "grid", gridTemplateColumns: "180px minmax(0, 1fr) 110px", gap: "10px", alignItems: "center", fontSize: "0.82rem" }}>
                        <span style={{ fontWeight: 600 }}>{b.label}</span>
                        <div style={{ height: "10px", background: "var(--track)", borderRadius: "4px", position: "relative", overflow: "hidden" }}>
                          <div
                            style={{
                              position: "absolute",
                              inset: "0 auto 0 0",
                              width: `${Math.min(100, Math.round((b.val / b.max) * 100))}%`,
                              background: b.isLow ? "var(--bad)" : "var(--accent)",
                              borderRadius: "4px",
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

        {/* SECTION 5: CARA KERJANYA (5 LANGKAH OPERASIONAL) */}
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

        {/* SECTION 6: KESIAPAN HARI SENIN & ROADMAP */}
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

        {/* SECTION 7: MATRIKS HAK AKSES SISTEM */}
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

        {/* SECTION 8: CLOSING CALL TO ACTION BANNER */}
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
