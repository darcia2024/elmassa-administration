import { NextResponse } from "next/server";
import { COMPLETENESS_STATUSES, validateFields } from "@/lib/jamaah/rules";
import { createJamaah, findDuplicate, listJamaah } from "@/lib/jamaah/store";
import { isStorageConfigured } from "@/lib/jamaah/storage";

export async function GET() {
  const data = await listJamaah();

  return NextResponse.json(
    {
      data,
      meta: {
        total: data.length,
        byStatus: Object.fromEntries(
          COMPLETENESS_STATUSES.map((s) => [s, data.filter((j) => j.completeness.status === s).length]),
        ),
        storageConfigured: isStorageConfigured(),
      },
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const fullName = String(body.fullName ?? "").trim();

  const fields = validateFields({ ...body, fullName });
  if (Object.keys(fields).length > 0) {
    return NextResponse.json({ error: Object.values(fields)[0], fields }, { status: 400 });
  }

  const duplicate = await findDuplicate(body);
  if (duplicate) {
    return NextResponse.json(
      {
        error: `Jamaah dengan NIK/paspor ini sudah terdaftar atas nama ${duplicate.fullName}`,
        duplicateId: duplicate.id,
      },
      { status: 409 },
    );
  }

  const actor = request.headers.get("x-el-massa-user-id") ?? "";
  const created = await createJamaah({ ...body, fullName }, { actor, source: "admin" });
  return NextResponse.json({ data: created }, { status: 201 });
}
