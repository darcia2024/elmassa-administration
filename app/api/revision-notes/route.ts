import { NextResponse } from "next/server";
import { Pool } from "pg";

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres.dekeoqlowiozsjpsqdsl:l7FItz7zmhhB2Yfo@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres";

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

// Ensure table exists
async function ensureTable() {
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
  } catch (err) {
    console.error("Error creating page_revision_notes table:", err);
  } finally {
    client.release();
  }
}

// GET: Fetch revision notes (can filter by page_url query param)
export async function GET(req: Request) {
  try {
    await ensureTable();
    const { searchParams } = new URL(req.url);
    const pageUrl = searchParams.get("pageUrl");

    let query = `
      SELECT 
        id,
        page_url as "pageUrl",
        page_title as "pageTitle",
        element_target as "elementTarget",
        note_content as "noteContent",
        priority,
        status,
        author,
        created_at as "createdAt"
      FROM page_revision_notes
    `;
    const params: any[] = [];

    if (pageUrl) {
      query += ` WHERE page_url = $1 `;
      params.push(pageUrl);
    }

    query += ` ORDER BY created_at DESC;`;

    const res = await pool.query(query, params);
    return NextResponse.json({ ok: true, data: res.rows });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

// POST: Add new revision note
export async function POST(req: Request) {
  try {
    await ensureTable();
    const note = await req.json();

    const client = await pool.connect();
    try {
      const id = note.id || `rev-${Date.now()}`;
      await client.query(
        `INSERT INTO page_revision_notes (
          id, page_url, page_title, element_target, note_content, priority, status, author
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (id) DO UPDATE SET
          element_target = EXCLUDED.element_target,
          note_content = EXCLUDED.note_content,
          priority = EXCLUDED.priority,
          status = EXCLUDED.status,
          author = EXCLUDED.author;`,
        [
          id,
          note.pageUrl || "/",
          note.pageTitle || "Halaman",
          note.elementTarget || "Umum",
          note.noteContent || "",
          note.priority || "Sedang",
          note.status || "Perlu Revisi",
          note.author || "Klien El Massa",
        ]
      );

      return NextResponse.json({ ok: true, message: "Catatan revisi tersimpan ke Supabase Cloud" });
    } finally {
      client.release();
    }
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

// PATCH: Update note status (e.g. Selesai, Sedang Dikerjakan)
export async function PATCH(req: Request) {
  try {
    await ensureTable();
    const { id, status } = await req.json();
    if (!id || !status) return NextResponse.json({ ok: false, error: "id and status required" }, { status: 400 });

    await pool.query(`UPDATE page_revision_notes SET status = $1 WHERE id = $2;`, [status, id]);
    return NextResponse.json({ ok: true, message: `Status revisi ${id} diubah ke ${status}` });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

// DELETE: Delete a revision note
export async function DELETE(req: Request) {
  try {
    await ensureTable();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ ok: false, error: "id required" }, { status: 400 });

    await pool.query(`DELETE FROM page_revision_notes WHERE id = $1;`, [id]);
    return NextResponse.json({ ok: true, message: `Catatan revisi ${id} berhasil dihapus` });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
