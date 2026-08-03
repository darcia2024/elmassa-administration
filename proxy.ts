import { NextRequest, NextResponse } from "next/server";

const publicApiPrefixes = [
  "/api/auth/login",
  "/api/auth/logout",
  "/api/packages",
  "/api/revision-notes",
  "/api/reset-all-data",
  "/api/bookings",
  "/api/schedules",
];
const knownUserIds = new Set(["user-azri"]);

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (!pathname.startsWith("/api") || publicApiPrefixes.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  const token = readSessionToken(request);
  const userId = token ? parseSessionUserId(token) : null;

  if (!userId || !knownUserIds.has(userId)) {
    return NextResponse.json(
      {
        error: "Autentikasi diperlukan",
      },
      { status: 401 },
    );
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-el-massa-user-id", userId);

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

function parseSessionUserId(token: string) {
  try {
    const normalized = token.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    const decoded = atob(padded);
    const [userId] = decoded.split(":");

    return userId || null;
  } catch {
    return null;
  }
}
