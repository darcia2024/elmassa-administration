import { NextRequest, NextResponse } from "next/server";
import {
  createServiceTypeRow,
  listServiceTypeRows,
  parseServiceTypePayload,
} from "@/lib/seed-data/service-types";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q")?.trim().toLowerCase() ?? "";
  const category = searchParams.get("category")?.trim();
  const status = searchParams.get("status")?.trim();

  const data = listServiceTypeRows().filter((item) => {
    const searchable = `${item.name} ${item.category} ${item.defaultDuration} ${item.documentTemplate} ${item.notes}`.toLowerCase();
    const matchesQuery = query.length === 0 || searchable.includes(query);
    const matchesCategory = !category || category === "Semua" || item.category === category;
    const matchesStatus = !status || status === "Semua" || item.status === status;

    return matchesQuery && matchesCategory && matchesStatus;
  });

  return NextResponse.json(
    {
      data,
      summary: {
        serviceTypeCount: data.length,
        activeCount: data.filter((item) => item.status === "Aktif").length,
        draftCount: data.filter((item) => item.status === "Draft").length,
      },
      meta: {
        total: data.length,
        source: "dummy",
        filters: {
          q: query,
          category: category ?? null,
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
  const parsed = parseServiceTypePayload(body);

  if ("errors" in parsed) {
    return NextResponse.json({ error: "Payload jenis layanan tidak valid", fields: parsed.errors }, { status: 400 });
  }

  const data = createServiceTypeRow({
    name: parsed.data.name!,
    category: parsed.data.category!,
    defaultDuration: parsed.data.defaultDuration ?? "",
    documentTemplate: parsed.data.documentTemplate!,
    status: parsed.data.status!,
    notes: parsed.data.notes ?? "",
  });

  return NextResponse.json({ data }, { status: 201 });
}
