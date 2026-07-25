import { NextRequest, NextResponse } from "next/server";
import {
  deleteScheduleRowById,
  findScheduleRowById,
  updateScheduleRowById,
} from "@/lib/seed-data/schedules";
import { validateSchedulePatch } from "@/lib/validation/schedules";

type ScheduleDetailRouteProps = {
  params: Promise<{
    scheduleId: string;
  }>;
};

export async function GET(_: NextRequest, { params }: ScheduleDetailRouteProps) {
  const { scheduleId } = await params;
  const data = findScheduleRowById(scheduleId);

  if (!data) {
    return NextResponse.json({ error: "Jadwal tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json({ data });
}

export async function PATCH(request: NextRequest, { params }: ScheduleDetailRouteProps) {
  const { scheduleId } = await params;
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

  const data = updateScheduleRowById(scheduleId, validation.data);

  if (!data) {
    return NextResponse.json({ error: "Jadwal tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json({ data });
}

export async function DELETE(_: NextRequest, { params }: ScheduleDetailRouteProps) {
  const { scheduleId } = await params;
  const deleted = deleteScheduleRowById(scheduleId);

  if (!deleted) {
    return NextResponse.json({ error: "Jadwal tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json({ data: { id: scheduleId, deleted: true } });
}
