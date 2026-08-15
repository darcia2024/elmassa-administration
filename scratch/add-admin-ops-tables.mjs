import pg from "pg";
const { Pool } = pg;

// Standalone migration — run it with the env var set, e.g.
//   node --env-file=.env.local scratch/add-admin-ops-tables.mjs
//
// Creates the five tables behind the ADMINISTRASI / PEMBAYARAN / OPERASIONAL
// menus. None of these concepts existed anywhere in the codebase before:
//
//   letters              arsip surat resmi (nomor urut otomatis per jenis/tahun)
//   expenses             pengeluaran — the missing half of "pemasukan & pengeluaran"
//   employees            data kepegawaian, sengaja terpisah dari staff_users
//                        (akun login) karena tidak semua karyawan punya akun
//   agents               data agen/mitra perekrut jamaah + skema komisi
//   inventory_items      stok perlengkapan (koper, kain ihram, dll)
//   inventory_movements  kartu stok masuk/keluar — saldo dihitung dari sini
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("DATABASE_URL is not set. Run with: node --env-file=.env.local scratch/add-admin-ops-tables.mjs");
  process.exit(1);
}

const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });

const STATEMENTS = [
  // Which agent brought a booking in. Kept on the booking (not a join table)
  // because a booking has exactly one recruiting agent, and lib/agents/store.ts
  // counts recruitment from here rather than storing totals on the agent row.
  `ALTER TABLE real_bookings ADD COLUMN IF NOT EXISTS agent_code TEXT NOT NULL DEFAULT '';`,
  `CREATE INDEX IF NOT EXISTS real_bookings_agent_idx ON real_bookings (agent_code);`,

  `CREATE TABLE IF NOT EXISTS letters (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     letter_number TEXT NOT NULL UNIQUE,
     letter_type TEXT NOT NULL,
     recipient_name TEXT NOT NULL DEFAULT '',
     recipient_nik TEXT NOT NULL DEFAULT '',
     passport_number TEXT NOT NULL DEFAULT '',
     birth_place TEXT NOT NULL DEFAULT '',
     birth_date TEXT NOT NULL DEFAULT '',
     address TEXT NOT NULL DEFAULT '',
     booking_code TEXT NOT NULL DEFAULT '',
     package_id TEXT NOT NULL DEFAULT '',
     package_name TEXT NOT NULL DEFAULT '',
     departure_date TEXT NOT NULL DEFAULT '',
     subject TEXT NOT NULL DEFAULT '',
     body TEXT NOT NULL DEFAULT '',
     extra JSONB NOT NULL DEFAULT '{}'::jsonb,
     issued_date DATE NOT NULL,
     issued_by TEXT NOT NULL DEFAULT '',
     status TEXT NOT NULL DEFAULT 'Terbit',
     created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
     updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
   );`,
  `CREATE INDEX IF NOT EXISTS letters_type_idx ON letters (letter_type);`,
  `CREATE INDEX IF NOT EXISTS letters_issued_idx ON letters (issued_date DESC);`,

  `CREATE TABLE IF NOT EXISTS expenses (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     expense_date DATE NOT NULL,
     category TEXT NOT NULL DEFAULT 'Operasional',
     description TEXT NOT NULL,
     amount NUMERIC NOT NULL DEFAULT 0,
     method TEXT NOT NULL DEFAULT 'Transfer',
     reference_number TEXT NOT NULL DEFAULT '',
     package_id TEXT NOT NULL DEFAULT '',
     recorded_by TEXT NOT NULL DEFAULT '',
     notes TEXT NOT NULL DEFAULT '',
     created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
     updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
   );`,
  `CREATE INDEX IF NOT EXISTS expenses_date_idx ON expenses (expense_date DESC);`,

  `CREATE TABLE IF NOT EXISTS employees (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     employee_number TEXT NOT NULL DEFAULT '',
     name TEXT NOT NULL,
     nik TEXT NOT NULL DEFAULT '',
     position TEXT NOT NULL DEFAULT '',
     division TEXT NOT NULL DEFAULT '',
     join_date DATE,
     employment_status TEXT NOT NULL DEFAULT 'Kontrak',
     salary NUMERIC NOT NULL DEFAULT 0,
     phone TEXT NOT NULL DEFAULT '',
     email TEXT NOT NULL DEFAULT '',
     address TEXT NOT NULL DEFAULT '',
     emergency_contact TEXT NOT NULL DEFAULT '',
     emergency_phone TEXT NOT NULL DEFAULT '',
     status TEXT NOT NULL DEFAULT 'Aktif',
     notes TEXT NOT NULL DEFAULT '',
     created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
     updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
   );`,

  `CREATE TABLE IF NOT EXISTS agents (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     agent_code TEXT NOT NULL DEFAULT '',
     name TEXT NOT NULL,
     phone TEXT NOT NULL DEFAULT '',
     email TEXT NOT NULL DEFAULT '',
     address TEXT NOT NULL DEFAULT '',
     city TEXT NOT NULL DEFAULT '',
     commission_type TEXT NOT NULL DEFAULT 'nominal',
     commission_value NUMERIC NOT NULL DEFAULT 0,
     bank_name TEXT NOT NULL DEFAULT '',
     bank_account TEXT NOT NULL DEFAULT '',
     status TEXT NOT NULL DEFAULT 'Aktif',
     notes TEXT NOT NULL DEFAULT '',
     created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
     updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
   );`,

  `CREATE TABLE IF NOT EXISTS inventory_items (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     sku TEXT NOT NULL DEFAULT '',
     name TEXT NOT NULL,
     category TEXT NOT NULL DEFAULT 'Perlengkapan Jamaah',
     unit TEXT NOT NULL DEFAULT 'pcs',
     minimum_stock INTEGER NOT NULL DEFAULT 0,
     unit_cost NUMERIC NOT NULL DEFAULT 0,
     notes TEXT NOT NULL DEFAULT '',
     created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
     updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
   );`,

  // Stock on hand is never stored on inventory_items -- it is SUM(masuk) -
  // SUM(keluar) over this ledger, so a saved balance can never drift away from
  // the movements that are supposed to explain it.
  `CREATE TABLE IF NOT EXISTS inventory_movements (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
     movement_type TEXT NOT NULL,
     quantity INTEGER NOT NULL,
     package_id TEXT NOT NULL DEFAULT '',
     notes TEXT NOT NULL DEFAULT '',
     recorded_by TEXT NOT NULL DEFAULT '',
     moved_at DATE NOT NULL,
     created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
   );`,
  `CREATE INDEX IF NOT EXISTS inventory_movements_item_idx ON inventory_movements (item_id);`,
  `ALTER TABLE inventory_movements DROP CONSTRAINT IF EXISTS inventory_movements_type_check;`,
  `ALTER TABLE inventory_movements ADD CONSTRAINT inventory_movements_type_check
     CHECK (movement_type IN ('masuk', 'keluar'));`,
  `ALTER TABLE inventory_movements DROP CONSTRAINT IF EXISTS inventory_movements_qty_check;`,
  `ALTER TABLE inventory_movements ADD CONSTRAINT inventory_movements_qty_check
     CHECK (quantity > 0);`,
];

async function main() {
  const client = await pool.connect();
  try {
    for (const sql of STATEMENTS) {
      await client.query(sql);
    }

    const tables = ["letters", "expenses", "employees", "agents", "inventory_items", "inventory_movements"];
    const rows = [];
    for (const table of tables) {
      const cols = await client.query(
        `SELECT COUNT(*)::int AS n FROM information_schema.columns WHERE table_name = $1;`,
        [table],
      );
      const count = await client.query(`SELECT COUNT(*)::int AS n FROM ${table};`);
      rows.push({ tabel: table, kolom: cols.rows[0].n, baris: count.rows[0].n });
    }
    console.table(rows);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
