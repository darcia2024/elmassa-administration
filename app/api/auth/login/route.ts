import { NextRequest, NextResponse } from "next/server";
import { createSessionToken } from "@/lib/auth/session";
import { findStaffByEmail, markStaffLoggedIn, verifyStaffPassword } from "@/lib/auth/staff-store";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const email = body.email === undefined ? "" : String(body.email).trim().toLowerCase();
  const password = body.password === undefined ? "" : String(body.password);
  const fields: Record<string, string> = {};

  if (!email) {
    fields.email = "Email wajib diisi";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    fields.email = "Format email tidak valid";
  }

  if (!password) {
    fields.password = "Password wajib diisi";
  }

  if (Object.keys(fields).length > 0) {
    return NextResponse.json({ error: "Payload login tidak valid", fields }, { status: 400 });
  }

  const user = await findStaffByEmail(email);

  // Identical message for unknown email and wrong password, so the response
  // cannot be used to enumerate which staff accounts exist.
  if (!user || !verifyStaffPassword(user, password)) {
    return NextResponse.json({ error: "Email atau password tidak cocok" }, { status: 401 });
  }

  if (user.status !== "Aktif") {
    return NextResponse.json({ error: "Akun staf sedang nonaktif" }, { status: 403 });
  }

  await markStaffLoggedIn(user.id);

  const token = await createSessionToken(user);
  const response = NextResponse.json({
    data: {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        branch: user.branch,
      },
    },
    meta: { source: "supabase" },
  });

  response.cookies.set("el-massa-session", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });

  return response;
}
