import { NextRequest, NextResponse } from "next/server";
import { deleteCustomer, findCustomer, updateCustomer } from "@/lib/customers/store";

type CustomerDetailRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_: NextRequest, { params }: CustomerDetailRouteProps) {
  const { id } = await params;
  const data = await findCustomer(decodeURIComponent(id));

  if (!data) {
    return NextResponse.json({ error: "Pelanggan tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json({ data });
}

export async function PATCH(request: NextRequest, { params }: CustomerDetailRouteProps) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));

  if (body.name !== undefined && !String(body.name).trim()) {
    return NextResponse.json(
      { error: "Data pelanggan tidak valid", fields: { name: "Nama wajib diisi" } },
      { status: 400 },
    );
  }

  try {
    const data = await updateCustomer(decodeURIComponent(id), {
      name: body.name === undefined ? undefined : String(body.name),
      phone: body.phone === undefined ? undefined : String(body.phone),
      email: body.email === undefined ? undefined : String(body.email),
      address: body.address === undefined ? undefined : String(body.address),
      city: body.city === undefined ? undefined : String(body.city),
      type: body.type === undefined ? undefined : String(body.type),
      status: body.status === undefined ? undefined : String(body.status),
    });

    if (!data) {
      return NextResponse.json({ error: "Pelanggan tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ data });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Gagal memperbarui pelanggan" }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: CustomerDetailRouteProps) {
  const { id } = await params;
  const removed = await deleteCustomer(decodeURIComponent(id));

  if (!removed) {
    return NextResponse.json({ error: "Pelanggan tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json({ data: { id: decodeURIComponent(id) } });
}
