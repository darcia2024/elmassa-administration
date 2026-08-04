"use client";

import Link from "next/link";

export default function ManifestPrintPage() {
  return (
    <main className="min-h-screen bg-white px-5 py-6 text-stone-900 flex items-center justify-center">
      <section className="mx-auto max-w-md text-center space-y-3">
        <p className="text-xs font-bold uppercase tracking-wide text-stone-500">El Massa Tour & Travel</p>
        <h1 className="text-xl font-bold text-brand-cocoa">Manifest Peserta Segera Hadir</h1>
        <p className="text-sm text-stone-600">
          Cetak manifest butuh data per-jamaah (paspor, e-visa, e-tiket) yang belum pernah ditangkep di sistem
          booking sekarang.
        </p>
        <Link className="inline-block rounded-md border border-stone-300 px-4 py-2 text-sm font-bold text-brand-cocoa" href="/manifest">
          Kembali
        </Link>
      </section>
    </main>
  );
}
