import { NextResponse } from "next/server";
import { deleteEmployee, findEmployee, updateEmployee } from "@/lib/employees/store";

type RouteProps = { params: Promise<{ id: string }> };

export async function GET(_: Request, { params }: RouteProps) {
  const { id } = await params;
  const employee = await findEmployee(id);

  if (!employee) return NextResponse.json({ error: "Karyawan tidak ditemukan" }, { status: 404 });
  return NextResponse.json({ data: employee }, { headers: { "Cache-Control": "no-store" } });
}

export async function PATCH(request: Request, { params }: RouteProps) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));

  if (body.name !== undefined && !String(body.name).trim()) {
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

  const updated = await updateEmployee(id, body);
  if (!updated) return NextResponse.json({ error: "Karyawan tidak ditemukan" }, { status: 404 });

  return NextResponse.json({ data: updated });
}

export async function DELETE(_: Request, { params }: RouteProps) {
  const { id } = await params;
  const deleted = await deleteEmployee(id);

  if (!deleted) return NextResponse.json({ error: "Karyawan tidak ditemukan" }, { status: 404 });
  return NextResponse.json({ data: { id, deleted: true } });
}
