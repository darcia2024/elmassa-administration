import { NextRequest, NextResponse } from "next/server";
import { findBookingRow, listParticipantsForBooking, updateBookingRow } from "@/lib/seed-data/bookings";

type BookingDetailRouteProps = {
  params: Promise<{
    code: string;
  }>;
};

export async function GET(_: NextRequest, { params }: BookingDetailRouteProps) {
  const { code } = await params;
  const booking = findBookingRow(decodeURIComponent(code));

  if (!booking) {
    return NextResponse.json({ error: "Booking tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json({
    data: {
      booking,
      participants: listParticipantsForBooking(booking.id),
      summary: {
        participantCount: listParticipantsForBooking(booking.id).length,
        remainingBalance: booking.totalPrice - booking.paidAmount,
      },
    },
  });
}

export async function PATCH(request: NextRequest, { params }: BookingDetailRouteProps) {
  const { code } = await params;
  const body = await request.json();
  const data = updateBookingRow(decodeURIComponent(code), {
    customerId: body.customerId === undefined ? undefined : String(body.customerId),
    customerName: body.customerName === undefined ? undefined : String(body.customerName),
    packageName: body.packageName === undefined ? undefined : String(body.packageName),
    scheduleId: body.scheduleId === undefined ? undefined : String(body.scheduleId),
    departureDate: body.departureDate === undefined ? undefined : String(body.departureDate),
    status: body.status === undefined ? undefined : String(body.status),
    totalPrice: body.totalPrice === undefined ? undefined : Number(body.totalPrice),
    paidAmount: body.paidAmount === undefined ? undefined : Number(body.paidAmount),
    participantCount: body.participantCount === undefined ? undefined : Number(body.participantCount),
    bookingDate: body.bookingDate === undefined ? undefined : String(body.bookingDate),
  });

  if (!data) {
    return NextResponse.json({ error: "Booking tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json({ data });
}
