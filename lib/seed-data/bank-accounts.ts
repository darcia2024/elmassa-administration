export type BankAccountRow = {
  id: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  branch: string;
  isPrimary: boolean;
  status: string;
  notes?: string;
};

const bankAccountRows: BankAccountRow[] = [
  {
    id: "rek-bca",
    bankName: "BCA",
    accountNumber: "1234567890",
    accountName: "El Massa Tour & Travel",
    branch: "Bekasi",
    isPrimary: true,
    status: "Aktif",
  },
];

export function listBankAccountRows() {
  return bankAccountRows;
}

export function findBankAccountRow(id: string) {
  return bankAccountRows.find((item) => item.id === id);
}

export function createBankAccountRow(payload: Omit<BankAccountRow, "id"> & { id?: string }) {
  if (payload.isPrimary || bankAccountRows.length === 0) {
    clearPrimaryAccount();
  }

  const account: BankAccountRow = {
    ...payload,
    isPrimary: payload.isPrimary || bankAccountRows.length === 0,
    id: payload.id ?? `rek-${crypto.randomUUID()}`,
  };

  bankAccountRows.push(account);

  return account;
}

export function updateBankAccountRow(id: string, payload: Partial<Omit<BankAccountRow, "id">>) {
  const index = bankAccountRows.findIndex((item) => item.id === id);

  if (index === -1) {
    return null;
  }

  const updates = Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined),
  ) as Partial<Omit<BankAccountRow, "id">>;

  if (updates.isPrimary) {
    clearPrimaryAccount();
  }

  bankAccountRows[index] = {
    ...bankAccountRows[index],
    ...updates,
  };

  return bankAccountRows[index];
}

export function deleteBankAccountRow(id: string) {
  const index = bankAccountRows.findIndex((item) => item.id === id);

  if (index === -1) {
    return false;
  }

  const [deleted] = bankAccountRows.splice(index, 1);

  if (deleted.isPrimary && bankAccountRows.length > 0) {
    bankAccountRows[0] = {
      ...bankAccountRows[0],
      isPrimary: true,
    };
  }

  return true;
}

function clearPrimaryAccount() {
  bankAccountRows.forEach((item) => {
    item.isPrimary = false;
  });
}
