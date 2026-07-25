import { CalendarDays, PlaneTakeoff, Users } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { ScheduleCrud } from "./schedule-crud";

const schedules = [
  {
    id: "dep-umr-20260812",
    packageName: "Umrah Reguler 12 Hari",
    type: "Umrah",
    departureDate: "12 Agu 2026",
    returnDate: "24 Agu 2026",
    quota: 45,
    bookedSeats: 38,
    priceDisplay: "Rp 32.500.000",
    meetingPoint: "Bandara Soekarno-Hatta Terminal 3",
    status: "Terjadwal",
  },
];

const statusStyles: Record<string, string> = {
  Terjadwal: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Draft: "bg-stone-100 text-stone-700 ring-stone-200",
};

export default function DeparturesPage() {
  const totalQuota = schedules.reduce((total, item) => total + item.quota, 0);
  const totalBooked = schedules.reduce((total, item) => total + item.bookedSeats, 0);

  return (
    <AppShell eyebrow="Jadwal Keberangkatan" title="Manajemen Jadwal">
      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
          <p className="text-sm font-semibold text-stone-500">Total Jadwal</p>
          <p className="mt-3 text-2xl font-bold text-brand-cocoa">{schedules.length}</p>
          <p className="mt-2 text-sm text-stone-500">Data keberangkatan dummy</p>
        </article>
        <article className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
          <p className="text-sm font-semibold text-stone-500">Kursi Terisi</p>
          <p className="mt-3 text-2xl font-bold text-brand-cocoa">{totalBooked}</p>
          <p className="mt-2 text-sm text-stone-500">Dari {totalQuota} total kuota</p>
        </article>
        <article className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
          <p className="text-sm font-semibold text-stone-500">Sisa Kuota</p>
          <p className="mt-3 text-2xl font-bold text-brand-cocoa">{totalQuota - totalBooked}</p>
          <p className="mt-2 text-sm text-stone-500">Masih tersedia untuk booking</p>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <article className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-bold text-brand-cocoa">Daftar Jadwal</h3>
              <p className="mt-1 text-sm text-stone-500">Tanggal, kuota, harga, meeting point, dan status keberangkatan.</p>
            </div>
            <button className="inline-flex h-10 w-fit items-center gap-2 rounded-md bg-brand-pink px-4 text-sm font-bold text-white" type="button">
              <CalendarDays className="h-4 w-4" aria-hidden="true" />
              Tambah jadwal
            </button>
          </div>

          <div className="overflow-x-auto rounded-lg border border-stone-200">
            <table className="w-full min-w-[900px] border-collapse text-left text-sm">
              <thead className="bg-brand-cream text-xs uppercase text-stone-500">
                <tr>
                  <th className="px-4 py-3 font-bold">Paket</th>
                  <th className="px-4 py-3 font-bold">Berangkat</th>
                  <th className="px-4 py-3 font-bold">Pulang</th>
                  <th className="px-4 py-3 font-bold">Kuota</th>
                  <th className="px-4 py-3 font-bold">Harga</th>
                  <th className="px-4 py-3 font-bold">Meeting point</th>
                  <th className="px-4 py-3 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 bg-white">
                {schedules.map((item) => (
                  <tr key={item.id} className="text-stone-700 hover:bg-brand-cream">
                    <td className="px-4 py-4">
                      <p className="font-bold text-brand-cocoa">{item.packageName}</p>
                      <p className="mt-1 text-xs text-stone-500">{item.type}</p>
                    </td>
                    <td className="px-4 py-4 font-semibold">{item.departureDate}</td>
                    <td className="px-4 py-4">{item.returnDate}</td>
                    <td className="px-4 py-4">
                      <span className="font-bold text-brand-cocoa">{item.bookedSeats}</span>/{item.quota}
                    </td>
                    <td className="px-4 py-4 font-semibold">{item.priceDisplay}</td>
                    <td className="px-4 py-4">{item.meetingPoint}</td>
                    <td className="px-4 py-4">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${statusStyles[item.status]}`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <aside className="space-y-4">
          {schedules.slice(0, 3).map((item) => (
            <article key={item.id} className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
              <div className="mb-4 flex items-center justify-between gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-md bg-brand-rose text-brand-pink">
                  <PlaneTakeoff className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="rounded-md bg-brand-cream px-2.5 py-1 text-xs font-bold text-brand-brown">
                  {item.departureDate}
                </span>
              </div>
              <h4 className="font-bold text-brand-cocoa">{item.packageName}</h4>
              <p className="mt-2 flex items-center gap-2 text-sm text-stone-500">
                <Users className="h-4 w-4" aria-hidden="true" />
                {item.bookedSeats}/{item.quota} kursi terisi
              </p>
            </article>
          ))}
        </aside>
      </section>

      <section className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="text-lg font-bold text-brand-cocoa">Form Tambah Jadwal</h3>
            <p className="mt-1 text-sm text-stone-500">Komponen formulir dummy untuk jadwal keberangkatan baru.</p>
          </div>
          <span className="w-fit rounded-md bg-brand-cream px-3 py-2 text-xs font-bold uppercase text-brand-brown ring-1 ring-brand-rose">
            UI Only
          </span>
        </div>

        <form className="grid gap-4 lg:grid-cols-3">
          <label className="block text-sm font-semibold text-brand-cocoa">
            Paket wisata
            <select className="mt-2 h-11 w-full rounded-md border border-stone-200 bg-white px-3 text-sm outline-none" defaultValue="Umrah Reguler 12 Hari">
              {schedules.map((item) => (
                <option key={item.id}>{item.packageName}</option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-semibold text-brand-cocoa">
            Tanggal berangkat
            <input className="mt-2 h-11 w-full rounded-md border border-stone-200 bg-brand-cream px-3 text-sm outline-none" type="date" />
          </label>
          <label className="block text-sm font-semibold text-brand-cocoa">
            Tanggal pulang
            <input className="mt-2 h-11 w-full rounded-md border border-stone-200 bg-brand-cream px-3 text-sm outline-none" type="date" />
          </label>
          <label className="block text-sm font-semibold text-brand-cocoa">
            Kuota
            <input className="mt-2 h-11 w-full rounded-md border border-stone-200 bg-brand-cream px-3 text-sm outline-none" placeholder="45" type="number" />
          </label>
          <label className="block text-sm font-semibold text-brand-cocoa">
            Harga per peserta
            <input className="mt-2 h-11 w-full rounded-md border border-stone-200 bg-brand-cream px-3 text-sm outline-none" placeholder="Rp 32.500.000" />
          </label>
          <label className="block text-sm font-semibold text-brand-cocoa">
            Status
            <select className="mt-2 h-11 w-full rounded-md border border-stone-200 bg-white px-3 text-sm outline-none" defaultValue="Terjadwal">
              <option>Draft</option>
              <option>Terjadwal</option>
              <option>Berangkat</option>
              <option>Selesai</option>
            </select>
          </label>
          <label className="block text-sm font-semibold text-brand-cocoa lg:col-span-2">
            Meeting point
            <input className="mt-2 h-11 w-full rounded-md border border-stone-200 bg-brand-cream px-3 text-sm outline-none" placeholder="Bandara / kantor / titik kumpul" />
          </label>
          <label className="block text-sm font-semibold text-brand-cocoa">
            Catatan internal
            <input className="mt-2 h-11 w-full rounded-md border border-stone-200 bg-brand-cream px-3 text-sm outline-none" placeholder="Opsional" />
          </label>
          <div className="flex flex-col gap-3 lg:col-span-3 sm:flex-row sm:justify-end">
            <button className="h-10 rounded-md border border-stone-200 bg-white px-4 text-sm font-bold text-brand-cocoa" type="button">
              Reset
            </button>
            <button className="h-10 rounded-md bg-brand-cocoa px-4 text-sm font-bold text-white" type="button">
              Simpan jadwal dummy
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="text-lg font-bold text-brand-cocoa">Form Edit Jadwal</h3>
            <p className="mt-1 text-sm text-stone-500">
              Contoh form edit memakai jadwal {schedules[0].packageName} sebagai data awal.
            </p>
          </div>
          <span className="w-fit rounded-md bg-amber-50 px-3 py-2 text-xs font-bold uppercase text-amber-700 ring-1 ring-amber-200">
            Edit dummy
          </span>
        </div>

        <form className="grid gap-4 lg:grid-cols-3">
          <label className="block text-sm font-semibold text-brand-cocoa">
            Paket wisata
            <input
              className="mt-2 h-11 w-full rounded-md border border-stone-200 bg-brand-cream px-3 text-sm outline-none"
              defaultValue={schedules[0].packageName}
            />
          </label>
          <label className="block text-sm font-semibold text-brand-cocoa">
            Tanggal berangkat
            <input
              className="mt-2 h-11 w-full rounded-md border border-stone-200 bg-brand-cream px-3 text-sm outline-none"
              defaultValue="2026-08-12"
              type="date"
            />
          </label>
          <label className="block text-sm font-semibold text-brand-cocoa">
            Tanggal pulang
            <input
              className="mt-2 h-11 w-full rounded-md border border-stone-200 bg-brand-cream px-3 text-sm outline-none"
              defaultValue="2026-08-24"
              type="date"
            />
          </label>
          <label className="block text-sm font-semibold text-brand-cocoa">
            Kuota
            <input
              className="mt-2 h-11 w-full rounded-md border border-stone-200 bg-brand-cream px-3 text-sm outline-none"
              defaultValue={schedules[0].quota}
              type="number"
            />
          </label>
          <label className="block text-sm font-semibold text-brand-cocoa">
            Harga per peserta
            <input
              className="mt-2 h-11 w-full rounded-md border border-stone-200 bg-brand-cream px-3 text-sm outline-none"
              defaultValue={schedules[0].priceDisplay}
            />
          </label>
          <label className="block text-sm font-semibold text-brand-cocoa">
            Status
            <select className="mt-2 h-11 w-full rounded-md border border-stone-200 bg-white px-3 text-sm outline-none" defaultValue={schedules[0].status}>
              <option>Draft</option>
              <option>Terjadwal</option>
              <option>Berangkat</option>
              <option>Selesai</option>
            </select>
          </label>
          <label className="block text-sm font-semibold text-brand-cocoa lg:col-span-2">
            Meeting point
            <input
              className="mt-2 h-11 w-full rounded-md border border-stone-200 bg-brand-cream px-3 text-sm outline-none"
              defaultValue={schedules[0].meetingPoint}
            />
          </label>
          <label className="block text-sm font-semibold text-brand-cocoa">
            Kursi terisi
            <input
              className="mt-2 h-11 w-full rounded-md border border-stone-200 bg-brand-cream px-3 text-sm outline-none"
              defaultValue={schedules[0].bookedSeats}
              type="number"
            />
          </label>
          <div className="flex flex-col gap-3 lg:col-span-3 sm:flex-row sm:justify-end">
            <button className="h-10 rounded-md border border-stone-200 bg-white px-4 text-sm font-bold text-brand-cocoa" type="button">
              Batal
            </button>
            <button className="h-10 rounded-md bg-brand-cocoa px-4 text-sm font-bold text-white" type="button">
              Update jadwal dummy
            </button>
          </div>
        </form>
      </section>

      <ScheduleCrud />
    </AppShell>
  );
}
