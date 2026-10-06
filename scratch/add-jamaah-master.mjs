import pg from "pg";
const { Pool } = pg;

// Database jamaah terpusat -- satu profil master per orang.
//   node --env-file=.env.local scratch/add-jamaah-master.mjs
//
// Sebelumnya data jamaah tercecer di tiga tempat yang tidak saling kenal:
//   participants     per booking (nama/paspor/kontak), lahir dari form booking
//   jamaah_accounts  akun aplikasi UmrahMe
//   customers        pemesan (yang bayar), belum tentu yang berangkat
// Tidak satu pun menyimpan tanggal lahir, NIK, masa berlaku paspor, kontak
// darurat, atau dokumen -- padahal itu yang diminta manifest.
//
// jamaah_profiles jadi sumber kebenaran. Admin (sistem kantor) maupun jamaah
// (lewat UmrahMe / link pendataan) menulis ke baris yang SAMA; participants
// dan jamaah_accounts cukup menunjuk ke sini lewat jamaah_id.
//
// Status kelengkapan sengaja TIDAK disimpan sebagai kolom. Ia dihitung saat
// dibaca (lib/jamaah/rules.ts) -- kolom status akan basi begitu paspor
// mendekati habis masa berlaku tanpa ada yang meng-update barisnya.

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is not set. Run with: node --env-file=.env.local scratch/add-jamaah-master.mjs");
  process.exit(1);
}

const STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS jamaah_profiles (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     full_name TEXT NOT NULL,
     gender TEXT NOT NULL DEFAULT '',
     birth_place TEXT NOT NULL DEFAULT '',
     birth_date DATE,
     nik TEXT NOT NULL DEFAULT '',
     passport_number TEXT NOT NULL DEFAULT '',
     passport_issue_place TEXT NOT NULL DEFAULT '',
     passport_issue_date DATE,
     passport_expiry DATE,
     phone TEXT NOT NULL DEFAULT '',
     address TEXT NOT NULL DEFAULT '',
     emergency_name TEXT NOT NULL DEFAULT '',
     emergency_relation TEXT NOT NULL DEFAULT '',
     emergency_phone TEXT NOT NULL DEFAULT '',
     -- Jamaah penyerta: [{ name, relation, jamaahId? }]. jamaahId hanya diisi
     -- admin saat penyertanya juga punya profil di sini; dari form publik
     -- cukup nama + hubungan, supaya form itu tidak bisa dipakai menelusuri
     -- profil orang lain.
     companions JSONB NOT NULL DEFAULT '[]'::jsonb,
     notes TEXT NOT NULL DEFAULT '',
     source TEXT NOT NULL DEFAULT 'admin',
     -- Kunci link pendataan mandiri (/pendataan/<token>). Dibuat di aplikasi
     -- (crypto.randomBytes), bukan default SQL, supaya tidak bergantung pada
     -- ekstensi pgcrypto.
     self_service_token TEXT UNIQUE,
     created_by TEXT NOT NULL DEFAULT '',
     updated_by TEXT NOT NULL DEFAULT '',
     created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
     updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
   );`,
  `CREATE INDEX IF NOT EXISTS jamaah_profiles_name_idx ON jamaah_profiles (lower(full_name));`,
  `CREATE INDEX IF NOT EXISTS jamaah_profiles_nik_idx ON jamaah_profiles (nik) WHERE nik <> '';`,
  `CREATE INDEX IF NOT EXISTS jamaah_profiles_passport_idx ON jamaah_profiles (passport_number) WHERE passport_number <> '';`,

  // Kolom yang diminta template import Siskopatuh (lihat lib/jamaah/siskopatuh-lists.ts).
  `ALTER TABLE jamaah_profiles ADD COLUMN IF NOT EXISTS passport_name TEXT NOT NULL DEFAULT '';`,
  `ALTER TABLE jamaah_profiles ADD COLUMN IF NOT EXISTS father_name TEXT NOT NULL DEFAULT '';`,
  `ALTER TABLE jamaah_profiles ADD COLUMN IF NOT EXISTS province TEXT NOT NULL DEFAULT '';`,
  `ALTER TABLE jamaah_profiles ADD COLUMN IF NOT EXISTS regency TEXT NOT NULL DEFAULT '';`,
  `ALTER TABLE jamaah_profiles ADD COLUMN IF NOT EXISTS district TEXT NOT NULL DEFAULT '';`,
  `ALTER TABLE jamaah_profiles ADD COLUMN IF NOT EXISTS village TEXT NOT NULL DEFAULT '';`,
  `ALTER TABLE jamaah_profiles ADD COLUMN IF NOT EXISTS marital_status TEXT NOT NULL DEFAULT '';`,
  `ALTER TABLE jamaah_profiles ADD COLUMN IF NOT EXISTS education TEXT NOT NULL DEFAULT '';`,
  `ALTER TABLE jamaah_profiles ADD COLUMN IF NOT EXISTS occupation TEXT NOT NULL DEFAULT '';`,

  // Satu berkas aktif per jenis dokumen; upload ulang menggantikan yang lama.
  `CREATE TABLE IF NOT EXISTS jamaah_documents (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     jamaah_id UUID NOT NULL REFERENCES jamaah_profiles(id) ON DELETE CASCADE,
     doc_type TEXT NOT NULL,
     doc_subtype TEXT NOT NULL DEFAULT '',
     storage_path TEXT NOT NULL,
     file_name TEXT NOT NULL DEFAULT '',
     mime_type TEXT NOT NULL DEFAULT '',
     size_bytes INTEGER NOT NULL DEFAULT 0,
     uploaded_via TEXT NOT NULL DEFAULT 'admin',
     uploaded_by TEXT NOT NULL DEFAULT '',
     uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
     UNIQUE (jamaah_id, doc_type)
   );`,

  // Keanggotaan grup keberangkatan tetap di participants (per booking); kolom
  // ini menyambungkannya ke profil master, sehingga manifest bisa menarik
  // tanggal lahir/NIK/paspor tanpa input ulang.
  `ALTER TABLE participants ADD COLUMN IF NOT EXISTS jamaah_id UUID REFERENCES jamaah_profiles(id) ON DELETE SET NULL;`,
  `CREATE INDEX IF NOT EXISTS participants_jamaah_idx ON participants (jamaah_id);`,

  // Akun UmrahMe -> profil master. Tidak di-GRANT ke anon (lihat
  // scratch/umrahme-batasi-kolom-jamaah.mjs): aplikasi jamaah mengambil token
  // pendataannya lewat fungsi di bawah, bukan membaca kolom ini.
  `ALTER TABLE jamaah_accounts ADD COLUMN IF NOT EXISTS jamaah_id UUID REFERENCES jamaah_profiles(id) ON DELETE SET NULL;`,

  // Untuk aplikasi UmrahMe: jamaah yang sudah login mendapatkan token link
  // pendataannya sendiri. Pencocokannya SAMA PERSIS dengan jamaah_login()
  // (scratch/umrahme-login-jamaah-rpc.mjs), jadi tidak membuka apa pun yang
  // belum terbuka lewat login. Token itu pun hanya bisa MENULIS data dan
  // melihat versi yang disamarkan -- lihat app/api/pendataan.
  `CREATE OR REPLACE FUNCTION jamaah_pendataan_token(p_kode TEXT, p_nama TEXT)
   RETURNS TEXT
   LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
     SELECT p.self_service_token
       FROM jamaah_accounts j
       JOIN tenants t ON t.id = j.tenant_id
       JOIN jamaah_profiles p ON p.id = j.jamaah_id
      WHERE (
              COALESCE(trim(p_kode), '') = ''
              OR upper(trim(t.activation_code)) = upper(trim(p_kode))
            )
        AND lower(regexp_replace(trim(j.nama), '[[:space:]]+', ' ', 'g'))
          = lower(regexp_replace(trim(COALESCE(p_nama, '')), '[[:space:]]+', ' ', 'g'))
      LIMIT 1;
   $$;`,
  `REVOKE ALL ON FUNCTION jamaah_pendataan_token(TEXT, TEXT) FROM PUBLIC;`,
  `GRANT EXECUTE ON FUNCTION jamaah_pendataan_token(TEXT, TEXT) TO anon, authenticated;`,

  // Tabel baru tidak boleh terbaca lewat anon key yang ada di bundle browser.
  `ALTER TABLE jamaah_profiles ENABLE ROW LEVEL SECURITY;`,
  `ALTER TABLE jamaah_documents ENABLE ROW LEVEL SECURITY;`,
  `REVOKE ALL ON jamaah_profiles FROM anon, authenticated;`,
  `REVOKE ALL ON jamaah_documents FROM anon, authenticated;`,
];

const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });

async function main() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    for (const sql of STATEMENTS) {
      await client.query(sql);
    }
    await client.query("COMMIT");

    const cols = await client.query(
      `SELECT table_name, COUNT(*)::int AS n FROM information_schema.columns
        WHERE table_name IN ('jamaah_profiles','jamaah_documents') GROUP BY 1 ORDER BY 1;`,
    );
    for (const row of cols.rows) console.log(`${row.table_name}: ${row.n} kolom`);
    console.log("participants.jamaah_id & jamaah_accounts.jamaah_id: siap");
    console.log("fungsi jamaah_pendataan_token(): siap");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
