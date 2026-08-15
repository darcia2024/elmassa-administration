import { NextResponse } from "next/server";
import { AGENT_STATUSES, COMMISSION_TYPES, createAgent, listAgents } from "@/lib/agents/store";

export async function GET() {
  const data = await listAgents();

  return NextResponse.json(
    {
      data,
      meta: {
        total: data.length,
        aktif: data.filter((a) => a.status === "Aktif").length,
        totalJamaah: data.reduce((sum, a) => sum + a.jamaahCount, 0),
        totalKomisi: data.reduce((sum, a) => sum + a.estimatedCommission, 0),
        commissionTypes: COMMISSION_TYPES,
        statuses: AGENT_STATUSES,
      },
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));

  const name = String(body.name ?? "").trim();
  if (!name) {
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

  const commissionValue = Number(body.commissionValue ?? 0);
  if (!Number.isFinite(commissionValue) || commissionValue < 0) {
    return NextResponse.json(
      { error: "Nilai komisi tidak valid", fields: { commissionValue: "Nilai komisi tidak boleh negatif" } },
      { status: 400 },
    );
  }

  if (body.commissionType === "persen" && commissionValue > 100) {
    return NextResponse.json(
      { error: "Komisi persen tidak valid", fields: { commissionValue: "Komisi persen maksimal 100" } },
      { status: 400 },
    );
  }

  const agent = await createAgent({ ...body, name, commissionValue });
  return NextResponse.json({ data: agent }, { status: 201 });
}
