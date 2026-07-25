import { NextRequest, NextResponse } from "next/server";
import { updateBookingManualStatus } from "@/lib/seed-data/bookings";

const allowedManualStatuses = ["Dibatalkan", "Refund"] as const;

type BookingStatusRouteProps = {
  params: Promise<{
    code: string;
  }>;
};

export async function PATCH(request: NextRequest, { params }: BookingStatusRouteProps) {
  const { code } = await params;
  const body = await request.json();
  const status = typeof body.status === "string" ? body.status.trim() : "";

  if (!allowedManualStatuses.includes(status as (typeof allowedManualStatuses)[number])) {
    return NextResponse.json(
      {
        error: "Status booking manual tidak valid",
        details: [`status harus salah satu dari: ${allowedManualStatuses.join(", ")}`],
      },
      {
        status: 400,
      },
    );
  }

  const data = updateBookingManualStatus(decodeURIComponent(code), status);

  if (!data) {
    return NextResponse.json({ error: "Booking tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json({
    data,
    meta: {
      manualOverride: true,
    },
  });
}
