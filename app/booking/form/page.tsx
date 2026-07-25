import { ClipboardList, Plus, Users } from "lucide-react";
import { AppShell } from "@/components/app-shell";

const customers = [
  "Siti Rahma",
];
const departures = [
  "Umrah Reguler 12 Hari - 12 Agu 2026",
];

const participants = [
  { name: "Siti Rahma", passport: "C1234567", contact: "0812-4455-7788" },
];

export default function BookingFormPage() {
  return (
    <AppShell eyebrow="Operasional Booking" title="Form Booking">
      <section className="grid gap-6 xl:grid-cols-[340px_1fr]">
        <aside className="space-y-4">
          <article className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
            <div className="grid h-12 w-12 place-items-center rounded-lg bg-brand-rose text-brand-pink">
              <ClipboardList className="h-6 w-6" aria-hidden="true" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-brand-cocoa">Create / Edit Booking</h3>
            <p className="mt-2 text-sm leading-6 text-stone-500">
              Form dummy untuk alur pendaftaran pelanggan, pemilihan jadwal, peserta, dan nilai tagihan.
            </p>
          </article>

          <article className="rounded-lg border border-stone-200 bg-brand-cream p-5">
            <p className="text-sm font-bold text-brand-cocoa">Ringkasan dummy</p>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-3">
                <span className="text-stone-500">Total peserta</span>
                <span className="font-bold text-brand-cocoa">2</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-stone-500">Total tagihan</span>
                <span className="font-bold text-brand-cocoa">Rp 65.000.000</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-stone-500">Status awal</span>
                <span className="font-bold text-brand-cocoa">Belum Bayar</span>
              </div>
            </div>
          </article>
        </aside>

        <form className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="text-lg font-bold text-brand-cocoa">Data Booking</h3>
              <p className="mt-1 text-sm text-stone-500">Field dibuat lengkap untuk create dan edit, tetapi belum tersimpan ke backend.</p>
            </div>
            <span className="w-fit rounded-md bg-brand-cream px-3 py-2 text-xs font-bold uppercase text-brand-brown ring-1 ring-brand-rose">
              UI Only
            </span>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <label className="block text-sm font-semibold text-brand-cocoa">
              Mode
              <select className="mt-2 h-11 w-full rounded-md border border-stone-200 bg-white px-3 text-sm outline-none" defaultValue="Create">
                <option>Create</option>
                <option>Edit BK-2407-018</option>
              </select>
            </label>
            <label className="block text-sm font-semibold text-brand-cocoa">
              Tanggal booking
              <input className="mt-2 h-11 w-full rounded-md border border-stone-200 bg-brand-cream px-3 text-sm outline-none" defaultValue="2026-07-25" type="date" />
            </label>
            <label className="block text-sm font-semibold text-brand-cocoa">
              Pelanggan
              <select className="mt-2 h-11 w-full rounded-md border border-stone-200 bg-white px-3 text-sm outline-none" defaultValue="Siti Rahma">
                {customers.map((customer) => (
                  <option key={customer}>{customer}</option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-semibold text-brand-cocoa">
              Jadwal keberangkatan
              <select className="mt-2 h-11 w-full rounded-md border border-stone-200 bg-white px-3 text-sm outline-none" defaultValue={departures[0]}>
                {departures.map((departure) => (
                  <option key={departure}>{departure}</option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-semibold text-brand-cocoa">
              Harga per peserta
              <input className="mt-2 h-11 w-full rounded-md border border-stone-200 bg-brand-cream px-3 text-sm outline-none" defaultValue="Rp 32.500.000" />
            </label>
            <label className="block text-sm font-semibold text-brand-cocoa">
              Status booking
              <select className="mt-2 h-11 w-full rounded-md border border-stone-200 bg-white px-3 text-sm outline-none" defaultValue="Belum Bayar">
                <option>Belum Bayar</option>
                <option>DP</option>
                <option>Lunas</option>
                <option>Dibatalkan</option>
                <option>Refund</option>
              </select>
            </label>
          </div>

          <section className="mt-6 rounded-lg border border-stone-200 bg-brand-cream p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h4 className="font-bold text-brand-cocoa">Peserta</h4>
              <button className="inline-flex h-9 items-center gap-2 rounded-md bg-brand-pink px-3 text-sm font-bold text-white" type="button">
                <Plus className="h-4 w-4" aria-hidden="true" />
                Tambah peserta
              </button>
            </div>
            <div className="grid gap-3">
              {participants.map((participant, index) => (
                <div key={index} className="grid gap-3 rounded-lg border border-stone-200 bg-white p-4 lg:grid-cols-3">
                  <label className="block text-sm font-semibold text-brand-cocoa">
                    Nama peserta
                    <input className="mt-2 h-10 w-full rounded-md border border-stone-200 bg-white px-3 text-sm outline-none" defaultValue={participant.name} />
                  </label>
                  <label className="block text-sm font-semibold text-brand-cocoa">
                    Nomor paspor
                    <input className="mt-2 h-10 w-full rounded-md border border-stone-200 bg-white px-3 text-sm outline-none" defaultValue={participant.passport} />
                  </label>
                  <label className="block text-sm font-semibold text-brand-cocoa">
                    Kontak
                    <input className="mt-2 h-10 w-full rounded-md border border-stone-200 bg-white px-3 text-sm outline-none" defaultValue={participant.contact} />
                  </label>
                </div>
              ))}
            </div>
          </section>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-stone-500">
              <Users className="h-4 w-4" aria-hidden="true" />
              Peserta dapat ditambah nanti saat detail booking.
            </p>
            <div className="flex gap-3">
              <button className="h-10 rounded-md border border-stone-200 bg-white px-4 text-sm font-bold text-brand-cocoa" type="button">
                Reset
              </button>
              <button className="h-10 rounded-md bg-brand-cocoa px-4 text-sm font-bold text-white" type="button">
                Simpan booking dummy
              </button>
            </div>
          </div>
        </form>
      </section>
    </AppShell>
  );
}
