"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Lock,
  Plus,
  Save,
  ShieldCheck,
  Trash2,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";

type ModuleAction = "view" | "edit" | "approve" | "delete";
type ModulePermissionSet = Record<ModuleAction, boolean>;

type ModuleDef = {
  id: string;
  name: string;
  category: "Utama" | "Operasional" | "Keuangan" | "Sistem";
  description: string;
};

type RoleConfig = {
  id: string;
  name: string;
  description: string;
  isSystem: boolean;
  staffCount: number;
  permissions: Record<string, ModulePermissionSet>;
};

const emptyPerm = (): ModulePermissionSet => ({ view: false, edit: false, approve: false, delete: false });

export default function AccessControlPage() {
  const [roles, setRoles] = useState<RoleConfig[]>([]);
  const [modules, setModules] = useState<ModuleDef[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeRoleId, setActiveRoleId] = useState<string | null>(null);
  const [draftPermissions, setDraftPermissions] = useState<Record<string, ModulePermissionSet>>({});
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDescription, setNewRoleDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  async function loadRoles(selectId?: string) {
    setLoading(true);
    try {
      const res = await fetch("/api/roles");
      const json = await res.json();
      const rolesData = (json.data ?? []) as RoleConfig[];
      setRoles(rolesData);
      setModules(json.meta?.modules ?? []);

      const target = selectId ? rolesData.find((r) => r.id === selectId) : rolesData[0];
      if (target) {
        setActiveRoleId(target.id);
        setDraftPermissions(target.permissions);
      }
      setIsDirty(false);
    } catch (e) {
      console.error(e);
      setErrorMessage("Gagal memuat data role dari server.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRoles();
  }, []);

  const selectedRole = roles.find((r) => r.id === activeRoleId) ?? null;

  function selectRole(role: RoleConfig) {
    if (isDirty && !confirm("Ada perubahan izin yang belum disimpan untuk role ini. Pindah role dan buang perubahan?")) {
      return;
    }
    setActiveRoleId(role.id);
    setDraftPermissions(role.permissions);
    setIsDirty(false);
    setErrorMessage(null);
  }

  function togglePermission(moduleId: string, action: ModuleAction) {
    if (selectedRole?.isSystem) return; // Admin Master matrix is fixed -- see lib/roles/store.ts

    setDraftPermissions((prev) => {
      const current = prev[moduleId] ?? emptyPerm();
      const updated = { ...current, [action]: !current[action] };

      if (action === "view" && !updated.view) {
        updated.edit = false;
        updated.approve = false;
        updated.delete = false;
      }
      if (action !== "view" && updated[action]) {
        updated.view = true;
      }

      return { ...prev, [moduleId]: updated };
    });
    setIsDirty(true);
  }

  async function handleSaveChanges() {
    if (!selectedRole) return;
    setIsSaving(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/roles/${selectedRole.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ permissions: draftPermissions }),
      });
      const json = await res.json();

      if (!res.ok) {
        setErrorMessage(json.error ?? "Gagal menyimpan matriks izin.");
        return;
      }

      setSavedMessage(`Hak akses "${selectedRole.name}" berhasil diperbarui.`);
      setTimeout(() => setSavedMessage(null), 3500);
      await loadRoles(selectedRole.id);
    } catch (e) {
      console.error(e);
      setErrorMessage("Tidak bisa menghubungi server.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleCreateRole(e: React.FormEvent) {
    e.preventDefault();
    if (!newRoleName.trim()) return;

    setIsCreating(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newRoleName.trim(), description: newRoleDescription.trim() }),
      });
      const json = await res.json();

      if (!res.ok) {
        setErrorMessage(json.fields?.name ?? json.error ?? "Gagal membuat role.");
        return;
      }

      setIsCreateOpen(false);
      setNewRoleName("");
      setNewRoleDescription("");
      await loadRoles(json.data.id);
    } catch (e) {
      console.error(e);
      setErrorMessage("Tidak bisa menghubungi server.");
    } finally {
      setIsCreating(false);
    }
  }

  async function handleDeleteRole(role: RoleConfig) {
    if (!confirm(`Hapus role "${role.name}"? Tindakan ini tidak bisa dibatalkan.`)) return;

    try {
      const res = await fetch(`/api/roles/${role.id}`, { method: "DELETE" });
      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        alert(json.error ?? "Gagal menghapus role.");
        return;
      }

      await loadRoles();
    } catch (e) {
      console.error(e);
      alert("Tidak bisa menghubungi server.");
    }
  }

  if (loading) {
    return (
      <AppShell eyebrow="Pengaturan Master" title="Manajemen Hak Akses & Matriks Role">
        <p className="text-xs text-stone-400">Memuat data role...</p>
      </AppShell>
    );
  }

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
              onClick={() => setIsCreateOpen(true)}
              className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-brand-pink px-4 text-xs font-semibold text-white shadow-2xs hover:bg-brand-pinkHover transition"
            >
              <Plus className="h-4 w-4" strokeWidth={1.5} />
              <span>Buat Role Baru</span>
            </button>
          </div>
        </div>

        {savedMessage && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-bold text-emerald-800 flex items-center gap-2 shadow-xs animate-in fade-in slide-in-from-top-1 duration-200">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{savedMessage}</span>
          </div>
        )}
        {errorMessage && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-bold text-rose-700">
            {errorMessage}
          </div>
        )}

        {/* Roles Selection Cards Row */}
        <section className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {roles.map((r) => {
            const isSelected = r.id === activeRoleId;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => selectRole(r)}
                className={`text-left rounded-2xl border p-4 transition space-y-2 relative overflow-hidden ${
                  isSelected
                    ? "border-stone-900 bg-stone-900 text-white shadow-md ring-1 ring-stone-900"
                    : "border-stone-200/80 bg-white text-stone-800 hover:bg-stone-50/80 shadow-2xs"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase border ${
                      r.isSystem
                        ? "bg-rose-50 text-brand-pink border-brand-pink/20"
                        : "bg-purple-50 text-purple-800 border-purple-200"
                    }`}
                  >
                    {r.isSystem ? "Sistem" : "Custom"}
                  </span>
                  <span className={`text-[10px] font-bold ${isSelected ? "text-stone-300" : "text-stone-500"}`}>
                    {r.staffCount} Staf
                  </span>
                </div>

                <div>
                  <h4 className="text-xs font-extrabold truncate">{r.name}</h4>
                  <p className={`text-[10px] leading-relaxed line-clamp-2 mt-0.5 ${isSelected ? "text-stone-300" : "text-stone-500"}`}>
                    {r.description || "Belum ada deskripsi."}
                  </p>
                </div>

                {isSelected && <div className="h-1 w-full bg-brand-pink absolute bottom-0 left-0" />}
              </button>
            );
          })}
        </section>

        {/* Selected Role Header Details */}
        {selectedRole && (
          <section className="rounded-2xl border border-stone-200/80 bg-white p-5 sm:p-6 shadow-2xs space-y-5">

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-stone-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase border ${
                      selectedRole.isSystem
                        ? "bg-rose-50 text-brand-pink border-brand-pink/20"
                        : "bg-purple-50 text-purple-800 border-purple-200"
                    }`}
                  >
                    Role Aktif
                  </span>
                  <h3 className="text-lg font-black text-brand-cocoa">{selectedRole.name}</h3>
                </div>
                <p className="text-xs text-stone-500 mt-0.5">{selectedRole.description || "Belum ada deskripsi."}</p>
              </div>

              {selectedRole.isSystem ? (
                <span className="inline-flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-900">
                  <Lock className="h-3.5 w-3.5 text-amber-600" />
                  <span>Superadmin Access (Tidak Dapat Dikunci)</span>
                </span>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-stone-500">
                    Klik checkbox untuk mengubah perizinan role ini.
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDeleteRole(selectedRole)}
                    disabled={selectedRole.staffCount > 0}
                    title={selectedRole.staffCount > 0 ? "Pindahkan staf dari role ini dulu sebelum menghapus" : "Hapus role"}
                    className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-[11px] font-semibold text-rose-700 hover:bg-rose-600 hover:text-white transition disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-rose-50 disabled:hover:text-rose-700"
                  >
                    <Trash2 className="h-3 w-3" strokeWidth={1.5} />
                    <span>Hapus Role</span>
                  </button>
                </div>
              )}
            </div>

            {/* Kartu mobile -- matriks 5 kolom di bawah butuh 750px */}
            <div className="block space-y-3 md:hidden">
              {modules.map((m) => {
                const perm = draftPermissions[m.id] ?? emptyPerm();

                return (
                  <div key={m.id} className="space-y-3 rounded-2xl border border-stone-200/80 bg-white p-4 shadow-2xs">
                    <div>
                      <span className="rounded-md bg-stone-100 px-2 py-0.5 text-[10px] font-bold uppercase text-stone-600">
                        {m.category}
                      </span>
                      <p className="mt-1.5 text-xs font-bold text-stone-900">{m.name}</p>
                      <p className="text-[11px] text-stone-500">{m.description}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 border-t border-stone-100 pt-3">
                      {([
                        { action: "view", label: "Lihat" },
                        { action: "edit", label: "Tambah/Ubah" },
                        { action: "approve", label: "Verifikasi" },
                        { action: "delete", label: "Hapus" },
                      ] as const).map(({ action, label }) => (
                        <label
                          key={action}
                          className={`flex min-h-[44px] items-center gap-2 rounded-xl border border-stone-200 px-2.5 py-2.5 text-[11px] font-semibold ${
                            selectedRole.isSystem ? "bg-stone-50 text-stone-400" : "bg-white text-stone-700"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={perm[action]}
                            disabled={selectedRole.isSystem}
                            onChange={() => togglePermission(m.id, action)}
                            className="h-4 w-4 shrink-0 accent-brand-pink rounded disabled:cursor-not-allowed"
                          />
                          {label}
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* PERMISSION MATRIX TABLE */}
            <div className="hidden overflow-x-auto rounded-xl border border-stone-200/70 md:block">
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
                  {modules.map((m) => {
                    const perm = draftPermissions[m.id] ?? emptyPerm();

                    return (
                      <tr key={m.id} className="transition hover:bg-stone-50/60">
                        <td className="py-3.5 pl-4 pr-3">
                          <div className="flex items-start gap-2">
                            <span className="rounded-md bg-stone-100 px-2 py-0.5 text-[10px] font-bold uppercase text-stone-600 mt-0.5">
                              {m.category}
                            </span>
                            <div>
                              <p className="font-bold text-stone-900">{m.name}</p>
                              <p className="text-[11px] text-stone-500">{m.description}</p>
                            </div>
                          </div>
                        </td>

                        {(["view", "edit", "approve", "delete"] as const).map((action) => (
                          <td key={action} className="py-3.5 px-2 text-center">
                            <input
                              type="checkbox"
                              checked={perm[action]}
                              disabled={selectedRole.isSystem}
                              onChange={() => togglePermission(m.id, action)}
                              className="h-4 w-4 accent-brand-pink rounded cursor-pointer disabled:cursor-not-allowed"
                            />
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Matrix Footer Notes */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-2 border-t border-stone-100 text-xs text-stone-500 gap-2">
              <p>
                💡 <span className="font-semibold text-stone-700">Catatan:</span> matriks ini dicek langsung oleh server
                di setiap request API — bukan cuma tampilan. Staf dengan role ini akan langsung ditolak (403) kalau
                mencoba aksi yang tidak diizinkan, walau lewat cara lain selain tombol di UI.
              </p>
              {!selectedRole.isSystem && (
                <button
                  type="button"
                  onClick={handleSaveChanges}
                  disabled={!isDirty || isSaving}
                  className="inline-flex h-8 items-center gap-1 rounded-xl bg-stone-900 px-3.5 text-xs font-semibold text-white shadow-2xs hover:bg-black self-start sm:self-auto disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <span>Menyimpan...</span>
                  ) : (
                    <>
                      <Save className="h-3.5 w-3.5" />
                      <span>{isDirty ? "Simpan Perubahan Matriks" : "Tersimpan"}</span>
                    </>
                  )}
                </button>
              )}
            </div>

          </section>
        )}

      </div>

      {/* MODAL: BUAT ROLE BARU */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <form onSubmit={handleCreateRole} className="relative w-full max-w-md rounded-2xl border border-stone-200 bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="text-base font-bold text-brand-cocoa flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-brand-pink" />
                <span>Buat Role Baru</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-xl border border-stone-200 bg-stone-50 text-stone-500 hover:bg-stone-100 transition"
              >
                <X className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <label className="block space-y-1">
                <span className="font-semibold text-stone-700">Nama Role</span>
                <input
                  required
                  autoFocus
                  className="w-full h-9 rounded-xl border border-stone-200 bg-stone-50/50 px-3 text-xs text-brand-cocoa font-medium outline-none focus:border-brand-pink focus:bg-white"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  placeholder="Contoh: Sub-User Marketing Digital"
                />
              </label>

              <label className="block space-y-1">
                <span className="font-semibold text-stone-700">Deskripsi (opsional)</span>
                <textarea
                  className="w-full min-h-[70px] rounded-xl border border-stone-200 bg-stone-50/50 px-3 py-2 text-xs text-brand-cocoa font-medium outline-none focus:border-brand-pink focus:bg-white"
                  value={newRoleDescription}
                  onChange={(e) => setNewRoleDescription(e.target.value)}
                  placeholder="Ringkasan tugas & cakupan akses role ini."
                />
              </label>

              <p className="text-[11px] text-stone-400">
                Role baru dibuat tanpa izin sama sekali (semua modul terkunci). Atur matriksnya setelah dibuat.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-stone-100 pt-3">
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="h-9 rounded-xl border border-stone-200 bg-white px-4 text-xs font-semibold text-stone-600 hover:bg-stone-50"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isCreating || !newRoleName.trim()}
                className="h-9 rounded-xl bg-brand-pink px-5 text-xs font-semibold text-white shadow-2xs hover:bg-brand-pinkHover disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                <Check className="h-3.5 w-3.5" />
                <span>{isCreating ? "Membuat..." : "Buat Role"}</span>
              </button>
            </div>
          </form>
        </div>
      )}

    </AppShell>
  );
}
