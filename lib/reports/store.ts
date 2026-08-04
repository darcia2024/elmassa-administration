import { getPool } from "@/lib/db/connection";

/**
 * Read-only report aggregations. Deliberately computed from real_bookings /
 * invoices / payments on every request instead of a separate reports table --
 * HANDOFF.md is explicit that laporan should derive from that data, not own
 * a copy of it that can drift.
 */

export type ReceivableRow = {
  bookingCode: string;
  customer: string;
  packageName: string;
  departureDate: string;
  total: number;
  paid: number;
  remaining: number;
  dueDate: string | null;
  ageDays: number;
  status: string;
  priority: "Tinggi" | "Normal";
  phone: string;
};

const RECEIVABLES_QUERY = `
  SELECT
    b.code AS "bookingCode",
    b.customer_name AS "customer",
    b.package_name AS "packageName",
    b.departure AS "departureDate",
    b.total_amount AS "total",
    b.paid_amount AS "paid",
    b.remaining_amount AS "remaining",
    b.phone,
    b.status,
    TO_CHAR(b.created_at, 'YYYY-MM-DD') AS "createdDate",
    TO_CHAR(i.due_date, 'YYYY-MM-DD') AS "dueDate"
  FROM real_bookings b
  LEFT JOIN invoices i ON i.booking_code = b.code
  WHERE b.remaining_amount > 0
  ORDER BY b.created_at DESC;
`;

export async function listReceivables(): Promise<ReceivableRow[]> {
  const res = await getPool().query(RECEIVABLES_QUERY);
  const today = new Date().toISOString().slice(0, 10);

  return res.rows.map((row) => {
    const ageDays = Math.max(
      Math.floor((Date.parse(today) - Date.parse(row.createdDate)) / (1000 * 60 * 60 * 24)),
      0,
    );
    const overdue = row.dueDate ? row.dueDate < today : false;
    const priority: "Tinggi" | "Normal" = overdue || ageDays > 14 ? "Tinggi" : "Normal";

    return {
      bookingCode: row.bookingCode,
      customer: row.customer,
      packageName: row.packageName,
      departureDate: row.departureDate || "-",
      total: Number(row.total),
      paid: Number(row.paid),
      remaining: Number(row.remaining),
      dueDate: row.dueDate,
      ageDays,
      status: row.status,
      priority,
      phone: row.phone || "",
    };
  });
}

export type IncomeRow = {
  bookingCode: string;
  customer: string;
  packageName: string;
  date: string;
  total: number;
  paid: number;
  status: "Final / Lunas" | "DP / Parsial" | "Belum Bayar";
};

const INCOME_QUERY = `
  SELECT
    code AS "bookingCode",
    customer_name AS "customer",
    package_name AS "packageName",
    TO_CHAR(created_at, 'YYYY-MM-DD') AS "date",
    total_amount AS "total",
    paid_amount AS "paid",
    status
  FROM real_bookings
  ORDER BY created_at DESC;
`;

function resolveIncomeStatus(status: string): IncomeRow["status"] {
  if (status === "Lunas") return "Final / Lunas";
  if (status === "DP") return "DP / Parsial";
  return "Belum Bayar";
}

export async function listIncome(): Promise<IncomeRow[]> {
  const res = await getPool().query(INCOME_QUERY);
  return res.rows.map((row) => ({
    bookingCode: row.bookingCode,
    customer: row.customer,
    packageName: row.packageName,
    date: row.date,
    total: Number(row.total),
    paid: Number(row.paid),
    status: resolveIncomeStatus(row.status),
  }));
}
