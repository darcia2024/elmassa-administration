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
    id: "user-azri",
    name: "Azriandri",
    email: "azriandri@elmassa.test",
    passwordHash: hashPassword("admin123"),
    role: "CEO / Admin Master",
    branch: "Pangkalpinang (Bangka)",
    status: "Aktif",
    lastLoginAt: null,
  },
  {
    id: "user-ruslan",
    name: "H. Ruslan Efendi",
    email: "ruslan.ops@elmassa.test",
    passwordHash: hashPassword("admin123"),
    role: "Sub-User Operasional",
    branch: "Tanjung Pandan (Belitung)",
    status: "Aktif",
    lastLoginAt: null,
  },
  {
    id: "user-zubaidah",
    name: "Hj. Zubaidah",
    email: "zubaidah.fin@elmassa.test",
    passwordHash: hashPassword("admin123"),
    role: "Sub-User Keuangan",
    branch: "Pangkalpinang (Bangka)",
    status: "Aktif",
    lastLoginAt: null,
  },
  {
    id: "user-ridwan",
    name: "Ridwan Hasan",
    email: "ridwan.sales@elmassa.test",
    passwordHash: hashPassword("admin123"),
    role: "Sub-User Sales & CRM",
    branch: "Palembang (Sumbagsel)",
    status: "Aktif",
    lastLoginAt: null,
  },
  {
    id: "user-ahmad",
    name: "Ust. Ahmad Syahputra",
    email: "ahmad.field@elmassa.test",
    passwordHash: hashPassword("admin123"),
    role: "Sub-User Lapangan",
    branch: "Pangkalpinang (Bangka)",
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
