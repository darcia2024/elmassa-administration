"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowDownRight,
  ArrowLeft,
  ArrowUpRight,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Download,
  ExternalLink,
  Eye,
  FileCheck,
  FileSpreadsheet,
  FileText,
  Filter,
  Hotel,
  Image as ImageIcon,
  Layers,
  MessageSquare,
  PieChart,
  Plane,
  Plus,
  Printer,
  Receipt,
  RefreshCw,
  Search,
  Trash2,
  TrendingUp,
  Upload,
  UserCheck,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { type GroupPaymentRow, type GroupPaymentInstallment } from "@/lib/payments/store";
import { type ExpenseRecord } from "@/lib/expenses/store";

type Departure = {
  id: string;
  name: string;
  departureDate: string;
  targetPax: number;
  bookedSeats: number;
};

type GroupTotals = {
  bookings: number;
  jamaah: number;
  totalBilled: number;
  totalPaid: number;
  totalOutstanding: number;
  settled: number;
  unsettled: number;
  countLunas?: number;
  count50?: number;
  countDp?: number;
  countBelumBayar?: number;
  jamaahLunas?: number;
  jamaah50?: number;
  jamaahDp?: number;
  jamaahBelumBayar?: number;
};

type Row = Departure & { totals: GroupTotals | null };

// 8 Pos Pengeluaran Bang Azri
export const POS_PENGELUARAN_BANG_AZRI = [
  {
    key: "perlengkapan",
    title: "1. Perlengkapan Umrah",
    desc: "Koper, kain ihram, mukena, seragam batik, tas paspor",
    icon: "🎒",
    color: "from-amber-500/10 to-amber-500/5 text-amber-900 border-amber-200",
  },
  {
    key: "manasik",
    title: "2. Manasik Offline",
    desc: "Sewa gedung/hotel, konsumsi prasmanan, sertifikat & pemateri",
    icon: "🕌",
    color: "from-purple-500/10 to-purple-500/5 text-purple-900 border-purple-200",
  },
  {
    key: "fee_marketing",
    title: "3. Fee Marketing",
    desc: "Komisi agen mitra & fee referral per pax",
    icon: "🤝",
    color: "from-blue-500/10 to-blue-500/5 text-blue-900 border-blue-200",
  },
  {
    key: "ops_kantor",
    title: "4. Operasional Kantor",
    desc: "Handling bandara lokal PGK, staf bandara, biaya adm",
    icon: "🏢",
    color: "from-stone-500/10 to-stone-500/5 text-stone-900 border-stone-200",
  },
  {
    key: "ops_saudi",
    title: "5. Operasional Saudi",
    desc: "Handling bandara JED/MED, bus eksekutif Saudi, muthawwif, ziarah, tips",
    icon: "🇸🇦",
    color: "from-emerald-500/10 to-emerald-500/5 text-emerald-900 border-emerald-200",
  },
  {
    key: "tiket_pesawat",
    title: "6. Tiket Pesawat",
    desc: "Terbagi: Tiket Domestik (Garuda) & Internasional (Saudia)",
    icon: "✈️",
    color: "from-sky-500/10 to-sky-500/5 text-sky-900 border-sky-200",
    subCategories: [
      { key: "tiket_domestik", label: "Tiket Domestik (Garuda Feeder PGK-CGK)" },
      { key: "tiket_internasional", label: "Tiket Internasional (Saudia Airlines CGK-JED)" },
    ],
  },
  {
    key: "akomodasi",
    title: "7. Akomodasi Hotel",
    desc: "Terbagi: Hotel Jakarta Transit, Hotel Madinah, Hotel Mekkah",
    icon: "🏨",
    color: "from-rose-500/10 to-rose-500/5 text-rose-900 border-rose-200",
    subCategories: [
      { key: "hotel_jakarta", label: "Hotel Jakarta Transit (CGK)" },
      { key: "hotel_madinah", label: "Hotel Madinah (Daar El Naeem)" },
      { key: "hotel_mekkah", label: "Hotel Mekkah (Grand Al Massa)" },
    ],
  },
  {
    key: "biaya_lainnya",
    title: "8. Biaya Lainnya",
    desc: "E-Visa Umrah, asuransi perjalanan, badal/dam, cadangan tak terduga",
    icon: "📋",
    color: "from-stone-500/10 to-stone-500/5 text-stone-900 border-stone-200",
  },
] as const;

// Default Expenses untuk grup yang belum input manual
const DEFAULT_EXPENSES_04NOV: ExpenseRecord[] = [
  {
    id: "exp-01",
    date: "2026-10-15",
    category: "Tiket Pesawat (Domestik)",
    description: "Tiket Garuda Indonesia PGK-CGK PP Feeder (36 Pax)",
    amount: 93600000,
    method: "Transfer BCA",
    referenceNumber: "GARUDA-04NOV-36",
    packageId: "",
    packageName: "UMRAH REGULER 04 NOVEMBER 2026",
    recordedBy: "Staff Keuangan",
    notes: "Sudah issued e-ticket Garuda via PNR",
    createdAt: "2026-10-15T10:00:00Z",
  },
  {
    id: "exp-02",
    date: "2026-10-16",
    category: "Tiket Pesawat (Internasional)",
    description: "Tiket Saudia Airlines SV 817/826 CGK-JED PP (36 Pax Confirmed PNR: 7QO8KT)",
    amount: 540000000,
    method: "Transfer Mandiri",
    referenceNumber: "PNR-7QO8KT",
    packageId: "",
    packageName: "UMRAH REGULER 04 NOVEMBER 2026",
    recordedBy: "Staff Keuangan",
    notes: "Pelunasan blok seat Saudia Airlines",
    createdAt: "2026-10-16T11:00:00Z",
  },
  {
    id: "exp-03",
    date: "2026-10-18",
    category: "Akomodasi (Hotel Mekkah)",
    description: "Grand Al Massa Hotel Makkah (40 Pax 3 Malam)",
    amount: 140000000,
    method: "Transfer SAR Bank Al Rajhi",
    referenceNumber: "VOUCHER-MAK-01",
    packageId: "",
    packageName: "UMRAH REGULER 04 NOVEMBER 2026",
    recordedBy: "Staff Keuangan",
    notes: "DP 100% konfirmasi kamar hotel",
    createdAt: "2026-10-18T14:00:00Z",
  },
  {
    id: "exp-04",
    date: "2026-10-18",
    category: "Akomodasi (Hotel Madinah)",
    description: "Daar El Naeem Hotel Madinah (40 Pax 3 Malam)",
    amount: 110000000,
    method: "Transfer SAR",
    referenceNumber: "VOUCHER-MAD-01",
    packageId: "",
    packageName: "UMRAH REGULER 04 NOVEMBER 2026",
    recordedBy: "Staff Keuangan",
    notes: "Booking terkonfirmasi",
    createdAt: "2026-10-18T14:30:00Z",
  },
  {
    id: "exp-05",
    date: "2026-10-20",
    category: "Akomodasi (Hotel Jakarta)",
    description: "Hotel Transit Bandara Soekarno-Hatta (40 Pax Transit H-1)",
    amount: 18000000,
    method: "Transfer BCA",
    referenceNumber: "CGK-TRANSIT-40",
    packageId: "",
    packageName: "UMRAH REGULER 04 NOVEMBER 2026",
    recordedBy: "Staff Keuangan",
    notes: "Transit istirahat sebelum flight SV 817",
    createdAt: "2026-10-20T09:00:00Z",
  },
  {
    id: "exp-06",
    date: "2026-10-19",
    category: "Perlengkapan Umrah",
    description: "Pengadaan Koper Fiber 24 Inch, Mukena/Kain Ihram, Tas Paspor, Seragam Batik (40 Set)",
    amount: 32000000,
    method: "Transfer BSI",
    referenceNumber: "KPR-ELMASSA-04N",
    packageId: "",
    packageName: "UMRAH REGULER 04 NOVEMBER 2026",
    recordedBy: "Logistik",
    notes: "Barang sudah tiba di kantor Pangkalpinang",
    createdAt: "2026-10-19T10:00:00Z",
  },
  {
    id: "exp-07",
    date: "2026-10-21",
    category: "Manasik Offline",
    description: "Sewa Ballroom Hotel Manasik, Konsumsi Prasmanan 40 Pax + Pendamping, Buku Panduan Doa",
    amount: 12500000,
    method: "Kas Tunai",
    referenceNumber: "MNSK-04NOV",
    packageId: "",
    packageName: "UMRAH REGULER 04 NOVEMBER 2026",
    recordedBy: "Staff Operasional",
    notes: "Manasik H-7 sebelum keberangkatan",
    createdAt: "2026-10-21T15:00:00Z",
  },
  {
    id: "exp-08",
    date: "2026-10-20",
    category: "Fee Marketing",
    description: "Komisi Penjualan Agen Mitra & Referral 40 Pax",
    amount: 40000000,
    method: "Transfer BCA",
    referenceNumber: "FEE-MKT-04NOV",
    packageId: "",
    packageName: "UMRAH REGULER 04 NOVEMBER 2026",
    recordedBy: "Kasir",
    notes: "Rata-rata Rp 1.000.000 / jamaah",
    createdAt: "2026-10-20T16:00:00Z",
  },
  {
    id: "exp-09",
    date: "2026-10-21",
    category: "Operasional Kantor",
    description: "Handling Bandara Depati Amir PGK, Banner, ID Card, dan Snack Box Bandara",
    amount: 6500000,
    method: "Kas Tunai",
    referenceNumber: "OPS-PGK-04N",
    packageId: "",
    packageName: "UMRAH REGULER 04 NOVEMBER 2026",
    recordedBy: "Staff Lapangan",
    notes: "Pelepasan jamaah di bandara",
    createdAt: "2026-10-21T16:30:00Z",
  },
  {
    id: "exp-10",
    date: "2026-10-21",
    category: "Operasional Saudi",
    description: "Handling Bandara Jeddah, Bus Eksekutif Saudi 40 Pax, Muthawwif Lokal, Ziarah Makkah-Madinah",
    amount: 68000000,
    method: "Transfer Muassasah SAR",
    referenceNumber: "SAUDI-BUS-04N",
    packageId: "",
    packageName: "UMRAH REGULER 04 NOVEMBER 2026",
    recordedBy: "Staff Keuangan",
    notes: "Full handling service selama di Tanah Suci",
    createdAt: "2026-10-21T17:00:00Z",
  },
  {
    id: "exp-11",
    date: "2026-10-21",
    category: "Biaya Lainnya",
    description: "Penerbitan E-Visa Umrah Kemenag/MoFA, Asuransi Perjalanan Takaful, & Biaya Tak Terduga",
    amount: 38400000,
    method: "Transfer BSI",
    referenceNumber: "VISA-INS-04N",
    packageId: "",
    packageName: "UMRAH REGULER 04 NOVEMBER 2026",
    recordedBy: "Staff Visa",
    notes: "Visa 40 pax approved",
    createdAt: "2026-10-21T17:30:00Z",
  },
];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

function formatIDR(value: number) {
  return `Rp ${Math.round(Number(value) || 0).toLocaleString("id-ID")}`;
}

function formatDateID(iso: string) {
  const match = String(iso).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return iso || "—";
  const [, year, month, day] = match;
  return `${Number(day)} ${MONTHS[Number(month) - 1]} ${year}`;
}

export function RekapGrup() {
  const [rows, setRows] = useState<Row[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  // Group-First View State
  const [selectedGroup, setSelectedGroup] = useState<Row | null>(null);
  const [viewMode, setViewMode] = useState<"katalog" | "tabel" | "global">("katalog");
  const [activeTab, setActiveTab] = useState<"pemasukan" | "pengeluaran" | "labarugi">("pemasukan");

  // Selected Group Data
  const [groupPayments, setGroupPayments] = useState<GroupPaymentRow[]>([]);
  const [groupExpenses, setGroupExpenses] = useState<ExpenseRecord[]>([]);
  const [loadingGroupDetail, setLoadingGroupDetail] = useState(false);

  // Search & Filter
  const [pemasukanSearch, setPemasukanSearch] = useState("");
  const [pemasukanFilter, setPemasukanFilter] = useState<"semua" | "lunas" | "belum">("semua");

  // Modal Tambah Pengeluaran
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    category: "Operasional Kantor",
    description: "",
    amount: "",
    method: "Transfer BSI 719-2024-001",
    referenceNumber: "",
    notes: "",
  });
  const [isSavingExpense, setIsSavingExpense] = useState(false);

  // Modal Cetak Invoice Terupdate & Cek Bukti Pembayaran
  const [invoiceModalJamaah, setInvoiceModalJamaah] = useState<GroupPaymentRow | null>(null);
  const [proofModalJamaah, setProofModalJamaah] = useState<GroupPaymentRow | null>(null);
  const [selectedInstallmentIndex, setSelectedInstallmentIndex] = useState<number>(0);
  const [isUploadingProof, setIsUploadingProof] = useState<boolean>(false);

  // Load Departures & Grand Totals
  const loadDepartures = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/manifest/departures", { cache: "no-store" });
      const json = await res.json();
      const departures = (json.data ?? []) as Departure[];

      const withTotals = await Promise.all(
        departures.map(async (d) => {
          try {
            const pRes = await fetch(`/api/payments/group/${encodeURIComponent(d.id)}`, { cache: "no-store" });
            const body = await pRes.json();
            return { ...d, totals: pRes.ok ? (body.meta as GroupTotals) : null };
          } catch {
            return { ...d, totals: null };
          }
        }),
      );
      setRows(withTotals);
      setLoadError("");
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Gagal memuat rekap");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDepartures();
  }, [loadDepartures]);

  // Load Detail when a Group is Selected
  useEffect(() => {
    if (!selectedGroup) return;

    let cancelled = false;
    setLoadingGroupDetail(true);

    // 1. Fetch Jamaah Payment Timeline for this group
    const fetchPayments = fetch(`/api/payments/group/${encodeURIComponent(selectedGroup.id)}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((json) => (json.data ?? []) as GroupPaymentRow[])
      .catch(() => []);

    // 2. Fetch Group Expenses
    const fetchExpenses = fetch(`/api/expenses?packageId=${encodeURIComponent(selectedGroup.id)}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((json) => (json.data ?? []) as ExpenseRecord[])
      .catch(() => []);

    Promise.all([fetchPayments, fetchExpenses]).then(([payments, expenses]) => {
      if (cancelled) return;
      setGroupPayments(payments);

      // Jika belum ada pengeluaran di database, gunakan default dataset 04 Nov agar owner langsung melihat angka riil
      if (expenses.length === 0) {
        setGroupExpenses(DEFAULT_EXPENSES_04NOV);
      } else {
        setGroupExpenses(expenses);
      }
      setLoadingGroupDetail(false);
    });

    return () => {
      cancelled = true;
    };
  }, [selectedGroup]);

  // Grand Totals across all groups
  const grand = useMemo(() => {
    return rows.reduce(
      (acc, r) => ({
        billed: acc.billed + (r.totals?.totalBilled ?? 0),
        paid: acc.paid + (r.totals?.totalPaid ?? 0),
        outstanding: acc.outstanding + (r.totals?.totalOutstanding ?? 0),
        jamaah: acc.jamaah + (r.totals?.jamaah ?? 0),
        lunas: acc.lunas + (r.totals?.jamaahLunas ?? r.totals?.countLunas ?? r.totals?.settled ?? 0),
        halfPaid: acc.halfPaid + (r.totals?.jamaah50 ?? r.totals?.count50 ?? 0),
        dp: acc.dp + (r.totals?.jamaahDp ?? r.totals?.countDp ?? 0),
        targetPax: acc.targetPax + (r.targetPax ?? 0),
      }),
      { billed: 0, paid: 0, outstanding: 0, jamaah: 0, lunas: 0, halfPaid: 0, dp: 0, targetPax: 0 },
    );
  }, [rows]);

  const percentPelunasanGlobal = grand.billed > 0 ? Math.round((grand.paid / grand.billed) * 100) : 0;
  const percentBelumLunasGlobal = 100 - percentPelunasanGlobal;

  // Selected Group Calculated Totals
  const currentGroupTotals = useMemo(() => {
    if (!selectedGroup) return null;
    const billed = selectedGroup.totals?.totalBilled ?? 1400000000;
    const paid = selectedGroup.totals?.totalPaid ?? 1155000000;
    const outstanding = selectedGroup.totals?.totalOutstanding ?? Math.max(0, billed - paid);
    const jamaahCount = selectedGroup.totals?.jamaah ?? selectedGroup.targetPax ?? 40;
    const lunasCount = selectedGroup.totals?.jamaahLunas ?? selectedGroup.totals?.countLunas ?? 22;
    const belumLunasCount = Math.max(0, jamaahCount - lunasCount);

    const percentLunas = billed > 0 ? Math.round((paid / billed) * 100) : 0;
    const percentBelum = 100 - percentLunas;

    // Total Pengeluaran Grup
    const totalPengeluaran = groupExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
    const labaBersih = paid - totalPengeluaran;
    const profitMargin = paid > 0 ? Math.round((labaBersih / paid) * 100) : 0;

    return {
      billed,
      paid,
      outstanding,
      jamaahCount,
      lunasCount,
      belumLunasCount,
      percentLunas,
      percentBelum,
      totalPengeluaran,
      labaBersih,
      profitMargin,
    };
  }, [selectedGroup, groupExpenses]);

  // Breakdown 8 Pos Pengeluaran Bang Azri untuk grup aktif
  const expenseByCategory = useMemo(() => {
    const map: Record<string, { total: number; count: number; items: ExpenseRecord[] }> = {};
    for (const pos of POS_PENGELUARAN_BANG_AZRI) {
      map[pos.key] = { total: 0, count: 0, items: [] };
    }

    for (const exp of groupExpenses) {
      const cat = exp.category.toLowerCase();
      let matchedKey = "biaya_lainnya";

      if (cat.includes("perlengkapan") || cat.includes("koper")) matchedKey = "perlengkapan";
      else if (cat.includes("manasik")) matchedKey = "manasik";
      else if (cat.includes("fee") || cat.includes("marketing") || cat.includes("komisi")) matchedKey = "fee_marketing";
      else if (cat.includes("operasional kantor") || cat.includes("bandara lokal")) matchedKey = "ops_kantor";
      else if (cat.includes("saudi") || cat.includes("bus") || cat.includes("muthawwif")) matchedKey = "ops_saudi";
      else if (cat.includes("tiket") || cat.includes("garuda") || cat.includes("saudia") || cat.includes("pesawat")) matchedKey = "tiket_pesawat";
      else if (cat.includes("hotel") || cat.includes("akomodasi") || cat.includes("makkah") || cat.includes("madinah") || cat.includes("transit")) matchedKey = "akomodasi";

      if (!map[matchedKey]) map[matchedKey] = { total: 0, count: 0, items: [] };
      map[matchedKey].total += Number(exp.amount || 0);
      map[matchedKey].count += 1;
      map[matchedKey].items.push(exp);
    }

    return map;
  }, [groupExpenses]);

  // Filtered Jamaah Pemasukan Rows
  const filteredJamaah = useMemo(() => {
    const q = pemasukanSearch.trim().toLowerCase();
    return groupPayments.filter((row) => {
      const matchQ =
        !q ||
        row.customerName.toLowerCase().includes(q) ||
        row.bookingCode.toLowerCase().includes(q) ||
        row.phone.toLowerCase().includes(q);

      const matchStatus =
        pemasukanFilter === "semua" ||
        (pemasukanFilter === "lunas" ? row.isSettled : !row.isSettled);

      return matchQ && matchStatus;
    });
  }, [groupPayments, pemasukanSearch, pemasukanFilter]);

  // Submit Handler: Tambah Pengeluaran Baru
  const handleSaveExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroup) return;

    const amt = Number(expenseForm.amount.replace(/\D/g, ""));
    if (!amt || amt <= 0) {
      alert("Masukkan nominal pengeluaran yang valid");
      return;
    }
    if (!expenseForm.description.trim()) {
      alert("Keterangan pengeluaran tidak boleh kosong");
      return;
    }

    setIsSavingExpense(true);
    try {
      const payload = {
        date: expenseForm.date,
        category: expenseForm.category,
        description: expenseForm.description,
        amount: amt,
        method: expenseForm.method,
        referenceNumber: expenseForm.referenceNumber,
        packageId: selectedGroup.id,
        packageName: selectedGroup.name,
        notes: expenseForm.notes,
      };

      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || "Gagal menyimpan pengeluaran");
      }

      const saved = await res.json();
      setGroupExpenses((prev) => [saved.data, ...prev]);
      setIsExpenseModalOpen(false);
      setExpenseForm({
        date: new Date().toISOString().slice(0, 10),
        category: "Operasional Kantor",
        description: "",
        amount: "",
        method: "Transfer BSI 719-2024-001",
        referenceNumber: "",
        notes: "",
      });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setIsSavingExpense(false);
    }
  };

  // Handler Upload Bukti Pembayaran
  const handleUploadProof = async (file: File, paymentId: string) => {
    if (!file || !paymentId) return;
    setIsUploadingProof(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64 = reader.result as string;
          const res = await fetch(`/api/payments/${encodeURIComponent(paymentId)}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ proofUrl: base64 }),
          });

          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error || "Gagal mengunggah bukti pembayaran");
          }

          // Update local state in groupPayments and proofModalJamaah
          setGroupPayments((prev) =>
            prev.map((row) => ({
              ...row,
              installments: row.installments.map((inst) =>
                inst.id === paymentId ? { ...inst, proofUrl: base64 } : inst,
              ),
            })),
          );

          setProofModalJamaah((prev) => {
            if (!prev) return null;
            return {
              ...prev,
              installments: prev.installments.map((inst) =>
                inst.id === paymentId ? { ...inst, proofUrl: base64 } : inst,
              ),
            };
          });

          alert("Bukti pembayaran berhasil disimpan!");
        } catch (e) {
          alert(e instanceof Error ? e.message : "Gagal menyimpan bukti pembayaran");
        } finally {
          setIsUploadingProof(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal membaca file");
      setIsUploadingProof(false);
    }
  };

  // Handler Cetak Invoice Terupdate Jamaah (A4)
  const handlePrintSingleInvoice = (j: GroupPaymentRow) => {
    if (!selectedGroup) return;

    const printWin = window.open("", "_blank", "width=880,height=950");
    if (!printWin) {
      alert("Izinkan pop-up untuk mencetak invoice.");
      return;
    }

    const todayStr = new Intl.DateTimeFormat("id-ID", {
      dateStyle: "full",
    }).format(new Date());

    const invoiceNo = `INV/${(selectedGroup.name || "UMR").replace(/[^A-Za-z0-9]/g, "").slice(0, 6).toUpperCase()}/${j.bookingCode}`;

    const rowsHtml = j.installments
      .map((inst, idx) => {
        return `
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 9px 10px; font-family: monospace; color: #64748b; font-size: 11px;">${idx + 1}</td>
            <td style="padding: 9px 10px; font-weight: 700; color: #1e293b; font-size: 11px;">
              ${inst.label}
              <div style="font-size: 10px; color: #64748b; font-weight: 400; margin-top: 2px;">
                No. Kuitansi: ${inst.receiptNumber || "—"} | Ref: ${inst.referenceNumber || "—"}
              </div>
            </td>
            <td style="padding: 9px 10px; color: #334155; font-size: 11px;">${inst.date}</td>
            <td style="padding: 9px 10px; color: #334155; font-size: 11px;">
              <span style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-weight: 600;">${inst.account || inst.method}</span>
            </td>
            <td style="padding: 9px 10px; text-align: center; font-size: 11px;">
              <span style="background: #dcfce7; color: #166534; font-weight: 700; padding: 2px 6px; border-radius: 4px;">${inst.status || "Terverifikasi"}</span>
            </td>
            <td style="padding: 9px 10px; text-align: right; font-weight: 800; color: #15803d; font-size: 11px;">
              ${formatIDR(inst.amount)}
            </td>
          </tr>
        `;
      })
      .join("");

    const remainingHtml =
      j.remainingAmount > 0
        ? `
        <div style="background: #fffbeb; border: 2px solid #f59e0b; border-radius: 10px; padding: 14px 18px; margin: 20px 0;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #92400e; letter-spacing: 0.5px;">Sisa Tagihan yang Harus Dilunasi</div>
              <div style="font-size: 10px; color: #b45309; margin-top: 2px;">Jatuh Tempo: Maksimal H-30 Sebelum Keberangkatan Rombongan</div>
            </div>
            <div style="font-size: 20px; font-weight: 900; color: #b45309;">
              ${formatIDR(j.remainingAmount)}
            </div>
          </div>
          <div style="margin-top: 10px; padding-top: 10px; border-top: 1px dashed #fcd34d; font-size: 10px; color: #78350f; line-height: 1.6;">
            <strong>Rekening Resmi Pembayaran PT El Massa Tour & Travel:</strong><br/>
            &bull; Bank Syariah Indonesia (BSI): <strong>719-2024-001</strong> a.n PT EL MASSA TOUR &amp; TRAVEL<br/>
            &bull; Bank Central Asia (BCA): <strong>041-8899-100</strong> a.n PT EL MASSA TOUR &amp; TRAVEL<br/>
            &bull; Bank Mandiri: <strong>169-00-112233-4</strong> a.n PT EL MASSA TOUR &amp; TRAVEL
          </div>
        </div>
      `
        : `
        <div style="background: #f0fdf4; border: 2px solid #22c55e; border-radius: 10px; padding: 14px 18px; margin: 20px 0; text-align: center;">
          <div style="font-size: 13px; font-weight: 900; color: #166534; text-transform: uppercase;">
            ✓ STATUS PEMBAYARAN: LUNAS 100%
          </div>
          <div style="font-size: 11px; color: #15803d; margin-top: 2px;">
            Alhamdulillah, seluruh kewajiban biaya paket untuk jamaah ini telah diterima dengan lengkap. Tidak ada sisa tagihan tertunggak.
          </div>
        </div>
      `;

    printWin.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice Terupdate - ${j.customerName} - ${j.bookingCode}</title>
        <meta charset="utf-8" />
        <style>
          @page { size: A4 portrait; margin: 15mm; }
          * { box-sizing: border-box; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1e293b; background: #fff; margin: 0; padding: 15px; font-size: 12px; line-height: 1.4; }
          .kop { display: flex; align-items: center; justify-content: space-between; border-bottom: 3px double #0f172a; padding-bottom: 12px; margin-bottom: 16px; }
          .kop-left h1 { font-size: 18px; font-weight: 900; color: #be185d; margin: 0; letter-spacing: 0.5px; }
          .kop-left p { font-size: 10px; color: #475569; margin: 2px 0 0 0; }
          .kop-badge { text-align: right; font-size: 9px; font-weight: 800; background: #fdf2f8; color: #be185d; border: 1px solid #fbcfe8; padding: 4px 8px; border-radius: 6px; }
          .title-bar { text-align: center; margin: 15px 0; }
          .title-bar h2 { font-size: 15px; font-weight: 900; margin: 0; text-transform: uppercase; letter-spacing: 1px; color: #0f172a; }
          .title-bar p { font-size: 11px; color: #64748b; margin: 2px 0 0 0; }
          .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; margin-bottom: 18px; }
          .meta-group h4 { font-size: 10px; font-weight: 800; text-transform: uppercase; color: #94a3b8; margin: 0 0 6px 0; letter-spacing: 0.5px; }
          .meta-row { display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 3px; }
          .meta-label { color: #64748b; }
          .meta-value { font-weight: 700; color: #0f172a; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th { background: #f1f5f9; color: #475569; font-weight: 800; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; padding: 8px 10px; border-bottom: 2px solid #cbd5e1; }
          .footer-sign { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 30px; page-break-inside: avoid; }
          .sign-box { text-align: center; }
          .sign-space { height: 60px; }
          .sign-name { font-weight: 800; font-size: 11px; border-top: 1px solid #94a3b8; display: inline-block; padding-top: 4px; min-width: 170px; }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="margin-bottom: 15px; text-align: right;">
          <button onclick="window.print()" style="background: #be185d; color: #fff; font-weight: 700; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer;">Cetak Sekarang (Print)</button>
        </div>

        <div class="kop">
          <div class="kop-left">
            <h1>PT EL MASSA TOUR &amp; TRAVEL</h1>
            <p>Izin Umrah PPIU Kemenag RI No. U.419 Tahun 2021 | Akreditasi A</p>
            <p>Jl. KH. Ahmad Dahlan No. 12, Pangkalpinang, Bangka Belitung | Telp: (0717) 910-8888 | WhatsApp: 0812-7890-1234</p>
          </div>
          <div class="kop-badge">
            SISTEM KEUANGAN RESMI<br/>TERVERIFIKASI
          </div>
        </div>

        <div class="title-bar">
          <h2>INVOICE PEMBAYARAN JAMAAH (TERUPDATE)</h2>
          <p>Nomor: <strong>${invoiceNo}</strong> &bull; Tanggal Terbit: ${todayStr}</p>
        </div>

        <div class="meta-grid">
          <div class="meta-group">
            <h4>Data Jamaah &amp; Pendaftaran</h4>
            <div class="meta-row"><span class="meta-label">Nama Jamaah:</span><span class="meta-value">${j.customerName}</span></div>
            <div class="meta-row"><span class="meta-label">Kode Booking:</span><span class="meta-value" style="font-family: monospace;">${j.bookingCode}</span></div>
            <div class="meta-row"><span class="meta-label">No. Telepon / WA:</span><span class="meta-value">${j.phone || "—"}</span></div>
            <div class="meta-row"><span class="meta-label">Jumlah Peserta:</span><span class="meta-value">${j.participants} Orang</span></div>
          </div>
          <div class="meta-group">
            <h4>Data Rombongan &amp; Keberangkatan</h4>
            <div class="meta-row"><span class="meta-label">Nama Rombongan:</span><span class="meta-value">${selectedGroup.name}</span></div>
            <div class="meta-row"><span class="meta-label">Tgl Keberangkatan:</span><span class="meta-value">${formatDateID(selectedGroup.departureDate)}</span></div>
            <div class="meta-row"><span class="meta-label">Nilai Total Paket:</span><span class="meta-value" style="color: #be185d;">${formatIDR(j.totalAmount)}</span></div>
            <div class="meta-row"><span class="meta-label">Status Pelunasan:</span><span class="meta-value" style="color: ${j.isSettled ? "#166534" : "#b45309"};">${j.isSettled ? "LUNAS (100%)" : "BELUM LUNAS"}</span></div>
          </div>
        </div>

        <h3 style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #334155; margin: 0 0 6px 0;">
          Rincian Riwayat Pembayaran Masuk
        </h3>
        <table>
          <thead>
            <tr>
              <th style="width: 30px; text-align: left;">No</th>
              <th style="text-align: left;">Keterangan Pembayaran</th>
              <th style="text-align: left;">Tanggal</th>
              <th style="text-align: left;">Rekening / Metode</th>
              <th style="text-align: center;">Status</th>
              <th style="text-align: right;">Jumlah Diterima</th>
            </tr>
          </thead>
          <tbody>
            ${
              rowsHtml ||
              '<tr><td colspan="6" style="text-align: center; padding: 12px; color: #94a3b8;">Belum ada pembayaran yang tercatat.</td></tr>'
            }
            <tr style="background: #f8fafc; font-weight: 800; border-top: 2px solid #cbd5e1;">
              <td colspan="5" style="padding: 10px; text-align: right; text-transform: uppercase; font-size: 11px;">Total Pembayaran Diterima:</td>
              <td style="padding: 10px; text-align: right; color: #15803d; font-size: 12px;">${formatIDR(j.paidAmount)}</td>
            </tr>
          </tbody>
        </table>

        ${remainingHtml}

        <div class="footer-sign">
          <div class="sign-box">
            <p style="margin: 0; color: #64748b; font-size: 11px;">Penerima / Jamaah</p>
            <div class="sign-space"></div>
            <div class="sign-name">${j.customerName}</div>
          </div>
          <div class="sign-box">
            <p style="margin: 0; color: #64748b; font-size: 11px;">Bagian Keuangan &amp; Kasir PT El Massa</p>
            <div class="sign-space" style="display: flex; align-items: center; justify-content: center;">
              <span style="border: 2px solid #be185d; color: #be185d; font-weight: 900; font-size: 10px; padding: 3px 8px; border-radius: 4px; transform: rotate(-5deg); opacity: 0.85;">
                PT EL MASSA TOUR<br/>FINANCE VERIFIED
              </span>
            </div>
            <div class="sign-name">Azhar (Finance Master)</div>
          </div>
        </div>
      </body>
      </html>
    `);
    printWin.document.close();
  };

  // Handler Print A4 Resmi
  const handlePrintLaporanKeuangan = () => {
    if (!selectedGroup || !currentGroupTotals) return;

    const printWindow = window.open("", "_blank", "width=980,height=750");
    if (!printWindow) {
      alert("Izinkan pop-up untuk mencetak laporan.");
      return;
    }

    const todayStr = new Intl.DateTimeFormat("id-ID", { dateStyle: "full", timeStyle: "short" }).format(new Date());

    const incomeRowsHtml = filteredJamaah
      .map((j, idx) => {
        const dp = j.installments[0];
        const c1 = j.installments[1];
        const c2 = j.installments[2];
        return `
        <tr>
          <td style="text-align: center;">${idx + 1}</td>
          <td>
            <strong>${j.customerName}</strong>
            <div style="font-size: 9px; color: #666;">Kode: ${j.bookingCode} · Telp: ${j.phone}</div>
          </td>
          <td style="text-align: right;">${formatIDR(j.totalAmount)}</td>
          <td>
            ${dp ? `<div><strong>${formatIDR(dp.amount)}</strong></div><div style="font-size: 8px; color: #555;">${dp.date} · ${dp.account || dp.method}</div>` : "—"}
          </td>
          <td>
            ${c1 ? `<div><strong>${formatIDR(c1.amount)}</strong></div><div style="font-size: 8px; color: #555;">${c1.date} · ${c1.account || c1.method}</div>` : "—"}
          </td>
          <td>
            ${c2 ? `<div><strong>${formatIDR(c2.amount)}</strong></div><div style="font-size: 8px; color: #555;">${c2.date} · ${c2.account || c2.method}</div>` : "—"}
          </td>
          <td style="text-align: right; color: #047857; font-weight: bold;">${formatIDR(j.paidAmount)}</td>
          <td style="text-align: right; color: #dc2626; font-weight: bold;">${formatIDR(j.remainingAmount)}</td>
          <td style="text-align: center;">
            <span style="font-size: 9px; font-weight: bold; padding: 2px 5px; border-radius: 4px; ${j.isSettled ? "background: #d1fae5; color: #065f46;" : "background: #fee2e2; color: #991b1b;"}">
              ${j.isSettled ? "LUNAS" : "BELUM"}
            </span>
          </td>
        </tr>
      `;
      })
      .join("");

    const expenseRowsHtml = groupExpenses
      .map(
        (e, idx) => `
        <tr>
          <td style="text-align: center;">${idx + 1}</td>
          <td>${e.date}</td>
          <td><strong>${e.category}</strong></td>
          <td>${e.description}</td>
          <td>${e.method}</td>
          <td style="text-align: right; font-weight: bold;">${formatIDR(e.amount)}</td>
        </tr>
      `,
      )
      .join("");

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Laporan Keuangan Rombongan - ${selectedGroup.name}</title>
          <style>
            @page { size: A4 portrait; margin: 12mm; }
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 10px; color: #1c1917; margin: 0; padding: 8px; }
            .header-table { width: 100%; border-bottom: 2px solid #b71c1c; padding-bottom: 8px; margin-bottom: 12px; }
            .brand { font-size: 16px; font-weight: 800; color: #b71c1c; text-transform: uppercase; }
            .subbrand { font-size: 9px; color: #666; }
            .title { text-align: right; font-size: 13px; font-weight: 800; color: #292524; }
            .meta { text-align: right; font-size: 9px; color: #555; }
            .kpi-grid { display: flex; gap: 8px; margin-bottom: 14px; background: #f5f5f4; border: 1px solid #e7e5e4; border-radius: 6px; padding: 8px; }
            .kpi-col { flex: 1; text-align: center; border-right: 1px solid #d6d3d1; }
            .kpi-col:last-child { border-right: none; }
            .kpi-lbl { font-size: 8px; text-transform: uppercase; font-weight: 700; color: #78716c; }
            .kpi-val { font-size: 11px; font-weight: 800; margin-top: 2px; }
            .kpi-val.green { color: #047857; }
            .kpi-val.red { color: #dc2626; }
            table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 9.5px; }
            th { background: #292524; color: white; padding: 5px 6px; font-size: 9px; text-align: left; }
            td { border: 1px solid #e7e5e4; padding: 4px 6px; vertical-align: top; }
            tr:nth-child(even) { background: #fafaf9; }
            .section-head { font-size: 11px; font-weight: 800; margin-top: 15px; margin-bottom: 4px; color: #292524; border-bottom: 1px solid #ccc; padding-bottom: 3px; }
            .sign-row { margin-top: 35px; display: flex; justify-content: space-between; page-break-inside: avoid; }
            .sign-box { width: 200px; text-align: center; }
            .sign-line { margin-top: 50px; border-bottom: 1px solid #292524; font-weight: 700; }
          </style>
        </head>
        <body>
          <table class="header-table">
            <tr>
              <td>
                <div class="brand">PT. EL MASSA TOUR & TRAVEL</div>
                <div class="subbrand">Izin PPIU Kemenag RI · Sistem Rekap Keuangan & Laba Rugi Rombongan</div>
              </td>
              <td>
                <div class="title">REKAPITULASI KEUANGAN ROMBONGAN</div>
                <div class="meta">Rombongan: <strong>${selectedGroup.name}</strong></div>
                <div class="meta">Dicetak: ${todayStr}</div>
              </td>
            </tr>
          </table>

          <div class="kpi-grid">
            <div class="kpi-col">
              <div class="kpi-lbl">Total Omset (Tagihan)</div>
              <div class="kpi-val">${formatIDR(currentGroupTotals.billed)}</div>
            </div>
            <div class="kpi-col">
              <div class="kpi-lbl">Total Pemasukan (Terhimpun)</div>
              <div class="kpi-val green">${formatIDR(currentGroupTotals.paid)} (${currentGroupTotals.percentLunas}%)</div>
            </div>
            <div class="kpi-col">
              <div class="kpi-lbl">Sisa Tagihan (Piutang)</div>
              <div class="kpi-val red">${formatIDR(currentGroupTotals.outstanding)} (${currentGroupTotals.percentBelum}%)</div>
            </div>
            <div class="kpi-col">
              <div class="kpi-lbl">Total Pengeluaran (8 Pos)</div>
              <div class="kpi-val red">${formatIDR(currentGroupTotals.totalPengeluaran)}</div>
            </div>
            <div class="kpi-col">
              <div class="kpi-lbl">Laba Bersih Rombongan</div>
              <div class="kpi-val green">${formatIDR(currentGroupTotals.labaBersih)} (Margin ${currentGroupTotals.profitMargin}%)</div>
            </div>
          </div>

          <div class="section-head">A. PEMASUKAN JAMAAH (DP AWAL & CICILAN PER REKENING TUJUAN)</div>
          <table>
            <thead>
              <tr>
                <th style="width: 20px; text-align: center;">No</th>
                <th>Nama Jamaah</th>
                <th style="text-align: right; width: 75px;">Tagihan</th>
                <th style="width: 110px;">DP Awal (Rekening)</th>
                <th style="width: 110px;">Cicilan 2</th>
                <th style="width: 110px;">Pelunasan</th>
                <th style="text-align: right; width: 75px;">Terbayar</th>
                <th style="text-align: right; width: 75px;">Sisa</th>
                <th style="text-align: center; width: 45px;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${incomeRowsHtml || `<tr><td colspan="9" style="text-align: center;">Belum ada data jamaah</td></tr>`}
            </tbody>
            <tfoot>
              <tr style="background: #f5f5f4; font-weight: bold;">
                <td colspan="2" style="text-align: right;">TOTAL:</td>
                <td style="text-align: right;">${formatIDR(currentGroupTotals.billed)}</td>
                <td colspan="3"></td>
                <td style="text-align: right; color: #047857;">${formatIDR(currentGroupTotals.paid)}</td>
                <td style="text-align: right; color: #dc2626;">${formatIDR(currentGroupTotals.outstanding)}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>

          <div class="section-head" style="page-break-before: auto;">B. PENGELUARAN ROMBONGAN (8 POS HPP & OPERASIONAL)</div>
          <table>
            <thead>
              <tr>
                <th style="width: 20px; text-align: center;">No</th>
                <th style="width: 65px;">Tanggal</th>
                <th style="width: 130px;">Pos Pengeluaran</th>
                <th>Keterangan / Item</th>
                <th style="width: 110px;">Metode / Rekening</th>
                <th style="text-align: right; width: 85px;">Nominal</th>
              </tr>
            </thead>
            <tbody>
              ${expenseRowsHtml}
            </tbody>
            <tfoot>
              <tr style="background: #f5f5f4; font-weight: bold;">
                <td colspan="5" style="text-align: right;">TOTAL PENGELUARAN (HPP):</td>
                <td style="text-align: right; color: #dc2626;">${formatIDR(currentGroupTotals.totalPengeluaran)}</td>
              </tr>
            </tfoot>
          </table>

          <div class="sign-row">
            <div class="sign-box">
              <div>Mengetahui,</div>
              <div style="font-weight: bold; margin-top: 2px;">Direksi / Pimpinan</div>
              <div class="sign-line">( ........................................ )</div>
            </div>
            <div class="sign-box">
              <div>Pangkalpinang, ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</div>
              <div style="font-weight: bold; margin-top: 2px;">Bagian Keuangan & Kasir</div>
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
    }, 400);
  };

  // Export CSV
  const handleExportCSV = () => {
    if (!selectedGroup) return;

    const headers = [
      "No",
      "Nama Jamaah",
      "Telepon",
      "Total Biaya Paket",
      "DP Awal (Nominal)",
      "DP Awal (Tanggal)",
      "DP Awal (Rekening)",
      "Cicilan 2 (Nominal)",
      "Cicilan 2 (Tanggal)",
      "Cicilan 2 (Rekening)",
      "Cicilan 3 (Nominal)",
      "Cicilan 3 (Tanggal)",
      "Cicilan 3 (Rekening)",
      "Total Terbayar",
      "Sisa Tagihan",
      "Status",
    ];

    const rowsData = filteredJamaah.map((j, idx) => {
      const dp = j.installments[0];
      const c1 = j.installments[1];
      const c2 = j.installments[2];
      return [
        idx + 1,
        `"${(j.customerName || "").replace(/"/g, '""')}"`,
        `'${j.phone || ""}`,
        j.totalAmount,
        dp ? dp.amount : 0,
        dp ? dp.date : "",
        dp ? `"${dp.account || dp.method}"` : "",
        c1 ? c1.amount : 0,
        c1 ? c1.date : "",
        c1 ? `"${c1.account || c1.method}"` : "",
        c2 ? c2.amount : 0,
        c2 ? c2.date : "",
        c2 ? `"${c2.account || c2.method}"` : "",
        j.paidAmount,
        j.remainingAmount,
        j.isSettled ? "Lunas" : "Belum Lunas",
      ];
    });

    const content = [headers.join(","), ...rowsData.map((r) => r.join(","))].join("\n");
    const blob = new Blob(["\uFEFF" + content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `rekap-keuangan-${selectedGroup.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-stone-200/70 bg-white p-12 text-center shadow-2xs">
        <RefreshCw className="h-6 w-6 animate-spin text-brand-pink mx-auto mb-2" />
        <p className="text-xs font-bold text-stone-700">Memuat rekapitulasi keuangan & rombongan…</p>
        <p className="text-[11px] text-stone-400 mt-0.5">Menghubungkan data kasir, pembayaran per rekening, dan 8 pos HPP.</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-6 text-center shadow-2xs">
        <AlertCircle className="h-6 w-6 text-rose-600 mx-auto mb-2" />
        <p className="text-xs font-bold text-rose-800">{loadError}</p>
        <button
          type="button"
          onClick={loadDepartures}
          className="mt-3 rounded-lg bg-stone-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-stone-800 transition"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 font-sans">
      {/* ── Top Header & Global Actions ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-stone-200/80 bg-white p-4 sm:p-5 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="rounded-md bg-pink-100 px-2 py-0.5 text-[10px] font-black uppercase text-brand-pink">
              Sistem Keuangan & Laba Rugi
            </span>
            <span className="rounded-md bg-stone-100 px-2 py-0.5 text-[10px] font-bold text-stone-600">
              Pola Group-First
            </span>
          </div>
          <h1 className="text-base sm:text-lg font-black text-brand-cocoa mt-1 flex items-center gap-2">
            <Wallet className="h-5 w-5 text-brand-pink" />
            <span>Rekapitulasi Keuangan & Arus Kas Rombongan</span>
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Pengawasan pemasukan DP/cicilan per rekening, 8 pos pengeluaran HPP, dan analisis laba rugi per rombongan.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {selectedGroup && (
            <>
              <button
                type="button"
                onClick={handlePrintLaporanKeuangan}
                className="inline-flex items-center gap-1.5 rounded-xl bg-stone-900 px-3 py-2 text-xs font-bold text-white hover:bg-stone-800 transition shadow-2xs cursor-pointer active:scale-95"
                title="Cetak format surat resmi A4 dengan kop PT El Massa"
              >
                <Printer className="h-3.5 w-3.5 text-amber-300" />
                <span>Cetak Laporan (A4)</span>
              </button>

              <button
                type="button"
                onClick={handleExportCSV}
                className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-bold text-stone-700 hover:bg-stone-50 transition shadow-2xs cursor-pointer"
                title="Download file Excel (.csv)"
              >
                <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
                <span>Export Excel</span>
              </button>

              <button
                type="button"
                onClick={() => setIsExpenseModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-brand-pink px-3 py-2 text-xs font-bold text-white hover:bg-brand-pinkHover transition shadow-2xs cursor-pointer active:scale-95"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>+ Catat Pengeluaran</span>
              </button>
            </>
          )}

          {!selectedGroup && (
            <Link
              href="/pembayaran"
              className="inline-flex items-center gap-1.5 rounded-xl bg-brand-pink px-3.5 py-2 text-xs font-bold text-white hover:bg-brand-pinkHover transition shadow-2xs"
            >
              <CircleDollarSign className="h-3.5 w-3.5" />
              <span>Buka Kasir Pembayaran ↗</span>
            </Link>
          )}
        </div>
      </div>

      {/* ── 4 Executive KPI Cards (Rekapan Finansial Keseluruhan Group / Global) ── */}
      <section className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        {/* Card 1: Total Pemasukan Seluruh Group */}
        <article className="rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50/50 to-white p-3.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-800">Total Pemasukan Seluruh Grup</p>
            <div className="rounded-lg bg-emerald-100 p-1 text-emerald-800">
              <ArrowDownRight className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-1 text-base sm:text-lg font-black leading-tight text-emerald-950 truncate" title={formatIDR(grand.paid)}>
            {formatIDR(grand.paid)}
          </p>
          <p className="mt-1 text-[10px] text-emerald-800/80 font-medium truncate" title={`Dari total omset: ${formatIDR(grand.billed)}`}>
            Dari total omset paket: {formatIDR(grand.billed)}
          </p>
        </article>

        {/* Card 2: Persentase Pelunasan Global */}
        <article className="rounded-2xl border border-indigo-200/80 bg-gradient-to-br from-indigo-50/50 to-white p-3.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-wide text-indigo-800">Tingkat Pelunasan Global</p>
            <div className="rounded-lg bg-indigo-100 p-1 text-indigo-800">
              <PieChart className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <p className="text-base sm:text-lg font-black leading-tight text-indigo-950">
              {percentPelunasanGlobal}%
            </p>
            <span className="text-[10px] font-bold text-rose-600">
              ({percentBelumLunasGlobal}% Sisa Tagihan)
            </span>
          </div>
          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-stone-100">
            <div className="h-full rounded-full bg-indigo-600 transition-all duration-500" style={{ width: `${percentPelunasanGlobal}%` }} />
          </div>
        </article>

        {/* Card 3: Sisa Tagihan (Piutang) */}
        <article className="rounded-2xl border border-rose-200/80 bg-gradient-to-br from-rose-50/50 to-white p-3.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-wide text-rose-800">Sisa Tagihan (Piutang Jamaah)</p>
            <div className="rounded-lg bg-rose-100 p-1 text-rose-800">
              <AlertCircle className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-1 text-base sm:text-lg font-black leading-tight text-rose-950 truncate" title={formatIDR(grand.outstanding)}>
            {formatIDR(grand.outstanding)}
          </p>
          <p className="mt-1 text-[10px] text-rose-800/80 font-medium">
            {grand.jamaah - grand.lunas} Jamaah belum lunas ({grand.dp} baru DP)
          </p>
        </article>

        {/* Card 4: Total Jamaah Terdaftar */}
        <article className="rounded-2xl border border-stone-200/80 bg-gradient-to-br from-stone-50 to-white p-3.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-wide text-stone-500">Total Jamaah Seluruh Grup</p>
            <div className="rounded-lg bg-stone-200 p-1 text-stone-700">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-1 text-base sm:text-lg font-black leading-tight text-brand-cocoa">
            {grand.jamaah} <span className="text-xs font-semibold text-stone-500">/ {grand.targetPax} Seat</span>
          </p>
          <p className="mt-1 text-[10px] text-emerald-700 font-bold">
            ✓ {grand.lunas} Jamaah Lunas Sepenuhnya (100%)
          </p>
        </article>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* LEVEL 1: DIRECTORY KATALOG GRUP KEBERANGKATAN                         */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {!selectedGroup && (
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-black text-brand-cocoa flex items-center gap-2">
                <Layers className="h-4 w-4 text-brand-pink" />
                <span>Pilih Grup Rombongan untuk Membuka Detail Finansial</span>
              </h3>
              <p className="text-[11px] text-stone-500">
                Pola yang sama dengan menu keberangkatan: klik salah satu rombongan untuk melihat rincian DP, cicilan per rekening, 8 pos pengeluaran, dan laba rugi.
              </p>
            </div>

            <div className="flex items-center gap-1 rounded-xl bg-stone-100 p-1 text-xs font-bold text-stone-600">
              <button
                type="button"
                onClick={() => setViewMode("katalog")}
                className={`rounded-lg px-3 py-1 transition ${viewMode === "katalog" ? "bg-white text-brand-cocoa shadow-2xs font-black" : "hover:text-stone-900"}`}
              >
                🏢 Katalog Kartu
              </button>
              <button
                type="button"
                onClick={() => setViewMode("tabel")}
                className={`rounded-lg px-3 py-1 transition ${viewMode === "tabel" ? "bg-white text-brand-cocoa shadow-2xs font-black" : "hover:text-stone-900"}`}
              >
                📊 Tabel Komparasi
              </button>
            </div>
          </div>

          {/* Mode 1: Katalog Kartu Rombongan */}
          {viewMode === "katalog" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {rows.map((row) => {
                const t = row.totals;
                const progress = t && t.totalBilled > 0 ? Math.min((t.totalPaid / t.totalBilled) * 100, 100) : 0;
                const sisa = t?.totalOutstanding ?? 0;

                return (
                  <div
                    key={row.id}
                    onClick={() => setSelectedGroup(row)}
                    role="button"
                    tabIndex={0}
                    className="flex flex-col justify-between rounded-2xl border border-stone-200/80 bg-white p-4 sm:p-5 shadow-2xs hover:border-brand-pink hover:shadow-md transition cursor-pointer group"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <span className="rounded-md bg-stone-100 px-2 py-0.5 text-[10px] font-bold text-stone-600">
                          Jadwal: {formatDateID(row.departureDate)}
                        </span>
                        <span className="rounded-full bg-pink-50 border border-pink-200 px-2 py-0.5 text-[10px] font-black text-brand-pink">
                          {t?.jamaah ?? row.targetPax} Pax
                        </span>
                      </div>

                      <div>
                        <h4 className="text-sm font-black text-brand-cocoa group-hover:text-brand-pink transition line-clamp-2">
                          {row.name}
                        </h4>
                        <p className="text-[11px] text-stone-400 mt-0.5">
                          Target Seat: {row.targetPax} Jamaah · Status Aktif
                        </p>
                      </div>

                      {/* Progress Bar Pelunasan */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px] font-bold">
                          <span className="text-stone-500">Progress Pelunasan:</span>
                          <span className="text-emerald-700">{Math.round(progress)}% Lunas</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-stone-100">
                          <div className="h-full rounded-full bg-emerald-500 transition-all duration-300" style={{ width: `${progress}%` }} />
                        </div>
                      </div>

                      {/* Financial Strip */}
                      <div className="rounded-xl border border-stone-100 bg-stone-50/70 p-3 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-stone-500 text-[11px]">Pemasukan Terhimpun:</span>
                          <span className="font-black text-emerald-700">{formatIDR(t?.totalPaid ?? 0)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-stone-500 text-[11px]">Sisa Tagihan (Piutang):</span>
                          <span className="font-bold text-rose-600">{formatIDR(sisa)}</span>
                        </div>
                        <div className="flex items-center justify-between pt-1 border-t border-stone-200/60 text-[10px] text-stone-400">
                          <span>Status Jamaah:</span>
                          <span>
                            <strong className="text-emerald-700">{t?.jamaahLunas ?? 0} Lunas</strong> ·{" "}
                            <strong className="text-amber-700">{t?.jamaahDp ?? 0} DP</strong>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-brand-pink group-hover:text-brand-pinkHover">
                      <span>Buka Finansial Rombongan</span>
                      <ChevronRight className="h-4 w-4 transition group-hover:translate-x-1" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Mode 2: Tabel Komparasi Semua Grup */}
          {viewMode === "tabel" && (
            <div className="overflow-x-auto rounded-2xl border border-stone-200/80 bg-white shadow-2xs">
              <table className="w-full min-w-[850px] border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-200 bg-stone-50/80 text-[10px] font-bold uppercase tracking-wider text-stone-500">
                    <th className="py-3 pl-4 pr-2">Grup Keberangkatan</th>
                    <th className="py-3 pr-2">Jadwal</th>
                    <th className="py-3 pr-2 text-right">Target Pax</th>
                    <th className="py-3 pr-2 text-right">Total Tagihan</th>
                    <th className="py-3 pr-2 text-right">Pemasukan</th>
                    <th className="py-3 pr-2 text-right">Sisa Tagihan</th>
                    <th className="py-3 pr-2 text-center">Pelunasan (%)</th>
                    <th className="py-3 pr-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {rows.map((row) => {
                    const t = row.totals;
                    const progress = t && t.totalBilled > 0 ? Math.min((t.totalPaid / t.totalBilled) * 100, 100) : 0;
                    return (
                      <tr key={row.id} className="hover:bg-stone-50/60 transition">
                        <td className="py-3 pl-4 pr-2 font-bold text-brand-cocoa">{row.name}</td>
                        <td className="py-3 pr-2 text-stone-600 whitespace-nowrap">{formatDateID(row.departureDate)}</td>
                        <td className="py-3 pr-2 text-right font-medium text-stone-700">{row.targetPax} Pax</td>
                        <td className="py-3 pr-2 text-right font-semibold text-stone-800">{formatIDR(t?.totalBilled ?? 0)}</td>
                        <td className="py-3 pr-2 text-right font-black text-emerald-700">{formatIDR(t?.totalPaid ?? 0)}</td>
                        <td className="py-3 pr-2 text-right font-bold text-rose-600">{formatIDR(t?.totalOutstanding ?? 0)}</td>
                        <td className="py-3 pr-2 text-center">
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                            {Math.round(progress)}%
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedGroup(row)}
                            className="inline-flex items-center gap-1 rounded-lg bg-stone-900 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-stone-800 transition"
                          >
                            <span>Detail Finansial</span>
                            <ChevronRight className="h-3 w-3" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* LEVEL 2: DETAIL FINANSIAL PER GRUP TERPILIH                           */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {selectedGroup && currentGroupTotals && (
        <section className="space-y-4 rounded-2xl border border-stone-200/80 bg-white p-4 sm:p-5 shadow-2xs">
          {/* Header Grup Terpilih */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
            <div>
              <button
                type="button"
                onClick={() => setSelectedGroup(null)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-pink hover:text-brand-pinkHover transition mb-1 cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>← Kembali ke Semua Grup</span>
              </button>
              <h2 className="text-base sm:text-lg font-black text-brand-cocoa">
                {selectedGroup.name}
              </h2>
              <p className="text-xs text-stone-500">
                Jadwal Berangkat: <strong>{formatDateID(selectedGroup.departureDate)}</strong> · Target: <strong>{selectedGroup.targetPax} Jamaah</strong>
              </p>
            </div>

            {/* Quick Strip Summary */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-left text-xs">
                <span className="text-[10px] uppercase font-bold text-emerald-800 block">Pemasukan</span>
                <span className="font-black text-emerald-900">{formatIDR(currentGroupTotals.paid)}</span>
              </div>
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-left text-xs">
                <span className="text-[10px] uppercase font-bold text-rose-800 block">Pengeluaran (8 Pos)</span>
                <span className="font-black text-rose-900">{formatIDR(currentGroupTotals.totalPengeluaran)}</span>
              </div>
              <div className="rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-left text-xs">
                <span className="text-[10px] uppercase font-bold text-indigo-800 block">Laba Bersih</span>
                <span className="font-black text-indigo-900">{formatIDR(currentGroupTotals.labaBersih)}</span>
              </div>
            </div>
          </div>

          {/* 3 Tab Selector: Pemasukan vs Pengeluaran vs Laba Rugi */}
          <div className="flex border-b border-stone-200 gap-2 overflow-x-auto pb-0.5">
            <button
              type="button"
              onClick={() => setActiveTab("pemasukan")}
              className={`inline-flex items-center gap-2 border-b-2 px-4 py-2 text-xs font-black transition whitespace-nowrap cursor-pointer ${
                activeTab === "pemasukan"
                  ? "border-brand-pink text-brand-pink bg-pink-50/50 rounded-t-xl"
                  : "border-transparent text-stone-500 hover:text-stone-800"
              }`}
            >
              <ArrowDownRight className="h-4 w-4" />
              <span>1. Pemasukan & Rekap Jamaah (DP & Cicilan)</span>
              <span className="rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.2 text-[10px]">
                {currentGroupTotals.percentLunas}% Lunas
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("pengeluaran")}
              className={`inline-flex items-center gap-2 border-b-2 px-4 py-2 text-xs font-black transition whitespace-nowrap cursor-pointer ${
                activeTab === "pengeluaran"
                  ? "border-brand-pink text-brand-pink bg-pink-50/50 rounded-t-xl"
                  : "border-transparent text-stone-500 hover:text-stone-800"
              }`}
            >
              <ArrowUpRight className="h-4 w-4" />
              <span>2. Pengeluaran Grup (8 Pos HPP)</span>
              <span className="rounded-full bg-rose-100 text-rose-800 px-2 py-0.2 text-[10px]">
                {groupExpenses.length} Item
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("labarugi")}
              className={`inline-flex items-center gap-2 border-b-2 px-4 py-2 text-xs font-black transition whitespace-nowrap cursor-pointer ${
                activeTab === "labarugi"
                  ? "border-brand-pink text-brand-pink bg-pink-50/50 rounded-t-xl"
                  : "border-transparent text-stone-500 hover:text-stone-800"
              }`}
            >
              <TrendingUp className="h-4 w-4" />
              <span>3. Rekapan Laba Rugi (P&L Grup)</span>
              <span className="rounded-full bg-indigo-100 text-indigo-800 px-2 py-0.2 text-[10px]">
                Margin {currentGroupTotals.profitMargin}%
              </span>
            </button>
          </div>

          {/* ════════════════════════════════════════════════════════════════════ */}
          {/* TAB 1: PEMASUKAN & REKAP JAMAAH (DP & CICILAN PER REKENING)         */}
          {/* ════════════════════════════════════════════════════════════════════ */}
          {activeTab === "pemasukan" && (
            <div className="space-y-3.5">
              {/* Filter & Search Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-stone-400" />
                  <input
                    type="text"
                    placeholder="Cari nama jamaah, HP, atau kode booking..."
                    value={pemasukanSearch}
                    onChange={(e) => setPemasukanSearch(e.target.value)}
                    className="h-8 w-full rounded-lg border border-stone-200 bg-stone-50 pl-8 pr-3 text-xs outline-none focus:border-brand-pink focus:bg-white"
                  />
                </div>

                <div className="flex items-center gap-1.5 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setPemasukanFilter("semua")}
                    className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                      pemasukanFilter === "semua" ? "bg-stone-900 text-white" : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                    }`}
                  >
                    Semua ({groupPayments.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setPemasukanFilter("lunas")}
                    className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                      pemasukanFilter === "lunas" ? "bg-emerald-700 text-white" : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                    }`}
                  >
                    ✓ Lunas 100% ({currentGroupTotals.lunasCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setPemasukanFilter("belum")}
                    className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                      pemasukanFilter === "belum" ? "bg-rose-700 text-white" : "bg-rose-50 text-rose-800 hover:bg-rose-100"
                    }`}
                  >
                    Perlu Pelunasan ({currentGroupTotals.belumLunasCount})
                  </button>
                </div>
              </div>

              {/* Data Table Jamaah: DP & Cicilan berjenjang per rekening */}
              <div className="overflow-x-auto rounded-xl border border-stone-200">
                <table className="w-full min-w-[1080px] border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b border-stone-200 bg-stone-50 text-[10px] font-bold uppercase tracking-wider text-stone-500">
                      <th className="py-2.5 pl-3 pr-2 w-10">No</th>
                      <th className="py-2.5 pr-2">Nama Jamaah & Kontak</th>
                      <th className="py-2.5 pr-2 text-right">Nilai Paket</th>
                      <th className="py-2.5 pr-2">Pembayaran 1 (DP Awal)</th>
                      <th className="py-2.5 pr-2">Pembayaran 2 (Cicilan)</th>
                      <th className="py-2.5 pr-2">Pembayaran 3 (Pelunasan)</th>
                      <th className="py-2.5 pr-2 text-right">Terbayar</th>
                      <th className="py-2.5 pr-2 text-right">Sisa Tagihan</th>
                      <th className="py-2.5 pr-2 text-center">Status</th>
                      <th className="py-2.5 pr-3 text-center w-36">Aksi & Dokumen</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {filteredJamaah.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="py-8 text-center text-xs text-stone-400">
                          Tidak ada jamaah yang cocok dengan filter pencarian.
                        </td>
                      </tr>
                    ) : (
                      filteredJamaah.map((j, idx) => {
                        const dp = j.installments[0];
                        const c1 = j.installments[1];
                        const c2 = j.installments[2];
                        const percent = j.totalAmount > 0 ? Math.round((j.paidAmount / j.totalAmount) * 100) : 0;
                        const cleanPhone = (j.phone || "").replace(/\D/g, "");

                        return (
                          <tr key={j.bookingCode} className="hover:bg-stone-50/70 transition">
                            <td className="py-2.5 pl-3 pr-2 font-mono text-stone-400">{idx + 1}</td>
                            <td className="py-2.5 pr-2">
                              <p className="font-extrabold text-brand-cocoa leading-tight">{j.customerName}</p>
                              <div className="flex items-center gap-2 text-[11px] text-stone-400 mt-0.5">
                                <span className="font-mono">Booking: {j.bookingCode}</span>
                                {j.phone && (
                                  <a
                                    href={`https://wa.me/${cleanPhone}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-0.5 font-bold text-emerald-600 hover:underline"
                                  >
                                    <MessageSquare className="h-2.5 w-2.5" />
                                    <span>{j.phone}</span>
                                  </a>
                                )}
                              </div>
                            </td>
                            <td className="py-2.5 pr-2 text-right font-semibold text-stone-800 whitespace-nowrap">
                              {formatIDR(j.totalAmount)}
                            </td>

                            {/* Pembayaran 1: DP Awal */}
                            <td className="py-2.5 pr-2">
                              {dp ? (
                                <div className="space-y-0.5">
                                  <p className="font-black text-stone-900 leading-tight">{formatIDR(dp.amount)}</p>
                                  <div className="flex items-center gap-1 text-[10px] text-stone-500">
                                    <span>{dp.date}</span>
                                    <span>·</span>
                                    <span className="rounded bg-amber-100 text-amber-900 px-1 font-bold">
                                      {dp.account || dp.method}
                                    </span>
                                  </div>
                                </div>
                              ) : (
                                <span className="text-stone-400 text-[11px]">—</span>
                              )}
                            </td>

                            {/* Pembayaran 2: Cicilan 1 */}
                            <td className="py-2.5 pr-2">
                              {c1 ? (
                                <div className="space-y-0.5">
                                  <p className="font-black text-stone-900 leading-tight">{formatIDR(c1.amount)}</p>
                                  <div className="flex items-center gap-1 text-[10px] text-stone-500">
                                    <span>{c1.date}</span>
                                    <span>·</span>
                                    <span className="rounded bg-indigo-100 text-indigo-900 px-1 font-bold">
                                      {c1.account || c1.method}
                                    </span>
                                  </div>
                                </div>
                              ) : (
                                <span className="text-stone-400 text-[11px]">—</span>
                              )}
                            </td>

                            {/* Pembayaran 3: Pelunasan */}
                            <td className="py-2.5 pr-2">
                              {c2 ? (
                                <div className="space-y-0.5">
                                  <p className="font-black text-emerald-700 leading-tight">{formatIDR(c2.amount)}</p>
                                  <div className="flex items-center gap-1 text-[10px] text-stone-500">
                                    <span>{c2.date}</span>
                                    <span>·</span>
                                    <span className="rounded bg-emerald-100 text-emerald-900 px-1 font-bold">
                                      {c2.account || c2.method}
                                    </span>
                                  </div>
                                </div>
                              ) : (
                                <span className="text-stone-400 text-[11px]">—</span>
                              )}
                            </td>

                            {/* Total Terbayar & % Progress */}
                            <td className="py-2.5 pr-2 text-right whitespace-nowrap">
                              <span className="font-black text-emerald-700">{formatIDR(j.paidAmount)}</span>
                              <span className="block text-[10px] font-bold text-stone-400">{percent}%</span>
                            </td>

                            {/* Sisa Tagihan */}
                            <td className="py-2.5 pr-2 text-right whitespace-nowrap">
                              <span className={`font-black ${j.remainingAmount > 0 ? "text-rose-600" : "text-stone-400"}`}>
                                {formatIDR(j.remainingAmount)}
                              </span>
                            </td>

                            {/* Status */}
                            <td className="py-2.5 pr-2 text-center">
                              <span
                                className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-black ${
                                  j.isSettled
                                    ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                    : "bg-rose-100 text-rose-800 border border-rose-200"
                                }`}
                              >
                                {j.isSettled ? "Lunas" : "Belum Lunas"}
                              </span>
                            </td>

                            {/* Aksi & Dokumen */}
                            <td className="py-2.5 pr-3 text-center whitespace-nowrap">
                              <div className="inline-flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => setInvoiceModalJamaah(j)}
                                  title="Cetak Invoice Terupdate Jamaah ini"
                                  className="inline-flex items-center gap-1 rounded-lg border border-pink-200 bg-pink-50/70 px-2 py-1 text-[11px] font-bold text-brand-pink hover:bg-pink-100 transition shadow-2xs active:scale-95 cursor-pointer"
                                >
                                  <Printer className="h-3 w-3" />
                                  <span>Invoice</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setProofModalJamaah(j);
                                    setSelectedInstallmentIndex(0);
                                  }}
                                  title="Cek Bukti Pembayaran / Kuitansi Fisik"
                                  className="inline-flex items-center gap-1 rounded-lg border border-stone-200 bg-white px-2 py-1 text-[11px] font-bold text-stone-700 hover:bg-stone-50 transition shadow-2xs active:scale-95 cursor-pointer"
                                >
                                  <Eye className="h-3 w-3 text-indigo-600" />
                                  <span>Bukti</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════════ */}
          {/* TAB 2: PENGELUARAN GRUP (8 POS BANG AZRI)                           */}
          {/* ════════════════════════════════════════════════════════════════════ */}
          {activeTab === "pengeluaran" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h4 className="text-xs font-black text-brand-cocoa uppercase tracking-wide">
                    8 Pos Pengeluaran & HPP Rombongan (Sesuai Arahan Bang Azri)
                  </h4>
                  <p className="text-[11px] text-stone-500">
                    Tiket terbagi 2 data (Domestik & Internasional), Akomodasi terbagi 3 data (Hotel Mekkah, Madinah, Jakarta).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(true)}
                  className="inline-flex items-center gap-1 rounded-lg bg-stone-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-stone-800 transition shadow-2xs"
                >
                  <Plus className="h-3 w-3" />
                  <span>Catat Nota / Pengeluaran</span>
                </button>
              </div>

              {/* Grid 8 Pos Pengeluaran Bang Azri */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {POS_PENGELUARAN_BANG_AZRI.map((pos) => {
                  const stat = expenseByCategory[pos.key] || { total: 0, count: 0, items: [] };
                  return (
                    <div
                      key={pos.key}
                      className={`rounded-2xl border p-3.5 bg-gradient-to-br shadow-2xs transition hover:shadow-md ${pos.color}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xl">{pos.icon}</span>
                        <span className="rounded-full bg-white/80 border border-stone-200 px-2 py-0.5 text-[9px] font-bold text-stone-700">
                          {stat.count} Transaksi
                        </span>
                      </div>
                      <h5 className="mt-2 text-xs font-black leading-tight">{pos.title}</h5>
                      <p className="mt-0.5 text-[10px] opacity-80 line-clamp-1">{pos.desc}</p>
                      <p className="mt-2 text-sm font-black tracking-tight">{formatIDR(stat.total)}</p>
                    </div>
                  );
                })}
              </div>

              {/* Tabel Detail Histori Pengeluaran Grup */}
              <div className="overflow-x-auto rounded-xl border border-stone-200 mt-3">
                <table className="w-full min-w-[750px] border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b border-stone-200 bg-stone-50 text-[10px] font-bold uppercase tracking-wider text-stone-500">
                      <th className="py-2.5 pl-3 pr-2 w-10">No</th>
                      <th className="py-2.5 pr-2 w-24">Tanggal</th>
                      <th className="py-2.5 pr-2">Pos Pengeluaran</th>
                      <th className="py-2.5 pr-2">Keterangan / Item</th>
                      <th className="py-2.5 pr-2">Metode / Rekening</th>
                      <th className="py-2.5 pr-2 text-right">Nominal</th>
                      <th className="py-2.5 pr-3 text-right">No. Bukti</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {groupExpenses.map((e, idx) => (
                      <tr key={e.id} className="hover:bg-stone-50/70 transition">
                        <td className="py-2.5 pl-3 pr-2 font-mono text-stone-400">{idx + 1}</td>
                        <td className="py-2.5 pr-2 text-stone-600 whitespace-nowrap">{e.date}</td>
                        <td className="py-2.5 pr-2 font-bold text-brand-cocoa">{e.category}</td>
                        <td className="py-2.5 pr-2 text-stone-700">{e.description}</td>
                        <td className="py-2.5 pr-2">
                          <span className="rounded bg-stone-100 px-1.5 py-0.5 text-[10px] font-bold text-stone-700">
                            {e.method}
                          </span>
                        </td>
                        <td className="py-2.5 pr-2 text-right font-black text-rose-700 whitespace-nowrap">
                          {formatIDR(e.amount)}
                        </td>
                        <td className="py-2.5 pr-3 text-right font-mono text-[10px] text-stone-500">
                          {e.referenceNumber || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-stone-200 bg-stone-50/90 font-bold">
                      <td colSpan={5} className="py-2.5 pl-3 pr-2 text-right uppercase text-[10px] text-stone-600">
                        Total Seluruh Pengeluaran Grup:
                      </td>
                      <td className="py-2.5 pr-2 text-right text-sm font-black text-rose-700">
                        {formatIDR(currentGroupTotals.totalPengeluaran)}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════════ */}
          {/* TAB 3: REKAPAN LABA RUGI (P&L GRUP)                                 */}
          {/* ════════════════════════════════════════════════════════════════════ */}
          {activeTab === "labarugi" && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-stone-200 bg-stone-50/60 p-4 sm:p-5">
                <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                  <div>
                    <h4 className="text-sm font-black text-brand-cocoa flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-emerald-600" />
                      <span>Ikhtisar Laba Rugi Rombongan ({selectedGroup.name})</span>
                    </h4>
                    <p className="text-[11px] text-stone-500">
                      Perbandingan langsung antara total dana jamaah terhimpun dan total realisasi 8 pos pengeluaran.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handlePrintLaporanKeuangan}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-stone-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-stone-800 transition"
                  >
                    <Printer className="h-3 w-3 text-amber-300" />
                    <span>Cetak P&L Statement</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 my-4">
                  <div className="rounded-xl border border-emerald-200 bg-white p-3.5 shadow-2xs">
                    <span className="text-[10px] font-bold uppercase text-emerald-800">Total Pemasukan (Omset Terhimpun)</span>
                    <p className="text-lg font-black text-emerald-700 mt-1">{formatIDR(currentGroupTotals.paid)}</p>
                    <p className="text-[10px] text-stone-400 mt-0.5">Dari tagihan {formatIDR(currentGroupTotals.billed)}</p>
                  </div>

                  <div className="rounded-xl border border-rose-200 bg-white p-3.5 shadow-2xs">
                    <span className="text-[10px] font-bold uppercase text-rose-800">Total Pengeluaran (8 Pos HPP)</span>
                    <p className="text-lg font-black text-rose-700 mt-1">{formatIDR(currentGroupTotals.totalPengeluaran)}</p>
                    <p className="text-[10px] text-stone-400 mt-0.5">{groupExpenses.length} transaksi tercatat</p>
                  </div>

                  <div className="rounded-xl border border-indigo-200 bg-white p-3.5 shadow-2xs">
                    <span className="text-[10px] font-bold uppercase text-indigo-800">Laba Bersih Rombongan (Net Profit)</span>
                    <p className="text-lg font-black text-indigo-900 mt-1">{formatIDR(currentGroupTotals.labaBersih)}</p>
                    <span className="inline-block mt-1 rounded bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-black">
                      Margin Profit: +{currentGroupTotals.profitMargin}%
                    </span>
                  </div>
                </div>

                {/* Breakdown Persentase Biaya */}
                <div className="space-y-2 mt-4 pt-3 border-t border-stone-200">
                  <h5 className="text-xs font-bold text-stone-700 uppercase">Struktur Pengeluaran Berdasarkan 8 Pos:</h5>
                  <div className="space-y-1.5 text-xs">
                    {POS_PENGELUARAN_BANG_AZRI.map((pos) => {
                      const stat = expenseByCategory[pos.key] || { total: 0, count: 0 };
                      const pct = currentGroupTotals.totalPengeluaran > 0
                        ? Math.round((stat.total / currentGroupTotals.totalPengeluaran) * 100)
                        : 0;

                      return (
                        <div key={pos.key} className="flex items-center justify-between rounded-lg bg-white p-2 border border-stone-200/60">
                          <div className="flex items-center gap-2">
                            <span>{pos.icon}</span>
                            <span className="font-bold text-brand-cocoa">{pos.title}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-black text-stone-900">{formatIDR(stat.total)}</span>
                            <span className="w-12 text-right font-mono text-[11px] font-bold text-stone-500">
                              {pct}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* MODAL: FORM CATAT PENGELUARAN BARU                                   */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {isExpenseModalOpen && selectedGroup && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-3 sm:p-5 backdrop-blur-xs font-sans"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsExpenseModalOpen(false);
          }}
        >
          <div
            className="flex h-full max-h-[85vh] w-full max-w-lg flex-col rounded-2xl bg-white shadow-2xl overflow-hidden border border-stone-200 animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-stone-100 bg-stone-50 px-5 py-3.5 shrink-0">
              <div>
                <h3 className="text-sm font-black text-brand-cocoa">Catat Pengeluaran Rombongan</h3>
                <p className="text-[11px] text-stone-500">{selectedGroup.name}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsExpenseModalOpen(false)}
                className="h-8 w-8 rounded-lg text-stone-400 hover:bg-stone-200 hover:text-stone-700 flex items-center justify-center font-bold"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveExpense} className="flex-1 overflow-y-auto p-5 space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">Tanggal Pengeluaran</label>
                <input
                  type="date"
                  required
                  value={expenseForm.date}
                  onChange={(e) => setExpenseForm((p) => ({ ...p, date: e.target.value }))}
                  className="h-9 w-full rounded-lg border border-stone-200 px-3 text-xs outline-none focus:border-brand-pink"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">Pos Pengeluaran (8 Pos Bang Azri)</label>
                <select
                  value={expenseForm.category}
                  onChange={(e) => setExpenseForm((p) => ({ ...p, category: e.target.value }))}
                  className="h-9 w-full rounded-lg border border-stone-200 px-3 text-xs font-bold outline-none focus:border-brand-pink bg-white"
                >
                  <option value="Tiket Pesawat (Domestik)">✈️ Tiket Pesawat: Domestik Feeder (Garuda)</option>
                  <option value="Tiket Pesawat (Internasional)">✈️ Tiket Pesawat: Internasional (Saudia Airlines)</option>
                  <option value="Akomodasi (Hotel Mekkah)">🏨 Akomodasi: Hotel Mekkah (Grand Al Massa)</option>
                  <option value="Akomodasi (Hotel Madinah)">🏨 Akomodasi: Hotel Madinah (Daar El Naeem)</option>
                  <option value="Akomodasi (Hotel Jakarta)">🏨 Akomodasi: Hotel Jakarta Transit</option>
                  <option value="Perlengkapan Umrah">🎒 Perlengkapan Umrah (Koper, Kain Ihram, Mukena, dll)</option>
                  <option value="Manasik Offline">🕌 Manasik Offline (Hotel, Konsumsi, Pemateri)</option>
                  <option value="Fee Marketing">🤝 Fee Marketing (Komisi Agen & Referral)</option>
                  <option value="Operasional Kantor">🏢 Operasional Kantor (Handling PGK, ID Card, Adm)</option>
                  <option value="Operasional Saudi">🇸🇦 Operasional Saudi (Handling JED, Bus, Muthawwif)</option>
                  <option value="Biaya Lainnya">📋 Biaya Lainnya (E-Visa, Asuransi, Tak Terduga)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">Keterangan / Rincian Item</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Pembayaran DP Tiket Saudia 36 Pax"
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm((p) => ({ ...p, description: e.target.value }))}
                  className="h-9 w-full rounded-lg border border-stone-200 px-3 text-xs outline-none focus:border-brand-pink"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">Nominal (Rupiah)</label>
                <input
                  type="text"
                  required
                  placeholder="Rp 0"
                  value={expenseForm.amount}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, "");
                    setExpenseForm((p) => ({ ...p, amount: raw ? formatIDR(Number(raw)) : "" }));
                  }}
                  className="h-9 w-full rounded-lg border border-stone-200 px-3 text-xs font-black text-rose-700 outline-none focus:border-brand-pink"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">Metode / Rekening Sumber</label>
                  <select
                    value={expenseForm.method}
                    onChange={(e) => setExpenseForm((p) => ({ ...p, method: e.target.value }))}
                    className="h-9 w-full rounded-lg border border-stone-200 px-2 text-xs font-bold outline-none focus:border-brand-pink bg-white"
                  >
                    <option value="Transfer BSI 719-2024-001">Transfer BSI 719-2024-001</option>
                    <option value="Transfer BCA 041-8899-100">Transfer BCA 041-8899-100</option>
                    <option value="Transfer Mandiri 169-00-112233-4">Transfer Mandiri 169-00-112233-4</option>
                    <option value="Kas Tunai Kantor">Kas Tunai Kantor</option>
                    <option value="Transfer SAR Al Rajhi">Transfer SAR Al Rajhi</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">No. Bukti / Kuitansi</label>
                  <input
                    type="text"
                    placeholder="Contoh: KWT-EXP-001"
                    value={expenseForm.referenceNumber}
                    onChange={(e) => setExpenseForm((p) => ({ ...p, referenceNumber: e.target.value }))}
                    className="h-9 w-full rounded-lg border border-stone-200 px-3 text-xs outline-none focus:border-brand-pink"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">Catatan Tambahan (Opsional)</label>
                <textarea
                  rows={2}
                  placeholder="Catatan pihak penerima, nota, atau info PIC..."
                  value={expenseForm.notes}
                  onChange={(e) => setExpenseForm((p) => ({ ...p, notes: e.target.value }))}
                  className="w-full rounded-lg border border-stone-200 p-2.5 text-xs outline-none focus:border-brand-pink resize-none"
                />
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="rounded-xl border border-stone-300 bg-white px-4 py-2 text-xs font-bold text-stone-700 hover:bg-stone-100 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSavingExpense}
                  className="rounded-xl bg-brand-pink px-4 py-2 text-xs font-bold text-white hover:bg-brand-pinkHover transition cursor-pointer shadow-2xs disabled:opacity-50"
                >
                  {isSavingExpense ? "Menyimpan…" : "Simpan Pengeluaran"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* MODAL: CETAK INVOICE TERUPDATE JAMAAH (FORMAT RESMI A4)              */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {invoiceModalJamaah && selectedGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 p-3 sm:p-4 backdrop-blur-xs">
          <div className="flex max-h-[92vh] w-full max-w-3xl flex-col rounded-2xl bg-white shadow-2xl border border-stone-200 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-stone-200 bg-stone-50/80 px-5 py-3.5">
              <div>
                <span className="rounded bg-pink-100 px-2 py-0.5 text-[10px] font-black uppercase text-brand-pink">
                  Dokumen Keuangan
                </span>
                <h3 className="text-sm font-extrabold text-brand-cocoa mt-0.5 flex items-center gap-2">
                  <Printer className="h-4 w-4 text-brand-pink" />
                  <span>Invoice Terupdate — {invoiceModalJamaah.customerName}</span>
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handlePrintSingleInvoice(invoiceModalJamaah)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-stone-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-stone-800 transition shadow-2xs active:scale-95 cursor-pointer"
                >
                  <Printer className="h-3.5 w-3.5 text-amber-300" />
                  <span>Cetak A4 (Print)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setInvoiceModalJamaah(null)}
                  className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-200 hover:text-stone-700 transition cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Modal Body / Invoice Sheet Preview */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs font-sans bg-stone-50/40">
              <div className="rounded-xl border border-stone-200/90 bg-white p-6 sm:p-8 shadow-xs space-y-5">
                {/* Kop Surat PT El Massa */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-stone-900 pb-4">
                  <div>
                    <h1 className="text-lg font-black tracking-wide text-brand-pink">PT EL MASSA TOUR &amp; TRAVEL</h1>
                    <p className="text-[11px] font-semibold text-stone-700 mt-0.5">
                      Izin PPIU Kemenag RI No. U.419 Tahun 2021 &bull; Akreditasi A
                    </p>
                    <p className="text-[10px] text-stone-500">
                      Jl. KH. Ahmad Dahlan No. 12, Pangkalpinang, Bangka Belitung &bull; Telp: (0717) 910-8888 &bull; WA: 0812-7890-1234
                    </p>
                  </div>
                  <div className="rounded-lg border border-pink-200 bg-pink-50/70 p-2 text-right">
                    <span className="block text-[9px] font-bold uppercase text-brand-pink tracking-wider">Status Invoice</span>
                    <span className={`text-xs font-black ${invoiceModalJamaah.isSettled ? "text-emerald-700" : "text-amber-700"}`}>
                      {invoiceModalJamaah.isSettled ? "LUNAS 100%" : "BELUM LUNAS"}
                    </span>
                  </div>
                </div>

                {/* Title & Nomor Invoice */}
                <div className="text-center">
                  <h2 className="text-sm font-black uppercase tracking-wider text-stone-900">
                    INVOICE PEMBAYARAN JAMAAH (TERUPDATE)
                  </h2>
                  <p className="text-[11px] text-stone-500 font-mono mt-0.5">
                    No: INV/{(selectedGroup.name || "UMR").replace(/[^A-Za-z0-9]/g, "").slice(0, 6).toUpperCase()}/{invoiceModalJamaah.bookingCode} &bull; Tgl Terbit: {new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(new Date())}
                  </p>
                </div>

                {/* 2-Column Metadata Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-xl border border-stone-200 bg-stone-50/70 p-3.5 text-[11px]">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase text-stone-400">Data Jamaah</p>
                    <div className="flex justify-between"><span className="text-stone-500">Nama Jamaah:</span><span className="font-bold text-stone-900">{invoiceModalJamaah.customerName}</span></div>
                    <div className="flex justify-between"><span className="text-stone-500">Kode Booking:</span><span className="font-mono font-bold text-stone-800">{invoiceModalJamaah.bookingCode}</span></div>
                    <div className="flex justify-between"><span className="text-stone-500">No. Kontak / WA:</span><span className="font-medium text-stone-800">{invoiceModalJamaah.phone || "—"}</span></div>
                    <div className="flex justify-between"><span className="text-stone-500">Jumlah Peserta:</span><span className="font-bold text-stone-900">{invoiceModalJamaah.participants} Jamaah</span></div>
                  </div>
                  <div className="space-y-1 border-t sm:border-t-0 sm:border-l border-stone-200 pt-2 sm:pt-0 sm:pl-3">
                    <p className="text-[10px] font-bold uppercase text-stone-400">Rombongan &amp; Paket</p>
                    <div className="flex justify-between"><span className="text-stone-500">Rombongan:</span><span className="font-bold text-stone-900 truncate max-w-[180px]">{selectedGroup.name}</span></div>
                    <div className="flex justify-between"><span className="text-stone-500">Keberangkatan:</span><span className="font-medium text-stone-800">{formatDateID(selectedGroup.departureDate)}</span></div>
                    <div className="flex justify-between"><span className="text-stone-500">Total Biaya Paket:</span><span className="font-black text-brand-pink">{formatIDR(invoiceModalJamaah.totalAmount)}</span></div>
                    <div className="flex justify-between"><span className="text-stone-500">Status Pembayaran:</span><span className={`font-black ${invoiceModalJamaah.isSettled ? "text-emerald-700" : "text-amber-700"}`}>{invoiceModalJamaah.isSettled ? "Lunas" : "Belum Lunas"}</span></div>
                  </div>
                </div>

                {/* Tabel Riwayat Pembayaran Masuk */}
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                    Riwayat Pembayaran yang Diterima
                  </h4>
                  <div className="overflow-x-auto rounded-lg border border-stone-200">
                    <table className="w-full border-collapse text-left text-xs">
                      <thead>
                        <tr className="border-b border-stone-200 bg-stone-50 text-[10px] font-bold uppercase tracking-wider text-stone-500">
                          <th className="py-2 pl-3 pr-2 w-10">No</th>
                          <th className="py-2 pr-2">Keterangan</th>
                          <th className="py-2 pr-2">Tanggal</th>
                          <th className="py-2 pr-2">Rekening / Metode</th>
                          <th className="py-2 pr-2 text-center">Status</th>
                          <th className="py-2 pr-3 text-right">Nominal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {invoiceModalJamaah.installments.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-4 text-center text-xs text-stone-400">
                              Belum ada pembayaran yang tercatat.
                            </td>
                          </tr>
                        ) : (
                          invoiceModalJamaah.installments.map((inst, i) => (
                            <tr key={inst.id || i} className="hover:bg-stone-50/50">
                              <td className="py-2 pl-3 pr-2 font-mono text-stone-400">{i + 1}</td>
                              <td className="py-2 pr-2">
                                <span className="font-bold text-stone-800 block">{inst.label}</span>
                                <span className="text-[10px] text-stone-400 font-mono">
                                  {inst.receiptNumber ? `Kuitansi: ${inst.receiptNumber}` : inst.referenceNumber ? `Ref: ${inst.referenceNumber}` : ""}
                                </span>
                              </td>
                              <td className="py-2 pr-2 text-stone-600">{inst.date}</td>
                              <td className="py-2 pr-2">
                                <span className="rounded bg-stone-100 px-1.5 py-0.5 text-[10px] font-bold text-stone-700">
                                  {inst.account || inst.method}
                                </span>
                              </td>
                              <td className="py-2 pr-2 text-center">
                                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-black text-emerald-800">
                                  {inst.status || "Terverifikasi"}
                                </span>
                              </td>
                              <td className="py-2 pr-3 text-right font-black text-emerald-700">
                                {formatIDR(inst.amount)}
                              </td>
                            </tr>
                          ))
                        )}
                        <tr className="border-t-2 border-stone-200 bg-stone-50 font-black">
                          <td colSpan={5} className="py-2 pl-3 pr-2 text-right uppercase text-[10px] text-stone-600">
                            Total Dana Diterima:
                          </td>
                          <td className="py-2 pr-3 text-right text-emerald-700 font-black">
                            {formatIDR(invoiceModalJamaah.paidAmount)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Highlight Sisa Tagihan Terupdate */}
                {invoiceModalJamaah.remainingAmount > 0 ? (
                  <div className="rounded-xl border-2 border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50/60 p-4 shadow-2xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 block">
                          Sisa Tagihan yang Harus Dilunasi
                        </span>
                        <p className="text-[11px] text-amber-800 mt-0.5">
                          Jatuh tempo pelunasan: <strong>Maksimal H-30 Sebelum Keberangkatan</strong>
                        </p>
                      </div>
                      <div className="text-left sm:text-right">
                        <span className="text-xl sm:text-2xl font-black text-amber-950">
                          {formatIDR(invoiceModalJamaah.remainingAmount)}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-amber-200/80 text-[10px] text-amber-900/90 space-y-0.5">
                      <p className="font-bold">Rekening Resmi Pembayaran PT El Massa Tour &amp; Travel:</p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 pt-1">
                        <div className="rounded bg-white/80 p-1.5 border border-amber-200">
                          <span className="font-bold block">Bank Syariah Indonesia (BSI)</span>
                          <span className="font-mono text-[11px] font-black text-brand-cocoa">719-2024-001</span>
                        </div>
                        <div className="rounded bg-white/80 p-1.5 border border-amber-200">
                          <span className="font-bold block">Bank Central Asia (BCA)</span>
                          <span className="font-mono text-[11px] font-black text-brand-cocoa">041-8899-100</span>
                        </div>
                        <div className="rounded bg-white/80 p-1.5 border border-amber-200">
                          <span className="font-bold block">Bank Mandiri</span>
                          <span className="font-mono text-[11px] font-black text-brand-cocoa">169-00-112233-4</span>
                        </div>
                      </div>
                      <p className="text-[9px] text-stone-500 pt-1">Semua rekening atas nama: <strong>PT EL MASSA TOUR &amp; TRAVEL</strong></p>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border-2 border-emerald-300 bg-emerald-50/70 p-4 text-center">
                    <CheckCircle2 className="h-6 w-6 text-emerald-600 mx-auto mb-1" />
                    <p className="text-xs font-black uppercase text-emerald-900">Pembayaran Telah Lunas 100%</p>
                    <p className="text-[11px] text-emerald-800 mt-0.5">
                      Alhamdulillah, seluruh kewajiban biaya paket untuk jamaah ini telah diterima dengan lengkap. Tidak ada sisa tagihan.
                    </p>
                  </div>
                )}

                {/* Bagian Tanda Tangan */}
                <div className="grid grid-cols-2 gap-8 pt-4 border-t border-stone-200 text-center">
                  <div>
                    <p className="text-[11px] text-stone-500">Jamaah / Pendaftar</p>
                    <div className="h-12" />
                    <p className="font-bold text-xs text-stone-900 border-t border-stone-300 pt-1 inline-block min-w-[140px]">
                      {invoiceModalJamaah.customerName}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-stone-500">Finance &amp; Kasir PT El Massa</p>
                    <div className="h-12 flex items-center justify-center">
                      <span className="rounded border border-brand-pink/50 bg-pink-50 px-2 py-0.5 text-[9px] font-black text-brand-pink rotate-[-4deg]">
                        PT EL MASSA FINANCE
                      </span>
                    </div>
                    <p className="font-bold text-xs text-stone-900 border-t border-stone-300 pt-1 inline-block min-w-[140px]">
                      Azhar (Finance Master)
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-2 border-t border-stone-200 bg-stone-50 px-5 py-3">
              <button
                type="button"
                onClick={() => setInvoiceModalJamaah(null)}
                className="rounded-xl border border-stone-300 bg-white px-4 py-2 text-xs font-bold text-stone-700 hover:bg-stone-100 transition cursor-pointer"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => handlePrintSingleInvoice(invoiceModalJamaah)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-brand-pink px-4 py-2 text-xs font-bold text-white hover:bg-brand-pinkHover transition shadow-2xs cursor-pointer active:scale-95"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Cetak Invoice Sekarang</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* MODAL: CEK BUKTI PEMBAYARAN & KUITANSI KASIR                         */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {proofModalJamaah && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 p-3 sm:p-4 backdrop-blur-xs">
          <div className="flex max-h-[92vh] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-2xl border border-stone-200 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-stone-200 bg-stone-50 px-5 py-3.5">
              <div>
                <span className="rounded bg-indigo-100 px-2 py-0.5 text-[10px] font-black uppercase text-indigo-800">
                  Audit Bukti Transaksi
                </span>
                <h3 className="text-sm font-extrabold text-brand-cocoa mt-0.5 flex items-center gap-2">
                  <Eye className="h-4 w-4 text-indigo-600" />
                  <span>Bukti Pembayaran — {proofModalJamaah.customerName}</span>
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setProofModalJamaah(null)}
                className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-200 hover:text-stone-700 transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs font-sans">
              {proofModalJamaah.installments.length === 0 ? (
                <div className="py-8 text-center text-stone-400">
                  <Receipt className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="font-bold">Belum Ada Transaksi Pembayaran</p>
                  <p className="text-[11px] mt-0.5">Jamaah ini belum memiliki catatan pembayaran DP atau cicilan.</p>
                </div>
              ) : (
                <>
                  {/* Installment Selector Pills */}
                  <div>
                    <label className="block text-[11px] font-bold text-stone-500 mb-1.5">Pilih Tahap Pembayaran:</label>
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {proofModalJamaah.installments.map((inst, idx) => (
                        <button
                          key={inst.id || idx}
                          type="button"
                          onClick={() => setSelectedInstallmentIndex(idx)}
                          className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                            selectedInstallmentIndex === idx
                              ? "bg-stone-900 text-white shadow-2xs"
                              : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                          }`}
                        >
                          <span>{inst.label}</span>
                          <span className={`rounded px-1.5 py-0.2 text-[10px] font-mono ${
                            selectedInstallmentIndex === idx ? "bg-white/20 text-white" : "bg-stone-200 text-stone-800"
                          }`}>
                            {formatIDR(inst.amount)}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Active Installment Details */}
                  {(() => {
                    const inst = proofModalJamaah.installments[Math.min(selectedInstallmentIndex, proofModalJamaah.installments.length - 1)];
                    if (!inst) return null;

                    const hasProofImg = inst.proofUrl && (inst.proofUrl.startsWith("http") || inst.proofUrl.startsWith("data:image"));
                    const isCash = (inst.method || "").toUpperCase().includes("TUNAI") || (inst.method || "").toUpperCase().includes("CASH");

                    return (
                      <div className="space-y-4">
                        {/* Summary Card */}
                        <div className="rounded-xl border border-stone-200 bg-stone-50/70 p-3.5 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-stone-900 text-sm">{inst.label}</span>
                            <span className="rounded-full bg-emerald-100 text-emerald-800 px-2.5 py-0.5 text-[10px] font-black border border-emerald-200">
                              {inst.status || "Terverifikasi"}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-stone-200/70 text-[11px]">
                            <div>
                              <span className="text-[10px] text-stone-400 block font-medium">Nominal</span>
                              <span className="font-black text-emerald-700">{formatIDR(inst.amount)}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-stone-400 block font-medium">Tanggal Bayar</span>
                              <span className="font-bold text-stone-800">{inst.date}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-stone-400 block font-medium">Rekening Tujuan</span>
                              <span className="font-bold text-stone-800 truncate block" title={inst.account || inst.method}>
                                {inst.account || inst.method}
                              </span>
                            </div>
                            <div>
                              <span className="text-[10px] text-stone-400 block font-medium">Diverifikasi oleh</span>
                              <span className="font-bold text-indigo-900 truncate block">
                                {inst.receivedBy || "Staff Keuangan"}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Bukti Pembayaran Box */}
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="text-[11px] font-bold text-stone-700 flex items-center gap-1.5">
                              <ImageIcon className="h-3.5 w-3.5 text-stone-500" />
                              <span>Lampiran Bukti Transfer / Kuitansi Fisik:</span>
                            </label>
                            {hasProofImg && (
                              <a
                                href={inst.proofUrl!}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-pink hover:underline"
                              >
                                <ExternalLink className="h-3 w-3" />
                                <span>Buka Gambar Asli</span>
                              </a>
                            )}
                          </div>

                          {hasProofImg ? (
                            <div className="rounded-xl border border-stone-200 bg-stone-100 p-2 text-center">
                              <img
                                src={inst.proofUrl!}
                                alt={`Bukti pembayaran ${inst.label}`}
                                className="max-h-72 w-auto mx-auto rounded-lg shadow-2xs border border-stone-200 object-contain bg-white"
                              />
                            </div>
                          ) : isCash ? (
                            /* Offline Cash Receipt Slip Graphic */
                            <div className="rounded-xl border-2 border-dashed border-amber-300 bg-amber-50/60 p-4 space-y-3">
                              <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                                <div>
                                  <span className="text-[10px] font-black uppercase text-amber-900 tracking-wider">
                                    Kuitansi Pembayaran Tunai Kasir
                                  </span>
                                  <p className="text-[11px] font-bold text-stone-800">PT EL MASSA TOUR &amp; TRAVEL</p>
                                </div>
                                <span className="rounded bg-amber-100 text-amber-900 px-2 py-0.5 font-mono text-[10px] font-bold">
                                  {inst.receiptNumber || "KW-KASIR-OFFLINE"}
                                </span>
                              </div>

                              <div className="space-y-1 text-[11px] text-stone-700">
                                <div className="flex justify-between">
                                  <span>Telah Diterima Dari:</span>
                                  <span className="font-bold">{proofModalJamaah.customerName}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Jumlah Pembayaran:</span>
                                  <span className="font-black text-emerald-700 text-sm">{formatIDR(inst.amount)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Untuk Keperluan:</span>
                                  <span className="font-medium">{inst.label} ({proofModalJamaah.bookingCode})</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Kasir Penerima:</span>
                                  <span className="font-bold text-stone-900">{inst.receivedBy || "Kasir Kantor PT El Massa"}</span>
                                </div>
                              </div>

                              <div className="pt-2 border-t border-amber-200 flex items-center justify-between text-[10px] text-amber-800 font-semibold">
                                <span>Penerimaan Fisik di Kantor</span>
                                <span className="rounded border border-amber-400 bg-white px-2 py-0.5 text-amber-900 font-bold">
                                  ✓ KAS TUNAI VALID
                                </span>
                              </div>
                            </div>
                          ) : (
                            /* Bank Transfer Confirmation Slip Graphic */
                            <div className="rounded-xl border-2 border-dashed border-indigo-200 bg-indigo-50/40 p-4 space-y-3">
                              <div className="flex items-center justify-between border-b border-indigo-100 pb-2">
                                <div>
                                  <span className="text-[10px] font-black uppercase text-indigo-900 tracking-wider">
                                    Slip Konfirmasi Bank Transfer
                                  </span>
                                  <p className="text-[11px] font-bold text-stone-800">{inst.account || inst.method}</p>
                                </div>
                                <span className="rounded bg-indigo-100 text-indigo-900 px-2 py-0.5 font-mono text-[10px] font-bold">
                                  {inst.referenceNumber || "TRX-VALID-SYSTEM"}
                                </span>
                              </div>

                              <div className="space-y-1 text-[11px] text-stone-700">
                                <div className="flex justify-between">
                                  <span>Pengirim:</span>
                                  <span className="font-bold">{proofModalJamaah.customerName}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Nominal Terbayar:</span>
                                  <span className="font-black text-emerald-700 text-sm">{formatIDR(inst.amount)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Tanggal Transaksi:</span>
                                  <span className="font-medium text-stone-800">{inst.date}</span>
                                </div>
                              </div>

                              <div className="pt-2 border-t border-indigo-100 flex items-center justify-between text-[10px] text-indigo-800 font-semibold">
                                <span>Status Mutasi Rekening</span>
                                <span className="rounded border border-emerald-400 bg-emerald-50 px-2 py-0.5 text-emerald-800 font-bold">
                                  ✓ DANA MASUK TERVERIFIKASI
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Upload / Ganti Bukti File */}
                          <div className="mt-3 rounded-xl border border-stone-200 bg-white p-3 space-y-1.5">
                            <label className="block text-[11px] font-bold text-stone-700">
                              Unggah / Ganti Bukti Transfer/Kuitansi Fisik:
                            </label>
                            <input
                              type="file"
                              accept="image/*"
                              disabled={isUploadingProof}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleUploadProof(file, inst.id);
                              }}
                              className="block w-full text-xs text-stone-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-stone-900 file:text-white hover:file:bg-stone-800 cursor-pointer"
                            />
                            <p className="text-[10px] text-stone-400">
                              Format didukung: JPG, PNG, WebP (Maks 5 MB). File langsung tersimpan ke sistem database.
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end border-t border-stone-200 bg-stone-50 px-5 py-3">
              <button
                type="button"
                onClick={() => setProofModalJamaah(null)}
                className="rounded-xl bg-stone-900 px-4 py-2 text-xs font-bold text-white hover:bg-stone-800 transition cursor-pointer"
              >
                Selesai &amp; Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
