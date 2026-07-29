import { NextRequest, NextResponse } from "next/server";
import { deleteStaffUserRow, findStaffUserRow, parseStaffUserPayload, updateStaffUserRow } from "@/lib/seed-data/staff-users";

type StaffUserDetailRouteProps = {
  params: Promise<{
    staffId: string;
  }>;
};

export async function GET(_: NextRequest, { params }: StaffUserDetailRouteProps) {
  const { staffId } = await params;
  const data = findStaffUserRow(decodeURIComponent(staffId));

  if (!data) {
    return NextResponse.json({ error: "Staf pengguna tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json({ data });
}

export async function PATCH(request: NextRequest, { params }: StaffUserDetailRouteProps) {
  const { staffId } = await params;
  const body = await request.json();
  const parsed = parseStaffUserPayload(body, { partial: true });

  if ("errors" in parsed) {
    return NextResponse.json({ error: "Payload staf pengguna tidak valid", fields: parsed.errors }, { status: 400 });
  }

  const data = updateStaffUserRow(decodeURIComponent(staffId), {
    name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone,
    role: parsed.data.role,
    branch: parsed.data.branch,
    status: parsed.data.status,
  });

  if (!data) {
    return NextResponse.json({ error: "Staf pengguna tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json({ data });
}

export async function DELETE(_: NextRequest, { params }: StaffUserDetailRouteProps) {
  const { staffId } = await params;
  const decodedId = decodeURIComponent(staffId);
  const deleted = deleteStaffUserRow(decodedId);

  if (!deleted) {
    return NextResponse.json({ error: "Staf pengguna tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json({ data: { id: decodedId, deleted: true } });
}
