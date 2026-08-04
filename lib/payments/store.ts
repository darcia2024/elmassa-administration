import { getPool } from "@/lib/db/connection";
import { amountToWordsIDR } from "@/lib/terbilang";

/**
 * Payment records, stored in the `payments` table the Drizzle migrations
 * already created. `booking_code` points at `real_bookings.code` (see
 * lib/db/schema.ts) — not the unused Drizzle `bookings` table.
 *
 * Every payment auto-generates a matching `receipts` row (kuitansi) and
 * keeps `real_bookings.paid_amount` / `remaining_amount` / `status` in step,
 * the same invariant `app/api/bookings` PATCH already relies on. Without this
 * a payment could be recorded while the booking still shows "Belum Bayar".
 */

export type PaymentRecord = {
  id: string;
  receiptNumber: string | null;
  bookingCode: string;
  customerName: string;
  packageName: string;
  date: string;
  amount: number;
  method: string;
  referenceNumber: string;
  proofUrl: string;
  status: string;
  receivedBy: string;
  notes: string;
  createdAt: string;
};

const LIST_QUERY = `
  SELECT
    p.id,
    r.receipt_number AS "receiptNumber",
    p.booking_code AS "bookingCode",
    b.customer_name AS "customerName",
    b.package_name AS "packageName",
    TO_CHAR(p.payment_date, 'YYYY-MM-DD') AS "date",
    p.amount,
    p.method,
    p.reference_number AS "referenceNumber",
    p.proof_url AS "proofUrl",
    p.status,
    p.received_by AS "receivedBy",
    p.notes,
    p.created_at AS "createdAt"
  FROM payments p
  JOIN real_bookings b ON b.code = p.booking_code
  LEFT JOIN receipts r ON r.payment_id = p.id
`;

function generateReceiptNumber() {
  return `KW-${Math.floor(100000 + Math.random() * 900000)}`;
}

function resolveBookingStatus(totalAmount: number, paidAmount: number) {
  const remaining = Math.max(totalAmount - paidAmount, 0);
  if (remaining <= 0) return "Lunas";
  if (paidAmount > 0) return "DP";
  return "Belum Bayar";
}

export async function listPayments(): Promise<PaymentRecord[]> {
  const res = await getPool().query(`${LIST_QUERY} ORDER BY p.created_at DESC;`);
  return res.rows;
}

export async function findPayment(id: string): Promise<PaymentRecord | null> {
  const res = await getPool().query(`${LIST_QUERY} WHERE p.id = $1 LIMIT 1;`, [id]);
  return res.rows[0] ?? null;
}

/**
 * Applies `amount` (positive to record money in, negative to reverse it) to
 * the booking's running totals. Kept in one place so create/update/delete all
 * go through the exact same arithmetic.
 */
async function adjustBookingPaidAmount(client: import("pg").PoolClient, bookingCode: string, delta: number) {
  const booking = await client.query(
    `SELECT total_amount AS "totalAmount", paid_amount AS "paidAmount" FROM real_bookings WHERE code = $1 LIMIT 1;`,
    [bookingCode],
  );
  if (booking.rowCount === 0) throw new Error(`Booking ${bookingCode} tidak ditemukan`);

  const totalAmount = Number(booking.rows[0].totalAmount);
  const paidAmount = Math.max(Number(booking.rows[0].paidAmount) + delta, 0);
  const remainingAmount = Math.max(totalAmount - paidAmount, 0);
  const status = resolveBookingStatus(totalAmount, paidAmount);

  await client.query(
    `UPDATE real_bookings SET paid_amount = $1, remaining_amount = $2, status = $3 WHERE code = $4;`,
    [paidAmount, remainingAmount, status, bookingCode],
  );
}

export async function createPayment(input: {
  bookingCode: string;
  date: string;
  amount: number;
  method?: string;
  referenceNumber?: string;
  proofUrl?: string;
  status?: string;
  receivedBy?: string;
  notes?: string;
  paymentFor?: string;
}): Promise<PaymentRecord> {
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");

    const bookingRes = await client.query(
      `SELECT customer_name AS "customerName" FROM real_bookings WHERE code = $1 LIMIT 1;`,
      [input.bookingCode],
    );
    if (bookingRes.rowCount === 0) {
      throw new Error(`Booking ${input.bookingCode} tidak ditemukan`);
    }

    const paymentRes = await client.query(
      `INSERT INTO payments (booking_code, payment_date, amount, method, reference_number, proof_url, status, received_by, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id;`,
      [
        input.bookingCode,
        input.date,
        input.amount,
        input.method || "Transfer",
        input.referenceNumber || "",
        input.proofUrl || "",
        input.status || "Menunggu Cek",
        input.receivedBy || "",
        input.notes || "",
      ],
    );
    const paymentId = paymentRes.rows[0].id;

    await client.query(
      `INSERT INTO receipts (payment_id, receipt_number, issued_date, received_from, amount, amount_words, payment_for, status, issued_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'Terbit', $8);`,
      [
        paymentId,
        generateReceiptNumber(),
        input.date,
        bookingRes.rows[0].customerName,
        input.amount,
        amountToWordsIDR(input.amount),
        input.paymentFor || "Pembayaran booking",
        input.receivedBy || "",
      ],
    );

    await adjustBookingPaidAmount(client, input.bookingCode, input.amount);

    await client.query("COMMIT");
    return (await findPayment(paymentId))!;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function updatePayment(
  id: string,
  patch: {
    date?: string;
    amount?: number;
    method?: string;
    referenceNumber?: string;
    proofUrl?: string;
    status?: string;
    receivedBy?: string;
    notes?: string;
  },
): Promise<PaymentRecord | null> {
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");

    const existing = await client.query(
      `SELECT booking_code AS "bookingCode", amount FROM payments WHERE id = $1 LIMIT 1;`,
      [id],
    );
    if (existing.rowCount === 0) {
      await client.query("ROLLBACK");
      return null;
    }

    const sets: string[] = [];
    const values: unknown[] = [];
    const push = (column: string, value: unknown) => {
      values.push(value);
      sets.push(`${column} = $${values.length}`);
    };

    if (patch.date !== undefined) push("payment_date", patch.date);
    if (patch.amount !== undefined) push("amount", patch.amount);
    if (patch.method !== undefined) push("method", patch.method);
    if (patch.referenceNumber !== undefined) push("reference_number", patch.referenceNumber);
    if (patch.proofUrl !== undefined) push("proof_url", patch.proofUrl);
    if (patch.status !== undefined) push("status", patch.status);
    if (patch.receivedBy !== undefined) push("received_by", patch.receivedBy);
    if (patch.notes !== undefined) push("notes", patch.notes);

    if (sets.length > 0) {
      sets.push("updated_at = NOW()");
      values.push(id);
      await client.query(`UPDATE payments SET ${sets.join(", ")} WHERE id = $${values.length};`, values);
    }

    if (patch.amount !== undefined) {
      const delta = patch.amount - Number(existing.rows[0].amount);
      if (delta !== 0) {
        await adjustBookingPaidAmount(client, existing.rows[0].bookingCode, delta);
      }
    }

    await client.query("COMMIT");
    return await findPayment(id);
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function deletePayment(id: string): Promise<boolean> {
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");

    const existing = await client.query(
      `SELECT booking_code AS "bookingCode", amount FROM payments WHERE id = $1 LIMIT 1;`,
      [id],
    );
    if (existing.rowCount === 0) {
      await client.query("ROLLBACK");
      return false;
    }

    // receipts.payment_id cascades on delete, so the matching kuitansi goes with it.
    await client.query(`DELETE FROM payments WHERE id = $1;`, [id]);
    await adjustBookingPaidAmount(client, existing.rows[0].bookingCode, -Number(existing.rows[0].amount));

    await client.query("COMMIT");
    return true;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
