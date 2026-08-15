import { getPool } from "@/lib/db/connection";

/**
 * Agen / mitra perekrut jamaah, stored in `agents`.
 *
 * Recruitment counts are NOT stored on the agent row — they are counted from
 * `real_bookings` whose `agent_code` matches, so an agent's numbers can never
 * be a stale copy of the bookings they came from.
 */

export const COMMISSION_TYPES = ["nominal", "persen"] as const;
export const AGENT_STATUSES = ["Aktif", "Nonaktif"] as const;

export type AgentRecord = {
  id: string;
  agentCode: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  commissionType: string;
  commissionValue: number;
  bankName: string;
  bankAccount: string;
  status: string;
  notes: string;
  bookingCount: number;
  jamaahCount: number;
  grossValue: number;
  estimatedCommission: number;
  createdAt: string;
};

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const SELECT_COLUMNS = `
  a.id,
  a.agent_code       AS "agentCode",
  a.name,
  a.phone,
  a.email,
  a.address,
  a.city,
  a.commission_type  AS "commissionType",
  a.commission_value AS "commissionValue",
  a.bank_name        AS "bankName",
  a.bank_account     AS "bankAccount",
  a.status,
  a.notes,
  a.created_at       AS "createdAt",
  COALESCE(bk.booking_count, 0)::int   AS "bookingCount",
  COALESCE(bk.jamaah_count, 0)::int    AS "jamaahCount",
  COALESCE(bk.gross_value, 0)::numeric AS "grossValue"
`;

/**
 * `agent_code` on real_bookings is added by scratch/add-admin-ops-tables.mjs's
 * companion migration; when a booking has no agent the LEFT JOIN simply yields
 * zeros rather than dropping the agent from the list.
 */
const FROM_CLAUSE = `
  FROM agents a
  LEFT JOIN (
    SELECT agent_code,
           COUNT(*)::int AS booking_count,
           COALESCE(SUM(participants), 0)::int AS jamaah_count,
           COALESCE(SUM(total_amount), 0) AS gross_value
    FROM real_bookings
    WHERE agent_code IS NOT NULL AND agent_code != ''
    GROUP BY agent_code
  ) bk ON bk.agent_code = a.agent_code
`;

function toRecord(row: Record<string, unknown>): AgentRecord {
  const commissionValue = Number(row.commissionValue);
  const grossValue = Number(row.grossValue);
  const jamaahCount = Number(row.jamaahCount);

  // Nominal commissions are per jamaah; percentage ones apply to gross value.
  const estimatedCommission =
    row.commissionType === "persen"
      ? Math.round((grossValue * commissionValue) / 100)
      : Math.round(commissionValue * jamaahCount);

  return {
    ...(row as unknown as AgentRecord),
    commissionValue,
    grossValue,
    jamaahCount,
    bookingCount: Number(row.bookingCount),
    estimatedCommission,
  };
}

export async function listAgents(): Promise<AgentRecord[]> {
  const res = await getPool().query(`SELECT ${SELECT_COLUMNS} ${FROM_CLAUSE} ORDER BY a.name ASC;`);
  return res.rows.map(toRecord);
}

export async function findAgent(id: string): Promise<AgentRecord | null> {
  if (!UUID_PATTERN.test(id)) return null;
  const res = await getPool().query(`SELECT ${SELECT_COLUMNS} ${FROM_CLAUSE} WHERE a.id = $1 LIMIT 1;`, [id]);
  return res.rows[0] ? toRecord(res.rows[0]) : null;
}

export async function createAgent(input: {
  name: string;
  agentCode?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  commissionType?: string;
  commissionValue?: number;
  bankName?: string;
  bankAccount?: string;
  status?: string;
  notes?: string;
}): Promise<AgentRecord> {
  const res = await getPool().query(
    `INSERT INTO agents (
       agent_code, name, phone, email, address, city,
       commission_type, commission_value, bank_name, bank_account, status, notes
     ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING id;`,
    [
      (input.agentCode ?? "").trim(),
      input.name.trim(),
      (input.phone ?? "").trim(),
      (input.email ?? "").trim(),
      (input.address ?? "").trim(),
      (input.city ?? "").trim(),
      input.commissionType ?? "nominal",
      Number(input.commissionValue) || 0,
      (input.bankName ?? "").trim(),
      (input.bankAccount ?? "").trim(),
      input.status ?? "Aktif",
      (input.notes ?? "").trim(),
    ],
  );
  return (await findAgent(res.rows[0].id))!;
}

export async function updateAgent(
  id: string,
  patch: Partial<Omit<AgentRecord, "id" | "createdAt" | "bookingCount" | "jamaahCount" | "grossValue" | "estimatedCommission">>,
): Promise<AgentRecord | null> {
  if (!UUID_PATTERN.test(id)) return null;

  const sets: string[] = [];
  const values: unknown[] = [];
  const push = (column: string, value: unknown) => {
    values.push(value);
    sets.push(`${column} = $${values.length}`);
  };

  if (patch.agentCode !== undefined) push("agent_code", patch.agentCode.trim());
  if (patch.name !== undefined) push("name", patch.name.trim());
  if (patch.phone !== undefined) push("phone", patch.phone.trim());
  if (patch.email !== undefined) push("email", patch.email.trim());
  if (patch.address !== undefined) push("address", patch.address.trim());
  if (patch.city !== undefined) push("city", patch.city.trim());
  if (patch.commissionType !== undefined) push("commission_type", patch.commissionType);
  if (patch.commissionValue !== undefined) push("commission_value", Number(patch.commissionValue) || 0);
  if (patch.bankName !== undefined) push("bank_name", patch.bankName.trim());
  if (patch.bankAccount !== undefined) push("bank_account", patch.bankAccount.trim());
  if (patch.status !== undefined) push("status", patch.status);
  if (patch.notes !== undefined) push("notes", patch.notes.trim());

  if (sets.length === 0) return findAgent(id);

  sets.push("updated_at = NOW()");
  values.push(id);

  const res = await getPool().query(`UPDATE agents SET ${sets.join(", ")} WHERE id = $${values.length};`, values);
  if (res.rowCount === 0) return null;
  return findAgent(id);
}

export async function deleteAgent(id: string): Promise<boolean> {
  if (!UUID_PATTERN.test(id)) return false;
  const res = await getPool().query(`DELETE FROM agents WHERE id = $1;`, [id]);
  return (res.rowCount ?? 0) > 0;
}
