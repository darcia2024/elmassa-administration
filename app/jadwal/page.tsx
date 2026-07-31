"use client";

import { useState } from "react";
import { CalendarDays, LayoutList, PlaneTakeoff, Plus, Users } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { AgendaCalendar } from "./agenda-calendar";
import { ScheduleCrud } from "./schedule-crud";

const schedules: Array<{
  id: string;
  packageName: string;
  type: string;
  departureDate: string;
  returnDate: string;
  quota: number;
  bookedSeats: number;
  priceDisplay: string;
  meetingPoint: string;
  status: string;
}> = [];

export default function DeparturesPage() {
  const [activeTab, setActiveTab] = useState<"calendar" | "table">("calendar");
  const [selectedDay, setSelectedDay] = useState(29);

  const totalQuota = schedules.reduce((total, item) => total + item.quota, 0);
  const totalBooked = schedules.reduce((total, item) => total + item.bookedSeats, 0);

  const weekDays = [
    { dayName: "Mon", dateNum: 27 },
    { dayName: "Tue", dateNum: 28 },
    { dayName: "Wed", dateNum: 29 },
    { dayName: "Thu", dateNum: 30 },
    { dayName: "Fri", dateNum: 31 },
    { dayName: "Sat", dateNum: 1 },
    { dayName: "Sun", dateNum: 2 },
  ];

  return (
    <AppShell eyebrow="Jadwal & Agenda El Massa" title="Kalender Keberangkatan & Operasional">
      <div className="space-y-5 font-sans">
        
        {/* ========================================================================= */}
        {/* 📱 1. NATIVE MOBILE APP SCHEDULE VIEW (DAILY ROUTINE & TIMELINE REFERENSI BRO) */}
        {/* ========================================================================= */}
        <div className="block md:hidden space-y-4">
          
          {/* Header Greeting & Avatar */}
          <div className="flex items-center justify-between px-1">
            <div>
              <h2 className="text-xl font-extrabold tracking-tight text-stone-900">Jadwal Flight, Azriandri</h2>
              <p className="text-xs font-medium text-stone-500">Rabu, 29 Juli 2026</p>
            </div>
            <div className="grid h-10 w-10 place-items-center rounded-full bg-rose-100 border border-brand-pink/30 font-black text-brand-pink text-sm">
              AZ
            </div>
          </div>

          {/* Horizontal Day Selector Pills Strip (Persis Referensi) */}
          <div className="flex items-center justify-between gap-1 bg-white p-2 rounded-2xl border border-stone-200/80 shadow-2xs overflow-x-auto no-scrollbar">
            {weekDays.map((item) => {
              const isSelected = selectedDay === item.dateNum;
              return (
                <button
                  key={item.dateNum}
                  type="button"
                  onClick={() => setSelectedDay(item.dateNum)}
                  className={`flex flex-col items-center justify-center py-2 px-3 rounded-2xl min-w-[42px] transition active:scale-95 ${
                    isSelected
                      ? "bg-stone-900 text-white font-bold shadow-md"
                      : "text-stone-600 hover:bg-stone-50 font-medium"
                  }`}
                >
                  <span className="text-[10px] opacity-80">{item.dayName}</span>
                  <span className="text-sm font-black mt-0.5">{item.dateNum}</span>
                </button>
              );
            })}
          </div>

          {/* Soft Peach Banner Card - Set Reminder (Persis Referensi) */}
          <div className="rounded-2xl border border-amber-200/80 bg-amber-50/70 p-4 shadow-2xs flex items-center justify-between gap-3">
            <div className="space-y-1.5 min-w-0">
              <h4 className="font-extrabold text-sm text-amber-950">Pengingat Keberangkatan Flight</h4>
              <p className="text-[11px] text-amber-900 leading-snug">
                Manasik & flight H-60 Siap Transit di Bandara PGK → CGK.
              </p>
              <button
                type="button"
                className="mt-1 inline-flex items-center rounded-xl bg-amber-900 px-3.5 py-1.5 text-xs font-bold text-white shadow-2xs active:scale-95 transition"
              >
                Cetak Flight List
              </button>
            </div>
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-amber-200/80 text-amber-900 font-bold text-xl">
              🔔
            </div>
          </div>

          {/* Agenda Keberangkatan Section Header */}
          <div className="flex items-center justify-between px-1 pt-2">
            <h3 className="text-sm font-extrabold text-stone-900">Agenda & Flight Keberangkatan</h3>
            <span className="text-xs font-bold text-brand-pink hover:underline cursor-pointer">Lihat Semua</span>
          </div>

          {/* Vertical Timeline Schedule Cards List (Persis Referensi Line Dots) */}
          <div className="relative pl-6 space-y-4 border-l-2 border-dashed border-stone-200 ml-2.5">
            
            {/* Agenda Item 1 */}
            <div className="relative">
              <span className="absolute -left-[31px] top-4 grid h-5 w-5 place-items-center rounded-full bg-brand-pink text-white text-[10px] ring-4 ring-[#fafafa]">
                ✓
              </span>
              <div className="rounded-2xl border border-stone-200/80 bg-white p-3.5 shadow-2xs flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-rose-50 text-brand-pink border border-rose-100 text-lg">
                    ✈️
                  </span>
                  <div className="min-w-0">
                    <h4 className="font-extrabold text-xs text-stone-900 truncate">Flight GA-980 (Pangkalpinang → CGK)</h4>
                    <p className="text-[10px] text-stone-500 truncate">45 Pax Terisi • GA-980 Depati Amir</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] font-extrabold text-stone-400 block">08:30 WIB</span>
                  <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                    Selesai
                  </span>
                </div>
              </div>
            </div>

            {/* Agenda Item 2 */}
            <div className="relative">
              <span className="absolute -left-[31px] top-4 grid h-5 w-5 place-items-center rounded-full bg-brand-pink text-white text-[10px] ring-4 ring-[#fafafa]">
                ✓
              </span>
              <div className="rounded-2xl border border-stone-200/80 bg-white p-3.5 shadow-2xs flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 text-lg">
                    🚌
                  </span>
                  <div className="min-w-0">
                    <h4 className="font-extrabold text-xs text-stone-900 truncate">Handling Bandara CGK Terminal 3</h4>
                    <p className="text-[10px] text-stone-500 truncate">Rest Area & Pembagian Paspor/Visa</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] font-extrabold text-stone-400 block">14:00 WIB</span>
                  <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                    On Track
                  </span>
                </div>
              </div>
            </div>

            {/* Agenda Item 3 */}
            <div className="relative">
              <span className="absolute -left-[31px] top-4 grid h-5 w-5 place-items-center rounded-full bg-stone-300 text-white text-[10px] ring-4 ring-[#fafafa]">
                ○
              </span>
              <div className="rounded-2xl border border-stone-200/80 bg-white p-3.5 shadow-2xs flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-sky-50 text-sky-700 border border-sky-100 text-lg">
                    🕌
                  </span>
                  <div className="min-w-0">
                    <h4 className="font-extrabold text-xs text-stone-900 truncate">Take Off Direct SV-817 Jeddah/MED</h4>
                    <p className="text-[10px] text-stone-500 truncate">Hotel Grand Al Massa Makkah</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] font-extrabold text-stone-400 block">22:15 WIB</span>
                  <span className="text-[9px] font-bold text-stone-600 bg-stone-100 px-1.5 py-0.5 rounded border border-stone-200">
                    Mendatang
                  </span>
                </div>
              </div>
            </div>

            {/* Agenda Item 4 */}
            <div className="relative">
              <span className="absolute -left-[31px] top-4 grid h-5 w-5 place-items-center rounded-full bg-stone-300 text-white text-[10px] ring-4 ring-[#fafafa]">
                ○
              </span>
              <div className="rounded-2xl border border-stone-200/80 bg-white p-3.5 shadow-2xs flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-purple-50 text-purple-700 border border-purple-100 text-lg">
                    📅
                  </span>
                  <div className="min-w-0">
                    <h4 className="font-extrabold text-xs text-stone-900 truncate">Rombongan Umrah November (Garuda Direct)</h4>
                    <p className="text-[10px] text-stone-500 truncate">45 Pax • Rp 35.500.000</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] font-extrabold text-stone-400 block">08 Nov</span>
                  <span className="text-[9px] font-bold text-brand-pink bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                    FULL
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Mobile Floating Action Button (+) */}
          <div className="fixed bottom-20 right-4 z-40">
            <button
              type="button"
              onClick={() => setActiveTab("table")}
              className="grid h-12 w-12 place-items-center rounded-full bg-stone-900 text-white shadow-xl active:scale-90 transition"
              title="Tambah Schedule Baru"
            >
              <Plus className="h-6 w-6" strokeWidth={2} />
            </button>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* 🖥️ 2. DESKTOP MODE SCHEDULE VIEW (100% UNTOUCHED ORIGINAL) */}
        {/* ========================================================================= */}
        <div className="hidden md:block space-y-5">
          
          {/* KPI Metric Cards */}
          <section className="grid gap-4 md:grid-cols-3">
            <article className="rounded-2xl border border-stone-200/70 bg-white p-5 shadow-2xs">
              <p className="text-xs font-semibold text-stone-500">Total Keberangkatan Aktif</p>
              <p className="mt-1 text-2xl font-bold text-brand-cocoa">{schedules.length} Penerbangan</p>
              <p className="mt-1 text-[11px] text-stone-400">Umrah Oktober & November 2026</p>
            </article>

            <article className="rounded-2xl border border-stone-200/70 bg-white p-5 shadow-2xs">
              <p className="text-xs font-semibold text-stone-500">Total Jamaah Terdaftar</p>
              <p className="mt-1 text-2xl font-bold text-emerald-700">{totalBooked} Pax</p>
              <p className="mt-1 text-[11px] text-stone-400">Dari {totalQuota} total kuota rombongan</p>
            </article>

            <article className="rounded-2xl border border-stone-200/70 bg-white p-5 shadow-2xs">
              <p className="text-xs font-semibold text-stone-500">Agenda Terdekat</p>
              <p className="mt-1 text-xl font-bold text-brand-pink truncate">26 Sep: Manasik PGK</p>
              <p className="mt-1 text-[11px] text-stone-400">Komplek Ruko Best Cinema</p>
            </article>
          </section>

          {/* View Mode Toggle Header Bar */}
          <section className="rounded-2xl border border-stone-200/70 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
            
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-stone-100 pb-4">
              <div>
                <h3 className="text-base font-extrabold text-brand-cocoa flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-brand-pink" />
                  <span>Agenda & Kalender Operasional El Massa</span>
                </h3>
                <p className="text-xs text-stone-500">
                  Jadwal penerbangan keberangkatan/kepulangan jamaah, manasik, & pengingat pelunasan H-14.
                </p>
              </div>

              {/* Tab Buttons */}
              <div className="flex items-center gap-1.5 rounded-xl border border-stone-200 bg-stone-50 p-1 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setActiveTab("calendar")}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    activeTab === "calendar"
                      ? "bg-white text-brand-cocoa shadow-2xs"
                      : "text-stone-500 hover:text-stone-900"
                  }`}
                >
                  <CalendarDays className="h-3.5 w-3.5" />
                  <span>Tampilan Kalender Agenda</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("table")}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    activeTab === "table"
                      ? "bg-white text-brand-cocoa shadow-2xs"
                      : "text-stone-500 hover:text-stone-900"
                  }`}
                >
                  <LayoutList className="h-3.5 w-3.5" />
                  <span>Tabel Ringkasan Flight</span>
                </button>
              </div>
            </div>

            {/* VIEW TAB 1: CALENDAR VIEW */}
            {activeTab === "calendar" ? (
              <AgendaCalendar />
            ) : (
              /* VIEW TAB 2: TABLE VIEW */
              <div className="space-y-4">
                <div className="overflow-x-auto rounded-xl border border-stone-200/60">
                  <table className="w-full min-w-[800px] border-collapse text-left text-xs">
                    <thead>
                      <tr className="border-b border-stone-200/60 bg-stone-50/70 font-semibold text-stone-500 text-[11px] uppercase tracking-wider">
                        <th className="py-2.5 pl-3 pr-2">Paket</th>
                        <th className="py-2.5 pr-2">Tgl Berangkat</th>
                        <th className="py-2.5 pr-2">Tgl Pulang</th>
                        <th className="py-2.5 pr-2">Kuota Terisi</th>
                        <th className="py-2.5 pr-2">Harga Paket</th>
                        <th className="py-2.5 pr-2">Meeting Point</th>
                        <th className="py-2.5 pr-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 font-normal">
                      {schedules.map((item) => (
                        <tr key={item.id} className="transition hover:bg-stone-50/60">
                          <td className="py-3 pl-3 pr-2">
                            <p className="font-semibold text-brand-cocoa">{item.packageName}</p>
                            <p className="text-[10px] text-stone-400">{item.type}</p>
                          </td>
                          <td className="py-3 pr-2 font-medium text-stone-700">{item.departureDate}</td>
                          <td className="py-3 pr-2 text-stone-500">{item.returnDate}</td>
                          <td className="py-3 pr-2 font-semibold text-brand-cocoa">
                            <span className="text-brand-pink">{item.bookedSeats}</span> / {item.quota} Pax
                          </td>
                          <td className="py-3 pr-2 font-semibold text-stone-800">{item.priceDisplay}</td>
                          <td className="py-3 pr-2 text-stone-500 max-w-[200px] truncate">{item.meetingPoint}</td>
                          <td className="py-3 pr-3 text-right">
                            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200/60 bg-emerald-50/80 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </section>

          {/* Schedule CRUD Draft Interactive Tool */}
          <ScheduleCrud />

        </div>

      </div>
    </AppShell>
  );
}
