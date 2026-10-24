"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  Award,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Compass,
  Copy,
  CreditCard,
  ExternalLink,
  Handshake,
  HelpCircle,
  Layers,
  Loader2,
  LogOut,
  MapPin,
  MessageCircle,
  Phone,
  Plane,
  Plus,
  RefreshCw,
  Search,
  Share2,
  Sparkles,
  Tag,
  Trash2,
  User,
  UserCheck,
  UserPlus,
  Users,
  Wallet,
  X,
} from "lucide-react";

// --- TYPES ---
type AgentProfile = {
  id: string;
  agentCode: string;
  name: string;
  phone: string;
  email: string;
  city: string;
  address: string;
  commissionType: string;
  commissionValue: number;
  bankName: string;
  bankAccount: string;
};

type PackageItem = {
  id: string;
  name: string;
  category: string;
  duration: string;
  departuresDate: string;
  departureDate: string;
  returnDate: string;
  price: string;
  numericPrice: string;
  dpMinimum: string;
  makkahHotel: string;
  madinahHotel: string;
  airline: string;
  flightRoute: string;
  targetPax: number;
  bookedPax: number;
  availableSeats: number;
};

type JamaahMember = {
  id: string;
  name: string;
  passport: string;
  documentStatus: string;
};

type BookingItem = {
  code: string;
  customerName: string;
  phone: string;
  nik: string;
  packageId: string;
  packageName: string;
  departure: string;
  roomType: string;
  participants: number;
  participantsCount: number;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: string;
  umrahMeStatus: string;
  createdAt: string;
  agentCode: string;
  jamaahList: JamaahMember[];
};

type DashboardStats = {
  totalBookings: number;
  totalJamaah: number;
  totalGross: number;
  totalPaid: number;
  estimatedCommission: number;
  umrahMeActiveCount: number;
};

type NewJamaahEntry = {
  id: string;
  name: string;
  nik: string;
  passport: string;
  phone: string;
  gender: "L" | "P";
  roomType: string;
};

function formatIDR(val: number) {
  return `Rp ${Math.round(Number(val) || 0).toLocaleString("id-ID")}`;
}

const STORAGE_KEY = "my_elmassa_agent_session";

export default function MyElMassaPage() {
  // --- AUTH STATE ---
  const [agent, setAgent] = useState<AgentProfile | null>(null);
  const [identifierInput, setIdentifierInput] = useState("");
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [authError, setAuthError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // --- DASHBOARD DATA ---
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"bookings" | "packages" | "commission">("bookings");

  // --- SEARCH & FILTER ---
  const [bookingSearch, setBookingSearch] = useState("");
  const [bookingFilter, setBookingFilter] = useState<"all" | "unpaid" | "dp" | "paid">("all");
  const [expandedBookingCode, setExpandedBookingCode] = useState<string | null>(null);

  // --- REGISTRATION MODAL ---
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registerError, setRegisterError] = useState("");
  const [selectedPackageId, setSelectedPackageId] = useState("");
  const [defaultRoomType, setDefaultRoomType] = useState("Quad (4 Orang)");
  const [picName, setPicName] = useState("");
  const [picPhone, setPicPhone] = useState("");
  const [picCity, setPicCity] = useState("");
  const [notes, setNotes] = useState("");
  const [jamaahList, setJamaahList] = useState<NewJamaahEntry[]>([
    {
      id: "1",
      name: "",
      nik: "",
      passport: "",
      phone: "",
      gender: "L",
      roomType: "Quad (4 Orang)",
    },
  ]);

  // --- SUCCESS REGISTRATION MODAL ---
  const [successData, setSuccessData] = useState<{
    bookingCode: string;
    packageName: string;
    paxCount: number;
    totalAmount: number;
    commissionEstimate: number;
    message: string;
  } | null>(null);

  const [copiedText, setCopiedText] = useState("");

  // --- 1. INITIAL SESSION CHECK ---
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.agentCode) {
          fetchAgentSession(parsed.agentCode);
          return;
        }
      }
    } catch {
      // ignore
    }
    setIsAuthLoading(false);
  }, []);

  const fetchAgentSession = async (agentCode: string) => {
    try {
      setIsAuthLoading(true);
      const res = await fetch(`/api/my-elmassa/auth?agentCode=${encodeURIComponent(agentCode)}`);
      const json = await res.json();
      if (json.ok && json.agent) {
        setAgent(json.agent);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(json.agent));
        loadDashboard(json.agent.agentCode);
      } else {
        localStorage.removeItem(STORAGE_KEY);
        setAgent(null);
      }
    } catch {
      setAgent(null);
    } finally {
      setIsAuthLoading(false);
    }
  };

  // --- 2. LOGIN HANDLER ---
  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = identifierInput.trim();
    if (!query) {
      setAuthError("Silakan masukkan Kode Agen atau Nomor WhatsApp");
      return;
    }

    try {
      setIsLoggingIn(true);
      setAuthError("");
      const res = await fetch("/api/my-elmassa/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: query }),
      });
      const json = await res.json();

      if (!res.ok || !json.ok) {
        setAuthError(json.error || "Gagal masuk ke akun agen");
        return;
      }

      setAgent(json.agent);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(json.agent));
      loadDashboard(json.agent.agentCode);
    } catch (err: unknown) {
      setAuthError(err instanceof Error ? err.message : "Terjadi kesalahan koneksi");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setAgent(null);
    setStats(null);
    setBookings([]);
    setPackages([]);
    setIdentifierInput("");
  };

  // --- 3. LOAD DASHBOARD DATA ---
  const loadDashboard = useCallback(async (code: string) => {
    try {
      setIsDataLoading(true);
      const res = await fetch(`/api/my-elmassa/dashboard?agentCode=${encodeURIComponent(code)}`);
      const json = await res.json();
      if (json.ok) {
        setStats(json.stats);
        setPackages(json.packages ?? []);
        setBookings(json.bookings ?? []);
      }
    } catch {
      // ignore
    } finally {
      setIsDataLoading(false);
    }
  }, []);

  // --- 4. FORM REGISTRATION HELPERS ---
  const handleAddJamaahRow = () => {
    setJamaahList((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        name: "",
        nik: "",
        passport: "",
        phone: "",
        gender: "L",
        roomType: defaultRoomType,
      },
    ]);
  };

  const handleRemoveJamaahRow = (id: string) => {
    if (jamaahList.length <= 1) return;
    setJamaahList((prev) => prev.filter((item) => item.id !== id));
  };

  const handleJamaahChange = (id: string, field: keyof NewJamaahEntry, value: string) => {
    setJamaahList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    );
  };

  const openRegisterModal = (pkgId?: string) => {
    if (pkgId) setSelectedPackageId(pkgId);
    else if (packages.length > 0 && !selectedPackageId) {
      setSelectedPackageId(packages[0].id);
    }
    setRegisterError("");
    setIsRegisterOpen(true);
  };

  // Calculate live preview amount
  const selectedPkg = packages.find((p) => p.id === selectedPackageId);
  const basePrice = selectedPkg ? Number(selectedPkg.numericPrice) || 34500000 : 34500000;

  const estimatedTotal = useMemo(() => {
    let sum = 0;
    for (const j of jamaahList) {
      const room = j.roomType || defaultRoomType;
      let surcharge = 0;
      if (room.includes("Double")) surcharge = 3000000;
      else if (room.includes("Triple")) surcharge = 1500000;
      sum += basePrice + surcharge;
    }
    return sum;
  }, [jamaahList, basePrice, defaultRoomType]);

  const estimatedAgentCommission = useMemo(() => {
    if (!agent) return 0;
    if (agent.commissionType === "persen") {
      return Math.round((estimatedTotal * agent.commissionValue) / 100);
    }
    return Math.round(agent.commissionValue * jamaahList.length);
  }, [agent, estimatedTotal, jamaahList.length]);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agent) return;

    if (!selectedPackageId) {
      setRegisterError("Pilih paket keberangkatan");
      return;
    }

    const validJamaah = jamaahList.filter((j) => j.name.trim().length > 0);
    if (validJamaah.length === 0) {
      setRegisterError("Minimal masukkan 1 nama calon jamaah");
      return;
    }

    try {
      setIsSubmitting(true);
      setRegisterError("");

      const payload = {
        agentCode: agent.agentCode,
        packageId: selectedPackageId,
        packageName: selectedPkg?.name || "Umrah Spesial El Massa",
        departure: selectedPkg?.departureDate || "",
        roomType: defaultRoomType,
        picName: picName || validJamaah[0].name,
        picPhone: picPhone || validJamaah[0].phone,
        picCity: picCity || agent.city,
        notes,
        jamaahList: validJamaah,
      };

      const res = await fetch("/api/my-elmassa/register-jamaah", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.ok) {
        setRegisterError(json.error || "Gagal mendaftarkan jamaah");
        return;
      }

      // Close form modal, open success modal
      setIsRegisterOpen(false);
      setSuccessData({
        bookingCode: json.bookingCode,
        packageName: json.packageName,
        paxCount: json.paxCount,
        totalAmount: json.totalAmount,
        commissionEstimate: json.commissionEstimate,
        message: json.message,
      });

      // Reset form
      setPicName("");
      setPicPhone("");
      setNotes("");
      setJamaahList([
        {
          id: "1",
          name: "",
          nik: "",
          passport: "",
          phone: "",
          gender: "L",
          roomType: "Quad (4 Orang)",
        },
      ]);

      // Reload dashboard
      loadDashboard(agent.agentCode);
    } catch (err: unknown) {
      setRegisterError(err instanceof Error ? err.message : "Terjadi kesalahan koneksi");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- 5. FILTERED BOOKINGS ---
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const q = bookingSearch.toLowerCase();
      const matchSearch =
        !q ||
        b.code.toLowerCase().includes(q) ||
        b.customerName.toLowerCase().includes(q) ||
        b.packageName.toLowerCase().includes(q) ||
        b.jamaahList.some((j) => j.name.toLowerCase().includes(q));

      if (!matchSearch) return false;

      if (bookingFilter === "unpaid") return b.status === "Belum Bayar";
      if (bookingFilter === "dp") return b.status === "DP";
      if (bookingFilter === "paid") return b.status === "Lunas";
      return true;
    });
  }, [bookings, bookingSearch, bookingFilter]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(""), 2000);
  };

  // ----------------------------------------------------
  // VIEW: LOADING SCREEN
  // ----------------------------------------------------
  if (isAuthLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50">
        <div className="flex flex-col items-center gap-3 text-stone-500">
          <Loader2 className="h-8 w-8 animate-spin text-brand-pink" />
          <p className="text-xs font-semibold tracking-wide uppercase">Memuat Portal My El Massa...</p>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // VIEW: AGENT LOGIN FORM
  // ----------------------------------------------------
  if (!agent) {
    return (
      <div className="flex min-h-screen flex-col bg-linear-to-b from-stone-100 via-stone-50 to-pink-50/40">
        {/* Top Header */}
        <header className="border-b border-stone-200/80 bg-white/80 backdrop-blur-md px-4 py-3">
          <div className="mx-auto flex max-w-5xl items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-linear-to-br from-brand-pink to-rose-600 flex items-center justify-center text-white shadow-sm font-black text-sm">
                EM
              </div>
              <div>
                <span className="font-extrabold text-stone-800 tracking-tight text-sm">MY EL MASSA</span>
                <span className="ml-2 rounded-md bg-pink-100 px-2 py-0.5 text-[10px] font-bold text-brand-pink uppercase tracking-wider">
                  Portal Agen & Mitra
                </span>
              </div>
            </div>
            <Link
              href="/dashboard"
              className="text-xs font-semibold text-stone-500 hover:text-brand-pink transition flex items-center gap-1"
            >
              <span>Kantor Pusat</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <div className="overflow-hidden rounded-3xl border border-stone-200/90 bg-white p-6 sm:p-8 shadow-xl shadow-stone-200/50">
              {/* Badge & Title */}
              <div className="text-center space-y-2 mb-6">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 border border-brand-pink/20 px-3 py-1 text-xs font-bold text-brand-pink">
                  <Handshake className="h-3.5 w-3.5" />
                  <span>Sistem Mitra Terintegrasi</span>
                </div>
                <h1 className="text-2xl font-black text-brand-cocoa tracking-tight">
                  Login Mitra My El Massa
                </h1>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Pusat operasional agen resmi untuk pendaftaran jamaah, pantau sisa kuota seat, dan transparansi komisi.
                </p>
              </div>

              {/* Login Form */}
              <form onSubmit={handleLogin} className="space-y-4">
                {authError && (
                  <div className="flex items-start gap-2 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{authError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Kode Agen atau Nomor WhatsApp
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={identifierInput}
                      onChange={(e) => setIdentifierInput(e.target.value)}
                      placeholder="Contoh: AG-ELMASSA-01 atau 081298765432"
                      className="w-full rounded-xl border border-stone-300 bg-stone-50/50 px-4 py-3 text-sm text-stone-900 placeholder:text-stone-400 focus:border-brand-pink focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-pink/20 transition"
                      autoFocus
                    />
                    <User className="absolute right-3.5 top-3.5 h-4 w-4 text-stone-400 pointer-events-none" />
                  </div>
                  <p className="mt-1 text-[11px] text-stone-400">
                    Masukkan nomor telepon terdaftar atau kode agen resmi Anda.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full rounded-xl bg-linear-to-r from-brand-pink to-rose-600 px-4 py-3 text-sm font-bold text-white shadow-md shadow-brand-pink/20 hover:from-rose-600 hover:to-rose-700 focus:outline-none focus:ring-2 focus:ring-brand-pink/40 disabled:opacity-50 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isLoggingIn ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Memverifikasi Agen...</span>
                    </>
                  ) : (
                    <>
                      <span>Masuk ke Portal Mitra</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Demo Account Helper */}
              <div className="mt-6 pt-5 border-t border-stone-100 text-center space-y-2">
                <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block">
                  Akun Uji Coba Tersedia
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setIdentifierInput("AG-ELMASSA-01");
                    setAuthError("");
                  }}
                  className="inline-flex items-center gap-2 rounded-lg bg-pink-50 border border-pink-200/80 px-3 py-1.5 text-xs font-bold text-brand-pink hover:bg-pink-100 transition cursor-pointer"
                >
                  <Sparkles className="h-3.5 w-3.5 text-brand-pink" />
                  <span>Gunakan Akun Demo: AG-ELMASSA-01</span>
                </button>
              </div>
            </div>

            {/* Assistance Card */}
            <div className="mt-4 text-center">
              <a
                href="https://wa.me/628127178000?text=Halo%20Admin%20El%20Massa,%20saya%20ingin%20mendaftar%20sebagai%20Agen/Mitra%20resmi"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-brand-pink transition"
              >
                <MessageCircle className="h-3.5 w-3.5 text-emerald-600" />
                <span>Belum terdaftar sebagai agen? Hubungi Kantor El Massa</span>
              </a>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ----------------------------------------------------
  // VIEW: LOGGED-IN AGENT DASHBOARD
  // ----------------------------------------------------
  return (
    <div className="min-h-screen bg-stone-100 text-stone-800">
      {/* Top Header */}
      <header className="sticky top-0 z-30 border-b border-stone-200 bg-white/95 backdrop-blur-md px-4 py-3 shadow-2xs">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-linear-to-br from-brand-pink to-rose-600 flex items-center justify-center text-white font-black text-sm shadow-sm">
              EM
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-stone-900 tracking-tight text-sm">MY EL MASSA</span>
                <span className="rounded-full bg-emerald-100 text-emerald-700 px-2 py-0.2 text-[9px] font-black uppercase tracking-wider">
                  Mitra Aktif 🟢
                </span>
              </div>
              <p className="text-[10px] text-stone-400 font-medium">Portal Agen & Pendaftaran Terpadu</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-bold text-stone-800 leading-tight">{agent.name}</span>
              <span className="text-[10px] text-stone-400 font-semibold">{agent.agentCode}</span>
            </div>
            <button
              onClick={handleLogout}
              title="Keluar dari akun agen"
              className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-stone-50 px-2.5 py-1.5 text-xs font-semibold text-stone-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-6xl px-4 py-6 space-y-6">
        {/* Welcome & Agent Profile Hero */}
        <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-brand-cocoa via-stone-900 to-brand-cocoa p-6 text-white shadow-lg">
          <div className="absolute right-0 top-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-brand-pink/15 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur-sm">
                <Award className="h-3.5 w-3.5 text-pink-400" />
                <span>Mitra Wilayah: {agent.city || "Indonesia"}</span>
                <span className="text-white/40">•</span>
                <span className="font-mono text-pink-300 font-bold">{agent.agentCode}</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                Assalamu&apos;alaikum, {agent.name}! 👋
              </h1>
              <p className="text-xs text-stone-300 max-w-xl leading-relaxed">
                Daftarkan calon jamaah binaan Anda langsung ke sistem pusat El Massa. Begitu pembayaran diverifikasi kantor, akun digital UmrahMe jamaah akan langsung diaktifkan.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3 text-xs">
                <span className="inline-flex items-center gap-1 rounded-lg bg-pink-500/20 px-2.5 py-1 text-pink-200 font-bold">
                  <CreditCard className="h-3 w-3" />
                  <span>
                    Skema Komisi:{" "}
                    {agent.commissionType === "persen"
                      ? `${agent.commissionValue}% dari transaksi`
                      : `${formatIDR(agent.commissionValue)} / jamaah`}
                  </span>
                </span>
                {agent.bankAccount && (
                  <span className="text-stone-300 text-[11px]">
                    Rekening: {agent.bankName} {agent.bankAccount}
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 shrink-0">
              <button
                type="button"
                onClick={() => openRegisterModal()}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-brand-pink to-rose-600 px-5 py-3 text-xs sm:text-sm font-bold text-white shadow-lg shadow-brand-pink/30 hover:brightness-110 active:scale-98 transition cursor-pointer"
              >
                <UserPlus className="h-4 w-4" />
                <span>+ Daftarkan Jamaah Baru</span>
              </button>
              <button
                type="button"
                onClick={() => loadDashboard(agent.agentCode)}
                disabled={isDataLoading}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-xs sm:text-sm font-semibold text-white hover:bg-white/20 transition cursor-pointer"
              >
                <RefreshCw className={`h-4 w-4 ${isDataLoading ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">Refresh Data</span>
              </button>
            </div>
          </div>
        </div>

        {/* Metric / Stat Cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          <div className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between text-stone-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-400">Total Jamaah</span>
              <div className="rounded-xl bg-pink-50 p-2 text-brand-pink">
                <Users className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-stone-800">
              {stats?.totalJamaah ?? 0}{" "}
              <span className="text-xs font-semibold text-stone-400">Pax</span>
            </div>
            <p className="mt-1 text-[11px] text-stone-400">Dari {stats?.totalBookings ?? 0} pendaftaran booking</p>
          </div>

          <div className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between text-stone-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-400">Estimasi Komisi</span>
              <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600">
                <Wallet className="h-4 w-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-600">
              {formatIDR(stats?.estimatedCommission ?? 0)}
            </div>
            <p className="mt-1 text-[11px] text-emerald-700 font-medium">Berdasarkan jamaah terdaftar</p>
          </div>

          <div className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between text-stone-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-400">Total Transaksi</span>
              <div className="rounded-xl bg-blue-50 p-2 text-blue-600">
                <Layers className="h-4 w-4" />
              </div>
            </div>
            <div className="text-lg sm:text-xl font-black text-stone-800">
              {formatIDR(stats?.totalGross ?? 0)}
            </div>
            <p className="mt-1 text-[11px] text-stone-400">
              Terbayar: {formatIDR(stats?.totalPaid ?? 0)}
            </p>
          </div>

          <div className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between text-stone-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-400">Akun UmrahMe</span>
              <div className="rounded-xl bg-purple-50 p-2 text-purple-600">
                <Sparkles className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-purple-700">
              {stats?.umrahMeActiveCount ?? 0}{" "}
              <span className="text-xs font-semibold text-stone-400">Aktif</span>
            </div>
            <p className="mt-1 text-[11px] text-stone-400">Aplikasi manasik jamaah</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-stone-200 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab("bookings")}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
              activeTab === "bookings"
                ? "bg-brand-pink text-white shadow-xs"
                : "text-stone-600 hover:bg-white hover:text-stone-900"
            }`}
          >
            <UserCheck className="h-3.5 w-3.5" />
            <span>Jamaah & Booking Saya ({bookings.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("packages")}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
              activeTab === "packages"
                ? "bg-brand-pink text-white shadow-xs"
                : "text-stone-600 hover:bg-white hover:text-stone-900"
            }`}
          >
            <Plane className="h-3.5 w-3.5" />
            <span>Katalog Paket & Kuota Seat ({packages.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("commission")}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
              activeTab === "commission"
                ? "bg-brand-pink text-white shadow-xs"
                : "text-stone-600 hover:bg-white hover:text-stone-900"
            }`}
          >
            <Wallet className="h-3.5 w-3.5" />
            <span>Transparansi Komisi</span>
          </button>
        </div>

        {/* ---------------------------------------------------- */}
        {/* TAB 1: BOOKING & JAMAAH SAYA */}
        {/* ---------------------------------------------------- */}
        {activeTab === "bookings" && (
          <div className="space-y-4">
            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="Cari nama jamaah atau kode booking..."
                  value={bookingSearch}
                  onChange={(e) => setBookingSearch(e.target.value)}
                  className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2 pl-9 text-xs text-stone-800 placeholder:text-stone-400 focus:border-brand-pink focus:outline-none focus:ring-1 focus:ring-brand-pink"
                />
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-stone-400" />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {(
                  [
                    { key: "all", label: "Semua" },
                    { key: "unpaid", label: "Belum Bayar" },
                    { key: "dp", label: "DP" },
                    { key: "paid", label: "Lunas" },
                  ] as const
                ).map((f) => (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => setBookingFilter(f.key)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                      bookingFilter === f.key
                        ? "bg-stone-800 text-white"
                        : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Bookings List */}
            {filteredBookings.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-stone-300 bg-white p-8 text-center space-y-3">
                <div className="mx-auto h-12 w-12 rounded-2xl bg-pink-50 flex items-center justify-center text-brand-pink">
                  <UserPlus className="h-6 w-6" />
                </div>
                <h3 className="text-sm font-bold text-stone-800">Belum Ada Pendaftaran Jamaah</h3>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  Anda belum memiliki pendaftaran jamaah atau tidak cocok dengan filter pencarian.
                </p>
                <button
                  type="button"
                  onClick={() => openRegisterModal()}
                  className="inline-flex items-center gap-2 rounded-xl bg-brand-pink px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-rose-600 transition cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Daftarkan Jamaah Sekarang</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredBookings.map((bk) => {
                  const isExpanded = expandedBookingCode === bk.code;
                  const isUmrahMeActive = bk.umrahMeStatus?.toLowerCase().includes("aktif");

                  return (
                    <div
                      key={bk.code}
                      className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-2xs hover:border-pink-200 transition"
                    >
                      {/* Booking Card Header */}
                      <div className="p-4 sm:p-5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-black text-xs sm:text-sm text-stone-900">
                              {bk.code}
                            </span>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                bk.status === "Lunas"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : bk.status === "DP"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {bk.status}
                            </span>
                            <span className="text-[11px] text-stone-400">
                              • Terdaftar: {bk.createdAt ? new Date(bk.createdAt).toLocaleDateString("id-ID") : "-"}
                            </span>
                          </div>

                          {/* UmrahMe Status Indicator */}
                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                                isUmrahMeActive
                                  ? "bg-purple-100 text-purple-800"
                                  : "bg-stone-100 text-stone-500"
                              }`}
                            >
                              <Sparkles className="h-3 w-3" />
                              <span>UmrahMe: {isUmrahMeActive ? "Aktif 🟢" : "Menunggu Verifikasi"}</span>
                            </span>
                          </div>
                        </div>

                        {/* Booking Details Grid */}
                        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4 text-xs">
                          <div>
                            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                              Paket Umrah
                            </span>
                            <span className="font-bold text-stone-800">{bk.packageName}</span>
                            <span className="text-[11px] text-stone-500 block">
                              Berangkat: {bk.departure || "-"}
                            </span>
                          </div>

                          <div>
                            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                              Penanggung Jawab / PIC
                            </span>
                            <span className="font-bold text-stone-800">{bk.customerName}</span>
                            <span className="text-[11px] text-stone-500 block">{bk.phone || "-"}</span>
                          </div>

                          <div>
                            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                              Jumlah Jamaah
                            </span>
                            <span className="font-bold text-stone-800">{bk.participantsCount} Jamaah</span>
                            <span className="text-[11px] text-stone-500 block">{bk.roomType}</span>
                          </div>

                          <div>
                            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                              Total Biaya Paket
                            </span>
                            <span className="font-bold text-brand-cocoa">{formatIDR(bk.totalAmount)}</span>
                            <span className="text-[11px] text-emerald-600 block">
                              Terbayar: {formatIDR(bk.paidAmount)}
                            </span>
                          </div>
                        </div>

                        {/* Accordion Toggle & Quick Actions */}
                        <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedBookingCode(isExpanded ? null : bk.code)
                            }
                            className="inline-flex items-center gap-1 text-xs font-bold text-brand-pink hover:text-rose-700 transition cursor-pointer"
                          >
                            <span>{isExpanded ? "Tutup Rincian Jamaah" : `Lihat ${bk.jamaahList?.length || bk.participantsCount} Jamaah`}</span>
                            <ChevronDown
                              className={`h-3.5 w-3.5 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                            />
                          </button>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                const shareText = `*Pendaftaran Umrah El Massa*\nKode Booking: ${bk.code}\nPaket: ${bk.packageName}\nNama: ${bk.customerName}\nJumlah: ${bk.participantsCount} Pax\nTotal: ${formatIDR(bk.totalAmount)}\nStatus: ${bk.status}\n\nRekening Resmi Pembayaran DP El Massa:\nBank Syariah Indonesia (BSI)\nNo. Rekening: 7123456789\na.n. PT El Massa Tour & Travel`;
                                copyToClipboard(shareText, bk.code);
                              }}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-1 text-[11px] font-semibold text-stone-600 hover:bg-stone-100 transition cursor-pointer"
                            >
                              <Copy className="h-3 w-3" />
                              <span>{copiedText === bk.code ? "Tersalin!" : "Salin Info Booking"}</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Expanded Jamaah List */}
                      {isExpanded && (
                        <div className="bg-stone-50/70 p-4 border-t border-stone-100 space-y-2">
                          <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                            Daftar Calon Jamaah Terdaftar
                          </span>

                          <div className="space-y-1.5">
                            {bk.jamaahList && bk.jamaahList.length > 0 ? (
                              bk.jamaahList.map((j, idx) => (
                                <div
                                  key={j.id || idx}
                                  className="flex items-center justify-between rounded-xl bg-white border border-stone-200/80 px-3 py-2 text-xs"
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-pink-100 text-[10px] font-black text-brand-pink">
                                      {idx + 1}
                                    </span>
                                    <span className="font-bold text-stone-800">{j.name}</span>
                                    {j.passport && (
                                      <span className="rounded bg-stone-100 px-1.5 py-0.5 text-[10px] font-mono text-stone-500">
                                        Paspor: {j.passport}
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <span
                                      className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                                        j.documentStatus === "Lengkap"
                                          ? "bg-emerald-100 text-emerald-800"
                                          : "bg-stone-100 text-stone-600"
                                      }`}
                                    >
                                      Dokumen: {j.documentStatus || "Belum Lengkap"}
                                    </span>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="rounded-xl bg-white p-3 text-center text-xs text-stone-500">
                                Data peserta: {bk.customerName} ({bk.participantsCount} Jamaah)
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 2: KATALOG PAKET & KUOTA SEAT */}
        {/* ---------------------------------------------------- */}
        {activeTab === "packages" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-black text-stone-900 tracking-tight">Katalog Paket Keberangkatan</h2>
                <p className="text-xs text-stone-500">
                  Ketersediaan seat terpantau langsung dari database sistem operasional El Massa.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {packages.map((pkg) => (
                <div
                  key={pkg.id}
                  className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-2xs hover:shadow-md transition flex flex-col justify-between"
                >
                  <div className="p-5 space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="inline-block rounded-md bg-pink-100 px-2 py-0.5 text-[10px] font-bold text-brand-pink uppercase tracking-wider mb-1">
                          {pkg.duration}
                        </span>
                        <h3 className="text-base font-black text-stone-900 leading-tight">
                          {pkg.name}
                        </h3>
                        <p className="text-xs text-stone-500 mt-0.5">
                          {pkg.flightRoute || "Pangkal Pinang ➔ Jakarta ➔ Saudi"}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                          Harga Mulai
                        </span>
                        <span className="text-base font-black text-brand-pink">
                          {pkg.price || formatIDR(Number(pkg.numericPrice))}
                        </span>
                      </div>
                    </div>

                    {/* Flight & Hotel Info */}
                    <div className="grid grid-cols-2 gap-2 rounded-2xl bg-stone-50 p-3 text-xs">
                      <div>
                        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                          🏨 Makkah Hotel
                        </span>
                        <span className="font-semibold text-stone-800">{pkg.makkahHotel || "Grand Al Massa"}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                          🏨 Madinah Hotel
                        </span>
                        <span className="font-semibold text-stone-800">{pkg.madinahHotel || "Daar El Naeem"}</span>
                      </div>
                      <div className="col-span-2 pt-1 border-t border-stone-200/60">
                        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                          ✈️ Maskapai Penerbangan
                        </span>
                        <span className="font-medium text-stone-700 truncate block">
                          {pkg.airline || "Garuda Indonesia + Saudia Airlines"}
                        </span>
                      </div>
                    </div>

                    {/* Seat Progress Bar */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-stone-600">
                          Sisa Seat Tersedia:{" "}
                          <strong className="text-brand-pink font-black text-sm">
                            {pkg.availableSeats}
                          </strong>{" "}
                          / {pkg.targetPax}
                        </span>
                        <span className="text-stone-400 text-[11px]">
                          Terisi: {pkg.bookedPax} Seat
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-stone-100">
                        <div
                          className="h-full bg-linear-to-r from-brand-pink to-rose-600 rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(
                              100,
                              Math.round((pkg.bookedPax / (pkg.targetPax || 45)) * 100),
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-stone-50 border-t border-stone-100 flex items-center justify-between">
                    <span className="text-[11px] font-medium text-stone-500">
                      DP Minimal: <strong className="text-stone-700">{pkg.dpMinimum || "Rp 5.000.000"}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => openRegisterModal(pkg.id)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-brand-pink px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-rose-600 transition cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Daftarkan ke Paket Ini</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 3: TRANSPARANSI & SIMULASI KOMISI */}
        {/* ---------------------------------------------------- */}
        {activeTab === "commission" && (
          <div className="space-y-4">
            <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-2xs space-y-6">
              <div>
                <h2 className="text-base font-black text-stone-900 tracking-tight">
                  Transparansi & Kebijakan Komisi Mitra
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  Setiap jamaah yang didaftarkan melalui portal My El Massa tercatat otomatis dengan kode agen Anda.
                </p>
              </div>

              {/* Commission Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-2xl bg-pink-50/60 border border-pink-100 p-4 space-y-2">
                  <div className="text-[10px] font-bold text-brand-pink uppercase tracking-wider">
                    Skema Komisi Anda
                  </div>
                  <div className="text-xl font-black text-stone-900">
                    {agent.commissionType === "persen"
                      ? `${agent.commissionValue}% dari Nilai Transaksi`
                      : `${formatIDR(agent.commissionValue)} / Jamaah`}
                  </div>
                  <p className="text-[11px] text-stone-600 leading-relaxed">
                    Komisi berlaku untuk setiap jamaah yang berhasil didaftarkan dan terkonfirmasi DP/Lunas.
                  </p>
                </div>

                <div className="rounded-2xl bg-emerald-50/60 border border-emerald-100 p-4 space-y-2">
                  <div className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                    Total Komisi Terkumpul
                  </div>
                  <div className="text-xl font-black text-emerald-700">
                    {formatIDR(stats?.estimatedCommission ?? 0)}
                  </div>
                  <p className="text-[11px] text-stone-600 leading-relaxed">
                    Dihitung dari {stats?.totalJamaah ?? 0} jamaah yang telah Anda daftarkan.
                  </p>
                </div>

                <div className="rounded-2xl bg-stone-50 border border-stone-200 p-4 space-y-2">
                  <div className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                    Rekening Pencairan
                  </div>
                  <div className="text-sm font-black text-stone-900">
                    {agent.bankName || "Bank Syariah Indonesia"}
                  </div>
                  <div className="font-mono text-xs font-bold text-brand-pink">
                    {agent.bankAccount || "-"}
                  </div>
                  <p className="text-[11px] text-stone-500">
                    Atas Nama: {agent.name}
                  </p>
                </div>
              </div>

              {/* Step By Step Explainer */}
              <div className="rounded-2xl border border-stone-200 bg-stone-50 p-5 space-y-3">
                <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                  Mekanisme Operasional & Pencairan
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="flex items-start gap-2.5">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-pink text-white font-black text-xs">
                      1
                    </div>
                    <div>
                      <strong className="text-stone-800 block">Pendaftaran oleh Agen</strong>
                      <span className="text-stone-500 text-[11px]">
                        Agen memasukkan data calon jamaah via My El Massa. Status tercatat &quot;Belum Bayar&quot;.
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-pink text-white font-black text-xs">
                      2
                    </div>
                    <div>
                      <strong className="text-stone-800 block">Verifikasi Kantor Pusat</strong>
                      <span className="text-stone-500 text-[11px]">
                        Admin dan kasir El Massa memverifikasi pembayaran DP. Akun UmrahMe jamaah aktif.
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-pink text-white font-black text-xs">
                      3
                    </div>
                    <div>
                      <strong className="text-stone-800 block">Pencairan Komisi</strong>
                      <span className="text-stone-500 text-[11px]">
                        Komisi ditransfer ke rekening terdaftar sesuai jadwal settlement kantor.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ---------------------------------------------------- */}
      {/* MODAL: FORM PENDAFTARAN JAMAAH BARU */}
      {/* ---------------------------------------------------- */}
      {isRegisterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-stone-200 bg-white p-6 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <div className="rounded-xl bg-pink-100 p-2 text-brand-pink">
                  <UserPlus className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-stone-900">
                    Form Pendaftaran Calon Jamaah
                  </h3>
                  <p className="text-xs text-stone-500">
                    Mitra: {agent.name} ({agent.agentCode})
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsRegisterOpen(false)}
                className="rounded-full p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-600 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleRegisterSubmit} className="mt-4 space-y-5">
              {registerError && (
                <div className="flex items-start gap-2 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{registerError}</span>
                </div>
              )}

              {/* 1. Pilih Paket */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  1. Pilih Paket Keberangkatan <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedPackageId}
                  onChange={(e) => setSelectedPackageId(e.target.value)}
                  className="w-full rounded-xl border border-stone-300 bg-stone-50 px-3.5 py-2.5 text-xs text-stone-800 focus:border-brand-pink focus:bg-white focus:outline-none"
                  required
                >
                  <option value="">-- Pilih Paket Umrah --</option>
                  {packages.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.duration}) - {p.price || formatIDR(Number(p.numericPrice))} [Sisa {p.availableSeats} Seat]
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. Tipe Kamar & PIC */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Tipe Kamar Default
                  </label>
                  <select
                    value={defaultRoomType}
                    onChange={(e) => setDefaultRoomType(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 bg-stone-50 px-3 py-2 text-xs text-stone-800 focus:border-brand-pink focus:bg-white focus:outline-none"
                  >
                    <option value="Quad (4 Orang)">Quad (4 Orang) - Standar</option>
                    <option value="Triple (3 Orang)">Triple (+Rp 1.500.000/pax)</option>
                    <option value="Double (2 Orang)">Double (+Rp 3.000.000/pax)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Nama Penanggung Jawab / PIC
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Bpk. Fulan"
                    value={picName}
                    onChange={(e) => setPicName(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 bg-stone-50 px-3 py-2 text-xs text-stone-800 focus:border-brand-pink focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    WhatsApp Penanggung Jawab
                  </label>
                  <input
                    type="tel"
                    placeholder="08123456789"
                    value={picPhone}
                    onChange={(e) => setPicPhone(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 bg-stone-50 px-3 py-2 text-xs text-stone-800 focus:border-brand-pink focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              {/* 3. Daftar Jamaah Input */}
              <div className="space-y-3 pt-2 border-t border-stone-100">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider">
                    2. Data Calon Jamaah ({jamaahList.length} Orang) <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleAddJamaahRow}
                    className="inline-flex items-center gap-1 text-xs font-bold text-brand-pink hover:text-rose-700 transition cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>+ Tambah Jamaah</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {jamaahList.map((entry, idx) => (
                    <div
                      key={entry.id}
                      className="rounded-2xl border border-stone-200 bg-stone-50/60 p-3.5 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-stone-700">
                          Jamaah #{idx + 1}
                        </span>
                        {jamaahList.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveJamaahRow(entry.id)}
                            className="text-stone-400 hover:text-rose-600 transition cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <input
                            type="text"
                            placeholder="Nama Lengkap (sesuai KTP/Paspor) *"
                            value={entry.name}
                            onChange={(e) => handleJamaahChange(entry.id, "name", e.target.value)}
                            className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs text-stone-800 focus:border-brand-pink focus:outline-none"
                            required
                          />
                        </div>

                        <div>
                          <input
                            type="text"
                            placeholder="Nomor Paspor (jika ada)"
                            value={entry.passport}
                            onChange={(e) => handleJamaahChange(entry.id, "passport", e.target.value)}
                            className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs text-stone-800 focus:border-brand-pink focus:outline-none"
                          />
                        </div>

                        <div>
                          <input
                            type="text"
                            placeholder="NIK (KTP 16 digit)"
                            value={entry.nik}
                            onChange={(e) => handleJamaahChange(entry.id, "nik", e.target.value)}
                            className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs text-stone-800 focus:border-brand-pink focus:outline-none"
                          />
                        </div>

                        <div className="flex gap-2">
                          <select
                            value={entry.gender}
                            onChange={(e) => handleJamaahChange(entry.id, "gender", e.target.value)}
                            className="w-1/3 rounded-xl border border-stone-300 bg-white px-2.5 py-2 text-xs text-stone-800 focus:border-brand-pink focus:outline-none"
                          >
                            <option value="L">Laki-laki</option>
                            <option value="P">Perempuan</option>
                          </select>

                          <select
                            value={entry.roomType || defaultRoomType}
                            onChange={(e) => handleJamaahChange(entry.id, "roomType", e.target.value)}
                            className="w-2/3 rounded-xl border border-stone-300 bg-white px-2.5 py-2 text-xs text-stone-800 focus:border-brand-pink focus:outline-none"
                          >
                            <option value="Quad (4 Orang)">Quad</option>
                            <option value="Triple (3 Orang)">Triple (+1.5jt)</option>
                            <option value="Double (2 Orang)">Double (+3jt)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Catatan / Permintaan Khusus
                </label>
                <textarea
                  rows={2}
                  placeholder="Misal: Jamaah lansia membutuhkan kursi roda, dsb..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-xl border border-stone-300 bg-stone-50 px-3.5 py-2 text-xs text-stone-800 focus:border-brand-pink focus:bg-white focus:outline-none"
                />
              </div>

              {/* Price & Commission Summary Banner */}
              <div className="rounded-2xl bg-linear-to-r from-stone-900 to-stone-800 p-4 text-white flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                    Total Biaya Paket ({jamaahList.length} Jamaah)
                  </span>
                  <span className="text-base font-black text-white">{formatIDR(estimatedTotal)}</span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-bold text-pink-300 uppercase tracking-wider block">
                    Estimasi Komisi Agen
                  </span>
                  <span className="text-base font-black text-emerald-400">
                    +{formatIDR(estimatedAgentCommission)}
                  </span>
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRegisterOpen(false)}
                  className="rounded-xl border border-stone-200 px-4 py-2.5 text-xs font-semibold text-stone-600 hover:bg-stone-50 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-linear-to-r from-brand-pink to-rose-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-brand-pink/20 hover:from-rose-600 hover:to-rose-700 disabled:opacity-50 transition cursor-pointer flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Menyimpan ke Sistem...</span>
                    </>
                  ) : (
                    <>
                      <span>Kirim Pendaftaran ke Kantor</span>
                      <CheckCircle2 className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL: SUKSES PENDAFTARAN & INFO PEMBAYARAN */}
      {/* ---------------------------------------------------- */}
      {successData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl border border-stone-200 bg-white p-6 shadow-2xl space-y-5 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-stone-900">Pendaftaran Berhasil Tercatat!</h3>
              <p className="text-xs text-stone-500">
                Data calon jamaah binaan Anda langsung masuk ke antrean verifikasi kantor pusat El Massa.
              </p>
            </div>

            <div className="rounded-2xl bg-stone-50 p-4 border border-stone-200 space-y-2 text-left text-xs">
              <div className="flex items-center justify-between">
                <span className="text-stone-500">Kode Booking:</span>
                <span className="font-mono font-black text-stone-900 text-sm">{successData.bookingCode}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-500">Paket:</span>
                <span className="font-bold text-stone-800">{successData.packageName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-500">Jumlah Jamaah:</span>
                <span className="font-bold text-stone-800">{successData.paxCount} Orang</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-500">Total Biaya:</span>
                <span className="font-bold text-brand-cocoa">{formatIDR(successData.totalAmount)}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-stone-200 text-emerald-700">
                <span className="font-semibold">Estimasi Komisi Agen:</span>
                <span className="font-black">{formatIDR(successData.commissionEstimate)}</span>
              </div>
            </div>

            {/* Rekening Transfer DP */}
            <div className="rounded-2xl bg-pink-50/70 border border-pink-200/60 p-3 text-left space-y-1 text-xs">
              <span className="text-[10px] font-bold text-brand-pink uppercase tracking-wider block">
                Rekening Resmi Pembayaran DP El Massa
              </span>
              <p className="font-bold text-stone-800">Bank Syariah Indonesia (BSI)</p>
              <p className="font-mono text-sm font-black text-brand-pink">7123456789</p>
              <p className="text-[11px] text-stone-500">a.n. PT El Massa Tour & Travel</p>
            </div>

            <div className="text-[11px] text-stone-400 leading-relaxed text-left">
              *Setelah DP / pembayaran dikonfirmasi oleh staf kasir kantor, status booking akan berubah menjadi DP/Lunas dan <strong>akun aplikasi UmrahMe jamaah akan langsung diaktifkan</strong>.
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  const shareMsg = `*Konfirmasi Pendaftaran Umrah El Massa*\n\nKode Booking: ${successData.bookingCode}\nPaket: ${successData.packageName}\nJumlah: ${successData.paxCount} Jamaah\nTotal: ${formatIDR(successData.totalAmount)}\n\nSilakan melakukan pembayaran DP ke rekening resmi El Massa:\nBank Syariah Indonesia (BSI)\nNo. Rek: 7123456789\na.n. PT El Massa Tour & Travel\n\nSetelah pembayaran diverifikasi, akun aplikasi UmrahMe jamaah akan langsung diaktifkan. Terima kasih!`;
                  copyToClipboard(shareMsg, "share_success");
                }}
                className="flex-1 rounded-xl border border-stone-200 bg-stone-50 py-2.5 text-xs font-bold text-stone-700 hover:bg-stone-100 transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Copy className="h-3.5 w-3.5" />
                <span>{copiedText === "share_success" ? "Tersalin!" : "Salin Info WA"}</span>
              </button>

              <button
                type="button"
                onClick={() => setSuccessData(null)}
                className="flex-1 rounded-xl bg-brand-pink py-2.5 text-xs font-bold text-white shadow-xs hover:bg-rose-600 transition cursor-pointer"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
