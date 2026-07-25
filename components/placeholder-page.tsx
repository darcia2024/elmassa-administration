import type { LucideIcon } from "lucide-react";
import { AppShell } from "@/components/app-shell";

type PlaceholderPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  icon: LucideIcon;
  items: string[];
};

export function PlaceholderPage({
  eyebrow,
  title,
  description,
  icon: Icon,
  items,
}: PlaceholderPageProps) {
  return (
    <AppShell eyebrow={eyebrow} title={title}>
      <section className="rounded-lg border border-stone-200 bg-white p-6 shadow-soft">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-2xl">
            <div className="mb-4 grid h-12 w-12 place-items-center rounded-lg bg-brand-rose text-brand-pink">
              <Icon className="h-6 w-6" aria-hidden="true" />
            </div>
            <h3 className="text-xl font-bold text-brand-cocoa">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-stone-600">{description}</p>
          </div>
          <span className="w-fit rounded-md bg-brand-cream px-3 py-2 text-xs font-bold uppercase text-brand-brown ring-1 ring-brand-rose">
            Contoh Layout
          </span>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {items.map((item) => (
          <article key={item} className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
            <p className="text-sm font-semibold text-brand-cocoa">{item}</p>
            <p className="mt-2 text-sm leading-6 text-stone-500">
              Area ini disiapkan untuk validasi navigasi dan konsistensi shell sebelum fitur lengkap dibangun.
            </p>
          </article>
        ))}
      </section>
    </AppShell>
  );
}
