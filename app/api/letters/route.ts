import { NextResponse } from "next/server";
import { LETTER_TYPES, createLetter, findLetterType, listLetters } from "@/lib/letters/store";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const letterType = searchParams.get("jenis") ?? undefined;
  const query = searchParams.get("q") ?? undefined;

  const data = await listLetters({ letterType, query });

  return NextResponse.json(
    {
      data,
      meta: {
        total: data.length,
        types: LETTER_TYPES,
        countByType: Object.fromEntries(
          LETTER_TYPES.map((t) => [t.id, data.filter((l) => l.letterType === t.id).length]),
        ),
      },
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));

  const type = findLetterType(String(body.letterType ?? ""));
  if (!type) {
    return NextResponse.json(
      {
        error: "Jenis surat tidak dikenal",
        fields: { letterType: `Pilih salah satu: ${LETTER_TYPES.map((t) => t.id).join(", ")}` },
      },
      { status: 400 },
    );
  }

  const recipientName = String(body.recipientName ?? "").trim();
  if (!recipientName) {
    return NextResponse.json(
      { error: "Nama penerima wajib diisi", fields: { recipientName: "Nama tidak boleh kosong" } },
      { status: 400 },
    );
  }

  const issuedDate = String(body.issuedDate ?? "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(issuedDate)) {
    return NextResponse.json(
      { error: "Tanggal terbit tidak valid", fields: { issuedDate: "Format tanggal harus YYYY-MM-DD" } },
      { status: 400 },
    );
  }

  // Each type declares the fields its template actually prints; a letter to
  // Imigrasi missing a birth date is not a valid letter.
  const missing: Record<string, string> = {};
  const labels: Record<string, string> = {
    passportNumber: "Nomor paspor wajib diisi untuk surat ini",
    birthPlace: "Tempat lahir wajib diisi",
    birthDate: "Tanggal lahir wajib diisi",
    address: "Alamat wajib diisi",
    employer: "Nama instansi/perusahaan wajib diisi",
    leaveDates: "Periode cuti wajib diisi",
  };

  for (const field of type.requires) {
    const value =
      field === "employer" || field === "leaveDates"
        ? String((body.extra ?? {})[field] ?? "").trim()
        : String(body[field] ?? "").trim();
    if (!value) missing[field] = labels[field];
  }

  if (Object.keys(missing).length > 0) {
    return NextResponse.json({ error: "Data surat belum lengkap", fields: missing }, { status: 400 });
  }

  try {
    const letter = await createLetter({ ...body, letterType: type.id, recipientName, issuedDate });
    return NextResponse.json({ data: letter }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Gagal menerbitkan surat" },
      { status: 500 },
    );
  }
}
