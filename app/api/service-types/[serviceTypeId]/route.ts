import { NextRequest, NextResponse } from "next/server";
import {
  deleteServiceTypeRow,
  findServiceTypeRow,
  parseServiceTypePayload,
  updateServiceTypeRow,
} from "@/lib/seed-data/service-types";

type ServiceTypeDetailRouteProps = {
  params: Promise<{
    serviceTypeId: string;
  }>;
};

export async function GET(_: NextRequest, { params }: ServiceTypeDetailRouteProps) {
  const { serviceTypeId } = await params;
  const data = findServiceTypeRow(decodeURIComponent(serviceTypeId));

  if (!data) {
    return NextResponse.json({ error: "Jenis layanan tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json({ data });
}

export async function PATCH(request: NextRequest, { params }: ServiceTypeDetailRouteProps) {
  const { serviceTypeId } = await params;
  const body = await request.json();
  const parsed = parseServiceTypePayload(body, { partial: true });

  if ("errors" in parsed) {
    return NextResponse.json({ error: "Payload jenis layanan tidak valid", fields: parsed.errors }, { status: 400 });
  }

  const data = updateServiceTypeRow(decodeURIComponent(serviceTypeId), {
    name: parsed.data.name,
    category: parsed.data.category,
    defaultDuration: parsed.data.defaultDuration,
    documentTemplate: parsed.data.documentTemplate,
    status: parsed.data.status,
    notes: parsed.data.notes,
  });

  if (!data) {
    return NextResponse.json({ error: "Jenis layanan tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json({ data });
}

export async function DELETE(_: NextRequest, { params }: ServiceTypeDetailRouteProps) {
  const { serviceTypeId } = await params;
  const decodedId = decodeURIComponent(serviceTypeId);
  const deleted = deleteServiceTypeRow(decodedId);

  if (!deleted) {
    return NextResponse.json({ error: "Jenis layanan tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json({ data: { id: decodedId, deleted: true } });
}
