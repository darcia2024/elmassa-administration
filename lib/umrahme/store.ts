import { getPool } from "@/lib/db/connection";

/**
 * Penerbitan akun digital UmrahMe, dan kuota lisensi yang membiayainya.
 *
 * Kuota dijual vendor UmrahMe ke travel (Rp 35.000/pax) dan disimpan di
 * `license_quota` pada Supabase yang sama. Sebelumnya saldo ini hanya angka di
 * localStorage browser, jadi siapa pun bisa menaikkannya lewat DevTools.
 *
 * Dua hal yang dijaga di sini:
 *   1. Kuota hanya terpotong untuk akun yang BENAR-BENAR baru. Route-nya
 *      memakai UPSERT, jadi menyimpan ulang jamaah yang sama tidak boleh
 *      menagih kuota kedua kali.
 *   2. Pemotongan kuota dan penulisan akun berada dalam SATU transaksi. Kalau
 *      dipisah, akun bisa terbit tanpa kuota berkurang.
 */

/** Satu deployment melayani satu travel; lihat scratch/umrahme-align-schema.mjs. */
export const TENANT_ID = "el-massa";

export type QuotaInfo = {
  balance: number;
  pricePerUnit: number;
  issued: number;
};

export async function getQuota(): Promise<QuotaInfo> {
  const res = await getPool().query(
    `SELECT
       COALESCE(q.balance, 0)::int        AS "balance",
       COALESCE(q.price_per_unit, 35000)::int AS "pricePerUnit",
       (SELECT COUNT(*)::int FROM jamaah_accounts WHERE tenant_id = $1) AS "issued"
     FROM (SELECT 1) x
     LEFT JOIN license_quota q ON q.tenant_id = $1;`,
    [TENANT_ID],
  );
  return res.rows[0] ?? { balance: 0, pricePerUnit: 35000, issued: 0 };
}

export type LedgerRow = {
  delta: number;
  kind: string;
  note: string;
  reference: string;
  createdAt: string;
};

export async function listQuotaLedger(limit = 50): Promise<LedgerRow[]> {
  const res = await getPool().query(
    `SELECT delta, kind, note, reference, created_at AS "createdAt"
       FROM license_ledger WHERE tenant_id = $1
      ORDER BY id DESC LIMIT $2;`,
    [TENANT_ID, limit],
  );
  return res.rows;
}

/**
 * Memastikan grup keberangkatan di sistem travel punya pasangan batch di
 * UmrahMe. Tanpa ini `jamaah_accounts.keberangkatan_id` kosong, dan aplikasi
 * jamaah -- yang menyaring dengan .eq('keberangkatan_id', ...) -- tidak akan
 * menemukan satu pun akun yang diterbitkan dari sini.
 */
export async function ensureKeberangkatan(
  client: import("pg").PoolClient,
  packageId: string,
): Promise<string | null> {
  if (!packageId) return null;

  const existing = await client.query(
    `SELECT id FROM keberangkatan WHERE tenant_id = $1 AND package_id = $2 LIMIT 1;`,
    [TENANT_ID, packageId],
  );
  if (existing.rowCount && existing.rows[0]) return existing.rows[0].id;

  const pkg = await client.query(
    `SELECT name, departure_date AS "departureDate", return_date AS "returnDate",
            makkah_hotel AS "makkahHotel", madinah_hotel AS "madinahHotel", start_point AS "startPoint"
       FROM published_packages WHERE id = $1 LIMIT 1;`,
    [packageId],
  );
  if (pkg.rowCount === 0) return null;

  const p = pkg.rows[0];
  const inserted = await client.query(
    `INSERT INTO keberangkatan
       (tenant_id, package_id, nama_batch, tanggal_keberangkatan, tanggal_kepulangan,
        hotel_makkah, hotel_madinah, meeting_point)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id;`,
    [TENANT_ID, packageId, p.name, p.departureDate, p.returnDate, p.makkahHotel, p.madinahHotel, p.startPoint],
  );
  return inserted.rows[0].id;
}

export type IssueInput = Record<string, unknown> & { id?: string; packageId?: string };

export type IssueResult =
  | { ok: true; issued: number; reused: number; balance: number }
  | { ok: false; error: string; balance: number };

export async function issueAccounts(accounts: IssueInput[], actor = ""): Promise<IssueResult> {
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");

    const ids = accounts.map((a) => String(a.id ?? "")).filter(Boolean);
    const existing = ids.length
      ? await client.query(`SELECT id FROM jamaah_accounts WHERE id = ANY($1::text[]);`, [ids])
      : { rows: [] as Array<{ id: string }> };
    const known = new Set(existing.rows.map((r) => r.id));

    // Hanya akun baru yang menagih kuota; sisanya sekadar pembaruan data.
    const fresh = accounts.filter((a) => !known.has(String(a.id ?? "")));

    if (fresh.length > 0) {
      try {
        await client.query(`SELECT license_consume($1, $2, $3, $4);`, [
          TENANT_ID,
          fresh.length,
          String(accounts[0]?.packageId ?? ""),
          actor,
        ]);
      } catch (err) {
        await client.query("ROLLBACK");
        const quota = await getQuota();
        return { ok: false, error: (err as Error).message, balance: quota.balance };
      }
    }

    const batchIds = new Map<string, string | null>();

    for (const acc of accounts) {
      const packageId = String(acc.packageId ?? "");
      if (!batchIds.has(packageId)) {
        batchIds.set(packageId, await ensureKeberangkatan(client, packageId));
      }

      await client.query(
        `INSERT INTO jamaah_accounts
           (id, nama, nomor_jamaah, nik, paspor, tgl_lahir_usia, golongan_darah, telepon,
            kontak_darurat, alamat_lengkap, batch, rombongan, bus, kamar, flight, e_visa,
            titik_kumpul, status, tanggal_terbit, tenant_id, keberangkatan_id)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21)
         ON CONFLICT (id) DO UPDATE SET
           nama = EXCLUDED.nama,
           nomor_jamaah = EXCLUDED.nomor_jamaah,
           nik = EXCLUDED.nik,
           paspor = EXCLUDED.paspor,
           rombongan = EXCLUDED.rombongan,
           bus = EXCLUDED.bus,
           kamar = EXCLUDED.kamar,
           flight = EXCLUDED.flight,
           e_visa = EXCLUDED.e_visa,
           tenant_id = EXCLUDED.tenant_id,
           keberangkatan_id = COALESCE(EXCLUDED.keberangkatan_id, jamaah_accounts.keberangkatan_id);`,
        [
          String(acc.id ?? Date.now()),
          acc.nama ?? "",
          acc.nomorJamaah ?? "",
          acc.nik ?? "",
          acc.paspor ?? "",
          acc.tglLahirUsia ?? "",
          acc.golonganDarah ?? "",
          acc.telepon ?? "",
          acc.kontakDarurat ?? "",
          acc.alamatLengkap ?? "",
          acc.batch ?? "",
          acc.rombongan ?? "",
          acc.bus ?? "",
          acc.kamar ?? "",
          acc.flight ?? "",
          acc.eVisa ?? "",
          acc.titikKumpul ?? "",
          acc.status ?? "Aktif",
          acc.tanggalTerbit ?? "Hari ini",
          TENANT_ID,
          batchIds.get(packageId) ?? null,
        ],
      );
    }

    await client.query("COMMIT");
    const quota = await getQuota();
    return { ok: true, issued: fresh.length, reused: accounts.length - fresh.length, balance: quota.balance };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
