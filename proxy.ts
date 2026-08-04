import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth/session";

const publicApiPrefixes = [
  "/api/auth/login",
  "/api/auth/logout",
  "/api/packages",
  "/api/revision-notes",
  "/api/bookings",
  "/api/schedules",
];
export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (!pathname.startsWith("/api") || publicApiPrefixes.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  // Any staff account with a valid, unexpired signature is accepted — the list
  // of who exists lives in the database, not in a hardcoded set here.
  const claims = await verifySessionToken(readSessionToken(request));
  const userId = claims?.sub ?? null;

  if (!userId) {
    return NextResponse.json(
      {
        error: "Autentikasi diperlukan",
      },
      { status: 401 },
    );
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-el-massa-user-id", userId);
  requestHeaders.set("x-el-massa-user-role", claims?.role ?? "");

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ["/api/:path*"],
};

function readSessionToken(request: NextRequest) {
  const authorization = request.headers.get("authorization");

  if (authorization?.toLowerCase().startsWith("bearer ")) {
    return authorization.slice("bearer ".length).trim();
  }

  return request.cookies.get("el-massa-session")?.value ?? null;
}
