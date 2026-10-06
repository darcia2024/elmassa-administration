import { readFile } from "node:fs/promises";
import path from "node:path";
import JSZip from "jszip";
import type { Passenger } from "@/lib/manifest/data";

/**
 * Manifest Siskopatuh = template import resmi yang diisi, bukan file buatan
 * sendiri. Template-nya (lib/manifest/templates/siskopatuh.xlsm, versi kosong
 * dari file kantor -- lihat scratch/bersihkan-template-siskopatuh.py) membawa
 * makro VBA, dropdown Provinsi->Kabupaten, daftar Provider Visa & Asuransi.
 * Library spreadsheet umumnya membuang makro & validasi INDIRECT() saat
 * menyimpan ulang, jadi baris jamaah ditulis langsung ke XML Sheet1 dan
 * sisanya dibiarkan byte-per-byte seperti aslinya.
 */

const TEMPLATE_PATH = path.join(process.cwd(), "lib", "manifest", "templates", "siskopatuh.xlsm");

const COLUMNS = [
  "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P",
  "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "AA", "AB", "AC", "AD", "AE", "AF",
] as const;

type Cell = { kind: "text"; value: string } | { kind: "date"; value: string } | null;

const text = (value: string): Cell => (value ? { kind: "text", value } : null);
const date = (value: string): Cell => (value ? { kind: "date", value } : null);

function withPrefix(value: string, prefixes: string[], prefix: string) {
  const v = value.trim();
  if (!v) return "";
  return prefixes.some((p) => v.toUpperCase().startsWith(p)) ? v : `${prefix}${v}`;
}

/** Urutan persis 32 kolom header template (A..AF). */
function rowCells(p: Passenger): Cell[] {
  return [
    text(p.title.replace(/\s*\(infant\)/i, "")), // A Title
    text(p.fullName), // B Nama (sesuai kartu vaksin)
    text(p.fatherName), // C Nama Ayah
    text("NIK"), // D Jenis Identitas
    text(p.nik), // E No Identitas -- teks, angka 16 digit rusak kalau jadi number
    text(p.name), // F Nama Paspor
    text(p.passportNumber), // G No Paspor
    date(p.passportIssueDate), // H Tanggal Dikeluarkan Paspor
    text(p.passportIssuePlace), // I Kota Paspor
    text(p.birthPlace), // J Tempat Lahir
    date(p.birthDate), // K Tanggal Lahir
    text(p.address), // L Alamat
    text(p.province), // M Provinsi
    text(p.regency), // N Kabupaten
    text(withPrefix(p.district, ["KEC"], "KEC. ")), // O Kecamatan -- contoh kantor selalu "KEC. ..."
    text(withPrefix(p.village, ["KEL", "DESA", "DS."], "KEL. ")), // P Kelurahan
    null, // Q No. Telepon (rumah)
    text(p.phone), // R No Hp
    text("WNI"), // S Kewarganegaraan
    text(p.maritalStatus), // T Status Pernikahan
    text(p.education), // U Pendidikan
    text(p.occupation), // V Pekerjaan
    null, // W Provider Visa
    text(p.visaNumber), // X No Visa
    null, // Y Tanggal Berlaku Visa -- belum dicatat sistem
    date(p.visaExpiry), // Z Tanggal Akhir Visa
    null, null, null, null, null, // AA..AE Asuransi & polis
    null, // AF No BPJS
  ];
}

/** Nomor seri tanggal Excel (sistem 1900) dari YYYY-MM-DD, tanpa geseran zona waktu. */
export function excelSerial(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return Math.round((Date.UTC(y, m - 1, d) - Date.UTC(1899, 11, 30)) / 86_400_000);
}

function xmlEscape(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    // Karakter kontrol membuat Excel menolak membuka file.
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "");
}

export async function buildSiskopatuhXlsm(passengers: Passenger[]): Promise<Buffer> {
  const zip = await JSZip.loadAsync(await readFile(TEMPLATE_PATH));
  const sheetPath = "xl/worksheets/sheet1.xml";
  const tablePath = "xl/tables/table1.xml";
  let sheet = await zip.file(sheetPath)!.async("string");
  let table = await zip.file(tablePath)!.async("string");

  // Baris 2 template = baris contoh tanpa nilai; gayanya dipakai semua baris jamaah.
  const styleRow = sheet.match(/<row r="2"([^>]*)>([\s\S]*?)<\/row>/);
  if (!styleRow) throw new Error("Template Siskopatuh rusak: baris gaya (baris 2) tidak ditemukan");
  const rowAttrs = styleRow[1];
  const styles = new Map<string, string>();
  for (const m of styleRow[2].matchAll(/<c r="([A-Z]+)2"(?: s="(\d+)")?/g)) styles.set(m[1], m[2] ?? "");

  const rowsXml = passengers
    .map((p, i) => {
      const r = i + 2;
      const cells = rowCells(p)
        .map((cell, ci) => {
          const col = COLUMNS[ci];
          const s = styles.get(col) ? ` s="${styles.get(col)}"` : "";
          if (!cell) return `<c r="${col}${r}"${s}/>`;
          if (cell.kind === "date") return `<c r="${col}${r}"${s}><v>${excelSerial(cell.value)}</v></c>`;
          return `<c r="${col}${r}"${s} t="inlineStr"><is><t xml:space="preserve">${xmlEscape(cell.value)}</t></is></c>`;
        })
        .join("");
      return `<row r="${r}"${rowAttrs}>${cells}</row>`;
    })
    .join("");

  const lastRow = Math.max(passengers.length + 1, 2);
  sheet = sheet.replace(/<row r="2"[^>]*>[\s\S]*?<\/row>/, rowsXml || styleRow[0]);
  sheet = sheet.replace(/<dimension ref="[^"]*"\/>/, `<dimension ref="A1:AF${lastRow}"/>`);
  table = table.replace(/ref="A1:AF\d+"/g, `ref="A1:AF${lastRow}"`);

  zip.file(sheetPath, sheet);
  zip.file(tablePath, table);
  return zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
}
