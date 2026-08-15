import { Pool } from "pg";

/**
 * Single source of truth for the database connection.
 *
 * The connection string must come from DATABASE_URL (.env.local locally, project
 * environment variables on the host). Never hardcode it in source — anything
 * committed once stays in the git history for good, even after it is deleted.
 */
export function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;

  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. On the host, add it in the project's environment variables and redeploy (Vercel: Settings > Environment Variables). Locally, copy .env.example to .env.local and fill in the Supabase connection string (transaction pooler, port 6543).",
    );
  }

  return url;
}

// One pool per server process, shared by every route, created on first use so a
// missing DATABASE_URL fails the individual request instead of the whole build.
let pool: Pool | undefined;

export function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: getDatabaseUrl(),
      ssl: { rejectUnauthorized: false },

      // Tanpa pengaturan ini `pg` memakai idleTimeoutMillis 10 detik: begitu
      // staf berhenti mengklik sebentar, seluruh koneksi ditutup, dan klik
      // berikutnya harus membangun koneksi baru ke Supabase dari nol --
      // handshake TCP, TLS, lalu autentikasi. Terukur 1-2 detik hanya untuk
      // menunggu, padahal datanya sendiri cuma beberapa kilobyte.
      idleTimeoutMillis: 5 * 60 * 1000,

      // Supabase memakai transaction pooler, jadi tidak perlu banyak koneksi;
      // yang penting koneksinya tetap hangat, bukan berjumlah besar.
      max: 10,

      // Kalau jaringan bermasalah, lebih baik gagal cepat dengan pesan jelas
      // daripada permintaan menggantung tanpa batas (bawaannya: tanpa batas).
      connectionTimeoutMillis: 10_000,

      // Menahan koneksi agar tidak diputus perantara jaringan saat idle.
      keepAlive: true,
      keepAliveInitialDelayMillis: 10_000,
    });
  }

  return pool;
}
