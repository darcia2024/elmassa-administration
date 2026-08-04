# Serah-Terima: El Massa Web

Dokumen ini buat sesi/akun baru yang mau nerusin perbaikan repo ini. Baca sampai
habis sebelum ngoding — ada beberapa jebakan yang nggak kelihatan dari kode.

**Repo:** https://github.com/darcia2024/elmassa-administration
**Lokasi lokal:** `C:\Users\ASUS\OneDrive\Documents\El Massa Web`
**Stack:** Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind · Supabase (Postgres via `pg`)

Ini sistem manajemen travel umrah: paket, kalkulator HPP, booking, pembayaran,
manifest jamaah, laporan. Dipakai staf PT El Massa Tour & Travel.

---

## 1. Hal terpenting: aplikasi ini punya 3 lapisan data

Jangan berasumsi sebuah fitur "jalan" cuma karena halamannya kelihatan lengkap.

| Lapisan | Simpan di | Sinkron antar device | Fitur |
|---|---|---|---|
| **A. Supabase** | Cloud | Ya | Paket, Kalkulator HPP, Seat, Booking (list & buat), Detail booking, Catatan Revisi, UmrahMe, **Login & Staf** |
| **B. localStorage** | Per browser | Tidak | Pelanggan, Pembayaran, Invoice, Kuitansi, Lisensi |
| **C. Hardcoded** | Nggak disimpan | — | ~22 halaman: semua Laporan, Manifest, Jadwal, Dokumen, Pembayaran/form & cicilan, Pengaturan (hak-akses, identitas, layanan, rekening, status-booking), Pelanggan detail |

Lapisan C itu tampilan kosong. Contoh: `app/laporan/pendapatan/page.tsx` isinya
`const incomeRows: IncomeRowItem[] = []` — array kosong yang di-hardcode. Mau ada
1000 booking pun laporannya tetap kosong selamanya.

### Cara cepat ngecek lapisan sebuah halaman

```bash
# ganti <halaman> sesuai folder di app/
grep -c 'fetch("/api' app/<halaman>/page.tsx    # >0 berarti lapisan A
grep -c 'localStorage'  app/<halaman>/page.tsx  # >0 berarti lapisan B
```

Hati-hati: sebagian halaman cuma pembungkus yang manggil komponen di file sebelah
(contoh `app/paket/page.tsx` → `app/paket/package-list.tsx`). Cek file `.tsx` lain
di folder yang sama. Path yang mengandung `[bracket]` juga bikin glob bash meleset.

---

## 2. Temuan penting soal database

**Ke-17 tabel dari schema Drizzle SUDAH ADA di Supabase.** Migrasinya pernah
dijalankan. Tabelnya kosong dan **nol kode yang memakainya**:

```
bookings, customers, invoices, payments, receipts, installments, participants,
packages, schedules, schedule_departures, manifest_exports, company_identity,
service_types, bank_accounts, booking_statuses, staff_users, users
```

Yang benar-benar dipakai sekarang cuma 5 tabel ad-hoc yang dibuat lewat
`CREATE TABLE IF NOT EXISTS` di dalam route:

```
published_packages, real_bookings, real_customers, jamaah_accounts, page_revision_notes
```

Plus `staff_users` (tabel Drizzle yang sudah ada, kami tambah 3 kolom password).

**Artinya:** kerjaan nyambungin fitur jauh lebih ringan dari kelihatannya. Nggak
perlu bikin tabel dari nol — tinggal tulis kode yang pakai tabel yang sudah ada.

Cek isi database kapan saja:

```bash
node --env-file=.env.local -e "import('pg').then(async({default:pg})=>{const p=new pg.Pool({connectionString:process.env.DATABASE_URL,ssl:{rejectUnauthorized:false}});const r=await p.query(\"SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY 1\");console.log(r.rows.map(x=>x.table_name).join('\n'));await p.end()})"
```

---

## 3. Yang sudah dikerjakan

Jangan percaya daftar commit manual di sini — dokumen ini sudah pernah ketinggalan
satu commit penuh (fitur Pelanggan tersambung ke Supabase sempat kekerjain tanpa
kecatat di sini sama sekali). Cek langsung:

```bash
git log --oneline -20
```

Ringkasan per 2026-08-04: Pelanggan, Pembayaran + Kuitansi, Invoice + Dokumen, dan
Laporan (Piutang/Pendapatan/Transaksi) semuanya sudah tersambung ke Supabase —
lihat bagian 6.1 di bawah, sudah dicoret. Booking/Okupansi Seat, Manifest, dan
Audit Log Staf dikasih placeholder "Segera Hadir" yang jujur, bukan disambungin —
lihat bagian 6.2 buat alasannya (butuh data model baru, bukan cuma nyambungin ke
tabel yang sudah ada).

Detail yang perlu diingat:

**Kalkulator HPP** (`app/paket/kalkulator/page.tsx`) — mode edit dikendalikan
`?edit=<packageId>` di URL, bukan localStorage. Dulu payload-nya dihapus begitu
dibaca, jadi refresh bikin semua balik template dan publish bikin paket duplikat.
localStorage sekarang cuma cache biar nggak nge-blank saat loading.

**Auth** (`lib/auth/session.ts`, `lib/auth/staff-store.ts`) — password disimpan
sebagai hash scrypt + salt per baris. Token sesi ditandatangani HMAC-SHA256 pakai
Web Crypto (bukan `node:crypto`) supaya bisa diverifikasi di edge runtime tempat
`proxy.ts` jalan. Cookie `httpOnly`, umur 12 jam.

**Guard hapus-massal** (`lib/db/destructive-guard.ts`) — `POST /api/reset-all-data`
dan `DELETE /api/packages?all=true` nolak jalan kecuali `ALLOW_DATA_RESET=true`.
Dulu dua-duanya bisa dipanggil siapa saja tanpa login dan langsung `TRUNCATE`.

---

## 4. Environment

`.env.local` (di-gitignore, jangan pernah di-commit):

```
DATABASE_URL=          # connection string Supabase, WAJIB pooler port 6543
NEXTAUTH_SECRET=       # dipakai nandatangani token sesi, wajib ada
NEXT_PUBLIC_APP_URL=
# ALLOW_DATA_RESET=true        # cuma saat sengaja mau hapus semua data
# INITIAL_ADMIN_PASSWORD=      # password admin pertama saat staff_users masih kosong
```

**Port 6543 (transaction pooler), bukan 5432.** Yang 5432 itu session pooler,
nahan koneksi lebih lama dan gampang bikin kehabisan slot di API route.

Kalau muncul `ECIRCUITBREAKER: too many authentication failures`, itu Supabase
lagi nge-block sementara gara-gara percobaan auth gagal berulang. Tunggu beberapa
menit, dan pastikan `DATABASE_URL` benar.

---

## 5. Menjalankan & memverifikasi

```bash
npm run dev        # dev server
npx tsc --noEmit   # typecheck, harus exit 0
npm run build      # build produksi
```

Catatan:
- `npm run build` butuh internet buat narik font Manrope dari Google Fonts. Kalau
  offline, build gagal di `next/font` — itu bukan error kode.
- Turbopack kadang nyangkut nge-cache error parse lama: halaman kelihatan normal
  tapi React nggak hidrasi (tombol nggak bereaksi). Restart dev server.
- Login default: `azriandri@elmassa.test`. Passwordnya di-seed dari
  `INITIAL_ADMIN_PASSWORD`, default `admin123` — **harus diganti**.

Cara ngetes API cepat tanpa UI — buka DevTools di halaman aplikasi, lalu:

```js
await (await fetch('/api/staff-users')).json()
```

---

## 6. Yang belum dikerjakan, urut prioritas

### 6.1 Nyambungin fitur (pekerjaan utama) — SELESAI per 2026-08-04

Polanya sama tiap fitur: **tabel (sudah ada) → API baca tabel itu → UI dipanggil ke API**.
Semua 4 poin di bawah beres — detail & bukti verifikasi ada di pesan commit masing-masing
(`git log`), jangan diringkas ulang di sini biar nggak basi lagi.

1. ✅ **Pelanggan** — `lib/customers/store.ts`, list + detail halaman.
2. ✅ **Pembayaran + Kuitansi** — `lib/payments/store.ts`, `lib/receipts/store.ts`,
   `lib/installments/store.ts` (Cicilan awalnya nggak punya form input sama sekali,
   dibikinin dari nol). Kuitansi terbit otomatis per pembayaran, terbilang Rupiah asli.
3. ✅ **Invoice & Dokumen** — `lib/invoices/store.ts`. Paid/remaining/status dihitung
   live dari `real_bookings`, nggak disimpan dobel.
4. ✅ **Laporan** (Piutang/Pendapatan/Transaksi) — `lib/reports/store.ts`, dihitung
   dari data 1–3 sesuai saran di atas, bukan tabel sendiri. Margin/HPP ditandain
   "belum tersedia" (bukan angka fiktif) karena nggak ada data cost di Supabase.
   **Booking/Okupansi Seat, Manifest, dan Audit Log Staf TIDAK disambungin** —
   kebentur data model yang belum ada sama sekali (kuota seat per jadwal, data
   paspor per-jamaah, sistem audit-log). Sekarang halaman itu (+ `/manifest`,
   `/manifest/cetak`) nampilin placeholder "Segera Hadir" yang jujur lewat
   `components/coming-soon.tsx`, bukan data dummy yang keliatan asli. Ini
   keputusan scope, bukan kelupaan — kalau mau beneran dibangun, itu proyek baru
   (nangkep data participant per booking, kuota per jadwal, dst), bukan "connect
   ke tabel yang sudah ada".

Ada 26 route yang masih balikin `source: "dummy"`. Cari semua:

```bash
grep -rl 'source: "dummy"' app/api
```

### 6.2 Utang teknis & keamanan

- ✅ **Token bisa dicabut — SELESAI per 2026-08-04.** `proxy.ts` sekarang cek
  `staff_users.status` ke DB tiap request lewat `isStaffActive()`
  (`lib/auth/staff-store.ts`), bukan cuma verifikasi tanda tangan token.
  Catatan penting yang sempat salah: dokumen ini sebelumnya bilang `proxy.ts`
  jalan di Edge runtime dan nggak bisa connect DB — itu **asumsi yang nggak
  pernah dicek**, dan salah. Next 16 bikin `proxy.ts` default ke **Node.js
  runtime** (lihat `node_modules/next/dist/docs/.../file-conventions/proxy.md`,
  changelog v16.0.0), jadi `pg`/`getPool()` jalan normal di sana. Fail-closed
  kalau query DB-nya error (anggap nggak aktif) — konsekuensinya satu query
  tiap request ke API yang butuh login, sesuai perkiraan awal di dokumen ini.
  Diverifikasi manual: login → deaktivasi akun langsung di DB (token tetap
  valid & belum expired) → API langsung nolak 401 → reaktivasi → akses balik
  normal.
- **`lib/seed-data/`** — 11 file tersisa (dari 16) setelah Pelanggan/Pembayaran/
  Invoice/Laporan tersambung: `receipts.ts`, `installments.ts`, `invoices.ts`,
  `customer-history.ts`, `staff-users.ts` udah dihapus (nol importer). Sisanya
  (`bookings.ts`, `schedules.ts`, `packages.ts`, `customers.ts`, `payments.ts`,
  dll) masih dipakai `derived.ts` buat Dashboard dan halaman lain yang belum
  disentuh — jangan dihapus sampai halaman itu ikut tersambung.
- **Drizzle vs raw `pg` — DIPUTUSIN: raw `pg` doang.** Nggak ada satupun route
  yang query lewat Drizzle (`lib/db/index.ts` udah dihapus, 0 importer).
  `drizzle-kit` & `drizzle.config.ts` juga udah dibuang — migrasi sekarang raw
  SQL manual ke Supabase, direfleksiin ke `schema.ts` manual sesudahnya (lihat
  komentar di atas `schema.ts`). `schema.ts` sendiri **dipertahankan** cuma
  buat tipe (`$inferSelect`) & dokumentasi bentuk tabel — makanya dependency
  `drizzle-orm` masih ada di `package.json`, cuma `drizzle-kit` yang hilang.
  File SQL lama di `/drizzle` dibiarin sebagai arsip historis, bukan sesuatu
  yang masih dijalanin.
- **Gate auth di halaman masih client-side.** `components/app-shell.tsx` cuma
  ngecek objek di localStorage, jadi orang bisa nyuntik lewat DevTools dan lihat
  UI-nya. Data tetap aman karena API sudah dijaga cookie, tapi idealnya halaman
  juga divalidasi server-side.
- **`publicApiPrefixes` di `proxy.ts`** masih melepas `/api/packages`,
  `/api/bookings`, `/api/revision-notes`, `/api/schedules` tanpa auth — supaya UI
  yang belum login nggak rusak. Perketat setelah semua halaman lewat login.

### 6.3 Keputusan yang nunggu pemilik (bang Daru)

- **Durasi paket salah di katalog.** Saat publish, `duration` dihitung dari
  `makkahNights + madinahNights` (= "10 Hari"), padahal field "Total Durasi
  Program" di form berisi 12 dan itinerary-nya juga 12 hari. Kartu paket jadi
  kontradiktif. Belum diubah karena ini teks yang dibaca jamaah.
  Lokasi: `app/paket/kalkulator/page.tsx`, di `handleConfirmPublish`.
- **Sisa halaman hardcoded** (Booking/Okupansi Seat, Manifest, Audit Log Staf)
  per 2026-08-04 udah dikasih label "Segera Hadir" (lihat 6.1) — bukan diputusin
  disambungin, karena butuh data model baru (kuota seat, data paspor per-jamaah,
  audit-log). Kalau bang Daru mau salah satu dari ini beneran dibangun, itu kerjaan
  baru: rancang dulu data apa yang perlu ditangkep, baru sambungin.
- **Paket Oktober masih pakai kurs 4300.** Template sudah 4780. Kalau paket itu
  mau ikut naik, harus dibuka di mode edit lalu diterbitkan ulang — dan harga
  jualnya naik dari Rp 34.526.744 jadi Rp 35.483.174 (+Rp 956.430/pax).

### 6.4 Kebersihan kredensial — TUGAS PEMILIK, belum beres

- **Rotate password database Supabase.** Password lama ada di git history dan
  nggak bisa dihapus dari sana; rotate satu-satunya cara menutupnya.
- **Revoke token GitHub.** Ada token yang tertanam plaintext di `.git/config`
  repo lokal (`git remote -v` buat lihat). Ganti remote jadi bersih:
  `git remote set-url origin https://github.com/darcia2024/elmassa-administration.git`
- **Set `DATABASE_URL` di hosting** kalau situsnya di-deploy. Tanpa itu semua
  endpoint database balikin 500 setelah commit `49a57c0` ke-deploy.

---

## 7. Konvensi yang dipakai

- Akses database lewat `getPool()` dari `lib/db/connection.ts`. Jangan bikin
  `new Pool()` sendiri, jangan hardcode connection string.
- Route baru ikut pola `ensureTable()` yang sudah ada, atau pakai tabel Drizzle
  yang sudah tersedia.
- Balikin `{ data, meta }` buat sukses dan `{ error, fields? }` buat gagal —
  itu bentuk yang sudah dipakai route lain.
- Jangan pernah kirim `password_hash` / `password_salt` ke klien.
- **Verifikasi pakai nilai yang beda dari default.** Ini penting: pernah ada bug
  kelewat karena nilai tersimpan kebetulan sama persis dengan nilai template
  (kurs 4300, harga koper 450.000), jadi "kemuat dari database" dan "balik ke
  template" nggak bisa dibedakan. Selalu tes pakai angka yang mencolok.

---

## 8. Kalimat pembuka buat sesi baru

> Gue mau lanjutin perbaikan repo sistem manajemen travel El Massa di
> `C:\Users\ASUS\OneDrive\Documents\El Massa Web`. Baca `HANDOFF.md` di root repo
> dulu — isinya kondisi terkini, apa yang udah dibenerin, dan daftar kerjaan yang
> belum. Habis baca, lanjut ke bagian 6.1 nomor 1 (nyambungin fitur Pelanggan ke
> Supabase).
