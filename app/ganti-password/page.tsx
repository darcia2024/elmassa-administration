"use client";

import { CheckCircle2, KeyRound, LockKeyhole, ShieldAlert, ShieldCheck, XCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";

const requirements = [
  { key: "length", label: "Minimal 8 karakter" },
  { key: "number", label: "Mengandung angka" },
  { key: "letter", label: "Mengandung huruf" },
  { key: "different", label: "Berbeda dari password lama" },
];

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const checks = useMemo(
    () => ({
      different: currentPassword.length > 0 && newPassword.length > 0 && currentPassword !== newPassword,
      length: newPassword.length >= 8,
      letter: /[a-zA-Z]/.test(newPassword),
      number: /\d/.test(newPassword),
    }),
    [currentPassword, newPassword],
  );

  const isPasswordValid = Object.values(checks).every(Boolean);
  const isConfirmValid = confirmPassword.length > 0 && confirmPassword === newPassword;
  const canSubmit = currentPassword.length > 0 && isPasswordValid && isConfirmValid;

  const handleSubmit = async () => {
    setError("");

    if (!canSubmit) {
      setSubmitted(false);
      return;
    }

    // The old password is checked against the stored hash on the server; the
    // form used to just flip a flag and report success without saving anything.
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });
      const payload = await res.json().catch(() => ({}));

      if (!res.ok) {
        const firstField = payload?.fields ? Object.values(payload.fields)[0] : null;
        setError(String(firstField ?? payload?.error ?? "Gagal mengganti password."));
        setSubmitted(false);
        return;
      }

      setSubmitted(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (e) {
      console.error(e);
      setError("Tidak bisa menghubungi server.");
      setSubmitted(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppShell eyebrow="Autentikasi" title="Ganti Password">
      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
          <p className="text-sm font-semibold text-stone-500">Status Form</p>
          <p className="mt-3 text-2xl font-bold text-brand-cocoa">{canSubmit ? "Valid" : "Belum Valid"}</p>
          <p className="mt-2 text-sm text-stone-500">Diverifikasi ulang oleh server</p>
        </article>
        <article className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
          <p className="text-sm font-semibold text-stone-500">Syarat Terpenuhi</p>
          <p className="mt-3 text-2xl font-bold text-brand-cocoa">{Object.values(checks).filter(Boolean).length}/4</p>
          <p className="mt-2 text-sm text-stone-500">Kekuatan password dasar</p>
        </article>
        <article className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
          <p className="text-sm font-semibold text-stone-500">Konfirmasi</p>
          <p className="mt-3 text-2xl font-bold text-brand-cocoa">{isConfirmValid ? "Cocok" : "Belum"}</p>
          <p className="mt-2 text-sm text-stone-500">Harus sama dengan password baru</p>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <form className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft" onSubmit={(event) => { event.preventDefault(); handleSubmit(); }}>
          <div className="mb-5 flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-lg bg-brand-rose text-brand-pink">
              <KeyRound className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h3 className="font-bold text-brand-cocoa">Form Password Baru</h3>
              <p className="text-sm text-stone-500">Tidak terhubung backend, hanya validasi dummy.</p>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-semibold text-brand-cocoa">
              Password lama
              <input className="mt-2 h-11 w-full rounded-md border border-stone-200 bg-white px-3 text-sm outline-none" type="password" value={currentPassword} onChange={(event) => { setCurrentPassword(event.target.value); setSubmitted(false); }} />
            </label>
            <label className="block text-sm font-semibold text-brand-cocoa">
              Password baru
              <input className="mt-2 h-11 w-full rounded-md border border-stone-200 bg-white px-3 text-sm outline-none" type="password" value={newPassword} onChange={(event) => { setNewPassword(event.target.value); setSubmitted(false); }} />
            </label>
            <label className="block text-sm font-semibold text-brand-cocoa">
              Ulangi password baru
              <input className="mt-2 h-11 w-full rounded-md border border-stone-200 bg-white px-3 text-sm outline-none" type="password" value={confirmPassword} onChange={(event) => { setConfirmPassword(event.target.value); setSubmitted(false); }} />
            </label>
          </div>

          {!isConfirmValid && confirmPassword.length > 0 ? (
            <div className="mt-4 flex items-start gap-2 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">
              <XCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <p>Konfirmasi password belum sama.</p>
            </div>
          ) : null}

          {error ? (
            <div className="mt-4 flex items-start gap-2 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <p>{error}</p>
            </div>
          ) : null}

          {submitted ? (
            <div className="mt-4 flex items-start gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <p>Password berhasil diganti. Gunakan password baru saat login berikutnya.</p>
            </div>
          ) : null}

          <button className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-brand-pink px-4 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-stone-300" type="submit" disabled={!canSubmit || isSubmitting}>
            <LockKeyhole className="h-4 w-4" aria-hidden="true" />
            {isSubmitting ? "Menyimpan…" : "Simpan Password Baru"}
          </button>
        </form>

        <section className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
          <div className="mb-5">
            <h3 className="text-lg font-bold text-brand-cocoa">Checklist Keamanan</h3>
            <p className="mt-1 text-sm text-stone-500">Validasi dasar sebelum password disambungkan ke backend.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {requirements.map((item) => {
              const isMet = checks[item.key as keyof typeof checks];

              return (
                <article key={item.key} className={`rounded-lg border p-4 ${isMet ? "border-emerald-200 bg-emerald-50" : "border-stone-200 bg-white"}`}>
                  <div className="flex items-center gap-3">
                    <div className={`grid h-9 w-9 place-items-center rounded-lg ${isMet ? "bg-white text-emerald-700" : "bg-brand-cream text-brand-brown"}`}>
                      {isMet ? <CheckCircle2 className="h-5 w-5" aria-hidden="true" /> : <ShieldCheck className="h-5 w-5" aria-hidden="true" />}
                    </div>
                    <p className={`text-sm font-bold ${isMet ? "text-emerald-800" : "text-brand-cocoa"}`}>{item.label}</p>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="mt-6 rounded-lg border border-brand-rose bg-brand-cream p-5">
            <p className="font-bold text-brand-cocoa">Catatan implementasi</p>
            <p className="mt-2 text-sm leading-6 text-stone-600">
              Form ini belum menyimpan password sungguhan. Setelah backend autentikasi tersedia, validasi yang sama bisa dipakai sebelum request perubahan password dikirim.
            </p>
          </div>
        </section>
      </section>
    </AppShell>
  );
}
