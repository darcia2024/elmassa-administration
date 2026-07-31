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

  // Handling Bandara Jakarta (CGK) & Arab Saudi (JED/MED)
  const [handlingJakartaCgkIdr, setHandlingJakartaCgkIdr] = useState(350000); // Handling CGK Jakarta per pax (Rp)
  const [handlingSaudiBandaraSar, setHandlingSaudiBandaraSar] = useState(150); // Handling JED/MED Saudi per pax (SAR)

  // Transit & Lounge
  const [hotelTransitLoungeIdr, setHotelTransitLoungeIdr] = useState(650000); // Hotel Transit Jakarta / Lounge Executive Bandara CGK

  // Marketing & Agency Fee
  const [feeMarketingIdr, setFeeMarketingIdr] = useState(1000000); // Fee Marketing & Komisi Agen / Staf Sales per pax

  // Nasi Box Transit (Jakarta CGK & Arab Saudi JED/MED)
  const [nasiBoxJakartaQty, setNasiBoxJakartaQty] = useState(2); // 2x Makan Nasi Box Transit Jakarta
  const [nasiBoxJakartaPriceIdr, setNasiBoxJakartaPriceIdr] = useState(45000); // Rp 45.000 / box
  const [nasiBoxSaudiQty, setNasiBoxSaudiQty] = useState(2); // 2x Makan Nasi Box Transit Bandara Saudi (JED/MED)
  const [nasiBoxSaudiPriceSar, setNasiBoxSaudiPriceSar] = useState(25); // 25 SAR / box

  // Equipment Itemized Prices - Men (10 Items)
  const [equipMenIhram, setEquipMenIhram] = useState(250000);
  const [equipMenKainBaju, setEquipMenKainBaju] = useState(180000);
  const [equipMenRansel, setEquipMenRansel] = useState(150000);
  const [equipMenTasSerut, setEquipMenTasSerut] = useState(40000);
  const [equipMenSarungKoper, setEquipMenSarungKoper] = useState(80000);
  const [equipMenTagBagasi, setEquipMenTagBagasi] = useState(30000);
  const [equipMenBukuDoa, setEquipMenBukuDoa] = useState(50000);
  const [equipMenSajadahSyal, setEquipMenSajadahSyal] = useState(75000);
  const [equipMenBantalLeher, setEquipMenBantalLeher] = useState(65000);
  const [equipMenLanyard, setEquipMenLanyard] = useState(25000);

  // Equipment Itemized Prices - Women (11 Items)
  const [equipWomenKainBaju, setEquipWomenKainBaju] = useState(180000);
  const [equipWomenKerudung, setEquipWomenKerudung] = useState(120000);
  const [equipWomenRansel, setEquipWomenRansel] = useState(150000);
  const [equipWomenTasSerut, setEquipWomenTasSerut] = useState(40000);
  const [equipWomenSarungKoper, setEquipWomenSarungKoper] = useState(80000);
  const [equipWomenTagBagasi, setEquipWomenTagBagasi] = useState(30000);
  const [equipWomenBukuDoa, setEquipWomenBukuDoa] = useState(50000);
  const [equipWomenSyalSajadah, setEquipWomenSyalSajadah] = useState(75000);
  const [equipWomenMukenaTravel, setEquipWomenMukenaTravel] = useState(180000);
  const [equipWomenBantalLeher, setEquipWomenBantalLeher] = useState(65000);
  const [equipWomenLanyard, setEquipWomenLanyard] = useState(25000);

  // Muthawwif & Tour Leader Shared Cost
  const [muthawwifFeeIdrTotal, setMuthawwifFeeIdrTotal] = useState(18000000); // Shared among group pax

  // Bonus & Miscellaneous
  const [bonusCityTourThaifIdr, setBonusCityTourThaifIdr] = useState(350000); // Nasi Nampan + City Tour
  const [miscEmergencyIdr, setMiscEmergencyIdr] = useState(250000);

  // Group Room Distribution (Berapa Jamaah Upgrade Triple & Double)
  const [triplePaxCount, setTriplePaxCount] = useState(6); // 6 Jamaah (2 Kamar Triple)
  const [doublePaxCount, setDoublePaxCount] = useState(4); // 4 Jamaah (2 Kamar Double)

  // Tariff Surcharge Tetap per Pax (Paten)
  const TRIPLE_SURCHARGE_PATEN = 2500000; // Paten + Rp 2.500.000 / pax
  const DOUBLE_SURCHARGE_PATEN = 4500000; // Paten + Rp 4.500.000 / pax

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

    // 2. Hotel Cost per Pax (Quad = 4 pax per room) - FULLBOARD 3X MAKAN
    const makkahHotelTotalSar = makkahRoomSarPerNight * makkahNights; // Total cost per room Quad
    const makkahHotelPerPaxIdr = sarToIdr(makkahHotelTotalSar / 4);

    const madinahHotelTotalSar = madinahRoomSarPerNight * madinahNights; // Total cost per room Quad
    const madinahHotelPerPaxIdr = sarToIdr(madinahHotelTotalSar / 4);

    const totalHotelIdr = makkahHotelPerPaxIdr + madinahHotelPerPaxIdr;

    // 3. Visa & Insurance
    const visaInsuranceIdr = sarToIdr(visaAndInsuranceSar);

    // 4. Handling Bandara Dipisah (Jakarta CGK & Saudi JED/MED)
    const handlingJakartaIdr = handlingJakartaCgkIdr;
    const handlingSaudiIdr = sarToIdr(handlingSaudiBandaraSar);
    const totalTransportHandling = handlingJakartaIdr + handlingSaudiIdr;

    // 5. Transit & Lounge
    const totalTransitLounge = hotelTransitLoungeIdr;

    // 6. Nasi Box Transit (Jakarta & Saudi)
    const nasiBoxJakartaTotalIdr = nasiBoxJakartaQty * nasiBoxJakartaPriceIdr;
    const nasiBoxSaudiTotalSar = nasiBoxSaudiQty * nasiBoxSaudiPriceSar;
    const nasiBoxSaudiTotalIdr = sarToIdr(nasiBoxSaudiTotalSar);
    const totalNasiBoxTransitIdr = nasiBoxJakartaTotalIdr + nasiBoxSaudiTotalIdr;

    // 7. Shared Costs per Pax (Muthawwif & Leader)
    const sharedStaffCostPerPax = Math.round(muthawwifFeeIdrTotal / Math.max(targetPax, 1));

    // 8. Marketing Fee & Agency
    const totalFeeMarketing = feeMarketingIdr;

    // 9. Equipment Rincian Total per Pax (Itemized Sum per Gender)
    const menEquipTotal =
      equipMenIhram +
      equipMenKainBaju +
      equipMenRansel +
      equipMenTasSerut +
      equipMenSarungKoper +
      equipMenTagBagasi +
      equipMenBukuDoa +
      equipMenSajadahSyal +
      equipMenBantalLeher +
      equipMenLanyard;

    const womenEquipTotal =
      equipWomenKainBaju +
      equipWomenKerudung +
      equipWomenRansel +
      equipWomenTasSerut +
      equipWomenSarungKoper +
      equipWomenTagBagasi +
      equipWomenBukuDoa +
      equipWomenSyalSajadah +
      equipWomenMukenaTravel +
      equipWomenBantalLeher +
      equipWomenLanyard;

    const equipmentTotalIdr = Math.round((menEquipTotal + womenEquipTotal) / 2);

    // 10. Bonus & Misc
    const totalBonusAndMisc = bonusCityTourThaifIdr + miscEmergencyIdr;

    // --- TOTAL HPP (HARGA POKOK PENJUALAN) PER PAX (QUAD) ---
    const hppQuadPerPax =
      totalFlight +
      totalHotelIdr +
      visaInsuranceIdr +
      totalTransportHandling +
      totalTransitLounge +
      totalNasiBoxTransitIdr +
      sharedStaffCostPerPax +
      totalFeeMarketing +
      equipmentTotalIdr +
      totalBonusAndMisc;

    // Profit Margin Calculation
    let profitPerPax = 0;
    if (marginType === "nominal") {
      profitPerPax = marginNominalPerPax;
    } else {
      profitPerPax = Math.round(hppQuadPerPax * (marginPercent / 100));
    }

    // Selling Price per Pax Tiers
    const sellingPriceQuad = hppQuadPerPax + profitPerPax;
    const sellingPriceTriple = sellingPriceQuad + TRIPLE_SURCHARGE_PATEN;
    const sellingPriceDouble = sellingPriceQuad + DOUBLE_SURCHARGE_PATEN;

    // Room Distribution Count Calculation
    const quadPaxCount = Math.max(0, targetPax - triplePaxCount - doublePaxCount);

    // Group Revenue & Profit Projection based on exact room distribution
    const totalGroupRevenue =
      quadPaxCount * sellingPriceQuad +
      triplePaxCount * sellingPriceTriple +
      doublePaxCount * sellingPriceDouble;

    const totalGroupHpp = hppQuadPerPax * targetPax;
    const totalGroupProfit = totalGroupRevenue - totalGroupHpp;

    return {
      totalFlight,
      makkahHotelPerPaxIdr,
      madinahHotelPerPaxIdr,
      totalHotelIdr,
      visaInsuranceIdr,
      handlingJakartaIdr,
      handlingSaudiIdr,
      totalTransportHandling,
      totalTransitLounge,
      nasiBoxJakartaTotalIdr,
      nasiBoxSaudiTotalIdr,
      totalNasiBoxTransitIdr,
      sharedStaffCostPerPax,
      totalFeeMarketing,
      menEquipTotal,
      womenEquipTotal,
      equipmentTotalIdr,
      totalBonusAndMisc,
      hppQuadPerPax,
      profitPerPax,
      sellingPriceQuad,
      sellingPriceTriple,
      sellingPriceDouble,
      quadPaxCount,
      triplePaxCount,
      doublePaxCount,
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
    handlingJakartaCgkIdr,
    handlingSaudiBandaraSar,
    hotelTransitLoungeIdr,
    feeMarketingIdr,
    nasiBoxJakartaQty,
    nasiBoxJakartaPriceIdr,
    nasiBoxSaudiQty,
    nasiBoxSaudiPriceSar,
    muthawwifFeeIdrTotal,
    targetPax,
    equipMenIhram,
    equipMenKainBaju,
    equipMenRansel,
    equipMenTasSerut,
    equipMenSarungKoper,
    equipMenTagBagasi,
    equipMenBukuDoa,
    equipMenSajadahSyal,
    equipMenBantalLeher,
    equipMenLanyard,
    equipWomenKainBaju,
    equipWomenKerudung,
    equipWomenRansel,
    equipWomenTasSerut,
    equipWomenSarungKoper,
    equipWomenTagBagasi,
    equipWomenBukuDoa,
    equipWomenSyalSajadah,
    equipWomenMukenaTravel,
    equipWomenBantalLeher,
    equipWomenLanyard,
    bonusCityTourThaifIdr,
    miscEmergencyIdr,
    sarExchangeRate,
    marginType,
    marginNominalPerPax,
    marginPercent,
    triplePaxCount,
    doublePaxCount,
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

            {/* 3. Akomodasi Hotel Makkah & Madinah (FULLBOARD 3X MAKAN) */}
            <div className="rounded-2xl border border-stone-200/70 bg-white p-5 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-stone-100 pb-3 gap-2">
                <h3 className="text-sm font-bold text-brand-cocoa flex items-center gap-2">
                  <Hotel className="h-4 w-4 text-brand-pink" strokeWidth={1.5} />
                  <span>3. Hotel Makkah & Madinah (Quad Base)</span>
                </h3>
                <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-800 self-start sm:self-auto">
                  ✓ Makan 3x/Hari Masuk Harga Hotel
                </span>
              </div>

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

                {/* Komposisi Alokasi Kamar Rombongan */}
                <div className="sm:col-span-2 pt-3 border-t border-stone-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-stone-800">Alokasi Pembagian Kamar Rombongan ({targetPax} Pax Total)</p>
                    <span className="text-[10px] font-semibold text-stone-500">Tarif Upgrade Paten</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="space-y-1 rounded-xl border border-stone-200 bg-stone-50/70 p-2.5">
                      <label className="text-[10px] font-bold text-stone-600 block">Kamar Quad (4 Pax)</label>
                      <p className="text-sm font-black text-brand-pink">{calculations.quadPaxCount} Pax</p>
                      <p className="text-[9px] text-stone-400 font-medium">Sisa Kuota Otomatis</p>
                    </div>

                    <div className="space-y-1 rounded-xl border border-amber-200 bg-amber-50/40 p-2.5">
                      <label className="text-[10px] font-bold text-amber-900 block">Upgrade Triple (+2.5 Jt)</label>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={triplePaxCount}
                          onChange={(e) => setTriplePaxCount(Math.max(0, Number(e.target.value)))}
                          className="w-full h-7 rounded-lg border border-amber-300 bg-white px-2 text-xs font-bold text-amber-900"
                        />
                        <span className="text-[10px] font-bold text-amber-800">Pax</span>
                      </div>
                      <p className="text-[9px] text-amber-700">~{Math.ceil(triplePaxCount / 3)} Kamar Triple</p>
                    </div>

                    <div className="space-y-1 rounded-xl border border-purple-200 bg-purple-50/40 p-2.5">
                      <label className="text-[10px] font-bold text-purple-900 block">Upgrade Double (+4.5 Jt)</label>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={doublePaxCount}
                          onChange={(e) => setDoublePaxCount(Math.max(0, Number(e.target.value)))}
                          className="w-full h-7 rounded-lg border border-purple-300 bg-white px-2 text-xs font-bold text-purple-900"
                        />
                        <span className="text-[10px] font-bold text-purple-800">Pax</span>
                      </div>
                      <p className="text-[9px] text-purple-700">~{Math.ceil(doublePaxCount / 2)} Kamar Double</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* 4. Visa, Transport, Handling, Transit & Nasi Box */}
            <div className="rounded-2xl border border-stone-200/70 bg-white p-5 shadow-2xs space-y-4">
              <h3 className="text-sm font-bold text-brand-cocoa flex items-center gap-2 border-b border-stone-100 pb-3">
                <Receipt className="h-4 w-4 text-emerald-600" strokeWidth={1.5} />
                <span>4. Visa, Transport, Handling, Transit & Nasi Box</span>
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
                  <label className="font-semibold text-stone-700">Hotel Jakarta / Lounge Bandara (Rp/Pax)</label>
                  <input
                    type="number"
                    value={hotelTransitLoungeIdr}
                    onChange={(e) => setHotelTransitLoungeIdr(Number(e.target.value))}
                    className="w-full h-9 rounded-xl border border-stone-200 bg-stone-50/50 px-3 text-xs font-semibold text-brand-cocoa outline-none focus:border-brand-pink"
                  />
                  <p className="text-[10px] text-stone-400">Transit Hotel CGK / Executive Lounge</p>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">Handling Bandara Jakarta (CGK) (Rp/Pax)</label>
                  <input
                    type="number"
                    value={handlingJakartaCgkIdr}
                    onChange={(e) => setHandlingJakartaCgkIdr(Number(e.target.value))}
                    className="w-full h-9 rounded-xl border border-stone-200 bg-stone-50/50 px-3 text-xs font-semibold text-brand-cocoa outline-none focus:border-brand-pink"
                  />
                  <p className="text-[10px] text-stone-400">Tim Handling Soekarno-Hatta Jakarta</p>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">Handling Bandara Arab Saudi (SAR/Pax)</label>
                  <input
                    type="number"
                    value={handlingSaudiBandaraSar}
                    onChange={(e) => setHandlingSaudiBandaraSar(Number(e.target.value))}
                    className="w-full h-9 rounded-xl border border-stone-200 bg-stone-50/50 px-3 text-xs font-bold text-brand-cocoa outline-none focus:border-brand-pink"
                  />
                  <p className="text-[10px] text-stone-400">Tim Handling Bandara JED & MED (~{formatRupiah(calculations.handlingSaudiIdr)})</p>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">Fee Marketing & Komisi Agen (Rp/Pax)</label>
                  <input
                    type="number"
                    value={feeMarketingIdr}
                    onChange={(e) => setFeeMarketingIdr(Number(e.target.value))}
                    className="w-full h-9 rounded-xl border border-stone-200 bg-stone-50/50 px-3 text-xs font-semibold text-brand-cocoa outline-none focus:border-brand-pink"
                  />
                  <p className="text-[10px] text-stone-400">Komisi Sales / Mitra Agent Per Pax</p>
                </div>

                {/* Nasi Box Jakarta */}
                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">Nasi Box Transit Jakarta (CGK)</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      value={nasiBoxJakartaQty}
                      onChange={(e) => setNasiBoxJakartaQty(Number(e.target.value))}
                      placeholder="Qty Box"
                      className="h-9 rounded-xl border border-stone-200 bg-stone-50/50 px-2.5 text-xs font-semibold text-brand-cocoa"
                    />
                    <input
                      type="number"
                      value={nasiBoxJakartaPriceIdr}
                      onChange={(e) => setNasiBoxJakartaPriceIdr(Number(e.target.value))}
                      placeholder="Rp / Box"
                      className="h-9 rounded-xl border border-stone-200 bg-stone-50/50 px-2.5 text-xs font-bold text-brand-cocoa"
                    />
                  </div>
                  <p className="text-[10px] text-stone-400">Total Rp {calculations.nasiBoxJakartaTotalIdr.toLocaleString("id-ID")}</p>
                </div>

                {/* Nasi Box Arab Saudi */}
                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">Nasi Box Transit Bandara Saudi (SAR)</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      value={nasiBoxSaudiQty}
                      onChange={(e) => setNasiBoxSaudiQty(Number(e.target.value))}
                      placeholder="Qty Box"
                      className="h-9 rounded-xl border border-stone-200 bg-stone-50/50 px-2.5 text-xs font-semibold text-brand-cocoa"
                    />
                    <input
                      type="number"
                      value={nasiBoxSaudiPriceSar}
                      onChange={(e) => setNasiBoxSaudiPriceSar(Number(e.target.value))}
                      placeholder="SAR / Box"
                      className="h-9 rounded-xl border border-stone-200 bg-stone-50/50 px-2.5 text-xs font-bold text-brand-cocoa"
                    />
                  </div>
                  <p className="text-[10px] text-stone-400">Total Rp {calculations.nasiBoxSaudiTotalIdr.toLocaleString("id-ID")}</p>
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

                <div className="space-y-1 sm:col-span-2">
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

            {/* 5. Rincian Paket Perlengkapan Jamaah (Editable per Item Pa & Pi) */}
            <div className="rounded-2xl border border-stone-200/70 bg-white p-5 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-stone-100 pb-3 gap-2">
                <h3 className="text-sm font-bold text-brand-cocoa flex items-center gap-2">
                  <Gift className="h-4 w-4 text-rose-500" strokeWidth={1.5} />
                  <span>5. Paket Perlengkapan Jamaah (Harga Per Item)</span>
                </h3>
                <div className="text-right">
                  <span className="text-xs font-black text-brand-pink block">
                    Rata-Rata {formatRupiah(calculations.equipmentTotalIdr)} / Pax
                  </span>
                  <span className="text-[10px] font-semibold text-stone-400">
                    Pa: {formatRupiah(calculations.menEquipTotal)} | Pi: {formatRupiah(calculations.womenEquipTotal)}
                  </span>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 text-xs">
                
                {/* PAKET LAKI-LAKI (10 ITEM EDITABLE) */}
                <div className="rounded-xl border border-sky-200/80 bg-sky-50/20 p-3.5 space-y-3">
                  <div className="flex items-center justify-between border-b border-sky-100 pb-2">
                    <span className="font-extrabold text-sky-950 flex items-center gap-1.5 text-xs">
                      <span>👨 Paket Laki-Laki (10 Item)</span>
                    </span>
                    <span className="rounded-md bg-sky-600 px-2 py-0.5 text-[10px] font-extrabold text-white">
                      Total {formatRupiah(calculations.menEquipTotal)}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <label className="text-[11px] font-semibold text-stone-700 truncate">1. Ihram Kualitas Premium</label>
                      <input
                        type="number"
                        value={equipMenIhram}
                        onChange={(e) => setEquipMenIhram(Number(e.target.value))}
                        className="w-28 h-7 rounded-lg border border-stone-200 bg-white px-2 text-xs font-bold text-stone-800 text-right"
                      />
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <label className="text-[11px] font-semibold text-stone-700 truncate">2. Kain Baju Halus 2,5m</label>
                      <input
                        type="number"
                        value={equipMenKainBaju}
                        onChange={(e) => setEquipMenKainBaju(Number(e.target.value))}
                        className="w-28 h-7 rounded-lg border border-stone-200 bg-white px-2 text-xs font-bold text-stone-800 text-right"
                      />
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <label className="text-[11px] font-semibold text-stone-700 truncate">3. Ransel Travel</label>
                      <input
                        type="number"
                        value={equipMenRansel}
                        onChange={(e) => setEquipMenRansel(Number(e.target.value))}
                        className="w-28 h-7 rounded-lg border border-stone-200 bg-white px-2 text-xs font-bold text-stone-800 text-right"
                      />
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <label className="text-[11px] font-semibold text-stone-700 truncate">4. Tas Serut</label>
                      <input
                        type="number"
                        value={equipMenTasSerut}
                        onChange={(e) => setEquipMenTasSerut(Number(e.target.value))}
                        className="w-28 h-7 rounded-lg border border-stone-200 bg-white px-2 text-xs font-bold text-stone-800 text-right"
                      />
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <label className="text-[11px] font-semibold text-stone-700 truncate">5. Sarung Koper 26 inc</label>
                      <input
                        type="number"
                        value={equipMenSarungKoper}
                        onChange={(e) => setEquipMenSarungKoper(Number(e.target.value))}
                        className="w-28 h-7 rounded-lg border border-stone-200 bg-white px-2 text-xs font-bold text-stone-800 text-right"
                      />
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <label className="text-[11px] font-semibold text-stone-700 truncate">6. Tag Bagasi (2 buah)</label>
                      <input
                        type="number"
                        value={equipMenTagBagasi}
                        onChange={(e) => setEquipMenTagBagasi(Number(e.target.value))}
                        className="w-28 h-7 rounded-lg border border-stone-200 bg-white px-2 text-xs font-bold text-stone-800 text-right"
                      />
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <label className="text-[11px] font-semibold text-stone-700 truncate">7. Buku Doa & Manasik</label>
                      <input
                        type="number"
                        value={equipMenBukuDoa}
                        onChange={(e) => setEquipMenBukuDoa(Number(e.target.value))}
                        className="w-28 h-7 rounded-lg border border-stone-200 bg-white px-2 text-xs font-bold text-stone-800 text-right"
                      />
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <label className="text-[11px] font-semibold text-stone-700 truncate">8. Sajadah Syal</label>
                      <input
                        type="number"
                        value={equipMenSajadahSyal}
                        onChange={(e) => setEquipMenSajadahSyal(Number(e.target.value))}
                        className="w-28 h-7 rounded-lg border border-stone-200 bg-white px-2 text-xs font-bold text-stone-800 text-right"
                      />
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <label className="text-[11px] font-semibold text-stone-700 truncate">9. Bantal Leher Ergonomis</label>
                      <input
                        type="number"
                        value={equipMenBantalLeher}
                        onChange={(e) => setEquipMenBantalLeher(Number(e.target.value))}
                        className="w-28 h-7 rounded-lg border border-stone-200 bg-white px-2 text-xs font-bold text-stone-800 text-right"
                      />
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <label className="text-[11px] font-semibold text-stone-700 truncate">10. Lanyard ID Card Tag</label>
                      <input
                        type="number"
                        value={equipMenLanyard}
                        onChange={(e) => setEquipMenLanyard(Number(e.target.value))}
                        className="w-28 h-7 rounded-lg border border-stone-200 bg-white px-2 text-xs font-bold text-stone-800 text-right"
                      />
                    </div>
                  </div>
                </div>

                {/* PAKET PEREMPUAN (11 ITEM EDITABLE) */}
                <div className="rounded-xl border border-rose-200/80 bg-rose-50/20 p-3.5 space-y-3">
                  <div className="flex items-center justify-between border-b border-rose-100 pb-2">
                    <span className="font-extrabold text-rose-950 flex items-center gap-1.5 text-xs">
                      <span>👩 Paket Perempuan (11 Item)</span>
                    </span>
                    <span className="rounded-md bg-rose-600 px-2 py-0.5 text-[10px] font-extrabold text-white">
                      Total {formatRupiah(calculations.womenEquipTotal)}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <label className="text-[11px] font-semibold text-stone-700 truncate">1. Kain Baju Halus 2,5m</label>
                      <input
                        type="number"
                        value={equipWomenKainBaju}
                        onChange={(e) => setEquipWomenKainBaju(Number(e.target.value))}
                        className="w-28 h-7 rounded-lg border border-stone-200 bg-white px-2 text-xs font-bold text-stone-800 text-right"
                      />
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <label className="text-[11px] font-semibold text-stone-700 truncate">2. Kerudung Syar'i Resmi</label>
                      <input
                        type="number"
                        value={equipWomenKerudung}
                        onChange={(e) => setEquipWomenKerudung(Number(e.target.value))}
                        className="w-28 h-7 rounded-lg border border-stone-200 bg-white px-2 text-xs font-bold text-stone-800 text-right"
                      />
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <label className="text-[11px] font-semibold text-stone-700 truncate">3. Ransel Kecil Travel</label>
                      <input
                        type="number"
                        value={equipWomenRansel}
                        onChange={(e) => setEquipWomenRansel(Number(e.target.value))}
                        className="w-28 h-7 rounded-lg border border-stone-200 bg-white px-2 text-xs font-bold text-stone-800 text-right"
                      />
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <label className="text-[11px] font-semibold text-stone-700 truncate">4. Tas Serut</label>
                      <input
                        type="number"
                        value={equipWomenTasSerut}
                        onChange={(e) => setEquipWomenTasSerut(Number(e.target.value))}
                        className="w-28 h-7 rounded-lg border border-stone-200 bg-white px-2 text-xs font-bold text-stone-800 text-right"
                      />
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <label className="text-[11px] font-semibold text-stone-700 truncate">5. Sarung Koper 26 inc</label>
                      <input
                        type="number"
                        value={equipWomenSarungKoper}
                        onChange={(e) => setEquipWomenSarungKoper(Number(e.target.value))}
                        className="w-28 h-7 rounded-lg border border-stone-200 bg-white px-2 text-xs font-bold text-stone-800 text-right"
                      />
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <label className="text-[11px] font-semibold text-stone-700 truncate">6. Tag Bagasi (2 buah)</label>
                      <input
                        type="number"
                        value={equipWomenTagBagasi}
                        onChange={(e) => setEquipWomenTagBagasi(Number(e.target.value))}
                        className="w-28 h-7 rounded-lg border border-stone-200 bg-white px-2 text-xs font-bold text-stone-800 text-right"
                      />
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <label className="text-[11px] font-semibold text-stone-700 truncate">7. Buku Doa & Manasik</label>
                      <input
                        type="number"
                        value={equipWomenBukuDoa}
                        onChange={(e) => setEquipWomenBukuDoa(Number(e.target.value))}
                        className="w-28 h-7 rounded-lg border border-stone-200 bg-white px-2 text-xs font-bold text-stone-800 text-right"
                      />
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <label className="text-[11px] font-semibold text-stone-700 truncate">8. Syal Sajadah</label>
                      <input
                        type="number"
                        value={equipWomenSyalSajadah}
                        onChange={(e) => setEquipWomenSyalSajadah(Number(e.target.value))}
                        className="w-28 h-7 rounded-lg border border-stone-200 bg-white px-2 text-xs font-bold text-stone-800 text-right"
                      />
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <label className="text-[11px] font-semibold text-stone-700 truncate">9. Mukena Travel Ringkas</label>
                      <input
                        type="number"
                        value={equipWomenMukenaTravel}
                        onChange={(e) => setEquipWomenMukenaTravel(Number(e.target.value))}
                        className="w-28 h-7 rounded-lg border border-stone-200 bg-white px-2 text-xs font-bold text-stone-800 text-right"
                      />
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <label className="text-[11px] font-semibold text-stone-700 truncate">10. Bantal Leher Ergonomis</label>
                      <input
                        type="number"
                        value={equipWomenBantalLeher}
                        onChange={(e) => setEquipWomenBantalLeher(Number(e.target.value))}
                        className="w-28 h-7 rounded-lg border border-stone-200 bg-white px-2 text-xs font-bold text-stone-800 text-right"
                      />
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <label className="text-[11px] font-semibold text-stone-700 truncate">11. Lanyard ID Card Tag</label>
                      <input
                        type="number"
                        value={equipWomenLanyard}
                        onChange={(e) => setEquipWomenLanyard(Number(e.target.value))}
                        className="w-28 h-7 rounded-lg border border-stone-200 bg-white px-2 text-xs font-bold text-stone-800 text-right"
                      />
                    </div>
                  </div>
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
                    <div className="flex items-center gap-1.5">
                      <span className="rounded-md bg-brand-pink px-2 py-0.5 text-[10px] font-bold text-white uppercase">
                        Kamar Quad (4 Pax)
                      </span>
                      <span className="rounded-md bg-rose-200/70 px-2 py-0.5 text-[10px] font-extrabold text-rose-900">
                        {calculations.quadPaxCount} Pax
                      </span>
                    </div>
                    <p className="text-[11px] font-semibold text-stone-500 mt-1">Standar Brosur Utama</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-black text-brand-pink">{formatRupiah(calculations.sellingPriceQuad)}</p>
                    <p className="text-[10px] text-stone-400">HPP {formatRupiah(calculations.hppQuadPerPax)}</p>
                  </div>
                </div>

                {/* TRIPLE */}
                <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-3.5 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="rounded-md bg-amber-700 px-2 py-0.5 text-[10px] font-bold text-white uppercase">
                        Kamar Triple (3 Pax)
                      </span>
                      <span className="rounded-md bg-amber-200/70 px-2 py-0.5 text-[10px] font-extrabold text-amber-950">
                        {calculations.triplePaxCount} Pax
                      </span>
                    </div>
                    <p className="text-[11px] font-semibold text-stone-500 mt-1">+ Rp 2.500.000 / pax</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-extrabold text-brand-cocoa">{formatRupiah(calculations.sellingPriceTriple)}</p>
                  </div>
                </div>

                {/* DOUBLE */}
                <div className="rounded-xl border border-purple-200 bg-purple-50/40 p-3.5 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="rounded-md bg-purple-900 px-2 py-0.5 text-[10px] font-bold text-white uppercase">
                        Kamar Double (2 Pax)
                      </span>
                      <span className="rounded-md bg-purple-200/70 px-2 py-0.5 text-[10px] font-extrabold text-purple-950">
                        {calculations.doublePaxCount} Pax
                      </span>
                    </div>
                    <p className="text-[11px] font-semibold text-stone-500 mt-1">+ Rp 4.500.000 / pax</p>
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
                    <Hotel className="h-3.5 w-3.5 text-brand-pink" /> Hotel Makkah (Fullboard 3x Makan)
                  </span>
                  <span className="font-bold text-brand-cocoa">{formatRupiah(calculations.makkahHotelPerPaxIdr)}</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-stone-100">
                  <span className="text-stone-600 flex items-center gap-1.5">
                    <Hotel className="h-3.5 w-3.5 text-emerald-600" /> Hotel Madinah (Fullboard 3x Makan)
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
                    <Truck className="h-3.5 w-3.5 text-amber-600" /> Handling Bandara Jakarta (CGK)
                  </span>
                  <span className="font-bold text-brand-cocoa">{formatRupiah(calculations.handlingJakartaIdr)}</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-stone-100">
                  <span className="text-stone-600 flex items-center gap-1.5">
                    <Truck className="h-3.5 w-3.5 text-emerald-600" /> Handling Bandara Saudi (JED & MED)
                  </span>
                  <span className="font-bold text-brand-cocoa">{formatRupiah(calculations.handlingSaudiIdr)}</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-stone-100">
                  <span className="text-stone-600 flex items-center gap-1.5">
                    <Hotel className="h-3.5 w-3.5 text-blue-600" /> Hotel Transit & Lounge CGK
                  </span>
                  <span className="font-bold text-brand-cocoa">{formatRupiah(calculations.totalTransitLounge)}</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-stone-100">
                  <span className="text-stone-600 flex items-center gap-1.5">
                    <Gift className="h-3.5 w-3.5 text-rose-500" /> Nasi Box Transit CGK & Saudi
                  </span>
                  <span className="font-bold text-brand-cocoa">{formatRupiah(calculations.totalNasiBoxTransitIdr)}</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-stone-100">
                  <span className="text-stone-600 flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-indigo-600" /> Shared Staff & Muthawwif
                  </span>
                  <span className="font-bold text-brand-cocoa">{formatRupiah(calculations.sharedStaffCostPerPax)}</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-stone-100">
                  <span className="text-stone-600 flex items-center gap-1.5">
                    <UserCheck className="h-3.5 w-3.5 text-emerald-600" /> Fee Marketing & Komisi Agen
                  </span>
                  <span className="font-bold text-brand-cocoa">{formatRupiah(calculations.totalFeeMarketing)}</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-stone-100">
                  <span className="text-stone-600 flex items-center gap-1.5">
                    <Gift className="h-3.5 w-3.5 text-brand-pink" /> Perlengkapan Jamaah (6 Item)
                  </span>
                  <span className="font-bold text-brand-cocoa">{formatRupiah(calculations.equipmentTotalIdr)}</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-stone-100">
                  <span className="text-stone-600 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-amber-500" /> Bonus Thaif & Emergency
                  </span>
                  <span className="font-bold text-brand-cocoa">{formatRupiah(calculations.totalBonusAndMisc)}</span>
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
