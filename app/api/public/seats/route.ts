import { NextResponse } from "next/server";
import { listPublicSeatAvailability } from "@/lib/seats/public";

// Read by the public katalog site from another origin, so CORS is open. The
// payload is counts only (see lib/seats/public.ts). A short CDN cache keeps a
// busy katalog from turning every visit into a database query, while a new
// booking still shows up on the katalog within about a minute.
const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
};

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await listPublicSeatAvailability();
    return NextResponse.json({ ok: true, data, generatedAt: new Date().toISOString() }, { headers });
  } catch (err) {
    console.error("Public seat availability failed:", err);
    // No driver details: this endpoint is unauthenticated.
    return NextResponse.json(
      { ok: false, error: "Data seat sedang tidak tersedia." },
      { status: 503, headers: { ...headers, "Cache-Control": "no-store" } },
    );
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers });
}
