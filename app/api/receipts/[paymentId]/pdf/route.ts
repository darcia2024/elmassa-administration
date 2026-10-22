import { findReceiptDetail } from "@/lib/receipts/store";
import fs from "fs";
import path from "path";

type ReceiptPdfRouteProps = {
  params: Promise<{
    paymentId: string;
  }>;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getBase64Image(filePath: string) {
  try {
    const fullPath = path.join(process.cwd(), "public", filePath);
    if (fs.existsSync(fullPath)) {
      return `data:image/png;base64,${fs.readFileSync(fullPath).toString("base64")}`;
    }
  } catch {}
  return `/${filePath}`;
}

export async function GET(_: Request, { params }: ReceiptPdfRouteProps) {
  const { paymentId } = await params;
  const data = await findReceiptDetail(decodeURIComponent(paymentId));

  if (!data) {
    return Response.json({ error: "Kuitansi tidak ditemukan" }, { status: 404 });
  }

  const logoBase64 = getBase64Image("logo-el-massa-header.png");
  const stampBase64 = getBase64Image("stempel-ttd-el-massa.png");

  const participants = data.payment.participants || 1;
  const isCash = data.receipt.paymentMethod.toUpperCase().includes("TUNAI");
  const paymentMethodText = isCash
    ? "SECARA TUNAI DI KANTOR ELMASSA"
    : `TRANSFER KE REKENING PT. ALMASSA AZKA WISATA`;

  const html = `<!doctype html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <title>Kwitansi ${escapeHtml(data.receipt.number)} - ${escapeHtml(data.receipt.receivedFrom)}</title>
  <style>
    @page {
      size: A4 landscape;
      margin: 10mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: Calibri, 'Segoe UI', Arial, sans-serif;
      color: #000;
      background: #fff;
      padding: 10px;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .wrapper {
      max-width: 960px;
      margin: 0 auto;
    }
    .top-box {
      display: grid;
      grid-template-columns: 38% 62%;
      border: 1px solid #000;
    }
    .logo-container {
      border-right: 1px solid #000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 12px;
    }
    .logo-container img {
      max-height: 60px;
      width: auto;
    }
    .received-box {
      display: flex;
      flex-direction: column;
      font-size: 11px;
    }
    .received-label {
      padding: 6px 8px;
      border-bottom: 1px solid #000;
      color: #444;
    }
    .received-name {
      padding: 6px 8px;
      border-bottom: 1px solid #000;
      font-weight: bold;
      text-transform: uppercase;
      font-size: 13px;
    }
    .empty-line {
      height: 20px;
      border-bottom: 1px solid #000;
    }
    .empty-line:last-child {
      border-bottom: none;
    }
    .banner {
      background-color: #fce7f3;
      border: 1px solid #000;
      border-top: none;
      text-align: center;
      padding: 4px 0;
    }
    .banner h1 {
      font-size: 16px;
      font-weight: 900;
      letter-spacing: 2px;
      text-transform: uppercase;
      font-family: 'Times New Roman', Times, serif;
    }
    .date-line {
      padding: 4px 0 6px;
      font-size: 11px;
      font-weight: 600;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      border: 1px solid #000;
      font-size: 11px;
    }
    th, td {
      border: 1px solid #000;
      padding: 4px 8px;
    }
    th {
      text-align: center;
      font-weight: bold;
      background: #fff;
    }
    .total-row {
      background-color: #fce7f3;
      font-weight: bold;
    }
    .amount-cell {
      display: flex;
      justify-content: space-between;
      font-family: 'Courier New', Courier, monospace;
      font-weight: bold;
    }
    .bottom-section {
      display: grid;
      grid-template-columns: 65% 35%;
      margin-top: 12px;
      font-size: 11px;
    }
    .bottom-left h4 {
      font-size: 10px;
      font-weight: bold;
      color: #555;
      text-transform: uppercase;
      margin-bottom: 2px;
    }
    .bottom-left .words {
      font-size: 12px;
      font-weight: 900;
      text-transform: uppercase;
      margin-bottom: 10px;
    }
    .bottom-left .pay-method {
      font-size: 11px;
      font-weight: 900;
      text-transform: uppercase;
    }
    .bottom-left .company-name {
      font-size: 11px;
      font-weight: 900;
      text-transform: uppercase;
      margin-top: 2px;
    }
    .bottom-right {
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .bottom-right img {
      height: 90px;
      width: auto;
      margin: -6px 0;
    }
    .bottom-right .director-name {
      font-size: 12px;
      font-weight: 900;
      text-transform: uppercase;
      text-decoration: underline;
    }
    .bottom-right .director-title {
      font-size: 10px;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #333;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="top-box">
      <div class="logo-container">
        <img src="${logoBase64}" alt="El Massa Tour & Travel">
      </div>
      <div class="received-box">
        <div class="received-label">Telah diterima Dari:</div>
        <div class="received-name">${escapeHtml(data.receipt.receivedFrom)}</div>
        <div class="empty-line"></div>
        <div class="empty-line"></div>
      </div>
    </div>

    <div class="banner">
      <h1>KWITANSI</h1>
    </div>

    <div class="date-line">
      Tanggal:${escapeHtml(data.receipt.date)}
    </div>

    <table>
      <thead>
        <tr>
          <th style="width: 10%;">UNIT</th>
          <th style="width: 45%;">DESKRIPSI</th>
          <th style="width: 15%;">TANGGAL</th>
          <th style="width: 20%;">UANG SEJUMLAH</th>
          <th style="width: 10%;">KETERANGAN</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="text-align: center; font-weight: bold;">${participants} PAX</td>
          <td>${escapeHtml(data.receipt.paymentFor || `Pembayaran Paket ${data.payment.packageName}`)}</td>
          <td style="text-align: center; font-family: 'Courier New', monospace;">${escapeHtml(data.receipt.date)}</td>
          <td>
            <div class="amount-cell">
              <span>Rp</span>
              <span>${data.receipt.amount.toLocaleString("id-ID")}</span>
            </div>
          </td>
          <td style="text-align: center; font-weight: bold; text-transform: uppercase;">${isCash ? "TUNAI" : "TRANSFER"}</td>
        </tr>
        <tr style="height: 20px;"><td></td><td></td><td></td><td></td><td></td></tr>
        <tr style="height: 20px;"><td></td><td></td><td></td><td></td><td></td></tr>
        <tr style="height: 20px;"><td></td><td></td><td></td><td></td><td></td></tr>
        <tr style="height: 20px;"><td></td><td></td><td></td><td></td><td></td></tr>
        <tr style="height: 20px;"><td></td><td></td><td></td><td></td><td></td></tr>
        <tr class="total-row">
          <td colspan="3" style="text-align: center; font-weight: 900;">Total Pembayaran</td>
          <td>
            <div class="amount-cell">
              <span>Rp</span>
              <span>${data.receipt.amount.toLocaleString("id-ID")}</span>
            </div>
          </td>
          <td></td>
        </tr>
      </tbody>
    </table>

    <div class="bottom-section">
      <div class="bottom-left">
        <h4>TERBILANG</h4>
        <div class="words">&ldquo;${escapeHtml(data.receipt.amountWords.toUpperCase())}&rdquo;</div>
        <h4>DIBAYARKAN</h4>
        <div class="pay-method">${paymentMethodText}</div>
        <div class="company-name">PT. ALMASSA AZKA WISATA</div>
      </div>

      <div class="bottom-right">
        <img src="${stampBase64}" alt="Stempel & Tanda Tangan Direktur">
        <div class="director-name">AZRIANDRI.LC</div>
        <div class="director-title">DIREKTUR</div>
      </div>
    </div>
  </div>

  <script>
    window.onload = function() {
      window.print();
    };
  </script>
</body>
</html>`;

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
