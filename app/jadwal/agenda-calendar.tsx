"use client";

import { useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  Filter,
  Info,
  MapPin,
  Plane,
  Plus,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";

export type CalendarEvent = {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  category: "Keberangkatan" | "Kepulangan" | "Manasik" | "Pelunasan";
  packageName?: string;
  airline?: string;
  meetingPoint?: string;
  time?: string;
  quotaInfo?: string;
  notes?: string;
  link?: string;
};

const defaultEvents: CalendarEvent[] = [];

const categoryBadgeStyles = {
  Keberangkatan: "bg-emerald-50 text-emerald-800 border-emerald-200/80 hover:bg-emerald-100",
  Kepulangan: "bg-blue-50 text-blue-800 border-blue-200/80 hover:bg-blue-100",
  Manasik: "bg-purple-50 text-purple-800 border-purple-200/80 hover:bg-purple-100",
  Pelunasan: "bg-rose-50 text-brand-pink border-rose-200/80 hover:bg-rose-100",
};

const monthNames = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

export function AgendaCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 9, 1)); // Default Oktober 2026
  const [selectedCategory, setSelectedCategory] = useState<string>("Semua");
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const events = defaultEvents;

  // Filtered Events
  const filteredEvents = useMemo(() => {
    if (selectedCategory === "Semua") return events;
    return events.filter((e) => e.category === selectedCategory);
  }, [events, selectedCategory]);

  // Calendar Grid Days Calculation
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days = [];

    // Previous month padding days
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      days.push({
        day: daysInPrevMonth - i,
        isCurrentMonth: false,
        dateString: "",
      });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const monthStr = String(month + 1).padStart(2, "0");
      const dayStr = String(day).padStart(2, "0");
      const dateString = `${year}-${monthStr}-${dayStr}`;

      days.push({
        day,
        isCurrentMonth: true,
        dateString,
      });
    }

    // Next month padding days to complete 35 or 42 grid cells
    const totalCells = days.length > 35 ? 42 : 35;
    const nextDaysNeeded = totalCells - days.length;
    for (let day = 1; day <= nextDaysNeeded; day++) {
      days.push({
        day,
        isCurrentMonth: false,
        dateString: "",
      });
    }

    return days;
  }, [year, month]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  return (
    <div className="space-y-4 font-sans">
      
      {/* Top Controls: Month Selector & Category Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-stone-200/70 pb-4">
        
        {/* Month & Year Navigation */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 rounded-xl border border-stone-200 bg-white p-1 shadow-2xs">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="grid h-8 w-8 place-items-center rounded-lg text-stone-600 hover:bg-stone-100 transition"
              title="Bulan Sebelumnya"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-3 text-sm font-extrabold text-brand-cocoa min-w-[140px] text-center">
              {monthNames[month]} {year}
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              className="grid h-8 w-8 place-items-center rounded-lg text-stone-600 hover:bg-stone-100 transition"
              title="Bulan Berikutnya"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setCurrentDate(new Date(2026, 9, 1))}
            className="h-9 rounded-xl border border-stone-200 bg-white px-3 text-xs font-semibold text-stone-600 hover:bg-stone-50 shadow-2xs"
          >
            Hari Ini (Okt 2026)
          </button>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-medium">
          {["Semua", "Keberangkatan", "Kepulangan", "Manasik", "Pelunasan"].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-xl px-3 py-1.5 transition text-xs ${
                selectedCategory === cat
                  ? "bg-stone-900 text-white font-bold shadow-2xs"
                  : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"
              }`}
            >
              {cat === "Keberangkatan" && "🛫 "}
              {cat === "Kepulangan" && "🛬 "}
              {cat === "Manasik" && "📋 "}
              {cat === "Pelunasan" && "💳 "}
              {cat}
            </button>
          ))}
        </div>

      </div>

      {/* Calendar Grid Container */}
      <div className="overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-2xs">
        
        {/* Day Name Header Row */}
        <div className="grid grid-cols-7 border-b border-stone-200/80 bg-stone-50/70 text-center text-xs font-extrabold text-stone-600 uppercase tracking-wider py-2.5">
          <div className="text-rose-600">Minggu</div>
          <div>Senin</div>
          <div>Selasa</div>
          <div>Rabu</div>
          <div>Kamis</div>
          <div>Jumat</div>
          <div>Sabtu</div>
        </div>

        {/* Calendar Day Cells Grid */}
        <div className="grid grid-cols-7 divide-x divide-y divide-stone-100 bg-stone-50/30">
          {calendarDays.map((cell, idx) => {
            const dayEvents = filteredEvents.filter((e) => e.date === cell.dateString);
            const isToday = cell.dateString === "2026-10-01"; // Simulated active date

            return (
              <div
                key={idx}
                className={`min-h-[110px] p-1.5 transition ${
                  cell.isCurrentMonth ? "bg-white" : "bg-stone-50/40 opacity-40"
                }`}
              >
                {/* Date Number Header */}
                <div className="flex items-center justify-between pb-1">
                  <span
                    className={`inline-grid h-6 w-6 place-items-center rounded-full text-xs font-bold ${
                      isToday
                        ? "bg-brand-pink text-white shadow-xs"
                        : cell.isCurrentMonth
                        ? "text-stone-800"
                        : "text-stone-400"
                    }`}
                  >
                    {cell.day}
                  </span>
                  {dayEvents.length > 0 && (
                    <span className="text-[9px] font-extrabold text-brand-pink bg-rose-50 px-1.5 py-0.2 rounded-full border border-rose-200/60">
                      {dayEvents.length} Event
                    </span>
                  )}
                </div>

                {/* Event Chips inside Date Box */}
                <div className="space-y-1">
                  {dayEvents.map((evt) => (
                    <button
                      key={evt.id}
                      type="button"
                      onClick={() => setSelectedEvent(evt)}
                      className={`w-full text-left rounded-lg border p-1.5 text-[10px] transition font-medium leading-tight shadow-2xs block truncate ${
                        categoryBadgeStyles[evt.category]
                      }`}
                    >
                      <span className="font-extrabold block truncate">
                        {evt.category === "Keberangkatan" && "🛫 "}
                        {evt.category === "Kepulangan" && "🛬 "}
                        {evt.category === "Manasik" && "📋 "}
                        {evt.category === "Pelunasan" && "💳 "}
                        {evt.title}
                      </span>
                      {evt.time && <span className="text-[9px] opacity-80 block truncate">{evt.time}</span>}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Agenda Summary Footer Cards */}
      <div className="grid gap-3 sm:grid-cols-3 pt-2">
        <div className="rounded-xl border border-emerald-200/70 bg-emerald-50/50 p-3.5 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-900">
            <Plane className="h-4 w-4 text-emerald-600" />
            <span>2 Jadwal Penerbangan Aktif</span>
          </div>
          <p className="text-[11px] text-emerald-800 leading-relaxed">
            Umrah Oktober (01-12 Okt) & Umrah November (08-18 Nov) terdaftar penerbangan Garuda & Saudia.
          </p>
        </div>

        <div className="rounded-xl border border-purple-200/70 bg-purple-50/50 p-3.5 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-xs text-purple-900">
            <Users className="h-4 w-4 text-purple-600" />
            <span>Manasik & Pembekalan</span>
          </div>
          <p className="text-[11px] text-purple-800 leading-relaxed">
            Dilaksanakan di Ruko Best Cinema Pangkalpinang H-5 sebelum keberangkatan rombongan.
          </p>
        </div>

        <div className="rounded-xl border border-rose-200/70 bg-rose-50/50 p-3.5 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-xs text-rose-900">
            <Clock className="h-4 w-4 text-brand-pink" />
            <span>Tepat Waktu Pelunasan H-14</span>
          </div>
          <p className="text-[11px] text-rose-800 leading-relaxed">
            Sistem pengingat otomatis untuk kasir keuangan dan jamaah sebelum pencetakan e-visa.
          </p>
        </div>
      </div>

      {/* 🔍 EVENT DETAIL MODAL POPUP */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-md rounded-2xl border border-stone-200 bg-white p-6 shadow-2xl space-y-4 text-stone-800 animate-in fade-in zoom-in-95 duration-200">
            
            <div className="flex items-start justify-between gap-3 border-b border-stone-100 pb-3">
              <div>
                <span className={`inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${categoryBadgeStyles[selectedEvent.category]}`}>
                  {selectedEvent.category}
                </span>
                <h3 className="mt-1.5 text-base font-extrabold text-brand-cocoa leading-tight">
                  {selectedEvent.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEvent(null)}
                className="grid h-8 w-8 place-items-center rounded-xl border border-stone-200 bg-stone-50 text-stone-500 hover:bg-stone-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-2.5 text-stone-700">
                <CalendarDays className="h-4 w-4 text-brand-pink shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-stone-900">Tanggal & Waktu:</p>
                  <p>{selectedEvent.date} {selectedEvent.time ? `• ${selectedEvent.time}` : ""}</p>
                </div>
              </div>

              {selectedEvent.packageName && (
                <div className="flex items-start gap-2.5 text-stone-700">
                  <Plane className="h-4 w-4 text-brand-cocoa shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-stone-900">Paket Related:</p>
                    <p>{selectedEvent.packageName}</p>
                  </div>
                </div>
              )}

              {selectedEvent.airline && (
                <div className="flex items-start gap-2.5 text-stone-700">
                  <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-stone-900">Maskapai / Flight:</p>
                    <p>{selectedEvent.airline}</p>
                  </div>
                </div>
              )}

              {selectedEvent.meetingPoint && (
                <div className="flex items-start gap-2.5 text-stone-700">
                  <MapPin className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-stone-900">Meeting Point / Lokasi:</p>
                    <p>{selectedEvent.meetingPoint}</p>
                  </div>
                </div>
              )}

              {selectedEvent.notes && (
                <div className="rounded-xl border border-stone-200 bg-stone-50 p-3 text-[11px] text-stone-600">
                  <p className="font-bold text-stone-800 mb-0.5">Catatan Operasional:</p>
                  <p>{selectedEvent.notes}</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setSelectedEvent(null)}
                className="h-9 rounded-xl border border-stone-200 bg-white px-4 text-xs font-semibold text-stone-600 hover:bg-stone-50"
              >
                Tutup
              </button>
              {selectedEvent.link && (
                <Link
                  href={selectedEvent.link}
                  onClick={() => setSelectedEvent(null)}
                  className="inline-flex h-9 items-center justify-center rounded-xl bg-brand-pink px-4 text-xs font-semibold text-white shadow-2xs hover:bg-brand-pinkHover"
                >
                  Buka Modul Related →
                </Link>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
