import { NextRequest, NextResponse } from "next/server";
import { packageExists } from "@/lib/schedules/store";
import { createScheduleRow, listScheduleRows } from "@/lib/schedules/store";
import { validateScheduleCreate } from "@/lib/validation/schedules";

type PackageSchedulesRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_: NextRequest, { params }: PackageSchedulesRouteProps) {
  const { id } = await params;

  if (!await packageExists(id)) {
    return NextResponse.json({ error: "Paket tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json({
    data: await listScheduleRows(id),
    meta: {
      packageId: id,
      source: "supabase",
    },
  });
}

export async function POST(request: NextRequest, { params }: PackageSchedulesRouteProps) {
  const { id } = await params;
  const body = await request.json().catch(() => null);

  if (!await packageExists(id)) {
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

  const data = await createScheduleRow(validation.data);

  return NextResponse.json({ data }, { status: 201 });
}
