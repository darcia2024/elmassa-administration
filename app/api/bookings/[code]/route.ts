import { NextRequest, NextResponse } from "next/server";
import { deleteBookingByCode, findBookingByCode, updateBookingByCode } from "@/lib/bookings/store";

type BookingDetailRouteProps = {
  params: Promise<{
    code: string;
  }>;
};

export async function GET(_: NextRequest, { params }: BookingDetailRouteProps) {
  const { code } = await params;
  const booking = await findBookingByCode(decodeURIComponent(code));

  if (!booking) {
    return NextResponse.json({ error: "Booking tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json({
    data: {
      booking,
      // Per-jamaah rows are not stored yet — real_bookings only keeps a head
      // count. The `participants` table exists but nothing writes to it.
      participants: [],
      summary: {
        participantCount: booking.participants,
        remainingBalance: booking.remainingAmount,
      },
    },
    meta: { source: "supabase" },
  });
}

export async function PATCH(request: NextRequest, { params }: BookingDetailRouteProps) {
  const { code } = await params;
  const body = await request.json().catch(() => ({}));

  const data = await updateBookingByCode(decodeURIComponent(code), {
    customerName: body.customerName === undefined ? undefined : String(body.customerName),
    phone: body.phone === undefined ? undefined : String(body.phone),
    nik: body.nik === undefined ? undefined : String(body.nik),
    packageName: body.packageName === undefined ? undefined : String(body.packageName),
    departure: body.departure === undefined ? undefined : String(body.departure),
    roomType: body.roomType === undefined ? undefined : String(body.roomType),
    participants: body.participants === undefined ? undefined : Number(body.participants),
    totalAmount: body.totalAmount === undefined ? undefined : Number(body.totalAmount),
    paidAmount: body.paidAmount === undefined ? undefined : Number(body.paidAmount),
    umrahMeStatus: body.umrahMeStatus === undefined ? undefined : String(body.umrahMeStatus),
  });

  if (!data) {
    return NextResponse.json({ error: "Booking tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json({ data });
}

export async function DELETE(_: NextRequest, { params }: BookingDetailRouteProps) {
  const { code } = await params;
  const removed = await deleteBookingByCode(decodeURIComponent(code));

  if (!removed) {
    return NextResponse.json({ error: "Booking tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json({ data: { code: decodeURIComponent(code) } });
}
