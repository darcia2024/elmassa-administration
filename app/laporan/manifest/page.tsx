"use client";

import {
  CheckCircle2,
  Download,
  FileSpreadsheet,
  FileText,
  Plane,
  Printer,
  QrCode,
  Search,
  ShieldCheck,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { ReportNav } from "@/components/report-nav";
import { listParticipantsForBooking } from "@/lib/seed-data/bookings";

const statusStyles: Record<string, string> = {
  Lengkap: "bg-emerald-50/80 text-emerald-800 border border-emerald-200/60",
  "Belum Lengkap": "bg-amber-50/80 text-amber-800 border border-amber-200/60",
  Issued: "bg-sky-50/80 text-sky-800 border border-sky-200/60",
};

export default function ManifestReportPage() {
  const [query, setQuery] = useState("");
  const participants = useMemo(() => listParticipantsForBooking("book-001"), []);

  const filteredParticipants = useMemo(() => {
    return participants.filter((p) => {
      const q = query.toLowerCase().trim();
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.passportNumber.toLowerCase().includes(q) ||
        (p.ticketNumber?.toLowerCase().includes(q) ?? false) ||
        (p.visaNumber?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [participants, query]);

  return (
    <AppShell eyebrow="Laporan & Analytics" title="Laporan Manifest Keberangkatan & Verifikasi Imigrasi">
      <div className="space-y-5">
        <ReportNav />

        {/* Header Hero Banner */}
        <section className="rounded-2xl border border-stone-200/70 bg-white p-5 sm:p-6 shadow-2xs">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-brand-cocoa sm:text-2xl">
                Rekapitulasi Manifest Paspor RI & E-Visa Umrah
              </h1>
              <p className="text-xs text-stone-500 mt-1 sm:text-sm">
                Laporan kesiapan penerbangan Garuda GA-980, verifikasi masa berlaku paspor, e-visa Umrah, dan e-boarding pass.
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
                className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-brand-pink px-4 text-xs font-semibold text-white shadow-2xs hover:bg-brand-pinkHover transition"
              >
                <Download className="h-3.5 w-3.5" strokeWidth={1.5} />
                Export Manifest CSV
              </button>
            </div>
          </div>
        </section>

        {/* 📊 KPI Metric Cards Grid */}
        <section className="grid gap-4 md:grid-cols-4">
          <article className="rounded-2xl border border-stone-200/70 bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-stone-500">Total Manifest Jamaah</p>
              <Users className="h-4 w-4 text-brand-pink" strokeWidth={1.5} />
            </div>
            <p className="mt-1 text-2xl font-bold text-brand-cocoa">{participants.length} Jamaah</p>
            <p className="mt-1 text-[11px] text-stone-400">Rombongan Bangka Belitung</p>
          </article>

          <article className="rounded-2xl border border-stone-200/70 bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-stone-500">Paspor RI Valid</p>
              <ShieldCheck className="h-4 w-4 text-emerald-600" strokeWidth={1.5} />
            </div>
            <p className="mt-1 text-2xl font-bold text-emerald-700">{participants.length} Paspor</p>
            <p className="mt-1 text-[11px] text-stone-400">100% Terverifikasi Kanim</p>
          </article>

          <article className="rounded-2xl border border-stone-200/70 bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-stone-500">E-Visa Umrah Issued</p>
              <QrCode className="h-4 w-4 text-sky-600" strokeWidth={1.5} />
            </div>
            <p className="mt-1 text-2xl font-bold text-sky-800">{participants.length} Visa</p>
            <p className="mt-1 text-[11px] text-stone-400">Issued Ministry KSA</p>
          </article>

          <article className="rounded-2xl border border-stone-200/70 bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-stone-500">Penerbangan Garuda</p>
              <Plane className="h-4 w-4 text-brand-pink" strokeWidth={1.5} />
            </div>
            <p className="mt-1 text-2xl font-bold text-brand-cocoa">GA-980 Direct</p>
            <p className="mt-1 text-[11px] text-stone-400">Start 08 Juli 2026</p>
          </article>
        </section>

        {/* Table Card */}
        <section className="rounded-2xl border border-stone-200/70 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-stone-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-brand-cocoa">Rincian Dokumen Verifikasi Imigrasi Jamaah</h3>
              <p className="text-xs text-stone-500">Daftar nama paspor, nomor e-tiket Garuda GA-980, dan status e-visa Umrah.</p>
            </div>

            <div className="flex items-center gap-2">
              <label className="flex h-9 items-center gap-2 rounded-xl border border-stone-200 bg-stone-50/70 px-3 text-xs text-stone-500 w-full sm:w-64">
                <Search className="h-3.5 w-3.5 text-stone-400" strokeWidth={1.5} />
                <input
                  className="w-full bg-transparent outline-none text-xs placeholder:text-stone-400"
                  placeholder="Cari paspor, visa, nama..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </label>

              <Link
                href="/manifest"
                className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-brand-pink/20 bg-rose-50 px-3 text-xs font-semibold text-brand-pink hover:bg-brand-pink hover:text-white transition shrink-0"
              >
                <span>Buka Operasional</span>
              </Link>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-stone-200/60">
            <table className="w-full min-w-[900px] border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-stone-200/60 bg-stone-50/70 font-semibold text-stone-500 text-[11px] uppercase tracking-wider">
                  <th className="py-2.5 pl-3 pr-2">No #</th>
                  <th className="py-2.5 pr-2">Nama Jamaah Paspor</th>
                  <th className="py-2.5 pr-2">No. Paspor RI</th>
                  <th className="py-2.5 pr-2">E-Tiket Garuda GA-980</th>
                  <th className="py-2.5 pr-2">E-Visa Umrah KSA</th>
                  <th className="py-2.5 pr-2">Domisili Kota</th>
                  <th className="py-2.5 pr-3 text-right">Status Verifikasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-normal">
                {filteredParticipants.map((p, index) => (
                  <tr key={p.id} className="transition hover:bg-stone-50/60">
                    <td className="py-3 pl-3 pr-2 font-mono text-stone-400 text-[11px]">#{String(index + 1).padStart(2, "0")}</td>
                    <td className="py-3 pr-2 font-semibold text-brand-cocoa whitespace-nowrap">{p.name}</td>
                    <td className="py-3 pr-2 font-mono font-bold text-stone-800 whitespace-nowrap">{p.passportNumber}</td>
                    <td className="py-3 pr-2 font-mono text-sky-800 font-medium whitespace-nowrap">{p.ticketNumber}</td>
                    <td className="py-3 pr-2 font-mono text-emerald-800 font-medium whitespace-nowrap">{p.visaNumber}</td>
                    <td className="py-3 pr-2 font-medium text-stone-600 whitespace-nowrap">{p.city}</td>
                    <td className="py-3 pr-3 text-right whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200/60 bg-emerald-50/80 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800">
                        <CheckCircle2 className="h-3 w-3 text-emerald-600" strokeWidth={1.5} />
                        Verified Complete
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
