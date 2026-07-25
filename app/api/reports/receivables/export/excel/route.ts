import { NextRequest } from "next/server";
import { listBookingRows } from "@/lib/seed-data/bookings";

const dueDatesByBooking: Record<string, string> = {
  "BK-2407-014": "2026-08-05",
  "BK-2407-015": "2026-08-20",
  "BK-2407-016": "2026-07-31",
  "BK-2407-018": "2026-07-28",
};

const displayDatesByBooking: Record<string, string> = {
  "BK-2407-014": "05 Agu 2026",
  "BK-2407-015": "20 Agu 2026",
  "BK-2407-016": "31 Jul 2026",
  "BK-2407-018": "28 Jul 2026",
};

function formatRupiah(value: number) {
  return `Rp ${value.toLocaleString("id-ID")}`;
}

function escapeXml(value: string | number) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function textCell(value: string | number) {
  return `<Cell><Data ss:Type="String">${escapeXml(value)}</Data></Cell>`;
}

function numberCell(value: number) {
  return `<Cell><Data ss:Type="Number">${value}</Data></Cell>`;
}

function row(cells: string[]) {
  return `<Row>${cells.join("")}</Row>`;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const startDate = searchParams.get("startDate")?.trim();
  const endDate = searchParams.get("endDate")?.trim();
  const customer = searchParams.get("customer")?.trim().toLowerCase();
  const packageName = searchParams.get("package")?.trim().toLowerCase();
  const query = searchParams.get("q")?.trim().toLowerCase() ?? "";
  const status = searchParams.get("status")?.trim();

  const rows = listBookingRows()
    .map((booking) => {
      const remainingAmount = Math.max(booking.totalPrice - booking.paidAmount, 0);
      const dueDateValue = dueDatesByBooking[booking.code] ?? booking.departureDate;

      return {
        bookingCode: booking.code,
        bookingDate: booking.bookingDate,
        customerName: booking.customerName,
        departureDate: booking.departureDate,
        dueDate: displayDatesByBooking[booking.code] ?? dueDateValue,
        dueDateValue,
        packageName: booking.packageName,
        paidAmount: booking.paidAmount,
        remainingAmount,
        scheduleId: booking.scheduleId,
        status: booking.status,
        totalPrice: booking.totalPrice,
      };
    })
    .filter((item) => item.remainingAmount > 0)
    .filter((item) => !startDate || item.dueDateValue >= startDate)
    .filter((item) => !endDate || item.dueDateValue <= endDate)
    .filter((item) => !customer || customer === "semua pelanggan" || item.customerName.toLowerCase() === customer)
    .filter((item) => !packageName || packageName === "semua paket" || item.packageName.toLowerCase() === packageName)
    .filter((item) => !status || status === "Semua" || item.status === status)
    .filter((item) => {
      const searchable = `${item.bookingCode} ${item.customerName} ${item.packageName}`.toLowerCase();
      return query.length === 0 || searchable.includes(query);
    })
    .sort((first, second) => first.dueDateValue.localeCompare(second.dueDateValue));

  const totalPrice = rows.reduce((total, item) => total + item.totalPrice, 0);
  const totalPaid = rows.reduce((total, item) => total + item.paidAmount, 0);
  const totalRemaining = rows.reduce((total, item) => total + item.remainingAmount, 0);

  const worksheetRows = [
    row([textCell("Laporan Sisa Tagihan - El Massa Tour & Travel")]),
    row([textCell("Total booking"), numberCell(rows.length)]),
    row([textCell("Total nilai booking"), numberCell(totalPrice), textCell(formatRupiah(totalPrice))]),
    row([textCell("Total terbayar"), numberCell(totalPaid), textCell(formatRupiah(totalPaid))]),
    row([textCell("Total sisa tagihan"), numberCell(totalRemaining), textCell(formatRupiah(totalRemaining))]),
    row([]),
    row([
      textCell("Kode Booking"),
      textCell("Pelanggan"),
      textCell("Paket"),
      textCell("Tanggal Booking"),
      textCell("Keberangkatan"),
      textCell("Jatuh Tempo"),
      textCell("Status"),
      textCell("Total"),
      textCell("Terbayar"),
      textCell("Sisa Tagihan"),
    ]),
    ...rows.map((item) =>
      row([
        textCell(item.bookingCode),
        textCell(item.customerName),
        textCell(item.packageName),
        textCell(item.bookingDate),
        textCell(item.departureDate),
        textCell(item.dueDate),
        textCell(item.status),
        numberCell(item.totalPrice),
        numberCell(item.paidAmount),
        numberCell(item.remainingAmount),
      ]),
    ),
  ];

  const workbook = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:o="urn:schemas-microsoft-com:office:office"
  xmlns:x="urn:schemas-microsoft-com:office:excel"
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:html="http://www.w3.org/TR/REC-html40">
  <Worksheet ss:Name="Sisa Tagihan">
    <Table>${worksheetRows.join("")}</Table>
  </Worksheet>
</Workbook>`;

  return new Response(workbook, {
    headers: {
      "Cache-Control": "no-store",
      "Content-Disposition": 'attachment; filename="laporan-sisa-tagihan.xls"',
      "Content-Type": "application/vnd.ms-excel; charset=utf-8",
    },
  });
}
