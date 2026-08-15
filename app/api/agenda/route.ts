import { NextResponse } from "next/server";
import { AGENDA_CATEGORIES, MANUAL_CATEGORIES, createAgendaEvent, listAgendaEvents } from "@/lib/agenda/store";

export async function GET() {
  const data = await listAgendaEvents();

  return NextResponse.json(
    {
      data,
      meta: {
        total: data.length,
        manual: data.filter((e) => e.source === "manual").length,
        derived: data.filter((e) => e.source === "derived").length,
        categories: AGENDA_CATEGORIES,
      },
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));

  const title = String(body.title ?? "").trim();
  if (!title) {
    return NextResponse.json(
      { error: "Judul kegiatan wajib diisi", fields: { title: "Judul tidak boleh kosong" } },
      { status: 400 },
    );
  }

  const date = String(body.date ?? "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json(
      { error: "Tanggal kegiatan tidak valid", fields: { date: "Format tanggal harus YYYY-MM-DD" } },
      { status: 400 },
    );
  }

  // Keberangkatan/Kepulangan/Pelunasan are computed from the package and its
  // bookings, so accepting a hand-made one would let the calendar contradict
  // the data it is supposed to be reporting.
  const category = String(body.category ?? "Manasik");
  if (!MANUAL_CATEGORIES.includes(category as (typeof MANUAL_CATEGORIES)[number])) {
    return NextResponse.json(
      {
        error: "Kategori tidak bisa dibuat manual",
        fields: {
          category: `Pilih salah satu: ${MANUAL_CATEGORIES.join(", ")}. Keberangkatan, Kepulangan & Pelunasan dihitung otomatis dari data grup.`,
        },
      },
      { status: 400 },
    );
  }

  const event = await createAgendaEvent({
    title,
    category,
    date,
    time: body.time,
    location: body.location,
    notes: body.notes,
    packageId: body.packageId,
    createdBy: body.createdBy,
  });

  return NextResponse.json({ data: event }, { status: 201 });
}
