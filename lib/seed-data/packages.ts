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

const packageRows: PackageRow[] = [];

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
