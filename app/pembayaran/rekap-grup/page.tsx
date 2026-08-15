import { AppShell } from "@/components/app-shell";
import { RekapGrup } from "./rekap-grup";

export default function RekapGrupPage() {
  return (
    <AppShell eyebrow="Pembayaran" title="Rekap Pembayaran per Grup">
      <RekapGrup />
    </AppShell>
  );
}
