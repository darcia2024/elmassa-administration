"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  CalendarDays,
  Clock,
  Compass,
  MapPin,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Hotel,
  Plane,
  ShieldCheck,
  Award,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";

const WA_NUMBER = "6281249476778";
const openWA = (text: string) => {
  window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`, "_blank");
};

interface PackageItem {
  id: string;
  name: string;
  category: string;
  duration: string;
  departuresDate?: string;
  departureDate?: string;
  price: string;
  dpMinimum?: string;
  makkahHotel?: string;
  madinahHotel?: string;
  airline?: string;
  startPoint?: string;
  programUmrah?: string;
  itinerary?: Array<{
    day: number;
    title: string;
    location?: string;
    activities: Array<{ time?: string; description: string }>;
  }>;
}

export default function ItineraryLandingPreviewPage() {
  const [packagesList, setPackagesList] = useState<PackageItem[]>([]);
  const [selectedPkgId, setSelectedPkgId] = useState<string>("");
  const [viewMode, setViewMode] = useState<"detail" | "live">("detail");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/packages")
      .then((res) => res.json())
      .then((res) => {
        if (res.ok && Array.isArray(res.data) && res.data.length > 0) {
          setPackagesList(res.data);
          setSelectedPkgId(res.data[0].id);
        }
      })
      .catch((e) => console.error("Fetch packages error:", e))
      .finally(() => setLoading(false));
  }, []);

  const activePackage = packagesList.find((p) => p.id === selectedPkgId) || packagesList[0];

  return (
    <AppShell title="Live Sync Standalone Web App (itinerary.elmassa-weld)">
      <div className="space-y-8 font-sans max-w-5xl mx-auto pb-12">
        
        {/* HERO BANNER SECTION - SOLID DEEP BROWN (#2A170E) */}
        <div className="relative overflow-hidden rounded-3xl bg-[#2a170e] text-white p-6 sm:p-10 shadow-xl border border-[#3d2417]">
          <div className="relative z-10 space-y-4 max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#3d2417] border border-[#523221] px-4 py-1.5 text-xs font-bold text-amber-200">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span>Sinkron 100% Real-Time ke Standalone Web App (itinerary.elmassa-weld)</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-white leading-tight">
              Rencana Perjalanan Ibadah Umrah <span className="text-pink-400">El Massa Tour & Travel</span>
            </h1>

            <p className="text-xs sm:text-sm text-amber-100/80 leading-relaxed max-w-2xl">
              Tampilan brosur &amp; itinerary interaktif yang tersinkronisasi 100% otomatis antara Web Admin Sistem dan Standalone Landing Page <strong>itinerary.elmassa-weld</strong>.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-3">
              <button
                type="button"
                onClick={() => openWA(`Halo El Massa, saya tertarik konsultasi itinerary paket ${activePackage?.name || ""}`)}
                className="h-11 px-5 rounded-xl bg-pink-600 hover:bg-pink-700 font-extrabold text-xs text-white shadow-lg transition flex items-center gap-2 cursor-pointer"
              >
                <span>Konsultasi Itinerary via WA</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <a
                href="https://itinerary.elmassa.weld.vercel.app/"
                target="_blank"
                rel="noreferrer"
                className="h-11 px-4 rounded-xl bg-[#3d2417] hover:bg-[#4d2d1d] border border-[#523221] text-xs font-bold text-amber-100 transition flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <ExternalLink className="h-4 w-4 text-amber-400" />
                <span>Buka Standalone App (itinerary.elmassa.weld) ↗</span>
              </a>

              <Link
                href="/paket/kalkulator"
                className="h-11 px-4 rounded-xl border border-[#4d2d1d] bg-[#1e1009] text-xs font-bold text-stone-300 hover:bg-[#2a170e] transition flex items-center gap-1.5"
              >
                <span>Edit HPP di Web Admin</span>
              </Link>
            </div>
          </div>
        </div>

        {/* PACKAGE TAB SELECTOR (DYNAMIC FROM SUPABASE) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-4">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {loading ? (
              <span className="text-xs text-stone-500 animate-pulse font-medium">Memuat daftar paket dari Supabase...</span>
            ) : packagesList.length > 0 ? (
              packagesList.map((pkg) => (
                <button
                  key={pkg.id}
                  type="button"
                  onClick={() => setSelectedPkgId(pkg.id)}
                  className={`h-10 px-5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                    activePackage?.id === pkg.id
                      ? "bg-[#2a170e] text-amber-200 shadow-md border border-[#3d2417]"
                      : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                  }`}
                >
                  {pkg.name} ({pkg.price})
                </button>
              ))
            ) : (
              <span className="text-xs text-stone-500">Belum ada paket diterbitkan.</span>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setViewMode("detail")}
              className={`h-9 px-3.5 rounded-xl text-xs font-bold transition ${
                viewMode === "detail"
                  ? "bg-rose-50 text-brand-pink border border-brand-pink/20 shadow-2xs"
                  : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"
              }`}
            >
              📋 Rincian Kegiatan
            </button>
            <button
              type="button"
              onClick={() => setViewMode("live")}
              className={`h-9 px-3.5 rounded-xl text-xs font-bold transition ${
                viewMode === "live"
                  ? "bg-rose-50 text-brand-pink border border-brand-pink/20 shadow-2xs"
                  : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"
              }`}
            >
              🌐 Live App Frame (itinerary.elmassa.weld)
            </button>
          </div>
        </div>

        {/* LIVE APP IFRAME VIEW */}
        {viewMode === "live" ? (
          <div className="rounded-2xl border border-stone-200 bg-white overflow-hidden shadow-sm space-y-3 p-3">
            <div className="flex items-center justify-between px-2 text-xs">
              <span className="font-bold text-stone-700">Live Web App Standalone: https://itinerary.elmassa.weld.vercel.app/</span>
              <a
                href="https://itinerary.elmassa.weld.vercel.app/"
                target="_blank"
                rel="noreferrer"
                className="text-brand-pink font-bold hover:underline"
              >
                Buka Tab Baru ↗
              </a>
            </div>
            <iframe
              src="https://itinerary.elmassa.weld.vercel.app/"
              className="w-full h-[700px] rounded-xl border border-stone-200 shadow-inner"
              title="Live Standalone Itinerary App"
            />
          </div>
        ) : activePackage ? (
          /* ITINERARY TIMELINE GRID FOR ACTIVE PACKAGE */
          <div className="space-y-6">
            
            {/* Active Package Specs Card */}
            <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
                <div>
                  <span className="bg-rose-50 text-rose-600 border border-rose-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                    {activePackage.category} • {activePackage.duration}
                  </span>
                  <h3 className="text-lg font-extrabold text-stone-900 mt-1">{activePackage.name}</h3>
                </div>
                <div className="sm:text-right">
                  <span className="text-[10px] text-stone-400 font-bold uppercase block">Harga Resmi All In</span>
                  <span className="text-xl font-black text-rose-600">{activePackage.price}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200/60">
                  <span className="text-[10px] text-stone-400 font-semibold block uppercase">Keberangkatan</span>
                  <span className="font-bold text-stone-800 truncate block mt-0.5">{activePackage.departuresDate || activePackage.departureDate}</span>
                </div>
                <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200/60">
                  <span className="text-[10px] text-stone-400 font-semibold block uppercase">Hotel Makkah</span>
                  <span className="font-bold text-stone-800 truncate block mt-0.5">{activePackage.makkahHotel || "Grand Al Massa"}</span>
                </div>
                <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200/60">
                  <span className="text-[10px] text-stone-400 font-semibold block uppercase">Hotel Madinah</span>
                  <span className="font-bold text-stone-800 truncate block mt-0.5">{activePackage.madinahHotel || "Daar El Naeem"}</span>
                </div>
                <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200/60">
                  <span className="text-[10px] text-stone-400 font-semibold block uppercase">Maskapai & Flight</span>
                  <span className="font-bold text-stone-800 truncate block mt-0.5">{activePackage.airline || "Garuda / Saudia"}</span>
                </div>
              </div>
            </div>

            {/* Daily Activities Timeline */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-extrabold text-stone-900 flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-pink-600" />
                  <span>Rincian Kegiatan Hari demi Hari</span>
                </h3>
                <span className="text-xs text-stone-500 font-medium">Bangka Belitung Feeder (PGK ⇄ CGK)</span>
              </div>

              <div className="grid gap-4">
                {activePackage.itinerary && activePackage.itinerary.length > 0 ? (
                  activePackage.itinerary.map((item, idx) => (
                    <div
                      key={idx}
                      className="rounded-2xl border border-stone-200 bg-white p-4 sm:p-5 shadow-2xs hover:border-pink-300 transition space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
                        <div className="flex items-center gap-3">
                          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-pink-600 text-white font-black text-xs shadow-xs">
                            H{item.day}
                          </span>
                          <div>
                            <h4 className="text-sm font-extrabold text-stone-900">{item.title}</h4>
                            {item.location && (
                              <p className="text-xs font-semibold text-pink-600 flex items-center gap-1 mt-0.5">
                                <MapPin className="h-3.5 w-3.5 shrink-0" />
                                <span>{item.location}</span>
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 pl-2 sm:pl-12">
                        {(item.activities || []).map((act, aIdx) => (
                          <div key={aIdx} className="flex items-start gap-2.5 text-xs">
                            {act.time && (
                              <span className="font-extrabold text-stone-700 text-[10px] shrink-0 bg-stone-100 border border-stone-200 px-2 py-0.5 rounded-md min-w-[75px] text-center">
                                {act.time}
                              </span>
                            )}
                            <p className="text-stone-700 leading-relaxed font-medium">{act.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-stone-200 bg-white p-8 text-center text-stone-500 text-sm">
                    Itinerary harian belum dikonfigurasi untuk paket ini.
                  </div>
                )}
              </div>
            </div>

          </div>
        ) : null}

        {/* BOTTOM CTA BANNER */}
        <div className="rounded-2xl border border-pink-200 bg-gradient-to-r from-pink-50 via-rose-50 to-amber-50 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-extrabold text-stone-900">Tertarik dengan Itinerary Perjalanan Ini?</h4>
            <p className="text-xs text-stone-600 mt-1">Daftarkan diri Anda atau konsultasikan jadwal keberangkatan bersama Staf El Massa Travel.</p>
          </div>
          <button
            type="button"
            onClick={() => openWA(`Halo El Massa, saya mau booking paket ${activePackage?.name || "Umrah"}`)}
            className="h-10 px-5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-extrabold text-xs shadow-md transition shrink-0"
          >
            Hubungi Staf via WhatsApp
          </button>
        </div>

      </div>
    </AppShell>
  );
}
