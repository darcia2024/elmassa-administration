import { getPool } from "@/lib/db/connection";

/**
 * Official letters, stored in `letters`.
 *
 * Before this, the one letter the app could produce (rekomendasi paspor) was
 * typed by hand into a preview and printed — no number, no record, no way to
 * reprint a copy a jamaah lost. Every letter now gets a sequential number and
 * stays searchable.
 */

export type LetterTypeId =
  | "pemberitahuan"
  | "paspor-baru"
  | "paspor-tambah-nama"
  | "paspor-ganti"
  | "izin-cuti";

export type LetterTypeDef = {
  id: LetterTypeId;
  label: string;
  shortLabel: string;
  /** Slot inside the letter number, e.g. 001/REK-PSP/EMT/VIII/2026 */
  code: string;
  subject: string;
  /** Who the letter is addressed to by default. */
  recipient: string;
  description: string;
  /** Fields this type needs beyond name/NIK — drives the form and validation. */
  requires: Array<"passportNumber" | "birthPlace" | "birthDate" | "address" | "employer" | "leaveDates">;
};

export const LETTER_TYPES: LetterTypeDef[] = [
  {
    id: "pemberitahuan",
    label: "Surat Pemberitahuan",
    shortLabel: "Pemberitahuan",
    code: "SP",
    subject: "Pemberitahuan Keberangkatan Ibadah Umrah",
    recipient: "Yth. Bapak/Ibu Calon Jamaah Umrah",
    description: "Pemberitahuan umum ke jamaah: jadwal manasik, pelunasan, atau perubahan keberangkatan.",
    requires: [],
  },
  {
    id: "paspor-baru",
    label: "Surat Rekomendasi Pembuatan Paspor",
    shortLabel: "Pembuatan Paspor",
    code: "REK-PSP",
    subject: "Rekomendasi Pembuatan Paspor RI (Umrah)",
    recipient: "Yth. Kepala Kantor Imigrasi",
    description: "Pengantar ke Imigrasi untuk jamaah yang belum punya paspor.",
    requires: ["birthPlace", "birthDate", "address"],
  },
  {
    id: "paspor-tambah-nama",
    label: "Surat Rekomendasi Penambahan Nama Paspor",
    shortLabel: "Penambahan Nama",
    code: "REK-PSP-TN",
    subject: "Rekomendasi Penambahan Nama pada Paspor RI (Umrah)",
    recipient: "Yth. Kepala Kantor Imigrasi",
    description: "Untuk jamaah yang namanya kurang dari 3 suku kata — syarat visa Arab Saudi.",
    requires: ["passportNumber", "birthPlace", "birthDate", "address"],
  },
  {
    id: "paspor-ganti",
    label: "Surat Rekomendasi Penggantian Paspor",
    shortLabel: "Penggantian Paspor",
    code: "REK-PSP-GT",
    subject: "Rekomendasi Penggantian Paspor RI (Umrah)",
    recipient: "Yth. Kepala Kantor Imigrasi",
    description: "Paspor habis masa berlaku, rusak, atau hilang.",
    requires: ["passportNumber", "birthPlace", "birthDate", "address"],
  },
  {
    id: "izin-cuti",
    label: "Surat Rekomendasi Izin Cuti",
    shortLabel: "Izin Cuti",
    code: "REK-CT",
    subject: "Permohonan Izin Cuti untuk Ibadah Umrah",
    recipient: "Yth. Pimpinan Instansi/Perusahaan",
    description: "Permohonan cuti ke tempat kerja jamaah selama masa keberangkatan.",
    requires: ["employer", "leaveDates"],
  },
];

export const LETTER_TYPE_IDS = LETTER_TYPES.map((t) => t.id);

export function findLetterType(id: string): LetterTypeDef | undefined {
  return LETTER_TYPES.find((t) => t.id === id);
}

export type LetterRecord = {
  id: string;
  letterNumber: string;
  letterType: LetterTypeId;
  letterTypeLabel: string;
  recipientName: string;
  recipientNik: string;
  passportNumber: string;
  birthPlace: string;
  birthDate: string;
  address: string;
  bookingCode: string;
  packageId: string;
  packageName: string;
  departureDate: string;
  subject: string;
  body: string;
  extra: Record<string, unknown>;
  issuedDate: string;
  issuedBy: string;
  status: string;
  createdAt: string;
};

const SELECT_COLUMNS = `
  id,
  letter_number   AS "letterNumber",
  letter_type     AS "letterType",
  recipient_name  AS "recipientName",
  recipient_nik   AS "recipientNik",
  passport_number AS "passportNumber",
  birth_place     AS "birthPlace",
  birth_date      AS "birthDate",
  address,
  booking_code    AS "bookingCode",
  package_id      AS "packageId",
  package_name    AS "packageName",
  departure_date  AS "departureDate",
  subject,
  body,
  extra,
  TO_CHAR(issued_date, 'YYYY-MM-DD') AS "issuedDate",
  issued_by       AS "issuedBy",
  status,
  created_at      AS "createdAt"
`;

const ROMAN_MONTHS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];

function decorate(row: Record<string, unknown>): LetterRecord {
  const letterType = String(row.letterType) as LetterTypeId;
  return {
    ...(row as unknown as LetterRecord),
    letterType,
    letterTypeLabel: findLetterType(letterType)?.label ?? letterType,
    extra: (row.extra as Record<string, unknown>) ?? {},
  };
}

export async function listLetters(filter?: { letterType?: string; query?: string }): Promise<LetterRecord[]> {
  const conditions: string[] = [];
  const values: unknown[] = [];

  if (filter?.letterType) {
    values.push(filter.letterType);
    conditions.push(`letter_type = $${values.length}`);
  }

  if (filter?.query) {
    values.push(`%${filter.query}%`);
    conditions.push(
      `(recipient_name ILIKE $${values.length} OR letter_number ILIKE $${values.length} OR recipient_nik ILIKE $${values.length})`,
    );
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const res = await getPool().query(
    `SELECT ${SELECT_COLUMNS} FROM letters ${where} ORDER BY issued_date DESC, created_at DESC;`,
    values,
  );
  return res.rows.map(decorate);
}

export async function findLetter(id: string): Promise<LetterRecord | null> {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) return null;

  const res = await getPool().query(`SELECT ${SELECT_COLUMNS} FROM letters WHERE id = $1 LIMIT 1;`, [id]);
  return res.rows[0] ? decorate(res.rows[0]) : null;
}

/**
 * Next number for a type within a year, e.g. 007/REK-PSP/EMT/VIII/2026.
 * The sequence is derived from the highest number already issued for that
 * type+year rather than a counter column, so deleting a draft can't leave a
 * permanent hole and two tables can't disagree about where the series is.
 */
async function nextLetterNumber(
  client: import("pg").PoolClient,
  type: LetterTypeDef,
  issuedDate: string,
): Promise<string> {
  const year = issuedDate.slice(0, 4);
  const monthIndex = Number(issuedDate.slice(5, 7)) - 1;
  const roman = ROMAN_MONTHS[monthIndex] ?? "I";

  const res = await client.query(
    `SELECT letter_number FROM letters
      WHERE letter_type = $1 AND EXTRACT(YEAR FROM issued_date)::text = $2;`,
    [type.id, year],
  );

  let highest = 0;
  for (const row of res.rows) {
    const seq = Number(String(row.letter_number).split("/")[0]);
    if (Number.isFinite(seq) && seq > highest) highest = seq;
  }

  return `${String(highest + 1).padStart(3, "0")}/${type.code}/EMT/${roman}/${year}`;
}

export async function createLetter(input: {
  letterType: string;
  recipientName: string;
  recipientNik?: string;
  passportNumber?: string;
  birthPlace?: string;
  birthDate?: string;
  address?: string;
  bookingCode?: string;
  packageId?: string;
  packageName?: string;
  departureDate?: string;
  subject?: string;
  body?: string;
  extra?: Record<string, unknown>;
  issuedDate: string;
  issuedBy?: string;
}): Promise<LetterRecord> {
  const type = findLetterType(input.letterType);
  if (!type) throw new Error(`Jenis surat tidak dikenal: ${input.letterType}`);

  const client = await getPool().connect();
  try {
    // letter_number is UNIQUE, so two staff issuing at the same instant collide
    // on the insert rather than silently sharing a number. Recompute and retry.
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const letterNumber = await nextLetterNumber(client, type, input.issuedDate);

      try {
        const res = await client.query(
          `INSERT INTO letters (
             letter_number, letter_type, recipient_name, recipient_nik, passport_number,
             birth_place, birth_date, address, booking_code, package_id, package_name,
             departure_date, subject, body, extra, issued_date, issued_by
           ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
           RETURNING ${SELECT_COLUMNS};`,
          [
            letterNumber,
            type.id,
            input.recipientName.trim(),
            (input.recipientNik ?? "").trim(),
            (input.passportNumber ?? "").trim(),
            (input.birthPlace ?? "").trim(),
            (input.birthDate ?? "").trim(),
            (input.address ?? "").trim(),
            (input.bookingCode ?? "").trim(),
            (input.packageId ?? "").trim(),
            (input.packageName ?? "").trim(),
            (input.departureDate ?? "").trim(),
            (input.subject ?? type.subject).trim(),
            (input.body ?? "").trim(),
            JSON.stringify(input.extra ?? {}),
            input.issuedDate,
            (input.issuedBy ?? "").trim(),
          ],
        );

        return decorate(res.rows[0]);
      } catch (err) {
        const code = (err as { code?: string }).code;
        if (code !== "23505") throw err; // not a unique violation — real failure
      }
    }

    throw new Error("Gagal menerbitkan nomor surat setelah beberapa percobaan. Coba lagi.");
  } finally {
    client.release();
  }
}

export async function updateLetter(
  id: string,
  patch: {
    recipientName?: string;
    recipientNik?: string;
    passportNumber?: string;
    birthPlace?: string;
    birthDate?: string;
    address?: string;
    subject?: string;
    body?: string;
    status?: string;
    issuedBy?: string;
  },
): Promise<LetterRecord | null> {
  const existing = await findLetter(id);
  if (!existing) return null;

  const sets: string[] = [];
  const values: unknown[] = [];
  const push = (column: string, value: unknown) => {
    values.push(value);
    sets.push(`${column} = $${values.length}`);
  };

  // letter_number and letter_type are deliberately not patchable: renumbering
  // an issued letter would break the series it was drawn from.
  if (patch.recipientName !== undefined) push("recipient_name", patch.recipientName.trim());
  if (patch.recipientNik !== undefined) push("recipient_nik", patch.recipientNik.trim());
  if (patch.passportNumber !== undefined) push("passport_number", patch.passportNumber.trim());
  if (patch.birthPlace !== undefined) push("birth_place", patch.birthPlace.trim());
  if (patch.birthDate !== undefined) push("birth_date", patch.birthDate.trim());
  if (patch.address !== undefined) push("address", patch.address.trim());
  if (patch.subject !== undefined) push("subject", patch.subject.trim());
  if (patch.body !== undefined) push("body", patch.body.trim());
  if (patch.status !== undefined) push("status", patch.status);
  if (patch.issuedBy !== undefined) push("issued_by", patch.issuedBy.trim());

  if (sets.length === 0) return existing;

  sets.push("updated_at = NOW()");
  values.push(id);

  const res = await getPool().query(
    `UPDATE letters SET ${sets.join(", ")} WHERE id = $${values.length} RETURNING ${SELECT_COLUMNS};`,
    values,
  );

  return res.rows[0] ? decorate(res.rows[0]) : null;
}

export async function deleteLetter(id: string): Promise<boolean> {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) return false;

  const res = await getPool().query(`DELETE FROM letters WHERE id = $1;`, [id]);
  return (res.rowCount ?? 0) > 0;
}

/**
 * Jamaah the letter form can be pre-filled from — name, NIK and passport that
 * were already captured at booking, so staff don't retype what the system has.
 */
export type LetterCandidate = {
  name: string;
  nik: string;
  passportNumber: string;
  bookingCode: string;
  packageId: string;
  packageName: string;
  departureDate: string;
  phone: string;
};

export async function listLetterCandidates(): Promise<LetterCandidate[]> {
  const res = await getPool().query(`
    SELECT
      p.name,
      b.nik,
      p.passport_number AS "passportNumber",
      b.code            AS "bookingCode",
      b.package_id      AS "packageId",
      b.package_name    AS "packageName",
      COALESCE(pp.departure_date, b.departure) AS "departureDate",
      b.phone
    FROM participants p
    JOIN real_bookings b ON b.code = p.booking_code
    LEFT JOIN published_packages pp ON pp.id = b.package_id
    ORDER BY p.name ASC;
  `);
  return res.rows;
}
