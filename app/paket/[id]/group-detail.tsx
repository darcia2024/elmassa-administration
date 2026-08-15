"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  CircleDollarSign,
  IdCard,
  ImageIcon,
  Plane,
  Route,
  Users,
} from "lucide-react";
import Link from "next/link";

import { FlyerTab } from "./flyer-tab";
import { ItineraryTab } from "./itinerary-tab";
import { PembayaranTab } from "./pembayaran-tab";
import { ManifestTab } from "./manifest-tab";
import { formatDateID, type PackageDetail } from "./types";

const TABS = [
  { id: "flyer", label: "Flyer & HPP", icon: ImageIcon },
  { id: "itinerary", label: "Itinerary Grup", icon: Route },
  { id: "pembayaran", label: "Data Pembayaran", icon: CircleDollarSign },
  { id: "manifest", label: "Manifest Jamaah", icon: IdCard },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function GroupDetail({ packageId }: { packageId: string }) {
  const [pkg, setPkg] = useState<PackageDetail | null>(null);
  const [loadError, setLoadError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>("flyer");
  const [bookedSeats, setBookedSeats] = useState<number | null>(null);

  const loadPackage = useCallback(async () => {
    try {
      const res = await fetch(`/api/packages/${encodeURIComponent(packageId)}`, { cache: "no-store" });
      const json = await res.json();

      if (!res.ok) {
        setLoadError(json?.error || "Grup keberangkatan tidak ditemukan");
        return;
      }

      setPkg({
        ...json.data,
        targetPax: Number(json.data.targetPax) || 0,
        numericPrice: Number(json.data.numericPrice) || 0,
        itinerary: Array.isArray(json.data.itinerary) ? json.data.itinerary : [],
        includes: Array.isArray(json.data.includes) ? json.data.includes : [],
        excludes: Array.isArray(json.data.excludes) ? json.data.excludes : [],
        costingData: json.data.costingData ?? {},
      });
      setLoadError("");
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Gagal memuat grup keberangkatan");
    } finally {
      setIsLoading(false);
    }
  }, [packageId]);

  useEffect(() => {
    loadPackage();
  }, [loadPackage]);

  // Seat count comes from the manifest departures view, the same aggregate
  // /manifest and /paket/seat already read -- so the header can never disagree
  // with those pages about how full a group is.
  useEffect(() => {
    fetch("/api/manifest/departures", { cache: "no-store" })
      .then((res) => res.json())
      .then((json) => {
        const row = (json.data ?? []).find((d: { id: string }) => d.id === packageId);
        if (row) setBookedSeats(Number(row.bookedSeats) || 0);
      })
      .catch(() => setBookedSeats(null));
  }, [packageId]);

  const remainingSeats = useMemo(() => {
    if (!pkg || bookedSeats === null) return null;
    return Math.max(pkg.targetPax - bookedSeats, 0);
  }, [pkg, bookedSeats]);

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-stone-200/70 bg-white p-10 text-center shadow-2xs">
        <p className="text-xs font-medium text-stone-500">Memuat grup keberangkatan…</p>
      </div>
    );
  }

  if (loadError || !pkg) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-8 text-center space-y-3 shadow-2xs">
        <p className="text-sm font-extrabold text-rose-800">{loadError || "Grup tidak ditemukan"}</p>
        <Link
          href="/paket"
          className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-brand-cocoa px-4 text-xs font-bold text-white hover:brightness-125 transition"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Kembali ke Jadwal Keberangkatan</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5 font-sans">

      {/* Back link */}
      <Link
        href="/paket"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-brand-pink transition"
      >
        <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
        <span>Semua Grup Keberangkatan</span>
      </Link>

      {/* Group header */}
      <section className="rounded-2xl border border-stone-200/70 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-1.5">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-[11px] font-bold text-brand-pink border border-brand-pink/20">
                {pkg.category || "Umrah Reguler"}
              </span>
              <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-[11px] font-bold text-stone-700">
                {pkg.duration}
              </span>
            </div>
            <h1 className="text-lg sm:text-2xl font-extrabold tracking-tight text-brand-cocoa">{pkg.name}</h1>
            <p className="text-xs text-stone-500 flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="h-3.5 w-3.5 text-brand-pink shrink-0" strokeWidth={1.5} />
                {formatDateID(pkg.departureDate)} → {formatDateID(pkg.returnDate)}
              </span>
              {pkg.airline ? (
                <>
                  <span className="text-stone-300">•</span>
                  <span className="inline-flex items-center gap-1">
                    <Plane className="h-3.5 w-3.5 text-sky-600 shrink-0" strokeWidth={1.5} />
                    {pkg.airline}
                  </span>
                </>
              ) : null}
            </p>
          </div>

          <div className="shrink-0 rounded-xl border border-stone-200/70 bg-stone-50/70 px-4 py-2.5 text-right">
            <p className="text-[10px] font-bold uppercase text-stone-400">Harga All In</p>
            <p className="text-lg font-black text-brand-pink leading-tight">{pkg.price}</p>
            <p className="text-[10px] font-bold text-emerald-700">DP {pkg.dpMinimum}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 text-xs">
          <div className="rounded-xl border border-stone-200/60 bg-stone-50/60 p-2.5">
            <p className="text-[10px] font-semibold uppercase text-stone-400 flex items-center gap-1">
              <Users className="h-3 w-3 text-brand-pink" strokeWidth={1.5} /> Kuota Seat
            </p>
            <p className="font-bold text-brand-cocoa mt-0.5">{pkg.targetPax} Pax</p>
          </div>
          <div className="rounded-xl border border-stone-200/60 bg-stone-50/60 p-2.5">
            <p className="text-[10px] font-semibold uppercase text-stone-400">Terisi</p>
            <p className="font-bold text-brand-cocoa mt-0.5">
              {bookedSeats === null ? "…" : `${bookedSeats} Pax`}
            </p>
          </div>
          <div className="rounded-xl border border-stone-200/60 bg-stone-50/60 p-2.5">
            <p className="text-[10px] font-semibold uppercase text-stone-400">Sisa Seat</p>
            <p className="font-bold text-emerald-700 mt-0.5">
              {remainingSeats === null ? "…" : `${remainingSeats} Seat`}
            </p>
          </div>
          <div className="rounded-xl border border-stone-200/60 bg-stone-50/60 p-2.5">
            <p className="text-[10px] font-semibold uppercase text-stone-400">Titik Kumpul</p>
            <p className="font-bold text-brand-cocoa mt-0.5 truncate" title={pkg.startPoint}>
              {pkg.startPoint || "—"}
            </p>
          </div>
        </div>
      </section>

      {/* Tab bar */}
      <nav className="flex items-center gap-1.5 overflow-x-auto rounded-2xl border border-stone-200/70 bg-white p-1.5 shadow-2xs no-scrollbar">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
              activeTab === tab.id
                ? "bg-rose-50 text-brand-pink border border-brand-pink/20 font-bold shadow-2xs"
                : "text-stone-500 hover:text-stone-900 hover:bg-stone-50 border border-transparent"
            }`}
          >
            <tab.icon className="h-3.5 w-3.5" strokeWidth={1.5} />
            <span className="whitespace-nowrap">{tab.label}</span>
          </button>
        ))}
      </nav>

      {activeTab === "flyer" ? <FlyerTab pkg={pkg} onSaved={loadPackage} /> : null}
      {activeTab === "itinerary" ? <ItineraryTab pkg={pkg} onSaved={loadPackage} /> : null}
      {activeTab === "pembayaran" ? <PembayaranTab pkg={pkg} /> : null}
      {activeTab === "manifest" ? <ManifestTab pkg={pkg} /> : null}
    </div>
  );
}
