import type { Metadata } from "next";
import { listKatalogPackages, type KatalogPackage } from "@/lib/katalog/store";
import { loadKatalogContact } from "@/lib/katalog/contact";
import { PELUNASAN_LEAD_DAYS } from "@/lib/agenda/store";
import includesSeed from "@/lib/katalog/katalog-seed.json";
import { KatalogHome } from "./katalog-home";

// Rendered once and served from the CDN; regenerated at most once a minute.
// Thousands of visitors from a WhatsApp blast cost the database one query a
// minute, and a new booking still shows up in the seat count within ~60s.
export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const packages = await listKatalogPackages().catch(() => [] as KatalogPackage[]);
  const cover = packages.find((p) => p.posterUrl)?.posterUrl;
  // The first upcoming poster becomes the WhatsApp/Facebook link preview.
  return cover ? { openGraph: { images: [{ url: cover }] } } : {};
}

export default async function PosterKatalogPage() {
  const [packages, contact] = await Promise.all([
    listKatalogPackages().catch((err) => {
      console.error("Katalog gagal memuat paket:", err);
      return null;
    }),
    loadKatalogContact(),
  ]);

  // Standard El Massa inclusions/exclusions, for the FAQ.
  const standard = includesSeed[0];

  return (
    <KatalogHome
      packages={packages}
      contact={contact}
      lunasDays={PELUNASAN_LEAD_DAYS}
      includes={standard?.includes ?? []}
      excludes={standard?.excludes ?? []}
    />
  );
}
