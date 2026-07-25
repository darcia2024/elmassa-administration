import { createHash, randomUUID, timingSafeEqual } from "crypto";

export type AuthUserRow = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: string;
  branch: string;
  status: "Aktif" | "Nonaktif";
  lastLoginAt: string | null;
};

const passwordPepper = "el-massa-auth-seed";

const authUserRows: AuthUserRow[] = [
  {
    id: "user-maya",
    name: "Maya Safitri",
    email: "maya@elmassa.test",
    passwordHash: hashPassword("admin123"),
    role: "Admin Operasional",
    branch: "Bekasi",
    status: "Aktif",
    lastLoginAt: null,
  },
];

export function findAuthUserByEmail(email: string) {
  return authUserRows.find((item) => item.email === email.trim().toLowerCase());
}

export function findAuthUserById(id: string) {
  return authUserRows.find((item) => item.id === id);
}

export function verifyAuthUserPassword(user: AuthUserRow, password: string) {
  const expected = Buffer.from(user.passwordHash, "hex");
  const actual = Buffer.from(hashPassword(password), "hex");

  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export function markAuthUserLoggedIn(id: string) {
  const user = authUserRows.find((item) => item.id === id);

  if (!user) {
    return null;
  }

  user.lastLoginAt = new Date().toISOString();

  return user;
}

export function updateAuthUserPassword(id: string, password: string) {
  const user = authUserRows.find((item) => item.id === id);

  if (!user) {
    return null;
  }

  user.passwordHash = hashPassword(password);

  return user;
}

export function createSessionToken(user: AuthUserRow) {
  return Buffer.from(`${user.id}:${randomUUID()}`).toString("base64url");
}

export function toSessionUser(user: AuthUserRow) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    branch: user.branch,
    status: user.status,
    lastLoginAt: user.lastLoginAt,
  };
}

function hashPassword(password: string) {
  return createHash("sha256").update(`${passwordPepper}:${password}`).digest("hex");
}
