export type CompanyIdentityRow = {
  name: string;
  legalName: string;
  kemenkumham: string;
  ppiu: string;
  address: string;
  street: string;
  subdistrict: string;
  district: string;
  city: string;
  province: string;
  complex: string;
  phone: string;
  email: string;
  website: string;
  instagram: string;
  gmapsUrl: string;
  gmapsEmbedUrl: string;
  documentFooter: string;
  logoUrl?: string;
};

const companyIdentity: CompanyIdentityRow = {
  name: "El Massa Tour & Travel",
  legalName: "PT. AL MASSA AZKA WISATA",
  kemenkumham: "AHU-0112355.AH.01.01.",
  ppiu: "10032300465890002",
  address: "Komplek Ruko Best Cinema, Jl. Gabek Raya, Selindung Baru, Kec. Gabek, Kota Pangkalpinang, Bangka Belitung",
  street: "Jl. Gabek Raya",
  subdistrict: "Selindung Baru",
  district: "Kec. Gabek",
  city: "Pangkalpinang",
  province: "Bangka Belitung",
  complex: "Komplek Ruko Best Cinema",
  phone: "081249476778",
  email: "elmassatour@gmail.com",
  website: "www.elmassatour.com",
  instagram: "@elmassa_tour",
  gmapsUrl: "https://maps.google.com/?q=Komplek+Ruko+Best+Cinema+Jln+Gabek+Raya+Selindung+Baru+Pangkalpinang",
  gmapsEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15945.74836691456!2d106.1085!3d-2.105!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e22c156f17d7b05%3A0x6b1076b177894a8c!2sSelindung%20Baru%2C%20Gabek%2C%20Pangkal%20Pinang%20City%2C%20Bangka%20Belitung!5e0!3m2!1sen!2sid!4v1700000000000!5m2!1sen!2sid",
  documentFooter: "Terima kasih telah mempercayakan perjalanan ibadah Anda kepada PT. AL MASSA AZKA WISATA (El Massa Tour). SK Kemenkumham: AHU-0112355.AH.01.01. • No. Izin PPIU: 10032300465890002.",
  logoUrl: "/logo-el-massa.png",
};

export function getCompanyIdentity() {
  return companyIdentity;
}

export function updateCompanyIdentity(payload: Partial<CompanyIdentityRow>) {
  Object.assign(companyIdentity, payload);
  return companyIdentity;
}
