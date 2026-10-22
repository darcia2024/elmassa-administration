import { NextRequest, NextResponse } from "next/server";
import { createScheduleRow, listAllScheduleRows, packageExists } from "@/lib/schedules/store";
import { validateScheduleCreate } from "@/lib/validation/schedules";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const packageId = searchParams.get("packageId")?.trim();
  const status = searchParams.get("status")?.trim();

  const data = (await listAllScheduleRows())
    .filter((item) => !packageId || item.packageId === packageId)
    .filter((item) => !status || status === "Semua" || item.status === status)
    .sort((first, second) => first.departureDate.localeCompare(second.departureDate));

  return NextResponse.json({
    data,
    meta: {
      total: data.length,
      source: "supabase",
      filters: {
        packageId: packageId ?? null,
        status: status ?? null,
      },
    },
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
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

  if (!await packageExists(validation.data.packageId)) return NextResponse.json({ error: "Paket tidak ditemukan" }, { status: 404 });
  const data = await createScheduleRow(validation.data);

  return NextResponse.json({ data }, { status: 201 });
}
