import { AppShell } from "@/components/app-shell";

const dummyPanels = [
  { label: "Sidebar", value: "11 menu", note: "Pink aktif, cokelat hover" },
];

export default function LayoutPreviewPage() {
  return (
    <AppShell eyebrow="Validasi Layout" title="Layout Utama El Massa">
      <section className="rounded-lg border border-stone-200 bg-white p-6 shadow-soft">
        <h3 className="text-xl font-bold text-brand-cocoa">Preview Shell Aplikasi</h3>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-stone-600">
          Halaman contoh ini memakai data dummy untuk memvalidasi sidebar, navbar, identitas visual,
          area konten, dan perilaku responsif sebelum modul operasional dilengkapi.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {dummyPanels.map((panel) => (
          <article key={panel.label} className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
            <p className="text-sm font-semibold text-stone-500">{panel.label}</p>
            <p className="mt-3 text-2xl font-bold text-brand-cocoa">{panel.value}</p>
            <p className="mt-2 text-sm text-stone-600">{panel.note}</p>
          </article>
        ))}
      </section>

      <section className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {["Dashboard", "Paket", "Booking", "Pembayaran"].map((label) => (
            <div key={label} className="rounded-md bg-brand-cream p-4 ring-1 ring-brand-rose">
              <p className="text-sm font-bold text-brand-cocoa">{label}</p>
              <p className="mt-1 text-xs leading-5 text-stone-600">Slot konten dummy untuk validasi grid.</p>
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
