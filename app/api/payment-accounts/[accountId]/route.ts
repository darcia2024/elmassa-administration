import { NextRequest, NextResponse } from "next/server";
import { deleteBankAccount, listBankAccounts, updateBankAccount } from "@/lib/settings/store";

type PaymentAccountDetailRouteProps = {
  params: Promise<{
    accountId: string;
  }>;
};

export async function GET(_: NextRequest, { params }: PaymentAccountDetailRouteProps) {
  const { accountId } = await params;
  const id = decodeURIComponent(accountId);
  const data = (await listBankAccounts()).find((row) => row.id === id);

  if (!data) {
    return NextResponse.json({ error: "Rekening pembayaran tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json({ data });
}

export async function PATCH(request: NextRequest, { params }: PaymentAccountDetailRouteProps) {
  const { accountId } = await params;
  const body = await request.json();
  const data = await updateBankAccount(decodeURIComponent(accountId), {
    bankName: body.bankName === undefined ? undefined : String(body.bankName),
    accountNumber: body.accountNumber === undefined ? undefined : String(body.accountNumber),
    accountName: body.accountName === undefined ? undefined : String(body.accountName),
    branch: body.branch === undefined ? undefined : String(body.branch),
    isPrimary: body.isPrimary === undefined ? undefined : readBoolean(body.isPrimary),
    status: body.status === undefined ? undefined : String(body.status),
    notes: body.notes === undefined ? undefined : String(body.notes),
  });

  if (!data) {
    return NextResponse.json({ error: "Rekening pembayaran tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json({ data });
}

export async function DELETE(_: NextRequest, { params }: PaymentAccountDetailRouteProps) {
  const { accountId } = await params;
  const decodedId = decodeURIComponent(accountId);
  const deleted = await deleteBankAccount(decodedId);

  if (!deleted) {
    return NextResponse.json({ error: "Rekening pembayaran tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json({ data: { id: decodedId, deleted: true } });
}

function readBoolean(value: unknown) {
  return value === true || value === "true" || value === 1 || value === "1";
}
