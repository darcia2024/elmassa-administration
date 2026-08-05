"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, ClipboardList, Plus, Trash2, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";

const defaultPackagesOptions = [
  { id: "pkg-1", name: "Umrah Spesial Muharram 11 Hari", price: 29700000, date: "08 - 18 Juli 2026 (Garuda GA-980)" },
  { id: "pkg-2", name: "Umrah Reguler 12 Hari", price: 32500000, date: "12 - 24 Agustus 2026 (Saudia SV-815)" },
  { id: "pkg-3", name: "Umrah VIP Executive", price: 45000000, date: "05 - 14 September 2026 (Emirates EK-357)" },
];

export default function BookingFormPage() {
  const router = useRouter();
  const [packagesList, setPackagesList] = useState(defaultPackagesOptions);
  const [selectedPkgId, setSelectedPkgId] = useState("pkg-1");
  const [customerName, setCustomerName] = useState("H. Rusli Suparman & Rombongan");
  const [customerPhone, setCustomerPhone] = useState("0812-7199-1001");
  const [bookingDate, setBookingDate] = useState("2026-07-08");
  const [paymentStatus, setPaymentStatus] = useState("DP");
  const [paidAmount, setPaidAmount] = useState(500000000);
  const [isSuccessToast, setIsSuccessToast] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [savedCode, setSavedCode] = useState("");

  // Real published packages from Supabase -- a fresh browser/device has no
  // localStorage cache to fall back on, so reading only localStorage here (as
  // this used to) meant a booking made from a new session could only ever
  // point at the 3 fake defaultPackagesOptions, never a real package. Falls
  // back to the localStorage cache, then the hardcoded defaults, only if the
  // live fetch genuinely comes back empty -- same ordering /paket/seat uses.
  useEffect(() => {
    const formatPackages = (parsed: any[]) =>
      parsed.map((pkg: any) => {
        const rawName = pkg.name || pkg.packageName || "Paket Umrah";
        const cleanName = rawName.split("—")[0].split("(")[0].trim();

        const rawDate = pkg.departureDate || pkg.departuresDate || "";
        const cleanDate = rawDate.includes("s/d")
          ? rawDate.split("s/d")[0].trim()
          : rawDate.split("(")[0].trim() || "Terjadwal";

        const numericPrice = pkg.numericPrice || Number(String(pkg.price || "").replace(/\D/g, "")) || 30000000;

        return {
          id: pkg.id || `custom-${Math.random()}`,
          name: cleanName,
          date: cleanDate,
          price: numericPrice,
        };
      });

    fetch("/api/packages")
      .then((res) => res.json())
      .then((json) => {
        if (json.ok && Array.isArray(json.data) && json.data.length > 0) {
          const formatted = formatPackages(json.data);
          setPackagesList(formatted);
          setSelectedPkgId(formatted[0].id);
          return;
        }
        throw new Error("Katalog paket kosong dari Supabase");
      })
      .catch(() => {
        try {
          const saved = localStorage.getItem("el_massa_published_packages");
          const parsed = saved ? JSON.parse(saved) : [];
          if (Array.isArray(parsed) && parsed.length > 0) {
            const formatted = formatPackages(parsed);
            setPackagesList(formatted);
            setSelectedPkgId(formatted[0].id);
          }
        } catch (e) {
          console.error("Failed to parse el_massa_published_packages:", e);
        }
      });
  }, []);

  const [participants, setParticipants] = useState([
    { name: "H. Rusli Suparman", passport: "C9824101", phone: "0812-7199-1001" },
    { name: "Hj. Zubaidah Mansur", passport: "C9824102", phone: "0812-7199-1002" },
  ]);

  const selectedPkg = packagesList.find((p) => p.id === selectedPkgId) ?? packagesList[0] ?? defaultPackagesOptions[0];
  const totalPrice = participants.length * selectedPkg.price;
  const remainingAmount = Math.max(totalPrice - paidAmount, 0);

  const handleAddParticipant = () => {
    setParticipants([
      ...participants,
      {
        name: `Jamaah Peserta ${participants.length + 1}`,
        passport: `C982${4100 + participants.length + 1}`,
        phone: `0812-7199-${1000 + participants.length + 1}`,
      },
    ]);
  };

  const handleRemoveParticipant = (index: number) => {
    if (participants.length <= 1) return;
    setParticipants(participants.filter((_, i) => i !== index));
  };

  const handleUpdateParticipant = (index: number, field: string, value: string) => {
    const updated = [...participants];
    updated[index] = { ...updated[index], [field]: value };
    setParticipants(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const code = `BK-${Date.now().toString().slice(-6)}`;
    const newBooking = {
      code,
      customer: customerName || "Jamaah Terdaftar",
      phone: customerPhone || "-",
      packageId: selectedPkg.id,
      packageName: selectedPkg.name,
      departure: selectedPkg.date,
      groupName: "Rombongan Jamaah",
      participants: participants.length,
      participantsList: participants.map((p) => ({
        name: p.name,
        passport: p.passport || "C" + Math.floor(1000000 + Math.random() * 9000000),
        contact: p.phone || customerPhone || "-",
        documentStatus: "Belum Lengkap" as const,
        roomType: "Quad (Sekamar Ber-4)",
      })),
      totalAmount: totalPrice,
      paidAmount,
      createdDate: new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }),
    };

    // Supabase is the record — wait for it before treating this as saved.
    // A booking that only "looks" saved (localStorage written, navigated away)
    // while the server call is still in flight or has failed disappears the
    // moment the real list is fetched, with no sign anything went wrong.
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBooking),
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        setSubmitError(payload?.error ?? "Gagal menyimpan booking ke server. Data tidak disimpan.");
        return;
      }

      try {
        const existingStr = localStorage.getItem("el_massa_real_bookings");
        const existing = existingStr ? JSON.parse(existingStr) : [];
        localStorage.setItem("el_massa_real_bookings", JSON.stringify([newBooking, ...existing]));

        const newNotif = {
          id: `notif-${Date.now()}`,
          title: "📋 Booking Baru Terdaftar",
          message: `Booking ${code} a.n ${newBooking.customer} (${participants.length} Pax) telah tersimpan.`,
          time: "Baru saja",
          category: "Keuangan",
          read: false,
          link: "/booking",
        };
        const existingNotifStr = localStorage.getItem("el_massa_real_notifications");
        const existingNotifs = existingNotifStr ? JSON.parse(existingNotifStr) : [];
        localStorage.setItem("el_massa_real_notifications", JSON.stringify([newNotif, ...existingNotifs]));
      } catch (cacheErr) {
        // The cache is only a paint-before-network preview; losing it is not
        // a reason to tell the user the save failed.
        console.error(cacheErr);
      }

      setSavedCode(code);
      setIsSuccessToast(true);
      setTimeout(() => {
        router.push("/booking");
      }, 1500);
    } catch (err) {
      console.error(err);
      setSubmitError("Tidak bisa menghubungi server. Data tidak disimpan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppShell eyebrow="Operasional Booking" title="Form Reservasi Booking Baru">
      <div className="space-y-5">
        
        {/* Success Alert Toast */}
        {isSuccessToast && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800 flex items-center justify-between shadow-sm animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" strokeWidth={1.5} />
              <div>
                <p className="text-xs font-bold">Booking Berhasil Disimpan & Diterbitkan!</p>
                <p className="text-[11px] text-emerald-700">Kode Booking {savedCode} tersimpan di server. Mengalihkan ke daftar booking...</p>
              </div>
            </div>
          </div>
        )}

        {submitError && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-800 flex items-center gap-2.5 shadow-sm">
            <ClipboardList className="h-5 w-5 text-rose-600 shrink-0" strokeWidth={1.5} />
            <p className="text-xs font-semibold">{submitError}</p>
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-[340px_1fr]">
          
          {/* Summary Sidebar Card */}
          <aside className="space-y-4">
            <article className="rounded-2xl border border-stone-200/70 bg-white p-5 shadow-2xs space-y-3">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-rose-50 text-brand-pink border border-brand-pink/20">
                <ClipboardList className="h-4.5 w-4.5" strokeWidth={1.5} />
              </span>
              <div>
                <h3 className="text-sm font-bold text-brand-cocoa">Kalkulasi Booking Otomatis</h3>
                <p className="text-xs text-stone-500 mt-0.5">Ringkasan estimasi total harga & sisa tagihan secara real-time.</p>
              </div>

              <div className="rounded-xl border border-stone-200/60 bg-stone-50/50 p-3.5 space-y-2.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-stone-500">Jumlah Peserta</span>
                  <span className="font-bold text-brand-cocoa">{participants.length} Jamaah</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-stone-500">Harga / Pax</span>
                  <span className="font-medium text-stone-700">Rp {selectedPkg.price.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between items-center border-t border-stone-200/60 pt-2 font-bold">
                  <span className="text-stone-700">Total Tagihan</span>
                  <span className="text-brand-pink text-sm">Rp {totalPrice.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-stone-500">Pembayaran Masuk</span>
                  <span className="font-semibold text-emerald-700">Rp {paidAmount.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between items-center border-t border-stone-200/60 pt-2 font-bold">
                  <span className="text-stone-700">Sisa Tagihan</span>
                  <span className="text-rose-600 font-extrabold">Rp {remainingAmount.toLocaleString("id-ID")}</span>
                </div>
              </div>
            </article>
          </aside>

          {/* Form Interactive Card */}
          <form onSubmit={handleSubmit} className="rounded-2xl border border-stone-200/70 bg-white p-5 sm:p-6 shadow-2xs space-y-5">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-brand-cocoa">Data Reservasi Booking</h3>
                <p className="text-xs text-stone-500">Isi data pemesan, pilih paket wisata, dan daftarkan nama peserta.</p>
              </div>

              <Link
                href="/booking"
                className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3.5 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition"
              >
                <ArrowLeft className="h-3.5 w-3.5 text-stone-500" strokeWidth={1.5} />
                Kembali
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block space-y-1">
                <span className="text-xs font-semibold text-stone-700">Nama Pemesan / Rombongan</span>
                <input
                  required
                  className="w-full h-9 rounded-xl border border-stone-200 bg-stone-50/50 px-3.5 text-xs text-brand-cocoa font-medium outline-none focus:border-brand-pink focus:bg-white transition"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </label>

              <label className="block space-y-1">
                <span className="text-xs font-semibold text-stone-700">No. WhatsApp Pemesan</span>
                <input
                  required
                  className="w-full h-9 rounded-xl border border-stone-200 bg-stone-50/50 px-3.5 text-xs text-brand-cocoa font-medium outline-none focus:border-brand-pink focus:bg-white transition"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                />
              </label>

              <label className="block space-y-1 sm:col-span-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-stone-700">Pilih Paket Wisata & Keberangkatan</span>
                  <Link href="/paket/kalkulator" className="text-[11px] font-bold text-brand-pink hover:underline">
                    + Buat Paket Baru di Kalkulator
                  </Link>
                </div>
                <select
                  className="w-full h-9 rounded-xl border border-stone-200 bg-white px-3.5 text-xs text-brand-cocoa font-semibold outline-none focus:border-brand-pink transition shadow-2xs"
                  value={selectedPkgId}
                  onChange={(e) => setSelectedPkgId(e.target.value)}
                >
                  {packagesList.map((pkg) => (
                    <option key={pkg.id} value={pkg.id}>
                      {pkg.name} ({pkg.date}) — Rp {pkg.price.toLocaleString("id-ID")} / Pax
                    </option>
                  ))}
                </select>
              </label>

              <label className="block space-y-1">
                <span className="text-xs font-semibold text-stone-700">Tanggal Transaksi Booking</span>
                <input
                  type="date"
                  className="w-full h-9 rounded-xl border border-stone-200 bg-stone-50/50 px-3.5 text-xs text-brand-cocoa font-medium outline-none focus:border-brand-pink focus:bg-white transition"
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                />
              </label>

              <label className="block space-y-1">
                <span className="text-xs font-semibold text-stone-700">Nominal DP / Setoran Awal (Rp)</span>
                <input
                  type="number"
                  className="w-full h-9 rounded-xl border border-stone-200 bg-stone-50/50 px-3.5 text-xs text-brand-cocoa font-bold outline-none focus:border-brand-pink focus:bg-white transition"
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(Number(e.target.value))}
                />
              </label>
            </div>

            {/* Participants Section */}
            <div className="rounded-xl border border-stone-200/70 bg-stone-50/40 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-brand-pink" strokeWidth={1.5} />
                  <h4 className="text-xs font-bold text-brand-cocoa uppercase tracking-wider">Daftar Peserta Jamaah ({participants.length})</h4>
                </div>
                <button
                  type="button"
                  onClick={handleAddParticipant}
                  className="inline-flex h-8 items-center gap-1 rounded-xl bg-brand-pink px-3 text-xs font-semibold text-white shadow-2xs hover:bg-brand-pinkHover transition"
                >
                  <Plus className="h-3.5 w-3.5" strokeWidth={1.5} />
                  <span>Tambah Jamaah</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {participants.map((p, index) => (
                  <div key={index} className="grid gap-2.5 rounded-xl border border-stone-200/60 bg-white p-3 sm:grid-cols-12 items-center">
                    <span className="sm:col-span-1 text-[11px] font-mono font-bold text-stone-400">#{index + 1}</span>
                    <input
                      placeholder="Nama Lengkap Paspor"
                      className="sm:col-span-4 h-8 rounded-lg border border-stone-200 px-2.5 text-xs font-medium outline-none focus:border-brand-pink"
                      value={p.name}
                      onChange={(e) => handleUpdateParticipant(index, "name", e.target.value)}
                    />
                    <input
                      placeholder="No. Paspor RI"
                      className="sm:col-span-3 h-8 rounded-lg border border-stone-200 px-2.5 text-xs font-mono font-bold outline-none focus:border-brand-pink"
                      value={p.passport}
                      onChange={(e) => handleUpdateParticipant(index, "passport", e.target.value)}
                    />
                    <input
                      placeholder="No. HP Jamaah"
                      className="sm:col-span-3 h-8 rounded-lg border border-stone-200 px-2.5 text-xs font-mono outline-none focus:border-brand-pink"
                      value={p.phone}
                      onChange={(e) => handleUpdateParticipant(index, "phone", e.target.value)}
                    />
                    <div className="sm:col-span-1 text-right">
                      {participants.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveParticipant(index)}
                          className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 transition"
                        >
                          <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-2 border-t border-stone-100 pt-4">
              <button
                type="button"
                onClick={() => router.push("/booking")}
                className="inline-flex h-9 items-center justify-center rounded-xl border border-stone-200 bg-white px-4 text-xs font-semibold text-stone-600 hover:bg-stone-50 transition"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex h-9 items-center justify-center rounded-xl bg-brand-pink px-5 text-xs font-semibold text-white shadow-2xs hover:bg-brand-pinkHover transition disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? "Menyimpan..." : "Simpan & Terbit Booking"}
              </button>
            </div>
          </form>

        </div>
      </div>
    </AppShell>
  );
}
