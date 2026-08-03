"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Armchair,
  Award,
  Calculator,
  Calendar,
  CalendarDays,
  CheckCircle2,
  Clock,
  Compass,
  Download,
  Edit3,
  Gift,
  Hotel,
  Image as ImageIcon,
  MapPin,
  MessageSquare,
  PackageCheck,
  Plane,
  Plus,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Star,
  Trash2,
  Upload,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { ItineraryDayItem } from "@/lib/itinerary-generator";

type PackageCardItem = {
  id: string;
  name: string;
  category: string;
  duration: string;
  departuresDate: string;
  price: string;
  numericPrice: number;
  dpMinimum: string;
  makkahHotel: string;
  madinahHotel: string;
  airline: string;
  startPoint: string;
  programUmrah: string;
  bonusHighlights: string[];
  posterImg?: string;
  bannerImg?: string;
  includes: string[];
  excludes: string[];
  itinerary?: ItineraryDayItem[];
  featured?: boolean;
};

const officialPackages: PackageCardItem[] = [];

export function PackageList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [selectedPkg, setSelectedPkg] = useState<PackageCardItem | null>(null);
  const [customPackages, setCustomPackages] = useState<PackageCardItem[]>([]);

  // Load custom published packages from HPP Calculator via localStorage & active user role
  const [userRole, setUserRole] = useState("Super Admin");

  useEffect(() => {
    // 1. Fetch from Supabase PostgreSQL API & Auto-Migrate local packages
    fetch("/api/packages")
      .then((res) => res.json())
      .then((res) => {
        if (res.ok && Array.isArray(res.data) && res.data.length > 0) {
          setCustomPackages(res.data);
          try {
            localStorage.setItem("el_massa_published_packages", JSON.stringify(res.data));
          } catch (e) {}
        } else {
          // If Supabase has no packages yet, push existing local packages to Supabase Cloud Database!
          const saved = localStorage.getItem("el_massa_published_packages");
          if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setCustomPackages(parsed);
              parsed.forEach((pkg: any) => {
                fetch("/api/packages", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(pkg),
                }).catch((e) => console.error("Migration error:", e));
              });
            }
          }
        }
      })
      .catch(() => {
        const saved = localStorage.getItem("el_massa_published_packages");
        if (saved) setCustomPackages(JSON.parse(saved));
      });

    try {
      const savedRole = localStorage.getItem("el_massa_user_role");
      if (savedRole) {
        setUserRole(savedRole);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const canEditPackage = useMemo(() => {
    const allowedRoles = ["Super Admin", "Manager Operasional", "Admin Paket", "Direktur Utama", "Akun Master"];
    return allowedRoles.includes(userRole);
  }, [userRole]);

  const canDeletePackage = useMemo(() => {
    const allowedMasterRoles = ["Super Admin", "Manager Operasional", "Direktur Utama", "Akun Master"];
    return allowedMasterRoles.includes(userRole);
  }, [userRole]);

  // Delete Package State & Handlers
  const [deletingPkg, setDeletingPkg] = useState<PackageCardItem | null>(null);

  const confirmDeletePackage = (pkg: PackageCardItem) => {
    setDeletingPkg(pkg);
  };

  const executeDeletePackage = () => {
    if (!deletingPkg) return;
    const deletingPkgName = (deletingPkg.name || (deletingPkg as any).packageName || "").split("—")[0].split("(")[0].trim().toLowerCase();
    const updatedList = customPackages.filter((item) => item.id !== deletingPkg.id);
    setCustomPackages(updatedList);
    try {
      localStorage.setItem("el_massa_published_packages", JSON.stringify(updatedList));

      // Delete from Supabase PostgreSQL Cloud Database
      fetch(`/api/packages?id=${encodeURIComponent(deletingPkg.id)}`, {
        method: "DELETE",
      }).catch((e) => console.error("Supabase package delete error:", e));

      // Cascade delete: automatically purge bookings linked to this deleted package
      const savedBookingsStr = localStorage.getItem("el_massa_real_bookings");
      if (savedBookingsStr) {
        const savedBookings = JSON.parse(savedBookingsStr);
        if (Array.isArray(savedBookings)) {
          const updatedBookings = savedBookings.filter((b: any) => {
            const bPkgName = (b.packageName || "").split("—")[0].split("(")[0].trim().toLowerCase();
            return !bPkgName.includes(deletingPkgName) && !deletingPkgName.includes(bPkgName);
          });
          localStorage.setItem("el_massa_real_bookings", JSON.stringify(updatedBookings));
        }
      }
    } catch (e) {
      console.error(e);
    }
    if (selectedPkg?.id === deletingPkg.id) {
      setSelectedPkg(null);
    }
    if (editingPkg?.id === deletingPkg.id) {
      setEditingPkg(null);
    }
    setDeletingPkg(null);
  };

  // Edit Modal State & Poster Upload State
  const [editingPkg, setEditingPkg] = useState<PackageCardItem | null>(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editDpMinimum, setEditDpMinimum] = useState("");
  const [editDeparturesDate, setEditDeparturesDate] = useState("");
  const [editAirline, setEditAirline] = useState("");
  const [editMakkahHotel, setEditMakkahHotel] = useState("");
  const [editMadinahHotel, setEditMadinahHotel] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editPosterImg, setEditPosterImg] = useState("");

  const openEditModal = (pkg: PackageCardItem) => {
    setEditingPkg(pkg);
    setEditName(pkg.name);
    setEditPrice(pkg.price);
    setEditDpMinimum(pkg.dpMinimum);
    setEditDeparturesDate(pkg.departuresDate);
    setEditAirline(pkg.airline);
    setEditMakkahHotel(pkg.makkahHotel);
    setEditMadinahHotel(pkg.madinahHotel);
    setEditCategory(pkg.category);
    setEditPosterImg(pkg.posterImg || "");
  };

  const handlePosterUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setEditPosterImg(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveEdit = () => {
    if (!editingPkg) return;

    const updatedList = customPackages.map((item) => {
      if (item.id === editingPkg.id) {
        return {
          ...item,
          name: editName,
          price: editPrice,
          dpMinimum: editDpMinimum,
          departuresDate: editDeparturesDate,
          airline: editAirline,
          makkahHotel: editMakkahHotel,
          madinahHotel: editMadinahHotel,
          category: editCategory,
          posterImg: editPosterImg || item.posterImg,
        };
      }
      return item;
    });

    setCustomPackages(updatedList);
    try {
      localStorage.setItem("el_massa_published_packages", JSON.stringify(updatedList));
    } catch (e) {
      console.error(e);
    }

    setEditingPkg(null);
    if (selectedPkg && selectedPkg.id === editingPkg.id) {
      setSelectedPkg({
        ...selectedPkg,
        name: editName,
        price: editPrice,
        dpMinimum: editDpMinimum,
        departuresDate: editDeparturesDate,
        airline: editAirline,
        makkahHotel: editMakkahHotel,
        madinahHotel: editMadinahHotel,
        category: editCategory,
        posterImg: editPosterImg || selectedPkg.posterImg,
      });
    }
  };

  const handleReturnToCalculator = (pkg: PackageCardItem) => {
    try {
      const fullPackageToEdit = {
        id: pkg.id,
        name: pkg.name,
        category: pkg.category,
        departureDate: (pkg as any).departureDate || "2026-10-15",
        returnDate: (pkg as any).returnDate || "2026-10-26",
        makkahHotel: pkg.makkahHotel || "Grand Al Massa",
        madinahHotel: pkg.madinahHotel || "Daar El Naeem",
        airline: pkg.airline || "Garuda Indonesia + Saudia Airlines",
        domesticAirline: (pkg as any).domesticAirline || "Garuda Indonesia (Feeder PGK ⇄ CGK)",
        internationalAirline: (pkg as any).internationalAirline || "Saudia Airlines (SV-815)",
        targetPax: (pkg as any).targetPax || 45,
        makkahRoomSarPerNight: (pkg as any).makkahRoomSarPerNight || 480,
        madinahRoomSarPerNight: (pkg as any).madinahRoomSarPerNight || 380,
        flightCgkJed: (pkg as any).flightCgkJed || 14500000,
        flightPtkCgk: (pkg as any).flightPtkCgk || 2400000,
        visaAndInsuranceSar: (pkg as any).visaAndInsuranceSar || 450,
        handlingJakartaCgkIdr: (pkg as any).handlingJakartaCgkIdr || 350000,
        handlingSaudiSharedSar: (pkg as any).handlingSaudiSharedSar || 4500,
        feeMarketingIdr: (pkg as any).feeMarketingIdr || 1000000,
        marginNominalPerPax: (pkg as any).marginNominalPerPax || 3500000,
        triplePaxCount: (pkg as any).triplePaxCount || 6,
        doublePaxCount: (pkg as any).doublePaxCount || 4,
        itinerary: pkg.itinerary || [],
      };
      localStorage.setItem("el_massa_edit_hpp_package", JSON.stringify(fullPackageToEdit));
    } catch (e) {
      console.error(e);
    }
    window.location.href = "/paket/kalkulator";
  };

  const allPackages = useMemo(() => {
    return [...customPackages, ...officialPackages];
  }, [customPackages]);

  const filteredPackages = useMemo(() => {
    return allPackages.filter((pkg) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        pkg.name.toLowerCase().includes(q) ||
        pkg.makkahHotel.toLowerCase().includes(q) ||
        pkg.madinahHotel.toLowerCase().includes(q) ||
        pkg.departuresDate.toLowerCase().includes(q);

      const matchesCat =
        selectedCategory === "Semua" ||
        pkg.category.toLowerCase().includes(selectedCategory.split(" ")[0].toLowerCase()) ||
        selectedCategory.toLowerCase().includes(pkg.category.toLowerCase());

      return matchesSearch && matchesCat;
    });
  }, [allPackages, searchQuery, selectedCategory]);

  return (
    <div className="space-y-6 font-sans">
      
      {/* ========================================================================= */}
      {/* 🖥️ 1. DESKTOP MODE LAYOUT (100% UNTOUCHED ORIGINAL 2-COLUMN) */}
      {/* ========================================================================= */}
      <div className="hidden md:block space-y-6">
        
        {/* Hero Header Section */}
        <section className="rounded-2xl border border-stone-200/70 bg-white p-5 sm:p-6 shadow-2xs">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold tracking-tight text-brand-cocoa sm:text-2xl">
                  Katalog Resmi Paket Umrah PT El Massa
                </h1>
                <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-[11px] font-bold text-brand-pink border border-brand-pink/20">
                  Resmi Izin PPIU
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-1 max-w-2xl">
                Paket Umrah Spesial Oktober (2x Jum'at) & November Start Pangkal Pinang dengan maskapai Saudia / Garuda Indonesia dan Hotel Grand Al Massa Makkah.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/paket/kalkulator"
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 px-4 text-xs font-black text-white shadow-md shadow-pink-500/25 hover:from-pink-700 hover:to-rose-700 active:scale-95 transition-all shrink-0 border border-pink-500/30"
              >
                <Sparkles className="h-4 w-4 text-white animate-pulse" />
                <span>+ Hitung HPP & Buat Paket Wisata</span>
              </Link>
              <Link
                href="/booking/form"
                className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-stone-200 bg-stone-50 px-3.5 text-xs font-bold text-stone-700 hover:bg-stone-100 transition shrink-0"
              >
                <Plus className="h-4 w-4 text-stone-500" strokeWidth={1.5} />
                <span>Daftar Jamaah / Booking</span>
              </Link>
            </div>
          </div>
        </section>

        {/* 🔎 Search Toolbar & Filters */}
        <section className="rounded-2xl border border-stone-200/70 bg-white p-4 sm:p-5 shadow-2xs space-y-3">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" strokeWidth={1.5} />
              <input
                type="text"
                placeholder="Cari paket Oktober, November, hotel, atau maskapai..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 rounded-xl border border-stone-200 bg-stone-50/50 pl-9 pr-3 text-xs text-brand-cocoa font-medium placeholder:text-stone-400 outline-none focus:border-brand-pink focus:bg-white transition"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar shrink-0 max-w-full">
              {([
                "Semua",
                "Oktober 2026",
                "November 2026",
                "Desember 2026",
                "Januari 2027",
                "Februari 2027",
                "Maret 2027",
                "April 2027",
                "Mei 2027",
                "Juni 2027",
                "Juli 2027",
                "Agustus 2027",
                "September 2027",
                "Ramadhan 2027",
                "Spesial",
              ] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`h-8 rounded-xl px-3.5 text-xs font-semibold whitespace-nowrap transition ${
                    selectedCategory === cat
                      ? "bg-rose-50 text-brand-pink border border-brand-pink/20 font-bold shadow-2xs"
                      : "text-stone-600 hover:bg-stone-50"
                  }`}
                >
                  {cat === "Semua" ? "Semua Paket" : cat}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* 📦 Paket Grid Cards - Desktop 2-Column Grid */}
        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
          {filteredPackages.map((pkg) => (
            <article
              key={pkg.id}
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-stone-200/80 bg-white p-5 sm:p-6 shadow-2xs hover:shadow-md hover:border-brand-pink/40 transition-all duration-300 space-y-4"
            >
              {/* Top Pill Badges Row */}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-[11px] font-bold text-brand-pink border border-brand-pink/20">
                    {pkg.category}
                  </span>
                  <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-[11px] font-bold text-stone-700">
                    {pkg.duration}
                  </span>
                  {pkg.featured && (
                    <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-800 border border-amber-200/60 flex items-center gap-1">
                      <Star className="h-3 w-3 fill-amber-500 text-amber-500" /> Recommended 2x Jum'at
                    </span>
                  )}
                </div>

                <span className="text-[11px] font-extrabold text-brand-cocoa bg-stone-50 border border-stone-200/60 rounded-full px-2.5 py-0.5">
                  DP Mulai {pkg.dpMinimum}
                </span>
              </div>

              {/* Title & Start Point */}
              <div className="space-y-1">
                <p className="text-[11px] font-semibold text-stone-500 flex items-center gap-1 flex-wrap">
                  <MapPin className="h-3.5 w-3.5 text-brand-pink shrink-0" strokeWidth={1.5} />
                  <span className="truncate max-w-full">{pkg.startPoint}</span>
                  <span className="text-stone-300">•</span>
                  <span className="truncate max-w-full">{pkg.programUmrah}</span>
                </p>
                <h3 className="text-base sm:text-lg font-extrabold leading-snug text-brand-cocoa group-hover:text-brand-pink transition">
                  {pkg.name}
                </h3>
              </div>

              {/* Price & Date Row */}
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 rounded-xl border border-stone-100 bg-stone-50/50 p-3">
                <div>
                  <p className="text-[10px] font-bold uppercase text-stone-400">Keberangkatan</p>
                  <p className="text-xs font-bold text-brand-cocoa">{pkg.departuresDate}</p>
                </div>

                <div className="sm:text-right">
                  <p className="text-[10px] font-bold uppercase text-stone-400">Harga All In</p>
                  <p className="text-lg sm:text-xl font-black text-brand-pink">{pkg.price}</p>
                </div>
              </div>

              {/* Hotel & Airline Specs */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-xl border border-stone-200/60 bg-stone-50/60 p-2.5 space-y-0.5">
                  <p className="text-[10px] font-semibold text-stone-400 uppercase flex items-center gap-1">
                    <Hotel className="h-3 w-3 text-brand-pink" strokeWidth={1.5} /> Hotel Makkah
                  </p>
                  <p className="font-bold text-brand-cocoa truncate">{pkg.makkahHotel}</p>
                </div>

                <div className="rounded-xl border border-stone-200/60 bg-stone-50/60 p-2.5 space-y-0.5">
                  <p className="text-[10px] font-semibold text-stone-400 uppercase flex items-center gap-1">
                    <Hotel className="h-3 w-3 text-emerald-600" strokeWidth={1.5} /> Hotel Madinah
                  </p>
                  <p className="font-bold text-stone-800 truncate">{pkg.madinahHotel}</p>
                </div>

                <div className="col-span-2 rounded-xl border border-stone-200/60 bg-stone-50/60 p-2.5 space-y-0.5">
                  <p className="text-[10px] font-semibold text-stone-400 uppercase flex items-center gap-1">
                    <Plane className="h-3 w-3 text-sky-600" strokeWidth={1.5} /> Maskapai & Flight
                  </p>
                  <p className="font-bold text-sky-900 truncate">{pkg.airline}</p>
                </div>
              </div>

              {/* Bonus Highlights */}
              <div className="rounded-xl border border-amber-200/70 bg-amber-50/40 p-3 space-y-1.5">
                <p className="text-[11px] font-bold text-amber-900 flex items-center gap-1">
                  <Gift className="h-3.5 w-3.5 text-amber-700" strokeWidth={1.5} /> Bonus Spesial Paket:
                </p>
                <ul className="space-y-1 text-[11px] font-medium text-amber-950">
                  {pkg.bonusHighlights.map((bonus, bIdx) => (
                    <li key={bIdx} className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3 w-3 text-amber-600 shrink-0" />
                      <span>{bonus}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Rincian Itinerary & Standalone Web App Link */}
              <div className="rounded-xl border border-rose-200/80 bg-gradient-to-r from-rose-50/40 via-amber-50/30 to-rose-50/20 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-bold text-stone-900 flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5 text-brand-pink" />
                    <span>Rincian Itinerary (12 Hari Program)</span>
                  </p>
                </div>

                <div className="space-y-1 text-[11px] font-medium">
                  <div className="flex items-center gap-2 text-stone-800">
                    <span className="bg-brand-pink text-white text-[9px] font-black px-1.5 py-0.5 rounded-xs shrink-0">H1</span>
                    <span className="truncate">Pangkalpinang (PGK) ➔ Jakarta (CGK) ➔ Transit Airport Lounge</span>
                  </div>
                  <div className="flex items-center gap-2 text-stone-800">
                    <span className="bg-brand-pink text-white text-[9px] font-black px-1.5 py-0.5 rounded-xs shrink-0">H2</span>
                    <span className="truncate">Jakarta ➔ Jeddah ➔ Madinah (Check-in Hotel {pkg.madinahHotel || "Madinah"})</span>
                  </div>
                  <div className="flex items-center gap-2 text-stone-800">
                    <span className="bg-brand-pink text-white text-[9px] font-black px-1.5 py-0.5 rounded-xs shrink-0">H3</span>
                    <span className="truncate">Madinah – Ziarah Raudhah Tasreh & Makam Rasulullah SAW</span>
                  </div>
                  <div className="flex items-center gap-2 text-stone-800">
                    <span className="bg-[#2a170e] text-amber-300 text-[9px] font-black px-1.5 py-0.5 rounded-xs shrink-0">H6</span>
                    <span className="truncate">Madinah ➔ Miqat Bir Ali ➔ Makkah (Pelaksanaan Umrah 1)</span>
                  </div>
                </div>

                {/* Information Update Seat Kuota */}
                <div className="rounded-xl border border-stone-200/80 bg-stone-50/80 p-2.5 flex items-center justify-between text-xs font-sans">
                  <div className="flex items-center gap-1.5 font-bold text-stone-900">
                    <span className="text-stone-500 font-semibold">Seat Kuota:</span>
                    <span className="text-brand-pink font-extrabold bg-rose-50 border border-brand-pink/20 px-2 py-0.5 rounded-md">
                      {Math.max(0, 45 - (customPackages.find((c) => c.id === pkg.id) ? 0 : 0))} Seat Tersedia
                    </span>
                  </div>
                  <Link href="/paket/seat" className="text-[11px] font-extrabold text-stone-700 hover:text-brand-pink underline">
                    Update Seat 💺
                  </Link>
                </div>

                <a
                  href={`https://itineraryelmassa-weld.vercel.app/?packageId=${encodeURIComponent(pkg.id)}&packageName=${encodeURIComponent(pkg.name)}&departure=${encodeURIComponent(pkg.departuresDate || (pkg as any).departureDate || "")}&makkahHotel=${encodeURIComponent(pkg.makkahHotel || "")}&madinahHotel=${encodeURIComponent(pkg.madinahHotel || "")}&airline=${encodeURIComponent(pkg.airline || "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 flex h-8 w-full items-center justify-center gap-1.5 rounded-lg bg-[#2a170e] hover:bg-[#3d2417] text-[11px] font-bold text-amber-200 transition shadow-2xs cursor-pointer"
                >
                  <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                  <span>Lihat Live Web App Itinerary Grup Ini ↗</span>
                </a>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedPkg(pkg)}
                  className="flex-1 h-9 rounded-xl border border-stone-200 bg-stone-50 text-xs font-semibold text-stone-700 hover:bg-stone-100 transition min-w-[90px]"
                >
                  Lihat Detail
                </button>

                <button
                  type="button"
                  onClick={() => handleReturnToCalculator(pkg)}
                  className="h-9 px-3 rounded-xl border border-emerald-300 bg-emerald-50 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition flex items-center gap-1 shrink-0 cursor-pointer"
                  title="Return & Edit HPP Paket di Kalkulator HPP"
                >
                  <Calculator className="h-3.5 w-3.5 text-emerald-700" />
                  <span>Edit HPP</span>
                </button>

                {canEditPackage && (
                  <button
                    type="button"
                    onClick={() => openEditModal(pkg)}
                    className="h-9 px-3 rounded-xl border border-amber-300 bg-amber-50 text-xs font-bold text-amber-800 hover:bg-amber-100 transition flex items-center gap-1 shrink-0"
                    title="Edit Quick Meta"
                  >
                    <Edit3 className="h-3.5 w-3.5 text-amber-700" />
                    <span>Quick Edit</span>
                  </button>
                )}

                {canDeletePackage && (
                  <button
                    type="button"
                    onClick={() => confirmDeletePackage(pkg)}
                    className="h-9 px-2.5 rounded-xl border border-rose-200 bg-rose-50 text-xs font-bold text-rose-700 hover:bg-rose-100 hover:border-rose-300 transition flex items-center gap-1 shrink-0"
                    title="Hapus Paket"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-rose-600" />
                  </button>
                )}

                <Link
                  href="/booking/form"
                  className="flex-1 h-9 rounded-xl bg-brand-pink text-xs font-semibold text-white shadow-2xs hover:bg-brand-pinkHover transition flex items-center justify-center gap-1 min-w-[120px]"
                >
                  <Plus className="h-3.5 w-3.5" strokeWidth={1.5} />
                  <span>Daftar / Booking</span>
                </Link>
              </div>
            </article>
          ))}
        </section>

      </div>

      {/* ========================================================================= */}
      {/* 📱 2. MOBILE NATIVE E-COMMERCE LAYOUT (WEARIFY / H&M REFERENSI STYLE BRO) */}
      {/* ========================================================================= */}
      <div className="block md:hidden space-y-4">
        
        {/* A. Location & Branch Selector Pill (Wearify Header Style) */}
        <section className="flex items-center justify-between gap-2 bg-white p-3 rounded-2xl border border-stone-200/80 shadow-2xs">
          <div className="flex items-center gap-2 min-w-0">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-rose-50 text-brand-pink border border-brand-pink/20">
              <MapPin className="h-4 w-4" strokeWidth={2} />
            </span>
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase text-stone-400 block">Cabang Keberangkatan</span>
              <p className="text-xs font-extrabold text-stone-900 truncate">Pangkalpinang, Bangka Belitung</p>
            </div>
          </div>

          <button
            type="button"
            className="rounded-full bg-stone-900 px-3 py-1 text-[10px] font-black text-white active:scale-95 transition shrink-0"
          >
            Ubah
          </button>
        </section>

        {/* B. Full-Width Search Input */}
        <section className="relative">
          <div className="flex items-center gap-2 rounded-full border border-stone-200/90 bg-white px-3.5 h-10 shadow-2xs focus-within:border-brand-pink transition">
            <Search className="h-3.5 w-3.5 text-stone-400 shrink-0" strokeWidth={1.5} />
            <input
              type="text"
              placeholder="Cari paket umrah, hotel, atau maskapai..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent outline-none text-xs font-medium text-stone-900 placeholder:text-stone-400"
            />
          </div>
        </section>

        {/* C. Horizontal Brand / Month Pills (Wearify Category Row) */}
        <section className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-stone-900">Kategori Paket</span>
            <span className="text-[10px] font-bold text-stone-400">{filteredPackages.length} Paket Tersedia</span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar scroll-smooth">
            {(["Semua", "Oktober", "November"] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`h-8 rounded-full px-4 text-xs font-extrabold whitespace-nowrap transition active:scale-95 ${
                  selectedCategory === cat
                    ? "bg-brand-cocoa text-white shadow-xs"
                    : "bg-white text-stone-600 border border-stone-200/80 hover:bg-stone-50"
                }`}
              >
                {cat === "Semua" ? "Semua Paket" : `Bulan ${cat}`}
              </button>
            ))}
          </div>
        </section>

        {/* D. 2-COLUMN MOBILE PRODUCT CARD GRID (WEARIFY / H&M E-COMMERCE PRODUCT GRID) */}
        <section className="grid grid-cols-2 gap-2.5 sm:gap-3">
          {filteredPackages.map((pkg) => (
            <article
              key={pkg.id}
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-stone-200/80 bg-white p-3 shadow-2xs active:bg-stone-50 transition-all duration-200 space-y-2"
            >
              {/* Product Poster Preview Container */}
              <div className="relative aspect-4/3 w-full overflow-hidden rounded-xl bg-stone-100 border border-stone-100 flex items-center justify-center">
                {pkg.posterImg ? (
                  <img
                    src={pkg.posterImg}
                    alt={pkg.name}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center p-2 text-center text-stone-400">
                    <Plane className="h-6 w-6 text-stone-300 mb-1" />
                    <span className="text-[9px] font-bold">El Massa Official</span>
                  </div>
                )}

                {/* Top Badge Overlay */}
                <span className="absolute left-1.5 top-1.5 rounded-full bg-emerald-600/90 backdrop-blur-xs px-2 py-0.5 text-[8px] font-black uppercase text-white shadow-xs">
                  {pkg.category.includes("Oktober") ? "Bestseller" : "Populer"}
                </span>
              </div>

              {/* Rating & Duration */}
              <div className="flex items-center justify-between text-[9px] font-extrabold">
                <span className="text-amber-600 flex items-center gap-0.5">
                  <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" /> 4.9 (128)
                </span>
                <span className="text-stone-500 font-bold bg-stone-100 px-1.5 py-0.2 rounded">
                  {pkg.duration}
                </span>
              </div>

              {/* Title (Clean 2-Line Clamp) */}
              <h4 className="text-xs font-extrabold text-stone-900 leading-snug line-clamp-2 min-h-[32px]">
                {pkg.name}
              </h4>

              {/* Spec Badges */}
              <p className="text-[9px] font-bold text-stone-500 truncate flex items-center gap-1">
                <Clock className="h-2.5 w-2.5 text-stone-400 shrink-0" />
                <span className="truncate">{pkg.departuresDate}</span>
              </p>

              {/* Price & DP */}
              <div className="pt-1 border-t border-stone-100 space-y-0.5">
                <span className="text-[8px] font-extrabold uppercase text-stone-400 block">Harga All In</span>
                <p className="text-xs sm:text-sm font-black text-brand-pink leading-none">{pkg.price}</p>
                <p className="text-[8.5px] font-extrabold text-emerald-700">DP {pkg.dpMinimum}</p>
              </div>

              {/* Full-Width Touch Action Button */}
              <div className="pt-1 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setSelectedPkg(pkg)}
                  className="flex-1 h-7 rounded-lg border border-stone-200 bg-stone-50 text-[10px] font-bold text-stone-700 active:bg-stone-100 transition"
                >
                  Detail
                </button>

                {canEditPackage && (
                  <button
                    type="button"
                    onClick={() => openEditModal(pkg)}
                    className="h-7 px-2 rounded-lg border border-amber-300 bg-amber-50 text-[10px] font-bold text-amber-800 active:bg-amber-100 transition flex items-center gap-0.5 shrink-0"
                    title="Edit Paket"
                  >
                    <Edit3 className="h-2.5 w-2.5" />
                    <span>Edit</span>
                  </button>
                )}

                {canDeletePackage && (
                  <button
                    type="button"
                    onClick={() => confirmDeletePackage(pkg)}
                    className="h-7 px-1.5 rounded-lg border border-rose-200 bg-rose-50 text-[10px] font-bold text-rose-700 active:bg-rose-100 transition flex items-center shrink-0"
                    title="Hapus Paket (Khusus Akun Master)"
                  >
                    <Trash2 className="h-2.5 w-2.5 text-rose-600" />
                  </button>
                )}

                <Link
                  href="/booking/form"
                  className="flex-1 h-7 rounded-lg bg-stone-900 text-[10px] font-bold text-white shadow-2xs active:bg-stone-800 transition flex items-center justify-center"
                >
                  Booking
                </Link>
              </div>
            </article>
          ))}
        </section>

      </div>

      {/* 📝 INTERACTIVE DETAIL & BROCHURE MODAL */}
      {selectedPkg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-3xl rounded-2xl border border-stone-200 bg-white p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-stone-100 pb-4">
              <div>
                <span className="rounded-full bg-rose-50 px-3 py-0.5 text-xs font-bold text-brand-pink border border-brand-pink/20">
                  {selectedPkg.category}
                </span>
                <h2 className="text-xl font-extrabold text-brand-cocoa mt-2">{selectedPkg.name}</h2>
                <p className="text-xs text-stone-500 mt-1">
                  Keberangkatan: <span className="font-bold text-brand-cocoa">{selectedPkg.departuresDate}</span> • Duration: <span className="font-bold text-brand-cocoa">{selectedPkg.duration}</span> • Start: <span className="font-bold text-brand-cocoa">{selectedPkg.startPoint}</span>
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedPkg(null)}
                className="grid h-8 w-8 place-items-center rounded-xl border border-stone-200 bg-stone-50 text-stone-500 hover:bg-stone-100 transition shrink-0"
              >
                <X className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>

            {/* Poster Images (Displayed ONLY inside Detail Modal) */}
            {selectedPkg.bannerImg && selectedPkg.posterImg && (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="overflow-hidden rounded-xl border border-stone-200 bg-stone-50 shadow-2xs">
                  <img src={selectedPkg.posterImg} alt="Poster Brosur Resmi" loading="lazy" decoding="async" className="w-full h-auto object-cover" />
                </div>
                <div className="overflow-hidden rounded-xl border border-stone-200 bg-stone-50 shadow-2xs">
                  <img src={selectedPkg.bannerImg} alt="Banner Brosur Resmi" loading="lazy" decoding="async" className="w-full h-auto object-cover" />
                </div>
              </div>
            )}

            {/* Price & DP Summary */}
            <div className="rounded-xl border border-brand-pink/20 bg-rose-50/50 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-stone-500">Harga Paket All In</p>
                <p className="text-2xl font-black text-brand-pink">{selectedPkg.price}</p>
              </div>
              <div className="sm:text-right">
                <p className="text-xs font-semibold text-stone-500">Uang Muka (DP Minimum)</p>
                <p className="text-lg font-bold text-brand-cocoa">{selectedPkg.dpMinimum}</p>
              </div>
            </div>

            {/* Fasilitas Include & Exclude */}
            <div className="grid gap-4 md:grid-cols-2 text-xs">
              {/* Include */}
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 space-y-2">
                <h4 className="font-extrabold text-emerald-900 text-sm flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Fasilitas Sudah Termasuk (Include):
                </h4>
                <ul className="space-y-1.5 text-stone-700">
                  {selectedPkg.includes.map((inc, iIdx) => (
                    <li key={iIdx} className="flex items-start gap-1.5">
                      <span className="text-emerald-600 font-bold">•</span>
                      <span>{inc}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Exclude */}
              <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 space-y-2">
                <h4 className="font-extrabold text-stone-800 text-sm flex items-center gap-1.5">
                  <ShieldAlert className="h-4 w-4 text-stone-500" /> Belum Termasuk (Exclude):
                </h4>
                <ul className="space-y-1.5 text-stone-600">
                  {selectedPkg.excludes.map((exc, eIdx) => (
                    <li key={eIdx} className="flex items-start gap-1.5">
                      <span className="text-stone-400 font-bold">•</span>
                      <span>{exc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 🗓️ ITINERARY RENCANA PERJALANAN DETAIL */}
            {selectedPkg.itinerary && selectedPkg.itinerary.length > 0 && (
              <div className="rounded-xl border border-stone-200 bg-stone-50/70 p-4 space-y-3">
                <h4 className="font-extrabold text-stone-900 text-sm flex items-center gap-2 border-b border-stone-200 pb-2">
                  <CalendarDays className="h-4 w-4 text-emerald-600" />
                  <span>Rencana Perjalanan (Itinerary Harian)</span>
                </h4>
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  {selectedPkg.itinerary.map((dayItem, dIdx) => (
                    <div key={dIdx} className="rounded-lg border border-stone-200 bg-white p-3 text-xs space-y-1.5 shadow-2xs">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="grid h-6 w-6 place-items-center rounded-lg bg-stone-900 text-white font-black text-[10px]">
                            H{dayItem.day}
                          </span>
                          <span className="font-extrabold text-stone-900">{dayItem.title}</span>
                        </div>
                        {dayItem.date && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                            {dayItem.date}
                          </span>
                        )}
                      </div>

                      <div className="space-y-1 pl-8">
                        {dayItem.activities.map((act, aIdx) => (
                          <div key={aIdx} className="flex items-start gap-2">
                            {act.time && (
                              <span className="font-bold text-stone-500 text-[10px] shrink-0 bg-stone-100 px-1.5 py-0.5 rounded">
                                {act.time}
                              </span>
                            )}
                            <p className="text-[11px] text-stone-700">{act.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 💺 INFORMASI MONITORING SEAT & KUOTA */}
            <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-100 text-amber-900">
                  <Armchair className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-extrabold text-stone-900">Monitoring Kuota Seat Grup</p>
                  <p className="text-[11px] font-medium text-stone-600">Sisa Kuota: <strong className="text-pink-600 font-extrabold text-sm">45 Seat Ready</strong></p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href="/paket/seat"
                  className="h-9 px-3.5 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Armchair className="h-3.5 w-3.5 text-amber-400" />
                  <span>Update Seat Kuota ↗</span>
                </Link>
                <a
                  href={`https://itineraryelmassa-weld.vercel.app/?packageId=${encodeURIComponent(selectedPkg.id)}&packageName=${encodeURIComponent(selectedPkg.name)}&departure=${encodeURIComponent(selectedPkg.departuresDate || (selectedPkg as any).departureDate || "")}&makkahHotel=${encodeURIComponent(selectedPkg.makkahHotel || "")}&madinahHotel=${encodeURIComponent(selectedPkg.madinahHotel || "")}&airline=${encodeURIComponent(selectedPkg.airline || "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="h-9 px-3.5 rounded-xl bg-[#2a170e] hover:bg-[#3d2417] text-amber-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                  <span>Buka Live Itinerary ↗</span>
                </a>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="flex items-center justify-end gap-2 border-t border-stone-100 pt-4">
              <button
                type="button"
                onClick={() => setSelectedPkg(null)}
                className="h-9 rounded-xl border border-stone-200 bg-white px-4 text-xs font-semibold text-stone-600 hover:bg-stone-50"
              >
                Tutup
              </button>

              {canEditPackage && (
                <button
                  type="button"
                  onClick={() => {
                    const current = selectedPkg;
                    setSelectedPkg(null);
                    openEditModal(current);
                  }}
                  className="h-9 rounded-xl border border-amber-300 bg-amber-50 px-4 text-xs font-bold text-amber-900 hover:bg-amber-100 flex items-center gap-1.5"
                >
                  <Edit3 className="h-4 w-4 text-amber-700" />
                  <span>Edit Paket Ini</span>
                </button>
              )}

              {canDeletePackage && (
                <button
                  type="button"
                  onClick={() => {
                    const current = selectedPkg;
                    confirmDeletePackage(current);
                  }}
                  className="h-9 rounded-xl border border-rose-300 bg-rose-50 px-4 text-xs font-bold text-rose-800 hover:bg-rose-100 flex items-center gap-1.5"
                >
                  <Trash2 className="h-4 w-4 text-rose-600" />
                  <span>Hapus Paket</span>
                </button>
              )}

              <Link
                href="/booking/form"
                className="h-9 rounded-xl bg-brand-pink px-5 text-xs font-semibold text-white shadow-2xs hover:bg-brand-pinkHover flex items-center gap-1"
              >
                <Plus className="h-4 w-4" strokeWidth={1.5} />
                <span>Booking Paket Ini Sekarang</span>
              </Link>
            </div>

          </div>
        </div>
      )}

      {/* ✏️ EDIT PACKAGE MODAL (RESTRICTED TO AUTHORIZED ROLES) */}
      {editingPkg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-2xl border border-stone-200 bg-white p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div className="flex items-center gap-2">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
                  <Edit3 className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-lg font-extrabold text-stone-900">Edit Data Paket Wisata</h3>
                  <p className="text-xs text-stone-500">Khusus Staf Authorized ({userRole})</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setEditingPkg(null)}
                className="grid h-8 w-8 place-items-center rounded-xl border border-stone-200 bg-stone-50 text-stone-500 hover:bg-stone-100 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Form Fields Grid */}
            <div className="grid gap-4 sm:grid-cols-2 text-xs">
              <div className="sm:col-span-2 space-y-1">
                <label className="font-semibold text-stone-700">Nama Paket</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full h-9 rounded-xl border border-stone-200 bg-stone-50/50 px-3 text-xs font-bold text-stone-900 outline-none focus:border-brand-pink"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-stone-700">Harga Jual Paket (All In)</label>
                <input
                  type="text"
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  className="w-full h-9 rounded-xl border border-stone-200 bg-stone-50/50 px-3 text-xs font-bold text-brand-pink outline-none focus:border-brand-pink"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-stone-700">DP Minimum</label>
                <input
                  type="text"
                  value={editDpMinimum}
                  onChange={(e) => setEditDpMinimum(e.target.value)}
                  className="w-full h-9 rounded-xl border border-stone-200 bg-stone-50/50 px-3 text-xs font-semibold text-stone-900 outline-none focus:border-brand-pink"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="font-semibold text-stone-700">Jadwal Keberangkatan & Kepulangan</label>
                <input
                  type="text"
                  value={editDeparturesDate}
                  onChange={(e) => setEditDeparturesDate(e.target.value)}
                  className="w-full h-9 rounded-xl border border-stone-200 bg-stone-50/50 px-3 text-xs font-semibold text-stone-900 outline-none focus:border-brand-pink"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-stone-700">Hotel Makkah</label>
                <input
                  type="text"
                  value={editMakkahHotel}
                  onChange={(e) => setEditMakkahHotel(e.target.value)}
                  className="w-full h-9 rounded-xl border border-stone-200 bg-stone-50/50 px-3 text-xs font-semibold text-stone-900 outline-none focus:border-brand-pink"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-stone-700">Hotel Madinah</label>
                <input
                  type="text"
                  value={editMadinahHotel}
                  onChange={(e) => setEditMadinahHotel(e.target.value)}
                  className="w-full h-9 rounded-xl border border-stone-200 bg-stone-50/50 px-3 text-xs font-semibold text-stone-900 outline-none focus:border-brand-pink"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="font-semibold text-stone-700">Maskapai Flight</label>
                <input
                  type="text"
                  value={editAirline}
                  onChange={(e) => setEditAirline(e.target.value)}
                  className="w-full h-9 rounded-xl border border-stone-200 bg-stone-50/50 px-3 text-xs font-semibold text-stone-900 outline-none focus:border-brand-pink"
                />
              </div>

              {/* 🖼️ POSTER UPLOADER SECTION */}
              <div className="sm:col-span-2 rounded-xl border border-stone-200 bg-stone-50 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-stone-800 flex items-center gap-1.5 text-xs">
                    <ImageIcon className="h-4 w-4 text-brand-pink" />
                    <span>Upload Poster Gambar Paket</span>
                  </label>
                  <span className="text-[10px] text-stone-500">JPG, PNG, WEBP</span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  {editPosterImg ? (
                    <div className="relative h-24 w-20 rounded-lg overflow-hidden border border-stone-300 shrink-0 bg-stone-200">
                      <img src={editPosterImg} alt="Preview Poster" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setEditPosterImg("")}
                        className="absolute top-1 right-1 rounded-full bg-stone-900/80 text-white p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="h-24 w-20 rounded-lg border-2 border-dashed border-stone-300 bg-white flex flex-col items-center justify-center p-2 text-stone-400 shrink-0">
                      <Upload className="h-5 w-5 mb-1" />
                      <span className="text-[8px] font-bold text-center">Belum ada gambar</span>
                    </div>
                  )}

                  <div className="flex-1 space-y-2">
                    <label className="inline-flex h-9 items-center gap-2 rounded-xl bg-stone-900 text-white font-bold text-xs px-4 cursor-pointer hover:bg-stone-800 transition">
                      <Upload className="h-4 w-4" />
                      <span>Pilih Gambar dari Komputer</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePosterUpload}
                        className="hidden"
                      />
                    </label>
                    <p className="text-[10px] text-stone-500">
                      Poster ini akan langsung tampil di brosur katalog & aplikasi jamaah UmrahMe.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between border-t border-stone-100 pt-4">
              <div>
                {canDeletePackage && (
                  <button
                    type="button"
                    onClick={() => {
                      const current = editingPkg;
                      confirmDeletePackage(current);
                    }}
                    className="h-9 rounded-xl border border-rose-300 bg-rose-50 px-4 text-xs font-bold text-rose-800 hover:bg-rose-100 flex items-center gap-1.5"
                  >
                    <Trash2 className="h-4 w-4 text-rose-600" />
                    <span>Hapus Paket Ini</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditingPkg(null)}
                  className="h-9 rounded-xl border border-stone-200 bg-white px-4 text-xs font-semibold text-stone-600 hover:bg-stone-50"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  className="h-9 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 px-5 text-xs font-extrabold text-white shadow-md hover:from-pink-700 hover:to-rose-700 active:scale-95 transition"
                >
                  Simpan Perubahan Paket
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ⚠️ DELETE PACKAGE CONFIRMATION MODAL */}
      {deletingPkg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-md rounded-2xl border border-stone-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 border-b border-stone-100 pb-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-rose-50 text-rose-600 border border-rose-200">
                <Trash2 className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-base font-extrabold text-stone-900">Hapus Paket Wisata</h3>
                <p className="text-xs font-semibold text-rose-700">Otorisasi Akun Master ({userRole})</p>
              </div>
            </div>

            <div className="space-y-2 text-xs text-stone-600">
              <p>Apakah Anda yakin ingin menghapus paket berikut secara permanen?</p>
              <div className="rounded-xl border border-stone-200 bg-stone-50 p-3">
                <p className="font-extrabold text-stone-900">{deletingPkg.name}</p>
                <p className="text-[11px] text-stone-500">{deletingPkg.departuresDate} • {deletingPkg.price}</p>
              </div>
              <p className="text-[11px] text-stone-500 italic">
                * Paket yang dihapus akan otomatis hilang dari katalog travel & aplikasi jamaah UmrahMe.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-stone-100 pt-3">
              <button
                type="button"
                onClick={() => setDeletingPkg(null)}
                className="h-9 rounded-xl border border-stone-200 bg-white px-4 text-xs font-semibold text-stone-600 hover:bg-stone-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={executeDeletePackage}
                className="h-9 rounded-xl bg-rose-600 px-5 text-xs font-extrabold text-white shadow-md hover:bg-rose-700 active:scale-95 transition"
              >
                Ya, Hapus Paket Permanen
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
