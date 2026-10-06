import { NextResponse } from "next/server";
import { validateFields } from "@/lib/jamaah/rules";
import { deleteJamaah, findDuplicate, findJamaah, updateJamaah } from "@/lib/jamaah/store";
import { deleteObjects, isStorageConfigured } from "@/lib/jamaah/storage";

type RouteProps = { params: Promise<{ id: string }> };

export async function GET(_: Request, { params }: RouteProps) {
  const { id } = await params;
  const jamaah = await findJamaah(id);

  if (!jamaah) return NextResponse.json({ error: "Jamaah tidak ditemukan" }, { status: 404 });
  return NextResponse.json(
    { data: jamaah, meta: { storageConfigured: isStorageConfigured() } },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function PATCH(request: Request, { params }: RouteProps) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));

  const fields = validateFields(body);
  if (Object.keys(fields).length > 0) {
    return NextResponse.json({ error: Object.values(fields)[0], fields }, { status: 400 });
  }

  if (body.nik !== undefined || body.passportNumber !== undefined) {
    const duplicate = await findDuplicate(body, id);
    if (duplicate) {
      return NextResponse.json(
        {
          error: `NIK/paspor ini sudah dipakai profil ${duplicate.fullName}`,
          duplicateId: duplicate.id,
        },
        { status: 409 },
      );
    }
  }

  const actor = request.headers.get("x-el-massa-user-id") ?? "";
  const updated = await updateJamaah(id, body, actor);
  if (!updated) return NextResponse.json({ error: "Jamaah tidak ditemukan" }, { status: 404 });

  return NextResponse.json({ data: updated });
}

export async function DELETE(_: Request, { params }: RouteProps) {
  const { id } = await params;
  const paths = await deleteJamaah(id);

  if (paths === null) return NextResponse.json({ error: "Jamaah tidak ditemukan" }, { status: 404 });
  if (paths.length > 0 && isStorageConfigured()) await deleteObjects(paths);

  return NextResponse.json({ data: { id, deleted: true } });
}
