import { NextResponse } from "next/server";
import { ITEM_CATEGORIES, deleteItem, findItem, updateItem } from "@/lib/inventory/store";

type RouteProps = { params: Promise<{ id: string }> };

export async function GET(_: Request, { params }: RouteProps) {
  const { id } = await params;
  const item = await findItem(id);

  if (!item) return NextResponse.json({ error: "Barang tidak ditemukan" }, { status: 404 });
  return NextResponse.json({ data: item }, { headers: { "Cache-Control": "no-store" } });
}

export async function PATCH(request: Request, { params }: RouteProps) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));

  if (body.name !== undefined && !String(body.name).trim()) {
    return NextResponse.json(
      { error: "Nama barang wajib diisi", fields: { name: "Nama tidak boleh kosong" } },
      { status: 400 },
    );
  }

  if (body.category !== undefined && !(ITEM_CATEGORIES as readonly string[]).includes(String(body.category))) {
    return NextResponse.json(
      { error: "Kategori tidak valid", fields: { category: `Pilih salah satu: ${ITEM_CATEGORIES.join(", ")}` } },
      { status: 400 },
    );
  }

  const updated = await updateItem(id, body);
  if (!updated) return NextResponse.json({ error: "Barang tidak ditemukan" }, { status: 404 });

  return NextResponse.json({ data: updated });
}

export async function DELETE(_: Request, { params }: RouteProps) {
  const { id } = await params;
  const deleted = await deleteItem(id);

  if (!deleted) return NextResponse.json({ error: "Barang tidak ditemukan" }, { status: 404 });
  return NextResponse.json({ data: { id, deleted: true } });
}
