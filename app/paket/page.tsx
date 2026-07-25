import { AppShell } from "@/components/app-shell";
import { getPackagePageRows } from "@/lib/seed-data/derived";
import { PackageList } from "./package-list";

export default function PackagesPage() {
  const { departures, packages } = getPackagePageRows();

  return (
    <AppShell eyebrow="Katalog Layanan" title="Manajemen Paket Wisata">
      <PackageList packages={packages} departures={departures} />
    </AppShell>
  );
}
