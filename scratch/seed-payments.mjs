import { createPayment } from "@/lib/payments/store";
import { getPool } from "@/lib/db/connection";

async function seed() {
  const pool = getPool();
  // Clear any existing dummy payments first to avoid duplicate seeds
  await pool.query("DELETE FROM receipts;");
  await pool.query("DELETE FROM payments;");
  await pool.query("UPDATE real_bookings SET paid_amount = 0, remaining_amount = total_amount, status = 'Belum Bayar';");

  const paymentsToSeed = [
    {
      bookingCode: "BK-DUMMY-001",
      amount: 34526744,
      date: "2026-09-15",
      method: "Transfer BCA",
      referenceNumber: "TRX-BCA-889102",
      notes: "Pelunasan Paket Umrah 01 Oktober 2026",
      receivedBy: "Kasir Kantor",
      status: "Berhasil",
    },
    {
      bookingCode: "BK-181473",
      amount: 33500000,
      date: "2026-09-20",
      method: "Transfer BSI",
      referenceNumber: "TRX-BSI-104921",
      notes: "Pelunasan Penuh Umrah Reguler 04 Nov",
      receivedBy: "Kasir Kantor",
      status: "Berhasil",
    },
    {
      bookingCode: "BK-419708",
      amount: 37900000,
      date: "2026-09-22",
      method: "Transfer Mandiri",
      referenceNumber: "TRX-MDR-928172",
      notes: "Pelunasan Penuh Umrah Bersama Ustadz Hanan Attaki",
      receivedBy: "Kasir Kantor",
      status: "Berhasil",
    },
    {
      bookingCode: "BK-333548",
      amount: 17000000,
      date: "2026-09-25",
      method: "Transfer BCA",
      referenceNumber: "TRX-BCA-481920",
      notes: "Setoran 50% Paket Umrah Reguler",
      receivedBy: "Kasir Kantor",
      status: "Berhasil",
    },
    {
      bookingCode: "BK-355777",
      amount: 19000000,
      date: "2026-09-26",
      method: "Transfer BSI",
      referenceNumber: "TRX-BSI-381902",
      notes: "Setoran 50% Umrah Ustadz Hanan Attaki",
      receivedBy: "Kasir Kantor",
      status: "Berhasil",
    },
    {
      bookingCode: "BK-722834",
      amount: 10000000,
      date: "2026-10-01",
      method: "Transfer BSI",
      referenceNumber: "TRX-BSI-882194",
      notes: "Uang Muka (DP) Umrah Reguler",
      receivedBy: "Kasir Kantor",
      status: "Berhasil",
    },
    {
      bookingCode: "BK-729418",
      amount: 10000000,
      date: "2026-10-02",
      method: "Transfer Mandiri",
      referenceNumber: "TRX-MDR-771829",
      notes: "Uang Muka (DP) Umrah Reguler",
      receivedBy: "Kasir Kantor",
      status: "Berhasil",
    },
    {
      bookingCode: "BK-734477",
      amount: 10000000,
      date: "2026-10-03",
      method: "Transfer BCA",
      referenceNumber: "TRX-BCA-661928",
      notes: "Uang Muka (DP) Umrah Ustadz Hanan Attaki",
      receivedBy: "Kasir Kantor",
      status: "Berhasil",
    },
    {
      bookingCode: "BK-842472",
      amount: 10000000,
      date: "2026-10-04",
      method: "Transfer BCA",
      referenceNumber: "TRX-BCA-551829",
      notes: "Uang Muka (DP) Umrah Ustadz Hanan Attaki",
      receivedBy: "Kasir Kantor",
      status: "Berhasil",
    },
  ];

  for (const p of paymentsToSeed) {
    const res = await createPayment(p);
    console.log(`Created payment for ${p.bookingCode}: amount ${p.amount}, receipt ${res.receiptNumber}`);
  }

  const check = await pool.query("SELECT code, customer_name, total_amount, paid_amount, remaining_amount, status FROM real_bookings ORDER BY created_at ASC;");
  console.log("\n--- UPDATED BOOKINGS STATUS ---");
  console.table(check.rows);

  await pool.end();
}

seed().catch(console.error);
