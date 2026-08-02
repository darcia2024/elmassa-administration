"use client";

import React, { useState } from "react";
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

export default function ItineraryLandingPreviewPage() {
  const [selectedTab, setSelectedTab] = useState<"oktober" | "november" | "desember">("oktober");

  const itineraryData = [
    {
      day: 1,
      date: "30 Sep 2026",
      title: "Pangkal Pinang – Jakarta",
      location: "Pangkal Pinang (PGK) → Jakarta (CGK)",
      highlight: "departure",
      activities: [
        { time: "09:00 WIB", description: "Jemaah berkumpul di Bandar Udara Internasional Depati Amir, Pangkal Pinang untuk persiapan keberangkatan" },
        { time: "12:25 WIB", description: "Take-off menuju Jakarta (Garuda Indonesia GA137)" },
        { time: "13:54 WIB", description: "Tiba di Bandara Jakarta. Jemaah disediakan lounge bandara untuk beristirahat sambil menunggu penerbangan ke Jeddah" },
        { time: "19:30 WIB", description: "Jemaah berkumpul di keberangkatan internasional Terminal 3 Soekarno-Hatta untuk persiapan proses check-in" },
      ],
    },
    {
      day: 2,
      date: "01 Okt 2026",
      title: "Jakarta – Jeddah – Madinah",
      location: "Jakarta → Jeddah → Madinah",
      highlight: "departure",
      activities: [
        { time: "00:40 WIB", description: "Take-off menuju Jeddah (Saudia Airline SV827)" },
        { time: "06:40 LT", description: "Landing di Bandara Internasional King Abdul Aziz, Jeddah" },
        { time: "09:00 LT", description: "Perjalanan menggunakan bus AC luxury menuju kota Madinah" },
        { time: "14:00 LT", description: "Check-in hotel Madinah (Daar El Naeem) & beristirahat" },
      ],
    },
    {
      day: 3,
      date: "02 Okt 2026",
      title: "Madinah – Rawdhah & Ziarah Dalam",
      location: "Madinah Al-Munawwarah",
      highlight: "worship",
      activities: [
        { time: "Subuh - 11:00", description: "Rawdhah jemaah perempuan (Sesuai jadwal Tasreh KSA)" },
        { time: "11:00 - Isya", description: "Rawdhah jemaah laki-laki & Ziarah Makam Rasulullah SAW & Sahabat" },
        { time: "19:30 LT", description: "Ziarah sekitar Masjid Nabawi: Bani Tsaqifah, Masjid Ali, Pemakaman Baqi" },
      ],
    },
    {
      day: 4,
      date: "03 Okt 2026",
      title: "Tour Sejarah Madinah (Masjid Quba & Uhud)",
      location: "Madinah & Sekitarnya",
      highlight: "ziarah",
      activities: [
        { time: "08:00 - 12:00", description: "Ziarah luar: Masjid Quba, Jabal Uhud (Makam Syuhada), Kebun Kurma Madinah" },
        { time: "12:00 - 15:00", description: "Shalat Dhuhur & makan siang di hotel" },
        { time: "16:00 - 21:00", description: "Acara bebas memperbanyak ibadah di Masjid Nabawi" },
      ],
    },
    {
      day: 5,
      date: "04 Okt 2026",
      title: "City Tour Madinah 2 & Manasik",
      location: "Madinah Al-Munawwarah",
      highlight: "ziarah",
      activities: [
        { time: "08:00 - 11:30", description: "Kunjungan ke Percetakan Al-Qur'an Malik Fahd & Jabal Magnet" },
        { time: "16:00 - 18:00", description: "Pemantapan manasik umrah & tata cara ihram" },
      ],
    },
    {
      day: 6,
      date: "05 Okt 2026",
      title: "Madinah – Miqat Bir Ali – Makkah (Umrah 1)",
      location: "Madinah → Bir Ali → Makkah",
      highlight: "umrah",
      activities: [
        { time: "09:00 LT", description: "Persiapan check-out hotel Madinah & mengenakan kain ihram" },
        { time: "13:00 LT", description: "Singgah Masjid Bir Ali (Dzulhulaifah) untuk Miqat & Niat Umrah" },
        { time: "20:00 LT", description: "Tiba di Hotel Makkah (Grand Al Massa), check-in & makan malam" },
        { time: "22:00 LT", description: "Melaksanakan Rukun Umrah Wajib (Tawaf, Sa'i, Tahallul) di Masjidil Haram" },
      ],
    },
    {
      day: 7,
      date: "06 Okt 2026",
      title: "Ibadah di Masjidil Haram & Tawaf Sunnah",
      location: "Makkah Al-Mukarramah",
      highlight: "worship",
      activities: [
        { time: "Seharian", description: "Memperbanyak ibadah mandiri di Masjidil Haram, iktikaf & Tawaf Sunnah" },
      ],
    },
    {
      day: 8,
      date: "07 Okt 2026",
      title: "Ziarah Sejarah Makkah & Umrah 2 (Ji'ranah)",
      location: "Makkah & Sekitarnya",
      highlight: "ziarah",
      activities: [
        { time: "08:00 - 12:00", description: "Ziarah Jabal Tsur, Padang Arafah, Jabal Rahmah, Mina, Muzdalifah" },
        { time: "12:00 LT", description: "Miqat di Masjid Ji'ranah bagi jemaah yang ingin Umrah ke-2" },
      ],
    },
    {
      day: 9,
      date: "08 Okt 2026",
      title: "City Tour Kota Thaif (Bonus Special!)",
      location: "Makkah → Thaif → Makkah",
      highlight: "travel",
      activities: [
        { time: "08:00 LT", description: "Perjalanan ke Kota Sejuk Thaif: Masjid Ibn Abbas, Kebun Mawar & Pabrik Parfum" },
        { time: "17:00 LT", description: "Kembali ke Makkah & Miqat Qarnul Manazil (Umrah 3 Opsional)" },
      ],
    },
    {
      day: 10,
      date: "09 Okt 2026",
      title: "Agenda Bebas Makkah & Shopping Zamzam",
      location: "Makkah Al-Mukarramah",
      highlight: "worship",
      activities: [
        { time: "Seharian", description: "Agenda bebas & belanja oleh-oleh di Zamzam Tower & Pasar Kakiyah" },
      ],
    },
    {
      day: 11,
      date: "10 Okt 2026",
      title: "Tawaf Wada' & City Tour Jeddah",
      location: "Makkah → Jeddah",
      highlight: "departure",
      activities: [
        { time: "05:00 LT", description: "Melaksanakan Tawaf Wada' (Tawaf Perpisahan) di Masjidil Haram" },
        { time: "11:00 LT", description: "City tour Jeddah: Laut Merah, Masjid Terapung & Shopping Al-Balad" },
        { time: "17:30 LT", description: "Tiba di Bandara Jeddah (JED) untuk persiapan flight kepulangan" },
      ],
    },
    {
      day: 12,
      date: "11 Okt 2026",
      title: "Landing Jakarta – Pangkal Pinang (PGK)",
      location: "Jeddah → CGK → PGK",
      highlight: "departure",
      activities: [
        { time: "07:35 WIB", description: "Landing di Bandara Soekarno-Hatta Jakarta (CGK)" },
        { time: "12:25 WIB", description: "Take-off penerbangan feeder menuju Bandara Depati Amir Pangkal Pinang (PGK)" },
        { time: "13:54 WIB", description: "Tiba di Pangkal Pinang (PGK). Seluruh rangkaian ibadah umrah selesai" },
      ],
    },
  ];

  return (
    <AppShell title="Preview Landing Page Itinerary Interaktif (elmassa.itinerary)">
      <div className="space-y-8 font-sans max-w-5xl mx-auto pb-12">
        
        {/* HERO BANNER SECTION */}
        <div className="relative overflow-hidden rounded-3xl bg-stone-900 text-white p-6 sm:p-10 shadow-2xl border border-stone-800">
          <div className="absolute inset-0 bg-gradient-to-r from-pink-900/60 via-stone-900/90 to-amber-900/40 z-0 pointer-events-none" />
          <div className="relative z-10 space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-pink-500/20 border border-pink-400/30 px-3.5 py-1 text-xs font-bold text-pink-300 backdrop-blur-xs">
              <Sparkles className="h-3.5 w-3.5 text-pink-400 animate-pulse" />
              <span>Preview Live App Itinerary Interaktif (elmassa.itinerary)</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-white leading-tight">
              Rencana Perjalanan Ibadah Umrah <span className="text-pink-400">El Massa Tour & Travel</span>
            </h1>

            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              Tampilan landing page brosur itinerary interaktif hari demi hari, khusus keberangkatan <strong>Pangkal Pinang (PGK)</strong> menuju Makkah, Madinah, & Kota Thaif.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => openWA("Halo El Massa, saya mau tanya paket & itinerary Umrah ini")}
                className="h-10 px-5 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 font-extrabold text-xs text-white shadow-lg hover:from-pink-700 hover:to-rose-700 transition flex items-center gap-2"
              >
                <span>Konsultasi Itinerary via WA</span>
                <ArrowRight className="h-4 w-4" />
              </button>
              <Link
                href="/paket/kalkulator"
                className="h-10 px-4 rounded-xl border border-stone-700 bg-stone-800/80 text-xs font-bold text-stone-200 hover:bg-stone-800 transition flex items-center gap-1.5"
              >
                <span>Edit Itinerary di Web Admin</span>
              </Link>
            </div>
          </div>
        </div>

        {/* MONTH TAB SELECTOR */}
        <div className="flex items-center justify-between gap-3 border-b border-stone-200 pb-4">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {(["oktober", "november", "desember"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setSelectedTab(tab)}
                className={`h-9 px-4 rounded-xl text-xs font-bold capitalize transition whitespace-nowrap ${
                  selectedTab === tab
                    ? "bg-stone-900 text-white shadow-md"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                }`}
              >
                Paket {tab} 2026
              </button>
            ))}
          </div>

          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl shrink-0">
            ✓ 12 Hari Program (PGK - Saudi)
          </span>
        </div>

        {/* ITINERARY TIMELINE GRID */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-stone-900 flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-pink-600" />
              <span>Rincian Kegiatan Hari demi Hari ({selectedTab.toUpperCase()} 2026)</span>
            </h3>
            <span className="text-xs text-stone-500 font-medium">Bangka Belitung Feeder (PGK ⇄ CGK)</span>
          </div>

          <div className="grid gap-4">
            {itineraryData.map((item, idx) => (
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
                      <p className="text-xs font-semibold text-pink-600 flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        <span>{item.location}</span>
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-bold text-stone-700 bg-stone-100 px-3 py-1 rounded-xl shrink-0 self-start sm:self-auto border border-stone-200">
                    {item.date}
                  </span>
                </div>

                <div className="space-y-2 pl-2 sm:pl-12">
                  {item.activities.map((act, aIdx) => (
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
            ))}
          </div>
        </div>

        {/* BOTTOM CTA BANNER */}
        <div className="rounded-2xl border border-pink-200 bg-gradient-to-r from-pink-50 via-rose-50 to-amber-50 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-extrabold text-stone-900">Tertarik dengan Itinerary Perjalanan Ini?</h4>
            <p className="text-xs text-stone-600 mt-1">Daftarkan diri Anda atau konsultasikan jadwal keberangkatan bersama Staf El Massa Travel.</p>
          </div>
          <button
            type="button"
            onClick={() => openWA("Halo El Massa, saya mau booking paket umrah sesuai itinerary ini")}
            className="h-10 px-5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-extrabold text-xs shadow-md transition shrink-0"
          >
            Hubungi Staf via WhatsApp
          </button>
        </div>

      </div>
    </AppShell>
  );
}
