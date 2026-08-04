import { AppShell } from "@/components/app-shell";
import { ComingSoon } from "@/components/coming-soon";

export default function ManifestPage() {
  return (
    <AppShell eyebrow="Database Operasional" title="Jamaah Manifest & Flight System">
      <div className="space-y-5">
        <ComingSoon
          title="Manifest Peserta Segera Hadir"
          reason="Butuh data per-jamaah (nomor paspor, e-visa, e-tiket, rooming) yang belum pernah ditangkep di sistem booking -- baru ada jumlah peserta sebagai angka, bukan data tiap orang."
        />
      </div>
    </AppShell>
  );
}
