import { NextRequest, NextResponse } from "next/server";
import { deletePackageRow, findPackageRow, updatePackageRow } from "@/lib/seed-data/packages";

type PackageDetailRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_: NextRequest, { params }: PackageDetailRouteProps) {
  const { id } = await params;
  const data = findPackageRow(id);

  if (!data) {
    return NextResponse.json({ error: "Paket tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json({ data });
}

export async function PATCH(request: NextRequest, { params }: PackageDetailRouteProps) {
  const { id } = await params;
  const body = await request.json();
  const data = updatePackageRow(id, {
    name: body.name === undefined ? undefined : String(body.name),
    serviceType: body.serviceType === undefined ? undefined : String(body.serviceType),
    packageType: body.packageType === undefined ? undefined : String(body.packageType),
    itinerary: body.itinerary === undefined ? undefined : String(body.itinerary),
    basePrice: body.basePrice === undefined ? undefined : body.basePrice === null ? null : Number(body.basePrice),
    durationDays: body.durationDays === undefined ? undefined : body.durationDays === null ? null : Number(body.durationDays),
    status: body.status === undefined ? undefined : String(body.status),
  });

  if (!data) {
    return NextResponse.json({ error: "Paket tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json({ data });
}

export async function DELETE(_: NextRequest, { params }: PackageDetailRouteProps) {
  const { id } = await params;
  const deleted = deletePackageRow(id);

  if (!deleted) {
    return NextResponse.json({ error: "Paket tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json({ data: { id, deleted: true } });
}
