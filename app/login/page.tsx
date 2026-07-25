"use client";

import { ArrowRight, Eye, EyeOff, LockKeyhole, ShieldCheck, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

const dummyUsers = [
  {
    email: "maya@elmassa.test",
    name: "Maya Safitri",
    password: "admin123",
    role: "Admin Operasional",
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
    <main className="min-h-screen bg-brand-cream px-4 py-6 text-brand-cocoa sm:px-6 lg:px-8">
      <section className="mx-auto grid min-h-[calc(100vh-48px)] max-w-6xl items-center gap-6 lg:grid-cols-[1fr_420px]">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-lg bg-brand-pink text-lg font-black text-white">
              EM
            </div>
            <div>
              <p className="text-sm font-semibold uppercase text-brand-brown">El Massa</p>
              <h1 className="text-2xl font-bold text-brand-cocoa">Travel Admin</h1>
            </div>
          </div>

          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase text-brand-brown">dummy autentikasi internal</p>
            <h2 className="mt-3 text-4xl font-bold text-brand-cocoa sm:text-5xl">Masuk ke ruang kerja operasional</h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-stone-600">
              Login dummy untuk memvalidasi alur masuk, role staf, dan penyimpanan session dummy sebelum autentikasi permanen disambungkan.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {dummyUsers.map((user) => {
              const isSelected = user.email === email;

              return (
                <button
                  key={user.email}
                  className={`rounded-lg border p-4 text-left transition ${
                    isSelected
                      ? "border-brand-pink bg-white text-brand-cocoa shadow-soft"
                      : "border-stone-200 bg-white/70 text-stone-600 hover:bg-white"
                  }`}
                  type="button"
                  onClick={() => handlePickUser(user)}
                >
                  <span className="block text-sm font-bold">{user.name}</span>
                  <span className="mt-1 block text-xs">{user.role}</span>
                </button>
              );
            })}
          </div>
        </div>

        <form className="rounded-lg border border-stone-200 bg-white p-6 shadow-soft" onSubmit={(event) => { event.preventDefault(); handleSubmit(); }}>
          <div className="mb-6">
            <div className="mb-4 grid h-12 w-12 place-items-center rounded-lg bg-brand-rose text-brand-pink">
              <LockKeyhole className="h-6 w-6" aria-hidden="true" />
            </div>
            <h3 className="text-2xl font-bold text-brand-cocoa">Login</h3>
            <p className="mt-2 text-sm leading-6 text-stone-500">Gunakan salah satu akun dummy yang tersedia.</p>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-semibold text-brand-cocoa">
              Email
              <span className="mt-2 flex h-11 items-center gap-2 rounded-md border border-stone-200 bg-white px-3">
                <UserRound className="h-4 w-4 text-brand-brown" aria-hidden="true" />
                <input className="min-w-0 flex-1 bg-transparent text-sm outline-none" value={email} onChange={(event) => { setEmail(event.target.value); setError(""); }} />
              </span>
            </label>
            <label className="block text-sm font-semibold text-brand-cocoa">
              Password
              <span className="mt-2 flex h-11 items-center gap-2 rounded-md border border-stone-200 bg-white px-3">
                <ShieldCheck className="h-4 w-4 text-brand-brown" aria-hidden="true" />
                <input className="min-w-0 flex-1 bg-transparent text-sm outline-none" type={showPassword ? "text" : "password"} value={password} onChange={(event) => { setPassword(event.target.value); setError(""); }} />
                <button className="grid h-8 w-8 place-items-center rounded-md text-brand-cocoa" type="button" aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"} onClick={() => setShowPassword((current) => !current)}>
                  {showPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
                </button>
              </span>
            </label>
          </div>

          <div className="mt-4 text-right">
            <a className="text-sm font-bold text-brand-pink hover:text-brand-cocoa" href="/lupa-password">
              Lupa password?
            </a>
          </div>

          {error ? (
            <div className="mt-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">
              {error}
            </div>
          ) : null}

          <div className="mt-5 rounded-lg border border-brand-rose bg-brand-cream p-4 text-sm">
            <p className="font-bold text-brand-cocoa">{selectedUser?.name ?? "Akun dummy tidak dipilih"}</p>
            <p className="mt-1 text-stone-600">{selectedUser?.role ?? "Masukkan email dummy untuk melihat role"}</p>
          </div>

          <button className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-brand-pink px-4 text-sm font-bold text-white" type="submit">
            Masuk dashboard
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </form>
      </section>
    </main>
  );
}
