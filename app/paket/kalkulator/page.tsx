"use client";

import { useMemo, useState } from "react";
import {
  ArrowRight,
  Calculator,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Coins,
  Copy,
  DollarSign,
  Download,
  FileCheck2,
  Gift,
  HelpCircle,
  Hotel,
  Info,
  Layers,
  MapPin,
  Percent,
  PieChart,
  Plane,
  Plus,
  Printer,
  Receipt,
  RefreshCw,
  Save,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Truck,
  UserCheck,
  Users,
} from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";

export default function PackageCalculatorPage() {
  // 1. Basic Package Meta
  const [packageName, setPackageName] = useState("Umrah Spesial Musim Baru 12 Hari");
  const [durationDays, setDurationDays] = useState(12);
  const [makkahNights, setMakkahNights] = useState(5);
  const [madinahNights, setMadinahNights] = useState(4);
  const [targetPax, setTargetPax] = useState(45);
  const [sarExchangeRate, setSarExchangeRate] = useState(4300); // 1 SAR = Rp 4.300

  // 2. Costing Inputs (in IDR or SAR)
  // Flight
  const [flightPtkCgk, setFlightPtkCgk] = useState(2400000); // PP PGK-CGK
  const [flightCgkJed, setFlightCgkJed] = useState(14500000); // PP CGK-JED Saudia/Garuda

  // Hotels (Cost per night in SAR for 1 Room Quad)
  const [makkahHotelName, setMakkahHotelName] = useState("Grand Al Massa");
  const [makkahRoomSarPerNight, setMakkahRoomSarPerNight] = useState(480); // 480 SAR / night / room Quad
  const [madinahHotelName, setMadinahHotelName] = useState("Daar El Naeem");
  const [madinahRoomSarPerNight, setMadinahRoomSarPerNight] = useState(380); // 380 SAR / night / room Quad

  // Visa & Saudi Mandatory Insurance
  const [visaAndInsuranceSar, setVisaAndInsuranceSar] = useState(450); // 450 SAR per pax

  // Transport & Handling
  const [transportBusSarPerPax, setTransportBusSarPerPax] = useState(220); // Bus AC Makkah-Madinah-Jeddah-Thaif
  const [handlingBandaraIdr, setHandlingBandaraIdr] = useState(450000); // Handling JED & CGK

  // Catering & Food
  const [cateringSarPerDay, setCateringSarPerDay] = useState(45); // 45 SAR / day / pax (3x makan)

  // Equipment & Gifts
  const [equipmentIdr, setEquipmentIdr] = useState(1350000); // Koper Set, Ihram, Mukena, Batik, Tas

  // Muthawwif & Tour Leader Shared Cost
  const [muthawwifFeeIdrTotal, setMuthawwifFeeIdrTotal] = useState(18000000); // Shared among group pax

  // Bonus & Miscellaneous
  const [bonusCityTourThaifIdr, setBonusCityTourThaifIdr] = useState(350000); // Nasi Nampan + City Tour
  const [miscEmergencyIdr, setMiscEmergencyIdr] = useState(250000);

  // 3. Profit Margin Target
  const [marginType, setMarginType] = useState<"nominal" | "percent">("nominal");
  const [marginNominalPerPax, setMarginNominalPerPax] = useState(3500000); // Rp 3.500.000 profit / pax
  const [marginPercent, setMarginPercent] = useState(12); // 12%

  // 4. Calculations (Live Computed 0ms)
  const calculations = useMemo(() => {
    // Conversions
    const sarToIdr = (sar: number) => Math.round(sar * sarExchangeRate);

    // 1. Flight Total / Pax
    const totalFlight = flightPtkCgk + flightCgkJed;

    // 2. Hotel Cost per Pax (Quad = 4 pax per room)
    const makkahHotelTotalSar = makkahRoomSarPerNight * makkahNights; // Total cost per room Quad
    const makkahHotelPerPaxIdr = sarToIdr(makkahHotelTotalSar / 4);

    const madinahHotelTotalSar = madinahRoomSarPerNight * madinahNights; // Total cost per room Quad
    const madinahHotelPerPaxIdr = sarToIdr(madinahHotelTotalSar / 4);

    const totalHotelIdr = makkahHotelPerPaxIdr + madinahHotelPerPaxIdr;

    // 3. Visa & Insurance
    const visaInsuranceIdr = sarToIdr(visaAndInsuranceSar);

    // 4. Transport & Handling
    const transportBusIdr = sarToIdr(transportBusSarPerPax);
    const totalTransportHandling = transportBusIdr + handlingBandaraIdr;

    // 5. Catering
    const cateringTotalSar = cateringSarPerDay * durationDays;
    const cateringIdr = sarToIdr(cateringTotalSar);

    // 6. Shared Costs per Pax (Muthawwif & Leader)
    const sharedStaffCostPerPax = Math.round(muthawwifFeeIdrTotal / Math.max(targetPax, 1));

    // 7. Equipment, Bonus & Misc
    const totalEquipmentAndMisc = equipmentIdr + bonusCityTourThaifIdr + miscEmergencyIdr;

    // --- TOTAL HPP (HARGA POKOK PENJUALAN) PER PAX (QUAD) ---
    const hppQuadPerPax =
      totalFlight +
      totalHotelIdr +
      visaInsuranceIdr +
      totalTransportHandling +
      cateringIdr +
      sharedStaffCostPerPax +
      totalEquipmentAndMisc;

    // Profit Margin Calculation
    let profitPerPax = 0;
    if (marginType === "nominal") {
      profitPerPax = marginNominalPerPax;
    } else {
      profitPerPax = Math.round(hppQuadPerPax * (marginPercent / 100));
    }

    // Selling Price Quad
    const sellingPriceQuad = hppQuadPerPax + profitPerPax;

    // Triple (+ Rp 1.500.000) & Double (+ Rp 3.500.000)
    const sellingPriceTriple = sellingPriceQuad + 1500000;
    const sellingPriceDouble = sellingPriceQuad + 3500000;

    // Group Profit Projection
    const totalGroupRevenue = sellingPriceQuad * targetPax;
    const totalGroupHpp = hppQuadPerPax * targetPax;
    const totalGroupProfit = profitPerPax * targetPax;

    return {
      totalFlight,
      makkahHotelPerPaxIdr,
      madinahHotelPerPaxIdr,
      totalHotelIdr,
      visaInsuranceIdr,
      transportBusIdr,
      totalTransportHandling,
      cateringIdr,
      sharedStaffCostPerPax,
      totalEquipmentAndMisc,
      hppQuadPerPax,
      profitPerPax,
      sellingPriceQuad,
      sellingPriceTriple,
      sellingPriceDouble,
      totalGroupRevenue,
      totalGroupHpp,
      totalGroupProfit,
    };
  }, [
    flightPtkCgk,
    flightCgkJed,
    makkahRoomSarPerNight,
    makkahNights,
    madinahRoomSarPerNight,
    madinahNights,
    visaAndInsuranceSar,
    transportBusSarPerPax,
    handlingBandaraIdr,
    cateringSarPerDay,
    durationDays,
    muthawwifFeeIdrTotal,
    targetPax,
    equipmentIdr,
    bonusCityTourThaifIdr,
    miscEmergencyIdr,
    sarExchangeRate,
    marginType,
    marginNominalPerPax,
    marginPercent,
  ]);

  const formatRupiah = (val: number) => `Rp ${val.toLocaleString("id-ID")}`;

  return (
    <AppShell eyebrow="Manajemen Keuangan & HPP" title="Kalkulator Perancangan HPP Paket Umrah">
      <div className="space-y-6">
        
        {/* Header Title Banner */}
        <section className="rounded-2xl border border-stone-200/70 bg-white p-5 sm:p-6 shadow-2xs">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-rose-50 text-brand-pink border border-brand-pink/20">
                  <Calculator className="h-4 w-4" strokeWidth={1.5} />
                </span>
                <h1 className="text-xl font-extrabold text-brand-cocoa sm:text-2xl">
                  Simulator & Calculator HPP Paket Wisata
                </h1>
              </div>
              <p className="text-xs text-stone-500 mt-1 max-w-2xl">
                Rancang setiap komponen biaya tiket flight, hotel Makkah/Madinah, visa KSA, catering, dan fee muthawwif untuk menentukan **Harga Jual & Margin Keuntungan Pas**.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Link
                href="/paket"
                className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-stone-200 bg-stone-50 px-3.5 text-xs font-semibold text-stone-700 hover:bg-stone-100 transition"
              >
                ← Kembali ke Katalog
              </Link>
            </div>
          </div>
        </section>

        {/* 📊 SUMMARY RESULT BANNER (LIVE PROFIT & SELLING PRICE) */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          
          <div className="rounded-2xl border border-stone-200/70 bg-white p-4 shadow-2xs space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Total HPP per Pax (Quad)</p>
            <p className="text-xl font-black text-brand-cocoa">{formatRupiah(calculations.hppQuadPerPax)}</p>
            <p className="text-[11px] text-stone-500">Harga Pokok Modal Bersih</p>
          </div>

          <div className="rounded-2xl border border-emerald-200/70 bg-emerald-50/40 p-4 shadow-2xs space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Profit Travel per Pax</p>
            <p className="text-xl font-black text-emerald-700">{formatRupiah(calculations.profitPerPax)}</p>
            <p className="text-[11px] font-medium text-emerald-800">
              {marginType === "nominal" ? "Margin Nominal Tetap" : `Margin ${marginPercent}% dari HPP`}
            </p>
          </div>

          <div className="rounded-2xl border border-rose-200/70 bg-rose-50/50 p-4 shadow-2xs space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-brand-pink">Harga Jual Paket (Quad)</p>
            <p className="text-2xl font-black text-brand-pink">{formatRupiah(calculations.sellingPriceQuad)}</p>
            <p className="text-[11px] font-semibold text-rose-900">Rekomendasi Brosur Resmi</p>
          </div>

          <div className="rounded-2xl border border-stone-200/70 bg-stone-900 text-white p-4 shadow-2xs space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Est. Total Profit Rombongan</p>
            <p className="text-xl font-black text-emerald-400">{formatRupiah(calculations.totalGroupProfit)}</p>
            <p className="text-[11px] text-stone-300">Target {targetPax} Pax Jamaah</p>
          </div>

        </section>

        {/* MAIN INPUT & CALCULATOR GRID */}
        <div className="grid gap-6 lg:grid-cols-12">
          
          {/* LEFT 7 COLUMNS: INPUT COMPONENT FORM */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* 1. Parameter Utama */}
            <div className="rounded-2xl border border-stone-200/70 bg-white p-5 shadow-2xs space-y-4">
              <h3 className="text-sm font-bold text-brand-cocoa flex items-center gap-2 border-b border-stone-100 pb-3">
                <Info className="h-4 w-4 text-brand-pink" strokeWidth={1.5} />
                <span>1. Parameter Umum & Kurs SAR</span>
              </h3>

              <div className="grid gap-4 sm:grid-cols-2 text-xs">
                <div className="sm:col-span-2 space-y-1">
                  <label className="font-semibold text-stone-700">Nama Rancangan Paket</label>
                  <input
                    type="text"
                    value={packageName}
                    onChange={(e) => setPackageName(e.target.value)}
                    className="w-full h-9 rounded-xl border border-stone-200 bg-stone-50/50 px-3 text-xs font-semibold text-brand-cocoa outline-none focus:border-brand-pink"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">Total Durasi Program (Hari)</label>
                  <input
                    type="number"
                    value={durationDays}
                    onChange={(e) => setDurationDays(Number(e.target.value))}
                    className="w-full h-9 rounded-xl border border-stone-200 bg-stone-50/50 px-3 text-xs font-semibold text-brand-cocoa outline-none focus:border-brand-pink"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">Target Kuota Jamaah (Pax)</label>
                  <input
                    type="number"
                    value={targetPax}
                    onChange={(e) => setTargetPax(Number(e.target.value))}
                    className="w-full h-9 rounded-xl border border-stone-200 bg-stone-50/50 px-3 text-xs font-semibold text-brand-cocoa outline-none focus:border-brand-pink"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">Kurs 1 SAR ke IDR (Riyal)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-stone-400 font-bold text-[11px]">Rp</span>
                    <input
                      type="number"
                      value={sarExchangeRate}
                      onChange={(e) => setSarExchangeRate(Number(e.target.value))}
                      className="w-full h-9 rounded-xl border border-stone-200 bg-stone-50/50 pl-8 pr-3 text-xs font-bold text-brand-cocoa outline-none focus:border-brand-pink"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Biaya Tiket Flight PP */}
            <div className="rounded-2xl border border-stone-200/70 bg-white p-5 shadow-2xs space-y-4">
              <h3 className="text-sm font-bold text-brand-cocoa flex items-center gap-2 border-b border-stone-100 pb-3">
                <Plane className="h-4 w-4 text-sky-600" strokeWidth={1.5} />
                <span>2. Tiket Pesawat Flight PP</span>
              </h3>

              <div className="grid gap-4 sm:grid-cols-2 text-xs">
                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">Domestic Flight PP (PGK - CGK)</label>
                  <input
                    type="number"
                    value={flightPtkCgk}
                    onChange={(e) => setFlightPtkCgk(Number(e.target.value))}
                    className="w-full h-9 rounded-xl border border-stone-200 bg-stone-50/50 px-3 text-xs font-semibold text-brand-cocoa outline-none focus:border-brand-pink"
                  />
                  <p className="text-[10px] text-stone-400">Garuda Indonesia Pangkalpinang PP</p>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">International Flight PP (CGK - JED/MED)</label>
                  <input
                    type="number"
                    value={flightCgkJed}
                    onChange={(e) => setFlightCgkJed(Number(e.target.value))}
                    className="w-full h-9 rounded-xl border border-stone-200 bg-stone-50/50 px-3 text-xs font-semibold text-brand-cocoa outline-none focus:border-brand-pink"
                  />
                  <p className="text-[10px] text-stone-400">Saudia Airlines / Garuda Direct Saudi</p>
                </div>
              </div>
            </div>

            {/* 3. Akomodasi Hotel Makkah & Madinah */}
            <div className="rounded-2xl border border-stone-200/70 bg-white p-5 shadow-2xs space-y-4">
              <h3 className="text-sm font-bold text-brand-cocoa flex items-center gap-2 border-b border-stone-100 pb-3">
                <Hotel className="h-4 w-4 text-brand-pink" strokeWidth={1.5} />
                <span>3. Hotel Makkah & Madinah (Quad Base)</span>
              </h3>

              <div className="grid gap-4 sm:grid-cols-2 text-xs">
                {/* Makkah */}
                <div className="space-y-3 rounded-xl border border-stone-200/60 bg-stone-50/50 p-3">
                  <p className="font-bold text-brand-cocoa flex items-center justify-between">
                    <span>🕋 Hotel Makkah</span>
                    <span className="text-[10px] text-stone-500 font-normal">{makkahNights} Malam</span>
                  </p>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-stone-600">Nama Hotel</label>
                    <input
                      type="text"
                      value={makkahHotelName}
                      onChange={(e) => setMakkahHotelName(e.target.value)}
                      className="w-full h-8 rounded-lg border border-stone-200 bg-white px-2.5 text-xs font-semibold text-stone-800"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-stone-600">Durasi Malam</label>
                      <input
                        type="number"
                        value={makkahNights}
                        onChange={(e) => setMakkahNights(Number(e.target.value))}
                        className="w-full h-8 rounded-lg border border-stone-200 bg-white px-2.5 text-xs font-semibold text-stone-800"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-stone-600">Tarif/Malam (SAR)</label>
                      <input
                        type="number"
                        value={makkahRoomSarPerNight}
                        onChange={(e) => setMakkahRoomSarPerNight(Number(e.target.value))}
                        className="w-full h-8 rounded-lg border border-stone-200 bg-white px-2.5 text-xs font-bold text-stone-800"
                      />
                    </div>
                  </div>
                </div>

                {/* Madinah */}
                <div className="space-y-3 rounded-xl border border-stone-200/60 bg-stone-50/50 p-3">
                  <p className="font-bold text-emerald-900 flex items-center justify-between">
                    <span>🕌 Hotel Madinah</span>
                    <span className="text-[10px] text-stone-500 font-normal">{madinahNights} Malam</span>
                  </p>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-stone-600">Nama Hotel</label>
                    <input
                      type="text"
                      value={madinahHotelName}
                      onChange={(e) => setMadinahHotelName(e.target.value)}
                      className="w-full h-8 rounded-lg border border-stone-200 bg-white px-2.5 text-xs font-semibold text-stone-800"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-stone-600">Durasi Malam</label>
                      <input
                        type="number"
                        value={madinahNights}
                        onChange={(e) => setMadinahNights(Number(e.target.value))}
                        className="w-full h-8 rounded-lg border border-stone-200 bg-white px-2.5 text-xs font-semibold text-stone-800"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-stone-600">Tarif/Malam (SAR)</label>
                      <input
                        type="number"
                        value={madinahRoomSarPerNight}
                        onChange={(e) => setMadinahRoomSarPerNight(Number(e.target.value))}
                        className="w-full h-8 rounded-lg border border-stone-200 bg-white px-2.5 text-xs font-bold text-stone-800"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Visa, Transport, Catering, Staff & Perlengkapan */}
            <div className="rounded-2xl border border-stone-200/70 bg-white p-5 shadow-2xs space-y-4">
              <h3 className="text-sm font-bold text-brand-cocoa flex items-center gap-2 border-b border-stone-100 pb-3">
                <Receipt className="h-4 w-4 text-emerald-600" strokeWidth={1.5} />
                <span>4. Visa, Transport, Catering & Perlengkapan</span>
              </h3>

              <div className="grid gap-4 sm:grid-cols-2 text-xs">
                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">Visa Umrah + Asuransi Saudi (SAR)</label>
                  <input
                    type="number"
                    value={visaAndInsuranceSar}
                    onChange={(e) => setVisaAndInsuranceSar(Number(e.target.value))}
                    className="w-full h-9 rounded-xl border border-stone-200 bg-stone-50/50 px-3 text-xs font-semibold text-brand-cocoa outline-none focus:border-brand-pink"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">Transport Bus AC per Pax (SAR)</label>
                  <input
                    type="number"
                    value={transportBusSarPerPax}
                    onChange={(e) => setTransportBusSarPerPax(Number(e.target.value))}
                    className="w-full h-9 rounded-xl border border-stone-200 bg-stone-50/50 px-3 text-xs font-semibold text-brand-cocoa outline-none focus:border-brand-pink"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">Catering 3x Makan/Hari (SAR/Hari)</label>
                  <input
                    type="number"
                    value={cateringSarPerDay}
                    onChange={(e) => setCateringSarPerDay(Number(e.target.value))}
                    className="w-full h-9 rounded-xl border border-stone-200 bg-stone-50/50 px-3 text-xs font-semibold text-brand-cocoa outline-none focus:border-brand-pink"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">Perlengkapan & Koper Set (Rp/Pax)</label>
                  <input
                    type="number"
                    value={equipmentIdr}
                    onChange={(e) => setEquipmentIdr(Number(e.target.value))}
                    className="w-full h-9 rounded-xl border border-stone-200 bg-stone-50/50 px-3 text-xs font-semibold text-brand-cocoa outline-none focus:border-brand-pink"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">Total Fee Muthawwif & Leader (Rp Shared)</label>
                  <input
                    type="number"
                    value={muthawwifFeeIdrTotal}
                    onChange={(e) => setMuthawwifFeeIdrTotal(Number(e.target.value))}
                    className="w-full h-9 rounded-xl border border-stone-200 bg-stone-50/50 px-3 text-xs font-semibold text-brand-cocoa outline-none focus:border-brand-pink"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">City Tour Thaif + Nasi Nampan (Rp/Pax)</label>
                  <input
                    type="number"
                    value={bonusCityTourThaifIdr}
                    onChange={(e) => setBonusCityTourThaifIdr(Number(e.target.value))}
                    className="w-full h-9 rounded-xl border border-stone-200 bg-stone-50/50 px-3 text-xs font-semibold text-brand-cocoa outline-none focus:border-brand-pink"
                  />
                </div>
              </div>
            </div>

            {/* 5. Target Margin Profit Travel */}
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/30 p-5 shadow-2xs space-y-4">
              <h3 className="text-sm font-bold text-emerald-950 flex items-center gap-2 border-b border-emerald-200/60 pb-3">
                <TrendingUp className="h-4 w-4 text-emerald-600" strokeWidth={1.5} />
                <span>5. Target Profit Margin Travel per Pax</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 font-semibold text-stone-700 cursor-pointer">
                    <input
                      type="radio"
                      name="marginType"
                      checked={marginType === "nominal"}
                      onChange={() => setMarginType("nominal")}
                      className="accent-brand-pink"
                    />
                    <span>Margin Nominal Tetap (Rp per Pax)</span>
                  </label>

                  <label className="flex items-center gap-2 font-semibold text-stone-700 cursor-pointer">
                    <input
                      type="radio"
                      name="marginType"
                      checked={marginType === "percent"}
                      onChange={() => setMarginType("percent")}
                      className="accent-brand-pink"
                    />
                    <span>Margin Persentase (% dari HPP)</span>
                  </label>
                </div>

                {marginType === "nominal" ? (
                  <div className="space-y-1 max-w-xs">
                    <label className="font-semibold text-stone-700">Keuntungan per Pax (Rp)</label>
                    <input
                      type="number"
                      value={marginNominalPerPax}
                      onChange={(e) => setMarginNominalPerPax(Number(e.target.value))}
                      className="w-full h-9 rounded-xl border border-emerald-300 bg-white px-3 text-xs font-bold text-emerald-800 outline-none focus:border-emerald-500"
                    />
                  </div>
                ) : (
                  <div className="space-y-1 max-w-xs">
                    <label className="font-semibold text-stone-700">Keuntungan Persentase (%)</label>
                    <input
                      type="number"
                      value={marginPercent}
                      onChange={(e) => setMarginPercent(Number(e.target.value))}
                      className="w-full h-9 rounded-xl border border-emerald-300 bg-white px-3 text-xs font-bold text-emerald-800 outline-none focus:border-emerald-500"
                    />
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* RIGHT 5 COLUMNS: LIVE COST BREAKDOWN & SELLING PRICE TIERS */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* 🏷️ TIPE HARGA JUAL PAKET (QUAD / TRIPLE / DOUBLE) */}
            <div className="rounded-2xl border border-brand-pink/30 bg-white p-5 shadow-sm space-y-4">
              <h3 className="text-sm font-extrabold text-brand-cocoa flex items-center justify-between border-b border-stone-100 pb-3">
                <span>Rekomendasi Harga Jual Brosur</span>
                <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-[10px] font-bold text-brand-pink">
                  Auto Calculated
                </span>
              </h3>

              <div className="space-y-3">
                
                {/* QUAD */}
                <div className="rounded-xl border border-brand-pink/30 bg-rose-50/40 p-3.5 flex items-center justify-between">
                  <div>
                    <span className="rounded-md bg-brand-pink px-2 py-0.5 text-[10px] font-bold text-white uppercase">
                      Kamar Quad (4 Pax)
                    </span>
                    <p className="text-[11px] font-semibold text-stone-500 mt-1">Standar Brosur Utama</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-black text-brand-pink">{formatRupiah(calculations.sellingPriceQuad)}</p>
                    <p className="text-[10px] text-stone-400">HPP {formatRupiah(calculations.hppQuadPerPax)}</p>
                  </div>
                </div>

                {/* TRIPLE */}
                <div className="rounded-xl border border-stone-200 bg-stone-50/60 p-3.5 flex items-center justify-between">
                  <div>
                    <span className="rounded-md bg-stone-700 px-2 py-0.5 text-[10px] font-bold text-white uppercase">
                      Kamar Triple (3 Pax)
                    </span>
                    <p className="text-[11px] font-semibold text-stone-500 mt-1">+ Rp 1.500.000 / pax</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-extrabold text-brand-cocoa">{formatRupiah(calculations.sellingPriceTriple)}</p>
                  </div>
                </div>

                {/* DOUBLE */}
                <div className="rounded-xl border border-stone-200 bg-stone-50/60 p-3.5 flex items-center justify-between">
                  <div>
                    <span className="rounded-md bg-stone-900 px-2 py-0.5 text-[10px] font-bold text-white uppercase">
                      Kamar Double (2 Pax)
                    </span>
                    <p className="text-[11px] font-semibold text-stone-500 mt-1">+ Rp 3.500.000 / pax</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-extrabold text-brand-cocoa">{formatRupiah(calculations.sellingPriceDouble)}</p>
                  </div>
                </div>

              </div>
            </div>

            {/* 📐 RINCIAN DETAIL STRUCTURAL COST HPP PER PAX */}
            <div className="rounded-2xl border border-stone-200/70 bg-white p-5 shadow-2xs space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 border-b border-stone-100 pb-2">
                Struktur Komponen HPP per Pax
              </h4>

              <div className="space-y-2.5 text-xs">
                
                <div className="flex items-center justify-between py-1 border-b border-stone-100">
                  <span className="text-stone-600 flex items-center gap-1.5">
                    <Plane className="h-3.5 w-3.5 text-sky-600" /> Tiket Flight PP Total
                  </span>
                  <span className="font-bold text-brand-cocoa">{formatRupiah(calculations.totalFlight)}</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-stone-100">
                  <span className="text-stone-600 flex items-center gap-1.5">
                    <Hotel className="h-3.5 w-3.5 text-brand-pink" /> Hotel Makkah ({makkahNights} M)
                  </span>
                  <span className="font-bold text-brand-cocoa">{formatRupiah(calculations.makkahHotelPerPaxIdr)}</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-stone-100">
                  <span className="text-stone-600 flex items-center gap-1.5">
                    <Hotel className="h-3.5 w-3.5 text-emerald-600" /> Hotel Madinah ({madinahNights} M)
                  </span>
                  <span className="font-bold text-brand-cocoa">{formatRupiah(calculations.madinahHotelPerPaxIdr)}</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-stone-100">
                  <span className="text-stone-600 flex items-center gap-1.5">
                    <Receipt className="h-3.5 w-3.5 text-purple-600" /> Visa & Insurance Saudi
                  </span>
                  <span className="font-bold text-brand-cocoa">{formatRupiah(calculations.visaInsuranceIdr)}</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-stone-100">
                  <span className="text-stone-600 flex items-center gap-1.5">
                    <Truck className="h-3.5 w-3.5 text-amber-600" /> Transport Bus & Handling
                  </span>
                  <span className="font-bold text-brand-cocoa">{formatRupiah(calculations.totalTransportHandling)}</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-stone-100">
                  <span className="text-stone-600 flex items-center gap-1.5">
                    <Gift className="h-3.5 w-3.5 text-rose-500" /> Catering ({durationDays} Hari)
                  </span>
                  <span className="font-bold text-brand-cocoa">{formatRupiah(calculations.cateringIdr)}</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-stone-100">
                  <span className="text-stone-600 flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-indigo-600" /> Shared Staff & Muthawwif
                  </span>
                  <span className="font-bold text-brand-cocoa">{formatRupiah(calculations.sharedStaffCostPerPax)}</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-stone-100">
                  <span className="text-stone-600 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-amber-500" /> Koper, Bonus & Emergency
                  </span>
                  <span className="font-bold text-brand-cocoa">{formatRupiah(calculations.totalEquipmentAndMisc)}</span>
                </div>

                {/* TOTAL HPP */}
                <div className="flex items-center justify-between pt-2 text-sm font-extrabold text-brand-cocoa">
                  <span>TOTAL HPP PER PAX</span>
                  <span className="text-brand-pink">{formatRupiah(calculations.hppQuadPerPax)}</span>
                </div>

              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="rounded-2xl border border-stone-200/70 bg-white p-5 shadow-2xs space-y-3">
              <Link
                href="/paket"
                className="w-full h-10 rounded-xl bg-brand-pink text-xs font-semibold text-white shadow-2xs hover:bg-brand-pinkHover transition flex items-center justify-center gap-2"
              >
                <Save className="h-4 w-4" strokeWidth={1.5} />
                <span>Simpan & Terbitkan ke Katalog Paket</span>
              </Link>

              <button
                type="button"
                onClick={() => window.print()}
                className="w-full h-9 rounded-xl border border-stone-200 bg-stone-50 text-xs font-semibold text-stone-700 hover:bg-stone-100 transition flex items-center justify-center gap-2"
              >
                <Printer className="h-4 w-4 text-stone-500" strokeWidth={1.5} />
                <span>Cetak Lembar HPP Internal</span>
              </button>
            </div>

          </div>

        </div>

      </div>
    </AppShell>
  );
}
