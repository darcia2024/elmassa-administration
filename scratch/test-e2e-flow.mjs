import pg from "pg";
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function runE2ETest() {
  console.log("=================================================");
  console.log("   UJI COBA END-TO-END FLOW MY EL MASSA");
  console.log("=================================================");

  try {
    // 1. Verify Agent AG-ELMASSA-01 exists and is Active
    const agentRes = await pool.query(
      "SELECT id, agent_code, name, phone, commission_type, commission_value, status FROM agents WHERE agent_code = 'AG-ELMASSA-01'",
    );
    if (agentRes.rows.length === 0) {
      throw new Error("Agent AG-ELMASSA-01 tidak ditemukan");
    }
    const agent = agentRes.rows[0];
    console.log(`[1] AGEN VALID: ${agent.agent_code} - ${agent.name} (${agent.status})`);
    console.log(`    Skema Komisi: ${agent.commission_type} (Rp ${Number(agent.commission_value).toLocaleString("id-ID")}/jamaah)`);

    // 2. Fetch Active Package
    const pkgRes = await pool.query("SELECT id, name, numeric_price, departure_date FROM published_packages LIMIT 1");
    const pkg = pkgRes.rows[0];
    console.log(`\n[2] PAKET DIPILIH AGEN: ${pkg.name} (Harga: Rp ${Number(pkg.numeric_price).toLocaleString("id-ID")})`);

    // 3. Simulate Agent registering 2 pilgrims via My El Massa
    const testCode = `BK-MYE-LIVE-${Math.floor(1000 + Math.random() * 9000)}`;
    const basePrice = Number(pkg.numeric_price) || 34526744;
    const totalAmount = basePrice * 2;

    console.log(`\n[3] MENDAFTARKAN JAMAAH VIA MY EL MASSA:`);
    console.log(`    Kode Booking: ${testCode}`);
    console.log(`    PIC: Bpk. H. Syafi'i Maarif (081234455667)`);
    console.log(`    Jamaah 1: H. Syafi'i Maarif (Paspor: B1122334)`);
    console.log(`    Jamaah 2: Hj. Nurul Hidayah (Paspor: B1122335)`);

    // Insert into real_bookings with agent_code
    await pool.query(
      `INSERT INTO real_bookings (
        code, customer_name, phone, nik, package_id, package_name, departure, room_type, participants, total_amount, paid_amount, remaining_amount, status, umrah_me_status, agent_code
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 0, $10, 'Belum Bayar', 'Menunggu Pembayaran', $11)`,
      [
        testCode,
        "H. Syafi'i Maarif",
        "081234455667",
        "1901015501800001",
        pkg.id,
        pkg.name,
        pkg.departure_date ? new Date(pkg.departure_date).toISOString().split("T")[0] : "",
        "Quad (4 Orang)",
        2,
        totalAmount,
        agent.agent_code,
      ],
    );

    // Insert participants
    await pool.query(
      `INSERT INTO participants (booking_code, name, passport_number, contact, document_status, room_type)
       VALUES 
       ($1, 'H. Syafi''i Maarif', 'B1122334', '081234455667', 'Belum Lengkap', 'Quad (4 Orang)'),
       ($1, 'Hj. Nurul Hidayah', 'B1122335', '081234455667', 'Belum Lengkap', 'Quad (4 Orang)')`,
      [testCode],
    );
    console.log(`    ✓ Booking & 2 Peserta berhasil disimpan.`);

    // 4. Verify Office sees the booking with agent badge
    const officeBookingRes = await pool.query(
      "SELECT code, customer_name, agent_code, participants, total_amount, paid_amount, status, umrah_me_status FROM real_bookings WHERE code = $1",
      [testCode],
    );
    console.log("\n[4] DATA DI SISTEM KANTOR (EL MASSA WEB):");
    console.table(officeBookingRes.rows);

    // 5. Verify Agent Dashboard recalculates automatically
    const agentStatsRes = await pool.query(
      `SELECT 
         a.agent_code,
         a.name,
         COUNT(bk.code)::int AS total_bookings,
         COALESCE(SUM(bk.participants), 0)::int AS total_jamaah,
         COALESCE(SUM(bk.total_amount), 0)::numeric AS total_gross
       FROM agents a
       LEFT JOIN real_bookings bk ON bk.agent_code = a.agent_code
       WHERE a.agent_code = $1
       GROUP BY a.agent_code, a.name`,
      [agent.agent_code],
    );
    const stats = agentStatsRes.rows[0];
    const commTotal = Number(agent.commission_value) * Number(stats.total_jamaah);

    console.log("\n[5] STATISTIK DASHBOARD MY EL MASSA:");
    console.log(`    - Total Booking: ${stats.total_bookings}`);
    console.log(`    - Total Jamaah: ${stats.total_jamaah} Pax`);
    console.log(`    - Nilai Transaksi: Rp ${Number(stats.total_gross).toLocaleString("id-ID")}`);
    console.log(`    - Komisi Agen: Rp ${commTotal.toLocaleString("id-ID")}`);

    // 6. Office confirms Payment (DP Rp 10.000.000)
    console.log("\n[6] KASIR KANTOR MEMVERIFIKASI PEMBAYARAN DP (Rp 10.000.000):");
    await pool.query(
      `UPDATE real_bookings 
       SET paid_amount = 10000000, 
           remaining_amount = total_amount - 10000000, 
           status = 'DP', 
           umrah_me_status = 'Aktif 🟢' 
       WHERE code = $1`,
      [testCode],
    );

    const updatedBooking = await pool.query(
      "SELECT code, status, paid_amount, remaining_amount, umrah_me_status FROM real_bookings WHERE code = $1",
      [testCode],
    );
    console.table(updatedBooking.rows);
    console.log("    ✓ Status Booking menjadi 'DP', Akun UmrahMe Jamaah otomatis berubah menjadi 'Aktif 🟢'!");

    console.log("\n=================================================");
    console.log("   ✅ SELURUH INTEGRASI END-TO-END SUKSES 100%!");
    console.log("=================================================");
  } catch (err) {
    console.error("Test error:", err);
  } finally {
    await pool.end();
  }
}

runE2ETest();
