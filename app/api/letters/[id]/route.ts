import { NextResponse } from "next/server";
import { deleteLetter, findLetter, updateLetter } from "@/lib/letters/store";

type RouteProps = { params: Promise<{ id: string }> };

export async function GET(_: Request, { params }: RouteProps) {
  const { id } = await params;
  const letter = await findLetter(id);

  if (!letter) return NextResponse.json({ error: "Surat tidak ditemukan" }, { status: 404 });
  return NextResponse.json({ data: letter }, { headers: { "Cache-Control": "no-store" } });
}

export async function PATCH(request: Request, { params }: RouteProps) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));

  if (body.recipientName !== undefined && !String(body.recipientName).trim()) {
    return NextResponse.json(
      { error: "Nama penerima wajib diisi", fields: { recipientName: "Nama tidak boleh kosong" } },
      { status: 400 },
    );
  }

  const updated = await updateLetter(id, body);
  if (!updated) return NextResponse.json({ error: "Surat tidak ditemukan" }, { status: 404 });

  return NextResponse.json({ data: updated });
}

export async function DELETE(_: Request, { params }: RouteProps) {
  const { id } = await params;
  const deleted = await deleteLetter(id);

  if (!deleted) return NextResponse.json({ error: "Surat tidak ditemukan" }, { status: 404 });
  return NextResponse.json({ data: { id, deleted: true } });
}
