import ExcelJS from "exceljs";
import type { Passenger, PassengerGroup } from "@/lib/manifest/data";

/**
 * Manifest check-in maskapai, mengikuti contoh kantor:
 *   - domestik      = "Format manifest GA.pdf" (Garuda): polos, kolom KETERANGAN
 *   - internasional = "Format manifest INTERNATIONAL.xlsx": header biru, baris
 *                     berwarna selang-seling per keluarga, kolom EXPLAN
 * Kolomnya sama persis: NO, titel, NAME, keterangan, DOB, NATIONALITY,
 * NOPASSPORT, DOI, DOE -- dengan "PNR : xxx" di baris paling atas.
 */

export type AirlineKind = "domestik" | "internasional";

export const AIRLINE_HEADERS = (kind: AirlineKind) => [
  "NO",
  "MR/MRS/MSTR/MISS/INF",
  "NAME",
  kind === "internasional" ? "EXPLAN" : "KETERANGAN",
  "DOB(YYYY-MM-DD)",
  "NATIONALITY",
  "NOPASSPORT",
  "DOI",
  "DOE",
];

// Lebar kolom dari file contoh internasional.
const WIDTHS = [7.5, 24, 37.7, 18, 18, 14, 16, 14, 14];

// Warna tema Office 2007 yang dipakai file contoh: accent1 & accent2 tint 80%.
const HEADER_FILL = "FF4F81BD";
const GROUP_FILLS = ["FFDCE6F1", "FFF2DCDB"];

function asDate(iso: string) {
  if (!iso) return null;
  const [y, m, d] = iso.split("-").map(Number);
  // exceljs menghitung nomor seri dari waktu UTC.
  return new Date(Date.UTC(y, m - 1, d));
}

export async function buildAirlineXlsx(
  kind: AirlineKind,
  passengers: Passenger[],
  groups: PassengerGroup[],
  opts: { pnr: string; title: string },
): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = "El Massa Tour & Travel";
  const ws = wb.addWorksheet("MANIFEST", {
    pageSetup: { paperSize: 9, orientation: "landscape", fitToPage: true, fitToWidth: 1, fitToHeight: 0 },
    views: [{ state: "frozen", ySplit: 2 }],
  });
  ws.columns = WIDTHS.map((width) => ({ width }));

  ws.mergeCells("A1:C1");
  const pnrCell = ws.getCell("A1");
  pnrCell.value = `PNR : ${opts.pnr.trim().toUpperCase()}`;
  pnrCell.font = { bold: true, size: 14 };
  ws.getRow(1).height = 25;

  const thin = { style: "thin" as const, color: { argb: "FF000000" } };
  const border = { top: thin, left: thin, bottom: thin, right: thin };

  const header = ws.getRow(2);
  header.values = AIRLINE_HEADERS(kind);
  header.height = 18;
  header.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: kind === "internasional" ? "FFFFFFFF" : "FF000000" } };
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.border = border;
    if (kind === "internasional") cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: HEADER_FILL } };
  });

  const byId = new Map(passengers.map((p) => [p.participantId, p]));
  let rowNo = 3;
  let index = 1;

  groups.forEach((group, gi) => {
    const members = group.participantIds.map((id) => byId.get(id)).filter((p): p is Passenger => Boolean(p));
    if (members.length === 0) return;
    const firstRow = rowNo;

    for (const p of members) {
      const row = ws.getRow(rowNo);
      row.values = [
        index,
        p.title,
        p.name,
        rowNo === firstRow ? group.label : null,
        asDate(p.birthDate),
        "IDN",
        p.passportNumber,
        asDate(p.passportIssueDate),
        asDate(p.passportExpiry),
      ];
      row.eachCell({ includeEmpty: true }, (cell, col) => {
        cell.border = border;
        cell.alignment = { horizontal: col === 3 ? "left" : "center", vertical: "middle" };
        if ([5, 8, 9].includes(col)) cell.numFmt = "yyyy-mm-dd";
        if (kind === "internasional") {
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: GROUP_FILLS[gi % 2] } };
        }
      });
      rowNo += 1;
      index += 1;
    }

    // Satu sel keterangan untuk seluruh anggota keluarga, seperti di contoh.
    if (members.length > 1) ws.mergeCells(firstRow, 4, rowNo - 1, 4);
  });

  wb.title = opts.title;
  return Buffer.from(await wb.xlsx.writeBuffer());
}
