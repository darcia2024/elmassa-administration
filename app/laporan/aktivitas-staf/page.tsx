"use client";

import {
  Activity,
  AlertTriangle,
  FileSpreadsheet,
  Printer,
  Search,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { ReportNav } from "@/components/report-nav";
import { exportToCSV } from "@/lib/export-excel";

type ActivityRow = {
  id: string;
  staffName: string;
  roleName: string;
  moduleId: string | null;
  moduleName: string;
  action: string;
  method: string;
  path: string;
  createdAt: string;
};

const actionStyles: Record<string, string> = {
  edit: "bg-sky-50/80 text-sky-800 border border-sky-200/60",
  approve: "bg-emerald-50/80 text-emerald-800 border border-emerald-200/60",
  delete: "bg-rose-50/80 text-rose-700 border border-rose-200/60",
};

const actionLabels: Record<string, string> = {
  edit: "Ubah",
  approve: "Approve",
  delete: "Hapus",
};

function formatTimestamp(iso: string) {
  try {
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Jakarta",
    }).format(new Date(iso)) + " WIB";
  } catch {
    return iso;
  }
}

export default function StaffActivityLogPage() {
  const [rows, setRows] = useState<ActivityRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("");

  useEffect(() => {
    fetch("/api/activity-log")
      .then((res) => res.json())
      .then((json) => setRows((json.data ?? []) as ActivityRow[]))
      .catch((e) => console.error("Failed loading activity log:", e))
      .finally(() => setLoading(false));
  }, []);

  const filteredRows = useMemo(() => {
    const q = query.toLowerCase().trim();
    return rows.filter((r) => {
      if (actionFilter && r.action !== actionFilter) return false;
      if (!q) return true;
      return (
        r.staffName.toLowerCase().includes(q) ||
        r.roleName.toLowerCase().includes(q) ||
        r.moduleName.toLowerCase().includes(q) ||
        r.path.toLowerCase().includes(q)
      );
    });
  }, [rows, query, actionFilter]);

  const staffInvolved = useMemo(() => new Set(rows.map((r) => r.staffName)).size, [rows]);
  const today = new Date().toISOString().slice(0, 10);
  const actionsToday = useMemo(() => rows.filter((r) => r.createdAt.startsWith(today)).length, [rows, today]);
  const deleteCount = useMemo(() => rows.filter((r) => r.action === "delete").length, [rows]);

  return (
    <AppShell eyebrow="Keamanan & Audit Trail" title="Log Aktivitas & Audit Perubahan Staf (RBAC Tracker)">
      <div className="space-y-5">
        <ReportNav />

        <section className="rounded-2xl border border-stone-200/70 bg-white p-5 sm:p-6 shadow-2xs">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-brand-cocoa sm:text-2xl">
                Jejak Aktivitas Perubahan Data Staf
              </h1>
              <p className="text-xs text-stone-500 mt-1 sm:text-sm">
                Setiap aksi ubah, approve, dan hapus yang lolos pemeriksaan izin RBAC -- dicatat otomatis, tidak bisa diedit manual.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3.5 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition"
              >
                <Printer className="h-3.5 w-3.5 text-stone-500" strokeWidth={1.5} />
                Cetak PDF
              </button>

              <button
                type="button"
                onClick={() => {
                  const headers = ["Waktu", "Staf", "Role", "Modul", "Aksi", "Method", "Endpoint"];
                  const dataRows = filteredRows.map((r) => [
                    formatTimestamp(r.createdAt),
                    r.staffName,
                    r.roleName,
                    r.moduleName,
                    actionLabels[r.action] ?? r.action,
                    r.method,
                    r.path,
                  ]);
                  exportToCSV("Audit_Log_Staf_El_Massa", headers, dataRows);
                }}
                className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-emerald-600 px-4 text-xs font-semibold text-white shadow-2xs hover:bg-emerald-700 transition cursor-pointer"
              >
                <FileSpreadsheet className="h-3.5 w-3.5" strokeWidth={1.5} />
                Export Excel CSV
              </button>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-amber-200/60 bg-amber-50/50 p-3.5 flex items-start gap-2.5 text-xs text-amber-900">
          <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" strokeWidth={1.5} />
          <p>
            Log ini mencatat <span className="font-semibold">aksi yang lolos pemeriksaan izin</span> (siapa, kapan, modul, jenis aksi) --
            bukan hasil akhirnya. Kalau requestnya gagal setelah lolos izin (misal validasi input error), tetap tercatat sebagai
            percobaan aksi. Detail sebelum/sesudah per field belum dicatat -- itu butuh instrumentasi di tiap route, bukan satu titik pusat seperti ini.
          </p>
        </section>

        <section className="grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-3">
          <article className="rounded-2xl border border-stone-200/70 bg-white p-3.5 sm:p-5 shadow-2xs">
            <div className="flex items-center justify-between gap-1.5">
              <p className="text-[11px] sm:text-xs font-semibold text-stone-500 truncate">Total Aktivitas Tercatat</p>
              <Activity className="h-4 w-4 text-brand-pink shrink-0" strokeWidth={1.5} />
            </div>
            <p className="mt-1 text-lg sm:text-xl font-extrabold text-brand-cocoa">{rows.length}</p>
            <p className="mt-1 text-[10px] sm:text-[11px] text-stone-400 truncate">{actionsToday} aksi hari ini</p>
          </article>

          <article className="rounded-2xl border border-stone-200/70 bg-white p-3.5 sm:p-5 shadow-2xs">
            <div className="flex items-center justify-between gap-1.5">
              <p className="text-[11px] sm:text-xs font-semibold text-stone-500 truncate">Staf Terlibat</p>
              <Users className="h-4 w-4 text-sky-600 shrink-0" strokeWidth={1.5} />
            </div>
            <p className="mt-1 text-lg sm:text-xl font-extrabold text-sky-800">{staffInvolved}</p>
            <p className="mt-1 text-[10px] sm:text-[11px] text-stone-400 truncate">Akun aktif yang tercatat beraksi</p>
          </article>

          <article className="col-span-2 rounded-2xl border border-stone-200/70 bg-white p-3.5 sm:p-5 shadow-2xs md:col-span-1">
            <div className="flex items-center justify-between gap-1.5">
              <p className="text-[11px] sm:text-xs font-semibold text-stone-500 truncate">Aksi Hapus Data</p>
              <ShieldCheck className="h-4 w-4 text-rose-600 shrink-0" strokeWidth={1.5} />
            </div>
            <p className="mt-1 text-lg sm:text-xl font-extrabold text-rose-700">{deleteCount}</p>
            <p className="mt-1 text-[10px] sm:text-[11px] text-stone-400 truncate">Total sepanjang riwayat tercatat</p>
          </article>
        </section>

        <section className="rounded-2xl border border-stone-200/70 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-stone-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-brand-cocoa">Riwayat Aksi Staf</h3>
              <p className="text-xs text-stone-500">Diurutkan dari yang terbaru, maksimal 300 baris terakhir.</p>
            </div>

            <div className="flex flex-col items-stretch gap-2 w-full sm:flex-row sm:items-center sm:w-auto">
              <select
                className="h-9 shrink-0 rounded-xl border border-stone-200 bg-stone-50/70 px-3 text-xs font-semibold text-stone-700 outline-none focus:border-brand-pink"
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
              >
                <option value="">Semua Aksi</option>
                <option value="edit">Ubah</option>
                <option value="approve">Approve</option>
                <option value="delete">Hapus</option>
              </select>

              <label className="flex h-9 items-center gap-2 rounded-xl border border-stone-200 bg-stone-50/70 px-3 text-xs text-stone-500 w-full sm:w-64">
                <Search className="h-3.5 w-3.5 text-stone-400" strokeWidth={1.5} />
                <input
                  className="w-full bg-transparent outline-none text-xs placeholder:text-stone-400"
                  placeholder="Cari nama staf / modul..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </label>
            </div>
          </div>

          {/* Kartu mobile -- tabel di bawah butuh 900px, layar HP tidak punya itu */}
          <div className="block space-y-3 md:hidden">
            {loading && <p className="py-6 text-center text-xs text-stone-400">Memuat log aktivitas...</p>}

            {!loading && filteredRows.length === 0 && (
              <p className="py-6 text-center text-xs text-stone-400">
                {rows.length === 0 ? "Belum ada aktivitas tercatat." : "Tidak ada hasil yang cocok."}
              </p>
            )}

            {filteredRows.map((r) => (
              <div key={r.id} className="space-y-2 rounded-2xl border border-stone-200/80 bg-white p-4 shadow-2xs">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h4 className="truncate text-xs font-bold text-brand-cocoa">{r.staffName}</h4>
                    <p className="truncate text-[10px] text-stone-400">{r.roleName}</p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${actionStyles[r.action] ?? "bg-stone-50 text-stone-600 border border-stone-200"}`}
                  >
                    {actionLabels[r.action] ?? r.action}
                  </span>
                </div>

                <div className="rounded-xl border border-stone-100 bg-stone-50 p-2.5">
                  <span className="block text-[10px] font-medium text-stone-400">Modul</span>
                  <span className="block truncate text-[11px] font-bold text-stone-800">{r.moduleName}</span>
                  <span className="mt-1 block break-all font-mono text-[10px] text-stone-500">
                    {r.method} {r.path}
                  </span>
                </div>

                <p className="font-mono text-[10px] text-stone-500">{formatTimestamp(r.createdAt)}</p>
              </div>
            ))}
          </div>

          <div className="hidden overflow-x-auto rounded-xl border border-stone-200/60 md:block">
            <table className="w-full min-w-[900px] border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-stone-200/60 bg-stone-50/70 font-semibold text-stone-500 text-[11px] uppercase tracking-wider">
                  <th className="py-2.5 pl-3 pr-2">Waktu</th>
                  <th className="py-2.5 pr-2">Staf</th>
                  <th className="py-2.5 pr-2">Role</th>
                  <th className="py-2.5 pr-2">Modul</th>
                  <th className="py-2.5 pr-2">Endpoint</th>
                  <th className="py-2.5 pr-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-normal">
                {loading && (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-stone-400">Memuat log aktivitas...</td>
                  </tr>
                )}
                {!loading && filteredRows.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-stone-400">
                      {rows.length === 0 ? "Belum ada aktivitas tercatat." : "Tidak ada hasil yang cocok."}
                    </td>
                  </tr>
                )}
                {filteredRows.map((r) => (
                  <tr key={r.id} className="transition hover:bg-stone-50/60">
                    <td className="py-3 pl-3 pr-2 font-mono text-stone-600 whitespace-nowrap">{formatTimestamp(r.createdAt)}</td>
                    <td className="py-3 pr-2 font-bold text-brand-cocoa whitespace-nowrap">{r.staffName}</td>
                    <td className="py-3 pr-2 text-stone-600 whitespace-nowrap">{r.roleName}</td>
                    <td className="py-3 pr-2 text-stone-700 whitespace-nowrap">{r.moduleName}</td>
                    <td className="py-3 pr-2 font-mono text-[11px] text-stone-500 whitespace-nowrap">{r.method} {r.path}</td>
                    <td className="py-3 pr-3 text-right whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${actionStyles[r.action] ?? "bg-stone-50 text-stone-600 border border-stone-200"}`}>
                        {actionLabels[r.action] ?? r.action}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
