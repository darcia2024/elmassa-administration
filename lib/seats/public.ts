import { getPool } from "@/lib/db/connection";

/**
 * Seat availability per published package, safe to expose publicly: counts
 * only, no names, phone numbers or booking codes. Feeds the public katalog
 * site (darcia2024/elmassa-katalog) so its "sisa seat" follows real bookings.
 *
 * Same model as Jadwal Keberangkatan > Update Seat (app/paket/seat): quota is
 * the package's target_pax, filled is the sum of participants across its
 * bookings. Bookings marked Dibatalkan/Refund no longer hold a seat.
 */
export type PublicSeatRow = {
  packageId: string;
  name: string;
  departureDate: string;
  returnDate: string;
  quota: number;
  booked: number;
  remaining: number;
};

const RELEASED_STATUSES = new Set(["Dibatalkan", "Refund"]);

function cleanName(name: string) {
  return name.split("—")[0].split("(")[0].trim().toLowerCase();
}

export async function listPublicSeatAvailability(): Promise<PublicSeatRow[]> {
  const pool = getPool();
  const [pkgRes, bookingRes] = await Promise.all([
    pool.query(
      `SELECT id,
              name,
              COALESCE(departure_date, '') AS "departureDate",
              COALESCE(return_date, '') AS "returnDate",
              target_pax AS "targetPax"
       FROM published_packages
       ORDER BY departure_date ASC NULLS LAST;`,
    ),
    pool.query(
      `SELECT COALESCE(package_id, '') AS "packageId",
              COALESCE(package_name, '') AS "packageName",
              participants,
              status
       FROM real_bookings;`,
    ),
  ]);

  const bookings = bookingRes.rows.filter((b) => !RELEASED_STATUSES.has(String(b.status ?? "")));

  return pkgRes.rows.map((pkg) => {
    const pkgName = cleanName(String(pkg.name ?? ""));
    const booked = bookings
      .filter((b) => {
        if (b.packageId) return b.packageId === pkg.id;
        // Bookings from before package ids were stored: same fuzzy name match
        // the Update Seat page uses, so both screens agree on the count.
        const bName = cleanName(String(b.packageName ?? ""));
        return Boolean(bName && pkgName) && (bName.includes(pkgName) || pkgName.includes(bName));
      })
      .reduce((sum, b) => sum + (Number(b.participants) || 1), 0);

    const quota = Number(pkg.targetPax) || 45;
    return {
      packageId: String(pkg.id),
      name: String(pkg.name ?? ""),
      departureDate: String(pkg.departureDate ?? ""),
      returnDate: String(pkg.returnDate ?? ""),
      quota,
      booked,
      remaining: Math.max(0, quota - booked),
    };
  });
}
