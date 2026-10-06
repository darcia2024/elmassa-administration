import { maskTail } from "@/lib/jamaah/rules";
import type { JamaahRecord } from "@/lib/jamaah/store";

/**
 * Versi profil untuk jalur publik (/api/pendataan/<token>).
 *
 * Token pendataan bisa diperoleh siapa pun yang lolos login UmrahMe, dan login
 * itu hanya mencocokkan nama (lihat scratch/umrahme-login-jamaah-rpc.mjs).
 * Karena itu jalur ini dirancang untuk MENGISI data, bukan membacanya: NIK,
 * paspor, nomor HP, alamat (s/d kecamatan & kelurahan), dan tanggal lahir hanya dikabarkan "sudah terisi"
 * (atau disamarkan), dan berkas dokumen tidak pernah bisa diunduh dari sini.
 */
export function toPublicView(j: JamaahRecord) {
  return {
    fullName: j.fullName,
    passportName: j.passportName,
    fatherName: j.fatherName,
    gender: j.gender,
    birthPlace: j.birthPlace,
    passportIssuePlace: j.passportIssuePlace,
    province: j.province,
    regency: j.regency,
    maritalStatus: j.maritalStatus,
    education: j.education,
    occupation: j.occupation,
    emergencyName: j.emergencyName,
    emergencyRelation: j.emergencyRelation,
    companions: j.companions.map((c) => ({ name: c.name, relation: c.relation })),
    masked: {
      nik: maskTail(j.nik),
      passportNumber: maskTail(j.passportNumber, 3),
      phone: maskTail(j.phone),
      emergencyPhone: maskTail(j.emergencyPhone),
    },
    filled: {
      birthDate: Boolean(j.birthDate),
      passportIssueDate: Boolean(j.passportIssueDate),
      passportExpiry: Boolean(j.passportExpiry),
      address: Boolean(j.address),
      district: Boolean(j.district),
      village: Boolean(j.village),
    },
    documents: j.documents.map((d) => ({ docType: d.docType, docSubtype: d.docSubtype, uploadedAt: d.uploadedAt })),
    completeness: j.completeness,
  };
}

export type PublicJamaahView = ReturnType<typeof toPublicView>;

/** Origin aplikasi UmrahMe (env UMRAHME_ORIGINS), tanpa garis miring di akhir. */
function umrahmeOrigins(): string[] {
  return (process.env.UMRAHME_ORIGINS ?? "")
    .split(",")
    .map((o) => o.trim().replace(/\/+$/, ""))
    .filter(Boolean);
}

/**
 * Alamat tombol "Kembali ke Dashboard" di form pendataan. UmrahMe mengirim
 * halaman asalnya lewat ?kembali=; hanya diterima kalau origin-nya terdaftar,
 * supaya link pendataan tidak bisa dipakai untuk mengarahkan jamaah ke situs lain.
 * Tanpa ?kembali= yang sah, jatuh ke beranda origin UmrahMe pertama.
 */
export function safeReturnUrl(raw: string | undefined): string | null {
  const allowed = umrahmeOrigins();
  if (raw) {
    try {
      const url = new URL(raw);
      if (allowed.includes(url.origin)) return url.toString();
    } catch {
      // bukan URL absolut: abaikan
    }
  }
  return allowed[0] ? `${allowed[0]}/beranda` : null;
}

/** Origin aplikasi UmrahMe yang boleh memanggil API pendataan langsung dari browser. */
export function corsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get("origin");
  const allowed = umrahmeOrigins();

  if (!origin || !allowed.includes(origin)) return { Vary: "Origin" };
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, PUT, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "600",
    Vary: "Origin",
  };
}
