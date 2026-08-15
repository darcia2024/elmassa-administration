import { getPool } from "@/lib/db/connection";

/**
 * Kalender Kegiatan is two things stitched together:
 *
 *  - DERIVED events, computed from published_packages + real_bookings on every
 *    read (keberangkatan, kepulangan, batas pelunasan H-14). These are never
 *    stored, so they cannot go stale when a departure date or a payment moves.
 *  - MANUAL events in `agenda_events` (manasik, briefing, handling, …), which
 *    have no other source anywhere in the system.
 *
 * Only manual events are editable; derived ones are read-only by construction
 * and carry the id of the thing they came from.
 */

export const AGENDA_CATEGORIES = ["Keberangkatan", "Kepulangan", "Pelunasan", "Manasik", "Handling", "Lainnya"] as const;
export type AgendaCategory = (typeof AGENDA_CATEGORIES)[number];

/** What staff may create by hand — the derived three are excluded on purpose. */
export const MANUAL_CATEGORIES: AgendaCategory[] = ["Manasik", "Handling", "Lainnya"];

/** Days before departure that the settlement deadline falls on. */
export const PELUNASAN_LEAD_DAYS = 14;

export type AgendaEvent = {
  id: string;
  source: "manual" | "derived";
  packageId: string;
  packageName: string;
  title: string;
  category: AgendaCategory;
  date: string;
  time: string;
  location: string;
  notes: string;
  editable: boolean;
};

function shiftDays(isoDate: string, days: number): string {
  const parsed = new Date(`${isoDate}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return isoDate;
  parsed.setUTCDate(parsed.getUTCDate() + days);
  return parsed.toISOString().slice(0, 10);
}

// Every column is table-qualified: both queries below join published_packages,
// which also has id/name/category, so bare column names are ambiguous there.
const MANUAL_SELECT = `
  ae.id,
  ae.package_id AS "packageId",
  ae.title,
  ae.category,
  TO_CHAR(ae.event_date, 'YYYY-MM-DD') AS "date",
  ae.event_time AS "time",
  ae.location,
  ae.notes
`;

export async function listAgendaEvents(): Promise<AgendaEvent[]> {
  const pool = getPool();

  const [packages, manual] = await Promise.all([
    pool.query(`
      SELECT
        pp.id,
        pp.name,
        pp.departure_date AS "departureDate",
        pp.return_date    AS "returnDate",
        pp.airline,
        pp.start_point    AS "startPoint",
        pp.makkah_hotel   AS "makkahHotel",
        COALESCE(bk.unpaid, 0)::int      AS "unpaidBookings",
        COALESCE(bk.outstanding, 0)::numeric AS "outstanding"
      FROM published_packages pp
      LEFT JOIN (
        SELECT package_id,
               COUNT(*) FILTER (WHERE remaining_amount > 0)::int AS unpaid,
               COALESCE(SUM(remaining_amount), 0) AS outstanding
        FROM real_bookings
        WHERE package_id IS NOT NULL AND package_id != ''
        GROUP BY package_id
      ) bk ON bk.package_id = pp.id;
    `),
    pool.query(`
      SELECT ${MANUAL_SELECT},
             COALESCE(pp.name, '') AS "packageName"
      FROM agenda_events ae
      LEFT JOIN published_packages pp ON pp.id = ae.package_id
      ORDER BY ae.event_date ASC, ae.event_time ASC;
    `),
  ]);

  const events: AgendaEvent[] = [];

  for (const pkg of packages.rows) {
    const base = { packageId: pkg.id, packageName: pkg.name, notes: "", editable: false, source: "derived" as const };

    if (pkg.departureDate) {
      events.push({
        ...base,
        id: `${pkg.id}::berangkat`,
        title: `Keberangkatan — ${pkg.name}`,
        category: "Keberangkatan",
        date: pkg.departureDate,
        time: "",
        location: pkg.startPoint || "",
      });

      // Only worth flagging while somebody still owes money on this group.
      if (pkg.unpaidBookings > 0) {
        events.push({
          ...base,
          id: `${pkg.id}::pelunasan`,
          title: `Batas Pelunasan H-${PELUNASAN_LEAD_DAYS} — ${pkg.name}`,
          category: "Pelunasan",
          date: shiftDays(pkg.departureDate, -PELUNASAN_LEAD_DAYS),
          time: "",
          location: "",
          notes: `${pkg.unpaidBookings} jamaah belum lunas · sisa Rp ${Number(pkg.outstanding).toLocaleString("id-ID")}`,
        });
      }
    }

    if (pkg.returnDate) {
      events.push({
        ...base,
        id: `${pkg.id}::pulang`,
        title: `Kepulangan — ${pkg.name}`,
        category: "Kepulangan",
        date: pkg.returnDate,
        time: "",
        location: pkg.startPoint || "",
      });
    }
  }

  for (const row of manual.rows) {
    events.push({
      id: row.id,
      source: "manual",
      packageId: row.packageId || "",
      packageName: row.packageName || "",
      title: row.title,
      category: (AGENDA_CATEGORIES as readonly string[]).includes(row.category)
        ? (row.category as AgendaCategory)
        : "Lainnya",
      date: row.date,
      time: row.time || "",
      location: row.location || "",
      notes: row.notes || "",
      editable: true,
    });
  }

  return events.sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
}

/**
 * `agenda_events.id` is a uuid column, so Postgres raises 22P02 on anything
 * that isn't one -- including the `<packageId>::<kind>` ids the derived events
 * carry. Unguarded that surfaced as a 500 with the raw driver message; a
 * lookup for an id that cannot exist is a miss, not a server fault.
 */
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isStorableId(id: string): boolean {
  return UUID_PATTERN.test(id);
}

async function findManualEvent(id: string): Promise<AgendaEvent | null> {
  if (!isStorableId(id)) return null;

  const res = await getPool().query(
    `SELECT ${MANUAL_SELECT}, COALESCE(pp.name, '') AS "packageName"
       FROM agenda_events ae
       LEFT JOIN published_packages pp ON pp.id = ae.package_id
      WHERE ae.id = $1 LIMIT 1;`,
    [id],
  );
  const row = res.rows[0];
  if (!row) return null;

  return {
    id: row.id,
    source: "manual",
    packageId: row.packageId || "",
    packageName: row.packageName || "",
    title: row.title,
    category: row.category as AgendaCategory,
    date: row.date,
    time: row.time || "",
    location: row.location || "",
    notes: row.notes || "",
    editable: true,
  };
}

export async function createAgendaEvent(input: {
  title: string;
  category: string;
  date: string;
  time?: string;
  location?: string;
  notes?: string;
  packageId?: string;
  createdBy?: string;
}): Promise<AgendaEvent> {
  const res = await getPool().query(
    `INSERT INTO agenda_events (package_id, title, category, event_date, event_time, location, notes, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id;`,
    [
      input.packageId || "",
      input.title.trim(),
      input.category,
      input.date,
      (input.time || "").trim(),
      (input.location || "").trim(),
      (input.notes || "").trim(),
      (input.createdBy || "").trim(),
    ],
  );

  return (await findManualEvent(res.rows[0].id))!;
}

export async function updateAgendaEvent(
  id: string,
  patch: {
    title?: string;
    category?: string;
    date?: string;
    time?: string;
    location?: string;
    notes?: string;
    packageId?: string;
  },
): Promise<AgendaEvent | null> {
  if (!isStorableId(id)) return null;

  const sets: string[] = [];
  const values: unknown[] = [];
  const push = (column: string, value: unknown) => {
    values.push(value);
    sets.push(`${column} = $${values.length}`);
  };

  if (patch.title !== undefined) push("title", patch.title.trim());
  if (patch.category !== undefined) push("category", patch.category);
  if (patch.date !== undefined) push("event_date", patch.date);
  if (patch.time !== undefined) push("event_time", patch.time.trim());
  if (patch.location !== undefined) push("location", patch.location.trim());
  if (patch.notes !== undefined) push("notes", patch.notes.trim());
  if (patch.packageId !== undefined) push("package_id", patch.packageId);

  if (sets.length === 0) return findManualEvent(id);

  sets.push("updated_at = NOW()");
  values.push(id);

  const res = await getPool().query(
    `UPDATE agenda_events SET ${sets.join(", ")} WHERE id = $${values.length} RETURNING id;`,
    values,
  );

  if (res.rowCount === 0) return null;
  return findManualEvent(id);
}

export async function deleteAgendaEvent(id: string): Promise<boolean> {
  if (!isStorableId(id)) return false;

  const res = await getPool().query(`DELETE FROM agenda_events WHERE id = $1;`, [id]);
  return (res.rowCount ?? 0) > 0;
}
