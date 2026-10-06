/**
 * Format rupiah dengan pemisah ribuan: 34526744 -> "Rp 34.526.744".
 * Menerima angka maupun teks angka (nilai NUMERIC dari Postgres bisa datang sebagai teks, dan
 * "34526744".toLocaleString("id-ID") tidak memformat apa-apa). Nilai kosong atau bukan angka jadi "Rp 0".
 */
export function formatRupiah(value: unknown): string {
  const angka = typeof value === "number" ? value : Number(value);
  return `Rp ${(Number.isFinite(angka) ? angka : 0).toLocaleString("id-ID")}`;
}
