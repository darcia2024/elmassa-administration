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

const bookingRows: BookingRow[] = [];

const participantRows: ParticipantRow[] = [];

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
