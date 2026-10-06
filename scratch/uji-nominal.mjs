// Uji format nominal: nilai uang dari database harus berupa angka, dan rupiah harus berpemisah ribuan.
//   node --import ./scratch/register-alias.mjs --env-file=.env.local scratch/uji-nominal.mjs
import { getPool } from "@/lib/db/connection";
import { findBookingByCode } from "@/lib/bookings/store";
import { formatRupiah } from "@/lib/format/rupiah";

let gagal = 0;
const cek = (b, t) => { if (!b) gagal++; console.log((b ? "LULUS  " : "GAGAL  ") + t); };

const pool = getPool();
try {
  const b = await findBookingByCode("BK-DUMMY-001");
  if (!b) {
    console.log("Booking BK-DUMMY-001 tidak ada; lewati uji data (uji formatter tetap jalan).");
  } else {
    cek(typeof b.totalAmount === "number", `total dari database bertipe angka (dapat ${typeof b.totalAmount})`);
    cek(typeof b.paidAmount === "number" && typeof b.remainingAmount === "number", "terbayar dan sisa juga angka");
    cek(formatRupiah(b.totalAmount) === "Rp 34.526.744", `total tampil ${formatRupiah(b.totalAmount)}`);
    cek(formatRupiah(b.paidAmount) === "Rp 0", `terbayar tampil ${formatRupiah(b.paidAmount)}`);
    cek(b.remainingAmount === b.totalAmount, "sisa tagihan = total (belum ada pembayaran)");
  }
  const lain = (await pool.query("SELECT 1.5::numeric AS a, 0::numeric AS nol, 12345678::numeric AS besar")).rows[0];
  cek(lain.a === 1.5 && lain.nol === 0 && lain.besar === 12345678, "NUMERIC pecahan, nol, dan besar terbaca sebagai angka");

  cek(formatRupiah(34526744) === "Rp 34.526.744", "angka -> Rp 34.526.744");
  cek(formatRupiah("34526744") === "Rp 34.526.744", "teks angka -> Rp 34.526.744 (data lama/cache)");
  cek(formatRupiah(1000000000) === "Rp 1.000.000.000", "miliaran -> pemisah di tiap ribuan");
  cek(formatRupiah(null) === "Rp 0" && formatRupiah(undefined) === "Rp 0" && formatRupiah("abc") === "Rp 0", "kosong/bukan angka -> Rp 0");
} finally {
  await pool.end();
}
process.exitCode = gagal ? 1 : 0;
