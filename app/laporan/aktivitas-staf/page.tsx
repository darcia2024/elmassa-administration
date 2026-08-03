"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  FileCode2,
  FileEdit,
  Filter,
  History,
  IdCard,
  Lock,
  PlusCircle,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  UserCheck,
  Users,
} from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";

type ActivityLogItem = {
  id: string;
  timestamp: string;
  rawDate: string;
  staffName: string;
  staffAvatar: string;
  roleName: string;
  roleBadgeColor: string;
  moduleName: string;
  actionType: "Akses Data" | "Buat Data" | "Perubahan Data" | "Hapus Data";
  actionBadgeColor: string;
  summaryTitle: string;
  changeDetail: {
    field?: string;
    before?: string;
    after?: string;
    targetRef?: string;
  };
  deviceIp: string;
};

const initialActivityLogs: ActivityLogItem[] = [
  {
    id: "log-101",
    timestamp: "Hari ini, 12:17:47",
    rawDate: "2026-08-03T12:17:47",
    staffName: "Azriandri",
    staffAvatar: "A",
    roleName: "CEO / Admin Master",
    roleBadgeColor: "bg-rose-50 text-brand-pink border-rose-200",
    moduleName: "Manajemen Booking",
    actionType: "Perubahan Data",
    actionBadgeColor: "bg-amber-50 text-amber-800 border-amber-200",
    summaryTitle: "Mengubah Status Pembayaran & Pelunasan Transaksi BK-800275",
    changeDetail: {
      field: "Status Pembayaran",
      before: "DP (Rp 50.000.000)",
      after: "Lunas 100% (Rp 64.485.778)",
      targetRef: "BK-800275 (Azriandri & Keluarga)",
    },
    deviceIp: "Chrome 127 (Windows) • IP 180.252.19.44",
  },
  {
    id: "log-102",
    timestamp: "Hari ini, 12:08:15",
    rawDate: "2026-08-03T12:08:15",
    staffName: "Azriandri",
    staffAvatar: "A",
    roleName: "CEO / Admin Master",
    roleBadgeColor: "bg-rose-50 text-brand-pink border-rose-200",
    moduleName: "Paket Wisata",
    actionType: "Hapus Data",
    actionBadgeColor: "bg-rose-50 text-rose-700 border-rose-200",
    summaryTitle: "Menghapus Paket Wisata & Cascade Deletion Booking Terikat",
    changeDetail: {
      field: "Hapus Katalog Paket",
      before: "Umrah Reguler 12 Hari (Aktif)",
      after: "Dihapus dari Katalog & Database",
      targetRef: "Paket ID #pkg-custom-9912",
    },
    deviceIp: "Chrome 127 (Windows) • IP 180.252.19.44",
  },
  {
    id: "log-103",
    timestamp: "Hari ini, 11:45:02",
    rawDate: "2026-08-03T11:45:02",
    staffName: "Siti Rahma",
    staffAvatar: "S",
    roleName: "Staff Sales & Admin",
    roleBadgeColor: "bg-blue-50 text-blue-800 border-blue-200",
    moduleName: "Digital Account UmrahMe",
    actionType: "Buat Data",
    actionBadgeColor: "bg-emerald-50 text-emerald-800 border-emerald-200",
    summaryTitle: "Menerbitkan Akun Digital Jamaah Baru (JM-2026-901)",
    changeDetail: {
      field: "Terbit Akun Jamaah",
      before: "Daftar Tunggu",
      after: "Aktif (Nomor Jamaah: JM-2026-901)",
      targetRef: "Jamaah: H. Rusli Suparman",
    },
    deviceIp: "Firefox 128 (Windows) • IP 180.252.20.12",
  },
  {
    id: "log-104",
    timestamp: "Hari ini, 11:30:20",
    rawDate: "2026-08-03T11:30:20",
    staffName: "Rudi Hartono",
    staffAvatar: "R",
    roleName: "Sub-User Operasional",
    roleBadgeColor: "bg-purple-50 text-purple-800 border-purple-200",
    moduleName: "CRM Pelanggan",
    actionType: "Akses Data",
    actionBadgeColor: "bg-stone-100 text-stone-700 border-stone-200",
    summaryTitle: "Melihat Profile & Dokumen Paspor Pelanggan",
    changeDetail: {
      field: "View Customer Detail",
      before: "-",
      after: "Melihat Dokumen Paspor & Kartu Keluarga",
      targetRef: "Pelanggan: Hj. Zubaidah",
    },
    deviceIp: "Edge 126 (Windows) • IP 180.252.21.88",
  },
  {
    id: "log-105",
    timestamp: "Kemarin, 16:40:11",
    rawDate: "2026-08-02T16:40:11",
    staffName: "Hj. Zubaidah",
    staffAvatar: "Z",
    roleName: "Sub-User Keuangan",
    roleBadgeColor: "bg-emerald-50 text-emerald-800 border-emerald-200",
    moduleName: "Kasir Pembayaran",
    actionType: "Buat Data",
    actionBadgeColor: "bg-emerald-50 text-emerald-800 border-emerald-200",
    summaryTitle: "Menerbitkan Kuitansi Pembayaran Cicilan KW-2407-088",
    changeDetail: {
      field: "Cetak Kuitansi Resmi",
      before: "Pending Verifikasi",
      after: "Terverifikasi (Nominal Rp 15.000.000)",
      targetRef: "Pembayaran Via BCA El Massa",
    },
    deviceIp: "Safari 17.5 (MacOS) • IP 180.252.18.05",
  },
  {
    id: "log-106",
    timestamp: "Kemarin, 14:15:33",
    rawDate: "2026-08-02T14:15:33",
    staffName: "Azriandri",
    staffAvatar: "A",
    roleName: "CEO / Admin Master",
    roleBadgeColor: "bg-rose-50 text-brand-pink border-rose-200",
    moduleName: "Lisensi Control Panel",
    actionType: "Perubahan Data",
    actionBadgeColor: "bg-amber-50 text-amber-800 border-amber-200",
    summaryTitle: "Injeksi Tambah Saldo Lisensi Kuota (+100 Jemaah)",
    changeDetail: {
      field: "Saldo Lisensi Kuota",
      before: "0 Jemaah",
      after: "100 Jemaah (Injeksi Master PIN)",
      targetRef: "Lisensi Master Control Panel",
    },
    deviceIp: "Chrome 127 (Windows) • IP 180.252.19.44",
  },
];

export default function StaffActivityLogPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStaff, setSelectedStaff] = useState("Semua");
  const [selectedAction, setSelectedAction] = useState("Semua");
  const [selectedModule, setSelectedModule] = useState("Semua");
  const [selectedLogDetail, setSelectedLogDetail] = useState<ActivityLogItem | null>(null);

  const filteredLogs = useMemo(() => {
    return initialActivityLogs.filter((log) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        log.staffName.toLowerCase().includes(q) ||
        log.summaryTitle.toLowerCase().includes(q) ||
        log.moduleName.toLowerCase().includes(q) ||
        (log.changeDetail.targetRef && log.changeDetail.targetRef.toLowerCase().includes(q));

      const matchesStaff = selectedStaff === "Semua" || log.staffName === selectedStaff;
      const matchesAction = selectedAction === "Semua" || log.actionType === selectedAction;
      const matchesModule = selectedModule === "Semua" || log.moduleName === selectedModule;

      return matchesSearch && matchesStaff && matchesAction && matchesModule;
    });
  }, [searchQuery, selectedStaff, selectedAction, selectedModule]);

  const staffList = Array.from(new Set(initialActivityLogs.map((l) => l.staffName)));
  const actionList = ["Akses Data", "Buat Data", "Perubahan Data", "Hapus Data"];
  const moduleList = Array.from(new Set(initialActivityLogs.map((l) => l.moduleName)));

  return (
    <AppShell eyebrow="Keamanan & Audit Trail" title="Log Aktivitas & Audit Perubahan Staf (RBAC Tracker)">
      <div className="space-y-6">
        
        {/* Header Hero Banner */}
        <section className="rounded-2xl border border-stone-200/70 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-stone-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-purple-50 text-purple-700 border border-purple-200">
                  <ShieldCheck className="h-4 w-4" strokeWidth={1.5} />
                </span>
                <h1 className="text-xl font-extrabold tracking-tight text-brand-cocoa">
                  Audit Trail & Log Aktivitas Staf
                </h1>
              </div>
              <p className="text-xs text-stone-500 mt-1 max-w-2xl">
                Pantau seluruh rekam jejak digital perizinan role (RBAC), data yang diakses, pembuatan data baru, hingga rincian perubahan (before vs after) yang dilakukan staf.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/pengaturan/hak-akses"
                className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3.5 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition shadow-2xs"
              >
                <Lock className="h-3.5 w-3.5 text-stone-500" strokeWidth={1.5} />
                <span>Matriks Hak Akses</span>
              </Link>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid gap-3 sm:grid-cols-4 text-xs">
            <div className="rounded-xl border border-stone-200/60 bg-stone-50/50 p-3 flex items-center justify-between">
              <div>
                <p className="text-stone-400 font-semibold text-[10px] uppercase">Aktivitas Terrekam</p>
                <p className="font-extrabold text-brand-cocoa text-base">{initialActivityLogs.length} Log Action</p>
              </div>
              <Activity className="h-5 w-5 text-brand-pink shrink-0" strokeWidth={1.5} />
            </div>

            <div className="rounded-xl border border-stone-200/60 bg-stone-50/50 p-3 flex items-center justify-between">
              <div>
                <p className="text-stone-400 font-semibold text-[10px] uppercase">Perubahan Data</p>
                <p className="font-extrabold text-amber-700 text-base">
                  {initialActivityLogs.filter((l) => l.actionType === "Perubahan Data").length} Perubahan
                </p>
              </div>
              <FileEdit className="h-5 w-5 text-amber-600 shrink-0" strokeWidth={1.5} />
            </div>

            <div className="rounded-xl border border-stone-200/60 bg-stone-50/50 p-3 flex items-center justify-between">
              <div>
                <p className="text-stone-400 font-semibold text-[10px] uppercase">Penghapusan Data</p>
                <p className="font-extrabold text-rose-600 text-base">
                  {initialActivityLogs.filter((l) => l.actionType === "Hapus Data").length} Hapus
                </p>
              </div>
              <Trash2 className="h-5 w-5 text-rose-500 shrink-0" strokeWidth={1.5} />
            </div>

            <div className="rounded-xl border border-stone-200/60 bg-stone-50/50 p-3 flex items-center justify-between">
              <div>
                <p className="text-stone-400 font-semibold text-[10px] uppercase">Staf Terverifikasi</p>
                <p className="font-extrabold text-emerald-700 text-base">{staffList.length} User Role</p>
              </div>
              <UserCheck className="h-5 w-5 text-emerald-600 shrink-0" strokeWidth={1.5} />
            </div>
          </div>
        </section>

        {/* Filter Controls Bar */}
        <section className="rounded-2xl border border-stone-200/70 bg-white p-4 shadow-2xs space-y-3">
          <div className="grid gap-3 md:grid-cols-4">
            {/* Search Input */}
            <div className="relative md:col-span-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" strokeWidth={1.5} />
              <input
                type="text"
                placeholder="Cari staf, aktivitas, atau nomor..."
                className="w-full h-9 rounded-xl border border-stone-200 bg-stone-50/50 pl-9 pr-3 text-xs text-brand-cocoa font-medium outline-none focus:border-brand-pink focus:bg-white transition"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filter Staf */}
            <select
              className="h-9 rounded-xl border border-stone-200 bg-white px-3 text-xs font-semibold text-stone-700 outline-none focus:border-brand-pink transition"
              value={selectedStaff}
              onChange={(e) => setSelectedStaff(e.target.value)}
            >
              <option value="Semua">Semua Staf / Role</option>
              {staffList.map((s) => (
                <option key={s} value={s}>
                  Staf: {s}
                </option>
              ))}
            </select>

            {/* Filter Tipe Aksi */}
            <select
              className="h-9 rounded-xl border border-stone-200 bg-white px-3 text-xs font-semibold text-stone-700 outline-none focus:border-brand-pink transition"
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
            >
              <option value="Semua">Semua Tipe Aksi (View/Edit/Delete)</option>
              {actionList.map((a) => (
                <option key={a} value={a}>
                  Aksi: {a}
                </option>
              ))}
            </select>

            {/* Filter Modul */}
            <select
              className="h-9 rounded-xl border border-stone-200 bg-white px-3 text-xs font-semibold text-stone-700 outline-none focus:border-brand-pink transition"
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value)}
            >
              <option value="Semua">Semua Modul Sistem</option>
              {moduleList.map((m) => (
                <option key={m} value={m}>
                  Modul: {m}
                </option>
              ))}
            </select>
          </div>
        </section>

        {/* Activity Audit Table */}
        <section className="rounded-2xl border border-stone-200/70 bg-white shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-200/70 text-stone-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 pl-4 pr-3">Waktu & Perangkat</th>
                  <th className="py-3.5 px-3">Staf & Role</th>
                  <th className="py-3.5 px-3">Modul & Tipe Aksi</th>
                  <th className="py-3.5 px-3">Aktivitas & Rincian Perubahan (Diff)</th>
                  <th className="py-3.5 pr-4 text-right">Detail</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-stone-100">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-stone-400">
                      <History className="h-8 w-8 mx-auto mb-2 text-stone-300" strokeWidth={1.5} />
                      <p className="font-bold text-stone-600">Tidak ada log aktivitas staf yang cocok.</p>
                      <p className="text-[11px] text-stone-400 mt-0.5">Coba ubah kata kunci pencarian atau filter role.</p>
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="transition hover:bg-stone-50/60">
                      {/* Waktu & Perangkat */}
                      <td className="py-3.5 pl-4 pr-3 align-top whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-stone-800 font-bold">
                          <Clock className="h-3.5 w-3.5 text-stone-400 shrink-0" strokeWidth={1.5} />
                          <span>{log.timestamp}</span>
                        </div>
                        <p className="text-[10px] text-stone-400 mt-0.5 font-mono">{log.deviceIp}</p>
                      </td>

                      {/* Staf & Role */}
                      <td className="py-3.5 px-3 align-top whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="grid h-7 w-7 place-items-center rounded-full bg-stone-200 font-extrabold text-stone-700 text-xs shrink-0">
                            {log.staffAvatar}
                          </span>
                          <div>
                            <p className="font-bold text-brand-cocoa">{log.staffName}</p>
                            <span className={`inline-flex items-center rounded-full border px-2 py-0.2 text-[9px] font-bold mt-0.5 ${log.roleBadgeColor}`}>
                              {log.roleName}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Modul & Tipe Aksi */}
                      <td className="py-3.5 px-3 align-top whitespace-nowrap">
                        <p className="font-bold text-stone-800">{log.moduleName}</p>
                        <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold mt-1 ${log.actionBadgeColor}`}>
                          <span className="h-1.5 w-1.5 rounded-full bg-current" />
                          {log.actionType}
                        </span>
                      </td>

                      {/* Aktivitas & Diff Preview */}
                      <td className="py-3.5 px-3 align-top">
                        <p className="font-bold text-stone-900">{log.summaryTitle}</p>
                        
                        {/* Rincian Perubahan (Before vs After Diff) */}
                        <div className="mt-1.5 rounded-xl border border-stone-200/80 bg-stone-50/70 p-2.5 space-y-1 text-[11px]">
                          <div className="flex items-center justify-between text-stone-500 font-semibold">
                            <span>Objek / Target: <strong className="text-brand-cocoa">{log.changeDetail.targetRef}</strong></span>
                            <span className="text-[10px] text-stone-400 font-mono">Field: {log.changeDetail.field}</span>
                          </div>
                          {log.changeDetail.before && (
                            <div className="grid grid-cols-2 gap-2 border-t border-stone-200/50 pt-1.5 text-[10px]">
                              <div className="rounded-lg bg-rose-50/80 border border-rose-100 p-1.5 text-rose-800">
                                <span className="font-bold text-rose-600 block text-[9px] uppercase">Sebelum (Before):</span>
                                <p className="font-mono mt-0.5">{log.changeDetail.before}</p>
                              </div>
                              <div className="rounded-lg bg-emerald-50/80 border border-emerald-100 p-1.5 text-emerald-800">
                                <span className="font-bold text-emerald-600 block text-[9px] uppercase">Sesudah (After):</span>
                                <p className="font-mono mt-0.5">{log.changeDetail.after}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Detail Button */}
                      <td className="py-3.5 pr-4 align-top text-right whitespace-nowrap">
                        <button
                          onClick={() => setSelectedLogDetail(log)}
                          className="inline-flex h-8 items-center gap-1 rounded-xl border border-stone-200 bg-white px-2.5 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition shadow-2xs"
                        >
                          <Eye className="h-3.5 w-3.5 text-stone-500" strokeWidth={1.5} />
                          <span>Audit</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Audit Modal Detail */}
        {selectedLogDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4 animate-in fade-in">
            <div className="w-full max-w-lg rounded-2xl border border-stone-200 bg-white p-6 shadow-xl space-y-5 animate-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                <div className="flex items-center gap-2">
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-purple-50 text-purple-700 border border-purple-200">
                    <ShieldCheck className="h-4 w-4" strokeWidth={1.5} />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-brand-cocoa">Rincian Audit Log Aktivitas</h3>
                    <p className="text-[11px] text-stone-400 font-mono">ID Log: {selectedLogDetail.id}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedLogDetail(null)}
                  className="rounded-lg p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-600 transition"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="rounded-xl border border-stone-200/60 bg-stone-50 p-3 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-stone-500">Staf Pelaksana</span>
                    <span className="font-bold text-brand-cocoa">{selectedLogDetail.staffName} ({selectedLogDetail.roleName})</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-stone-500">Waktu Transaksi</span>
                    <span className="font-medium text-stone-700">{selectedLogDetail.timestamp}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-stone-500">Modul Terkait</span>
                    <span className="font-bold text-stone-800">{selectedLogDetail.moduleName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-stone-500">Perangkat & IP</span>
                    <span className="font-mono text-[10px] text-stone-600">{selectedLogDetail.deviceIp}</span>
                  </div>
                </div>

                <div className="rounded-xl border border-stone-200/60 bg-white p-3 space-y-2">
                  <p className="font-bold text-brand-cocoa text-xs">Deskripsi Aktivitas</p>
                  <p className="text-stone-600 text-xs font-medium leading-relaxed">{selectedLogDetail.summaryTitle}</p>

                  <div className="border-t border-stone-100 pt-2 space-y-1.5">
                    <p className="text-[10px] font-bold text-stone-400 uppercase">Target Objek / Referensi Data</p>
                    <p className="font-mono font-bold text-brand-pink text-xs">{selectedLogDetail.changeDetail.targetRef}</p>
                  </div>

                  {selectedLogDetail.changeDetail.before && (
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <div className="rounded-lg bg-rose-50 border border-rose-200 p-2 text-rose-900">
                        <span className="font-bold text-[10px] text-rose-700 block">SEBELUM UBAH:</span>
                        <p className="font-mono text-xs mt-1">{selectedLogDetail.changeDetail.before}</p>
                      </div>
                      <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-2 text-emerald-900">
                        <span className="font-bold text-[10px] text-emerald-700 block">SESUDAH UBAH:</span>
                        <p className="font-mono text-xs mt-1">{selectedLogDetail.changeDetail.after}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setSelectedLogDetail(null)}
                  className="w-full h-9 rounded-xl bg-stone-900 text-xs font-semibold text-white hover:bg-stone-800 transition"
                >
                  Tutup Audit Viewer
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AppShell>
  );
}
