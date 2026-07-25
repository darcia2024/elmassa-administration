import { NextRequest, NextResponse } from "next/server";
import { generateInvoiceFromBooking } from "@/lib/seed-data/invoices";

export async function POST(request: NextRequest) {
  const body = await request.json();

  if (!body.bookingCode) {
    return NextResponse.json(
      {
        error: "bookingCode wajib diisi",
      },
      {
        status: 400,
      },
    );
  }

  const data = generateInvoiceFromBooking(String(body.bookingCode), {
    dueDateValue: body.dueDateValue === undefined ? undefined : String(body.dueDateValue),
    forceNew: Boolean(body.forceNew),
    notes: body.notes === undefined ? undefined : String(body.notes),
  });

  if (!data) {
    return NextResponse.json({ error: "Booking tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json({ data }, { status: 201 });
}
