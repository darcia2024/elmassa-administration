import { AppShell } from "@/components/app-shell";
import { StokManager } from "./stok-manager";

export default function StokPage() {
  return (
    <AppShell eyebrow="Operasional" title="Stok Perlengkapan Jamaah">
      <StokManager />
    </AppShell>
  );
}
