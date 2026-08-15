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
  airline, target_pax as "targetPax", featured,
  domestic_airline as "domesticAirline",
  international_airline as "internationalAirline",
  flight_route as "flightRoute",
  start_point as "startPoint",
  program_umrah as "programUmrah",
  itinerary, includes, excludes,
  poster_img as "posterImg",
  banner_img as "bannerImg",
  costing_data as "costingData"
`;

/**
 * Only the shape the Itinerary editor writes back is accepted, so a malformed
 * payload can't land in the JSONB column and break every page that renders it
 * (the catalogue modal, the Live App itinerary, and the group detail page all
 * read this same array).
 */
function normaliseItinerary(raw: unknown): { days: unknown[] } | { error: string } {
  if (!Array.isArray(raw)) return { error: "Itinerary harus berupa daftar hari" };

  const days: unknown[] = [];
  for (let i = 0; i < raw.length; i += 1) {
    const day = raw[i] as Record<string, unknown>;
    if (!day || typeof day !== "object") return { error: `Hari ke-${i + 1} tidak valid` };

    const title = String(day.title ?? "").trim();
    if (!title) return { error: `Judul hari ke-${i + 1} wajib diisi` };

    const activities = Array.isArray(day.activities) ? day.activities : [];
    days.push({
      day: Number(day.day) || i + 1,
      date: String(day.date ?? ""),
      title,
      location: String(day.location ?? ""),
      highlight: String(day.highlight ?? "travel"),
      activities: activities
        .map((a) => {
          const act = a as Record<string, unknown>;
          return {
            time: String(act?.time ?? "").trim(),
            description: String(act?.description ?? "").trim(),
          };
        })
        .filter((a) => a.description !== ""),
    });
  }

  return { days };
}

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

  // Flyer tab: cover art + the headline meta printed on it.
  if (body.name !== undefined) {
    const name = String(body.name).trim();
    if (!name) {
      return NextResponse.json(
        { error: "Nama grup wajib diisi", fields: { name: "Nama tidak boleh kosong" } },
        { status: 400 },
      );
    }
    push("name", name);
  }
  if (body.posterImg !== undefined) push("poster_img", String(body.posterImg));
  if (body.bannerImg !== undefined) push("banner_img", String(body.bannerImg));
  if (body.category !== undefined) push("category", String(body.category));
  if (body.duration !== undefined) push("duration", String(body.duration));
  if (body.departuresDate !== undefined) push("departures_date", String(body.departuresDate));
  if (body.airline !== undefined) push("airline", String(body.airline));
  if (body.makkahHotel !== undefined) push("makkah_hotel", String(body.makkahHotel));
  if (body.madinahHotel !== undefined) push("madinah_hotel", String(body.madinahHotel));
  if (body.dpMinimum !== undefined) push("dp_minimum", String(body.dpMinimum));

  if (body.price !== undefined) push("price", String(body.price));
  if (body.numericPrice !== undefined) {
    const numericPrice = Number(body.numericPrice);
    if (!Number.isFinite(numericPrice) || numericPrice < 0) {
      return NextResponse.json(
        { error: "Harga tidak valid", fields: { numericPrice: "Harga harus angka >= 0" } },
        { status: 400 },
      );
    }
    push("numeric_price", numericPrice);
  }

  // Itinerary tab.
  if (body.itinerary !== undefined) {
    const parsed = normaliseItinerary(body.itinerary);
    if ("error" in parsed) {
      return NextResponse.json({ error: parsed.error, fields: { itinerary: parsed.error } }, { status: 400 });
    }
    push("itinerary", JSON.stringify(parsed.days));
  }

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
