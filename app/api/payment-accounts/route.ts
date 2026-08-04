import { NextRequest, NextResponse } from "next/server";
import { createBankAccount, listBankAccounts } from "@/lib/settings/store";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q")?.trim().toLowerCase() ?? "";
  const status = searchParams.get("status")?.trim();
  const primary = searchParams.get("primary")?.trim();

  const all = await listBankAccounts();

  const data = all.filter((item) => {
    const searchable = `${item.bankName} ${item.accountNumber} ${item.accountName} ${item.branch}`.toLowerCase();
    const matchesQuery = query.length === 0 || searchable.includes(query);
    const matchesStatus = !status || status === "Semua" || item.status === status;
    const matchesPrimary =
      !primary ||
      primary === "Semua" ||
      (primary === "true" && item.isPrimary) ||
      (primary === "false" && !item.isPrimary);

    return matchesQuery && matchesStatus && matchesPrimary;
  });

  return NextResponse.json(
    {
      data,
      summary: {
        accountCount: data.length,
        activeCount: data.filter((item) => item.status === "Aktif").length,
        primaryAccountId: data.find((item) => item.isPrimary)?.id ?? null,
      },
      meta: {
        total: data.length,
        source: "supabase",
        filters: {
          q: query,
          status: status ?? null,
          primary: primary ?? null,
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

  if (!body.bankName || !body.accountName) {
    return NextResponse.json(
      {
        error: "bankName dan accountName wajib diisi",
      },
      {
        status: 400,
      },
    );
  }

  const data = await createBankAccount({
    bankName: String(body.bankName),
    accountNumber: String(body.accountNumber ?? ""),
    accountName: String(body.accountName),
    branch: String(body.branch ?? ""),
    isPrimary: readBoolean(body.isPrimary),
    status: String(body.status ?? "Aktif"),
    notes: body.notes === undefined ? undefined : String(body.notes),
  });

  return NextResponse.json({ data }, { status: 201 });
}

function readBoolean(value: unknown) {
  return value === true || value === "true" || value === 1 || value === "1";
}
