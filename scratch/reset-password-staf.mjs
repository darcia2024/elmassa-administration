import { randomBytes, scryptSync } from "node:crypto";
import pg from "pg";
const { Pool } = pg;

// Mengganti password satu akun staf kalau lupa, tanpa harus bisa login.
//   Lihat daftar akun : node --env-file=.env.local scratch/reset-password-staf.mjs
//   Reset satu akun   : node --env-file=.env.local scratch/reset-password-staf.mjs email@contoh.com
//
// Password baru dibuat acak lalu dicetak SEKALI di layar ini; langsung login dan ganti dengan password
// pilihanmu (menu profil / Pengaturan > Staf). Cara hash-nya sama dengan lib/auth/staff-store.ts
// (scrypt, salt acak 16 byte), jadi hasilnya bisa dipakai login biasa. Hash lama tidak pernah dicetak.
// Jalankan sendiri di komputermu: password baru tidak lewat chat, repo, atau log.

const connectionString = process.env.DATABASE_URL;
if (!connectionString) { console.error("DATABASE_URL is not set. Pakai --env-file=.env.local."); process.exit(1); }

const email = (process.argv[2] ?? "").trim().toLowerCase();
const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });

// Tanpa karakter yang mudah tertukar (0/O, 1/l/I) supaya gampang diketik.
const HURUF = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
function passwordAcak(panjang = 14) {
  const bytes = randomBytes(panjang);
  return Array.from(bytes, (b) => HURUF[b % HURUF.length]).join("");
}

try {
  if (!email) {
    const res = await pool.query(`SELECT name, email, role, status FROM staff_users ORDER BY created_at;`);
    if (res.rowCount === 0) {
      console.log("Belum ada akun staf. Jalankan aplikasi sekali; akun admin pertama dibuat otomatis saat login pertama.");
    } else {
      console.log("Akun staf:");
      for (const r of res.rows) console.log(`  ${r.email}  |  ${r.name}  |  ${r.role}  |  ${r.status}`);
      console.log("\nUntuk mengganti password: tambahkan emailnya di akhir perintah.");
    }
  } else {
    const baru = passwordAcak();
    const salt = randomBytes(16).toString("hex");
    const hash = scryptSync(baru, salt, 64).toString("hex");
    const res = await pool.query(
      `UPDATE staff_users SET password_hash = $1, password_salt = $2, updated_at = now()
        WHERE lower(email) = $3 RETURNING name, email, status;`,
      [hash, salt, email],
    );
    if (res.rowCount === 0) {
      console.error(`Tidak ada akun dengan email ${email}. Jalankan tanpa email untuk melihat daftarnya.`);
      process.exitCode = 1;
    } else {
      const u = res.rows[0];
      console.log(`Password ${u.name} <${u.email}> diganti (status akun: ${u.status}).`);
      console.log(`Password baru (catat sekarang, tidak ditampilkan lagi): ${baru}`);
      if (u.status !== "Aktif") console.log(`Catatan: status akun "${u.status}"; aktifkan dulu kalau tidak bisa login.`);
    }
  }
} catch (e) {
  console.error("Gagal:", e.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
