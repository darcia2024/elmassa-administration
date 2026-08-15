import pg from "pg";
const { Pool } = pg;

// Standalone migration — run it with the env var set, e.g.
//   node --env-file=.env.local scratch/add-roomlist-columns.mjs
//
// Adds the per-city roomlist fields to `participants`. Before this, a jamaah
// had exactly one generic `room_type`, so the Jakarta transit hotel, the Makkah
// hotel and the Madinah hotel all had to share a single value -- there was no
// way to record that someone is Quad 812 in Makkah but Triple 415 in Madinah.
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error(
    "DATABASE_URL is not set. Run with: node --env-file=.env.local scratch/add-roomlist-columns.mjs",
  );
  process.exit(1);
}

const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });

async function main() {
  const client = await pool.connect();
  try {
    await client.query(`
      ALTER TABLE participants
        ADD COLUMN IF NOT EXISTS jakarta_room_type TEXT NOT NULL DEFAULT '',
        ADD COLUMN IF NOT EXISTS jakarta_room_no   TEXT NOT NULL DEFAULT '',
        ADD COLUMN IF NOT EXISTS makkah_room_type  TEXT NOT NULL DEFAULT '',
        ADD COLUMN IF NOT EXISTS makkah_room_no    TEXT NOT NULL DEFAULT '',
        ADD COLUMN IF NOT EXISTS madinah_room_type TEXT NOT NULL DEFAULT '',
        ADD COLUMN IF NOT EXISTS madinah_room_no   TEXT NOT NULL DEFAULT '';
    `);

    // The pre-existing generic room_type is the value staff already filled in
    // through Manifest. Seed Makkah + Madinah from it so nobody has to retype
    // what they already entered; Jakarta stays blank because a transit-hotel
    // room was never what that field meant.
    const backfill = await client.query(`
      UPDATE participants
         SET makkah_room_type  = room_type,
             madinah_room_type = room_type
       WHERE room_type <> ''
         AND makkah_room_type = ''
         AND madinah_room_type = '';
    `);

    const shape = await client.query(`
      SELECT column_name, data_type
        FROM information_schema.columns
       WHERE table_name = 'participants'
         AND column_name LIKE '%room%'
       ORDER BY column_name;
    `);

    console.log("participants room columns:");
    console.table(shape.rows);
    console.log(`backfilled from room_type: ${backfill.rowCount} row(s)`);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
