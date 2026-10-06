"use client";

import { useRef, useState } from "react";
import { CheckCircle2, CircleDashed, ExternalLink, Loader2, Trash2, Upload } from "lucide-react";
import { DOC_TYPES, MAX_DOC_BYTES, SUPPORTING_DOC_SUBTYPES, docLabel } from "@/lib/jamaah/rules";

/**
 * Daftar 7 dokumen jamaah + upload per jenis. Dipakai form staf dan form
 * pendataan publik; hanya mode "admin" yang bisa membuka & menghapus berkas.
 */

export type DocumentSummary = {
  docType: string;
  docSubtype: string;
  uploadedAt: string;
  fileName?: string;
  uploadedVia?: string;
};

type Props = {
  documents: DocumentSummary[];
  uploadUrl: string;
  mode: "admin" | "public";
  /** Hanya mode admin: URL untuk melihat berkas per jenis. */
  viewUrl?: (docType: string) => string;
  deleteUrl?: (docType: string) => string;
  onChanged: (data: unknown) => void;
};

function formatDate(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}

export function DocumentPanel({ documents, uploadUrl, mode, viewUrl, deleteUrl, onChanged }: Props) {
  const byType = new Map(documents.map((d) => [d.docType, d]));
  const [busy, setBusy] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [subtype, setSubtype] = useState<string>(byType.get("pendukung")?.docSubtype ?? "");
  const inputs = useRef<Record<string, HTMLInputElement | null>>({});

  const upload = async (docType: string, file: File) => {
    setErrors((prev) => ({ ...prev, [docType]: "" }));

    if (file.size > MAX_DOC_BYTES) {
      setErrors((prev) => ({ ...prev, [docType]: "Ukuran berkas maksimal 5 MB" }));
      return;
    }
    if (docType === "pendukung" && !subtype) {
      setErrors((prev) => ({ ...prev, pendukung: "Pilih dulu jenis dokumen pendukungnya" }));
      return;
    }

    const body = new FormData();
    body.set("docType", docType);
    if (docType === "pendukung") body.set("docSubtype", subtype);
    body.set("file", file);

    setBusy(docType);
    try {
      const res = await fetch(uploadUrl, { method: "POST", body });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrors((prev) => ({ ...prev, [docType]: json?.error || (res.status >= 500 ? "Server sedang bermasalah, coba lagi nanti" : "Upload gagal") }));
        return;
      }
      onChanged(json.data);
    } catch {
      setErrors((prev) => ({ ...prev, [docType]: "Koneksi terputus, coba lagi" }));
    } finally {
      setBusy(null);
      const input = inputs.current[docType];
      if (input) input.value = "";
    }
  };

  const remove = async (docType: string) => {
    if (!deleteUrl) return;
    if (!confirm(`Hapus berkas ${docLabel(docType)}?`)) return;
    setBusy(docType);
    try {
      const res = await fetch(deleteUrl(docType), { method: "DELETE" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrors((prev) => ({ ...prev, [docType]: json?.error || "Gagal menghapus" }));
        return;
      }
      onChanged(json.data);
    } finally {
      setBusy(null);
    }
  };

  return (
    <ul className="divide-y divide-stone-100 rounded-2xl border border-stone-200/70 bg-white shadow-2xs">
      {DOC_TYPES.map((doc) => {
        const current = byType.get(doc.id);
        const isBusy = busy === doc.id;

        return (
          <li key={doc.id} className="flex flex-col gap-2 p-3.5 sm:flex-row sm:items-center sm:gap-3">
            <div className="flex min-w-0 flex-1 items-start gap-2.5">
              {current ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              ) : (
                <CircleDashed className="mt-0.5 h-4 w-4 shrink-0 text-stone-300" />
              )}
              <div className="min-w-0">
                <p className="text-xs font-bold text-brand-cocoa">
                  {current ? docLabel(doc.id, current.docSubtype) : doc.label}
                  {doc.requiredFor === "manifest" ? (
                    <span className="ml-1.5 rounded-full bg-stone-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-stone-500">
                      Diurus travel
                    </span>
                  ) : null}
                </p>
                <p className="truncate text-[10px] text-stone-500">
                  {current
                    ? `Diupload ${formatDate(current.uploadedAt)}${
                        current.uploadedVia ? ` · via ${current.uploadedVia === "umrahme" ? "jamaah" : "kantor"}` : ""
                      }${current.fileName ? ` · ${current.fileName}` : ""}`
                    : "Belum diupload"}
                </p>
                {errors[doc.id] ? <p className="text-[10px] font-semibold text-rose-600">{errors[doc.id]}</p> : null}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 pl-6 sm:pl-0">
              {doc.id === "pendukung" ? (
                <select
                  value={subtype}
                  onChange={(e) => setSubtype(e.target.value)}
                  className="h-9 rounded-xl border border-stone-200 bg-stone-50/50 px-2 text-[11px] font-medium text-brand-cocoa outline-none focus:border-brand-pink"
                  aria-label="Jenis dokumen pendukung"
                >
                  <option value="">— Jenis —</option>
                  {SUPPORTING_DOC_SUBTYPES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              ) : null}

              <input
                ref={(el) => {
                  inputs.current[doc.id] = el;
                }}
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) upload(doc.id, file);
                }}
              />
              <button
                type="button"
                disabled={isBusy}
                onClick={() => inputs.current[doc.id]?.click()}
                className={`inline-flex h-9 items-center gap-1.5 rounded-xl px-3 text-[11px] font-bold transition disabled:opacity-50 ${
                  current
                    ? "border border-stone-200 bg-white text-stone-700 hover:bg-stone-50"
                    : "bg-brand-pink text-white hover:bg-brand-pinkHover"
                }`}
              >
                {isBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                {current ? "Ganti" : "Upload"}
              </button>

              {mode === "admin" && current && viewUrl ? (
                <a
                  href={viewUrl(doc.id)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3 text-[11px] font-bold text-stone-700 hover:bg-stone-50 transition"
                >
                  <ExternalLink className="h-3.5 w-3.5" /> Lihat
                </a>
              ) : null}
              {mode === "admin" && current && deleteUrl ? (
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => remove(doc.id)}
                  className="grid h-9 w-9 place-items-center rounded-xl border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 disabled:opacity-50 transition"
                  aria-label={`Hapus ${doc.label}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              ) : null}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
