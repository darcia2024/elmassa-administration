export type BookingRow = {
  id: string;
  code: string;
  customerId: string;
  customerName: string;
  packageName: string;
  scheduleId: string;
  departureDate: string;
  status: string;
  totalPrice: number;
  paidAmount: number;
  participantCount: number;
  bookingDate: string;
};

export type ParticipantRow = {
  id: string;
  bookingId: string;
  name: string;
  passportNumber: string;
  ticketNumber?: string;
  visaNumber?: string;
  visaStatus?: string;
  contact: string;
  city?: string;
  documentStatus: string;
};

const manualBookingStatuses = ["Dibatalkan", "Refund"] as const;

export function resolveBookingStatus(totalPrice: number, paidAmount: number, currentStatus?: string): string {
  if (manualBookingStatuses.includes(currentStatus as (typeof manualBookingStatuses)[number])) {
    return currentStatus as (typeof manualBookingStatuses)[number];
  }

  if (paidAmount <= 0) {
    return "Belum Bayar";
  }

  if (paidAmount >= totalPrice) {
    return "Lunas";
  }

  return "DP";
}

const bookingRows: BookingRow[] = [
  {
    id: "book-001",
    code: "BK-2407-018",
    customerId: "cust-001",
    customerName: "Rombongan Jamaah Pangkalpinang (30 Pax)",
    packageName: "Umrah Spesial Oktober (Dapat 2x Jum'at)",
    scheduleId: "dep-umr-20261001",
    departureDate: "2026-10-01",
    status: "Lunas",
    totalPrice: 1005000000,
    paidAmount: 1005000000,
    participantCount: 30,
    bookingDate: "2026-08-01",
  },
  {
    id: "book-002",
    code: "BK-2407-001",
    customerId: "cust-002",
    customerName: "Hj. Zubaidah Mansur",
    packageName: "Umrah Spesial Oktober (Dapat 2x Jum'at)",
    scheduleId: "dep-umr-20261001",
    departureDate: "2026-10-01",
    status: "Lunas",
    totalPrice: 33500000,
    paidAmount: 33500000,
    participantCount: 1,
    bookingDate: "2026-08-10",
  },
  {
    id: "book-003",
    code: "BK-2407-002",
    customerId: "cust-003",
    customerName: "H. Rusli Suparman",
    packageName: "Umrah Berkah Spesial November",
    scheduleId: "dep-umr-20261108",
    departureDate: "2026-11-08",
    status: "DP",
    totalPrice: 35500000,
    paidAmount: 10000000,
    participantCount: 1,
    bookingDate: "2026-08-15",
  },
];

const babelNames = [
  { name: "H. Rusli Suparman", city: "Pangkalpinang" },
  { name: "Hj. Zubaidah Mansur", city: "Pangkalpinang" },
  { name: "H. Ruslan Efendi", city: "Tanjung Pandan (Belitung)" },
  { name: "Hj. Rohani Syahputri", city: "Tanjung Pandan (Belitung)" },
  { name: "Iskandar Harun", city: "Sungailiat (Bangka)" },
  { name: "Ernawati Abdullah", city: "Sungailiat (Bangka)" },
  { name: "Syahril Ismail", city: "Koba (Bangka Tengah)" },
  { name: "Fatimah Zohra", city: "Koba (Bangka Tengah)" },
  { name: "Herry Kurniawan", city: "Manggar (Belitung Timur)" },
  { name: "Rosita Nur", city: "Manggar (Belitung Timur)" },
  { name: "Hendra Wijaya", city: "Toboali (Bangka Selatan)" },
  { name: "Titin Suryani", city: "Toboali (Bangka Selatan)" },
  { name: "Arifin Ahmad", city: "Pangkalpinang" },
  { name: "Maimunah Ismail", city: "Pangkalpinang" },
  { name: "Syamsul Bahri", city: "Muntok (Bangka Barat)" },
  { name: "Hasnah Abdullah", city: "Muntok (Bangka Barat)" },
  { name: "Bambang Irawan", city: "Sungailiat (Bangka)" },
  { name: "Suhaili Rusli", city: "Sungailiat (Bangka)" },
  { name: "Hamzah Sutan", city: "Tanjung Pandan (Belitung)" },
  { name: "Faridah Zakaria", city: "Tanjung Pandan (Belitung)" },
  { name: "Romlan Effendi", city: "Belinyu (Bangka)" },
  { name: "Nurhayati Sutan", city: "Belinyu (Bangka)" },
  { name: "Ridwan Hasan", city: "Pangkalpinang" },
  { name: "Halimah Iskandar", city: "Pangkalpinang" },
  { name: "Zainal Abidin", city: "Koba (Bangka Tengah)" },
  { name: "Marzuki Suparman", city: "Koba (Bangka Tengah)" },
  { name: "Badaruddin Ahmad", city: "Toboali (Bangka Selatan)" },
  { name: "Rustam Efendi", city: "Toboali (Bangka Selatan)" },
  { name: "Kasman Djafar", city: "Manggar (Belitung Timur)" },
  { name: "Masriah Harun", city: "Manggar (Belitung Timur)" },
  { name: "Syarifuddin Rusli", city: "Tanjung Pandan (Belitung)" },
  { name: "Yahya Mansur", city: "Tanjung Pandan (Belitung)" },
  { name: "Saiful Arifin", city: "Pangkalpinang" },
  { name: "Darmawan Syahputri", city: "Pangkalpinang" },
  { name: "Zulkifli Syahril", city: "Sungailiat (Bangka)" },
  { name: "Nurbaiti Ismail", city: "Sungailiat (Bangka)" },
  { name: "Abdullah Hasnan", city: "Muntok (Bangka Barat)" },
  { name: "Maryam Ahmad", city: "Muntok (Bangka Barat)" },
  { name: "Bujang Lapok", city: "Pangkalpinang" },
  { name: "Sumarni Marpaung", city: "Pangkalpinang" },
];

const participantRows: ParticipantRow[] = babelNames.map((person, i) => ({
  id: `part-${i + 1}`,
  bookingId: "book-001",
  name: person.name,
  passportNumber: `C982${4100 + i + 1}`,
  ticketNumber: `126-240981${2000 + i + 1}`,
  visaNumber: `EV-98240${(i + 1).toString().padStart(2, "0")}`,
  visaStatus: "Issued (Valid)",
  contact: `0812-7199-${1000 + i + 1}`,
  city: person.city,
  documentStatus: "Lengkap",
}));

export function listBookingRows() {
  return bookingRows;
}

export function listParticipantsForBooking(bookingId: string) {
  return participantRows.filter((p) => p.bookingId === bookingId);
}

export function findBookingRow(codeOrId: string) {
  return bookingRows.find((item) => item.id === codeOrId || item.code === codeOrId);
}

export function updateBookingManualStatus(codeOrId: string, status: string) {
  const index = bookingRows.findIndex((item) => item.id === codeOrId || item.code === codeOrId);

  if (index === -1) {
    return null;
  }

  bookingRows[index] = {
    ...bookingRows[index],
    status,
  };

  return bookingRows[index];
}

export function updateBookingRow(codeOrId: string, payload: Partial<Omit<BookingRow, "id" | "code">>) {
  const index = bookingRows.findIndex((item) => item.id === codeOrId || item.code === codeOrId);

  if (index === -1) {
    return null;
  }

  const updates = Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined),
  ) as Partial<Omit<BookingRow, "id" | "code">>;

  bookingRows[index] = {
    ...bookingRows[index],
    ...updates,
  };
  bookingRows[index].status = resolveBookingStatus(
    bookingRows[index].totalPrice,
    bookingRows[index].paidAmount,
    bookingRows[index].status,
  );

  return bookingRows[index];
}

export function createBookingRow(payload: Partial<Omit<BookingRow, "id" | "code">> & { customerId: string; customerName: string; packageName: string; scheduleId: string; totalPrice: number; participants?: any[] }) {
  const code = `BK-${new Date().toISOString().slice(2, 7).replace("-", "")}-${Math.floor(100 + Math.random() * 900)}`;
  const paid = payload.paidAmount ?? 0;
  const price = payload.totalPrice ?? 0;
  const row: BookingRow = {
    customerId: payload.customerId,
    customerName: payload.customerName,
    packageName: payload.packageName,
    scheduleId: payload.scheduleId,
    departureDate: payload.departureDate ?? "2026-07-08",
    totalPrice: price,
    paidAmount: paid,
    participantCount: payload.participantCount ?? (payload.participants?.length || 1),
    bookingDate: payload.bookingDate ?? new Date().toISOString().slice(0, 10),
    code,
    id: `book-${crypto.randomUUID()}`,
    status: payload.status ?? resolveBookingStatus(price, paid),
  };

  bookingRows.push(row);
  return row;
}

export function createParticipantForBooking(bookingId: string, payload: Omit<ParticipantRow, "id" | "bookingId">) {
  const participant: ParticipantRow = {
    ...payload,
    id: `part-${crypto.randomUUID()}`,
    bookingId,
    ticketNumber: payload.ticketNumber || `126-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
    visaNumber: payload.visaNumber || `EV-${Math.floor(1000000 + Math.random() * 9000000)}`,
    visaStatus: payload.visaStatus || "Issued (Valid)",
    city: payload.city || "Pangkalpinang",
  };
  participantRows.push(participant);
  return participant;
}

export function findParticipantForBooking(bookingId: string, participantId: string) {
  return participantRows.find((p) => p.bookingId === bookingId && p.id === participantId);
}

export function updateParticipantForBooking(
  bookingId: string,
  participantId: string,
  payload: Partial<Omit<ParticipantRow, "id" | "bookingId">>,
) {
  const index = participantRows.findIndex((p) => p.bookingId === bookingId && p.id === participantId);
  if (index === -1) return null;

  participantRows[index] = {
    ...participantRows[index],
    ...payload,
  };
  return participantRows[index];
}

export function deleteParticipantForBooking(bookingId: string, participantId: string) {
  const index = participantRows.findIndex((p) => p.bookingId === bookingId && p.id === participantId);
  if (index === -1) return false;

  participantRows.splice(index, 1);
  return true;
}
