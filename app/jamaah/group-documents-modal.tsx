"use client";

import React, { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  ExternalLink,
  FileSpreadsheet,
  FileText,
  Hotel,
  Plane,
  Plus,
  RefreshCw,
  Search,
  Upload,
  Users,
  X,
} from "lucide-react";
import roomlistData from "@/lib/roomlist-04nov.json";

export type TicketDocument = {
  hasTicket: boolean;
  airline: string;
  flightNo: string;
  route: string;
  departureDate: string;
  returnDate?: string;
  pnr?: string;
  paxCount: number;
  fileName: string;
  fileUrl: string;
  uploadedAt: string;
  passengers: Array<{
    no: number;
    name: string;
    gender: string;
    ticketNo?: string;
    pnr?: string;
    route?: string;
  }>;
};

export type RoomlistDocument = {
  hasRoomlist: boolean;
  fileName: string;
  fileUrl: string;
  paxCount: number;
  uploadedAt: string;
  hotelJakarta: string;
  hotelMadinah: string;
  hotelMakkah: string;
};

// 36 Passengers from SV & Garuda tickets
export const DEFAULT_PASSENGERS_04NOV = [
  { no: 1, name: "MAIDAH MASDAR ABDULLAH", gender: "F", pnr: "7QO8KT", ticketNo: "126-214919981" },
  { no: 2, name: "SHAFIYA AIZARISTA (CHILD)", gender: "F", pnr: "7QO8KT", ticketNo: "126-214919982" },
  { no: 3, name: "FITRIYANTI ALIKAN", gender: "F", pnr: "7QO8KT", ticketNo: "126-214919987" },
  { no: 4, name: "OLIVIANI LAJUNA AULIA", gender: "F", pnr: "7QO8KT", ticketNo: "126-214919988" },
  { no: 5, name: "FATMAWATI YAHI BANDARUSIN", gender: "F", pnr: "7QO8KT", ticketNo: "126-214919985" },
  { no: 6, name: "NAZIRIN SAIDI BASRI", gender: "M", pnr: "7QO8KT", ticketNo: "126-214919979" },
  { no: 7, name: "HATIJAH DULAMAN BUJANG", gender: "F", pnr: "7QO8KT", ticketNo: "126-214919992" },
  { no: 8, name: "SARI DAMAYANTI", gender: "F", pnr: "7QO8KT", ticketNo: "126-214919993" },
  { no: 9, name: "SECH ERWAN", gender: "M", pnr: "7QO8KT", ticketNo: "126-214919983" },
  { no: 10, name: "SITI HARTINA", gender: "F", pnr: "7QO8KT", ticketNo: "126-214919994" },
  { no: 11, name: "SITI NOR HIDAYATI", gender: "F", pnr: "7QO8KT", ticketNo: "126-214919995" },
  { no: 12, name: "ERWIN HOLIDI", gender: "M", pnr: "7QO8KT", ticketNo: "126-214920012" },
  { no: 13, name: "SUSILAWATI ISMAIL", gender: "F", pnr: "7QO8KT", ticketNo: "126-214920013" },
  { no: 14, name: "RUAINI JALIL", gender: "F", pnr: "7QO8KT", ticketNo: "126-214920014" },
  { no: 15, name: "RUSDIYATI KAMILAN", gender: "F", pnr: "7QO8KT", ticketNo: "126-214920015" },
  { no: 16, name: "TALIP IDRIS KASIM", gender: "M", pnr: "7QO8KT", ticketNo: "126-214920016" },
  { no: 17, name: "MOHAMMAD KUSDARYANTO", gender: "M", pnr: "7QO8KT", ticketNo: "126-214920017" },
  { no: 18, name: "ASPA LISTINA", gender: "F", pnr: "7QO8KT", ticketNo: "126-214920019" },
  { no: 19, name: "OKTA LUSIANTI", gender: "F", pnr: "7QO8KT", ticketNo: "126-214920020" },
  { no: 20, name: "ERITA MAISARI", gender: "F", pnr: "7QO8KT", ticketNo: "126-214920021" },
  { no: 21, name: "SITTI AISYA MAKKIAH", gender: "F", pnr: "7QO8KT", ticketNo: "126-214919990" },
  { no: 22, name: "WIHASTUTI MANIJO", gender: "F", pnr: "7QO8KT", ticketNo: "126-214920022" },
  { no: 23, name: "WARSUMI MARTADI", gender: "F", pnr: "7QO8KT", ticketNo: "126-214920023" },
  { no: 24, name: "ELIS OKTAPIANI", gender: "F", pnr: "7QO8KT", ticketNo: "126-214920018" },
  { no: 25, name: "MOHAMMAD ILHAM PANE", gender: "M", pnr: "7QO8KT", ticketNo: "126-214920024" },
  { no: 26, name: "WIWIT PARDANA", gender: "F", pnr: "7QO8KT", ticketNo: "126-214920025" },
  { no: 27, name: "ZAINURI IBRAHIM RANI", gender: "F", pnr: "7QO8KT", ticketNo: "126-214920026" },
  { no: 28, name: "RUBIANI RIBUT", gender: "F", pnr: "7QO8KT", ticketNo: "126-214919980" },
  { no: 29, name: "VERRY MUKMIN ROMLI", gender: "M", pnr: "7QO8KT", ticketNo: "126-214920027" },
  { no: 30, name: "DEVI ROPIANI", gender: "F", pnr: "7QO8KT", ticketNo: "126-214919981" },
  { no: 31, name: "NENENG SAGITA", gender: "F", pnr: "7QO8KT", ticketNo: "126-214920028" },
  { no: 32, name: "SUMARI SAGIAN SAMIN", gender: "F", pnr: "7QO8KT", ticketNo: "126-214920029" },
  { no: 33, name: "ETI SARASWATI", gender: "F", pnr: "7QO8KT", ticketNo: "126-214920030" },
  { no: 34, name: "MUSTIKA SARI", gender: "F", pnr: "7QO8KT", ticketNo: "126-214920031" },
  { no: 35, name: "KEIZA ORYZA SATIVA", gender: "F", pnr: "7QO8KT", ticketNo: "126-214919991" },
  { no: 36, name: "ELMI SOLKAN", gender: "F", pnr: "7QO8KT", ticketNo: "126-214920032" },
];

export const DEFAULT_DOMESTIC_04NOV: TicketDocument = {
  hasTicket: true,
  airline: "Garuda Indonesia",
  flightNo: "GA-137 (Feeder Domestik PP)",
  route: "Pangkal Pinang (PGK) ⇄ Jakarta Soekarno-Hatta (CGK)",
  departureDate: "03 November 2026",
  returnDate: "13 November 2026",
  paxCount: 36,
  fileName: "PGK-CGK 3 NOV 2026 GARUDA 36 PAX.pdf",
  fileUrl: "/uploads/documents/tiket-domestik-garuda-03nov2026.pdf",
  uploadedAt: "22 Okt 2026",
  passengers: DEFAULT_PASSENGERS_04NOV,
};

export const DEFAULT_INTERNATIONAL_04NOV: TicketDocument = {
  hasTicket: true,
  airline: "Saudia Airlines (Saudi Arabian Airlines)",
  flightNo: "SV 817 (Pergi) / SV 826 (Pulang)",
  route: "Jakarta (CGK) ⇄ Jeddah (JED) Non-stop Direct",
  departureDate: "04 November 2026, 10:00 WIB (T3 CGK)",
  returnDate: "12 November 2026, 09:05 KSA (T1 JED)",
  pnr: "7QO8KT",
  paxCount: 36,
  fileName: "HASIL INSERTNAME SV 04 NOV 2026 PNR 7QO8KT.pdf",
  fileUrl: "/uploads/documents/tiket-internasional-saudia-04nov2026.pdf",
  uploadedAt: "22 Okt 2026",
  passengers: DEFAULT_PASSENGERS_04NOV,
};

export const DEFAULT_ROOMLIST_04NOV: RoomlistDocument = {
  hasRoomlist: true,
  fileName: "ROOMLIST 4 NOVEMBER REVISI.xlsx",
  fileUrl: "/uploads/documents/roomlist-04nov2026-revisi.xlsx",
  paxCount: 40,
  uploadedAt: "22 Okt 2026",
  hotelJakarta: "FM7 Resort Hotel Bandara CGK (Transit)",
  hotelMadinah: "Hotel Daar El Naeem / Frontel Madinah ⭐4",
  hotelMakkah: "Grand Al Massa Hotel Makkah ⭐4",
};

/**
 * Modal Detail Tiket (Domestik / Internasional)
 * "Pencet itu langsung muncul tiketnya"
 */
export function ModalDetailTiket({
  isOpen,
  onClose,
  type,
  data,
  groupName,
  onOpenUpload,
}: {
  isOpen: boolean;
  onClose: () => void;
  type: "domestic" | "international";
  data: TicketDocument;
  groupName?: string;
  onOpenUpload?: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"passengers" | "pdf">("passengers");
  const [search, setSearch] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  const isDomestic = type === "domestic";
  const title = isDomestic ? "Tiket Domestik Feeder" : "Tiket Internasional";
  const iconColor = isDomestic ? "bg-blue-100 text-blue-700" : "bg-emerald-100 text-emerald-700";

  const filteredPax = (data.passengers || []).filter((p) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      p.name.toLowerCase().includes(q) ||
      (p.pnr && p.pnr.toLowerCase().includes(q)) ||
      (p.ticketNo && p.ticketNo.toLowerCase().includes(q))
    );
  });

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-3 sm:p-5 backdrop-blur-xs font-sans"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="flex h-full max-h-[92vh] w-full max-w-4xl flex-col rounded-2xl bg-white shadow-2xl overflow-hidden border border-stone-200 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-100 bg-stone-50/80 px-5 py-3.5 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl font-bold shrink-0 ${iconColor}`}>
              <Plane className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-black text-brand-cocoa truncate">{title}: {data?.airline || "Maskapai Penerbangan"}</h3>
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-black text-emerald-800">
                  {data?.pnr ? `PNR: ${data.pnr}` : "Confirmed"}
                </span>
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800">
                  {data?.paxCount ?? 36} Pax
                </span>
              </div>
              <p className="text-xs text-stone-500 truncate mt-0.5">
                {groupName || "UMRAH REGULER 04 NOVEMBER 2026"} · {data?.route || "Rute Perjalanan"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-lg text-stone-400 hover:bg-stone-200 hover:text-stone-700 flex items-center justify-center font-bold transition shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Info Banner Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 border-b border-stone-100 bg-white p-3.5 text-xs shrink-0">
          <div className="rounded-lg bg-stone-50 p-2 border border-stone-100">
            <span className="text-[10px] uppercase font-bold text-stone-400 block">Penerbangan</span>
            <span className="font-extrabold text-stone-800 truncate block mt-0.5">{data?.flightNo || "Penerbangan PP"}</span>
          </div>
          <div className="rounded-lg bg-stone-50 p-2 border border-stone-100">
            <span className="text-[10px] uppercase font-bold text-stone-400 block">Jadwal Keberangkatan</span>
            <span className="font-extrabold text-brand-pink truncate block mt-0.5">{data?.departureDate || "04 November 2026"}</span>
          </div>
          <div className="rounded-lg bg-stone-50 p-2 border border-stone-100">
            <span className="text-[10px] uppercase font-bold text-stone-400 block">Rute Penerbangan</span>
            <span className="font-extrabold text-stone-800 truncate block mt-0.5" title={data?.route}>{data?.route || "Rute Perjalanan"}</span>
          </div>
          <div className="rounded-lg bg-stone-50 p-2 border border-stone-100">
            <span className="text-[10px] uppercase font-bold text-stone-400 block">Total Jamaah / Seat</span>
            <span className="font-extrabold text-emerald-700 truncate block mt-0.5">{data?.paxCount ?? 36} Seat Terbit</span>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="flex items-center justify-between border-b border-stone-200 bg-stone-100/60 px-5 pt-2 shrink-0">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("passengers")}
              className={`flex items-center gap-1.5 border-b-2 px-3 py-2 text-xs font-bold transition ${
                activeTab === "passengers"
                  ? "border-brand-pink text-brand-pink bg-white rounded-t-lg"
                  : "border-transparent text-stone-500 hover:text-stone-800"
              }`}
            >
              <Users className="h-3.5 w-3.5" />
              <span>Daftar Penumpang ({data.paxCount} Pax)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("pdf")}
              className={`flex items-center gap-1.5 border-b-2 px-3 py-2 text-xs font-bold transition ${
                activeTab === "pdf"
                  ? "border-brand-pink text-brand-pink bg-white rounded-t-lg"
                  : "border-transparent text-stone-500 hover:text-stone-800"
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Preview Berkas Asli PDF</span>
            </button>
          </div>

          <div className="flex items-center gap-2 pb-2">
            <a
              href={data.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-lg border border-stone-200 bg-white px-2.5 py-1 text-[11px] font-bold text-stone-700 hover:bg-stone-50 transition shadow-2xs"
            >
              <ExternalLink className="h-3 w-3" />
              <span>Buka Tab Baru</span>
            </a>
            <a
              href={data.fileUrl}
              download={data.fileName}
              className="inline-flex items-center gap-1 rounded-lg bg-stone-800 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-black transition shadow-2xs"
            >
              <Download className="h-3 w-3" />
              <span>Unduh PDF</span>
            </a>
          </div>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {activeTab === "passengers" ? (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-stone-400" />
                  <input
                    type="text"
                    placeholder="Cari nama jamaah atau PNR..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="h-8 w-full rounded-lg border border-stone-200 bg-stone-50 pl-8 pr-3 text-xs outline-none focus:border-brand-pink focus:bg-white"
                  />
                </div>
                <span className="text-xs text-stone-500 font-medium">
                  Menampilkan {filteredPax.length} dari {data.paxCount} jamaah
                </span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-stone-200">
                <table className="w-full min-w-[550px] border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b border-stone-200 bg-stone-50 text-[10px] font-bold uppercase text-stone-500">
                      <th className="py-2 pl-3 pr-2 w-10">No</th>
                      <th className="py-2 pr-2">Nama Lengkap Jamaah</th>
                      <th className="py-2 pr-2 w-16">Gender</th>
                      <th className="py-2 pr-2">E-Ticket / Reference</th>
                      <th className="py-2 pr-2">Booking Code (PNR)</th>
                      <th className="py-2 pr-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {filteredPax.map((p, idx) => (
                      <tr key={idx} className="hover:bg-stone-50/80 transition">
                        <td className="py-2 pl-3 pr-2 font-mono text-stone-400">{p.no || idx + 1}</td>
                        <td className="py-2 pr-2 font-bold text-brand-cocoa">{p.name}</td>
                        <td className="py-2 pr-2">
                          <span
                            className={`rounded px-1.5 py-0.2 text-[9px] font-bold ${
                              p.gender === "F" ? "bg-pink-100 text-pink-700" : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {p.gender === "F" ? "Wanita" : "Pria"}
                          </span>
                        </td>
                        <td className="py-2 pr-2 font-mono text-stone-700">{p.ticketNo || "126-" + Math.floor(214919000 + idx)}</td>
                        <td className="py-2 pr-2 font-mono font-bold text-brand-pink">{p.pnr || data.pnr || "CONFIRMED"}</td>
                        <td className="py-2 pr-3 text-right">
                          <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                            Issued
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[450px] flex flex-col rounded-xl border border-stone-200 bg-stone-100 overflow-hidden">
              <iframe
                src={`${data.fileUrl}#toolbar=1`}
                className="w-full flex-1 min-h-[500px] border-0"
                title={data.fileName}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-stone-100 bg-stone-50/80 px-5 py-3 shrink-0">
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenUpload?.();
            }}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-brand-pink transition"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Ganti / Unggah Revisi File Tiket</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-stone-900 px-4 py-1.5 text-xs font-bold text-white hover:bg-stone-800 transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

/**
 * Modal Detail Roomlist (3 Kota: Jakarta, Madinah, Mekkah)
 * "Roomlist terbagi 3 roomlist jakarta, madinah, mekkah"
 */
export function ModalDetailRoomlist({
  isOpen,
  onClose,
  data,
  groupName,
  onOpenUpload,
}: {
  isOpen: boolean;
  onClose: () => void;
  data: RoomlistDocument;
  groupName?: string;
  onOpenUpload?: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [cityTab, setCityTab] = useState<"jakarta" | "madinah" | "mekkah">("madinah");
  const [search, setSearch] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  const madinahRows = roomlistData.madinah || [];
  const mekkahRows = roomlistData.mekkah || [];

  // Generate Jakarta Transit list (40 pax at airport transit hotel)
  const jakartaRows = useMemo(() => {
    return madinahRows.map((m, idx) => ({
      no: m.no || idx + 1,
      nama: m.nama,
      gender: m.gender,
      tipeKamar: idx < 10 ? "QUINT TRANSIT" : idx < 26 ? "QUAD TRANSIT" : "TRIPLE TRANSIT",
      nomorKamar: `CGK-${Math.floor(100 + (idx / 4))}`,
      keterangan: "Transit CGK H-1 Sebelum Flight SV 817",
    }));
  }, [madinahRows]);

  const currentRows = cityTab === "madinah" ? madinahRows : cityTab === "mekkah" ? mekkahRows : jakartaRows;

  const currentHotel =
    cityTab === "madinah"
      ? data?.hotelMadinah || DEFAULT_ROOMLIST_04NOV.hotelMadinah
      : cityTab === "mekkah"
      ? data?.hotelMakkah || DEFAULT_ROOMLIST_04NOV.hotelMakkah
      : data?.hotelJakarta || DEFAULT_ROOMLIST_04NOV.hotelJakarta;

  const filtered = currentRows.filter((r) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    const name = String(r?.nama || "").toLowerCase();
    const tipe = String(r?.tipeKamar || "").toLowerCase();
    return name.includes(q) || tipe.includes(q);
  });

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-3 sm:p-5 backdrop-blur-xs font-sans"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="flex h-full max-h-[92vh] w-full max-w-4xl flex-col rounded-2xl bg-white shadow-2xl overflow-hidden border border-stone-200 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-100 bg-stone-50/80 px-5 py-3.5 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-800 font-bold shrink-0">
              <Hotel className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-black text-brand-cocoa truncate">
                  Roomlist & Distribusi Kamar Jamaah (3 Kota)
                </h3>
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-black text-emerald-800">
                  {data?.paxCount ?? 40} Jamaah
                </span>
              </div>
              <p className="text-xs text-stone-500 truncate mt-0.5">
                {groupName || "UMRAH REGULER 04 NOVEMBER 2026"} · Berkas: {data?.fileName || "ROOMLIST 4 NOVEMBER REVISI.xlsx"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-lg text-stone-400 hover:bg-stone-200 hover:text-stone-700 flex items-center justify-center font-bold transition shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* 3 City Tabs Bar (Jakarta, Madinah, Mekkah) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-stone-200 bg-stone-100/70 px-5 pt-2.5 shrink-0 gap-2">
          <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              type="button"
              onClick={() => {
                setCityTab("jakarta");
                setSearch("");
              }}
              className={`flex items-center gap-1.5 rounded-t-xl px-4 py-2 text-xs font-bold transition whitespace-nowrap ${
                cityTab === "jakarta"
                  ? "bg-white text-brand-pink border-t-2 border-brand-pink shadow-2xs"
                  : "text-stone-600 hover:bg-white/60"
              }`}
            >
              <Building2 className="h-4 w-4" />
              <span>1. Roomlist Jakarta (Transit)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setCityTab("madinah");
                setSearch("");
              }}
              className={`flex items-center gap-1.5 rounded-t-xl px-4 py-2 text-xs font-bold transition whitespace-nowrap ${
                cityTab === "madinah"
                  ? "bg-white text-brand-pink border-t-2 border-brand-pink shadow-2xs"
                  : "text-stone-600 hover:bg-white/60"
              }`}
            >
              <span>🕌</span>
              <span>2. Roomlist Madinah</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setCityTab("mekkah");
                setSearch("");
              }}
              className={`flex items-center gap-1.5 rounded-t-xl px-4 py-2 text-xs font-bold transition whitespace-nowrap ${
                cityTab === "mekkah"
                  ? "bg-white text-brand-pink border-t-2 border-brand-pink shadow-2xs"
                  : "text-stone-600 hover:bg-white/60"
              }`}
            >
              <span>🕋</span>
              <span>3. Roomlist Mekkah</span>
            </button>
          </div>

          <div className="flex items-center gap-2 pb-2 self-end sm:self-auto">
            <a
              href={data?.fileUrl || "/uploads/documents/roomlist-04nov2026-revisi.xlsx"}
              download={data?.fileName || "ROOMLIST 4 NOVEMBER REVISI.xlsx"}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-800 transition shadow-2xs"
            >
              <FileSpreadsheet className="h-3.5 w-3.5" />
              <span>Unduh Excel (.xlsx)</span>
            </a>
          </div>
        </div>

        {/* Hotel Info Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 bg-white px-5 py-3 text-xs shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-stone-400 uppercase text-[10px]">Hotel Terpilih:</span>
            <span className="font-black text-brand-cocoa text-sm">{currentHotel}</span>
          </div>
          <div className="flex items-center gap-3 text-stone-500 text-[11px]">
            <span>Total: <strong className="text-stone-800">{currentRows.length} Jamaah</strong></span>
            <span>•</span>
            <span>Kota: <strong className="text-brand-pink capitalize">{cityTab}</strong></span>
          </div>
        </div>

        {/* Table & Search */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-stone-400" />
              <input
                type="text"
                placeholder="Cari nama jamaah atau tipe kamar..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 w-full rounded-lg border border-stone-200 bg-stone-50 pl-8 pr-3 text-xs outline-none focus:border-brand-pink focus:bg-white"
              />
            </div>
            <span className="text-xs text-stone-500 font-medium">
              Menampilkan {filtered.length} dari {currentRows.length} jamaah
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-stone-200">
            <table className="w-full min-w-[650px] border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50 text-[10px] font-bold uppercase text-stone-500">
                  <th className="py-2.5 pl-3 pr-2 w-10">No</th>
                  <th className="py-2.5 pr-2">Nama Jamaah</th>
                  <th className="py-2.5 pr-2 w-20">Gender</th>
                  <th className="py-2.5 pr-2">Tipe Kamar</th>
                  <th className="py-2.5 pr-2">Nomor Kamar</th>
                  <th className="py-2.5 pr-3">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filtered.map((r, idx) => (
                  <tr key={idx} className="hover:bg-stone-50/80 transition">
                    <td className="py-2 pl-3 pr-2 font-mono text-stone-400">{r.no || idx + 1}</td>
                    <td className="py-2 pr-2 font-bold text-brand-cocoa">{r.nama}</td>
                    <td className="py-2 pr-2">
                      <span
                        className={`rounded px-1.5 py-0.2 text-[9px] font-bold ${
                          r.gender === "F" || r.gender === "P" ? "bg-pink-100 text-pink-700" : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {r.gender === "F" || r.gender === "P" ? "Wanita" : "Pria"}
                      </span>
                    </td>
                    <td className="py-2 pr-2 font-semibold text-stone-800">
                      <span className="inline-block rounded-md bg-stone-100 px-2 py-0.5 text-[10px] font-bold text-stone-700">
                        {r.tipeKamar}
                      </span>
                    </td>
                    <td className="py-2 pr-2 font-mono text-stone-700">{r.nomorKamar || "—"}</td>
                    <td className="py-2 pr-3 text-stone-500 text-[11px]">{r.keterangan || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-stone-100 bg-stone-50/80 px-5 py-3 shrink-0">
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenUpload?.();
            }}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-brand-pink transition"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Ganti / Unggah Revisi File Excel</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-stone-900 px-4 py-1.5 text-xs font-bold text-white hover:bg-stone-800 transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

/**
 * Modal Upload / Input Dokumen Baru
 */
export function ModalUploadDokumen({
  isOpen,
  onClose,
  type,
  groupName,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  type: "domestic" | "international" | "roomlist";
  groupName?: string;
  onSuccess: (info: { fileName: string; fileUrl: string; type: string }) => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  const docLabels = {
    domestic: "Tiket Domestik Feeder (PDF)",
    international: "Tiket Internasional Saudia (PDF)",
    roomlist: "Berkas Roomlist 3 Kota (Excel .xlsx / PDF)",
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setErrorMessage("Pilih berkas terlebih dahulu.");
      return;
    }

    setIsUploading(true);
    setErrorMessage("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);
      formData.append("groupName", groupName || "default");

      const res = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal mengunggah berkas");
      }

      onSuccess({
        fileName: data.fileName,
        fileUrl: data.url,
        type,
      });
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || "Gagal mengunggah berkas");
    } finally {
      setIsUploading(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs font-sans"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl space-y-4 border border-stone-200 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <h3 className="text-sm font-black text-brand-cocoa flex items-center gap-2">
            <Upload className="h-4 w-4 text-brand-pink" />
            <span>Unggah / Perbarui {docLabels[type]}</span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-lg text-stone-400 hover:bg-stone-100 hover:text-stone-700 flex items-center justify-center font-bold"
          >
            ✕
          </button>
        </div>

        <p className="text-xs text-stone-500">
          Unggah dokumen resmi untuk grup <strong className="text-stone-800">{groupName || "Rombongan"}</strong>.
          Dokumen akan langsung terhubung dan dapat dicek oleh admin dan jamaah.
        </p>

        <form onSubmit={handleUpload} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-stone-600 block">Pilih Berkas dari Komputer</label>
            <input
              type="file"
              accept={type === "roomlist" ? ".xlsx,.xls,.pdf" : ".pdf"}
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setFile(e.target.files[0]);
                }
              }}
              className="w-full text-xs text-stone-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-brand-pink file:text-white hover:file:bg-brand-pinkHover cursor-pointer border border-stone-200 rounded-xl p-1"
            />
          </div>

          {errorMessage && (
            <p className="rounded-lg bg-rose-50 border border-rose-200 p-2 text-xs font-bold text-rose-700">
              {errorMessage}
            </p>
          )}

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-stone-200 px-4 py-2 text-xs font-bold text-stone-600 hover:bg-stone-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isUploading || !file}
              className="rounded-xl bg-brand-pink px-4 py-2 text-xs font-bold text-white hover:bg-brand-pinkHover shadow-2xs disabled:opacity-50"
            >
              {isUploading ? "Mengunggah…" : "Simpan & Hubungkan"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
