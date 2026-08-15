import { AppShell } from "@/components/app-shell";
import { PackageList } from "./package-list";

export default function PackagesPage() {
  return (
    <AppShell eyebrow="Operasional Keberangkatan" title="Jadwal Keberangkatan El Massa">
      <PackageList />
    </AppShell>
  );
}
