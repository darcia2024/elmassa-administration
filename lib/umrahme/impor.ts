// Pembaca berkas impor akun UmrahMe (.xlsx / .csv). Dipisah dari halaman supaya bisa diuji.

export type BarisImpor = {
  nama: string;
  nik: string;
  paspor: string;
  telepon: string;
  rombongan: string;
  bus: string;
  kamar: string;
};

// ── Pembacaan berkas impor (.xlsx / .csv) ─────────────────────
// Judul kolom dicocokkan tanpa memperhatikan huruf besar, spasi, dan tanda baca, jadi
// "No. Paspor", "no paspor", dan "Passport" sama-sama terbaca.
export const KOLOM_IMPOR: Record<"nama" | "nik" | "paspor" | "telepon" | "rombongan" | "bus" | "kamar", string[]> = {
  nama: ["nama", "namajamaah", "namalengkap", "name"],
  nik: ["nik", "nik16digit", "noktp", "nomorktp"],
  paspor: ["paspor", "nopaspor", "nomorpaspor", "passport", "passportnumber"],
  telepon: ["telepon", "notelepon", "telp", "nohp", "hp", "phone", "nomorhp", "whatsapp"],
  rombongan: ["rombongan"],
  bus: ["bus", "nobus"],
  kamar: ["kamar", "nokamar"],
};
export const MAKS_BARIS_IMPOR = 500;

function normalisasiJudul(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function teksSel(v: unknown): string {
  if (v === null || v === undefined) return "";
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  // Excel hanya menyimpan 15 digit signifikan: NIK (16 digit) yang tersimpan sebagai ANGKA sudah
  // kehilangan digit terakhirnya, tapi tetap tampak seperti NIK yang valid. Lebih baik kosong.
  if (typeof v === "number" && Number.isInteger(v) && Math.abs(v) >= 1e15) return "";
  if (typeof v === "object") {
    const o = v as { text?: unknown; result?: unknown; richText?: Array<{ text?: string }> };
    if (o.richText) return o.richText.map((r) => r.text ?? "").join("").trim();
    if (o.text !== undefined) return String(o.text).trim();
    if (o.result !== undefined && o.result !== null) return String(o.result).trim();
    return "";
  }
  return String(v).trim();
}

/** CSV sederhana: tanda kutip ganda, pemisah koma atau titik koma (Excel berbahasa Indonesia memakai ;). */
export function bacaCsv(teks: string): string[][] {
  const isi = teks.replace(/^﻿/, "");
  const barisPertama = isi.split(/\r?\n/, 1)[0] ?? "";
  const pemisah = (barisPertama.match(/;/g)?.length ?? 0) > (barisPertama.match(/,/g)?.length ?? 0) ? ";" : ",";
  const hasil: string[][] = [];
  let baris: string[] = [];
  let sel = "";
  let dalamKutip = false;
  for (let i = 0; i < isi.length; i++) {
    const c = isi[i];
    if (dalamKutip) {
      if (c === '"' && isi[i + 1] === '"') { sel += '"'; i++; }
      else if (c === '"') dalamKutip = false;
      else sel += c;
    } else if (c === '"') dalamKutip = true;
    else if (c === pemisah) { baris.push(sel.trim()); sel = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && isi[i + 1] === "\n") i++;
      baris.push(sel.trim());
      hasil.push(baris);
      baris = [];
      sel = "";
    } else sel += c;
  }
  if (sel || baris.length) { baris.push(sel.trim()); hasil.push(baris); }
  return hasil;
}

export async function bacaBerkasImpor(file: File): Promise<string[][]> {
  const nama = file.name.toLowerCase();
  if (nama.endsWith(".csv")) return bacaCsv(await file.text());
  if (nama.endsWith(".xlsx")) {
    const ExcelJS = (await import("exceljs")).default;
    const buku = new ExcelJS.Workbook();
    await buku.xlsx.load(await file.arrayBuffer());
    const lembar = buku.worksheets[0];
    if (!lembar) return [];
    const baris: string[][] = [];
    lembar.eachRow({ includeEmpty: false }, (row) => {
      const nilai = row.values as unknown[];
      baris.push(Array.from({ length: Math.max(nilai.length - 1, 0) }, (_, i) => teksSel(nilai[i + 1])));
    });
    return baris;
  }
  throw new Error("Format berkas tidak didukung. Simpan sebagai .xlsx atau .csv.");
}

export function petakanBarisImpor(baris: string[][]): { rows: BarisImpor[]; dilewati: number } {
  const awal = baris.findIndex((r) => r.some((c) => KOLOM_IMPOR.nama.includes(normalisasiJudul(c))));
  if (awal < 0) throw new Error('Kolom "Nama Jamaah" tidak ditemukan. Unduh templatenya dan pakai judul kolom yang sama.');
  const judul = baris[awal].map(normalisasiJudul);
  const kolom = Object.fromEntries(
    Object.entries(KOLOM_IMPOR).map(([k, alias]) => [k, judul.findIndex((h) => alias.includes(h))]),
  ) as Record<keyof typeof KOLOM_IMPOR, number>;

  const rows: BarisImpor[] = [];
  let dilewati = 0;
  for (const r of baris.slice(awal + 1)) {
    if (r.every((c) => !c)) continue;
    const ambil = (k: keyof typeof KOLOM_IMPOR) => (kolom[k] >= 0 ? (r[kolom[k]] ?? "").trim() : "");
    const nama = ambil("nama");
    if (!nama) { dilewati++; continue; }
    // NIK yang terlanjur jadi notasi ilmiah (3.5E+15) sudah kehilangan digitnya: jangan dipakai.
    const nik = ambil("nik").replace(/\s+/g, "");
    rows.push({
      nama,
      nik: /e\+/i.test(nik) ? "" : nik,
      paspor: ambil("paspor").replace(/\s+/g, "").toUpperCase(),
      telepon: ambil("telepon"),
      rombongan: ambil("rombongan"),
      bus: ambil("bus"),
      kamar: ambil("kamar"),
    });
  }
  if (rows.length > MAKS_BARIS_IMPOR) throw new Error(`Terlalu banyak baris (${rows.length}). Maksimal ${MAKS_BARIS_IMPOR} jamaah per impor.`);
  return { rows, dilewati };
}
