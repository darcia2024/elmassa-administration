import { randomUUID } from "crypto";
import { getPool } from "@/lib/db/connection";

export type ScheduleRow = {
  id: string; packageId: string; departureDate: string; returnDate: string;
  price: number; quota: number; meetingPoint: string; status: string;
};

// The legacy schedules table references the retired UUID packages table.
// Published catalogue IDs are text; keep this store tied to the live catalogue.
async function ensureTable() {
  await getPool().query(`CREATE TABLE IF NOT EXISTS published_package_schedules (
    id TEXT PRIMARY KEY, package_id TEXT NOT NULL,
    departure_date DATE NOT NULL, return_date DATE NOT NULL,
    price NUMERIC NOT NULL CHECK (price > 0), quota INTEGER NOT NULL CHECK (quota > 0),
    meeting_point TEXT NOT NULL DEFAULT '', status TEXT NOT NULL DEFAULT 'Terjadwal',
    CHECK (return_date >= departure_date)
  )`);
}

const columns = `id, package_id AS "packageId", TO_CHAR(departure_date, 'YYYY-MM-DD') AS "departureDate",
  TO_CHAR(return_date, 'YYYY-MM-DD') AS "returnDate", price, quota, meeting_point AS "meetingPoint", status`;

export async function packageExists(id: string): Promise<boolean> {
  const result = await getPool().query("SELECT 1 FROM published_packages WHERE id = $1", [id]);
  return result.rows.length > 0;
}

export async function listAllScheduleRows(): Promise<ScheduleRow[]> {
  await ensureTable();
  return (await getPool().query(`SELECT ${columns} FROM published_package_schedules s
    WHERE EXISTS (SELECT 1 FROM published_packages p WHERE p.id = s.package_id)
    ORDER BY departure_date`)).rows;
}
export async function listScheduleRows(packageId: string) {
  return (await listAllScheduleRows()).filter(row => row.packageId === packageId);
}
export async function findScheduleRowById(id: string): Promise<ScheduleRow | null> {
  await ensureTable();
  return (await getPool().query(`SELECT ${columns} FROM published_package_schedules WHERE id = $1`, [id])).rows[0] ?? null;
}
export async function findScheduleRow(packageId: string, id: string) {
  const row = await findScheduleRowById(id);
  return row?.packageId === packageId ? row : null;
}
export async function createScheduleRow(input: Omit<ScheduleRow, "id">): Promise<ScheduleRow> {
  await ensureTable();
  return (await getPool().query(`INSERT INTO published_package_schedules
    (id, package_id, departure_date, return_date, price, quota, meeting_point, status)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING ${columns}`,
    [randomUUID(), input.packageId, input.departureDate, input.returnDate, input.price, input.quota, input.meetingPoint, input.status])).rows[0];
}
export async function updateScheduleRowById(id: string, patch: Partial<Omit<ScheduleRow, "id">>): Promise<ScheduleRow | null> {
  await ensureTable();
  const names = { packageId: "package_id", departureDate: "departure_date", returnDate: "return_date", price: "price", quota: "quota", meetingPoint: "meeting_point", status: "status" };
  const entries = Object.entries(patch).filter(([, value]) => value !== undefined);
  if (!entries.length) return findScheduleRowById(id);
  const sets = entries.map(([key], i) => `${names[key as keyof typeof names]} = $${i + 1}`);
  return (await getPool().query(`UPDATE published_package_schedules SET ${sets.join(", ")}
    WHERE id = $${entries.length + 1} RETURNING ${columns}`, [...entries.map(([, value]) => value), id])).rows[0] ?? null;
}
export async function updateScheduleRow(packageId: string, id: string, patch: Partial<Omit<ScheduleRow, "id" | "packageId">>) {
  if (!await findScheduleRow(packageId, id)) return null;
  return updateScheduleRowById(id, patch);
}
export async function deleteScheduleRowById(id: string) {
  await ensureTable();
  return ((await getPool().query("DELETE FROM published_package_schedules WHERE id = $1", [id])).rowCount ?? 0) > 0;
}
export async function deleteScheduleRow(packageId: string, id: string) {
  await ensureTable();
  return ((await getPool().query("DELETE FROM published_package_schedules WHERE id = $1 AND package_id = $2", [id, packageId])).rowCount ?? 0) > 0;
}
