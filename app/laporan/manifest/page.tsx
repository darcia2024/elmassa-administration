"use client";

import {
  CheckCircle2,
  FileSpreadsheet,
  IdCard,
  Printer,
  Search,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { ReportNav } from "@/components/report-nav";
import { exportToCSV } from "@/lib/export-excel";

type ParticipantRow = {
  id: string;
  bookingCode: string;
  customerName: string;
  packageName: string;
  departure: string;
  name: string;
  passportNumber: string;
  contact: string;
  documentStatus: string;
  visaNumber: string;
  visaExpiry: string | null;
  ticketNumber: string;
  roomType: string;
};

const statusStyles: Record<string, string> = {
  Lengkap: "bg-emerald-50/80 text-emerald-800 border border-emerald-200/60",
  "Proses Visa": "bg-amber-50/80 text-amber-800 border border-amber-200/60",
  "Belum Lengkap": "bg-rose-50/80 text-rose-700 border border-rose-200/60",
};

export default function ManifestReportPage() {
  const [rows, setRows] = useState<ParticipantRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetch("/api/manifest/participants")
      .then((res) => res.json())
      .then((json) => setRows((json.data ?? []) as ParticipantRow[]))
      .catch((e) => console.error("Failed loading manifest report:", e))
      .finally(() => setLoading(false));
  }, []);

  const filteredRows = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.customerName.toLowerCase().includes(q) ||
        r.bookingCode.toLowerCase().includes(q) ||
        r.packageName.toLowerCase().includes(q) ||
        r.passportNumber.toLowerCase().includes(q),
    );
  }, [rows, query]);

  const completedCount = useMemo(() => filteredRows.filter((r) => r.documentStatus === "Lengkap").length, [filteredRows]);

  return (
    <AppShell eyebrow="Laporan & Analytics" title="Laporan Manifest Keberangkatan & Verifikasi Imigrasi">
      <div className="space-y-5">
        <ReportNav />

        <section className="rounded-2xl border border-stone-200/70 bg-white p-5 sm:p-6 shadow-2xs">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-brand-cocoa sm:text-2xl">
                Rekapitulasi Manifest Seluruh Jamaah
              </h1>
              <p className="text-xs text-stone-500 mt-1 sm:text-sm">
                Status dokumen paspor, e-visa, dan e-tiket lintas seluruh keberangkatan, ditarik langsung dari data booking.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3.5 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition"
              >
                <Printer className="h-3.5 w-3.5 text-stone-500" strokeWidth={1.5} />
                Cetak PDF
              </button>

              <button
                type="button"
                onClick={() => {
                  const headers = ["Nama Jamaah", "Kode Booking", "Rombongan", "Paket", "No. Paspor", "No. E-Visa", "Exp. Visa", "No. E-Tiket", "Tipe Kamar", "Status Dokumen"];
                  const dataRows = filteredRows.map((r) => [
                    r.name,
                    r.bookingCode,
                    r.customerName,
                    r.packageName,
                    r.passportNumber,
                    r.visaNumber,
                    r.visaExpiry ?? "-",
                    r.ticketNumber,
                    r.roomType,
                    r.documentStatus,
                  ]);
                  exportToCSV("Laporan_Manifest_El_Massa", headers, dataRows);
                }}
                className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-emerald-600 px-4 text-xs font-semibold text-white shadow-2xs hover:bg-emerald-700 transition cursor-pointer"
              >
                <FileSpreadsheet className="h-3.5 w-3.5" strokeWidth={1.5} />
                Export Excel CSV
              </button>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl border border-stone-200/70 bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-stone-500">Total Jamaah Manifest</p>
              <Users className="h-4 w-4 text-brand-pink" strokeWidth={1.5} />
            </div>
            <p className="mt-1 text-xl font-extrabold text-brand-cocoa">{filteredRows.length}</p>
            <p className="mt-1 text-[11px] text-stone-400">Peserta tercatat dari seluruh booking</p>
          </article>

          <article className="rounded-2xl border border-stone-200/70 bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-stone-500">Dokumen Lengkap</p>
              <CheckCircle2 className="h-4 w-4 text-emerald-600" strokeWidth={1.5} />
            </div>
            <p className="mt-1 text-xl font-extrabold text-emerald-700">{completedCount}</p>
            <p className="mt-1 text-[11px] text-stone-400">Paspor, visa & tiket beres</p>
          </article>

          <article className="rounded-2xl border border-stone-200/70 bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-stone-500">Belum Lengkap</p>
              <IdCard className="h-4 w-4 text-amber-600" strokeWidth={1.5} />
            </div>
            <p className="mt-1 text-xl font-extrabold text-amber-700">{Math.max(filteredRows.length - completedCount, 0)}</p>
            <p className="mt-1 text-[11px] text-stone-400">Masih perlu ditindaklanjuti</p>
          </article>
        </section>

        <section className="rounded-2xl border border-stone-200/70 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-stone-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-brand-cocoa">Detail Manifest Per Jamaah</h3>
              <p className="text-xs text-stone-500">Klik menu Manifest untuk melengkapi data paspor, visa, tiket, dan kamar.</p>
            </div>

            <label className="flex h-9 items-center gap-2 rounded-xl border border-stone-200 bg-stone-50/70 px-3 text-xs text-stone-500 w-full sm:w-64">
              <Search className="h-3.5 w-3.5 text-stone-400" strokeWidth={1.5} />
              <input
                className="w-full bg-transparent outline-none text-xs placeholder:text-stone-400"
                placeholder="Cari nama / paspor / booking..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>
          </div>

          <div className="overflow-x-auto rounded-xl border border-stone-200/60">
            <table className="w-full min-w-[1000px] border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-stone-200/60 bg-stone-50/70 font-semibold text-stone-500 text-[11px] uppercase tracking-wider">
                  <th className="py-2.5 pl-3 pr-2">Nama Jamaah</th>
                  <th className="py-2.5 pr-2">Booking / Rombongan</th>
                  <th className="py-2.5 pr-2">Paket</th>
                  <th className="py-2.5 pr-2">No. Paspor</th>
                  <th className="py-2.5 pr-2">E-Visa</th>
                  <th className="py-2.5 pr-2">E-Tiket</th>
                  <th className="py-2.5 pr-2">Kamar</th>
                  <th className="py-2.5 pr-3 text-right">Status Dokumen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-normal">
                {loading && (
                  <tr>
                    <td colSpan={8} className="py-6 text-center text-stone-400">Memuat laporan manifest...</td>
                  </tr>
                )}
                {!loading && filteredRows.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-6 text-center text-stone-400">Belum ada data jamaah.</td>
                  </tr>
                )}
                {filteredRows.map((r) => (
                  <tr key={r.id} className="transition hover:bg-stone-50/60">
                    <td className="py-3 pl-3 pr-2 font-bold text-brand-cocoa whitespace-nowrap">{r.name}</td>
                    <td className="py-3 pr-2 whitespace-nowrap">
                      <span className="font-mono font-semibold text-stone-700">{r.bookingCode}</span>
                      <span className="block text-[10px] text-stone-400">{r.customerName}</span>
                    </td>
                    <td className="py-3 pr-2 text-stone-700 whitespace-nowrap">{r.packageName}</td>
                    <td className="py-3 pr-2 font-mono text-stone-600 whitespace-nowrap">{r.passportNumber || "-"}</td>
                    <td className="py-3 pr-2 font-mono text-stone-600 whitespace-nowrap">{r.visaNumber || "-"}</td>
                    <td className="py-3 pr-2 font-mono text-stone-600 whitespace-nowrap">{r.ticketNumber || "-"}</td>
                    <td className="py-3 pr-2 text-stone-600 whitespace-nowrap">{r.roomType || "-"}</td>
                    <td className="py-3 pr-3 text-right whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${statusStyles[r.documentStatus] ?? ""}`}>
                        {r.documentStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
