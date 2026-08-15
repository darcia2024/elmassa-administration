import { NextResponse } from "next/server";
import { EMPLOYEE_STATUSES, EMPLOYMENT_STATUSES, createEmployee, listEmployees } from "@/lib/employees/store";

export async function GET() {
  const data = await listEmployees();

  return NextResponse.json(
    {
      data,
      meta: {
        total: data.length,
        aktif: data.filter((e) => e.status === "Aktif").length,
        tetap: data.filter((e) => e.employmentStatus === "Tetap").length,
        employmentStatuses: EMPLOYMENT_STATUSES,
        statuses: EMPLOYEE_STATUSES,
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
      { error: "Nama karyawan wajib diisi", fields: { name: "Nama tidak boleh kosong" } },
      { status: 400 },
    );
  }

  if (body.joinDate && !/^\d{4}-\d{2}-\d{2}$/.test(String(body.joinDate))) {
    return NextResponse.json(
      { error: "Tanggal masuk tidak valid", fields: { joinDate: "Format tanggal harus YYYY-MM-DD" } },
      { status: 400 },
    );
  }

  const employee = await createEmployee({ ...body, name });
  return NextResponse.json({ data: employee }, { status: 201 });
}
