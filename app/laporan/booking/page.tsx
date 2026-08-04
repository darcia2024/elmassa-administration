import { AppShell } from "@/components/app-shell";
import { ReportNav } from "@/components/report-nav";
import { ComingSoon } from "@/components/coming-soon";

export default function BookingDepartureReportPage() {
  return (
    <AppShell eyebrow="Laporan & Analytics" title="Laporan Penjualan Booking & Okupansi Seat">
      <div className="space-y-5">
        <ReportNav />
        <ComingSoon
          title="Laporan Okupansi Seat Segera Hadir"
          reason="Butuh data kuota & keberangkatan per jadwal penerbangan yang belum ada di sistem booking sekarang -- booking cuma nyimpen teks keberangkatan bebas, bukan jadwal dengan kuota kursi."
        />
      </div>
    </AppShell>
  );
}
