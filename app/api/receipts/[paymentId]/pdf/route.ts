import { findReceiptDetail } from "@/lib/receipts/store";

type ReceiptPdfRouteProps = {
  params: Promise<{
    paymentId: string;
  }>;
};

function escapePdfText(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function createPdf(lines: string[]) {
  const content = [
    "BT",
    "/F1 18 Tf",
    "50 545 Td",
    "(Kuitansi - El Massa Tour & Travel) Tj",
    "/F1 10 Tf",
    "0 -28 Td",
    ...lines.flatMap((line) => [`(${escapePdfText(line)}) Tj`, "0 -18 Td"]),
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

export async function GET(_: Request, { params }: ReceiptPdfRouteProps) {
  const { paymentId } = await params;
  const data = await findReceiptDetail(decodeURIComponent(paymentId));

  if (!data) {
    return Response.json({ error: "Kuitansi tidak ditemukan" }, { status: 404 });
  }

  const lines = [
    `Nomor: ${data.receipt.number}`,
    `Tanggal: ${data.receipt.date}`,
    `Diterima dari: ${data.receipt.receivedFrom}`,
    `Nominal: Rp ${data.receipt.amount.toLocaleString("id-ID")}`,
    `Terbilang: ${data.receipt.amountWords}`,
    `Untuk pembayaran: ${data.receipt.paymentFor}`,
    `Kode booking: ${data.payment.bookingCode}`,
    `Metode: ${data.receipt.paymentMethod}`,
    `Admin: ${data.receipt.staff}`,
    `Status: ${data.receipt.status}`,
  ];

  return new Response(createPdf(lines), {
    headers: {
      "Cache-Control": "no-store",
      "Content-Disposition": `attachment; filename="${data.receipt.number}.pdf"`,
      "Content-Type": "application/pdf",
    },
  });
}
