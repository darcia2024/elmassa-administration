import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { findStaffById, updateStaff, verifyStaffPassword } from "@/lib/auth/staff-store";

export async function POST(request: NextRequest) {
  const headerList = await headers();
  const userId = headerList.get("x-el-massa-user-id");
  const user = userId ? await findStaffById(userId) : null;

  if (!user) {
    return NextResponse.json({ error: "Autentikasi diperlukan" }, { status: 401 });
  }

  const body = await request.json();
  const currentPassword = body.currentPassword === undefined ? "" : String(body.currentPassword);
  const newPassword = body.newPassword === undefined ? "" : String(body.newPassword);
  const confirmPassword = body.confirmPassword === undefined ? "" : String(body.confirmPassword);
  const fields: Record<string, string> = {};

  if (!currentPassword) {
    fields.currentPassword = "Password lama wajib diisi";
  }

  if (!newPassword) {
    fields.newPassword = "Password baru wajib diisi";
  } else if (newPassword.length < 8) {
    fields.newPassword = "Password baru minimal 8 karakter";
  }

  if (!confirmPassword) {
    fields.confirmPassword = "Konfirmasi password wajib diisi";
  } else if (newPassword && confirmPassword !== newPassword) {
    fields.confirmPassword = "Konfirmasi password tidak sama";
  }

  if (Object.keys(fields).length > 0) {
    return NextResponse.json({ error: "Payload ganti password tidak valid", fields }, { status: 400 });
  }

  if (!verifyStaffPassword(user, currentPassword)) {
    return NextResponse.json(
      {
        error: "Password lama tidak cocok",
        fields: {
          currentPassword: "Password lama tidak cocok",
        },
      },
      { status: 401 },
    );
  }

  if (verifyStaffPassword(user, newPassword)) {
    return NextResponse.json(
      {
        error: "Password baru tidak boleh sama dengan password lama",
        fields: {
          newPassword: "Gunakan password baru yang berbeda",
        },
      },
      { status: 400 },
    );
  }

  const updated = (await updateStaff(user.id, { password: newPassword })) ?? user;

  return NextResponse.json({
    data: {
      changed: true,
      user: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        role: updated.role,
      },
    },
    meta: {
      source: "supabase",
    },
  });
}
