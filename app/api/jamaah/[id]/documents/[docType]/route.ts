import { NextResponse } from "next/server";
import { isDocType } from "@/lib/jamaah/rules";
import { deleteDocument, findDocumentPath, findJamaah } from "@/lib/jamaah/store";
import { StorageNotConfiguredError, deleteObjects, downloadObject } from "@/lib/jamaah/storage";

type RouteProps = { params: Promise<{ id: string; docType: string }> };

/** Menyajikan berkas lewat server; bucket-nya private dan klien tidak pernah dapat URL storage. */
export async function GET(request: Request, { params }: RouteProps) {
  const { id, docType } = await params;
  if (!isDocType(docType)) return NextResponse.json({ error: "Jenis dokumen tidak dikenal" }, { status: 400 });

  const doc = await findDocumentPath(id, docType);
  if (!doc) return NextResponse.json({ error: "Dokumen belum diupload" }, { status: 404 });

  let upstream: Response;
  try {
    upstream = await downloadObject(doc.storagePath);
  } catch (err) {
    const status = err instanceof StorageNotConfiguredError ? 503 : 502;
    return NextResponse.json({ error: (err as Error).message }, { status });
  }

  const download = new URL(request.url).searchParams.get("download") === "1";
  const safeName = doc.fileName.replace(/[^\w.\- ]+/g, "_") || docType;

  return new Response(upstream.body, {
    headers: {
      "Content-Type": doc.mimeType,
      "Content-Disposition": `${download ? "attachment" : "inline"}; filename="${safeName}"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export async function DELETE(_: Request, { params }: RouteProps) {
  const { id, docType } = await params;
  if (!isDocType(docType)) return NextResponse.json({ error: "Jenis dokumen tidak dikenal" }, { status: 400 });

  const path = await deleteDocument(id, docType);
  if (!path) return NextResponse.json({ error: "Dokumen tidak ditemukan" }, { status: 404 });

  await deleteObjects([path]).catch(() => undefined);
  return NextResponse.json({ data: await findJamaah(id) });
}
