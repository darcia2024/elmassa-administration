import pg from "pg";
const { Pool } = pg;

// Removes ONLY the two throwaway bookings created to verify the Jadwal
// Keberangkatan payment + manifest tabs end to end:
//   VERIFY-001  Hj. Nur Aisyah Rahmawati   (DP + 2 cicilan, belum lunas)
//   VERIFY-002  H. Bambang Kusumo Wijaya   (sekali bayar, lunas)
//
// participants / payments / receipts hang off these booking codes with
// ON DELETE CASCADE, so deleting the bookings takes their rows with them.
//
//   node --env-file=.env.local scratch/remove-verify-data.mjs
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("DATABASE_URL is not set. Run with: node --env-file=.env.local scratch/remove-verify-data.mjs");
  process.exit(1);
}

const CODES = ["VERIFY-001", "VERIFY-002"];
const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });

async function main() {
  const client = await pool.connect();
  try {
    const before = await client.query(
      `SELECT code, customer_name FROM real_bookings WHERE code = ANY($1::text[]) ORDER BY code;`,
      [CODES],
    );

    if (before.rowCount === 0) {
      console.log("Tidak ada data verifikasi tersisa — sudah bersih.");
      return;
    }

    console.log("Menghapus:");
    console.table(before.rows);

    const res = await client.query(`DELETE FROM real_bookings WHERE code = ANY($1::text[]);`, [CODES]);
    console.log(`\n${res.rowCount} booking dihapus (beserta jamaah, pembayaran, & kuitansinya).`);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
