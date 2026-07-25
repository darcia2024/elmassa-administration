import { NextResponse } from "next/server";
import { getDashboardStats } from "@/lib/seed-data/derived";

export async function GET() {
  return NextResponse.json(
    {
      data: getDashboardStats(),
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
