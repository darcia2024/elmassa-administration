import { AppShell } from "@/components/app-shell";
import { SuratManager } from "./surat-manager";

/** Hub semua surat. Tiap jenis punya routenya sendiri di [jenis]/page.tsx. */
export default function SuratPage() {
  return (
    <AppShell eyebrow="Administrasi" title="Surat Menyurat El Massa">
      <SuratManager />
    </AppShell>
  );
}
