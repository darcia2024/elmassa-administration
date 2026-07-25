export const staffRoles = ["Admin Operasional", "Admin Keuangan", "Sales", "Dokumen", "Supervisor"] as const;
export const staffBranches = ["Bekasi", "Jakarta", "Bandung"] as const;
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
};

type StaffUserPayload = {
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
  branch?: string;
  status?: string;
};

const staffUserRows: StaffUserRow[] = [
  {
    id: "staff-maya",
    name: "Maya Safitri",
    email: "maya@elmassa.test",
    phone: "0812-3344-7788",
    role: "Admin Operasional",
    branch: "Bekasi",
    status: "Aktif",
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

  if (wouldDisableLastOperationalAdmin(staffUserRows[index], updates)) {
    return "LAST_OPERATIONAL_ADMIN";
  }

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

  if (wouldRemoveLastOperationalAdmin(staffUserRows[index])) {
    return "LAST_OPERATIONAL_ADMIN";
  }

  staffUserRows.splice(index, 1);

  return true;
}

export function parseStaffUserPayload(payload: StaffUserPayload, options: { partial?: boolean } = {}) {
  const errors: Record<string, string> = {};
  const name = payload.name === undefined ? undefined : String(payload.name).trim();
  const email = payload.email === undefined ? undefined : String(payload.email).trim().toLowerCase();
  const phone = payload.phone === undefined ? undefined : String(payload.phone).trim();
  const role = payload.role === undefined ? undefined : String(payload.role).trim();
  const branch = payload.branch === undefined ? undefined : String(payload.branch).trim();
  const status = payload.status === undefined ? undefined : String(payload.status).trim();

  if (!options.partial || name !== undefined) {
    if (!name) {
      errors.name = "Nama staf wajib diisi";
    } else if (name.length > 80) {
      errors.name = "Nama staf maksimal 80 karakter";
    }
  }

  if (!options.partial || email !== undefined) {
    if (!email) {
      errors.email = "Email wajib diisi";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Format email tidak valid";
    }
  }

  if (phone !== undefined && phone.length > 32) {
    errors.phone = "Telepon maksimal 32 karakter";
  }

  if (!options.partial || role !== undefined) {
    if (!role) {
      errors.role = "Role wajib diisi";
    } else if (!staffRoles.includes(role as StaffRole)) {
      errors.role = `Role harus salah satu dari: ${staffRoles.join(", ")}`;
    }
  }

  if (!options.partial || branch !== undefined) {
    if (!branch) {
      errors.branch = "Cabang wajib diisi";
    } else if (!staffBranches.includes(branch as StaffBranch)) {
      errors.branch = `Cabang harus salah satu dari: ${staffBranches.join(", ")}`;
    }
  }

  if (!options.partial || status !== undefined) {
    if (!status) {
      errors.status = "Status wajib diisi";
    } else if (!staffStatuses.includes(status as StaffStatus)) {
      errors.status = `Status harus salah satu dari: ${staffStatuses.join(", ")}`;
    }
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  return {
    data: {
      name,
      email,
      phone,
      role: role as StaffRole | undefined,
      branch: branch as StaffBranch | undefined,
      status: status as StaffStatus | undefined,
    },
  };
}

function wouldDisableLastOperationalAdmin(current: StaffUserRow, updates: Partial<Omit<StaffUserRow, "id">>) {
  const nextRole = updates.role ?? current.role;
  const nextStatus = updates.status ?? current.status;

  if (nextRole === "Admin Operasional" && nextStatus === "Aktif") {
    return false;
  }

  return wouldRemoveLastOperationalAdmin(current);
}

function wouldRemoveLastOperationalAdmin(current: StaffUserRow) {
  if (current.role !== "Admin Operasional" || current.status !== "Aktif") {
    return false;
  }

  return staffUserRows.filter((item) => item.role === "Admin Operasional" && item.status === "Aktif").length <= 1;
}
