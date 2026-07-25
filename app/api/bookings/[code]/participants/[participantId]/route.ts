import { NextRequest, NextResponse } from "next/server";
import {
  deleteParticipantForBooking,
  findBookingRow,
  findParticipantForBooking,
  updateParticipantForBooking,
} from "@/lib/seed-data/bookings";
import { validateParticipantPatch } from "@/lib/validation/participants";

type BookingParticipantDetailRouteProps = {
  params: Promise<{
    code: string;
    participantId: string;
  }>;
};

export async function GET(_: NextRequest, { params }: BookingParticipantDetailRouteProps) {
  const { code, participantId } = await params;
  const booking = findBookingRow(decodeURIComponent(code));

  if (!booking) {
    return NextResponse.json({ error: "Booking tidak ditemukan" }, { status: 404 });
  }

  const data = findParticipantForBooking(booking.id, decodeURIComponent(participantId));

  if (!data) {
    return NextResponse.json({ error: "Peserta tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json({ data });
}

export async function PATCH(request: NextRequest, { params }: BookingParticipantDetailRouteProps) {
  const { code, participantId } = await params;
  const booking = findBookingRow(decodeURIComponent(code));
  const body = await request.json();

  if (!booking) {
    return NextResponse.json({ error: "Booking tidak ditemukan" }, { status: 404 });
  }

  const validation = validateParticipantPatch(body);

  if (validation.errors) {
    return NextResponse.json(
      {
        error: "Payload peserta tidak valid",
        details: validation.errors,
      },
      {
        status: 400,
      },
    );
  }

  const data = updateParticipantForBooking(booking.id, decodeURIComponent(participantId), validation.data);

  if (!data) {
    return NextResponse.json({ error: "Peserta tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json({ data });
}

export async function DELETE(_: NextRequest, { params }: BookingParticipantDetailRouteProps) {
  const { code, participantId } = await params;
  const booking = findBookingRow(decodeURIComponent(code));

  if (!booking) {
    return NextResponse.json({ error: "Booking tidak ditemukan" }, { status: 404 });
  }

  const deleted = deleteParticipantForBooking(booking.id, decodeURIComponent(participantId));

  if (!deleted) {
    return NextResponse.json({ error: "Peserta tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json({ data: { id: decodeURIComponent(participantId), deleted: true } });
}
