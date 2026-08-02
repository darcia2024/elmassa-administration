"use client";

import React, { useMemo, useState } from "react";
import {
  AlertCircle,
  Building,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Download,
  Eye,
  FileSpreadsheet,
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
import { AppShell } from "@/components/app-shell";
import { exportToCSV } from "@/lib/export-excel";
import { listParticipantsForBooking, type ParticipantRow } from "@/lib/seed-data/bookings";

const groupScheduleOptions = [
  { id: "grup-oktober-2026", label: "Grup 1: Umrah Spesial Oktober 2026 (25 Okt - 05 Nov 2026 • Garuda GA-980)" },
  { id: "grup-november-2026", label: "Grup 2: Umrah Reguler November 2026 (10 - 21 Nov 2026 • Saudia SV-815)" },
  { id: "grup-desember-2026", label: "Grup 3: Umrah Akhir Tahun Desember 2026 (20 - 31 Des 2026 • Oman Air WY-848)" },
  { id: "grup-juli-2026", label: "Grup 4: Umrah Liburan Juli 2026 (08 - 19 Jul 2026 • Lion Premium JT-110)" },
];

export default function ManifestPage() {
  const [selectedScheduleId, setSelectedScheduleId] = useState("grup-oktober-2026");
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

  // Notion/Eduplex Layout States
  const [activeTab, setActiveTab] = useState<"all" | "flight" | "rooming" | "visa">("all");
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({ "0": true });
  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({});
  const [showChangesToggle, setShowChangesToggle] = useState(true);

  const toggleExpand = (id: string) => {
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleSelectAll = () => {
    if (Object.keys(selectedIds).length === filteredParticipants.length) {
      setSelectedIds({});
    } else {
      const all: Record<string, boolean> = {};
      filteredParticipants.forEach((p) => (all[p.id] = true));
      setSelectedIds(all);
    }
  };

  const toggleSelectRow = (id: string) => {
    setSelectedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <AppShell eyebrow="Database Operasional" title="Employee & Jamaah Management System">
      <div className="space-y-4 font-sans">
        
        {/* 🔒 Notion Top Breadcrumb & Page Header */}
        <section className="rounded-2xl border border-stone-200/80 bg-white p-5 sm:p-6 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-stone-400">
            <span className="flex items-center gap-1 text-stone-600">
              <span className="text-stone-400">🔒</span> Private Database
            </span>
            <span>/</span>
            <span className="hover:text-stone-600 cursor-pointer">company</span>
            <span>/</span>
            <span className="font-bold text-stone-800">jamaah-flight-manifest-system</span>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
                Jamaah Manifest & Flight System
              </h1>
              <p className="text-xs text-stone-500 mt-1 font-medium max-w-2xl">
                Comprehensive flight manifest tracking departments, passports, e-visas, rooming lists, and operational status.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3.5 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition cursor-pointer"
              >
                <Printer className="h-3.5 w-3.5 text-stone-500" strokeWidth={1.5} />
                Cetak Manifest
              </button>
              
              <button
                type="button"
                onClick={() => {
                  const headers = ["No Paspor", "Nama Jamaah", "No Kontak", "Kota/Kab", "Status Dokumen", "Status E-Visa"];
                  const rows = filteredParticipants.map((p) => [
                    p.passportNumber || "-",
                    p.name,
                    p.contact || "-",
                    p.city || "-",
                    p.documentStatus || "Lengkap",
                    p.visaStatus || "Terbit",
                  ]);
                  exportToCSV("Manifest_Flight_Rooming_List_El_Massa", headers, rows);
                }}
                className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-emerald-600 px-4 text-xs font-semibold text-white shadow-2xs hover:bg-emerald-700 transition cursor-pointer"
              >
                <FileSpreadsheet className="h-3.5 w-3.5" strokeWidth={1.5} />
                Export Excel Manifest
              </button>
            </div>
          </div>
        </section>

        {/* 📑 Notion-Style Sub-Navigation Tabs & Controls Strip */}
        <section className="rounded-2xl border border-stone-200/80 bg-white p-3 shadow-2xs space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Pill Tabs */}
            <div className="flex items-center gap-1 bg-stone-100/70 p-1 rounded-xl w-fit">
              <button
                type="button"
                onClick={() => setActiveTab("all")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                  activeTab === "all"
                    ? "bg-white text-stone-900 shadow-xs"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                Jamaah Overview
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("flight")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                  activeTab === "flight"
                    ? "bg-white text-stone-900 shadow-xs"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                Flight & PNR
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("rooming")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                  activeTab === "rooming"
                    ? "bg-white text-stone-900 shadow-xs"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                Rooming Hotel
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("visa")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                  activeTab === "visa"
                    ? "bg-white text-stone-900 shadow-xs"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                Paspor & Visa
              </button>
            </div>

            {/* Right Controls: Show Changes Toggle & Search */}
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-xs font-semibold text-stone-600 cursor-pointer">
                <span>Sub-Rows Rincian</span>
                <input
                  type="checkbox"
                  checked={showChangesToggle}
                  onChange={(e) => setShowChangesToggle(e.target.checked)}
                  className="h-4 w-4 rounded border-stone-300 text-stone-900 accent-stone-900"
                />
              </label>

              <div className="h-4 w-[1px] bg-stone-200" />

              <label className="flex h-8 items-center gap-2 rounded-lg border border-stone-200 bg-stone-50/50 px-2.5 text-xs text-stone-600">
                <Search className="h-3.5 w-3.5 text-stone-400" />
                <input
                  type="text"
                  placeholder="Filter nama, paspor, visa..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent outline-none text-xs font-medium placeholder:text-stone-400 w-36 sm:w-48"
                />
              </label>
            </div>
          </div>
        </section>

        {/* 🖥️ NOTION / EDUPLEX STYLE DATA TABLE */}
        <section className="rounded-2xl border border-stone-200/80 bg-white overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] border-collapse text-left text-xs font-sans">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50/80 font-bold text-stone-600 text-[11px] select-none">
                  <th className="py-3 pl-4 pr-2 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={Object.keys(selectedIds).length === filteredParticipants.length && filteredParticipants.length > 0}
                      onChange={toggleSelectAll}
                      className="h-3.5 w-3.5 rounded border-stone-300 accent-stone-900"
                    />
                  </th>
                  <th className="py-3 px-3 w-32">
                    <div className="flex items-center gap-1">
                      <span>📄 Kode Jamaah</span>
                    </div>
                  </th>
                  <th className="py-3 px-3 w-40">
                    <div className="flex items-center gap-1">
                      <span>💼 Group & Rombongan</span>
                    </div>
                  </th>
                  <th className="py-3 px-3">
                    <div className="flex items-center gap-1">
                      <span>✉️ Email / Kontak</span>
                    </div>
                  </th>
                  <th className="py-3 px-3 w-32">
                    <div className="flex items-center gap-1">
                      <span>🛡️ Status Visa</span>
                    </div>
                  </th>
                  <th className="py-3 px-3">
                    <div className="flex items-center gap-1">
                      <span>👤 Nama Lengkap Paspor</span>
                    </div>
                  </th>
                  <th className="py-3 px-3 w-32 text-right pr-4">
                    <div className="flex items-center justify-end gap-1">
                      <span>📅 Tgl Terbit / Expiry</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredParticipants.map((p, index) => {
                  const isExpanded = !!expandedRows[p.id] || !!expandedRows[String(index)];
                  const isSelected = !!selectedIds[p.id];
                  const codeId = `MNF${String(index + 1).padStart(3, "0")}`;
                  const groupCategory = index % 3 === 0 ? "Finance" : index % 3 === 1 ? "Marketing" : "Sales";
                  const groupDotColor = index % 3 === 0 ? "bg-emerald-500" : index % 3 === 1 ? "bg-amber-500" : "bg-sky-500";

                  return (
                    <React.Fragment key={p.id || index}>
                      {/* Main Data Row */}
                      <tr
                        className={`group transition hover:bg-stone-50/80 cursor-pointer ${
                          isSelected ? "bg-rose-50/30" : index % 2 === 1 ? "bg-stone-50/20" : "bg-white"
                        }`}
                        onClick={() => setSelectedParticipant(p)}
                      >
                        {/* Checkbox */}
                        <td className="py-3 pl-4 pr-2 text-center" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectRow(p.id)}
                            className="h-3.5 w-3.5 rounded border-stone-300 accent-stone-900"
                          />
                        </td>

                        {/* Kode Jamaah with Expand Arrow */}
                        <td className="py-3 px-3 font-mono font-bold text-stone-800 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleExpand(p.id || String(index));
                              }}
                              className="text-stone-400 hover:text-stone-800 p-0.5 rounded transition"
                            >
                              {isExpanded ? (
                                <ChevronDown className="h-3.5 w-3.5" />
                              ) : (
                                <ChevronRight className="h-3.5 w-3.5" />
                              )}
                            </button>
                            <span>{codeId}</span>
                          </div>
                        </td>

                        {/* Group Pill Badge with Dot */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-stone-200/80 bg-white px-2.5 py-0.5 text-[11px] font-bold text-stone-800 shadow-2xs">
                            <span className={`h-2 w-2 rounded-full ${groupDotColor}`} />
                            {index % 3 === 0 ? "Bangka Belitung" : index % 3 === 1 ? "Sumbagsel" : "Palembang VIP"}
                          </span>
                        </td>

                        {/* Email / Contact */}
                        <td className="py-3 px-3 font-medium text-stone-600 whitespace-nowrap font-mono text-[11px]">
                          {p.contact ? `${p.contact}@elmassa.com` : "jamaah@elmassa.com"}
                        </td>

                        {/* Visa Status (Pill Badge with Checkmark ✓ Active) */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-extrabold text-emerald-800 border border-emerald-200/80">
                            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                            <span>✓ Active</span>
                          </span>
                        </td>

                        {/* Nama Lengkap Paspor */}
                        <td className="py-3 px-3 font-bold text-stone-900 whitespace-nowrap">
                          {p.name}
                        </td>

                        {/* Tgl Terbit / Expiry */}
                        <td className="py-3 px-3 text-right pr-4 font-medium text-stone-500 whitespace-nowrap font-mono text-[11px]">
                          {p.passportNumber || "A-992182"}
                        </td>
                      </tr>

                      {/* Expandable Sub-Rows (Notion Hatched Detail Layout) */}
                      {isExpanded && showChangesToggle && (
                        <tr className="bg-[repeating-linear-gradient(45deg,transparent,transparent_6px,rgba(0,0,0,0.015)_6px,rgba(0,0,0,0.015)_12px)] border-t border-stone-100 text-stone-500">
                          <td className="py-2.5 pl-4 pr-2" />
                          <td className="py-2.5 px-3 font-mono text-[11px] text-stone-400 pl-7">
                            ↳ Paspor RI
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-stone-200/50 bg-stone-100/60 px-2.5 py-0.5 text-[10px] font-semibold text-stone-600">
                              <span className="h-1.5 w-1.5 rounded-full bg-stone-400" />
                              {p.passportNumber || "A-992812"}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-mono text-[11px] text-stone-400">
                            E-Tiket: {p.ticketNumber || "126-8829102"}
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50/60 px-2 py-0.5 rounded-md">
                              E-Visa KSA: {p.visaNumber || "E-991204"}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-stone-400 font-medium">
                            Room: {index % 2 === 0 ? "Quad (4 Pax)" : "Double (2 Pax)"}
                          </td>
                          <td className="py-2.5 px-3 text-right pr-4 font-mono text-[10px] text-stone-400">
                            Verified Oct 2026
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
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
