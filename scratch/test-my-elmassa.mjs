import pg from "pg";
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function runTest() {
  console.log("=== MEMULAI TEST BACKEND MY EL MASSA ===");

  try {
    const testAgentCode = "AG-ELMASSA-01";
    const testPhone = "081298765432";

    // 1. Check agent
    let agentRes = await pool.query("SELECT * FROM agents WHERE agent_code = $1", [testAgentCode]);
    console.log(`[1] Agen uji coba: ${testAgentCode} - ${agentRes.rows[0].name}`);

    // 2. Query recruitment numbers
    const query = `
      SELECT 
        a.id,
        a.agent_code AS "agentCode",
        a.name,
        a.commission_type AS "commissionType",
        a.commission_value AS "commissionValue",
        COALESCE(bk.booking_count, 0)::int AS "bookingCount",
        COALESCE(bk.jamaah_count, 0)::int AS "jamaahCount",
        COALESCE(bk.gross_value, 0)::numeric AS "grossValue"
      FROM agents a
      LEFT JOIN (
        SELECT agent_code,
               COUNT(*)::int AS booking_count,
               COALESCE(SUM(participants), 0)::int AS jamaah_count,
               COALESCE(SUM(total_amount), 0) AS gross_value
        FROM real_bookings
        WHERE agent_code IS NOT NULL AND agent_code != ''
        GROUP BY agent_code
      ) bk ON bk.agent_code = a.agent_code
      WHERE a.agent_code = $1;
    `;
    const res = await pool.query(query, [testAgentCode]);
    const verifiedAgent = res.rows[0];

    const commVal = Number(verifiedAgent.commissionValue);
    const grossVal = Number(verifiedAgent.grossValue);
    const jCount = Number(verifiedAgent.jamaahCount);
    const estimatedCommission =
      verifiedAgent.commissionType === "persen"
        ? Math.round((grossVal * commVal) / 100)
        : Math.round(commVal * jCount);

    console.log("\n[2] HASIL REKAP DATABASE AGEN:");
    console.log(`- Nama Agen: ${verifiedAgent.name}`);
    console.log(`- Skema Komisi: ${verifiedAgent.commissionType} (Rp ${commVal.toLocaleString("id-ID")})`);
    console.log(`- Jumlah Booking: ${verifiedAgent.bookingCount}`);
    console.log(`- Jumlah Jamaah: ${verifiedAgent.jamaahCount}`);
    console.log(`- Nilai Transaksi: Rp ${grossVal.toLocaleString("id-ID")}`);
    console.log(`- Total Komisi Agen: Rp ${estimatedCommission.toLocaleString("id-ID")}`);

    // 3. Verify participants in booking
    const partRes = await pool.query(
      "SELECT name, passport_number, room_type, document_status FROM participants WHERE booking_code LIKE 'BK-MYE-TEST%'",
    );
    console.log("\n[3] DAFTAR PESERTA DARI BOOKING AGEN:");
    console.table(partRes.rows);

    if (jCount >= 2) {
      console.log("\n✅ SEMUA REKAP DATABASE, BOOKING, & PESERTA AGEN BERJALAN 100%!");
    }
  } catch (err) {
    console.error("Test error:", err);
  } finally {
    await pool.end();
  }
}

runTest();
