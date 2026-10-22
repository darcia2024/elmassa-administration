import { NextRequest, NextResponse } from "next/server";
import { deleteScheduleRow, findScheduleRow, updateScheduleRow } from "@/lib/schedules/store";
import { omitPackageIdFromSchedulePatch, validateSchedulePatch, validateScheduleCreate } from "@/lib/validation/schedules";

type PackageScheduleDetailRouteProps = {
  params: Promise<{
    id: string;
    scheduleId: string;
  }>;
};

export async function GET(_: NextRequest, { params }: PackageScheduleDetailRouteProps) {
  const { id, scheduleId } = await params;
  const data = await findScheduleRow(id, scheduleId);

  if (!data) {
    return NextResponse.json({ error: "Jadwal tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json({ data });
}

export async function PATCH(request: NextRequest, { params }: PackageScheduleDetailRouteProps) {
  const { id, scheduleId } = await params;
  const body = await request.json().catch(() => null);
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

  const existing = await findScheduleRow(id, scheduleId);
  if (!existing) return NextResponse.json({ error: "Jadwal tidak ditemukan" }, { status: 404 });
  const merged = { ...existing, ...Object.fromEntries(Object.entries(validation.data).filter(([, value]) => value !== undefined)) };
  const fullValidation = validateScheduleCreate(merged, id);
  if (fullValidation.errors) return NextResponse.json({ error: "Payload jadwal tidak valid", details: fullValidation.errors }, { status: 400 });
  const data = await updateScheduleRow(id, scheduleId, omitPackageIdFromSchedulePatch(validation.data));

  if (!data) {
    return NextResponse.json({ error: "Jadwal tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json({ data });
}

export async function DELETE(_: NextRequest, { params }: PackageScheduleDetailRouteProps) {
  const { id, scheduleId } = await params;
  const deleted = await deleteScheduleRow(id, scheduleId);

  if (!deleted) {
    return NextResponse.json({ error: "Jadwal tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json({ data: { id: scheduleId, deleted: true } });
}
