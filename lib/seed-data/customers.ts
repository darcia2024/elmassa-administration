export type CustomerRow = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  address: string;
  city: string;
  customerType: string;
  groupName?: string;
  status: string;
};

const customerRows: CustomerRow[] = [
  {
    id: "cust-001",
    name: "H. Rusli Suparman",
    phone: "0812-7199-1001",
    email: "rusli.suparman@gmail.com",
    address: "Jl. Soekarno Hatta No. 45, Bukit Intan",
    city: "Pangkalpinang",
    customerType: "Rombongan Keluarga",
    groupName: "Rombongan Bangka Belitung (08 - 18 Jul 2026)",
    status: "Aktif",
  },
];

export function listCustomerRows() {
  return customerRows;
}

export function findCustomerRow(id: string) {
  return customerRows.find((item) => item.id === id);
}

export function createCustomerRow(payload: Omit<CustomerRow, "id">) {
  const row = {
    ...payload,
    id: `cust-${crypto.randomUUID()}`,
  };

  customerRows.push(row);
  return row;
}

export function updateCustomerRow(id: string, payload: Partial<Omit<CustomerRow, "id">>) {
  const index = customerRows.findIndex((item) => item.id === id);

  if (index === -1) {
    return null;
  }

  const updates = Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined),
  ) as Partial<Omit<CustomerRow, "id">>;

  customerRows[index] = {
    ...customerRows[index],
    ...updates,
  };

  return customerRows[index];
}
