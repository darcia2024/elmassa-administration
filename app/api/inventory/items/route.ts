import { NextResponse } from "next/server";
import { ITEM_CATEGORIES, createItem, listItems } from "@/lib/inventory/store";

export async function GET() {
  const data = await listItems();

  return NextResponse.json(
    {
      data,
      meta: {
        total: data.length,
        lowStock: data.filter((i) => i.isLow).length,
        totalStockValue: data.reduce((sum, i) => sum + i.stockValue, 0),
        categories: ITEM_CATEGORIES,
      },
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));

  const name = String(body.name ?? "").trim();
  if (!name) {
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

  const item = await createItem({ ...body, name });
  return NextResponse.json({ data: item }, { status: 201 });
}
