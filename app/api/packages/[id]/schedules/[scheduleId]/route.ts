import { NextRequest, NextResponse } from "next/server";
import { deleteScheduleRow, findScheduleRow, updateScheduleRow } from "@/lib/seed-data/schedules";
import { omitPackageIdFromSchedulePatch, validateSchedulePatch } from "@/lib/validation/schedules";

type PackageScheduleDetailRouteProps = {
  params: Promise<{
    id: string;
    scheduleId: string;
  }>;
};

export async function GET(_: NextRequest, { params }: PackageScheduleDetailRouteProps) {
  const { id, scheduleId } = await params;
  const data = findScheduleRow(id, scheduleId);

  if (!data) {
    return NextResponse.json({ error: "Jadwal tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json({ data });
}

export async function PATCH(request: NextRequest, { params }: PackageScheduleDetailRouteProps) {
  const { id, scheduleId } = await params;
  const body = await request.json();
  const validation = validateSchedulePatch(body);

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

  const data = updateScheduleRow(id, scheduleId, omitPackageIdFromSchedulePatch(validation.data));

  if (!data) {
    return NextResponse.json({ error: "Jadwal tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json({ data });
}

export async function DELETE(_: NextRequest, { params }: PackageScheduleDetailRouteProps) {
  const { id, scheduleId } = await params;
  const deleted = deleteScheduleRow(id, scheduleId);

  if (!deleted) {
    return NextResponse.json({ error: "Jadwal tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json({ data: { id: scheduleId, deleted: true } });
}
