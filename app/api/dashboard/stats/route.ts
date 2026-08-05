import { NextResponse } from "next/server";
import { getPool } from "@/lib/db/connection";

/**
 * Aggregated dashboard numbers, computed here rather than fetched client-side
 * from /api/payments or /api/reports/* on purpose: those are gated behind the
 * `pembayaran`/`laporan` role permissions, but every seeded role can view the
 * dashboard. A summary endpoint gated only by `dash` lets a Sales or Lapangan
 * account see the top-line numbers without also granting them raw access to
 * payment records.
 */
export async function GET() {
  const pool = getPool();

  const [packages, customers, bookings, revenue, revenueLast7Days] = await Promise.all([
    pool.query(`SELECT COUNT(*)::int AS "count", COALESCE(SUM(target_pax), 0)::int AS "totalQuota" FROM published_packages;`),
    pool.query(`SELECT COUNT(*)::int AS "count", COUNT(*) FILTER (WHERE status = 'Aktif')::int AS "activeCount" FROM customers;`),
    pool.query(`
      SELECT
        COUNT(*)::int AS "count",
        COUNT(*) FILTER (WHERE status != 'Lunas' AND status NOT IN ('Dibatalkan', 'Refund'))::int AS "needsFollowUp",
        COALESCE(SUM(participants), 0)::int AS "totalBookedSeats",
        COUNT(*) FILTER (WHERE umrah_me_status ILIKE 'Aktif%')::int AS "umrahMeActiveCount"
      FROM real_bookings;
    `),
    pool.query(`SELECT COALESCE(SUM(amount), 0)::bigint AS "total", COUNT(*)::int AS "count" FROM payments;`),
    pool.query(`
      SELECT TO_CHAR(payment_date, 'YYYY-MM-DD') AS "day", SUM(amount)::bigint AS "total"
      FROM payments
      WHERE payment_date >= CURRENT_DATE - INTERVAL '6 days'
      GROUP BY 1
      ORDER BY 1;
    `),
  ]);

  const recentBookings = await pool.query(`
    SELECT
      code, customer_name AS "customer", package_name AS "packageName",
      departure, status, total_amount AS "totalAmount", paid_amount AS "paidAmount",
      participants, umrah_me_status AS "umrahMeStatus", phone
    FROM real_bookings
    ORDER BY created_at DESC
    LIMIT 8;
  `);

  const upcomingDepartures = await pool.query(`
    SELECT
      pp.id, pp.name, pp.departure_date AS "departureDate", pp.airline, pp.target_pax AS "targetPax",
      COALESCE(b.booked, 0)::int AS "bookedSeats"
    FROM published_packages pp
    LEFT JOIN (
      SELECT package_id, SUM(participants)::int AS booked
      FROM real_bookings
      WHERE package_id IS NOT NULL AND package_id != ''
      GROUP BY package_id
    ) b ON b.package_id = pp.id
    ORDER BY pp.departure_date ASC NULLS LAST
    LIMIT 6;
  `);

  const revenueByDay = new Map(revenueLast7Days.rows.map((r) => [r.day, Number(r.total)]));
  const dayLabels = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  const revenueBars = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const iso = date.toISOString().slice(0, 10);
    const amount = revenueByDay.get(iso) ?? 0;
    return { day: dayLabels[date.getDay()], date: iso, amount };
  });
  const maxDayAmount = Math.max(...revenueBars.map((b) => b.amount), 1);

  return NextResponse.json(
    {
      data: {
        packageCount: packages.rows[0].count,
        totalSeatQuota: packages.rows[0].totalQuota,
        customerCount: customers.rows[0].count,
        activeCustomerCount: customers.rows[0].activeCount,
        bookingCount: bookings.rows[0].count,
        bookingsNeedingFollowUp: bookings.rows[0].needsFollowUp,
        totalBookedSeats: bookings.rows[0].totalBookedSeats,
        umrahMeActiveBookingCount: bookings.rows[0].umrahMeActiveCount,
        totalRevenue: Number(revenue.rows[0].total),
        paymentCount: revenue.rows[0].count,
        revenueBars: revenueBars.map((b) => ({
          day: b.day,
          amount: b.amount,
          height: Math.max(10, Math.round((b.amount / maxDayAmount) * 100)),
          active: b.amount > 0,
        })),
        recentBookings: recentBookings.rows,
        upcomingDepartures: upcomingDepartures.rows,
      },
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
