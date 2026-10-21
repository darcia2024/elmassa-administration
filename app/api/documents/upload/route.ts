import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const docType = (formData.get("type") as string) || "document";
    const groupName = (formData.get("groupName") as string) || "umum";

    if (!file) {
      return NextResponse.json({ error: "Berkas tidak ditemukan" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Sanitize filename
    const origName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const safeDocType = docType.toLowerCase().replace(/[^a-z0-9]/g, "-");
    const timestamp = Date.now();
    const finalFileName = `${safeDocType}-${timestamp}-${origName}`;

    const uploadDir = path.join(process.cwd(), "public", "uploads", "documents");
    await mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, finalFileName);
    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/documents/${finalFileName}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName: file.name,
      savedAs: finalFileName,
      docType,
      groupName,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Gagal mengunggah berkas" },
      { status: 500 }
    );
  }
}
