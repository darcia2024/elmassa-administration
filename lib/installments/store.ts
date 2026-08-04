import { getPool } from "@/lib/db/connection";

/**
 * Installment (cicilan) records, stored in the `installments` table the
 * Drizzle migrations already created. `booking_code` points at
 * `real_bookings.code` (see lib/db/schema.ts), same as payments/invoices.
 *
 * `paid_amount` here is a plan-level running total kept in sync by
 * markInstallmentPaid — it does not touch real_bookings.paid_amount. Actually
 * settling money still goes through lib/payments/store.ts; an installment is
 * the schedule/expectation, a payment is the money that arrived.
 */

export type InstallmentRecord = {
  id: string;
  bookingCode: string;
  customer: string;
  packageName: string;
  sequence: number;
  label: string;
  dueDate: string;
  amount: number;
  paidAmount: number;
  status: string;
  notes: string;
};

const allowedStatuses = ["Terjadwal", "Jatuh Tempo", "Lunas", "Dibatalkan"] as const;

const LIST_QUERY = `
  SELECT
    i.id,
    i.booking_code AS "bookingCode",
    b.customer_name AS "customer",
    b.package_name AS "packageName",
    i.sequence,
    i.label,
    TO_CHAR(i.due_date, 'YYYY-MM-DD') AS "dueDate",
    i.amount,
    i.paid_amount AS "paidAmount",
    i.status,
    i.notes
  FROM installments i
  JOIN real_bookings b ON b.code = i.booking_code
`;

export function isAllowedInstallmentStatus(status: string) {
  return (allowedStatuses as readonly string[]).includes(status);
}

export function listAllowedInstallmentStatuses() {
  return [...allowedStatuses];
}

export async function listInstallments(): Promise<InstallmentRecord[]> {
  const res = await getPool().query(`${LIST_QUERY} ORDER BY i.due_date ASC;`);
  return res.rows;
}

export async function findInstallment(id: string): Promise<InstallmentRecord | null> {
  const res = await getPool().query(`${LIST_QUERY} WHERE i.id = $1 LIMIT 1;`, [id]);
  return res.rows[0] ?? null;
}

export async function createInstallment(input: {
  bookingCode: string;
  sequence: number;
  label?: string;
  dueDate: string;
  amount: number;
  notes?: string;
}): Promise<InstallmentRecord> {
  const booking = await getPool().query(`SELECT 1 FROM real_bookings WHERE code = $1 LIMIT 1;`, [input.bookingCode]);
  if (booking.rowCount === 0) {
    throw new Error(`Booking ${input.bookingCode} tidak ditemukan`);
  }

  const res = await getPool().query(
    `INSERT INTO installments (booking_code, sequence, label, due_date, amount, notes)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id;`,
    [input.bookingCode, input.sequence, input.label || "", input.dueDate, input.amount, input.notes || ""],
  );

  return (await findInstallment(res.rows[0].id))!;
}

export async function updateInstallment(
  id: string,
  patch: {
    sequence?: number;
    label?: string;
    dueDate?: string;
    amount?: number;
    paidAmount?: number;
    status?: string;
    notes?: string;
  },
): Promise<InstallmentRecord | null> {
  const sets: string[] = [];
  const values: unknown[] = [];
  const push = (column: string, value: unknown) => {
    values.push(value);
    sets.push(`${column} = $${values.length}`);
  };

  if (patch.sequence !== undefined) push("sequence", patch.sequence);
  if (patch.label !== undefined) push("label", patch.label);
  if (patch.dueDate !== undefined) push("due_date", patch.dueDate);
  if (patch.amount !== undefined) push("amount", patch.amount);
  if (patch.paidAmount !== undefined) push("paid_amount", patch.paidAmount);
  if (patch.status !== undefined) push("status", patch.status);
  if (patch.notes !== undefined) push("notes", patch.notes);

  if (sets.length === 0) return findInstallment(id);

  sets.push("updated_at = NOW()");
  values.push(id);

  const res = await getPool().query(
    `UPDATE installments SET ${sets.join(", ")} WHERE id = $${values.length} RETURNING id;`,
    values,
  );

  if (res.rowCount === 0) return null;
  return findInstallment(res.rows[0].id);
}

export async function deleteInstallment(id: string): Promise<boolean> {
  const res = await getPool().query(`DELETE FROM installments WHERE id = $1;`, [id]);
  return (res.rowCount ?? 0) > 0;
}

/**
 * Marks an installment paid in full and stamps its paid_amount to match —
 * separate from updateInstallment so the "mark paid" action can't silently
 * leave amount and paid_amount disagreeing.
 */
export async function markInstallmentPaid(id: string): Promise<InstallmentRecord | null> {
  const existing = await findInstallment(id);
  if (!existing) return null;

  return updateInstallment(id, { status: "Lunas", paidAmount: existing.amount });
}
