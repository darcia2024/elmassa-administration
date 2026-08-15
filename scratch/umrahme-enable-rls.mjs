import pg from "pg";
const { Pool } = pg;

// Menutup lubang tulis di tabel-tabel UmrahMe.
//   node --env-file=.env.local scratch/umrahme-enable-rls.mjs
//
// Tabel yang dibuat lewat CREATE TABLE biasa tidak punya RLS, dan Supabase
// memberi role `anon` akses penuh ke schema public. Karena anon key ikut
// ter-bundle ke browser setiap pengunjung, siapa pun bisa INSERT/UPDATE/DELETE
// -- sudah diuji dan memang berhasil sebelum skrip ini dijalankan.
//
// Pola menyusul migrasi yang sudah ada di repo UmrahMe:
//   SELECT  -> publik (jamaah membuka aplikasi tanpa login Supabase)
//   INSERT/UPDATE/DELETE -> hanya `authenticated` (admin travel)
//
// El Massa Web TIDAK terpengaruh: ia konek lewat Postgres langsung sebagai
// pemilik tabel, dan RLS tidak berlaku untuk pemilik tabel kecuali FORCE.

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}

const PUBLIC_READ = ["tenants", "keberangkatan", "agenda_items", "travel_announcements", "jamaah_accounts"];
const PRIVATE = ["tenant_users"];

const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });

async function main() {
  const client = await pool.connect();
  try {
    for (const table of [...PUBLIC_READ, ...PRIVATE]) {
      await client.query(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;`);

      for (const action of ["select", "insert", "update", "delete"]) {
        await client.query(`DROP POLICY IF EXISTS "${table}_${action}" ON ${table};`);
      }

      if (PUBLIC_READ.includes(table)) {
        await client.query(`CREATE POLICY "${table}_select" ON ${table} FOR SELECT USING (true);`);
      } else {
        await client.query(`CREATE POLICY "${table}_select" ON ${table} FOR SELECT TO authenticated USING (true);`);
      }

      await client.query(`CREATE POLICY "${table}_insert" ON ${table} FOR INSERT TO authenticated WITH CHECK (true);`);
      await client.query(`CREATE POLICY "${table}_update" ON ${table} FOR UPDATE TO authenticated USING (true) WITH CHECK (true);`);
      await client.query(`CREATE POLICY "${table}_delete" ON ${table} FOR DELETE TO authenticated USING (true);`);
    }

    const res = await client.query(`
      SELECT c.relname AS tabel,
             c.relrowsecurity AS rls,
             (SELECT COUNT(*)::int FROM pg_policies p WHERE p.tablename = c.relname) AS policy
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public' AND c.relname = ANY($1::text[])
      ORDER BY c.relname;
    `, [[...PUBLIC_READ, ...PRIVATE]]);

    console.table(res.rows);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
