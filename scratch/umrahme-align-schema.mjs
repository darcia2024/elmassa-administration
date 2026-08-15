import pg from "pg";
const { Pool } = pg;

// Menyelaraskan skema UmrahMe ke database yang sudah dipakai El Massa Web.
//   node --env-file=.env.local scratch/umrahme-align-schema.mjs
//
// Konteks: kedua aplikasi memakai satu project Supabase yang sama. Tabel
// jamaah_accounts sudah ada versi El Massa Web, sementara 5 tabel lain yang
// dibutuhkan SPA UmrahMe belum pernah dibuat -- semua query ke sana balik 404.
//
// Keputusan yang dipakai di sini:
//   * `tenants` DIPERTAHANKAN tapi hanya berisi 1 baris. Tabel ini bukan
//     multi-tenancy, melainkan konfigurasi white-label (nama travel, logo,
//     warna, hotel, kontak guide) -- justru mekanisme yang dipakai untuk
//     menjual sistem ini ke travel lain tanpa mengubah kode.
//   * Nama kolom mengikuti El Massa Web (`bus`, `kamar`, `paspor`), bukan
//     versi UmrahMe (`nomor_bus`, dst), karena tabelnya sudah dipakai halaman
//     Manifest & UmrahMe yang berjalan. SPA yang menyesuaikan.
//   * `fase` TIDAK ditambahkan sebagai kolom. SPA sudah menghitungnya dari
//     tanggal lewat hitungFaseEfektif(); menyimpannya berarti nilai basi
//     begitu tanggal lewat tanpa ada yang meng-update baris.

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is not set. Run with: node --env-file=.env.local scratch/umrahme-align-schema.mjs");
  process.exit(1);
}

const TENANT_ID = "el-massa";

const STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS tenants (
     id                      TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
     activation_code         TEXT NOT NULL UNIQUE,
     slug                    TEXT UNIQUE,
     nama_travel             TEXT NOT NULL,
     primary_color           TEXT NOT NULL DEFAULT '#0ea5e9',
     primary_deep_color      TEXT NOT NULL DEFAULT '#0284c7',
     logo_url                TEXT,
     page_title              TEXT NOT NULL DEFAULT 'Pendamping Umrah',
     tanggal_keberangkatan   TEXT,
     tanggal_kepulangan      TEXT,
     hotel_makkah            TEXT,
     hotel_madinah           TEXT,
     meeting_point           TEXT,
     guide_name              TEXT,
     guide_whatsapp          TEXT,
     tour_leader_name        TEXT,
     tour_leader_whatsapp    TEXT,
     emergency_note          TEXT,
     fase_override           TEXT CHECK (fase_override IN ('persiapan','tanah-suci','selesai')),
     hero_image_url          TEXT,
     hero_text_color         TEXT,
     sertifikat_template_url TEXT,
     sertifikat_layout       JSONB,
     created_at              TIMESTAMPTZ NOT NULL DEFAULT now()
   );`,

  `CREATE TABLE IF NOT EXISTS keberangkatan (
     id                    TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
     tenant_id             TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
     nama_batch            TEXT NOT NULL,
     tanggal_keberangkatan TEXT,
     tanggal_kepulangan    TEXT,
     hotel_makkah          TEXT,
     hotel_madinah         TEXT,
     meeting_point         TEXT,
     guide_name            TEXT,
     guide_whatsapp        TEXT,
     tour_leader_name      TEXT,
     tour_leader_whatsapp  TEXT,
     emergency_note        TEXT,
     fase_override         TEXT CHECK (fase_override IN ('persiapan','tanah-suci','selesai')),
     aktif                 BOOLEAN NOT NULL DEFAULT true,
     package_id            TEXT NOT NULL DEFAULT '',
     created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
   );`,
  `CREATE INDEX IF NOT EXISTS keberangkatan_tenant_idx ON keberangkatan (tenant_id);`,
  // Jembatan ke published_packages milik El Massa Web, supaya satu grup
  // keberangkatan di sistem travel bisa dicocokkan ke batch di UmrahMe.
  `CREATE INDEX IF NOT EXISTS keberangkatan_package_idx ON keberangkatan (package_id);`,

  `CREATE TABLE IF NOT EXISTS agenda_items (
     id               TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
     tenant_id        TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
     keberangkatan_id TEXT REFERENCES keberangkatan(id) ON DELETE SET NULL,
     tanggal          TEXT NOT NULL,
     jam_mulai        TEXT,
     judul            TEXT NOT NULL,
     deskripsi        TEXT,
     lokasi           TEXT,
     urutan           INTEGER NOT NULL DEFAULT 0,
     created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
   );`,
  `CREATE INDEX IF NOT EXISTS agenda_items_kb_idx ON agenda_items (keberangkatan_id);`,

  `CREATE TABLE IF NOT EXISTS travel_announcements (
     id               TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
     tenant_id        TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
     keberangkatan_id TEXT REFERENCES keberangkatan(id) ON DELETE SET NULL,
     label            TEXT NOT NULL DEFAULT 'Info',
     title            TEXT NOT NULL,
     content          TEXT NOT NULL,
     important        BOOLEAN NOT NULL DEFAULT false,
     published_at     TIMESTAMPTZ NOT NULL DEFAULT now()
   );`,

  `CREATE TABLE IF NOT EXISTS tenant_users (
     id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
     user_id    TEXT NOT NULL,
     tenant_id  TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
     created_at TIMESTAMPTZ NOT NULL DEFAULT now()
   );`,

  // jamaah_accounts sudah ada (versi El Massa Web). Hanya menambahkan kolom
  // yang dibutuhkan UmrahMe -- nama kolom lama tidak diubah supaya halaman
  // Manifest & UmrahMe di sistem travel tidak rusak.
  `ALTER TABLE jamaah_accounts
     ADD COLUMN IF NOT EXISTS tenant_id        TEXT,
     ADD COLUMN IF NOT EXISTS keberangkatan_id TEXT,
     ADD COLUMN IF NOT EXISTS fase_override    TEXT;`,
  `ALTER TABLE jamaah_accounts DROP CONSTRAINT IF EXISTS jamaah_accounts_fase_override_check;`,
  `ALTER TABLE jamaah_accounts ADD CONSTRAINT jamaah_accounts_fase_override_check
     CHECK (fase_override IS NULL OR fase_override IN ('persiapan','tanah-suci','selesai'));`,
  `CREATE INDEX IF NOT EXISTS jamaah_accounts_tenant_idx ON jamaah_accounts (tenant_id);`,
];

const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });

async function main() {
  const client = await pool.connect();
  try {
    for (const sql of STATEMENTS) await client.query(sql);

    // Satu-satunya baris tenant. Nilainya diambil dari company_identity kalau
    // sudah diisi staf, supaya branding tidak diketik dua kali.
    const identity = await client.query(
      `SELECT name, legal_name AS "legalName", logo_url AS "logoUrl" FROM company_identity LIMIT 1;`,
    ).catch(() => ({ rows: [] }));

    const co = identity.rows[0] ?? {};
    await client.query(
      `INSERT INTO tenants (id, activation_code, slug, nama_travel, page_title, logo_url,
                            primary_color, primary_deep_color, hotel_makkah, hotel_madinah)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       ON CONFLICT (id) DO NOTHING;`,
      [
        TENANT_ID,
        "ELMASSA",
        "elmassa",
        co.name || "El Massa Tour & Travel",
        `${co.name || "El Massa Tour & Travel"} — Pendamping Umrah`,
        co.logoUrl || "/logo-el-massa.png",
        "#be185d",
        "#9d174d",
        "Grand Al Massa",
        "Daar El Naeem",
      ],
    );

    // Baris jamaah yang sudah ada dimiliki travel ini.
    const claimed = await client.query(
      `UPDATE jamaah_accounts SET tenant_id = $1 WHERE tenant_id IS NULL;`,
      [TENANT_ID],
    );

    const check = await client.query(`
      SELECT table_name,
             (SELECT COUNT(*)::int FROM information_schema.columns c WHERE c.table_name = t.table_name) AS kolom
      FROM (VALUES ('tenants'),('keberangkatan'),('agenda_items'),('travel_announcements'),
                   ('tenant_users'),('jamaah_accounts')) AS t(table_name);
    `);

    console.table(check.rows);
    console.log(`tenant "${TENANT_ID}" siap; ${claimed.rowCount} baris jamaah_accounts di-assign ke tenant ini.`);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
