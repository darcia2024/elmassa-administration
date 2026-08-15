import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { LETTER_TYPE_IDS, findLetterType } from "@/lib/letters/store";
import { SuratManager } from "../surat-manager";

/**
 * Satu route per jenis surat.
 *
 * Sebelumnya kelimanya memakai satu route dengan `?jenis=` berbeda. Itu membuat
 * sidebar tidak bisa menandai menu yang aktif: `usePathname()` mengembalikan
 * nilai yang sama untuk kelimanya, sehingga indikator terkunci di menu pertama
 * yang dibuka sampai halaman di-refresh. Path yang berbeda menyelesaikannya di
 * akar, tanpa perlu melacak query string secara manual di shell.
 */

type SuratJenisPageProps = {
  params: Promise<{ jenis: string }>;
};

export function generateStaticParams() {
  return LETTER_TYPE_IDS.map((jenis) => ({ jenis }));
}

export default async function SuratJenisPage({ params }: SuratJenisPageProps) {
  const { jenis } = await params;
  const type = findLetterType(jenis);

  if (!type) notFound();

  return (
    <AppShell eyebrow="Administrasi" title={type.label}>
      <SuratManager initialType={type.id} />
    </AppShell>
  );
}
