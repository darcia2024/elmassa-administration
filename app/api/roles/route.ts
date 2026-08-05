import { NextRequest, NextResponse } from "next/server";
import { createRole, listRoles } from "@/lib/roles/store";
import { MODULES } from "@/lib/auth/modules";

export async function GET() {
  const data = await listRoles();

  return NextResponse.json(
    { data, meta: { total: data.length, modules: MODULES, source: "supabase" } },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const name = String(body.name ?? "").trim();

  if (!name) {
    return NextResponse.json(
      { error: "Data role tidak valid", fields: { name: "Nama role wajib diisi" } },
      { status: 400 },
    );
  }

  try {
    const data = await createRole({
      name,
      description: body.description === undefined ? undefined : String(body.description),
      permissions: body.permissions,
    });

    return NextResponse.json({ data }, { status: 201 });
  } catch (err: any) {
    if (err?.code === "23505") {
      return NextResponse.json(
        { error: "Nama role sudah dipakai", fields: { name: "Sudah ada role dengan nama ini" } },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: err?.message ?? "Gagal membuat role" }, { status: 500 });
  }
}
