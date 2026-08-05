import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth/session";
import { getStaffAuthForModule } from "@/lib/roles/store";
import { resolveActionForRequest, resolveModuleForPath } from "@/lib/auth/modules";
import { logActivity } from "@/lib/audit/store";

// GET/HEAD are "view" traffic -- logging those would fill the activity log
// with page-load noise instead of an actual staff-action trail. Audit Log
// only records mutations that make it past the permission check below.
const AUDITABLE_METHODS = new Set(["POST", "PATCH", "PUT", "DELETE"]);

// No login required at all, for any method.
const publicApiPrefixes = ["/api/auth/login", "/api/auth/logout", "/api/revision-notes"];

// No login required to browse, but a mutation (POST/PATCH/DELETE) still needs
// one -- these used to be prefix-matched with no method check, which meant
// creating/editing/deleting through these routes was unauthenticated too.
const publicReadPrefixes = ["/api/packages", "/api/schedules"];

function unauthorized(message: string, status: 401 | 403) {
  return NextResponse.json({ error: message }, { status });
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (!pathname.startsWith("/api")) return NextResponse.next();
  if (publicApiPrefixes.some((prefix) => pathname.startsWith(prefix))) return NextResponse.next();
  if (request.method === "GET" && publicReadPrefixes.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  const claims = await verifySessionToken(readSessionToken(request));
  const userId = claims?.sub ?? null;

  if (!userId) {
    return unauthorized("Autentikasi diperlukan", 401);
  }

  // A route this proxy has never heard of has no permission rule to check --
  // fail closed rather than let a route someone forgot to register through
  // unchecked. `null` (vs. this `undefined` case) means deliberately exempt;
  // see lib/auth/modules.ts.
  const moduleId = resolveModuleForPath(pathname);
  if (moduleId === undefined) {
    return unauthorized("Endpoint ini belum terdaftar di sistem perizinan.", 403);
  }

  // A valid signature only proves the server issued this token at some point —
  // it says nothing about whether the account is still active, or still has
  // this role, right now. Next 16 runs proxy on the Node.js runtime (not
  // Edge), so this can check the database directly on every request instead
  // of trusting a token claim for up to 12h.
  let auth: Awaited<ReturnType<typeof getStaffAuthForModule>>;
  try {
    auth = await getStaffAuthForModule(userId, moduleId);
  } catch {
    // DB unreachable: fail closed. Every route this gate protects needs the
    // same database anyway, so an outage here isn't a new failure mode.
    auth = { active: false, role: null, name: null, permissions: null };
  }

  if (!auth.active) {
    return unauthorized("Sesi tidak valid — akun mungkin sudah dinonaktifkan. Silakan login ulang.", 401);
  }

  const action = resolveActionForRequest(request.method, pathname);

  if (moduleId !== null) {
    if (!auth.permissions?.[action]) {
      return unauthorized(`Role Anda tidak punya izin "${action}" untuk modul ini.`, 403);
    }
  }

  if (AUDITABLE_METHODS.has(request.method)) {
    await logActivity({
      userId,
      staffName: auth.name ?? "-",
      roleName: auth.role ?? "-",
      moduleId,
      action,
      method: request.method,
      path: pathname,
    });
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-el-massa-user-id", userId);
  requestHeaders.set("x-el-massa-user-role", auth.role ?? claims?.role ?? "");

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
