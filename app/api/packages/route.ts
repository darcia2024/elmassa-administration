import { NextRequest, NextResponse } from "next/server";
import { createPackageRow, listPackageRows } from "@/lib/seed-data/packages";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q")?.trim().toLowerCase() ?? "";
  const serviceType = searchParams.get("type")?.trim();
  const status = searchParams.get("status")?.trim();

  const data = listPackageRows().filter((item) => {
    const matchesQuery =
      query.length === 0 ||
      `${item.name} ${item.serviceType} ${item.packageType} ${item.itinerary}`
        .toLowerCase()
        .includes(query);
    const matchesType = !serviceType || serviceType === "Semua" || item.serviceType === serviceType;
    const matchesStatus = !status || status === "Semua" || item.status === status;

    return matchesQuery && matchesType && matchesStatus;
  });

  return NextResponse.json(
    {
      data,
      meta: {
        total: data.length,
        source: "dummy",
        filters: {
          q: query,
          type: serviceType ?? null,
          status: status ?? null,
        },
      },
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  if (!body.name || !body.serviceType) {
    return NextResponse.json(
      {
        error: "name dan serviceType wajib diisi",
      },
      {
        status: 400,
      },
    );
  }

  const data = createPackageRow({
    name: String(body.name),
    serviceType: String(body.serviceType),
    packageType: String(body.packageType ?? "Reguler"),
    itinerary: String(body.itinerary ?? ""),
    basePrice: body.basePrice === null || body.basePrice === undefined ? null : Number(body.basePrice),
    durationDays: body.durationDays === null || body.durationDays === undefined ? null : Number(body.durationDays),
    status: String(body.status ?? "Draft"),
  });

  return NextResponse.json({ data }, { status: 201 });
}
