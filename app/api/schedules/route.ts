import { NextRequest, NextResponse } from "next/server";
import { createScheduleRow, listAllScheduleRows } from "@/lib/seed-data/schedules";
import { validateScheduleCreate } from "@/lib/validation/schedules";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const packageId = searchParams.get("packageId")?.trim();
  const status = searchParams.get("status")?.trim();

  const data = listAllScheduleRows()
    .filter((item) => !packageId || item.packageId === packageId)
    .filter((item) => !status || status === "Semua" || item.status === status)
    .sort((first, second) => first.departureDate.localeCompare(second.departureDate));

  return NextResponse.json({
    data,
    meta: {
      total: data.length,
      source: "dummy",
      filters: {
        packageId: packageId ?? null,
        status: status ?? null,
      },
    },
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const validation = validateScheduleCreate(body);

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
