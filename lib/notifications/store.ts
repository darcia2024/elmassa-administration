import { getPool } from "@/lib/db/connection";
import { parseIndonesianDate, todayWIB } from "@/lib/format/date";
import { listItems } from "@/lib/inventory/store";
import { getStaffViewableModules } from "@/lib/roles/store";

/**
 * Pusat notifikasi operasional.
 *
 * Notifikasi di sini **dihitung dari data yang sedang berlaku**, tidak disimpan
 * sebagai baris tersendiri. Itu keputusan yang disengaja: peringatan "booking
 * BK-001 belum lunas" harus hilang sendiri pada detik pembayarannya masuk.
 * Kalau peringatannya disimpan, ia akan tetap ada sampai ada kode yang ingat
 * menghapusnya -- dan begitu satu jalur lupa, notifikasinya berbohong. Sistem
 * ini tidak punya worker/cron, jadi tidak ada pula yang bisa membersihkannya.
 * Pola yang sama sudah dipakai Laporan (lihat lib/reports/store.ts).
 *
 * Yang **memang** disimpan cuma status "sudah dibaca", di tabel
 * notification_reads, per staf. localStorage tidak dipakai lagi: dulu tiap
 * browser punya daftar sendiri, jadi notifikasi yang sudah ditindaklanjuti
 * seorang staf tetap tampil merah di komputer staf lain.
 *
 * Batas yang jujur perlu ditulis: karena diturunkan dari keadaan sekarang,
 * tidak ada riwayat. Tidak bisa menjawab "kapan peringatan ini pertama muncul"
 * atau "siapa yang menutupnya". Untuk itu perlu tabel kejadian tersendiri, dan
 * itu pekerjaan lain.
 */

export type NotificationSeverity = "kritis" | "peringatan" | "info";
export type NotificationCategory = "Keuangan" | "Dokumen" | "Flight" | "Operasional";

export type OperationalNotification = {
  /** Stabil selama kondisinya sama; berubah saat kondisinya naik tingkat. */
  key: string;
  title: string;
  message: string;
  severity: NotificationSeverity;
  category: NotificationCategory;
  link: string;
  /** Hari menuju kejadian. Negatif = sudah lewat. null = tidak terikat tanggal. */
  daysUntil: number | null;
  read: boolean;
  /**
   * Modul RBAC yang memayungi peringatan ini. Dipakai untuk menyaring daftar
   * sesuai izin staf, lalu dibuang sebelum dikirim ke klien -- id modul tidak
   * ada gunanya di tampilan dan hanya membocorkan struktur perizinan.
   */
  module: string;
};

/**
 * Ambang batas dikumpulkan di satu tempat supaya bisa disetel tanpa menyisir
 * kode. H-14 untuk pelunasan bukan angka karangan -- itu aturan yang sudah
 * dipakai perusahaan dan tertulis di halaman Jadwal ("Tepat Waktu Pelunasan
 * H-14"). Sisanya mengikuti waktu proses dokumen umrah: e-visa perlu waktu
 * terbit, paspor jauh lebih lama karena harus lewat imigrasi.
 */
export const AMBANG = {
  pelunasanHari: 14,
  visaHari: 21,
  pasporHari: 45,
  tiketHari: 14,
  keberangkatanHari: 7,
  seatSepiHari: 30,
  seatSepiPersen: 50,
  seatPenuhPersen: 90,
} as const;

let tableReady = false;

async function ensureTable() {
  if (tableReady) return;
  await getPool().query(`
    CREATE TABLE IF NOT EXISTS notification_reads (
      user_id UUID NOT NULL,
      notification_key TEXT NOT NULL,
      read_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (user_id, notification_key)
    );
    CREATE INDEX IF NOT EXISTS notification_reads_read_at_idx ON notification_reads (read_at);
  `);
  tableReady = true;
}

/** Selisih hari kalender dari hari ini (WIB) ke tanggal ISO yang diberikan. */
function hariMenuju(iso: string | null): number | null {
  if (!iso) return null;
  const hariIni = Date.parse(`${todayWIB()}T00:00:00Z`);
  const target = Date.parse(`${iso}T00:00:00Z`);
  if (Number.isNaN(target)) return null;
  return Math.round((target - hariIni) / 86_400_000);
}

/**
 * Tanggal berangkat sebuah booking. `published_packages.departure_date` yang
 * dipakai lebih dulu karena itu tanggal resmi grupnya; `real_bookings.departure`
 * adalah teks bebas yang diketik staf dan hanya jadi cadangan.
 */
function tanggalBerangkat(row: { pkgDeparture?: unknown; departure?: unknown }): string | null {
  return parseIndonesianDate(row.pkgDeparture) ?? parseIndonesianDate(row.departure);
}

export function labelWaktu(daysUntil: number | null): string {
  if (daysUntil === null) return "Tanpa tenggat";
  if (daysUntil === 0) return "Hari ini";
  if (daysUntil > 0) return `H-${daysUntil}`;
  return `Lewat ${Math.abs(daysUntil)} hari`;
}

function rupiah(value: unknown): string {
  return `Rp ${Math.round(Number(value) || 0).toLocaleString("id-ID")}`;
}

/* ------------------------------------------------------------------ *
 * Sumber-sumber notifikasi
 * ------------------------------------------------------------------ */

async function dariPelunasan(): Promise<OperationalNotification[]> {
  const res = await getPool().query(`
    SELECT
      b.code, b.customer_name AS "customerName", b.departure,
      b.total_amount AS "totalAmount", b.paid_amount AS "paidAmount",
      b.remaining_amount AS "remainingAmount", b.status,
      p.departure_date AS "pkgDeparture"
    FROM real_bookings b
    LEFT JOIN published_packages p ON p.id = b.package_id;
  `);

  const keluar: OperationalNotification[] = [];

  for (const row of res.rows) {
    // Kolom uang bertipe numeric -- pg mengembalikannya sebagai string, jadi
    // perbandingan tanpa Number() akan membandingkan teks, bukan angka.
    const sisa = Number(row.remainingAmount) || 0;
    if (sisa <= 0) continue;

    const hari = hariMenuju(tanggalBerangkat(row));
    if (hari === null) continue;

    const dasar = {
      category: "Keuangan" as const,
      module: "booking",
      link: `/booking/${encodeURIComponent(row.code)}`,
      daysUntil: hari,
      read: false,
    };

    if (hari < 0) {
      keluar.push({
        ...dasar,
        key: `pelunasan-lewat:${row.code}`,
        severity: "kritis",
        title: `Belum lunas padahal sudah berangkat — ${row.customerName}`,
        message: `${row.code} masih kurang ${rupiah(sisa)} dari total ${rupiah(row.totalAmount)}. Keberangkatannya sudah lewat ${Math.abs(hari)} hari.`,
      });
    } else if (hari <= AMBANG.pelunasanHari) {
      keluar.push({
        ...dasar,
        key: `pelunasan-h14:${row.code}`,
        severity: "kritis",
        title: `Pelunasan mepet — ${row.customerName}`,
        message: `Berangkat ${hari === 0 ? "hari ini" : `${hari} hari lagi`}, sisa tagihan ${rupiah(sisa)}. Batas pelunasan perusahaan H-${AMBANG.pelunasanHari}.`,
      });
    }
  }

  return keluar;
}

async function dariDokumenJamaah(): Promise<OperationalNotification[]> {
  const res = await getPool().query(`
    SELECT
      pa.id, pa.booking_code AS "bookingCode", pa.name,
      pa.passport_number AS "passportNumber", pa.visa_number AS "visaNumber",
      -- Diformat di SQL, bukan di JS. Kolom visa_expiry bertipe date, dan pg
      -- mengembalikannya sebagai objek Date -- String()-nya jadi
      -- "Tue Aug 25 2026 00:00:00 GMT+0700", yang tidak dikenali parser
      -- tanggal mana pun di sini, sehingga peringatannya diam-diam tidak
      -- pernah muncul.
      TO_CHAR(pa.visa_expiry, 'YYYY-MM-DD') AS "visaExpiry",
      pa.ticket_number AS "ticketNumber",
      b.departure, b.package_id AS "packageId",
      p.departure_date AS "pkgDeparture", p.return_date AS "pkgReturn"
    FROM participants pa
    LEFT JOIN real_bookings b ON b.code = pa.booking_code
    LEFT JOIN published_packages p ON p.id = b.package_id;
  `);

  const keluar: OperationalNotification[] = [];

  for (const row of res.rows) {
    const hari = hariMenuju(tanggalBerangkat(row));
    if (hari === null || hari < 0) continue;

    const dasar = {
      category: "Dokumen" as const,
      module: "manifest",
      link: "/manifest",
      daysUntil: hari,
      read: false,
    };

    const kosong = (v: unknown) => !String(v ?? "").trim();

    if (kosong(row.passportNumber) && hari <= AMBANG.pasporHari) {
      keluar.push({
        ...dasar,
        key: `paspor-belum:${row.id}`,
        severity: hari <= AMBANG.visaHari ? "kritis" : "peringatan",
        title: `Nomor paspor belum ada — ${row.name}`,
        message: `Berangkat ${hari} hari lagi (${row.bookingCode}). Pengurusan paspor lewat imigrasi butuh waktu paling lama di antara semua dokumen.`,
      });
    }

    if (kosong(row.visaNumber) && hari <= AMBANG.visaHari) {
      keluar.push({
        ...dasar,
        key: `visa-belum:${row.id}`,
        severity: "kritis",
        title: `E-visa belum terbit — ${row.name}`,
        message: `Berangkat ${hari} hari lagi (${row.bookingCode}). Tanpa visa, jamaah ini tidak bisa diberangkatkan.`,
      });
    }

    if (kosong(row.ticketNumber) && hari <= AMBANG.tiketHari) {
      keluar.push({
        ...dasar,
        key: `tiket-belum:${row.id}`,
        severity: "peringatan",
        title: `Nomor e-tiket belum diisi — ${row.name}`,
        message: `Berangkat ${hari} hari lagi (${row.bookingCode}). Manifest maskapai belum bisa dikunci tanpa ini.`,
      });
    }

    // Visa yang habis sebelum rombongan pulang = jamaah tertahan di sana.
    const expiry = parseIndonesianDate(row.visaExpiry);
    const pulang = parseIndonesianDate(row.pkgReturn);
    if (expiry && pulang && expiry < pulang) {
      keluar.push({
        ...dasar,
        key: `visa-kedaluwarsa:${row.id}`,
        severity: "kritis",
        title: `Visa habis sebelum jadwal pulang — ${row.name}`,
        message: `Visa berlaku sampai ${expiry}, sedangkan rombongan baru pulang ${pulang}. Perlu diperpanjang atau diterbitkan ulang.`,
      });
    }
  }

  return keluar;
}

async function dariPembayaran(): Promise<OperationalNotification[]> {
  const res = await getPool().query(`
    SELECT id, booking_code AS "bookingCode", amount,
           TO_CHAR(payment_date, 'YYYY-MM-DD') AS "paymentDate", status
    FROM payments
    WHERE status IS DISTINCT FROM 'Terverifikasi';
  `);

  return res.rows.map((row) => {
    const hari = hariMenuju(row.paymentDate);
    return {
      key: `bayar-belum-verif:${row.id}`,
      severity: "peringatan" as const,
      category: "Keuangan" as const,
      title: `Pembayaran menunggu verifikasi kasir`,
      message: `${rupiah(row.amount)} pada ${row.bookingCode} masuk ${row.paymentDate ?? "tanpa tanggal"} dan belum dicek. Selama belum diverifikasi, angkanya tidak dihitung sebagai kas masuk.`,
      link: "/pembayaran",
      daysUntil: hari,
      read: false,
      module: "pembayaran",
    };
  });
}

async function dariCicilan(): Promise<OperationalNotification[]> {
  const res = await getPool().query(`
    SELECT id, booking_code AS "bookingCode", sequence, label,
           TO_CHAR(due_date, 'YYYY-MM-DD') AS "dueDate",
           amount, paid_amount AS "paidAmount", status
    FROM installments
    WHERE status NOT IN ('Lunas', 'Dibatalkan');
  `);

  const keluar: OperationalNotification[] = [];

  for (const row of res.rows) {
    const hari = hariMenuju(row.dueDate);
    if (hari === null || hari >= 0) continue;

    const sisa = (Number(row.amount) || 0) - (Number(row.paidAmount) || 0);
    if (sisa <= 0) continue;

    keluar.push({
      key: `cicilan-lewat:${row.id}`,
      severity: "kritis",
      category: "Keuangan",
      title: `Cicilan lewat jatuh tempo — ${row.bookingCode}`,
      message: `Termin ${row.sequence}${row.label ? ` (${row.label})` : ""} jatuh tempo ${row.dueDate}, lewat ${Math.abs(hari)} hari. Sisa ${rupiah(sisa)}.`,
      link: "/pembayaran/cicilan",
      daysUntil: hari,
      read: false,
      module: "pembayaran",
    });
  }

  return keluar;
}

async function dariKeberangkatan(): Promise<OperationalNotification[]> {
  const res = await getPool().query(`
    SELECT
      p.id, p.name, p.departure_date AS "pkgDeparture", p.target_pax AS "targetPax",
      COALESCE(SUM(b.participants), 0)::int AS "bookedSeats"
    FROM published_packages p
    LEFT JOIN real_bookings b ON b.package_id = p.id
    GROUP BY p.id, p.name, p.departure_date, p.target_pax;
  `);

  const keluar: OperationalNotification[] = [];

  for (const row of res.rows) {
    const hari = hariMenuju(parseIndonesianDate(row.pkgDeparture));
    if (hari === null || hari < 0) continue;

    const kuota = Number(row.targetPax) || 0;
    const terisi = Number(row.bookedSeats) || 0;
    const persen = kuota > 0 ? (terisi / kuota) * 100 : 0;

    if (hari <= AMBANG.keberangkatanHari) {
      keluar.push({
        key: `keberangkatan-dekat:${row.id}:${hari}`,
        severity: "info",
        category: "Flight",
        title: `Keberangkatan ${hari === 0 ? "hari ini" : `${hari} hari lagi`} — ${row.name}`,
        message: `${terisi} dari ${kuota} seat terisi. Pastikan manifest, handling bandara, dan dokumen sudah final.`,
        link: `/manifest?packageId=${encodeURIComponent(row.id)}`,
        daysUntil: hari,
        read: false,
        module: "manifest",
      });
    }

    if (kuota > 0 && persen >= AMBANG.seatPenuhPersen && terisi < kuota) {
      keluar.push({
        key: `seat-hampir-penuh:${row.id}`,
        severity: "info",
        category: "Flight",
        title: `Kuota hampir penuh — ${row.name}`,
        message: `Tersisa ${kuota - terisi} seat dari ${kuota} (${persen.toFixed(0)}% terisi).`,
        link: "/paket/seat",
        daysUntil: hari,
        read: false,
        module: "paket",
      });
    }

    if (kuota > 0 && persen < AMBANG.seatSepiPersen && hari <= AMBANG.seatSepiHari) {
      keluar.push({
        key: `seat-sepi:${row.id}`,
        severity: "peringatan",
        category: "Flight",
        title: `Grup masih sepi menjelang berangkat — ${row.name}`,
        message: `Baru ${terisi} dari ${kuota} seat (${persen.toFixed(0)}%) dan berangkat ${hari} hari lagi. Biaya tetap grup ditanggung peserta yang ada.`,
        link: "/paket/seat",
        daysUntil: hari,
        read: false,
        module: "paket",
      });
    }
  }

  return keluar;
}

async function dariStok(): Promise<OperationalNotification[]> {
  const items = await listItems();

  return items
    .filter((item) => item.isLow)
    .map((item) => ({
      key: `stok-menipis:${item.id}`,
      severity: "peringatan" as const,
      category: "Operasional" as const,
      title: `Stok menipis — ${item.name}`,
      message: `Sisa ${item.stock} ${item.unit}, di bawah batas minimum ${item.minimumStock}. Perlengkapan ini dibagikan ke jamaah sebelum berangkat.`,
      link: "/operasional/stok",
      daysUntil: null,
      read: false,
      module: "inventaris",
    }));
}

/* ------------------------------------------------------------------ *
 * Perakitan
 * ------------------------------------------------------------------ */

const BOBOT: Record<NotificationSeverity, number> = { kritis: 0, peringatan: 1, info: 2 };

/** Bentuk yang dikirim ke klien: tanpa id modul internal. */
export type NotificationForClient = Omit<OperationalNotification, "module">;

export async function listNotifications(userId: string): Promise<NotificationForClient[]> {
  await ensureTable();

  // Satu sumber yang gagal tidak boleh mematikan seluruh pusat notifikasi --
  // lebih baik menampilkan sebagian daripada bel yang kosong tanpa penjelasan.
  const [sumber, modulBoleh, dibaca] = await Promise.all([
    Promise.allSettled([
      dariPelunasan(),
      dariDokumenJamaah(),
      dariPembayaran(),
      dariCicilan(),
      dariKeberangkatan(),
      dariStok(),
    ]),
    getStaffViewableModules(userId),
    getPool().query(`SELECT notification_key FROM notification_reads WHERE user_id = $1;`, [userId]),
  ]);

  const semua: OperationalNotification[] = [];
  for (const hasil of sumber) {
    if (hasil.status === "fulfilled") semua.push(...hasil.value);
    else console.error("Sumber notifikasi gagal:", hasil.reason);
  }

  const setDibaca = new Set<string>(dibaca.rows.map((r) => r.notification_key));

  return semua
    .filter((n) => modulBoleh.has(n.module))
    .map(({ module: _module, ...n }) => ({ ...n, read: setDibaca.has(n.key) }))
    .sort((a, b) => {
      if (a.read !== b.read) return a.read ? 1 : -1;
      if (BOBOT[a.severity] !== BOBOT[b.severity]) return BOBOT[a.severity] - BOBOT[b.severity];
      // Yang tenggatnya paling dekat (atau paling lama lewat) naik duluan.
      return (a.daysUntil ?? 9999) - (b.daysUntil ?? 9999);
    });
}

export async function markRead(userId: string, keys: string[]): Promise<void> {
  if (keys.length === 0) return;
  await ensureTable();
  await getPool().query(
    `INSERT INTO notification_reads (user_id, notification_key)
     SELECT $1, UNNEST($2::text[])
     ON CONFLICT (user_id, notification_key) DO NOTHING;`,
    [userId, keys],
  );
}

export async function markUnread(userId: string, keys: string[]): Promise<void> {
  if (keys.length === 0) return;
  await ensureTable();
  await getPool().query(
    `DELETE FROM notification_reads WHERE user_id = $1 AND notification_key = ANY($2::text[]);`,
    [userId, keys],
  );
}

/**
 * Kunci notifikasi ikut memuat tingkat keparahannya (`pelunasan-h14:` vs
 * `pelunasan-lewat:`). Efeknya disengaja: begitu sebuah kondisi naik tingkat,
 * kuncinya berubah dan notifikasinya muncul lagi sebagai belum dibaca. Staf
 * yang sudah menutup "pelunasan mepet" tetap akan ditegur ulang ketika booking
 * yang sama berubah jadi "sudah berangkat tapi belum lunas".
 */
export async function bersihkanBacaanLama(hari = 90): Promise<void> {
  await ensureTable();
  await getPool().query(
    `DELETE FROM notification_reads WHERE read_at < NOW() - ($1 || ' days')::interval;`,
    [String(hari)],
  );
}
