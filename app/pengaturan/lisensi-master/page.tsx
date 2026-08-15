"use client";

import Link from "next/link";
import { ShieldCheck, Sparkles } from "lucide-react";
import { AppShell } from "@/components/app-shell";

/**
 * Panel ini dulu berisi kontrol saldo kuota lisensi: sebuah form yang menyimpan
 * angka ke localStorage, dilindungi PIN. Perlindungan itu semu -- saldonya ada
 * di browser, jadi siapa pun bisa menaikkannya lewat DevTools tanpa menyentuh
 * PIN sama sekali, dan setiap browser baru otomatis diberi 100 kuota gratis.
 *
 * Kuota sekarang dimiliki penyedia UmrahMe: ditambah lewat panel vendor
 * (license_topup) dan berkurang otomatis di dalam transaksi penerbitan akun
 * (license_consume). Sisi travel hanya membacanya. Halaman ini sengaja
 * dipertahankan sebagai penjelasan supaya tautan lama tidak mati begitu saja.
 */
export default function LisensiMasterPage() {
  return (
    <AppShell eyebrow="Lisensi UmrahMe" title="Kontrol Kuota Dipindahkan">
      <div className="mx-auto max-w-2xl space-y-4 font-sans">
        <section className="rounded-2xl border border-stone-200/70 bg-white p-6 shadow-2xs space-y-4">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
              <ShieldCheck className="h-5 w-5" strokeWidth={1.5} />
            </span>
            <div className="space-y-1">
              <h2 className="text-sm font-extrabold text-brand-cocoa">
                Saldo kuota tidak lagi diatur dari sini
              </h2>
              <p className="text-xs leading-relaxed text-stone-600">
                Kuota lisensi UmrahMe sekarang disimpan di database dan dikelola oleh penyedia UmrahMe.
                Panel lama menyimpan saldo di browser, sehingga angkanya berbeda-beda di tiap perangkat
                dan bisa diubah siapa saja.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-stone-200/70 bg-stone-50/70 p-4 space-y-2 text-xs text-stone-700">
            <p className="font-bold text-brand-cocoa">Cara kerjanya sekarang</p>
            <ol className="list-decimal space-y-1 pl-4">
              <li>Travel membeli kuota ke penyedia UmrahMe.</li>
              <li>Penyedia menambahkan kuota dari panel admin UmrahMe.</li>
              <li>Saldo langsung muncul di halaman Akun Digital UmrahMe.</li>
              <li>Setiap akun jamaah yang diterbitkan memotong 1 kuota otomatis.</li>
            </ol>
          </div>

          <Link
            href="/umrahme"
            className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-brand-pink px-4 text-xs font-bold text-white shadow-2xs hover:bg-brand-pinkHover transition"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Lihat Saldo Kuota</span>
          </Link>
        </section>
      </div>
    </AppShell>
  );
}
