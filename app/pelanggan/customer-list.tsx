"use client";

import { useMemo, useState } from "react";
import { Edit3, Filter, Search, UserPlus, Users } from "lucide-react";
import Link from "next/link";

type Customer = {
  id: string;
  name: string;
  phone: string;
  email: string;
  type: string;
  status: string;
  city: string;
  address: string;
  lastBooking: string;
  totalBookings: number;
};

type CustomerListProps = {
  customers: Customer[];
};

const typeOptions = ["Semua", "Individu", "Keluarga", "Rombongan", "Corporate"];
const statusOptions = ["Semua", "Aktif", "Follow-up", "Prospek", "Nonaktif"];

const statusStyles: Record<string, string> = {
  Aktif: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  "Follow-up": "bg-amber-50 text-amber-700 ring-amber-200",
  Prospek: "bg-brand-rose text-brand-cocoa ring-brand-pink/30",
  Nonaktif: "bg-stone-100 text-stone-700 ring-stone-200",
};

export function CustomerList({ customers }: CustomerListProps) {
  const [query, setQuery] = useState("");
  const [selectedType, setSelectedType] = useState("Semua");
  const [selectedStatus, setSelectedStatus] = useState("Semua");
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [selectedCustomerId, setSelectedCustomerId] = useState(customers[0]?.id ?? "");

  const selectedCustomer = customers.find((customer) => customer.id === selectedCustomerId) ?? customers[0];

  const filteredCustomers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return customers.filter((customer) => {
      const searchable = `${customer.name} ${customer.phone} ${customer.email} ${customer.city} ${customer.lastBooking}`.toLowerCase();
      const matchesQuery = normalizedQuery.length === 0 || searchable.includes(normalizedQuery);
      const matchesType = selectedType === "Semua" || customer.type === selectedType;
      const matchesStatus = selectedStatus === "Semua" || customer.status === selectedStatus;

      return matchesQuery && matchesType && matchesStatus;
    });
  }, [customers, query, selectedStatus, selectedType]);

  return (
    <>
      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
          <p className="text-sm font-semibold text-stone-500">Total Pelanggan</p>
          <p className="mt-3 text-2xl font-bold text-brand-cocoa">{customers.length}</p>
          <p className="mt-2 text-sm text-stone-500">Data pelanggan dummy</p>
        </article>
        <article className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
          <p className="text-sm font-semibold text-stone-500">Pelanggan Aktif</p>
          <p className="mt-3 text-2xl font-bold text-brand-cocoa">
            {customers.filter((customer) => customer.status === "Aktif").length}
          </p>
          <p className="mt-2 text-sm text-stone-500">Pernah atau sedang booking</p>
        </article>
        <article className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
          <p className="text-sm font-semibold text-stone-500">Total Booking</p>
          <p className="mt-3 text-2xl font-bold text-brand-cocoa">
            {customers.reduce((total, customer) => total + customer.totalBookings, 0)}
          </p>
          <p className="mt-2 text-sm text-stone-500">Akumulasi dari pelanggan dummy</p>
        </article>
      </section>

      <section className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h3 className="text-lg font-bold text-brand-cocoa">Daftar Pelanggan</h3>
            <p className="mt-1 text-sm text-stone-500">Cari pelanggan berdasarkan nama, kontak, kota, atau booking terakhir.</p>
          </div>
          <button className="inline-flex h-10 w-fit items-center gap-2 rounded-md bg-brand-pink px-4 text-sm font-semibold text-white" type="button">
            <UserPlus className="h-4 w-4" aria-hidden="true" />
            Tambah pelanggan
          </button>
        </div>

        <div className="mt-5 grid gap-3 xl:grid-cols-[1fr_220px_220px]">
          <label className="flex h-11 items-center gap-2 rounded-md border border-stone-200 bg-brand-cream px-3 text-sm text-stone-500">
            <Search className="h-4 w-4 shrink-0 text-brand-brown" aria-hidden="true" />
            <input
              className="w-full bg-transparent text-brand-cocoa outline-none placeholder:text-stone-400"
              placeholder="Cari nama, telepon, email, kota"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <label className="flex h-11 items-center gap-2 rounded-md border border-stone-200 bg-white px-3 text-sm text-stone-600">
            <Users className="h-4 w-4 shrink-0 text-brand-brown" aria-hidden="true" />
            <select
              className="w-full bg-transparent font-semibold text-brand-cocoa outline-none"
              value={selectedType}
              onChange={(event) => setSelectedType(event.target.value)}
            >
              {typeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label className="flex h-11 items-center gap-2 rounded-md border border-stone-200 bg-white px-3 text-sm text-stone-600">
            <Filter className="h-4 w-4 shrink-0 text-brand-brown" aria-hidden="true" />
            <select
              className="w-full bg-transparent font-semibold text-brand-cocoa outline-none"
              value={selectedStatus}
              onChange={(event) => setSelectedStatus(event.target.value)}
            >
              {statusOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-5 overflow-x-auto rounded-lg border border-stone-200">
          <table className="w-full min-w-[860px] border-collapse text-left text-sm">
            <thead className="bg-brand-cream text-xs uppercase text-stone-500">
              <tr>
                <th className="px-4 py-3 font-bold">Nama</th>
                <th className="px-4 py-3 font-bold">Kontak</th>
                <th className="px-4 py-3 font-bold">Jenis</th>
                <th className="px-4 py-3 font-bold">Kota</th>
                <th className="px-4 py-3 font-bold">Booking terakhir</th>
                <th className="px-4 py-3 font-bold">Total</th>
                <th className="px-4 py-3 font-bold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 bg-white">
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="text-stone-700 hover:bg-brand-cream">
                  <td className="px-4 py-4">
                    <Link className="font-bold text-brand-cocoa hover:text-brand-pink" href={`/pelanggan/${customer.id}`}>
                      {customer.name}
                    </Link>
                    <p className="mt-1 text-xs text-stone-500">{customer.email}</p>
                  </td>
                  <td className="px-4 py-4 font-semibold">{customer.phone}</td>
                  <td className="px-4 py-4">{customer.type}</td>
                  <td className="px-4 py-4">{customer.city}</td>
                  <td className="px-4 py-4">{customer.lastBooking}</td>
                  <td className="px-4 py-4 font-bold text-brand-cocoa">{customer.totalBookings}</td>
                  <td className="px-4 py-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${statusStyles[customer.status]}`}>
                      {customer.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredCustomers.length === 0 ? (
            <div className="p-8 text-center">
              <p className="font-bold text-brand-cocoa">Pelanggan tidak ditemukan</p>
              <p className="mt-2 text-sm text-stone-500">Coba ubah kata kunci, jenis pelanggan, atau status.</p>
            </div>
          ) : null}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <article className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
          <h3 className="text-lg font-bold text-brand-cocoa">Mode Formulir</h3>
          <p className="mt-1 text-sm leading-6 text-stone-500">
            Panel ini memakai data dummy untuk menggambarkan tambah dan edit profil pelanggan.
          </p>

          <div className="mt-5 grid grid-cols-2 gap-2 rounded-md bg-brand-cream p-1">
            <button
              className={`flex h-10 items-center justify-center gap-2 rounded-md text-sm font-bold ${
                formMode === "create" ? "bg-brand-pink text-white" : "text-brand-cocoa"
              }`}
              type="button"
              onClick={() => setFormMode("create")}
            >
              <UserPlus className="h-4 w-4" aria-hidden="true" />
              Tambah
            </button>
            <button
              className={`flex h-10 items-center justify-center gap-2 rounded-md text-sm font-bold ${
                formMode === "edit" ? "bg-brand-pink text-white" : "text-brand-cocoa"
              }`}
              type="button"
              onClick={() => setFormMode("edit")}
            >
              <Edit3 className="h-4 w-4" aria-hidden="true" />
              Edit
            </button>
          </div>

          <label className="mt-5 block text-sm font-semibold text-brand-cocoa">
            Pelanggan contoh
            <select
              className="mt-2 h-11 w-full rounded-md border border-stone-200 bg-white px-3 text-sm text-brand-cocoa outline-none"
              value={selectedCustomerId}
              onChange={(event) => {
                setSelectedCustomerId(event.target.value);
                setFormMode("edit");
              }}
            >
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
          </label>
        </article>

        <form
          key={`${formMode}-${selectedCustomer?.id}`}
          className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft"
        >
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="text-lg font-bold text-brand-cocoa">
                {formMode === "create" ? "Tambah Pelanggan" : "Edit Pelanggan"}
              </h3>
              <p className="mt-1 text-sm text-stone-500">
                {formMode === "create"
                  ? "Isi profil pelanggan baru untuk kebutuhan booking."
                  : `Mengubah data dummy untuk ${selectedCustomer?.name}.`}
              </p>
            </div>
            <span className="w-fit rounded-md bg-brand-cream px-3 py-2 text-xs font-bold uppercase text-brand-brown ring-1 ring-brand-rose">
              UI Only
            </span>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <label className="block text-sm font-semibold text-brand-cocoa">
              Nama pelanggan
              <input
                className="mt-2 h-11 w-full rounded-md border border-stone-200 bg-brand-cream px-3 text-sm outline-none"
                defaultValue={formMode === "edit" ? selectedCustomer?.name : ""}
                placeholder="Nama individu, keluarga, atau rombongan"
              />
            </label>

            <label className="block text-sm font-semibold text-brand-cocoa">
              Nomor telepon
              <input
                className="mt-2 h-11 w-full rounded-md border border-stone-200 bg-brand-cream px-3 text-sm outline-none"
                defaultValue={formMode === "edit" ? selectedCustomer?.phone : ""}
                placeholder="08xx / nomor kantor"
              />
            </label>

            <label className="block text-sm font-semibold text-brand-cocoa">
              Email
              <input
                className="mt-2 h-11 w-full rounded-md border border-stone-200 bg-brand-cream px-3 text-sm outline-none"
                defaultValue={formMode === "edit" ? selectedCustomer?.email : ""}
                placeholder="email@domain.com"
                type="email"
              />
            </label>

            <label className="block text-sm font-semibold text-brand-cocoa">
              Kota
              <input
                className="mt-2 h-11 w-full rounded-md border border-stone-200 bg-brand-cream px-3 text-sm outline-none"
                defaultValue={formMode === "edit" ? selectedCustomer?.city : ""}
                placeholder="Bekasi"
              />
            </label>

            <label className="block text-sm font-semibold text-brand-cocoa">
              Jenis pelanggan
              <select
                className="mt-2 h-11 w-full rounded-md border border-stone-200 bg-white px-3 text-sm outline-none"
                defaultValue={formMode === "edit" ? selectedCustomer?.type : "Individu"}
              >
                {typeOptions.filter((option) => option !== "Semua").map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>

            <label className="block text-sm font-semibold text-brand-cocoa">
              Status
              <select
                className="mt-2 h-11 w-full rounded-md border border-stone-200 bg-white px-3 text-sm outline-none"
                defaultValue={formMode === "edit" ? selectedCustomer?.status : "Prospek"}
              >
                {statusOptions.filter((option) => option !== "Semua").map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>

            <label className="block text-sm font-semibold text-brand-cocoa lg:col-span-2">
              Alamat
              <textarea
                className="mt-2 min-h-24 w-full rounded-md border border-stone-200 bg-brand-cream px-3 py-3 text-sm outline-none"
                defaultValue={formMode === "edit" ? selectedCustomer?.address : ""}
                placeholder="Alamat lengkap pelanggan"
              />
            </label>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button className="h-10 rounded-md border border-stone-200 bg-white px-4 text-sm font-bold text-brand-cocoa" type="button">
              Reset
            </button>
            <button className="h-10 rounded-md bg-brand-cocoa px-4 text-sm font-bold text-white" type="button">
              Simpan pelanggan dummy
            </button>
          </div>
        </form>
      </section>
    </>
  );
}
