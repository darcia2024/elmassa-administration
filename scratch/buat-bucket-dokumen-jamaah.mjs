// Membuat bucket PRIVATE di Supabase Storage untuk dokumen jamaah.
//   node --env-file=.env.local scratch/buat-bucket-dokumen-jamaah.mjs
//
// Butuh di .env.local:
//   SUPABASE_URL=https://<project-ref>.supabase.co
//   SUPABASE_SERVICE_ROLE_KEY=<service role key, BUKAN anon key>
//   SUPABASE_DOCS_BUCKET=dokumen-jamaah   (opsional)
//
// Bucket-nya private: KTP, KK, dan paspor tidak boleh punya URL publik. Semua
// unduhan lewat /api/jamaah/<id>/documents/<jenis>, yang dijaga login & izin.

const url = process.env.SUPABASE_URL?.replace(/\/+$/, "");
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const bucket = process.env.SUPABASE_DOCS_BUCKET || "dokumen-jamaah";

if (!url || !key) {
  console.error("SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY wajib diisi di .env.local.");
  process.exit(1);
}

const headers = { Authorization: `Bearer ${key}`, apikey: key, "Content-Type": "application/json" };

const existing = await fetch(`${url}/storage/v1/bucket/${bucket}`, { headers });
if (existing.ok) {
  const info = await existing.json();
  console.log(`Bucket "${bucket}" sudah ada (public: ${info.public}).`);
  if (info.public) console.error("PERINGATAN: bucket ini publik. Ubah jadi private di dashboard Supabase.");
  process.exit(0);
}

const res = await fetch(`${url}/storage/v1/bucket`, {
  method: "POST",
  headers,
  body: JSON.stringify({
    id: bucket,
    name: bucket,
    public: false,
    file_size_limit: 5 * 1024 * 1024,
    allowed_mime_types: ["image/jpeg", "image/png", "image/webp", "application/pdf"],
  }),
});

if (!res.ok) {
  console.error(`Gagal membuat bucket: ${res.status} ${await res.text()}`);
  process.exit(1);
}
console.log(`Bucket private "${bucket}" dibuat.`);
