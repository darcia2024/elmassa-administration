"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw, Users, ArrowLeft } from "lucide-react";

export default function JamaahError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Jamaah page caught runtime error:", error);
  }, [error]);

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full rounded-2xl border border-rose-200/80 bg-white p-6 shadow-sm space-y-4">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
          <AlertCircle className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-base font-black text-brand-cocoa">Terjadi Kendala Memuat Rombongan</h2>
          <p className="mt-1 text-xs text-stone-500">
            {error?.message || "Terdapat data yang belum dapat diproses atau parameter URL rombongan tidak sesuai."}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-brand-pink px-4 py-2 text-xs font-bold text-white hover:bg-brand-pink/90 transition cursor-pointer shadow-2xs"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Muat Ulang Halaman</span>
          </button>
          <Link
            href="/jamaah"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-stone-200 bg-stone-50 px-4 py-2 text-xs font-bold text-stone-700 hover:bg-stone-100 transition"
          >
            <Users className="h-3.5 w-3.5 text-stone-500" />
            <span>Tampilkan Semua Rombongan</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
