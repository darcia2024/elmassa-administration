export type PaymentRow = {
  id: string;
  receiptNumber: string;
  bookingCode: string;
  customerName: string;
  customerPhone: string;
  packageName: string;
  date: string;
  amount: number;
  amountDisplay: string;
  amountWords: string;
  paymentFor: string;
  paymentMethod: string;
  account: string;
  staff: string;
  status: string;
  referenceNumber?: string;
  proofUrl?: string;
  notes?: string;
};

const paymentRows: PaymentRow[] = [];

export function listPaymentRows() {
  return paymentRows;
}

export function findPaymentRow(paymentIdOrReceiptNumber: string) {
  return paymentRows.find((item) => item.id === paymentIdOrReceiptNumber || item.receiptNumber === paymentIdOrReceiptNumber);
}

function formatRupiah(value: number) {
  return `Rp ${value.toLocaleString("id-ID")}`;
}

function createReceiptNumber() {
  const nextNumber = paymentRows.length + 1;
  return `KW-${String(nextNumber).padStart(3, "0")}`;
}

export function createPaymentRow(payload: Omit<PaymentRow, "id" | "receiptNumber" | "amountDisplay"> & {
  receiptNumber?: string;
  amountDisplay?: string;
}) {
  const payment: PaymentRow = {
    ...payload,
    id: `pay-${crypto.randomUUID()}`,
    receiptNumber: payload.receiptNumber ?? createReceiptNumber(),
    amountDisplay: payload.amountDisplay ?? formatRupiah(payload.amount),
  };

  paymentRows.push(payment);

  return payment;
}

export function updatePaymentRow(paymentIdOrReceiptNumber: string, payload: Partial<Omit<PaymentRow, "id">>) {
  const index = paymentRows.findIndex((item) => item.id === paymentIdOrReceiptNumber || item.receiptNumber === paymentIdOrReceiptNumber);

  if (index === -1) {
    return null;
  }

  const updates = Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined),
  ) as Partial<Omit<PaymentRow, "id">>;

  paymentRows[index] = {
    ...paymentRows[index],
    ...updates,
  };

  if (updates.amount !== undefined && updates.amountDisplay === undefined) {
    paymentRows[index].amountDisplay = formatRupiah(paymentRows[index].amount);
  }

  return paymentRows[index];
}

export function deletePaymentRow(paymentIdOrReceiptNumber: string) {
  const index = paymentRows.findIndex((item) => item.id === paymentIdOrReceiptNumber || item.receiptNumber === paymentIdOrReceiptNumber);

  if (index === -1) {
    return false;
  }

  paymentRows.splice(index, 1);

  return true;
}
