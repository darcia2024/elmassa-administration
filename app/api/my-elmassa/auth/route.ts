import { NextResponse } from "next/server";
import { findAgentByCodeOrPhone } from "@/lib/agents/store";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const identifier = String(body.identifier ?? "").trim();

    if (!identifier) {
      return NextResponse.json(
        { ok: false, error: "Masukkan Kode Agen atau Nomor HP yang terdaftar" },
        { status: 400 },
      );
    }

    const agent = await findAgentByCodeOrPhone(identifier);

    if (!agent) {
      return NextResponse.json(
        {
          ok: false,
          error: `Agen/Mitra dengan kode atau nomor "${identifier}" tidak ditemukan. Pastikan sudah terdaftar di sistem El Massa.`,
        },
        { status: 404 },
      );
    }

    if (agent.status !== "Aktif") {
      return NextResponse.json(
        {
          ok: false,
          error: `Status keagenan (${agent.name}) saat ini Nonaktif. Silakan hubungi kantor operasional El Massa.`,
        },
        { status: 403 },
      );
    }

    return NextResponse.json({
      ok: true,
      agent: {
        id: agent.id,
        agentCode: agent.agentCode,
        name: agent.name,
        phone: agent.phone,
        email: agent.email,
        city: agent.city,
        address: agent.address,
        commissionType: agent.commissionType,
        commissionValue: agent.commissionValue,
        bankName: agent.bankName,
        bankAccount: agent.bankAccount,
        status: agent.status,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan saat otentikasi agen";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const identifier = searchParams.get("identifier") || searchParams.get("agentCode") || "";

  if (!identifier) {
    return NextResponse.json({ ok: false, error: "Parameter identifier wajib diisi" }, { status: 400 });
  }

  const agent = await findAgentByCodeOrPhone(identifier);
  if (!agent || agent.status !== "Aktif") {
    return NextResponse.json({ ok: false, error: "Agen tidak ditemukan atau tidak aktif" }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    agent: {
      id: agent.id,
      agentCode: agent.agentCode,
      name: agent.name,
      phone: agent.phone,
      email: agent.email,
      city: agent.city,
      address: agent.address,
      commissionType: agent.commissionType,
      commissionValue: agent.commissionValue,
      bankName: agent.bankName,
      bankAccount: agent.bankAccount,
      status: agent.status,
    },
  });
}
