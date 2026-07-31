export type InstallmentRow = {
  id: string;
  bookingCode: string;
  customer: string;
  packageName: string;
  sequence: string;
  dueDate: string;
  dueDateValue: string;
  amount: number;
  amountDisplay: string;
  paidAmount: number;
  paidDisplay: string;
  status: string;
  notes?: string;
};

const allowedStatuses = ["Terjadwal", "Jatuh Tempo", "Lunas", "Dibatalkan"] as const;

const installmentRows: InstallmentRow[] = [];

function formatRupiah(value: number) {
  return `Rp ${value.toLocaleString("id-ID")}`;
}

function createInstallmentId() {
  return `CIC-${String(installmentRows.length + 1).padStart(3, "0")}`;
}

function resolveStatus(amount: number, paidAmount: number, status?: string) {
  if (status && allowedStatuses.includes(status as (typeof allowedStatuses)[number])) {
    return status;
  }

  if (paidAmount >= amount) {
    return "Lunas";
  }

  return "Terjadwal";
}

export function listInstallmentRows() {
  return installmentRows;
}

export function findInstallmentRow(id: string) {
  return installmentRows.find((item) => item.id === id);
}

export function createInstallmentRow(payload: Omit<InstallmentRow, "id" | "amountDisplay" | "paidDisplay" | "status"> & {
  id?: string;
  status?: string;
}) {
  const installment: InstallmentRow = {
    ...payload,
    id: payload.id ?? createInstallmentId(),
    amountDisplay: formatRupiah(payload.amount),
    paidDisplay: formatRupiah(payload.paidAmount),
    status: resolveStatus(payload.amount, payload.paidAmount, payload.status),
  };

  installmentRows.push(installment);

  return installment;
}

export function updateInstallmentRow(id: string, payload: Partial<Omit<InstallmentRow, "id">>) {
  const index = installmentRows.findIndex((item) => item.id === id);

  if (index === -1) {
    return null;
  }

  const updates = Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined),
  ) as Partial<Omit<InstallmentRow, "id">>;

  installmentRows[index] = {
    ...installmentRows[index],
    ...updates,
  };

  if (updates.amount !== undefined) {
    installmentRows[index].amountDisplay = formatRupiah(installmentRows[index].amount);
  }

  if (updates.paidAmount !== undefined) {
    installmentRows[index].paidDisplay = formatRupiah(installmentRows[index].paidAmount);
  }

  installmentRows[index].status = resolveStatus(
    installmentRows[index].amount,
    installmentRows[index].paidAmount,
    updates.status,
  );

  return installmentRows[index];
}

export function deleteInstallmentRow(id: string) {
  const index = installmentRows.findIndex((item) => item.id === id);

  if (index === -1) {
    return false;
  }

  installmentRows.splice(index, 1);

  return true;
}

export function isAllowedInstallmentStatus(status: string) {
  return allowedStatuses.includes(status as (typeof allowedStatuses)[number]);
}

export function listAllowedInstallmentStatuses() {
  return [...allowedStatuses];
}
