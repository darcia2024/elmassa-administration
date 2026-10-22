import { NextRequest, NextResponse } from "next/server";
import { ensureStaffTable } from "@/lib/auth/staff-store";
import { requestPasswordReset } from "@/lib/auth/password-reset-requests";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const message = typeof body?.message === "string" ? body.message.trim() : "";
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || message.length > 2000) {
    return NextResponse.json({ error: "Isi email yang valid dan catatan maksimal 2000 karakter." }, { status: 400 });
  }
  try {
    await ensureStaffTable();
    await requestPasswordReset(email, message);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Permintaan belum tersimpan. Silakan coba lagi." }, { status: 503 });
  }
}
