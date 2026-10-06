"use client";

import type { ReactNode } from "react";
import { Plus, Trash2 } from "lucide-react";
import { COMPANION_RELATIONS, GENDERS, type Companion } from "@/lib/jamaah/rules";
import {
  SISKOPATUH_EDUCATIONS,
  SISKOPATUH_MARITAL_STATUSES,
  SISKOPATUH_OCCUPATIONS,
  SISKOPATUH_PROVINCES,
  SISKOPATUH_REGIONS,
} from "@/lib/jamaah/siskopatuh-lists";

/**
 * Isian data jamaah. Dipakai DUA halaman: form staf (/jamaah/[id]) dan form
 * pendataan mandiri jamaah (/pendataan/[token]), supaya kolom yang ditanyakan
 * ke jamaah tidak bisa melenceng dari yang disimpan kantor.
 */

export type JamaahFormValues = {
  fullName: string;
  passportName: string;
  fatherName: string;
  gender: string;
  birthPlace: string;
  birthDate: string;
  nik: string;
  passportNumber: string;
  passportIssuePlace: string;
  passportIssueDate: string;
  passportExpiry: string;
  phone: string;
  address: string;
  province: string;
  regency: string;
  district: string;
  village: string;
  maritalStatus: string;
  education: string;
  occupation: string;
  emergencyName: string;
  emergencyRelation: string;
  emergencyPhone: string;
  companions: Companion[];
  notes: string;
};

export const EMPTY_FORM: JamaahFormValues = {
  fullName: "",
  passportName: "",
  fatherName: "",
  gender: "",
  birthPlace: "",
  birthDate: "",
  nik: "",
  passportNumber: "",
  passportIssuePlace: "",
  passportIssueDate: "",
  passportExpiry: "",
  phone: "",
  address: "",
  province: "",
  regency: "",
  district: "",
  village: "",
  maritalStatus: "",
  education: "",
  occupation: "",
  emergencyName: "",
  emergencyRelation: "",
  emergencyPhone: "",
  companions: [],
  notes: "",
};

type TextKey = Exclude<keyof JamaahFormValues, "companions">;

type Props = {
  values: JamaahFormValues;
  onChange: (next: JamaahFormValues) => void;
  errors?: Record<string, string>;
  /**
   * Di form publik, isi yang sudah tersimpan tidak dikirim balik ke browser.
   * Yang tampil hanya keterangan "sudah terisi" sebagai placeholder, dan kolom
   * yang dibiarkan kosong berarti "tidak diubah".
   */
  storedHints?: Partial<Record<TextKey, string>>;
  showNotes?: boolean;
};

const inputClass =
  "w-full h-10 rounded-xl border border-stone-200 bg-stone-50/50 px-3 text-xs font-medium text-brand-cocoa placeholder:text-stone-400 outline-none focus:border-brand-pink focus:bg-white transition";

function Section({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <fieldset aria-label={title} className="space-y-3 rounded-2xl border border-stone-200/70 bg-white p-4 sm:p-5 shadow-2xs">
      <div>
        <h3 className="text-xs font-extrabold uppercase tracking-wide text-brand-cocoa">{title}</h3>
        {hint ? <p className="mt-0.5 text-[11px] text-stone-500">{hint}</p> : null}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}

export function JamaahFields({ values, onChange, errors = {}, storedHints = {}, showNotes = false }: Props) {
  const set = (key: TextKey, value: string) => onChange({ ...values, [key]: value });

  const field = (
    key: TextKey,
    label: string,
    opts: { type?: string; placeholder?: string; required?: boolean; inputMode?: "numeric" | "tel"; wide?: boolean } = {},
  ) => {
    const hint = storedHints[key];
    return (
      <label className={`space-y-1 ${opts.wide ? "sm:col-span-2" : ""}`}>
        <span className="text-[11px] font-bold uppercase tracking-wide text-stone-500">
          {label}
          {opts.required ? <span className="text-brand-pink"> *</span> : null}
        </span>
        <input
          type={opts.type ?? "text"}
          inputMode={opts.inputMode}
          value={values[key]}
          placeholder={hint ? `Sudah terisi ${hint} — isi untuk mengganti` : opts.placeholder}
          onChange={(e) => set(key, e.target.value)}
          aria-invalid={Boolean(errors[key])}
          className={`${inputClass} ${errors[key] ? "border-rose-300 bg-rose-50/40" : ""}`}
        />
        {hint && opts.type === "date" && !values[key] ? (
          <span className="block text-[10px] font-semibold text-emerald-700">Sudah terisi — pilih tanggal untuk mengganti</span>
        ) : null}
        {errors[key] ? <span className="block text-[10px] font-semibold text-rose-600">{errors[key]}</span> : null}
      </label>
    );
  };

  const select = (key: TextKey, label: string, options: Array<{ value: string; label: string }>, required = false) => (
    <label className="space-y-1">
      <span className="text-[11px] font-bold uppercase tracking-wide text-stone-500">
        {label}
        {required ? <span className="text-brand-pink"> *</span> : null}
      </span>
      <select
        value={values[key]}
        onChange={(e) => set(key, e.target.value)}
        aria-invalid={Boolean(errors[key])}
        className={`${inputClass} ${errors[key] ? "border-rose-300" : ""}`}
      >
        <option value="">— Pilih —</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {errors[key] ? <span className="block text-[10px] font-semibold text-rose-600">{errors[key]}</span> : null}
    </label>
  );

  const updateCompanion = (index: number, patch: Partial<Companion>) => {
    const next = values.companions.map((c, i) => (i === index ? { ...c, ...patch } : c));
    onChange({ ...values, companions: next });
  };

  return (
    <div className="space-y-4">
      <Section title="Biodata" hint="Nama sesuai KTP / kartu vaksin. Kolom bertanda * dibutuhkan manifest Siskopatuh & maskapai.">
        {field("fullName", "Nama Lengkap", { required: true, placeholder: "Siti Aminah binti Abdullah", wide: true })}
        {field("fatherName", "Nama Ayah", { required: true, placeholder: "Abdullah" })}
        {select("gender", "Jenis Kelamin", GENDERS.map((g) => ({ value: g.value, label: g.label })), true)}
        {field("birthPlace", "Tempat Lahir", { required: true, placeholder: "Pangkalpinang" })}
        {field("birthDate", "Tanggal Lahir", { type: "date", required: true })}
        {select("maritalStatus", "Status Pernikahan", SISKOPATUH_MARITAL_STATUSES.map((v) => ({ value: v, label: v })), true)}
        {select("education", "Pendidikan Terakhir", SISKOPATUH_EDUCATIONS.map((v) => ({ value: v, label: v })), true)}
        {select("occupation", "Pekerjaan", SISKOPATUH_OCCUPATIONS.map((v) => ({ value: v, label: v })), true)}
      </Section>

      <Section title="Identitas & Paspor" hint="Paspor harus masih berlaku minimal 6 bulan saat berangkat.">
        {field("nik", "Nomor KTP / NIK", { required: true, inputMode: "numeric", placeholder: "16 digit" })}
        {field("passportNumber", "Nomor Paspor", { required: true, placeholder: "X1234567" })}
        {field("passportName", "Nama di Paspor", { placeholder: "Kosongkan kalau sama dengan nama lengkap", wide: true })}
        {field("passportIssuePlace", "Kota Penerbit Paspor", { required: true, placeholder: "PANGKAL PINANG" })}
        {field("passportIssueDate", "Tanggal Terbit Paspor", { type: "date", required: true })}
        {field("passportExpiry", "Masa Berlaku Paspor", { type: "date", required: true })}
      </Section>

      <Section title="Alamat & Kontak">
        {field("address", "Alamat (Jalan, RT/RW)", { required: true, placeholder: "Jl. Merdeka No. 1 RT 02/RW 03", wide: true })}
        <label className="space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wide text-stone-500">
            Provinsi<span className="text-brand-pink"> *</span>
          </span>
          <select
            value={values.province}
            // Kabupaten bergantung pada provinsi; kosongkan supaya tidak tersimpan pasangan yang mustahil.
            onChange={(e) => onChange({ ...values, province: e.target.value, regency: "" })}
            className={`${inputClass} ${errors.province ? "border-rose-300" : ""}`}
          >
            <option value="">— Pilih provinsi —</option>
            {SISKOPATUH_PROVINCES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          {errors.province ? <span className="block text-[10px] font-semibold text-rose-600">{errors.province}</span> : null}
        </label>
        <label className="space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wide text-stone-500">
            Kabupaten / Kota<span className="text-brand-pink"> *</span>
          </span>
          <select
            value={values.regency}
            disabled={!values.province}
            onChange={(e) => set("regency", e.target.value)}
            className={`${inputClass} disabled:opacity-50 ${errors.regency ? "border-rose-300" : ""}`}
          >
            <option value="">{values.province ? "— Pilih kabupaten/kota —" : "Pilih provinsi dulu"}</option>
            {(SISKOPATUH_REGIONS[values.province] ?? []).map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          {errors.regency ? <span className="block text-[10px] font-semibold text-rose-600">{errors.regency}</span> : null}
        </label>
        {field("district", "Kecamatan", { required: true, placeholder: "KEC. SUNGAILIAT" })}
        {field("village", "Kelurahan / Desa", { required: true, placeholder: "KEL. SUNGAILIAT" })}
        {field("phone", "Nomor HP / WhatsApp", { required: true, inputMode: "tel", placeholder: "0812xxxxxxxx" })}
      </Section>

      <Section title="Kontak Darurat">
        {field("emergencyName", "Nama Kontak Darurat / Keluarga", { required: true, placeholder: "Nama keluarga" })}
        {field("emergencyRelation", "Hubungan", { placeholder: "Suami / Anak / …" })}
        {field("emergencyPhone", "Nomor Kontak Darurat", { required: true, inputMode: "tel", placeholder: "0812xxxxxxxx" })}
      </Section>

      <fieldset aria-label="Jamaah Penyerta" className="space-y-3 rounded-2xl border border-stone-200/70 bg-white p-4 sm:p-5 shadow-2xs">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wide text-brand-cocoa">Jamaah Penyerta</h3>
            <p className="mt-0.5 text-[11px] text-stone-500">Keluarga / mahram yang berangkat bersama. Boleh dikosongkan.</p>
          </div>
          <button
            type="button"
            onClick={() => onChange({ ...values, companions: [...values.companions, { name: "", relation: "" }] })}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3 text-[11px] font-bold text-stone-700 hover:bg-stone-50 transition"
          >
            <Plus className="h-3.5 w-3.5" /> Tambah Penyerta
          </button>
        </div>

        {values.companions.length === 0 ? (
          <p className="rounded-xl border border-dashed border-stone-200 bg-stone-50/60 px-3 py-3 text-center text-[11px] text-stone-500">
            Tidak ada jamaah penyerta.
          </p>
        ) : (
          <ul className="space-y-2">
            {values.companions.map((c, index) => (
              <li key={index} className="grid grid-cols-[1fr_auto] gap-2 sm:grid-cols-[1fr_180px_auto]">
                <input
                  value={c.name}
                  placeholder="Nama penyerta"
                  onChange={(e) => updateCompanion(index, { name: e.target.value })}
                  className={`${inputClass} col-span-1`}
                  aria-label={`Nama penyerta ${index + 1}`}
                />
                <select
                  value={c.relation}
                  onChange={(e) => updateCompanion(index, { relation: e.target.value })}
                  className={`${inputClass} order-3 col-span-2 sm:order-none sm:col-span-1`}
                  aria-label={`Hubungan penyerta ${index + 1}`}
                >
                  <option value="">— Hubungan —</option>
                  {COMPANION_RELATIONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => onChange({ ...values, companions: values.companions.filter((_, i) => i !== index) })}
                  className="grid h-10 w-10 place-items-center rounded-xl border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 transition"
                  aria-label={`Hapus penyerta ${index + 1}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </fieldset>

      {showNotes ? (
        <fieldset aria-label="Catatan Internal" className="space-y-2 rounded-2xl border border-stone-200/70 bg-white p-4 sm:p-5 shadow-2xs">
          <h3 className="text-xs font-extrabold uppercase tracking-wide text-brand-cocoa">Catatan Internal</h3>
          <textarea
            value={values.notes}
            onChange={(e) => set("notes", e.target.value)}
            rows={3}
            placeholder="Hanya terlihat oleh staf kantor"
            className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-3 py-2 text-xs font-medium text-brand-cocoa placeholder:text-stone-400 outline-none focus:border-brand-pink focus:bg-white transition"
          />
        </fieldset>
      ) : null}
    </div>
  );
}
