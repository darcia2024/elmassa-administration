"use client";

import { ArrowLeft, CheckCircle2, HelpCircle, Send, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const verificationItems = ["Nama lengkap staf", "Email yang terdaftar", "Role atau cabang kerja", "Alasan reset akses"];

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const handleSubmit = async () => {
    if (sending || !email.trim()) return;
    setSending(true); setError("");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, message }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || "Permintaan gagal disimpan.");
      setSubmitted(true);
    } catch (e) { setError(e instanceof Error ? e.message : "Tidak bisa menghubungi server."); }
    finally { setSending(false); }
  };

  return (
    <main className="min-h-screen bg-brand-cream px-4 py-6 text-brand-cocoa sm:px-6 lg:px-8">
      <section className="mx-auto grid min-h-[calc(100vh-48px)] max-w-6xl items-center gap-6 lg:grid-cols-[1fr_420px]">
        <div className="space-y-6">
          <Link className="inline-flex h-10 items-center gap-2 rounded-md border border-stone-200 bg-white px-4 text-sm font-bold text-brand-cocoa" href="/login">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Kembali ke login
          </Link>

          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase text-brand-brown">Bantuan akses</p>
            <h1 className="mt-3 text-4xl font-bold text-brand-cocoa sm:text-5xl">Lupa password atau akun terkunci</h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-stone-600">
              Sistem MVP memakai reset akses manual. Hubungi admin internal dan sertakan data verifikasi agar akses bisa dipulihkan.
            </p>
          </div>


        </div>

        <section className="rounded-lg border border-stone-200 bg-white p-6 shadow-soft">
          <div className="mb-6">
            <div className="mb-4 grid h-12 w-12 place-items-center rounded-lg bg-brand-rose text-brand-pink">
              <HelpCircle className="h-6 w-6" aria-hidden="true" />
            </div>
            <h2 className="text-2xl font-bold text-brand-cocoa">Permintaan Reset Password</h2>
            <p className="mt-2 text-sm leading-6 text-stone-500">Permintaan akan diteruskan ke pusat notifikasi admin untuk verifikasi dan reset manual.</p>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-semibold text-brand-cocoa">
              Email akun
              <input className="mt-2 h-11 w-full rounded-md border border-stone-200 bg-white px-3 text-sm outline-none" value={email} onChange={(event) => { setEmail(event.target.value); setSubmitted(false); }} type="email" placeholder="Email akun Anda" />
            </label>
            <label className="block text-sm font-semibold text-brand-cocoa">
              Catatan untuk admin
              <textarea maxLength={2000} className="mt-2 min-h-24 w-full rounded-md border border-stone-200 bg-white px-3 py-2 text-sm outline-none" value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Contoh: akun sales tidak bisa masuk sejak pagi" />
            </label>
          </div>

          <button className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-brand-pink px-4 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-stone-300" type="button" disabled={!email.trim() || sending} onClick={handleSubmit}>
            <Send className="h-4 w-4" aria-hidden="true" />
            {sending ? "Mengirim..." : "Kirim permintaan"}
          </button>

          {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
          {submitted ? (
            <div className="mt-4 flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <p>Jika {email} terdaftar, permintaan telah diteruskan ke admin untuk verifikasi manual.</p>
            </div>
          ) : null}

          <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-start gap-3">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" aria-hidden="true" />
              <div>
                <p className="font-bold text-amber-900">Data yang perlu disiapkan</p>
                <ul className="mt-3 space-y-2 text-sm text-amber-800">
                  {verificationItems.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span aria-hidden="true">-</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
