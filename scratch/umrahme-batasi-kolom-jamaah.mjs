import pg from "pg";
const { Pool } = pg;

// Membatasi kolom jamaah_accounts yang boleh dibaca anon key.
//   node --env-file=.env.local scratch/umrahme-batasi-kolom-jamaah.mjs
//
// Anon key ikut ter-bundle ke browser setiap pengunjung aplikasi UmrahMe, jadi
// apa pun yang boleh dibaca `anon` praktis bersifat publik. Tabel ini menyimpan
// NIK, telepon, alamat lengkap, tanggal lahir, golongan darah dan kontak
// darurat -- tidak satu pun dipakai aplikasi jamaah (sudah diperiksa: nol
// rujukan di seluruh src/), tapi semuanya ikut terkirim karena query-nya
// memakai select('*').
//
// Postgres memberi izin per kolom, jadi kolom sensitif dicabut tanpa mematikan
// login jamaah yang tetap butuh nama & nomor jamaah.

const connectionString = process.env.DATABASE_URL;
if (!connectionString) { console.error("DATABASE_URL is not set."); process.exit(1); }

// Kolom yang benar-benar dipakai aplikasi jamaah.
const BOLEH = [
  "id", "tenant_id", "keberangkatan_id", "nama", "nomor_jamaah",
  "rombongan", "bus", "kamar", "flight", "e_visa", "batch",
  "titik_kumpul", "status", "fase_override", "created_at",
];

const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });

async function main() {
  const c = await pool.connect();
  try {
    await c.query(`REVOKE SELECT ON jamaah_accounts FROM anon;`);
    await c.query(`GRANT SELECT (${BOLEH.join(", ")}) ON jamaah_accounts TO anon;`);

    const semua = await c.query(
      `SELECT column_name FROM information_schema.columns
        WHERE table_name = 'jamaah_accounts' ORDER BY ordinal_position;`,
    );
    const tersembunyi = semua.rows.map((r) => r.column_name).filter((x) => !BOLEH.includes(x));

    console.log("boleh dibaca anon :", BOLEH.join(", "));
    console.log("\nDISEMBUNYIKAN     :", tersembunyi.join(", "));
  } finally {
    c.release();
    await pool.end();
  }
}

main().catch((e) => { console.error(e.message); process.exit(1); });
