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
    id: "pkg-umrah-oktober-12d",
    name: "Umrah Spesial Oktober (Dapat 2x Jum'at)",
    serviceType: "Umrah",
    packageType: "Umrah Spesial Oktober",
    itinerary: "Pangkal Pinang (PGK) - Jakarta (CGK) - Jeddah/Madinah (Saudia & Garuda Indonesia), Makkah, Madinah, City Tour Thaif, Jabal Magnet",
    basePrice: 33500000,
    durationDays: 12,
    makkahHotel: "Grand Al Massa",
    madinahHotel: "Daar El Naeem",
    airline: "Saudia / Garuda Indonesia",
    bonus: "Free City Tour Thaif & Pabrik Parfum, Free Jabal Magnet, Ayam Albaik & Zam-zam 5L",
    startPoint: "Pangkal Pinang",
    departureDates: "1 - 12 Oktober 2026",
    programUmrah: "Program Umrah 3 Kali + 2x Shalat Jum'at",
    status: "Aktif",
    dpMinimum: "Rp 5.000.000",
    includes: [
      "Tiket pesawat PP PGK - CGK - PGK (Garuda Indonesia)",
      "Tiket pesawat PP CGK - JED/MED - CGK (Saudia / Garuda)",
      "Visa Umrah KSA",
      "Bagasi 1x23kg + Koper Exclusive",
      "Hotel Makkah (Grand Al Massa) & Madinah (Daar El Naeem)",
      "Perlengkapan Umrah Lengkap",
      "Tour Leader & Muthawwif Berpengalaman",
      "Handling Bandara Jakarta & Jeddah",
      "Bus AC Modern Terbaru",
      "Makan Sehari 3 Kali (Full Board Indonesian Food)",
      "Air Zam-zam 5 Liter",
      "Dokumentasi Perjalanan",
      "City Tour Makkah 2x & Madinah 2x",
      "City Tour Thaif + Nasi Arab Nampan & Pabrik Parfum",
      "Free Ayam Albaik saat pulang",
      "Bimbingan Manasik Sebelum Berangkat",
      "Free Bingkisan Kenang-kenangan El Massa",
    ],
    excludes: [
      "Biaya pembuatan paspor",
      "Biaya suntik vaksin (jika diperlukan)",
      "Kebutuhan pribadi & bagasi tambahan",
    ],
  },
  {
    id: "pkg-umrah-november-11d",
    name: "Umrah Berkah Spesial November",
    serviceType: "Umrah",
    packageType: "Umrah Berkah Spesial",
    itinerary: "Pangkal Pinang (PGK) - Jakarta (CGK) - Jeddah/Madinah (Saudia & Garuda Indonesia), Makkah, Madinah, City Tour Thaif & Pabrik Parfum",
    basePrice: 35500000,
    durationDays: 11,
    makkahHotel: "Grand Al Massa",
    madinahHotel: "Daar El Naeem",
    airline: "Saudia / Garuda Indonesia",
    bonus: "Free City Tour Thaif & Pabrik Parfum, Ayam Albaik & Zam-zam 5L",
    startPoint: "Pangkal Pinang",
    departureDates: "8 - 18 November 2026",
    programUmrah: "Program Umrah 2 Kali",
    status: "Aktif",
    dpMinimum: "Rp 5.000.000",
    includes: [
      "Tiket pesawat PP PGK - CGK - PGK (Garuda Indonesia)",
      "Tiket pesawat PP CGK - JED/MED - CGK (Saudia / Garuda)",
      "Visa Umrah KSA",
      "Bagasi 1x23kg + Koper Exclusive",
      "Hotel Makkah (Grand Al Massa) & Madinah (Daar El Naeem)",
      "Perlengkapan Umrah Lengkap",
      "Tour Leader & Muthawwif Berpengalaman",
      "Handling Bandara Jakarta & Jeddah",
      "Bus AC Modern Terbaru",
      "Makan Sehari 3 Kali (Full Board Indonesian Food)",
      "Air Zam-zam 5 Liter",
      "Dokumentasi Perjalanan",
      "City Tour Makkah 2x & Madinah 2x",
      "City Tour Thaif + Nasi Arab Nampan & Pabrik Parfum",
      "Free Ayam Albaik saat pulang",
      "Bimbingan Manasik Sebelum Berangkat",
      "Free Bingkisan Kenang-kenangan El Massa",
    ],
    excludes: [
      "Biaya pembuatan paspor",
      "Biaya suntik vaksin (jika diperlukan)",
      "Kebutuhan pribadi & bagasi tambahan",
    ],
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
