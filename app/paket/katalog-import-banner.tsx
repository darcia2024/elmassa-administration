"use client";

import { useEffect, useState } from "react";
import { DownloadCloud, Loader2 } from "lucide-react";

type Status = { total: number; missing: Array<{ id: string; name: string; departureDate: string }> };

/**
 * One-time bridge from the old static katalog: offers to copy its packages
 * (lib/katalog/katalog-seed.json) into Jadwal Keberangkatan. Hidden once they
 * are all in, and it never overwrites a package that already exists.
 */
export function KatalogImportBanner({ onImported }: { onImported?: () => void }) {
  const [status, setStatus] = useState<Status | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const load = () =>
    fetch("/api/packages/import-katalog", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => j?.ok && setStatus(j.data))
      .catch(() => {});

  useEffect(() => {
    void load();
  }, []);

  if (!status || status.missing.length === 0) {
    return message ? <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">{message}</p> : null;
  }

  const runImport = async () => {
    setBusy(true);
    setMessage("");
    try {
      const res = await fetch("/api/packages/import-katalog", { method: "POST" });
      const json = await res.json();
      if (!res.ok || !json?.ok) throw new Error(json?.error || "Impor gagal.");
      setMessage(`${json.data.inserted.length} paket dari katalog lama berhasil masuk ke Jadwal Keberangkatan.`);
      await load();
      onImported?.();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Impor gagal.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-brand-pink/20 bg-brand-pinkSoft px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-extrabold text-brand-cocoa">
          {status.missing.length} paket dari katalog lama belum ada di sistem
        </p>
        <p className="mt-0.5 text-xs text-stone-600">
          {status.missing.map((m) => m.name).slice(0, 3).join(", ")}
          {status.missing.length > 3 ? `, dan ${status.missing.length - 3} lainnya` : ""}. Impor sekali supaya tampil di
          /poster-katalog dan seatnya ikut booking. Paket yang sudah ada tidak diubah.
        </p>
        {message && <p className="mt-1 text-xs font-semibold text-rose-700">{message}</p>}
      </div>
      <button
        type="button"
        onClick={runImport}
        disabled={busy}
        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-brand-pink px-4 py-2.5 text-sm font-bold text-white transition hover:bg-brand-pinkHover disabled:opacity-60"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <DownloadCloud className="h-4 w-4" />}
        Impor paket katalog
      </button>
    </section>
  );
}
