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
  method: string;
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
};

const emptyBooking: BookingDetail = {
  code: "-",
  customer: "-",
  phone: "-",
  packageName: "-",
  departure: "-",
  groupName: "-",
  status: "Belum Bayar",
  totalDisplay: "Rp 0",
  paidDisplay: "Rp 0",
  remainingDisplay: "Rp 0",
  remainingAmount: 0,
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
    return { ...emptyBooking, code: decodedCode };
  });
  const [loadState, setLoadState] = useState<"loading" | "found" | "notFound">("loading");
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);

  useEffect(() => {
    let cancelled = false;

    // Match the booking code exactly. Never fall back to another booking — showing
    // someone else's jamaah and payment figures under this code is worse than
    // showing nothing.
    const findByCode = (list: unknown) =>
      Array.isArray(list) ? list.find((b: any) => b?.code === decodedCode) : undefined;

    const apply = (found: any) => {
      if (cancelled) return;
      setBooking({
        code: found.code || decodedCode,
        customer: found.customer || "-",
        phone: found.phone || "-",
        packageName: found.packageName || "-",
        departure: found.departure || "-",
        groupName: found.groupName || "-",
        status: found.status || "DP",
        totalDisplay: found.totalDisplay || `Rp ${(found.totalAmount || 0).toLocaleString("id-ID")}`,
        paidDisplay: found.paidDisplay || `Rp ${(found.paidAmount || 0).toLocaleString("id-ID")}`,
        remainingDisplay: found.remainingDisplay || `Rp ${(found.remainingAmount || 0).toLocaleString("id-ID")}`,
        remainingAmount: found.remainingAmount ?? 0,
      });
      setLoadState("found");
    };

    // 1. Paint instantly from this browser's cache, but treat it as a preview
    // only — Supabase still gets asked and overwrites it.
    let paintedFromCache = false;
    try {
      const savedStr = localStorage.getItem("el_massa_real_bookings");
      const cached = savedStr ? findByCode(JSON.parse(savedStr)) : undefined;
      if (cached) {
        apply(cached);
        paintedFromCache = true;
      }
    } catch (e) {
      console.error("Failed loading booking from localStorage:", e);
    }

    // 2. Supabase is the record. Ask for this one booking by code rather than
    // pulling the whole list and searching it client-side.
    fetch(`/api/bookings/${encodeURIComponent(decodedCode)}`)
      .then(async (res) => {
        if (cancelled) return;

        if (res.status === 404) {
          // A cached row for a booking the database no longer has is stale, not truth.
          setLoadState("notFound");
          return;
        }

        const payload = await res.json().catch(() => null);
        const remote = payload?.data?.booking;

        if (remote) {
          apply(remote);
        } else if (!paintedFromCache) {
          setLoadState("notFound");
        }
      })
      .catch((e) => {
        console.error("Failed loading booking from Supabase:", e);
        if (!cancelled && !paintedFromCache) setLoadState("notFound");
      });

    return () => {
      cancelled = true;
    };
  }, [decodedCode]);

  // Real payment history, replacing what used to be a single fabricated row
  // (fixed "BCA El Massa" account, fixed "Admin" staff name) built from the
  // booking's paid_amount alone.
  useEffect(() => {
    let cancelled = false;

    fetch(`/api/payments?bookingCode=${encodeURIComponent(decodedCode)}`)
      .then((res) => res.json())
      .then((json) => {
        if (cancelled) return;
        const rows = (json.data ?? []) as any[];
        setPaymentHistory(
          rows.map((p) => ({
            receipt: p.receiptNumber ?? "-",
            date: p.date,
            amountDisplay: `Rp ${Number(p.amount).toLocaleString("id-ID")}`,
            method: p.method,
            staff: p.receivedBy || "-",
          })),
        );
      })
      .catch((e) => console.error("Failed loading payment history:", e));

    return () => {
      cancelled = true;
    };
  }, [decodedCode]);

  // Real per-jamaah manifest data, replacing what used to be a single
  // fabricated row (the customer's own name/phone, hardcoded "Lengkap") --
  // real_bookings never actually carried a participantsList field, so that
  // fallback fired on every booking regardless of how many jamaah it had.
  useEffect(() => {
    let cancelled = false;

    fetch(`/api/manifest/participants?bookingCode=${encodeURIComponent(decodedCode)}`)
      .then((res) => res.json())
      .then((json) => {
        if (cancelled) return;
        const rows = (json.data ?? []) as any[];
        setParticipants(
          rows.map((p) => ({
            name: p.name,
            passport: p.passportNumber || "-",
            contact: p.contact || "-",
            documentStatus: p.documentStatus,
            roomType: p.roomType || "-",
          })),
        );
      })
      .catch((e) => console.error("Failed loading manifest participants:", e));

    return () => {
      cancelled = true;
    };
  }, [decodedCode]);

  const waText = encodeURIComponent(
    `Assalamu'alaikum wr. wb. Yth. Bapak/Ibu ${booking.customer},\n\nBerikut rincian transaksi booking *${booking.code}* untuk paket *${booking.packageName}*.\nTotal: ${booking.totalDisplay}\nTerbayar: ${booking.paidDisplay}\nSisa: ${booking.remainingDisplay}.\n\nTerima kasih,\n*PT El Massa Tour & Travel*`,
  );

  if (loadState !== "found") {
    return (
      <AppShell eyebrow="Manajemen Transaksi" title={`Rincian Booking ${decodedCode}`}>
        <div className="space-y-5">
          <div>
            <Link
              href="/booking"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-brand-pink transition"
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
              <span>Kembali ke Daftar Transaksi Booking</span>
            </Link>
          </div>

          <section className="rounded-2xl border border-stone-200 bg-white p-10 text-center shadow-2xs">
            {loadState === "loading" ? (
              <>
                <Clock className="mx-auto h-8 w-8 text-stone-300" strokeWidth={1.5} />
                <p className="mt-3 text-sm font-semibold text-stone-500">Memuat data booking…</p>
              </>
            ) : (
              <>
                <ShieldAlert className="mx-auto h-8 w-8 text-rose-400" strokeWidth={1.5} />
                <h2 className="mt-3 text-base font-extrabold text-brand-cocoa">Booking tidak ditemukan</h2>
                <p className="mx-auto mt-2 max-w-md text-xs text-stone-500">
                  Kode <span className="font-bold text-brand-cocoa">{decodedCode}</span> tidak ada di daftar
                  booking, baik di perangkat ini maupun di database. Periksa kembali kodenya lewat Daftar
                  Transaksi Booking.
                </p>
                <Link
                  href="/booking"
                  className="mt-5 inline-flex h-9 items-center rounded-xl bg-brand-pink px-4 text-xs font-bold text-white hover:brightness-110 transition"
                >
                  Buka Daftar Booking
                </Link>
              </>
            )}
          </section>
        </div>
      </AppShell>
    );
  }

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
              <p className="font-bold text-brand-pink text-sm">{participants.length} Pax Terdaftar</p>
            </div>
          </div>
        </section>

        {/* Financial KPI Breakdown Cards */}
        <section className="grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-3">
          <article className="rounded-2xl border border-stone-200/70 bg-white p-3.5 sm:p-5 shadow-2xs">
            <p className="text-[11px] sm:text-xs font-semibold text-stone-500 truncate">Total Harga Paket</p>
            <p className="mt-1 text-base sm:text-2xl font-bold text-brand-cocoa">{booking.totalDisplay}</p>
            <p className="mt-1 text-[10px] sm:text-[11px] text-stone-400 truncate">Termasuk fasilitas All In</p>
          </article>

          <article className="rounded-2xl border border-stone-200/70 bg-white p-3.5 sm:p-5 shadow-2xs">
            <p className="text-[11px] sm:text-xs font-semibold text-stone-500 truncate">Total Terbayar</p>
            <p className="mt-1 text-base sm:text-2xl font-bold text-emerald-700">{booking.paidDisplay}</p>
            <p className="mt-1 text-[10px] sm:text-[11px] text-stone-400 truncate">Verifikasi Tim Keuangan</p>
          </article>

          <article className="col-span-2 rounded-2xl border border-stone-200/70 bg-white p-3.5 sm:p-5 shadow-2xs md:col-span-1">
            <p className="text-[11px] sm:text-xs font-semibold text-stone-500 truncate">Sisa Tagihan Pelunasan</p>
            <p className="mt-1 text-base sm:text-2xl font-bold text-rose-700">{booking.remainingDisplay}</p>
            <p className="mt-1 text-[10px] sm:text-[11px] text-stone-400 truncate">
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
              {participants.length} Pax
            </span>
          </div>

          {/* Kartu mobile -- tabel peserta di bawah butuh 700px */}
          <div className="block space-y-3 md:hidden">
            {participants.length === 0 && (
              <p className="py-6 text-center text-xs text-stone-400">Belum ada data jamaah tercatat untuk booking ini.</p>
            )}

            {participants.map((p, idx) => (
              <div key={idx} className="space-y-2.5 rounded-2xl border border-stone-200/80 bg-white p-4 shadow-2xs">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="min-w-0 truncate text-xs font-bold text-brand-cocoa">{p.name}</h4>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      p.documentStatus === "Lengkap"
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200/60"
                        : "bg-amber-50 text-amber-800 border border-amber-200/60"
                    }`}
                  >
                    {p.documentStatus}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 rounded-xl border border-stone-100 bg-stone-50 p-2.5 text-[11px]">
                  <div className="min-w-0">
                    <span className="block text-[10px] font-medium text-stone-400">No. Paspor RI</span>
                    <span className="block truncate font-mono font-bold text-stone-800">{p.passport}</span>
                  </div>
                  <div className="min-w-0">
                    <span className="block text-[10px] font-medium text-stone-400">Kontak / WhatsApp</span>
                    <span className="block truncate font-mono text-stone-700">{p.contact}</span>
                  </div>
                </div>

                <p className="truncate border-t border-stone-100 pt-1 text-[11px] font-semibold text-stone-700">{p.roomType}</p>
              </div>
            ))}
          </div>

          <div className="hidden overflow-x-auto rounded-xl border border-stone-200/60 md:block">
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
                {participants.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-stone-400">
                      Belum ada data jamaah tercatat untuk booking ini.
                    </td>
                  </tr>
                )}
                {participants.map((p, idx) => (
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

          {/* Kartu mobile -- tabel kuitansi di bawah butuh 700px */}
          <div className="block space-y-3 md:hidden">
            {paymentHistory.length === 0 && (
              <p className="py-6 text-center text-xs text-stone-400">Belum ada pembayaran tercatat.</p>
            )}

            {paymentHistory.map((pay) => (
              <div key={pay.receipt} className="space-y-2.5 rounded-2xl border border-stone-200/80 bg-white p-4 shadow-2xs">
                <div className="flex items-start justify-between gap-2">
                  <span className="min-w-0 truncate font-mono text-xs font-bold text-brand-pink">{pay.receipt}</span>
                  <span className="shrink-0 text-[11px] text-stone-500">{pay.date}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 rounded-xl border border-stone-100 bg-stone-50 p-2.5 text-[11px]">
                  <div className="min-w-0">
                    <span className="block text-[10px] font-medium text-stone-400">Nominal Terbayar</span>
                    <span className="block truncate font-bold text-emerald-800">{pay.amountDisplay}</span>
                  </div>
                  <div className="min-w-0">
                    <span className="block text-[10px] font-medium text-stone-400">Metode</span>
                    <span className="block truncate font-bold text-stone-800">{pay.method}</span>
                  </div>
                </div>

                <p className="truncate border-t border-stone-100 pt-1 text-[11px] text-stone-500">
                  Diverifikasi <span className="font-semibold text-stone-700">{pay.staff}</span>
                </p>
              </div>
            ))}
          </div>

          <div className="hidden overflow-x-auto rounded-xl border border-stone-200/60 md:block">
            <table className="w-full min-w-[700px] border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-stone-200/60 bg-stone-50/70 font-semibold text-stone-500 text-[11px] uppercase tracking-wider">
                  <th className="py-2.5 pl-3 pr-2">No. Kuitansi</th>
                  <th className="py-2.5 pr-2">Tanggal Bayar</th>
                  <th className="py-2.5 pr-2">Metode</th>
                  <th className="py-2.5 pr-2">Nominal Terbayar</th>
                  <th className="py-2.5 pr-3 text-right">Staf Verifikator</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-normal">
                {paymentHistory.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-4 px-3 text-center text-stone-400">Belum ada pembayaran tercatat.</td>
                  </tr>
                )}
                {paymentHistory.map((pay) => (
                  <tr key={pay.receipt} className="transition hover:bg-stone-50/60">
                    <td className="py-3 pl-3 pr-2 font-mono font-bold text-brand-pink">{pay.receipt}</td>
                    <td className="py-3 pr-2 text-stone-600">{pay.date}</td>
                    <td className="py-3 pr-2 font-medium text-stone-800">{pay.method}</td>
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
