import { AppShell } from "@/components/app-shell";
import { PackageList } from "./package-list";

export default function PackagesPage() {
  return (
    <AppShell eyebrow="Katalog Layanan" title="Katalog Paket Umrah El Massa">
      <PackageList />
    </AppShell>
  );
}
