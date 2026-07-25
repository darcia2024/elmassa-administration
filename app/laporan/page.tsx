"use client";

import { AlertTriangle, BarChart3, CalendarClock, Download, FileText, Printer, Search, WalletCards } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { ReportNav } from "@/components/report-nav";

const receivables = [
  {
    bookingCode: "BK-2407-016",
    customer: "Rombongan Al Ikhlas",
    packageName: "Umrah Plus Thaif",
    departureDate: "20 Agu 2026",
    totalDisplay: "Rp 266.000.000",
    paidDisplay: "Rp 0",
    remainingDisplay: "Rp 266.000.000",
    remainingAmount: 266_000_000,
    dueDate: "31 Jul 2026",
    dueDateValue: "2026-07-31",
    age: "14 hari",
    status: "Belum Bayar",
    priority: "Tinggi",
  },
];

const reportSummary = [
  { label: "Total Sisa Tagihan", value: "Rp 424.600.000", note: "4 booking belum lunas", icon: WalletCards },
  { label: "Lewat Tempo", value: "Rp 388.600.000", note: "3 booking prioritas tinggi", icon: AlertTriangle },
  { label: "Jatuh Tempo Terdekat", value: "28 Jul 2026", note: "BK-2407-018", icon: CalendarClock },
  { label: "Booking Lunas", value: "1", note: "Tidak masuk tabel piutang", icon: BarChart3 },
];

const priorityStyles: Record<string, string> = {
  Tinggi: "bg-rose-50 text-rose-700 ring-rose-200",
  Normal: "bg-emerald-50 text-emerald-700 ring-emerald-200",
};

const statusStyles: Record<string, string> = {
  DP: "bg-amber-50 text-amber-700 ring-amber-200",
  "Belum Bayar": "bg-rose-50 text-rose-700 ring-rose-200",
};

const tabs = ["Semua", "Lewat tempo", "Belum jatuh tempo"];
const customers = ["Semua pelanggan", ...Array.from(new Set(receivables.map((row) => row.customer)))];
const packages = ["Semua paket", ...Array.from(new Set(receivables.map((row) => row.packageName)))];

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    currency: "IDR",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(value);
}

export default function ReportsPage() {
  const [startDate, setStartDate] = useState("2026-07-01");
  const [endDate, setEndDate] = useState("2026-08-31");
  const [selectedCustomer, setSelectedCustomer] = useState("Semua pelanggan");
  const [selectedPackage, setSelectedPackage] = useState("Semua paket");
  const [query, setQuery] = useState("");

  const filteredReceivables = useMemo(
    () =>
      receivables.filter((row) => {
        const matchesDate = row.dueDateValue >= startDate && row.dueDateValue <= endDate;
        const matchesCustomer = selectedCustomer === "Semua pelanggan" || row.customer === selectedCustomer;
        const matchesPackage = selectedPackage === "Semua paket" || row.packageName === selectedPackage;
        const searchable = `${row.bookingCode} ${row.customer} ${row.packageName}`.toLowerCase();
        const matchesQuery = query.trim().length === 0 || searchable.includes(query.trim().toLowerCase());

        return matchesDate && matchesCustomer && matchesPackage && matchesQuery;
      }),
    [endDate, query, selectedCustomer, selectedPackage, startDate],
  );
  const filteredTotal = filteredReceivables.reduce((total, row) => total + row.remainingAmount, 0);
  const filteredHighPriority = filteredReceivables.filter((row) => row.priority === "Tinggi").length;
  const displaySummary = reportSummary.map((item) => {
    if (item.label === "Total Sisa Tagihan") {
      return {
        ...item,
        note: `${filteredReceivables.length} booking sesuai filter`,
        value: formatRupiah(filteredTotal),
      };
    }

    if (item.label === "Lewat Tempo") {
      return {
        ...item,
        note: `${filteredHighPriority} booking prioritas tinggi`,
      };
    }

    return item;
  });
  const handlePrintPdf = () => window.print();
  const handleDownloadExcel = () => {
    const header = [
      "Booking",
      "Pelanggan",
      "Paket",
      "Berangkat",
      "Total",
      "Terbayar",
      "Sisa",
      "Tempo",
      "Umur",
      "Status",
      "Prioritas",
    ];
    const bodyRows = filteredReceivables.map((row) => [
      row.bookingCode,
      row.customer,
      row.packageName,
      row.departureDate,
      row.totalDisplay,
      row.paidDisplay,
      row.remainingDisplay,
      row.dueDate,
      row.age,
      row.status,
      row.priority,
    ]);
    const html = `
      <table>
        <thead><tr>${header.map((cell) => `<th>${cell}</th>`).join("")}</tr></thead>
        <tbody>${bodyRows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`).join("")}</tbody>
        <tfoot><tr><td colspan="6">Total Sisa Tagihan</td><td>${formatRupiah(filteredTotal)}</td></tr></tfoot>
      </table>
    `;
    const blob = new Blob([html], { type: "application/vnd.ms-excel;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "laporan-sisa-tagihan-el-massa.xls";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AppShell eyebrow="Laporan" title="Laporan Sisa Tagihan">
      <ReportNav />

      <section className="print-hidden overflow-hidden rounded-lg border border-brand-rose bg-brand-cocoa shadow-soft">
        <div className="grid gap-5 p-5 text-white lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase text-brand-rose">Kontrol Piutang</p>
            <h3 className="mt-2 text-xl font-bold">Pantau sisa tagihan booking aktif</h3>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-brand-cream">
              Filter laporan berdasarkan periode tempo, pelanggan, dan paket untuk follow-up cicilan yang paling dekat.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:min-w-80">
            <div className="rounded-lg bg-white/10 p-4 ring-1 ring-white/15">
              <p className="text-xs font-bold uppercase text-brand-rose">Sesuai filter</p>
              <p className="mt-2 text-2xl font-bold">{filteredReceivables.length}</p>
            </div>
            <div className="rounded-lg bg-brand-pink p-4">
              <p className="text-xs font-bold uppercase text-white/80">Prioritas tinggi</p>
              <p className="mt-2 text-2xl font-bold">{filteredHighPriority}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="print-hidden grid gap-4 md:grid-cols-4">
        {displaySummary.map((item) => (
          <article key={item.label} className="rounded-lg border border-brand-rose bg-white p-5 shadow-soft">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-stone-500">{item.label}</p>
              <span className="grid h-9 w-9 place-items-center rounded-md bg-brand-rose text-brand-pink">
                <item.icon className="h-5 w-5" aria-hidden="true" />
              </span>
            </div>
            <p className="mt-3 text-2xl font-bold text-brand-cocoa">{item.value}</p>
            <p className="mt-2 text-sm text-stone-500">{item.note}</p>
          </article>
        ))}
      </section>

      <section className="report-print-area rounded-lg border border-brand-rose bg-white p-5 shadow-soft">
        <div className="mb-5 flex flex-col gap-4 rounded-lg bg-brand-cream p-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h3 className="text-lg font-bold text-brand-cocoa">Daftar Sisa Tagihan</h3>
            <p className="mt-1 text-sm text-stone-500">Data dummy piutang booking berdasarkan total tagihan dan pembayaran masuk.</p>
          </div>
          <div className="print-hidden flex flex-col gap-3 sm:flex-row">
            <Link className="inline-flex h-10 w-fit items-center gap-2 rounded-md border border-brand-rose bg-white px-4 text-sm font-bold text-brand-cocoa" href="/laporan/transaksi">
              <FileText className="h-4 w-4" aria-hidden="true" />
              Transaksi
            </Link>
            <button className="inline-flex h-10 w-fit items-center gap-2 rounded-md border border-brand-rose bg-white px-4 text-sm font-bold text-brand-cocoa" type="button" onClick={handlePrintPdf}>
              <Printer className="h-4 w-4" aria-hidden="true" />
              Cetak PDF
            </button>
            <button className="inline-flex h-10 w-fit items-center gap-2 rounded-md bg-brand-pink px-4 text-sm font-bold text-white" type="button" onClick={handleDownloadExcel}>
              <Download className="h-4 w-4" aria-hidden="true" />
              Unduh Excel
            </button>
          </div>
        </div>

        <div className="print-only mb-4 hidden">
          <p className="text-xs font-bold uppercase text-stone-500">El Massa Tour & Travel</p>
          <h1 className="mt-1 text-xl font-bold text-brand-cocoa">Laporan Sisa Tagihan</h1>
          <p className="mt-1 text-sm text-stone-600">
            Periode {startDate} sampai {endDate}
          </p>
        </div>

        <div className="print-hidden mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex gap-2 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab}
                className={`h-10 shrink-0 rounded-md px-4 text-sm font-bold ${
                  tab === "Semua"
                    ? "bg-brand-pink text-white"
                    : "border border-brand-rose bg-white text-brand-cocoa"
                }`}
                type="button"
              >
                {tab}
              </button>
            ))}
          </div>
          <label className="flex h-10 min-w-0 items-center gap-2 rounded-md border border-stone-200 bg-white px-3 text-sm text-stone-500 lg:w-80">
            <Search className="h-4 w-4 shrink-0" aria-hidden="true" />
            <input
              className="min-w-0 flex-1 bg-transparent outline-none"
              placeholder="Cari booking atau pelanggan"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
        </div>

        <div className="mb-5 grid gap-3 lg:grid-cols-4">
          <label className="block text-sm font-semibold text-brand-cocoa">
            Dari tempo
            <input
              className="mt-2 h-10 w-full rounded-md border border-stone-200 bg-white px-3 text-sm outline-none"
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
            />
          </label>
          <label className="block text-sm font-semibold text-brand-cocoa">
            Sampai tempo
            <input
              className="mt-2 h-10 w-full rounded-md border border-stone-200 bg-white px-3 text-sm outline-none"
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
            />
          </label>
          <label className="block text-sm font-semibold text-brand-cocoa">
            Pelanggan
            <select
              className="mt-2 h-10 w-full rounded-md border border-stone-200 bg-white px-3 text-sm outline-none"
              value={selectedCustomer}
              onChange={(event) => setSelectedCustomer(event.target.value)}
            >
              {customers.map((customer) => (
                <option key={customer}>{customer}</option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-semibold text-brand-cocoa">
            Paket
            <select
              className="mt-2 h-10 w-full rounded-md border border-stone-200 bg-white px-3 text-sm outline-none"
              value={selectedPackage}
              onChange={(event) => setSelectedPackage(event.target.value)}
            >
              {packages.map((packageName) => (
                <option key={packageName}>{packageName}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="overflow-x-auto rounded-lg border border-stone-200">
          <table className="w-full min-w-[1040px] border-collapse text-left text-sm">
            <thead className="bg-brand-cream text-xs uppercase text-stone-500">
              <tr>
                <th className="px-4 py-3 font-bold">Booking</th>
                <th className="px-4 py-3 font-bold">Pelanggan</th>
                <th className="px-4 py-3 font-bold">Paket</th>
                <th className="px-4 py-3 font-bold">Berangkat</th>
                <th className="px-4 py-3 font-bold">Total</th>
                <th className="px-4 py-3 font-bold">Terbayar</th>
                <th className="px-4 py-3 font-bold">Sisa</th>
                <th className="px-4 py-3 font-bold">Tempo</th>
                <th className="px-4 py-3 font-bold">Umur</th>
                <th className="px-4 py-3 font-bold">Status</th>
                <th className="px-4 py-3 font-bold">Prioritas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 bg-white">
              {filteredReceivables.map((row) => (
                <tr key={row.bookingCode} className="text-stone-700 hover:bg-brand-cream">
                  <td className="px-4 py-4">
                    <Link className="font-bold text-brand-cocoa hover:text-brand-pink" href={`/booking/${row.bookingCode}`}>
                      {row.bookingCode}
                    </Link>
                  </td>
                  <td className="px-4 py-4">{row.customer}</td>
                  <td className="px-4 py-4">{row.packageName}</td>
                  <td className="px-4 py-4 font-semibold">{row.departureDate}</td>
                  <td className="px-4 py-4">{row.totalDisplay}</td>
                  <td className="px-4 py-4">{row.paidDisplay}</td>
                  <td className="px-4 py-4 font-bold text-brand-cocoa">{row.remainingDisplay}</td>
                  <td className="px-4 py-4">{row.dueDate}</td>
                  <td className="px-4 py-4">{row.age}</td>
                  <td className="px-4 py-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${statusStyles[row.status]}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${priorityStyles[row.priority]}`}>
                      {row.priority}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredReceivables.length === 0 ? (
                <tr>
                  <td className="px-4 py-8 text-center text-sm font-semibold text-stone-500" colSpan={11}>
                    Tidak ada tagihan yang cocok dengan filter.
                  </td>
                </tr>
              ) : null}
            </tbody>
            <tfoot className="border-t border-stone-200 bg-brand-cream text-sm font-bold text-brand-cocoa">
              <tr>
                <td className="px-4 py-4" colSpan={4}>Total sisa tagihan</td>
                <td className="px-4 py-4" colSpan={2}>
                  {filteredReceivables.length} booking
                </td>
                <td className="px-4 py-4" colSpan={5}>{formatRupiah(filteredTotal)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>
    </AppShell>
  );
}
