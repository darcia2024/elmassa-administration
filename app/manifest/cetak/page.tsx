"use client";

import { Printer } from "lucide-react";
import Link from "next/link";

const manifestRows = [
  {
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

export default function ManifestPrintPage() {
  const completeDocuments = manifestRows.filter((row) => row.documentStatus === "Lengkap").length;
  const pendingDocuments = manifestRows.length - completeDocuments;

  return (
    <main className="min-h-screen bg-white px-5 py-6 text-stone-900 print:p-0">
      <section className="mx-auto max-w-7xl">
        <div className="mb-5 flex items-start justify-between gap-4 border-b border-stone-300 pb-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-stone-500">El Massa Tour & Travel</p>
            <h1 className="mt-1 text-2xl font-bold text-brand-cocoa">Manifest Peserta</h1>
            <p className="mt-1 text-sm text-stone-600">Semua jadwal keberangkatan aktif</p>
          </div>
          <div className="text-right text-xs leading-5 text-stone-600">
            <p>Bekasi</p>
            <p>Dicetak: 25 Jul 2026</p>
            <p>Total peserta: {manifestRows.length}</p>
          </div>
        </div>

        <div className="print-hidden mb-5 flex justify-between gap-3">
          <Link className="rounded-md border border-stone-300 px-4 py-2 text-sm font-bold text-brand-cocoa" href="/manifest">
            Kembali
          </Link>
          <button
            className="inline-flex items-center gap-2 rounded-md bg-brand-cocoa px-4 py-2 text-sm font-bold text-white"
            type="button"
            onClick={() => window.print()}
          >
            <Printer className="h-4 w-4" aria-hidden="true" />
            Cetak dari browser
          </button>
        </div>

        <div className="mb-4 grid grid-cols-3 gap-3 text-sm">
          <div className="border border-stone-300 p-3">
            <p className="text-xs uppercase text-stone-500">Total Baris</p>
            <p className="mt-1 text-lg font-bold">{manifestRows.length} peserta</p>
          </div>
          <div className="border border-stone-300 p-3">
            <p className="text-xs uppercase text-stone-500">Dokumen Lengkap</p>
            <p className="mt-1 text-lg font-bold">{completeDocuments}</p>
          </div>
          <div className="border border-stone-300 p-3">
            <p className="text-xs uppercase text-stone-500">Belum Lengkap</p>
            <p className="mt-1 text-lg font-bold">{pendingDocuments}</p>
          </div>
        </div>

        <table className="manifest-print-table w-full border-collapse text-left text-xs">
          <thead className="bg-stone-100">
            <tr>
              <th className="border border-stone-300 p-2">No.</th>
              <th className="border border-stone-300 p-2">Peserta</th>
              <th className="border border-stone-300 p-2">Booking</th>
              <th className="border border-stone-300 p-2">Pelanggan</th>
              <th className="border border-stone-300 p-2">Paket</th>
              <th className="border border-stone-300 p-2">Berangkat</th>
              <th className="border border-stone-300 p-2">Paspor</th>
              <th className="border border-stone-300 p-2">Kontak</th>
              <th className="border border-stone-300 p-2">Kamar</th>
              <th className="border border-stone-300 p-2">Dokumen</th>
              <th className="border border-stone-300 p-2">Pembayaran</th>
            </tr>
          </thead>
          <tbody>
            {manifestRows.map((row, index) => (
              <tr key={`${row.bookingCode}-${row.participantName}`}>
                <td className="border border-stone-300 p-2">{index + 1}</td>
                <td className="border border-stone-300 p-2 font-bold">{row.participantName}</td>
                <td className="border border-stone-300 p-2">{row.bookingCode}</td>
                <td className="border border-stone-300 p-2">{row.customerName}</td>
                <td className="border border-stone-300 p-2">{row.packageName}</td>
                <td className="border border-stone-300 p-2">{row.departureDate}</td>
                <td className="border border-stone-300 p-2">{row.passportNumber}</td>
                <td className="border border-stone-300 p-2">{row.phone}</td>
                <td className="border border-stone-300 p-2">{row.roomType}</td>
                <td className="border border-stone-300 p-2">{row.documentStatus}</td>
                <td className="border border-stone-300 p-2">{row.paymentStatus}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-stone-100 font-bold">
            <tr>
              <td className="border border-stone-300 p-2" colSpan={4}>
                Total: {manifestRows.length} peserta
              </td>
              <td className="border border-stone-300 p-2" colSpan={4}>
                Dokumen: {completeDocuments} lengkap, {pendingDocuments} belum lengkap
              </td>
              <td className="border border-stone-300 p-2" colSpan={3}>
                Paraf admin:
              </td>
            </tr>
          </tfoot>
        </table>
      </section>
    </main>
  );
}
