import pg from "pg";
const { Pool } = pg;

// Login jamaah lewat fungsi, bukan query tabel langsung.
//   node --env-file=.env.local scratch/umrahme-login-jamaah-rpc.mjs
//
// Sebelumnya aplikasi jamaah menanyakan tabelnya langsung dengan anon key, dan
// kunci itu ada di dalam bundle browser setiap pengunjung. Artinya siapa pun
// bisa membaca seluruh baris -- daftar lengkap jamaah satu travel -- cukup
// dengan memanggil endpoint REST-nya sendiri.
//
// Fungsi ini berjalan sebagai pemilik tabel dan hanya mengembalikan SATU baris
// yang benar-benar cocok, jadi anon tidak perlu izin baca ke tabelnya sama
// sekali. Pencocokan juga diperketat: nama harus utuh (bukan sebagian) dan kode
// aktivasi diperiksa bila dikirim. Yang benar-benar diperbaiki adalah
// pencocokan namanya: versi lama memakai ILIKE '%nama%', sehingga mengetik
// satu huruf bisa masuk sebagai jamaah orang lain.

const connectionString = process.env.DATABASE_URL;
if (!connectionString) { console.error("DATABASE_URL is not set."); process.exit(1); }

const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });

const SQL = `
CREATE OR REPLACE FUNCTION jamaah_login(p_kode TEXT, p_nama TEXT)
RETURNS TABLE (
  id TEXT, tenant_id TEXT, keberangkatan_id TEXT,
  nama TEXT, nomor_jamaah TEXT, rombongan TEXT,
  bus TEXT, kamar TEXT, flight TEXT, e_visa TEXT,
  batch TEXT, titik_kumpul TEXT, status TEXT, fase_override TEXT
)
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT j.id, j.tenant_id, j.keberangkatan_id,
         j.nama, j.nomor_jamaah, j.rombongan,
         j.bus, j.kamar, j.flight, j.e_visa,
         j.batch, j.titik_kumpul, j.status, j.fase_override
    FROM jamaah_accounts j
    JOIN tenants t ON t.id = j.tenant_id
   WHERE (
           -- Kode aktivasi hanya menyaring bila memang dikirim. Halaman login
           -- jamaah hanya meminta nama (validasiKode(null, nama)), sedangkan
           -- halaman ber-slug mengirim kodenya. Mewajibkan kode akan membuat
           -- login lewat halaman biasa selalu gagal.
           COALESCE(trim(p_kode), '') = ''
           OR upper(trim(t.activation_code)) = upper(trim(p_kode))
         )
     AND lower(regexp_replace(trim(j.nama), '[[:space:]]+', ' ', 'g'))
       = lower(regexp_replace(trim(COALESCE(p_nama, '')), '[[:space:]]+', ' ', 'g'))
   LIMIT 1;
$$;`;

async function main() {
  const c = await pool.connect();
  try {
    await c.query(SQL);
    await c.query(`REVOKE ALL ON FUNCTION jamaah_login(TEXT, TEXT) FROM PUBLIC;`);
    await c.query(`GRANT EXECUTE ON FUNCTION jamaah_login(TEXT, TEXT) TO anon, authenticated;`);

    // Tabelnya sendiri tidak lagi bisa dibaca anon -- semua lewat fungsi di atas.
    await c.query(`REVOKE SELECT ON jamaah_accounts FROM anon;`);

    console.log("jamaah_login() siap; anon tidak lagi punya SELECT ke jamaah_accounts.");
  } finally {
    c.release();
    await pool.end();
  }
}

main().catch((e) => { console.error(e.message); process.exit(1); });
