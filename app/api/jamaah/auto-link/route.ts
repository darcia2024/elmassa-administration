import { NextResponse } from "next/server";
import { autoLinkByPassport } from "@/lib/jamaah/store";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const packageId = String(body.packageId ?? "").trim();
  if (!packageId) {
    return NextResponse.json({ error: "Grup keberangkatan wajib dipilih", fields: { packageId: "Wajib" } }, { status: 400 });
  }

  const linked = await autoLinkByPassport(packageId);
  return NextResponse.json({ data: { linked } });
}
