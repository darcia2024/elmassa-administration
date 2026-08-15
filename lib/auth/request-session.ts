import { verifySessionToken } from "@/lib/auth/session";

/**
 * Whether a plain Request carries a valid staff session.
 *
 * proxy.ts already does this for gated routes, but a handful of routes are in
 * `publicReadPrefixes` — readable without login on purpose, because the public
 * itinerary/UmrahMe apps browse the catalogue. Those handlers still need to
 * know whether the caller is staff, so they can withhold the parts of a row
 * that are not meant to be public (see costing_data in /api/packages).
 */

const SESSION_COOKIE = "el-massa-session";

function readSessionToken(request: Request): string | null {
  const authorization = request.headers.get("authorization");
  if (authorization?.toLowerCase().startsWith("bearer ")) {
    return authorization.slice("bearer ".length).trim();
  }

  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return null;

  for (const part of cookieHeader.split(";")) {
    const separator = part.indexOf("=");
    if (separator === -1) continue;

    if (part.slice(0, separator).trim() === SESSION_COOKIE) {
      return decodeURIComponent(part.slice(separator + 1).trim());
    }
  }

  return null;
}

export async function hasStaffSession(request: Request): Promise<boolean> {
  const claims = await verifySessionToken(readSessionToken(request));
  return Boolean(claims?.sub);
}
