/**
 * Data uji sementara untuk membuktikan 12 aturan notifikasi benar-benar
 * terpicu (lib/notifications/store.ts).
 *
 * SEMUA baris yang dibuat di sini bertanda 'uji-coba-' / 'UJI-' supaya
 * penghapusannya presisi dan tidak mungkin menyenggol data asli.
 *
 *   node --env-file=.env.local scratch/uji-notifikasi.mjs seed
 *   node --env-file=.env.local scratch/uji-notifikasi.mjs hapus
 *   node --env-file=.env.local scratch/uji-notifikasi.mjs hitung
 *
 * Acuan tanggal: hari ini 2026-08-16 (WIB).
 */

import pg from "pg";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const TABEL = [
  "published_packages",
  "real_bookings",
  "participants",
  "payments",
  "installments",
  "inventory_items",
  "inventory_movements",
];

async function hitung(label) {
  console.log(`\n=== ${label} ===`);
  for (const t of TABEL) {
    const r = await pool.query(`SELECT COUNT(*)::int c FROM ${t}`);
    console.log(t.padEnd(22), r.rows[0].c);
  }
}

async function seed() {
  // Dua paket uji: satu berangkat 4 hari lagi (memicu aturan tenggat dekat),
  // satu 30 hari lagi dengan kuota nyaris penuh.
  await pool.query(`
    INSERT INTO published_packages (id, name, departure_date, return_date, target_pax, category, duration)
    VALUES
      ('uji-coba-pkg-1', 'UJI COBA -- Umrah Dekat', '2026-08-20', '2026-08-30', 10, 'Uji', '10 Hari'),
      ('uji-coba-pkg-2', 'UJI COBA -- Umrah Nyaris Penuh', '2026-09-15', '2026-09-25', 10, 'Uji', '10 Hari')
    ON CONFLICT (id) DO NOTHING;
  `);

  await pool.query(`
    INSERT INTO real_bookings
      (code, customer_name, phone, package_id, package_name, departure, participants,
       total_amount, paid_amount, remaining_amount, status)
    VALUES
      -- H-4, kurang 20jt  -> pelunasan-h14
      ('UJI-BK-001', 'UJI COBA Pelunasan Mepet', '0800000001', 'uji-coba-pkg-1',
       'UJI COBA -- Umrah Dekat', '2026-08-20', 2, 30000000, 10000000, 20000000, 'DP'),
      -- package_id NULL supaya tanggalnya jatuh ke teks 'departure': sudah lewat
      -- 6 hari tapi belum lunas -> pelunasan-lewat
      ('UJI-BK-002', 'UJI COBA Sudah Berangkat Belum Lunas', '0800000002', NULL,
       'UJI COBA -- Tanpa Paket', '2026-08-10', 1, 25000000, 5000000, 20000000, 'DP'),
      -- KONTROL NEGATIF: lunas, tidak boleh memunculkan peringatan apa pun
      ('UJI-BK-003', 'UJI COBA Lunas', '0800000003', 'uji-coba-pkg-1',
       'UJI COBA -- Umrah Dekat', '2026-08-20', 1, 20000000, 20000000, 0, 'Lunas'),
      -- 9 dari 10 seat -> seat-hampir-penuh, dan lunas jadi tidak ada alarm uang
      ('UJI-BK-004', 'UJI COBA Rombongan Besar', '0800000004', 'uji-coba-pkg-2',
       'UJI COBA -- Umrah Nyaris Penuh', '2026-09-15', 9, 90000000, 90000000, 0, 'Lunas')
    ON CONFLICT (code) DO NOTHING;
  `);

  await pool.query(`
    INSERT INTO participants
      (booking_code, name, passport_number, visa_number, visa_expiry, ticket_number, document_status)
    VALUES
      -- Semua dokumen kosong, berangkat H-4 -> paspor/visa/tiket belum
      ('UJI-BK-001', 'UJI Jamaah Tanpa Dokumen', '', '', NULL, '', 'Belum Lengkap'),
      -- Dokumen lengkap tapi visa habis 25 Agu, rombongan baru pulang 30 Agu
      ('UJI-BK-001', 'UJI Jamaah Visa Kedaluwarsa', 'C1234567', 'V9990001', '2026-08-25', 'SV-0001', 'Lengkap');
  `);

  await pool.query(`
    INSERT INTO payments (booking_code, payment_date, amount, method, status)
    VALUES ('UJI-BK-001', '2026-08-14', 10000000, 'Transfer', 'Menunggu Cek');
  `);

  await pool.query(`
    INSERT INTO installments (booking_code, sequence, label, due_date, amount, paid_amount, status)
    VALUES ('UJI-BK-001', 2, 'Termin Kedua', '2026-08-01', 15000000, 0, 'Belum Bayar');
  `);

  await pool.query(`
    INSERT INTO inventory_items (sku, name, category, unit, minimum_stock, unit_cost)
    VALUES ('UJI-STOK-1', 'UJI COBA Koper Bagasi', 'Perlengkapan', 'pcs', 10, 450000)
    ON CONFLICT DO NOTHING;
  `);

  console.log("Data uji dibuat.");
}

async function hapus() {
  // Urutan mengikuti ketergantungan; semuanya disaring dengan penanda uji.
  const r1 = await pool.query(`DELETE FROM payments      WHERE booking_code LIKE 'UJI-BK-%';`);
  const r2 = await pool.query(`DELETE FROM installments  WHERE booking_code LIKE 'UJI-BK-%';`);
  const r3 = await pool.query(`DELETE FROM participants  WHERE booking_code LIKE 'UJI-BK-%';`);
  const r4 = await pool.query(`DELETE FROM real_bookings WHERE code LIKE 'UJI-BK-%';`);
  const r5 = await pool.query(`DELETE FROM inventory_movements WHERE item_id IN (SELECT id FROM inventory_items WHERE sku LIKE 'UJI-%');`);
  const r6 = await pool.query(`DELETE FROM inventory_items WHERE sku LIKE 'UJI-%';`);
  const r7 = await pool.query(`DELETE FROM published_packages WHERE id LIKE 'uji-coba-%';`);
  const r8 = await pool.query(`DELETE FROM notification_reads WHERE notification_key LIKE '%UJI-%' OR notification_key LIKE '%uji-coba-%';`);

  console.log("Terhapus:", {
    payments: r1.rowCount, installments: r2.rowCount, participants: r3.rowCount,
    real_bookings: r4.rowCount, inventory_movements: r5.rowCount,
    inventory_items: r6.rowCount, published_packages: r7.rowCount,
    notification_reads: r8.rowCount,
  });
}

const perintah = process.argv[2];
try {
  if (perintah === "seed") { await hitung("SEBELUM"); await seed(); await hitung("SESUDAH"); }
  else if (perintah === "hapus") { await hapus(); await hitung("SETELAH DIHAPUS"); }
  else if (perintah === "hitung") { await hitung("HITUNG"); }
  else console.log("Pakai: seed | hapus | hitung");
} finally {
  await pool.end();
}
