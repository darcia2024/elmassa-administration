import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/lib/db/connection";

/**
 * This route used to read/write lib/seed-data/packages.ts -- a dummy array
 * with a completely different shape (serviceType/basePrice/durationDays) from
 * the real published_packages table the list route (/api/packages) actually
 * uses, and nothing in the app ever called it. Rewritten to operate on the
 * real table so the Seat page has a lightweight way to update just the seat
 * quota without resending the whole package through the POST upsert route.
 */

type PackageDetailRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

const SELECT_COLUMNS = `
  id, name, category, duration,
  departures_date as "departuresDate",
  departure_date as "departureDate",
  return_date as "returnDate",
  price, numeric_price as "numericPrice", dp_minimum as "dpMinimum",
  makkah_hotel as "makkahHotel", madinah_hotel as "madinahHotel",
  airline, target_pax as "targetPax", featured
`;

export async function GET(_: NextRequest, { params }: PackageDetailRouteProps) {
  const { id } = await params;
  const res = await getPool().query(`SELECT ${SELECT_COLUMNS} FROM published_packages WHERE id = $1 LIMIT 1;`, [id]);

  if (res.rowCount === 0) {
    return NextResponse.json({ error: "Paket tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json({ data: res.rows[0] });
}

export async function PATCH(request: NextRequest, { params }: PackageDetailRouteProps) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));

  const sets: string[] = [];
  const values: unknown[] = [];
  const push = (column: string, value: unknown) => {
    values.push(value);
    sets.push(`${column} = $${values.length}`);
  };

  if (body.targetPax !== undefined) {
    const targetPax = Number(body.targetPax);
    if (!Number.isFinite(targetPax) || targetPax < 1) {
      return NextResponse.json(
        { error: "Kuota tidak valid", fields: { targetPax: "Kuota seat minimal 1" } },
        { status: 400 },
      );
    }
    push("target_pax", targetPax);
  }
  if (body.featured !== undefined) push("featured", Boolean(body.featured));

  if (sets.length === 0) {
    return NextResponse.json({ error: "Tidak ada field yang diubah" }, { status: 400 });
  }

  values.push(id);
  const res = await getPool().query(
    `UPDATE published_packages SET ${sets.join(", ")} WHERE id = $${values.length} RETURNING ${SELECT_COLUMNS};`,
    values,
  );

  if (res.rowCount === 0) {
    return NextResponse.json({ error: "Paket tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json({ data: res.rows[0] });
}

export async function DELETE(_: NextRequest, { params }: PackageDetailRouteProps) {
  const { id } = await params;
  const res = await getPool().query(`DELETE FROM published_packages WHERE id = $1;`, [id]);

  if (res.rowCount === 0) {
    return NextResponse.json({ error: "Paket tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json({ data: { id, deleted: true } });
}
