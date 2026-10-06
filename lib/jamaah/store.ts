import { randomBytes } from "node:crypto";
import { getPool } from "@/lib/db/connection";
import { ensureJamaahSchema } from "@/lib/jamaah/schema";
import {
  computeCompleteness,
  digitsOnly,
  type Companion,
  type Completeness,
  type CompletenessStatus,
  type ProfileFields,
} from "@/lib/jamaah/rules";

/**
 * Profil master jamaah (`jamaah_profiles`) + dokumennya (`jamaah_documents`).
 * Skema: scratch/add-jamaah-master.mjs.
 *
 * Satu profil ditulis dari dua jalur -- admin kantor (/api/jamaah) dan jamaah
 * sendiri lewat UmrahMe / link pendataan (/api/pendataan/<token>) -- jadi
 * keduanya memakai fungsi yang sama di sini, bukan salinan masing-masing.
 */

export type JamaahDocument = {
  docType: string;
  docSubtype: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  uploadedVia: string;
  uploadedAt: string;
};

export type JamaahDeparture = {
  participantId: string;
  bookingCode: string;
  packageId: string;
  packageName: string;
  departure: string;
};

export type JamaahRecord = ProfileFields & {
  id: string;
  notes: string;
  source: string;
  selfServiceToken: string;
  createdAt: string;
  updatedAt: string;
  documents: JamaahDocument[];
  departures: JamaahDeparture[];
  completeness: Completeness;
};

export type JamaahListItem = Pick<
  JamaahRecord,
  "id" | "fullName" | "gender" | "birthDate" | "nik" | "passportNumber" | "passportExpiry" | "phone" | "source" | "updatedAt" | "completeness"
> & { documentCount: number; departureNames: string[]; companionCount: number };

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: string) {
  return UUID_PATTERN.test(value);
}

async function db() {
  await ensureJamaahSchema();
  return getPool();
}

function newToken() {
  return randomBytes(24).toString("hex");
}

/**
 * Status dokumen peserta di manifest mengikuti kelengkapan profil yang tertaut,
 * jadi staf tidak perlu mengubahnya dua kali. Pemetaannya mengikuti arti tiap status:
 *   Siap Masuk Manifest -> Lengkap (visa pun sudah ada)
 *   Siap Diproses       -> Proses Visa (semua lengkap kecuali visa)
 *   lainnya             -> Belum Lengkap
 * Diperbarui setiap kali profil, dokumennya, atau tautannya berubah. Pengubahan manual
 * di manifest bertahan sampai profil itu berubah lagi.
 */
const STATUS_PESERTA: Record<CompletenessStatus, "Belum Lengkap" | "Proses Visa" | "Lengkap"> = {
  "Data Belum Lengkap": "Belum Lengkap",
  "Dokumen Belum Lengkap": "Belum Lengkap",
  "Siap Diproses": "Proses Visa",
  "Siap Masuk Manifest": "Lengkap",
};

export async function syncParticipantStatus(jamaahId: string): Promise<number> {
  const jamaah = await findJamaah(jamaahId);
  if (!jamaah) return 0;
  const res = await (await db()).query(
    `UPDATE participants SET document_status = $1, updated_at = NOW()
      WHERE jamaah_id = $2 AND document_status <> $1;`,
    [STATUS_PESERTA[jamaah.completeness.status], jamaahId],
  );
  return res.rowCount ?? 0;
}

/** Sinkron tidak boleh menggagalkan penyimpanan profil/dokumen yang sudah berhasil. */
async function syncParticipantStatusSafe(jamaahId: string) {
  try {
    await syncParticipantStatus(jamaahId);
  } catch (err) {
    console.error("Sinkron status peserta gagal:", err);
  }
}

const PROFILE_COLUMNS = `
  p.id,
  p.full_name            AS "fullName",
  p.passport_name        AS "passportName",
  p.father_name          AS "fatherName",
  p.gender,
  p.birth_place          AS "birthPlace",
  TO_CHAR(p.birth_date, 'YYYY-MM-DD')          AS "birthDate",
  p.nik,
  p.passport_number      AS "passportNumber",
  p.passport_issue_place AS "passportIssuePlace",
  TO_CHAR(p.passport_issue_date, 'YYYY-MM-DD') AS "passportIssueDate",
  TO_CHAR(p.passport_expiry, 'YYYY-MM-DD')     AS "passportExpiry",
  p.phone,
  p.address,
  p.province,
  p.regency,
  p.district,
  p.village,
  p.marital_status       AS "maritalStatus",
  p.education,
  p.occupation,
  p.emergency_name       AS "emergencyName",
  p.emergency_relation   AS "emergencyRelation",
  p.emergency_phone      AS "emergencyPhone",
  p.companions,
  p.notes,
  p.source,
  COALESCE(p.self_service_token, '') AS "selfServiceToken",
  p.created_at           AS "createdAt",
  p.updated_at           AS "updatedAt"
`;

const DOC_COLUMNS = `
  doc_type     AS "docType",
  doc_subtype  AS "docSubtype",
  file_name    AS "fileName",
  mime_type    AS "mimeType",
  size_bytes   AS "sizeBytes",
  uploaded_via AS "uploadedVia",
  uploaded_at  AS "uploadedAt"
`;

function normaliseCompanions(value: unknown): Companion[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((raw) => {
      const c = (raw ?? {}) as Record<string, unknown>;
      const jamaahId = String(c.jamaahId ?? "").trim();
      return {
        name: String(c.name ?? "").trim(),
        relation: String(c.relation ?? "").trim(),
        jamaahId: isUuid(jamaahId) ? jamaahId : null,
      };
    })
    .filter((c) => c.name)
    .slice(0, 20);
}

export async function listJamaah(): Promise<JamaahListItem[]> {
  const res = await (await db()).query(
    `SELECT ${PROFILE_COLUMNS},
            COALESCE(d.types, '{}')  AS "docTypes",
            COALESCE(pt.names, '{}') AS "departureNames"
       FROM jamaah_profiles p
       LEFT JOIN (
         SELECT jamaah_id, ARRAY_AGG(doc_type) AS types FROM jamaah_documents GROUP BY jamaah_id
       ) d ON d.jamaah_id = p.id
       LEFT JOIN (
         SELECT pa.jamaah_id, ARRAY_AGG(DISTINCT b.package_name) AS names
           FROM participants pa JOIN real_bookings b ON b.code = pa.booking_code
          WHERE pa.jamaah_id IS NOT NULL
          GROUP BY pa.jamaah_id
       ) pt ON pt.jamaah_id = p.id
      ORDER BY p.updated_at DESC;`,
  );

  return res.rows.map((row) => {
    const companions = normaliseCompanions(row.companions);
    const docTypes: string[] = row.docTypes ?? [];
    return {
      id: row.id,
      fullName: row.fullName,
      gender: row.gender,
      birthDate: row.birthDate,
      nik: row.nik,
      passportNumber: row.passportNumber,
      passportExpiry: row.passportExpiry,
      phone: row.phone,
      source: row.source,
      updatedAt: row.updatedAt,
      documentCount: docTypes.length,
      departureNames: row.departureNames ?? [],
      companionCount: companions.length,
      completeness: computeCompleteness({ ...row, companions }, docTypes),
    };
  });
}

async function hydrate(row: Record<string, any>): Promise<JamaahRecord> {
  const pool = await db();
  const [docs, departures] = await Promise.all([
    pool.query(`SELECT ${DOC_COLUMNS} FROM jamaah_documents WHERE jamaah_id = $1 ORDER BY uploaded_at DESC;`, [row.id]),
    pool.query(
      `SELECT pa.id AS "participantId", pa.booking_code AS "bookingCode",
              b.package_id AS "packageId", b.package_name AS "packageName", b.departure
         FROM participants pa JOIN real_bookings b ON b.code = pa.booking_code
        WHERE pa.jamaah_id = $1 ORDER BY pa.created_at DESC;`,
      [row.id],
    ),
  ]);

  const companions = normaliseCompanions(row.companions);
  const documents: JamaahDocument[] = docs.rows;
  const profile = { ...row, companions } as JamaahRecord;

  return {
    ...profile,
    documents,
    departures: departures.rows,
    completeness: computeCompleteness(profile, documents.map((d) => d.docType)),
  };
}

export async function findJamaah(id: string): Promise<JamaahRecord | null> {
  if (!isUuid(id)) return null;
  const res = await (await db()).query(`SELECT ${PROFILE_COLUMNS} FROM jamaah_profiles p WHERE p.id = $1 LIMIT 1;`, [id]);
  return res.rows[0] ? hydrate(res.rows[0]) : null;
}

export async function findJamaahByToken(token: string): Promise<JamaahRecord | null> {
  // Token selalu 48 karakter hex; tolak yang lain tanpa menyentuh database.
  if (!/^[0-9a-f]{48}$/.test(token)) return null;
  const res = await (await db()).query(
    `SELECT ${PROFILE_COLUMNS} FROM jamaah_profiles p WHERE p.self_service_token = $1 LIMIT 1;`,
    [token],
  );
  return res.rows[0] ? hydrate(res.rows[0]) : null;
}

/**
 * Jamaah yang sama sering didaftarkan dua kali: sekali oleh staf, sekali oleh
 * dirinya sendiri lewat UmrahMe. NIK & nomor paspor yang identik adalah tanda
 * paling kuat -- dicek sebelum insert supaya tidak lahir dua profil master.
 */
export async function findDuplicate(input: { nik?: string; passportNumber?: string }, exceptId?: string) {
  const nik = digitsOnly(input.nik ?? "");
  const passport = String(input.passportNumber ?? "").trim().toUpperCase();
  if (!nik && !passport) return null;

  const res = await (await db()).query(
    `SELECT id, full_name AS "fullName" FROM jamaah_profiles
      WHERE ((($1 <> '') AND nik = $1) OR (($2 <> '') AND upper(passport_number) = $2))
        AND ($3::uuid IS NULL OR id <> $3::uuid)
      LIMIT 1;`,
    [nik, passport, exceptId ?? null],
  );
  return (res.rows[0] as { id: string; fullName: string } | undefined) ?? null;
}

export type ProfileInput = Partial<ProfileFields> & { notes?: string };

/** Kolom yang boleh ditulis, dan cara menormalkan nilainya. */
const WRITABLE: Array<[keyof ProfileInput, string, (v: unknown) => unknown]> = [
  ["fullName", "full_name", (v) => String(v ?? "").trim().replace(/\s+/g, " ")],
  ["passportName", "passport_name", (v) => String(v ?? "").trim().replace(/\s+/g, " ").toUpperCase()],
  ["fatherName", "father_name", (v) => String(v ?? "").trim().replace(/\s+/g, " ")],
  ["gender", "gender", (v) => String(v ?? "").trim()],
  ["birthPlace", "birth_place", (v) => String(v ?? "").trim()],
  ["birthDate", "birth_date", (v) => (v ? String(v).slice(0, 10) : null)],
  ["nik", "nik", (v) => digitsOnly(String(v ?? ""))],
  ["passportNumber", "passport_number", (v) => String(v ?? "").trim().toUpperCase().replace(/\s+/g, "")],
  ["passportIssuePlace", "passport_issue_place", (v) => String(v ?? "").trim()],
  ["passportIssueDate", "passport_issue_date", (v) => (v ? String(v).slice(0, 10) : null)],
  ["passportExpiry", "passport_expiry", (v) => (v ? String(v).slice(0, 10) : null)],
  ["phone", "phone", (v) => String(v ?? "").trim()],
  ["address", "address", (v) => String(v ?? "").trim()],
  ["province", "province", (v) => String(v ?? "").trim()],
  ["regency", "regency", (v) => String(v ?? "").trim()],
  ["district", "district", (v) => String(v ?? "").trim()],
  ["village", "village", (v) => String(v ?? "").trim()],
  ["maritalStatus", "marital_status", (v) => String(v ?? "").trim()],
  ["education", "education", (v) => String(v ?? "").trim()],
  ["occupation", "occupation", (v) => String(v ?? "").trim()],
  ["emergencyName", "emergency_name", (v) => String(v ?? "").trim()],
  ["emergencyRelation", "emergency_relation", (v) => String(v ?? "").trim()],
  ["emergencyPhone", "emergency_phone", (v) => String(v ?? "").trim()],
  ["companions", "companions", (v) => JSON.stringify(normaliseCompanions(v))],
  ["notes", "notes", (v) => String(v ?? "").trim()],
];

export async function createJamaah(input: ProfileInput, opts: { actor: string; source: "admin" | "umrahme" }) {
  const columns = ["source", "created_by", "updated_by", "self_service_token"];
  const values: unknown[] = [opts.source, opts.actor, opts.actor, newToken()];

  for (const [key, column, normalise] of WRITABLE) {
    if (input[key] === undefined) continue;
    columns.push(column);
    values.push(normalise(input[key]));
  }

  const placeholders = values.map((_, i) => `$${i + 1}`).join(", ");
  const res = await (await db()).query(
    `INSERT INTO jamaah_profiles (${columns.join(", ")}) VALUES (${placeholders}) RETURNING id;`,
    values,
  );
  return (await findJamaah(res.rows[0].id))!;
}

export async function updateJamaah(id: string, patch: ProfileInput, actor: string): Promise<JamaahRecord | null> {
  if (!isUuid(id)) return null;

  const sets: string[] = [];
  const values: unknown[] = [];
  for (const [key, column, normalise] of WRITABLE) {
    if (patch[key] === undefined) continue;
    values.push(normalise(patch[key]));
    sets.push(`${column} = $${values.length}`);
  }
  if (sets.length === 0) return findJamaah(id);

  values.push(actor);
  sets.push(`updated_by = $${values.length}`, "updated_at = NOW()");
  values.push(id);

  const res = await (await db()).query(
    `UPDATE jamaah_profiles SET ${sets.join(", ")} WHERE id = $${values.length};`,
    values,
  );
  if (res.rowCount === 0) return null;
  await syncParticipantStatusSafe(id);
  return findJamaah(id);
}

/** Mengembalikan path berkas storage yang perlu ikut dihapus. */
export async function deleteJamaah(id: string): Promise<string[] | null> {
  if (!isUuid(id)) return null;
  const pool = await db();
  const docs = await pool.query(`SELECT storage_path FROM jamaah_documents WHERE jamaah_id = $1;`, [id]);
  const res = await pool.query(`DELETE FROM jamaah_profiles WHERE id = $1;`, [id]);
  if (res.rowCount === 0) return null;
  return docs.rows.map((r) => r.storage_path);
}

export async function regenerateToken(id: string): Promise<string | null> {
  if (!isUuid(id)) return null;
  const token = newToken();
  const res = await (await db()).query(
    `UPDATE jamaah_profiles SET self_service_token = $1, updated_at = NOW() WHERE id = $2;`,
    [token, id],
  );
  return res.rowCount ? token : null;
}

export async function findDocumentPath(jamaahId: string, docType: string) {
  if (!isUuid(jamaahId)) return null;
  const res = await (await db()).query(
    `SELECT storage_path AS "storagePath", file_name AS "fileName", mime_type AS "mimeType"
       FROM jamaah_documents WHERE jamaah_id = $1 AND doc_type = $2 LIMIT 1;`,
    [jamaahId, docType],
  );
  return (res.rows[0] as { storagePath: string; fileName: string; mimeType: string } | undefined) ?? null;
}

/**
 * Satu dokumen aktif per jenis. Mengembalikan path berkas LAMA (kalau ada)
 * supaya pemanggil menghapusnya dari storage setelah baris DB tergantikan --
 * urutan ini membuat kegagalan di tengah jalan menyisakan berkas yatim, bukan
 * baris DB yang menunjuk ke berkas yang sudah tidak ada.
 */
export async function upsertDocument(input: {
  jamaahId: string;
  docType: string;
  docSubtype: string;
  storagePath: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  uploadedVia: "admin" | "umrahme";
  uploadedBy: string;
}): Promise<{ previousPath: string | null }> {
  const client = await (await db()).connect();
  try {
    await client.query("BEGIN");
    const prev = await client.query(
      `SELECT storage_path FROM jamaah_documents WHERE jamaah_id = $1 AND doc_type = $2 FOR UPDATE;`,
      [input.jamaahId, input.docType],
    );
    await client.query(
      `INSERT INTO jamaah_documents
         (jamaah_id, doc_type, doc_subtype, storage_path, file_name, mime_type, size_bytes, uploaded_via, uploaded_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       ON CONFLICT (jamaah_id, doc_type) DO UPDATE SET
         doc_subtype = EXCLUDED.doc_subtype,
         storage_path = EXCLUDED.storage_path,
         file_name = EXCLUDED.file_name,
         mime_type = EXCLUDED.mime_type,
         size_bytes = EXCLUDED.size_bytes,
         uploaded_via = EXCLUDED.uploaded_via,
         uploaded_by = EXCLUDED.uploaded_by,
         uploaded_at = NOW();`,
      [
        input.jamaahId,
        input.docType,
        input.docSubtype,
        input.storagePath,
        input.fileName.slice(0, 200),
        input.mimeType,
        input.sizeBytes,
        input.uploadedVia,
        input.uploadedBy,
      ],
    );
    await client.query(`UPDATE jamaah_profiles SET updated_at = NOW() WHERE id = $1;`, [input.jamaahId]);
    await client.query("COMMIT");
    await syncParticipantStatusSafe(input.jamaahId);
    const previousPath: string | null = prev.rows[0]?.storage_path ?? null;
    return { previousPath: previousPath && previousPath !== input.storagePath ? previousPath : null };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function deleteDocument(jamaahId: string, docType: string): Promise<string | null> {
  if (!isUuid(jamaahId)) return null;
  const res = await (await db()).query(
    `DELETE FROM jamaah_documents WHERE jamaah_id = $1 AND doc_type = $2 RETURNING storage_path;`,
    [jamaahId, docType],
  );
  if (res.rows[0]) await syncParticipantStatusSafe(jamaahId);
  return res.rows[0]?.storage_path ?? null;
}

/**
 * Menyambungkan peserta booking (participants) ke profil master, supaya
 * manifest menarik data lengkap dari profil. jamaahId null = lepas tautan.
 */
export async function linkParticipant(participantId: string, jamaahId: string | null) {
  if (!isUuid(participantId) || (jamaahId !== null && !isUuid(jamaahId))) return false;
  const res = await (await db()).query(
    `UPDATE participants SET jamaah_id = $1, updated_at = NOW() WHERE id = $2;`,
    [jamaahId, participantId],
  );
  if (jamaahId && (res.rowCount ?? 0) > 0) await syncParticipantStatusSafe(jamaahId);
  return (res.rowCount ?? 0) > 0;
}

/**
 * Peserta booking lama lahir sebelum database jamaah ada. Ini membuat profil
 * master dari data yang sudah dimiliki peserta itu (nama, paspor, kontak) lalu
 * menautkannya -- atau, kalau paspornya sudah terdaftar, menautkan ke profil
 * yang ada alih-alih membuat kembaran.
 */
export async function createFromParticipant(participantId: string, actor: string) {
  if (!isUuid(participantId)) return null;
  const pool = await db();
  const res = await pool.query(
    `SELECT name, passport_number AS "passportNumber", contact FROM participants WHERE id = $1 LIMIT 1;`,
    [participantId],
  );
  const p = res.rows[0];
  if (!p) return null;

  const duplicate = await findDuplicate({ passportNumber: p.passportNumber });
  const contact = String(p.contact ?? "").trim();
  const jamaah =
    (duplicate && (await findJamaah(duplicate.id))) ||
    (await createJamaah(
      {
        fullName: p.name,
        passportNumber: p.passportNumber,
        // Form booking lama mengisi "-" kalau kontak kosong; itu bukan nomor.
        phone: digitsOnly(contact).length >= 9 ? contact : "",
      },
      { actor, source: "admin" },
    ));

  await linkParticipant(participantId, jamaah.id);
  return { jamaah, reused: Boolean(duplicate) };
}

/** Tautkan peserta yang belum punya profil ke profil dengan nomor paspor yang sama persis. */
export async function autoLinkByPassport(packageId: string): Promise<number> {
  const res = await (await db()).query(
    `UPDATE participants pa
        SET jamaah_id = jp.id, updated_at = NOW()
       FROM real_bookings b, jamaah_profiles jp
      WHERE b.code = pa.booking_code
        AND b.package_id = $1
        AND pa.jamaah_id IS NULL
        AND pa.passport_number <> ''
        AND upper(replace(pa.passport_number, ' ', '')) = upper(jp.passport_number)
      RETURNING pa.jamaah_id AS "jamaahId";`,
    [packageId],
  );
  for (const id of new Set(res.rows.map((r) => r.jamaahId as string))) await syncParticipantStatusSafe(id);
  return res.rowCount ?? 0;
}
