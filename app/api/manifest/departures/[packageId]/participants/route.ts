import { NextResponse } from "next/server";
import { getPool } from "@/lib/db/connection";
import { listParticipants } from "@/lib/participants/store";

type RouteProps = {
  params: Promise<{
    packageId: string;
  }>;
};

export async function GET(_: Request, { params }: RouteProps) {
  const { packageId } = await params;
  const decodedId = decodeURIComponent(packageId);

  const pkg = await getPool().query(
    `SELECT id, name, departure_date AS "departureDate", return_date AS "returnDate", target_pax AS "targetPax"
     FROM published_packages WHERE id = $1 LIMIT 1;`,
    [decodedId],
  );

  if (pkg.rowCount === 0) {
    return NextResponse.json({ error: "Paket keberangkatan tidak ditemukan" }, { status: 404 });
  }

  const participants = await listParticipants({ packageId: decodedId });
  const completed = participants.filter((p) => p.documentStatus === "Lengkap").length;

  return NextResponse.json(
    {
      data: participants,
      meta: {
        total: participants.length,
        departure: {
          ...pkg.rows[0],
          bookedSeats: participants.length,
          remainingSeats: Math.max(pkg.rows[0].targetPax - participants.length, 0),
        },
        documentSummary: {
          completed,
          pending: participants.length - completed,
          total: participants.length,
        },
      },
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
