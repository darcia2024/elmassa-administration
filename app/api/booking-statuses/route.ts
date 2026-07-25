import { NextRequest, NextResponse } from "next/server";
import { listBookingStatusRows } from "@/lib/seed-data/booking-statuses";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q")?.trim().toLowerCase() ?? "";
  const stage = searchParams.get("stage")?.trim();
  const mode = searchParams.get("mode")?.trim();

  const data = listBookingStatusRows().filter((item) => {
    const searchable =
      `${item.name} ${item.stage} ${item.description} ${item.paymentImpact} ${item.documentImpact} ${item.ownerRole}`.toLowerCase();
    const matchesQuery = query.length === 0 || searchable.includes(query);
    const matchesStage = !stage || stage === "Semua" || item.stage === stage;
    const matchesMode = !mode || mode === "Semua" || item.mode === mode;

    return matchesQuery && matchesStage && matchesMode;
  });

  return NextResponse.json(
    {
      data,
      workflow: data.filter((item) => item.mode === "Aktif").map((item) => item.name),
      summary: {
        statusCount: data.length,
        automaticCount: data.filter((item) => item.mode === "Aktif").length,
        manualCount: data.filter((item) => item.mode === "Manual").length,
      },
      meta: {
        total: data.length,
        source: "dummy",
        readonly: true,
        filters: {
          q: query,
          stage: stage ?? null,
          mode: mode ?? null,
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
