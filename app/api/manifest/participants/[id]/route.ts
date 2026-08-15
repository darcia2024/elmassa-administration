import { NextResponse } from "next/server";
import { findParticipant, updateParticipant } from "@/lib/participants/store";

type RouteProps = {
  params: Promise<{
    id: string;
  }>;
};

const DOCUMENT_STATUSES = ["Belum Lengkap", "Proses Visa", "Lengkap"];

export async function GET(_: Request, { params }: RouteProps) {
  const { id } = await params;
  const participant = await findParticipant(id);

  if (!participant) {
    return NextResponse.json({ error: "Data jamaah tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json({ data: participant }, { headers: { "Cache-Control": "no-store" } });
}

export async function PATCH(request: Request, { params }: RouteProps) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));

  if (body.documentStatus !== undefined && !DOCUMENT_STATUSES.includes(body.documentStatus)) {
    return NextResponse.json(
      { error: "Status dokumen tidak valid", fields: { documentStatus: `Harus salah satu dari: ${DOCUMENT_STATUSES.join(", ")}` } },
      { status: 400 },
    );
  }

  if (body.name !== undefined && !String(body.name).trim()) {
    return NextResponse.json(
      { error: "Nama jamaah wajib diisi", fields: { name: "Nama tidak boleh kosong" } },
      { status: 400 },
    );
  }

  const updated = await updateParticipant(id, {
    name: body.name,
    passportNumber: body.passportNumber,
    contact: body.contact,
    documentStatus: body.documentStatus,
    visaNumber: body.visaNumber,
    visaExpiry: body.visaExpiry,
    ticketNumber: body.ticketNumber,
    roomType: body.roomType,
    jakartaRoomType: body.jakartaRoomType,
    jakartaRoomNo: body.jakartaRoomNo,
    makkahRoomType: body.makkahRoomType,
    makkahRoomNo: body.makkahRoomNo,
    madinahRoomType: body.madinahRoomType,
    madinahRoomNo: body.madinahRoomNo,
  });

  if (!updated) {
    return NextResponse.json({ error: "Data jamaah tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json({ data: updated });
}
