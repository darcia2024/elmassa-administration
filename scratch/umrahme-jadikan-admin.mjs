import pg from "pg";
const { Pool } = pg;

// Menandai sebuah akun Supabase Auth sebagai admin panel UmrahMe.
//   node --env-file=.env.local scratch/umrahme-jadikan-admin.mjs <email>
//
// Skrip ini SENGAJA tidak membuat akun dan tidak menyentuh password. Akunnya
// dibuat sendiri lewat Supabase (Authentication > Users > Add user, atau
// sign-up di aplikasi), supaya password hanya diketahui pemiliknya.
//
// Yang dikerjakan di sini hanya satu: mencari user itu di auth.users lalu
// mencatat user_id-nya ke tabel app_admins, yang dibaca AdminAuthContext untuk
// memutuskan siapa yang boleh masuk /admin.

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is not set. Jalankan dengan: node --env-file=.env.local scratch/umrahme-jadikan-admin.mjs <email>");
  process.exit(1);
}

const email = (process.argv[2] || "").trim().toLowerCase();
if (!email) {
  console.error("Email wajib diisi. Contoh:\n  node --env-file=.env.local scratch/umrahme-jadikan-admin.mjs nama@contoh.com");
  process.exit(1);
}

const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });

async function main() {
  const client = await pool.connect();
  try {
    const user = await client.query(
      `SELECT id, email, email_confirmed_at FROM auth.users WHERE lower(email) = $1 LIMIT 1;`,
      [email],
    );

    if (user.rowCount === 0) {
      console.log(`Akun "${email}" belum ada di Supabase Auth.\n`);
      console.log("Buat dulu akunnya sendiri (password tidak lewat skrip ini):");
      console.log("  1. Buka Supabase Dashboard project ini");
      console.log("  2. Authentication > Users > Add user");
      console.log(`  3. Isi email "${email}" + password pilihan Anda, centang auto-confirm`);
      console.log("  4. Jalankan ulang skrip ini\n");

      const daftar = await client.query(`SELECT email FROM auth.users ORDER BY created_at DESC LIMIT 5;`);
      console.log(
        daftar.rowCount
          ? `Akun yang sudah ada: ${daftar.rows.map((r) => r.email).join(", ")}`
          : "Belum ada satu pun akun di Authentication.",
      );
      return;
    }

    const { id, email_confirmed_at: confirmed } = user.rows[0];

    await client.query(
      `INSERT INTO app_admins (user_id, email) VALUES ($1, $2)
       ON CONFLICT (user_id) DO UPDATE SET email = EXCLUDED.email;`,
      [id, email],
    );

    const all = await client.query(`SELECT email FROM app_admins ORDER BY created_at;`);

    console.log(`OK. "${email}" sekarang admin panel UmrahMe.`);
    if (!confirmed) {
      console.log("Catatan: email ini BELUM terkonfirmasi, jadi login bisa ditolak.");
      console.log("Konfirmasi lewat Supabase > Authentication > Users.");
    }
    console.log(`\nDaftar admin sekarang: ${all.rows.map((r) => r.email).join(", ")}`);
    console.log("Masuk lewat: /admin/login  ->  panel kuota di /admin/kuota");
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
