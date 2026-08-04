import { getPool } from "@/lib/db/connection";

/**
 * Invoices, stored in the `invoices` table the Drizzle migrations already
 * created. `booking_code` points at `real_bookings.code` (see
 * lib/db/schema.ts), same as payments/installments.
 *
 * `paid` / `remaining` / `status` are never read from the stored
 * `invoices.paid_amount` column -- they're computed live from
 * real_bookings.paid_amount, the same single source of truth payments
 * already keep correct. Storing a second paid-amount here would just be
 * another number that can drift from reality.
 *
 * One invoice per booking is assumed (matches the old behaviour: generating
 * again returns the existing invoice unless forceNew is passed).
 */

export type InvoiceDetail = {
  id: string;
  number: string;
  bookingCode: string;
  customer: string;
  phone: string;
  address: string;
  packageName: string;
  participants: number;
  issueDate: string;
  dueDate: string;
  subtotal: number;
  discountAmount: number;
  total: number;
  paid: number;
  remaining: number;
  status: "Lunas" | "Sebagian" | "Belum Bayar";
  notes: string;
};

const DETAIL_QUERY = `
  SELECT
    i.id,
    i.invoice_number AS "number",
    i.booking_code AS "bookingCode",
    b.customer_name AS "customer",
    b.phone,
    COALESCE(c.address, '') AS address,
    b.package_name AS "packageName",
    b.participants,
    TO_CHAR(i.issue_date, 'YYYY-MM-DD') AS "issueDate",
    TO_CHAR(i.due_date, 'YYYY-MM-DD') AS "dueDate",
    i.subtotal,
    i.discount_amount AS "discountAmount",
    i.total_amount AS "total",
    b.paid_amount AS "paid",
    b.remaining_amount AS "remaining",
    b.status AS "bookingStatus",
    i.notes
  FROM invoices i
  JOIN real_bookings b ON b.code = i.booking_code
  LEFT JOIN customers c ON c.phone = b.phone
`;

function resolveInvoiceStatus(bookingStatus: string): InvoiceDetail["status"] {
  if (bookingStatus === "Lunas") return "Lunas";
  if (bookingStatus === "DP") return "Sebagian";
  return "Belum Bayar";
}

function toInvoiceDetail(row: any): InvoiceDetail {
  return {
    id: row.id,
    number: row.number,
    bookingCode: row.bookingCode,
    customer: row.customer,
    phone: row.phone,
    address: row.address,
    packageName: row.packageName,
    participants: Number(row.participants),
    issueDate: row.issueDate,
    dueDate: row.dueDate,
    subtotal: Number(row.subtotal),
    discountAmount: Number(row.discountAmount),
    total: Number(row.total),
    paid: Number(row.paid),
    remaining: Number(row.remaining),
    status: resolveInvoiceStatus(row.bookingStatus),
    notes: row.notes,
  };
}

export async function listInvoices(): Promise<InvoiceDetail[]> {
  const res = await getPool().query(`${DETAIL_QUERY} ORDER BY i.created_at DESC;`);
  return res.rows.map(toInvoiceDetail);
}

export async function findInvoice(numberOrId: string): Promise<InvoiceDetail | null> {
  const res = await getPool().query(
    `${DETAIL_QUERY} WHERE i.invoice_number = $1 OR i.id::text = $1 LIMIT 1;`,
    [numberOrId],
  );
  return res.rows[0] ? toInvoiceDetail(res.rows[0]) : null;
}

function buildInvoiceNumber(bookingCode: string) {
  return `INV-${bookingCode.replace(/^BK-/, "")}`;
}

export async function generateInvoiceFromBooking(
  bookingCode: string,
  options?: { dueDate?: string; notes?: string; forceNew?: boolean },
): Promise<InvoiceDetail | null> {
  const booking = await getPool().query(
    `SELECT total_amount AS "totalAmount", departure FROM real_bookings WHERE code = $1 LIMIT 1;`,
    [bookingCode],
  );
  if (booking.rowCount === 0) return null;

  if (!options?.forceNew) {
    const existing = await getPool().query(`SELECT id FROM invoices WHERE booking_code = $1 LIMIT 1;`, [bookingCode]);
    if (existing.rowCount && existing.rowCount > 0) {
      return findInvoice(existing.rows[0].id);
    }
  }

  let invoiceNumber = buildInvoiceNumber(bookingCode);
  if (options?.forceNew) {
    const taken = await getPool().query(`SELECT 1 FROM invoices WHERE invoice_number = $1 LIMIT 1;`, [invoiceNumber]);
    if (taken.rowCount && taken.rowCount > 0) {
      const count = await getPool().query(`SELECT count(*)::int AS n FROM invoices WHERE booking_code = $1;`, [bookingCode]);
      invoiceNumber = `${invoiceNumber}-${String(count.rows[0].n + 1).padStart(2, "0")}`;
    }
  }

  const totalAmount = Number(booking.rows[0].totalAmount);
  const issueDate = new Date().toISOString().slice(0, 10);
  const dueDate = options?.dueDate || booking.rows[0].departure || issueDate;

  const res = await getPool().query(
    `INSERT INTO invoices (booking_code, invoice_number, issue_date, due_date, subtotal, discount_amount, total_amount, status, notes)
     VALUES ($1, $2, $3, $4, $5, 0, $5, 'Terbit', $6)
     RETURNING id;`,
    [bookingCode, invoiceNumber, issueDate, dueDate, totalAmount, options?.notes || ""],
  );

  return findInvoice(res.rows[0].id);
}
