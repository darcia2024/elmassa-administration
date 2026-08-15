import { AppShell } from "@/components/app-shell";
import { AgenManager } from "./agen-manager";

export default function AgenPage() {
  return (
    <AppShell eyebrow="Operasional" title="Data Agen & Komisi">
      <AgenManager />
    </AppShell>
  );
}
