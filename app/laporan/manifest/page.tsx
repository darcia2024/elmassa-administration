import { AppShell } from "@/components/app-shell";
import { ReportNav } from "@/components/report-nav";
import { ComingSoon } from "@/components/coming-soon";

export default function ManifestReportPage() {
  return (
    <AppShell eyebrow="Laporan & Analytics" title="Laporan Manifest Keberangkatan & Verifikasi Imigrasi">
      <div className="space-y-5">
        <ReportNav />
        <ComingSoon
          title="Laporan Manifest Segera Hadir"
          reason="Butuh data per-jamaah (nomor paspor, e-visa, e-tiket) yang belum pernah ditangkep -- booking cuma nyimpen jumlah peserta sebagai angka, bukan data tiap orang."
        />
      </div>
    </AppShell>
  );
}
