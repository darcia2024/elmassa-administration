import { AppShell } from "@/components/app-shell";
import { RekapGrup } from "@/app/pembayaran/rekap-grup/rekap-grup";

export default function KeuanganPage() {
  return (
    <AppShell eyebrow="Keuangan & Arus Kas" title="Rekapitulasi Keuangan & Laba Rugi Rombongan">
      <RekapGrup />
    </AppShell>
  );
}
