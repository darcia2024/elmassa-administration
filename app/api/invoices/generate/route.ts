import { NextRequest, NextResponse } from "next/server";
import { generateInvoiceFromBooking } from "@/lib/invoices/store";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));

  if (!body.bookingCode) {
    return NextResponse.json({ error: "bookingCode wajib diisi" }, { status: 400 });
  }

  try {
    const data = await generateInvoiceFromBooking(String(body.bookingCode), {
      dueDate: body.dueDateValue === undefined ? undefined : String(body.dueDateValue),
      forceNew: Boolean(body.forceNew),
      notes: body.notes === undefined ? undefined : String(body.notes),
    });

    if (!data) {
      return NextResponse.json({ error: "Booking tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Gagal membuat invoice" }, { status: 500 });
  }
}
