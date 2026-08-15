import { getPool } from "@/lib/db/connection";

/**
 * Per-jamaah manifest records, stored in `participants`. `booking_code` points
 * at `real_bookings.code` (see lib/db/schema.ts), ON DELETE CASCADE.
 *
 * Name/passport/contact arrive from the booking form at booking time (see
 * createParticipantsForBooking below). visa/ticket/room fields are realistically
 * only known after booking, so they start empty and get filled in later here
 * through Manifest.
 */

export type ParticipantRecord = {
  id: string;
  bookingCode: string;
  customerName: string;
  packageId: string;
  packageName: string;
  departure: string;
  name: string;
  passportNumber: string;
  contact: string;
  documentStatus: string;
  visaNumber: string;
  visaExpiry: string | null;
  ticketNumber: string;
  roomType: string;
  jakartaRoomType: string;
  jakartaRoomNo: string;
  makkahRoomType: string;
  makkahRoomNo: string;
  madinahRoomType: string;
  madinahRoomNo: string;
  createdAt: string;
  updatedAt: string;
};

/**
 * The three roomlists a group actually needs: the Jakarta transit hotel before
 * the international leg, then Makkah and Madinah. Kept as separate columns
 * rather than one `room_type` because a jamaah is regularly Quad in one city
 * and Triple in another, and the hotel needs the room number too.
 */
export const ROOMLIST_CITIES = ["jakarta", "makkah", "madinah"] as const;
export type RoomlistCity = (typeof ROOMLIST_CITIES)[number];

const LIST_QUERY = `
  SELECT
    p.id,
    p.booking_code AS "bookingCode",
    b.customer_name AS "customerName",
    b.package_id AS "packageId",
    b.package_name AS "packageName",
    b.departure,
    p.name,
    p.passport_number AS "passportNumber",
    p.contact,
    p.document_status AS "documentStatus",
    p.visa_number AS "visaNumber",
    TO_CHAR(p.visa_expiry, 'YYYY-MM-DD') AS "visaExpiry",
    p.ticket_number AS "ticketNumber",
    p.room_type AS "roomType",
    p.jakarta_room_type AS "jakartaRoomType",
    p.jakarta_room_no AS "jakartaRoomNo",
    p.makkah_room_type AS "makkahRoomType",
    p.makkah_room_no AS "makkahRoomNo",
    p.madinah_room_type AS "madinahRoomType",
    p.madinah_room_no AS "madinahRoomNo",
    p.created_at AS "createdAt",
    p.updated_at AS "updatedAt"
  FROM participants p
  JOIN real_bookings b ON b.code = p.booking_code
`;

export async function listParticipants(filter?: { bookingCode?: string; packageId?: string; phone?: string }): Promise<ParticipantRecord[]> {
  const conditions: string[] = [];
  const values: unknown[] = [];

  if (filter?.bookingCode) {
    values.push(filter.bookingCode);
    conditions.push(`p.booking_code = $${values.length}`);
  }
  if (filter?.packageId) {
    values.push(filter.packageId);
    conditions.push(`b.package_id = $${values.length}`);
  }
  if (filter?.phone) {
    values.push(filter.phone);
    conditions.push(`b.phone = $${values.length}`);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const res = await getPool().query(`${LIST_QUERY} ${where} ORDER BY p.created_at ASC;`, values);
  return res.rows;
}

export async function findParticipant(id: string): Promise<ParticipantRecord | null> {
  const res = await getPool().query(`${LIST_QUERY} WHERE p.id = $1 LIMIT 1;`, [id]);
  return res.rows[0] ?? null;
}

/**
 * Called right after a booking is created, with the participantsList array the
 * booking form already sends. Without this the form's per-jamaah name/passport/
 * contact input was captured and then silently thrown away -- Manifest had no
 * per-person data to show no matter how many bookings came in.
 */
export async function createParticipantsForBooking(
  bookingCode: string,
  participants: unknown,
): Promise<void> {
  if (!Array.isArray(participants) || participants.length === 0) return;

  const pool = getPool();
  for (const raw of participants) {
    const p = raw as Record<string, unknown>;
    const name = String(p?.name ?? "").trim();
    if (!name) continue;

    await pool.query(
      `INSERT INTO participants (booking_code, name, passport_number, contact, document_status, room_type)
       VALUES ($1, $2, $3, $4, $5, $6);`,
      [
        bookingCode,
        name,
        String(p?.passport ?? "").trim(),
        String(p?.contact ?? "").trim(),
        String(p?.documentStatus ?? "").trim() || "Belum Lengkap",
        String(p?.roomType ?? "").trim(),
      ],
    );
  }
}

export async function updateParticipant(
  id: string,
  patch: {
    name?: string;
    passportNumber?: string;
    contact?: string;
    documentStatus?: string;
    visaNumber?: string;
    visaExpiry?: string | null;
    ticketNumber?: string;
    roomType?: string;
    jakartaRoomType?: string;
    jakartaRoomNo?: string;
    makkahRoomType?: string;
    makkahRoomNo?: string;
    madinahRoomType?: string;
    madinahRoomNo?: string;
  },
): Promise<ParticipantRecord | null> {
  const sets: string[] = [];
  const values: unknown[] = [];
  const push = (column: string, value: unknown) => {
    values.push(value);
    sets.push(`${column} = $${values.length}`);
  };

  if (patch.name !== undefined) push("name", patch.name.trim());
  if (patch.passportNumber !== undefined) push("passport_number", patch.passportNumber.trim());
  if (patch.contact !== undefined) push("contact", patch.contact.trim());
  if (patch.documentStatus !== undefined) push("document_status", patch.documentStatus);
  if (patch.visaNumber !== undefined) push("visa_number", patch.visaNumber.trim());
  if (patch.visaExpiry !== undefined) push("visa_expiry", patch.visaExpiry || null);
  if (patch.ticketNumber !== undefined) push("ticket_number", patch.ticketNumber.trim());
  if (patch.roomType !== undefined) push("room_type", patch.roomType.trim());
  if (patch.jakartaRoomType !== undefined) push("jakarta_room_type", patch.jakartaRoomType.trim());
  if (patch.jakartaRoomNo !== undefined) push("jakarta_room_no", patch.jakartaRoomNo.trim());
  if (patch.makkahRoomType !== undefined) push("makkah_room_type", patch.makkahRoomType.trim());
  if (patch.makkahRoomNo !== undefined) push("makkah_room_no", patch.makkahRoomNo.trim());
  if (patch.madinahRoomType !== undefined) push("madinah_room_type", patch.madinahRoomType.trim());
  if (patch.madinahRoomNo !== undefined) push("madinah_room_no", patch.madinahRoomNo.trim());

  if (sets.length === 0) return findParticipant(id);

  sets.push("updated_at = NOW()");
  values.push(id);

  const res = await getPool().query(
    `UPDATE participants SET ${sets.join(", ")} WHERE id = $${values.length} RETURNING id;`,
    values,
  );

  if (res.rowCount === 0) return null;
  return findParticipant(id);
}
