import { findBookingRow, type BookingRow } from "@/lib/seed-data/bookings";

export type InvoiceItemRow = {
  name: string;
  qty: number;
  price: number;
  priceDisplay: string;
  total: number;
  totalDisplay: string;
};

export type InvoiceRow = {
  id: string;
  number: string;
  bookingCode: string;
  customer: string;
  address: string;
  packageName: string;
  issueDate: string;
  dueDate: string;
  dueDateValue: string;
  status: string;
  items: InvoiceItemRow[];
  total: number;
  totalDisplay: string;
  paid: number;
  paidDisplay: string;
  remaining: number;
  remainingDisplay: string;
  notes?: string;
};

const dueDatesByBooking: Record<string, { display: string; value: string }> = {
  "BK-2407-014": { display: "05 Agu 2026", value: "2026-08-05" },
  "BK-2407-015": { display: "20 Agu 2026", value: "2026-08-20" },
  "BK-2407-016": { display: "31 Jul 2026", value: "2026-07-31" },
  "BK-2407-017": { display: "22 Jul 2026", value: "2026-07-22" },
  "BK-2407-018": { display: "28 Jul 2026", value: "2026-07-28" },
};

const addressesByCustomer: Record<string, string> = {
  "Ahmad Fadli": "Jl. Pemuda Kav. 9, Jakarta Timur",
  "PT Cahaya Berkah": "Jl. Gatot Subroto Kav. 12, Jakarta Selatan",
  "Rombongan Al Ikhlas": "Jl. Margonda Raya No. 88, Depok",
  "Siti Rahma": "Jl. Kemang Pratama No. 12, Bekasi",
  "Nadia Putri": "Jl. Asia Afrika No. 14, Bandung",
};

const invoiceRows: InvoiceRow[] = [];

function formatRupiah(value: number) {
  return `Rp ${value.toLocaleString("id-ID")}`;
}

function resolveInvoiceStatus(total: number, paid: number) {
  if (paid <= 0) {
    return "Belum Bayar";
  }

  if (paid >= total) {
    return "Lunas";
  }

  return "Sebagian";
}

function createInvoiceNumber(bookingCode: string) {
  const suffix = bookingCode.replace(/^BK-/, "");
  return `INV-${suffix}`;
}

function createInvoiceObject(payload: {
  bookingCode: string;
  customer: string;
  packageName: string;
  issueDate: string;
  dueDate: string;
  dueDateValue: string;
  total: number;
  paid: number;
  participantCount: number;
  number?: string;
  notes?: string;
}) {
  const qty = Math.max(payload.participantCount, 1);
  const unitPrice = Math.round(payload.total / qty);
  const remaining = Math.max(payload.total - payload.paid, 0);

  return {
    id: `inv-${payload.number ?? createInvoiceNumber(payload.bookingCode)}`,
    number: payload.number ?? createInvoiceNumber(payload.bookingCode),
    bookingCode: payload.bookingCode,
    customer: payload.customer,
    address: addressesByCustomer[payload.customer] ?? "",
    packageName: payload.packageName,
    issueDate: payload.issueDate,
    dueDate: payload.dueDate,
    dueDateValue: payload.dueDateValue,
    status: resolveInvoiceStatus(payload.total, payload.paid),
    items: [
      {
        name: payload.packageName,
        qty,
        price: unitPrice,
        priceDisplay: formatRupiah(unitPrice),
        total: payload.total,
        totalDisplay: formatRupiah(payload.total),
      },
    ],
    total: payload.total,
    totalDisplay: formatRupiah(payload.total),
    paid: payload.paid,
    paidDisplay: formatRupiah(payload.paid),
    remaining,
    remainingDisplay: formatRupiah(remaining),
    notes: payload.notes,
  } satisfies InvoiceRow;
}

function createInvoiceFromBookingRow(booking: BookingRow, dueDateValue?: string, notes?: string) {
  const dueDate = dueDateValue
    ? { display: dueDateValue, value: dueDateValue }
    : dueDatesByBooking[booking.code] ?? { display: booking.departureDate, value: booking.departureDate };

  return createInvoiceObject({
    bookingCode: booking.code,
    customer: booking.customerName,
    packageName: booking.packageName,
    issueDate: booking.bookingDate,
    dueDate: dueDate.display,
    dueDateValue: dueDate.value,
    total: booking.totalPrice,
    paid: booking.paidAmount,
    participantCount: booking.participantCount,
    notes,
  });
}

export function listInvoiceRows() {
  return invoiceRows;
}

export function findInvoiceRow(numberOrId: string) {
  return invoiceRows.find((item) => item.id === numberOrId || item.number === numberOrId);
}

export function generateInvoiceFromBooking(bookingCodeOrId: string, options?: { dueDateValue?: string; forceNew?: boolean; notes?: string }) {
  const booking = findBookingRow(bookingCodeOrId);

  if (!booking) {
    return null;
  }

  const existing = invoiceRows.find((item) => item.bookingCode === booking.code);
  if (existing && !options?.forceNew) {
    return existing;
  }

  const invoice = createInvoiceFromBookingRow(booking, options?.dueDateValue, options?.notes);
  if (options?.forceNew && invoiceRows.some((item) => item.number === invoice.number)) {
    invoice.number = `${invoice.number}-${String(invoiceRows.length + 1).padStart(2, "0")}`;
    invoice.id = `inv-${invoice.number}`;
  }

  invoiceRows.push(invoice);

  return invoice;
}
