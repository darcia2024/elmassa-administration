import { NextRequest } from "next/server";
import { listBookingRows } from "@/lib/seed-data/bookings";

const dueDatesByBooking: Record<string, string> = {
  "BK-2407-014": "2026-08-05",
  "BK-2407-015": "2026-08-20",
  "BK-2407-016": "2026-07-31",
  "BK-2407-018": "2026-07-28",
};

function formatRupiah(value: number) {
  return `Rp ${value.toLocaleString("id-ID")}`;
}

function escapePdfText(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function createPdf(lines: string[]) {
  const content = [
    "BT",
    "/F1 16 Tf",
    "50 545 Td",
    "(Laporan Sisa Tagihan - El Massa Tour & Travel) Tj",
    "/F1 9 Tf",
    "0 -24 Td",
    ...lines.flatMap((line) => [`(${escapePdfText(line)}) Tj`, "0 -14 Td"]),
    "ET",
  ].join("\n");

  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 842 595] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${Buffer.byteLength(content)} >>\nstream\n${content}\nendstream`,
  ];

  let body = "%PDF-1.4\n";
  const offsets = [0];

  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(body));
    body += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = Buffer.byteLength(body);
  body += `xref\n0 ${objects.length + 1}\n`;
  body += "0000000000 65535 f \n";
  body += offsets
    .slice(1)
    .map((offset) => `${String(offset).padStart(10, "0")} 00000 n \n`)
    .join("");
  body += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return Buffer.from(body);
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const status = searchParams.get("status")?.trim();
  const query = searchParams.get("q")?.trim().toLowerCase() ?? "";

  const rows = listBookingRows()
    .map((booking) => {
      const remainingAmount = Math.max(booking.totalPrice - booking.paidAmount, 0);

      return {
        bookingCode: booking.code,
        customerName: booking.customerName,
        dueDate: dueDatesByBooking[booking.code] ?? booking.departureDate,
        packageName: booking.packageName,
        remainingAmount,
        status: booking.status,
      };
    })
    .filter((row) => row.remainingAmount > 0)
    .filter((row) => !status || status === "Semua" || row.status === status)
    .filter((row) => {
      const searchable = `${row.bookingCode} ${row.customerName} ${row.packageName}`.toLowerCase();
      return query.length === 0 || searchable.includes(query);
    });

  const totalRemaining = rows.reduce((total, row) => total + row.remainingAmount, 0);
  const lines = [
    `Total booking: ${rows.length}`,
    `Total sisa tagihan: ${formatRupiah(totalRemaining)}`,
    `Filter status: ${status ?? "Semua"}`,
    "",
    "Booking | Pelanggan | Tempo | Status | Sisa",
    ...rows.map((row) =>
      `${row.bookingCode} | ${row.customerName} | ${row.dueDate} | ${row.status} | ${formatRupiah(row.remainingAmount)}`,
    ),
  ];

  return new Response(createPdf(lines), {
    headers: {
      "Cache-Control": "no-store",
      "Content-Disposition": 'attachment; filename="laporan-sisa-tagihan.pdf"',
      "Content-Type": "application/pdf",
    },
  });
}
