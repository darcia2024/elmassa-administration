import { NextRequest, NextResponse } from "next/server";
import { listBookingStatuses } from "@/lib/settings/reference";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q")?.trim().toLowerCase() ?? "";
  const stage = searchParams.get("stage")?.trim();
  const mode = searchParams.get("mode")?.trim();

  const all = await listBookingStatuses();

  const data = all.filter((item) => {
    const searchable =
      `${item.name} ${item.stage} ${item.description} ${item.paymentImpact} ${item.documentImpact} ${item.owner}`.toLowerCase();
    const matchesQuery = query.length === 0 || searchable.includes(query);
    const matchesStage = !stage || stage === "Semua" || item.stage === stage;
    const matchesMode = !mode || mode === "Semua" || item.status === mode;

    return matchesQuery && matchesStage && matchesMode;
  });

  return NextResponse.json(
    {
      data,
      workflow: data.filter((item) => item.status === "Aktif").map((item) => item.name),
      summary: {
        statusCount: data.length,
        automaticCount: data.filter((item) => item.status === "Aktif").length,
        manualCount: data.filter((item) => item.status === "Manual").length,
      },
      meta: {
        total: data.length,
        source: "supabase",
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
