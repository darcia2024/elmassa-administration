import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";
import { getCompanyIdentity, updateCompanyIdentity } from "@/lib/settings/store";

const logoMimeExtensions: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/svg+xml": "svg",
};

export async function GET() {
  return NextResponse.json(
    {
      data: await getCompanyIdentity(),
      meta: {
        source: "supabase",
      },
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const parsed = parseCompanyIdentityPayload(body);

  if ("errors" in parsed) {
    return NextResponse.json({ error: "Payload identitas dokumen tidak valid", fields: parsed.errors }, { status: 400 });
  }

  const data = await updateCompanyIdentity({
    address: parsed.data.address,
    documentFooter: parsed.data.documentFooter,
    email: parsed.data.email,
    legalName: parsed.data.legalName,
    logoUrl: parsed.data.logoUrl,
    name: parsed.data.name,
    phone: parsed.data.phone,
    website: parsed.data.website,
    kemenkumham: parsed.data.kemenkumham,
    ppiu: parsed.data.ppiu,
    gmapsUrl: parsed.data.gmapsUrl,
    signatureUrl: parsed.data.signatureUrl,
    signatureName: parsed.data.signatureName,
    signaturePosition: parsed.data.signaturePosition,
    stampUrl: parsed.data.stampUrl,
  });

  return NextResponse.json({ data });
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("logo");

  if (!(file instanceof File)) {
    return NextResponse.json(
      {
        error: "Logo wajib diunggah",
        fields: {
          logo: "Gunakan field multipart bernama logo",
        },
      },
      { status: 400 },
    );
  }

  const extension = logoMimeExtensions[file.type];

  if (!extension) {
    return NextResponse.json(
      {
        error: "Format logo tidak valid",
        fields: {
          logo: "Logo harus berupa PNG, JPG, WebP, atau SVG",
        },
      },
      { status: 400 },
    );
  }

  if (file.size > 2 * 1024 * 1024) {
    return NextResponse.json(
      {
        error: "Ukuran logo terlalu besar",
        fields: {
          logo: "Logo maksimal 2 MB",
        },
      },
      { status: 400 },
    );
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const fileName = `logo-${Date.now()}.${extension}`;
  const uploadDir = join(process.cwd(), "public", "uploads", "logos");
  const filePath = join(uploadDir, fileName);

  await mkdir(uploadDir, { recursive: true });
  await writeFile(filePath, bytes);

  const logoUrl = `/uploads/logos/${fileName}`;
  const data = await updateCompanyIdentity({ logoUrl });

  return NextResponse.json(
    {
      data,
      upload: {
        fileName,
        logoUrl,
        size: file.size,
        type: file.type,
      },
    },
    { status: 201 },
  );
}

function parseCompanyIdentityPayload(payload: Record<string, unknown>) {
  const errors: Record<string, string> = {};
  const data = {
    address: readTrimmed(payload.address),
    documentFooter: readTrimmed(payload.documentFooter),
    email: readTrimmed(payload.email),
    legalName: readTrimmed(payload.legalName),
    logoUrl: readTrimmed(payload.logoUrl),
    signatureUrl: readTrimmed(payload.signatureUrl),
    signatureName: readTrimmed(payload.signatureName),
    signaturePosition: readTrimmed(payload.signaturePosition),
    stampUrl: readTrimmed(payload.stampUrl),
    name: readTrimmed(payload.name),
    phone: readTrimmed(payload.phone),
    website: readTrimmed(payload.website),
    kemenkumham: readTrimmed(payload.kemenkumham),
    ppiu: readTrimmed(payload.ppiu),
    gmapsUrl: readTrimmed(payload.gmapsUrl),
  };

  if (data.name !== undefined && data.name.length === 0) {
    errors.name = "Nama brand wajib diisi";
  }

  if (data.legalName !== undefined && data.legalName.length === 0) {
    errors.legalName = "Nama legal wajib diisi";
  }

  if (data.email !== undefined && data.email.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = "Format email tidak valid";
  }

  if (data.logoUrl !== undefined && data.logoUrl.length > 0 && !/^\/|^https?:\/\//.test(data.logoUrl)) {
    errors.logoUrl = "Logo URL harus path internal atau URL http(s)";
  }

  if (data.documentFooter !== undefined && data.documentFooter.length > 240) {
    errors.documentFooter = "Footer dokumen maksimal 240 karakter";
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  return { data };
}

function readTrimmed(value: unknown) {
  return value === undefined ? undefined : String(value).trim();
}
