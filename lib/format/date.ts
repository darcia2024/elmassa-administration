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

const WIB_OFFSET_MS = 7 * 60 * 60 * 1000; // UTC+7, no DST in Indonesia

/**
 * Today's date (YYYY-MM-DD) in WIB, not the server's UTC date.
 *
 * `new Date().toISOString().slice(0, 10)` is a recurring bug in this codebase:
 * it's UTC, but the business runs in WIB (UTC+7). Every day between 00:00 and
 * 07:00 WIB, that expression returns *yesterday's* date — an invoice issued,
 * a payment recorded, or a receivables "days overdue" count computed in that
 * window is silently backdated by one day.
 */
export function todayWIB(): string {
  return new Date(Date.now() + WIB_OFFSET_MS).toISOString().slice(0, 10);
}

/** ISO date N days from today (WIB), used when no usable date could be parsed. */
export function isoDateInDays(days: number): string {
  return new Date(Date.now() + WIB_OFFSET_MS + days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

/**
 * Today's date (YYYY-MM-DD) for a `<input type="date">` default in the
 * browser. Deliberately reads the browser's *local* date parts rather than
 * going through toISOString() (UTC) — staff are assumed to be in Indonesia,
 * so local time already is WIB, and converting to UTC first is exactly the
 * bug todayWIB() exists to avoid on the server.
 */
export function todayForDateInput(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const NAMA_BULAN = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

const NAMA_BULAN_PENDEK = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
];

function pecahISO(value: unknown): [string, string, string] | null {
  const match = String(value ?? "").match(/^(\d{4})-(\d{2})-(\d{2})/);
  return match ? [match[1], match[2], match[3]] : null;
}

/**
 * Tanggal untuk dibaca manusia: "2026-10-01" -> "1 Oktober 2026".
 *
 * Modul ini sebelumnya hanya berisi pengurai tanggal, tidak ada pemformatnya,
 * jadi setiap halaman yang butuh menampilkan tanggal menulis fungsinya sendiri
 * -- ada delapan salinan formatDateID yang identik tersebar di app/. Halaman
 * yang penulisnya tidak sempat menyalin ya mencetak nilai mentah dari kolom,
 * dan begitulah "2026-10-01" bisa muncul di depan staf. Dua fungsi berikut
 * adalah rumahnya sekarang.
 *
 * Nilai yang tidak berbentuk ISO dikembalikan apa adanya, bukan diganti tanda
 * hubung: kolom tanggal di sistem ini sebagian masih teks bebas yang diketik
 * staf ("01 Oktober 2026"), dan itu sudah terbaca -- menyembunyikannya justru
 * menghilangkan informasi.
 */
export function formatDateID(value: unknown, kosong = "—"): string {
  if (!value) return kosong;
  const bagian = pecahISO(value);
  if (!bagian) return String(value);
  const [tahun, bulan, hari] = bagian;
  return `${Number(hari)} ${NAMA_BULAN[Number(bulan) - 1]} ${tahun}`;
}

/** Bentuk ringkas: "2026-10-01" -> "1 Okt 2026". Untuk tempat yang sempit. */
export function formatDateShortID(value: unknown, kosong = "—"): string {
  if (!value) return kosong;
  const bagian = pecahISO(value);
  if (!bagian) return String(value);
  const [tahun, bulan, hari] = bagian;
  return `${Number(hari)} ${NAMA_BULAN_PENDEK[Number(bulan) - 1]} ${tahun}`;
}
