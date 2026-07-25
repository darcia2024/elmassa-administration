import { NextRequest, NextResponse } from "next/server";
import {
  createSessionToken,
  findAuthUserByEmail,
  markAuthUserLoggedIn,
  toSessionUser,
  verifyAuthUserPassword,
} from "@/lib/seed-data/auth-users";

export async function POST(request: NextRequest) {
  const body = await request.json();
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

  const user = findAuthUserByEmail(email);

  if (!user || !verifyAuthUserPassword(user, password)) {
    return NextResponse.json({ error: "Email atau password tidak cocok" }, { status: 401 });
  }

  if (user.status !== "Aktif") {
    return NextResponse.json({ error: "Akun staf sedang nonaktif" }, { status: 403 });
  }

  const loggedInUser = markAuthUserLoggedIn(user.id) ?? user;
  const token = createSessionToken(loggedInUser);
  const response = NextResponse.json({
    data: {
      token,
      user: toSessionUser(loggedInUser),
    },
    meta: {
      source: "seed",
      tokenType: "Bearer",
    },
  });

  response.cookies.set("el-massa-session", token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  return response;
}
