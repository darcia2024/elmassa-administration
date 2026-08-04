import { AppShell } from "@/components/app-shell";
import { ComingSoon } from "@/components/coming-soon";

export default function StaffActivityLogPage() {
  return (
    <AppShell eyebrow="Keamanan & Audit Trail" title="Log Aktivitas & Audit Perubahan Staf (RBAC Tracker)">
      <div className="space-y-5">
        <ComingSoon
          title="Audit Log Staf Segera Hadir"
          reason="Butuh sistem pencatatan setiap perubahan data (siapa, kapan, sebelum/sesudah) di seluruh modul aplikasi -- infrastrukturnya belum dibangun, bukan cuma soal nyambungin ke tabel yang sudah ada."
        />
      </div>
    </AppShell>
  );
}
