import { AppShell } from "@/components/app-shell";
import { AgendaManager } from "./agenda-manager";

export default function KalenderKegiatanPage() {
  return (
    <AppShell eyebrow="Agenda Operasional" title="Kalender Kegiatan El Massa">
      <AgendaManager />
    </AppShell>
  );
}
