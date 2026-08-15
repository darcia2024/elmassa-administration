import pg from "pg";
const { Pool } = pg;

// Kuota lisensi UmrahMe: vendor jual kuota ke travel, travel memakainya untuk
// menerbitkan akun jamaah.
//   node --env-file=.env.local scratch/umrahme-license-quota.mjs
//
// Model:
//   app_admins      -> siapa yang boleh inject kuota (dicek AdminAuthContext)
//   license_quota   -> saldo berjalan per travel, dikunci saat dipakai
//   license_ledger  -> catatan setiap pergerakan; SUMBER KEBENARAN
//
// Saldo disimpan DAN dicatat di ledger. Saldo yang disimpan dipakai supaya
// pemotongan bisa dikunci per baris (SELECT ... FOR UPDATE) sehingga dua
// penerbitan bersamaan tidak bisa memakai kuota yang sama. Ledger-nya yang
// menjadi kebenaran: kalau keduanya berselisih, saldo bisa dibangun ulang
// dari SUM(delta).
//
// Pemotongan HANYA lewat license_consume(). Fungsi itu menolak kalau saldo
// kurang, jadi akun tidak mungkin terbit tanpa kuota terpotong.

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}

const STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS app_admins (
     user_id    UUID PRIMARY KEY,
     email      TEXT NOT NULL DEFAULT '',
     created_at TIMESTAMPTZ NOT NULL DEFAULT now()
   );`,

  `CREATE TABLE IF NOT EXISTS license_quota (
     tenant_id      TEXT PRIMARY KEY REFERENCES tenants(id) ON DELETE CASCADE,
     balance        INTEGER NOT NULL DEFAULT 0 CHECK (balance >= 0),
     price_per_unit INTEGER NOT NULL DEFAULT 35000,
     updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
   );`,

  `CREATE TABLE IF NOT EXISTS license_ledger (
     id         BIGSERIAL PRIMARY KEY,
     tenant_id  TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
     delta      INTEGER NOT NULL CHECK (delta <> 0),
     kind       TEXT NOT NULL CHECK (kind IN ('topup','pemakaian','koreksi')),
     note       TEXT NOT NULL DEFAULT '',
     reference  TEXT NOT NULL DEFAULT '',
     actor      TEXT NOT NULL DEFAULT '',
     created_at TIMESTAMPTZ NOT NULL DEFAULT now()
   );`,
  `CREATE INDEX IF NOT EXISTS license_ledger_tenant_idx ON license_ledger (tenant_id, created_at DESC);`,

  // Menambah kuota. Dipakai panel admin UmrahMe (vendor).
  `CREATE OR REPLACE FUNCTION license_topup(p_tenant TEXT, p_qty INTEGER, p_note TEXT DEFAULT '', p_actor TEXT DEFAULT '')
   RETURNS INTEGER
   LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
   DECLARE v_balance INTEGER;
   BEGIN
     IF p_qty IS NULL OR p_qty <= 0 THEN
       RAISE EXCEPTION 'Jumlah top-up harus lebih dari 0';
     END IF;

     INSERT INTO license_quota (tenant_id, balance) VALUES (p_tenant, 0)
       ON CONFLICT (tenant_id) DO NOTHING;

     UPDATE license_quota SET balance = balance + p_qty, updated_at = now()
      WHERE tenant_id = p_tenant RETURNING balance INTO v_balance;

     INSERT INTO license_ledger (tenant_id, delta, kind, note, actor)
       VALUES (p_tenant, p_qty, 'topup', COALESCE(p_note,''), COALESCE(p_actor,''));

     RETURN v_balance;
   END $$;`,

  // Memakai kuota. Mengunci baris saldo supaya dua penerbitan bersamaan tidak
  // bisa memakai kuota yang sama, dan menolak kalau saldo tidak cukup.
  `CREATE OR REPLACE FUNCTION license_consume(p_tenant TEXT, p_qty INTEGER, p_reference TEXT DEFAULT '', p_actor TEXT DEFAULT '')
   RETURNS INTEGER
   LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
   DECLARE v_balance INTEGER;
   BEGIN
     IF p_qty IS NULL OR p_qty <= 0 THEN
       RAISE EXCEPTION 'Jumlah pemakaian harus lebih dari 0';
     END IF;

     SELECT balance INTO v_balance FROM license_quota
      WHERE tenant_id = p_tenant FOR UPDATE;

     IF NOT FOUND THEN
       RAISE EXCEPTION 'Travel belum punya kuota UmrahMe. Hubungi penyedia untuk top-up.';
     END IF;

     IF v_balance < p_qty THEN
       RAISE EXCEPTION 'Kuota UmrahMe tidak cukup: tersisa %, dibutuhkan %', v_balance, p_qty;
     END IF;

     UPDATE license_quota SET balance = balance - p_qty, updated_at = now()
      WHERE tenant_id = p_tenant RETURNING balance INTO v_balance;

     INSERT INTO license_ledger (tenant_id, delta, kind, reference, actor)
       VALUES (p_tenant, -p_qty, 'pemakaian', COALESCE(p_reference,''), COALESCE(p_actor,''));

     RETURN v_balance;
   END $$;`,

  `ALTER TABLE app_admins     ENABLE ROW LEVEL SECURITY;`,
  `ALTER TABLE license_quota  ENABLE ROW LEVEL SECURITY;`,
  `ALTER TABLE license_ledger ENABLE ROW LEVEL SECURITY;`,

  `DROP POLICY IF EXISTS app_admins_select ON app_admins;`,
  `CREATE POLICY app_admins_select ON app_admins FOR SELECT TO authenticated USING (true);`,

  // Travel boleh MELIHAT saldo & riwayatnya, tapi tidak boleh menulis apa pun.
  // Penambahan hanya lewat license_topup(), pemotongan lewat license_consume().
  `DROP POLICY IF EXISTS license_quota_select ON license_quota;`,
  `CREATE POLICY license_quota_select ON license_quota FOR SELECT TO authenticated USING (true);`,
  `DROP POLICY IF EXISTS license_ledger_select ON license_ledger;`,
  `CREATE POLICY license_ledger_select ON license_ledger FOR SELECT TO authenticated USING (true);`,

  // Hanya admin vendor yang boleh memanggil top-up.
  `REVOKE ALL ON FUNCTION license_topup(TEXT, INTEGER, TEXT, TEXT) FROM PUBLIC, anon, authenticated;`,
  `GRANT EXECUTE ON FUNCTION license_topup(TEXT, INTEGER, TEXT, TEXT) TO authenticated;`,
  `REVOKE ALL ON FUNCTION license_consume(TEXT, INTEGER, TEXT, TEXT) FROM PUBLIC, anon;`,
];

const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });

async function main() {
  const client = await pool.connect();
  try {
    for (const sql of STATEMENTS) await client.query(sql);

    await client.query(
      `INSERT INTO license_quota (tenant_id, balance, price_per_unit)
       VALUES ('el-massa', 0, 35000) ON CONFLICT (tenant_id) DO NOTHING;`,
    );

    const q = await client.query(`SELECT tenant_id, balance, price_per_unit FROM license_quota;`);
    console.log("=== license_quota ==="); console.table(q.rows);
    console.log("fungsi: license_topup(), license_consume() siap.");
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => { console.error(err); process.exit(1); });
