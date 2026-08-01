export type PackageRow = {
  id: string;
  name: string;
  serviceType: string;
  packageType: string;
  itinerary: string;
  basePrice: number;
  durationDays: number;
  makkahHotel: string;
  madinahHotel: string;
  airline: string;
  bonus: string;
  startPoint: string;
  departureDates: string;
  programUmrah: string;
  status: string;
  dpMinimum: string;
  includes: string[];
  excludes: string[];
};

const packageRows: PackageRow[] = [
  {
    id: "pkg-001",
    name: "Umrah Spesial Muharram 1448H (11 Hari GA-980)",
    serviceType: "Umrah Reguler",
    packageType: "Bintang 5 Executive",
    itinerary: "Pangkalpinang - Jakarta CGK - Jeddah - Makkah - Madinah - Pangkalpinang",
    basePrice: 29700000,
    durationDays: 11,
    makkahHotel: "Pullman Zamzam Makkah (Bintang 5)",
    madinahHotel: "Frontel Al Harithia Madinah (Bintang 5)",
    airline: "Garuda Indonesia GA-980 Direct JED",
    bonus: "City Tour Thaif & Kereta Cepat Haramain",
    startPoint: "Depati Amir Pangkalpinang",
    departureDates: "08 - 18 Juli 2026",
    programUmrah: "11 Hari Perjalanan",
    status: "Aktif",
    dpMinimum: "Rp 5.000.000",
    includes: ["Tiket PP Garuda", "Visa Umrah KSA", "Hotel Bintang 5", "Makan 3x Fullboard", "Handling CGK & Saudi", "Asuransi Siskopatuh"],
    excludes: ["Paspor RI", "Pengeluaran Pribadi", "Biaya Excess Baggage"],
  },
];

export function listPackageRows() {
  return packageRows;
}

export function findPackageRow(id: string) {
  return packageRows.find((item) => item.id === id);
}

export function createPackageRow(payload: Omit<PackageRow, "id">) {
  const row = {
    ...payload,
    id: `pkg-${crypto.randomUUID()}`,
  };

  packageRows.push(row);
  return row;
}

export function updatePackageRow(id: string, payload: Partial<Omit<PackageRow, "id">>) {
  const index = packageRows.findIndex((item) => item.id === id);

  if (index === -1) {
    return null;
  }

  const updates = Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined),
  ) as Partial<Omit<PackageRow, "id">>;

  packageRows[index] = {
    ...packageRows[index],
    ...updates,
  };

  return packageRows[index];
}

export function deletePackageRow(id: string) {
  const index = packageRows.findIndex((item) => item.id === id);

  if (index === -1) {
    return false;
  }

  packageRows.splice(index, 1);
  return true;
}
