# Integrasi Pendataan Jamaah — untuk repo UmrahMe

Database jamaah terpusat ada di El Massa Web (tabel `jamaah_profiles` dan
`jamaah_documents`). Aplikasi UmrahMe **tidak menulis ke tabel itu langsung**.
Ia memakai salah satu jalur di bawah, dan semua data tetap masuk ke profil yang
sama dengan yang diisi staf kantor.

## Konsep: token pendataan

Setiap profil punya `self_service_token` (48 karakter hex). Token ini yang
membuka form pendataan milik satu jamaah. Staf bisa menyalin atau mengirim
linknya lewat WA dari halaman **Database Jamaah → profil → Link Pendataan
Jamaah**, dan bisa juga menggantinya (link lama langsung mati).

Token ini sengaja dibuat **hanya untuk menulis**:

- NIK, nomor paspor, dan nomor HP yang sudah tersimpan hanya dikembalikan dalam
  bentuk samaran (`••••••1234`).
- Tanggal lahir, tanggal paspor, dan alamat cuma dikabarkan sudah terisi atau
  belum.
- Berkas dokumen tidak bisa diunduh atau dihapus lewat jalur ini.

## Cara mendapatkan token dari UmrahMe

Akun UmrahMe (`jamaah_accounts`) ditautkan ke profil lewat kolom
`jamaah_accounts.jamaah_id`. Untuk jamaah yang sudah login, panggil RPC dengan
anon key (pencocokannya sama persis dengan `jamaah_login`):

```js
const { data: token } = await supabase.rpc("jamaah_pendataan_token", {
  p_kode: kodeAktivasi ?? "",
  p_nama: namaJamaah,
});
// null = akun belum ditautkan ke profil di kantor
```

> Catatan: penautan `jamaah_accounts.jamaah_id` belum otomatis. Untuk sekarang
> diisi staf, atau UmrahMe membuka link yang dikirim staf.

## Pilihan A — buka halaman form yang sudah jadi (paling cepat)

```
${NEXT_PUBLIC_APP_URL}/pendataan/<token>
```

Halaman ini sudah mobile-friendly, bisa ditaruh di tombol "Lengkapi Data" atau
dibuka di WebView. Tidak perlu CORS.

## Pilihan B — bangun form sendiri di UmrahMe, panggil API

Base URL: `${NEXT_PUBLIC_APP_URL}/api/pendataan/<token>`

Origin aplikasi UmrahMe harus didaftarkan di environment El Massa Web:

```
UMRAHME_ORIGINS=https://app.umrahme.id,http://localhost:5173
```

### `GET /api/pendataan/<token>`

```json
{
  "data": {
    "fullName": "Siti Aminah",
    "passportName": "",
    "fatherName": "Abdullah",
    "gender": "P",
    "birthPlace": "Pangkalpinang",
    "passportIssuePlace": "",
    "province": "BANGKA BELITUNG",
    "regency": "KAB. BANGKA",
    "maritalStatus": "MENIKAH",
    "education": "SMA/MA",
    "occupation": "LAINNYA",
    "emergencyName": "Ahmad",
    "emergencyRelation": "Suami",
    "companions": [{ "name": "Ahmad", "relation": "Suami" }],
    "masked": { "nik": "••••••••••••3344", "passportNumber": "•••••567", "phone": "", "emergencyPhone": "••••••••1234" },
    "filled": { "birthDate": true, "passportIssueDate": false, "passportExpiry": true, "address": false, "district": false, "village": false },
    "documents": [{ "docType": "ktp", "docSubtype": "", "uploadedAt": "2026-10-06T03:00:00Z" }],
    "completeness": {
      "status": "Dokumen Belum Lengkap",
      "missingFields": [],
      "missingDocs": ["Kartu Keluarga", "Paspor", "…"],
      "warnings": []
    }
  }
}
```

### `PUT /api/pendataan/<token>` (JSON)

Kirim field yang ingin diisi atau diubah. **Field yang kosong atau tidak
dikirim tidak diubah**, karena form publik tidak pernah tahu isi lamanya.

| Field | Format |
|---|---|
| `fullName` | teks, sesuai KTP / kartu vaksin |
| `passportName` | teks, nama persis di paspor; kosong = sama dengan `fullName` |
| `fatherName` | teks |
| `gender` | `"L"` / `"P"` |
| `birthPlace` | teks |
| `birthDate` | `YYYY-MM-DD` |
| `nik` | 16 digit |
| `passportNumber` | teks |
| `passportIssuePlace` | teks, kota kantor imigrasi penerbit |
| `passportIssueDate`, `passportExpiry` | `YYYY-MM-DD` |
| `phone`, `emergencyPhone` | teks, minimal 9 digit |
| `address`, `emergencyName`, `emergencyRelation` | teks |
| `province`, `regency` | **harus persis** salah satu nilai di `lib/jamaah/siskopatuh-lists.ts` (daftar resmi template Siskopatuh; kabupaten harus milik provinsinya) |
| `district`, `village` | teks (kecamatan, kelurahan/desa) |
| `maritalStatus` | `BELUM MENIKAH` / `MENIKAH` / `JANDA / DUDA` |
| `education` | `TIDAK SEKOLAH`, `SD/MI`, `SMP/MTS`, `SMA/MA`, `D1`, `D2`, `D3`, `D4/S1`, `S2`, `S3` |
| `occupation` | `PNS`, `PEG. SWASTA`, `WIRAUSAHA`, `TNI / POLRI`, `PETANI`, `NELAYAN`, `LAINNYA`, `TIDAK BEKERJA` |
| `companions` | `[{ "name", "relation" }]`, **mengganti seluruh daftar** |

Error `400` → `{ error, fields: { <field>: pesan } }`. Error `409` → NIK atau
paspor sudah dipakai profil lain (nama pemiliknya sengaja tidak disebut).
Respons sukses berisi objek yang sama dengan `GET`.

### `POST /api/pendataan/<token>/documents` (multipart/form-data)

| Field | Isi |
|---|---|
| `docType` | `kk`, `ktp`, `paspor`, `pendukung`, `vaksin`, `pas_foto`, `visa` |
| `docSubtype` | wajib kalau `pendukung`: `akta_kelahiran` / `ijazah` / `buku_nikah` |
| `file` | JPG/PNG/WEBP/PDF, maksimal 5 MB (dicek dari isi berkas, bukan ekstensi) |

Upload ulang jenis yang sama menggantikan berkas lama. Responsnya sama dengan
`GET`.

## Status kelengkapan

Status dihitung saat dibaca, tidak disimpan:

1. **Data Belum Lengkap**: ada field wajib yang kosong, atau paspor berlaku
   kurang dari 6 bulan. Yang wajib adalah gabungan kolom ketiga manifest:
   semua field di tabel atas kecuali `passportName`, `emergencyRelation`, dan
   `companions`.
2. **Dokumen Belum Lengkap**: KK, KTP, Paspor, Dokumen Pendukung, Vaksin, atau
   Pas Foto belum ada.
3. **Siap Diproses**: semua lengkap kecuali Visa (visa diurus travel).
4. **Siap Masuk Manifest**: Visa juga sudah diupload.

Aturannya ada di `lib/jamaah/rules.ts`. Kalau UmrahMe menampilkan status,
pakai `completeness` dari API, jangan menghitung ulang sendiri.
