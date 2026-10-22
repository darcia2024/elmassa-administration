"use client";

import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  CircleDollarSign,
  CreditCard,
  Download,
  ExternalLink,
  Filter,
  MessageSquare,
  Printer,
  Receipt,
  Search,
  User,
  X,
} from "lucide-react";
import type { PaymentSummaryResponse, JamaahPaymentStatus } from "@/lib/payments/summary";

type JamaahRow = {
  id: string;
  fullName: string;
  gender: string;
  birthDate: string | null;
  nik: string;
  passportNumber: string;
  passportExpiry: string | null;
  phone: string;
  source: string;
  updatedAt: string;
  documentCount: number;
  departureNames: string[];
  companionCount: number;
};

function formatIDR(value: number) {
  return `Rp ${Math.round(Number(value) || 0).toLocaleString("id-ID")}`;
}

export function ModalDetailJamaahPembayaran({
  isOpen,
  onClose,
  status,
  groupName,
  items,
  paymentSummaryData,
  onFilterTable,
}: {
  isOpen: boolean;
  onClose: () => void;
  status: "Lunas" | "Sudah 50%" | "DP" | "Belum Bayar" | "Belum Lunas" | null;
  groupName?: string | null;
  items: JamaahRow[];
  paymentSummaryData: PaymentSummaryResponse | null;
  onFilterTable?: (status: string) => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Jamaah matching this payment status in the current scope
  const matchingJamaah = useMemo(() => {
    if (!status) return [];
    return items
      .map((r) => {
        const payInfo: JamaahPaymentStatus = paymentSummaryData?.byJamaahId[r.id] || {
          status: "Belum Bayar",
          paidAmount: 0,
          totalAmount: 35000000,
          remainingAmount: 35000000,
          percentPaid: 0,
          bookingCode: "—",
          packageName: r.departureNames[0] || "Umrah Reguler",
        };
        return {
          ...r,
          payInfo,
        };
      })
      .filter((r) => {
        if (status === "Belum Lunas") {
          return r.payInfo.status !== "Lunas" || r.payInfo.remainingAmount > 0;
        }
        return r.payInfo.status === status;
      });
  }, [status, items, paymentSummaryData]);

  // Filtered by search query
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return matchingJamaah;
    return matchingJamaah.filter((r) => {
      return (
        r.fullName.toLowerCase().includes(q) ||
        r.phone.includes(q) ||
        r.passportNumber.toLowerCase().includes(q) ||
        r.nik.includes(q) ||
        (r.payInfo.bookingCode && r.payInfo.bookingCode.toLowerCase().includes(q))
      );
    });
  }, [matchingJamaah, search]);

  // Stats summary for this category
  const stats = useMemo(() => {
    let totalBilled = 0;
    let totalPaid = 0;
    let totalRemaining = 0;
    for (const j of matchingJamaah) {
      totalBilled += j.payInfo.totalAmount;
      totalPaid += j.payInfo.paidAmount;
      totalRemaining += j.payInfo.remainingAmount;
    }
    return { totalBilled, totalPaid, totalRemaining, count: matchingJamaah.length };
  }, [matchingJamaah]);

  if (!isOpen || !mounted || !status) return null;

  const isBelumLunas = status === "Belum Lunas";
  const isLunas = status === "Lunas";
  const is50 = status === "Sudah 50%";
  const isDp = status === "DP";

  const config = isBelumLunas
    ? {
        title: "Daftar Jamaah Belum Lunas (Sisa Tagihan)",
        desc: "Daftar seluruh jamaah dengan kewajiban pembayaran yang belum selesai / memiliki sisa tagihan",
        badge: "Perlu Pelunasan",
        badgeColor: "bg-rose-100 text-rose-800 border-rose-200",
        headerColor: "from-rose-50 via-amber-50/30 to-white",
        iconColor: "bg-rose-100 text-rose-800",
        icon: <AlertCircle className="h-5 w-5" />,
      }
    : isLunas
    ? {
        title: "Daftar Jamaah Lunas (100%)",
        desc: "Daftar seluruh jamaah yang telah menyelesaikan pelunasan biaya 100%",
        badge: "Lunas 100%",
        badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
        headerColor: "from-emerald-50 via-teal-50/30 to-white",
        iconColor: "bg-emerald-100 text-emerald-800",
        icon: <CheckCircle2 className="h-5 w-5" />,
      }
    : is50
    ? {
        title: "Daftar Jamaah Sudah Membayar 50%",
        desc: "Daftar jamaah dengan cicilan pembayaran mencapai 50% atau lebih",
        badge: "Sudah 50%",
        badgeColor: "bg-indigo-100 text-indigo-800 border-indigo-200",
        headerColor: "from-indigo-50 via-sky-50/30 to-white",
        iconColor: "bg-indigo-100 text-indigo-800",
        icon: <CircleDollarSign className="h-5 w-5" />,
      }
    : isDp
    ? {
        title: "Daftar Jamaah DP (Uang Muka)",
        desc: "Daftar jamaah yang baru membayar uang muka / DP pemesanan kursi",
        badge: "DP Terverifikasi",
        badgeColor: "bg-amber-100 text-amber-800 border-amber-200",
        headerColor: "from-amber-50 via-yellow-50/30 to-white",
        iconColor: "bg-amber-100 text-amber-800",
        icon: <CreditCard className="h-5 w-5" />,
      }
    : {
        title: "Daftar Jamaah Belum Bayar",
        desc: "Daftar jamaah yang belum melakukan transaksi pembayaran apapun",
        badge: "Belum Bayar",
        badgeColor: "bg-stone-200 text-stone-800 border-stone-300",
        headerColor: "from-stone-100 via-stone-50 to-white",
        iconColor: "bg-stone-200 text-stone-800",
        icon: <AlertCircle className="h-5 w-5" />,
      };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank", "width=950,height=750");
    if (!printWindow) {
      alert("Pop-up diblokir oleh browser. Izinkan pop-up untuk mencetak dokumen.");
      return;
    }

    const todayStr = new Intl.DateTimeFormat("id-ID", {
      dateStyle: "full",
      timeStyle: "short",
    }).format(new Date());

    const rowsHtml = filtered
      .map(
        (j, idx) => `
        <tr>
          <td style="text-align: center; font-size: 11px;">${idx + 1}</td>
          <td style="font-size: 11px; font-weight: 600;">
            ${j.fullName}
            <div style="font-size: 9px; color: #666; font-weight: normal;">NIK: ${j.nik || "-"}</div>
          </td>
          <td style="font-size: 11px; font-family: monospace;">${j.passportNumber || "-"}</td>
          <td style="font-size: 11px;">${j.phone || "-"}</td>
          <td style="font-size: 10px; color: #444;">${j.departureNames.join(", ") || groupName || "Reguler"}</td>
          <td style="text-align: right; font-size: 11px;">${formatIDR(j.payInfo.totalAmount)}</td>
          <td style="text-align: right; font-size: 11px; color: #047857; font-weight: 600;">${formatIDR(j.payInfo.paidAmount)}</td>
          <td style="text-align: right; font-size: 11px; color: #dc2626; font-weight: 700;">${formatIDR(j.payInfo.remainingAmount)}</td>
          <td style="text-align: center; font-size: 10px;">
            <span style="display: inline-block; padding: 2px 6px; border-radius: 4px; font-weight: 600; font-size: 9px; ${
              j.payInfo.status === "Lunas"
                ? "background: #d1fae5; color: #065f46;"
                : j.payInfo.status === "DP"
                ? "background: #fef3c7; color: #92400e;"
                : "background: #fee2e2; color: #991b1b;"
            }">
              ${j.payInfo.status}
            </span>
          </td>
        </tr>
      `
      )
      .join("");

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Laporan Keuangan Jamaah - ${config.title}</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 15mm 12mm 15mm 12mm;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              color: #1c1917;
              margin: 0;
              padding: 10px;
              font-size: 11px;
            }
            .header-table {
              width: 100%;
              border-bottom: 2px solid #b71c1c;
              padding-bottom: 8px;
              margin-bottom: 12px;
            }
            .brand-title {
              font-size: 16px;
              font-weight: 800;
              color: #b71c1c;
              letter-spacing: 0.5px;
              text-transform: uppercase;
            }
            .brand-subtitle {
              font-size: 9px;
              color: #555;
            }
            .report-title {
              text-align: right;
              font-size: 13px;
              font-weight: 800;
              color: #292524;
            }
            .report-meta {
              text-align: right;
              font-size: 10px;
              color: #666;
            }
            .summary-box {
              display: flex;
              gap: 10px;
              margin-bottom: 14px;
              background: #f5f5f4;
              border: 1px solid #e7e5e4;
              border-radius: 6px;
              padding: 8px 10px;
            }
            .summary-item {
              flex: 1;
              text-align: center;
              border-right: 1px solid #d6d3d1;
            }
            .summary-item:last-child {
              border-right: none;
            }
            .summary-label {
              font-size: 9px;
              font-weight: 700;
              color: #78716c;
              text-transform: uppercase;
            }
            .summary-value {
              font-size: 12px;
              font-weight: 800;
              color: #1c1917;
              margin-top: 2px;
            }
            .summary-value.outstanding {
              color: #dc2626;
            }
            .summary-value.paid {
              color: #047857;
            }
            table.data-table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 8px;
            }
            table.data-table th {
              background: #292524;
              color: #ffffff;
              font-weight: 700;
              font-size: 10px;
              padding: 6px 8px;
              text-align: left;
              border: 1px solid #292524;
            }
            table.data-table td {
              border: 1px solid #e7e5e4;
              padding: 5px 8px;
              vertical-align: middle;
            }
            table.data-table tr:nth-child(even) {
              background: #fafaf9;
            }
            .footer-sign {
              margin-top: 35px;
              display: flex;
              justify-content: space-between;
              page-break-inside: avoid;
            }
            .sign-box {
              width: 220px;
              text-align: center;
              font-size: 11px;
            }
            .sign-line {
              margin-top: 50px;
              border-bottom: 1px solid #1c1917;
              font-weight: 700;
            }
            @media print {
              body { padding: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <table class="header-table">
            <tr>
              <td style="vertical-align: middle;">
                <div class="brand-title">PT. EL MASSA TOUR & TRAVEL</div>
                <div class="brand-subtitle">Izin PPIU Kemenag RI · Sistem Manajemen Dokumen & Keuangan Jamaah</div>
              </td>
              <td style="text-align: right; vertical-align: middle;">
                <div class="report-title">${config.title}</div>
                <div class="report-meta">Rombongan: <strong>${groupName || "Semua Rombongan"}</strong></div>
                <div class="report-meta">Dicetak: ${todayStr}</div>
              </td>
            </tr>
          </table>

          <div class="summary-box">
            <div class="summary-item">
              <div class="summary-label">Total Jamaah</div>
              <div class="summary-value">${stats.count} Orang</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">Total Tagihan (Billed)</div>
              <div class="summary-value">${formatIDR(stats.totalBilled)}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">Total Terbayar</div>
              <div class="summary-value paid">${formatIDR(stats.totalPaid)}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">Total Sisa Tagihan (Piutang)</div>
              <div class="summary-value outstanding">${formatIDR(stats.totalRemaining)}</div>
            </div>
          </div>

          <table class="data-table">
            <thead>
              <tr>
                <th style="width: 25px; text-align: center;">No</th>
                <th>Nama Lengkap Jamaah</th>
                <th style="width: 85px;">No. Paspor</th>
                <th style="width: 95px;">No. Telepon / WA</th>
                <th style="width: 110px;">Paket / Group</th>
                <th style="width: 95px; text-align: right;">Total Biaya</th>
                <th style="width: 95px; text-align: right;">Terbayar</th>
                <th style="width: 95px; text-align: right;">Sisa Tagihan</th>
                <th style="width: 75px; text-align: center;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml || `<tr><td colspan="9" style="text-align: center; padding: 20px; color: #888;">Tidak ada data jamaah</td></tr>`}
            </tbody>
            <tfoot>
              <tr style="background: #f5f5f4; font-weight: 700;">
                <td colspan="5" style="text-align: right; padding: 6px 8px;">TOTAL KESELURUHAN:</td>
                <td style="text-align: right; padding: 6px 8px;">${formatIDR(stats.totalBilled)}</td>
                <td style="text-align: right; padding: 6px 8px; color: #047857;">${formatIDR(stats.totalPaid)}</td>
                <td style="text-align: right; padding: 6px 8px; color: #dc2626;">${formatIDR(stats.totalRemaining)}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>

          <div class="footer-sign">
            <div class="sign-box">
              <div>Mengetahui,</div>
              <div style="font-weight: 600; margin-top: 2px;">Direksi / Pimpinan</div>
              <div class="sign-line">( ........................................ )</div>
            </div>
            <div class="sign-box">
              <div>Pangkalpinang, ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</div>
              <div style="font-weight: 600; margin-top: 2px;">Bagian Keuangan & Kasir</div>
              <div class="sign-line">( Staff Keuangan El Massa )</div>
            </div>
          </div>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 350);
  };

  const handleExportCSV = () => {
    const headers = [
      "No",
      "Nama Lengkap",
      "Gender",
      "NIK",
      "No Paspor",
      "No HP",
      "Rombongan / Keberangkatan",
      "Total Biaya",
      "Terbayar",
      "Sisa Tagihan",
      "Status Pembayaran",
    ];
    const csvRows = filtered.map((j, idx) => [
      idx + 1,
      `"${(j.fullName || "").replace(/"/g, '""')}"`,
      j.gender === "F" || j.gender === "P" ? "Wanita" : "Pria",
      `'${j.nik || ""}`,
      `'${j.passportNumber || ""}`,
      `'${j.phone || ""}`,
      `"${(j.departureNames.join(", ") || groupName || "").replace(/"/g, '""')}"`,
      j.payInfo.totalAmount,
      j.payInfo.paidAmount,
      j.payInfo.remainingAmount,
      j.payInfo.status,
    ]);

    const content = [headers.join(","), ...csvRows.map((r) => r.join(","))].join("\n");
    const blob = new Blob(["\uFEFF" + content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const safeTitle = (config.title || "laporan-keuangan").toLowerCase().replace(/[^a-z0-9]+/g, "-");
    link.href = url;
    link.download = `${safeTitle}-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-3 sm:p-5 backdrop-blur-xs font-sans"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="flex h-full max-h-[90vh] w-full max-w-4xl flex-col rounded-2xl bg-white shadow-2xl overflow-hidden border border-stone-200 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`border-b border-stone-100 bg-gradient-to-r ${config.headerColor} px-5 py-3.5 shrink-0`}>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl font-bold shrink-0 ${config.iconColor}`}>
                {config.icon}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm sm:text-base font-black text-brand-cocoa truncate">
                    {config.title}
                  </h3>
                  <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-black ${config.badgeColor}`}>
                    {config.badge}
                  </span>
                  <span className="rounded-full bg-stone-200 px-2 py-0.5 text-[10px] font-bold text-stone-700">
                    {stats.count} Jamaah
                  </span>
                </div>
                <p className="text-xs text-stone-500 truncate mt-0.5">
                  Rombongan: <strong className="text-brand-pink">{groupName || "Seluruh Rombongan"}</strong> · {config.desc}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="h-8 w-8 rounded-lg text-stone-400 hover:bg-stone-200 hover:text-stone-700 flex items-center justify-center font-bold transition shrink-0 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 border-b border-stone-100 bg-stone-50/70 p-3 sm:p-3.5 text-xs shrink-0">
          <div className="rounded-lg bg-white p-2 border border-stone-200/60 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-stone-400 block">Total Jamaah</span>
            <span className="text-sm font-black text-brand-cocoa block mt-0.5">{stats.count} Orang</span>
          </div>
          <div className="rounded-lg bg-white p-2 border border-stone-200/60 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-stone-400 block">Total Terbayar</span>
            <span className="text-sm font-black text-emerald-700 block mt-0.5">{formatIDR(stats.totalPaid)}</span>
          </div>
          <div className="rounded-lg bg-white p-2 border border-stone-200/60 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-stone-400 block">Sisa Tagihan</span>
            <span className="text-sm font-black text-rose-600 block mt-0.5">{formatIDR(stats.totalRemaining)}</span>
          </div>
          <div className="rounded-lg bg-white p-2 border border-stone-200/60 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-stone-400 block">Total Nilai Paket</span>
            <span className="text-sm font-black text-stone-700 block mt-0.5">{formatIDR(stats.totalBilled)}</span>
          </div>
        </div>

        {/* Search & Actions Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-stone-100 bg-white px-5 py-2.5 shrink-0">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-stone-400" />
            <input
              type="text"
              placeholder="Cari nama, paspor, telepon, atau booking..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 w-full rounded-lg border border-stone-200 bg-stone-50 pl-8 pr-3 text-xs outline-none focus:border-brand-pink focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap self-end sm:self-auto">
            {/* Dedicated Print Out Button */}
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-lg bg-stone-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-stone-800 transition shadow-2xs cursor-pointer active:scale-95"
              title="Cetak dokumen resmi A4 dengan kop PT El Massa"
            >
              <Printer className="h-3.5 w-3.5 text-amber-300" />
              <span>Cetak / Print Out</span>
            </button>

            {/* CSV / Excel Export */}
            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-xs font-bold text-stone-700 hover:bg-stone-50 transition shadow-2xs cursor-pointer"
              title="Download file CSV untuk dibuka di Microsoft Excel atau Spreadsheet"
            >
              <Download className="h-3 w-3 text-emerald-600" />
              <span className="hidden sm:inline">Export Excel</span>
            </button>

            {onFilterTable && (
              <button
                type="button"
                onClick={() => {
                  onFilterTable(status);
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-1.5 text-xs font-bold text-stone-700 hover:bg-stone-100 transition shadow-2xs cursor-pointer"
                title="Tampilkan jamaah ini di tabel utama halaman database"
              >
                <Filter className="h-3 w-3 text-stone-500" />
                <span className="hidden sm:inline">Filter Tabel</span>
              </button>
            )}

            <Link
              href="/pembayaran"
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand-pink px-2.5 py-1.5 text-xs font-bold text-white hover:bg-brand-pinkHover transition shadow-2xs"
            >
              <Receipt className="h-3 w-3" />
              <span>Kasir ↗</span>
            </Link>
          </div>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-stone-100 p-3 text-stone-400 mb-2">
                <User className="h-6 w-6" />
              </div>
              <h4 className="text-xs font-bold text-stone-700">Tidak ada jamaah dalam daftar ini</h4>
              <p className="text-[11px] text-stone-400 max-w-sm mt-0.5">
                {search
                  ? `Tidak ada hasil yang cocok dengan kata kunci "${search}".`
                  : `Belum ada jamaah dengan status ${status} pada rombongan ${groupName || "ini"}.`}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((j, idx) => {
                const percent = j.payInfo.percentPaid || (isLunas ? 100 : is50 ? 50 : 20);
                const cleanPhone = String(j.phone || "").replace(/\D/g, "");

                return (
                  <div
                    key={j.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-stone-200/80 bg-white p-3 hover:border-brand-pink/50 hover:bg-stone-50/50 transition shadow-2xs"
                  >
                    {/* Left: Info Jamaah */}
                    <div className="flex items-start gap-3 min-w-0">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-stone-100 text-[10px] font-mono font-bold text-stone-500 shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Link
                            href={`/jamaah/${j.id}`}
                            className="text-xs font-black text-brand-cocoa hover:text-brand-pink transition"
                          >
                            {j.fullName}
                          </Link>
                          <span
                            className={`rounded px-1.5 py-0.2 text-[9px] font-bold ${
                              j.gender === "F" || j.gender === "P"
                                ? "bg-pink-100 text-pink-700"
                                : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {j.gender === "F" || j.gender === "P" ? "Wanita" : "Pria"}
                          </span>
                          {j.payInfo.bookingCode && j.payInfo.bookingCode !== "—" && (
                            <span className="rounded bg-stone-100 px-1.5 py-0.2 text-[9px] font-mono font-bold text-stone-600">
                              Kode: {j.payInfo.bookingCode}
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-stone-500 mt-1">
                          <span className="font-mono">Paspor: {j.passportNumber || "Belum ada"}</span>
                          {j.phone && (
                            <a
                              href={`https://wa.me/${cleanPhone}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 font-bold text-emerald-600 hover:underline"
                            >
                              <MessageSquare className="h-2.5 w-2.5" />
                              <span>{j.phone}</span>
                            </a>
                          )}
                          <span className="text-stone-400">·</span>
                          <span className="truncate max-w-[200px]" title={j.departureNames.join(", ")}>
                            {j.departureNames.join(", ") || "Reguler"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Payment Progress & Actions */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                      <div className="text-left sm:text-right min-w-[130px]">
                        <div className="flex items-center sm:justify-end gap-1.5">
                          <span className="text-xs font-black text-brand-cocoa">
                            {formatIDR(j.payInfo.paidAmount || (isLunas ? j.payInfo.totalAmount : 15000000))}
                          </span>
                          <span className={`rounded-sm px-1 py-0.2 text-[9px] font-black ${
                            isBelumLunas
                              ? percent >= 50
                                ? "bg-indigo-100 text-indigo-800"
                                : percent > 0
                                ? "bg-amber-100 text-amber-800"
                                : "bg-rose-100 text-rose-800"
                              : config.badgeColor
                          }`}>
                            {percent}%
                          </span>
                        </div>
                        <p className={`text-[10px] mt-0.5 font-bold ${j.payInfo.remainingAmount > 0 ? "text-rose-600" : "text-emerald-600"}`}>
                          {isLunas ? "Lunas Sepenuhnya" : `Sisa: ${formatIDR(j.payInfo.remainingAmount)}`}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Link
                          href={`/jamaah/${j.id}`}
                          className="inline-flex items-center gap-1 rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-[11px] font-bold text-stone-700 hover:bg-stone-50 hover:text-brand-pink transition shadow-2xs"
                          title="Buka Halaman Biodata & Berkas Jamaah"
                        >
                          <span>Profil</span>
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-stone-100 bg-stone-50/80 px-5 py-3 shrink-0">
          <p className="text-xs text-stone-500">
            Menampilkan <strong className="text-stone-800">{filtered.length}</strong> dari{" "}
            <strong className="text-stone-800">{matchingJamaah.length}</strong> jamaah kategori ini
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1 rounded-xl bg-stone-800 px-3 py-1.5 text-xs font-bold text-white hover:bg-stone-700 transition cursor-pointer shadow-2xs"
            >
              <Printer className="h-3 w-3" />
              <span>Print Out Data</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-stone-300 bg-white px-4 py-1.5 text-xs font-bold text-stone-700 hover:bg-stone-100 transition cursor-pointer shadow-2xs"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
