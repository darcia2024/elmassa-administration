import { NextResponse } from "next/server";
import { listBookingRows, listParticipantsForBooking } from "@/lib/seed-data/bookings";
import { findScheduleRowById } from "@/lib/seed-data/schedules";

type ManifestTotalsRouteProps = {
  params: Promise<{
    scheduleId: string;
  }>;
};

export async function GET(_: Request, { params }: ManifestTotalsRouteProps) {
  const { scheduleId } = await params;
  const schedule = findScheduleRowById(decodeURIComponent(scheduleId));

  if (!schedule) {
    return NextResponse.json({ error: "Jadwal keberangkatan tidak ditemukan" }, { status: 404 });
  }

  const bookings = listBookingRows().filter((booking) => booking.scheduleId === schedule.id);
  const participants = bookings.flatMap((booking) => listParticipantsForBooking(booking.id));
  const completedDocuments = participants.filter((participant) => participant.documentStatus === "Lengkap").length;
  const pendingDocuments = participants.length - completedDocuments;
  const paidBookings = bookings.filter((booking) => booking.status === "Lunas").length;

  return NextResponse.json(
    {
      data: {
        scheduleId: schedule.id,
        departureDate: schedule.departureDate,
        returnDate: schedule.returnDate,
        quota: schedule.quota,
        bookingCount: bookings.length,
        participantCount: participants.length,
        paidBookingCount: paidBookings,
        pendingPaymentBookingCount: bookings.length - paidBookings,
        remainingSeats: Math.max(schedule.quota - participants.length, 0),
        documentSummary: {
          completed: completedDocuments,
          pending: pendingDocuments,
          total: participants.length,
        },
      },
      meta: {
        source: "dummy",
      },
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
