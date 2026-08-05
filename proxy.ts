import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth/session";
import { isStaffActive } from "@/lib/auth/staff-store";

const publicApiPrefixes = [
  "/api/auth/login",
  "/api/auth/logout",
  "/api/packages",
  "/api/revision-notes",
  "/api/schedules",
];
export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (!pathname.startsWith("/api") || publicApiPrefixes.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

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

  // A valid signature only proves the server issued this token at some point —
  // it says nothing about whether the account is still active right now. Next
  // 16 runs proxy on the Node.js runtime (not Edge), so this can check the
  // database directly instead of trusting the token alone for up to 12h.
  let active: boolean;
  try {
    active = await isStaffActive(userId);
  } catch {
    // DB unreachable: fail closed. Every route this gate protects needs the
    // same database anyway, so an outage here isn't a new failure mode.
    active = false;
  }

  if (!active) {
    return NextResponse.json(
      {
        error: "Sesi tidak valid — akun mungkin sudah dinonaktifkan. Silakan login ulang.",
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
