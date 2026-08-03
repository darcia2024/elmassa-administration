import { NextResponse } from "next/server";
import { Pool } from "pg";

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres.dekeoqlowiozsjpsqdsl:9I1er0NtdwzcZ81H@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres";

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

// Ensure table exists
async function ensureTable() {
  const client = await pool.connect();
  try {
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
      ALTER TABLE published_packages ADD COLUMN IF NOT EXISTS costing_data JSONB DEFAULT '{}'::jsonb;
    `);
  } catch (err) {
    console.error("Error creating published_packages table:", err);
  } finally {
    client.release();
  }
}

// GET: Fetch all published packages from Supabase
export async function GET() {
  try {
    await ensureTable();
    const res = await pool.query(
      `SELECT 
        id, 
        name, 
        category, 
        duration, 
        departures_date as "departuresDate", 
        departure_date as "departureDate", 
        return_date as "returnDate", 
        price, 
        numeric_price as "numericPrice", 
        dp_minimum as "dpMinimum", 
        makkah_hotel as "makkahHotel", 
        madinah_hotel as "madinahHotel", 
        airline, 
        domestic_airline as "domesticAirline", 
        international_airline as "internationalAirline", 
        flight_route as "flightRoute", 
        start_point as "startPoint", 
        program_umrah as "programUmrah", 
        itinerary, 
        includes, 
        excludes, 
        poster_img as "posterImg", 
        banner_img as "bannerImg", 
        featured,
        costing_data as "costingData"
       FROM published_packages 
       ORDER BY created_at DESC;`
    );
    return NextResponse.json({ ok: true, data: res.rows });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

// POST: Save/publish package to Supabase
export async function POST(req: Request) {
  try {
    await ensureTable();
    const pkg = await req.json();

    const client = await pool.connect();
    try {
      await client.query(
        `INSERT INTO published_packages (
          id, name, category, duration, departures_date, departure_date, return_date, price, numeric_price, dp_minimum, makkah_hotel, madinah_hotel, airline, domestic_airline, international_airline, flight_route, start_point, program_umrah, itinerary, includes, excludes, poster_img, banner_img, featured, costing_data
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          category = EXCLUDED.category,
          duration = EXCLUDED.duration,
          departures_date = EXCLUDED.departures_date,
          departure_date = EXCLUDED.departure_date,
          return_date = EXCLUDED.return_date,
          price = EXCLUDED.price,
          numeric_price = EXCLUDED.numeric_price,
          dp_minimum = EXCLUDED.dp_minimum,
          makkah_hotel = EXCLUDED.makkah_hotel,
          madinah_hotel = EXCLUDED.madinah_hotel,
          airline = EXCLUDED.airline,
          domestic_airline = EXCLUDED.domestic_airline,
          international_airline = EXCLUDED.international_airline,
          flight_route = EXCLUDED.flight_route,
          start_point = EXCLUDED.start_point,
          program_umrah = EXCLUDED.program_umrah,
          itinerary = EXCLUDED.itinerary,
          includes = EXCLUDED.includes,
          excludes = EXCLUDED.excludes,
          poster_img = EXCLUDED.poster_img,
          banner_img = EXCLUDED.banner_img,
          featured = EXCLUDED.featured,
          costing_data = EXCLUDED.costing_data;`,
        [
          pkg.id || `pkg-custom-${Date.now()}`,
          pkg.name || "Paket Umrah Kustom",
          pkg.category || "Umrah Reguler",
          pkg.duration || "12 Hari",
          pkg.departuresDate || "",
          pkg.departureDate || "",
          pkg.returnDate || "",
          pkg.price || "Rp 0",
          Number(pkg.numericPrice) || 0,
          pkg.dpMinimum || "Rp 5.000.000",
          pkg.makkahHotel || "",
          pkg.madinahHotel || "",
          pkg.airline || "",
          pkg.domesticAirline || "",
          pkg.internationalAirline || "",
          pkg.flightRoute || "",
          pkg.startPoint || "",
          pkg.programUmrah || "",
          JSON.stringify(pkg.itinerary || []),
          JSON.stringify(pkg.includes || []),
          JSON.stringify(pkg.excludes || []),
          pkg.posterImg || "/poster-el-massa.png",
          pkg.bannerImg || "/banner-el-massa.png",
          pkg.featured !== undefined ? pkg.featured : true,
          JSON.stringify(pkg.costingData || pkg.costing_data || pkg),
        ]
      );

      return NextResponse.json({ ok: true, message: "Package saved to Supabase Cloud Database" });
    } finally {
      client.release();
    }
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

// DELETE: Remove package from Supabase
export async function DELETE(req: Request) {
  try {
    await ensureTable();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ ok: false, error: "ID required" }, { status: 400 });

    await pool.query("DELETE FROM published_packages WHERE id = $1;", [id]);
    return NextResponse.json({ ok: true, message: `Package ${id} deleted from Supabase` });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
