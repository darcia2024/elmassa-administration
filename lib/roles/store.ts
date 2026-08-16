import { getPool } from "@/lib/db/connection";
import { MODULES, MODULE_IDS, emptyPermissions, fullPermissions, type ModuleAction } from "@/lib/auth/modules";

/**
 * Roles and their per-module permission matrix. staff_users.role is a plain
 * text column (see lib/auth/staff-store.ts) that must match roles.name
 * exactly -- there's no FK, matching how this codebase already links
 * real_bookings to other tables by matching text rather than a hard
 * constraint. A staff row whose role text doesn't match any roles.name gets
 * zero permissions (fail closed), it doesn't error.
 *
 * "Admin Master" is the one seeded system role: permissions fixed to
 * everything true, can't be renamed or deleted, and its own permission rows
 * can't be edited even via the API (not just a disabled UI checkbox) --
 * otherwise an admin could accidentally lock every admin out of Hak Akses
 * with no way back in.
 */

export type ModulePermissionSet = Record<ModuleAction, boolean>;

export type Role = {
  id: string;
  name: string;
  description: string;
  isSystem: boolean;
  staffCount: number;
  permissions: Record<string, ModulePermissionSet>;
};

export const ADMIN_ROLE_NAME = "Admin Master";

const SEED_ROLES: Array<{ name: string; description: string; isSystem: boolean; permissions: Record<string, Partial<ModulePermissionSet>> }> = [
  {
    name: "Admin Master",
    description: "Akses 100% penuh ke seluruh modul sistem, margin HPP, keuangan, & pengubahan staf.",
    isSystem: true,
    permissions: Object.fromEntries(MODULES.map((m) => [m.id, fullPermissions()])),
  },
  {
    name: "Sub-User Operasional",
    description: "Akses kelola paket, jadwal keberangkatan, booking jamaah, & manifest peserta.",
    isSystem: false,
    permissions: {
      dash: { view: true },
      paket: { view: true, edit: true },
      jadwal: { view: true, edit: true, approve: true },
      pelanggan: { view: true, edit: true },
      booking: { view: true, edit: true, approve: true },
      manifest: { view: true, edit: true, approve: true },
      umrahme: { view: true, edit: true, approve: true },
      dokumen: { view: true, edit: true },
    },
  },
  {
    name: "Sub-User Keuangan",
    description: "Khusus verifikasi kasir, pencatatan DP/cicilan, cetak kuitansi, invoice, & laporan omset.",
    isSystem: false,
    permissions: {
      dash: { view: true },
      paket: { view: true },
      pelanggan: { view: true },
      booking: { view: true },
      umrahme: { view: true },
      pembayaran: { view: true, edit: true, approve: true, delete: true },
      dokumen: { view: true, edit: true, approve: true },
      laporan: { view: true, edit: true, approve: true },
    },
  },
  {
    name: "Sub-User Sales & CRM",
    description: "Input calon pendaftar umrah, lihat katalog paket, & kelola relasi jamaah.",
    isSystem: false,
    permissions: {
      dash: { view: true },
      paket: { view: true },
      jadwal: { view: true },
      pelanggan: { view: true, edit: true },
      booking: { view: true, edit: true },
      umrahme: { view: true },
    },
  },
  {
    name: "Sub-User Lapangan",
    description: "Petugas lapangan bandara, muthawwif, handling rooming hotel, & paspor jamaah.",
    isSystem: false,
    permissions: {
      dash: { view: true },
      jadwal: { view: true },
      manifest: { view: true, edit: true },
      umrahme: { view: true },
      dokumen: { view: true },
    },
  },
];

let ready = false;

async function ensureTables() {
  if (ready) return;

  await getPool().query(`
    CREATE TABLE IF NOT EXISTS roles (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL UNIQUE,
      description TEXT NOT NULL DEFAULT '',
      is_system BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS role_permissions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
      module_id TEXT NOT NULL,
      can_view BOOLEAN NOT NULL DEFAULT false,
      can_edit BOOLEAN NOT NULL DEFAULT false,
      can_approve BOOLEAN NOT NULL DEFAULT false,
      can_delete BOOLEAN NOT NULL DEFAULT false,
      UNIQUE(role_id, module_id)
    );
  `);

  const existing = await getPool().query(`SELECT COUNT(*)::int AS n FROM roles;`);

  if (existing.rows[0]?.n === 0) {
    for (const seed of SEED_ROLES) {
      const roleRes = await getPool().query(
        `INSERT INTO roles (name, description, is_system) VALUES ($1, $2, $3) RETURNING id;`,
        [seed.name, seed.description, seed.isSystem],
      );
      const roleId = roleRes.rows[0].id;

      for (const moduleDef of MODULES) {
        const perm = { ...emptyPermissions(), ...(seed.permissions[moduleDef.id] ?? {}) };
        await getPool().query(
          `INSERT INTO role_permissions (role_id, module_id, can_view, can_edit, can_approve, can_delete)
           VALUES ($1, $2, $3, $4, $5, $6);`,
          [roleId, moduleDef.id, perm.view, perm.edit, perm.approve, perm.delete],
        );
      }
    }
  }

  await backfillModuleRows();
  ready = true;
}

/**
 * Adding an entry to MODULES after the roles were already seeded used to leave
 * every role with no row for it -- and getStaffAuthForModule reads a missing
 * row as "no permission". A brand-new module was therefore invisible to
 * EVERYONE, Admin Master included, with no way to grant it from Hak Akses
 * (that page can only toggle rows that exist).
 *
 * So fill the gap on startup: the locked system role gets full access, since
 * it is defined as having all of it and updateRole refuses to change it.
 * Every other role gets an explicit all-false row -- fail closed, but now
 * visible in the matrix so an admin can grant it deliberately.
 */
async function backfillModuleRows() {
  await getPool().query(
    `INSERT INTO role_permissions (role_id, module_id, can_view, can_edit, can_approve, can_delete)
     SELECT r.id, m.module_id, r.is_system, r.is_system, r.is_system, r.is_system
     FROM roles r
     CROSS JOIN (SELECT unnest($1::text[]) AS module_id) m
     ON CONFLICT (role_id, module_id) DO NOTHING;`,
    [MODULE_IDS],
  );
}

function toPermissionSet(row: any): ModulePermissionSet {
  return { view: row.canView, edit: row.canEdit, approve: row.canApprove, delete: row.canDelete };
}

export async function listRoles(): Promise<Role[]> {
  await ensureTables();

  const roles = await getPool().query(`
    SELECT r.id, r.name, r.description, r.is_system AS "isSystem",
      COALESCE(sc.n, 0)::int AS "staffCount"
    FROM roles r
    LEFT JOIN (
      SELECT role, COUNT(*)::int AS n FROM staff_users GROUP BY role
    ) sc ON sc.role = r.name
    ORDER BY r.is_system DESC, r.created_at ASC;
  `);

  const permRows = await getPool().query(`
    SELECT role_id AS "roleId", module_id AS "moduleId",
      can_view AS "canView", can_edit AS "canEdit", can_approve AS "canApprove", can_delete AS "canDelete"
    FROM role_permissions;
  `);

  const permsByRole = new Map<string, Record<string, ModulePermissionSet>>();
  for (const row of permRows.rows) {
    if (!permsByRole.has(row.roleId)) permsByRole.set(row.roleId, {});
    permsByRole.get(row.roleId)![row.moduleId] = toPermissionSet(row);
  }

  return roles.rows.map((r) => ({
    id: r.id,
    name: r.name,
    description: r.description,
    isSystem: r.isSystem,
    staffCount: r.staffCount,
    permissions: fillMissingModules(permsByRole.get(r.id) ?? {}),
  }));
}

function fillMissingModules(perms: Record<string, ModulePermissionSet>): Record<string, ModulePermissionSet> {
  const filled = { ...perms };
  for (const m of MODULES) {
    if (!filled[m.id]) filled[m.id] = emptyPermissions();
  }
  return filled;
}

export async function findRole(id: string): Promise<Role | null> {
  const roles = await listRoles();
  return roles.find((r) => r.id === id) ?? null;
}

export async function createRole(input: {
  name: string;
  description?: string;
  permissions?: Record<string, Partial<ModulePermissionSet>>;
}): Promise<Role> {
  await ensureTables();

  const client = await getPool().connect();
  try {
    await client.query("BEGIN");

    const roleRes = await client.query(
      `INSERT INTO roles (name, description, is_system) VALUES ($1, $2, false) RETURNING id;`,
      [input.name.trim(), input.description?.trim() || ""],
    );
    const roleId = roleRes.rows[0].id;

    for (const moduleDef of MODULES) {
      const perm = { ...emptyPermissions(), ...(input.permissions?.[moduleDef.id] ?? {}) };
      await client.query(
        `INSERT INTO role_permissions (role_id, module_id, can_view, can_edit, can_approve, can_delete)
         VALUES ($1, $2, $3, $4, $5, $6);`,
        [roleId, moduleDef.id, perm.view, perm.edit, perm.approve, perm.delete],
      );
    }

    await client.query("COMMIT");
    return (await findRole(roleId))!;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function updateRole(
  id: string,
  patch: { name?: string; description?: string; permissions?: Record<string, Partial<ModulePermissionSet>> },
): Promise<Role | null> {
  await ensureTables();

  const current = await findRole(id);
  if (!current) return null;

  // The system role's own permissions are fixed. Renaming/re-describing it is
  // still fine -- it's specifically the matrix that must never lock everyone out.
  if (current.isSystem && patch.permissions) {
    throw new Error("Permission Admin Master tidak dapat diubah -- ini mencegah semua admin terkunci dari Hak Akses.");
  }

  const client = await getPool().connect();
  try {
    await client.query("BEGIN");

    if (patch.name !== undefined || patch.description !== undefined) {
      const sets: string[] = [];
      const values: unknown[] = [];
      const push = (col: string, v: unknown) => {
        values.push(v);
        sets.push(`${col} = $${values.length}`);
      };
      if (patch.name !== undefined) push("name", patch.name.trim());
      if (patch.description !== undefined) push("description", patch.description.trim());
      sets.push("updated_at = NOW()");
      values.push(id);

      // Renaming a role in use means every staff_users.role referencing the
      // old text has to move with it, or those staff silently lose all access.
      if (patch.name !== undefined && patch.name.trim() !== current.name) {
        await client.query(`UPDATE staff_users SET role = $1 WHERE role = $2;`, [patch.name.trim(), current.name]);
      }

      await client.query(`UPDATE roles SET ${sets.join(", ")} WHERE id = $${values.length};`, values);
    }

    if (patch.permissions) {
      for (const [moduleId, partial] of Object.entries(patch.permissions)) {
        const perm = { ...emptyPermissions(), ...current.permissions[moduleId], ...partial };
        await client.query(
          `UPDATE role_permissions SET can_view = $1, can_edit = $2, can_approve = $3, can_delete = $4
           WHERE role_id = $5 AND module_id = $6;`,
          [perm.view, perm.edit, perm.approve, perm.delete, id, moduleId],
        );
      }
    }

    await client.query("COMMIT");
    return await findRole(id);
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function deleteRole(id: string): Promise<{ ok: true } | { ok: false; reason: string }> {
  const role = await findRole(id);
  if (!role) return { ok: false, reason: "Role tidak ditemukan" };
  if (role.isSystem) return { ok: false, reason: "Role Admin Master tidak dapat dihapus" };
  if (role.staffCount > 0) {
    return { ok: false, reason: `Masih dipakai ${role.staffCount} staf -- pindahkan role mereka dulu sebelum menghapus` };
  }

  await getPool().query(`DELETE FROM roles WHERE id = $1;`, [id]);
  return { ok: true };
}

/**
 * The hot path called from proxy.ts on every gated API request: one query
 * for whether the account is active and, if moduleId is a real module,
 * whether its role can perform the action on it. moduleId is null for
 * routes that only need an active session (see resolveModuleForPath).
 */
export async function getStaffAuthForModule(
  staffId: string,
  moduleId: string | null,
): Promise<{ active: boolean; role: string | null; name: string | null; permissions: ModulePermissionSet | null }> {
  await ensureTables();

  const res = await getPool().query(
    `
    SELECT
      su.status, su.role, su.name,
      rp.can_view AS "canView", rp.can_edit AS "canEdit",
      rp.can_approve AS "canApprove", rp.can_delete AS "canDelete"
    FROM staff_users su
    LEFT JOIN roles r ON r.name = su.role
    LEFT JOIN role_permissions rp ON rp.role_id = r.id AND rp.module_id = $2
    WHERE su.id = $1
    LIMIT 1;
    `,
    [staffId, moduleId ?? "__none__"],
  );

  const row = res.rows[0];
  if (!row) return { active: false, role: null, name: null, permissions: null };

  const active = row.status === "Aktif";
  if (moduleId === null) return { active, role: row.role, name: row.name, permissions: null };

  // No matching role or no permission row for this module -- fail closed,
  // not "everything allowed".
  if (row.canView === null) return { active, role: row.role, name: row.name, permissions: emptyPermissions() };

  return { active, role: row.role, name: row.name, permissions: toPermissionSet(row) };
}

/**
 * Modul yang boleh DILIHAT seorang staf, sekali query.
 *
 * getStaffAuthForModule di atas menjawab satu modul per panggilan, karena
 * proxy.ts memang hanya perlu memeriksa modul dari route yang sedang diminta.
 * Pusat notifikasi kebalikannya: ia memotong banyak modul sekaligus dan harus
 * membuang peringatan yang tidak boleh dibaca staf tersebut -- kalau tidak,
 * staf yang cuma dikasih akses Pelanggan akan tetap membaca nominal tagihan
 * dan nomor paspor lewat bel notifikasi.
 *
 * Mengembalikan himpunan kosong untuk akun nonaktif atau role tanpa izin apa
 * pun, jadi pemanggilnya gagal tertutup tanpa perlu memeriksa status lagi.
 */
export async function getStaffViewableModules(staffId: string): Promise<Set<string>> {
  await ensureTables();

  const res = await getPool().query(
    `
    SELECT rp.module_id AS "moduleId"
    FROM staff_users su
    JOIN roles r ON r.name = su.role
    JOIN role_permissions rp ON rp.role_id = r.id
    WHERE su.id = $1 AND su.status = 'Aktif' AND rp.can_view = TRUE;
    `,
    [staffId],
  );

  return new Set<string>(res.rows.map((row) => row.moduleId));
}
