/**
 * Signed session tokens.
 *
 * Payload and HMAC-SHA256 signature, both base64url, joined by a dot. Web
 * Crypto is used throughout so the exact same code verifies in proxy.ts and
 * in route handlers.
 *
 * A valid signature only proves the server issued the token, not that the
 * account is still active or still has the role it had at login -- proxy.ts
 * additionally checks staff_users.status and role on every request (see
 * getStaffAuthForModule in lib/roles/store.ts) so a deactivated account, or
 * one whose role was just changed, takes effect immediately instead of
 * waiting out the token's 12h expiry. That's only possible because Next 16's
 * proxy runs on the Node.js runtime by default (not Edge, despite what
 * "proxy" suggests) -- an earlier version of this comment assumed Edge and
 * said a DB check wasn't possible here at all, which was never actually
 * verified against the docs.
 */

export type SessionClaims = {
  sub: string;
  email: string;
  name: string;
  role: string;
  exp: number;
};

const SESSION_TTL_SECONDS = 60 * 60 * 12; // 12 hours

function getSecret(): string {
  const secret = process.env.NEXTAUTH_SECRET;

  if (!secret) {
    throw new Error("NEXTAUTH_SECRET is not set. Add it to .env.local before issuing sessions.");
  }

  return secret;
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string): Uint8Array {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const binary = atob(padded);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

async function importKey(secret: string) {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
}

async function sign(payload: string, secret: string): Promise<string> {
  const key = await importKey(secret);
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return toBase64Url(new Uint8Array(signature));
}

export async function createSessionToken(user: {
  id: string;
  email: string;
  name: string;
  role: string;
}): Promise<string> {
  const claims: SessionClaims = {
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  };

  const payload = toBase64Url(new TextEncoder().encode(JSON.stringify(claims)));
  const signature = await sign(payload, getSecret());

  return `${payload}.${signature}`;
}

/**
 * Returns the claims only when the signature matches and the token is unexpired.
 * Any tampering, truncation or expiry yields null — never a partial result.
 */
export async function verifySessionToken(token: string | null | undefined): Promise<SessionClaims | null> {
  if (!token) return null;

  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  try {
    const expected = await sign(payload, getSecret());

    // Constant-time-ish comparison: equal length, then every byte.
    if (expected.length !== signature.length) return null;
    let mismatch = 0;
    for (let i = 0; i < expected.length; i += 1) {
      mismatch |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
    }
    if (mismatch !== 0) return null;

    const claims = JSON.parse(new TextDecoder().decode(fromBase64Url(payload))) as SessionClaims;

    if (!claims.sub || typeof claims.exp !== "number") return null;
    if (claims.exp * 1000 < Date.now()) return null;

    return claims;
  } catch {
    return null;
  }
}
