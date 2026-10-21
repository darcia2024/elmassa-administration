import { Suspense } from "react";
import { AppShell } from "@/components/app-shell";
import { JamaahList } from "./jamaah-list";

export default function JamaahPage() {
  return (
    <AppShell eyebrow="Operasional" title="Database Jamaah">
      <Suspense fallback={<div className="p-8 text-center text-xs text-stone-500">Memuat database jamaah…</div>}>
        <JamaahList />
      </Suspense>
    </AppShell>
  );
}
