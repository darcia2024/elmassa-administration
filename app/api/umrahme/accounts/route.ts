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
      CREATE TABLE IF NOT EXISTS jamaah_accounts (
        id VARCHAR(100) PRIMARY KEY,
        nama TEXT NOT NULL,
        nomor_jamaah TEXT NOT NULL,
        nik TEXT DEFAULT '',
        paspor TEXT DEFAULT '',
        tgl_lahir_usia TEXT DEFAULT '',
        golongan_darah TEXT DEFAULT '',
        telepon TEXT DEFAULT '',
        kontak_darurat TEXT DEFAULT '',
        alamat_lengkap TEXT DEFAULT '',
        batch TEXT DEFAULT '',
        rombongan TEXT DEFAULT '',
        bus TEXT DEFAULT '',
        kamar TEXT DEFAULT '',
        flight TEXT DEFAULT '',
        e_visa TEXT DEFAULT '',
        titik_kumpul TEXT DEFAULT '',
        status TEXT DEFAULT 'Aktif',
        tanggal_terbit TEXT DEFAULT '',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
  } catch (err) {
    console.error("Error creating jamaah_accounts table:", err);
  } finally {
    client.release();
  }
}

// GET: Fetch all accounts
export async function GET() {
  try {
    await ensureTable();
    const res = await pool.query(
      `SELECT id, nama, nomor_jamaah as "nomorJamaah", nik, paspor, tgl_lahir_usia as "tglLahirUsia", golongan_darah as "golonganDarah", telepon, kontak_darurat as "kontakDarurat", alamat_lengkap as "alamatLengkap", batch, rombongan, bus, kamar, flight, e_visa as "eVisa", titik_kumpul as "titikKumpul", status, tanggal_terbit as "tanggalTerbit" FROM jamaah_accounts ORDER BY created_at DESC;`
    );
    return NextResponse.json({ ok: true, data: res.rows });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

// POST: Insert single or bulk accounts
export async function POST(req: Request) {
  try {
    await ensureTable();
    const body = await req.json();
    const accounts = Array.isArray(body) ? body : [body];

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      for (const acc of accounts) {
        await client.query(
          `INSERT INTO jamaah_accounts (id, nama, nomor_jamaah, nik, paspor, tgl_lahir_usia, golongan_darah, telepon, kontak_darurat, alamat_lengkap, batch, rombongan, bus, kamar, flight, e_visa, titik_kumpul, status, tanggal_terbit)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
           ON CONFLICT (id) DO UPDATE SET
             nama = EXCLUDED.nama,
             nomor_jamaah = EXCLUDED.nomor_jamaah,
             nik = EXCLUDED.nik,
             paspor = EXCLUDED.paspor,
             rombongan = EXCLUDED.rombongan,
             bus = EXCLUDED.bus,
             kamar = EXCLUDED.kamar,
             flight = EXCLUDED.flight,
             e_visa = EXCLUDED.e_visa;`,
          [
            acc.id || String(Date.now()),
            acc.nama || "",
            acc.nomorJamaah || "",
            acc.nik || "",
            acc.paspor || "",
            acc.tglLahirUsia || "",
            acc.golonganDarah || "",
            acc.telepon || "",
            acc.kontakDarurat || "",
            acc.alamatLengkap || "",
            acc.batch || "",
            acc.rombongan || "",
            acc.bus || "",
            acc.kamar || "",
            acc.flight || "",
            acc.eVisa || "",
            acc.titikKumpul || "",
            acc.status || "Aktif",
            acc.tanggalTerbit || "Hari ini",
          ]
        );
      }
      await client.query("COMMIT");
      return NextResponse.json({ ok: true, message: `${accounts.length} account(s) saved to Supabase` });
    } catch (err: any) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

// DELETE: Remove account by ID
export async function DELETE(req: Request) {
  try {
    await ensureTable();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ ok: false, error: "ID required" }, { status: 400 });

    await pool.query("DELETE FROM jamaah_accounts WHERE id = $1;", [id]);
    return NextResponse.json({ ok: true, message: `Account ${id} deleted from Supabase` });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
