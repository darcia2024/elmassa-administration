"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowLeft, Check, Copy, Link2, Loader2, MessageCircle, Plane, RefreshCw, Save, Trash2 } from "lucide-react";
import { STATUS_STYLES, validateFields, type Companion, type Completeness } from "@/lib/jamaah/rules";
import { DocumentPanel, type DocumentSummary } from "./document-panel";
import { EMPTY_FORM, JamaahFields, type JamaahFormValues } from "./jamaah-fields";

type JamaahRecord = Omit<JamaahFormValues, "birthDate" | "passportIssueDate" | "passportExpiry"> & {
  id: string;
  birthDate: string | null;
  passportIssueDate: string | null;
  passportExpiry: string | null;
  companions: Companion[];
  source: string;
  selfServiceToken: string;
  documents: Array<DocumentSummary & { fileName: string; uploadedVia: string }>;
  departures: Array<{ participantId: string; bookingCode: string; packageId: string; packageName: string; departure: string }>;
  completeness: Completeness;
};

function toForm(r: JamaahRecord): JamaahFormValues {
  return {
    ...EMPTY_FORM,
    ...r,
    birthDate: r.birthDate ?? "",
    passportIssueDate: r.passportIssueDate ?? "",
    passportExpiry: r.passportExpiry ?? "",
    companions: r.companions ?? [],
  };
}

export function JamaahDetail({ jamaahId }: { jamaahId: string | null }) {
  const router = useRouter();
  const [record, setRecord] = useState<JamaahRecord | null>(null);
  const [form, setForm] = useState<JamaahFormValues>(EMPTY_FORM);
  const [storageConfigured, setStorageConfigured] = useState(true);
  const [isLoading, setIsLoading] = useState(Boolean(jamaahId));
  const [loadError, setLoadError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [duplicateId, setDuplicateId] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [savedAt, setSavedAt] = useState(0);
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState("");

  useEffect(() => setOrigin(window.location.origin), []);

  const apply = useCallback((data: JamaahRecord) => {
    setRecord(data);
    setForm(toForm(data));
  }, []);

  useEffect(() => {
    if (!jamaahId) return;
    setIsLoading(true);
    fetch(`/api/jamaah/${encodeURIComponent(jamaahId)}`, { cache: "no-store" })
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || "Gagal memuat profil jamaah");
        apply(json.data);
        setStorageConfigured(Boolean(json.meta?.storageConfigured));
        setLoadError("");
      })
      .catch((err) => setLoadError(err instanceof Error ? err.message : "Gagal memuat profil jamaah"))
      .finally(() => setIsLoading(false));
  }, [jamaahId, apply]);

  const handleSave = async () => {
    setSaveError("");
    setDuplicateId("");

    const errors = validateFields({ ...form, birthDate: form.birthDate || null, passportIssueDate: form.passportIssueDate || null, passportExpiry: form.passportExpiry || null });
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setSaveError(Object.values(errors)[0]);
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch(jamaahId ? `/api/jamaah/${encodeURIComponent(jamaahId)}` : "/api/jamaah", {
        method: jamaahId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          birthDate: form.birthDate || null,
          passportIssueDate: form.passportIssueDate || null,
          passportExpiry: form.passportExpiry || null,
          companions: form.companions.filter((c) => c.name.trim()),
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setFieldErrors(json?.fields ?? {});
        setSaveError(json?.error || "Gagal menyimpan");
        if (json?.duplicateId) setDuplicateId(json.duplicateId);
        return;
      }
      if (!jamaahId) {
        router.replace(`/jamaah/${json.data.id}`);
        return;
      }
      apply(json.data);
      setSavedAt(Date.now());
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Gagal menyimpan");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!record) return;
    if (!confirm(`Hapus profil ${record.fullName} beserta semua dokumennya? Tindakan ini tidak bisa dibatalkan.`)) return;
    const res = await fetch(`/api/jamaah/${encodeURIComponent(record.id)}`, { method: "DELETE" });
    if (res.ok) router.replace("/jamaah");
    else setSaveError((await res.json().catch(() => ({})))?.error || "Gagal menghapus");
  };

  const regenerate = async () => {
    if (!record) return;
    if (!confirm("Buat link baru? Link lama langsung tidak bisa dipakai lagi.")) return;
    const res = await fetch(`/api/jamaah/${encodeURIComponent(record.id)}/token`, { method: "POST" });
    const json = await res.json().catch(() => ({}));
    if (res.ok) setRecord({ ...record, selfServiceToken: json.data.selfServiceToken });
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-stone-200/70 bg-white p-10 text-center shadow-2xs">
        <p className="text-xs font-medium text-stone-500">Memuat profil jamaah…</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="space-y-3 rounded-2xl border border-rose-200 bg-rose-50/60 p-6 text-center">
        <p className="text-xs font-bold text-rose-700">{loadError}</p>
        <Link href="/jamaah" className="text-[11px] font-bold text-brand-pink">
          ← Kembali ke Database Jamaah
        </Link>
      </div>
    );
  }

  const link = record?.selfServiceToken && origin ? `${origin}/pendataan/${record.selfServiceToken}` : "";
  const waPhone = (record?.phone ?? "").replace(/\D/g, "").replace(/^0/, "62");
  const waText = encodeURIComponent(
    `Assalamu'alaikum ${record?.fullName ?? ""}, mohon lengkapi data & dokumen umrah Anda melalui link berikut:\n${link}\n\nTerima kasih — El Massa Tour & Travel`,
  );
  const c = record?.completeness;

  return (
    <div className="space-y-4 font-sans">
      <Link href="/jamaah" className="inline-flex items-center gap-1.5 text-[11px] font-bold text-stone-500 hover:text-brand-pink">
        <ArrowLeft className="h-3.5 w-3.5" /> Database Jamaah
      </Link>

      {c ? (
        <section className="space-y-2 rounded-2xl border border-stone-200/70 bg-white p-4 shadow-2xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="min-w-0">
              <h2 className="truncate text-sm font-extrabold text-brand-cocoa">{record?.fullName}</h2>
              <p className="text-[10px] text-stone-400">{record?.source === "umrahme" ? "Didaftarkan jamaah via UmrahMe" : "Didaftarkan oleh kantor"}</p>
            </div>
            <span className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${STATUS_STYLES[c.status]}`}>{c.status}</span>
          </div>
          {c.missingFields.length > 0 || c.missingDocs.length > 0 || c.warnings.length > 0 ? (
            <ul className="space-y-1 border-t border-stone-100 pt-2 text-[11px]">
              {c.missingFields.length > 0 ? (
                <li className="text-rose-700">
                  <b>Data kurang:</b> {c.missingFields.join(", ")}
                </li>
              ) : null}
              {c.missingDocs.length > 0 ? (
                <li className="text-amber-800">
                  <b>Dokumen belum ada:</b> {c.missingDocs.join(", ")}
                </li>
              ) : null}
              {c.warnings.map((w) => (
                <li key={w} className="flex items-start gap-1 text-amber-800">
                  <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" /> {w}
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="min-w-0 space-y-4">
          <JamaahFields values={form} onChange={setForm} errors={fieldErrors} showNotes />

          <div className="sticky bottom-20 z-10 flex flex-wrap items-center gap-2 rounded-2xl border border-stone-200 bg-white/95 p-3 shadow-soft backdrop-blur md:bottom-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-brand-pink px-5 text-xs font-bold text-white shadow-2xs transition hover:bg-brand-pinkHover disabled:opacity-60"
            >
              {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              {jamaahId ? "Simpan Perubahan" : "Simpan Jamaah"}
            </button>
            {savedAt && !saveError ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                <Check className="h-3.5 w-3.5" /> Tersimpan
              </span>
            ) : null}
            {saveError ? (
              <span className="text-[11px] font-semibold text-rose-700">
                {saveError}
                {duplicateId ? (
                  <>
                    {" "}
                    <Link href={`/jamaah/${duplicateId}`} className="underline">
                      Buka profil itu
                    </Link>
                  </>
                ) : null}
              </span>
            ) : null}
            {record ? (
              <button
                type="button"
                onClick={handleDelete}
                className="ml-auto inline-flex h-10 items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 text-[11px] font-bold text-rose-600 transition hover:bg-rose-100"
              >
                <Trash2 className="h-3.5 w-3.5" /> Hapus
              </button>
            ) : null}
          </div>
        </div>

        <aside className="min-w-0 space-y-4">
          <section className="space-y-2">
            <h3 className="text-xs font-extrabold uppercase tracking-wide text-brand-cocoa">Dokumen</h3>
            {!record ? (
              <p className="rounded-2xl border border-dashed border-stone-300 bg-stone-50/60 p-4 text-center text-[11px] text-stone-500">
                Simpan data jamaah dulu, lalu dokumen bisa diupload.
              </p>
            ) : (
              <>
                {!storageConfigured ? (
                  <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] font-semibold text-amber-800">
                    Penyimpanan dokumen belum disetel di server (SUPABASE_URL & SUPABASE_SERVICE_ROLE_KEY). Upload akan gagal sampai itu diisi.
                  </p>
                ) : null}
                <DocumentPanel
                  mode="admin"
                  documents={record.documents}
                  uploadUrl={`/api/jamaah/${record.id}/documents`}
                  viewUrl={(t) => `/api/jamaah/${record.id}/documents/${t}`}
                  deleteUrl={(t) => `/api/jamaah/${record.id}/documents/${t}`}
                  onChanged={(data) => apply(data as JamaahRecord)}
                />
              </>
            )}
          </section>

          {record ? (
            <section className="space-y-2.5 rounded-2xl border border-stone-200/70 bg-white p-4 shadow-2xs">
              <div>
                <h3 className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wide text-brand-cocoa">
                  <Link2 className="h-3.5 w-3.5 text-brand-pink" /> Link Pendataan Jamaah
                </h3>
                <p className="mt-0.5 text-[11px] text-stone-500">
                  Jamaah bisa melengkapi data & upload dokumen sendiri lewat link ini (juga dari aplikasi UmrahMe). Isinya masuk ke profil ini.
                </p>
              </div>
              <div className="break-all rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 font-mono text-[10px] text-stone-600">{link || "—"}</div>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={async () => {
                    await navigator.clipboard.writeText(link);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1500);
                  }}
                  className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3 text-[11px] font-bold text-stone-700 transition hover:bg-stone-50"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "Tersalin" : "Salin"}
                </button>
                {waPhone ? (
                  <a
                    href={`https://wa.me/${waPhone}?text=${waText}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-emerald-600 px-3 text-[11px] font-bold text-white transition hover:bg-emerald-700"
                  >
                    <MessageCircle className="h-3.5 w-3.5" /> Kirim via WA
                  </a>
                ) : null}
                <button
                  type="button"
                  onClick={regenerate}
                  className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3 text-[11px] font-bold text-stone-500 transition hover:bg-stone-50"
                >
                  <RefreshCw className="h-3.5 w-3.5" /> Ganti Link
                </button>
              </div>
            </section>
          ) : null}

          {record ? (
            <section className="space-y-2 rounded-2xl border border-stone-200/70 bg-white p-4 shadow-2xs">
              <h3 className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wide text-brand-cocoa">
                <Plane className="h-3.5 w-3.5 text-brand-pink" /> Grup Keberangkatan
              </h3>
              {record.departures.length === 0 ? (
                <p className="text-[11px] text-stone-500">
                  Belum tertaut ke grup mana pun. Tautkan dari tab Manifest di halaman grup keberangkatan.
                </p>
              ) : (
                <ul className="space-y-1.5">
                  {record.departures.map((d) => (
                    <li key={d.participantId}>
                      <Link
                        href={`/paket/${encodeURIComponent(d.packageId)}`}
                        className="block rounded-xl border border-stone-200 px-3 py-2 transition hover:border-brand-pink"
                      >
                        <p className="text-xs font-bold text-brand-cocoa">{d.packageName}</p>
                        <p className="text-[10px] text-stone-500">
                          {d.departure} · {d.bookingCode}
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
