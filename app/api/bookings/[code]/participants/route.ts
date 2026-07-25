import { NextRequest, NextResponse } from "next/server";
import {
  createParticipantForBooking,
  findBookingRow,
  listParticipantsForBooking,
} from "@/lib/seed-data/bookings";
import { validateParticipantCreate } from "@/lib/validation/participants";

type BookingParticipantsRouteProps = {
  params: Promise<{
    code: string;
  }>;
};

export async function GET(_: NextRequest, { params }: BookingParticipantsRouteProps) {
  const { code } = await params;
  const booking = findBookingRow(decodeURIComponent(code));

  if (!booking) {
    return NextResponse.json({ error: "Booking tidak ditemukan" }, { status: 404 });
  }

  const data = listParticipantsForBooking(booking.id);

  return NextResponse.json({
    data,
    meta: {
      bookingId: booking.id,
      bookingCode: booking.code,
      total: data.length,
      source: "dummy",
    },
  });
}

export async function POST(request: NextRequest, { params }: BookingParticipantsRouteProps) {
  const { code } = await params;
  const booking = findBookingRow(decodeURIComponent(code));
  const body = await request.json();

  if (!booking) {
    return NextResponse.json({ error: "Booking tidak ditemukan" }, { status: 404 });
  }

  const validation = validateParticipantCreate(body);

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

  const data = createParticipantForBooking(booking.id, validation.data);

  return NextResponse.json({ data }, { status: 201 });
}
