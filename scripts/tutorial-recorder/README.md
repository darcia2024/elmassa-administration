# Perekam Video Tutorial (`/tutorial`)

Merekam ulang 15 video di halaman `/tutorial` dengan Playwright. Aplikasi dijalankan
**lokal** terhadap **database demo** (Postgres sekali-pakai di folder `pgdata/`) berisi
data fiktif. Supabase produksi dan data jamaah asli tidak pernah tersentuh: semua env
yang bisa menjangkau layanan asli ditimpa di `dev-demo.mjs`.

Hasil:

- `public/tutorial/<slug>.mp4` + `<slug>.jpg` (poster)
- `app/tutorial/chapters.json` (durasi + detik tiap langkah, untuk daftar langkah yang bisa diklik)

## Kebutuhan

- Node.js 22.6+ (skrip mengimpor `lib/itinerary-generator.ts` langsung)
- `ffmpeg` dan `ffprobe` di PATH (atau set env `FFMPEG` ke path lengkap `ffmpeg.exe`)

## Langkah

Jalankan dari folder ini (`scripts/tutorial-recorder`). Langkah 1–4 hanya perlu sekali.

```bash
npm install
npx playwright install chromium
```

1. Terminal A — server Postgres demo (biarkan terbuka):

   ```bash
   node db.mjs start
   ```

2. Terminal B — buat database kosong + skema:

   ```bash
   node db.mjs reset
   ```

3. Terminal C — aplikasi di http://localhost:3100 (biarkan terbuka). Pastikan `npm run dev`
   biasa sedang mati, karena keduanya memakai folder `.next` yang sama:

   ```bash
   node dev-demo.mjs
   ```

4. Terminal B — isi data contoh lalu simpan snapshot:

   ```bash
   node seed.mjs
   ```

5. Rekam semua video (DB otomatis dikembalikan ke snapshot dulu, ±25 menit):

   ```bash
   node tutorials.mjs all
   ```

   Satu video saja: `node tutorials.mjs 06-pembayaran-kuitansi` (DB tidak di-reset).

Login demo: `admin@elmassa.test` / `demo12345` (hanya ada di database demo lokal).

## Mengubah atau menambah video

- Naskah tiap video ada di `tutorials.mjs`. Helper (`t.say`, `t.click`, `t.type`, `t.select`,
  `t.highlight`, `t.card`, …) ada di `rec.mjs`.
- Teks `t.say(teks, ms, "nomor")` yang diberi nomor langkah otomatis jadi daftar langkah di
  halaman `/tutorial`.
- Video baru: tambahkan `T["16-…"]` di `tutorials.mjs` dan entri yang sama di
  `app/tutorial/data.ts`.
- Kalau sebuah langkah gagal, rekaman dibatalkan dan screenshot terakhir disimpan di
  `raw/<slug>-fail.png`.
