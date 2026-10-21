"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Plus, Sparkles, Building2, Calendar, Plane, Users, Banknote } from "lucide-react";

interface ModalTambahGroupProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (newGroup: { id: string; name: string }) => void;
}

export function ModalTambahGroup({ isOpen, onClose, onSuccess }: ModalTambahGroupProps) {
  const router = useRouter();

  const [name, setName] = useState("");
  const [category, setCategory] = useState("Umrah Reguler");
  const [duration, setDuration] = useState("12 Hari");
  const [departureDate, setDepartureDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [targetPax, setTargetPax] = useState("45");
  const [makkahHotel, setMakkahHotel] = useState("Grand Al Massa ⭐5");
  const [madinahHotel, setMadinahHotel] = useState("Daar El Naeem ⭐4");
  const [airline, setAirline] = useState("Garuda Indonesia");
  const [price, setPrice] = useState("Rp 28.500.000");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("Nama grup / paket keberangkatan wajib diisi.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const pkgId = `pkg-${Date.now()}`;
      const payload = {
        id: pkgId,
        name: name.trim().toUpperCase(),
        category,
        duration,
        departureDate,
        returnDate,
        targetPax: parseInt(targetPax, 10) || 45,
        makkahHotel: makkahHotel.trim(),
        madinahHotel: madinahHotel.trim(),
        airline: airline.trim(),
        price,
        numericPrice: parseInt(price.replace(/\D/g, ""), 10) || 0,
      };

      const res = await fetch("/api/packages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json?.ok) {
        throw new Error(json?.error || "Gagal membuat grup keberangkatan.");
      }

      onClose();
      if (onSuccess) {
        onSuccess({ id: pkgId, name: payload.name });
      } else {
        router.push(`/jamaah?grup=${encodeURIComponent(payload.name)}`);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Terjadi kesalahan saat menyimpan grup.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-stone-200 bg-white p-6 shadow-2xl space-y-5 my-8">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-rose-50 text-brand-pink font-bold border border-brand-pink/20">
              <Plus className="h-5 w-5" strokeWidth={2} />
            </span>
            <div>
              <h3 className="text-base font-extrabold text-brand-cocoa">Tambah Grup Keberangkatan Baru</h3>
              <p className="text-xs text-stone-500">Buat rombongan paket umrah baru untuk mulai mendata jamaah</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
              Nama Grup / Paket Keberangkatan *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="cth. UMRAH DESEMBER 2026 AKHIR TAHUN"
              className="w-full h-10 px-3 rounded-xl border border-stone-200 bg-stone-50 text-xs font-bold text-stone-900 uppercase focus:outline-none focus:border-brand-pink focus:bg-white transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                Kategori Paket
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-stone-200 bg-stone-50 text-xs font-medium text-stone-800 focus:outline-none focus:border-brand-pink"
              >
                <option value="Umrah Reguler">Umrah Reguler</option>
                <option value="Umrah Spesial Ustadz">Umrah Spesial Ustadz</option>
                <option value="Umrah Plus Turki">Umrah Plus Turki</option>
                <option value="Umrah VIP / Private">Umrah VIP / Private</option>
                <option value="Umrah Ramadhan">Umrah Ramadhan</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                Durasi Program
              </label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="12 Hari"
                className="w-full h-10 px-3 rounded-xl border border-stone-200 bg-stone-50 text-xs font-medium text-stone-800 focus:outline-none focus:border-brand-pink"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1">
                <Calendar className="h-3 w-3 text-stone-400" />
                <span>Tgl Berangkat</span>
              </label>
              <input
                type="date"
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-stone-200 bg-stone-50 text-xs font-medium text-stone-800 focus:outline-none focus:border-brand-pink"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1">
                <Calendar className="h-3 w-3 text-stone-400" />
                <span>Tgl Pulang</span>
              </label>
              <input
                type="date"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-stone-200 bg-stone-50 text-xs font-medium text-stone-800 focus:outline-none focus:border-brand-pink"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1">
                <Users className="h-3 w-3 text-stone-400" />
                <span>Target Kuota (Seat)</span>
              </label>
              <input
                type="number"
                value={targetPax}
                onChange={(e) => setTargetPax(e.target.value)}
                placeholder="45"
                className="w-full h-10 px-3 rounded-xl border border-stone-200 bg-stone-50 text-xs font-medium text-stone-800 focus:outline-none focus:border-brand-pink"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1">
                <Plane className="h-3 w-3 text-stone-400" />
                <span>Maskapai Penerbangan</span>
              </label>
              <input
                type="text"
                value={airline}
                onChange={(e) => setAirline(e.target.value)}
                placeholder="Garuda Indonesia"
                className="w-full h-10 px-3 rounded-xl border border-stone-200 bg-stone-50 text-xs font-medium text-stone-800 focus:outline-none focus:border-brand-pink"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1">
                <Building2 className="h-3 w-3 text-stone-400" />
                <span>Hotel Makkah</span>
              </label>
              <input
                type="text"
                value={makkahHotel}
                onChange={(e) => setMakkahHotel(e.target.value)}
                placeholder="Grand Al Massa ⭐5"
                className="w-full h-10 px-3 rounded-xl border border-stone-200 bg-stone-50 text-xs font-medium text-stone-800 focus:outline-none focus:border-brand-pink"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1">
                <Building2 className="h-3 w-3 text-stone-400" />
                <span>Hotel Madinah</span>
              </label>
              <input
                type="text"
                value={madinahHotel}
                onChange={(e) => setMadinahHotel(e.target.value)}
                placeholder="Daar El Naeem ⭐4"
                className="w-full h-10 px-3 rounded-xl border border-stone-200 bg-stone-50 text-xs font-medium text-stone-800 focus:outline-none focus:border-brand-pink"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1">
              <Banknote className="h-3 w-3 text-stone-400" />
              <span>Estimasi Harga per Pax</span>
            </label>
            <input
              type="text"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Rp 28.500.000"
              className="w-full h-10 px-3 rounded-xl border border-stone-200 bg-stone-50 text-xs font-semibold text-emerald-800 focus:outline-none focus:border-brand-pink"
            />
          </div>

          <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
            <a
              href="/paket/kalkulator"
              className="text-[11px] font-bold text-stone-500 hover:text-brand-pink transition"
            >
              Atau kalkulasi via Kalkulator HPP & Costing →
            </a>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="h-10 px-4 rounded-xl border border-stone-200 bg-white text-xs font-bold text-stone-600 hover:bg-stone-50 transition"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="h-10 px-5 rounded-xl bg-brand-pink text-white text-xs font-bold hover:bg-brand-pinkHover shadow-2xs transition disabled:opacity-50"
              >
                {isSubmitting ? "Menyimpan…" : "Simpan & Buka Grup"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
