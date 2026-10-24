import pg from "pg";
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  try {
    const cols = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'published_packages'");
    console.log("Package cols:", cols.rows.map(r => r.column_name));

    const packages = await pool.query("SELECT * FROM published_packages LIMIT 2");
    console.log("Sample package:", packages.rows[0]);

    const bookingCols = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'real_bookings'");
    console.log("Booking cols:", bookingCols.rows.map(r => r.column_name));
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await pool.end();
  }
}

main();
