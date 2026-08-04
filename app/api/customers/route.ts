import { NextRequest, NextResponse } from "next/server";
import { createCustomer, listCustomers } from "@/lib/customers/store";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q")?.trim().toLowerCase() ?? "";
  const customerType = searchParams.get("type")?.trim();
  const status = searchParams.get("status")?.trim();

  const all = await listCustomers();

  const data = all.filter((item) => {
    const searchable = `${item.name} ${item.phone} ${item.email} ${item.city} ${item.address}`.toLowerCase();
    const matchesQuery = query.length === 0 || searchable.includes(query);
    const matchesType = !customerType || customerType === "Semua" || item.type === customerType;
    const matchesStatus = !status || status === "Semua" || item.status === status;

    return matchesQuery && matchesType && matchesStatus;
  });

  return NextResponse.json(
    {
      data,
      meta: {
        total: data.length,
        source: "supabase",
        filters: { q: query, type: customerType ?? null, status: status ?? null },
      },
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const name = String(body.name ?? "").trim();
  const phone = String(body.phone ?? "").trim();
  const fields: Record<string, string> = {};

  if (!name) fields.name = "Nama wajib diisi";
  if (!phone) fields.phone = "Nomor telepon wajib diisi";

  if (Object.keys(fields).length > 0) {
    return NextResponse.json({ error: "Data pelanggan tidak valid", fields }, { status: 400 });
  }

  try {
    const data = await createCustomer({
      name,
      phone,
      email: body.email === undefined ? undefined : String(body.email),
      address: body.address === undefined ? undefined : String(body.address),
      city: body.city === undefined ? undefined : String(body.city),
      type: body.type === undefined ? undefined : String(body.type),
      status: body.status === undefined ? undefined : String(body.status),
    });

    return NextResponse.json({ data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Gagal menyimpan pelanggan" }, { status: 500 });
  }
}
