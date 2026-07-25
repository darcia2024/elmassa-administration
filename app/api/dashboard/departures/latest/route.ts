import { NextResponse } from "next/server";
import { getLatestDepartures } from "@/lib/seed-data/derived";

export async function GET() {
  const data = getLatestDepartures();

  return NextResponse.json(
    {
      data,
      meta: {
        total: data.length,
        source: "dummy",
      },
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
