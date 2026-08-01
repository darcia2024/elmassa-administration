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

const customerRows: CustomerRow[] = [];

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
