import { NextResponse } from "next/server";
import { regenerateToken } from "@/lib/jamaah/store";

type RouteProps = { params: Promise<{ id: string }> };

/**
 * Membuat link pendataan baru. Link lama langsung mati -- dipakai kalau link
 * sempat terkirim ke orang yang salah.
 */
export async function POST(_: Request, { params }: RouteProps) {
  const { id } = await params;
  const token = await regenerateToken(id);

  if (!token) return NextResponse.json({ error: "Jamaah tidak ditemukan" }, { status: 404 });
  return NextResponse.json({ data: { selfServiceToken: token } });
}
