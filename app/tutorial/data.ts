import chapterData from "./chapters.json";

export type TutorialChapter = { step: string; text: string; t: number };

export type Tutorial = {
  slug: string;
  title: string;
  summary: string;
  category: TutorialCategory;
  /** Menu the video demonstrates, so viewers can jump straight to it. */
  menuHref: string;
  menuLabel: string;
  duration: number;
  chapters: TutorialChapter[];
};

export const TUTORIAL_CATEGORIES = [
  "Mulai di Sini",
  "Grup & Booking",
  "Jamaah & Dokumen",
  "Keuangan",
  "Operasional & Pengaturan",
] as const;

export type TutorialCategory = (typeof TUTORIAL_CATEGORIES)[number];

type TutorialMeta = Omit<Tutorial, "duration" | "chapters">;

// Order = the order a new staff member should watch them in, which is also the
// order work happens for a departure group: open the group, take bookings,
// complete jamaah data, collect payments, prepare documents.
const META: TutorialMeta[] = [
  {
    slug: "01-login-dashboard",
    title: "Login & Mengenal Dashboard",
    summary: "Masuk ke sistem, membaca ringkasan grup & pemasukan, mencari data, dan membuka notifikasi.",
    category: "Mulai di Sini",
    menuHref: "/dashboard",
    menuLabel: "Dashboard",
  },
  {
    slug: "02-jadwal-keberangkatan-hpp",
    title: "Membuat Jadwal Keberangkatan",
    summary: "Menghitung HPP di kalkulator, menentukan harga jual, lalu menerbitkan grup baru ke katalog.",
    category: "Grup & Booking",
    menuHref: "/paket",
    menuLabel: "Jadwal Keberangkatan",
  },
  {
    slug: "03-kelola-grup",
    title: "Mengelola Grup Keberangkatan",
    summary: "Flyer, itinerary, data pembayaran, dan manifest dalam satu halaman grup.",
    category: "Grup & Booking",
    menuHref: "/paket",
    menuLabel: "Jadwal Keberangkatan",
  },
  {
    slug: "04-input-booking",
    title: "Input Booking Jamaah",
    summary: "Mencatat pemesanan, mendaftarkan peserta, DP awal, dan membuka detail booking.",
    category: "Grup & Booking",
    menuHref: "/booking",
    menuLabel: "Booking",
  },
  {
    slug: "05-database-jamaah",
    title: "Database Jamaah",
    summary: "Menambah profil jamaah, melengkapi biodata & paspor, upload dokumen, dan kirim link pendataan.",
    category: "Jamaah & Dokumen",
    menuHref: "/jamaah",
    menuLabel: "Database Jamaah",
  },
  {
    slug: "06-pembayaran-kuitansi",
    title: "Verifikasi Pembayaran & Kuitansi",
    summary: "Mengecek transfer masuk, mencatat setoran tunai, dan mencetak kuitansi resmi.",
    category: "Keuangan",
    menuHref: "/pembayaran",
    menuLabel: "Verifikasi Pembayaran",
  },
  {
    slug: "07-invoice",
    title: "Membuat Invoice Tagihan",
    summary: "Menerbitkan invoice dari kode booking dengan tanggal jatuh tempo pelunasan.",
    category: "Keuangan",
    menuHref: "/dokumen/invoice",
    menuLabel: "Invoice",
  },
  {
    slug: "08-manifest",
    title: "Manifest Peserta",
    summary: "Melengkapi e-visa, e-tiket, kamar, dan status dokumen, lalu export untuk Siskopatuh & maskapai.",
    category: "Jamaah & Dokumen",
    menuHref: "/manifest",
    menuLabel: "Manifest Peserta",
  },
  {
    slug: "09-surat-menyurat",
    title: "Surat Menyurat",
    summary: "Menerbitkan surat rekomendasi paspor, pemberitahuan, dan izin cuti bernomor otomatis.",
    category: "Jamaah & Dokumen",
    menuHref: "/administrasi/surat",
    menuLabel: "Surat Menyurat",
  },
  {
    slug: "10-kalender-kegiatan",
    title: "Kalender Kegiatan",
    summary: "Melihat jadwal keberangkatan & pelunasan, serta menambah manasik dan handling.",
    category: "Grup & Booking",
    menuHref: "/jadwal",
    menuLabel: "Kalender Kegiatan",
  },
  {
    slug: "11-keuangan-grup",
    title: "Pemasukan, Pengeluaran & Rekap Grup",
    summary: "Mencatat pengeluaran, memantau piutang, dan membaca laba-rugi per rombongan.",
    category: "Keuangan",
    menuHref: "/pembayaran/arus-kas",
    menuLabel: "Pemasukan & Pengeluaran",
  },
  {
    slug: "12-akun-umrahme",
    title: "Akun Digital UmrahMe",
    summary: "Menerbitkan akun aplikasi jamaah dan mengirim info login lewat WhatsApp.",
    category: "Jamaah & Dokumen",
    menuHref: "/umrahme",
    menuLabel: "Akun Digital UmrahMe",
  },
  {
    slug: "13-operasional",
    title: "Karyawan, Agen & Stok Perlengkapan",
    summary: "Data pegawai, mitra agen, dan kartu stok koper, ihram, serta mukena.",
    category: "Operasional & Pengaturan",
    menuHref: "/operasional/stok",
    menuLabel: "Data Stok Perlengkapan",
  },
  {
    slug: "14-laporan",
    title: "Laporan",
    summary: "Piutang jamaah, laporan booking, dan audit log aktivitas staf — siap cetak & export.",
    category: "Operasional & Pengaturan",
    menuHref: "/laporan",
    menuLabel: "Laporan",
  },
  {
    slug: "15-pengaturan-staf-akses",
    title: "Pengaturan Staf, Hak Akses & Identitas",
    summary: "Membuat akun staf, mengatur izin per role, dan identitas perusahaan di dokumen.",
    category: "Operasional & Pengaturan",
    menuHref: "/pengaturan",
    menuLabel: "Pengaturan",
  },
];

const byslug = chapterData as Record<string, { duration: number; chapters: TutorialChapter[] }>;

export const TUTORIALS: Tutorial[] = META.map((meta) => ({
  ...meta,
  duration: byslug[meta.slug]?.duration ?? 0,
  chapters: byslug[meta.slug]?.chapters ?? [],
}));

export function videoSrc(slug: string) {
  return `/tutorial/${slug}.mp4`;
}

export function posterSrc(slug: string) {
  return `/tutorial/${slug}.jpg`;
}

/** A frame from the middle of the video — tells videos apart in the playlist better than the title card. */
export function thumbSrc(slug: string) {
  return `/tutorial/${slug}-thumb.jpg`;
}

export function formatDuration(totalSeconds: number) {
  const s = Math.max(0, Math.round(totalSeconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}
