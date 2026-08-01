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
    id: "PAY-202607-001",
    receiptNumber: "KW-202607-001",
    bookingCode: "BK-202607-001",
    customerName: "H. Rusli Suparman & Rombongan",
    customerPhone: "0812-7199-1001",
    packageName: "Umrah Spesial Muharram 1448H (11 Hari GA-980)",
    date: "01 Juli 2026",
    amount: 50000000,
    amountDisplay: "Rp 50.000.000",
    amountWords: "Lima Puluh Juta Rupiah",
    paymentFor: "Setoran Uang Muka (DP) 4 Pax Jamaah Umrah Spesial Muharram GA-980",
    paymentMethod: "Transfer Bank BCA",
    account: "BCA 8440-888-999 a.n PT AL MASSA AZKA WISATA",
    staff: "Siti Rahma (Finance Staff)",
    status: "Terverifikasi",
    referenceNumber: "TRX-BCA-9921401",
    notes: "Setoran DP 4 Pax Rombongan Bangka Belitung",
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
