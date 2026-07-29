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
      <div className="space-y-5">
        <section className="rounded-2xl border border-stone-200/70 bg-white p-5 sm:p-6 shadow-2xs">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-2xl">
              <div className="mb-3 grid h-10 w-10 place-items-center rounded-xl bg-rose-50 text-brand-pink border border-brand-pink/20">
                <Icon className="h-5 w-5" strokeWidth={1.5} />
              </div>
              <h3 className="text-lg font-bold text-brand-cocoa">{title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-stone-500">{description}</p>
            </div>
            <span className="w-fit rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-[11px] font-semibold text-stone-600">
              Modul El Massa
            </span>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {items.map((item) => (
            <article key={item} className="rounded-2xl border border-stone-200/70 bg-white p-5 shadow-2xs">
              <p className="text-xs font-bold text-brand-cocoa">{item}</p>
              <p className="mt-1.5 text-xs text-stone-500 leading-relaxed">
                Modul ini aktif dan telah terintegrasi dengan sistem navigasi serta tema visual El Massa Travel.
              </p>
            </article>
          ))}
        </section>
      </div>
    </AppShell>
  );
}
