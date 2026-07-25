export type CompanyIdentityRow = {
  id: string;
  name: string;
  legalName: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  logoUrl: string;
  documentFooter: string;
};

let companyIdentity: CompanyIdentityRow = {
  id: "company-el-massa",
  name: "El Massa Tour & Travel",
  legalName: "PT El Massa Wisata",
  address: "Jl. Kemang Pratama, Bekasi",
  phone: "021-8899-1020",
  email: "admin@elmassa-travel.test",
  website: "www.elmassa-travel.test",
  logoUrl: "",
  documentFooter: "Terima kasih atas kepercayaan Anda kepada El Massa Tour & Travel.",
};

export function getCompanyIdentity() {
  return companyIdentity;
}

export function updateCompanyIdentity(payload: Partial<Omit<CompanyIdentityRow, "id">>) {
  const updates = Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined),
  ) as Partial<Omit<CompanyIdentityRow, "id">>;

  companyIdentity = {
    ...companyIdentity,
    ...updates,
  };

  return companyIdentity;
}
