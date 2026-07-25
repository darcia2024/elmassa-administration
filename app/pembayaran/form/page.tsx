import { ArrowLeft, Calculator, ReceiptText, Upload } from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";

const bookingOptions = [
  "BK-2407-018 - Siti Rahma - Sisa Rp 20.000.000",
];

const accounts = [
  "BCA El Massa",
];

export default function PaymentFormPage() {
  return (
    <AppShell eyebrow="Keuangan" title="Catat Pembayaran">
      <section className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <aside className="space-y-4">
          <article className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
            <div className="grid h-12 w-12 place-items-center rounded-lg bg-brand-rose text-brand-pink">
              <ReceiptText className="h-6 w-6" aria-hidden="true" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-brand-cocoa">Pembayaran Baru</h3>
            <p className="mt-2 text-sm leading-6 text-stone-500">
              Form dummy untuk mencatat DP, cicilan, atau pelunasan booking sebelum tersambung ke backend permanen.
            </p>
          </article>

          <article className="rounded-lg border border-stone-200 bg-brand-cream p-5">
            <p className="text-sm font-bold text-brand-cocoa">Ringkasan Input</p>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-3">
                <span className="text-stone-500">Nomor kuitansi</span>
                <span className="font-bold text-brand-cocoa">Auto</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-stone-500">Status awal</span>
                <span className="font-bold text-brand-cocoa">Menunggu Cek</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-stone-500">Tanggal</span>
                <span className="font-bold text-brand-cocoa">25 Jul 2026</span>
              </div>
            </div>
          </article>
        </aside>

        <form className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="text-lg font-bold text-brand-cocoa">Data Pembayaran</h3>
              <p className="mt-1 text-sm text-stone-500">Field disiapkan untuk pencatatan nominal, rekening tujuan, dan bukti transfer.</p>
            </div>
            <Link className="inline-flex h-10 w-fit items-center gap-2 rounded-md border border-stone-200 bg-white px-4 text-sm font-bold text-brand-cocoa" href="/pembayaran">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Kembali
            </Link>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <label className="block text-sm font-semibold text-brand-cocoa lg:col-span-2">
              Booking
              <select className="mt-2 h-11 w-full rounded-md border border-stone-200 bg-white px-3 text-sm outline-none" defaultValue={bookingOptions[0]}>
                {bookingOptions.map((booking) => (
                  <option key={booking}>{booking}</option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-semibold text-brand-cocoa">
              Tanggal pembayaran
              <input className="mt-2 h-11 w-full rounded-md border border-stone-200 bg-brand-cream px-3 text-sm outline-none" defaultValue="2026-07-25" type="date" />
            </label>
            <label className="block text-sm font-semibold text-brand-cocoa">
              Nominal
              <input className="mt-2 h-11 w-full rounded-md border border-stone-200 bg-white px-3 text-sm outline-none" defaultValue="7500000" inputMode="numeric" />
            </label>
            <label className="block text-sm font-semibold text-brand-cocoa">
              Metode pembayaran
              <select className="mt-2 h-11 w-full rounded-md border border-stone-200 bg-white px-3 text-sm outline-none" defaultValue="Transfer">
                <option>Transfer</option>
                <option>Tunai</option>
                <option>EDC</option>
              </select>
            </label>
            <label className="block text-sm font-semibold text-brand-cocoa">
              Rekening tujuan
              <select className="mt-2 h-11 w-full rounded-md border border-stone-200 bg-white px-3 text-sm outline-none" defaultValue={accounts[0]}>
                {accounts.map((account) => (
                  <option key={account}>{account}</option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-semibold text-brand-cocoa">
              Status verifikasi
              <select className="mt-2 h-11 w-full rounded-md border border-stone-200 bg-white px-3 text-sm outline-none" defaultValue="Menunggu Cek">
                <option>Menunggu Cek</option>
                <option>Terverifikasi</option>
              </select>
            </label>
            <label className="block text-sm font-semibold text-brand-cocoa">
              Nomor referensi bank
              <input className="mt-2 h-11 w-full rounded-md border border-stone-200 bg-white px-3 text-sm outline-none" defaultValue="TRX-BCA-250726-001" />
            </label>
          </div>

          <section className="mt-6 rounded-lg border border-dashed border-brand-pink bg-brand-cream p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-lg bg-white text-brand-pink">
                  <Upload className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <h4 className="font-bold text-brand-cocoa">Bukti pembayaran</h4>
                  <p className="mt-1 text-sm text-stone-500">Area upload dummy untuk bukti transfer atau foto kuitansi.</p>
                </div>
              </div>
              <button className="h-10 rounded-md border border-stone-200 bg-white px-4 text-sm font-bold text-brand-cocoa" type="button">
                Pilih file
              </button>
            </div>
          </section>

          <section className="mt-6 rounded-lg border border-stone-200 bg-white p-4">
            <div className="flex items-center gap-2 text-sm font-bold text-brand-cocoa">
              <Calculator className="h-4 w-4 text-brand-brown" aria-hidden="true" />
              Simulasi setelah pembayaran
            </div>
            <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
              <div className="rounded-lg bg-brand-cream p-3">
                <p className="text-stone-500">Sisa sebelum</p>
                <p className="mt-1 font-bold text-brand-cocoa">Rp 20.000.000</p>
              </div>
              <div className="rounded-lg bg-brand-cream p-3">
                <p className="text-stone-500">Nominal masuk</p>
                <p className="mt-1 font-bold text-brand-cocoa">Rp 7.500.000</p>
              </div>
              <div className="rounded-lg bg-brand-cream p-3">
                <p className="text-stone-500">Sisa setelah</p>
                <p className="mt-1 font-bold text-brand-cocoa">Rp 12.500.000</p>
              </div>
            </div>
          </section>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button className="h-10 rounded-md border border-stone-200 bg-white px-4 text-sm font-bold text-brand-cocoa" type="button">
              Reset
            </button>
            <button className="h-10 rounded-md bg-brand-cocoa px-4 text-sm font-bold text-white" type="button">
              Simpan pembayaran dummy
            </button>
          </div>
        </form>
      </section>
    </AppShell>
  );
}
