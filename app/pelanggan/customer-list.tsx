"use client";

import { useMemo, useState } from "react";
import { Filter, Layers, MapPin, Phone, Search, UserCheck, UserPlus, Users } from "lucide-react";
import Link from "next/link";

type Customer = {
  id: string;
  name: string;
  phone: string;
  email: string;
  type: string;
  groupName: string;
  status: string;
  city: string;
  address: string;
  lastBooking: string;
  totalBookings: number;
};

type CustomerListProps = {
  customers: Customer[];
};

const groupOptions = [
  "Semua Grup Keberangkatan",
  "Rombongan Bangka Belitung (08-18 Jul 2026)",
  "Rombongan Palembang & Sumbagsel (Agustus 2026)",
  "Jamaah VIP Executive (September 2026)",
];

const statusStyles: Record<string, string> = {
  Aktif: "bg-emerald-50/80 text-emerald-800 border border-emerald-200/60",
  "Follow-up": "bg-amber-50/80 text-amber-800 border border-amber-200/60",
  Prospek: "bg-purple-50/80 text-purple-800 border border-purple-200/60",
  Alumni: "bg-sky-50/80 text-sky-800 border border-sky-200/60",
};

export function CustomerList({ customers }: CustomerListProps) {
  const [query, setQuery] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("Semua Grup Keberangkatan");
  const [selectedCategoryPill, setSelectedCategoryPill] = useState("Semua");

  const filteredCustomers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return customers.filter((customer) => {
      const searchable = `${customer.name} ${customer.phone} ${customer.email} ${customer.city} ${customer.groupName} ${customer.status}`.toLowerCase();
      const matchesQuery = normalizedQuery.length === 0 || searchable.includes(normalizedQuery);
      const matchesGroup = selectedGroup === "Semua Grup Keberangkatan" || customer.groupName === selectedGroup;

      let matchesPill = true;
      if (selectedCategoryPill === "Bangka") matchesPill = customer.city.includes("Pangkal") || customer.groupName.includes("Bangka");
      else if (selectedCategoryPill === "Palembang") matchesPill = customer.city.includes("Palembang") || customer.groupName.includes("Palembang");
      else if (selectedCategoryPill === "Aktif") matchesPill = customer.status === "Aktif";
      else if (selectedCategoryPill === "Alumni") matchesPill = customer.status === "Alumni";

      return matchesQuery && matchesGroup && matchesPill;
    });
  }, [customers, query, selectedGroup, selectedCategoryPill]);

  return (
    <div className="space-y-5 font-sans">
      
      {/* ========================================================================= */}
      {/* 📱 1. NATIVE MOBILE APP JAMAAH DISCOVERY VIEW (TOP SPOTS REFERENSI BRO) */}
      {/* ========================================================================= */}
      <div className="block md:hidden space-y-4">
        
        {/* Header Title */}
        <div className="text-center py-1">
          <h2 className="text-lg font-extrabold text-stone-900 tracking-tight">Database Jamaah & CRM</h2>
          <p className="text-[11px] font-medium text-stone-500">PT El Massa Azka Wisata</p>
        </div>

        {/* Search Pill Input (Persis Referensi Top Spots) */}
        <section className="relative">
          <div className="flex items-center gap-2.5 rounded-full border border-stone-200/90 bg-white px-4 h-11 shadow-2xs focus-within:border-brand-pink transition">
            <Search className="h-4 w-4 text-stone-400 shrink-0" strokeWidth={1.5} />
            <input
              type="text"
              placeholder="Explore nama jamaah, kota, NIK, No. HP..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-transparent outline-none text-xs font-medium text-stone-900 placeholder:text-stone-400"
            />
          </div>
        </section>

        {/* Horizontal Category Pill Row (Persis Referensi) */}
        <section className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar scroll-smooth">
          {(["Semua", "Bangka", "Palembang", "Aktif", "Alumni"] as const).map((pill) => (
            <button
              key={pill}
              type="button"
              onClick={() => setSelectedCategoryPill(pill)}
              className={`h-8 rounded-full px-4 text-xs font-extrabold whitespace-nowrap transition active:scale-95 ${
                selectedCategoryPill === pill
                  ? "bg-stone-900 text-white shadow-xs"
                  : "bg-white text-stone-600 border border-stone-200/80 hover:bg-stone-50"
              }`}
            >
              {pill === "Semua" ? "Semua Jamaah" : pill}
            </button>
          ))}
        </section>

        {/* List of Rounded White Touch Cards (Top Spots Reference Design) */}
        <section className="space-y-3">
          {filteredCustomers.map((c) => {
            const initials = c.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .substring(0, 2);

            return (
              <div
                key={c.id}
                className="rounded-2xl border border-stone-200/80 bg-white p-3.5 shadow-2xs space-y-2.5 active:bg-stone-50 transition"
              >
                <div className="flex items-start gap-3">
                  {/* Left Rounded Avatar Container */}
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-rose-50 border border-brand-pink/20 font-black text-brand-pink text-sm shadow-2xs">
                    {initials}
                  </div>

                  {/* Customer Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-1">
                      <h4 className="font-extrabold text-sm text-stone-900 leading-snug truncate">
                        {c.name}
                      </h4>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-extrabold shrink-0 ${statusStyles[c.status] || "bg-stone-100 text-stone-700"}`}>
                        {c.status}
                      </span>
                    </div>

                    <p className="text-[11px] text-stone-500 font-medium truncate mt-0.5 flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-stone-400 shrink-0" />
                      <span>{c.city}</span>
                      <span className="text-stone-300">•</span>
                      <span>{c.type}</span>
                    </p>

                    <p className="text-[10px] text-stone-400 font-mono mt-0.5 truncate">
                      {c.groupName}
                    </p>
                  </div>
                </div>

                {/* Bottom WhatsApp & Action Bar */}
                <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2 text-xs">
                  <a
                    href={`https://wa.me/${c.phone.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 font-bold text-emerald-700 hover:underline text-[11px]"
                  >
                    <Phone className="h-3.5 w-3.5 text-emerald-600" />
                    <span>WhatsApp: {c.phone}</span>
                  </a>

                  <Link
                    href={`/pelanggan/${c.id}`}
                    className="inline-flex items-center gap-1 rounded-xl border border-stone-200 bg-stone-50 px-3 py-1 text-[10px] font-extrabold text-stone-700 hover:bg-stone-100 active:scale-95 transition"
                  >
                    Profil Jamaah →
                  </Link>
                </div>
              </div>
            );
          })}
        </section>

      </div>

      {/* ========================================================================= */}
      {/* 🖥️ 2. DESKTOP MODE CUSTOMERS VIEW (100% UNTOUCHED ORIGINAL) */}
      {/* ========================================================================= */}
      <div className="hidden md:block space-y-5">
        
        {/* Header Banner - Database CRM Dikategori Per Grup */}
        <section className="rounded-2xl border border-stone-200/70 bg-white p-5 sm:p-6 shadow-2xs">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-xl font-extrabold text-brand-cocoa tracking-tight">
                Master Pelanggan Berdasarkan Grup Keberangkatan
              </h1>
              <p className="text-xs text-stone-500 mt-1">
                Database CRM jamaah yang dikelompokkan per grup rombongan, domisili daerah, kontak WhatsApp, dan riwayat paket.
              </p>
            </div>

            <button
              type="button"
              className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-brand-pink px-4 text-xs font-semibold text-white shadow-2xs hover:bg-brand-pinkHover transition shrink-0"
            >
              <UserPlus className="h-4 w-4" strokeWidth={1.5} />
              <span>Tambah Jamaah Baru</span>
            </button>
          </div>
        </section>

        {/* Metric Cards Row */}
        <section className="grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl border border-stone-200/70 bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-stone-500">Total Jamaah Terdaftar</p>
              <Users className="h-4 w-4 text-brand-pink" strokeWidth={1.5} />
            </div>
            <p className="mt-1 text-2xl font-bold text-brand-cocoa">{customers.length} Jamaah</p>
            <p className="mt-1 text-[11px] text-stone-400">Database CRM resmi El Massa</p>
          </article>

          <article className="rounded-2xl border border-stone-200/70 bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-stone-500">Grup Rombongan Aktif</p>
              <Layers className="h-4 w-4 text-amber-600" strokeWidth={1.5} />
            </div>
            <p className="mt-1 text-2xl font-bold text-amber-800">Rombongan Bangka Belitung</p>
            <p className="mt-1 text-[11px] text-stone-400">30 Pax Rombongan • 08-18 Jul 2026</p>
          </article>

          <article className="rounded-2xl border border-stone-200/70 bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-stone-500">Hasil Filter Grup</p>
              <UserCheck className="h-4 w-4 text-emerald-600" strokeWidth={1.5} />
            </div>
            <p className="mt-1 text-2xl font-bold text-emerald-700">{filteredCustomers.length} Jamaah</p>
            <p className="mt-1 text-[11px] text-stone-400">Sesuai kategori grup terpilih</p>
          </article>
        </section>

        {/* Customer Data Table */}
        <section className="rounded-2xl border border-stone-200/70 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-base font-bold text-brand-cocoa">Daftar Kontak Jamaah Per Grup Rombongan</h3>
              <p className="text-xs text-stone-500">Pilih grup keberangkatan untuk menyaring daftar jamaah dan kontak WhatsApp.</p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              {/* Group Filter Dropdown */}
              <select
                className="h-9 rounded-xl border border-stone-200 bg-rose-50/60 px-3 text-xs font-bold text-brand-pink outline-none shadow-2xs"
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
              >
                {groupOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>

              <label className="flex h-9 items-center gap-2 rounded-xl border border-stone-200 bg-stone-50/70 px-3 text-xs text-stone-500">
                <Search className="h-3.5 w-3.5 text-stone-400" strokeWidth={1.5} />
                <input
                  className="w-full bg-transparent outline-none font-normal text-xs placeholder:text-stone-400"
                  placeholder="Cari nama, kota, telepon..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </label>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-stone-200/60">
            <table className="w-full min-w-[900px] border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-stone-200/60 bg-stone-50/70 font-semibold text-stone-500 text-[11px] uppercase tracking-wider">
                  <th className="py-2.5 pl-3 pr-2">Nama Jamaah</th>
                  <th className="py-2.5 pr-2">Grup Rombongan / Keberangkatan</th>
                  <th className="py-2.5 pr-2">Domisili Kota</th>
                  <th className="py-2.5 pr-2">No. HP / WhatsApp</th>
                  <th className="py-2.5 pr-2">Kategori</th>
                  <th className="py-2.5 pr-3 text-right">Status CRM</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-normal">
                {filteredCustomers.map((c) => (
                  <tr key={c.id} className="transition hover:bg-stone-50/60">
                    <td className="py-3 pl-3 pr-2 font-semibold text-brand-cocoa whitespace-nowrap">
                      <Link href={`/pelanggan/${c.id}`} className="hover:text-brand-pink underline underline-offset-2 flex items-center gap-1.5 group">
                        <span>{c.name}</span>
                      </Link>
                    </td>
                    <td className="py-3 pr-2 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 rounded-full border border-brand-pink/20 bg-rose-50/70 px-2.5 py-0.5 text-[11px] font-semibold text-brand-pink">
                        <Layers className="h-3 w-3 text-brand-pink" strokeWidth={1.5} />
                        {c.groupName}
                      </span>
                    </td>
                    <td className="py-3 pr-2 font-medium text-stone-700 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-stone-400" strokeWidth={1.5} />
                        {c.city}
                      </span>
                    </td>
                    <td className="py-3 pr-2 font-mono text-stone-600 whitespace-nowrap">
                      <a href={`https://wa.me/${c.phone.replace(/[^0-9]/g, "")}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-emerald-700">
                        <Phone className="h-3 w-3 text-emerald-600" strokeWidth={1.5} />
                        {c.phone}
                      </a>
                    </td>
                    <td className="py-3 pr-2 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 rounded-full border border-stone-200 bg-stone-50 px-2 py-0.5 text-[11px] font-semibold text-stone-700">
                        {c.type}
                      </span>
                    </td>
                    <td className="py-3 pr-3 text-right whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${statusStyles[c.status] || "bg-stone-50 text-stone-700"}`}>
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

      </div>

    </div>
  );
}
