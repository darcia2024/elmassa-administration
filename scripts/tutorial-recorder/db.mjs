// Postgres lokal sekali-pakai untuk rekaman tutorial. Tidak pernah menyentuh Supabase.
//   node db.mjs start     -> jalankan server Postgres demo (biarkan terbuka)
//   node db.mjs reset     -> buat ulang database elmassa_demo kosong + skema
//   node db.mjs save      -> simpan kondisi sekarang sebagai snapshot elmassa_seed
//   node db.mjs restore   -> kembalikan elmassa_demo ke snapshot
import EmbeddedPostgres from "embedded-postgres";
import pg from "pg";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

export const HERE = path.dirname(fileURLToPath(import.meta.url));
export const REPO = path.resolve(HERE, "../..");
export const PORT = 54329;
export const DEMO_URL = `postgresql://postgres:demo@127.0.0.1:${PORT}/elmassa_demo`;
const ADMIN_URL = `postgresql://postgres:demo@127.0.0.1:${PORT}/postgres`;

async function admin(sqls) {
  const p = new pg.Pool({ connectionString: ADMIN_URL });
  try {
    for (const s of sqls) await p.query(s);
  } finally {
    await p.end();
  }
}

async function copyDb(from, to) {
  await admin([
    `SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname IN ('${from}','${to}') AND pid <> pg_backend_pid()`,
    `DROP DATABASE IF EXISTS ${to} WITH (FORCE)`,
    `CREATE DATABASE ${to} TEMPLATE ${from}`,
  ]);
}

/**
 * Migrasi ad-hoc dari scratch/ (semuanya idempoten). Sebagian butuh tabel yang
 * baru dibuat route API saat pertama dipanggil (real_bookings, jamaah_accounts),
 * jadi seed.mjs memanggil ini lagi setelah server dipanaskan.
 */
export function runRepoMigrations() {
  const env = { ...process.env, DATABASE_URL: `${DEMO_URL}?sslmode=disable` };
  for (const f of ["init-db", "add-admin-ops-tables", "add-agenda-events", "add-jamaah-master", "add-roomlist-columns", "umrahme-align-schema", "umrahme-license-quota"]) {
    try {
      execFileSync(process.execPath, [path.join(REPO, "scratch", `${f}.mjs`)], { env, stdio: "pipe" });
      console.log("ok", f);
    } catch (e) {
      console.log("skip", f, String(e.stderr ?? e.message).split("\n").find((l) => l.trim()) ?? "");
    }
  }
}

export async function restoreSnapshot() {
  await copyDb("elmassa_seed", "elmassa_demo");
}

const cmd = process.argv[2];
if (path.resolve(process.argv[1] ?? "") === fileURLToPath(import.meta.url)) {
  if (cmd === "start") {
    const dir = path.join(HERE, "pgdata");
    const server = new EmbeddedPostgres({ databaseDir: dir, user: "postgres", password: "demo", port: PORT, persistent: true });
    if (!fs.existsSync(path.join(dir, "PG_VERSION"))) await server.initialise();
    await server.start();
    console.log(`Postgres demo siap di port ${PORT}. Biarkan jendela ini terbuka (Ctrl+C untuk berhenti).`);
    process.on("SIGINT", async () => { await server.stop(); process.exit(0); });
    setInterval(() => {}, 1 << 30);
  } else if (cmd === "reset") {
    await admin([
      "DROP DATABASE IF EXISTS elmassa_demo WITH (FORCE)",
      "CREATE DATABASE elmassa_demo ENCODING 'UTF8' TEMPLATE template0 LC_COLLATE 'C' LC_CTYPE 'C'",
    ]);
    // Roles Supabase yang dirujuk skrip GRANT/RLS UmrahMe.
    for (const r of ["anon", "authenticated", "service_role"]) await admin([`CREATE ROLE ${r}`]).catch(() => {});
    const p = new pg.Pool({ connectionString: DEMO_URL });
    await p.query(fs.readFileSync(path.join(HERE, "demo-schema.sql"), "utf8"));
    await p.end();
    runRepoMigrations();
    console.log("Database demo kosong siap. Lanjut: jalankan server (node dev-demo.mjs) lalu node seed.mjs");
  } else if (cmd === "save") {
    await copyDb("elmassa_demo", "elmassa_seed");
    console.log("Snapshot tersimpan (elmassa_seed).");
  } else if (cmd === "restore") {
    await restoreSnapshot();
    console.log("Database demo dikembalikan ke snapshot.");
  } else {
    console.log("Pakai: node db.mjs start | reset | save | restore");
  }
}
