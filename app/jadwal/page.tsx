"use client";

import { useState } from "react";
import { CalendarDays, LayoutList, PlaneTakeoff, Plus, Users } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { AgendaCalendar } from "./agenda-calendar";
import { ScheduleCrud } from "./schedule-crud";

const schedules = [
  {
    id: "dep-umr-20261001",
    packageName: "Umrah Spesial Oktober (Dapat 2x Jum'at)",
    type: "Umrah (Saudia / Garuda)",
    departureDate: "01 Okt 2026",
    returnDate: "12 Okt 2026",
    quota: 45,
    bookedSeats: 45,
    priceDisplay: "Rp 33.500.000",
    meetingPoint: "Bandara Depati Amir Pangkalpinang (PGK) - CGK - Saudia SV-817",
    status: "Terjadwal (FULL)",
  },
  {
    id: "dep-umr-20261108",
    packageName: "Umrah Berkah Spesial November",
    type: "Umrah (Garuda Direct MED)",
    departureDate: "08 Nov 2026",
    returnDate: "18 Nov 2026",
    quota: 45,
    bookedSeats: 45,
    priceDisplay: "Rp 35.500.000",
    meetingPoint: "Bandara Depati Amir Pangkalpinang (PGK) - Garuda Direct Madinah",
    status: "Terjadwal (FULL)",
  },
];

export default function DeparturesPage() {
  const [activeTab, setActiveTab] = useState<"calendar" | "table">("calendar");

  const totalQuota = schedules.reduce((total, item) => total + item.quota, 0);
  const totalBooked = schedules.reduce((total, item) => total + item.bookedSeats, 0);

  return (
    <AppShell eyebrow="Jadwal & Agenda El Massa" title="Kalender Keberangkatan & Operasional">
      <div className="space-y-5">
        
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
    </AppShell>
  );
}
