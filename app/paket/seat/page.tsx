"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Users,
  Search,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ArrowLeft,
  Plane,
  Calendar,
  Hotel,
  Plus,
  Edit3,
  Save,
  Armchair,
} from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";

type SeatPackageItem = {
  id: string;
  name: string;
  category: string;
  departureDate: string;
  price: string;
  makkahHotel: string;
  madinahHotel: string;
  airline: string;
  totalSeats: number; // Target quota seats (default 45)
  bookedSeats: number; // Real seats booked
  posterImg?: string;
};

export default function UpdateSeatPage() {
  const [packages, setPackages] = useState<SeatPackageItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<"semua" | "tersedia" | "hampir_penuh" | "full">("semua");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempSeatsInput, setTempSeatsInput] = useState<number>(45);

  useEffect(() => {
    // 1. Fetch real packages & real bookings concurrently from Supabase Cloud DB
    Promise.all([
      fetch("/api/packages").then((r) => r.json()).catch(() => ({ ok: false })),
      fetch("/api/bookings").then((r) => r.json()).catch(() => ({ ok: false })),
    ]).then(([pkgRes, bookRes]) => {
      let rawPkgs: any[] = [];
      if (pkgRes.ok && Array.isArray(pkgRes.data) && pkgRes.data.length > 0) {
        rawPkgs = pkgRes.data;
      } else {
        const savedStr = localStorage.getItem("el_massa_published_packages");
        if (savedStr) rawPkgs = JSON.parse(savedStr);
      }

      let realBookings: any[] = [];
      if (bookRes.ok && Array.isArray(bookRes.data)) {
        realBookings = bookRes.data;
      } else {
        try {
          const bStr = localStorage.getItem("el_massa_real_bookings");
          if (bStr) realBookings = JSON.parse(bStr);
        } catch (e) {}
      }

      const mapped: SeatPackageItem[] = rawPkgs.map((pkg: any) => {
        // Real match: bookings created after the packageId fix carry the
        // package's real id. Older bookings (or ones from before that fix)
        // fall back to a fuzzy name match so their seats still count.
        const pkgNameClean = (pkg.name || "").split("—")[0].split("(")[0].trim().toLowerCase();

        const matchingBookings = realBookings.filter((b) => {
          if (b.packageId) return b.packageId === pkg.id;
          const bPkgName = (b.packageName || "").split("—")[0].split("(")[0].trim().toLowerCase();
          return bPkgName.includes(pkgNameClean) || pkgNameClean.includes(bPkgName);
        });

        const totalBooked = matchingBookings.reduce((sum, b) => sum + (Number(b.participants) || 1), 0);

        return {
          id: pkg.id || `pkg-${Date.now()}`,
          name: pkg.name || "Paket Umrah El Massa",
          category: pkg.category || "Oktober",
          departureDate: pkg.departureDate || pkg.departuresDate || "Terjadwal 2026",
          price: pkg.price || "Rp 33.500.000",
          makkahHotel: pkg.makkahHotel || "Grand Al Massa",
          madinahHotel: pkg.madinahHotel || "Daar El Naeem",
          airline: pkg.airline || "Saudia / Garuda",
          totalSeats: Number(pkg.targetPax) || 45,
          bookedSeats: totalBooked,
          posterImg: pkg.posterImg,
        };
      });

      setPackages(mapped);
    });
  }, []);

  // Update target seat quota -- persisted to Supabase, not localStorage, so
  // the quota staff sets is the same one every device sees.
  const [savingQuotaId, setSavingQuotaId] = useState<string | null>(null);
  const [quotaError, setQuotaError] = useState<string | null>(null);

  const handleSaveSeatQuota = async (id: string) => {
    const targetPax = Math.max(1, tempSeatsInput);
    setSavingQuotaId(id);
    setQuotaError(null);

    try {
      const res = await fetch(`/api/packages/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetPax }),
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        setQuotaError(payload?.error ?? "Gagal menyimpan kuota seat.");
        return;
      }

      setPackages((prev) => prev.map((p) => (p.id === id ? { ...p, totalSeats: targetPax } : p)));
      setEditingId(null);
    } catch (e) {
      console.error(e);
      setQuotaError("Tidak bisa menghubungi server.");
    } finally {
      setSavingQuotaId(null);
    }
  };

  const filteredPackages = useMemo(() => {
    return packages.filter((pkg) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        pkg.name.toLowerCase().includes(q) ||
        pkg.category.toLowerCase().includes(q) ||
        pkg.airline.toLowerCase().includes(q);

      const remaining = pkg.totalSeats - pkg.bookedSeats;

      let matchesStatus = true;
      if (selectedFilter === "tersedia") matchesStatus = remaining > 10;
      else if (selectedFilter === "hampir_penuh") matchesStatus = remaining > 0 && remaining <= 10;
      else if (selectedFilter === "full") matchesStatus = remaining <= 0;

      return matchesSearch && matchesStatus;
    });
  }, [packages, searchQuery, selectedFilter]);

  const grandTotalQuota = useMemo(() => packages.reduce((s, p) => s + p.totalSeats, 0), [packages]);
  const grandTotalBooked = useMemo(() => packages.reduce((s, p) => s + p.bookedSeats, 0), [packages]);
  const grandTotalRemaining = useMemo(() => Math.max(0, grandTotalQuota - grandTotalBooked), [grandTotalQuota, grandTotalBooked]);

  return (
    <AppShell eyebrow="Manajemen Quota & Seat" title="Update Seat & Monitoring Sisa Kuota Jamaah">
      <div className="space-y-6">
        
        {/* Top Control Bar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-brand-pink transition"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
            <span>Kembali ke Dashboard</span>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/paket"
              className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-4 text-xs font-bold text-stone-700 shadow-2xs hover:bg-stone-50 transition"
            >
              <span>+ Tambah Grup di Jadwal Keberangkatan</span>
            </Link>
          </div>
        </div>

        {quotaError && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-bold text-rose-700">
            {quotaError}
          </div>
        )}

        {/* 📊 SUMMARY SEAT METRICS BANNER */}
        <section className="grid gap-4 sm:grid-cols-3">
          
          <div className="rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50 to-orange-50/40 p-5 shadow-2xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">Total Quota Seat</span>
              <span className="p-2 rounded-xl bg-amber-100/80 text-amber-800 border border-amber-200/60">
                <Armchair className="h-4 w-4" />
              </span>
            </div>
            <p className="text-3xl font-black text-amber-950">{grandTotalQuota} <span className="text-sm font-bold text-amber-800">Seat</span></p>
            <p className="text-[11px] font-medium text-amber-700">Total kapasitas kuota dari {packages.length} grup paket</p>
          </div>

          <div className="rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50 to-teal-50/40 p-5 shadow-2xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">Seat Terisi (Booked)</span>
              <span className="p-2 rounded-xl bg-emerald-100/80 text-emerald-800 border border-emerald-200/60">
                <Users className="h-4 w-4" />
              </span>
            </div>
            <p className="text-3xl font-black text-emerald-950">{grandTotalBooked} <span className="text-sm font-bold text-emerald-800">Pax</span></p>
            <p className="text-[11px] font-medium text-emerald-700">Jamaah yang sudah mendaftar & bayar DP</p>
          </div>

          <div className="rounded-2xl border border-rose-200/80 bg-gradient-to-br from-rose-50 to-pink-50/40 p-5 shadow-2xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-brand-cocoa uppercase tracking-wider">Sisa Seat Tersedia</span>
              <span className="p-2 rounded-xl bg-rose-100/80 text-brand-pink border border-brand-pink/20">
                <Sparkles className="h-4 w-4" />
              </span>
            </div>
            <p className="text-3xl font-black text-brand-pink">{grandTotalRemaining} <span className="text-sm font-bold text-rose-800">Seat Ready</span></p>
            <p className="text-[11px] font-medium text-rose-700">Siap dipasarkan & booking langsung</p>
          </div>

        </section>

        {/* SEARCH & FILTER BAR */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-stone-200/70 shadow-2xs">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" strokeWidth={1.5} />
            <input
              type="text"
              placeholder="Cari nama paket, maskapai..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 h-10 text-xs font-medium bg-stone-50 border border-stone-200 rounded-xl outline-none focus:border-brand-pink transition"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {(["semua", "tersedia", "hampir_penuh", "full"] as const).map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setSelectedFilter(filter)}
                className={`h-9 px-4 rounded-xl text-xs font-bold capitalize transition whitespace-nowrap cursor-pointer ${
                  selectedFilter === filter
                    ? "bg-[#2a170e] text-amber-200 shadow-xs"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                }`}
              >
                {filter === "hampir_penuh" ? "Hampir Penuh (≤10 Seat)" : filter}
              </button>
            ))}
          </div>
        </div>

        {/* 📋 LIST GRUP PAKET & MONITORING SEAT */}
        {filteredPackages.length === 0 ? (
          <div className="rounded-2xl border border-stone-200/90 bg-white p-10 text-center space-y-4 shadow-2xs">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-amber-50 text-2xl shadow-inner border border-amber-100">
              💺
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-stone-900">
                Belum ada grup paket umrah aktif
              </h3>
              <p className="text-xs text-stone-500 max-w-md mx-auto">
                Monitoring kuota seat akan tampil otomatis begitu kamu membuat paket baru dari Kalkulator HPP.
              </p>
            </div>
            <Link
              href="/paket/kalkulator"
              className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-brand-pink px-5 text-xs font-extrabold text-white shadow-xs hover:bg-brand-pinkHover active:scale-95 transition cursor-pointer"
            >
              <Plus className="h-4 w-4 text-white" />
              <span>+ Hitung HPP & Buat Paket Wisata</span>
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {filteredPackages.map((pkg) => {
            const remaining = Math.max(0, pkg.totalSeats - pkg.bookedSeats);
            const percentageUsed = Math.min(100, Math.round((pkg.bookedSeats / pkg.totalSeats) * 100));

            let statusBadge = {
              label: "Tersedia",
              bg: "bg-emerald-50 text-emerald-800 border-emerald-200",
              dot: "bg-emerald-500",
            };

            if (remaining === 0) {
              statusBadge = {
                label: "SEAT FULL (HABIS)",
                bg: "bg-rose-50 text-rose-800 border-rose-200",
                dot: "bg-rose-500",
              };
            } else if (remaining <= 10) {
              statusBadge = {
                label: `HAMPIR PENUH (Sisa ${remaining} Seat!)`,
                bg: "bg-amber-50 text-amber-900 border-amber-200",
                dot: "bg-amber-500",
              };
            }

            return (
              <article
                key={pkg.id}
                className="rounded-2xl border border-stone-200 bg-white p-5 shadow-2xs hover:border-pink-300 transition space-y-4"
              >
                {/* Header Card */}
                <div className="flex items-start justify-between gap-3 border-b border-stone-100 pb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-pink-600 bg-rose-50 border border-pink-200 px-2.5 py-0.5 rounded-full">
                      Paket {pkg.category} 2026
                    </span>
                    <h3 className="text-base font-extrabold text-stone-900 mt-1">{pkg.name}</h3>
                    <p className="text-xs text-stone-500 flex items-center gap-1.5 mt-0.5">
                      <Calendar className="h-3.5 w-3.5 text-stone-400" />
                      <span>Keberangkatan: <strong>{pkg.departureDate}</strong></span>
                    </p>
                  </div>

                  <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-extrabold shrink-0 ${statusBadge.bg}`}>
                    <span className={`h-2 w-2 rounded-full ${statusBadge.dot}`} />
                    {statusBadge.label}
                  </span>
                </div>

                {/* Hotel & Airline Specs */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-xl border border-stone-200/60 bg-stone-50/60 p-2.5 space-y-0.5">
                    <p className="text-[10px] font-semibold text-stone-400 uppercase flex items-center gap-1">
                      <Hotel className="h-3 w-3 text-brand-pink" /> Hotel Makkah
                    </p>
                    <p className="font-bold text-stone-900 truncate">{pkg.makkahHotel}</p>
                  </div>

                  <div className="rounded-xl border border-stone-200/60 bg-stone-50/60 p-2.5 space-y-0.5">
                    <p className="text-[10px] font-semibold text-stone-400 uppercase flex items-center gap-1">
                      <Hotel className="h-3 w-3 text-emerald-600" /> Hotel Madinah
                    </p>
                    <p className="font-bold text-stone-800 truncate">{pkg.madinahHotel}</p>
                  </div>
                </div>

                {/* 💺 VISUAL SEAT PROGRESS BAR */}
                <div className="rounded-xl border border-stone-200/80 bg-stone-50/40 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-extrabold text-stone-900">Sisa Seat Tersedia:</p>
                      <p className="text-2xl font-black text-brand-pink">{remaining} <span className="text-xs font-bold text-stone-600">Seat</span></p>
                    </div>

                    <div className="text-right">
                      <p className="text-[11px] font-bold text-stone-600">Terisi (Booked): <span className="text-emerald-800 font-extrabold">{pkg.bookedSeats} Pax</span></p>
                      <p className="text-[11px] font-bold text-stone-500">Kapasitas Quota: <span className="text-stone-900 font-extrabold">{pkg.totalSeats} Seat</span></p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold text-stone-500">
                      <span>Okupansi Seat</span>
                      <span>{percentageUsed}% Terisi</span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-stone-200">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          percentageUsed >= 90
                            ? "bg-rose-600"
                            : percentageUsed >= 70
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                        }`}
                        style={{ width: `${percentageUsed}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* ACTION & SEAT EDIT CONTROLS */}
                <div className="flex items-center justify-between pt-1 gap-2">
                  {editingId === pkg.id ? (
                    <div className="flex items-center gap-2 w-full">
                      <input
                        type="number"
                        value={tempSeatsInput}
                        onChange={(e) => setTempSeatsInput(parseInt(e.target.value, 10) || 1)}
                        className="h-9 w-24 rounded-xl border border-stone-300 px-3 text-xs font-bold text-stone-900 outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveSeatQuota(pkg.id)}
                        disabled={savingQuotaId === pkg.id}
                        className="h-9 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1 transition shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Save className="h-3.5 w-3.5" />
                        <span>{savingQuotaId === pkg.id ? "Menyimpan..." : "Simpan Quota"}</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(pkg.id);
                        setTempSeatsInput(pkg.totalSeats);
                      }}
                      className="h-9 px-3 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-xs font-bold text-stone-700 flex items-center gap-1.5 transition"
                    >
                      <Edit3 className="h-3.5 w-3.5 text-stone-500" />
                      <span>Ubah Target Quota Seat</span>
                    </button>
                  )}

                  <Link
                    href="/booking/form"
                    className="h-9 px-4 rounded-xl bg-brand-pink hover:bg-brand-pinkHover text-white font-extrabold text-xs flex items-center gap-1 shadow-2xs transition shrink-0"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Daftar / Booking Seat</span>
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
      </div>
    </AppShell>
  );
}
