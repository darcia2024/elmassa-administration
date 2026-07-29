"use client";

import { useState } from "react";
import { ArrowLeft, CheckCircle2, CreditCard, DollarSign, ReceiptText, Upload } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";

const activeBookings = [
  { code: "BK-2407-018", customer: "H. Rusli Suparman & Rombongan (40 Pax)", remaining: 688000000 },
  { code: "BK-2407-019", customer: "Ahmad Fauzi", remaining: 15000000 },
];

const bankAccounts = [
  "BCA Cab. Pangkalpinang - 8820912381 (a.n PT El Massa Tour)",
  "Mandiri Cab. Pangkalpinang - 16900281928 (a.n PT El Massa Tour)",
  "Bank Syariah Indonesia (BSI) - 7192839102 (a.n PT El Massa Tour)",
];

export default function PaymentFormPage() {
  const router = useRouter();
  const [selectedBookingCode, setSelectedBookingCode] = useState("BK-2407-018");
  const [paymentDate, setPaymentDate] = useState("2026-07-08");
  const [amount, setAmount] = useState(500000000);
  const [paymentMethod, setPaymentMethod] = useState("Transfer Bank");
  const [selectedAccount, setSelectedAccount] = useState(bankAccounts[0]);
  const [bankRef, setBankRef] = useState("TRX-BCA-9824001");
  const [notes, setNotes] = useState("Setoran DP 40 Jamaah Umrah Spesial Muharram asal Bangka Belitung");
  const [isSuccessToast, setIsSuccessToast] = useState(false);

  const selectedBooking = activeBookings.find((b) => b.code === selectedBookingCode) ?? activeBookings[0];
  const newRemaining = Math.max(selectedBooking.remaining - amount, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSuccessToast(true);
    setTimeout(() => {
      router.push("/pembayaran");
    }, 1500);
  };

  return (
    <AppShell eyebrow="Keuangan & Kas" title="Catat Transaksi Pembayaran">
      <div className="space-y-5">
        
        {/* Success Alert Toast */}
        {isSuccessToast && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800 flex items-center justify-between shadow-sm animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" strokeWidth={1.5} />
              <div>
                <p className="text-xs font-bold">Kuitansi Pembayaran Berhasil Diterbitkan!</p>
                <p className="text-[11px] text-emerald-700">Kuitansi KW-2407-089 terverifikasi. Mengalihkan ke halaman pembayaran...</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-[340px_1fr]">
          
          {/* Summary Card */}
          <aside className="space-y-4">
            <article className="rounded-2xl border border-stone-200/70 bg-white p-5 shadow-2xs space-y-3">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-rose-50 text-brand-pink border border-brand-pink/20">
                <ReceiptText className="h-4.5 w-4.5" strokeWidth={1.5} />
              </span>
              <div>
                <h3 className="text-sm font-bold text-brand-cocoa">Kuitansi Otomatis</h3>
                <p className="text-xs text-stone-500 mt-0.5">Nomor kuitansi resmi & status akan diterbitkan secara otomatis.</p>
              </div>

              <div className="rounded-xl border border-stone-200/60 bg-stone-50/50 p-3.5 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-stone-500">No. Kuitansi</span>
                  <span className="font-mono font-bold text-brand-cocoa">KW-2407-089</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-stone-500">Sisa Tagihan Saat Ini</span>
                  <span className="font-bold text-rose-600">Rp {selectedBooking.remaining.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between items-center border-t border-stone-200/60 pt-2">
                  <span className="text-stone-500">Nominal Diterima</span>
                  <span className="font-bold text-emerald-700">Rp {amount.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between items-center border-t border-stone-200/60 pt-2 font-bold">
                  <span className="text-stone-700">Sisa Piutang Setelah Bayar</span>
                  <span className="text-brand-cocoa">Rp {newRemaining.toLocaleString("id-ID")}</span>
                </div>
              </div>
            </article>
          </aside>

          {/* Form Interactive Card */}
          <form onSubmit={handleSubmit} className="rounded-2xl border border-stone-200/70 bg-white p-5 sm:p-6 shadow-2xs space-y-5">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-brand-cocoa">Form Catat Transaksi Masuk</h3>
                <p className="text-xs text-stone-500">Pilih kode booking, isi nominal setoran, dan pilih rekening bank tujuan.</p>
              </div>

              <Link
                href="/pembayaran"
                className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3.5 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition"
              >
                <ArrowLeft className="h-3.5 w-3.5 text-stone-500" strokeWidth={1.5} />
                Kembali
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block space-y-1 sm:col-span-2">
                <span className="text-xs font-semibold text-stone-700">Pilih Kode Booking / Jamaah</span>
                <select
                  className="w-full h-9 rounded-xl border border-stone-200 bg-white px-3.5 text-xs text-brand-cocoa font-bold outline-none focus:border-brand-pink transition shadow-2xs"
                  value={selectedBookingCode}
                  onChange={(e) => setSelectedBookingCode(e.target.value)}
                >
                  {activeBookings.map((b) => (
                    <option key={b.code} value={b.code}>
                      {b.code} — {b.customer} — (Sisa Tagihan: Rp {b.remaining.toLocaleString("id-ID")})
                    </option>
                  ))}
                </select>
              </label>

              <label className="block space-y-1">
                <span className="text-xs font-semibold text-stone-700">Tanggal Pembayaran</span>
                <input
                  type="date"
                  className="w-full h-9 rounded-xl border border-stone-200 bg-stone-50/50 px-3.5 text-xs text-brand-cocoa font-medium outline-none focus:border-brand-pink focus:bg-white transition"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                />
              </label>

              <label className="block space-y-1">
                <span className="text-xs font-semibold text-stone-700">Nominal Setoran Pembayaran (Rp)</span>
                <input
                  type="number"
                  required
                  className="w-full h-9 rounded-xl border border-stone-200 bg-stone-50/50 px-3.5 text-xs text-brand-cocoa font-bold outline-none focus:border-brand-pink focus:bg-white transition"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                />
              </label>

              <label className="block space-y-1">
                <span className="text-xs font-semibold text-stone-700">Metode Pembayaran</span>
                <select
                  className="w-full h-9 rounded-xl border border-stone-200 bg-white px-3.5 text-xs text-brand-cocoa font-medium outline-none focus:border-brand-pink transition"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="Transfer Bank">Transfer Bank</option>
                  <option value="Tunai / Kas Kantor">Tunai / Kas Kantor</option>
                  <option value="EDC Mesin">EDC Mesin Bank</option>
                </select>
              </label>

              <label className="block space-y-1">
                <span className="text-xs font-semibold text-stone-700">Rekening Kas Tujuan</span>
                <select
                  className="w-full h-9 rounded-xl border border-stone-200 bg-white px-3.5 text-xs text-brand-cocoa font-medium outline-none focus:border-brand-pink transition"
                  value={selectedAccount}
                  onChange={(e) => setSelectedAccount(e.target.value)}
                >
                  {bankAccounts.map((acc) => (
                    <option key={acc} value={acc}>{acc}</option>
                  ))}
                </select>
              </label>

              <label className="block space-y-1 sm:col-span-2">
                <span className="text-xs font-semibold text-stone-700">Nomor Referensi Bank / Struk</span>
                <input
                  className="w-full h-9 rounded-xl border border-stone-200 bg-stone-50/50 px-3.5 text-xs text-brand-cocoa font-mono font-semibold outline-none focus:border-brand-pink focus:bg-white transition"
                  value={bankRef}
                  onChange={(e) => setBankRef(e.target.value)}
                />
              </label>

              <label className="block space-y-1 sm:col-span-2">
                <span className="text-xs font-semibold text-stone-700">Catatan Kuitansi</span>
                <textarea
                  className="w-full min-h-[70px] rounded-xl border border-stone-200 bg-stone-50/50 px-3.5 py-2 text-xs text-brand-cocoa font-medium outline-none focus:border-brand-pink focus:bg-white transition"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </label>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-2 border-t border-stone-100 pt-4">
              <button
                type="button"
                onClick={() => router.push("/pembayaran")}
                className="inline-flex h-9 items-center justify-center rounded-xl border border-stone-200 bg-white px-4 text-xs font-semibold text-stone-600 hover:bg-stone-50 transition"
              >
                Batal
              </button>
              <button
                type="submit"
                className="inline-flex h-9 items-center justify-center rounded-xl bg-brand-pink px-5 text-xs font-semibold text-white shadow-2xs hover:bg-brand-pinkHover transition"
              >
                Terbitkan Kuitansi Pembayaran
              </button>
            </div>
          </form>

        </div>
      </div>
    </AppShell>
  );
}
