import pg from "pg";
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function clean() {
  await pool.query("DELETE FROM participants WHERE booking_code LIKE 'BK-MYE-LIVE%'");
  await pool.query("DELETE FROM real_bookings WHERE code LIKE 'BK-MYE-LIVE%'");
  console.log("Cleaned live test bookings!");
  await pool.end();
}

clean();
