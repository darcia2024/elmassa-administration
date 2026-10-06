"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Check, Loader2, Save } from "lucide-react";
import { STATUS_STYLES, validateFields, type Companion, type Completeness } from "@/lib/jamaah/rules";
import { DocumentPanel } from "@/app/jamaah/document-panel";
import { EMPTY_FORM, JamaahFields, type JamaahFormValues } from "@/app/jamaah/jamaah-fields";

/**
 * Form pendataan mandiri jamaah. Tidak memakai AppShell (tanpa login staf).
 * Data sensitif yang sudah tersimpan tidak pernah dikirim ke sini -- lihat
 * lib/jamaah/public-view.ts -- jadi kolomnya tampil kosong dengan keterangan
 * "sudah terisi", dan kolom yang dibiarkan kosong tidak mengubah apa pun.
 */

type PublicView = {
  fullName: string;
  passportName: string;
  fatherName: string;
  gender: string;
  birthPlace: string;
  passportIssuePlace: string;
  province: string;
  regency: string;
  maritalStatus: string;
  education: string;
  occupation: string;
  emergencyName: string;
  emergencyRelation: string;
  companions: Companion[];
  masked: { nik: string; passportNumber: string; phone: string; emergencyPhone: string };
  filled: { birthDate: boolean; passportIssueDate: boolean; passportExpiry: boolean; address: boolean; district: boolean; village: boolean };
  documents: Array<{ docType: string; docSubtype: string; uploadedAt: string }>;
  completeness: Completeness;
};

const SERVER_DOWN = "Server sedang bermasalah. Coba lagi beberapa saat lagi, atau hubungi kantor El Massa.";

/** Respons 5xx bisa datang tanpa body JSON; jangan tampilkan pesan parser ke jamaah. */
async function readJson(res: Response) {
  const json = await res.json().catch(() => null);
  if (!json && res.status >= 500) throw new Error(SERVER_DOWN);
  return json ?? {};
}

function toForm(v: PublicView): JamaahFormValues {
  return {
    ...EMPTY_FORM,
    fullName: v.fullName,
    passportName: v.passportName,
    fatherName: v.fatherName,
    gender: v.gender,
    birthPlace: v.birthPlace,
    passportIssuePlace: v.passportIssuePlace,
    province: v.province,
    regency: v.regency,
    maritalStatus: v.maritalStatus,
    education: v.education,
    occupation: v.occupation,
    emergencyName: v.emergencyName,
    emergencyRelation: v.emergencyRelation,
    companions: v.companions,
  };
}

function hintsFor(v: PublicView) {
  return {
    nik: v.masked.nik,
    passportNumber: v.masked.passportNumber,
    phone: v.masked.phone,
    emergencyPhone: v.masked.emergencyPhone,
    birthDate: v.filled.birthDate ? "✓" : "",
    passportIssueDate: v.filled.passportIssueDate ? "✓" : "",
    passportExpiry: v.filled.passportExpiry ? "✓" : "",
    address: v.filled.address ? "✓" : "",
    district: v.filled.district ? "✓" : "",
    village: v.filled.village ? "✓" : "",
  };
}

/** Tombol kembali ke UmrahMe. `returnUrl` sudah divalidasi server (lihat safeReturnUrl). */
function TombolKembali({ href, variant }: { href: string; variant: "solid" | "outline" }) {
  return (
    <a
      href={href}
      className={`inline-flex h-11 items-center justify-center gap-1.5 rounded-xl px-5 text-sm font-bold transition ${
        variant === "solid"
          ? "w-full bg-emerald-600 text-white hover:bg-emerald-700"
          : "flex-1 border border-stone-200 bg-white text-stone-700 hover:bg-stone-50 sm:flex-none"
      }`}
    >
      <ArrowLeft className="h-4 w-4" />
      Kembali ke Dashboard
    </a>
  );
}

export function PendataanForm({ token, returnUrl }: { token: string; returnUrl: string | null }) {
  const [view, setView] = useState<PublicView | null>(null);
  const [form, setForm] = useState<JamaahFormValues>(EMPTY_FORM);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const [uploaded, setUploaded] = useState(false);

  const api = `/api/pendataan/${encodeURIComponent(token)}`;

  const apply = useCallback((v: PublicView) => {
    setView(v);
    setForm(toForm(v));
  }, []);

  useEffect(() => {
    fetch(api, { cache: "no-store" })
      .then(async (res) => {
        const json = await readJson(res);
        if (!res.ok) throw new Error(json?.error || "Link tidak valid");
        apply(json.data);
      })
      .catch((err) => setLoadError(err instanceof Error && err.message !== "Failed to fetch" ? err.message : SERVER_DOWN))
      .finally(() => setIsLoading(false));
  }, [api, apply]);

  const handleSave = async () => {
    setSaveError("");
    setSaved(false);

    const payload = {
      ...form,
      birthDate: form.birthDate || null,
      passportIssueDate: form.passportIssueDate || null,
      passportExpiry: form.passportExpiry || null,
      companions: form.companions.filter((c) => c.name.trim()),
    };
    const errors = validateFields(payload);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setSaveError(Object.values(errors)[0]);
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch(api, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await readJson(res);
      if (!res.ok) {
        setFieldErrors(json?.fields ?? {});
        setSaveError(json?.error || "Gagal menyimpan");
        return;
      }
      apply(json.data);
      setSaved(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setSaveError(err instanceof Error && err.message === SERVER_DOWN ? SERVER_DOWN : "Koneksi terputus, coba lagi");
    } finally {
      setIsSaving(false);
    }
  };

  const c = view?.completeness;

  return (
    <main className="min-h-screen bg-brand-cream pb-28 font-sans">
      <header className="bg-brand-pink px-4 pb-10 pt-6 text-white">
        <div className="mx-auto max-w-3xl">
          {returnUrl ? (
            <a href={returnUrl} className="mb-3 inline-flex items-center gap-1 text-[11px] font-bold text-white/85 hover:text-white">
              <ArrowLeft className="h-3.5 w-3.5" /> Kembali ke UmrahMe
            </a>
          ) : null}
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/80">El Massa Tour & Travel</p>
          <h1 className="mt-1 text-xl font-black">Pendataan Jamaah Umrah</h1>
          <p className="mt-1 text-xs text-white/85">Lengkapi data diri dan upload dokumen. Data tersimpan langsung ke kantor El Massa.</p>
        </div>
      </header>

      <div className="mx-auto -mt-6 max-w-3xl space-y-4 px-4">
        {isLoading ? (
          <div className="rounded-2xl border border-stone-200/70 bg-white p-10 text-center shadow-2xs">
            <p className="text-xs font-medium text-stone-500">Memuat data…</p>
          </div>
        ) : loadError ? (
          <div className="rounded-2xl border border-rose-200 bg-white p-6 text-center shadow-2xs">
            <p className="text-sm font-bold text-rose-700">{loadError}</p>
          </div>
        ) : view && c ? (
          <>
            <section className="space-y-2 rounded-2xl border border-stone-200/70 bg-white p-4 shadow-2xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-extrabold text-brand-cocoa">Assalamu&apos;alaikum, {view.fullName}</p>
                <span className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${STATUS_STYLES[c.status]}`}>{c.status}</span>
              </div>
              {saved ? (
                <div className="space-y-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                  <p className="flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                    <Check className="h-3.5 w-3.5" /> Data berhasil disimpan. Terima kasih!
                  </p>
                  {returnUrl ? <TombolKembali href={returnUrl} variant="solid" /> : null}
                </div>
              ) : null}
              {c.missingFields.length > 0 ? (
                <p className="text-[11px] text-rose-700">
                  <b>Masih perlu diisi:</b> {c.missingFields.join(", ")}
                </p>
              ) : null}
              {c.missingDocs.length > 0 ? (
                <p className="text-[11px] text-amber-800">
                  <b>Dokumen belum ada:</b> {c.missingDocs.join(", ")}
                </p>
              ) : null}
              <p className="text-[10px] text-stone-400">
                Demi keamanan, NIK, paspor, dan nomor HP yang sudah tersimpan tidak ditampilkan. Kosongkan kolomnya kalau tidak ingin mengubah.
              </p>
            </section>

            <JamaahFields values={form} onChange={setForm} errors={fieldErrors} storedHints={hintsFor(view)} />

            <section className="space-y-2">
              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-wide text-brand-cocoa">Upload Dokumen</h3>
                <p className="text-[11px] text-stone-500">Foto atau scan yang jelas, format JPG/PNG/PDF, maksimal 5 MB per berkas.</p>
              </div>
              <DocumentPanel
                mode="public"
                documents={view.documents}
                uploadUrl={`${api}/documents`}
                onChanged={(data) => {
                  setView(data as PublicView);
                  setUploaded(true);
                }}
              />
              {uploaded ? (
                <div className="space-y-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                  <p className="flex items-center gap-1 text-xs font-bold text-emerald-800">
                    <Check className="h-4 w-4" /> Dokumen terkirim ke kantor El Massa.
                  </p>
                  <p className="text-[11px] text-emerald-800/80">
                    Masih ada yang mau diupload? Lanjutkan saja. Kalau sudah, kembali ke dashboard UmrahMe kamu.
                  </p>
                  {returnUrl ? <TombolKembali href={returnUrl} variant="solid" /> : null}
                </div>
              ) : null}
            </section>
          </>
        ) : null}
      </div>

      {view ? (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-stone-200 bg-white/95 px-4 py-3 backdrop-blur">
          <div className="mx-auto flex max-w-3xl flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl bg-brand-pink px-5 text-sm font-bold text-white shadow-2xs transition hover:bg-brand-pinkHover disabled:opacity-60 sm:flex-none"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Simpan Data
            </button>
            {returnUrl ? <TombolKembali href={returnUrl} variant="outline" /> : null}
            {saveError ? <span className="w-full text-[11px] font-semibold text-rose-700 sm:w-auto">{saveError}</span> : null}
          </div>
        </div>
      ) : null}
    </main>
  );
}
