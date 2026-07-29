import { NextRequest, NextResponse } from "next/server";
import { createStaffUserRow, listStaffUserRows, parseStaffUserPayload } from "@/lib/seed-data/staff-users";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q")?.trim().toLowerCase() ?? "";
  const role = searchParams.get("role")?.trim();
  const branch = searchParams.get("branch")?.trim();
  const status = searchParams.get("status")?.trim();

  const data = listStaffUserRows().filter((item) => {
    const searchable = `${item.name} ${item.email} ${item.phone} ${item.role} ${item.branch}`.toLowerCase();
    const matchesQuery = query.length === 0 || searchable.includes(query);
    const matchesRole = !role || role === "Semua" || item.role === role;
    const matchesBranch = !branch || branch === "Semua" || item.branch === branch;
    const matchesStatus = !status || status === "Semua" || item.status === status;

    return matchesQuery && matchesRole && matchesBranch && matchesStatus;
  });

  return NextResponse.json(
    {
      data,
      summary: {
        staffCount: data.length,
        activeCount: data.filter((item) => item.status === "Aktif").length,
        financeAdminCount: data.filter((item) => item.role === "Sub-User Keuangan" && item.status === "Aktif").length,
      },
      meta: {
        total: data.length,
        source: "dummy",
        filters: {
          q: query,
          role: role ?? null,
          branch: branch ?? null,
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
  const parsed = parseStaffUserPayload(body);

  if ("errors" in parsed) {
    return NextResponse.json({ error: "Payload staf pengguna tidak valid", fields: parsed.errors }, { status: 400 });
  }

  const data = createStaffUserRow({
    name: parsed.data.name!,
    email: parsed.data.email!,
    phone: parsed.data.phone ?? "",
    role: parsed.data.role!,
    branch: parsed.data.branch!,
    status: parsed.data.status!,
  });

  return NextResponse.json({ data }, { status: 201 });
}
