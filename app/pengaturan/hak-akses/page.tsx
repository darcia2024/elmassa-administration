"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  ChevronRight,
  IdCard,
  Lock,
  Plus,
  RotateCcw,
  Save,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";

type ModulePermission = {
  moduleId: string;
  moduleName: string;
  category: "Utama" | "Operasional" | "Keuangan" | "Sistem";
  description: string;
};

const modulesList: ModulePermission[] = [
  { moduleId: "dash", moduleName: "Dashboard Utama", category: "Utama", description: "Statistik operasional, pendapatan, & quick action." },
  { moduleId: "paket", moduleName: "Katalog & Calculator HPP Paket", category: "Utama", description: "Merancang paket umrah, harga, & HPP simulator." },
  { moduleId: "jadwal", moduleName: "Jadwal & Agenda Flight", category: "Utama", description: "Kalender keberangkatan, manasik, & penjemputan." },
  { moduleId: "pelanggan", moduleName: "CRM Data Pelanggan", category: "Operasional", description: "Database jamaah, riwayat booking, & kontak." },
  { moduleId: "booking", moduleName: "Manajemen Booking", category: "Operasional", description: "Input pendaftaran, status DP, & assignment kamar." },
  { moduleId: "manifest", moduleName: "Manifest Peserta & Flight", category: "Operasional", description: "Paspor, E-Visa, rooming hotel, & bus handling." },
  { moduleId: "pembayaran", moduleName: "Kasir Pembayaran & Cicilan", category: "Keuangan", description: "Verifikasi DP, pencatatan cicilan, & cetak kuitansi." },
  { moduleId: "dokumen", moduleName: "Invoice & Surat Kemenag", category: "Keuangan", description: "Cetak invoice resmi & surat rekomendasi paspor." },
  { moduleId: "laporan", moduleName: "Laporan Pendapatan & Piutang", category: "Keuangan", description: "Analisis keuangan, piutang jamaah, & laporan omset." },
  { moduleId: "pengaturan", moduleName: "Pengaturan Identitas & Staf", category: "Sistem", description: "Legalitas perijinan, rekening bank, & kelola staf." },
];

type RolePermissionConfig = {
  roleName: string;
  roleCode: string;
  description: string;
  badgeColor: string;
  assignedStaffCount: number;
  permissions: Record<string, { view: boolean; createEdit: boolean; approve: boolean; delete: boolean }>;
};

const initialRolesConfig: RolePermissionConfig[] = [
  {
    roleName: "CEO / Admin Master",
    roleCode: "ceo_master",
    description: "Akses 100% penuh ke seluruh modul sistem, margin HPP, keuangan, & pengubahan staf.",
    badgeColor: "bg-rose-50 text-brand-pink border-rose-200",
    assignedStaffCount: 1, // Azriandri
    permissions: {
      dash: { view: true, createEdit: true, approve: true, delete: true },
      paket: { view: true, createEdit: true, approve: true, delete: true },
      jadwal: { view: true, createEdit: true, approve: true, delete: true },
      pelanggan: { view: true, createEdit: true, approve: true, delete: true },
      booking: { view: true, createEdit: true, approve: true, delete: true },
      manifest: { view: true, createEdit: true, approve: true, delete: true },
      pembayaran: { view: true, createEdit: true, approve: true, delete: true },
      dokumen: { view: true, createEdit: true, approve: true, delete: true },
      laporan: { view: true, createEdit: true, approve: true, delete: true },
      pengaturan: { view: true, createEdit: true, approve: true, delete: true },
    },
  },
  {
    roleName: "Sub-User Operasional",
    roleCode: "ops_sub",
    description: "Akses kelola paket, jadwal keberangkatan, booking jamaah, & manifest peserta.",
    badgeColor: "bg-purple-50 text-purple-800 border-purple-200",
    assignedStaffCount: 1, // Ruslan
    permissions: {
      dash: { view: true, createEdit: false, approve: false, delete: false },
      paket: { view: true, createEdit: true, approve: false, delete: false },
      jadwal: { view: true, createEdit: true, approve: true, delete: false },
      pelanggan: { view: true, createEdit: true, approve: false, delete: false },
      booking: { view: true, createEdit: true, approve: true, delete: false },
      manifest: { view: true, createEdit: true, approve: true, delete: false },
      pembayaran: { view: false, createEdit: false, approve: false, delete: false },
      dokumen: { view: true, createEdit: true, approve: false, delete: false },
      laporan: { view: false, createEdit: false, approve: false, delete: false },
      pengaturan: { view: false, createEdit: false, approve: false, delete: false },
    },
  },
  {
    roleName: "Sub-User Keuangan",
    roleCode: "fin_sub",
    description: "Khusus verifikasi kasir, pencatatan DP/cicilan, cetak kuitansi, invoice, & laporan omset.",
    badgeColor: "bg-emerald-50 text-emerald-800 border-emerald-200",
    assignedStaffCount: 1, // Hj. Zubaidah
    permissions: {
      dash: { view: true, createEdit: false, approve: false, delete: false },
      paket: { view: true, createEdit: false, approve: false, delete: false },
      jadwal: { view: false, createEdit: false, approve: false, delete: false },
      pelanggan: { view: true, createEdit: false, approve: false, delete: false },
      booking: { view: true, createEdit: false, approve: false, delete: false },
      manifest: { view: false, createEdit: false, approve: false, delete: false },
      pembayaran: { view: true, createEdit: true, approve: true, delete: true },
      dokumen: { view: true, createEdit: true, approve: true, delete: false },
      laporan: { view: true, createEdit: true, approve: true, delete: false },
      pengaturan: { view: false, createEdit: false, approve: false, delete: false },
    },
  },
  {
    roleName: "Sub-User Sales & CRM",
    roleCode: "sales_sub",
    description: "Input calon pendaftar umrah, lihat katalog paket, & kelola relasi jamaah.",
    badgeColor: "bg-blue-50 text-blue-800 border-blue-200",
    assignedStaffCount: 1, // Ridwan
    permissions: {
      dash: { view: true, createEdit: false, approve: false, delete: false },
      paket: { view: true, createEdit: false, approve: false, delete: false },
      jadwal: { view: true, createEdit: false, approve: false, delete: false },
      pelanggan: { view: true, createEdit: true, approve: false, delete: false },
      booking: { view: true, createEdit: true, approve: false, delete: false },
      manifest: { view: false, createEdit: false, approve: false, delete: false },
      pembayaran: { view: false, createEdit: false, approve: false, delete: false },
      dokumen: { view: false, createEdit: false, approve: false, delete: false },
      laporan: { view: false, createEdit: false, approve: false, delete: false },
      pengaturan: { view: false, createEdit: false, approve: false, delete: false },
    },
  },
  {
    roleName: "Sub-User Lapangan",
    roleCode: "field_sub",
    description: "Petugas lapangan bandara, muthawwif, handling rooming hotel, & paspor jamaah.",
    badgeColor: "bg-amber-50 text-amber-900 border-amber-200",
    assignedStaffCount: 1, // Ahmad
    permissions: {
      dash: { view: true, createEdit: false, approve: false, delete: false },
      paket: { view: false, createEdit: false, approve: false, delete: false },
      jadwal: { view: true, createEdit: false, approve: false, delete: false },
      pelanggan: { view: false, createEdit: false, approve: false, delete: false },
      booking: { view: false, createEdit: false, approve: false, delete: false },
      manifest: { view: true, createEdit: true, approve: false, delete: false },
      pembayaran: { view: false, createEdit: false, approve: false, delete: false },
      dokumen: { view: true, createEdit: false, approve: false, delete: false },
      laporan: { view: false, createEdit: false, approve: false, delete: false },
      pengaturan: { view: false, createEdit: false, approve: false, delete: false },
    },
  },
];

export default function AccessControlPage() {
  const [roles, setRoles] = useState<RolePermissionConfig[]>(initialRolesConfig);
  const [activeRoleCode, setActiveRoleCode] = useState<string>("ceo_master");
  const [isSaved, setIsSaved] = useState(false);

  const selectedRole = roles.find((r) => r.roleCode === activeRoleCode) ?? roles[0];

  const handleTogglePermission = (
    moduleId: string,
    action: "view" | "createEdit" | "approve" | "delete"
  ) => {
    // CEO Master permissions are immutable to prevent lockout
    if (selectedRole.roleCode === "ceo_master") return;

    setRoles((prevRoles) =>
      prevRoles.map((role) => {
        if (role.roleCode !== selectedRole.roleCode) return role;

        const currentModPerm = role.permissions[moduleId] ?? {
          view: false,
          createEdit: false,
          approve: false,
          delete: false,
        };

        const updatedModPerm = {
          ...currentModPerm,
          [action]: !currentModPerm[action],
        };

        // If view is disabled, disable sub-actions as well
        if (action === "view" && !updatedModPerm.view) {
          updatedModPerm.createEdit = false;
          updatedModPerm.approve = false;
          updatedModPerm.delete = false;
        }

        // If any sub-action is enabled, automatically enable view
        if (action !== "view" && updatedModPerm[action]) {
          updatedModPerm.view = true;
        }

        return {
          ...role,
          permissions: {
            ...role.permissions,
            [moduleId]: updatedModPerm,
          },
        };
      })
    );
  };

  const handleSaveChanges = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <AppShell eyebrow="Pengaturan Master" title="Manajemen Hak Akses & Matriks Role">
      <div className="space-y-5 font-sans">
        
        {/* Navigation Top Links & Controls */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/pengaturan"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-brand-pink transition"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
            <span>Kembali ke Pengaturan Master</span>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/pengaturan/staf"
              className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3.5 text-xs font-semibold text-stone-700 hover:bg-stone-50 shadow-2xs"
            >
              <Users className="h-4 w-4 text-stone-500" />
              <span>Kelola Pengguna Staf →</span>
            </Link>

            <button
              type="button"
              onClick={handleSaveChanges}
              className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-brand-pink px-4 text-xs font-semibold text-white shadow-2xs hover:bg-brand-pinkHover transition"
            >
              <Save className="h-4 w-4" strokeWidth={1.5} />
              <span>Simpan Perubahan Matriks</span>
            </button>
          </div>
        </div>

        {/* Save Toast Feedback Notification */}
        {isSaved && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-bold text-emerald-800 flex items-center gap-2 shadow-xs animate-in fade-in slide-in-from-top-1 duration-200">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>Hak akses role berhasil diperbarui! Seluruh menu navigasi pengguna akan menyesuaikan matriks perizinan ini.</span>
          </div>
        )}

        {/* Roles Selection Cards Row */}
        <section className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {roles.map((r) => {
            const isSelected = r.roleCode === activeRoleCode;
            return (
              <button
                key={r.roleCode}
                type="button"
                onClick={() => setActiveRoleCode(r.roleCode)}
                className={`text-left rounded-2xl border p-4 transition space-y-2 relative overflow-hidden ${
                  isSelected
                    ? "border-stone-900 bg-stone-900 text-white shadow-md ring-1 ring-stone-900"
                    : "border-stone-200/80 bg-white text-stone-800 hover:bg-stone-50/80 shadow-2xs"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase border ${r.badgeColor}`}>
                    {r.roleName.split(" ")[0]}
                  </span>
                  <span className={`text-[10px] font-bold ${isSelected ? "text-stone-300" : "text-stone-500"}`}>
                    {r.assignedStaffCount} Staf
                  </span>
                </div>

                <div>
                  <h4 className="text-xs font-extrabold truncate">{r.roleName}</h4>
                  <p className={`text-[10px] leading-relaxed line-clamp-2 mt-0.5 ${isSelected ? "text-stone-300" : "text-stone-500"}`}>
                    {r.description}
                  </p>
                </div>

                {isSelected && (
                  <div className="h-1 w-full bg-brand-pink absolute bottom-0 left-0" />
                )}
              </button>
            );
          })}
        </section>

        {/* Selected Role Header Details */}
        <section className="rounded-2xl border border-stone-200/80 bg-white p-5 sm:p-6 shadow-2xs space-y-5">
          
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-stone-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase border ${selectedRole.badgeColor}`}>
                  Role Aktif
                </span>
                <h3 className="text-lg font-black text-brand-cocoa">{selectedRole.roleName}</h3>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">{selectedRole.description}</p>
            </div>

            {selectedRole.roleCode === "ceo_master" ? (
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-900">
                <Lock className="h-3.5 w-3.5 text-amber-600" />
                <span>Superadmin Access (Tidak Dapat Dikunci)</span>
              </span>
            ) : (
              <span className="text-xs font-medium text-stone-500">
                Klik checkbox di bawah untuk mengubah perizinan fitur untuk role ini.
              </span>
            )}
          </div>

          {/* PERMISSION MATRIX TABLE */}
          <div className="overflow-x-auto rounded-xl border border-stone-200/70">
            <table className="w-full min-w-[750px] border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-stone-200/70 bg-stone-50/80 font-bold text-stone-600 text-[11px] uppercase tracking-wider">
                  <th className="py-3 pl-4 pr-2">Modul & Fitur Sistem</th>
                  <th className="py-3 px-2 text-center w-28">1. Lihat (Read)</th>
                  <th className="py-3 px-2 text-center w-32">2. Tambah/Ubah (Write)</th>
                  <th className="py-3 px-2 text-center w-36">3. Verifikasi (Approve)</th>
                  <th className="py-3 pr-4 text-center w-28">4. Hapus (Delete)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-normal">
                {modulesList.map((m) => {
                  const perm = selectedRole.permissions[m.moduleId] ?? {
                    view: false,
                    createEdit: false,
                    approve: false,
                    delete: false,
                  };

                  return (
                    <tr key={m.moduleId} className="transition hover:bg-stone-50/60">
                      
                      {/* Module Info Column */}
                      <td className="py-3.5 pl-4 pr-3">
                        <div className="flex items-start gap-2">
                          <span className="rounded-md bg-stone-100 px-2 py-0.5 text-[10px] font-bold uppercase text-stone-600 mt-0.5">
                            {m.category}
                          </span>
                          <div>
                            <p className="font-bold text-stone-900">{m.moduleName}</p>
                            <p className="text-[11px] text-stone-500">{m.description}</p>
                          </div>
                        </div>
                      </td>

                      {/* 1. View Checkbox */}
                      <td className="py-3.5 px-2 text-center">
                        <input
                          type="checkbox"
                          checked={perm.view}
                          disabled={selectedRole.roleCode === "ceo_master"}
                          onChange={() => handleTogglePermission(m.moduleId, "view")}
                          className="h-4 w-4 accent-brand-pink rounded cursor-pointer disabled:cursor-not-allowed"
                        />
                      </td>

                      {/* 2. Create/Edit Checkbox */}
                      <td className="py-3.5 px-2 text-center">
                        <input
                          type="checkbox"
                          checked={perm.createEdit}
                          disabled={selectedRole.roleCode === "ceo_master"}
                          onChange={() => handleTogglePermission(m.moduleId, "createEdit")}
                          className="h-4 w-4 accent-brand-pink rounded cursor-pointer disabled:cursor-not-allowed"
                        />
                      </td>

                      {/* 3. Approve Checkbox */}
                      <td className="py-3.5 px-2 text-center">
                        <input
                          type="checkbox"
                          checked={perm.approve}
                          disabled={selectedRole.roleCode === "ceo_master"}
                          onChange={() => handleTogglePermission(m.moduleId, "approve")}
                          className="h-4 w-4 accent-brand-pink rounded cursor-pointer disabled:cursor-not-allowed"
                        />
                      </td>

                      {/* 4. Delete Checkbox */}
                      <td className="py-3.5 pr-4 text-center">
                        <input
                          type="checkbox"
                          checked={perm.delete}
                          disabled={selectedRole.roleCode === "ceo_master"}
                          onChange={() => handleTogglePermission(m.moduleId, "delete")}
                          className="h-4 w-4 accent-brand-pink rounded cursor-pointer disabled:cursor-not-allowed"
                        />
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Matrix Footer Notes */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-2 border-t border-stone-100 text-xs text-stone-500 gap-2">
            <p>
              💡 <span className="font-semibold text-stone-700">Catatan Keamanan:</span> Pengaturan ini secara otomatis memfilter bilah menu navigasi samping (sidebar) dan hak eksekusi tombol untuk setiap staf.
            </p>
            <button
              type="button"
              onClick={handleSaveChanges}
              className="inline-flex h-8 items-center gap-1 rounded-xl bg-stone-900 px-3.5 text-xs font-semibold text-white shadow-2xs hover:bg-black self-start sm:self-auto"
            >
              <Check className="h-3.5 w-3.5" />
              <span>Terapkan Hak Akses</span>
            </button>
          </div>

        </section>

      </div>
    </AppShell>
  );
}
