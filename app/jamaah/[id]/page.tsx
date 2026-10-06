import { AppShell } from "@/components/app-shell";
import { JamaahDetail } from "../jamaah-detail";

type Props = { params: Promise<{ id: string }> };

export default async function JamaahDetailPage({ params }: Props) {
  const { id } = await params;
  const isNew = id === "baru";

  return (
    <AppShell eyebrow="Database Jamaah" title={isNew ? "Tambah Jamaah" : "Profil Jamaah"}>
      <JamaahDetail jamaahId={isNew ? null : decodeURIComponent(id)} />
    </AppShell>
  );
}
