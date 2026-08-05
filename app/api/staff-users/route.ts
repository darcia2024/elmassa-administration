import { NextRequest, NextResponse } from "next/server";
import { createStaff, listStaff } from "@/lib/auth/staff-store";

export async function GET() {
  const data = await listStaff();

  return NextResponse.json(
    { data, meta: { total: data.length, source: "supabase" } },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim();
  const password = String(body.password ?? "");
  const fields: Record<string, string> = {};

  if (!name) fields.name = "Nama wajib diisi";
  if (!email) {
    fields.email = "Email wajib diisi";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    fields.email = "Format email tidak valid";
  }
  if (password.length < 8) {
    fields.password = "Password minimal 8 karakter";
  }

  if (Object.keys(fields).length > 0) {
    return NextResponse.json({ error: "Data staf tidak valid", fields }, { status: 400 });
  }

  try {
    const data = await createStaff({
      name,
      email,
      password,
      phone: body.phone ? String(body.phone) : undefined,
      role: body.role ? String(body.role) : undefined,
      branch: body.branch ? String(body.branch) : undefined,
      division: body.division ? String(body.division) : undefined,
      status: body.status ? String(body.status) : undefined,
    });

    return NextResponse.json({ data }, { status: 201 });
  } catch (err: any) {
    if (err?.code === "23505") {
      return NextResponse.json(
        { error: "Email tersebut sudah dipakai staf lain", fields: { email: "Email sudah terdaftar" } },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: err?.message ?? "Gagal menyimpan staf" }, { status: 500 });
  }
}
