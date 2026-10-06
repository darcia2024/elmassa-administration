import {
  SISKOPATUH_EDUCATIONS,
  SISKOPATUH_MARITAL_STATUSES,
  SISKOPATUH_OCCUPATIONS,
  SISKOPATUH_REGIONS,
} from "@/lib/jamaah/siskopatuh-lists";

/**
 * Aturan data jamaah yang dipakai bersama oleh server (API) dan klien (form
 * admin & form pendataan publik). Sengaja tanpa import `pg` supaya aman
 * di-bundle ke browser.
 */

export const GENDERS = [
  { value: "L", label: "Laki-laki" },
  { value: "P", label: "Perempuan" },
] as const;

export const COMPANION_RELATIONS = ["Suami", "Istri", "Anak", "Orang Tua", "Saudara", "Mahram Lain", "Lainnya"] as const;

export type Companion = { name: string; relation: string; jamaahId?: string | null };

export const DOC_TYPES = [
  { id: "kk", label: "Kartu Keluarga", requiredFor: "proses" },
  { id: "ktp", label: "KTP", requiredFor: "proses" },
  { id: "paspor", label: "Paspor", requiredFor: "proses" },
  { id: "pendukung", label: "Dokumen Pendukung", requiredFor: "proses" },
  { id: "vaksin", label: "Sertifikat / Bukti Vaksin", requiredFor: "proses" },
  { id: "pas_foto", label: "Pas Foto", requiredFor: "proses" },
  // Visa diurus travel SETELAH dokumen lain lengkap, jadi baru disyaratkan
  // untuk manifest, bukan untuk mulai diproses.
  { id: "visa", label: "Visa", requiredFor: "manifest" },
] as const;

export type DocTypeId = (typeof DOC_TYPES)[number]["id"];

export const SUPPORTING_DOC_SUBTYPES = [
  { value: "akta_kelahiran", label: "Akta Kelahiran" },
  { value: "ijazah", label: "Ijazah" },
  { value: "buku_nikah", label: "Buku Nikah" },
] as const;

export const ALLOWED_DOC_MIME = ["image/jpeg", "image/png", "image/webp", "application/pdf"] as const;
export const MAX_DOC_BYTES = 5 * 1024 * 1024;

export function isDocType(value: unknown): value is DocTypeId {
  return DOC_TYPES.some((d) => d.id === value);
}

export function docLabel(id: string, subtype?: string) {
  const base = DOC_TYPES.find((d) => d.id === id)?.label ?? id;
  const sub = SUPPORTING_DOC_SUBTYPES.find((s) => s.value === subtype)?.label;
  return sub ? `${base} (${sub})` : base;
}

export const COMPLETENESS_STATUSES = [
  "Data Belum Lengkap",
  "Dokumen Belum Lengkap",
  "Siap Diproses",
  "Siap Masuk Manifest",
] as const;

export type CompletenessStatus = (typeof COMPLETENESS_STATUSES)[number];

export type ProfileFields = {
  fullName: string;
  /** Nama persis di halaman biodata paspor; kosong = sama dengan fullName. Dipakai manifest maskapai. */
  passportName: string;
  fatherName: string;
  gender: string;
  birthPlace: string;
  birthDate: string | null;
  nik: string;
  passportNumber: string;
  passportIssuePlace: string;
  passportIssueDate: string | null;
  passportExpiry: string | null;
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
};

export type Completeness = {
  status: CompletenessStatus;
  missingFields: string[];
  missingDocs: string[];
  warnings: string[];
};

/**
 * Paspor umrah harus masih berlaku minimal 6 bulan. Tanpa tanggal
 * keberangkatan yang pasti di level profil, patokannya hari ini -- paspor yang
 * sudah kurang dari 6 bulan sekarang pasti kurang juga saat berangkat.
 */
export const PASSPORT_MIN_MONTHS = 6;

function addMonths(iso: string, months: number) {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCMonth(d.getUTCMonth() + months);
  return d.toISOString().slice(0, 10);
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function digitsOnly(value: string) {
  return String(value ?? "").replace(/\D/g, "");
}

/** Validasi format; dipakai server sebelum menyimpan dan form sebelum mengirim. */
export function validateFields(input: Partial<ProfileFields>): Record<string, string> {
  const errors: Record<string, string> = {};

  if (input.fullName !== undefined && !input.fullName.trim()) {
    errors.fullName = "Nama lengkap wajib diisi";
  }
  if (input.nik && digitsOnly(input.nik).length !== 16) {
    errors.nik = "NIK harus 16 digit";
  }
  if (input.gender && !GENDERS.some((g) => g.value === input.gender)) {
    errors.gender = "Pilih Laki-laki atau Perempuan";
  }
  if (input.birthDate && input.birthDate > todayISO()) {
    errors.birthDate = "Tanggal lahir tidak boleh di masa depan";
  }
  if (input.phone && digitsOnly(input.phone).length < 9) {
    errors.phone = "Nomor HP terlalu pendek";
  }
  if (input.emergencyPhone && digitsOnly(input.emergencyPhone).length < 9) {
    errors.emergencyPhone = "Nomor kontak darurat terlalu pendek";
  }
  if (input.passportIssueDate && input.passportExpiry && input.passportExpiry <= input.passportIssueDate) {
    errors.passportExpiry = "Masa berlaku harus setelah tanggal terbit";
  }
  // Siskopatuh mencocokkan teks persis dengan dropdown template-nya.
  if (input.province && !(input.province in SISKOPATUH_REGIONS)) {
    errors.province = "Pilih provinsi dari daftar";
  }
  if (input.regency && input.province && !SISKOPATUH_REGIONS[input.province]?.includes(input.regency)) {
    errors.regency = "Pilih kabupaten/kota dari daftar provinsi yang dipilih";
  }
  if (input.maritalStatus && !(SISKOPATUH_MARITAL_STATUSES as readonly string[]).includes(input.maritalStatus)) {
    errors.maritalStatus = "Pilih status pernikahan dari daftar";
  }
  if (input.education && !(SISKOPATUH_EDUCATIONS as readonly string[]).includes(input.education)) {
    errors.education = "Pilih pendidikan dari daftar";
  }
  if (input.occupation && !(SISKOPATUH_OCCUPATIONS as readonly string[]).includes(input.occupation)) {
    errors.occupation = "Pilih pekerjaan dari daftar";
  }
  return errors;
}

export function computeCompleteness(
  profile: ProfileFields,
  uploadedDocTypes: Iterable<string>,
): Completeness {
  const missingFields: string[] = [];
  const warnings: string[] = [];

  // Gabungan kolom wajib ketiga manifest: maskapai butuh tanggal terbit paspor
  // (DOI); Siskopatuh butuh nama ayah, tempat lahir, kota paspor, alamat
  // lengkap s/d kelurahan, status nikah, pendidikan, dan pekerjaan.
  const required: Array<[keyof ProfileFields, string]> = [
    ["fullName", "Nama lengkap"],
    ["fatherName", "Nama ayah"],
    ["gender", "Jenis kelamin"],
    ["birthPlace", "Tempat lahir"],
    ["birthDate", "Tanggal lahir"],
    ["nik", "NIK"],
    ["passportNumber", "Nomor paspor"],
    ["passportIssuePlace", "Kota penerbit paspor"],
    ["passportIssueDate", "Tanggal terbit paspor"],
    ["passportExpiry", "Masa berlaku paspor"],
    ["phone", "Nomor HP"],
    ["address", "Alamat"],
    ["province", "Provinsi"],
    ["regency", "Kabupaten/kota"],
    ["district", "Kecamatan"],
    ["village", "Kelurahan/desa"],
    ["maritalStatus", "Status pernikahan"],
    ["education", "Pendidikan"],
    ["occupation", "Pekerjaan"],
    ["emergencyName", "Nama kontak darurat"],
    ["emergencyPhone", "Nomor kontak darurat"],
  ];
  for (const [key, label] of required) {
    const value = profile[key];
    if (value === null || value === undefined || String(value).trim() === "") missingFields.push(label);
  }

  if (profile.nik && digitsOnly(profile.nik).length !== 16) missingFields.push("NIK (harus 16 digit)");

  if (profile.passportExpiry) {
    const today = todayISO();
    if (profile.passportExpiry < today) {
      missingFields.push("Paspor sudah habis masa berlaku");
    } else if (profile.passportExpiry < addMonths(today, PASSPORT_MIN_MONTHS)) {
      missingFields.push(`Paspor berlaku kurang dari ${PASSPORT_MIN_MONTHS} bulan`);
    } else if (profile.passportExpiry < addMonths(today, PASSPORT_MIN_MONTHS + 3)) {
      warnings.push("Paspor akan kurang dari 6 bulan dalam 3 bulan ke depan — cek terhadap tanggal keberangkatan");
    }
  }

  const uploaded = new Set(uploadedDocTypes);
  const missingForProcess = DOC_TYPES.filter((d) => d.requiredFor === "proses" && !uploaded.has(d.id)).map((d) => d.label);
  const missingForManifest = DOC_TYPES.filter((d) => d.requiredFor === "manifest" && !uploaded.has(d.id)).map((d) => d.label);

  let status: CompletenessStatus;
  if (missingFields.length > 0) status = "Data Belum Lengkap";
  else if (missingForProcess.length > 0) status = "Dokumen Belum Lengkap";
  else if (missingForManifest.length > 0) status = "Siap Diproses";
  else status = "Siap Masuk Manifest";

  return { status, missingFields, missingDocs: [...missingForProcess, ...missingForManifest], warnings };
}

export const STATUS_STYLES: Record<CompletenessStatus, string> = {
  "Data Belum Lengkap": "border-rose-200 bg-rose-50 text-rose-700",
  "Dokumen Belum Lengkap": "border-amber-200 bg-amber-50 text-amber-800",
  "Siap Diproses": "border-sky-200 bg-sky-50 text-sky-800",
  "Siap Masuk Manifest": "border-emerald-200 bg-emerald-50 text-emerald-800",
};

/** Untuk form publik: tampilkan bahwa data sudah ada tanpa membocorkan isinya. */
export function maskTail(value: string, visible = 4) {
  const v = String(value ?? "").trim();
  if (!v) return "";
  if (v.length <= visible) return "•".repeat(v.length);
  return `${"•".repeat(Math.max(4, v.length - visible))}${v.slice(-visible)}`;
}
