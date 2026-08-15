import { NextResponse } from "next/server";
import { MANUAL_CATEGORIES, deleteAgendaEvent, updateAgendaEvent } from "@/lib/agenda/store";

type RouteProps = {
  params: Promise<{ id: string }>;
};

/** Derived events carry a `<packageId>::<kind>` id and exist only in memory. */
function isDerivedId(id: string) {
  return id.includes("::");
}

const DERIVED_RESPONSE = NextResponse.json(
  {
    error: "Kegiatan ini dihitung otomatis dari data grup",
    fields: {
      id: "Keberangkatan, Kepulangan & Batas Pelunasan mengikuti tanggal grup dan status pembayaran. Ubah lewat grup keberangkatannya.",
    },
  },
  { status: 400 },
);

export async function PATCH(request: Request, { params }: RouteProps) {
  const { id } = await params;
  if (isDerivedId(id)) return DERIVED_RESPONSE;

  const body = await request.json().catch(() => ({}));

  if (body.title !== undefined && !String(body.title).trim()) {
    return NextResponse.json(
      { error: "Judul kegiatan wajib diisi", fields: { title: "Judul tidak boleh kosong" } },
      { status: 400 },
    );
  }

  if (body.date !== undefined && !/^\d{4}-\d{2}-\d{2}$/.test(String(body.date))) {
    return NextResponse.json(
      { error: "Tanggal kegiatan tidak valid", fields: { date: "Format tanggal harus YYYY-MM-DD" } },
      { status: 400 },
    );
  }

  if (body.category !== undefined && !MANUAL_CATEGORIES.includes(String(body.category) as (typeof MANUAL_CATEGORIES)[number])) {
    return NextResponse.json(
      { error: "Kategori tidak valid", fields: { category: `Pilih salah satu: ${MANUAL_CATEGORIES.join(", ")}` } },
      { status: 400 },
    );
  }

  const updated = await updateAgendaEvent(id, body);

  if (!updated) {
    return NextResponse.json({ error: "Kegiatan tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json({ data: updated });
}

export async function DELETE(_: Request, { params }: RouteProps) {
  const { id } = await params;
  if (isDerivedId(id)) return DERIVED_RESPONSE;

  const deleted = await deleteAgendaEvent(id);

  if (!deleted) {
    return NextResponse.json({ error: "Kegiatan tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json({ data: { id, deleted: true } });
}
