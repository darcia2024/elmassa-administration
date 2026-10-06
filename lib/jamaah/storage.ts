/**
 * Berkas dokumen jamaah di Supabase Storage (bucket PRIVATE), lewat REST API
 * langsung -- cukup fetch, tanpa menambah dependency supabase-js.
 *
 * Service role key hanya dipakai di server. Klien tidak pernah menerima URL
 * storage; unduhan selalu lewat /api/jamaah/<id>/documents/<jenis> yang dijaga
 * login & izin modul (lihat proxy.ts).
 */

function config() {
  const url = process.env.SUPABASE_URL?.replace(/\/+$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucket = process.env.SUPABASE_DOCS_BUCKET || "dokumen-jamaah";

  if (!url || !key) {
    throw new StorageNotConfiguredError();
  }
  return { url, key, bucket };
}

export class StorageNotConfiguredError extends Error {
  constructor() {
    super(
      "Penyimpanan dokumen belum disetel: isi SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY di environment, lalu jalankan scratch/buat-bucket-dokumen-jamaah.mjs.",
    );
  }
}

function authHeaders(key: string) {
  return { Authorization: `Bearer ${key}`, apikey: key };
}

function objectUrl(base: string, bucket: string, path: string) {
  return `${base}/storage/v1/object/${bucket}/${path.split("/").map(encodeURIComponent).join("/")}`;
}

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "application/pdf": "pdf",
};

/**
 * Path memakai stempel waktu, bukan nama file asli: nama file dari HP sering
 * berisi spasi/karakter aneh, dan path baru per upload menghindari cache CDN
 * menyajikan berkas lama setelah diganti.
 */
export function buildStoragePath(jamaahId: string, docType: string, mimeType: string) {
  return `${jamaahId}/${docType}-${Date.now()}.${EXTENSIONS[mimeType] ?? "bin"}`;
}

export async function uploadObject(path: string, body: ArrayBuffer, contentType: string) {
  const { url, key, bucket } = config();
  const res = await fetch(objectUrl(url, bucket, path), {
    method: "POST",
    headers: { ...authHeaders(key), "Content-Type": contentType, "x-upsert": "true" },
    body,
  });
  if (!res.ok) {
    throw new Error(`Upload ke storage gagal (${res.status}): ${await res.text()}`);
  }
}

export async function downloadObject(path: string): Promise<Response> {
  const { url, key, bucket } = config();
  const res = await fetch(objectUrl(url, bucket, path), { headers: authHeaders(key), cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Berkas tidak bisa diambil dari storage (${res.status})`);
  }
  return res;
}

/** Gagal hapus tidak dilempar: baris DB sudah hilang, sisa berkas yatim lebih ringan daripada error ke staf. */
export async function deleteObjects(paths: string[]) {
  if (paths.length === 0) return;
  const { url, key, bucket } = config();
  const res = await fetch(`${url}/storage/v1/object/${bucket}`, {
    method: "DELETE",
    headers: { ...authHeaders(key), "Content-Type": "application/json" },
    body: JSON.stringify({ prefixes: paths }),
  });
  if (!res.ok) {
    console.error(`Hapus berkas storage gagal (${res.status}): ${await res.text()}`);
  }
}

export function isStorageConfigured() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}
