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
  contact: string;
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

const bookingRows: BookingRow[] = [
  {
    id: "book-001",
    code: "BK-2407-018",
    customerId: "cust-001",
    customerName: "Siti Rahma",
    packageName: "Umrah Reguler 12 Hari",
    scheduleId: "dep-umr-20260812",
    departureDate: "2026-08-12",
    status: "DP",
    totalPrice: 32_500_000,
    paidAmount: 12_500_000,
    participantCount: 1,
    bookingDate: "2026-07-10",
  },
];

export function listBookingRows() {
  return bookingRows;
}

export function findBookingRow(codeOrId: string) {
  return bookingRows.find((item) => item.id === codeOrId || item.code === codeOrId);
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
    updates.status ?? bookingRows[index].status,
  );

  return bookingRows[index];
}

const participantRows: ParticipantRow[] = [
  {
    id: "part-001",
    bookingId: "book-001",
    name: "Siti Rahma",
    passportNumber: "C1234567",
    contact: "0812-4455-7788",
    documentStatus: "Lengkap",
  },
];

export function createBookingRow(payload: Omit<BookingRow, "id" | "code" | "participantCount"> & {
  participants?: Array<Partial<Omit<ParticipantRow, "id" | "bookingId">>>;
}) {
  const { participants = [], ...bookingPayload } = payload;
  const nextNumber = bookingRows.length + 1;
  const booking: BookingRow = {
    ...bookingPayload,
    id: `book-${crypto.randomUUID()}`,
    code: `BK-${String(nextNumber).padStart(3, "0")}`,
    status: resolveBookingStatus(bookingPayload.totalPrice, bookingPayload.paidAmount, bookingPayload.status),
    participantCount: participants.length,
  };

  bookingRows.push(booking);

  for (const participant of participants) {
    participantRows.push({
      id: `part-${crypto.randomUUID()}`,
      bookingId: booking.id,
      name: String(participant.name ?? ""),
      passportNumber: String(participant.passportNumber ?? ""),
      contact: String(participant.contact ?? ""),
      documentStatus: String(participant.documentStatus ?? "Belum Lengkap"),
    });
  }

  return {
    booking,
    participants: participantRows.filter((item) => item.bookingId === booking.id),
  };
}

export function listParticipantsForBooking(bookingId: string) {
  return participantRows.filter((item) => item.bookingId === bookingId);
}

export function findParticipantForBooking(bookingId: string, participantId: string) {
  return participantRows.find((item) => item.bookingId === bookingId && item.id === participantId);
}

export function createParticipantForBooking(bookingId: string, payload: Omit<ParticipantRow, "id" | "bookingId">) {
  const participant: ParticipantRow = {
    ...payload,
    id: `part-${crypto.randomUUID()}`,
    bookingId,
  };

  participantRows.push(participant);
  syncBookingParticipantCount(bookingId);

  return participant;
}

export function updateParticipantForBooking(
  bookingId: string,
  participantId: string,
  payload: Partial<Omit<ParticipantRow, "id" | "bookingId">>,
) {
  const index = participantRows.findIndex((item) => item.bookingId === bookingId && item.id === participantId);

  if (index === -1) {
    return null;
  }

  const updates = Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined),
  ) as Partial<Omit<ParticipantRow, "id" | "bookingId">>;

  participantRows[index] = {
    ...participantRows[index],
    ...updates,
  };

  return participantRows[index];
}

export function deleteParticipantForBooking(bookingId: string, participantId: string) {
  const index = participantRows.findIndex((item) => item.bookingId === bookingId && item.id === participantId);

  if (index === -1) {
    return false;
  }

  participantRows.splice(index, 1);
  syncBookingParticipantCount(bookingId);

  return true;
}

function syncBookingParticipantCount(bookingId: string) {
  const booking = bookingRows.find((item) => item.id === bookingId);

  if (!booking) {
    return;
  }

  booking.participantCount = listParticipantsForBooking(bookingId).length;
}
