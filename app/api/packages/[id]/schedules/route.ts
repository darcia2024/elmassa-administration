import { NextRequest, NextResponse } from "next/server";
import { findPackageRow } from "@/lib/seed-data/packages";
import { createScheduleRow, listScheduleRows } from "@/lib/seed-data/schedules";
import { validateScheduleCreate } from "@/lib/validation/schedules";

type PackageSchedulesRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_: NextRequest, { params }: PackageSchedulesRouteProps) {
  const { id } = await params;

  if (!findPackageRow(id)) {
    return NextResponse.json({ error: "Paket tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json({
    data: listScheduleRows(id),
    meta: {
      packageId: id,
      source: "dummy",
    },
  });
}

export async function POST(request: NextRequest, { params }: PackageSchedulesRouteProps) {
  const { id } = await params;
  const body = await request.json();

  if (!findPackageRow(id)) {
    return NextResponse.json({ error: "Paket tidak ditemukan" }, { status: 404 });
  }

  const validation = validateScheduleCreate(body, id);

  if (validation.errors) {
    return NextResponse.json(
      {
        error: "Payload jadwal tidak valid",
        details: validation.errors,
      },
      {
        status: 400,
      },
    );
  }

  const data = createScheduleRow(validation.data);

  return NextResponse.json({ data }, { status: 201 });
}
