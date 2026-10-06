import { AppShell } from "@/components/app-shell";
import { JamaahList } from "./jamaah-list";

export default function JamaahPage() {
  return (
    <AppShell eyebrow="Operasional" title="Database Jamaah">
      <JamaahList />
    </AppShell>
  );
}
