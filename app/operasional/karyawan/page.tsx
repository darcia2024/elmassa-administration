import { AppShell } from "@/components/app-shell";
import { KaryawanManager } from "./karyawan-manager";

export default function KaryawanPage() {
  return (
    <AppShell eyebrow="Operasional" title="Data Karyawan El Massa">
      <KaryawanManager />
    </AppShell>
  );
}
