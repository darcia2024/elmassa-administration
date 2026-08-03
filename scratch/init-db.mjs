import pg from "pg";
const { Pool } = pg;

const connectionString =
  "postgresql://postgres.dekeoqlowiozsjpsqdsl:l7FItz7zmhhB2Yfo@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres";

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  const client = await pool.connect();
  try {
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

    console.log("✅ SUPABASE CLOUD TABLES CREATED 100% SUCCESSFULLY");
  } catch (e) {
    console.error("Initialization error:", e);
  } finally {
    client.release();
    process.exit(0);
  }
}

main();
