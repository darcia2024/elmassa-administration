// Menyamakan data UmrahMe dengan sistem staf untuk data yang SUDAH ada. Aman dijalankan berulang.
//   node --import ./scratch/register-alias.mjs --env-file=.env.local scratch/sinkron-umrahme.mjs
//
// 1. Batch UmrahMe mengikuti paketnya (nama, tanggal, hotel).
// 2. Akun UmrahMe yang belum tertaut ditautkan ke profil master (hanya yang pasti cocok).
// 3. Status dokumen peserta mengikuti kelengkapan profil yang tertaut.
// Kodenya sama dengan yang dipakai aplikasi (lib/umrahme/store.ts, lib/jamaah/store.ts).

import { getPool } from "@/lib/db/connection";
import { linkAccountsToProfiles, syncKeberangkatanFromPackage, TENANT_ID } from "@/lib/umrahme/store";
import { syncParticipantStatus } from "@/lib/jamaah/store";

const pool = getPool();
try {
  const paket = await pool.query(
    `SELECT DISTINCT package_id FROM keberangkatan WHERE tenant_id = $1 AND package_id <> '';`,
    [TENANT_ID],
  );
  let batch = 0;
  for (const r of paket.rows) batch += await syncKeberangkatanFromPackage(r.package_id);
  console.log(`Batch diselaraskan dengan paket : ${batch} (dari ${paket.rowCount} paket)`);

  const tertaut = await linkAccountsToProfiles(pool);
  const sisa = await pool.query(`SELECT COUNT(*)::int AS n FROM jamaah_accounts WHERE tenant_id = $1 AND jamaah_id IS NULL;`, [TENANT_ID]);
  console.log(`Akun baru tertaut ke profil     : ${tertaut} (masih belum tertaut: ${sisa.rows[0].n})`);

  const profil = await pool.query(`SELECT DISTINCT jamaah_id FROM participants WHERE jamaah_id IS NOT NULL;`);
  let berubah = 0;
  for (const r of profil.rows) berubah += await syncParticipantStatus(r.jamaah_id);
  console.log(`Status dokumen peserta diubah   : ${berubah} (dari ${profil.rowCount} profil tertaut)`);
} finally {
  await pool.end();
}
