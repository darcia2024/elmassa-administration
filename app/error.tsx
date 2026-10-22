"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw, Home } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application caught error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 p-6 font-sans">
      <div className="max-w-md w-full rounded-3xl border border-stone-200/80 bg-white p-8 text-center shadow-lg space-y-5">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
          <AlertCircle className="h-7 w-7" />
        </div>
        <div>
          <h2 className="text-lg font-black text-brand-cocoa">Halaman Mengalami Kendala</h2>
          <p className="mt-1.5 text-xs text-stone-500">
            {error?.message || "Terjadi kesalahan sistem saat memproses halaman ini."}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-brand-pink px-4 py-2.5 text-xs font-bold text-white hover:bg-brand-pink/90 transition cursor-pointer shadow-xs"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Muat Ulang</span>
          </button>
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-stone-200 bg-stone-100 px-4 py-2.5 text-xs font-bold text-stone-700 hover:bg-stone-200 transition"
          >
            <Home className="h-4 w-4 text-stone-500" />
            <span>Ke Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
