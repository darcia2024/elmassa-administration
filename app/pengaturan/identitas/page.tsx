"use client";

import { Building2, ExternalLink, FileText, ImageUp, MapPin, RotateCcw, Save, Sparkles, Upload } from "lucide-react";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";

const initialIdentity = {
  address: "Komplek Ruko Best Cinema, Jln. Gabek Raya, Selindung Baru, Kec. Gabek, Kota Pangkal Pinang, Bangka Belitung",
  documentFooter: "Terima kasih telah mempercayakan perjalanan ibadah Anda kepada PT. AL MASSA AZKA WISATA (El Massa Tour). SK Kemenkumham: AHU-0112355.AH.01.01. • No. Izin PPIU: 10032300465890002.",
  email: "elmassatour@gmail.com",
  legalName: "PT. AL MASSA AZKA WISATA",
  name: "El Massa Tour & Travel",
  kemenkumham: "AHU-0112355.AH.01.01.",
  ppiu: "10032300465890002",
  phone: "081249476778",
  website: "www.elmassatour.com",
  gmapsUrl: "https://maps.google.com/?q=Komplek+Ruko+Best+Cinema+Jln+Gabek+Raya+Selindung+Baru+Pangkalpinang",
};

export default function IdentitySettingsPage() {
  const [identity, setIdentity] = useState(initialIdentity);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoName, setLogoName] = useState("Logo EM Official");
  const [isSaving, setIsSaving] = useState(false);
  const [savedAt, setSavedAt] = useState("");

  // These details are printed on invoices and receipts, so they belong in the
  // database, not in a constant that needs a redeploy to change.
  useEffect(() => {
    fetch("/api/company-identity")
      .then((res) => res.json())
      .then((payload) => {
        if (payload?.data) setIdentity((current) => ({ ...current, ...payload.data }));
      })
      .catch((e) => console.error("Gagal memuat identitas:", e));
  }, []);

  /**
   * Tanda tangan & stempel disimpan sebagai data URL di database, bukan file di
   * public/uploads seperti logo: filesystem host bersifat sementara, dan tanda
   * tangan yang hilang setelah deploy membuat surat tidak bisa dicetak.
   */
  const handleSignatureUpload = (field: "signatureUrl" | "stampUrl") => (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (file.size > 400_000) {
      alert(`Gambar terlalu besar (${(file.size / 1000).toFixed(0)} KB). Maksimal 400 KB — potong bagian kosongnya dulu.`);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        setIdentity((current) => ({ ...current, [field]: reader.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveIdentity = async () => {
    setIsSaving(true);
    setSavedAt("");
    try {
      const res = await fetch("/api/company-identity", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(identity),
      });
      const payload = await res.json().catch(() => ({}));

      if (!res.ok) {
        const firstField = payload?.fields ? Object.values(payload.fields)[0] : null;
        alert(firstField ?? payload?.error ?? "Gagal menyimpan identitas.");
        return;
      }

      if (payload?.data) setIdentity((current) => ({ ...current, ...payload.data }));
      setSavedAt(new Date().toLocaleTimeString("id-ID"));
    } catch (e) {
      console.error(e);
      alert("Tidak bisa menghubungi server.");
    } finally {
      setIsSaving(false);
    }
  };

  const contactLine = useMemo(
    () => [identity.phone, identity.email, identity.website].filter(Boolean).join(" • "),
    [identity.email, identity.phone, identity.website],
  );

  const handleLogoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLogoName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setLogoPreview(typeof reader.result === "string" ? reader.result : null);
    };
    reader.readAsDataURL(file);
  };

  return (
    <AppShell eyebrow="Pengaturan Master" title="Identitas Dokumen & Kop">
      <div className="space-y-5">
        
        {/* 🏢 OFFICIAL LEGAL ENTITY BANNER CARD (PERSIS REFERENSI GAMBAR) */}
        <section className="relative overflow-hidden rounded-2xl border border-stone-800 bg-gradient-to-r from-[#2c1d17] via-[#473024] to-[#2c1d17] p-6 text-white shadow-md">
          <div className="relative z-10 flex flex-col items-center justify-center text-center space-y-2 py-2">
            <span className="rounded-full bg-rose-500/20 backdrop-blur-xs px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest text-rose-300 border border-rose-400/30">
              Legalitas Resmi PPIU Kemenag RI
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white uppercase">
              {identity.legalName}
            </h2>
            <p className="text-sm sm:text-base font-medium text-stone-200 tracking-wide">
              SK Kemenkumham ( <span className="font-extrabold text-amber-300">{identity.kemenkumham}</span> )
            </p>
            <p className="text-sm sm:text-base font-extrabold text-white tracking-wide">
              No Izin PPIU : <span className="font-black text-rose-300">{identity.ppiu}</span>
            </p>
          </div>
        </section>

        {/* Metric Cards Row */}
        <section className="grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl border border-stone-200/70 bg-white p-5 shadow-2xs">
            <p className="text-xs font-semibold text-stone-500">Status Profil Dokumen</p>
            <p className="mt-1 text-2xl font-bold text-emerald-700">Aktif & Terverifikasi</p>
            <p className="mt-1 text-[11px] text-stone-400">{identity.name}</p>
          </article>

          <article className="rounded-2xl border border-stone-200/70 bg-white p-5 shadow-2xs">
            <p className="text-xs font-semibold text-stone-500">Logo Perusahaan</p>
            <p className="mt-1 truncate text-2xl font-bold text-brand-cocoa">{logoName}</p>
            <p className="mt-1 text-[11px] text-stone-400">Digunakan pada Invoice & Kuitansi</p>
          </article>

          <article className="rounded-2xl border border-stone-200/70 bg-white p-5 shadow-2xs">
            <p className="text-xs font-semibold text-stone-500">Template Footer</p>
            <p className="mt-1 text-2xl font-bold text-brand-cocoa">Default Template</p>
            <p className="mt-1 text-[11px] text-stone-400">Catatan kaki resmi dokumen</p>
          </article>
        </section>

        {/* Form & Live Preview Grid */}
        <section className="grid gap-5 xl:grid-cols-[400px_1fr]">
          
          {/* Form Settings Card */}
          <form className="rounded-2xl border border-stone-200/70 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-rose-50 text-brand-pink border border-brand-pink/20">
                <Building2 className="h-4.5 w-4.5" strokeWidth={1.5} />
              </span>
              <div>
                <h3 className="text-sm font-bold text-brand-cocoa">Data Kop Dokumen</h3>
                <p className="text-xs text-stone-500">Perubahan langsung terlihat di pratinjau.</p>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block space-y-1">
                <span className="text-xs font-semibold text-stone-700">Nama Brand</span>
                <input
                  className="w-full h-9 rounded-xl border border-stone-200 bg-stone-50/50 px-3.5 text-xs text-brand-cocoa font-medium outline-none focus:border-brand-pink focus:bg-white transition"
                  value={identity.name}
                  onChange={(e) => setIdentity({ ...identity, name: e.target.value })}
                />
              </label>

              <label className="block space-y-1">
                <span className="text-xs font-semibold text-stone-700">Nama Legal PT / Perusahaan</span>
                <input
                  className="w-full h-9 rounded-xl border border-stone-200 bg-stone-50/50 px-3.5 text-xs text-brand-cocoa font-medium outline-none focus:border-brand-pink focus:bg-white transition"
                  value={identity.legalName}
                  onChange={(e) => setIdentity({ ...identity, legalName: e.target.value })}
                />
              </label>

              <label className="block space-y-1">
                <span className="text-xs font-semibold text-stone-700">Alamat Lengkap</span>
                <textarea
                  className="w-full min-h-[70px] rounded-xl border border-stone-200 bg-stone-50/50 px-3.5 py-2 text-xs text-brand-cocoa font-medium outline-none focus:border-brand-pink focus:bg-white transition"
                  value={identity.address}
                  onChange={(e) => setIdentity({ ...identity, address: e.target.value })}
                />
              </label>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block space-y-1">
                  <span className="text-xs font-semibold text-stone-700">No. Telepon / WA</span>
                  <input
                    className="w-full h-9 rounded-xl border border-stone-200 bg-stone-50/50 px-3.5 text-xs text-brand-cocoa font-medium outline-none focus:border-brand-pink focus:bg-white transition"
                    value={identity.phone}
                    onChange={(e) => setIdentity({ ...identity, phone: e.target.value })}
                  />
                </label>

                <label className="block space-y-1">
                  <span className="text-xs font-semibold text-stone-700">Website</span>
                  <input
                    className="w-full h-9 rounded-xl border border-stone-200 bg-stone-50/50 px-3.5 text-xs text-brand-cocoa font-medium outline-none focus:border-brand-pink focus:bg-white transition"
                    value={identity.website}
                    onChange={(e) => setIdentity({ ...identity, website: e.target.value })}
                  />
                </label>
              </div>

              <label className="block space-y-1">
                <span className="text-xs font-semibold text-stone-700">Email Resmi</span>
                <input
                  className="w-full h-9 rounded-xl border border-stone-200 bg-stone-50/50 px-3.5 text-xs text-brand-cocoa font-medium outline-none focus:border-brand-pink focus:bg-white transition"
                  value={identity.email}
                  onChange={(e) => setIdentity({ ...identity, email: e.target.value })}
                />
              </label>

              <label className="block space-y-1">
                <span className="text-xs font-semibold text-stone-700">Footer Teks Dokumen</span>
                <textarea
                  className="w-full min-h-[70px] rounded-xl border border-stone-200 bg-stone-50/50 px-3.5 py-2 text-xs text-brand-cocoa font-medium outline-none focus:border-brand-pink focus:bg-white transition"
                  value={identity.documentFooter}
                  onChange={(e) => setIdentity({ ...identity, documentFooter: e.target.value })}
                />
              </label>
            </div>

            <div className="pt-2 grid gap-2 sm:grid-cols-2">
              <label className="inline-flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition">
                <Upload className="h-3.5 w-3.5 text-stone-500" strokeWidth={1.5} />
                <span>Unggah Logo</span>
                <input className="sr-only" type="file" accept="image/*" onChange={handleLogoChange} />
              </label>
              
              <button
                type="button"
                onClick={handleSaveIdentity}
                disabled={isSaving}
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-brand-pink px-4 text-xs font-bold text-white hover:brightness-110 disabled:opacity-60 transition"
              >
                <Save className="h-3.5 w-3.5" strokeWidth={1.5} />
                <span>{isSaving ? "Menyimpan…" : "Simpan Identitas"}</span>
              </button>

              <button
                type="button"
                onClick={() => { setIdentity(initialIdentity); setLogoPreview(null); setLogoName("Logo EM Official"); }}
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-stone-200 bg-stone-50 px-3 text-xs font-semibold text-stone-600 hover:bg-stone-100 transition"
              >
                <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.5} />
                <span>Reset Default</span>
              </button>

              {savedAt ? (
                <span className="text-xs font-semibold text-emerald-700">Tersimpan {savedAt}</span>
              ) : null}
            </div>
          </form>

          {/* Live Preview Card */}
          <section className="rounded-2xl border border-stone-200/70 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-base font-bold text-brand-cocoa">Pratinjau Kop Dokumen Resmi</h3>
                <p className="text-xs text-stone-500">Simulasi tampilan kop invoice & kuitansi yang dicetak jamaah.</p>
              </div>

              <button
                type="button"
                className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-brand-pink px-4 text-xs font-semibold text-white shadow-2xs hover:bg-brand-pinkHover transition"
              >
                <Save className="h-3.5 w-3.5" strokeWidth={1.5} />
                <span>Simpan Perubahan</span>
              </button>
            </div>

            {/* Document Preview Box */}
            <div className="rounded-xl border border-stone-200/60 bg-stone-50/40 p-5 sm:p-6 space-y-6">
              
              {/* Header Kop Surat Image Preview */}
              <div className="border-b border-stone-200/60 pb-4 space-y-2">
                <p className="text-[10px] font-extrabold uppercase text-stone-400">Pratinjau Kop Surat Resmi (Gambar HD):</p>
                <div className="rounded-xl border border-stone-200 bg-white p-3 shadow-2xs">
                  <img
                    className="w-full h-auto object-contain max-h-32 mx-auto"
                    src="/kop-surat-el-massa.png"
                    alt="Preview Kop Surat El Massa"
                  />
                </div>
              </div>

              {/* Sample Data Grid */}
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-stone-200/60 bg-white p-3">
                  <p className="text-[10px] font-bold uppercase text-stone-400">Ditagihkan Kepada</p>
                  <p className="mt-0.5 text-xs font-bold text-brand-cocoa">Siti Rahma</p>
                </div>

                <div className="rounded-xl border border-stone-200/60 bg-white p-3">
                  <p className="text-[10px] font-bold uppercase text-stone-400">Kode Booking</p>
                  <p className="mt-0.5 text-xs font-mono font-bold text-brand-cocoa">BK-2407-018</p>
                </div>

                <div className="rounded-xl border border-stone-200/60 bg-white p-3">
                  <p className="text-[10px] font-bold uppercase text-stone-400">Nominal Tagihan</p>
                  <p className="mt-0.5 text-xs font-bold text-brand-pink">Rp 32.500.000</p>
                </div>
              </div>

              {/* Footer Preview */}
              <div className="rounded-xl border border-brand-pink/20 bg-rose-50/50 p-3.5 text-xs text-stone-600 italic font-medium">
                {identity.documentFooter}
              </div>

            </div>

            {/* 📍 GOOGLE MAPS LOCATION & NAVIGATOR WIDGET */}
            <div className="rounded-xl border border-stone-200/70 bg-white p-5 space-y-4 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-rose-50 text-brand-pink border border-brand-pink/20">
                    <MapPin className="h-4 w-4" strokeWidth={1.5} />
                  </span>
                  <div>
                    <h4 className="text-xs font-extrabold text-brand-cocoa">Lokasi Kantor & Ruko Resmi</h4>
                    <p className="text-[11px] font-medium text-stone-500">Komplek Ruko Best Cinema, Pangkalpinang</p>
                  </div>
                </div>

                <a
                  href={identity.gmapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-8 items-center gap-1.5 rounded-xl bg-brand-pink px-3 text-[11px] font-bold text-white shadow-2xs hover:bg-brand-pinkHover transition shrink-0"
                >
                  <span>Buka di Google Maps</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>

              {/* Address details card */}
              <div className="rounded-xl border border-stone-200/60 bg-stone-50/60 p-3.5 text-xs space-y-2">
                <p className="font-extrabold text-brand-cocoa flex items-center gap-1">
                  🏢 {identity.address}
                </p>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-stone-600">
                  <p>• Komplek: <span className="font-semibold text-stone-800">Ruko Best Cinema</span></p>
                  <p>• Jalan: <span className="font-semibold text-stone-800">Jl. Gabek Raya</span></p>
                  <p>• Kelurahan: <span className="font-semibold text-stone-800">Selindung Baru</span></p>
                  <p>• Kecamatan: <span className="font-semibold text-stone-800">Kec. Gabek</span></p>
                  <p>• Kota: <span className="font-semibold text-stone-800">Pangkalpinang</span></p>
                  <p>• Provinsi: <span className="font-semibold text-stone-800">Bangka Belitung</span></p>
                </div>
              </div>

              {/* Embedded Google Maps Preview Frame */}
              <div className="overflow-hidden rounded-xl border border-stone-200 shadow-2xs h-48 w-full relative bg-stone-100">
                <iframe
                  title="Google Maps Lokasi El Massa Tour Best Cinema Pangkalpinang"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15945.74836691456!2d106.1085!3d-2.105!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e22c156f17d7b05%3A0x6b1076b177894a8c!2sSelindung%20Baru%2C%20Gabek%2C%20Pangkal%20Pinang%20City%2C%20Bangka%20Belitung!5e0!3m2!1sen!2sid!4v1700000000000!5m2!1sen!2sid"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={false}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full h-full"
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-stone-200/70 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
            <header className="border-b border-stone-100 pb-3">
              <h3 className="text-sm font-extrabold text-brand-cocoa">Tanda Tangan & Stempel Digital</h3>
              <p className="text-[11px] text-stone-500 mt-0.5">
                Dipakai otomatis pada surat resmi. Pakai PNG latar transparan agar tidak menutupi teks.
              </p>
            </header>

            <div className="grid gap-4 sm:grid-cols-2">
              {([
                { field: "signatureUrl" as const, label: "Tanda Tangan", hint: "PNG transparan, potong rapat" },
                { field: "stampUrl" as const, label: "Stempel / Cap", hint: "Opsional" },
              ]).map(({ field, label, hint }) => {
                const nilai = (identity as Record<string, unknown>)[field] as string | undefined;
                return (
                  <div key={field} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] font-bold uppercase tracking-wide text-stone-500">{label}</p>
                      {nilai ? (
                        <button
                          type="button"
                          onClick={() => setIdentity((c) => ({ ...c, [field]: "" }))}
                          className="text-[10px] font-bold text-stone-400 hover:text-rose-600 transition"
                        >
                          Hapus
                        </button>
                      ) : null}
                    </div>

                    <div className="grid h-28 place-items-center rounded-xl border border-stone-200 bg-[repeating-conic-gradient(#f5f5f4_0%_25%,#ffffff_0%_50%)] bg-[length:16px_16px] p-2">
                      {nilai ? (
                        <img src={nilai} alt={label} className="max-h-24 w-auto object-contain" />
                      ) : (
                        <p className="text-[11px] font-semibold text-stone-400">Belum ada {label.toLowerCase()}</p>
                      )}
                    </div>

                    <label className="flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-stone-200 bg-stone-50 text-xs font-bold text-stone-700 hover:bg-stone-100 transition">
                      <span>{nilai ? "Ganti" : "Upload"} {label}</span>
                      <input type="file" accept="image/png,image/webp,image/jpeg" className="hidden" onChange={handleSignatureUpload(field)} />
                    </label>
                    <p className="text-[10px] text-stone-400">{hint}</p>
                  </div>
                );
              })}
            </div>

            <div className="grid gap-3 sm:grid-cols-2 border-t border-stone-100 pt-3">
              <label className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wide text-stone-500">Nama Penandatangan</span>
                <input
                  type="text"
                  value={(identity as Record<string, unknown>).signatureName as string ?? ""}
                  onChange={(e) => setIdentity((c) => ({ ...c, signatureName: e.target.value }))}
                  placeholder="Azriandri"
                  className="w-full h-9 rounded-xl border border-stone-200 bg-stone-50/50 px-3 text-xs font-medium text-brand-cocoa placeholder:text-stone-400 outline-none focus:border-brand-pink focus:bg-white transition"
                />
              </label>

              <label className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wide text-stone-500">Jabatan</span>
                <input
                  type="text"
                  value={(identity as Record<string, unknown>).signaturePosition as string ?? ""}
                  onChange={(e) => setIdentity((c) => ({ ...c, signaturePosition: e.target.value }))}
                  placeholder="Direktur Utama"
                  className="w-full h-9 rounded-xl border border-stone-200 bg-stone-50/50 px-3 text-xs font-medium text-brand-cocoa placeholder:text-stone-400 outline-none focus:border-brand-pink focus:bg-white transition"
                />
              </label>
            </div>

            <p className="rounded-xl border border-amber-200 bg-amber-50/60 px-3 py-2 text-[11px] font-semibold text-amber-900">
              Tanda tangan digital berlaku seperti tanda tangan asli. Setiap staf yang bisa membuka Surat Menyurat
              dapat menerbitkan surat bertanda tangan ini — batasi lewat Pengaturan &gt; Hak Akses.
            </p>
          </section>

        </section>

      </div>
    </AppShell>
  );
}
