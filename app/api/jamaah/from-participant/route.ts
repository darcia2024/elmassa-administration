import { NextResponse } from "next/server";
import { createFromParticipant } from "@/lib/jamaah/store";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const actor = request.headers.get("x-el-massa-user-id") ?? "";
  const result = await createFromParticipant(String(body.participantId ?? ""), actor);

  if (!result) return NextResponse.json({ error: "Peserta tidak ditemukan" }, { status: 404 });
  return NextResponse.json({ data: result.jamaah, meta: { reused: result.reused } }, { status: result.reused ? 200 : 201 });
}
