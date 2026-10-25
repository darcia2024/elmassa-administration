import pg from "pg";
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function auditDatabase() {
  console.log("=== MEMULAI AUDIT DATABASE & SYSTEM INTEGRITY ===");
  const tables = [
    "published_packages",
    "real_bookings",
    "participants",
    "jamaah_profiles",
    "agents",
    "employees",
    "inventory_items",
    "inventory_movements",
    "letters",
    "expenses",
    "payment_records",
    "receipts",
    "invoices"
  ];

  for (const table of tables) {
    try {
      const res = await pool.query(`SELECT count(*)::int as count FROM ${table}`);
      console.log(`✓ Tabel ${table.padEnd(22)}: ${res.rows[0].count} baris`);
    } catch (err) {
      console.log(`⚠ Tabel ${table.padEnd(22)}: [${err.code || "ERR"}] ${err.message}`);
    }
  }

  // Check agent & booking linkage
  try {
    const agentCols = await pool.query(
      "SELECT column_name FROM information_schema.columns WHERE table_name = 'real_bookings' AND column_name = 'agent_code'"
    );
    console.log(`✓ Kolom real_bookings.agent_code : ${agentCols.rows.length > 0 ? "ADA & AKTIF" : "TIDAK DITEMUKAN"}`);
  } catch (e) {
    console.error(e);
  }

  // Check active test agent
  try {
    const agents = await pool.query("SELECT agent_code, name, status, commission_type, commission_value FROM agents");
    console.log(`✓ Data Agen terdaftar           : ${agents.rows.length} agen`);
    agents.rows.forEach(a => console.log(`   - ${a.agent_code}: ${a.name} (${a.status})`));
  } catch (e) {
    console.error(e);
  }

  await pool.end();
}

auditDatabase();
