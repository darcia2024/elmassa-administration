import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { findAuthUserByEmail, findAuthUserById, toSessionUser, updateAuthUserPassword } from "@/lib/seed-data/auth-users";

const resetAllowedRoles = new Set(["Admin Operasional", "Supervisor"]);

export async function POST(request: NextRequest) {
  const headerList = await headers();
  const actorId = headerList.get("x-el-massa-user-id");
  const actor = actorId ? findAuthUserById(actorId) : null;

  if (!actor || !resetAllowedRoles.has(actor.role)) {
    return NextResponse.json({ error: "Hanya admin yang boleh reset password staf" }, { status: 403 });
  }

  const body = await request.json();
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

  const target = targetId ? findAuthUserById(targetId) : findAuthUserByEmail(targetEmail);

  if (!target) {
    return NextResponse.json({ error: "User target tidak ditemukan" }, { status: 404 });
  }

  const updated = updateAuthUserPassword(target.id, newPassword);

  return NextResponse.json({
    data: {
      reset: true,
      user: updated ? toSessionUser(updated) : toSessionUser(target),
      resetBy: toSessionUser(actor),
    },
    meta: {
      source: "dummy",
    },
  });
}
