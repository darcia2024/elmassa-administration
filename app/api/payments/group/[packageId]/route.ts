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
  const totalOutstanding = Math.max(totalBilled - totalPaid, 0);
  const settled = rows.filter((r) => r.isSettled || (r.totalAmount > 0 && r.paidAmount >= r.totalAmount)).length;

  const countLunas = rows.filter((r) => (r.totalAmount > 0 && r.paidAmount >= r.totalAmount) || (r.paidAmount > 0 && r.remainingAmount <= 0)).length;
  const count50 = rows.filter((r) => r.totalAmount > 0 && r.paidAmount >= r.totalAmount * 0.5 && r.paidAmount < r.totalAmount && r.remainingAmount > 0).length;
  const countDp = rows.filter((r) => r.paidAmount > 0 && r.paidAmount < r.totalAmount * 0.5).length;
  const countBelumBayar = rows.filter((r) => r.paidAmount === 0).length;

  const jamaahLunas = rows
    .filter((r) => (r.totalAmount > 0 && r.paidAmount >= r.totalAmount) || (r.paidAmount > 0 && r.remainingAmount <= 0))
    .reduce((sum, r) => sum + r.participants, 0);
  const jamaah50 = rows
    .filter((r) => r.totalAmount > 0 && r.paidAmount >= r.totalAmount * 0.5 && r.paidAmount < r.totalAmount && r.remainingAmount > 0)
    .reduce((sum, r) => sum + r.participants, 0);
  const jamaahDp = rows
    .filter((r) => r.paidAmount > 0 && r.paidAmount < r.totalAmount * 0.5)
    .reduce((sum, r) => sum + r.participants, 0);
  const jamaahBelumBayar = rows
    .filter((r) => r.paidAmount === 0)
    .reduce((sum, r) => sum + r.participants, 0);

  return NextResponse.json(
    {
      data: rows,
      meta: {
        bookings: rows.length,
        jamaah: rows.reduce((sum, r) => sum + r.participants, 0),
        totalBilled,
        totalPaid,
        totalOutstanding,
        settled,
        unsettled: rows.length - settled,
        countLunas,
        count50,
        countDp,
        countBelumBayar,
        jamaahLunas,
        jamaah50,
        jamaahDp,
        jamaahBelumBayar,
      },
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
