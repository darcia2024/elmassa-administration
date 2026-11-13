import type { KatalogPackage } from "./store";

const MONTHS = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

function parts(iso: string) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  return m ? { y: Number(m[1]), mo: Number(m[2]) - 1, d: Number(m[3]) } : null;
}

/** "12 Des 2026" */
export function shortDate(iso: string) {
  const p = parts(iso);
  return p ? `${p.d} ${MONTHS_SHORT[p.mo]} ${p.y}` : iso;
}

/** "12–23 Des 2026", or across months "28 Des 2026 – 8 Jan 2027" */
export function dateRange(from: string, to: string) {
  const a = parts(from);
  const b = parts(to);
  if (!a) return from;
  if (!b) return shortDate(from);
  if (a.y === b.y && a.mo === b.mo) return `${a.d}–${b.d} ${MONTHS_SHORT[a.mo]} ${a.y}`;
  if (a.y === b.y) return `${a.d} ${MONTHS_SHORT[a.mo]} – ${b.d} ${MONTHS_SHORT[b.mo]} ${b.y}`;
  return `${shortDate(from)} – ${shortDate(to)}`;
}

/** Group key and label for the departure board: "2026-12" / "Desember 2026" */
export function monthKey(iso: string) {
  const p = parts(iso);
  return p ? { key: `${p.y}-${String(p.mo + 1).padStart(2, "0")}`, label: `${MONTHS[p.mo]} ${p.y}` } : { key: "lainnya", label: "Jadwal menyusul" };
}

/** Name without the trailing "(11 Hari)": the duration is shown next to it anyway. */
export function displayName(name: string) {
  return cleanText(name.replace(/\s*\(\s*\d+\s*Hari\s*\)\s*$/i, ""));
}

/** Data typed for posters uses "★5" for hotel stars; say it in words. */
export function cleanText(text: string) {
  return text.replace(/\s*★\s*(\d)/g, " bintang $1").replace(/★/g, "");
}

/** "Rp 32,9 jt" — the way the posters print prices. */
export function shortPrice(pkg: Pick<KatalogPackage, "numericPrice" | "price">) {
  const n = Number(pkg.numericPrice) || 0;
  if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toLocaleString("id-ID", { maximumFractionDigits: 1 })} jt`;
  return pkg.price || "Hubungi kami";
}

export function seatLabel(remaining: number) {
  if (remaining <= 0) return "Penuh";
  return `Sisa ${remaining} seat`;
}

export type SeatTone = "full" | "low" | "open";
export function seatTone(remaining: number): SeatTone {
  if (remaining <= 0) return "full";
  if (remaining <= 8) return "low";
  return "open";
}

/** International digits for wa.me from any written Indonesian phone number. */
export function whatsappNumber(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("62")) return digits;
  if (digits.startsWith("0")) return `62${digits.slice(1)}`;
  return digits;
}

export function whatsappLink(number: string, pkg?: Pick<KatalogPackage, "name" | "departureDate" | "returnDate">) {
  const text = pkg
    ? `Assalamu'alaikum El Massa, saya ingin tanya paket ${pkg.name} (${dateRange(pkg.departureDate, pkg.returnDate)}). Apakah seatnya masih tersedia?`
    : "Assalamu'alaikum El Massa, saya ingin tanya jadwal umrah.";
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}
