import { NextRequest, NextResponse } from "next/server";
import { getCustomerHistory } from "@/lib/seed-data/customer-history";
import { findCustomerRow, updateCustomerRow } from "@/lib/seed-data/customers";

type CustomerDetailRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_: NextRequest, { params }: CustomerDetailRouteProps) {
  const { id } = await params;
  const data = findCustomerRow(id);

  if (!data) {
    return NextResponse.json({ error: "Pelanggan tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json({
    data: {
      customer: data,
      ...getCustomerHistory(id),
    },
  });
}

export async function PATCH(request: NextRequest, { params }: CustomerDetailRouteProps) {
  const { id } = await params;
  const body = await request.json();
  const data = updateCustomerRow(id, {
    name: body.name === undefined ? undefined : String(body.name),
    phone: body.phone === undefined ? undefined : String(body.phone),
    email: body.email === undefined ? undefined : body.email === null ? null : String(body.email),
    address: body.address === undefined ? undefined : String(body.address),
    city: body.city === undefined ? undefined : String(body.city),
    customerType: body.customerType === undefined ? undefined : String(body.customerType),
    status: body.status === undefined ? undefined : String(body.status),
  });

  if (!data) {
    return NextResponse.json({ error: "Pelanggan tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json({ data });
}
