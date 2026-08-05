import { NextRequest, NextResponse } from "next/server";
import { deleteRole, findRole, updateRole } from "@/lib/roles/store";

type RoleDetailRouteProps = {
  params: Promise<{
    roleId: string;
  }>;
};

export async function GET(_: NextRequest, { params }: RoleDetailRouteProps) {
  const { roleId } = await params;
  const data = await findRole(decodeURIComponent(roleId));

  if (!data) {
    return NextResponse.json({ error: "Role tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json({ data });
}

export async function PATCH(request: NextRequest, { params }: RoleDetailRouteProps) {
  const { roleId } = await params;
  const body = await request.json().catch(() => ({}));

  try {
    const data = await updateRole(decodeURIComponent(roleId), {
      name: body.name === undefined ? undefined : String(body.name),
      description: body.description === undefined ? undefined : String(body.description),
      permissions: body.permissions,
    });

    if (!data) {
      return NextResponse.json({ error: "Role tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ data });
  } catch (err: any) {
    if (err?.code === "23505") {
      return NextResponse.json({ error: "Nama role sudah dipakai" }, { status: 409 });
    }
    return NextResponse.json({ error: err?.message ?? "Gagal memperbarui role" }, { status: 400 });
  }
}

export async function DELETE(_: NextRequest, { params }: RoleDetailRouteProps) {
  const { roleId } = await params;
  const decodedId = decodeURIComponent(roleId);

  const result = await deleteRole(decodedId);
  if (!result.ok) {
    return NextResponse.json({ error: result.reason }, { status: 409 });
  }

  return NextResponse.json({ data: { id: decodedId, deleted: true } });
}
