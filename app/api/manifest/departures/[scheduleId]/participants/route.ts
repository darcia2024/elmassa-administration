import { NextRequest, NextResponse } from "next/server";
import { listBookingRows, listParticipantsForBooking } from "@/lib/seed-data/bookings";
import { findScheduleRowById } from "@/lib/seed-data/schedules";

type ManifestParticipantsRouteProps = {
  params: Promise<{
    scheduleId: string;
  }>;
};

export async function GET(request: NextRequest, { params }: ManifestParticipantsRouteProps) {
  const { scheduleId } = await params;
  const searchParams = request.nextUrl.searchParams;
  const documentStatus = searchParams.get("documentStatus")?.trim();
  const schedule = findScheduleRowById(decodeURIComponent(scheduleId));

  if (!schedule) {
    return NextResponse.json({ error: "Jadwal keberangkatan tidak ditemukan" }, { status: 404 });
  }

  const bookings = listBookingRows().filter((booking) => booking.scheduleId === schedule.id);
  const data = bookings
    .flatMap((booking) =>
      listParticipantsForBooking(booking.id).map((participant) => ({
        id: participant.id,
        bookingId: booking.id,
        bookingCode: booking.code,
        customerId: booking.customerId,
        customerName: booking.customerName,
        packageName: booking.packageName,
        scheduleId: schedule.id,
        departureDate: schedule.departureDate,
        participantName: participant.name,
        passportNumber: participant.passportNumber,
        contact: participant.contact,
        documentStatus: participant.documentStatus,
        bookingStatus: booking.status,
        paymentSummary: {
          totalPrice: booking.totalPrice,
          paidAmount: booking.paidAmount,
          remainingBalance: booking.totalPrice - booking.paidAmount,
        },
      })),
    )
    .filter((participant) => !documentStatus || documentStatus === "Semua" || participant.documentStatus === documentStatus)
    .sort((first, second) => first.participantName.localeCompare(second.participantName));

  return NextResponse.json(
    {
      data,
      meta: {
        total: data.length,
        source: "dummy",
        schedule: {
          id: schedule.id,
          departureDate: schedule.departureDate,
          returnDate: schedule.returnDate,
          quota: schedule.quota,
          bookedSeats: data.length,
          remainingSeats: Math.max(schedule.quota - data.length, 0),
        },
        filters: {
          documentStatus: documentStatus ?? null,
        },
      },
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
