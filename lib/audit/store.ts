import { getPool } from "@/lib/db/connection";
import { MODULES } from "@/lib/auth/modules";

/**
 * Staff activity log, written from proxy.ts on every authenticated mutation
 * (POST/PATCH/PUT/DELETE) that passes the permission check -- GET/HEAD is
 * deliberately not logged here, or this table would fill with page-view noise
 * instead of an actual "who changed what" trail.
 *
 * staff_name/role_name are snapshotted at write time rather than joined live
 * from staff_users/roles on read. That's intentional: a staff member who gets
 * renamed, has their role changed, or is deleted later must not rewrite what
 * the log already says about a past action.
 *
 * Known scope limit (surfaced in the UI, not hidden): proxy.ts runs before the
 * route handler, so this records "staff X was authorized to POST
 * /api/bookings" at time T -- not whether that request went on to succeed,
 * fail validation, or what fields actually changed. A true before/after diff
 * would need per-route instrumentation, not a single central gate.
 */

export type ActivityLogEntry = {
  id: string;
  userId: string;
  staffName: string;
  roleName: string;
  moduleId: string | null;
  moduleName: string;
  action: string;
  method: string;
  path: string;
  createdAt: string;
};

let tableReady = false;

async function ensureTable() {
  if (tableReady) return;
  await getPool().query(`
    CREATE TABLE IF NOT EXISTS activity_log (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL,
      staff_name TEXT NOT NULL,
      role_name TEXT NOT NULL DEFAULT '',
      module_id TEXT,
      action TEXT NOT NULL,
      method TEXT NOT NULL,
      path TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS activity_log_created_at_idx ON activity_log (created_at DESC);
  `);
  tableReady = true;
}

const MODULE_NAME_BY_ID = new Map(MODULES.map((m) => [m.id, m.name]));

/**
 * Best-effort by design: a logging failure must never block or fail the
 * mutation it's trying to record, so errors are swallowed here (and reported
 * to the server console) rather than thrown back at proxy.ts.
 */
export async function logActivity(entry: {
  userId: string;
  staffName: string;
  roleName: string;
  moduleId: string | null;
  action: string;
  method: string;
  path: string;
}): Promise<void> {
  try {
    await ensureTable();
    await getPool().query(
      `INSERT INTO activity_log (user_id, staff_name, role_name, module_id, action, method, path)
       VALUES ($1, $2, $3, $4, $5, $6, $7);`,
      [entry.userId, entry.staffName, entry.roleName, entry.moduleId, entry.action, entry.method, entry.path],
    );
  } catch (err) {
    console.error("Failed to write activity_log entry:", err);
  }
}

export async function listActivity(filter?: {
  search?: string;
  moduleId?: string;
  action?: string;
  limit?: number;
}): Promise<ActivityLogEntry[]> {
  await ensureTable();

  const conditions: string[] = [];
  const values: unknown[] = [];
  const push = (value: unknown) => {
    values.push(value);
    return `${values.length}`;
  };

  if (filter?.search) {
    const idx = push(`%${filter.search}%`);
    conditions.push(`staff_name ILIKE $${idx}`);
  }
  if (filter?.moduleId) {
    conditions.push(`module_id = $${push(filter.moduleId)}`);
  }
  if (filter?.action) {
    conditions.push(`action = $${push(filter.action)}`);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const limit = Math.min(Math.max(filter?.limit ?? 300, 1), 1000);
  values.push(limit);

  const res = await getPool().query(
    `
    SELECT
      id, user_id AS "userId", staff_name AS "staffName", role_name AS "roleName",
      module_id AS "moduleId", action, method, path,
      TO_CHAR(created_at, 'YYYY-MM-DD"T"HH24:MI:SSZ') AS "createdAt"
    FROM activity_log
    ${where}
    ORDER BY created_at DESC
    LIMIT $${values.length};
    `,
    values,
  );

  return res.rows.map((row) => ({
    ...row,
    moduleName: row.moduleId ? MODULE_NAME_BY_ID.get(row.moduleId) ?? row.moduleId : "Sistem (Umum)",
  }));
}
