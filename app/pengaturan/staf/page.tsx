"use client";

import { Pencil, Plus, RotateCcw, UserCog, UserMinus } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";

type StaffUser = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  branch: string;
  status: string;
};

const initialStaff: StaffUser[] = [
  { id: "staff-maya", name: "Maya Safitri", email: "maya@elmassa.test", phone: "0812-3344-7788", role: "Admin Operasional", branch: "Bekasi", status: "Aktif" },
];

const emptyForm = {
  branch: "Bekasi",
  email: "",
  name: "",
  phone: "",
  role: "Sales",
  status: "Aktif",
};

const statusStyles: Record<string, string> = {
  Aktif: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Nonaktif: "bg-stone-100 text-stone-600 ring-stone-200",
};

export default function StaffSettingsPage() {
  const [staffRows, setStaffRows] = useState(initialStaff);
  const [form, setForm] = useState<Omit<StaffUser, "id">>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const activeCount = useMemo(() => staffRows.filter((staff) => staff.status === "Aktif").length, [staffRows]);
  const financeCount = useMemo(() => staffRows.filter((staff) => staff.role === "Admin Keuangan" && staff.status === "Aktif").length, [staffRows]);
  const selectedStaff = editingId ? staffRows.find((staff) => staff.id === editingId) : null;

  const handleSubmit = () => {
    if (!form.name.trim() || !form.email.trim()) {
      return;
    }

    if (editingId) {
      setStaffRows((current) =>
        current.map((staff) =>
          staff.id === editingId
            ? {
                ...staff,
                ...form,
              }
            : staff,
        ),
      );
      setEditingId(null);
      setForm(emptyForm);
      return;
    }

    setStaffRows((current) => [
      ...current,
      {
        ...form,
        id: `staff-${crypto.randomUUID()}`,
      },
    ]);
    setForm(emptyForm);
  };

  const handleEdit = (staff: StaffUser) => {
    setEditingId(staff.id);
    setForm({
      branch: staff.branch,
      email: staff.email,
      name: staff.name,
      phone: staff.phone,
      role: staff.role,
      status: staff.status,
    });
  };

  const handleToggleStatus = (staffId: string) => {
    setStaffRows((current) =>
      current.map((staff) =>
        staff.id === staffId
          ? {
              ...staff,
              status: staff.status === "Aktif" ? "Nonaktif" : "Aktif",
            }
          : staff,
      ),
    );
  };

  return (
    <AppShell eyebrow="Pengaturan Master" title="Staf Pengguna">
      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
          <p className="text-sm font-semibold text-stone-500">Total Staf</p>
          <p className="mt-3 text-2xl font-bold text-brand-cocoa">{staffRows.length}</p>
          <p className="mt-2 text-sm text-stone-500">Data pengguna dummy</p>
        </article>
        <article className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
          <p className="text-sm font-semibold text-stone-500">Aktif</p>
          <p className="mt-3 text-2xl font-bold text-brand-cocoa">{activeCount}</p>
          <p className="mt-2 text-sm text-stone-500">Bisa ditugaskan ke operasional</p>
        </article>
        <article className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
          <p className="text-sm font-semibold text-stone-500">Admin Keuangan</p>
          <p className="mt-3 text-2xl font-bold text-brand-cocoa">{financeCount}</p>
          <p className="mt-2 text-sm text-stone-500">{selectedStaff?.name ?? "Tidak sedang edit"}</p>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <form className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
          <div className="mb-5 flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-lg bg-brand-rose text-brand-pink">
              <UserCog className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h3 className="font-bold text-brand-cocoa">{editingId ? "Edit Staf" : "Tambah Staf"}</h3>
              <p className="text-sm text-stone-500">Role dipakai untuk kontrol akses dummy.</p>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-semibold text-brand-cocoa">
              Nama staf
              <input className="mt-2 h-10 w-full rounded-md border border-stone-200 bg-white px-3 text-sm outline-none" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
            </label>
            <label className="block text-sm font-semibold text-brand-cocoa">
              Email
              <input className="mt-2 h-10 w-full rounded-md border border-stone-200 bg-white px-3 text-sm outline-none" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
            </label>
            <label className="block text-sm font-semibold text-brand-cocoa">
              Telepon
              <input className="mt-2 h-10 w-full rounded-md border border-stone-200 bg-white px-3 text-sm outline-none" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
            </label>
            <label className="block text-sm font-semibold text-brand-cocoa">
              Role
              <select className="mt-2 h-10 w-full rounded-md border border-stone-200 bg-white px-3 text-sm outline-none" value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}>
                <option>Admin Operasional</option>
                <option>Admin Keuangan</option>
                <option>Sales</option>
                <option>Dokumen</option>
                <option>Supervisor</option>
              </select>
            </label>
            <label className="block text-sm font-semibold text-brand-cocoa">
              Cabang
              <select className="mt-2 h-10 w-full rounded-md border border-stone-200 bg-white px-3 text-sm outline-none" value={form.branch} onChange={(event) => setForm({ ...form, branch: event.target.value })}>
                <option>Bekasi</option>
                <option>Jakarta</option>
                <option>Bandung</option>
              </select>
            </label>
          </div>

          <div className="mt-5 flex gap-3">
            <button className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-md bg-brand-pink px-4 text-sm font-bold text-white" type="button" onClick={handleSubmit}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              {editingId ? "Simpan" : "Tambah"}
            </button>
            <button className="h-10 rounded-md border border-stone-200 bg-white px-4 text-sm font-bold text-brand-cocoa" type="button" onClick={() => { setEditingId(null); setForm(emptyForm); }}>
              Reset
            </button>
          </div>
        </form>

        <section className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-bold text-brand-cocoa">Daftar Staf</h3>
              <p className="mt-1 text-sm text-stone-500">Kelola pengguna internal tanpa menghapus riwayat penugasan.</p>
            </div>
            <Link className="inline-flex h-10 w-fit items-center justify-center rounded-md border border-stone-200 bg-white px-4 text-sm font-bold text-brand-cocoa" href="/pengaturan">
              Pengaturan master
            </Link>
          </div>

          <div className="overflow-x-auto rounded-lg border border-stone-200">
            <table className="w-full min-w-[940px] border-collapse text-left text-sm">
              <thead className="bg-brand-cream text-xs uppercase text-stone-500">
                <tr>
                  <th className="px-4 py-3 font-bold">Nama</th>
                  <th className="px-4 py-3 font-bold">Email</th>
                  <th className="px-4 py-3 font-bold">Telepon</th>
                  <th className="px-4 py-3 font-bold">Role</th>
                  <th className="px-4 py-3 font-bold">Cabang</th>
                  <th className="px-4 py-3 font-bold">Status</th>
                  <th className="px-4 py-3 font-bold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 bg-white">
                {staffRows.map((staff) => (
                  <tr key={staff.id} className="text-stone-700 hover:bg-brand-cream">
                    <td className="px-4 py-4 font-bold text-brand-cocoa">{staff.name}</td>
                    <td className="px-4 py-4">{staff.email}</td>
                    <td className="px-4 py-4">{staff.phone}</td>
                    <td className="px-4 py-4">{staff.role}</td>
                    <td className="px-4 py-4">{staff.branch}</td>
                    <td className="px-4 py-4">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${statusStyles[staff.status]}`}>
                        {staff.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-2">
                        <button className="grid h-9 w-9 place-items-center rounded-md border border-stone-200 bg-white text-brand-cocoa" type="button" aria-label={`Edit ${staff.name}`} onClick={() => handleEdit(staff)}>
                          <Pencil className="h-4 w-4" aria-hidden="true" />
                        </button>
                        <button className="grid h-9 w-9 place-items-center rounded-md border border-stone-200 bg-white text-rose-700" type="button" aria-label={`${staff.status === "Aktif" ? "Nonaktifkan" : "Aktifkan"} ${staff.name}`} onClick={() => handleToggleStatus(staff.id)}>
                          {staff.status === "Aktif" ? <UserMinus className="h-4 w-4" aria-hidden="true" /> : <RotateCcw className="h-4 w-4" aria-hidden="true" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </AppShell>
  );
}
