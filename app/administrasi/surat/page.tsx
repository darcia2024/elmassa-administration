import { AppShell } from "@/components/app-shell";
import { SuratManager } from "./surat-manager";

type SuratPageProps = {
  /** ?jenis=<type> — how the five per-type menu entries land on this one page. */
  searchParams: Promise<{ jenis?: string }>;
};

export default async function SuratPage({ searchParams }: SuratPageProps) {
  const { jenis } = await searchParams;

  return (
    <AppShell eyebrow="Administrasi" title="Surat Menyurat El Massa">
      <SuratManager initialType={jenis} />
    </AppShell>
  );
}
