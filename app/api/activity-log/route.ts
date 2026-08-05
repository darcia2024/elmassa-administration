import { NextRequest, NextResponse } from "next/server";
import { listActivity } from "@/lib/audit/store";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const search = searchParams.get("search")?.trim() || undefined;
  const moduleId = searchParams.get("moduleId")?.trim() || undefined;
  const action = searchParams.get("action")?.trim() || undefined;
  const limit = searchParams.get("limit") ? Number(searchParams.get("limit")) : undefined;

  const data = await listActivity({ search, moduleId, action, limit });

  return NextResponse.json(
    { data },
    { headers: { "Cache-Control": "no-store" } },
  );
}
