import { createHash } from "node:crypto";
import { getPool } from "@/lib/db/connection";
import { todayWIB } from "@/lib/format/date";
import { listPublicSeatAvailability } from "@/lib/seats/public";
import { syncKeberangkatanFromPackage } from "@/lib/umrahme/store";
import seed from "./katalog-seed.json";

/**
 * The public katalog (/poster-katalog) reads the same published_packages rows
 * staff manage in Jadwal Keberangkatan — one source of truth for dates,
 * prices, hotels, itinerary, posters and seats.
 *
 * Posters can be base64 data URLs in the DB (flyer upload). Those are never
 * put into the page: the katalog links to /poster-katalog/poster/<id>?v=<hash>,
 * a route that decodes the image once and lets the CDN keep it forever, so a
 * busy katalog does not stream megabytes out of Postgres per visitor.
 */

/** Generic art every package gets until staff uploads a real poster. */
const DEFAULT_POSTERS = new Set(["", "/poster-el-massa.png"]);

export type KatalogMeta = {
  tags?: string[];
  roomType?: string;
  highlight?: string;
  startCity?: string;
};

export type KatalogItineraryDay = {
  day: number;
  date?: string;
  title: string;
  location?: string;
  activities?: Array<{ time?: string; description?: string; activity?: string } | string>;
};

export type KatalogPackage = {
  id: string;
  name: string;
  category: string;
  duration: string;
  departureDate: string;
  returnDate: string;
  price: string;
  numericPrice: number;
  dpMinimum: string;
  makkahHotel: string;
  madinahHotel: string;
  airline: string;
  flightRoute: string;
  startPoint: string;
  programUmrah: string;
  posterUrl: string | null;
  /** 480px WebP for lists and the gallery strip; equals posterUrl when no thumb exists. */
  thumbUrl: string | null;
  meta: KatalogMeta;
  seats: { quota: number; booked: number; remaining: number };
};

export type KatalogPackageDetail = KatalogPackage & {
  itinerary: KatalogItineraryDay[];
  includes: string[];
  excludes: string[];
};

let columnsReady = false;

async function ensureKatalogColumns() {
  if (columnsReady) return;
  await getPool().query(`ALTER TABLE published_packages ADD COLUMN IF NOT EXISTS katalog_meta JSONB DEFAULT '{}'::jsonb;`);
  columnsReady = true;
}

const LIST_COLUMNS = `
  id, name,
  COALESCE(category, '') AS category,
  COALESCE(duration, '') AS duration,
  COALESCE(departure_date, '') AS "departureDate",
  COALESCE(return_date, '') AS "returnDate",
  COALESCE(price, '') AS price,
  COALESCE(numeric_price, 0) AS "numericPrice",
  COALESCE(dp_minimum, '') AS "dpMinimum",
  COALESCE(makkah_hotel, '') AS "makkahHotel",
  COALESCE(madinah_hotel, '') AS "madinahHotel",
  COALESCE(airline, '') AS airline,
  COALESCE(flight_route, '') AS "flightRoute",
  COALESCE(start_point, '') AS "startPoint",
  COALESCE(program_umrah, '') AS "programUmrah",
  CASE WHEN poster_img LIKE 'data:%' THEN NULL ELSE COALESCE(poster_img, '') END AS "posterPath",
  CASE WHEN poster_img LIKE 'data:%' THEN md5(poster_img) ELSE NULL END AS "posterHash",
  COALESCE(katalog_meta, '{}'::jsonb) AS meta
`;

type Row = Omit<KatalogPackage, "posterUrl" | "thumbUrl" | "seats"> & { posterPath: string | null; posterHash: string | null };

function posterUrlFor(row: Row): string | null {
  if (row.posterHash) return `/poster-katalog/poster/${encodeURIComponent(row.id)}?v=${row.posterHash.slice(0, 12)}`;
  const path = (row.posterPath ?? "").trim();
  return DEFAULT_POSTERS.has(path) ? null : path;
}

/** Static katalog posters have a 480px copy in images/thumbs/ (same file name). */
function thumbUrlFor(posterUrl: string | null) {
  if (posterUrl && /^\/poster-katalog\/images\/[^/]+\.webp$/.test(posterUrl)) {
    return posterUrl.replace("/poster-katalog/images/", "/poster-katalog/images/thumbs/");
  }
  return posterUrl;
}

function toPackage(row: Row, seatsById: Map<string, KatalogPackage["seats"]>): KatalogPackage {
  const posterUrl = posterUrlFor(row);
  // Internal poster columns never leave the server in the package object.
  const rest: Partial<Row> = { ...row };
  delete rest.posterPath;
  delete rest.posterHash;
  return {
    ...(rest as Omit<Row, "posterPath" | "posterHash">),
    numericPrice: Number(row.numericPrice) || 0,
    meta: (row.meta ?? {}) as KatalogMeta,
    posterUrl,
    thumbUrl: thumbUrlFor(posterUrl),
    seats: seatsById.get(row.id) ?? { quota: 0, booked: 0, remaining: 0 },
  };
}

async function seatMap() {
  const rows = await listPublicSeatAvailability();
  return new Map(rows.map((r) => [r.packageId, { quota: r.quota, booked: r.booked, remaining: r.remaining }]));
}

/** Upcoming groups only (a departed group cannot be booked), soonest first. */
export async function listKatalogPackages(): Promise<KatalogPackage[]> {
  await ensureKatalogColumns();
  const today = todayWIB();
  const [res, seats] = await Promise.all([
    getPool().query(`SELECT ${LIST_COLUMNS} FROM published_packages ORDER BY departure_date ASC NULLS LAST;`),
    seatMap(),
  ]);
  return (res.rows as Row[])
    .filter((r) => !/^\d{4}-\d{2}-\d{2}$/.test(r.departureDate) || r.departureDate >= today)
    .map((r) => toPackage(r, seats));
}

export async function getKatalogPackage(id: string): Promise<KatalogPackageDetail | null> {
  await ensureKatalogColumns();
  const [res, seats] = await Promise.all([
    getPool().query(
      `SELECT ${LIST_COLUMNS},
              COALESCE(itinerary, '[]'::jsonb) AS itinerary,
              COALESCE(includes, '[]'::jsonb) AS includes,
              COALESCE(excludes, '[]'::jsonb) AS excludes
       FROM published_packages WHERE id = $1 LIMIT 1;`,
      [id],
    ),
    seatMap(),
  ]);
  const row = res.rows[0] as (Row & { itinerary: unknown; includes: unknown; excludes: unknown }) | undefined;
  if (!row) return null;
  const strings = (v: unknown) => (Array.isArray(v) ? v.map((x) => String(x)).filter(Boolean) : []);
  const { itinerary, includes, excludes, ...base } = row;
  return {
    ...toPackage(base, seats),
    itinerary: Array.isArray(itinerary) ? (itinerary as KatalogItineraryDay[]) : [],
    includes: strings(includes),
    excludes: strings(excludes),
  };
}

/** Decoded bytes of a base64 poster stored in the DB, or null. */
export async function getPosterImage(id: string): Promise<{ bytes: Buffer; contentType: string; etag: string } | null> {
  const res = await getPool().query(`SELECT poster_img FROM published_packages WHERE id = $1 LIMIT 1;`, [id]);
  const value = String(res.rows[0]?.poster_img ?? "");
  const match = /^data:(image\/[\w.+-]+);base64,([\s\S]*)$/.exec(value);
  if (!match) return null;
  return {
    bytes: Buffer.from(match[2], "base64"),
    contentType: match[1],
    etag: `"${createHash("md5").update(value).digest("hex")}"`,
  };
}

// ---------------------------------------------------------------------------
// One-time import of the old katalog's packages (lib/katalog/katalog-seed.json).
// Never overwrites: a package that already exists in the system keeps its data.
// ---------------------------------------------------------------------------

type SeedRow = (typeof seed)[number];

export async function katalogImportStatus() {
  await ensureKatalogColumns();
  const ids = (seed as SeedRow[]).map((r) => r.id);
  const res = await getPool().query(`SELECT id FROM published_packages WHERE id = ANY($1::text[]);`, [ids]);
  const existing = new Set(res.rows.map((r) => String(r.id)));
  const missing = (seed as SeedRow[]).filter((r) => !existing.has(r.id));
  return { total: ids.length, missing: missing.map((r) => ({ id: r.id, name: r.name, departureDate: r.departureDate })) };
}

export async function importKatalogPackages(): Promise<{ inserted: string[]; skipped: string[] }> {
  await ensureKatalogColumns();
  const inserted: string[] = [];
  const skipped: string[] = [];
  const pool = getPool();
  for (const r of seed as SeedRow[]) {
    const res = await pool.query(
      `INSERT INTO published_packages (
         id, name, category, duration, departures_date, departure_date, return_date, price, numeric_price, dp_minimum,
         makkah_hotel, madinah_hotel, airline, flight_route, start_point, program_umrah, itinerary, includes, excludes,
         poster_img, featured, target_pax, katalog_meta
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,true,$21,$22)
       ON CONFLICT (id) DO NOTHING
       RETURNING id;`,
      [
        r.id, r.name, r.category, r.duration, r.departuresDate, r.departureDate, r.returnDate, r.price, r.numericPrice, r.dpMinimum,
        r.makkahHotel, r.madinahHotel, r.airline, r.flightRoute, r.startPoint, r.programUmrah,
        JSON.stringify(r.itinerary), JSON.stringify(r.includes), JSON.stringify(r.excludes),
        r.posterImg, r.targetPax, JSON.stringify(r.katalogMeta),
      ],
    );
    if (res.rowCount) {
      inserted.push(r.id);
      // Same follow-up as publishing from the calculator: the UmrahMe batch for this group.
      await syncKeberangkatanFromPackage(r.id).catch((err) => console.error("Sinkron batch UmrahMe gagal:", err));
    } else {
      skipped.push(r.id);
    }
  }
  return { inserted, skipped };
}
