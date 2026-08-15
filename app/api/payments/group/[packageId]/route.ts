import { NextResponse } from "next/server";
import { listGroupPayments } from "@/lib/payments/store";

/**
 * Payment timeline for every jamaah in one departure group.
 *
 * Deliberately lives under /api/payments rather than /api/packages/<id>/...:
 * lib/auth/modules.ts maps route prefixes to permission modules, so a package-
 * shaped URL would have gated this behind `paket` view -- letting anyone who
 * can browse the catalogue read what every jamaah still owes. Under
 * /api/payments it is gated by `pembayaran`, same as the rest of the money.
 */

type RouteProps = {
  params: Promise<{
    packageId: string;
  }>;
};

export async function GET(_: Request, { params }: RouteProps) {
  const { packageId } = await params;
  const rows = await listGroupPayments(decodeURIComponent(packageId));

  const totalBilled = rows.reduce((sum, r) => sum + r.totalAmount, 0);
  const totalPaid = rows.reduce((sum, r) => sum + r.paidAmount, 0);
  const settled = rows.filter((r) => r.isSettled).length;

  return NextResponse.json(
    {
      data: rows,
      meta: {
        bookings: rows.length,
        jamaah: rows.reduce((sum, r) => sum + r.participants, 0),
        totalBilled,
        totalPaid,
        totalOutstanding: Math.max(totalBilled - totalPaid, 0),
        settled,
        unsettled: rows.length - settled,
      },
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
