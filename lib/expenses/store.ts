import { getPool } from "@/lib/db/connection";

/**
 * Pengeluaran, stored in `expenses` — the half of "pemasukan & pengeluaran"
 * that had no representation anywhere in the system before.
 *
 * Pemasukan is NOT stored here: it is summed from `payments`, the same rows
 * Kasir/Kuitansi/Laporan already read, so cash in can never disagree with the
 * receipts that back it.
 */

export const EXPENSE_CATEGORIES = [
  "Operasional Kantor",
  "Tiket & Transportasi",
  "Hotel & Akomodasi",
  "Visa & Dokumen",
  "Perlengkapan Jamaah",
  "Gaji & Fee",
  "Marketing",
  "Lainnya",
] as const;

export type ExpenseRecord = {
  id: string;
  date: string;
  category: string;
  description: string;
  amount: number;
  method: string;
  referenceNumber: string;
  packageId: string;
  packageName: string;
  recordedBy: string;
  notes: string;
  createdAt: string;
};

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const SELECT_COLUMNS = `
  e.id,
  TO_CHAR(e.expense_date, 'YYYY-MM-DD') AS "date",
  e.category,
  e.description,
  e.amount,
  e.method,
  e.reference_number AS "referenceNumber",
  e.package_id       AS "packageId",
  COALESCE(pp.name, '') AS "packageName",
  e.recorded_by      AS "recordedBy",
  e.notes,
  e.created_at       AS "createdAt"
`;

const FROM_CLAUSE = `FROM expenses e LEFT JOIN published_packages pp ON pp.id = e.package_id`;

function toRecord(row: Record<string, unknown>): ExpenseRecord {
  return { ...(row as unknown as ExpenseRecord), amount: Number(row.amount) };
}

export async function listExpenses(filter?: { from?: string; to?: string; category?: string }): Promise<ExpenseRecord[]> {
  const conditions: string[] = [];
  const values: unknown[] = [];

  if (filter?.from) {
    values.push(filter.from);
    conditions.push(`e.expense_date >= $${values.length}`);
  }
  if (filter?.to) {
    values.push(filter.to);
    conditions.push(`e.expense_date <= $${values.length}`);
  }
  if (filter?.category) {
    values.push(filter.category);
    conditions.push(`e.category = $${values.length}`);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const res = await getPool().query(
    `SELECT ${SELECT_COLUMNS} ${FROM_CLAUSE} ${where} ORDER BY e.expense_date DESC, e.created_at DESC;`,
    values,
  );
  return res.rows.map(toRecord);
}

export async function findExpense(id: string): Promise<ExpenseRecord | null> {
  if (!UUID_PATTERN.test(id)) return null;
  const res = await getPool().query(`SELECT ${SELECT_COLUMNS} ${FROM_CLAUSE} WHERE e.id = $1 LIMIT 1;`, [id]);
  return res.rows[0] ? toRecord(res.rows[0]) : null;
}

export async function createExpense(input: {
  date: string;
  category: string;
  description: string;
  amount: number;
  method?: string;
  referenceNumber?: string;
  packageId?: string;
  recordedBy?: string;
  notes?: string;
}): Promise<ExpenseRecord> {
  const res = await getPool().query(
    `INSERT INTO expenses (expense_date, category, description, amount, method, reference_number, package_id, recorded_by, notes)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id;`,
    [
      input.date,
      input.category,
      input.description.trim(),
      input.amount,
      (input.method ?? "Transfer").trim(),
      (input.referenceNumber ?? "").trim(),
      (input.packageId ?? "").trim(),
      (input.recordedBy ?? "").trim(),
      (input.notes ?? "").trim(),
    ],
  );
  return (await findExpense(res.rows[0].id))!;
}

export async function updateExpense(
  id: string,
  patch: {
    date?: string;
    category?: string;
    description?: string;
    amount?: number;
    method?: string;
    referenceNumber?: string;
    packageId?: string;
    notes?: string;
  },
): Promise<ExpenseRecord | null> {
  if (!UUID_PATTERN.test(id)) return null;

  const sets: string[] = [];
  const values: unknown[] = [];
  const push = (column: string, value: unknown) => {
    values.push(value);
    sets.push(`${column} = $${values.length}`);
  };

  if (patch.date !== undefined) push("expense_date", patch.date);
  if (patch.category !== undefined) push("category", patch.category);
  if (patch.description !== undefined) push("description", patch.description.trim());
  if (patch.amount !== undefined) push("amount", patch.amount);
  if (patch.method !== undefined) push("method", patch.method.trim());
  if (patch.referenceNumber !== undefined) push("reference_number", patch.referenceNumber.trim());
  if (patch.packageId !== undefined) push("package_id", patch.packageId.trim());
  if (patch.notes !== undefined) push("notes", patch.notes.trim());

  if (sets.length === 0) return findExpense(id);

  sets.push("updated_at = NOW()");
  values.push(id);

  const res = await getPool().query(`UPDATE expenses SET ${sets.join(", ")} WHERE id = $${values.length};`, values);
  if (res.rowCount === 0) return null;
  return findExpense(id);
}

export async function deleteExpense(id: string): Promise<boolean> {
  if (!UUID_PATTERN.test(id)) return false;
  const res = await getPool().query(`DELETE FROM expenses WHERE id = $1;`, [id]);
  return (res.rowCount ?? 0) > 0;
}

export type CashflowMonth = {
  month: string;
  pemasukan: number;
  pengeluaran: number;
  selisih: number;
};

export type CashflowSummary = {
  totalPemasukan: number;
  totalPengeluaran: number;
  selisih: number;
  months: CashflowMonth[];
  byCategory: Array<{ category: string; total: number }>;
};

/**
 * Cash in comes from `payments` (verified money actually received), cash out
 * from `expenses`. Both are bucketed by month so the two series line up.
 */
export async function getCashflowSummary(): Promise<CashflowSummary> {
  const pool = getPool();

  const [income, outgo, categories] = await Promise.all([
    pool.query(`
      SELECT TO_CHAR(payment_date, 'YYYY-MM') AS month, COALESCE(SUM(amount), 0) AS total
      FROM payments GROUP BY 1 ORDER BY 1;
    `),
    pool.query(`
      SELECT TO_CHAR(expense_date, 'YYYY-MM') AS month, COALESCE(SUM(amount), 0) AS total
      FROM expenses GROUP BY 1 ORDER BY 1;
    `),
    pool.query(`
      SELECT category, COALESCE(SUM(amount), 0) AS total
      FROM expenses GROUP BY 1 ORDER BY 2 DESC;
    `),
  ]);

  const buckets = new Map<string, CashflowMonth>();
  const bucket = (month: string) => {
    const existing = buckets.get(month) ?? { month, pemasukan: 0, pengeluaran: 0, selisih: 0 };
    buckets.set(month, existing);
    return existing;
  };

  for (const row of income.rows) bucket(row.month).pemasukan = Number(row.total);
  for (const row of outgo.rows) bucket(row.month).pengeluaran = Number(row.total);

  const months = Array.from(buckets.values())
    .map((m) => ({ ...m, selisih: m.pemasukan - m.pengeluaran }))
    .sort((a, b) => a.month.localeCompare(b.month));

  const totalPemasukan = months.reduce((sum, m) => sum + m.pemasukan, 0);
  const totalPengeluaran = months.reduce((sum, m) => sum + m.pengeluaran, 0);

  return {
    totalPemasukan,
    totalPengeluaran,
    selisih: totalPemasukan - totalPengeluaran,
    months,
    byCategory: categories.rows.map((r) => ({ category: r.category, total: Number(r.total) })),
  };
}
