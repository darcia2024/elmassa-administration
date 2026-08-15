import pg from "pg";
const { Pool } = pg;

// Standalone migration — run it with the env var set, e.g.
//   node --env-file=.env.local scratch/add-agenda-events.mjs
//
// Creates `agenda_events`: the staff-entered half of Kalender Kegiatan.
//
// Keberangkatan, kepulangan and batas pelunasan are all DERIVED at read time
// from published_packages + real_bookings, so they can never drift from the
// data they describe. Manasik, briefing, handling and the like have no source
// anywhere in the system -- that is exactly why the old hardcoded /jadwal page
// could only ever show a permanently empty calendar. This table is that source.
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("DATABASE_URL is not set. Run with: node --env-file=.env.local scratch/add-agenda-events.mjs");
  process.exit(1);
}

const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });

async function main() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS agenda_events (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        package_id TEXT NOT NULL DEFAULT '',
        title TEXT NOT NULL,
        category TEXT NOT NULL DEFAULT 'Manasik',
        event_date DATE NOT NULL,
        event_time TEXT NOT NULL DEFAULT '',
        location TEXT NOT NULL DEFAULT '',
        notes TEXT NOT NULL DEFAULT '',
        created_by TEXT NOT NULL DEFAULT '',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // The calendar always queries one month at a time.
    await client.query(`CREATE INDEX IF NOT EXISTS agenda_events_date_idx ON agenda_events (event_date);`);

    // package_id is a soft link: an agenda item may be company-wide (empty) and
    // must survive its group being deleted, so it is deliberately not an FK.
    await client.query(`CREATE INDEX IF NOT EXISTS agenda_events_package_idx ON agenda_events (package_id);`);

    const shape = await client.query(`
      SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
       WHERE table_name = 'agenda_events'
       ORDER BY ordinal_position;
    `);

    console.log("agenda_events:");
    console.table(shape.rows);

    const count = await client.query(`SELECT COUNT(*)::int AS n FROM agenda_events;`);
    console.log(`existing rows: ${count.rows[0].n}`);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
