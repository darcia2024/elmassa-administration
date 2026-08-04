/**
 * Departure dates are stored as free text the staff typed ("01 Oktober 2026"),
 * so anything writing them into a real `date` column has to parse them first.
 * Postgres rejects Indonesian month names outright.
 */

const MONTHS: Record<string, number> = {
  januari: 1, jan: 1,
  februari: 2, feb: 2, pebruari: 2,
  maret: 3, mar: 3,
  april: 4, apr: 4,
  mei: 5,
  juni: 6, jun: 6,
  juli: 7, jul: 7,
  agustus: 8, agu: 8, ags: 8, aug: 8,
  september: 9, sep: 9, sept: 9,
  oktober: 10, okt: 10, oct: 10,
  november: 11, nov: 11, nopember: 11,
  desember: 12, des: 12, dec: 12,
};

/**
 * Returns an ISO date (YYYY-MM-DD), or null when the text cannot be understood.
 * Null is deliberate: guessing a date on an invoice is worse than leaving the
 * caller to pick an explicit fallback.
 */
export function parseIndonesianDate(value: unknown): string | null {
  if (!value) return null;

  const text = String(value).trim();
  if (!text) return null;

  // Already ISO, possibly with a time part.
  const iso = text.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;

  // "01 Oktober 2026", "1 Okt 2026". Ranges like "… s/d …" use the first date.
  const named = text.match(/(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/);
  if (named) {
    const month = MONTHS[named[2].toLowerCase()];
    if (month) {
      const day = String(Number(named[1])).padStart(2, "0");
      return `${named[3]}-${String(month).padStart(2, "0")}-${day}`;
    }
  }

  // "01/10/2026" and "01-10-2026", read as day first.
  const numeric = text.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (numeric) {
    return `${numeric[3]}-${String(Number(numeric[2])).padStart(2, "0")}-${String(Number(numeric[1])).padStart(2, "0")}`;
  }

  return null;
}

/** ISO date N days from today, used when no usable date could be parsed. */
export function isoDateInDays(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}
