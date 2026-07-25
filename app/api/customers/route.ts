import { NextRequest, NextResponse } from "next/server";
import { createCustomerRow, listCustomerRows } from "@/lib/seed-data/customers";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q")?.trim().toLowerCase() ?? "";
  const customerType = searchParams.get("type")?.trim();
  const status = searchParams.get("status")?.trim();

  const data = listCustomerRows().filter((item) => {
    const searchable = `${item.name} ${item.phone} ${item.email ?? ""} ${item.city} ${item.address}`.toLowerCase();
    const matchesQuery = query.length === 0 || searchable.includes(query);
    const matchesType = !customerType || customerType === "Semua" || item.customerType === customerType;
    const matchesStatus = !status || status === "Semua" || item.status === status;

    return matchesQuery && matchesType && matchesStatus;
  });

  return NextResponse.json(
    {
      data,
      meta: {
        total: data.length,
        source: "dummy",
        filters: {
          q: query,
          type: customerType ?? null,
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

export async function POST(request: NextRequest) {
  const body = await request.json();

  if (!body.name || !body.phone) {
    return NextResponse.json(
      {
        error: "name dan phone wajib diisi",
      },
      {
        status: 400,
      },
    );
  }

  const data = createCustomerRow({
    name: String(body.name),
    phone: String(body.phone),
    email: body.email === undefined || body.email === null ? null : String(body.email),
    address: String(body.address ?? ""),
    city: String(body.city ?? ""),
    customerType: String(body.customerType ?? "Individu"),
    status: String(body.status ?? "Prospek"),
  });

  return NextResponse.json({ data }, { status: 201 });
}
