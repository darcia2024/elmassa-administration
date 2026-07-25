"use client";

import { Building2, FileText, ImageUp, RotateCcw, Save, Upload } from "lucide-react";
import { ChangeEvent, useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";

const initialIdentity = {
  address: "Jl. Kemang Pratama, Bekasi",
  documentFooter: "Terima kasih telah mempercayakan perjalanan Anda kepada El Massa Tour & Travel.",
  email: "admin@elmassa.test",
  legalName: "PT El Massa Tour & Travel",
  name: "El Massa Tour & Travel",
  phone: "021-8899-7788",
  website: "www.elmassa.test",
};

export default function IdentitySettingsPage() {
  const [identity, setIdentity] = useState(initialIdentity);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoName, setLogoName] = useState("Logo EM dummy");

  const contactLine = useMemo(
    () => [identity.phone, identity.email, identity.website].filter(Boolean).join(" | "),
    [identity.email, identity.phone, identity.website],
  );

  const handleLogoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setLogoName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setLogoPreview(typeof reader.result === "string" ? reader.result : null);
    };
    reader.readAsDataURL(file);
  };

  return (
    <AppShell eyebrow="Pengaturan Master" title="Identitas Dokumen">
      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
          <p className="text-sm font-semibold text-stone-500">Profil Dokumen</p>
          <p className="mt-3 text-2xl font-bold text-brand-cocoa">Aktif</p>
          <p className="mt-2 text-sm text-stone-500">{identity.name}</p>
        </article>
        <article className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
          <p className="text-sm font-semibold text-stone-500">Logo</p>
          <p className="mt-3 truncate text-2xl font-bold text-brand-cocoa">{logoName}</p>
          <p className="mt-2 text-sm text-stone-500">Preview lokal di browser</p>
        </article>
        <article className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
          <p className="text-sm font-semibold text-stone-500">Footer</p>
          <p className="mt-3 text-2xl font-bold text-brand-cocoa">1 template</p>
          <p className="mt-2 text-sm text-stone-500">Dipakai invoice dan kuitansi</p>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[380px_1fr]">
        <form className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
          <div className="mb-5 flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-lg bg-brand-rose text-brand-pink">
              <Building2 className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h3 className="font-bold text-brand-cocoa">Data Kop Dokumen</h3>
              <p className="text-sm text-stone-500">Perubahan langsung terlihat di pratinjau.</p>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-semibold text-brand-cocoa">
              Nama brand
              <input className="mt-2 h-10 w-full rounded-md border border-stone-200 bg-white px-3 text-sm outline-none" value={identity.name} onChange={(event) => setIdentity({ ...identity, name: event.target.value })} />
            </label>
            <label className="block text-sm font-semibold text-brand-cocoa">
              Nama legal
              <input className="mt-2 h-10 w-full rounded-md border border-stone-200 bg-white px-3 text-sm outline-none" value={identity.legalName} onChange={(event) => setIdentity({ ...identity, legalName: event.target.value })} />
            </label>
            <label className="block text-sm font-semibold text-brand-cocoa">
              Alamat
              <textarea className="mt-2 min-h-20 w-full rounded-md border border-stone-200 bg-white px-3 py-2 text-sm outline-none" value={identity.address} onChange={(event) => setIdentity({ ...identity, address: event.target.value })} />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-semibold text-brand-cocoa">
                Telepon
                <input className="mt-2 h-10 w-full rounded-md border border-stone-200 bg-white px-3 text-sm outline-none" value={identity.phone} onChange={(event) => setIdentity({ ...identity, phone: event.target.value })} />
              </label>
              <label className="block text-sm font-semibold text-brand-cocoa">
                Website
                <input className="mt-2 h-10 w-full rounded-md border border-stone-200 bg-white px-3 text-sm outline-none" value={identity.website} onChange={(event) => setIdentity({ ...identity, website: event.target.value })} />
              </label>
            </div>
            <label className="block text-sm font-semibold text-brand-cocoa">
              Email
              <input className="mt-2 h-10 w-full rounded-md border border-stone-200 bg-white px-3 text-sm outline-none" value={identity.email} onChange={(event) => setIdentity({ ...identity, email: event.target.value })} />
            </label>
            <label className="block text-sm font-semibold text-brand-cocoa">
              Footer dokumen
              <textarea className="mt-2 min-h-24 w-full rounded-md border border-stone-200 bg-white px-3 py-2 text-sm outline-none" value={identity.documentFooter} onChange={(event) => setIdentity({ ...identity, documentFooter: event.target.value })} />
            </label>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <label className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-md border border-stone-200 bg-white px-4 text-sm font-bold text-brand-cocoa">
              <Upload className="h-4 w-4" aria-hidden="true" />
              Unggah logo
              <input className="sr-only" type="file" accept="image/*" onChange={handleLogoChange} />
            </label>
            <button className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-stone-200 bg-white px-4 text-sm font-bold text-brand-cocoa" type="button" onClick={() => { setIdentity(initialIdentity); setLogoPreview(null); setLogoName("Logo EM dummy"); }}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </form>

        <section className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-bold text-brand-cocoa">Pratinjau Dokumen</h3>
              <p className="mt-1 text-sm text-stone-500">Simulasi kop invoice dan kuitansi dengan data identitas dummy.</p>
            </div>
            <button className="inline-flex h-10 w-fit items-center justify-center gap-2 rounded-md bg-brand-pink px-4 text-sm font-bold text-white" type="button">
              <Save className="h-4 w-4" aria-hidden="true" />
              Simpan dummy
            </button>
          </div>

          <div className="rounded-lg border border-stone-200 bg-brand-cream p-4">
            <div className="rounded-lg bg-white p-6 shadow-soft">
              <div className="flex flex-col gap-5 border-b border-stone-200 pb-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-4">
                  <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-lg bg-brand-rose text-brand-pink ring-1 ring-brand-pink/20">
                    {logoPreview ? (
                      <img className="h-full w-full object-cover" src={logoPreview} alt="Preview logo" />
                    ) : (
                      <ImageUp className="h-7 w-7" aria-hidden="true" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold uppercase text-brand-brown">{identity.legalName}</p>
                    <h3 className="mt-1 text-2xl font-bold text-brand-cocoa">{identity.name}</h3>
                    <p className="mt-2 text-sm leading-6 text-stone-600">{identity.address}</p>
                    <p className="mt-1 text-sm font-semibold text-brand-cocoa">{contactLine}</p>
                  </div>
                </div>
                <div className="rounded-lg border border-stone-200 bg-brand-cream p-4 text-sm">
                  <p className="text-xs font-bold uppercase text-stone-500">Dokumen</p>
                  <p className="mt-1 font-bold text-brand-cocoa">INV-2407-018</p>
                  <p className="mt-3 text-xs font-bold uppercase text-stone-500">Status</p>
                  <p className="mt-1 font-bold text-brand-cocoa">Sebagian</p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                {[
                  ["Ditagihkan kepada", "Siti Rahma"],
                  ["Booking", "BK-2407-018"],
                  ["Nominal", "Rp 32.500.000"],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-lg border border-stone-200 bg-white p-4">
                    <p className="text-xs font-bold uppercase text-stone-500">{label}</p>
                    <p className="mt-2 font-bold text-brand-cocoa">{value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex items-start gap-3 rounded-lg border border-brand-rose bg-brand-cream p-4 text-sm text-stone-700">
                <FileText className="mt-0.5 h-4 w-4 shrink-0 text-brand-pink" aria-hidden="true" />
                <p>{identity.documentFooter}</p>
              </div>
            </div>
          </div>
        </section>
      </section>
    </AppShell>
  );
}
