import { getPool } from "@/lib/db/connection";

/**
 * Receipts (kuitansi) are created atomically alongside their payment in
 * lib/payments/store.ts — this module only reads them back for the
 * kuitansi list/print page and the PDF download.
 */

export type ReceiptDetail = {
  receipt: {
    id: string;
    number: string;
    date: string;
    receivedFrom: string;
    amount: number;
    amountWords: string;
    paymentFor: string;
    paymentMethod: string;
    staff: string;
    status: string;
  };
  payment: {
    id: string;
    bookingCode: string;
    customerName: string;
    customerPhone: string;
    packageName: string;
  };
};

const DETAIL_QUERY = `
  SELECT
    r.id AS "receiptId",
    r.receipt_number AS "receiptNumber",
    TO_CHAR(r.issued_date, 'YYYY-MM-DD') AS "issuedDate",
    r.received_from AS "receivedFrom",
    r.amount,
    r.amount_words AS "amountWords",
    r.payment_for AS "paymentFor",
    r.status,
    r.issued_by AS "issuedBy",
    p.id AS "paymentId",
    p.booking_code AS "bookingCode",
    p.method,
    b.customer_name AS "customerName",
    b.phone AS "customerPhone",
    b.package_name AS "packageName"
  FROM receipts r
  JOIN payments p ON p.id = r.payment_id
  JOIN real_bookings b ON b.code = p.booking_code
`;

function toReceiptDetail(row: any): ReceiptDetail {
  return {
    receipt: {
      id: row.receiptId,
      number: row.receiptNumber,
      date: row.issuedDate,
      receivedFrom: row.receivedFrom,
      amount: Number(row.amount),
      amountWords: row.amountWords,
      paymentFor: row.paymentFor,
      paymentMethod: row.method,
      staff: row.issuedBy,
      status: row.status,
    },
    payment: {
      id: row.paymentId,
      bookingCode: row.bookingCode,
      customerName: row.customerName,
      customerPhone: row.customerPhone,
      packageName: row.packageName,
    },
  };
}

export async function listReceiptDetails(): Promise<ReceiptDetail[]> {
  const res = await getPool().query(`${DETAIL_QUERY} ORDER BY r.issued_date DESC, r.created_at DESC;`);
  return res.rows.map(toReceiptDetail);
}

/** Looks up by receipt number, receipt id, or the payment id it belongs to. */
export async function findReceiptDetail(idOrReceiptNumber: string): Promise<ReceiptDetail | null> {
  const res = await getPool().query(
    `${DETAIL_QUERY} WHERE r.receipt_number = $1 OR r.id::text = $1 OR p.id::text = $1 LIMIT 1;`,
    [idOrReceiptNumber],
  );
  return res.rows[0] ? toReceiptDetail(res.rows[0]) : null;
}
