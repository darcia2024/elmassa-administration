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

const paymentRows: PaymentRow[] = [
  {
    id: "pay-044",
    receiptNumber: "KW-2407-044",
    bookingCode: "BK-2407-018",
    customerName: "Siti Rahma",
    customerPhone: "0812-4455-7788",
    packageName: "Umrah Reguler 12 Hari",
    date: "2026-07-25",
    amount: 7_500_000,
    amountDisplay: "Rp 7.500.000",
    amountWords: "Tujuh juta lima ratus ribu rupiah",
    paymentFor: "Pembayaran cicilan paket Umrah Reguler 12 Hari",
    paymentMethod: "Transfer",
    account: "BCA El Massa",
    staff: "Azriandri",
    status: "Terverifikasi",
  },
];

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
