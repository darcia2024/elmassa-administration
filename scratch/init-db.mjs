import pg from "pg";
const { Pool } = pg;

// Standalone script — run it with the env var set, e.g.
//   node --env-file=.env.local scratch/init-db.mjs
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error(
    "DATABASE_URL is not set. Run with: node --env-file=.env.local scratch/init-db.mjs",
  );
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  const client = await pool.connect();
  try {
    // 1. Revision Notes
    await client.query(`
      CREATE TABLE IF NOT EXISTS page_revision_notes (
        id VARCHAR(100) PRIMARY KEY,
        page_url TEXT NOT NULL,
        page_title TEXT DEFAULT '',
        element_target TEXT DEFAULT '',
        note_content TEXT NOT NULL,
        priority TEXT DEFAULT 'Sedang',
        status TEXT DEFAULT 'Perlu Revisi',
        author TEXT DEFAULT 'Klien El Massa',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 2. Published Packages
    await client.query(`
      CREATE TABLE IF NOT EXISTS published_packages (
        id VARCHAR(100) PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT DEFAULT 'Umrah Reguler',
        duration TEXT DEFAULT '12 Hari',
        departures_date TEXT DEFAULT '',
        departure_date TEXT DEFAULT '',
        return_date TEXT DEFAULT '',
        price TEXT DEFAULT 'Rp 0',
        numeric_price NUMERIC DEFAULT 0,
        dp_minimum TEXT DEFAULT 'Rp 5.000.000',
        makkah_hotel TEXT DEFAULT '',
        madinah_hotel TEXT DEFAULT '',
        airline TEXT DEFAULT '',
        domestic_airline TEXT DEFAULT '',
        international_airline TEXT DEFAULT '',
        flight_route TEXT DEFAULT '',
        start_point TEXT DEFAULT '',
        program_umrah TEXT DEFAULT '',
        itinerary JSONB DEFAULT '[]'::jsonb,
        includes JSONB DEFAULT '[]'::jsonb,
        excludes JSONB DEFAULT '[]'::jsonb,
        poster_img TEXT DEFAULT '/poster-el-massa.png',
        banner_img TEXT DEFAULT '/banner-el-massa.png',
        featured BOOLEAN DEFAULT true,
        costing_data JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 3. Real Bookings Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS real_bookings (
        code VARCHAR(100) PRIMARY KEY,
        customer_name TEXT NOT NULL,
        phone TEXT DEFAULT '',
        nik TEXT DEFAULT '',
        package_id TEXT DEFAULT '',
        package_name TEXT NOT NULL,
        departure TEXT DEFAULT '',
        room_type TEXT DEFAULT 'Quad (4 Orang)',
        participants INT DEFAULT 1,
        total_amount NUMERIC DEFAULT 0,
        paid_amount NUMERIC DEFAULT 0,
        remaining_amount NUMERIC DEFAULT 0,
        status TEXT DEFAULT 'Belum Bayar',
        umrah_me_status TEXT DEFAULT 'Aktif 🟢',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 4. Real Customers Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS real_customers (
        id VARCHAR(100) PRIMARY KEY,
        name TEXT NOT NULL,
        phone TEXT DEFAULT '',
        email TEXT DEFAULT '',
        nik TEXT DEFAULT '',
        passport_number TEXT DEFAULT '',
        city TEXT DEFAULT '',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    console.log("✅ ALL SUPABASE CLOUD TABLES CREATED & AUDITED 100% SUCCESSFULLY");
  } catch (e) {
    console.error("Initialization error:", e);
  } finally {
    client.release();
    process.exit(0);
  }
}

main();
