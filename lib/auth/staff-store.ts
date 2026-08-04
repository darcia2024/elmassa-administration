import { randomBytes, randomUUID, scryptSync, timingSafeEqual } from "crypto";
import { getPool } from "@/lib/db/connection";

/**
 * Staff accounts, stored in Supabase.
 *
 * Passwords are never kept in readable form: each row carries its own random
 * salt and a scrypt hash. The previous localStorage list held plaintext
 * passwords and defaulted every account to "admin123", so accounts migrated
 * from there must have their password changed.
 */

export type StaffRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  branch: string;
  status: string;
  lastLoginAt: string | null;
};

type StaffRowWithSecret = StaffRow & {
  passwordHash: string;
  passwordSalt: string;
};

const SELECT_PUBLIC = `id, name, email, role, branch, status, last_login_at as "lastLoginAt"`;

let tableReady = false;

function hashPassword(password: string, salt: string): string {
  return scryptSync(password, salt, 64).toString("hex");
}

export async function ensureStaffTable() {
  if (tableReady) return;

  // staff_users already exists from the Drizzle migrations, without any password
  // columns. Extend it in place rather than standing up a competing table.
  await getPool().query(`
    CREATE TABLE IF NOT EXISTS staff_users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL DEFAULT '',
      role TEXT NOT NULL DEFAULT 'Sub-User Operasional',
      branch TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'Aktif',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    ALTER TABLE staff_users ADD COLUMN IF NOT EXISTS password_hash TEXT;
    ALTER TABLE staff_users ADD COLUMN IF NOT EXISTS password_salt TEXT;
    ALTER TABLE staff_users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;
    CREATE UNIQUE INDEX IF NOT EXISTS staff_users_email_lower_idx ON staff_users (LOWER(email));
  `);

  // Bootstrap: an empty table would lock everyone out, so seed the Admin Master
  // once. The password comes from the environment when provided.
  const existing = await getPool().query(`SELECT COUNT(*)::int AS n FROM staff_users;`);

  if (existing.rows[0]?.n === 0) {
    const salt = randomBytes(16).toString("hex");
    const initialPassword = process.env.INITIAL_ADMIN_PASSWORD || "admin123";

    await getPool().query(
      `INSERT INTO staff_users (id, name, email, phone, password_hash, password_salt, role, branch, status)
       VALUES ($1, $2, $3, '', $4, $5, $6, $7, 'Aktif');`,
      [
        randomUUID(),
        "Azriandri",
        "azriandri@elmassa.test",
        hashPassword(initialPassword, salt),
        salt,
        "Admin Master",
        "Pangkalpinang (Bangka)",
      ],
    );
  }

  tableReady = true;
}

export async function listStaff(): Promise<StaffRow[]> {
  await ensureStaffTable();
  const res = await getPool().query(`SELECT ${SELECT_PUBLIC} FROM staff_users ORDER BY created_at ASC;`);
  return res.rows;
}

export async function findStaffByEmail(email: string): Promise<StaffRowWithSecret | null> {
  await ensureStaffTable();
  const res = await getPool().query(
    `SELECT ${SELECT_PUBLIC}, password_hash as "passwordHash", password_salt as "passwordSalt"
     FROM staff_users WHERE LOWER(email) = LOWER($1) LIMIT 1;`,
    [email],
  );
  return res.rows[0] ?? null;
}

export async function findStaffById(id: string): Promise<StaffRowWithSecret | null> {
  await ensureStaffTable();
  const res = await getPool().query(
    `SELECT ${SELECT_PUBLIC}, password_hash as "passwordHash", password_salt as "passwordSalt"
     FROM staff_users WHERE id = $1 LIMIT 1;`,
    [id],
  );
  return res.rows[0] ?? null;
}

export function verifyStaffPassword(row: StaffRowWithSecret, password: string): boolean {
  // Rows that predate the password columns cannot log in until one is set.
  if (!row.passwordHash || !row.passwordSalt) return false;

  const expected = Buffer.from(row.passwordHash, "hex");
  const actual = Buffer.from(hashPassword(password, row.passwordSalt), "hex");
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export async function markStaffLoggedIn(id: string) {
  await getPool().query(`UPDATE staff_users SET last_login_at = NOW() WHERE id = $1;`, [id]);
}

/**
 * Used by proxy.ts on every authenticated request so a deactivated/deleted
 * staff account loses access immediately instead of waiting out the token's
 * 12h expiry. Returns false for both "row missing" and "status != Aktif" --
 * callers don't need to distinguish the two.
 */
export async function isStaffActive(id: string): Promise<boolean> {
  await ensureStaffTable();
  const res = await getPool().query(`SELECT status FROM staff_users WHERE id = $1 LIMIT 1;`, [id]);
  return res.rows[0]?.status === "Aktif";
}

export async function createStaff(input: {
  name: string;
  email: string;
  password: string;
  role?: string;
  branch?: string;
  status?: string;
}): Promise<StaffRow> {
  await ensureStaffTable();
  const salt = randomBytes(16).toString("hex");

  const res = await getPool().query(
    `INSERT INTO staff_users (id, name, email, phone, password_hash, password_salt, role, branch, status)
     VALUES ($1, $2, $3, '', $4, $5, $6, $7, $8)
     RETURNING ${SELECT_PUBLIC};`,
    [
      randomUUID(),
      input.name,
      input.email.toLowerCase(),
      hashPassword(input.password, salt),
      salt,
      input.role || "Sub-User Operasional",
      input.branch || "",
      input.status || "Aktif",
    ],
  );

  return res.rows[0];
}

export async function updateStaff(
  id: string,
  patch: { name?: string; email?: string; role?: string; branch?: string; status?: string; password?: string },
): Promise<StaffRow | null> {
  await ensureStaffTable();

  const sets: string[] = [];
  const values: unknown[] = [];
  const push = (column: string, value: unknown) => {
    values.push(value);
    sets.push(`${column} = $${values.length}`);
  };

  if (patch.name !== undefined) push("name", patch.name);
  if (patch.email !== undefined) push("email", patch.email.toLowerCase());
  if (patch.role !== undefined) push("role", patch.role);
  if (patch.branch !== undefined) push("branch", patch.branch);
  if (patch.status !== undefined) push("status", patch.status);

  if (patch.password) {
    const salt = randomBytes(16).toString("hex");
    push("password_hash", hashPassword(patch.password, salt));
    push("password_salt", salt);
  }

  if (sets.length === 0) return null;

  sets.push("updated_at = NOW()");
  values.push(id);
  const res = await getPool().query(
    `UPDATE staff_users SET ${sets.join(", ")} WHERE id = $${values.length} RETURNING ${SELECT_PUBLIC};`,
    values,
  );

  return res.rows[0] ?? null;
}

export async function deleteStaff(id: string): Promise<boolean> {
  await ensureStaffTable();
  const res = await getPool().query(`DELETE FROM staff_users WHERE id = $1;`, [id]);
  return (res.rowCount ?? 0) > 0;
}
