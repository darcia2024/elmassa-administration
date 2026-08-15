import { NextResponse } from "next/server";
import { MOVEMENT_TYPES, createMovement, listMovements, type MovementType } from "@/lib/inventory/store";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const data = await listMovements(searchParams.get("itemId") ?? undefined);

  return NextResponse.json(
    {
      data,
      meta: {
        total: data.length,
        masuk: data.filter((m) => m.movementType === "masuk").reduce((sum, m) => sum + m.quantity, 0),
        keluar: data.filter((m) => m.movementType === "keluar").reduce((sum, m) => sum + m.quantity, 0),
      },
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));

  const movementType = String(body.movementType ?? "");
  if (!(MOVEMENT_TYPES as readonly string[]).includes(movementType)) {
    return NextResponse.json(
      { error: "Jenis pergerakan tidak valid", fields: { movementType: "Pilih 'masuk' atau 'keluar'" } },
      { status: 400 },
    );
  }

  const movedAt = String(body.movedAt ?? "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(movedAt)) {
    return NextResponse.json(
      { error: "Tanggal tidak valid", fields: { movedAt: "Format tanggal harus YYYY-MM-DD" } },
      { status: 400 },
    );
  }

  // The store owns the stock check -- an outgoing move bigger than what is on
  // hand is refused there, so the ledger can never imply negative stock.
  const result = await createMovement({
    itemId: String(body.itemId ?? ""),
    movementType: movementType as MovementType,
    quantity: Number(body.quantity),
    movedAt,
    packageId: body.packageId,
    notes: body.notes,
    recordedBy: body.recordedBy,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error, fields: { quantity: result.error } }, { status: 400 });
  }

  return NextResponse.json({ data: result.item }, { status: 201 });
}
