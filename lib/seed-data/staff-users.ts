export const staffRoles = [
  "Admin Master",
  "Sub-User Operasional",
  "Sub-User Keuangan",
  "Sub-User Sales & CRM",
  "Sub-User Lapangan",
] as const;

export const staffBranches = [
  "Pangkalpinang (Bangka)",
  "Tanjung Pandan (Belitung)",
  "Palembang (Sumbagsel)",
  "Jakarta (Pusat)",
] as const;

export const staffStatuses = ["Aktif", "Nonaktif"] as const;

export type StaffRole = (typeof staffRoles)[number];
export type StaffBranch = (typeof staffBranches)[number];
export type StaffStatus = (typeof staffStatuses)[number];

export type StaffUserRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: StaffRole;
  branch: StaffBranch;
  status: StaffStatus;
  teamDivision?: string;
  commissionRate?: string;
  referredJamaahCount?: number;
};

type StaffUserPayload = {
  name?: string;
  email?: string;
  phone?: string;
  role?: StaffRole;
  branch?: StaffBranch;
  status?: StaffStatus;
  teamDivision?: string;
  commissionRate?: string;
  referredJamaahCount?: number;
};

export function parseStaffUserPayload(body: any, options?: { partial?: boolean }): { data: StaffUserPayload } | { errors: Record<string, string> } {
  if (!body || typeof body !== "object") {
    return { errors: { body: "Body tidak valid" } };
  }
  const payload: StaffUserPayload = {};
  if (typeof body.name === "string") payload.name = body.name;
  if (typeof body.email === "string") payload.email = body.email;
  if (typeof body.phone === "string") payload.phone = body.phone;
  if (typeof body.role === "string") payload.role = body.role as StaffRole;
  if (typeof body.branch === "string") payload.branch = body.branch as StaffBranch;
  if (typeof body.status === "string") payload.status = body.status as StaffStatus;
  if (typeof body.teamDivision === "string") payload.teamDivision = body.teamDivision;
  return { data: payload };
}

const staffUserRows: StaffUserRow[] = [
  {
    id: "staff-azri",
    name: "Azriandri",
    email: "azriandri@elmassa.test",
    phone: "0812-3344-7788",
    role: "Admin Master",
    branch: "Pangkalpinang (Bangka)",
    status: "Aktif",
    teamDivision: "CEO & Direksi Utama",
  },
  {
    id: "staff-subuser-01",
    name: "H. Ruslan Efendi",
    email: "ruslan.ops@elmassa.test",
    phone: "0812-7199-1003",
    role: "Sub-User Operasional",
    branch: "Tanjung Pandan (Belitung)",
    status: "Aktif",
    teamDivision: "Operasional & Flight",
  },
  {
    id: "staff-subuser-02",
    name: "Ridwan Hasan",
    email: "ridwan.sales@elmassa.test",
    phone: "0812-7199-1023",
    role: "Sub-User Sales & CRM",
    branch: "Palembang (Sumbagsel)",
    status: "Aktif",
    teamDivision: "Sales & Pelanggan",
  },
  {
    id: "staff-subuser-03",
    name: "Hj. Zubaidah",
    email: "zubaidah.fin@elmassa.test",
    phone: "0812-7199-1002",
    role: "Sub-User Keuangan",
    branch: "Pangkalpinang (Bangka)",
    status: "Aktif",
    teamDivision: "Kas & Keuangan",
  },
];

export function listStaffUserRows() {
  return staffUserRows;
}

export function findStaffUserRow(id: string) {
  return staffUserRows.find((item) => item.id === id);
}

export function createStaffUserRow(payload: Omit<StaffUserRow, "id"> & { id?: string }) {
  const row: StaffUserRow = {
    ...payload,
    id: payload.id ?? `staff-${crypto.randomUUID()}`,
  };

  staffUserRows.push(row);

  return row;
}

export function updateStaffUserRow(id: string, payload: Partial<Omit<StaffUserRow, "id">>) {
  const index = staffUserRows.findIndex((item) => item.id === id);

  if (index === -1) {
    return null;
  }

  const updates = Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined),
  ) as Partial<Omit<StaffUserRow, "id">>;

  staffUserRows[index] = {
    ...staffUserRows[index],
    ...updates,
  };

  return staffUserRows[index];
}

export function deleteStaffUserRow(id: string) {
  const index = staffUserRows.findIndex((item) => item.id === id);

  if (index === -1) {
    return false;
  }

  staffUserRows.splice(index, 1);
  return true;
}
