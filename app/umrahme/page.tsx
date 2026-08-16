"use client";

import React, { useCallback, useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Users,
  CheckCircle2,
  PhoneCall,
  QrCode,
  Sliders,
  Send,
  Plus,
  Search,
  ShieldCheck,
  Smartphone,
  Copy,
  Check,
  X,
  CreditCard,
  Calendar,
  BookOpen,
  Compass,
  FileCheck,
  Bell,
  RefreshCw,
  FileSpreadsheet,
  Download,
  Eye,
  Edit3,
  MapPin,
  HeartPulse,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { broadcastJamaahUpdateFromAdmin } from "@/lib/syncBridge";

export type DetailedIssuedAccount = {
  id: string;
  nama: string;
  nomorJamaah: string;
  nik: string;
  paspor: string;
  tglLahirUsia: string;
  golonganDarah: string;
  telepon: string;
  kontakDarurat: string;
  alamatLengkap: string;
  batch: string;
  rombongan: string;
  bus: string;
  kamar: string;
  flight: string;
  eVisa: string;
  titikKumpul: string;
  status: "Aktif" | "Pending";
  tanggalTerbit: string;
};

const initialAccounts: DetailedIssuedAccount[] = [];

function AccountStatusBadge({ status }: { status: DetailedIssuedAccount["status"] }) {
  const isActive = status === "Aktif";
  const style = isActive
    ? { bg: "bg-emerald-50 text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500 animate-pulse" }
    : { bg: "bg-amber-50 text-amber-700", border: "border-amber-200", dot: "bg-amber-500" };

  return (
    <span
      className={`inline-flex items-center gap-1 font-mono text-[10px] px-2.5 py-0.5 rounded-full border font-bold ${style.bg} ${style.border}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
      {isActive ? "🟢 Aktif" : "🟡 Pending"}
    </span>
  );
}

export default function PenerbitanUmrahmePage() {
  const [accounts, setAccounts] = useState<DetailedIssuedAccount[]>(initialAccounts);
  const [searchQuery, setSearchQuery] = useState("");
  
  // License Quota States (Prepaid Saldo Lisensi Rp 35.000 / Jemaah)
  const [licenseCredits, setLicenseCredits] = useState<number>(0);
  const [quotaLoaded, setQuotaLoaded] = useState(false);

  /**
   * Saldo kuota lisensi dibaca dari server, tidak pernah ditulis dari sini.
   * Penambahan hanya lewat panel vendor UmrahMe (license_topup), pengurangan
   * terjadi otomatis di dalam transaksi penerbitan akun (license_consume).
   */
  const refreshQuota = useCallback(async () => {
    try {
      const res = await fetch("/api/umrahme/quota", { cache: "no-store" });
      const json = await res.json();
      if (json?.ok) setLicenseCredits(Number(json.data?.balance) || 0);
    } catch (e) {
      console.error("Gagal memuat kuota lisensi:", e);
    } finally {
      setQuotaLoaded(true);
    }
  }, []);
  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState<boolean>(false);
  const [isQuotaModalOpen, setIsQuotaModalOpen] = useState<boolean>(false);
  const [voucherCodeInput, setVoucherCodeInput] = useState<string>("");
  const [voucherMessage, setVoucherMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    // 1. Fetch from Supabase PostgreSQL API
    fetch("/api/umrahme/accounts")
      .then((res) => res.json())
      .then((res) => {
        if (res.ok && Array.isArray(res.data) && res.data.length > 0) {
          setAccounts(res.data);
          try {
            localStorage.setItem("el_massa_issued_accounts", JSON.stringify(res.data));
          } catch (e) {}
        } else {
          const savedAccounts = localStorage.getItem("el_massa_issued_accounts");
          if (savedAccounts) setAccounts(JSON.parse(savedAccounts));
        }
      })
      .catch(() => {
        const savedAccounts = localStorage.getItem("el_massa_issued_accounts");
        if (savedAccounts) setAccounts(JSON.parse(savedAccounts));
      });

    try {
      // Saldo kuota milik server. Versi lama membacanya dari localStorage dan
      // memberi 100 kuota gratis ke browser mana pun yang belum punya nilai --
      // artinya cukup buka incognito untuk menerbitkan akun tanpa membayar.
      void refreshQuota();
    } catch (e) {
      console.error("Failed reading initial storage:", e);
    }
  }, []);

  
  // Show detailed fields accordion in form
  const [showDetailFields, setShowDetailFields] = useState(false);

  const [batchOptions, setBatchOptions] = useState<string[]>([]);
  const [inputBatch, setInputBatch] = useState<string>("");

  // Load strictly user-created custom packages from localStorage (from Kalkulator HPP / Published Packages)
  useEffect(() => {
    try {
      const saved = localStorage.getItem("el_massa_published_packages");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const customNames = parsed.map((pkg: any) => {
            const rawName = pkg.name || pkg.packageName || "Paket Umrah";
            const cleanName = rawName.split("—")[0].split("(")[0].trim();
            const rawDate = pkg.departureDate || pkg.departuresDate || "";
            const cleanDate = rawDate.includes("s/d")
              ? rawDate.split("s/d")[0].trim()
              : rawDate.split("(")[0].trim() || "Terjadwal";
            return `${cleanName} (${cleanDate})`;
          });
          setBatchOptions(customNames);
          setInputBatch(customNames[0]);
          return;
        }
      }
      // If no custom package created by user yet
      const placeholder = ["-- Belum Ada Paket Terbit (Silakan Buat di Kalkulator HPP) --"];
      setBatchOptions(placeholder);
      setInputBatch(placeholder[0]);
    } catch (e) {
      console.error("Failed to parse el_massa_published_packages:", e);
      const placeholder = ["-- Belum Ada Paket Terbit (Silakan Buat di Kalkulator HPP) --"];
      setBatchOptions(placeholder);
      setInputBatch(placeholder[0]);
    }
  }, []);

  const [inputNama, setInputNama] = useState("");
  const [inputNik, setInputNik] = useState("");
  const [inputPaspor, setInputPaspor] = useState("");
  const [inputTglLahir, setInputTglLahir] = useState("");
  const [inputGolDarah, setInputGolDarah] = useState("O+ (Positif)");
  const [inputTelepon, setInputTelepon] = useState("");
  const [inputKontakDarurat, setInputKontakDarurat] = useState("");
  const [inputAlamat, setInputAlamat] = useState("");
  const [inputRombongan, setInputRombongan] = useState("Rombongan 01 (Bangka Belitung)");
  const [inputBus, setInputBus] = useState("Bus 01");
  const [inputKamar, setInputKamar] = useState("Kamar #408 (Quad)");
  const [inputFlight, setInputFlight] = useState("Garuda Indonesia GA-980 (CGK ➔ JED)");
  const [inputEVisa, setInputEVisa] = useState("EV-99210183 (Issued)");
  const [inputTitikKumpul, setInputTitikKumpul] = useState("Lobby Hotel Pullman Zamzam H-1 15 Menit Sebelum Adzan");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Bulk Excel Import States
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const [excelPreviewRows, setExcelPreviewRows] = useState<Partial<DetailedIssuedAccount>[]>([]);
  const [excelFileName, setExcelFileName] = useState("");
  const [isImportingExcel, setIsImportingExcel] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Modal View / Edit Detail State
  const [viewDetailModal, setViewDetailModal] = useState<DetailedIssuedAccount | null>(null);
  const [isEditingDetail, setIsEditingDetail] = useState(false);
  const [editingForm, setEditingForm] = useState<DetailedIssuedAccount | null>(null);

  // Success Created Modal
  const [successModal, setSuccessModal] = useState<{
    nama: string;
    nomorJamaah: string;
    batch: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  // Module Configuration Toggles
  const [modules, setModules] = useState({
    kartuDigital: true,
    itineraryAgenda: true,
    counterIbadah: true,
    bukuDoa: true,
    kontakPembimbing: true,
    jurnalKenangan: true,
    sertifikatDigital: false,
    broadcastPengumuman: true,
  });

  const [savedConfigSuccess, setSavedConfigSuccess] = useState(false);

  // Broadcast Announcement State
  const [broadcastJudul, setBroadcastJudul] = useState("");
  const [broadcastPesan, setBroadcastPesan] = useState("");
  const [broadcastType, setBroadcastType] = useState<"urgent" | "info" | "jadwal">("urgent");
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);

  function handleSendBroadcast(e: React.FormEvent) {
    e.preventDefault();
    if (!broadcastJudul.trim() || !broadcastPesan.trim()) return;

    const newBroadcast = {
      id: String(Date.now()),
      judul: broadcastJudul.trim(),
      pesan: broadcastPesan.trim(),
      type: broadcastType,
      waktu: "Baru saja",
    };

    try {
      const existing = JSON.parse(localStorage.getItem("el_massa_broadcasts") || "[]");
      localStorage.setItem("el_massa_broadcasts", JSON.stringify([newBroadcast, ...existing]));
    } catch (err) {
      console.warn("Broadcast save failed", err);
    }

    setBroadcastSuccess(true);
    setTimeout(() => {
      setBroadcastSuccess(false);
      setIsBroadcastModalOpen(false);
      setBroadcastJudul("");
      setBroadcastPesan("");
    }, 1500);
  }

  // Filter accounts
  const filteredAccounts = accounts.filter((acc) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      acc.nama.toLowerCase().includes(q) ||
      acc.nomorJamaah.toLowerCase().includes(q) ||
      acc.batch.toLowerCase().includes(q) ||
      acc.paspor.toLowerCase().includes(q) ||
      acc.nik.toLowerCase().includes(q) ||
      acc.rombongan.toLowerCase().includes(q)
    );
  });

  const activeAccountsCount = accounts.filter((acc) => acc.status === "Aktif").length;
  const pendingAccountsCount = accounts.length - activeAccountsCount;

  function handleGenerateAccount(e: React.FormEvent) {
    e.preventDefault();
    if (!inputNama.trim()) return;

    if (licenseCredits <= 0) {
      setIsQuotaModalOpen(true);
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const yr = new Date().getFullYear();
      const mo = String(new Date().getMonth() + 1).padStart(2, "0");
      const rnd = Math.floor(100 + Math.random() * 900);
      const generatedId = `JM-${yr}${mo}-${rnd}`;

      const newAcc: DetailedIssuedAccount = {
        id: String(Date.now()),
        nama: inputNama.trim(),
        nomorJamaah: generatedId,
        nik: inputNik.trim() || "-",
        paspor: inputPaspor.trim() || "-",
        tglLahirUsia: inputTglLahir.trim() || "-",
        golonganDarah: inputGolDarah,
        telepon: inputTelepon.trim() || "-",
        kontakDarurat: inputKontakDarurat.trim() || "-",
        alamatLengkap: inputAlamat.trim() || "-",
        batch: inputBatch,
        rombongan: inputRombongan.trim() || "-",
        bus: inputBus.trim() || "-",
        kamar: inputKamar.trim() || "-",
        flight: inputFlight.trim() || "-",
        eVisa: inputEVisa.trim() || "-",
        titikKumpul: inputTitikKumpul.trim() || "-",
        status: "Aktif",
        tanggalTerbit: "Hari ini",
      };

      setAccounts((prev) => {
        const updated = [newAcc, ...prev];
        try {
          localStorage.setItem("el_massa_issued_accounts", JSON.stringify(updated));
        } catch (err) {}
        return updated;
      });

      // Sync to Supabase PostgreSQL DB
      fetch("/api/umrahme/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAcc),
      }).catch((e) => console.error("Supabase sync error:", e));

      // Kuota sudah dipotong server saat akun diterbitkan; tinggal ambil sisanya.
      void refreshQuota();

      setSuccessModal({
        nama: inputNama.trim(),
        nomorJamaah: generatedId,
        batch: inputBatch,
      });

      // Reset Form
      setInputNama("");
      setInputNik("");
      setInputPaspor("");
      setInputTglLahir("");
      setInputTelepon("");
      setInputKontakDarurat("");
      setInputAlamat("");
      setIsSubmitting(false);
    }, 400);
  }

  // Handle Excel File Select & Simulated Parse
  function handleExcelFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setExcelFileName(file.name);
    setIsImportingExcel(true);

    // Simulate reading Excel file with smart parsed rows
    setTimeout(() => {
      const sampleParsedRows: Partial<DetailedIssuedAccount>[] = [
        {
          nama: "Budi Santoso",
          nik: "3515081204850002",
          paspor: "C8821901",
          telepon: "+62 812-9900-1122",
          rombongan: "Rombongan 01 (Bangka)",
          bus: "Bus 01",
          kamar: "Kamar #402 (Quad)",
        },
        {
          nama: "Hj. Mariam Ulfah",
          nik: "3515085409870001",
          paspor: "C8821902",
          telepon: "+62 812-9900-3344",
          rombongan: "Rombongan 01 (Bangka)",
          bus: "Bus 01",
          kamar: "Kamar #405 (Triple)",
        },
        {
          nama: "Drs. H. Mulyadi",
          nik: "3171092003750005",
          paspor: "C8821903",
          telepon: "+62 812-9900-5566",
          rombongan: "Rombongan 02 (Palembang)",
          bus: "Bus 02",
          kamar: "Kamar #508 (Double)",
        },
        {
          nama: "Siti Nurhaliza",
          nik: "1671046101920003",
          paspor: "C8821904",
          telepon: "+62 812-9900-7788",
          rombongan: "Rombongan 02 (Palembang)",
          bus: "Bus 02",
          kamar: "Kamar #508 (Double)",
        },
      ];
      setExcelPreviewRows(sampleParsedRows);
      setIsImportingExcel(false);
    }, 600);
  }

  // Confirm Bulk Excel Import
  function handleConfirmExcelImport() {
    if (excelPreviewRows.length === 0) return;

    if (excelPreviewRows.length > licenseCredits) {
      alert(
        `⚠️ Saldo Kuota Lisensi Anda (${licenseCredits} kuota tersisa) tidak mencukupi untuk mengimpor ${excelPreviewRows.length} jemaah sekaligus. Silakan Top Up saldo kuota terlebih dahulu.`
      );
      setIsQuotaModalOpen(true);
      return;
    }

    const yr = new Date().getFullYear();
    const mo = String(new Date().getMonth() + 1).padStart(2, "0");

    const newBulkAccounts: DetailedIssuedAccount[] = excelPreviewRows.map((r, idx) => {
      const rnd = Math.floor(100 + Math.random() * 900) + idx;
      const generatedId = `JM-${yr}${mo}-${rnd}`;
      return {
        id: String(Date.now() + idx),
        nama: r.nama || "Jamaah Import",
        nomorJamaah: generatedId,
        nik: r.nik || "317409" + Math.floor(1000000000 + Math.random() * 9000000000),
        paspor: r.paspor || "C9824" + (100 + idx),
        tglLahirUsia: "12 Mar 1987 (39 Tahun)",
        golonganDarah: "O+ (Positif)",
        telepon: r.telepon || "+62 812-0000-000" + idx,
        kontakDarurat: "+62 812-9999-8888 (Keluarga)",
        alamatLengkap: "Alamat Jamaah Import Excel",
        batch: inputBatch,
        rombongan: r.rombongan || "Rombongan 01",
        bus: r.bus || "Bus 01",
        kamar: r.kamar || "Kamar Quad",
        flight: "Garuda Indonesia GA-980",
        eVisa: "EV-9921" + (100 + idx) + " (Issued)",
        titikKumpul: "Lobby Hotel H-1 15 Menit Sebelum Adzan",
        status: "Aktif",
        tanggalTerbit: "Hari ini (Bulk Import)",
      };
    });

    setAccounts((prev) => {
      const updated = [...newBulkAccounts, ...prev];
      try {
        localStorage.setItem("el_massa_issued_accounts", JSON.stringify(updated));
      } catch (err) {}
      return updated;
    });

    // Sync bulk accounts to Supabase PostgreSQL DB
    fetch("/api/umrahme/accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newBulkAccounts),
    }).catch((e) => console.error("Supabase bulk sync error:", e));

    void refreshQuota();

    setIsExcelModalOpen(false);
    setExcelPreviewRows([]);
    setExcelFileName("");
    alert(`🎉 ${newBulkAccounts.length} Akun Digital UmrahMe berhasil di-generate! (-${newBulkAccounts.length} kuota lisensi)`);
  }

  function handleRedeemVoucher(e: React.FormEvent) {
    e.preventDefault();
    const code = voucherCodeInput.trim().toUpperCase();
    if (!code) return;

    let addedCredits = 0;
    if (code === "ELMASSA-TOPUP-100" || code === "TOPUP100") {
      addedCredits = 100;
    } else if (code === "ELMASSA-TOPUP-300" || code === "TOPUP300") {
      addedCredits = 300;
    } else if (code === "ELMASSA-TOPUP-50" || code === "TOPUP50") {
      addedCredits = 50;
    } else if (code === "DEVELOPER-TEST" || code === "DEV100") {
      addedCredits = 100;
    }

    // Penambahan kuota hanya boleh dari panel vendor UmrahMe (license_topup).
    // Voucher yang menambah saldo dari sisi travel dimatikan: selama itu ada,
    // kuota berbayar bisa diterbitkan sendiri tanpa membeli.
    if (false) {
      setVoucherCodeInput("");
    } else {
      setVoucherMessage({
        type: "error",
        text: "❌ Kode voucher top up tidak valid atau sudah digunakan.",
      });
    }
  }

  // Download Excel Template
  function handleDownloadTemplate() {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Nama Jamaah,NIK (16 Digit),No. Paspor,No. Telepon,Rombongan,No. Bus,No. Kamar,Catatan Kesehatan\n" +
      "Budi Santoso,3515081204850002,C8821901,+62 812-9900-1122,Rombongan 01,Bus 01,Kamar #402,Sehat\n" +
      "Hj. Siti Rahmawati,3515085409870001,C8821902,+62 812-9900-3344,Rombongan 01,Bus 01,Kamar #408,Sehat\n";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Template_Bulk_Import_Jamaah_UmrahMe.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function toggleModule(key: keyof typeof modules) {
    setModules((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function handleSaveModuleConfig() {
    setSavedConfigSuccess(true);
    setTimeout(() => setSavedConfigSuccess(false), 3000);
  }

  return (
    <AppShell eyebrow="OPERASIONAL" title="Penerbitan & Pengaturan Akun Digital UmrahMe">
      <div className="space-y-6 pb-12 font-sans">

        {/* 🚀 TOP HEADER HERO CARD */}
        <section className="relative overflow-hidden rounded-3xl bg-[#be185d] p-6 sm:p-8 text-white shadow-xl border border-pink-700/40 space-y-6">
          {/* Top Row: Title & Stat Box */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <img
                src="/umrahme-logo.png"
                alt="UmrahMe Logo"
                className="h-10 sm:h-12 w-auto object-contain drop-shadow"
              />
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Penerbitan & Detail Akun Digital Jamaah
              </h1>
              <p className="text-xs sm:text-sm text-pink-100/90 leading-relaxed">
                Kelola data informasi lengkap jamaah, terbitkan akun digital secara manual atau bulk import via Excel, dan atur modul fitur aplikasi jamaah El Massa.
              </p>
            </div>

            {/* Stat Box (Top Right) */}
            <div className="shrink-0 self-start">
              <div className="rounded-2xl bg-white/10 backdrop-blur-md p-4 px-6 border border-white/20 text-center min-w-[130px] shadow-sm">
                <p className="text-3xl font-black text-white leading-none">{accounts.length}</p>
                <p className="text-[10px] uppercase font-extrabold text-pink-200 tracking-wider mt-1.5">
                  Akun Diterbitkan
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Row: Action Buttons Toolbar */}
          <div className="pt-4 border-t border-white/15 flex flex-wrap items-center gap-3">
            <a
              href="https://umrahme-elmassa.vercel.app/login"
              target="_blank"
              rel="noopener noreferrer"
              className="h-11 px-5 rounded-2xl bg-white hover:bg-rose-50 text-stone-900 font-black text-xs flex items-center justify-center gap-2 shadow-xl transition active:scale-95 group cursor-pointer border border-pink-200"
            >
              <Smartphone className="h-4 w-4 text-pink-600 group-hover:scale-110 transition-transform" />
              <span>Buka App Jemaah (Uji Login) ↗</span>
            </a>

            <button
              type="button"
              onClick={() => setIsBroadcastModalOpen(true)}
              className="h-11 px-4 rounded-2xl bg-amber-400 hover:bg-amber-500 text-stone-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg transition active:scale-95 cursor-pointer"
            >
              <Bell className="h-4 w-4" />
              <span>Broadcast Pengumuman</span>
            </button>

            <button
              type="button"
              onClick={() => setIsExcelModalOpen(true)}
              className="h-11 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-stone-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg transition active:scale-95 cursor-pointer"
            >
              <FileSpreadsheet className="h-4 w-4" />
              <span>Bulk Import Excel</span>
            </button>
          </div>
        </section>

        {/* 🪙 SLEEK & COMPACT OUTLINE BAR: SALDO LISENSI UMRAHME */}
        <section className="rounded-2xl border-2 border-stone-200 bg-white px-4 sm:px-5 py-3 text-stone-900 shadow-xs">
          <div className="flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
            {/* Left: Icon & Compact Credits */}
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-pink-50 border border-pink-200 text-pink-600 flex items-center justify-center shrink-0">
                <CreditCard className="h-4 w-4" />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black text-stone-900 tracking-tight">
                  Saldo Lisensi:{" "}
                  <span
                    className={`text-pink-600 font-black ${
                      licenseCredits <= 5 ? "text-rose-600 animate-pulse" : ""
                    }`}
                  >
                    {licenseCredits} Kuota
                  </span>
                </span>
                <span className="text-[10px] text-stone-400 font-medium">
                  (Rp 35.000 / Jemaah)
                </span>
              </div>
            </div>

            {/* Right: Compact Stats & Top Up Button */}
            <div className="flex items-center gap-3 ml-auto">
              <span className="text-[11px] text-stone-500 font-medium hidden md:inline">
                Terbit: <strong className="text-stone-900 font-extrabold">{accounts.length} Jemaah</strong>
              </span>
              <button
                type="button"
                onClick={() => setIsTopUpModalOpen(true)}
                className="h-8 px-3.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-extrabold text-[11px] flex items-center justify-center gap-1.5 shadow-xs transition active:scale-95 cursor-pointer shrink-0"
              >
                <Plus className="h-3.5 w-3.5 stroke-[3]" />
                <span>Top Up Saldo</span>
              </button>
            </div>
          </div>

          {licenseCredits <= 0 && (
            <p className="text-[11px] text-rose-600 font-bold mt-2 pt-2 border-t border-rose-100 flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5 text-rose-500 shrink-0" />
              <span>Saldo lisensi habis (0 tersisa). Penerbitan akun baru terkunci hingga dilakukan Top Up.</span>
            </p>
          )}
        </section>

        {/* 🗂️ GRID 2 KOLOM: FORM PENERBITAN (KIRI) & PENGATURAN MODUL (KANAN) */}
        <div className="grid lg:grid-cols-12 gap-6 items-start">

          {/* ⚡ LEFT FORM: FORM PENERBITAN AKUN JAMAAH BARU */}
          <section className="lg:col-span-7 rounded-3xl border border-stone-200/80 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-pink-50 text-pink-600 border border-pink-200">
                  <Plus className="h-5 w-5 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-stone-900">Terbitkan Akun Jamaah (Single Input)</h3>
                  <p className="text-xs text-stone-500 font-normal">Input data personal & keberangkatan jamaah secara lengkap.</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsExcelModalOpen(true)}
                className="text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-xl transition flex items-center gap-1.5"
              >
                <FileSpreadsheet className="h-3.5 w-3.5" />
                <span>Bulk Excel</span>
              </button>
            </div>

            <form onSubmit={handleGenerateAccount} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-stone-800 uppercase tracking-wider block">
                  Nama Lengkap Jamaah *
                </label>
                <input
                  type="text"
                  required
                  value={inputNama}
                  onChange={(e) => setInputNama(e.target.value)}
                  placeholder="cth. H. Rusli Suparman"
                  className="w-full h-11 px-4 rounded-xl border border-stone-200 bg-stone-50 text-xs font-bold text-stone-900 placeholder:text-stone-300 focus:outline-none focus:border-pink-500 focus:bg-white transition"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-stone-800 uppercase tracking-wider block">
                    No. Paspor RI
                  </label>
                  <input
                    type="text"
                    value={inputPaspor}
                    onChange={(e) => setInputPaspor(e.target.value)}
                    placeholder="cth. C9824101"
                    className="w-full h-11 px-4 rounded-xl border border-stone-200 bg-stone-50 text-xs font-mono font-bold text-stone-900 placeholder:text-stone-300 focus:outline-none focus:border-pink-500 focus:bg-white transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-stone-800 uppercase tracking-wider block">
                    Paket Keberangkatan *
                  </label>
                  <select
                    value={inputBatch}
                    onChange={(e) => setInputBatch(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl border border-stone-200 bg-stone-50 text-xs font-bold text-stone-900 focus:outline-none focus:border-pink-500 focus:bg-white transition"
                  >
                    {batchOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Accordion Toggle: Detailed Optional Fields */}
              <button
                type="button"
                onClick={() => setShowDetailFields((v) => !v)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-pink-600 hover:text-pink-700 pt-1"
              >
                {showDetailFields ? (
                  <>
                    <ChevronUp className="h-4 w-4" />
                    <span>− Sembunyikan Detail Informasi Tambahan</span>
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4" />
                    <span>+ Input Detail Tambahan (NIK, Alamat, No. HP, Kamar, Bus, E-Visa)</span>
                  </>
                )}
              </button>

              {showDetailFields && (
                <div className="space-y-4 pt-2 border-t border-stone-100 animate-fade-up">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-stone-500 uppercase">NIK KTP (16 Digit)</label>
                      <input
                        type="text"
                        value={inputNik}
                        onChange={(e) => setInputNik(e.target.value)}
                        placeholder="3174092108850003"
                        className="w-full h-10 px-3 rounded-lg border border-stone-200 bg-stone-50 text-xs font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-stone-500 uppercase">No. Telepon / WA</label>
                      <input
                        type="text"
                        value={inputTelepon}
                        onChange={(e) => setInputTelepon(e.target.value)}
                        placeholder="+62 812-3456-7890"
                        className="w-full h-10 px-3 rounded-lg border border-stone-200 bg-stone-50 text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-stone-500 uppercase">No. Bus</label>
                      <input
                        type="text"
                        value={inputBus}
                        onChange={(e) => setInputBus(e.target.value)}
                        placeholder="Bus 01"
                        className="w-full h-10 px-3 rounded-lg border border-stone-200 bg-stone-50 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-stone-500 uppercase">No. Kamar Hotel</label>
                      <input
                        type="text"
                        value={inputKamar}
                        onChange={(e) => setInputKamar(e.target.value)}
                        placeholder="Kamar #408 (Quad)"
                        className="w-full h-10 px-3 rounded-lg border border-stone-200 bg-stone-50 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-stone-500 uppercase">No. E-Visa KSA</label>
                      <input
                        type="text"
                        value={inputEVisa}
                        onChange={(e) => setInputEVisa(e.target.value)}
                        placeholder="EV-99210183"
                        className="w-full h-10 px-3 rounded-lg border border-stone-200 bg-stone-50 text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-500 uppercase">Alamat Rumah Lengkap</label>
                    <input
                      type="text"
                      value={inputAlamat}
                      onChange={(e) => setInputAlamat(e.target.value)}
                      placeholder="Jl. Senopati No. 45, Kebayoran Baru, Jakarta Selatan"
                      className="w-full h-10 px-3 rounded-lg border border-stone-200 bg-stone-50 text-xs"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || !inputNama.trim()}
                className="w-full h-12 rounded-2xl bg-[#be185d] hover:bg-[#9d174d] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md transition active:scale-[0.98] disabled:opacity-50"
              >
                {isSubmitting ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                <span>Terbitkan & Auto-Generate Akun UmrahMe</span>
              </button>
            </form>
          </section>

          {/* ⚙️ RIGHT CONFIG: PENGATURAN MODUL APLIKASI JAMAAH */}
          <section className="lg:col-span-5 rounded-3xl border border-stone-200/80 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div className="flex items-center gap-3">
                <img src="/umrahme-logo.png" alt="UmrahMe Logo" className="h-8 w-auto object-contain shrink-0" />
                <div>
                  <h3 className="text-base font-extrabold text-stone-900">Modul Fitur UmrahMe</h3>
                  <p className="text-xs text-stone-500 font-normal">Atur fitur apa saja yang aktif untuk jamaah.</p>
                </div>
              </div>
            </div>

            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1 text-xs">
              
              <div className="flex items-center justify-between p-3 rounded-2xl border border-stone-100 bg-stone-50/60">
                <div className="flex items-center gap-2.5">
                  <CreditCard className="h-4 w-4 text-pink-600" />
                  <div>
                    <p className="font-bold text-stone-900">Kartu Digital & E-Visa</p>
                    <p className="text-[10px] text-stone-500">Tampilkan NIK, Paspor, & E-Visa</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={modules.kartuDigital}
                  onChange={() => toggleModule("kartuDigital")}
                  className="h-4 w-4 rounded accent-pink-600 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl border border-stone-100 bg-stone-50/60">
                <div className="flex items-center gap-2.5">
                  <Calendar className="h-4 w-4 text-pink-600" />
                  <div>
                    <p className="font-bold text-stone-900">Itinerary & Agenda Realtime</p>
                    <p className="text-[10px] text-stone-500">Jadwal terbang & hotel Makkah/Madinah</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={modules.itineraryAgenda}
                  onChange={() => toggleModule("itineraryAgenda")}
                  className="h-4 w-4 rounded accent-pink-600 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl border border-stone-100 bg-stone-50/60">
                <div className="flex items-center gap-2.5">
                  <Compass className="h-4 w-4 text-pink-600" />
                  <div>
                    <p className="font-bold text-stone-900">Counter Ibadah (Tawaf & Sa'i)</p>
                    <p className="text-[10px] text-stone-500">Penghitung putaran & doa otomatis</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={modules.counterIbadah}
                  onChange={() => toggleModule("counterIbadah")}
                  className="h-4 w-4 rounded accent-pink-600 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl border border-stone-100 bg-stone-50/60">
                <div className="flex items-center gap-2.5">
                  <BookOpen className="h-4 w-4 text-pink-600" />
                  <div>
                    <p className="font-bold text-stone-900">Buku Doa & Manasik Interaktif</p>
                    <p className="text-[10px] text-stone-500">Kumpulan doa umrah lengkap</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={modules.bukuDoa}
                  onChange={() => toggleModule("bukuDoa")}
                  className="h-4 w-4 rounded accent-pink-600 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl border border-stone-100 bg-stone-50/60">
                <div className="flex items-center gap-2.5">
                  <PhoneCall className="h-4 w-4 text-pink-600" />
                  <div>
                    <p className="font-bold text-stone-900">Kontak Muthowwif & Tour Leader</p>
                    <p className="text-[10px] text-stone-500">Call button & WA pembimbing</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={modules.kontakPembimbing}
                  onChange={() => toggleModule("kontakPembimbing")}
                  className="h-4 w-4 rounded accent-pink-600 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl border border-stone-100 bg-stone-50/60">
                <div className="flex items-center gap-2.5">
                  <FileCheck className="h-4 w-4 text-emerald-600" />
                  <div>
                    <p className="font-bold text-stone-900">Jurnal & Galeri Kenangan</p>
                    <p className="text-[10px] text-emerald-700 font-semibold">✓ Terbuka (Jamaah bisa isi)</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={modules.jurnalKenangan}
                  onChange={() => toggleModule("jurnalKenangan")}
                  className="h-4 w-4 rounded accent-pink-600 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl border border-stone-100 bg-stone-50/60">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="h-4 w-4 text-amber-600" />
                  <div>
                    <p className="font-bold text-stone-900">Sertifikat Umrah Digital</p>
                    <p className="text-[10px] text-amber-700 font-semibold">🔒 Terkunci sampai fase selesai</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={modules.sertifikatDigital}
                  onChange={() => toggleModule("sertifikatDigital")}
                  className="h-4 w-4 rounded accent-pink-600 cursor-pointer"
                />
              </div>

            </div>

            <button
              type="button"
              onClick={handleSaveModuleConfig}
              className="w-full h-10 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold flex items-center justify-center gap-2 transition"
            >
              {savedConfigSuccess ? (
                <>
                  <Check className="h-4 w-4 text-emerald-400" />
                  <span className="text-emerald-400">Konfigurasi Tersimpan!</span>
                </>
              ) : (
                <span>💾 Simpan Konfigurasi Modul</span>
              )}
            </button>
          </section>

        </div>

        {/* 📋 DAFTAR AKUN DIGITAL UMRAHME DITERBITKAN */}
        <section className="rounded-3xl border border-stone-200/80 bg-white p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-stone-900">Daftar Akun Digital UmrahMe Diterbitkan</h3>
                <span className="font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  🟢 {activeAccountsCount} Akun Aktif
                </span>
                {pendingAccountsCount > 0 && (
                  <span className="font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                    🟡 {pendingAccountsCount} Pending
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-500">Klik 'Detail' untuk melihat/mengedit informasi lengkap personal & keberangkatan jamaah.</p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-3 h-4 w-4 text-stone-400" />
              <input
                type="text"
                placeholder="Cari jamaah, paspor, NIK, ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-9 pr-4 rounded-xl border border-stone-200 bg-stone-50 text-xs font-medium focus:outline-none focus:border-pink-500 focus:bg-white transition"
              />
            </div>
          </div>

          {/* Kartu mobile -- tabel akun di bawah butuh 760px */}
          <div className="block space-y-3 md:hidden">
            {filteredAccounts.length === 0 ? (
              <p className="py-8 text-center text-xs text-stone-400">Tidak ada data akun digital ditemukan.</p>
            ) : (
              filteredAccounts.map((acc) => (
                <div key={acc.id} className="space-y-2.5 rounded-2xl border border-stone-200/80 bg-white p-4 shadow-2xs">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h4 className="truncate text-xs font-bold text-stone-900">{acc.nama}</h4>
                      <p className="truncate font-mono text-[10px] font-bold text-pink-600">{acc.nomorJamaah}</p>
                    </div>
                    <div className="shrink-0">
                      <AccountStatusBadge status={acc.status} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 rounded-xl border border-stone-100 bg-stone-50 p-2.5 text-[11px]">
                    <div className="min-w-0">
                      <span className="block text-[10px] font-medium text-stone-400">Paspor RI</span>
                      <span className="block truncate font-mono font-bold text-stone-800">{acc.paspor}</span>
                      <span className="block truncate font-mono text-[10px] text-stone-400">{acc.nik}</span>
                    </div>
                    <div className="min-w-0">
                      <span className="block text-[10px] font-medium text-stone-400">Rombongan</span>
                      <span className="block truncate font-bold text-stone-800">{acc.rombongan}</span>
                      <span className="block truncate text-[10px] text-stone-500">{acc.bus} • {acc.kamar}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 border-t border-stone-100 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setViewDetailModal(acc);
                        setIsEditingDetail(false);
                        setEditingForm(acc);
                      }}
                      className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl bg-stone-100 text-[11px] font-bold text-stone-700 transition active:bg-stone-200"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Detail
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setViewDetailModal(acc);
                        setIsEditingDetail(true);
                        setEditingForm(acc);
                      }}
                      className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl border border-pink-200 bg-pink-50 text-[11px] font-bold text-pink-700 transition active:bg-pink-100"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      Edit
                    </button>

                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(
                        `Assalamu'alaikum Wr. Wb. Bpk/Ibu *${acc.nama}*,\n\nAkun Digital UmrahMe Anda telah aktif resmi dari *El Massa Travel*:\n\n👤 *Nama*: ${acc.nama}\n💳 *ID Jamaah*: ${acc.nomorJamaah}\n🌐 *Link Login*: https://elmassa-administration.vercel.app/login\n\nSilakan masukkan Nama Lengkap Anda di atas untuk mengakses Kartu Digital & Panduan Umrah Anda.`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 text-[11px] font-bold text-white shadow-2xs transition active:bg-emerald-700"
                    >
                      <Send className="h-3.5 w-3.5" />
                      Kirim WA
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="hidden overflow-x-auto rounded-2xl border border-stone-200/70 md:block">
            <table className="w-full min-w-[760px] text-left text-xs">
              <thead>
                <tr className="border-b border-stone-200/70 bg-stone-50/80 font-bold text-stone-600 uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Nama Jamaah & ID</th>
                  <th className="py-3 px-3">NIK & Paspor RI</th>
                  <th className="py-3 px-3">Rombongan / Bus / Kamar</th>
                  <th className="py-3 px-3">Status Akun</th>
                  <th className="py-3 px-3">Metode Login</th>
                  <th className="py-3 px-4 text-right">Aksi Kredensial</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-medium">
                {filteredAccounts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-stone-400">
                      Tidak ada data akun digital ditemukan.
                    </td>
                  </tr>
                ) : (
                  filteredAccounts.map((acc) => (
                    <tr key={acc.id} className="hover:bg-stone-50/60 transition">
                      <td className="py-3.5 px-4">
                        <div>
                          <p className="font-bold text-stone-900">{acc.nama}</p>
                          <p className="font-mono text-[10px] text-pink-600 font-bold">{acc.nomorJamaah}</p>
                        </div>
                      </td>

                      <td className="py-3.5 px-3">
                        <p className="font-mono text-stone-800 font-bold">{acc.paspor}</p>
                        <p className="font-mono text-[10px] text-stone-400">{acc.nik}</p>
                      </td>

                      <td className="py-3.5 px-3 text-stone-600 max-w-[220px]">
                        <p className="font-bold text-stone-800 truncate">{acc.rombongan}</p>
                        <p className="text-[10px] text-stone-500">{acc.bus} • {acc.kamar}</p>
                      </td>

                      <td className="py-3.5 px-3">
                        <AccountStatusBadge status={acc.status} />
                      </td>

                      <td className="py-3.5 px-3">
                        <span className="text-[10px] font-bold text-stone-700 bg-stone-100 px-2 py-0.5 rounded-md">
                          Input Nama Jamaah
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right space-x-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setViewDetailModal(acc);
                            setIsEditingDetail(false);
                            setEditingForm(acc);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-[11px] transition"
                        >
                          <Eye className="h-3 w-3" />
                          <span>Detail</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setViewDetailModal(acc);
                            setIsEditingDetail(true);
                            setEditingForm(acc);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-700 border border-pink-200 font-bold text-[11px] transition"
                        >
                          <Edit3 className="h-3 w-3" />
                          <span>Edit</span>
                        </button>

                        <a
                          href={`https://wa.me/?text=${encodeURIComponent(
                            `Assalamu'alaikum Wr. Wb. Bpk/Ibu *${acc.nama}*,\n\nAkun Digital UmrahMe Anda telah aktif resmi dari *El Massa Travel*:\n\n👤 *Nama*: ${acc.nama}\n💳 *ID Jamaah*: ${acc.nomorJamaah}\n🌐 *Link Login*: https://elmassa-administration.vercel.app/login\n\nSilakan masukkan Nama Lengkap Anda di atas untuk mengakses Kartu Digital & Panduan Umrah Anda.`
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-2xs transition"
                        >
                          <Send className="h-3 w-3" />
                          <span>Kirim WA</span>
                        </a>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

      </div>

      {/* 📊 MODAL BULK EXCEL IMPORT */}
      {isExcelModalOpen && (
        <div className="fixed inset-0 z-50 el-modal flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs font-sans">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-stone-200 space-y-5 animate-fade-up">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200">
                  <FileSpreadsheet className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-stone-900">Bulk Import Jamaah via Excel (.xlsx/.csv)</h3>
                  <p className="text-xs text-stone-500">Upload file Excel data jamaah untuk auto-generate akun secara masal.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsExcelModalOpen(false)}
                className="h-8 w-8 grid place-items-center rounded-full hover:bg-stone-100 text-stone-400"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Drag & Drop Upload Zone */}
            <div className="space-y-3">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-stone-200 rounded-2xl p-6 text-center bg-stone-50 hover:bg-emerald-50/30 hover:border-emerald-300 transition cursor-pointer space-y-2"
              >
                <FileSpreadsheet className="h-10 w-10 text-emerald-600 mx-auto" />
                <p className="text-xs font-bold text-stone-800">
                  {excelFileName ? `File Terpilih: ${excelFileName}` : "Klik untuk Pilih File Excel / CSV (.xlsx, .csv)"}
                </p>
                <p className="text-[10px] text-stone-400">AI akan membaca & mencocokkan kolom Nama, NIK, Paspor, Rombongan, Bus, & Kamar.</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleExcelFileChange}
                  className="hidden"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="text-xs font-bold text-pink-600 hover:text-pink-700 underline flex items-center gap-1"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Unduh Template Format Excel (.csv)</span>
                </button>
              </div>
            </div>

            {/* Preview Rows Table */}
            {isImportingExcel ? (
              <div className="py-8 text-center space-y-2">
                <RefreshCw className="h-6 w-6 text-emerald-600 animate-spin mx-auto" />
                <p className="text-xs font-bold text-stone-700">Membaca file Excel & memetakan kolom jamaah...</p>
              </div>
            ) : excelPreviewRows.length > 0 ? (
              <div className="space-y-3">
                <p className="text-xs font-extrabold text-stone-800">
                  {excelPreviewRows.length} Jamaah Terbaca dari File Excel:
                </p>
                <div className="max-h-48 overflow-y-auto rounded-xl border border-stone-200 text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-stone-100 text-[10px] uppercase font-bold text-stone-500 sticky top-0">
                      <tr>
                        <th className="p-2">Nama</th>
                        <th className="p-2">NIK</th>
                        <th className="p-2">Paspor</th>
                        <th className="p-2">Rombongan</th>
                        <th className="p-2">Kamar</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 font-medium">
                      {excelPreviewRows.map((r, i) => (
                        <tr key={i}>
                          <td className="p-2 font-bold text-stone-900">{r.nama}</td>
                          <td className="p-2 font-mono text-stone-600">{r.nik}</td>
                          <td className="p-2 font-mono text-stone-600">{r.paspor}</td>
                          <td className="p-2 text-stone-700">{r.rombongan}</td>
                          <td className="p-2 text-stone-700">{r.kamar}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handleConfirmExcelImport}
                    className="flex-1 h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-md"
                  >
                    ⚡ Terbitkan Bulk {excelPreviewRows.length} Akun UmrahMe
                  </button>
                  <button
                    type="button"
                    onClick={() => { setExcelPreviewRows([]); setExcelFileName(""); }}
                    className="h-11 px-4 rounded-xl border border-stone-200 text-stone-600 font-bold text-xs"
                  >
                    Batal
                  </button>
                </div>
              </div>
            ) : null}

          </div>
        </div>
      )}

      {/* 👁️ MODAL DETAIL LENGKAP & EDIT JAMAAH */}
      {viewDetailModal && editingForm && (
        <div className="fixed inset-0 z-50 el-modal flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs font-sans">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-stone-200 space-y-5 animate-fade-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-pink-50 text-pink-600 border border-pink-200">
                  {isEditingDetail ? <Edit3 className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-stone-900">
                    {isEditingDetail ? `Edit Data: ${editingForm.nama}` : viewDetailModal.nama}
                  </h3>
                  <p className="text-xs font-mono font-bold text-pink-600">
                    {viewDetailModal.nomorJamaah} • {viewDetailModal.status}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {!isEditingDetail ? (
                  <button
                    type="button"
                    onClick={() => setIsEditingDetail(true)}
                    className="h-9 px-3.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs transition"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    <span>Edit Informasi</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsEditingDetail(false)}
                    className="h-9 px-3 rounded-xl border border-stone-200 text-stone-600 font-bold text-xs hover:bg-stone-50"
                  >
                    Batal Edit
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setViewDetailModal(null);
                    setIsEditingDetail(false);
                  }}
                  className="h-8 w-8 grid place-items-center rounded-full hover:bg-stone-100 text-stone-400"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* IF EDITING MODE IS ACTIVE: EDIT FORM */}
            {isEditingDetail ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setAccounts((prev) => {
                    const updated = prev.map((acc) => (acc.id === editingForm.id ? editingForm : acc));
                    try {
                      localStorage.setItem("el_massa_issued_accounts", JSON.stringify(updated));
                    } catch (err) {}
                    return updated;
                  });
                  broadcastJamaahUpdateFromAdmin({
                    id: editingForm.id,
                    nomorJamaah: editingForm.nomorJamaah,
                    nama: editingForm.nama,
                    kamar: editingForm.kamar,
                    bus: editingForm.bus,
                    flight: editingForm.flight,
                    rombongan: editingForm.rombongan,
                    eVisa: editingForm.eVisa,
                  });
                  setViewDetailModal(editingForm);
                  setIsEditingDetail(false);
                }}
                className="space-y-4 text-xs"
              >
                <div className="rounded-2xl border border-pink-200/80 bg-rose-50/30 p-4 space-y-3">
                  <span className="text-[10px] font-bold text-pink-700 uppercase tracking-wider block">
                    EDIT INFORMASI IDENTITAS PERSONAL
                  </span>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-stone-500 block mb-1">Nama Lengkap</label>
                      <input
                        type="text"
                        value={editingForm.nama}
                        onChange={(e) => setEditingForm({ ...editingForm, nama: e.target.value })}
                        className="w-full h-9 px-3 rounded-lg border border-stone-200 bg-white font-bold text-stone-900"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-stone-500 block mb-1">NIK KTP (16 Digit)</label>
                      <input
                        type="text"
                        value={editingForm.nik}
                        onChange={(e) => setEditingForm({ ...editingForm, nik: e.target.value })}
                        className="w-full h-9 px-3 rounded-lg border border-stone-200 bg-white font-mono text-stone-900"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-stone-500 block mb-1">No. Paspor RI</label>
                      <input
                        type="text"
                        value={editingForm.paspor}
                        onChange={(e) => setEditingForm({ ...editingForm, paspor: e.target.value })}
                        className="w-full h-9 px-3 rounded-lg border border-stone-200 bg-white font-mono text-stone-900"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-stone-500 block mb-1">Tgl Lahir & Usia</label>
                      <input
                        type="text"
                        value={editingForm.tglLahirUsia}
                        onChange={(e) => setEditingForm({ ...editingForm, tglLahirUsia: e.target.value })}
                        className="w-full h-9 px-3 rounded-lg border border-stone-200 bg-white font-bold text-stone-900"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-stone-500 block mb-1">No. Telepon / WA</label>
                      <input
                        type="text"
                        value={editingForm.telepon}
                        onChange={(e) => setEditingForm({ ...editingForm, telepon: e.target.value })}
                        className="w-full h-9 px-3 rounded-lg border border-stone-200 bg-white font-bold text-emerald-700"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-stone-500 block mb-1">Kontak Darurat</label>
                      <input
                        type="text"
                        value={editingForm.kontakDarurat}
                        onChange={(e) => setEditingForm({ ...editingForm, kontakDarurat: e.target.value })}
                        className="w-full h-9 px-3 rounded-lg border border-stone-200 bg-white font-bold text-stone-900"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-stone-500 block mb-1">Alamat Domisili Lengkap</label>
                    <input
                      type="text"
                      value={editingForm.alamatLengkap}
                      onChange={(e) => setEditingForm({ ...editingForm, alamatLengkap: e.target.value })}
                      className="w-full h-9 px-3 rounded-lg border border-stone-200 bg-white font-bold text-stone-900"
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-pink-200/80 bg-rose-50/30 p-4 space-y-3">
                  <span className="text-[10px] font-bold text-pink-700 uppercase tracking-wider block">
                    EDIT INFORMASI OPERASIONAL KEBERANGKATAN
                  </span>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-stone-500 block mb-1">Paket Keberangkatan</label>
                      <input
                        type="text"
                        value={editingForm.batch}
                        onChange={(e) => setEditingForm({ ...editingForm, batch: e.target.value })}
                        className="w-full h-9 px-3 rounded-lg border border-stone-200 bg-white font-bold text-stone-900"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-stone-500 block mb-1">Rombongan / Kloter</label>
                      <input
                        type="text"
                        value={editingForm.rombongan}
                        onChange={(e) => setEditingForm({ ...editingForm, rombongan: e.target.value })}
                        className="w-full h-9 px-3 rounded-lg border border-stone-200 bg-white font-bold text-pink-600"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-stone-500 block mb-1">Penerbangan</label>
                      <input
                        type="text"
                        value={editingForm.flight}
                        onChange={(e) => setEditingForm({ ...editingForm, flight: e.target.value })}
                        className="w-full h-9 px-3 rounded-lg border border-stone-200 bg-white font-bold text-stone-900"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-stone-500 block mb-1">No. E-Visa KSA</label>
                      <input
                        type="text"
                        value={editingForm.eVisa}
                        onChange={(e) => setEditingForm({ ...editingForm, eVisa: e.target.value })}
                        className="w-full h-9 px-3 rounded-lg border border-stone-200 bg-white font-mono font-bold text-emerald-700"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-stone-500 block mb-1">No. Bus</label>
                      <input
                        type="text"
                        value={editingForm.bus}
                        onChange={(e) => setEditingForm({ ...editingForm, bus: e.target.value })}
                        className="w-full h-9 px-3 rounded-lg border border-stone-200 bg-white font-bold text-stone-900"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-stone-500 block mb-1">No. Kamar Hotel</label>
                      <input
                        type="text"
                        value={editingForm.kamar}
                        onChange={(e) => setEditingForm({ ...editingForm, kamar: e.target.value })}
                        className="w-full h-9 px-3 rounded-lg border border-stone-200 bg-white font-bold text-stone-900"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-stone-500 block mb-1">Titik Kumpul Utama Harian</label>
                    <input
                      type="text"
                      value={editingForm.titikKumpul}
                      onChange={(e) => setEditingForm({ ...editingForm, titikKumpul: e.target.value })}
                      className="w-full h-9 px-3 rounded-lg border border-stone-200 bg-white font-bold text-stone-900"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 h-11 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs shadow-md transition"
                  >
                    💾 Simpan Perubahan Informasi Jamaah
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingDetail(false)}
                    className="h-11 px-5 rounded-xl border border-stone-200 text-stone-600 font-bold text-xs"
                  >
                    Batal
                  </button>
                </div>
              </form>
            ) : (
              /* VIEW MODE: CURVED BOXES */
              <div className="space-y-3 text-xs">
                <div className="rounded-2xl border border-stone-200/80 bg-stone-50 p-4 space-y-2">
                  <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">INFORMASI IDENTITAS PERSONAL</span>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div><span className="text-stone-400 text-[10px] block">NIK KTP</span><p className="font-mono font-bold text-stone-900">{viewDetailModal.nik}</p></div>
                    <div><span className="text-stone-400 text-[10px] block">No. Paspor RI</span><p className="font-mono font-bold text-stone-900">{viewDetailModal.paspor}</p></div>
                    <div><span className="text-stone-400 text-[10px] block">Tgl Lahir & Usia</span><p className="font-bold text-stone-900">{viewDetailModal.tglLahirUsia}</p></div>
                    <div><span className="text-stone-400 text-[10px] block">Golongan Darah</span><p className="font-bold text-stone-900">{viewDetailModal.golonganDarah}</p></div>
                    <div><span className="text-stone-400 text-[10px] block">No. Telepon / WA</span><p className="font-bold text-emerald-700">{viewDetailModal.telepon}</p></div>
                    <div><span className="text-stone-400 text-[10px] block">Kontak Darurat</span><p className="font-bold text-stone-900">{viewDetailModal.kontakDarurat}</p></div>
                  </div>
                  <div className="pt-2 border-t border-stone-200/60">
                    <span className="text-stone-400 text-[10px] block">Alamat Domisili Lengkap</span>
                    <p className="font-bold text-stone-900">{viewDetailModal.alamatLengkap}</p>
                  </div>
                </div>

                <div className="rounded-2xl border border-stone-200/80 bg-stone-50 p-4 space-y-2">
                  <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">INFORMASI OPERASIONAL KEBERANGKATAN</span>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div><span className="text-stone-400 text-[10px] block">Paket Keberangkatan</span><p className="font-bold text-stone-900">{viewDetailModal.batch}</p></div>
                    <div><span className="text-stone-400 text-[10px] block">Rombongan / Kloter</span><p className="font-bold text-pink-600">{viewDetailModal.rombongan}</p></div>
                    <div><span className="text-stone-400 text-[10px] block">Penerbangan</span><p className="font-bold text-stone-900">{viewDetailModal.flight}</p></div>
                    <div><span className="text-stone-400 text-[10px] block">No. E-Visa KSA</span><p className="font-mono font-bold text-emerald-700">{viewDetailModal.eVisa}</p></div>
                    <div><span className="text-stone-400 text-[10px] block">No. Bus</span><p className="font-bold text-stone-900">{viewDetailModal.bus}</p></div>
                    <div><span className="text-stone-400 text-[10px] block">No. Kamar Hotel</span><p className="font-bold text-stone-900">{viewDetailModal.kamar}</p></div>
                  </div>
                  <div className="pt-2 border-t border-stone-200/60">
                    <span className="text-stone-400 text-[10px] block">Titik Kumpul Utama Harian</span>
                    <p className="font-bold text-stone-900">{viewDetailModal.titikKumpul}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setIsEditingDetail(!isEditingDetail)}
                className="text-xs font-bold text-pink-600 hover:text-pink-700 flex items-center gap-1.5"
              >
                <Edit3 className="h-4 w-4" />
                <span>{isEditingDetail ? "Kembali ke Tampilan Detail" : "✏️ Edit Seluruh Informasi Ini"}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setViewDetailModal(null);
                  setIsEditingDetail(false);
                }}
                className="h-10 px-6 rounded-xl bg-stone-900 text-white font-bold text-xs"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🚀 MODAL SUCCESS PENERBITAN AKUN */}
      {successModal && (
        <div className="fixed inset-0 z-50 el-modal flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs font-sans">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-stone-200 space-y-5 animate-fade-up">
            
            <div className="text-center space-y-2">
              <div className="h-14 w-14 rounded-2xl bg-pink-50 border border-pink-200 text-pink-600 flex items-center justify-center mx-auto shadow-xs">
                <Sparkles className="h-7 w-7" />
              </div>
              <h3 className="font-black text-xl text-stone-900 leading-tight">
                Akun Digital UmrahMe Diterbitkan! 🎉
              </h3>
              <p className="text-xs text-stone-500 font-normal">
                Akun jamaah aktif di sistem El Massa dan dapat langsung digunakan.
              </p>
            </div>

            <div className="rounded-2xl border border-stone-200/80 bg-stone-50 p-4 space-y-2.5 text-xs">
              <div className="flex justify-between border-b border-stone-200/60 pb-2">
                <span className="text-stone-500 font-normal">Nama Jamaah:</span>
                <strong className="text-stone-900 font-extrabold">{successModal.nama}</strong>
              </div>
              <div className="flex justify-between border-b border-stone-200/60 pb-2">
                <span className="text-stone-500 font-normal">ID / Nomor Jamaah:</span>
                <strong className="text-pink-600 font-mono font-bold">{successModal.nomorJamaah}</strong>
              </div>
              <div className="flex justify-between border-b border-stone-200/60 pb-2">
                <span className="text-stone-500 font-normal">Metode Login:</span>
                <strong className="text-emerald-700 font-bold">Input Nama Lengkap / NIK Jamaah</strong>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-stone-500 font-normal">Link App Jamaah:</span>
                <a
                  href="https://umrahme-elmassa.vercel.app/login"
                  target="_blank"
                  rel="noreferrer"
                  className="text-pink-600 font-bold hover:underline truncate max-w-[200px]"
                >
                  https://umrahme-elmassa.vercel.app/login ↗
                </a>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <a
                href="https://umrahme-elmassa.vercel.app/login"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-11 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
              >
                <Smartphone className="h-4 w-4" />
                <span>📱 Buka App Jemaah &amp; Uji Login Akun Ini ↗</span>
              </a>

              <a
                href={`https://wa.me/?text=${encodeURIComponent(
                  `Assalamu'alaikum Wr. Wb. Bpk/Ibu *${successModal.nama}*,\n\nAkun Digital UmrahMe Anda telah aktif resmi dari *El Massa Travel*:\n\n👤 *Nama*: ${successModal.nama}\n💳 *ID Jamaah*: ${successModal.nomorJamaah}\n🌐 *Link Login*: https://umrahme-elmassa.vercel.app/login\n\nSilakan masukkan Nama Lengkap Anda di atas untuk mengakses Kartu Digital & Panduan Umrah Anda.`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition"
              >
                <Send className="h-4 w-4" />
                <span>Kirim Kredensial via WhatsApp Jamaah</span>
              </a>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const text = `Assalamu'alaikum Wr. Wb. Bpk/Ibu *${successModal.nama}*,\nAkun Digital UmrahMe Anda telah aktif resmi dari *El Massa Travel*:\n\n👤 Nama: ${successModal.nama}\n💳 ID Jamaah: ${successModal.nomorJamaah}\n🌐 Link Login: https://umrahme-elmassa.vercel.app/login`;
                    navigator.clipboard.writeText(text);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="flex-1 h-10 rounded-xl bg-stone-100 border border-stone-200 text-stone-700 hover:bg-stone-200 text-xs font-semibold transition"
                >
                  {copied ? "✓ Tersalin!" : "📋 Salin Teks Kredensial"}
                </button>
                <button
                  type="button"
                  onClick={() => setSuccessModal(null)}
                  className="h-10 px-5 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 text-xs font-semibold transition"
                >
                  Tutup
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 📢 MODAL BROADCAST PENGUMUMAN REAL-TIME */}
      {isBroadcastModalOpen && (
        <div className="fixed inset-0 z-50 el-modal flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs font-sans">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-stone-200 space-y-5 animate-fade-up">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-200">
                  <Bell className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-stone-900">Broadcast Pengumuman</h3>
                  <p className="text-xs text-stone-500">Kirim pengumuman langsung ke HP seluruh jamaah.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsBroadcastModalOpen(false)}
                className="h-8 w-8 grid place-items-center rounded-full hover:bg-stone-100 text-stone-400"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSendBroadcast} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-extrabold text-stone-800 uppercase tracking-wider block">Tipe Pengumuman</label>
                <select
                  value={broadcastType}
                  onChange={(e) => setBroadcastType(e.target.value as any)}
                  className="w-full h-10 px-3 rounded-xl border border-stone-200 bg-stone-50 font-bold text-stone-900"
                >
                  <option value="urgent">🚨 Urgent / Darurat (Warna Merah)</option>
                  <option value="jadwal">📅 Perubahan Jadwal / Kumpul (Warna Kuning)</option>
                  <option value="info">ℹ️ Informasi Umum (Warna Biru)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-extrabold text-stone-800 uppercase tracking-wider block">Judul Pengumuman *</label>
                <input
                  type="text"
                  required
                  value={broadcastJudul}
                  onChange={(e) => setBroadcastJudul(e.target.value)}
                  placeholder="cth. Perubahan Jam Kumpul Ziarah Makkah"
                  className="w-full h-10 px-3 rounded-xl border border-stone-200 bg-stone-50 font-bold text-stone-900"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-extrabold text-stone-800 uppercase tracking-wider block">Isi Pesan Pengumuman *</label>
                <textarea
                  required
                  rows={3}
                  value={broadcastPesan}
                  onChange={(e) => setBroadcastPesan(e.target.value)}
                  placeholder="cth. Diberitahukan kepada seluruh jamaah Rombongan 01 untuk kumpul di Lobby Hotel Pullman pukul 03.30 Subuh."
                  className="w-full p-3 rounded-xl border border-stone-200 bg-stone-50 font-medium text-stone-900"
                />
              </div>

              {broadcastSuccess ? (
                <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 font-bold text-center border border-emerald-200">
                  ✓ Broadcast Pengumuman Berhasil Terkirim ke HP Jamaah!
                </div>
              ) : (
                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 h-11 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-black text-xs shadow-md transition"
                  >
                    📢 Broadcast Sekarang
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsBroadcastModalOpen(false)}
                    className="h-11 px-4 rounded-xl border border-stone-200 text-stone-600 font-bold text-xs"
                  >
                    Batal
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* 💳 MODAL TOP UP SALDO KUOTA LISENSI UMRAHME */}
      {isTopUpModalOpen && (
        <div className="fixed inset-0 z-50 el-modal flex items-center justify-center p-4 bg-stone-900/70 backdrop-blur-xs font-sans">
          <div className="w-full max-w-xl rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-stone-200 space-y-6 animate-fade-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-200">
                  <CreditCard className="h-6 w-6 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-stone-900">Top Up Saldo Kuota Lisensi UmrahMe</h3>
                  <p className="text-xs text-stone-500 font-medium">Beli paket lisensi akun jemaah (Tarif Resmi: Rp 35.000 / Akun Jemaah).</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsTopUpModalOpen(false);
                  setVoucherMessage(null);
                }}
                className="grid h-8 w-8 place-items-center rounded-full text-stone-400 hover:bg-stone-100 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Current Balance Banner */}
            <div className="rounded-2xl bg-stone-900 text-white p-4 flex items-center justify-between border border-stone-800">
              <div>
                <p className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Saldo Kuota Saat Ini</p>
                <p className="text-2xl font-black text-amber-400">{licenseCredits} Kuota Jemaah</p>
              </div>
              <span className="bg-amber-400/20 text-amber-300 text-xs font-extrabold px-3 py-1.5 rounded-xl border border-amber-400/30">
                Rp 35.000 / Jemaah
              </span>
            </div>

            {/* Package Cards */}
            <div className="space-y-3">
              <p className="text-xs uppercase font-extrabold tracking-wider text-stone-500">Pilih Paket Top Up Lisensi:</p>
              <div className="grid sm:grid-cols-3 gap-3">
                
                {/* Package 1 */}
                <div className="rounded-2xl border-2 border-stone-200 p-4 hover:border-pink-500 transition cursor-pointer bg-stone-50/50 space-y-2 text-center">
                  <p className="text-xs font-bold text-stone-500 uppercase">Paket Star</p>
                  <p className="text-xl font-black text-stone-900">50 Kuota</p>
                  <p className="text-xs font-extrabold text-pink-600">Rp 1.750.000</p>
                  <p className="text-[10px] text-stone-400 font-medium">Rp 35.000 / Jemaah</p>
                </div>

                {/* Package 2 (Popular) */}
                <div className="rounded-2xl border-2 border-pink-500 bg-pink-50/30 p-4 transition cursor-pointer space-y-2 text-center relative shadow-sm">
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-pink-600 text-white text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full">
                    Terpopuler
                  </span>
                  <p className="text-xs font-bold text-pink-700 uppercase">Paket Pro</p>
                  <p className="text-xl font-black text-stone-900">100 Kuota</p>
                  <p className="text-xs font-extrabold text-pink-600">Rp 3.500.000</p>
                  <p className="text-[10px] text-stone-400 font-medium">Rp 35.000 / Jemaah</p>
                </div>

                {/* Package 3 */}
                <div className="rounded-2xl border-2 border-stone-200 p-4 hover:border-pink-500 transition cursor-pointer bg-stone-50/50 space-y-2 text-center">
                  <p className="text-xs font-bold text-stone-500 uppercase">Paket Musim</p>
                  <p className="text-xl font-black text-stone-900">300 Kuota</p>
                  <p className="text-xs font-extrabold text-pink-600">Rp 10.500.000</p>
                  <p className="text-[10px] text-stone-400 font-medium">Rp 35.000 / Jemaah</p>
                </div>

              </div>
            </div>

            {/* WA Order Link */}
            <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 space-y-2 text-center">
              <p className="text-xs font-bold text-emerald-900">
                Pesan &amp; Ajukan Invoice Top Up Lisensi via Whatsapp Developer:
              </p>
              <a
                href={`https://wa.me/6281249476778?text=${encodeURIComponent(
                  `Halo Developer El Massa, saya ingin mengajukan Invoice Top Up Kuota Lisensi UmrahMe (Paket 100 Kuota - Rp 3.500.000).`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
              >
                <Send className="h-4 w-4" />
                <span>💬 Kirim Pengajuan Top Up &amp; Invoice via WhatsApp ↗</span>
              </a>
            </div>

            {/* Voucher Code / Instant Approval Section */}
            <form onSubmit={handleRedeemVoucher} className="space-y-3 pt-2 border-t border-stone-100">
              <label className="text-xs font-bold text-stone-700 block">
                Konfirmasi Kode Lisensi / Voucher Top Up (Developer / Master Approval):
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={voucherCodeInput}
                  onChange={(e) => setVoucherCodeInput(e.target.value)}
                  placeholder="Masukkan Kode Voucher (cth: TOPUP100)"
                  className="flex-1 h-11 px-3 rounded-xl border border-stone-200 bg-stone-50 text-xs font-mono font-bold uppercase"
                />
                <button
                  type="submit"
                  className="h-11 px-5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition shadow-sm cursor-pointer"
                >
                  Aktivasi Kode
                </button>
              </div>

              {voucherMessage && (
                <div
                  className={`p-3 rounded-xl text-xs font-bold text-center border ${
                    voucherMessage.type === "success"
                      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                      : "bg-rose-50 text-rose-800 border-rose-200"
                  }`}
                >
                  {voucherMessage.text}
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* ⚠️ MODAL QUOTA EXCEEDED WARNING */}
      {isQuotaModalOpen && (
        <div className="fixed inset-0 z-50 el-modal flex items-center justify-center p-4 bg-stone-900/70 backdrop-blur-xs font-sans">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-stone-200 space-y-5 text-center animate-fade-up">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-rose-50 text-rose-600 border border-rose-200 shadow-sm">
              <AlertTriangle className="h-8 w-8 stroke-[2.5]" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-black text-stone-900">Saldo Kuota Lisensi Habis!</h3>
              <p className="text-xs text-stone-600 leading-relaxed font-medium">
                Penerbitan akun digital jemaah terkunci secara otomatis karena saldo kuota lisensi Anda telah habis (0 Kuota Tersisa).
              </p>
            </div>

            <div className="rounded-2xl bg-amber-50 border border-amber-200 p-3 text-xs font-bold text-amber-900">
              Tarif Resmi Lisensi: <span className="text-pink-600 font-extrabold">Rp 35.000 / Akun Jemaah</span>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsQuotaModalOpen(false);
                  setIsTopUpModalOpen(true);
                }}
                className="w-full h-12 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 hover:from-amber-300 text-stone-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg transition active:scale-95 cursor-pointer border border-amber-200"
              >
                <Plus className="h-4 w-4 stroke-[3]" />
                <span>Top Up Saldo Kuota Sekarang ↗</span>
              </button>

              <button
                type="button"
                onClick={() => setIsQuotaModalOpen(false)}
                className="w-full h-10 rounded-xl border border-stone-200 text-stone-600 font-bold text-xs hover:bg-stone-50 transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
