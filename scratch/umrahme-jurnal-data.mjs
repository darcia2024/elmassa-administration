import pg from "pg";
const { Pool } = pg;

// Jurnal dan data per jamaah untuk aplikasi UmrahMe (kartu progres, counter tawaf/sa'i, manasik, checklist).
//   node --env-file=.env.local scratch/umrahme-jurnal-data.mjs
//
// Aplikasi UmrahMe sudah memanggil jurnal_list/create/delete dan jamaah_data_get/set; fungsi dan
// tabelnya baru dibuat di sini. Aman dijalankan berulang.
//
// Cara kerja akses:
//   * Tiap akun jamaah punya access_token (48 hex, acak). Token itu TIDAK ikut dalam jamaah_login()
//     dan tidak bisa dibaca anon; UmrahMe mengambilnya sekali setelah login lewat jamaah_access_token()
//     dengan pencocokan yang sama persis dengan jamaah_login(), lalu hanya menyimpannya di memori.
//   * Tabel jurnal_entries dan jamaah_data tertutup untuk anon/authenticated. Semua akses lewat fungsi
//     SECURITY DEFINER yang memeriksa token, lalu bekerja dengan id akun, BUKAN nomor jamaah, supaya
//     dua jamaah yang kebetulan bernomor sama tidak pernah berbagi data.
//
// Catatan keamanan: token didapat dengan nama jamaah (dan kode tenant yang publik), jadi privasi jurnal
// setara dengan kuat login. Memperkuat login (misalnya PIN) otomatis memperkuat ini.

const connectionString = process.env.DATABASE_URL;
if (!connectionString) { console.error("DATABASE_URL is not set."); process.exit(1); }

const HEX = `substr(replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', ''), 1, 48)`;

const STATEMENTS = [
  // ── Token akses per akun ───────────────────────────────────────────────
  `ALTER TABLE jamaah_accounts ADD COLUMN IF NOT EXISTS access_token TEXT;`,
  `UPDATE jamaah_accounts SET access_token = ${HEX} WHERE access_token IS NULL;`,
  `ALTER TABLE jamaah_accounts ALTER COLUMN access_token SET DEFAULT ${HEX};`,
  `ALTER TABLE jamaah_accounts ALTER COLUMN access_token SET NOT NULL;`,
  `CREATE UNIQUE INDEX IF NOT EXISTS jamaah_accounts_access_token_key ON jamaah_accounts (access_token);`,

  // ── Tabel ──────────────────────────────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS jurnal_entries (
     id           TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
     tenant_id    TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
     account_id   TEXT NOT NULL REFERENCES jamaah_accounts(id) ON DELETE CASCADE,
     nomor_jamaah TEXT NOT NULL,
     tanggal      TEXT NOT NULL,
     judul        TEXT,
     isi          TEXT NOT NULL,
     lokasi       TEXT,
     created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
     updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
   );`,
  `CREATE INDEX IF NOT EXISTS jurnal_entries_account_idx ON jurnal_entries (account_id, tanggal DESC);`,

  `CREATE TABLE IF NOT EXISTS jamaah_data (
     id           TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
     tenant_id    TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
     account_id   TEXT NOT NULL REFERENCES jamaah_accounts(id) ON DELETE CASCADE,
     nomor_jamaah TEXT NOT NULL,
     data_key     TEXT NOT NULL,
     data_value   JSONB NOT NULL,
     created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
     updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
     UNIQUE (account_id, data_key)
   );`,

  `ALTER TABLE jurnal_entries ENABLE ROW LEVEL SECURITY;`,
  `ALTER TABLE jamaah_data ENABLE ROW LEVEL SECURITY;`,
  `REVOKE ALL ON jurnal_entries FROM PUBLIC, anon, authenticated;`,
  `REVOKE ALL ON jamaah_data FROM PUBLIC, anon, authenticated;`,

  // ── Fungsi dalam: token -> id akun ─────────────────────────────────────
  `CREATE OR REPLACE FUNCTION jamaah_akun_dari_token(p_tenant_id TEXT, p_nomor_jamaah TEXT, p_token TEXT)
   RETURNS TEXT
   LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
   DECLARE v_id TEXT;
   BEGIN
     IF COALESCE(p_token, '') = '' THEN
       RAISE EXCEPTION 'Sesi tidak valid. Silakan masuk lagi.' USING ERRCODE = '28000';
     END IF;
     SELECT a.id INTO v_id
       FROM jamaah_accounts a
      WHERE a.access_token = p_token
        AND a.tenant_id = p_tenant_id
        AND a.nomor_jamaah = p_nomor_jamaah
      LIMIT 1;
     IF v_id IS NULL THEN
       RAISE EXCEPTION 'Sesi tidak valid. Silakan masuk lagi.' USING ERRCODE = '28000';
     END IF;
     RETURN v_id;
   END;
   $$;`,
  `REVOKE ALL ON FUNCTION jamaah_akun_dari_token(TEXT, TEXT, TEXT) FROM PUBLIC, anon, authenticated;`,

  // ── Token untuk aplikasi (pencocokan SAMA PERSIS dengan jamaah_login) ──
  `CREATE OR REPLACE FUNCTION jamaah_access_token(p_kode TEXT, p_nama TEXT)
   RETURNS TEXT
   LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
     SELECT j.access_token
       FROM jamaah_accounts j
       JOIN tenants t ON t.id = j.tenant_id
      WHERE (
              COALESCE(trim(p_kode), '') = ''
              OR upper(trim(t.activation_code)) = upper(trim(p_kode))
            )
        AND lower(regexp_replace(trim(j.nama), '[[:space:]]+', ' ', 'g'))
          = lower(regexp_replace(trim(COALESCE(p_nama, '')), '[[:space:]]+', ' ', 'g'))
      LIMIT 1;
   $$;`,

  // ── Data per jamaah (key-value) ────────────────────────────────────────
  `CREATE OR REPLACE FUNCTION jamaah_data_get(p_tenant_id TEXT, p_nomor_jamaah TEXT, p_token TEXT, p_key TEXT)
   RETURNS JSONB
   LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
   DECLARE v_acc TEXT; v_val JSONB;
   BEGIN
     v_acc := jamaah_akun_dari_token(p_tenant_id, p_nomor_jamaah, p_token);
     SELECT data_value INTO v_val FROM jamaah_data WHERE account_id = v_acc AND data_key = p_key;
     RETURN v_val;
   END;
   $$;`,

  `CREATE OR REPLACE FUNCTION jamaah_data_set(p_tenant_id TEXT, p_nomor_jamaah TEXT, p_token TEXT, p_key TEXT, p_value JSONB)
   RETURNS VOID
   LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
   DECLARE v_acc TEXT;
   BEGIN
     v_acc := jamaah_akun_dari_token(p_tenant_id, p_nomor_jamaah, p_token);
     IF p_key IS NULL OR p_key !~ '^[a-z0-9._-]{1,64}$' THEN
       RAISE EXCEPTION 'Nama data tidak valid.' USING ERRCODE = '22023';
     END IF;
     IF p_value IS NULL OR octet_length(p_value::text) > 65536 THEN
       RAISE EXCEPTION 'Data terlalu besar (maksimal 64 KB).' USING ERRCODE = '22023';
     END IF;
     IF NOT EXISTS (SELECT 1 FROM jamaah_data WHERE account_id = v_acc AND data_key = p_key)
        AND (SELECT count(*) FROM jamaah_data WHERE account_id = v_acc) >= 50 THEN
       RAISE EXCEPTION 'Terlalu banyak data tersimpan.' USING ERRCODE = '54000';
     END IF;
     INSERT INTO jamaah_data (tenant_id, account_id, nomor_jamaah, data_key, data_value)
     VALUES (p_tenant_id, v_acc, p_nomor_jamaah, p_key, p_value)
     ON CONFLICT (account_id, data_key)
     DO UPDATE SET data_value = EXCLUDED.data_value, updated_at = now();
   END;
   $$;`,

  // ── Jurnal ─────────────────────────────────────────────────────────────
  `CREATE OR REPLACE FUNCTION jurnal_list(p_tenant_id TEXT, p_nomor_jamaah TEXT, p_token TEXT)
   RETURNS SETOF jurnal_entries
   LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
   DECLARE v_acc TEXT;
   BEGIN
     v_acc := jamaah_akun_dari_token(p_tenant_id, p_nomor_jamaah, p_token);
     RETURN QUERY
       SELECT * FROM jurnal_entries
        WHERE account_id = v_acc
        ORDER BY tanggal DESC, created_at DESC
        LIMIT 500;
   END;
   $$;`,

  `CREATE OR REPLACE FUNCTION jurnal_create(
     p_tenant_id TEXT, p_nomor_jamaah TEXT, p_token TEXT,
     p_tanggal TEXT, p_judul TEXT, p_isi TEXT, p_lokasi TEXT
   )
   RETURNS jurnal_entries
   LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
   DECLARE v_acc TEXT; v_row jurnal_entries;
   BEGIN
     v_acc := jamaah_akun_dari_token(p_tenant_id, p_nomor_jamaah, p_token);
     IF COALESCE(btrim(p_isi), '') = '' THEN
       RAISE EXCEPTION 'Isi jurnal tidak boleh kosong.' USING ERRCODE = '22023';
     END IF;
     IF length(p_isi) > 20000 OR length(COALESCE(p_judul, '')) > 200 OR length(COALESCE(p_lokasi, '')) > 200 THEN
       RAISE EXCEPTION 'Jurnal terlalu panjang.' USING ERRCODE = '22023';
     END IF;
     IF p_tanggal IS NULL OR p_tanggal !~ '^\\d{4}-\\d{2}-\\d{2}$' THEN
       RAISE EXCEPTION 'Tanggal tidak valid.' USING ERRCODE = '22007';
     END IF;
     PERFORM p_tanggal::date;
     IF (SELECT count(*) FROM jurnal_entries WHERE account_id = v_acc) >= 1000 THEN
       RAISE EXCEPTION 'Jurnal sudah mencapai batas 1000 catatan.' USING ERRCODE = '54000';
     END IF;
     INSERT INTO jurnal_entries (tenant_id, account_id, nomor_jamaah, tanggal, judul, isi, lokasi)
     VALUES (p_tenant_id, v_acc, p_nomor_jamaah, p_tanggal, NULLIF(btrim(p_judul), ''), p_isi, NULLIF(btrim(p_lokasi), ''))
     RETURNING * INTO v_row;
     RETURN v_row;
   END;
   $$;`,

  `CREATE OR REPLACE FUNCTION jurnal_delete(p_id TEXT, p_tenant_id TEXT, p_nomor_jamaah TEXT, p_token TEXT)
   RETURNS VOID
   LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
   DECLARE v_acc TEXT;
   BEGIN
     v_acc := jamaah_akun_dari_token(p_tenant_id, p_nomor_jamaah, p_token);
     DELETE FROM jurnal_entries WHERE id = p_id AND account_id = v_acc;
   END;
   $$;`,

  // ── Izin: hanya fungsi yang dipakai aplikasi yang terbuka untuk anon ───
  ...[
    "jamaah_access_token(TEXT, TEXT)",
    "jamaah_data_get(TEXT, TEXT, TEXT, TEXT)",
    "jamaah_data_set(TEXT, TEXT, TEXT, TEXT, JSONB)",
    "jurnal_list(TEXT, TEXT, TEXT)",
    "jurnal_create(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT)",
    "jurnal_delete(TEXT, TEXT, TEXT, TEXT)",
  ].flatMap((f) => [
    `REVOKE ALL ON FUNCTION ${f} FROM PUBLIC;`,
    `GRANT EXECUTE ON FUNCTION ${f} TO anon, authenticated;`,
  ]),
];

const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });

async function main() {
  const c = await pool.connect();
  try {
    await c.query("BEGIN");
    for (const sql of STATEMENTS) await c.query(sql);
    await c.query("COMMIT");

    const t = await c.query(
      `SELECT count(*)::int AS akun, count(access_token)::int AS bertoken FROM jamaah_accounts;`,
    );
    const f = await c.query(
      `SELECT proname FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
        WHERE n.nspname = 'public' AND proname IN
          ('jamaah_access_token','jamaah_data_get','jamaah_data_set','jurnal_list','jurnal_create','jurnal_delete')
        ORDER BY 1;`,
    );
    console.log(`akun: ${t.rows[0].akun}, sudah bertoken: ${t.rows[0].bertoken}`);
    console.log("fungsi siap:", f.rows.map((r) => r.proname).join(", "));
  } catch (e) {
    await c.query("ROLLBACK");
    console.error("Gagal, dibatalkan:", e.message);
    process.exitCode = 1;
  } finally {
    c.release();
    await pool.end();
  }
}

main();
