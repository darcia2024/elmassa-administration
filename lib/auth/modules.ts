/**
 * The single list of permission-gated modules, and the map from API route to
 * module. Shared by proxy.ts (enforcement) and the Hak Akses page (the UI that
 * edits permissions for these same modules) so the two can never drift apart --
 * that exact drift (a matrix UI describing modules the code doesn't enforce)
 * is what made the old hak-akses page pure decoration.
 */

export type ModuleAction = "view" | "edit" | "approve" | "delete";

export type ModuleDef = {
  id: string;
  name: string;
  category: "Utama" | "Operasional" | "Keuangan" | "Sistem";
  description: string;
};

export const MODULES: ModuleDef[] = [
  { id: "dash", name: "Dashboard Utama", category: "Utama", description: "Statistik operasional, pendapatan, & quick action." },
  { id: "paket", name: "Katalog & Calculator HPP Paket", category: "Utama", description: "Merancang paket umrah, harga, & HPP simulator." },
  // id stays "jadwal" -- it is the key stored in role_permissions, so renaming
  // it would silently reset every role's access to this module.
  { id: "jadwal", name: "Kalender Kegiatan", category: "Utama", description: "Agenda manasik, handling, batas pelunasan, & keberangkatan." },
  { id: "pelanggan", name: "CRM Data Pelanggan", category: "Operasional", description: "Database jamaah, riwayat booking, & kontak." },
  { id: "booking", name: "Manajemen Booking", category: "Operasional", description: "Input pendaftaran, status DP, & assignment kamar." },
  { id: "manifest", name: "Manifest Peserta & Flight", category: "Operasional", description: "Paspor, E-Visa, rooming hotel, & bus handling." },
  { id: "umrahme", name: "Akun Digital UmrahMe", category: "Operasional", description: "Aktivasi & pantau akun digital jamaah pasca-booking." },
  { id: "pembayaran", name: "Kasir Pembayaran & Cicilan", category: "Keuangan", description: "Verifikasi DP, pencatatan cicilan, & cetak kuitansi." },
  { id: "dokumen", name: "Invoice & Surat Kemenag", category: "Keuangan", description: "Cetak invoice resmi & surat rekomendasi paspor." },
  { id: "laporan", name: "Laporan Pendapatan & Piutang", category: "Keuangan", description: "Analisis keuangan, piutang jamaah, & laporan omset." },
  { id: "pengaturan", name: "Pengaturan Identitas & Staf", category: "Sistem", description: "Legalitas perijinan, rekening bank, & kelola staf." },
  { id: "surat", name: "Surat Menyurat & Rekomendasi", category: "Operasional", description: "Surat pemberitahuan, rekomendasi paspor, & izin cuti." },
  { id: "kepegawaian", name: "Data Karyawan", category: "Operasional", description: "Data kepegawaian, jabatan, kontrak, & gaji." },
  { id: "agen", name: "Data Agen & Komisi", category: "Operasional", description: "Mitra perekrut jamaah, skema komisi, & rekap rekrutan." },
  { id: "inventaris", name: "Stok Perlengkapan", category: "Operasional", description: "Koper, kain ihram, buku doa — stok masuk & keluar." },
];

export const MODULE_IDS = MODULES.map((m) => m.id);

export function emptyPermissions(): Record<ModuleAction, boolean> {
  return { view: false, edit: false, approve: false, delete: false };
}

export function fullPermissions(): Record<ModuleAction, boolean> {
  return { view: true, edit: true, approve: true, delete: true };
}

/**
 * Route prefix (relative to /api/) -> module. `null` marks a route as
 * deliberately exempt from module gating (still requires an active session
 * unless the whole prefix is in proxy.ts's publicApiPrefixes). A prefix with
 * no entry here at all is NOT the same as `null` -- proxy.ts treats an
 * unmapped route as unrecognised and denies it, so a new route always has to
 * be registered here on purpose instead of silently falling through open.
 */
const ROUTE_MODULE_MAP: Array<{ prefix: string; module: string | null }> = [
  { prefix: "activity-log", module: "laporan" },
  { prefix: "agenda", module: "jadwal" },
  { prefix: "agents", module: "agen" },
  { prefix: "employees", module: "kepegawaian" },
  // Cash out sits with the rest of the money, same module as Kasir/Kuitansi.
  { prefix: "expenses", module: "pembayaran" },
  { prefix: "inventory", module: "inventaris" },
  { prefix: "letters", module: "surat" },
  { prefix: "auth/change-password", module: null }, // self-service, any authenticated staff
  { prefix: "auth/admin/reset-password", module: "pengaturan" },
  { prefix: "booking-statuses", module: "pengaturan" },
  { prefix: "bookings", module: "booking" },
  { prefix: "company-identity", module: "pengaturan" },
  { prefix: "customers", module: "pelanggan" },
  { prefix: "dashboard", module: "dash" },
  { prefix: "installments", module: "pembayaran" },
  { prefix: "invoices", module: "dokumen" },
  { prefix: "manifest", module: "manifest" },
  { prefix: "packages", module: "paket" },
  { prefix: "payment-accounts", module: "pengaturan" },
  { prefix: "payments", module: "pembayaran" },
  { prefix: "receipts", module: "pembayaran" },
  { prefix: "reports", module: "laporan" },
  { prefix: "reset-all-data", module: "pengaturan" },
  { prefix: "roles", module: "pengaturan" },
  { prefix: "schedules", module: "jadwal" },
  { prefix: "service-types", module: "pengaturan" },
  { prefix: "staff-users", module: "pengaturan" },
  { prefix: "umrahme", module: "umrahme" },
];

/** Longest-prefix-first so e.g. "auth/change-password" wins over a bare "auth". */
const SORTED_ROUTES = [...ROUTE_MODULE_MAP].sort((a, b) => b.prefix.length - a.prefix.length);

/**
 * Returns the module id a /api/... pathname belongs to, `null` if the route
 * is deliberately exempt, or `undefined` if the route isn't registered above
 * at all (fail closed -- proxy.ts denies these rather than letting a route
 * someone forgot to register through unchecked).
 */
export function resolveModuleForPath(pathname: string): string | null | undefined {
  const withoutApi = pathname.replace(/^\/api\//, "");
  const match = SORTED_ROUTES.find((r) => withoutApi === r.prefix || withoutApi.startsWith(`${r.prefix}/`));
  return match ? match.module : undefined;
}

/**
 * A PATCH/PUT to a route ending in /status represents a verification-style
 * transition (mark a booking Dibatalkan, an installment Lunas, a staff
 * account Nonaktif) rather than an ordinary edit, so it's gated by `approve`
 * instead of `edit`.
 */
export function resolveActionForRequest(method: string, pathname: string): ModuleAction {
  if (method === "GET" || method === "HEAD") return "view";
  if (method === "DELETE") return "delete";
  if (pathname.endsWith("/status")) return "approve";
  return "edit"; // POST, PATCH, PUT
}
