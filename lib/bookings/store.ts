import { getPool } from "@/lib/db/connection";

/**
 * Bookings, stored in `real_bookings`.
 *
 * Supabase is the source of truth. The pages keep a localStorage copy purely so
 * a list can paint before the network answers — never as the record itself.
 */

export type BookingRecord = {
  code: string;
  customerName: string;
  customer: string;
  phone: string;
  nik: string;
  packageId: string;
  packageName: string;
  departure: string;
  roomType: string;
  participants: number;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: string;
  umrahMeStatus: string;
  createdAt: string;
};

const SELECT_COLUMNS = `
  code,
  customer_name as "customerName",
  customer_name as "customer",
  phone,
  nik,
  package_id as "packageId",
  package_name as "packageName",
  departure,
  room_type as "roomType",
  participants,
  total_amount as "totalAmount",
  paid_amount as "paidAmount",
  remaining_amount as "remainingAmount",
  status,
  umrah_me_status as "umrahMeStatus",
  created_at as "createdAt"
`;

export async function listBookings(): Promise<BookingRecord[]> {
  const res = await getPool().query(
    `SELECT ${SELECT_COLUMNS} FROM real_bookings ORDER BY created_at DESC;`,
  );
  return res.rows;
}

export async function findBookingByCode(code: string): Promise<BookingRecord | null> {
  const res = await getPool().query(
    `SELECT ${SELECT_COLUMNS} FROM real_bookings WHERE code = $1 LIMIT 1;`,
    [code],
  );
  return res.rows[0] ?? null;
}

/**
 * A customer's booking history — matched by phone, the same join key
 * lib/customers/store.ts uses, since there is no direct customer_id FK.
 */
export async function listBookingsByPhone(phone: string): Promise<BookingRecord[]> {
  const res = await getPool().query(
    `SELECT ${SELECT_COLUMNS} FROM real_bookings WHERE phone = $1 ORDER BY created_at DESC;`,
    [phone],
  );
  return res.rows;
}

/**
 * Payment status is derived from the amounts rather than trusted from the
 * caller, so a booking can never claim "Lunas" while money is still owed.
 */
export function derivePaymentStatus(totalAmount: number, paidAmount: number): string {
  if (paidAmount <= 0) return "Belum Bayar";
  if (paidAmount >= totalAmount) return "Lunas";
  return "DP";
}

export async function updateBookingByCode(
  code: string,
  patch: {
    customerName?: string;
    phone?: string;
    nik?: string;
    packageName?: string;
    departure?: string;
    roomType?: string;
    participants?: number;
    totalAmount?: number;
    status?: string;
    umrahMeStatus?: string;
  },
): Promise<BookingRecord | null> {
  const current = await findBookingByCode(code);
  if (!current) return null;

  const sets: string[] = [];
  const values: unknown[] = [];
  const push = (column: string, value: unknown) => {
    values.push(value);
    sets.push(`${column} = $${values.length}`);
  };

  if (patch.customerName !== undefined) push("customer_name", patch.customerName);
  if (patch.phone !== undefined) push("phone", patch.phone);
  if (patch.nik !== undefined) push("nik", patch.nik);
  if (patch.packageName !== undefined) push("package_name", patch.packageName);
  if (patch.departure !== undefined) push("departure", patch.departure);
  if (patch.roomType !== undefined) push("room_type", patch.roomType);
  if (patch.participants !== undefined) push("participants", Number(patch.participants));
  if (patch.umrahMeStatus !== undefined) push("umrah_me_status", patch.umrahMeStatus);

  // paid_amount is deliberately not patchable here — it only ever moves
  // through lib/payments/store.ts (createPayment/updatePayment/deletePayment),
  // so this table can never show money that Pembayaran/Kuitansi/Laporan don't
  // also know about. Changing the package price still recomputes what's left.
  const total = patch.totalAmount === undefined ? current.totalAmount : Number(patch.totalAmount);
  const paid = current.paidAmount;

  if (patch.totalAmount !== undefined) {
    push("total_amount", total);
    push("remaining_amount", Math.max(0, total - paid));
  }

  // "Dibatalkan" / "Refund" are set by staff and must survive the derivation.
  if (patch.status !== undefined) {
    push("status", patch.status);
  } else if (patch.totalAmount !== undefined) {
    push("status", derivePaymentStatus(total, paid));
  }

  if (sets.length === 0) return current;

  values.push(code);
  await getPool().query(
    `UPDATE real_bookings SET ${sets.join(", ")} WHERE code = $${values.length};`,
    values,
  );

  return findBookingByCode(code);
}

export async function deleteBookingByCode(code: string): Promise<boolean> {
  const res = await getPool().query(`DELETE FROM real_bookings WHERE code = $1;`, [code]);
  return (res.rowCount ?? 0) > 0;
}
