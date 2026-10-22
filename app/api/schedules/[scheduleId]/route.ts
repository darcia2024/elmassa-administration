import { NextRequest, NextResponse } from "next/server";
import {
  packageExists,
  deleteScheduleRowById,
  findScheduleRowById,
  updateScheduleRowById,
} from "@/lib/schedules/store";
import { validateSchedulePatch, validateScheduleCreate } from "@/lib/validation/schedules";

type ScheduleDetailRouteProps = {
  params: Promise<{
    scheduleId: string;
  }>;
};

export async function GET(_: NextRequest, { params }: ScheduleDetailRouteProps) {
  const { scheduleId } = await params;
  const data = await findScheduleRowById(scheduleId);

  if (!data) {
    return NextResponse.json({ error: "Jadwal tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json({ data });
}

export async function PATCH(request: NextRequest, { params }: ScheduleDetailRouteProps) {
  const { scheduleId } = await params;
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

  const existing = await findScheduleRowById(scheduleId);
  if (!existing) return NextResponse.json({ error: "Jadwal tidak ditemukan" }, { status: 404 });
  const merged = { ...existing, ...Object.fromEntries(Object.entries(validation.data).filter(([, value]) => value !== undefined)) };
  const fullValidation = validateScheduleCreate(merged);
  if (fullValidation.errors) return NextResponse.json({ error: "Payload jadwal tidak valid", details: fullValidation.errors }, { status: 400 });
  if (!await packageExists(merged.packageId)) return NextResponse.json({ error: "Paket tidak ditemukan" }, { status: 404 });
  const data = await updateScheduleRowById(scheduleId, validation.data);

  if (!data) {
    return NextResponse.json({ error: "Jadwal tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json({ data });
}

export async function DELETE(_: NextRequest, { params }: ScheduleDetailRouteProps) {
  const { scheduleId } = await params;
  const deleted = await deleteScheduleRowById(scheduleId);

  if (!deleted) {
    return NextResponse.json({ error: "Jadwal tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json({ data: { id: scheduleId, deleted: true } });
}
