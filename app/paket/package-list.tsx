"use client";

import { useMemo, useState } from "react";
import { CalendarPlus, Edit3, Filter, PackagePlus, Plane, Search } from "lucide-react";

type TravelPackage = {
  id: string;
  name: string;
  type: string;
  category: string;
  priceDisplay: string;
  duration: string;
  departures: number;
  activeBookings: number;
  status: string;
  itinerary: string;
};

type Departure = {
  id: string;
  packageId: string;
  date: string;
  returnDate: string;
  priceDisplay: string;
  quota: number;
  bookedSeats: number;
  meetingPoint: string;
  status: string;
};

type PackageListProps = {
  packages: TravelPackage[];
  departures: Departure[];
};

const typeOptions = ["Semua", "Umrah", "Tour Mancanegara", "Tour Domestik", "Custom"];

const statusStyles: Record<string, string> = {
  Aktif: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Draft: "bg-stone-100 text-stone-700 ring-stone-200",
  Menunggu: "bg-amber-50 text-amber-700 ring-amber-200",
  Terjadwal: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Berangkat: "bg-sky-50 text-sky-700 ring-sky-200",
  Selesai: "bg-brand-rose text-brand-cocoa ring-brand-pink/30",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

export function PackageList({ packages, departures }: PackageListProps) {
  const [query, setQuery] = useState("");
  const [selectedType, setSelectedType] = useState("Semua");
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [selectedPackageId, setSelectedPackageId] = useState(packages[0]?.id ?? "");
  const [departureMode, setDepartureMode] = useState<"create" | "edit">("create");
  const [selectedDepartureId, setSelectedDepartureId] = useState(departures[0]?.id ?? "");

  const selectedPackage = packages.find((item) => item.id === selectedPackageId) ?? packages[0];
  const visibleDepartures = departures.filter((item) => item.packageId === selectedPackageId);
  const selectedDeparture =
    visibleDepartures.find((item) => item.id === selectedDepartureId) ?? visibleDepartures[0] ?? departures[0];

  const filteredPackages = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return packages.filter((item) => {
      const matchesType = selectedType === "Semua" || item.type === selectedType;
      const searchable = `${item.name} ${item.type} ${item.category} ${item.itinerary}`.toLowerCase();
      const matchesQuery = normalizedQuery.length === 0 || searchable.includes(normalizedQuery);

      return matchesType && matchesQuery;
    });
  }, [packages, query, selectedType]);

  const activePackageCount = packages.filter((item) => item.status === "Aktif").length;

  return (
    <>
      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
          <p className="text-sm font-semibold text-stone-500">Total Paket</p>
          <p className="mt-3 text-2xl font-bold text-brand-cocoa">{packages.length}</p>
          <p className="mt-2 text-sm text-stone-500">Data dummy katalog El Massa</p>
        </article>
        <article className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
          <p className="text-sm font-semibold text-stone-500">Paket Aktif</p>
          <p className="mt-3 text-2xl font-bold text-brand-cocoa">{activePackageCount}</p>
          <p className="mt-2 text-sm text-stone-500">Siap dipilih untuk booking</p>
        </article>
        <article className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
          <p className="text-sm font-semibold text-stone-500">Booking Terkait</p>
          <p className="mt-3 text-2xl font-bold text-brand-cocoa">
            {packages.reduce((total, item) => total + item.activeBookings, 0)}
          </p>
          <p className="mt-2 text-sm text-stone-500">Akumulasi dari paket dummy</p>
        </article>
      </section>

      <section className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h3 className="text-lg font-bold text-brand-cocoa">Daftar Paket Wisata</h3>
            <p className="mt-1 text-sm text-stone-500">Kelola paket Umrah, tour, dan layanan custom.</p>
          </div>
          <button className="inline-flex h-10 w-fit items-center gap-2 rounded-md bg-brand-pink px-4 text-sm font-semibold text-white" type="button">
            <PackagePlus className="h-4 w-4" aria-hidden="true" />
            Tambah paket
          </button>
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_260px]">
          <label className="flex h-11 items-center gap-2 rounded-md border border-stone-200 bg-brand-cream px-3 text-sm text-stone-500">
            <Search className="h-4 w-4 shrink-0 text-brand-brown" aria-hidden="true" />
            <input
              className="w-full bg-transparent text-brand-cocoa outline-none placeholder:text-stone-400"
              placeholder="Cari nama paket, itinerary, atau kategori"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>

          <label className="flex h-11 items-center gap-2 rounded-md border border-stone-200 bg-white px-3 text-sm text-stone-600">
            <Filter className="h-4 w-4 shrink-0 text-brand-brown" aria-hidden="true" />
            <select
              className="w-full bg-transparent font-semibold text-brand-cocoa outline-none"
              value={selectedType}
              onChange={(event) => setSelectedType(event.target.value)}
            >
              {typeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-5 grid gap-4 xl:grid-cols-2">
          {filteredPackages.map((item) => (
            <article key={item.id} className="rounded-lg border border-stone-200 bg-white p-5 ring-1 ring-transparent transition hover:ring-brand-rose">
              <div className="flex items-start gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-brand-rose text-brand-pink">
                  <Plane className="h-5 w-5" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-base font-bold text-brand-cocoa">{item.name}</h4>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${statusStyles[item.status]}`}>
                      {item.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-stone-500">{item.itinerary}</p>
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-4">
                <div>
                  <p className="text-xs font-semibold uppercase text-stone-400">Jenis</p>
                  <p className="mt-1 text-sm font-bold text-brand-cocoa">{item.type}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-stone-400">Durasi</p>
                  <p className="mt-1 text-sm font-bold text-brand-cocoa">{item.duration}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-stone-400">Jadwal</p>
                  <p className="mt-1 text-sm font-bold text-brand-cocoa">{item.departures}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-stone-400">Harga</p>
                  <p className="mt-1 text-sm font-bold text-brand-cocoa">{item.priceDisplay}</p>
                </div>
              </div>
            </article>
          ))}
        </div>

        {filteredPackages.length === 0 ? (
          <div className="mt-5 rounded-lg border border-dashed border-stone-300 bg-brand-cream p-8 text-center">
            <p className="font-bold text-brand-cocoa">Paket tidak ditemukan</p>
            <p className="mt-2 text-sm text-stone-500">Coba ubah kata kunci atau filter jenis layanan.</p>
          </div>
        ) : null}
      </section>

      <section className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <article className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
          <h3 className="text-lg font-bold text-brand-cocoa">Mode Formulir</h3>
          <p className="mt-1 text-sm leading-6 text-stone-500">
            Form ini masih memakai data dummy untuk menggambarkan alur tambah dan edit paket.
          </p>

          <div className="mt-5 grid grid-cols-2 gap-2 rounded-md bg-brand-cream p-1">
            <button
              className={`flex h-10 items-center justify-center gap-2 rounded-md text-sm font-bold ${
                formMode === "create" ? "bg-brand-pink text-white" : "text-brand-cocoa"
              }`}
              type="button"
              onClick={() => setFormMode("create")}
            >
              <PackagePlus className="h-4 w-4" aria-hidden="true" />
              Tambah
            </button>
            <button
              className={`flex h-10 items-center justify-center gap-2 rounded-md text-sm font-bold ${
                formMode === "edit" ? "bg-brand-pink text-white" : "text-brand-cocoa"
              }`}
              type="button"
              onClick={() => setFormMode("edit")}
            >
              <Edit3 className="h-4 w-4" aria-hidden="true" />
              Edit
            </button>
          </div>

          <label className="mt-5 block text-sm font-semibold text-brand-cocoa">
            Paket contoh
            <select
              className="mt-2 h-11 w-full rounded-md border border-stone-200 bg-white px-3 text-sm text-brand-cocoa outline-none"
              value={selectedPackageId}
              onChange={(event) => {
                setSelectedPackageId(event.target.value);
                setFormMode("edit");
              }}
            >
              {packages.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
        </article>

        <form
          key={`${formMode}-${selectedPackage?.id}`}
          className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft"
        >
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="text-lg font-bold text-brand-cocoa">
                {formMode === "create" ? "Tambah Paket Wisata" : "Edit Paket Wisata"}
              </h3>
              <p className="mt-1 text-sm text-stone-500">
                {formMode === "create"
                  ? "Isi rancangan paket reguler atau custom baru."
                  : `Mengubah data dummy untuk ${selectedPackage?.name}.`}
              </p>
            </div>
            <span className="w-fit rounded-md bg-brand-cream px-3 py-2 text-xs font-bold uppercase text-brand-brown ring-1 ring-brand-rose">
              UI Only
            </span>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <label className="block text-sm font-semibold text-brand-cocoa">
              Nama paket
              <input
                className="mt-2 h-11 w-full rounded-md border border-stone-200 bg-brand-cream px-3 text-sm outline-none"
                defaultValue={formMode === "edit" ? selectedPackage?.name : ""}
                placeholder="Contoh: Umrah Reguler 12 Hari"
              />
            </label>

            <label className="block text-sm font-semibold text-brand-cocoa">
              Jenis layanan
              <select
                className="mt-2 h-11 w-full rounded-md border border-stone-200 bg-white px-3 text-sm outline-none"
                defaultValue={formMode === "edit" ? selectedPackage?.type : "Umrah"}
              >
                <option>Umrah</option>
                <option>Tour Mancanegara</option>
                <option>Tour Domestik</option>
                <option>Custom</option>
              </select>
            </label>

            <label className="block text-sm font-semibold text-brand-cocoa">
              Kategori paket
              <select
                className="mt-2 h-11 w-full rounded-md border border-stone-200 bg-white px-3 text-sm outline-none"
                defaultValue={formMode === "edit" ? selectedPackage?.category : "Reguler"}
              >
                <option>Reguler</option>
                <option>Custom</option>
                <option>Musiman</option>
              </select>
            </label>

            <label className="block text-sm font-semibold text-brand-cocoa">
              Durasi
              <input
                className="mt-2 h-11 w-full rounded-md border border-stone-200 bg-brand-cream px-3 text-sm outline-none"
                defaultValue={formMode === "edit" ? selectedPackage?.duration : ""}
                placeholder="Contoh: 12 hari"
              />
            </label>

            <label className="block text-sm font-semibold text-brand-cocoa">
              Harga dasar
              <input
                className="mt-2 h-11 w-full rounded-md border border-stone-200 bg-brand-cream px-3 text-sm outline-none"
                defaultValue={formMode === "edit" ? selectedPackage?.priceDisplay : ""}
                placeholder="Contoh: Rp 32.500.000"
              />
            </label>

            <label className="block text-sm font-semibold text-brand-cocoa">
              Status
              <select
                className="mt-2 h-11 w-full rounded-md border border-stone-200 bg-white px-3 text-sm outline-none"
                defaultValue={formMode === "edit" ? selectedPackage?.status : "Draft"}
              >
                <option>Draft</option>
                <option>Aktif</option>
                <option>Menunggu</option>
              </select>
            </label>

            <label className="block text-sm font-semibold text-brand-cocoa lg:col-span-2">
              Itinerary ringkas
              <textarea
                className="mt-2 min-h-28 w-full rounded-md border border-stone-200 bg-brand-cream px-3 py-3 text-sm outline-none"
                defaultValue={formMode === "edit" ? selectedPackage?.itinerary : ""}
                placeholder="Tulis rute, kota tujuan, atau catatan layanan custom"
              />
            </label>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button className="h-10 rounded-md border border-stone-200 bg-white px-4 text-sm font-bold text-brand-cocoa" type="button">
              Reset
            </button>
            <button className="h-10 rounded-md bg-brand-cocoa px-4 text-sm font-bold text-white" type="button">
              Simpan dummy
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h3 className="text-lg font-bold text-brand-cocoa">Jadwal Keberangkatan per Paket</h3>
            <p className="mt-1 text-sm text-stone-500">
              Data dummy untuk mengatur tanggal berangkat, kuota, harga, dan meeting point.
            </p>
          </div>
          <label className="block min-w-72 text-sm font-semibold text-brand-cocoa">
            Pilih paket
            <select
              className="mt-2 h-11 w-full rounded-md border border-stone-200 bg-white px-3 text-sm outline-none"
              value={selectedPackageId}
              onChange={(event) => {
                const nextPackageId = event.target.value;
                setSelectedPackageId(nextPackageId);
                setSelectedDepartureId(departures.find((item) => item.packageId === nextPackageId)?.id ?? "");
              }}
            >
              {packages.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_420px]">
          <div className="overflow-x-auto rounded-lg border border-stone-200">
            <table className="w-full min-w-[760px] border-collapse text-left text-sm">
              <thead className="bg-brand-cream text-xs uppercase text-stone-500">
                <tr>
                  <th className="px-4 py-3 font-bold">Berangkat</th>
                  <th className="px-4 py-3 font-bold">Pulang</th>
                  <th className="px-4 py-3 font-bold">Kuota</th>
                  <th className="px-4 py-3 font-bold">Harga</th>
                  <th className="px-4 py-3 font-bold">Meeting point</th>
                  <th className="px-4 py-3 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 bg-white">
                {visibleDepartures.map((item) => (
                  <tr
                    key={item.id}
                    className="cursor-pointer text-stone-700 hover:bg-brand-cream"
                    onClick={() => {
                      setSelectedDepartureId(item.id);
                      setDepartureMode("edit");
                    }}
                  >
                    <td className="px-4 py-4 font-bold text-brand-cocoa">{formatDate(item.date)}</td>
                    <td className="px-4 py-4">{formatDate(item.returnDate)}</td>
                    <td className="px-4 py-4">
                      {item.bookedSeats}/{item.quota}
                    </td>
                    <td className="px-4 py-4 font-semibold">{item.priceDisplay}</td>
                    <td className="px-4 py-4">{item.meetingPoint}</td>
                    <td className="px-4 py-4">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${statusStyles[item.status] ?? statusStyles.Draft}`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {visibleDepartures.length === 0 ? (
              <div className="p-6 text-center text-sm text-stone-500">Belum ada jadwal untuk paket ini.</div>
            ) : null}
          </div>

          <form
            key={`${departureMode}-${selectedDeparture?.id}-${selectedPackageId}`}
            className="rounded-lg border border-stone-200 bg-brand-cream p-5"
          >
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <h4 className="font-bold text-brand-cocoa">
                  {departureMode === "create" ? "Tambah Jadwal" : "Edit Jadwal"}
                </h4>
                <p className="mt-1 text-sm text-stone-500">Form jadwal masih UI dummy.</p>
              </div>
              <button
                className="inline-flex h-9 items-center gap-2 rounded-md bg-brand-pink px-3 text-sm font-bold text-white"
                type="button"
                onClick={() => setDepartureMode("create")}
              >
                <CalendarPlus className="h-4 w-4" aria-hidden="true" />
                Baru
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-semibold text-brand-cocoa">
                Tanggal berangkat
                <input
                  className="mt-2 h-11 w-full rounded-md border border-stone-200 bg-white px-3 text-sm outline-none"
                  defaultValue={departureMode === "edit" ? selectedDeparture?.date : ""}
                  type="date"
                />
              </label>
              <label className="block text-sm font-semibold text-brand-cocoa">
                Tanggal pulang
                <input
                  className="mt-2 h-11 w-full rounded-md border border-stone-200 bg-white px-3 text-sm outline-none"
                  defaultValue={departureMode === "edit" ? selectedDeparture?.returnDate : ""}
                  type="date"
                />
              </label>
              <label className="block text-sm font-semibold text-brand-cocoa">
                Kuota
                <input
                  className="mt-2 h-11 w-full rounded-md border border-stone-200 bg-white px-3 text-sm outline-none"
                  defaultValue={departureMode === "edit" ? selectedDeparture?.quota : ""}
                  placeholder="45"
                  type="number"
                />
              </label>
              <label className="block text-sm font-semibold text-brand-cocoa">
                Harga
                <input
                  className="mt-2 h-11 w-full rounded-md border border-stone-200 bg-white px-3 text-sm outline-none"
                  defaultValue={departureMode === "edit" ? selectedDeparture?.priceDisplay : ""}
                  placeholder="Rp 32.500.000"
                />
              </label>
              <label className="block text-sm font-semibold text-brand-cocoa sm:col-span-2">
                Meeting point
                <input
                  className="mt-2 h-11 w-full rounded-md border border-stone-200 bg-white px-3 text-sm outline-none"
                  defaultValue={departureMode === "edit" ? selectedDeparture?.meetingPoint : ""}
                  placeholder="Bandara / kantor / menyesuaikan rombongan"
                />
              </label>
              <label className="block text-sm font-semibold text-brand-cocoa sm:col-span-2">
                Status
                <select
                  className="mt-2 h-11 w-full rounded-md border border-stone-200 bg-white px-3 text-sm outline-none"
                  defaultValue={departureMode === "edit" ? selectedDeparture?.status : "Terjadwal"}
                >
                  <option>Draft</option>
                  <option>Terjadwal</option>
                  <option>Berangkat</option>
                  <option>Selesai</option>
                </select>
              </label>
            </div>

            <div className="mt-5 flex justify-end">
              <button className="h-10 rounded-md bg-brand-cocoa px-4 text-sm font-bold text-white" type="button">
                Simpan jadwal dummy
              </button>
            </div>
          </form>
        </div>
      </section>
    </>
  );
}
