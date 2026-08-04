import { NextRequest, NextResponse } from "next/server";
import { updateStaff } from "@/lib/auth/staff-store";

type StaffUserStatusRouteProps = {
  params: Promise<{
    staffId: string;
  }>;
};

export async function PATCH(request: NextRequest, { params }: StaffUserStatusRouteProps) {
  const { staffId } = await params;
  const body = await request.json();
  const status = body.status === "Aktif" ? "Aktif" : body.status === "Nonaktif" ? "Nonaktif" : null;

  if (!status) {
    return NextResponse.json(
      {
        error: "Status staf pengguna tidak valid",
        fields: {
          status: "Status harus Aktif atau Nonaktif",
        },
      },
      { status: 400 },
    );
  }

  const data = await updateStaff(decodeURIComponent(staffId), { status });

  if (!data) {
    return NextResponse.json({ error: "Staf pengguna tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json({ data });
}
