"use client";

import { useState, useEffect } from "react";
import {
  Building2,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Pencil,
  Plus,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserCog,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";

type UserRole =
  | "Admin Master"
  | "Sub-User Operasional"
  | "Sub-User Keuangan"
  | "Sub-User Sales & CRM"
  | "Sub-User Lapangan";

type UserAccount = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  branch: string;
  status: string;
  teamDivision: string;
  password?: string;
};

const initialAccounts: UserAccount[] = [
  {
    id: "acc-001",
    name: "Azriandri",
    email: "azriandri@elmassa.test",
    phone: "0812-3344-7788",
    role: "Admin Master",
    branch: "Pangkalpinang (Bangka)",
    status: "Aktif",
    teamDivision: "CEO & Direksi Utama",
    password: "admin123",
  },
];

const roleBadgeStyles: Record<UserRole, string> = {
  "Admin Master": "bg-rose-50 text-brand-pink border border-brand-pink/20 font-bold",
  "Sub-User Operasional": "bg-sky-50 text-sky-800 border border-sky-200/60 font-semibold",
  "Sub-User Keuangan": "bg-emerald-50 text-emerald-800 border border-emerald-200/60 font-semibold",
  "Sub-User Sales & CRM": "bg-purple-50 text-purple-800 border border-purple-200/60 font-semibold",
  "Sub-User Lapangan": "bg-amber-50 text-amber-800 border border-amber-200/60 font-semibold",
};

export default function StaffAndSubUsersPage() {
  const [accounts, setAccounts] = useState<UserAccount[]>(initialAccounts);
  const [activeTab, setActiveTab] = useState<"Semua" | "Admin Master" | "Sub-User Tim">("Semua");

  // Accounts live in Supabase — these are the credentials people log in with, so
  // they cannot sit in one browser's storage.
  const reloadAccounts = async () => {
    try {
      const res = await fetch("/api/staff-users");
      const payload = await res.json();
      if (Array.isArray(payload?.data)) {
        setAccounts(payload.data);
      }
    } catch (e) {
      console.error("Failed to load staff users:", e);
    }
  };

  useEffect(() => {
    reloadAccounts();
  }, []);
  
  // Account Form Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showPasswordInAdd, setShowPasswordInAdd] = useState(false);

  // Set Password Dedicated Modal States
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordTargetUser, setPasswordTargetUser] = useState<UserAccount | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "Sub-User Operasional" as UserRole,
    branch: "Pangkalpinang (Bangka)",
    status: "Aktif",
    teamDivision: "Operasional & Flight",
    password: "",
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const filteredAccounts = accounts.filter((acc) => {
    if (activeTab === "Admin Master") return acc.role === "Admin Master";
    if (activeTab === "Sub-User Tim") return acc.role !== "Admin Master";
    return true;
  });

  const handleOpenAddModal = () => {
    setEditingId(null);
    setFormData({
      name: "",
      email: "",
      phone: "",
      role: "Sub-User Operasional",
      branch: "Pangkalpinang (Bangka)",
      status: "Aktif",
      teamDivision: "Operasional & Flight",
      password: "admin123",
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (acc: UserAccount) => {
    setEditingId(acc.id);
    setFormData({
      name: acc.name,
      email: acc.email,
      phone: acc.phone,
      role: acc.role,
      branch: acc.branch,
      status: acc.status,
      teamDivision: acc.teamDivision,
      password: "",
    });
    setIsModalOpen(true);
  };

  const handleOpenPasswordModal = (acc: UserAccount) => {
    setPasswordTargetUser(acc);
    // Existing passwords are hashes, so the field starts blank for a fresh one.
    setNewPassword("");
    setIsPasswordModalOpen(true);
  };

  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingId) {
        const res = await fetch(`/api/staff-users/${encodeURIComponent(editingId)}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            role: formData.role,
            branch: formData.branch,
            status: formData.status,
          }),
        });
        const payload = await res.json().catch(() => ({}));
        if (!res.ok) {
          alert(payload?.error ?? "Gagal memperbarui staf.");
          return;
        }
        showToast(`Data Sub-User "${formData.name}" berhasil diperbarui!`);
      } else {
        const res = await fetch("/api/staff-users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            role: formData.role,
            branch: formData.branch,
            status: formData.status,
          }),
        });
        const payload = await res.json().catch(() => ({}));
        if (!res.ok) {
          alert(payload?.fields?.password ?? payload?.error ?? "Gagal menambah staf.");
          return;
        }
        showToast(`Sub-User baru "${formData.name}" berhasil didaftarkan.`);
      }

      await reloadAccounts();
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      alert("Tidak bisa menghubungi server.");
    }
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordTargetUser || !newPassword.trim()) return;

    try {
      const res = await fetch(`/api/staff-users/${encodeURIComponent(passwordTargetUser.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPassword.trim() }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(payload?.fields?.password ?? payload?.error ?? "Gagal mengubah password.");
        return;
      }

      showToast(`Password untuk sub-user ${passwordTargetUser.name} berhasil diubah!`);
      setIsPasswordModalOpen(false);
    } catch (err) {
      console.error(err);
      alert("Tidak bisa menghubungi server.");
    }
  };

  const handleDeleteAccount = async (acc: UserAccount) => {
    if (acc.role === "Admin Master") {
      alert("Akun CEO / Admin Master tidak dapat dihapus!");
      return;
    }
    if (!confirm(`Yakin ingin menghapus sub-user "${acc.name}"?`)) return;

    try {
      const res = await fetch(`/api/staff-users/${encodeURIComponent(acc.id)}`, { method: "DELETE" });
      if (!res.ok) {
        alert("Gagal menghapus staf.");
        return;
      }
      await reloadAccounts();
      showToast(`Sub-user "${acc.name}" telah dihapus dari sistem.`);
    } catch (err) {
      console.error(err);
      alert("Tidak bisa menghubungi server.");
    }
  };

  return (
    <AppShell eyebrow="Manajemen Tim & RBAC" title="Kelola Admin Master & Sub-User Tim Internal">
      <div className="space-y-5 font-sans">
        
        {/* Toast Alert Feedback */}
        {toastMessage && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-bold text-emerald-800 flex items-center gap-2 shadow-xs animate-in fade-in slide-in-from-top-1 duration-200">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Header Hero Banner */}
        <section className="rounded-2xl border border-stone-200/70 bg-white p-5 sm:p-6 shadow-2xs">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-brand-cocoa">
                Manajemen Sub-User & Reset Password Staf
              </h1>
              <p className="text-xs text-stone-500 mt-1">
                Buat, edit, dan atur kata sandi login sub-user tim internal travel (Admin Master, Ops, Keuangan, Sales, & Lapangan).
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/pengaturan/hak-akses"
                className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3.5 text-xs font-semibold text-stone-700 hover:bg-stone-50 shadow-2xs"
              >
                <ShieldCheck className="h-4 w-4 text-stone-500" />
                <span>Atur Matriks Perizinan →</span>
              </Link>

              <button
                type="button"
                onClick={handleOpenAddModal}
                className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-brand-pink px-4 text-xs font-semibold text-white shadow-2xs hover:bg-brand-pinkHover transition shrink-0"
              >
                <UserPlus className="h-4 w-4" strokeWidth={1.5} />
                <span>+ Buat Sub-User Baru</span>
              </button>
            </div>
          </div>
        </section>

        {/* Metric Cards Row */}
        <section className="grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl border border-stone-200/70 bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-stone-500">Total Akun Tim</p>
              <Users className="h-4 w-4 text-brand-pink" strokeWidth={1.5} />
            </div>
            <p className="mt-1 text-2xl font-bold text-brand-cocoa">{accounts.length} Sub-User</p>
            <p className="mt-1 text-[11px] text-stone-400">Tim Internal El Massa Travel</p>
          </article>

          <article className="rounded-2xl border border-stone-200/70 bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-stone-500">Admin Master</p>
              <ShieldCheck className="h-4 w-4 text-brand-pink" strokeWidth={1.5} />
            </div>
            <p className="mt-1 text-2xl font-bold text-brand-pink">
              {accounts.filter((a) => a.role === "Admin Master").length} Super Admin
            </p>
            <p className="mt-1 text-[11px] text-stone-400">Akses Penuh Manajemen</p>
          </article>

          <article className="rounded-2xl border border-stone-200/70 bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-stone-500">Sub-User Tim Staf</p>
              <UserCog className="h-4 w-4 text-sky-600" strokeWidth={1.5} />
            </div>
            <p className="mt-1 text-2xl font-bold text-sky-800">
              {accounts.filter((a) => a.role !== "Admin Master").length} Sub-User Tim
            </p>
            <p className="mt-1 text-[11px] text-stone-400">Staf Ops, Keuangan, Sales & Field</p>
          </article>
        </section>

        {/* Tab Filters & Table */}
        <section className="rounded-2xl border border-stone-200/70 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-stone-100 pb-3">
            <div className="flex items-center gap-1.5">
              {(["Semua", "Admin Master", "Sub-User Tim"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`h-8 rounded-xl px-3 text-xs font-semibold transition ${
                    activeTab === tab
                      ? "bg-rose-50 text-brand-pink border border-brand-pink/20 font-bold shadow-2xs"
                      : "text-stone-600 hover:bg-stone-50"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <p className="text-xs text-stone-400">Menampilkan {filteredAccounts.length} akun sub-user</p>
          </div>

          {/* 📱 NATIVE MOBILE TOUCH CARDS (Hidden on Desktop) */}
          <div className="space-y-3 block md:hidden">
            {filteredAccounts.map((acc) => (
              <div
                key={acc.id}
                className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-2xs space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-xs text-stone-900">{acc.name}</h4>
                    <p className="text-[11px] text-stone-500 font-mono">{acc.email}</p>
                  </div>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] ${roleBadgeStyles[acc.role]}`}>
                    {acc.role}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                  <div>
                    <span className="text-[10px] text-stone-400 block font-medium">Divisi</span>
                    <span className="font-bold text-stone-800">{acc.teamDivision}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 block font-medium">Cabang</span>
                    <span className="font-bold text-stone-800">{acc.branch}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 text-xs border-t border-stone-100">
                  <span className="font-mono text-[10px] text-stone-400">Pass: ••••••••</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenPasswordModal(acc)}
                      className="inline-flex items-center gap-1 rounded-lg border border-amber-200 bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-900"
                    >
                      <KeyRound className="h-3 w-3" /> Reset Pass
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(acc)}
                      className="inline-flex items-center gap-1 rounded-lg border border-stone-200 bg-stone-50 px-2 py-1 text-[10px] font-bold text-stone-700"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 🖥️ DESKTOP DATA TABLE (Hidden on Mobile) */}
          <div className="hidden md:block overflow-x-auto rounded-xl border border-stone-200/60">
            <table className="w-full min-w-[950px] border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-stone-200/60 bg-stone-50/70 font-semibold text-stone-500 text-[11px] uppercase tracking-wider">
                  <th className="py-2.5 pl-3 pr-2">Nama Sub-User</th>
                  <th className="py-2.5 pr-2">Role System</th>
                  <th className="py-2.5 pr-2">Divisi Internal</th>
                  <th className="py-2.5 pr-2">Cabang Kantor</th>
                  <th className="py-2.5 pr-2">Email & WhatsApp</th>
                  <th className="py-2.5 pr-2 text-center">Password Login</th>
                  <th className="py-2.5 pr-3 text-right">Aksi Kelola</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-normal">
                {filteredAccounts.map((acc) => (
                  <tr key={acc.id} className="transition hover:bg-stone-50/60">
                    <td className="py-3 pl-3 pr-2 font-bold text-brand-cocoa whitespace-nowrap">
                      {acc.name}
                    </td>
                    <td className="py-3 pr-2 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] ${roleBadgeStyles[acc.role]}`}>
                        {acc.role}
                      </span>
                    </td>
                    <td className="py-3 pr-2 font-semibold text-stone-800 whitespace-nowrap">{acc.teamDivision}</td>
                    <td className="py-3 pr-2 font-medium text-stone-600 whitespace-nowrap">{acc.branch}</td>
                    <td className="py-3 pr-2 font-mono text-stone-600 whitespace-nowrap">
                      {acc.email} <span className="text-stone-400">• {acc.phone}</span>
                    </td>
                    <td className="py-3 pr-2 text-center whitespace-nowrap">
                      <span
                        className="font-mono text-[11px] bg-stone-100 px-2 py-0.5 rounded text-stone-500 font-semibold border border-stone-200"
                        title="Password disimpan sebagai hash dan tidak bisa ditampilkan. Gunakan Ubah Password untuk mengganti."
                      >
                        ••••••••
                      </span>
                    </td>
                    <td className="py-3 pr-3 text-right whitespace-nowrap space-x-1">
                      
                      {/* Set Password Button */}
                      <button
                        type="button"
                        onClick={() => handleOpenPasswordModal(acc)}
                        title="Set / Reset Password Sub-User"
                        className="inline-flex items-center gap-1 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-900 hover:bg-amber-100 transition"
                      >
                        <KeyRound className="h-3 w-3 text-amber-700" strokeWidth={1.5} />
                        <span>Set Password</span>
                      </button>

                      {/* Edit Sub-User Button */}
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(acc)}
                        title="Edit Data Sub-User"
                        className="inline-flex items-center gap-1 rounded-lg border border-stone-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-stone-700 hover:bg-stone-50 transition"
                      >
                        <Pencil className="h-3 w-3 text-stone-500" strokeWidth={1.5} />
                        <span>Edit</span>
                      </button>

                      {/* Delete Sub-User Button */}
                      {acc.role !== "Admin Master" && (
                        <button
                          type="button"
                          onClick={() => handleDeleteAccount(acc)}
                          title="Hapus Sub-User"
                          className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2 py-1 text-[11px] font-semibold text-rose-700 hover:bg-rose-600 hover:text-white transition"
                        >
                          <Trash2 className="h-3 w-3" strokeWidth={1.5} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

      </div>

      {/* 📝 MODAL 1: BUAT / EDIT SUB-USER TIM */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <form onSubmit={handleSaveAccount} className="relative w-full max-w-lg rounded-2xl border border-stone-200 bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="text-base font-bold text-brand-cocoa flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-brand-pink" />
                <span>{editingId ? "Edit Data Sub-User Tim" : "Tambah Sub-User Tim Baru"}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-xl border border-stone-200 bg-stone-50 text-stone-500 hover:bg-stone-100 transition"
              >
                <X className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <label className="block space-y-1">
                <span className="font-semibold text-stone-700">Nama Lengkap Sub-User Staf</span>
                <input
                  required
                  className="w-full h-9 rounded-xl border border-stone-200 bg-stone-50/50 px-3 text-xs text-brand-cocoa font-medium outline-none focus:border-brand-pink focus:bg-white"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Muhammad Farhan"
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="block space-y-1">
                  <span className="font-semibold text-stone-700">Role Sub-User System</span>
                  <select
                    className="w-full h-9 rounded-xl border border-stone-200 bg-white px-3 text-xs font-bold text-brand-cocoa outline-none"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                  >
                    <option value="Admin Master">Admin Master (Super Admin)</option>
                    <option value="Sub-User Operasional">Sub-User Operasional</option>
                    <option value="Sub-User Keuangan">Sub-User Keuangan</option>
                    <option value="Sub-User Sales & CRM">Sub-User Sales & CRM</option>
                    <option value="Sub-User Lapangan">Sub-User Lapangan</option>
                  </select>
                </label>

                <label className="block space-y-1">
                  <span className="font-semibold text-stone-700">Divisi Tim Internal</span>
                  <input
                    required
                    className="w-full h-9 rounded-xl border border-stone-200 bg-stone-50/50 px-3 text-xs font-medium outline-none focus:border-brand-pink focus:bg-white"
                    value={formData.teamDivision}
                    onChange={(e) => setFormData({ ...formData, teamDivision: e.target.value })}
                    placeholder="Contoh: Operasional & Flight"
                  />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="block space-y-1">
                  <span className="font-semibold text-stone-700">Cabang Kantor</span>
                  <select
                    className="w-full h-9 rounded-xl border border-stone-200 bg-white px-3 text-xs font-medium outline-none"
                    value={formData.branch}
                    onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                  >
                    <option value="Pangkalpinang (Bangka)">Pangkalpinang (Bangka)</option>
                    <option value="Tanjung Pandan (Belitung)">Tanjung Pandan (Belitung)</option>
                    <option value="Palembang (Sumbagsel)">Palembang (Sumbagsel)</option>
                    <option value="Jakarta (Pusat)">Jakarta (Pusat)</option>
                  </select>
                </label>

                <label className="block space-y-1">
                  <span className="font-semibold text-stone-700">Status Akun</span>
                  <select
                    className="w-full h-9 rounded-xl border border-stone-200 bg-white px-3 text-xs font-medium outline-none"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Nonaktif">Nonaktif</option>
                  </select>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="block space-y-1">
                  <span className="font-semibold text-stone-700">Email Login Staf</span>
                  <input
                    type="email"
                    required
                    className="w-full h-9 rounded-xl border border-stone-200 bg-stone-50/50 px-3 text-xs font-mono outline-none focus:border-brand-pink focus:bg-white"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="nama@elmassa.test"
                  />
                </label>

                <label className="block space-y-1">
                  <span className="font-semibold text-stone-700">No. WhatsApp Staf</span>
                  <input
                    required
                    className="w-full h-9 rounded-xl border border-stone-200 bg-stone-50/50 px-3 text-xs font-mono outline-none focus:border-brand-pink focus:bg-white"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="0812-xxxx-xxxx"
                  />
                </label>
              </div>

              {/* Password Field */}
              <label className="block space-y-1 pt-1">
                <span className="font-semibold text-stone-700 flex items-center gap-1">
                  <Lock className="h-3.5 w-3.5 text-stone-500" /> Password Login Initial
                </span>
                <div className="relative">
                  <input
                    type={showPasswordInAdd ? "text" : "password"}
                    required
                    className="w-full h-9 rounded-xl border border-stone-200 bg-stone-50/50 px-3 pr-9 text-xs font-mono outline-none focus:border-brand-pink focus:bg-white"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Masukkan password login"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordInAdd(!showPasswordInAdd)}
                    className="absolute right-2.5 top-2.5 text-stone-400 hover:text-stone-600"
                  >
                    {showPasswordInAdd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-stone-100 pt-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="h-9 rounded-xl border border-stone-200 bg-white px-4 text-xs font-semibold text-stone-600 hover:bg-stone-50"
              >
                Batal
              </button>
              <button
                type="submit"
                className="h-9 rounded-xl bg-brand-pink px-5 text-xs font-semibold text-white shadow-2xs hover:bg-brand-pinkHover"
              >
                Simpan Sub-User Staf
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 🔑 MODAL 2: KHUSUS SET / RESET PASSWORD SUB-USER */}
      {isPasswordModalOpen && passwordTargetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <form onSubmit={handleSavePassword} className="relative w-full max-w-md rounded-2xl border border-stone-200 bg-white p-6 shadow-xl space-y-4">
            
            <div className="flex items-start justify-between border-b border-stone-100 pb-3">
              <div>
                <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-extrabold uppercase text-amber-800 border border-amber-200">
                  Reset Password Staf
                </span>
                <h3 className="text-base font-extrabold text-brand-cocoa mt-1">
                  {passwordTargetUser.name}
                </h3>
                <p className="text-xs text-stone-500 font-mono">{passwordTargetUser.email}</p>
              </div>

              <button
                type="button"
                onClick={() => setIsPasswordModalOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-xl border border-stone-200 bg-stone-50 text-stone-500 hover:bg-stone-100 transition"
              >
                <X className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3 text-[11px] text-amber-900 space-y-1">
                <p className="font-bold flex items-center gap-1">
                  <KeyRound className="h-3.5 w-3.5 text-amber-700" /> Atur Kata Sandi Baru Sub-User
                </p>
                <p>Pengubahan password ini langsung aktif dan dapat digunakan sub-user saat login di halaman `/login`.</p>
              </div>

              <label className="block space-y-1">
                <span className="font-semibold text-stone-700">Password Baru Sub-User</span>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    required
                    className="w-full h-10 rounded-xl border border-stone-300 bg-white px-3 pr-10 text-sm font-mono outline-none focus:border-brand-pink ring-1 ring-stone-200"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Ketik password baru"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-3 text-stone-400 hover:text-stone-600"
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </label>

              {/* Quick Set Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setNewPassword("admin123")}
                  className="rounded-lg border border-stone-200 bg-stone-100 px-2.5 py-1 text-[11px] font-semibold text-stone-700 hover:bg-stone-200"
                >
                  Set Default (admin123)
                </button>
                <button
                  type="button"
                  onClick={() => setNewPassword(`elmassa${Math.floor(100 + Math.random() * 900)}`)}
                  className="rounded-lg border border-stone-200 bg-stone-100 px-2.5 py-1 text-[11px] font-semibold text-stone-700 hover:bg-stone-200"
                >
                  Generate Acak
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-stone-100 pt-3">
              <button
                type="button"
                onClick={() => setIsPasswordModalOpen(false)}
                className="h-9 rounded-xl border border-stone-200 bg-white px-4 text-xs font-semibold text-stone-600 hover:bg-stone-50"
              >
                Batal
              </button>
              <button
                type="submit"
                className="h-9 rounded-xl bg-brand-pink px-5 text-xs font-semibold text-white shadow-2xs hover:bg-brand-pinkHover flex items-center gap-1.5"
              >
                <KeyRound className="h-3.5 w-3.5" />
                <span>Simpan Password Baru</span>
              </button>
            </div>

          </form>
        </div>
      )}

    </AppShell>
  );
}
