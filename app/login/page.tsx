"use client";

import { ArrowRight, Eye, EyeOff, LockKeyhole, ShieldCheck, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const validUsers = [
  {
    email: "azriandri@elmassa.test",
    name: "Azriandri",
    password: "admin123",
    role: "CEO / Admin Master",
  },
  {
    email: "ruslan.ops@elmassa.test",
    name: "H. Ruslan Efendi",
    password: "admin123",
    role: "Sub-User Operasional",
  },
  {
    email: "zubaidah.fin@elmassa.test",
    name: "Hj. Zubaidah",
    password: "admin123",
    role: "Sub-User Keuangan",
  },
  {
    email: "ridwan.sales@elmassa.test",
    name: "Ridwan Hasan",
    password: "admin123",
    role: "Sub-User Sales & CRM",
  },
  {
    email: "ahmad.field@elmassa.test",
    name: "Ust. Ahmad Syahputra",
    password: "admin123",
    role: "Sub-User Lapangan",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = () => {
    setError("");
    const inputEmail = email.trim().toLowerCase();

    if (!inputEmail || !password) {
      setError("Silakan masukkan email dan password akun staf Anda");
      return;
    }

    // Match existing staff user or create dynamic staff session
    const matchedUser = validUsers.find(
      (u) => u.email.toLowerCase() === inputEmail && u.password === password
    );

    const sessionUser = matchedUser || {
      email: inputEmail,
      name: inputEmail.split("@")[0].toUpperCase(),
      role: "Staf Operasional Travel",
    };

    window.localStorage.setItem(
      "el-massa-session",
      JSON.stringify({
        email: sessionUser.email,
        loggedInAt: new Date().toISOString(),
        name: sessionUser.name,
        role: sessionUser.role,
      })
    );

    const nextPath = new URLSearchParams(window.location.search).get("next");
    router.push(nextPath?.startsWith("/") ? nextPath : "/dashboard");
  };

  return (
    <main className="min-h-screen bg-[#fafafa] px-4 py-12 text-stone-800 font-sans grid place-items-center">
      <div className="w-full max-w-md space-y-6">
        
        {/* Brand Logo & Header */}
        <div className="flex flex-col items-center text-center space-y-3">
          <img
            src="/logo-el-massa.png"
            alt="El Massa Tour & Travel Logo"
            className="h-16 w-auto object-contain"
          />
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-pink/20 bg-rose-50/70 px-3 py-0.5 text-xs font-semibold text-brand-pink mb-1">
              <ShieldCheck className="h-3.5 w-3.5" strokeWidth={1.5} />
              Portal Akses Staf Travel
            </span>
            <h1 className="text-2xl font-extrabold text-brand-cocoa tracking-tight">
              Ruang Kerja Operasional
            </h1>
            <p className="text-xs text-stone-500 max-w-xs mx-auto mt-1">
              Kelola keberangkatan umrah &amp; tour, tagihan, serta manifest jemaah secara aman.
            </p>
          </div>
        </div>

        {/* Login Form Card */}
        <form
          className="rounded-2xl border border-stone-200/70 bg-white p-6 sm:p-8 shadow-sm space-y-5"
          onSubmit={(event) => {
            event.preventDefault();
            handleSubmit();
          }}
        >
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-brand-cocoa">Login Staf</h2>
            <p className="text-xs text-stone-500">Masukkan email &amp; password akun staf Anda.</p>
          </div>

          {error ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50/80 p-3 text-xs text-rose-700 font-medium">
              {error}
            </div>
          ) : null}

          <div className="space-y-4">
            <label className="block space-y-1">
              <span className="text-xs font-semibold text-stone-700">Email Staf</span>
              <div className="flex h-11 items-center gap-2 rounded-xl border border-stone-200 bg-stone-50/50 px-3.5 text-xs focus-within:border-brand-pink focus-within:bg-white transition-colors">
                <UserRound className="h-4 w-4 text-stone-400 shrink-0" strokeWidth={1.5} />
                <input
                  className="w-full bg-transparent outline-none font-medium text-brand-cocoa placeholder:text-stone-400"
                  type="email"
                  placeholder="nama.staf@elmassa.id"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </label>

            <label className="block space-y-1">
              <span className="text-xs font-semibold text-stone-700">Password</span>
              <div className="flex h-11 items-center gap-2 rounded-xl border border-stone-200 bg-stone-50/50 px-3.5 text-xs focus-within:border-brand-pink focus-within:bg-white transition-colors">
                <LockKeyhole className="h-4 w-4 text-stone-400 shrink-0" strokeWidth={1.5} />
                <input
                  className="w-full bg-transparent outline-none font-medium text-brand-cocoa placeholder:text-stone-400"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-stone-400 hover:text-stone-600 transition-colors p-1"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" strokeWidth={1.5} /> : <Eye className="h-4 w-4" strokeWidth={1.5} />}
                </button>
              </div>
            </label>
          </div>

          <button
            type="submit"
            className="w-full h-11 rounded-xl bg-gradient-to-r from-brand-pink to-rose-600 hover:from-rose-600 hover:to-brand-pink text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-[0.99] cursor-pointer"
          >
            <span>Masuk ke Dashboard</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <p className="text-[11px] text-center text-stone-400">
          © {new Date().getFullYear()} El Massa Tour &amp; Travel. Hak Cipta Dilindungi.
        </p>

      </div>
    </main>
  );
}
