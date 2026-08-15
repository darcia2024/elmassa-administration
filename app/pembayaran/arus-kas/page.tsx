import { AppShell } from "@/components/app-shell";
import { ArusKas } from "./arus-kas";

export default function ArusKasPage() {
  return (
    <AppShell eyebrow="Pembayaran" title="Pemasukan & Pengeluaran">
      <ArusKas />
    </AppShell>
  );
}
