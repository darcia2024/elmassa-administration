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

export type GroupPaymentInstallment = {
  id: string;
  label: string;
  date: string;
  amount: number;
  method: string;
  status: string;
  receiptNumber: string | null;
};

export type GroupPaymentRow = {
  bookingCode: string;
  customerName: string;
  phone: string;
  participants: number;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: string;
  isSettled: boolean;
  installments: GroupPaymentInstallment[];
};

/**
 * Labels a booking's payments in the order money actually came in: the first
 * one is the DP, everything after it is cicilan ke-1, ke-2, and so on. A single
 * payment that clears the whole bill is called what it is instead of "DP", so
 * the column can't read "DP Awal" next to a Lunas row.
 */
function labelInstallment(index: number, amount: number, totalAmount: number): string {
  if (index === 0) return amount >= totalAmount && totalAmount > 0 ? "Pelunasan Penuh" : "DP Awal";
  return `Pembayaran ke-${index}`;
}

/**
 * Every jamaah booking in one departure group, each with its own payment
 * timeline. Amounts come straight from `real_bookings`, which lib/payments
 * keeps in step with the `payments` rows on every create/update/delete — so
 * the per-row installments here always add up to the paidAmount beside them.
 */
export async function listGroupPayments(packageId: string): Promise<GroupPaymentRow[]> {
  const bookings = await getPool().query(
    `SELECT
       code AS "bookingCode",
       customer_name AS "customerName",
       phone,
       participants,
       total_amount AS "totalAmount",
       paid_amount AS "paidAmount",
       remaining_amount AS "remainingAmount",
       status
     FROM real_bookings
     WHERE package_id = $1
     ORDER BY created_at ASC;`,
    [packageId],
  );

  if (bookings.rowCount === 0) return [];

  const codes = bookings.rows.map((b) => b.bookingCode);
  const payments = await getPool().query(
    `SELECT
       p.id,
       p.booking_code AS "bookingCode",
       TO_CHAR(p.payment_date, 'YYYY-MM-DD') AS "date",
       p.amount,
       p.method,
       p.status,
       r.receipt_number AS "receiptNumber"
     FROM payments p
     LEFT JOIN receipts r ON r.payment_id = p.id
     WHERE p.booking_code = ANY($1::text[])
     ORDER BY p.payment_date ASC, p.created_at ASC;`,
    [codes],
  );

  const byBooking = new Map<string, typeof payments.rows>();
  for (const row of payments.rows) {
    const list = byBooking.get(row.bookingCode) ?? [];
    list.push(row);
    byBooking.set(row.bookingCode, list);
  }

  return bookings.rows.map((b) => {
    const totalAmount = Number(b.totalAmount);
    const paidAmount = Number(b.paidAmount);
    const remainingAmount = Number(b.remainingAmount);
    const rows = byBooking.get(b.bookingCode) ?? [];

    return {
      bookingCode: b.bookingCode,
      customerName: b.customerName,
      phone: b.phone,
      participants: Number(b.participants),
      totalAmount,
      paidAmount,
      remainingAmount,
      status: b.status,
      isSettled: remainingAmount <= 0 && paidAmount > 0,
      installments: rows.map((p, index) => ({
        id: p.id,
        label: labelInstallment(index, Number(p.amount), totalAmount),
        date: p.date,
        amount: Number(p.amount),
        method: p.method,
        status: p.status,
        receiptNumber: p.receiptNumber,
      })),
    };
  });
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
