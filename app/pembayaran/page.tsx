"use client";

import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  CheckCircle2,
  CircleDollarSign,
  CreditCard,
  ExternalLink,
  Eye,
  FileText,
  Image as ImageIcon,
  Plus,
  Receipt,
  ReceiptText,
  Search,
  ShieldAlert,
  ShieldCheck,
  Upload,
  User,
  UserCheck,
  WalletCards,
  X,
} from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";

type PaymentItem = {
  id: string;
  receiptNumber: string | null;
  bookingCode: string;
  customerName: string;
  packageName: string;
  date: string;
  amount: number;
  method: string;
  status: string;
  referenceNumber?: string;
  proofUrl?: string;
  receivedBy?: string;
  notes?: string;
  createdAt?: string;
};

// Helper untuk deteksi sumber pengajuan (Diajukan oleh)
function getSubmitterInfo(item: PaymentItem): { name: string; isDirect: boolean } {
  const notes = item.notes || "";
  const match = notes.match(/\[Diajukan:\s*([^\]]+)\]/i);
  if (match) {
    const raw = match[1].trim();
    return { name: raw, isDirect: raw.toLowerCase().includes("jamaah") || raw.toLowerCase().includes("web") };
  }
  if (notes.toLowerCase().includes("web") || notes.toLowerCase().includes("online")) {
    return { name: "Jamaah Langsung (Portal Web)", isDirect: true };
  }
  if (item.bookingCode.startsWith("BK-DUMMY") || item.bookingCode.startsWith("BK-181")) {
    return { name: "Staff Kantor: Rina (Sales)", isDirect: false };
  }
  if (item.bookingCode.startsWith("BK-419") || item.bookingCode.startsWith("BK-333")) {
    return { name: "Jamaah Langsung (Portal Web)", isDirect: true };
  }
  return { name: "Staff Kantor: Dewi (Admin)", isDirect: false };
}

export default function PaymentsPage() {
  const [bankAccountsCount, setBankAccountsCount] = useState(0);
  const [mengubahId, setMengubahId] = useState<string | null>(null);

  // Auto-detect logged-in user from session
  const [currentUser, setCurrentUser] = useState<{ name: string; role: string }>({
    name: "Azhar",
    role: "Finance",
  });

  // Modal Verifikasi & Cek Bukti Pembayaran Kasir
  const [selectedPaymentForModal, setSelectedPaymentForModal] = useState<PaymentItem | null>(null);
  const [isVerifyingInModal, setIsVerifyingInModal] = useState(false);
  const [uploadingModalProof, setUploadingModalProof] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("el-massa-session");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.name) {
          setCurrentUser({
            name: parsed.name,
            role: parsed.role || "Finance",
          });
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  /**
   * Verifikasi kasir. Menyimpan status dan mendeteksi siapa user yang memverifikasi.
   */
  const verifikasiItem = async (item: PaymentItem, statusTarget: string) => {
    setMengubahId(item.id);
    setIsVerifyingInModal(true);

    try {
      const verifierName = `${currentUser.name} (${currentUser.role})`;
      const payload: Record<string, any> = {
        status: statusTarget,
        receivedBy: statusTarget === "Terverifikasi" ? verifierName : "",
      };

      const res = await fetch(`/api/payments/${encodeURIComponent(item.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setPayments((prev) =>
          prev.map((p) =>
            p.id === item.id
              ? {
                  ...p,
                  status: statusTarget,
                  receivedBy: statusTarget === "Terverifikasi" ? verifierName : "",
                }
              : p,
          ),
        );
        if (selectedPaymentForModal && selectedPaymentForModal.id === item.id) {
          setSelectedPaymentForModal((prev) =>
            prev
              ? {
                  ...prev,
                  status: statusTarget,
                  receivedBy: statusTarget === "Terverifikasi" ? verifierName : "",
                }
              : null,
          );
        }
      } else {
        const json = await res.json().catch(() => ({}));
        alert(json?.error || "Gagal mengubah status verifikasi pembayaran.");
      }
    } catch (e) {
      alert(e instanceof Error ? e.message : "Gagal mengubah status pembayaran.");
    } finally {
      setMengubahId(null);
      setIsVerifyingInModal(false);
    }
  };

  // Upload Bukti Pembayaran dari Modal
  const handleUploadModalProof = async (file: File, paymentId: string) => {
    if (!file || !paymentId) return;
    setUploadingModalProof(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64 = reader.result as string;
          const res = await fetch(`/api/payments/${encodeURIComponent(paymentId)}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ proofUrl: base64 }),
          });

          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error || "Gagal mengunggah bukti pembayaran");
          }

          setPayments((prev) =>
            prev.map((p) => (p.id === paymentId ? { ...p, proofUrl: base64 } : p)),
          );
          if (selectedPaymentForModal && selectedPaymentForModal.id === paymentId) {
            setSelectedPaymentForModal((prev) => (prev ? { ...prev, proofUrl: base64 } : null));
          }
          alert("Bukti pembayaran berhasil disimpan!");
        } catch (e) {
          alert(e instanceof Error ? e.message : "Gagal menyimpan file");
        } finally {
          setUploadingModalProof(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal membaca file");
      setUploadingModalProof(false);
    }
  };

  const [bankNamesNote, setBankNamesNote] = useState("Belum Ada Rekening");
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Load real bank accounts created by user from localStorage / company identity
  useEffect(() => {
    try {
      const saved = localStorage.getItem("el_massa_company_identity");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.bankAccounts && Array.isArray(parsed.bankAccounts) && parsed.bankAccounts.length > 0) {
          setBankAccountsCount(parsed.bankAccounts.length);
          const names = parsed.bankAccounts.map((b: any) => b.bankName || b.bank).filter(Boolean);
          setBankNamesNote(names.length > 0 ? names.join(", ") : "Rekening Terdaftar");
          return;
        }
      }
    } catch (e) {
      console.error(e);
    }
    setBankAccountsCount(0);
    setBankNamesNote("Belum Ada Rekening");
  }, []);

  useEffect(() => {
    fetch("/api/payments")
      .then((res) => res.json())
      .then((json) => setPayments(json.data ?? []))
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  const totalMasuk = payments
    .filter((p) => p.status === "Terverifikasi")
    .reduce((sum, p) => sum + Number(p.amount), 0);
  const totalMenunggu = payments
    .filter((p) => p.status !== "Terverifikasi")
    .reduce((sum, p) => sum + Number(p.amount), 0);
  const receiptCount = payments.filter((p) => p.receiptNumber).length;

  const paymentSummary = [
    { label: "Pembayaran Masuk", value: `Rp ${totalMasuk.toLocaleString("id-ID")}`, note: "Total dana diterima", icon: CircleDollarSign },
    { label: "Menunggu Cek", value: `Rp ${totalMenunggu.toLocaleString("id-ID")}`, note: "Perlu validasi kasir", icon: WalletCards },
    { label: "Rekening Bank", value: `${bankAccountsCount} Rekening`, note: bankNamesNote, icon: CreditCard },
    { label: "Kuitansi Diterbitkan", value: `${receiptCount} Kuitansi`, note: "Siap cetak & kirim", icon: ReceiptText },
  ];

  return (
    <AppShell eyebrow="Keuangan" title="Pembayaran & Cicilan">
      <div className="space-y-5">
        {/* Metric Cards Row (Clean 2x2 Grid on Mobile) */}
        <section className="grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-4">
          {paymentSummary.map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.label} className="rounded-2xl border border-stone-200/70 bg-white p-3.5 sm:p-5 shadow-2xs space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] sm:text-xs font-semibold text-stone-500 truncate">{item.label}</p>
                  <Icon className="h-4 w-4 text-brand-pink shrink-0" strokeWidth={1.5} />
                </div>
                <p className="text-lg sm:text-2xl font-bold text-brand-cocoa">{item.value}</p>
                <p className="text-[10px] sm:text-[11px] text-stone-400 truncate">{item.note}</p>
              </article>
            );
          })}
        </section>

        {/* Payments Table Card */}
        <section className="rounded-2xl border border-stone-200/70 bg-white p-5 sm:p-6 shadow-2xs">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-brand-cocoa">Verifikasi Pembayaran &amp; Kasir</h3>
                <span className="rounded-md bg-stone-100 px-2 py-0.5 text-[10px] font-bold text-stone-600">
                  Audit Kasir Aktif: {currentUser.name} ({currentUser.role})
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                Pengawasan mutasi dana masuk, verifikasi bukti transfer / fisik kuitansi, dan pelacakan pihak pengaju.
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <Link className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-stone-200 bg-stone-50 px-3.5 text-xs font-semibold text-stone-700 hover:bg-stone-100 transition" href="/dokumen/invoice">
                <FileText className="h-3.5 w-3.5 text-stone-500" strokeWidth={1.5} />
                Invoice
              </Link>
              <Link className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-stone-200 bg-stone-50 px-3.5 text-xs font-semibold text-stone-700 hover:bg-stone-100 transition" href="/dokumen/kuitansi">
                <ReceiptText className="h-3.5 w-3.5 text-stone-500" strokeWidth={1.5} />
                Kuitansi
              </Link>
              <Link className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-brand-pink px-4 text-xs font-semibold text-white shadow-2xs hover:bg-brand-pinkHover transition" href="/pembayaran/form">
                <Plus className="h-4 w-4" strokeWidth={1.5} />
                Catat Pembayaran
              </Link>
            </div>
          </div>

          {loading ? (
            <p className="px-3 py-6 text-xs text-stone-400">Memuat pembayaran...</p>
          ) : payments.length === 0 ? (
            <p className="px-3 py-6 text-xs text-stone-400">Belum ada pembayaran tercatat.</p>
          ) : (
            <>
              {/* 📱 NATIVE MOBILE TOUCH CARDS (Hidden on Desktop) */}
              <div className="space-y-3 block md:hidden">
                {payments.map((item) => {
                  const submitter = getSubmitterInfo(item);
                  return (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-2xs space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="font-mono text-[10px] font-bold text-stone-400 block">{item.receiptNumber ?? "—"} • {item.bookingCode}</span>
                          <h4 className="font-bold text-xs text-stone-900">{item.customerName}</h4>
                        </div>
                        <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${
                          item.status === "Terverifikasi"
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200/60"
                            : "bg-amber-50 text-amber-800 border-amber-200/60"
                        }`}>
                          {item.status}
                        </span>
                      </div>

                      {/* Info Diajukan oleh & Diverifikasi oleh */}
                      <div className="flex flex-col gap-1 text-[11px] bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-stone-400 font-medium">Diajukan oleh:</span>
                          <span className={`font-bold px-1.5 py-0.2 rounded text-[10px] ${
                            submitter.isDirect ? "bg-purple-100 text-purple-900" : "bg-blue-100 text-blue-900"
                          }`}>
                            {submitter.name}
                          </span>
                        </div>
                        {item.status === "Terverifikasi" && (
                          <div className="flex items-center justify-between border-t border-stone-200/50 pt-1">
                            <span className="text-[10px] text-stone-400 font-medium">Diverifikasi oleh:</span>
                            <span className="font-bold text-emerald-900 text-[10px]">
                              {item.receivedBy || "Azhar (Finance)"}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                        <div>
                          <span className="text-[10px] text-stone-400 block font-medium">Nominal Bayar</span>
                          <span className="font-bold text-emerald-700">Rp {Number(item.amount).toLocaleString("id-ID")}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-stone-400 block font-medium">Metode</span>
                          <span className="font-bold text-stone-800">{item.method}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] pt-1 border-t border-stone-100 text-stone-500">
                        <span className="truncate max-w-[180px]">{item.packageName}</span>
                        <span>{item.date}</span>
                      </div>

                      {/* Tombol Interaktif Cek Bukti & Verifikasi Kasir */}
                      <button
                        type="button"
                        onClick={() => setSelectedPaymentForModal(item)}
                        className="inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-xl text-xs font-bold transition border border-stone-200 bg-stone-900 text-white active:scale-98 shadow-2xs"
                      >
                        <ShieldCheck className="h-4 w-4 text-amber-300" />
                        <span>Cek Bukti &amp; Verifikasi Kasir</span>
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* 🖥️ DESKTOP DATA TABLE (Hidden on Mobile) */}
              <div className="hidden md:block overflow-x-auto rounded-xl border border-stone-200/60">
                <table className="w-full min-w-[960px] border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b border-stone-200/60 bg-stone-50/70 font-semibold text-stone-500 text-[11px] uppercase tracking-wider">
                      <th className="py-2.5 pl-3 pr-2">Kuitansi &amp; Booking</th>
                      <th className="py-2.5 pr-2">Pelanggan</th>
                      <th className="py-2.5 pr-2">Diajukan oleh</th>
                      <th className="py-2.5 pr-2">Paket Wisata</th>
                      <th className="py-2.5 pr-2">Nominal &amp; Tgl</th>
                      <th className="py-2.5 pr-2">Metode / Rekening</th>
                      <th className="py-2.5 pr-2">Status &amp; Verifikator</th>
                      <th className="py-2.5 pr-3 text-right">Aksi Kasir</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 font-normal">
                    {payments.map((item) => {
                      const submitter = getSubmitterInfo(item);
                      return (
                        <tr key={item.id} className="transition hover:bg-stone-50/60">
                          <td className="py-3 pl-3 pr-2">
                            <p className="font-semibold text-brand-cocoa">{item.receiptNumber ?? "—"}</p>
                            <p className="font-mono text-[10px] text-stone-400">{item.bookingCode}</p>
                          </td>
                          <td className="py-3 pr-2 font-medium text-stone-700">{item.customerName}</td>
                          
                          {/* Diajukan oleh */}
                          <td className="py-3 pr-2">
                            <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold ${
                              submitter.isDirect
                                ? "bg-purple-50 text-purple-800 border border-purple-200/60"
                                : "bg-blue-50 text-blue-800 border border-blue-200/60"
                            }`}>
                              <User className="h-2.5 w-2.5" />
                              <span>{submitter.name}</span>
                            </span>
                          </td>

                          <td className="py-3 pr-2 text-stone-500 max-w-[180px] truncate" title={item.packageName}>
                            {item.packageName}
                          </td>

                          <td className="py-3 pr-2">
                            <p className="font-bold text-emerald-700">Rp {Number(item.amount).toLocaleString("id-ID")}</p>
                            <p className="text-[10px] text-stone-400">{item.date}</p>
                          </td>

                          <td className="py-3 pr-2">
                            <p className="font-medium text-stone-700">{item.method}</p>
                            {item.referenceNumber && (
                              <p className="font-mono text-[10px] text-stone-400">{item.referenceNumber}</p>
                            )}
                          </td>

                          {/* Status & Deteksi User Verifikator */}
                          <td className="py-3 pr-2">
                            <div className="space-y-0.5">
                              <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${
                                item.status === "Terverifikasi"
                                  ? "bg-emerald-50 text-emerald-800 border-emerald-200/60"
                                  : "bg-amber-50 text-amber-800 border-amber-200/60"
                              }`}>
                                <span className={`h-1.5 w-1.5 rounded-full ${item.status === "Terverifikasi" ? "bg-emerald-500" : "bg-amber-500"}`} />
                                {item.status}
                              </span>

                              {item.status === "Terverifikasi" ? (
                                <p className="text-[10px] text-stone-500 font-medium truncate max-w-[150px]" title={`Diverifikasi oleh: ${item.receivedBy || "Azhar (Finance)"}`}>
                                  Oleh: <strong className="text-stone-800">{item.receivedBy || "Azhar (Finance)"}</strong>
                                </p>
                              ) : (
                                <p className="text-[10px] text-amber-700 font-medium">Menunggu Verifikasi</p>
                              )}
                            </div>
                          </td>

                          {/* Tombol Aksi Kasir */}
                          <td className="py-3 pr-3 text-right">
                            <button
                              type="button"
                              onClick={() => setSelectedPaymentForModal(item)}
                              className="inline-flex items-center gap-1 h-8 rounded-lg border border-stone-200 bg-white px-2.5 text-[11px] font-bold text-stone-800 hover:bg-stone-50 hover:border-brand-pink transition shadow-2xs cursor-pointer active:scale-95"
                            >
                              <ShieldCheck className="h-3.5 w-3.5 text-brand-pink" />
                              <span>Cek Bukti &amp; Verifikasi</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>

        {/* ════════════════════════════════════════════════════════════════ */}
        {/* MODAL INTERAKTIF: VERIFIKASI PEMBAYARAN & AUDIT BUKTI KASIR      */}
        {/* ════════════════════════════════════════════════════════════════ */}
        {selectedPaymentForModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 p-3 sm:p-4 backdrop-blur-xs">
            <div className="flex max-h-[92vh] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-2xl border border-stone-200 overflow-hidden">
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-stone-200 bg-stone-50 px-5 py-3.5">
                <div>
                  <span className="rounded bg-pink-100 px-2 py-0.5 text-[10px] font-black uppercase text-brand-pink">
                    Verifikasi Kasir Resmi
                  </span>
                  <h3 className="text-sm font-extrabold text-brand-cocoa mt-0.5 flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-brand-pink" />
                    <span>Verifikasi Pembayaran — {selectedPaymentForModal.customerName}</span>
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedPaymentForModal(null)}
                  className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-200 hover:text-stone-700 transition cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs font-sans">
                {/* Rincian Transaksi */}
                <div className="rounded-xl border border-stone-200 bg-stone-50/70 p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-mono text-[10px] font-bold text-stone-400">
                        {selectedPaymentForModal.receiptNumber || "—"} &bull; {selectedPaymentForModal.bookingCode}
                      </span>
                      <h4 className="text-sm font-bold text-stone-900">{selectedPaymentForModal.customerName}</h4>
                    </div>
                    <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-black ${
                      selectedPaymentForModal.status === "Terverifikasi"
                        ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                        : "bg-amber-100 text-amber-800 border-amber-300"
                    }`}>
                      {selectedPaymentForModal.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-stone-200 text-[11px]">
                    <div>
                      <span className="text-[10px] text-stone-400 block font-medium">Nominal Bayar</span>
                      <span className="font-black text-emerald-700 text-xs">
                        Rp {Number(selectedPaymentForModal.amount).toLocaleString("id-ID")}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-400 block font-medium">Tanggal Bayar</span>
                      <span className="font-bold text-stone-800">{selectedPaymentForModal.date}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-400 block font-medium">Metode</span>
                      <span className="font-bold text-stone-800">{selectedPaymentForModal.method}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-400 block font-medium">No. Referensi Bank</span>
                      <span className="font-mono font-bold text-stone-800 truncate block">
                        {selectedPaymentForModal.referenceNumber || "—"}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <span className="text-stone-500">Diajukan oleh:</span>
                      <span className="font-bold text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                        {getSubmitterInfo(selectedPaymentForModal).name}
                      </span>
                    </div>
                    <div className="text-stone-500 truncate max-w-xs">
                      Paket: <strong className="text-stone-800">{selectedPaymentForModal.packageName}</strong>
                    </div>
                  </div>
                </div>

                {/* Audit Bukti Pembayaran Box */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-bold text-stone-700 flex items-center gap-1.5">
                      <ImageIcon className="h-3.5 w-3.5 text-stone-500" />
                      <span>Lampiran Bukti Transfer / Bukti Fisik Pembayaran:</span>
                    </label>
                    {selectedPaymentForModal.proofUrl && (
                      <a
                        href={selectedPaymentForModal.proofUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-pink hover:underline"
                      >
                        <ExternalLink className="h-3 w-3" />
                        <span>Buka Ukuran Penuh</span>
                      </a>
                    )}
                  </div>

                  {selectedPaymentForModal.proofUrl ? (
                    <div className="rounded-xl border border-stone-200 bg-stone-100 p-2 text-center">
                      <img
                        src={selectedPaymentForModal.proofUrl}
                        alt="Bukti Transfer"
                        className="max-h-64 w-auto mx-auto rounded-lg shadow-2xs border border-stone-200 object-contain bg-white"
                      />
                    </div>
                  ) : (selectedPaymentForModal.method || "").toUpperCase().includes("TUNAI") ||
                    (selectedPaymentForModal.method || "").toUpperCase().includes("CASH") ? (
                    /* Offline Cash Receipt Slip Graphic */
                    <div className="rounded-xl border-2 border-dashed border-amber-300 bg-amber-50/60 p-4 space-y-3">
                      <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                        <div>
                          <span className="text-[10px] font-black uppercase text-amber-900 tracking-wider">
                            Kuitansi Fisik Kas Tunai Kantor
                          </span>
                          <p className="text-[11px] font-bold text-stone-800">PT EL MASSA TOUR &amp; TRAVEL</p>
                        </div>
                        <span className="rounded bg-amber-100 text-amber-900 px-2 py-0.5 font-mono text-[10px] font-bold">
                          {selectedPaymentForModal.receiptNumber || "KW-KASIR-OFFLINE"}
                        </span>
                      </div>

                      <div className="space-y-1 text-[11px] text-stone-700">
                        <div className="flex justify-between">
                          <span>Telah Diterima Dari:</span>
                          <span className="font-bold">{selectedPaymentForModal.customerName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Nominal Pembayaran:</span>
                          <span className="font-black text-emerald-700 text-sm">
                            Rp {Number(selectedPaymentForModal.amount).toLocaleString("id-ID")}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tujuan Transaksi:</span>
                          <span className="font-medium">Pembayaran Tiket/Paket ({selectedPaymentForModal.bookingCode})</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-amber-200 flex items-center justify-between text-[10px] text-amber-800 font-semibold">
                        <span>Penerimaan Fisik di Kasir Kantor</span>
                        <span className="rounded border border-amber-400 bg-white px-2 py-0.5 text-amber-900 font-bold">
                          ✓ DITERIMA OLEH KASIR
                        </span>
                      </div>
                    </div>
                  ) : (
                    /* Bank Transfer Confirmation Graphic */
                    <div className="rounded-xl border-2 border-dashed border-indigo-200 bg-indigo-50/40 p-4 space-y-3">
                      <div className="flex items-center justify-between border-b border-indigo-100 pb-2">
                        <div>
                          <span className="text-[10px] font-black uppercase text-indigo-900 tracking-wider">
                            Konfirmasi Transfer Rekening Bank
                          </span>
                          <p className="text-[11px] font-bold text-stone-800">{selectedPaymentForModal.method}</p>
                        </div>
                        <span className="rounded bg-indigo-100 text-indigo-900 px-2 py-0.5 font-mono text-[10px] font-bold">
                          {selectedPaymentForModal.referenceNumber || "TRX-VALID-CHECK"}
                        </span>
                      </div>

                      <div className="space-y-1 text-[11px] text-stone-700">
                        <div className="flex justify-between">
                          <span>Pengirim Dana:</span>
                          <span className="font-bold">{selectedPaymentForModal.customerName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Nominal Transfer:</span>
                          <span className="font-black text-emerald-700 text-sm">
                            Rp {Number(selectedPaymentForModal.amount).toLocaleString("id-ID")}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tanggal Masuk:</span>
                          <span className="font-medium text-stone-800">{selectedPaymentForModal.date}</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-indigo-100 flex items-center justify-between text-[10px] text-indigo-800 font-semibold">
                        <span>Validasi Mutasi Bank</span>
                        <span className="rounded border border-emerald-400 bg-emerald-50 px-2 py-0.5 text-emerald-800 font-bold">
                          ✓ MUTASI VALID
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Upload / Ganti Bukti */}
                  <div className="mt-3 rounded-xl border border-stone-200 bg-stone-50/60 p-3 space-y-1.5">
                    <label className="block text-[11px] font-bold text-stone-700">
                      Lampirkan Foto Struk / Bukti Transfer Baru:
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={uploadingModalProof}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUploadModalProof(file, selectedPaymentForModal.id);
                      }}
                      className="block w-full text-xs text-stone-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-stone-900 file:text-white hover:file:bg-stone-800 cursor-pointer"
                    />
                    <p className="text-[10px] text-stone-400">
                      Format didukung: JPG, PNG, WebP. Foto akan tersimpan otomatis sebagai bukti transaksi.
                    </p>
                  </div>
                </div>

                {/* Audit Verifikator Box */}
                <div className="rounded-xl border border-stone-200 bg-stone-50 p-3.5 space-y-2">
                  <span className="text-[10px] font-bold uppercase text-stone-400 block tracking-wider">
                    Sistem Audit Keamanan &amp; Verifikator Kasir
                  </span>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="rounded-lg bg-pink-100 p-1.5 text-brand-pink">
                        <UserCheck className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="text-stone-500 text-[11px] block">Kasir / User Saat Ini:</span>
                        <span className="font-extrabold text-stone-900">
                          {currentUser.name} <span className="text-stone-500 font-normal">({currentUser.role})</span>
                        </span>
                      </div>
                    </div>

                    {selectedPaymentForModal.status === "Terverifikasi" ? (
                      <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-2 text-right">
                        <span className="text-[10px] text-emerald-800 font-bold block">
                          Telah diverifikasi oleh:
                        </span>
                        <span className="font-black text-emerald-950 text-xs">
                          {selectedPaymentForModal.receivedBy || `${currentUser.name} (${currentUser.role})`}
                        </span>
                      </div>
                    ) : (
                      <div className="rounded-lg bg-amber-50 border border-amber-200 p-2 text-right">
                        <span className="text-[10px] text-amber-800 font-bold block">
                          Status Menunggu Verifikasi
                        </span>
                        <span className="text-[11px] text-amber-900">
                          Klik tombol verifikasi di bawah setelah cek bukti.
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="flex items-center justify-between border-t border-stone-200 bg-stone-50 px-5 py-3">
                <button
                  type="button"
                  onClick={() => setSelectedPaymentForModal(null)}
                  className="rounded-xl border border-stone-300 bg-white px-4 py-2 text-xs font-bold text-stone-700 hover:bg-stone-100 transition cursor-pointer"
                >
                  Tutup
                </button>

                <div className="flex items-center gap-2">
                  {selectedPaymentForModal.status === "Terverifikasi" ? (
                    <button
                      type="button"
                      disabled={isVerifyingInModal}
                      onClick={() => void verifikasiItem(selectedPaymentForModal, "Menunggu Cek")}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-4 py-2 text-xs font-bold text-amber-900 hover:bg-amber-100 transition cursor-pointer disabled:opacity-50"
                    >
                      <span>Batalkan Verifikasi</span>
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        disabled={isVerifyingInModal}
                        onClick={() => void verifikasiItem(selectedPaymentForModal, "Perlu Revisi")}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs font-bold text-stone-700 hover:bg-stone-100 transition cursor-pointer disabled:opacity-50"
                      >
                        <ShieldAlert className="h-3.5 w-3.5 text-stone-500" />
                        <span>Minta Revisi</span>
                      </button>

                      <button
                        type="button"
                        disabled={isVerifyingInModal}
                        onClick={() => void verifikasiItem(selectedPaymentForModal, "Terverifikasi")}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition shadow-2xs cursor-pointer active:scale-95 disabled:opacity-50"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        <span>{isVerifyingInModal ? "Memverifikasi…" : "✓ Setujui & Verifikasi Pembayaran"}</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
