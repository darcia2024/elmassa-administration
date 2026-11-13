import { getCompanyIdentity } from "@/lib/settings/store";
import { whatsappNumber } from "./present";

export type KatalogContact = {
  name: string;
  legalName: string;
  address: string;
  whatsapp: string;
  phoneLabel: string;
  ppiu: string;
  kemenkumham: string;
  instagram: string;
  mapsUrl: string;
};

// Same values the company identity table is seeded with; used only if that
// table cannot be read, so the public page never loses its contact details.
const FALLBACK: KatalogContact = {
  name: "El Massa Tour & Travel",
  legalName: "PT. Al Massa Azka Wisata",
  address: "Ruko Bes Cinema, Jl. Jendral Sudirman, Selindung Baru, Pangkal Pinang",
  whatsapp: "6281171715125",
  phoneLabel: "+62 811-7171-5125",
  ppiu: "10032300465890002",
  kemenkumham: "AHU-0112355.AH.01.01.",
  instagram: "https://instagram.com/elmassatour",
  mapsUrl: "https://maps.google.com/?q=Ruko+Bes+Cinema+Jl+Jendral+Sudirman+Selindung+Baru+Pangkalpinang",
};

/** Contact block for the katalog, from Pengaturan > Identitas Perusahaan. */
export async function loadKatalogContact(): Promise<KatalogContact> {
  try {
    const id = await getCompanyIdentity();
    if (!id) return FALLBACK;
    return {
      ...FALLBACK,
      name: id.name || FALLBACK.name,
      legalName: id.legalName || FALLBACK.legalName,
      address: id.address || FALLBACK.address,
      whatsapp: id.phone ? whatsappNumber(id.phone) : FALLBACK.whatsapp,
      phoneLabel: id.phone || FALLBACK.phoneLabel,
      ppiu: id.ppiu || FALLBACK.ppiu,
      kemenkumham: id.kemenkumham || FALLBACK.kemenkumham,
      mapsUrl: id.gmapsUrl || FALLBACK.mapsUrl,
    };
  } catch {
    return FALLBACK;
  }
}
