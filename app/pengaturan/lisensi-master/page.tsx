"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  KeyRound,
  CreditCard,
  Plus,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Lock,
  Building,
  History,
  Copy,
  Check,
  Sliders,
  DollarSign,
  Sparkles,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";

export default function LisensiMasterPage() {
  const [pinInput, setPinInput] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pinError, setPinError] = useState("");

  // Master Developer PIN
  const MASTER_PIN = "120426050900260402";

  // License Control States
  const [currentCredits, setCurrentCredits] = useState<number>(100);
  const [pricePerAccount, setPricePerAccount] = useState<number>(35000);
  const [customQuotaInput, setCustomQuotaInput] = useState<string>("");
  
  // Voucher Generator States
  const [genVoucherAmount, setGenVoucherAmount] = useState<number>(100);
  const [generatedVoucherCode, setGeneratedVoucherCode] = useState<string>("");
  const [copiedVoucher, setCopiedVoucher] = useState(false);

  // History Log
  const [historyLogs, setHistoryLogs] = useState<
    { id: string; timestamp: string; action: string; amount: number; balanceAfter: number }[]
  >([]);

  useEffect(() => {
    try {
      const savedCredits = localStorage.getItem("el_massa_license_credits");
      if (savedCredits !== null) setCurrentCredits(Number(savedCredits));

      const savedPrice = localStorage.getItem("el_massa_price_per_account");
      if (savedPrice !== null) setPricePerAccount(Number(savedPrice));

      const savedHistory = localStorage.getItem("el_massa_license_history");
      if (savedHistory) setHistoryLogs(JSON.parse(savedHistory));
    } catch (e) {
      console.error(e);
    }
  }, []);

  function handleUnlock(e: React.FormEvent) {
    e.preventDefault();
    if (pinInput === MASTER_PIN) {
      setIsUnlocked(true);
      setPinError("");
    } else {
      setPinError("❌ PIN Rahasia Developer Salah! Akses ditolak.");
      setPinInput("");
    }
  }

  function updateCreditsInStorage(newCredits: number, actionName: string, deltaAmount: number) {
    setCurrentCredits(newCredits);
    try {
      localStorage.setItem("el_massa_license_credits", String(newCredits));
      
      const newLog = {
        id: String(Date.now()),
        timestamp: new Date().toLocaleString("id-ID"),
        action: actionName,
        amount: deltaAmount,
        balanceAfter: newCredits,
      };

      const updatedHistory = [newLog, ...historyLogs];
      setHistoryLogs(updatedHistory);
      localStorage.setItem("el_massa_license_history", JSON.stringify(updatedHistory));
    } catch (e) {
      console.error(e);
    }
  }

  function handleAddQuota(amount: number) {
    const next = currentCredits + amount;
    updateCreditsInStorage(next, `Top Up Manual Master (+${amount} Kuota)`, amount);
  }

  function handleSetCustomQuota(e: React.FormEvent) {
    e.preventDefault();
    const target = parseInt(customQuotaInput, 10);
    if (isNaN(target) || target < 0) return;

    const delta = target - currentCredits;
    updateCreditsInStorage(target, `Set Manual Saldo Kuota (${target})`, delta);
    setCustomQuotaInput("");
  }

  function handleSavePrice(e: React.FormEvent) {
    e.preventDefault();
    try {
      localStorage.setItem("el_massa_price_per_account", String(pricePerAccount));
      alert(`✓ Tarif resmi berhasil diperbarui menjadi Rp ${pricePerAccount.toLocaleString("id-ID")} / Akun`);
    } catch (e) {}
  }

  function handleGenerateVoucher() {
    const rnd = Math.floor(1000 + Math.random() * 9000);
    const code = `ELMASSA-${genVoucherAmount}-${rnd}`;
    setGeneratedVoucherCode(code);
  }

  if (!isUnlocked) {
    return (
      <AppShell eyebrow="DEVELOPER PANEL" title="Kontrol Master Lisensi &amp; Kuota Travel">
        <div className="min-h-[60vh] flex items-center justify-center p-4 font-sans">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-stone-200 text-center space-y-6 animate-fade-up">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-stone-900 text-amber-400 border border-stone-800 shadow-md">
              <Lock className="h-8 w-8 stroke-[2.5]" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-black text-stone-900">Panel Lisensi Master Developer</h2>
              <p className="text-xs text-stone-500 font-medium leading-relaxed">
                Halaman ini dilindungi oleh PIN Rahasia Developer. Masukkan PIN untuk mengontrol saldo kuota, tarif lisensi, dan penerbitan voucher.
              </p>
            </div>

            <form onSubmit={handleUnlock} className="space-y-4 pt-2">
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold uppercase text-stone-500 tracking-wider">
                  Masukkan PIN Rahasia Developer
                </label>
                <div className="relative">
                  <input
                    type="password"
                    maxLength={32}
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)}
                    placeholder="••••••••••••••••••"
                    autoFocus
                    className="w-full h-14 rounded-2xl border-2 border-stone-200 bg-stone-50 text-center text-lg font-mono font-black tracking-widest focus:border-stone-900 focus:outline-none focus:bg-white"
                  />
                  <KeyRound className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
                </div>
              </div>

              {pinError && (
                <p className="text-xs font-bold text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                  {pinError}
                </p>
              )}

              <button
                type="submit"
                className="w-full h-12 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-black shadow-lg transition active:scale-95 cursor-pointer"
              >
                Buka Panel Master Developer
              </button>
            </form>

            <p className="text-[11px] text-stone-400 font-semibold">
              🔒 Protected by Master Developer Secret Security Key
            </p>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell eyebrow="DEVELOPER CONTROL" title="Panel Master Lisensi &amp; Kontrol Saldo Kuota Travel">
      <div className="space-y-6 pb-12 font-sans">
        {/* Top Developer Header */}
        <section className="rounded-3xl bg-gradient-to-r from-stone-950 via-stone-900 to-stone-950 p-6 sm:p-8 text-white shadow-xl border border-stone-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-400 text-stone-950 shadow-md">
                <ShieldCheck className="h-6 w-6 stroke-[2.5]" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400">
                  Super Admin License Controller
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-white">
                  Kontrol Saldo Kuota &amp; Tarif Travel
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-400 font-medium">Status Akses:</span>
              <span className="bg-emerald-500/20 text-emerald-300 text-xs font-extrabold px-3 py-1 rounded-full border border-emerald-500/40">
                ✓ Super Admin Verified
              </span>
              <button
                type="button"
                onClick={() => setIsUnlocked(false)}
                className="ml-2 h-9 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-bold transition"
              >
                Kunci Panel 🔒
              </button>
            </div>
          </div>
        </section>

        {/* 🗂️ GRID 2 KOLOM: KONTROL SALDO (KIRI) & VOUCHER GENERATOR (KANAN) */}
        <div className="grid lg:grid-cols-12 gap-6 items-start">
          {/* LEFT: SALDO MANAGEMENT */}
          <div className="lg:col-span-7 space-y-6">
            {/* Live Saldo Box */}
            <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                <div>
                  <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">Saldo Kuota Aktif Travel</p>
                  <p className="text-3xl font-black text-stone-900 mt-1">{currentCredits} Kuota Jemaah</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase font-bold text-stone-400">Nilai Omset Saldo</p>
                  <p className="text-lg font-black text-emerald-600">
                    Rp {(currentCredits * pricePerAccount).toLocaleString("id-ID")}
                  </p>
                </div>
              </div>

              {/* Quick Add Buttons */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-700 block">
                  Tambah Kuota Instan (Direct Injection):
                </label>
                <div className="grid grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => handleAddQuota(50)}
                    className="h-11 rounded-xl bg-stone-100 hover:bg-stone-900 hover:text-white text-stone-800 text-xs font-bold transition shadow-xs cursor-pointer"
                  >
                    +50 Kuota
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddQuota(100)}
                    className="h-11 rounded-xl bg-pink-50 hover:bg-pink-600 hover:text-white text-pink-700 text-xs font-black transition shadow-xs cursor-pointer"
                  >
                    +100 Kuota
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddQuota(300)}
                    className="h-11 rounded-xl bg-amber-50 hover:bg-amber-500 hover:text-stone-950 text-amber-800 text-xs font-black transition shadow-xs cursor-pointer"
                  >
                    +300 Kuota
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddQuota(500)}
                    className="h-11 rounded-xl bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-800 text-xs font-black transition shadow-xs cursor-pointer"
                  >
                    +500 Kuota
                  </button>
                </div>
              </div>

              {/* Set Exact Custom Quota */}
              <form onSubmit={handleSetCustomQuota} className="pt-3 border-t border-stone-100 space-y-2">
                <label className="text-xs font-bold text-stone-700 block">
                  Set Angka Kuota Spesifik secara Manual:
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={customQuotaInput}
                    onChange={(e) => setCustomQuotaInput(e.target.value)}
                    placeholder="Contoh: 250"
                    className="flex-1 h-11 px-3 rounded-xl border border-stone-200 bg-stone-50 text-xs font-bold"
                  />
                  <button
                    type="submit"
                    className="h-11 px-5 rounded-xl bg-stone-900 text-white text-xs font-bold hover:bg-stone-800 transition cursor-pointer"
                  >
                    Simpan Saldo Baru
                  </button>
                </div>
              </form>
            </div>

            {/* Set Tariff Config */}
            <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-xs space-y-4">
              <h3 className="text-base font-extrabold text-stone-900 border-b border-stone-100 pb-3">
                ⚙️ Pengaturan Tarif Resmi per Lisensi Jemaah
              </h3>
              <form onSubmit={handleSavePrice} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-600">Tarif per 1 Akun UmrahMe (IDR):</label>
                  <input
                    type="number"
                    step={1000}
                    value={pricePerAccount}
                    onChange={(e) => setPricePerAccount(Number(e.target.value))}
                    className="w-full h-11 px-3 rounded-xl border border-stone-200 bg-stone-50 text-sm font-black text-pink-600"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full h-10 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition"
                >
                  Update Tarif Resmi Lisensi
                </button>
              </form>
            </div>
          </div>

          {/* RIGHT: VOUCHER GENERATOR & LOGS */}
          <div className="lg:col-span-5 space-y-6">
            {/* Voucher Generator */}
            <div className="rounded-3xl border border-amber-200 bg-amber-50/40 p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-amber-900">
                <Sparkles className="h-5 w-5 text-amber-600" />
                <h3 className="text-base font-black">Generator Kode Voucher Top Up</h3>
              </div>
              <p className="text-xs text-stone-600 font-medium">
                Buat kode lisensi instan untuk dikirim ke travel setelah mereka mentransfer pembayaran.
              </p>

              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-700">Pilih Jumlah Kuota Voucher:</label>
                <select
                  value={genVoucherAmount}
                  onChange={(e) => setGenVoucherAmount(Number(e.target.value))}
                  className="w-full h-11 px-3 rounded-xl border border-stone-200 bg-white text-xs font-bold"
                >
                  <option value={50}>Paket 50 Kuota Jemaah (Rp 1.750.000)</option>
                  <option value={100}>Paket 100 Kuota Jemaah (Rp 3.500.000)</option>
                  <option value={300}>Paket 300 Kuota Jemaah (Rp 10.500.000)</option>
                  <option value={500}>Paket 500 Kuota Jemaah (Rp 17.500.000)</option>
                </select>
              </div>

              <button
                type="button"
                onClick={handleGenerateVoucher}
                className="w-full h-11 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-black text-xs shadow-md transition cursor-pointer"
              >
                ⚡ Generate Kode Voucher
              </button>

              {generatedVoucherCode && (
                <div className="p-4 rounded-2xl bg-stone-900 text-white space-y-2 text-center animate-fade-up">
                  <p className="text-[10px] uppercase font-bold text-stone-400">Kode Voucher Siap Kirim:</p>
                  <p className="text-lg font-mono font-black text-amber-400">{generatedVoucherCode}</p>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(generatedVoucherCode);
                      setCopiedVoucher(true);
                      setTimeout(() => setCopiedVoucher(false), 2000);
                    }}
                    className="w-full h-9 rounded-lg bg-stone-800 hover:bg-stone-700 text-xs font-bold text-amber-300 transition flex items-center justify-center gap-1.5"
                  >
                    {copiedVoucher ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedVoucher ? "Tersalin!" : "Salin Kode Voucher"}</span>
                  </button>
                </div>
              )}
            </div>

            {/* History Logs */}
            <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-stone-900 border-b border-stone-100 pb-3">
                <History className="h-4 w-4 text-stone-500" />
                <h4 className="text-xs font-black uppercase tracking-wider">Log Perubahan Saldo</h4>
              </div>

              {historyLogs.length === 0 ? (
                <p className="text-xs text-stone-400 italic text-center py-4">Belum ada aktivitas lisensi.</p>
              ) : (
                <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                  {historyLogs.map((log) => (
                    <div key={log.id} className="p-2.5 rounded-xl bg-stone-50 border border-stone-100 text-xs flex justify-between items-center">
                      <div>
                        <p className="font-bold text-stone-800">{log.action}</p>
                        <p className="text-[10px] text-stone-400">{log.timestamp}</p>
                      </div>
                      <div className="text-right">
                        <span className={`font-mono font-bold ${log.amount >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                          {log.amount >= 0 ? `+${log.amount}` : log.amount}
                        </span>
                        <p className="text-[10px] text-stone-500 font-semibold">Sisa: {log.balanceAfter}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
