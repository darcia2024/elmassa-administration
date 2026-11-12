// Skrip tiap video tutorial: slug -> async (t, page). Urutan = urutan rekam.
//   node tutorials.mjs all              -> kembalikan DB ke snapshot, rekam ke-15 video
//   node tutorials.mjs 04-input-booking -> rekam satu video saja (DB tidak di-reset)
// Video yang mengubah data (02, 04, 05, ...) sebaiknya direkam lewat "all" supaya
// datanya konsisten antar video.
import { record } from "./rec.mjs";
import { restoreSnapshot } from "./db.mjs";
import { mergeChapters } from "./merge-chapters.mjs";

export const T = {};

T["01-login-dashboard"] = {
  loggedIn: false,
  run: async (t, page) => {
    await t.goto("/login");
    await t.card("Login & Mengenal Dashboard", "Masuk ke sistem, membaca ringkasan operasional, dan mencari data dengan cepat.");
    await t.say("Buka alamat sistem El Massa, lalu masukkan email staf Anda.", 2200, "1");
    await t.type('input[type="email"], input[placeholder*="@"]', "admin@elmassa.test");
    await t.say("Ketik password akun staf. Jangan bagikan password ke orang lain.", 1800, "2");
    await t.type('input[type="password"]', "demo12345", { delay: 70 });
    await t.say("Klik “Masuk ke Dashboard”.", 1200, "3");
    await t.click('button[type="submit"]', 500);
    await page.waitForURL("**/dashboard", { timeout: 60000 });
    await page.waitForLoadState("networkidle").catch(() => {});
    await t.sleep(1500);
    await t.say("Ini Dashboard: ringkasan grup, seat, jamaah, dan pemasukan.", 2600, "4");
    await t.highlight('a[href="/paket"]:has-text("Total Grup")', 1500);
    await t.highlight('a[href="/paket/seat"]', 1500);
    await t.highlight('a[href="/pembayaran"]:has-text("Revenue")', 1500);
    await t.say("Grup keberangkatan aktif tampil di sini, termasuk grup Desember.", 2000, "5");
    await t.scrollTo(t.text("Grup Keberangkatan Aktif"), 900);
    await t.highlight(t.text("Umrah Akhir Tahun Desember 2026"), 1800);
    await t.say("Gulir ke bawah untuk melihat booking terbaru dan status bayarnya.", 2000, "6");
    await t.scroll(700, 1400);
    await t.click(t.btn("DP"), 1300);
    await t.click(t.btn("Semua"), 1000);
    await t.top();
    await t.say("Cari jamaah, booking, atau invoice dari kolom pencarian di atas.", 1800, "7");
    await t.type('input[placeholder*="Cari jamaah"]', "Hendra", { delay: 90 });
    await t.sleep(2200);
    await page.locator('input[placeholder*="Cari jamaah"]').fill("");
    await page.mouse.click(600, 46);
    await t.sleep(600);
    await t.say("Lonceng menampilkan notifikasi: pembayaran baru, dokumen kurang, jatuh tempo.", 1600, "8");
    await t.click('button[aria-label="Notifikasi"]', 2800);
    await page.keyboard.press("Escape");
    await page.mouse.click(600, 46);
    await t.sleep(500);
    await t.say("Semua menu ada di sidebar kiri, dikelompokkan per bagian kerja.", 1500, "9");
    await t.hover('a[href="/booking"]', 600);
    await t.hover('a[href="/jamaah"]', 600);
    await t.hover('a[href="/manifest"]', 600);
    await t.hover('a[href="/administrasi/surat"]', 900);
    await t.say("Selesai bekerja? Klik tombol keluar di pojok kanan atas.", 1500, "10");
    await t.highlight('button:has-text("Logout"), button[aria-label="Logout"]', 1800);
    await t.hush();
    await t.card("Siap dipakai!", "Lanjut ke tutorial berikutnya: membuat jadwal keberangkatan.", "Selesai", 2600);
  },
};

T["02-jadwal-keberangkatan-hpp"] = {
  run: async (t, page) => {
    await t.goto("/paket");
    await t.card("Membuat Jadwal Keberangkatan", "Hitung HPP paket, tentukan harga jual, lalu terbitkan grup baru ke katalog.");
    await t.say("Menu Jadwal Keberangkatan berisi semua grup, dikelompokkan per bulan.", 2400, "1");
    await t.click(t.btn("Desember 2026"), 1600);
    await t.highlight(t.text("Umrah Akhir Tahun Desember 2026"), 1600);
    await t.click(t.btn("Semua Paket"), 800);
    await t.say("Untuk membuka grup baru, klik “Hitung HPP & Buat Paket”.", 1800, "2");
    await t.click('a[href="/paket/kalkulator"]', 500);
    await page.waitForURL("**/paket/kalkulator");
    await page.waitForLoadState("networkidle").catch(() => {});
    await t.sleep(1200);
    await t.say("Isi nama paket, durasi, target jamaah, dan lama menginap.", 1600, "3");
    await t.type(t.field("Nama Rancangan Paket"), "Umrah Desember 2026 Grup 2", { delay: 40 });
    await t.fill(t.field("Target Kuota Jamaah"), "40");
    await t.say("Tentukan tanggal berangkat dan pulang.", 1400, "4");
    await t.fill(t.field("Tanggal Keberangkatan"), "2026-12-19", 900);
    await t.fill(t.field("Tanggal Kepulangan"), "2026-12-30", 900);
    await t.say("Angka di atas (HPP, profit, harga jual) langsung menghitung ulang.", 2400, "5");
    await t.top(600);
    await t.highlight(t.text("Harga Jual Paket (Quad)"), 1800);
    await t.say("Gulir ke bawah: atur rute & maskapai, harga tiket, dan hotel.", 1800, "6");
    await t.scrollTo(t.text("Generate Ulang Itinerary"), 900);
    await t.click(t.btn("Generate Ulang Itinerary"), 1500);
    await t.scroll(1600, 1200);
    await t.say("Isi nama hotel Makkah & Madinah beserta tarif per malam (SAR).", 1800, "7");
    await t.type('input[value="Grand Al Massa"]', "Hilton Suites Makkah", { delay: 35 });
    await t.say("Lanjutkan ke biaya visa, handling, perlengkapan, dan margin keuntungan.", 2200, "8");
    await t.scrollTo(t.text("4. Visa"), 1600);
    await t.scrollTo('input[name="marginType"]', 1600);
    await t.say("Sudah sesuai? Klik “Simpan & Terbitkan ke Katalog Paket”.", 1600, "9");
    await t.click(t.btn("Simpan & Terbitkan ke Katalog Paket"), 1400);
    await t.say("Periksa nama, kategori, tanggal, DP minimum, lalu klik “Terbitkan Paket Sekarang”.", 2600, "10");
    await t.click(t.btn("Terbitkan Paket Sekarang"), 2200);
    await t.say("Paket berhasil terbit. Buka katalog untuk melihat grup barunya.", 2200, "11");
    await t.click(t.link("Buka Katalog Paket Umrah"), 500);
    await page.waitForURL("**/paket");
    await page.waitForLoadState("networkidle").catch(() => {});
    await t.sleep(800);
    await t.click(t.btn("Desember 2026"), 1200);
    await t.highlight(t.text("Umrah Desember 2026 Grup 2"), 2200);
    await t.say("Klik “Kelola Grup” untuk mengatur flyer, itinerary, pembayaran, dan manifest grup.", 2600, "12");
    await t.hush();
    await t.card("Grup baru siap menerima booking", "Tutorial berikutnya: mengelola detail grup keberangkatan.", "Selesai", 2600);
  },
};

T["03-kelola-grup"] = {
  run: async (t, page) => {
    await t.goto("/paket");
    await t.card("Mengelola Grup Keberangkatan", "Flyer, itinerary, data pembayaran, dan manifest — semua dari satu halaman grup.");
    await t.say("Dari Jadwal Keberangkatan, klik “Kelola Grup” pada grup Desember.", 2000, "1");
    await t.click('a[href="/paket/pkg-demo-des26"]', 500);
    await page.waitForURL("**/paket/pkg-demo-des26");
    await page.waitForLoadState("networkidle").catch(() => {});
    await t.sleep(1000);
    await t.say("Bagian atas: tanggal, maskapai, harga, kuota, seat terisi, dan sisa seat.", 2400, "2");
    await t.highlight(t.text("Sisa Seat"), 1600);
    await t.say("Tab “Flyer & HPP”: ganti poster/banner dan teks brosur yang dibagikan ke jamaah.", 2600, "3");
    await t.scroll(650, 1500);
    await t.hover(t.btn("Simpan Flyer"), 1200);
    await t.top(700);
    await t.say("Tab “Itinerary Grup”: susun jadwal harian perjalanan grup ini.", 2000, "4");
    await t.click(t.btn("Itinerary Grup"), 1500);
    await t.scroll(500, 1500);
    await t.top(600);
    await t.say("Tab “Data Pembayaran”: siapa sudah lunas, DP, atau belum bayar.", 2000, "5");
    await t.click(t.btn("Data Pembayaran"), 1800);
    await t.scroll(400, 1600);
    await t.top(600);
    await t.say("Tab “Manifest Jamaah”: daftar peserta, paspor, dan kamar per kota.", 2000, "6");
    await t.click(t.btn("Manifest Jamaah"), 1800);
    await t.scroll(450, 1800);
    await t.top(600);
    await t.say("Butuh ubah harga atau biaya? Buka lagi kalkulator lewat “Ubah HPP”.", 2200, "7");
    await t.click(t.btn("Flyer & HPP"), 900);
    await t.scrollTo('a[href^="/paket/kalkulator?edit="]', 600);
    await t.highlight('a[href^="/paket/kalkulator?edit="]', 1800);
    await t.hush();
    await t.card("Grup terkelola rapi", "Tutorial berikutnya: mencatat booking jamaah baru.", "Selesai", 2600);
  },
};

T["04-input-booking"] = {
  run: async (t, page) => {
    await t.goto("/booking");
    await t.card("Input Booking Jamaah", "Catat pemesanan, daftarkan peserta, dan pantau status pembayarannya.");
    await t.say("Menu Booking menampilkan semua transaksi beserta total, terbayar, dan sisa tagihan.", 2600, "1");
    await t.highlight(t.text("Sisa Piutang"), 1500);
    await t.say("Klik “Buat Booking Baru” untuk mendaftarkan jamaah.", 1600, "2");
    await t.click(t.link("Buat Booking Baru"), 500);
    await page.waitForURL("**/booking/form");
    await page.waitForLoadState("networkidle").catch(() => {});
    await t.sleep(900);
    await t.say("Isi nama pemesan/rombongan dan nomor WhatsApp-nya.", 1500, "3");
    const textInputs = page.locator('main form input:not([type]), main form input[type="text"], main form input[type="tel"]');
    await t.type(textInputs.nth(0), "Yusuf Hidayat", { delay: 50 });
    await t.type(textInputs.nth(1), "081277778899", { delay: 50 });
    await t.say("Pilih paket & tanggal keberangkatan — di sini grup Desember 2026.", 1800, "4");
    await t.select("main select", "pkg-demo-des26", 1200);
    await t.say("Masukkan nominal DP yang sudah diterima (boleh 0 jika belum bayar).", 1800, "5");
    await t.type('main form input[type="number"]', "10000000", { delay: 40 });
    await t.say("Tulis nama peserta sesuai paspor, nomor paspor, dan HP jamaah.", 1800, "6");
    await t.type('input[placeholder="Nama Lengkap Paspor"]', "Yusuf Hidayat", { delay: 45 });
    await t.type('input[placeholder="No. Paspor RI"]', "X9001234", { delay: 60 });
    await t.type('input[placeholder="No. HP Jamaah"]', "081277778899", { delay: 40 });
    await t.say("Ada anggota keluarga? Klik “Tambah Jamaah” untuk baris berikutnya.", 1800, "7");
    await t.click(t.btn("Tambah Jamaah"), 800);
    await t.type(page.locator('input[placeholder="Nama Lengkap Paspor"]').nth(1), "Aisyah Hidayat", { delay: 45 });
    await t.type(page.locator('input[placeholder="No. HP Jamaah"]').nth(1), "081277778800", { delay: 40 });
    await t.say("Ringkasan di kiri menghitung total tagihan dan sisa secara otomatis.", 2200, "8");
    await t.highlight(t.text("Kalkulasi Booking Otomatis"), 2000);
    await t.say("Klik “Simpan & Terbit Booking”.", 1300, "9");
    await t.click(t.btn("Simpan & Terbit Booking"), 2500);
    await page.waitForURL("**/booking", { timeout: 20000 }).catch(() => {});
    await page.waitForLoadState("networkidle").catch(() => {});
    await t.sleep(1200);
    await t.say("Booking baru muncul paling atas. DP otomatis tercatat sebagai pembayaran.", 2400, "10");
    await t.highlight(page.locator("tr", { hasText: "Yusuf Hidayat" }).first(), 1800);
    await t.say("Gunakan pencarian & filter status untuk menemukan booking dengan cepat.", 1800, "11");
    await t.type('input[placeholder*="Cari Kode"]', "Yusuf", { delay: 80 });
    await t.sleep(1000);
    await t.say("Klik nama pemesan untuk membuka detail booking.", 1500, "12");
    await t.click(page.locator('a[href^="/booking/BK-"]').filter({ hasText: "Yusuf Hidayat" }), 600);
    await page.waitForLoadState("networkidle").catch(() => {});
    await t.sleep(1200);
    await t.say("Di detail: peserta, riwayat bayar, kirim tagihan via WhatsApp, dan cetak invoice.", 2600, "13");
    await t.highlight(t.link("Kirim WA"), 1300);
    await t.highlight(t.link("Cetak Invoice"), 1300);
    await t.scroll(500, 1600);
    await t.hush();
    await t.card("Booking tercatat", "Tutorial berikutnya: melengkapi data di Database Jamaah.", "Selesai", 2600);
  },
};

T["05-database-jamaah"] = {
  run: async (t, page) => {
    await t.goto("/jamaah");
    await t.card("Database Jamaah", "Satu profil per jamaah: biodata, paspor, dokumen, dan link pendataan mandiri.");
    await t.say("Database Jamaah merangkum seat, kelengkapan data, dan status bayar rombongan.", 2600, "1");
    await t.highlight(t.text("Siap Masuk Manifest"), 1600);
    await t.say("Gulir ke daftar jamaah. Filter yang datanya belum lengkap.", 1800, "2");
    await t.scrollTo(t.btn("Data Belum Lengkap"), 900);
    await t.click(t.btn("Data Belum Lengkap"), 1500);
    await t.type('input[placeholder^="Cari nama"]', "Hendra", { delay: 80 });
    await t.sleep(1500);
    await page.locator('input[placeholder^="Cari nama"]').fill("");
    await t.say("Untuk menambah jamaah baru, klik “Tambah Jamaah”.", 1600, "3");
    await t.click('a[href="/jamaah/baru"]', 500);
    await page.waitForURL("**/jamaah/baru");
    await page.waitForLoadState("networkidle").catch(() => {});
    await t.sleep(900);
    await t.say("Pilih program keberangkatan — jamaah langsung masuk grup Desember.", 2000, "4");
    await t.select("main select >> nth=0", "pkg-demo-des26", 1000);
    await t.say("Isi biodata sesuai KTP/paspor. Kolom bertanda * wajib untuk manifest.", 2000, "5");
    await t.type('input[placeholder="Siti Aminah binti Abdullah"]', "Aisyah Rahmawati", { delay: 45 });
    await t.type('input[placeholder="Abdullah"]', "Hasan Basri", { delay: 45 });
    await t.select(page.locator("main select").filter({ has: page.locator('option[value="P"]') }), "P", 700);
    await t.type('input[placeholder="Pangkalpinang"]', "Pangkalpinang", { delay: 40 });
    await t.fill(page.locator('main input[type="date"]').nth(0), "1988-04-21", 800);
    await t.say("Lengkapi NIK, nomor paspor, tempat & tanggal terbit, dan masa berlakunya.", 2000, "6");
    await t.type('input[placeholder="16 digit"]', "1971016104880003", { delay: 35 });
    await t.type('input[placeholder="X1234567"]', "X9004455", { delay: 50 });
    await t.type('input[placeholder="PANGKAL PINANG"]', "KANIM PANGKALPINANG", { delay: 30 });
    await t.fill(page.locator('main input[type="date"]').nth(1), "2025-08-01", 600);
    await t.fill(page.locator('main input[type="date"]').nth(2), "2030-08-01", 800);
    await t.say("Isi alamat, nomor HP, dan kontak darurat keluarga.", 1700, "7");
    await t.type('input[placeholder="0812xxxxxxxx"] >> nth=0', "081299001122", { delay: 40 });
    await t.type('input[placeholder="Nama keluarga"]', "Hasan Basri", { delay: 40 });
    await t.type('input[placeholder^="Suami"]', "Ayah", { delay: 50 });
    await t.say("Klik “Simpan Jamaah”. Data yang masih kurang akan ditandai otomatis.", 2000, "8");
    await t.click(t.btn("Simpan Jamaah"), 2500);
    await page.waitForLoadState("networkidle").catch(() => {});
    await t.top(800);
    await t.say("Bagian atas menunjukkan data & dokumen apa saja yang belum ada.", 2200, "9");
    await t.highlight(t.text("Dokumen belum ada"), 1800);
    await t.say("Unggah KK, KTP, paspor, pas foto, dan bukti vaksin lewat tombol “Upload”.", 2200, "10");
    await t.highlight(t.btn("Upload"), 1600);
    await t.say("Atau kirim link pendataan ke jamaah via WhatsApp, biar mereka isi sendiri.", 2400, "11");
    await t.scrollTo(t.btn("Salin"), 900);
    await t.highlight(t.link("Kirim via WA"), 2000);
    await t.hush();
    await t.card("Data jamaah tersimpan", "Tutorial berikutnya: verifikasi pembayaran & kuitansi.", "Selesai", 2600);
  },
};

T["06-pembayaran-kuitansi"] = {
  run: async (t, page) => {
    await t.goto("/pembayaran");
    await t.card("Verifikasi Pembayaran & Kuitansi", "Cek transfer masuk, catat setoran tunai, lalu cetak kuitansi resmi.");
    await t.say("Menu Verifikasi Pembayaran: semua setoran jamaah yang perlu dicek kasir.", 2400, "1");
    await t.highlight(t.text("Menunggu Cek"), 1500);
    await t.say("Klik “Cek Bukti & Verifikasi” pada transfer yang masuk.", 1600, "2");
    await t.click(t.btn("Cek Bukti & Verifikasi"), 1400);
    await t.say("Cocokkan nama pengirim, nominal, tanggal, dan nomor referensi dengan mutasi bank.", 2800, "3");
    await t.hover(t.text("Nominal Transfer"), 1200);
    await t.say("Sudah cocok? Klik “Setujui & Verifikasi”. Kalau tidak, pilih “Minta Revisi”.", 2400, "4");
    await t.scrollTo(t.btn("Setujui & Verifikasi"), 700);
    await t.hover(t.btn("Minta Revisi"), 900);
    await t.click(t.btn("Setujui & Verifikasi"), 1800);
    await t.say("Terverifikasi. Klik “Tutup” — status di tabel ikut berubah.", 1600, "4");
    await t.click(page.getByRole("button", { name: "Tutup", exact: true }), 1200);
    await t.highlight(page.locator("tr", { hasText: "Rudi Hartono" }).first(), 1800);
    await t.say("Jamaah bayar tunai di kantor? Klik “Catat Pembayaran”.", 1800, "5");
    await t.top(500);
    await t.click(t.link("Catat Pembayaran"), 500);
    await page.waitForURL("**/pembayaran/form");
    await page.waitForLoadState("networkidle").catch(() => {});
    await t.sleep(900);
    await t.say("Pilih kode booking — sisa tagihannya langsung terlihat.", 1800, "6");
    await t.select("main select >> nth=0", "BK-260101", 1200);
    await t.say("Isi tanggal, nominal setoran, dan metode pembayaran.", 1500, "7");
    await t.type('main input[type="number"]', "15000000", { delay: 45 });
    await t.select("main select >> nth=1", { index: 1 }, 900);
    await t.type("main textarea", "Cicilan ke-2 grup Desember, diterima di kantor", { delay: 25 });
    await t.say("Klik “Terbitkan Kuitansi Pembayaran”. Nomor kuitansi dibuat otomatis.", 2000, "8");
    await t.click(t.btn("Terbitkan Kuitansi Pembayaran"), 2500);
    await page.waitForLoadState("networkidle").catch(() => {});
    await t.say("Semua kuitansi ada di menu Kwitansi. Pilih satu untuk melihat pratinjau.", 2200, "9");
    await t.goto("/dokumen/kuitansi");
    await t.click(page.locator("button", { hasText: "Hendra Saputra" }).first(), 1800);
    await t.say("Klik “Cetak” atau “Unduh PDF” untuk dikirim ke jamaah.", 2000, "10");
    await t.highlight(t.btn("Unduh PDF"), 1800);
    await t.hush();
    await t.card("Pembayaran tercatat rapi", "Tutorial berikutnya: membuat invoice tagihan.", "Selesai", 2600);
  },
};

T["07-invoice"] = {
  run: async (t, page) => {
    await t.goto("/dokumen/invoice");
    await t.card("Membuat Invoice Tagihan", "Terbitkan invoice resmi dari kode booking hanya dengan beberapa klik.");
    await t.say("Menu Invoice menampilkan semua tagihan beserta status lunasnya.", 2200, "1");
    await t.say("Klik “Buat Invoice 1-Klik”.", 1300, "2");
    await t.click(page.getByRole("button", { name: /Buat Invoice/ }), 1300);
    await t.say("Pilih kode booking jamaah dan tentukan tanggal jatuh tempo pelunasan.", 2000, "3");
    await t.select("select >> nth=-1", { index: 3 }, 1000);
    await t.fill('input[type="date"] >> nth=-1', "2026-11-28", 900);
    await t.say("Klik “Terbitkan Invoice”. Nominal & sisa tagihan diambil otomatis dari booking.", 2200, "4");
    await t.click(t.btn("Terbitkan Invoice"), 2200);
    await page.waitForLoadState("networkidle").catch(() => {});
    await t.say("Invoice baru masuk daftar. Klik untuk membuka dan mencetaknya.", 2000, "5");
    const row = page.locator("tbody tr").first();
    await t.highlight(row, 1600);
    const open = row.locator('a[href^="/dokumen/invoice/"]').first();
    await t.click(open, 500);
    await page.waitForLoadState("networkidle").catch(() => {});
    await t.sleep(1500);
    await t.say("Invoice siap dicetak atau diunduh PDF, lengkap dengan rekening pembayaran.", 2400, "6");
    await t.scroll(500, 1800);
    await t.top(800);
    await t.hush();
    await t.card("Invoice terbit", "Tutorial berikutnya: menyiapkan manifest peserta.", "Selesai", 2600);
  },
};

T["08-manifest"] = {
  run: async (t, page) => {
    await t.goto("/manifest");
    await t.card("Manifest Peserta", "Lengkapi paspor, e-visa, e-tiket, dan kamar — lalu export untuk Siskopatuh & maskapai.");
    await t.say("Manifest berisi seluruh peserta per keberangkatan, diambil otomatis dari booking.", 2600, "1");
    await t.highlight(t.text("Belum Lengkap"), 1500);
    await t.say("Pilih keberangkatan — di sini grup Desember 2026.", 1600, "2");
    await t.select("main select >> nth=0", { index: 0 }, 1200);
    await t.say("Isi nomor e-visa, masa berlaku, dan nomor e-tiket langsung di tabel.", 2000, "3");
    const first = page.locator("tbody tr").first();
    await t.type(first.locator('input[placeholder="-"]').nth(0), "EV-2026-118801", { delay: 45 });
    await t.fill(first.locator('input[type="date"]'), "2027-03-10", 700);
    await t.type(first.locator('input[placeholder="-"]').nth(1), "0652108812345", { delay: 45 });
    await t.say("Atur tipe kamar dan status dokumen jamaah.", 1600, "4");
    await t.select(first.locator("select").nth(0), { index: 1 }, 800);
    await t.select(first.locator("select").nth(1), "Proses Visa", 800);
    await t.say("Klik tombol simpan di ujung baris.", 1400, "5");
    await t.click(first.locator("button").last(), 1800);
    await t.say("Cari jamaah dengan cepat lewat kolom pencarian.", 1500, "6");
    await t.type('input[placeholder^="Cari nama / paspor"]', "Bambang", { delay: 80 });
    await t.sleep(1400);
    await page.locator('input[placeholder^="Cari nama / paspor"]').fill("");
    await t.top(600);
    await t.say("Selesai? Export ke Siskopatuh (.xlsm), manifest maskapai (.xlsx), atau cetak.", 2600, "7");
    await t.highlight(t.btn("Export Siskopatuh"), 1300);
    await t.highlight(t.btn("Export Manifest Int"), 1300);
    await t.highlight(page.getByRole("link", { name: /Cetak Manifest/ }).or(page.getByRole("button", { name: /Cetak Manifest/ })).first(), 1300);
    await t.hush();
    await t.card("Manifest siap kirim", "Tutorial berikutnya: membuat surat rekomendasi & pemberitahuan.", "Selesai", 2600);
  },
};

T["09-surat-menyurat"] = {
  run: async (t, page) => {
    await t.goto("/administrasi/surat");
    await t.card("Surat Menyurat", "Surat pemberitahuan, rekomendasi paspor, dan izin cuti — bernomor otomatis & siap cetak.");
    await t.say("Semua surat keluar tersimpan di arsip ini, dikelompokkan per jenis.", 2200, "1");
    await t.say("Klik “Terbitkan Surat” untuk membuat surat baru.", 1500, "2");
    await t.click(t.btn("Terbitkan Surat"), 1300);
    await t.say("Pilih jenis surat, misalnya Rekomendasi Pembuatan Paspor.", 1800, "3");
    await t.select(t.field("Jenis Surat", "select"), { index: 1 }, 1000);
    await t.say("Ambil data jamaah dari booking — nama & data lain terisi otomatis.", 2200, "4");
    await t.select(t.field("Ambil Data Jamaah", "select"), { index: 4 }, 1500);
    await t.say("Lengkapi yang masih kosong: NIK, tempat & tanggal lahir, alamat.", 1800, "5");
    await t.type('input[placeholder="1901025508820001"]', "1971010315038003", { delay: 35 });
    await t.type('input[placeholder="Pangkalpinang"]', "Pangkalpinang", { delay: 40 });
    await t.fill(t.field("Tanggal Lahir", "input"), "1979-04-15", 700);
    await t.type('input[placeholder^="Jl. Melati"]', "Jl. Contoh No. 4, Pangkalpinang", { delay: 30 });
    await t.say("Isi nama penandatangan, lalu klik “Terbitkan & Cetak”.", 1800, "6");
    await t.type('input[placeholder="Azriandri"]', "Direktur El Massa", { delay: 40 });
    await t.click(t.btn("Terbitkan & Cetak"), 2500);
    await page.waitForLoadState("networkidle").catch(() => {});
    await t.sleep(800);
    await t.say("Surat terbit dengan nomor urut otomatis, lengkap dengan kop & stempel.", 2400, "7");
    await t.scroll(500, 1800);
    await t.hush();
    await t.card("Surat siap dicetak", "Tutorial berikutnya: Kalender Kegiatan.", "Selesai", 2600);
  },
};

T["10-kalender-kegiatan"] = {
  run: async (t, page) => {
    await t.goto("/jadwal");
    await t.card("Kalender Kegiatan", "Keberangkatan, kepulangan, batas pelunasan, manasik, dan handling dalam satu kalender.");
    await t.say("Keberangkatan, kepulangan, dan batas pelunasan muncul otomatis dari data grup.", 2600, "1");
    await t.say("Pindah bulan untuk melihat jadwal grup Desember.", 1500, "2");
    await t.click(page.locator('main button:right-of(:text("November 2026"))').first(), 1800);
    await t.say("Filter per jenis kegiatan: keberangkatan, manasik, atau pelunasan.", 1800, "3");
    await t.click(page.getByRole("button", { name: /Manasik/ }).first(), 1200);
    await t.click(page.getByRole("button", { name: "Semua", exact: true }), 1000);
    await t.say("Tambahkan manasik atau handling dengan “Tambah Kegiatan”.", 1700, "4");
    await t.click(t.btn("Tambah Kegiatan"), 1200);
    await t.type('input[placeholder^="Manasik Akbar"]', "Manasik Akbar Grup Desember", { delay: 40 });
    await t.select(t.field("Kategori", "select"), "Manasik", 600);
    await t.fill(t.field("Tanggal", "input"), "2026-12-06", 600);
    await t.type('input[placeholder="08:30 WIB"]', "08:00 WIB", { delay: 50 });
    await t.select(t.field("Grup Keberangkatan", "select"), { label: "Umrah Akhir Tahun Desember 2026" }, 700);
    await t.type('input[placeholder^="Ruko Best"]', "Aula Kantor El Massa, Pangkalpinang", { delay: 30 });
    await t.say("Klik “Tambah Kegiatan” untuk menyimpan.", 1400, "5");
    await t.click(page.getByRole("button", { name: "Tambah Kegiatan" }).last(), 2000);
    await t.say("Butuh tampilan daftar? Pilih mode “Daftar”.", 1600, "6");
    await t.click(t.btn("Daftar"), 1800);
    await t.scroll(400, 1600);
    await t.hush();
    await t.card("Jadwal tersusun", "Tutorial berikutnya: pemasukan, pengeluaran & rekap keuangan grup.", "Selesai", 2600);
  },
};

T["11-keuangan-grup"] = {
  run: async (t, page) => {
    await t.goto("/pembayaran/arus-kas");
    await t.card("Pemasukan, Pengeluaran & Rekap Grup", "Pantau arus kas kantor dan laba-rugi tiap rombongan.");
    await t.say("Pemasukan dihitung otomatis dari pembayaran jamaah di kasir.", 2200, "1");
    await t.highlight(t.text("Selisih Kas"), 1500);
    await t.say("Tab “Piutang & Jatuh Tempo” menunjukkan jamaah yang harus ditagih.", 2000, "2");
    await t.click(page.getByRole("button", { name: /Piutang & Jatuh Tempo/ }), 1800);
    await t.say("Catat setiap pengeluaran: klik “Catat Pengeluaran”.", 1700, "3");
    await t.click(t.btn("Catat Pengeluaran"), 1200);
    await t.type('input[placeholder^="Biaya visa"]', "Pembayaran visa 40 pax grup Desember", { delay: 30 });
    await t.type('input[placeholder="8123456"]', "54000000", { delay: 45 });
    await t.select(t.field("Kategori", "select"), { index: 4 }, 700);
    await t.type('input[placeholder="Transfer BSI"]', "Transfer BSI", { delay: 40 });
    await t.say("Klik “Simpan Pengeluaran”. Selisih kas langsung diperbarui.", 1800, "4");
    await t.click(t.btn("Simpan Pengeluaran"), 2000);
    await t.click(page.getByRole("button", { name: /^Pengeluaran \(/ }), 1800);
    await t.say("Untuk laba-rugi per rombongan, buka menu Rekap Keuangan Grup.", 2000, "5");
    await t.goto("/pembayaran/rekap-grup");
    await t.highlight(t.text("Tingkat Pelunasan Global"), 1500);
    await t.say("Klik “Buka Finansial Rombongan” pada grup Desember.", 1700, "6");
    await t.click(page.getByText("Buka Finansial Rombongan").first(), 1800);
    await t.say("Tab 1: pemasukan & status bayar tiap jamaah di grup ini.", 2000, "7");
    await t.scroll(350, 1600);
    await t.say("Tab 2: pengeluaran grup per pos HPP.", 1600, "8");
    await t.click(page.getByRole("button", { name: /2\. Pengeluaran Grup/ }), 1800);
    await t.say("Tab 3: laba-rugi rombongan — omzet, biaya, dan margin.", 1800, "9");
    await t.click(page.getByRole("button", { name: /3\. Rekapan Laba Rugi/ }), 2000);
    await t.top(600);
    await t.say("Cetak laporan A4 atau export ke Excel untuk direksi.", 1800, "10");
    await t.highlight(t.btn("Export Excel"), 1500);
    await t.hush();
    await t.card("Keuangan grup terpantau", "Tutorial berikutnya: menerbitkan Akun Digital UmrahMe.", "Selesai", 2600);
  },
};

T["12-akun-umrahme"] = {
  run: async (t, page) => {
    await t.goto("/umrahme");
    await t.card("Akun Digital UmrahMe", "Terbitkan akun aplikasi jamaah: kartu digital, jadwal, dan panduan umrah di HP.");
    await t.say("Setiap akun memakai 1 kuota lisensi. Sisa saldo tampil di sini.", 2200, "1");
    await t.highlight(t.btn("Top Up Saldo"), 1500);
    await t.say("Isi nama lengkap dan nomor paspor jamaah.", 1600, "2");
    await t.type('input[placeholder="cth. H. Rusli Suparman"]', "Hendra Saputra", { delay: 45 });
    await t.type('input[placeholder="cth. C9824101"]', "X9000100", { delay: 55 });
    await t.say("Pilih grup keberangkatannya — di sini Desember 2026.", 1600, "3");
    await t.select(page.locator("select").filter({ has: page.locator("option", { hasText: "Desember 2026" }) }).first(), { index: 1 }, 1000);
    await t.say("Klik “Terbitkan & Auto-Generate Akun UmrahMe”.", 1700, "4");
    await t.click(t.btn("Terbitkan & Auto-Generate Akun UmrahMe"), 2500);
    await t.say("Akun aktif! Kirim info login ke jamaah lewat WhatsApp.", 2400, "5");
    await t.highlight(page.getByText("Kirim Kredensial via WhatsApp").first(), 2000);
    await t.click(page.getByRole("button", { name: "Tutup", exact: true }).last(), 900);
    await t.say("Banyak jamaah sekaligus? Gunakan “Bulk Import Excel”.", 1800, "6");
    await t.top(500);
    await t.highlight(t.btn("Bulk Import Excel"), 1500);
    await t.say("Semua akun terbit tercatat di daftar bawah, bisa dicari & dikirim ulang.", 2200, "7");
    await t.scrollTo('input[placeholder^="Cari jamaah, paspor"]', 1500);
    await t.hush();
    await t.card("Jamaah terhubung ke UmrahMe", "Tutorial berikutnya: data karyawan, agen & stok perlengkapan.", "Selesai", 2600);
  },
};

T["13-operasional"] = {
  run: async (t, page) => {
    await t.goto("/operasional/karyawan");
    await t.card("Karyawan, Agen & Stok Perlengkapan", "Data kepegawaian, mitra agen, dan kartu stok koper, ihram, mukena.");
    await t.say("Data Karyawan: semua pegawai kantor, terpisah dari akun login sistem.", 2200, "1");
    await t.click(t.btn("Tambah Karyawan"), 1200);
    await t.type('input[placeholder="Zubaidah Rahman"]', "Rahmat Hidayat", { delay: 45 });
    await t.type('input[placeholder="EMT-007"]', "EMS-003", { delay: 50 });
    await t.type('input[placeholder="Kasir Keuangan"]', "Tour Leader", { delay: 45 });
    await t.type('input[placeholder="Keuangan"]', "Operasional", { delay: 45 });
    await t.fill(t.field("Tanggal Masuk", "input"), "2026-11-01", 600);
    await t.type('input[placeholder="081277712345"]', "081299887766", { delay: 40 });
    await t.say("Klik “Tambah Karyawan” untuk menyimpan.", 1400, "2");
    await t.click(page.getByRole("button", { name: "Tambah Karyawan" }).last(), 1800);
    await t.say("Data Agen: mitra perekrut jamaah beserta skema komisinya.", 2000, "3");
    await t.goto("/operasional/agen");
    await t.hover("main table, main ul", 1600);
    await t.say("Stok Perlengkapan: koper, kain ihram, mukena — dengan kartu stok masuk/keluar.", 2400, "4");
    await t.goto("/operasional/stok");
    await t.highlight(t.text("Stok Menipis"), 1300);
    await t.say("Saat perlengkapan dibagikan ke jamaah, klik “Keluar”.", 1700, "5");
    await t.click(page.getByRole("button", { name: "Keluar", exact: true }).nth(1), 1200);
    await t.select(t.field("Barang", "select"), { index: 2 }, 700);
    await t.type('input[placeholder="39"]', "12", { delay: 60 });
    await t.type('input[placeholder^="Dibagikan ke"]', "Dibagikan ke rombongan Desember 2026", { delay: 30 });
    await t.say("Klik “Catat” — sisa stok berkurang otomatis.", 1500, "6");
    await t.click(t.btn("Catat"), 1800);
    await t.say("Riwayat lengkap ada di tab “Kartu Stok”.", 1600, "7");
    await t.click(page.getByRole("button", { name: /Kartu Stok/ }), 2000);
    await t.hush();
    await t.card("Operasional tercatat", "Tutorial berikutnya: membaca laporan.", "Selesai", 2600);
  },
};

T["14-laporan"] = {
  run: async (t, page) => {
    await t.goto("/laporan");
    await t.card("Laporan", "Piutang, booking, manifest, dan audit aktivitas staf — siap cetak & export.");
    await t.say("Laporan utama: piutang jamaah — siapa yang belum lunas dan berapa sisanya.", 2600, "1");
    await t.say("Saring berdasarkan periode dan status pembayaran.", 1700, "2");
    await t.select("main select >> nth=0", "DP", 1500);
    await t.type('input[placeholder^="Cari kode booking"]', "Hendra", { delay: 80 });
    await t.sleep(1200);
    await page.locator('input[placeholder^="Cari kode booking"]').fill("");
    await t.select("main select >> nth=0", { index: 0 }, 900);
    await t.say("Ingatkan jamaah langsung lewat tombol “Kirim WA”.", 1800, "3");
    await t.highlight(t.link("Kirim WA"), 1600);
    await t.say("Cetak atau export ke Excel/CSV untuk rapat atau akuntan.", 1800, "4");
    await t.highlight(t.btn("Export Excel CSV"), 1500);
    await t.say("Tab lain: laporan Booking, Manifest, dan Audit Log aktivitas staf.", 2000, "5");
    await t.click('a[href="/laporan/booking"]', 1800);
    await t.click('a[href="/laporan/aktivitas-staf"]', 2400);
    await t.say("Audit Log mencatat siapa mengubah apa, kapan — berguna untuk pengecekan.", 2400, "6");
    await t.hush();
    await t.card("Laporan siap dibaca", "Tutorial terakhir: pengaturan staf, hak akses & identitas perusahaan.", "Selesai", 2600);
  },
};

T["15-pengaturan-staf-akses"] = {
  run: async (t, page) => {
    await t.goto("/pengaturan");
    await t.card("Pengaturan Staf, Hak Akses & Identitas", "Buat akun staf, batasi menu per role, dan atur kop surat perusahaan.");
    await t.say("Menu Pengaturan: identitas, rekening, layanan, status booking, staf, dan hak akses.", 2600, "1");
    await t.say("Buka “Staf Pengguna” untuk membuat akun login tim.", 1600, "2");
    await t.click('a[href="/pengaturan/staf"]', 1400);
    await t.click(t.btn("Buat Sub-User Baru"), 1200);
    await t.say("Isi nama, pilih role, divisi, cabang, email, dan nomor WhatsApp staf.", 2000, "3");
    await t.type('input[placeholder="Contoh: Muhammad Farhan"]', "Nadia Putri", { delay: 45 });
    await t.select(t.field("Role Sub-User", "select"), { label: "Sub-User Keuangan" }, 800);
    await t.type('input[placeholder^="Contoh: Operasional"]', "Keuangan & Kasir", { delay: 35 });
    await t.type('input[placeholder="nama@elmassa.test"]', "nadia@elmassa.test", { delay: 40 });
    await t.type('input[placeholder="0812-xxxx-xxxx"]', "0812-5566-7788", { delay: 40 });
    await t.say("Ganti password awal dengan yang kuat, lalu sampaikan ke staf secara pribadi.", 2200, "4");
    await t.type('input[type="password"]', "Kasir#Desember26", { delay: 55 });
    await t.click(t.btn("Simpan Sub-User Staf"), 2000);
    await t.say("Atur menu apa saja yang boleh dibuka tiap role di “Hak Akses”.", 2000, "5");
    await t.goto("/pengaturan/hak-akses");
    await t.click(page.getByRole("button", { name: /Sub-User Keuangan/ }), 1500);
    await t.say("Centang izin lihat / tambah / ubah / hapus per modul, lalu simpan matriks.", 2400, "6");
    await t.scroll(350, 1200);
    await t.click(page.locator("tr", { hasText: "Kalender Kegiatan" }).locator('input[type="checkbox"]').first(), 1000);
    await t.click(t.btn("Simpan Perubahan Matriks"), 1800);
    await t.say("Terakhir, “Identitas Perusahaan”: logo, alamat, kontak, TTD & stempel di dokumen.", 2600, "7");
    await t.goto("/pengaturan/identitas");
    await t.scroll(450, 1500);
    await t.scroll(600, 1600);
    await t.hush();
    await t.card("Sistem siap dipakai tim", "Selamat bertugas untuk grup Desember! Putar ulang tutorial kapan saja di /tutorial.", "Selesai", 3200);
  },
};

const wanted = process.argv.slice(2);
const slugs = wanted.includes("all") ? Object.keys(T) : wanted;
if (wanted.includes("all")) {
  await restoreSnapshot();
  await new Promise((r) => setTimeout(r, 2000));
}
let fails = 0;
for (const s of slugs) {
  if (!T[s]) { console.error("unknown", s); continue; }
  const ok = await record(s, T[s].run, { loggedIn: T[s].loggedIn !== false });
  if (!ok) fails++;
}
mergeChapters();
process.exit(fails ? 1 : 0);
