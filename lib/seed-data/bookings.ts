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
    code: "BK-202607-001",
    customerId: "cust-001",
    customerName: "H. Rusli Suparman & Rombongan (4 Pax)",
    packageName: "Umrah Spesial Muharram 1448H (11 Hari GA-980)",
    scheduleId: "sched-001",
    departureDate: "2026-07-08",
    status: "DP",
    totalPrice: 118800000,
    paidAmount: 50000000,
    participantCount: 4,
    bookingDate: "2026-07-01",
  },
];

const participantRows: ParticipantRow[] = [
  {
    id: "MNF001",
    bookingId: "book-001",
    name: "H. Rusli Suparman",
    passportNumber: "C9824101",
    ticketNumber: "126-9821401",
    visaNumber: "EV-992101",
    visaStatus: "Terbit (Valid)",
    contact: "0812-7199-1001",
    city: "Pangkalpinang",
    documentStatus: "Lengkap",
  },
  {
    id: "MNF002",
    bookingId: "book-001",
    name: "Hj. Zubaidah Mansur",
    passportNumber: "C9824102",
    ticketNumber: "126-9821402",
    visaNumber: "EV-992102",
    visaStatus: "Terbit (Valid)",
    contact: "0812-7199-1002",
    city: "Pangkalpinang",
    documentStatus: "Lengkap",
  },
  {
    id: "MNF003",
    bookingId: "book-001",
    name: "Ahmad Fauzi",
    passportNumber: "C9824103",
    ticketNumber: "126-9821403",
    visaNumber: "EV-992103",
    visaStatus: "Terbit (Valid)",
    contact: "0812-7199-1003",
    city: "Pangkalpinang",
    documentStatus: "Lengkap",
  },
  {
    id: "MNF004",
    bookingId: "book-001",
    name: "Siti Aminah",
    passportNumber: "C9824104",
    ticketNumber: "126-9821404",
    visaNumber: "EV-992104",
    visaStatus: "Terbit (Valid)",
    contact: "0812-7199-1004",
    city: "Pangkalpinang",
    documentStatus: "Lengkap",
  },
];

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
