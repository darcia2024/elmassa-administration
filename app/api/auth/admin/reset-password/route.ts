import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { findStaffByEmail, findStaffById, updateStaff } from "@/lib/auth/staff-store";
import { resolvePasswordResetRequests } from "@/lib/auth/password-reset-requests";

// Module edit permission is enforced by proxy.ts, as for staff-user updates.

export async function POST(request: NextRequest) {
  const headerList = await headers();
  const actorId = headerList.get("x-el-massa-user-id");
  const actor = actorId ? await findStaffById(actorId) : null;

  if (!actor || actor.status !== "Aktif") {
    return NextResponse.json({ error: "Hanya admin yang boleh reset password staf" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const targetEmail = body.email === undefined ? "" : String(body.email).trim().toLowerCase();
  const targetId = body.userId === undefined ? "" : String(body.userId).trim();
  const newPassword = body.newPassword === undefined ? "" : String(body.newPassword);
  const fields: Record<string, string> = {};

  if (!targetEmail && !targetId) {
    fields.user = "Isi userId atau email staf yang akan direset";
  }

  if (targetEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(targetEmail)) {
    fields.email = "Format email tidak valid";
  }

  if (!newPassword) {
    fields.newPassword = "Password baru wajib diisi";
  } else if (newPassword.length < 8) {
    fields.newPassword = "Password baru minimal 8 karakter";
  }

  if (Object.keys(fields).length > 0) {
    return NextResponse.json({ error: "Payload reset password tidak valid", fields }, { status: 400 });
  }

  const target = targetId ? await findStaffById(targetId) : await findStaffByEmail(targetEmail);

  if (!target) {
    return NextResponse.json({ error: "User target tidak ditemukan" }, { status: 404 });
  }

  const updated = await updateStaff(target.id, { password: newPassword });
  if (!updated) return NextResponse.json({ error: "User target tidak ditemukan" }, { status: 404 });
  await resolvePasswordResetRequests(target.email);

  return NextResponse.json({
    data: {
      reset: true,
      user: { id: updated.id, name: updated.name, email: updated.email, role: updated.role },
      resetBy: { id: actor.id, name: actor.name, email: actor.email, role: actor.role },
    },
    meta: {
      source: "supabase",
    },
  });
}
