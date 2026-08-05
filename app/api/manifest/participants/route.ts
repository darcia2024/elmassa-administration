import { NextRequest, NextResponse } from "next/server";
import { listParticipants } from "@/lib/participants/store";

/**
 * Flat list across every departure -- used by the booking detail page
 * (?bookingCode=) the same way /api/payments?bookingCode= already works, and
 * by Laporan Manifest for the all-jamaah searchable table.
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const bookingCode = searchParams.get("bookingCode")?.trim() || undefined;
  const packageId = searchParams.get("packageId")?.trim() || undefined;

  const data = await listParticipants({ bookingCode, packageId });

  return NextResponse.json(
    { data },
    { headers: { "Cache-Control": "no-store" } },
  );
}
