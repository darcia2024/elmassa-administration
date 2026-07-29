"use client";

import { ArrowRight, Eye, EyeOff, LockKeyhole, ShieldCheck, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

const dummyUsers = [
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
  const [email, setEmail] = useState(dummyUsers[0].email);
  const [password, setPassword] = useState(dummyUsers[0].password);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const selectedUser = useMemo(() => dummyUsers.find((user) => user.email === email), [email]);

  const handleSubmit = () => {
    const user = dummyUsers.find((item) => item.email === email.trim() && item.password === password);

    if (!user) {
      setError("Email atau password dummy tidak cocok");
      return;
    }

    window.localStorage.setItem(
      "el-massa-session",
      JSON.stringify({
        email: user.email,
        loggedInAt: new Date().toISOString(),
        name: user.name,
        role: user.role,
      }),
    );
    const nextPath = new URLSearchParams(window.location.search).get("next");
    router.push(nextPath?.startsWith("/") ? nextPath : "/dashboard");
  };

  const handlePickUser = (user: (typeof dummyUsers)[number]) => {
    setEmail(user.email);
    setPassword(user.password);
    setError("");
  };

  return (
    <main className="min-h-screen bg-[#fafafa] px-4 py-8 text-stone-800 font-sans sm:px-6 lg:px-8 grid place-items-center">
      <section className="w-full max-w-5xl grid gap-8 items-center lg:grid-cols-[1fr_400px]">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <img
              src="/logo-el-massa.png"
              alt="El Massa Tour & Travel Logo"
              className="h-12 w-auto object-contain shrink-0"
            />
            <div>
              <h1 className="text-base font-bold text-brand-cocoa leading-tight">El Massa Travel</h1>
              <p className="text-[11px] font-normal text-stone-500 leading-tight">Sistem Operasional Staf</p>
            </div>
          </div>

          <div className="max-w-xl">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-pink/20 bg-rose-50/70 px-3 py-0.5 text-xs font-semibold text-brand-pink">
              <ShieldCheck className="h-3.5 w-3.5" strokeWidth={1.5} />
              Portal Akses Staf Travel
            </span>
            <h2 className="mt-3 text-3xl font-extrabold text-brand-cocoa sm:text-4xl tracking-tight">
              Masuk ke Ruang Kerja Operasional
            </h2>
            <p className="mt-2 text-xs text-stone-500 leading-relaxed">
              Kelola jadwal keberangkatan umrah & tour, pemesanan jamaah, pelunasan tagihan, serta manifest peserta secara aman.
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-stone-400">Pilih Akun Demo Staf</p>
            {dummyUsers.map((user) => {
              const isSelected = user.email === email;

              return (
                <button
                  key={user.email}
                  className={`w-full max-w-md rounded-2xl border p-4 text-left transition flex items-center justify-between ${
                    isSelected
                      ? "border-brand-pink bg-rose-50/40 text-brand-cocoa shadow-2xs"
                      : "border-stone-200/70 bg-white text-stone-600 hover:border-stone-300"
                  }`}
                  type="button"
                  onClick={() => handlePickUser(user)}
                >
                  <div>
                    <span className="block text-xs font-bold text-brand-cocoa">{user.name}</span>
                    <span className="block text-[11px] text-stone-500">{user.role}</span>
                  </div>
                  <span className="text-[11px] font-mono text-stone-400">{user.email}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Login Box */}
        <form className="rounded-2xl border border-stone-200/70 bg-white p-6 sm:p-7 shadow-2xs space-y-4" onSubmit={(event) => { event.preventDefault(); handleSubmit(); }}>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-brand-cocoa">Login Staf</h3>
            <p className="text-xs text-stone-500">Masukkan email & password akun staf Anda.</p>
          </div>

          {error ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50/80 p-3 text-xs text-rose-700 font-medium">
              {error}
            </div>
          ) : null}

          <div className="space-y-3">
            <label className="block space-y-1">
              <span className="text-xs font-semibold text-stone-700">Email Staf</span>
              <div className="flex h-10 items-center gap-2 rounded-xl border border-stone-200 bg-stone-50/50 px-3 text-xs">
                <UserRound className="h-4 w-4 text-stone-400 shrink-0" strokeWidth={1.5} />
                <input
                  className="w-full bg-transparent outline-none font-normal text-brand-cocoa"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </label>

            <label className="block space-y-1">
              <span className="text-xs font-semibold text-stone-700">Password</span>
              <div className="flex h-10 items-center gap-2 rounded-xl border border-stone-200 bg-stone-50/50 px-3 text-xs">
                <LockKeyhole className="h-4 w-4 text-stone-400 shrink-0" strokeWidth={1.5} />
                <input
                  className="w-full bg-transparent outline-none font-normal text-brand-cocoa"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-stone-400 hover:text-stone-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" strokeWidth={1.5} /> : <Eye className="h-4 w-4" strokeWidth={1.5} />}
                </button>
              </div>
            </label>
          </div>

          <button
            type="submit"
            className="w-full h-10 rounded-xl bg-brand-pink text-xs font-semibold text-white shadow-2xs hover:bg-brand-pinkHover transition flex items-center justify-center gap-2"
          >
            <span>Masuk ke Dashboard</span>
            <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </form>
      </section>
    </main>
  );
}
