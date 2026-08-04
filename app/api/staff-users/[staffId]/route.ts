import { NextRequest, NextResponse } from "next/server";
import { deleteStaff, listStaff, updateStaff } from "@/lib/auth/staff-store";

type StaffUserDetailRouteProps = {
  params: Promise<{
    staffId: string;
  }>;
};

export async function GET(_: NextRequest, { params }: StaffUserDetailRouteProps) {
  const { staffId } = await params;
  const id = decodeURIComponent(staffId);
  const data = (await listStaff()).find((row) => row.id === id);

  if (!data) {
    return NextResponse.json({ error: "Staf pengguna tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json({ data });
}

export async function PATCH(request: NextRequest, { params }: StaffUserDetailRouteProps) {
  const { staffId } = await params;
  const body = await request.json().catch(() => ({}));

  // A password may be reset here, but it is only ever written as a fresh hash —
  // it is never read back out of the database.
  if (body.password !== undefined && String(body.password).length < 8) {
    return NextResponse.json(
      { error: "Password tidak valid", fields: { password: "Password minimal 8 karakter" } },
      { status: 400 },
    );
  }

  try {
    const data = await updateStaff(decodeURIComponent(staffId), {
      name: body.name === undefined ? undefined : String(body.name),
      email: body.email === undefined ? undefined : String(body.email),
      role: body.role === undefined ? undefined : String(body.role),
      branch: body.branch === undefined ? undefined : String(body.branch),
      status: body.status === undefined ? undefined : String(body.status),
      password: body.password === undefined ? undefined : String(body.password),
    });

    if (!data) {
      return NextResponse.json({ error: "Staf pengguna tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ data });
  } catch (err: any) {
    if (err?.code === "23505") {
      return NextResponse.json({ error: "Email tersebut sudah dipakai staf lain" }, { status: 409 });
    }
    return NextResponse.json({ error: err?.message ?? "Gagal memperbarui staf" }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: StaffUserDetailRouteProps) {
  const { staffId } = await params;
  const removed = await deleteStaff(decodeURIComponent(staffId));

  if (!removed) {
    return NextResponse.json({ error: "Staf pengguna tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json({ data: { id: decodeURIComponent(staffId) } });
}
