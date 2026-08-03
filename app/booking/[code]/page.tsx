"use client";

import React, { useEffect, useState, use } from "react";
import { ArrowLeft, CheckCircle2, Clock, CreditCard, Download, FileText, Hotel, MessageSquare, Plane, Printer, Receipt, ShieldAlert, UserCheck, Users } from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";

type Participant = {
  name: string;
  passport: string;
  contact: string;
  documentStatus: "Lengkap" | "Proses Visa" | "Belum Lengkap";
  roomType: string;
};

type PaymentHistory = {
  receipt: string;
  date: string;
  amountDisplay: string;
  account: string;
  staff: string;
};

type BookingDetail = {
  code: string;
  customer: string;
  phone: string;
  packageName: string;
  departure: string;
  groupName: string;
  status: "Lunas" | "DP" | "Belum Bayar";
  totalDisplay: string;
  paidDisplay: string;
  remainingDisplay: string;
  remainingAmount: number;
  participants: Participant[];
  payments: PaymentHistory[];
};

const bookingDatabase: Record<string, BookingDetail> = {
  "BK-2407-001": {
    code: "BK-2407-001",
    customer: "Siti Rahma",
    phone: "0812-4455-7788",
    packageName: "Umrah Reguler 12 Hari",
    departure: "08-18 Jul 2026",
    groupName: "Rombongan Bangka Belitung 08 Jul 2026",
    status: "Lunas",
    totalDisplay: "Rp 97.500.000",
    paidDisplay: "Rp 97.500.000",
    remainingDisplay: "Rp 0",
    remainingAmount: 0,
    participants: [
      { name: "Siti Rahma", passport: "C1234567", contact: "0812-4455-7788", documentStatus: "Lengkap", roomType: "Quad (Sekamar Ber-4)" },
      { name: "Ahmad Subagyo", passport: "C7654321", contact: "0812-4455-7789", documentStatus: "Lengkap", roomType: "Quad (Sekamar Ber-4)" },
      { name: "Rina Marlina", passport: "C8899001", contact: "0812-4455-7790", documentStatus: "Lengkap", roomType: "Quad (Sekamar Ber-4)" },
    ],
    payments: [
      { receipt: "KW-2407-044", date: "25 Jul 2026", amountDisplay: "Rp 97.500.000", account: "BCA El Massa (534-567-8901)", staff: "Azri" },
    ],
  },
};

const fallbackBooking: BookingDetail = {
  code: "BK-2407-001",
  customer: "Jamaah Terdaftar",
  phone: "0812-7199-1001",
  packageName: "Umrah Spesial Musim Baru",
  departure: "Terjadwal 2026",
  groupName: "Rombongan Jamaah El Massa",
  status: "DP",
  totalDisplay: "Rp 64.485.778",
  paidDisplay: "Rp 500.000.000",
  remainingDisplay: "Rp 0",
  remainingAmount: 0,
  participants: [
    { name: "H. Rusli Suparman", passport: "C9824101", contact: "0812-7199-1001", documentStatus: "Lengkap", roomType: "Quad (Sekamar Ber-4)" },
    { name: "Hj. Zubaidah Mansur", passport: "C9824102", contact: "0812-7199-1002", documentStatus: "Lengkap", roomType: "Quad (Sekamar Ber-4)" },
  ],
  payments: [
    { receipt: "KW-2407-001", date: "Hari ini", amountDisplay: "Rp 500.000.000", account: "BCA El Massa", staff: "Admin" },
  ],
};

function StatusBadge({ status }: { status: "Lunas" | "DP" | "Belum Bayar" }) {
  const styles = {
    Lunas: "bg-emerald-50 text-emerald-800 border-emerald-200/60",
    DP: "bg-amber-50 text-amber-800 border-amber-200/60",
    "Belum Bayar": "bg-rose-50 text-rose-700 border-rose-200/60",
  };

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-0.5 text-xs font-bold ${styles[status]}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

type BookingDetailPageProps = {
  params: Promise<{
    code: string;
  }>;
};

export default function BookingDetailPage({ params }: BookingDetailPageProps) {
  const resolvedParams = use(params);
  const decodedCode = decodeURIComponent(resolvedParams.code);

  const [booking, setBooking] = useState<BookingDetail>(() => {
    return bookingDatabase[decodedCode] ?? { ...fallbackBooking, code: decodedCode };
  });

  useEffect(() => {
    try {
      const savedStr = localStorage.getItem("el_massa_real_bookings");
      if (savedStr) {
        const savedBookings = JSON.parse(savedStr);
        if (Array.isArray(savedBookings)) {
          const found = savedBookings.find((b: any) => b.code === decodedCode) || savedBookings[0];
          if (found) {
            setBooking({
              code: found.code || decodedCode,
              customer: found.customer || "Jamaah Terdaftar",
              phone: found.phone || "0812-7199-1001",
              packageName: found.packageName || "Umrah Spesial Musim Baru",
              departure: found.departure || "Terjadwal 2026",
              groupName: found.groupName || "Rombongan Jamaah El Massa",
              status: found.status || "DP",
              totalDisplay: found.totalDisplay || `Rp ${(found.totalAmount || 64485778).toLocaleString("id-ID")}`,
              paidDisplay: found.paidDisplay || `Rp ${(found.paidAmount || 500000000).toLocaleString("id-ID")}`,
              remainingDisplay: found.remainingDisplay || `Rp ${(found.remainingAmount || 0).toLocaleString("id-ID")}`,
              remainingAmount: found.remainingAmount ?? 0,
              participants: Array.isArray(found.participantsList) && found.participantsList.length > 0
                ? found.participantsList
                : [
                    { name: found.customer || "Jamaah Peserta 1", passport: "C9824101", contact: found.phone || "-", documentStatus: "Lengkap", roomType: "Quad (Sekamar Ber-4)" },
                  ],
              payments: [
                { receipt: `KW-${found.code || "2407"}`, date: found.createdDate || "Hari ini", amountDisplay: found.paidDisplay || "Rp 50.000.000", account: "BCA El Massa", staff: "Admin" }
              ]
            });
          }
        }
      }
    } catch (e) {
      console.error("Failed loading booking from localStorage:", e);
    }
  }, [decodedCode]);

  const waText = encodeURIComponent(
    `Assalamu'alaikum wr. wb. Yth. Bapak/Ibu ${booking.customer},\n\nBerikut rincian transaksi booking *${booking.code}* untuk paket *${booking.packageName}*.\nTotal: ${booking.totalDisplay}\nTerbayar: ${booking.paidDisplay}\nSisa: ${booking.remainingDisplay}.\n\nTerima kasih,\n*PT El Massa Tour & Travel*`,
  );

  return (
    <AppShell eyebrow="Manajemen Transaksi" title={`Rincian Booking ${booking.code}`}>
      <div className="space-y-5">
        
        {/* Back Link */}
        <div>
          <Link
            href="/booking"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-brand-pink transition"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
            <span>Kembali ke Daftar Transaksi Booking</span>
          </Link>
        </div>

        {/* Hero Card Header */}
        <section className="rounded-2xl border border-stone-200/70 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-stone-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold tracking-tight text-brand-cocoa">{booking.code}</h1>
                <StatusBadge status={booking.status} />
              </div>
              <p className="text-xs text-stone-500 mt-1">
                Pemesan Utama: <span className="font-bold text-brand-cocoa">{booking.customer}</span> ({booking.phone})
              </p>
            </div>

            <div className="flex items-center gap-2">
              {booking.remainingAmount > 0 && (
                <Link
                  href="/pembayaran/form"
                  className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-emerald-600 px-4 text-xs font-semibold text-white shadow-2xs hover:bg-emerald-700 transition shrink-0"
                >
                  <CreditCard className="h-4 w-4" strokeWidth={1.5} />
                  <span>Bayar Cicilan</span>
                </Link>
              )}

              <a
                href={`https://wa.me/${booking.phone.replace(/[^0-9]/g, "")}?text=${waText}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 transition shrink-0"
              >
                <MessageSquare className="h-4 w-4 text-emerald-600" strokeWidth={1.5} />
                <span>Kirim WA</span>
              </a>

              <Link
                href={`/dokumen/invoice/${booking.code}`}
                className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-stone-200 bg-stone-50 px-3 text-xs font-semibold text-stone-700 hover:bg-stone-100 transition shrink-0"
              >
                <Printer className="h-4 w-4 text-stone-500" strokeWidth={1.5} />
                <span>Cetak Invoice</span>
              </Link>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-3 text-xs">
            <div className="rounded-xl border border-stone-200/60 bg-stone-50/50 p-3 space-y-0.5">
              <p className="text-stone-400 font-semibold text-[10px] uppercase">Paket Pilihan</p>
              <p className="font-bold text-brand-cocoa text-sm">{booking.packageName}</p>
            </div>
            <div className="rounded-xl border border-stone-200/60 bg-stone-50/50 p-3 space-y-0.5">
              <p className="text-stone-400 font-semibold text-[10px] uppercase">Keberangkatan & Rombongan</p>
              <p className="font-bold text-stone-800">{booking.groupName}</p>
            </div>
            <div className="rounded-xl border border-stone-200/60 bg-stone-50/50 p-3 space-y-0.5">
              <p className="text-stone-400 font-semibold text-[10px] uppercase">Total Rombongan Pax</p>
              <p className="font-bold text-brand-pink text-sm">{booking.participants.length} Pax Terdaftar</p>
            </div>
          </div>
        </section>

        {/* Financial KPI Breakdown Cards */}
        <section className="grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl border border-stone-200/70 bg-white p-5 shadow-2xs">
            <p className="text-xs font-semibold text-stone-500">Total Harga Paket</p>
            <p className="mt-1 text-2xl font-bold text-brand-cocoa">{booking.totalDisplay}</p>
            <p className="mt-1 text-[11px] text-stone-400">Termasuk fasilitas All In</p>
          </article>

          <article className="rounded-2xl border border-stone-200/70 bg-white p-5 shadow-2xs">
            <p className="text-xs font-semibold text-stone-500">Total Terbayar</p>
            <p className="mt-1 text-2xl font-bold text-emerald-700">{booking.paidDisplay}</p>
            <p className="mt-1 text-[11px] text-stone-400">Verifikasi Tim Keuangan</p>
          </article>

          <article className="rounded-2xl border border-stone-200/70 bg-white p-5 shadow-2xs">
            <p className="text-xs font-semibold text-stone-500">Sisa Tagihan Pelunasan</p>
            <p className="mt-1 text-2xl font-bold text-rose-700">{booking.remainingDisplay}</p>
            <p className="mt-1 text-[11px] text-stone-400">
              {booking.remainingAmount === 0 ? "Lunas Sempurna" : "Menunggu pelunasan"}
            </p>
          </article>
        </section>

        {/* 👥 Daftar Peserta Jamaah Rombongan */}
        <section className="rounded-2xl border border-stone-200/70 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-brand-cocoa">Daftar Peserta Jamaah Rombongan</h3>
              <p className="text-xs text-stone-500">Rincian identitas paspor RI, tipe kamar hotel, dan status dokumen visa.</p>
            </div>
            <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-brand-pink border border-brand-pink/20">
              {booking.participants.length} Pax
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-stone-200/60">
            <table className="w-full min-w-[700px] border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-stone-200/60 bg-stone-50/70 font-semibold text-stone-500 text-[11px] uppercase tracking-wider">
                  <th className="py-2.5 pl-3 pr-2">Nama Lengkap Jamaah</th>
                  <th className="py-2.5 pr-2">No. Paspor RI</th>
                  <th className="py-2.5 pr-2">Kontak / WhatsApp</th>
                  <th className="py-2.5 pr-2">Tipe Kamar Hotel</th>
                  <th className="py-2.5 pr-3 text-right">Status Dokumen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-normal">
                {booking.participants.map((p, idx) => (
                  <tr key={idx} className="transition hover:bg-stone-50/60">
                    <td className="py-3 pl-3 pr-2 font-bold text-brand-cocoa">{p.name}</td>
                    <td className="py-3 pr-2 font-mono font-semibold text-stone-700">{p.passport}</td>
                    <td className="py-3 pr-2 font-mono text-stone-600">{p.contact}</td>
                    <td className="py-3 pr-2 font-semibold text-stone-700">{p.roomType}</td>
                    <td className="py-3 pr-3 text-right">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                          p.documentStatus === "Lengkap"
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200/60"
                            : "bg-amber-50 text-amber-800 border border-amber-200/60"
                        }`}
                      >
                        {p.documentStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 💳 Riwayat Pembayaran Kuitansi */}
        <section className="rounded-2xl border border-stone-200/70 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-brand-cocoa">Riwayat Pembayaran & Kuitansi</h3>
              <p className="text-xs text-stone-500">Catatan mutasi pembayaran cicilan yang telah terverifikasi kasir.</p>
            </div>
            <Link
              href="/dokumen/kuitansi"
              className="text-xs font-semibold text-brand-pink hover:underline"
            >
              Lihat Semua Kuitansi →
            </Link>
          </div>

          <div className="overflow-x-auto rounded-xl border border-stone-200/60">
            <table className="w-full min-w-[700px] border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-stone-200/60 bg-stone-50/70 font-semibold text-stone-500 text-[11px] uppercase tracking-wider">
                  <th className="py-2.5 pl-3 pr-2">No. Kuitansi</th>
                  <th className="py-2.5 pr-2">Tanggal Bayar</th>
                  <th className="py-2.5 pr-2">Rekening Tujuan</th>
                  <th className="py-2.5 pr-2">Nominal Terbayar</th>
                  <th className="py-2.5 pr-3 text-right">Staf Verifikator</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-normal">
                {booking.payments.map((pay) => (
                  <tr key={pay.receipt} className="transition hover:bg-stone-50/60">
                    <td className="py-3 pl-3 pr-2 font-mono font-bold text-brand-pink">{pay.receipt}</td>
                    <td className="py-3 pr-2 text-stone-600">{pay.date}</td>
                    <td className="py-3 pr-2 font-medium text-stone-800">{pay.account}</td>
                    <td className="py-3 pr-2 font-bold text-emerald-800">{pay.amountDisplay}</td>
                    <td className="py-3 pr-3 text-right font-semibold text-stone-700">{pay.staff}</td>
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
