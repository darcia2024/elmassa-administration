import { NextRequest, NextResponse } from "next/server";
import { listBookingRows, listParticipantsForBooking } from "@/lib/seed-data/bookings";
import { listPackageRows } from "@/lib/seed-data/packages";
import { listAllScheduleRows } from "@/lib/seed-data/schedules";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const packageId = searchParams.get("packageId")?.trim();
  const status = searchParams.get("status")?.trim();

  const packageById = new Map(listPackageRows().map((item) => [item.id, item]));
  const bookings = listBookingRows();

  const data = listAllScheduleRows()
    .filter((schedule) => !packageId || schedule.packageId === packageId)
    .filter((schedule) => !status || status === "Semua" || schedule.status === status)
    .map((schedule) => {
      const packageRow = packageById.get(schedule.packageId);
      const scheduleBookings = bookings.filter((booking) => booking.scheduleId === schedule.id);
      const participants = scheduleBookings.flatMap((booking) => listParticipantsForBooking(booking.id));
      const completedDocuments = participants.filter((participant) => participant.documentStatus === "Lengkap").length;

      return {
        id: schedule.id,
        label: `${packageRow?.name ?? "Paket"} - ${schedule.departureDate}`,
        packageId: schedule.packageId,
        packageName: packageRow?.name ?? null,
        serviceType: packageRow?.serviceType ?? null,
        departureDate: schedule.departureDate,
        returnDate: schedule.returnDate,
        price: schedule.price,
        quota: schedule.quota,
        bookedSeats: participants.length,
        remainingSeats: Math.max(schedule.quota - participants.length, 0),
        bookingCount: scheduleBookings.length,
        meetingPoint: schedule.meetingPoint,
        status: schedule.status,
        documentSummary: {
          completed: completedDocuments,
          pending: Math.max(participants.length - completedDocuments, 0),
          total: participants.length,
        },
      };
    })
    .sort((first, second) => first.departureDate.localeCompare(second.departureDate));

  return NextResponse.json(
    {
      data,
      meta: {
        total: data.length,
        source: "dummy",
        filters: {
          packageId: packageId ?? null,
          status: status ?? null,
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
