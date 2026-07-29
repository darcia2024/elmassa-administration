"use client";

import { useMemo, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  CreditCard,
  Eye,
  FileText,
  Filter,
  MessageSquare,
  Plus,
  Receipt,
  Search,
  Users,
} from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";

type BookingItem = {
  code: string;
  customer: string;
  phone: string;
  packageName: string;
  departure: string;
  groupName: string;
  participants: number;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  totalDisplay: string;
  paidDisplay: string;
  remainingDisplay: string;
  status: "Lunas" | "DP" | "Belum Bayar";
  paymentProgress: number;
  createdDate: string;
};

const initialBookings: BookingItem[] = [
  {
    code: "BK-2407-001",
    customer: "Siti Rahma",
    phone: "0812-4455-7788",
    packageName: "Umrah Reguler 12 Hari",
    departure: "08-18 Jul 2026",
    groupName: "Rombongan Bangka Belitung 08 Jul",
    participants: 3,
    totalAmount: 97500000,
    paidAmount: 97500000,
    remainingAmount: 0,
    totalDisplay: "Rp 97.500.000",
    paidDisplay: "Rp 97.500.000",
    remainingDisplay: "Rp 0",
    status: "Lunas",
    paymentProgress: 100,
    createdDate: "01 Jul 2026",
  },
  {
    code: "BK-2407-002",
    customer: "Ahmad Hidayat",
    phone: "0813-8899-1122",
    packageName: "Umrah Plus Thaif 12 Hari",
    departure: "08-18 Jul 2026",
    groupName: "Rombongan Bangka Belitung 08 Jul",
    participants: 2,
    totalAmount: 69000000,
    paidAmount: 34500000,
    remainingAmount: 34500000,
    totalDisplay: "Rp 69.000.000",
    paidDisplay: "Rp 34.500.000",
    remainingDisplay: "Rp 34.500.000",
    status: "DP",
    paymentProgress: 50,
    createdDate: "03 Jul 2026",
  },
  {
    code: "BK-2407-003",
    customer: "Budi Santoso",
    phone: "0819-2233-4455",
    packageName: "Umrah VIP Turki 14 Hari",
    departure: "15-28 Aug 2026",
    groupName: "Rombongan Palembang Sumbagsel",
    participants: 4,
    totalAmount: 180000000,
    paidAmount: 45000000,
    remainingAmount: 135000000,
    totalDisplay: "Rp 180.000.000",
    paidDisplay: "Rp 45.000.000",
    remainingDisplay: "Rp 135.000.000",
    status: "DP",
    paymentProgress: 25,
    createdDate: "05 Jul 2026",
  },
  {
    code: "BK-2407-004",
    customer: "Dewi Lestari",
    phone: "0852-6677-8899",
    packageName: "Umrah Awal Musim 9 Hari",
    departure: "15-28 Aug 2026",
    groupName: "Rombongan Palembang Sumbagsel",
    participants: 1,
    totalAmount: 27500000,
    paidAmount: 0,
    remainingAmount: 27500000,
    totalDisplay: "Rp 27.500.000",
    paidDisplay: "Rp 0",
    remainingDisplay: "Rp 27.500.000",
    status: "Belum Bayar",
    paymentProgress: 0,
    createdDate: "10 Jul 2026",
  },
  {
    code: "BK-2407-005",
    customer: "H. Hendra Wijaya",
    phone: "0812-9900-1122",
    packageName: "Umrah Reguler 12 Hari",
    departure: "08-18 Jul 2026",
    groupName: "Rombongan Bangka Belitung 08 Jul",
    participants: 5,
    totalAmount: 162500000,
    paidAmount: 162500000,
    remainingAmount: 0,
    totalDisplay: "Rp 162.500.000",
    paidDisplay: "Rp 162.500.000",
    remainingDisplay: "Rp 0",
    status: "Lunas",
    paymentProgress: 100,
    createdDate: "12 Jul 2026",
  },
];

function StatusBadge({ status }: { status: "Lunas" | "DP" | "Belum Bayar" }) {
  const styles: Record<string, { bg: string; border: string; dot: string }> = {
    Lunas: {
      bg: "bg-emerald-50 text-emerald-800",
      border: "border-emerald-200/60",
      dot: "bg-emerald-500",
    },
    DP: {
      bg: "bg-amber-50 text-amber-800",
      border: "border-amber-200/60",
      dot: "bg-amber-500",
    },
    "Belum Bayar": {
      bg: "bg-rose-50 text-rose-700",
      border: "border-rose-200/60",
      dot: "bg-rose-500",
    },
  };

  const style = styles[status] ?? {
    bg: "bg-stone-50 text-stone-600",
    border: "border-stone-200",
    dot: "bg-stone-400",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${style.bg} ${style.border}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
      {status}
    </span>
  );
}

export default function BookingsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("Semua");
  const [selectedGroup, setSelectedGroup] = useState<string>("Semua");

  const filteredBookings = useMemo(() => {
    return initialBookings.filter((b) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        b.code.toLowerCase().includes(q) ||
        b.customer.toLowerCase().includes(q) ||
        b.packageName.toLowerCase().includes(q) ||
        b.phone.includes(q);

      const matchesStatus = selectedStatus === "Semua" || b.status === selectedStatus;
      const matchesGroup = selectedGroup === "Semua" || b.groupName === selectedGroup;

      return matchesSearch && matchesStatus && matchesGroup;
    });
  }, [searchQuery, selectedStatus, selectedGroup]);

  const totalParticipants = useMemo(
    () => filteredBookings.reduce((sum, b) => sum + b.participants, 0),
    [filteredBookings],
  );

  const totalNominalPaid = useMemo(
    () => filteredBookings.reduce((sum, b) => sum + b.paidAmount, 0),
    [filteredBookings],
  );

  const totalNominalRemaining = useMemo(
    () => filteredBookings.reduce((sum, b) => sum + b.remainingAmount, 0),
    [filteredBookings],
  );

  const groupsList = Array.from(new Set(initialBookings.map((b) => b.groupName)));

  return (
    <AppShell eyebrow="Manajemen Transaksi" title="Daftar Booking & Reservasi Jamaah">
      <div className="space-y-5">
        
        {/* Header Hero Explanation Banner */}
        <section className="rounded-2xl border border-stone-200/70 bg-white p-5 sm:p-6 shadow-2xs">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-brand-cocoa">
                Kelola Pendaftaran & Status Bayar Booking
              </h1>
              <p className="text-xs text-stone-500 mt-1 max-w-2xl">
                Pantau riwayat registrasi jamaah rombongan, catat cicilan/DP, pantau sisa pelunasan, dan terbitkan invoice kuitansi resmi El Massa.
              </p>
            </div>

            <Link
              href="/booking/form"
              className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-brand-pink px-4 text-xs font-semibold text-white shadow-2xs hover:bg-brand-pinkHover transition shrink-0"
            >
              <Plus className="h-4 w-4" strokeWidth={1.5} />
              <span>+ Buat Booking Baru</span>
            </Link>
          </div>
        </section>

        {/* 📊 Metric KPI Cards */}
        <section className="grid gap-4 md:grid-cols-4">
          <article className="rounded-2xl border border-stone-200/70 bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-stone-500">Total Transaksi</p>
              <FileText className="h-4 w-4 text-brand-pink" strokeWidth={1.5} />
            </div>
            <p className="mt-1 text-2xl font-bold text-brand-cocoa">{filteredBookings.length} Booking</p>
            <p className="mt-1 text-[11px] text-stone-400">Total {totalParticipants} Pax Jamaah</p>
          </article>

          <article className="rounded-2xl border border-stone-200/70 bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-stone-500">Lunas Sempurna</p>
              <CheckCircle2 className="h-4 w-4 text-emerald-600" strokeWidth={1.5} />
            </div>
            <p className="mt-1 text-2xl font-bold text-emerald-800">
              {filteredBookings.filter((b) => b.status === "Lunas").length} Transaksi
            </p>
            <p className="mt-1 text-[11px] text-stone-400">Siap Cetak Ticket & Visa</p>
          </article>

          <article className="rounded-2xl border border-stone-200/70 bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-stone-500">Status DP / Cicilan</p>
              <Clock className="h-4 w-4 text-amber-600" strokeWidth={1.5} />
            </div>
            <p className="mt-1 text-2xl font-bold text-amber-800">
              {filteredBookings.filter((b) => b.status === "DP").length} Transaksi
            </p>
            <p className="mt-1 text-[11px] text-stone-400">Dalam Masa Pelunasan</p>
          </article>

          <article className="rounded-2xl border border-stone-200/70 bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-stone-500">Total Sisa Piutang</p>
              <CreditCard className="h-4 w-4 text-rose-600" strokeWidth={1.5} />
            </div>
            <p className="mt-1 text-2xl font-bold text-rose-700">
              Rp {(totalNominalRemaining / 1000000).toFixed(1)} Jt
            </p>
            <p className="mt-1 text-[11px] text-stone-400">Sisa Tagihan Jamaah</p>
          </article>
        </section>

        {/* 🔎 Search Toolbar & Status Filters */}
        <section className="rounded-2xl border border-stone-200/70 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" strokeWidth={1.5} />
              <input
                type="text"
                placeholder="Cari Kode BK-2407, nama pemesan, paket..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 rounded-xl border border-stone-200 bg-stone-50/50 pl-9 pr-3 text-xs text-brand-cocoa font-medium placeholder:text-stone-400 outline-none focus:border-brand-pink focus:bg-white transition"
              />
            </div>

            {/* Filter Group Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-stone-500 flex items-center gap-1 shrink-0">
                <Filter className="h-3.5 w-3.5" strokeWidth={1.5} /> Filter Rombongan:
              </span>
              <select
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                className="h-9 rounded-xl border border-stone-200 bg-white px-3 text-xs font-bold text-brand-cocoa outline-none shadow-2xs"
              >
                <option value="Semua">Semua Rombongan Keberangkatan</option>
                {groupsList.map((grp) => (
                  <option key={grp} value={grp}>
                    {grp}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1.5 border-b border-stone-100 pb-3">
            {(["Semua", "Lunas", "DP", "Belum Bayar"] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setSelectedStatus(st)}
                className={`h-8 rounded-xl px-3 text-xs font-semibold transition ${
                  selectedStatus === st
                    ? "bg-rose-50 text-brand-pink border border-brand-pink/20 font-bold shadow-2xs"
                    : "text-stone-600 hover:bg-stone-50"
                }`}
              >
                {st === "Semua" ? "Semua Transaksi" : st}
              </button>
            ))}
          </div>

          {/* 📱 NATIVE MOBILE CARD LIST (Indigo House Hotel Discovery & Booking App Referensi Style) */}
          <div className="space-y-4 block md:hidden">
            
            {/* Header Title */}
            <div className="flex items-center justify-between px-1">
              <div>
                <h2 className="text-lg font-extrabold text-stone-900 tracking-tight">Booking & Pendaftaran Jamaah</h2>
                <p className="text-[11px] font-medium text-stone-500">{filteredBookings.length} Registrasi Ditemukan</p>
              </div>
              <Link
                href="/booking/form"
                className="grid h-9 w-9 place-items-center rounded-full bg-stone-900 text-white shadow-xs active:scale-95 transition"
              >
                <Plus className="h-5 w-5" />
              </Link>
            </div>

            {/* Horizontal Category Pill Row (Persis Referensi Indigo House) */}
            <section className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar scroll-smooth">
              {(["Semua", "Lunas", "DP", "Belum Bayar"] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setSelectedStatus(st)}
                  className={`h-8 rounded-full px-4 text-xs font-extrabold whitespace-nowrap transition active:scale-95 ${
                    selectedStatus === st
                      ? "bg-stone-900 text-white shadow-xs"
                      : "bg-white text-stone-600 border border-stone-200/80 hover:bg-stone-50"
                  }`}
                >
                  {st === "Semua" ? "Semua Booking" : st}
                </button>
              ))}
            </section>

            {/* Section 1: "Pendaftaran Populer Terbaru" (Indigo House Style Card Grid) */}
            <section className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-extrabold text-stone-900">Pendaftaran Populer</span>
                <span className="text-[10px] font-bold text-stone-400">Lihat Semua</span>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {filteredBookings.slice(0, 2).map((b) => (
                  <article
                    key={b.code}
                    className="overflow-hidden rounded-2xl border border-stone-200/80 bg-white p-3.5 shadow-2xs space-y-3 active:bg-stone-50 transition"
                  >
                    {/* Top Image Preview Banner */}
                    <div className="relative h-32 w-full overflow-hidden rounded-xl bg-stone-100 border border-stone-100">
                      <img
                        src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80"
                        alt={b.packageName}
                        className="h-full w-full object-cover"
                      />
                      <span className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-white/80 backdrop-blur-xs text-stone-600">
                        ♡
                      </span>
                      <span className="absolute left-2 bottom-2 rounded-full bg-stone-900/80 backdrop-blur-xs px-2.5 py-0.5 text-[9px] font-extrabold text-white font-mono">
                        {b.code}
                      </span>
                    </div>

                    {/* Card Content */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-sm font-extrabold text-stone-900 truncate">{b.customer}</h4>
                        <span className="text-[10px] font-bold text-amber-500 flex items-center gap-0.5">
                          ★★★★★
                        </span>
                      </div>

                      <p className="text-[11px] font-medium text-stone-500 truncate flex items-center gap-1">
                        <span className="truncate">{b.packageName}</span>
                        <span className="text-stone-300">•</span>
                        <span className="font-bold text-brand-pink">{b.participants} Pax</span>
                      </p>

                      <p className="text-[10px] text-stone-400 truncate">📍 {b.groupName}</p>
                    </div>

                    {/* Price & Status */}
                    <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                      <div>
                        <span className="text-[8px] font-bold uppercase text-stone-400 block">Total Tagihan</span>
                        <p className="text-sm font-black text-brand-pink leading-none">{b.totalDisplay}</p>
                      </div>

                      <StatusBadge status={b.status} />
                    </div>
                  </article>
                ))}
              </div>
            </section>

            {/* Section 2: "Seluruh Riwayat Transaksi" Touch Cards */}
            <section className="space-y-2 pt-2">
              <span className="text-xs font-extrabold text-stone-900 px-1 block">Seluruh Transaksi Booking</span>

              {filteredBookings.map((b) => {
                const waText = encodeURIComponent(
                  `Assalamu'alaikum wr. wb. Yth. Bapak/Ibu ${b.customer},\n\nKami dari *PT El Massa Tour & Travel* menginformasikan pemesanan paket *${b.packageName}* (Kode: ${b.code}).\n\nSisa tagihan pelunasan: *${b.remainingDisplay}*.\nTerima kasih.`,
                );

                return (
                  <div
                    key={b.code}
                    className="rounded-2xl border border-stone-200/80 bg-white p-3.5 shadow-2xs space-y-3 active:bg-stone-50 transition"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-mono text-[10px] font-bold text-stone-400 uppercase tracking-wide block">
                          {b.code}
                        </span>
                        <h4 className="font-bold text-sm text-stone-900">{b.customer}</h4>
                        <p className="text-[11px] text-stone-500 font-medium">{b.phone}</p>
                      </div>
                      <StatusBadge status={b.status} />
                    </div>

                    <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-100 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-stone-500 text-[11px]">Paket:</span>
                        <span className="font-bold text-stone-800 text-right">{b.packageName}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-stone-500 text-[11px]">Total / Paid:</span>
                        <span className="font-black text-brand-pink">{b.totalDisplay} <span className="text-emerald-700 font-bold text-[10px]">({b.paidDisplay})</span></span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-bold text-stone-600">
                        <span>Pelunasan Tagihan</span>
                        <span>{b.paymentProgress}%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-stone-100 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            b.paymentProgress === 100
                              ? "bg-emerald-500"
                              : b.paymentProgress > 0
                              ? "bg-amber-500"
                              : "bg-rose-500"
                          }`}
                          style={{ width: `${b.paymentProgress}%` }}
                        />
                      </div>
                    </div>

                    {/* Mobile Action Buttons */}
                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-stone-100">
                      <a
                        href={`https://wa.me/62${b.phone.replace(/[^0-9]/g, "").slice(1)}?text=${waText}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 font-bold text-emerald-700 text-[11px]"
                      >
                        <MessageSquare className="h-3.5 w-3.5 text-emerald-600" />
                        <span>Kirim WA</span>
                      </a>

                      <Link
                        href={`/booking/${b.code}`}
                        className="inline-flex items-center gap-1 rounded-xl bg-stone-900 px-3 py-1 text-[10px] font-extrabold text-white active:scale-95 transition"
                      >
                        Detail Booking →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </section>

            {/* Mobile Fixed Floating Action Button (Persis Referensi Sticky Book Now Button) */}
            <div className="fixed bottom-20 inset-x-4 z-40">
              <Link
                href="/booking/form"
                className="w-full h-12 rounded-full bg-stone-900 text-white font-extrabold text-xs shadow-2xl active:scale-95 transition flex items-center justify-center gap-2 border border-stone-800"
              >
                <Plus className="h-4 w-4 text-brand-pink" />
                <span>+ Buat Booking Jamaah Baru</span>
              </Link>
            </div>

          </div>

          {/* 🖥️ DESKTOP DATA TABLE (Hidden on Mobile) */}
          <div className="hidden md:block overflow-x-auto rounded-xl border border-stone-200/60">
            <table className="w-full min-w-[980px] border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-stone-200/60 bg-stone-50/70 font-semibold text-stone-500 text-[11px] uppercase tracking-wider">
                  <th className="py-2.5 pl-3 pr-2">Kode & Pemesan</th>
                  <th className="py-2.5 pr-2">Paket & Keberangkatan</th>
                  <th className="py-2.5 pr-2">Peserta</th>
                  <th className="py-2.5 pr-2">Total Harga</th>
                  <th className="py-2.5 pr-2">Pembayaran</th>
                  <th className="py-2.5 pr-2">Progress Lunas</th>
                  <th className="py-2.5 pr-2">Status</th>
                  <th className="py-2.5 pr-3 text-right">Aksi Cepat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-normal">
                {filteredBookings.map((b) => {
                  const waText = encodeURIComponent(
                    `Assalamu'alaikum wr. wb. Yth. Bapak/Ibu ${b.customer},\n\nKami dari *PT El Massa Tour & Travel* menginformasikan pemesanan paket *${b.packageName}* (Kode: ${b.code}).\n\nSisa tagihan pelunasan: *${b.remainingDisplay}*.\nTerima kasih.`,
                  );

                  return (
                    <tr key={b.code} className="transition hover:bg-stone-50/60">
                      {/* Kode & Pemesan */}
                      <td className="py-3 pl-3 pr-2">
                        <Link href={`/booking/${b.code}`} className="group">
                          <p className="font-bold text-brand-cocoa group-hover:text-brand-pink transition">
                            {b.customer}
                          </p>
                          <p className="font-mono text-[10px] font-semibold text-stone-400">{b.code}</p>
                        </Link>
                      </td>

                      {/* Paket & Group */}
                      <td className="py-3 pr-2">
                        <p className="font-semibold text-stone-800">{b.packageName}</p>
                        <p className="text-[11px] text-stone-500">{b.departure}</p>
                      </td>

                      {/* Peserta */}
                      <td className="py-3 pr-2 font-semibold text-stone-800">
                        <span className="inline-flex items-center gap-1 rounded-md bg-stone-100 px-2 py-0.5 text-[11px] font-bold text-stone-700">
                          <Users className="h-3 w-3 text-stone-500" strokeWidth={1.5} />
                          {b.participants} Pax
                        </span>
                      </td>

                      {/* Total Harga */}
                      <td className="py-3 pr-2 font-semibold text-stone-900">{b.totalDisplay}</td>

                      {/* Paid & Remaining */}
                      <td className="py-3 pr-2">
                        <p className="font-bold text-emerald-700">{b.paidDisplay}</p>
                        {b.remainingAmount > 0 ? (
                          <p className="text-[10px] font-semibold text-rose-600">
                            Sisa: {b.remainingDisplay}
                          </p>
                        ) : (
                          <p className="text-[10px] font-bold text-emerald-600">Lunas 100%</p>
                        )}
                      </td>

                      {/* Progress Bar */}
                      <td className="py-3 pr-2 w-32">
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] font-bold text-stone-600">
                            <span>{b.paymentProgress}%</span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-stone-100 overflow-hidden">
                            <div
                              className={`h-full transition-all duration-300 ${
                                b.paymentProgress === 100
                                  ? "bg-emerald-500"
                                  : b.paymentProgress > 0
                                  ? "bg-amber-500"
                                  : "bg-rose-500"
                              }`}
                              style={{ width: `${b.paymentProgress}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 pr-2">
                        <StatusBadge status={b.status} />
                      </td>

                      {/* Quick Action Buttons */}
                      <td className="py-3 pr-3 text-right whitespace-nowrap space-x-1">
                        {/* Detail Booking */}
                        <Link
                          href={`/booking/${b.code}`}
                          title="Lihat Detail Booking & Pax"
                          className="inline-flex items-center justify-center h-7 w-7 rounded-lg border border-stone-200 bg-white text-stone-600 hover:bg-stone-100 transition"
                        >
                          <Eye className="h-3.5 w-3.5" strokeWidth={1.5} />
                        </Link>

                        {/* Catat Bayar */}
                        {b.remainingAmount > 0 && (
                          <Link
                            href="/pembayaran/form"
                            title="Bayar Cicilan / Pelunasan"
                            className="inline-flex items-center justify-center h-7 w-7 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white transition"
                          >
                            <CreditCard className="h-3.5 w-3.5" strokeWidth={1.5} />
                          </Link>
                        )}

                        {/* Follow Up WA */}
                        {b.remainingAmount > 0 && (
                          <a
                            href={`https://wa.me/${b.phone.replace(/[^0-9]/g, "")}?text=${waText}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Follow Up WA Sisa Tagihan"
                            className="inline-flex items-center justify-center h-7 w-7 rounded-lg border border-emerald-200 bg-emerald-600 text-white hover:bg-emerald-700 transition"
                          >
                            <MessageSquare className="h-3.5 w-3.5" strokeWidth={1.5} />
                          </a>
                        )}

                        {/* Cetak Invoice */}
                        <Link
                          href={`/dokumen/invoice/${b.code}`}
                          title="Cetak Invoice Booking"
                          className="inline-flex items-center justify-center h-7 w-7 rounded-lg border border-stone-200 bg-white text-stone-600 hover:bg-stone-100 transition"
                        >
                          <Receipt className="h-3.5 w-3.5" strokeWidth={1.5} />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </AppShell>
  );
}
