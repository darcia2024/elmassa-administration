// Mengisi database DEMO dengan data fiktif lewat API aplikasi (server dev-demo
// harus jalan), lalu menyimpannya sebagai snapshot. Semua nama, nomor HP, dan
// nomor paspor di bawah ini karangan.
import pg from "pg";
import { generateDefaultItinerary } from "../../lib/itinerary-generator.ts";
import { DEMO_URL, runRepoMigrations } from "./db.mjs";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const BASE = "http://localhost:3100";
export const DEMO_EMAIL = "admin@elmassa.test";
export const DEMO_PASSWORD = "demo12345";

export async function login() {
  const r = await fetch(`${BASE}/api/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: DEMO_EMAIL, password: DEMO_PASSWORD }),
  });
  if (!r.ok) throw new Error(`login gagal ${r.status}: ${await r.text()}`);
  return (r.headers.get("set-cookie") || "").split(";")[0];
}

async function api(cookie, method, p, body) {
  const r = await fetch(BASE + p, { method, headers: { cookie, "content-type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
  const text = await r.text();
  let json;
  try { json = JSON.parse(text); } catch { json = text.slice(0, 200); }
  return { status: r.status, json };
}

const isMain = path.resolve(process.argv[1] ?? "") === fileURLToPath(import.meta.url);
if (isMain) {
  const db = new pg.Pool({ connectionString: DEMO_URL });

  // 1. Login sekali dengan akun bootstrap (dibuat aplikasi saat staff_users kosong),
  //    lalu ganti namanya jadi akun demo netral.
  await fetch(`${BASE}/api/auth/login`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email: "x", password: "x" }) });
  await db.query(`UPDATE staff_users SET name='Admin El Massa', email=$1 WHERE email='azriandri@elmassa.test'`, [DEMO_EMAIL]);
  const cookie = await login();
  const ok = (label, r) => console.log(r.status < 300 ? "ok " : "ERR", label, r.status < 300 ? "" : JSON.stringify(r.json).slice(0, 200));

  // 2. Sentuh semua endpoint GET supaya CREATE TABLE IF NOT EXISTS di route jalan.
  for (const p of ["/api/packages", "/api/bookings", "/api/customers", "/api/jamaah", "/api/payments", "/api/invoices", "/api/receipts",
    "/api/installments", "/api/manifest/departures", "/api/agenda", "/api/letters", "/api/expenses", "/api/employees", "/api/agents",
    "/api/inventory/items", "/api/roles", "/api/staff-users", "/api/company-identity", "/api/service-types", "/api/payment-accounts",
    "/api/booking-statuses", "/api/umrahme/accounts", "/api/notifications", "/api/dashboard/stats", "/api/activity-log"]) {
    const r = await api(cookie, "GET", p);
    if (r.status >= 400) console.log("warn", r.status, p);
  }
  runRepoMigrations();

  // 3. Paket / grup keberangkatan.
  const packages = [
    { id: "pkg-demo-des26", name: "Umrah Akhir Tahun Desember 2026", category: "Reguler", days: 12, departureDate: "2026-12-12", returnDate: "2026-12-23", numericPrice: 33500000, makkahHotel: "Hilton Suites Makkah", madinahHotel: "Pullman Zamzam Madinah", domesticAirline: "Garuda Indonesia", internationalAirline: "Saudia Airlines (SV-815)", flightRoute: "PGK-CGK-JED", targetPax: 45, label: "12 Desember 2026 s/d 23 Desember 2026" },
    { id: "pkg-demo-jan27", name: "Umrah Awal Tahun Januari 2027", category: "Spesial", days: 10, departureDate: "2027-01-16", returnDate: "2027-01-25", numericPrice: 31900000, makkahHotel: "Swissotel Makkah", madinahHotel: "Anwar Al Madinah Movenpick", domesticAirline: "Citilink", internationalAirline: "Lion Air Premium (JT-110 / Direct Saudi)", flightRoute: "PGK-CGK-MED", targetPax: 40, label: "16 Januari 2027 s/d 25 Januari 2027" },
  ];
  for (const p of packages) {
    ok("paket " + p.id, await api(cookie, "POST", "/api/packages", {
      ...p,
      duration: `${p.days} Hari`,
      departuresDate: `${p.label} (${p.internationalAirline})`,
      price: `Rp ${p.numericPrice.toLocaleString("id-ID")}`,
      airline: `${p.domesticAirline} + ${p.internationalAirline.split(" (")[0]}`,
      dpMinimum: "Rp 5.000.000",
      startPoint: "Start Pangkal Pinang (PGK)",
      programUmrah: `Program Umrah ${p.days} Hari + Fullboard Hotel`,
      itinerary: generateDefaultItinerary(p.days, p.departureDate, p.domesticAirline, p.internationalAirline),
      includes: ["Tiket pesawat PP", "Visa umrah", "Hotel sesuai paket", "Makan 3x sehari", "Muthawwif"],
      excludes: ["Paspor", "Vaksin meningitis", "Kelebihan bagasi"],
      costingData: { estimatedHppQuadPerPax: p.numericPrice - 3500000, packageName: p.name, categoryName: p.category, departureDate: p.departureDate, returnDate: p.returnDate, makkahHotelName: p.makkahHotel, madinahHotelName: p.madinahHotel, targetPax: p.targetPax, makkahNights: 5, madinahNights: 4 },
    }));
  }

  // 4. Booking + peserta (+ DP awal tercatat sebagai pembayaran).
  const bookings = [
    { code: "BK-260101", customer: "Hendra Saputra", phone: "0812-1111-2001", pax: ["Hendra Saputra", "Rina Marlina"], pkg: 0, dp: 20000000 },
    { code: "BK-260102", customer: "Siti Aminah", phone: "0813-2222-3002", pax: ["Siti Aminah"], pkg: 0, dp: 33500000 },
    { code: "BK-260103", customer: "Bambang Wijaya", phone: "0812-3333-4003", pax: ["Bambang Wijaya", "Dewi Lestari", "Fajar Wijaya"], pkg: 0, dp: 30000000 },
    { code: "BK-260104", customer: "Nurhayati", phone: "0819-4444-5004", pax: ["Nurhayati", "Ahmad Fauzi"], pkg: 0, dp: 10000000 },
    { code: "BK-260105", customer: "Rudi Hartono", phone: "0821-5555-6005", pax: ["Rudi Hartono"], pkg: 0, dp: 0 },
    { code: "BK-260106", customer: "Lia Kurniawati", phone: "0822-6666-7006", pax: ["Lia Kurniawati", "Yusuf Ramadhan"], pkg: 1, dp: 15000000 },
    { code: "BK-260107", customer: "Agus Salim", phone: "0815-7777-8007", pax: ["Agus Salim"], pkg: 1, dp: 5000000 },
  ];
  let seq = 100;
  for (const b of bookings) {
    const p = packages[b.pkg];
    ok("booking " + b.code, await api(cookie, "POST", "/api/bookings", {
      code: b.code, customer: b.customer, phone: b.phone, packageId: p.id, packageName: p.name, departure: p.departureDate, city: "Pangkalpinang",
      participants: b.pax.length,
      participantsList: b.pax.map((name) => ({ name, passport: `X${9000000 + seq++}`, contact: b.phone, documentStatus: "Belum Lengkap", roomType: "Quad (Sekamar Ber-4)" })),
      totalAmount: p.numericPrice * b.pax.length, paidAmount: b.dp,
    }));
  }
  ok("transfer menunggu verifikasi", await api(cookie, "POST", "/api/payments", { bookingCode: "BK-260105", date: "2026-11-10", amount: 10000000, method: "Transfer Bank", referenceNumber: "TRF-DEMO-0510", status: "Menunggu Verifikasi", notes: "Transfer DP via BSI" }));

  // 5. Profil master jamaah (tertaut ke peserta lewat nomor paspor).
  const names = ["Hendra Saputra", "Rina Marlina", "Siti Aminah", "Bambang Wijaya", "Dewi Lestari"];
  const genders = ["L", "P", "P", "L", "P"];
  for (let i = 0; i < names.length; i++) {
    ok("jamaah " + names[i], await api(cookie, "POST", "/api/jamaah", {
      fullName: names[i], gender: genders[i], birthPlace: "Pangkalpinang", birthDate: `19${70 + i * 3}-0${i + 1}-15`,
      nik: `1971010${i}1503800${i}`.slice(0, 16), passportNumber: `X${9000100 + i}`, passportIssuePlace: "Kanim Pangkalpinang",
      passportIssueDate: "2025-03-01", passportExpiry: i === 4 ? "2027-02-01" : "2030-03-01",
      phone: "0812-1111-200" + i, address: `Jl. Contoh No. ${i + 1}, Pangkalpinang`,
      emergencyName: "Keluarga " + names[i].split(" ")[0], emergencyRelation: "Saudara", emergencyPhone: "0811-0000-00" + i,
    }));
  }

  // 6. Agenda, pengeluaran, karyawan, agen, stok, rekening.
  for (const a of [
    { title: "Manasik Umrah Grup Desember", category: "Manasik", date: "2026-11-28", time: "08:30", location: "Aula Kantor El Massa", packageId: "pkg-demo-des26" },
    { title: "Pembagian Perlengkapan Jamaah", category: "Lainnya", date: "2026-12-05", time: "09:00", location: "Kantor El Massa", packageId: "pkg-demo-des26" },
    { title: "Handling Bandara Depati Amir", category: "Handling", date: "2026-12-12", time: "05:00", location: "Bandara PGK", packageId: "pkg-demo-des26" },
  ]) ok("agenda " + a.title, await api(cookie, "POST", "/api/agenda", a));
  for (const e of [
    { date: "2026-11-03", category: "Perlengkapan Umrah", description: "Koper & kain ihram grup Desember", amount: 18500000, method: "Transfer Bank", packageId: "pkg-demo-des26" },
    { date: "2026-11-06", category: "Manasik Offline", description: "Konsumsi manasik", amount: 2400000, method: "Tunai", packageId: "pkg-demo-des26" },
    { date: "2026-11-08", category: "Fee Marketing", description: "Komisi agen Toboali", amount: 3000000, method: "Transfer Bank", packageId: "pkg-demo-des26" },
  ]) ok("pengeluaran " + e.description, await api(cookie, "POST", "/api/expenses", e));
  for (const e of [
    { name: "Fitri Handayani", employeeNumber: "EMS-001", position: "Admin Keuangan", division: "Keuangan", joinDate: "2023-02-01", employmentStatus: "Tetap", phone: "0812-9000-0001", status: "Aktif" },
    { name: "Doni Prasetyo", employeeNumber: "EMS-002", position: "Staf Operasional", division: "Operasional", joinDate: "2024-06-10", employmentStatus: "Kontrak", phone: "0812-9000-0002", status: "Aktif" },
  ]) ok("karyawan " + e.name, await api(cookie, "POST", "/api/employees", e));
  for (const a of [
    { name: "Mitra Toboali", agentCode: "AG-TBL", phone: "0812-8000-0001", city: "Toboali", commissionType: "nominal", commissionValue: 1500000, status: "Aktif" },
    { name: "Mitra Sungailiat", agentCode: "AG-SLT", phone: "0812-8000-0002", city: "Sungailiat", commissionType: "nominal", commissionValue: 1500000, status: "Aktif" },
  ]) ok("agen " + a.name, await api(cookie, "POST", "/api/agents", a));
  for (const it of [
    { sku: "KPR-24", name: "Koper Bagasi 24 inch", category: "Perlengkapan Jamaah", unit: "pcs", minimumStock: 10, unitCost: 350000 },
    { sku: "IHR-01", name: "Kain Ihram", category: "Perlengkapan Pria", unit: "set", minimumStock: 10, unitCost: 120000 },
    { sku: "MKN-01", name: "Mukena Travel", category: "Perlengkapan Wanita", unit: "pcs", minimumStock: 10, unitCost: 95000 },
  ]) {
    const r = await api(cookie, "POST", "/api/inventory/items", it);
    ok("barang " + it.name, r);
    const id = r.json?.data?.id ?? r.json?.item?.id ?? r.json?.id;
    if (id) ok("stok awal", await api(cookie, "POST", "/api/inventory/movements", { itemId: id, movementType: "masuk", quantity: 50, movedAt: "2026-11-01", notes: "Stok awal" }));
  }
  ok("rekening BSI", await api(cookie, "POST", "/api/payment-accounts", { bankName: "Bank Syariah Indonesia (BSI)", accountNumber: "7123456789", accountName: "PT Al Massa Azka Wisata", branch: "Pangkalpinang", isPrimary: true, status: "Aktif" }));
  ok("rekening Mandiri", await api(cookie, "POST", "/api/payment-accounts", { bankName: "Bank Mandiri", accountNumber: "1690012345678", accountName: "PT Al Massa Azka Wisata", branch: "Pangkalpinang", isPrimary: false, status: "Aktif" }));

  // 7. Kuota lisensi UmrahMe supaya penerbitan akun bisa didemokan.
  await db.query(`INSERT INTO license_quota (tenant_id, balance, price_per_unit) VALUES ('el-massa', 50, 25000)
                  ON CONFLICT (tenant_id) DO UPDATE SET balance = 50`).catch((e) => console.log("warn kuota", e.message));
  await db.end();

  execFileSync(process.execPath, [path.join(path.dirname(fileURLToPath(import.meta.url)), "db.mjs"), "save"], { stdio: "inherit" });
  console.log("Seed selesai. Rekam: node tutorials.mjs all");
}
