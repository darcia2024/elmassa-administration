import { NextResponse } from "next/server";
import { listLetterCandidates } from "@/lib/letters/store";

/**
 * Jamaah the letter form can prefill from. Static segment, so it resolves here
 * rather than to /api/letters/[id] with id="candidates".
 */
export async function GET() {
  const data = await listLetterCandidates();
  return NextResponse.json({ data, meta: { total: data.length } }, { headers: { "Cache-Control": "no-store" } });
}
