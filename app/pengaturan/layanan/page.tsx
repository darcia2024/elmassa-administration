"use client";

import { Pencil, Plus, Tags, Trash2 } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";

type ServiceType = {
  id: string;
  name: string;
  category: string;
  defaultDuration: string;
  documentTemplate: string;
  status: string;
};

const initialServices: ServiceType[] = [
  {
    id: "srv-umrah",
    name: "Umrah",
    category: "Religi",
    defaultDuration: "9-13 hari",
    documentTemplate: "Invoice Umrah",
    status: "Aktif",
  },
];

const emptyForm = {
  category: "Wisata",
  defaultDuration: "",
  documentTemplate: "",
  name: "",
  status: "Aktif",
};

const statusStyles: Record<string, string> = {
  Aktif: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Draft: "bg-amber-50 text-amber-700 ring-amber-200",
  Nonaktif: "bg-stone-100 text-stone-600 ring-stone-200",
};

export default function ServiceTypesPage() {
  const [services, setServices] = useState(initialServices);
  const [form, setForm] = useState<Omit<ServiceType, "id">>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const activeCount = useMemo(() => services.filter((service) => service.status === "Aktif").length, [services]);
  const draftCount = useMemo(() => services.filter((service) => service.status === "Draft").length, [services]);
  const selectedService = editingId ? services.find((service) => service.id === editingId) : null;

  const handleSubmit = () => {
    if (!form.name.trim() || !form.documentTemplate.trim()) {
      return;
    }

    if (editingId) {
      setServices((current) =>
        current.map((service) =>
          service.id === editingId
            ? {
                ...service,
                ...form,
              }
            : service,
        ),
      );
      setEditingId(null);
      setForm(emptyForm);
      return;
    }

    setServices((current) => [
      ...current,
      {
        ...form,
        id: `srv-${crypto.randomUUID()}`,
      },
    ]);
    setForm(emptyForm);
  };

  const handleEdit = (service: ServiceType) => {
    setEditingId(service.id);
    setForm({
      category: service.category,
      defaultDuration: service.defaultDuration,
      documentTemplate: service.documentTemplate,
      name: service.name,
      status: service.status,
    });
  };

  const handleDelete = (serviceId: string) => {
    setServices((current) => current.filter((service) => service.id !== serviceId));
    if (editingId === serviceId) {
      setEditingId(null);
      setForm(emptyForm);
    }
  };

  return (
    <AppShell eyebrow="Pengaturan Master" title="Jenis Layanan">
      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
          <p className="text-sm font-semibold text-stone-500">Total Jenis</p>
          <p className="mt-3 text-2xl font-bold text-brand-cocoa">{services.length}</p>
          <p className="mt-2 text-sm text-stone-500">Data master layanan</p>
        </article>
        <article className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
          <p className="text-sm font-semibold text-stone-500">Aktif</p>
          <p className="mt-3 text-2xl font-bold text-brand-cocoa">{activeCount}</p>
          <p className="mt-2 text-sm text-stone-500">Bisa dipilih di paket</p>
        </article>
        <article className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
          <p className="text-sm font-semibold text-stone-500">Draft</p>
          <p className="mt-3 text-2xl font-bold text-brand-cocoa">{draftCount}</p>
          <p className="mt-2 text-sm text-stone-500">{selectedService?.name ?? "Tidak sedang edit"}</p>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <form className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
          <div className="mb-5 flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-lg bg-brand-rose text-brand-pink">
              <Tags className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h3 className="font-bold text-brand-cocoa">{editingId ? "Edit Jenis Layanan" : "Tambah Jenis Layanan"}</h3>
              <p className="text-sm text-stone-500">Perubahan tersimpan di state dummy.</p>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-semibold text-brand-cocoa">
              Nama layanan
              <input className="mt-2 h-10 w-full rounded-md border border-stone-200 bg-white px-3 text-sm outline-none" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
            </label>
            <label className="block text-sm font-semibold text-brand-cocoa">
              Kategori
              <select className="mt-2 h-10 w-full rounded-md border border-stone-200 bg-white px-3 text-sm outline-none" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>
                <option>Religi</option>
                <option>Wisata</option>
                <option>Khusus</option>
              </select>
            </label>
            <label className="block text-sm font-semibold text-brand-cocoa">
              Durasi default
              <input className="mt-2 h-10 w-full rounded-md border border-stone-200 bg-white px-3 text-sm outline-none" value={form.defaultDuration} onChange={(event) => setForm({ ...form, defaultDuration: event.target.value })} />
            </label>
            <label className="block text-sm font-semibold text-brand-cocoa">
              Template dokumen
              <input className="mt-2 h-10 w-full rounded-md border border-stone-200 bg-white px-3 text-sm outline-none" value={form.documentTemplate} onChange={(event) => setForm({ ...form, documentTemplate: event.target.value })} />
            </label>
            <label className="block text-sm font-semibold text-brand-cocoa">
              Status
              <select className="mt-2 h-10 w-full rounded-md border border-stone-200 bg-white px-3 text-sm outline-none" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
                <option>Aktif</option>
                <option>Draft</option>
                <option>Nonaktif</option>
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
              <h3 className="text-lg font-bold text-brand-cocoa">Daftar Jenis Layanan</h3>
              <p className="mt-1 text-sm text-stone-500">Kategori yang dipakai di paket, laporan, dan invoice.</p>
            </div>
            <Link className="inline-flex h-10 w-fit items-center justify-center rounded-md border border-stone-200 bg-white px-4 text-sm font-bold text-brand-cocoa" href="/pengaturan">
              Pengaturan master
            </Link>
          </div>

          <div className="overflow-x-auto rounded-lg border border-stone-200">
            <table className="w-full min-w-[860px] border-collapse text-left text-sm">
              <thead className="bg-brand-cream text-xs uppercase text-stone-500">
                <tr>
                  <th className="px-4 py-3 font-bold">Layanan</th>
                  <th className="px-4 py-3 font-bold">Kategori</th>
                  <th className="px-4 py-3 font-bold">Durasi</th>
                  <th className="px-4 py-3 font-bold">Template</th>
                  <th className="px-4 py-3 font-bold">Status</th>
                  <th className="px-4 py-3 font-bold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 bg-white">
                {services.map((service) => (
                  <tr key={service.id} className="text-stone-700 hover:bg-brand-cream">
                    <td className="px-4 py-4 font-bold text-brand-cocoa">{service.name}</td>
                    <td className="px-4 py-4">{service.category}</td>
                    <td className="px-4 py-4">{service.defaultDuration}</td>
                    <td className="px-4 py-4">{service.documentTemplate}</td>
                    <td className="px-4 py-4">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${statusStyles[service.status]}`}>
                        {service.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-2">
                        <button className="grid h-9 w-9 place-items-center rounded-md border border-stone-200 bg-white text-brand-cocoa" type="button" aria-label={`Edit ${service.name}`} onClick={() => handleEdit(service)}>
                          <Pencil className="h-4 w-4" aria-hidden="true" />
                        </button>
                        <button className="grid h-9 w-9 place-items-center rounded-md border border-stone-200 bg-white text-rose-700" type="button" aria-label={`Hapus ${service.name}`} onClick={() => handleDelete(service.id)}>
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
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
