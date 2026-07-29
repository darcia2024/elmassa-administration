"use client";

import {
  AlertCircle,
  Building,
  Calendar,
  CheckCircle2,
  Download,
  Eye,
  FileText,
  Hotel,
  Layers,
  MapPin,
  Phone,
  Plane,
  Printer,
  QrCode,
  Search,
  ShieldCheck,
  User,
  Users,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { listParticipantsForBooking, type ParticipantRow } from "@/lib/seed-data/bookings";

const groupScheduleOptions = [
  { id: "grup-babel-20260708", label: "Grup 1: Rombongan Bangka Belitung (08 - 18 Jul 2026 • Garuda GA-980)" },
  { id: "grup-sumbagsel-20260812", label: "Grup 2: Rombongan Sumbagsel & Palembang (12 - 24 Agu 2026 • Saudia SV-815)" },
  { id: "grup-vip-20260905", label: "Grup 3: Rombongan Executive VIP (05 - 14 Sep 2026 • Emirates EK-357)" },
];

export default function ManifestPage() {
  const [selectedScheduleId, setSelectedScheduleId] = useState("grup-babel-20260708");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedParticipant, setSelectedParticipant] = useState<ParticipantRow | null>(null);

  const allParticipants = useMemo(() => listParticipantsForBooking("book-001"), []);

  const filteredParticipants = useMemo(() => {
    return allParticipants.filter((p) => {
      const query = searchQuery.toLowerCase().trim();
      if (!query) return true;
      return (
        p.name.toLowerCase().includes(query) ||
        p.passportNumber.toLowerCase().includes(query) ||
        (p.ticketNumber?.toLowerCase().includes(query) ?? false) ||
        (p.visaNumber?.toLowerCase().includes(query) ?? false) ||
        (p.city?.toLowerCase().includes(query) ?? false)
      );
    });
  }, [allParticipants, searchQuery]);

  return (
    <AppShell eyebrow="Operasional Keberangkatan" title="Manifest Penerbangan, Paspor & E-Visa Jamaah">
      <div className="space-y-5">
        
        {/* Header Banner */}
        <section className="rounded-2xl border border-stone-200/70 bg-white p-5 sm:p-6 shadow-2xs">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-xl font-extrabold text-brand-cocoa tracking-tight">
                Manifest Operasional & Inspection Paspor/Visa Digital
              </h1>
              <p className="text-xs text-stone-500 mt-1">
                Klik pada nama jamaah untuk melihat detail paspor RI, e-visa Umrah KSA, e-tiket Garuda, dan rooming list hotel.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3.5 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition"
              >
                <Printer className="h-3.5 w-3.5 text-stone-500" strokeWidth={1.5} />
                Cetak Manifest
              </button>
              
              <button
                type="button"
                className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-brand-pink px-4 text-xs font-semibold text-white shadow-2xs hover:bg-brand-pinkHover transition"
              >
                <Download className="h-3.5 w-3.5" strokeWidth={1.5} />
                Export Rooming List
              </button>
            </div>
          </div>
        </section>

        {/* Metric Cards Row */}
        <section className="grid gap-4 md:grid-cols-4">
          <article className="rounded-2xl border border-stone-200/70 bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-stone-500">Grup Keberangkatan</p>
              <Layers className="h-4 w-4 text-brand-pink" strokeWidth={1.5} />
            </div>
            <p className="mt-1 text-2xl font-bold text-brand-cocoa">Grup 1 Babel</p>
            <p className="mt-1 text-[11px] text-stone-400">40 Pax Jamaah Terdaftar</p>
          </article>

          <article className="rounded-2xl border border-stone-200/70 bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-stone-500">Penerbangan Maskapai</p>
              <Plane className="h-4 w-4 text-sky-600" strokeWidth={1.5} />
            </div>
            <p className="mt-1 text-2xl font-bold text-sky-800">Garuda GA-980</p>
            <p className="mt-1 text-[11px] text-stone-400">Start Depati Amir Pangkalpinang</p>
          </article>

          <article className="rounded-2xl border border-stone-200/70 bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-stone-500">Status E-Visa Imigrasi</p>
              <ShieldCheck className="h-4 w-4 text-emerald-600" strokeWidth={1.5} />
            </div>
            <p className="mt-1 text-2xl font-bold text-emerald-700">40 Visa Valid</p>
            <p className="mt-1 text-[11px] text-stone-400">100% Verified & Issued</p>
          </article>

          <article className="rounded-2xl border border-stone-200/70 bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-stone-500">Tanggal Keberangkatan</p>
              <AlertCircle className="h-4 w-4 text-amber-600" strokeWidth={1.5} />
            </div>
            <p className="mt-1 text-2xl font-bold text-amber-800">08 - 18 Juli 2026</p>
            <p className="mt-1 text-[11px] text-stone-400">Durasi 11 Hari • Bonus Thaif</p>
          </article>
        </section>

        {/* Manifest Table Card */}
        <section className="rounded-2xl border border-stone-200/70 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-base font-bold text-brand-cocoa">Daftar Manifest Peserta & Imigrasi</h3>
              <p className="text-xs text-stone-500">
                <span className="text-brand-pink font-semibold">Petunjuk:</span> Klik nama jamaah atau tombol mata di baris untuk melihat detail Paspor & E-Visa.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                className="h-9 rounded-xl border border-stone-200 bg-sky-50/60 px-3 text-xs font-bold text-sky-900 outline-none shadow-2xs"
                value={selectedScheduleId}
                onChange={(e) => setSelectedScheduleId(e.target.value)}
              >
                {groupScheduleOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>

              <label className="flex h-9 items-center gap-2 rounded-xl border border-stone-200 bg-white px-3 text-xs text-stone-500">
                <Search className="h-3.5 w-3.5 text-stone-400" strokeWidth={1.5} />
                <input
                  className="w-full bg-transparent outline-none font-normal text-xs placeholder:text-stone-400"
                  placeholder="Cari paspor, visa, nama..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </label>
            </div>
          </div>

          {/* 📱 NATIVE MOBILE TOUCH CARDS (Hidden on Desktop) */}
          <div className="space-y-3 block md:hidden">
            {filteredParticipants.map((item, idx) => (
              <div
                key={item.id}
                onClick={() => setSelectedParticipant(item)}
                className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-2xs space-y-2.5 active:bg-stone-50 cursor-pointer transition"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="grid h-7 w-7 place-items-center rounded-lg bg-stone-100 text-stone-700 font-bold text-xs">
                      {idx + 1}
                    </span>
                    <div>
                      <h4 className="font-bold text-xs text-stone-900">{item.name}</h4>
                      <p className="font-mono text-[10px] text-stone-400">Paspor: {item.passportNumber}</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200">
                    {item.documentStatus}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                  <div>
                    <span className="text-[10px] text-stone-400 block font-medium">E-Visa KSA</span>
                    <span className="font-mono font-bold text-stone-800">{item.visaNumber}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 block font-medium">E-Tiket Flight</span>
                    <span className="font-mono font-bold text-stone-800">{item.ticketNumber}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1 text-stone-500">
                  <span>📍 {item.city}</span>
                  <span className="font-bold text-brand-pink flex items-center gap-1">Lihat Detail <Eye className="h-3 w-3" /></span>
                </div>
              </div>
            ))}
          </div>

          {/* 🖥️ DESKTOP DATA TABLE (Hidden on Mobile) */}
          <div className="hidden md:block overflow-x-auto rounded-xl border border-stone-200/60">
            <table className="w-full min-w-[960px] border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-stone-200/60 bg-stone-50/70 font-semibold text-stone-500 text-[11px] uppercase tracking-wider">
                  <th className="py-2.5 pl-3 pr-2">Seat #</th>
                  <th className="py-2.5 pr-2">Nama Jamaah Paspor</th>
                  <th className="py-2.5 pr-2">No. Paspor RI</th>
                  <th className="py-2.5 pr-2">E-Tiket Garuda</th>
                  <th className="py-2.5 pr-2">E-Visa Umrah KSA</th>
                  <th className="py-2.5 pr-2">Domisili Kota</th>
                  <th className="py-2.5 pr-2">Rooming List</th>
                  <th className="py-2.5 pr-3 text-right">Detail Dokumen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-normal">
                {filteredParticipants.map((p, index) => (
                  <tr
                    key={p.id}
                    onClick={() => setSelectedParticipant(p)}
                    className="cursor-pointer transition hover:bg-rose-50/40"
                  >
                    <td className="py-3 pl-3 pr-2 font-mono text-stone-400 text-[11px]">#{String(index + 1).padStart(2, "0")}</td>
                    <td className="py-3 pr-2 font-semibold text-brand-cocoa whitespace-nowrap group">
                      <span className="hover:text-brand-pink underline underline-offset-2 flex items-center gap-1.5">
                        {p.name}
                        <Eye className="h-3.5 w-3.5 text-brand-pink opacity-0 group-hover:opacity-100 transition" strokeWidth={1.5} />
                      </span>
                    </td>
                    <td className="py-3 pr-2 font-mono font-bold text-stone-800 whitespace-nowrap">{p.passportNumber}</td>
                    <td className="py-3 pr-2 font-mono text-sky-800 font-medium whitespace-nowrap">{p.ticketNumber}</td>
                    <td className="py-3 pr-2 font-mono text-emerald-800 font-medium whitespace-nowrap">{p.visaNumber}</td>
                    <td className="py-3 pr-2 font-medium text-stone-600 whitespace-nowrap">{p.city}</td>
                    <td className="py-3 pr-2 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 rounded-full border border-stone-200 bg-stone-50 px-2 py-0.5 text-[11px] font-semibold text-stone-700">
                        {index % 2 === 0 ? "Quad (Bintang 4)" : "Double (Bintang 4)"}
                      </span>
                    </td>
                    <td className="py-3 pr-3 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setSelectedParticipant(p); }}
                        className="inline-flex items-center gap-1 rounded-xl border border-brand-pink/30 bg-rose-50 px-2.5 py-1 text-[11px] font-semibold text-brand-pink hover:bg-brand-pink hover:text-white transition"
                      >
                        <Eye className="h-3 w-3" strokeWidth={1.5} />
                        <span>Lihat Berkas</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

      </div>

      {/* 📄 MODAL DETAIL PASPOR & E-VISA JAMAAH */}
      {selectedParticipant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl rounded-2xl border border-stone-200 bg-white p-6 shadow-xl space-y-6 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-stone-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-pink text-white font-black text-sm shadow-xs">
                  {selectedParticipant.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-brand-cocoa">{selectedParticipant.name}</h3>
                  <p className="text-xs text-stone-500">
                    Kota: {selectedParticipant.city} • No. WA: {selectedParticipant.contact}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedParticipant(null)}
                className="grid h-8 w-8 place-items-center rounded-xl border border-stone-200 bg-stone-50 text-stone-500 hover:bg-stone-100 transition"
              >
                <X className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>

            {/* Document Content Grid */}
            <div className="grid gap-5 md:grid-cols-2">
              
              {/* 🇲🇨 PASPOR REPUBLIK INDONESIA */}
              <div className="rounded-xl border border-emerald-200/70 bg-emerald-50/30 p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-emerald-200/50 pb-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-700" strokeWidth={1.5} />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900">Paspor RI Digital</h4>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">PASSPORT VALID</span>
                </div>

                <div className="grid grid-cols-2 gap-2.5 text-xs">
                  <div>
                    <p className="text-[10px] font-semibold text-stone-400 uppercase">Nomor Paspor</p>
                    <p className="font-mono font-bold text-stone-800 text-sm">{selectedParticipant.passportNumber}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-stone-400 uppercase">Tipe Paspor</p>
                    <p className="font-medium text-stone-800">P - Reguler 10 Thn</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-stone-400 uppercase">Tempat / Tgl Lahir</p>
                    <p className="font-medium text-stone-800">{selectedParticipant.city}, 14 Mei 1980</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-stone-400 uppercase">Kantor Imigrasi</p>
                    <p className="font-medium text-stone-800">Kanim Kelas II Pangkalpinang</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-stone-400 uppercase">Tgl Dikeluarkan</p>
                    <p className="font-medium text-stone-800">12 Jan 2024</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-stone-400 uppercase">Tgl Kadaluarsa</p>
                    <p className="font-bold text-emerald-700">12 Jan 2034</p>
                  </div>
                </div>
              </div>

              {/* 🇸🇦 E-VISA UMRAH KINGDOM OF SAUDI ARABIA */}
              <div className="rounded-xl border border-sky-200/70 bg-sky-50/30 p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-sky-200/50 pb-2">
                  <div className="flex items-center gap-2">
                    <QrCode className="h-4 w-4 text-sky-700" strokeWidth={1.5} />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-sky-900">E-Visa Umrah KSA</h4>
                  </div>
                  <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-bold text-sky-800">VISA ISSUED</span>
                </div>

                <div className="grid grid-cols-2 gap-2.5 text-xs">
                  <div>
                    <p className="text-[10px] font-semibold text-stone-400 uppercase">Nomor E-Visa</p>
                    <p className="font-mono font-bold text-sky-900 text-sm">{selectedParticipant.visaNumber}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-stone-400 uppercase">No. Muqim / Sijil</p>
                    <p className="font-mono font-medium text-stone-800">7082910482</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-stone-400 uppercase">Jenis Visa</p>
                    <p className="font-medium text-stone-800">Visa Umrah Single Entry</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-stone-400 uppercase">Masa Berlaku</p>
                    <p className="font-bold text-sky-800">01 Jul - 01 Sep 2026</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[10px] font-semibold text-stone-400 uppercase">Penerbit Visa</p>
                    <p className="font-medium text-stone-800">Ministry of Hajj & Umrah Saudi Arabia</p>
                  </div>
                </div>
              </div>

              {/* ✈️ E-TIKET GARUDA INDONESIA */}
              <div className="rounded-xl border border-stone-200/70 bg-stone-50/50 p-4 space-y-3 col-span-2">
                <div className="flex items-center justify-between border-b border-stone-200/50 pb-2">
                  <div className="flex items-center gap-2">
                    <Plane className="h-4 w-4 text-brand-pink" strokeWidth={1.5} />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-brand-cocoa">E-Tiket Garuda Indonesia GA-980</h4>
                  </div>
                  <span className="font-mono font-bold text-xs text-brand-pink">PNR: GA-BABEL-980</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                  <div>
                    <p className="text-[10px] font-semibold text-stone-400 uppercase">Nomor E-Ticket</p>
                    <p className="font-mono font-bold text-stone-800">{selectedParticipant.ticketNumber}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-stone-400 uppercase">Rute Penerbangan</p>
                    <p className="font-medium text-stone-800">PGK - CGK - MED</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-stone-400 uppercase">Tgl Berangkat</p>
                    <p className="font-bold text-brand-cocoa">08 Juli 2026 (05:45 WIB)</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-stone-400 uppercase">Kamar Hotel</p>
                    <p className="font-bold text-emerald-700">Quad (Grand Al Massa Makkah)</p>
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 border-t border-stone-100 pt-4">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3.5 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition"
              >
                <Printer className="h-3.5 w-3.5 text-stone-500" strokeWidth={1.5} />
                Cetak Dokumen
              </button>

              <button
                type="button"
                onClick={() => setSelectedParticipant(null)}
                className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-brand-cocoa px-4 text-xs font-semibold text-white hover:bg-stone-800 transition"
              >
                Tutup Modal
              </button>
            </div>

          </div>
        </div>
      )}

    </AppShell>
  );
}
