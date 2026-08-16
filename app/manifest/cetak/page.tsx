"use client";

import { ArrowLeft, Printer } from "lucide-react";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { formatDateID } from "@/lib/format/date";

type Participant = {
  id: string;
  name: string;
  passportNumber: string;
  contact: string;
  documentStatus: string;
  visaNumber: string;
  visaExpiry: string | null;
  ticketNumber: string;
  roomType: string;
};

type DepartureMeta = {
  id: string;
  name: string;
  departureDate: string;
  returnDate: string;
  targetPax: number;
  bookedSeats: number;
  remainingSeats: number;
};

function ManifestPrintContent() {
  const searchParams = useSearchParams();
  const packageId = searchParams.get("packageId");

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [departure, setDeparture] = useState<DepartureMeta | null>(null);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error" | "missing">(
    packageId ? "loading" : "missing",
  );

  useEffect(() => {
    if (!packageId) return;
    fetch(`/api/manifest/departures/${encodeURIComponent(packageId)}/participants`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Keberangkatan tidak ditemukan");
        return res.json();
      })
      .then((json) => {
        setParticipants((json.data ?? []) as Participant[]);
        setDeparture(json.meta?.departure ?? null);
        setLoadState("ready");
      })
      .catch(() => setLoadState("error"));
  }, [packageId]);

  if (loadState === "missing" || loadState === "error") {
    return (
      <main className="min-h-screen bg-white px-5 py-6 text-stone-900 flex items-center justify-center">
        <section className="mx-auto max-w-md text-center space-y-3">
          <p className="text-xs font-bold uppercase tracking-wide text-stone-500">El Massa Tour & Travel</p>
          <h1 className="text-xl font-bold text-brand-cocoa">
            {loadState === "missing" ? "Pilih Keberangkatan Dulu" : "Keberangkatan Tidak Ditemukan"}
          </h1>
          <p className="text-sm text-stone-600">
            Buka manifest lewat halaman Manifest, pilih keberangkatan, lalu klik Cetak Manifest.
          </p>
          <Link className="inline-block rounded-md border border-stone-300 px-4 py-2 text-sm font-bold text-brand-cocoa" href="/manifest">
            Kembali
          </Link>
        </section>
      </main>
    );
  }

  if (loadState === "loading" || !departure) {
    return (
      <main className="min-h-screen bg-white px-5 py-6 text-stone-900 flex items-center justify-center">
        <p className="text-sm text-stone-500">Memuat manifest...</p>
      </main>
    );
  }

  const completed = participants.filter((p) => p.documentStatus === "Lengkap").length;

  return (
    <main className="min-h-screen bg-white px-4 py-6 sm:px-8 text-stone-900">
      <div className="mx-auto max-w-5xl space-y-5">
        <div className="print-hidden flex items-center justify-between">
          <Link href="/manifest" className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-brand-pink transition">
            <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
            <span>Kembali ke Manifest</span>
          </Link>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-stone-900 px-4 text-xs font-semibold text-white shadow-2xs hover:bg-black transition"
          >
            <Printer className="h-4 w-4" strokeWidth={1.5} />
            <span>Cetak Manifest</span>
          </button>
        </div>

        <section className="rounded-xl border border-stone-300 bg-white p-6 sm:p-10 text-stone-900 space-y-6">
          <div className="w-full pb-2 border-b border-stone-800">
            <img
              src="/kop-surat-el-massa.png"
              alt="Kop Surat Resmi PT Al Massa Azka Wisata"
              className="w-full max-w-full h-auto object-contain block mx-auto rounded-none"
            />
          </div>

          <div className="text-center space-y-1">
            <h1 className="text-2xl font-black uppercase tracking-tight text-stone-950">Manifest Peserta Umrah</h1>
            <p className="text-sm font-semibold text-stone-700">{departure.name}</p>
            <p className="text-xs text-stone-500">
              Berangkat {formatDateID(departure.departureDate, "-")} -- Kembali {formatDateID(departure.returnDate, "-")}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center text-xs">
            <div className="rounded-sm border border-stone-800 py-2">
              <p className="font-black text-lg text-stone-950">{participants.length}</p>
              <p className="text-stone-500 font-semibold uppercase text-[10px]">Total Jamaah</p>
            </div>
            <div className="rounded-sm border border-stone-800 py-2">
              <p className="font-black text-lg text-emerald-700">{completed}</p>
              <p className="text-stone-500 font-semibold uppercase text-[10px]">Dokumen Lengkap</p>
            </div>
            <div className="rounded-sm border border-stone-800 py-2">
              <p className="font-black text-lg text-stone-950">{departure.targetPax}</p>
              <p className="text-stone-500 font-semibold uppercase text-[10px]">Kuota Seat</p>
            </div>
          </div>

          <div className="overflow-hidden border border-stone-800 rounded-sm">
            <table className="w-full border-collapse text-left text-[11px] divide-y divide-stone-800">
              <thead className="bg-[#e9ebe4] font-bold text-stone-900 border-b border-stone-800">
                <tr>
                  <th className="p-2 border-r border-stone-800 w-8">No</th>
                  <th className="p-2 border-r border-stone-800">Nama Lengkap</th>
                  <th className="p-2 border-r border-stone-800">No. Paspor</th>
                  <th className="p-2 border-r border-stone-800">No. E-Visa</th>
                  <th className="p-2 border-r border-stone-800">Exp. Visa</th>
                  <th className="p-2 border-r border-stone-800">No. E-Tiket</th>
                  <th className="p-2 border-r border-stone-800">Kamar</th>
                  <th className="p-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800 font-medium">
                {participants.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-4 text-center text-stone-500">Belum ada jamaah terdaftar.</td>
                  </tr>
                ) : (
                  participants.map((p, idx) => (
                    <tr key={p.id}>
                      <td className="p-2 border-r border-stone-800 text-center">{idx + 1}</td>
                      <td className="p-2 border-r border-stone-800 font-bold text-stone-950">{p.name}</td>
                      <td className="p-2 border-r border-stone-800 font-mono">{p.passportNumber || "-"}</td>
                      <td className="p-2 border-r border-stone-800 font-mono">{p.visaNumber || "-"}</td>
                      <td className="p-2 border-r border-stone-800">{p.visaExpiry || "-"}</td>
                      <td className="p-2 border-r border-stone-800 font-mono">{p.ticketNumber || "-"}</td>
                      <td className="p-2 border-r border-stone-800">{p.roomType || "-"}</td>
                      <td className="p-2 font-semibold">{p.documentStatus}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-2 gap-6 pt-6 text-xs">
            <div />
            <div className="text-center space-y-12">
              <p className="text-stone-600">
                Pangkalan, {new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })}
              </p>
              <div className="space-y-1">
                <p className="font-bold text-stone-950 border-t border-stone-800 pt-1 inline-block px-8">
                  Penanggung Jawab Keberangkatan
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default function ManifestPrintPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-white" />}>
      <ManifestPrintContent />
    </Suspense>
  );
}
