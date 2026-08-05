import { NextResponse } from "next/server";
import { getPool } from "@/lib/db/connection";

/**
 * One row per published package -- that's the real unit of "departure" in
 * this data model (see target_pax on published_packages, and how /paket/seat
 * already matches bookings to a package this same way). Replaces the old
 * dummy version of this route, which read lib/seed-data schedules that no
 * booking has ever actually pointed at.
 */
export async function GET() {
  const res = await getPool().query(`
    SELECT
      pp.id,
      pp.name,
      pp.departure_date AS "departureDate",
      pp.return_date AS "returnDate",
      pp.airline,
      pp.target_pax AS "targetPax",
      COALESCE(bk.booking_count, 0)::int AS "bookingCount",
      COALESCE(bk.participant_count, 0)::int AS "bookedSeats",
      COALESCE(doc.total, 0)::int AS "manifestCount",
      COALESCE(doc.completed, 0)::int AS "documentsCompleted"
    FROM published_packages pp
    LEFT JOIN (
      SELECT package_id, COUNT(*)::int AS booking_count, COALESCE(SUM(participants), 0)::int AS participant_count
      FROM real_bookings
      WHERE package_id IS NOT NULL AND package_id != ''
      GROUP BY package_id
    ) bk ON bk.package_id = pp.id
    LEFT JOIN (
      SELECT b.package_id, COUNT(*)::int AS total, COUNT(*) FILTER (WHERE p.document_status = 'Lengkap')::int AS completed
      FROM participants p
      JOIN real_bookings b ON b.code = p.booking_code
      WHERE b.package_id IS NOT NULL AND b.package_id != ''
      GROUP BY b.package_id
    ) doc ON doc.package_id = pp.id
    ORDER BY pp.departure_date ASC NULLS LAST;
  `);

  return NextResponse.json(
    { data: res.rows },
    { headers: { "Cache-Control": "no-store" } },
  );
}
