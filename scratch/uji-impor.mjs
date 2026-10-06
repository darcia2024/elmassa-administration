// Uji pembaca berkas impor akun UmrahMe (lib/umrahme/impor.ts):
//   node --import ./scratch/register-alias.mjs scratch/uji-impor.mjs
import ExcelJS from "exceljs";
import { bacaBerkasImpor, petakanBarisImpor } from "@/lib/umrahme/impor";

let gagal = 0;
const cek = (b, t) => { if (!b) gagal++; console.log((b ? "LULUS  " : "GAGAL  ") + t); };
const baca = async (nama, isi) => petakanBarisImpor(await bacaBerkasImpor(new File([isi], nama)));
const galat = async (fn) => { try { await fn(); return null; } catch (e) { return e.message; } };

// 1) CSV koma + kutip + BOM + baris kosong + baris tanpa nama
const csv1 = "﻿Nama Jamaah,NIK (16 Digit),No. Paspor,No. Telepon,Rombongan,No. Bus,No. Kamar\r\n" +
  '"Hasan, Muhammad",1971015205850001,c 4521 897,"+62 812-0000-1111",Rombongan 01,Bus 01,Kamar 3\r\n' +
  ",,,,,,\r\n" +
  ",1971015205850002,,,,,\r\n" +
  "Rina Lestari,,,,,,\r\n";
const r1 = await baca("a.csv", csv1);
cek(r1.rows.length === 2 && r1.dilewati === 1, `CSV koma: 2 jamaah terbaca, 1 baris tanpa nama dilewati (dapat ${r1.rows.length}/${r1.dilewati})`);
cek(r1.rows[0].nama === "Hasan, Muhammad", "nama ber-koma dalam tanda kutip utuh");
cek(r1.rows[0].paspor === "C4521897", "paspor dirapikan: spasi dibuang, huruf besar");
cek(r1.rows[1].nik === "" && r1.rows[1].paspor === "", "kolom kosong tetap kosong, tidak diisi karangan");

// 2) CSV titik koma (Excel Indonesia) dengan judul acak
const r2 = await baca("b.csv", "no. paspor;NAMA;nik\nB1234567;Ahmad Fauzi;1971015205850009\n");
cek(r2.rows.length === 1 && r2.rows[0].nama === "Ahmad Fauzi" && r2.rows[0].paspor === "B1234567", "CSV titik koma dan urutan kolom bebas terbaca");

// 3) XLSX sungguhan, NIK sebagai teks dan sebagai angka bernotasi
const wb = new ExcelJS.Workbook();
const ws = wb.addWorksheet("Jamaah");
ws.addRow(["Judul laporan tidak penting"]);
ws.addRow(["Nama Jamaah", "NIK (16 Digit)", "No. Paspor", "No. Telepon"]);
ws.addRow(["Siti Aminah", "1971015205850003", "C7654321", "081234567890"]);
ws.addRow(["Budi Hartono", 3.5150812048500e15, "C7654322", 81234567891]);
const bufor = await wb.xlsx.writeBuffer();
const r3 = await baca("c.xlsx", bufor);
cek(r3.rows.length === 2, `XLSX: judul kolom ditemukan di baris ke-2, 2 jamaah terbaca (dapat ${r3.rows.length})`);
cek(r3.rows[0].nik === "1971015205850003" && r3.rows[0].telepon === "081234567890", "XLSX: NIK dan telepon bertipe teks utuh");
cek(r3.rows[1].nik === "", "NIK bertipe angka di Excel (digit terakhir sudah hilang) dikosongkan, bukan dipakai");
cek(r3.rows[1].telepon === "81234567891", "telepon bertipe angka tetap terbaca");

// 4) kasus rusak
cek((await galat(() => baca("d.csv", "Kolom A,Kolom B\n1,2\n")))?.includes("Nama Jamaah"), "tanpa kolom Nama -> galat yang menunjuk templatenya");
cek((await galat(() => baca("e.xls", "x")))?.includes("Format berkas"), "format .xls ditolak dengan pesan jelas");
const banyak = "Nama\n" + Array.from({ length: 501 }, (_, i) => `Orang ${i}`).join("\n");
cek((await galat(() => baca("f.csv", banyak)))?.includes("Maksimal 500"), "501 baris ditolak (batas 500)");
const kosong = await baca("g.csv", "Nama Jamaah,NIK\n");
cek(kosong.rows.length === 0, "template tanpa isi menghasilkan 0 baris (tidak ada orang rekaan)");

process.exitCode = gagal ? 1 : 0;
