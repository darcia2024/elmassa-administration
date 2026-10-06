import { getPool } from "@/lib/db/connection";
import { ensureJamaahSchema } from "@/lib/jamaah/schema";
import { parseIndonesianDate } from "@/lib/format/date";
import type { Companion } from "@/lib/jamaah/rules";

/**
 * Data untuk ketiga manifest, ditarik dari peserta grup keberangkatan yang
 * sudah ditautkan ke profil master (participants.jamaah_id). Tidak ada yang
 * diketik ulang: semua kolom manifest berasal dari Database Jamaah, kecuali
 * nomor & tanggal visa yang memang per keberangkatan (participants).
 */

export const MANIFEST_TYPES = ["siskopatuh", "domestik", "internasional"] as const;
export type ManifestType = (typeof MANIFEST_TYPES)[number];

export const MANIFEST_LABELS: Record<ManifestType, string> = {
  siskopatuh: "Manifest Siskopatuh",
  domestik: "Manifest Check-in Domestik",
  internasional: "Manifest Check-in Internasional",
};

export type Passenger = {
  participantId: string;
  jamaahId: string;
  bookingCode: string;
  /** Kolom MR/MRS/MSTR/MISS/INF, mis. "MISS (infant)". */
  title: string;
  /** Nama untuk manifest maskapai: nama di paspor, huruf besar. */
  name: string;
  fullName: string;
  fatherName: string;
  gender: string;
  nik: string;
  passportNumber: string;
  passportIssuePlace: string;
  passportIssueDate: string;
  passportExpiry: string;
  birthPlace: string;
  birthDate: string;
  address: string;
  province: string;
  regency: string;
  district: string;
  village: string;
  phone: string;
  maritalStatus: string;
  education: string;
  occupation: string;
  visaNumber: string;
  visaExpiry: string;
  /** Kelompok keluarga untuk kolom KETERANGAN/EXPLAN (sel digabung). */
  groupKey: string;
  /** Kolom yang wajib untuk tiap jenis manifest tapi masih kosong. */
  missing: Record<ManifestType, string[]>;
};

export type PassengerGroup = { key: string; label: string; participantIds: string[] };

export type ManifestData = {
  departure: { id: string; name: string; departureDate: string | null };
  passengers: Passenger[];
  groups: PassengerGroup[];
  /** Peserta yang belum ditautkan ke profil master -- tidak bisa masuk manifest. */
  unlinked: Array<{ participantId: string; name: string; bookingCode: string }>;
};

/** Umur dalam tahun penuh pada tanggal `onDate` (keduanya YYYY-MM-DD). */
export function ageOn(birthDate: string, onDate: string) {
  const [by, bm, bd] = birthDate.split("-").map(Number);
  const [y, m, d] = onDate.split("-").map(Number);
  return y - by - (m < bm || (m === bm && d < bd) ? 1 : 0);
}

/**
 * Titel ala manifest maskapai, mengikuti contoh manifest GA & internasional
 * kantor: dewasa MR/MRS (perempuan dewasa selalu MRS di contoh itu), anak di
 * bawah 12 tahun MSTR/MISS, bayi di bawah 2 tahun ditambah "(infant)". Umur
 * dihitung pada tanggal keberangkatan, bukan hari ini.
 */
export function airlineTitle(gender: string, birthDate: string, departureDate: string) {
  const male = gender === "L";
  if (!birthDate) return male ? "MR" : gender === "P" ? "MRS" : "";
  const age = ageOn(birthDate, departureDate);
  if (age < 2) return male ? "MSTR (infant)" : "MISS (infant)";
  if (age < 12) return male ? "MSTR" : "MISS";
  return male ? "MR" : "MRS";
}

const AIRLINE_REQUIRED: Array<[keyof Passenger, string]> = [
  ["gender", "Jenis kelamin"],
  ["birthDate", "Tanggal lahir"],
  ["passportNumber", "No. paspor"],
  ["passportIssueDate", "Tgl terbit paspor"],
  ["passportExpiry", "Masa berlaku paspor"],
];

const SISKOPATUH_REQUIRED: Array<[keyof Passenger, string]> = [
  ["fatherName", "Nama ayah"],
  ["nik", "NIK"],
  ["passportNumber", "No. paspor"],
  ["passportIssueDate", "Tgl terbit paspor"],
  ["passportIssuePlace", "Kota paspor"],
  ["birthPlace", "Tempat lahir"],
  ["birthDate", "Tanggal lahir"],
  ["address", "Alamat"],
  ["province", "Provinsi"],
  ["regency", "Kabupaten"],
  ["district", "Kecamatan"],
  ["village", "Kelurahan"],
  ["maritalStatus", "Status nikah"],
  ["education", "Pendidikan"],
  ["occupation", "Pekerjaan"],
];

function missingOf(p: Passenger, required: Array<[keyof Passenger, string]>) {
  return required.filter(([key]) => !String(p[key] ?? "").trim()).map(([, label]) => label);
}

/**
 * Keluarga = peserta dalam satu booking. Dua orang beda jenis kelamin yang
 * saling tercatat sebagai suami/istri di "Jamaah Penyerta" diberi label
 * SUAMI ISTRI, kelompok lain FAMILY -- dua label yang dipakai contoh manifest
 * kantor. Labelnya tetap bisa diubah staf sebelum export.
 */
function groupLabel(members: Array<{ gender: string; fullName: string; companions: Companion[]; jamaahId: string }>) {
  if (members.length < 2) return "";
  if (members.length === 2) {
    const [a, b] = members;
    const spouse = (from: typeof a, to: typeof a) =>
      from.companions.some(
        (c) =>
          ["Suami", "Istri"].includes(c.relation) &&
          (c.jamaahId === to.jamaahId || c.name.trim().toLowerCase() === to.fullName.trim().toLowerCase()),
      );
    if (a.gender !== b.gender && (spouse(a, b) || spouse(b, a))) return "SUAMI ISTRI";
  }
  return "FAMILY";
}

export async function loadManifestData(packageId: string, participantIds?: string[]): Promise<ManifestData | null> {
  await ensureJamaahSchema();
  const pool = getPool();

  const pkg = await pool.query(
    `SELECT id, name, departure_date AS "departureDate" FROM published_packages WHERE id = $1 LIMIT 1;`,
    [packageId],
  );
  if (pkg.rowCount === 0) return null;
  const departureDate = parseIndonesianDate(pkg.rows[0].departureDate);

  const rows = await pool.query(
    `SELECT pa.id AS "participantId", pa.name AS "participantName", pa.booking_code AS "bookingCode",
            pa.jamaah_id AS "jamaahId", pa.visa_number AS "visaNumber",
            TO_CHAR(pa.visa_expiry, 'YYYY-MM-DD') AS "visaExpiry",
            jp.full_name AS "fullName", jp.passport_name AS "passportName", jp.father_name AS "fatherName",
            jp.gender, jp.nik, jp.passport_number AS "passportNumber",
            jp.passport_issue_place AS "passportIssuePlace",
            TO_CHAR(jp.passport_issue_date, 'YYYY-MM-DD') AS "passportIssueDate",
            TO_CHAR(jp.passport_expiry, 'YYYY-MM-DD') AS "passportExpiry",
            jp.birth_place AS "birthPlace", TO_CHAR(jp.birth_date, 'YYYY-MM-DD') AS "birthDate",
            jp.address, jp.province, jp.regency, jp.district, jp.village, jp.phone,
            jp.marital_status AS "maritalStatus", jp.education, jp.occupation, jp.companions
       FROM participants pa
       JOIN real_bookings b ON b.code = pa.booking_code
       LEFT JOIN jamaah_profiles jp ON jp.id = pa.jamaah_id
      WHERE b.package_id = $1
        AND ($2::uuid[] IS NULL OR pa.id = ANY($2::uuid[]))
      ORDER BY b.created_at ASC, pa.created_at ASC;`,
    [packageId, participantIds && participantIds.length > 0 ? participantIds : null],
  );

  const unlinked: ManifestData["unlinked"] = [];
  const linked: Array<Record<string, any>> = [];
  for (const r of rows.rows) {
    if (r.jamaahId) linked.push(r);
    else unlinked.push({ participantId: r.participantId, name: r.participantName, bookingCode: r.bookingCode });
  }

  // Tanpa tanggal berangkat yang terbaca, umur dihitung per hari ini.
  const onDate = departureDate ?? new Date().toISOString().slice(0, 10);

  const passengers: Passenger[] = linked.map((r) => {
    const p: Passenger = {
      participantId: r.participantId,
      jamaahId: r.jamaahId,
      bookingCode: r.bookingCode,
      title: airlineTitle(r.gender, r.birthDate ?? "", onDate),
      name: String(r.passportName || r.fullName || "").toUpperCase(),
      fullName: String(r.fullName ?? "").toUpperCase(),
      fatherName: String(r.fatherName ?? "").toUpperCase(),
      gender: r.gender ?? "",
      nik: r.nik ?? "",
      passportNumber: r.passportNumber ?? "",
      passportIssuePlace: String(r.passportIssuePlace ?? "").toUpperCase(),
      passportIssueDate: r.passportIssueDate ?? "",
      passportExpiry: r.passportExpiry ?? "",
      birthPlace: String(r.birthPlace ?? "").toUpperCase(),
      birthDate: r.birthDate ?? "",
      address: String(r.address ?? "").toUpperCase(),
      province: r.province ?? "",
      regency: r.regency ?? "",
      district: String(r.district ?? "").toUpperCase(),
      village: String(r.village ?? "").toUpperCase(),
      phone: r.phone ?? "",
      maritalStatus: r.maritalStatus ?? "",
      education: r.education ?? "",
      occupation: r.occupation ?? "",
      visaNumber: r.visaNumber ?? "",
      visaExpiry: r.visaExpiry ?? "",
      groupKey: r.bookingCode,
      missing: { siskopatuh: [], domestik: [], internasional: [] },
    };
    const airline = missingOf(p, AIRLINE_REQUIRED);
    p.missing = { siskopatuh: missingOf(p, SISKOPATUH_REQUIRED), domestik: airline, internasional: airline };
    return p;
  });

  const groups: PassengerGroup[] = [];
  for (const p of passengers) {
    let g = groups.find((x) => x.key === p.groupKey);
    if (!g) {
      g = { key: p.groupKey, label: "", participantIds: [] };
      groups.push(g);
    }
    g.participantIds.push(p.participantId);
  }
  for (const g of groups) {
    const members = linked.filter((r) => g.participantIds.includes(r.participantId));
    g.label = groupLabel(
      members.map((m) => ({
        gender: m.gender ?? "",
        fullName: m.fullName ?? "",
        jamaahId: m.jamaahId,
        companions: Array.isArray(m.companions) ? m.companions : [],
      })),
    );
  }

  return {
    departure: { id: pkg.rows[0].id, name: pkg.rows[0].name, departureDate },
    passengers,
    groups,
    unlinked,
  };
}
