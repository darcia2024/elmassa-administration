import { getPool } from "@/lib/db/connection";

/**
 * Customer records, stored in the `customers` table that the Drizzle migrations
 * already created.
 *
 * Booking counts are not stored here — they are derived from real_bookings on
 * read, matched by phone number, so the two can never drift apart.
 */

export type CustomerRecord = {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  type: string;
  status: string;
  groupName: string;
  lastBooking: string;
  totalBookings: number;
};

const DERIVED_QUERY = `
  SELECT
    c.id,
    c.name,
    c.phone,
    COALESCE(c.email, '') AS email,
    c.address,
    c.city,
    c.customer_type AS "type",
    c.status,
    COALESCE(b.group_name, '-') AS "groupName",
    COALESCE(TO_CHAR(b.last_created, 'DD Mon YYYY'), '-') AS "lastBooking",
    COALESCE(b.total, 0) AS "totalBookings"
  FROM customers c
  LEFT JOIN (
    SELECT
      phone,
      COUNT(*)::int AS total,
      MAX(created_at) AS last_created,
      (ARRAY_AGG(package_name ORDER BY created_at DESC))[1] AS group_name
    FROM real_bookings
    GROUP BY phone
  ) b ON b.phone = c.phone
`;

function normalisePhone(phone: string): string {
  return String(phone ?? "").trim();
}

/**
 * A phone number is how a customer is identified (see upsertCustomerFromBooking
 * below) — placeholders like "-" or "0" pass a truthy/non-empty check but are
 * not real numbers, and two different jamaah who both leave the field as "-"
 * would otherwise collapse into one customer record. Digit count is a cheap,
 * good-enough bar; this is not meant to validate real Indonesian numbers.
 */
export function hasEnoughDigitsToBeAPhone(phone: string): boolean {
  return normalisePhone(phone).replace(/\D/g, "").length >= 6;
}

export async function listCustomers(): Promise<CustomerRecord[]> {
  const res = await getPool().query(`${DERIVED_QUERY} ORDER BY c.created_at DESC;`);
  return res.rows;
}

export async function findCustomer(id: string): Promise<CustomerRecord | null> {
  const res = await getPool().query(`${DERIVED_QUERY} WHERE c.id = $1 LIMIT 1;`, [id]);
  return res.rows[0] ?? null;
}

export async function createCustomer(input: {
  name: string;
  phone: string;
  email?: string;
  address?: string;
  city?: string;
  type?: string;
  status?: string;
}): Promise<CustomerRecord> {
  const res = await getPool().query(
    `INSERT INTO customers (name, phone, email, address, city, customer_type, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id;`,
    [
      input.name.trim(),
      normalisePhone(input.phone),
      input.email?.trim() || null,
      input.address?.trim() || "",
      input.city?.trim() || "",
      input.type || "Individu",
      input.status || "Prospek",
    ],
  );

  return (await findCustomer(res.rows[0].id))!;
}

export async function updateCustomer(
  id: string,
  patch: {
    name?: string;
    phone?: string;
    email?: string;
    address?: string;
    city?: string;
    type?: string;
    status?: string;
  },
): Promise<CustomerRecord | null> {
  const sets: string[] = [];
  const values: unknown[] = [];
  const push = (column: string, value: unknown) => {
    values.push(value);
    sets.push(`${column} = $${values.length}`);
  };

  if (patch.name !== undefined) push("name", patch.name.trim());
  if (patch.phone !== undefined) push("phone", normalisePhone(patch.phone));
  if (patch.email !== undefined) push("email", patch.email.trim() || null);
  if (patch.address !== undefined) push("address", patch.address.trim());
  if (patch.city !== undefined) push("city", patch.city.trim());
  if (patch.type !== undefined) push("customer_type", patch.type);
  if (patch.status !== undefined) push("status", patch.status);

  if (sets.length === 0) return findCustomer(id);

  sets.push("updated_at = NOW()");
  values.push(id);

  const res = await getPool().query(
    `UPDATE customers SET ${sets.join(", ")} WHERE id = $${values.length} RETURNING id;`,
    values,
  );

  if (res.rowCount === 0) return null;
  return findCustomer(res.rows[0].id);
}

export async function deleteCustomer(id: string): Promise<boolean> {
  const res = await getPool().query(`DELETE FROM customers WHERE id = $1;`, [id]);
  return (res.rowCount ?? 0) > 0;
}

/**
 * Called whenever a booking is created. Without this the customer list would
 * stay empty no matter how many jamaah register, which is exactly how the page
 * used to look broken.
 *
 * The phone number is the identity: the same person booking a second package
 * updates their record instead of creating a duplicate.
 */
export async function upsertCustomerFromBooking(booking: {
  customerName?: string;
  customer?: string;
  phone?: string;
  city?: string;
}): Promise<void> {
  const name = String(booking.customerName ?? booking.customer ?? "").trim();
  const phone = normalisePhone(booking.phone ?? "");

  // A placeholder phone ("-", "0", "N/A"...) is not an identity two different
  // jamaah can safely share — skip the sync rather than merge them. The
  // booking itself still saves; it just won't have a Pelanggan record yet.
  if (!name || !hasEnoughDigitsToBeAPhone(phone)) return;

  const existing = await getPool().query(`SELECT id FROM customers WHERE phone = $1 LIMIT 1;`, [phone]);

  if (existing.rowCount && existing.rowCount > 0) {
    await getPool().query(
      `UPDATE customers SET name = $1, status = 'Aktif', updated_at = NOW() WHERE id = $2;`,
      [name, existing.rows[0].id],
    );
    return;
  }

  await getPool().query(
    `INSERT INTO customers (name, phone, city, customer_type, status)
     VALUES ($1, $2, $3, 'Individu', 'Aktif');`,
    [name, phone, booking.city?.trim() || ""],
  );
}
