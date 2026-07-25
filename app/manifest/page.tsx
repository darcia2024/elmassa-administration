"use client";

import { AlertCircle, CheckCircle2, Download, FileText, Filter, Printer, Search, Users } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";

const scheduleOptions = [
  { id: "all", label: "Semua jadwal" },
];

const manifestRows = [
  {
    id: "MNF-001",
    scheduleId: "dep-umr-20260812",
    bookingCode: "BK-2407-018",
    participantName: "Siti Rahma",
    customerName: "Siti Rahma",
    packageName: "Umrah Reguler 12 Hari",
    departureDate: "12 Agu 2026",
    passportNumber: "C1234567",
    phone: "0812-4455-7788",
    documentStatus: "Lengkap",
    paymentStatus: "DP",
    roomType: "Double",
  },
];

const documentStatusStyles: Record<string, string> = {
  Lengkap: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  "Belum Lengkap": "bg-amber-50 text-amber-700 ring-amber-200",
};

const paymentStatusStyles: Record<string, string> = {
  Lunas: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  DP: "bg-amber-50 text-amber-700 ring-amber-200",
  "Belum Bayar": "bg-rose-50 text-rose-700 ring-rose-200",
};

export default function ManifestPage() {
  const [selectedScheduleId, setSelectedScheduleId] = useState("all");
  const filteredRows = useMemo(
    () =>
      selectedScheduleId === "all"
        ? manifestRows
        : manifestRows.filter((row) => row.scheduleId === selectedScheduleId),
    [selectedScheduleId],
  );
  const selectedSchedule = scheduleOptions.find((item) => item.id === selectedScheduleId);
  const completeDocuments = filteredRows.filter((row) => row.documentStatus === "Lengkap").length;
  const pendingDocuments = filteredRows.length - completeDocuments;
  const uniqueBookings = new Set(filteredRows.map((row) => row.bookingCode)).size;
  const paidRows = filteredRows.filter((row) => row.paymentStatus === "Lunas").length;
  const unpaidRows = filteredRows.filter((row) => row.paymentStatus === "Belum Bayar").length;
  const dpRows = filteredRows.filter((row) => row.paymentStatus === "DP").length;

  return (
    <AppShell eyebrow="Operasional Dokumen" title="Manifest Peserta">
      <section className="print-hidden grid gap-4 md:grid-cols-4">
        <article className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-stone-500">Total Peserta</p>
            <Users className="h-5 w-5 text-brand-brown" aria-hidden="true" />
          </div>
          <p className="mt-3 text-2xl font-bold text-brand-cocoa">{filteredRows.length}</p>
          <p className="mt-2 text-sm text-stone-500">{selectedSchedule?.label ?? "Manifest aktif"}</p>
        </article>
        <article className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-stone-500">Booking</p>
            <FileText className="h-5 w-5 text-brand-brown" aria-hidden="true" />
          </div>
          <p className="mt-3 text-2xl font-bold text-brand-cocoa">{uniqueBookings}</p>
          <p className="mt-2 text-sm text-stone-500">Kode booking terkait</p>
        </article>
        <article className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-stone-500">Dokumen Lengkap</p>
            <CheckCircle2 className="h-5 w-5 text-emerald-600" aria-hidden="true" />
          </div>
          <p className="mt-3 text-2xl font-bold text-brand-cocoa">{completeDocuments}</p>
          <p className="mt-2 text-sm text-stone-500">Siap manifest final</p>
        </article>
        <article className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-stone-500">Perlu Follow-up</p>
            <AlertCircle className="h-5 w-5 text-amber-600" aria-hidden="true" />
          </div>
          <p className="mt-3 text-2xl font-bold text-brand-cocoa">{pendingDocuments}</p>
          <p className="mt-2 text-sm text-stone-500">Dokumen belum lengkap</p>
        </article>
      </section>

      <section className="print-area rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
        <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h3 className="text-lg font-bold text-brand-cocoa">Daftar Manifest</h3>
            <p className="mt-1 text-sm text-stone-500">Data dummy peserta dari booking aktif untuk kebutuhan dokumen perjalanan.</p>
          </div>
          <div className="print-hidden flex flex-col gap-3 sm:flex-row">
            <label className="flex h-10 min-w-0 items-center gap-2 rounded-md border border-stone-200 bg-white px-3 text-sm font-semibold text-brand-cocoa sm:w-80">
              Jadwal
              <select
                className="min-w-0 flex-1 bg-transparent text-sm font-medium text-stone-600 outline-none"
                value={selectedScheduleId}
                onChange={(event) => setSelectedScheduleId(event.target.value)}
              >
                {scheduleOptions.map((schedule) => (
                  <option key={schedule.id} value={schedule.id}>
                    {schedule.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex h-10 min-w-0 items-center gap-2 rounded-md border border-stone-200 bg-white px-3 text-sm text-stone-500 sm:w-64">
              <Search className="h-4 w-4 shrink-0" aria-hidden="true" />
              <input className="min-w-0 flex-1 bg-transparent outline-none" placeholder="Cari peserta atau booking" />
            </label>
            <button className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-stone-200 bg-white px-4 text-sm font-bold text-brand-cocoa" type="button">
              <Filter className="h-4 w-4" aria-hidden="true" />
              Filter
            </button>
            <button className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-brand-cocoa px-4 text-sm font-bold text-white" type="button">
              <Download className="h-4 w-4" aria-hidden="true" />
              Export
            </button>
            <button
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-brand-pink px-4 text-sm font-bold text-white"
              type="button"
              onClick={() => window.print()}
            >
              <Printer className="h-4 w-4" aria-hidden="true" />
              Cetak
            </button>
            <Link
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-brand-pink bg-white px-4 text-sm font-bold text-brand-pink"
              href="/manifest/cetak"
            >
              <FileText className="h-4 w-4" aria-hidden="true" />
              Layout cetak
            </Link>
          </div>
        </div>

        <div className="print-only mb-4 hidden">
          <p className="text-xs font-bold uppercase text-stone-500">El Massa Tour & Travel</p>
          <h1 className="mt-1 text-xl font-bold text-brand-cocoa">Manifest Peserta</h1>
          <p className="mt-1 text-sm text-stone-600">{selectedSchedule?.label ?? "Semua jadwal"}</p>
        </div>

        <div className="manifest-table-wrap overflow-x-auto rounded-lg border border-stone-200">
          <table className="manifest-print-table w-full min-w-[1120px] border-collapse text-left text-sm">
            <thead className="bg-brand-cream text-xs uppercase text-stone-500">
              <tr>
                <th className="px-4 py-3 font-bold">Peserta</th>
                <th className="px-4 py-3 font-bold">Booking</th>
                <th className="px-4 py-3 font-bold">Pelanggan</th>
                <th className="px-4 py-3 font-bold">Paket</th>
                <th className="px-4 py-3 font-bold">Berangkat</th>
                <th className="px-4 py-3 font-bold">Paspor</th>
                <th className="px-4 py-3 font-bold">Kontak</th>
                <th className="px-4 py-3 font-bold">Kamar</th>
                <th className="px-4 py-3 font-bold">Dokumen</th>
                <th className="px-4 py-3 font-bold">Pembayaran</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 bg-white">
              {filteredRows.map((row) => (
                <tr key={row.id} className="text-stone-700 hover:bg-brand-cream">
                  <td className="px-4 py-4 font-bold text-brand-cocoa">{row.participantName}</td>
                  <td className="px-4 py-4">
                    <Link className="font-bold text-brand-cocoa hover:text-brand-pink" href={`/booking/${row.bookingCode}`}>
                      {row.bookingCode}
                    </Link>
                  </td>
                  <td className="px-4 py-4">{row.customerName}</td>
                  <td className="px-4 py-4">{row.packageName}</td>
                  <td className="px-4 py-4 font-semibold">{row.departureDate}</td>
                  <td className="px-4 py-4">{row.passportNumber}</td>
                  <td className="px-4 py-4">{row.phone}</td>
                  <td className="px-4 py-4">{row.roomType}</td>
                  <td className="px-4 py-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${documentStatusStyles[row.documentStatus]}`}>
                      {row.documentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${paymentStatusStyles[row.paymentStatus]}`}>
                      {row.paymentStatus}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredRows.length === 0 ? (
                <tr>
                  <td className="px-4 py-8 text-center text-sm font-semibold text-stone-500" colSpan={10}>
                    Tidak ada peserta pada jadwal ini.
                  </td>
                </tr>
              ) : null}
            </tbody>
            <tfoot className="border-t border-stone-200 bg-brand-cream text-sm font-bold text-brand-cocoa">
              <tr>
                <td className="px-4 py-4" colSpan={2}>
                  Total baris: {filteredRows.length} peserta
                </td>
                <td className="px-4 py-4" colSpan={2}>
                  {uniqueBookings} booking
                </td>
                <td className="px-4 py-4" colSpan={2}>
                  Dokumen: {completeDocuments} lengkap, {pendingDocuments} belum
                </td>
                <td className="px-4 py-4" colSpan={4}>
                  Pembayaran: {paidRows} lunas, {dpRows} DP, {unpaidRows} belum bayar
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      <section className="print-hidden grid gap-4 lg:grid-cols-3">
        {["Umrah Reguler 12 Hari", "Umrah Plus Thaif", "Tour Turki Keluarga"].map((packageName) => {
          const rows = filteredRows.filter((row) => row.packageName === packageName);

          return (
            <article key={packageName} className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
              <p className="text-sm font-semibold text-stone-500">Manifest Paket</p>
              <h4 className="mt-2 font-bold text-brand-cocoa">{packageName}</h4>
              <div className="mt-4 flex items-center justify-between gap-3 rounded-lg bg-brand-cream px-4 py-3">
                <span className="text-sm text-stone-500">Peserta</span>
                <span className="text-lg font-bold text-brand-cocoa">{rows.length}</span>
              </div>
            </article>
          );
        })}
      </section>
    </AppShell>
  );
}
