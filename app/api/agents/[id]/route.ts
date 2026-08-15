import { NextResponse } from "next/server";
import { COMMISSION_TYPES, deleteAgent, findAgent, updateAgent } from "@/lib/agents/store";

type RouteProps = { params: Promise<{ id: string }> };

export async function GET(_: Request, { params }: RouteProps) {
  const { id } = await params;
  const agent = await findAgent(id);

  if (!agent) return NextResponse.json({ error: "Agen tidak ditemukan" }, { status: 404 });
  return NextResponse.json({ data: agent }, { headers: { "Cache-Control": "no-store" } });
}

export async function PATCH(request: Request, { params }: RouteProps) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));

  if (body.name !== undefined && !String(body.name).trim()) {
    return NextResponse.json(
      { error: "Nama agen wajib diisi", fields: { name: "Nama tidak boleh kosong" } },
      { status: 400 },
    );
  }

  if (body.commissionType !== undefined && !(COMMISSION_TYPES as readonly string[]).includes(String(body.commissionType))) {
    return NextResponse.json(
      { error: "Tipe komisi tidak valid", fields: { commissionType: "Pilih 'nominal' atau 'persen'" } },
      { status: 400 },
    );
  }

  if (body.commissionValue !== undefined) {
    const value = Number(body.commissionValue);
    if (!Number.isFinite(value) || value < 0) {
      return NextResponse.json(
        { error: "Nilai komisi tidak valid", fields: { commissionValue: "Nilai komisi tidak boleh negatif" } },
        { status: 400 },
      );
    }
  }

  const updated = await updateAgent(id, body);
  if (!updated) return NextResponse.json({ error: "Agen tidak ditemukan" }, { status: 404 });

  return NextResponse.json({ data: updated });
}

export async function DELETE(_: Request, { params }: RouteProps) {
  const { id } = await params;
  const deleted = await deleteAgent(id);

  if (!deleted) return NextResponse.json({ error: "Agen tidak ditemukan" }, { status: 404 });
  return NextResponse.json({ data: { id, deleted: true } });
}
