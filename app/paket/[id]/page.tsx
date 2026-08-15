import { AppShell } from "@/components/app-shell";
import { GroupDetail } from "./group-detail";

type GroupDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function GroupDetailPage({ params }: GroupDetailPageProps) {
  const { id } = await params;

  return (
    <AppShell eyebrow="Jadwal Keberangkatan" title="Detail Grup Keberangkatan">
      <GroupDetail packageId={decodeURIComponent(id)} />
    </AppShell>
  );
}
