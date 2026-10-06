import { NextResponse } from "next/server";
import { ALLOWED_DOC_MIME, MAX_DOC_BYTES, SUPPORTING_DOC_SUBTYPES, isDocType } from "@/lib/jamaah/rules";
import { findJamaah, upsertDocument } from "@/lib/jamaah/store";
import { StorageNotConfiguredError, buildStoragePath, deleteObjects, uploadObject } from "@/lib/jamaah/storage";

/**
 * Jenis berkas ditentukan dari isi byte awalnya, bukan dari `file.type` yang
 * dikirim browser -- itu cuma label yang bisa diisi apa saja oleh pengirim.
 */
function sniffMime(bytes: Uint8Array): string | null {
  const startsWith = (sig: number[], offset = 0) => sig.every((b, i) => bytes[offset + i] === b);
  if (startsWith([0x25, 0x50, 0x44, 0x46])) return "application/pdf"; // %PDF
  if (startsWith([0xff, 0xd8, 0xff])) return "image/jpeg";
  if (startsWith([0x89, 0x50, 0x4e, 0x47])) return "image/png";
  if (startsWith([0x52, 0x49, 0x46, 0x46]) && startsWith([0x57, 0x45, 0x42, 0x50], 8)) return "image/webp";
  return null;
}

/**
 * Upload satu dokumen (multipart: file, docType, docSubtype?). Dipakai jalur
 * admin dan jalur pendataan publik, supaya aturan jenis/ukuran berkas tidak
 * bisa berbeda di antara keduanya.
 */
export async function handleDocumentUpload(
  request: Request,
  jamaahId: string,
  opts: { via: "admin" | "umrahme"; actor: string; headers?: HeadersInit },
) {
  const headers = opts.headers;
  const form = await request.formData().catch(() => null);
  if (!form) {
    return NextResponse.json({ error: "Kirim sebagai multipart/form-data" }, { status: 400, headers });
  }

  const docType = String(form.get("docType") ?? "");
  const docSubtype = String(form.get("docSubtype") ?? "");
  const file = form.get("file");

  if (!isDocType(docType)) {
    return NextResponse.json({ error: "Jenis dokumen tidak dikenal", fields: { docType: "Jenis dokumen tidak valid" } }, { status: 400, headers });
  }
  if (docType === "pendukung" && !SUPPORTING_DOC_SUBTYPES.some((s) => s.value === docSubtype)) {
    return NextResponse.json(
      { error: "Pilih jenis dokumen pendukung: akta kelahiran, ijazah, atau buku nikah", fields: { docSubtype: "Wajib dipilih" } },
      { status: 400, headers },
    );
  }
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Berkas belum dipilih", fields: { file: "Wajib" } }, { status: 400, headers });
  }
  if (file.size > MAX_DOC_BYTES) {
    return NextResponse.json({ error: "Ukuran berkas maksimal 5 MB" , fields: { file: "Terlalu besar" } }, { status: 413, headers });
  }

  const bytes = await file.arrayBuffer();
  const mimeType = sniffMime(new Uint8Array(bytes.slice(0, 12)));
  if (!mimeType || !(ALLOWED_DOC_MIME as readonly string[]).includes(mimeType)) {
    return NextResponse.json({ error: "Format berkas harus JPG, PNG, WEBP, atau PDF", fields: { file: "Format tidak didukung" } }, { status: 415, headers });
  }

  const jamaah = await findJamaah(jamaahId);
  if (!jamaah) return NextResponse.json({ error: "Jamaah tidak ditemukan" }, { status: 404, headers });

  const storagePath = buildStoragePath(jamaah.id, docType, mimeType);
  try {
    await uploadObject(storagePath, bytes, mimeType);
  } catch (err) {
    const status = err instanceof StorageNotConfiguredError ? 503 : 502;
    return NextResponse.json({ error: (err as Error).message }, { status, headers });
  }

  try {
    const { previousPath } = await upsertDocument({
      jamaahId: jamaah.id,
      docType,
      docSubtype: docType === "pendukung" ? docSubtype : "",
      storagePath,
      fileName: file.name || `${docType}`,
      mimeType,
      sizeBytes: file.size,
      uploadedVia: opts.via,
      uploadedBy: opts.actor,
    });
    if (previousPath) await deleteObjects([previousPath]);
  } catch (err) {
    // Baris DB gagal ditulis: jangan tinggalkan berkas yang tidak dirujuk siapa pun.
    await deleteObjects([storagePath]);
    throw err;
  }

  return NextResponse.json({ data: await findJamaah(jamaah.id) }, { status: 201, headers });
}
