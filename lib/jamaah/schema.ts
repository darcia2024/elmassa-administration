import { getPool } from "@/lib/db/connection";

/**
 * Tabel profil master jamaah, dibuat saat pertama dipakai -- pola yang sama
 * dengan ensureTables() di lib/roles/store.ts. Tanpa ini, deploy yang lupa
 * menjalankan scratch/add-jamaah-master.mjs akan mematahkan Manifest dan form
 * booking (keduanya membaca participants.jamaah_id).
 *
 * Fungsi RPC untuk UmrahMe, RLS, dan pencabutan izin anon TETAP di
 * scratch/add-jamaah-master.mjs (butuh tabel tenants milik UmrahMe). Kalau
 * mengubah kolom di sini, ubah juga di skrip itu.
 */

let ready: Promise<void> | null = null;

export function ensureJamaahSchema(): Promise<void> {
  if (!ready) {
    ready = getPool()
      .query(`
        CREATE TABLE IF NOT EXISTS jamaah_profiles (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          full_name TEXT NOT NULL,
          gender TEXT NOT NULL DEFAULT '',
          birth_place TEXT NOT NULL DEFAULT '',
          birth_date DATE,
          nik TEXT NOT NULL DEFAULT '',
          passport_number TEXT NOT NULL DEFAULT '',
          passport_issue_place TEXT NOT NULL DEFAULT '',
          passport_issue_date DATE,
          passport_expiry DATE,
          phone TEXT NOT NULL DEFAULT '',
          address TEXT NOT NULL DEFAULT '',
          emergency_name TEXT NOT NULL DEFAULT '',
          emergency_relation TEXT NOT NULL DEFAULT '',
          emergency_phone TEXT NOT NULL DEFAULT '',
          companions JSONB NOT NULL DEFAULT '[]'::jsonb,
          notes TEXT NOT NULL DEFAULT '',
          source TEXT NOT NULL DEFAULT 'admin',
          self_service_token TEXT UNIQUE,
          created_by TEXT NOT NULL DEFAULT '',
          updated_by TEXT NOT NULL DEFAULT '',
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
        CREATE TABLE IF NOT EXISTS jamaah_documents (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          jamaah_id UUID NOT NULL REFERENCES jamaah_profiles(id) ON DELETE CASCADE,
          doc_type TEXT NOT NULL,
          doc_subtype TEXT NOT NULL DEFAULT '',
          storage_path TEXT NOT NULL,
          file_name TEXT NOT NULL DEFAULT '',
          mime_type TEXT NOT NULL DEFAULT '',
          size_bytes INTEGER NOT NULL DEFAULT 0,
          uploaded_via TEXT NOT NULL DEFAULT 'admin',
          uploaded_by TEXT NOT NULL DEFAULT '',
          uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          UNIQUE (jamaah_id, doc_type)
        );
        ALTER TABLE jamaah_profiles ADD COLUMN IF NOT EXISTS passport_name TEXT NOT NULL DEFAULT '';
        ALTER TABLE jamaah_profiles ADD COLUMN IF NOT EXISTS father_name TEXT NOT NULL DEFAULT '';
        ALTER TABLE jamaah_profiles ADD COLUMN IF NOT EXISTS province TEXT NOT NULL DEFAULT '';
        ALTER TABLE jamaah_profiles ADD COLUMN IF NOT EXISTS regency TEXT NOT NULL DEFAULT '';
        ALTER TABLE jamaah_profiles ADD COLUMN IF NOT EXISTS district TEXT NOT NULL DEFAULT '';
        ALTER TABLE jamaah_profiles ADD COLUMN IF NOT EXISTS village TEXT NOT NULL DEFAULT '';
        ALTER TABLE jamaah_profiles ADD COLUMN IF NOT EXISTS marital_status TEXT NOT NULL DEFAULT '';
        ALTER TABLE jamaah_profiles ADD COLUMN IF NOT EXISTS education TEXT NOT NULL DEFAULT '';
        ALTER TABLE jamaah_profiles ADD COLUMN IF NOT EXISTS occupation TEXT NOT NULL DEFAULT '';
        ALTER TABLE participants ADD COLUMN IF NOT EXISTS jamaah_id UUID REFERENCES jamaah_profiles(id) ON DELETE SET NULL;
      `)
      .then(() => undefined)
      .catch((err) => {
        // Jangan simpan kegagalan: koneksi yang putus sesaat tidak boleh
        // membuat semua permintaan berikutnya ikut gagal sampai server restart.
        ready = null;
        throw err;
      });
  }
  return ready;
}
