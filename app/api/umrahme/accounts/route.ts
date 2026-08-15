import { NextResponse } from "next/server";
import { getPool } from "@/lib/db/connection";
import { issueAccounts } from "@/lib/umrahme/store";

// Ensure table exists
async function ensureTable() {
  const client = await getPool().connect();
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
    const res = await getPool().query(
      `SELECT id, nama, nomor_jamaah as "nomorJamaah", nik, paspor, tgl_lahir_usia as "tglLahirUsia", golongan_darah as "golonganDarah", telepon, kontak_darurat as "kontakDarurat", alamat_lengkap as "alamatLengkap", batch, rombongan, bus, kamar, flight, e_visa as "eVisa", titik_kumpul as "titikKumpul", status, tanggal_terbit as "tanggalTerbit" FROM jamaah_accounts ORDER BY created_at DESC;`
    );
    return NextResponse.json({ ok: true, data: res.rows });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

// POST: Terbitkan akun jamaah. Kuota lisensi dipotong di sini -- lihat
// lib/umrahme/store.ts untuk kenapa hanya akun baru yang menagih kuota.
export async function POST(req: Request) {
  try {
    await ensureTable();
    const body = await req.json();
    const accounts = Array.isArray(body) ? body : [body];

    const result = await issueAccounts(accounts);

    if (!result.ok) {
      return NextResponse.json(
        { ok: false, error: result.error, balance: result.balance },
        { status: 402 },
      );
    }

    return NextResponse.json({
      ...result,
      message: result.issued > 0
        ? `${result.issued} akun diterbitkan (-${result.issued} kuota), sisa ${result.balance}`
        : "Data akun diperbarui, kuota tidak terpotong",
    });
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

    await getPool().query("DELETE FROM jamaah_accounts WHERE id = $1;", [id]);
    return NextResponse.json({ ok: true, message: `Account ${id} deleted from Supabase` });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
