import { Construction } from "lucide-react";

/**
 * Honest placeholder for features that need a data model nobody has built
 * yet (seat/quota tracking, per-participant passport records, an audit log).
 * Showing this beats showing hardcoded sample data that looks real but
 * isn't backed by anything -- see HANDOFF.md section 6.3.
 */
export function ComingSoon({ title, reason }: { title: string; reason: string }) {
  return (
    <section className="rounded-2xl border border-stone-200/70 bg-white p-10 text-center shadow-2xs space-y-3">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
        <Construction className="h-7 w-7" strokeWidth={1.5} />
      </div>
      <div className="space-y-1">
        <h2 className="text-base font-bold text-brand-cocoa">{title}</h2>
        <p className="text-xs text-stone-500 max-w-md mx-auto">{reason}</p>
      </div>
    </section>
  );
}
