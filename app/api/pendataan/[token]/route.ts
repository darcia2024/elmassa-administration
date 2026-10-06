import { NextResponse } from "next/server";
import { validateFields, type ProfileFields } from "@/lib/jamaah/rules";
import { findDuplicate, findJamaahByToken, updateJamaah } from "@/lib/jamaah/store";
import { corsHeaders, toPublicView } from "@/lib/jamaah/public-view";

/**
 * Jalur pendataan mandiri jamaah -- dipakai halaman /pendataan/<token> dan
 * aplikasi UmrahMe. Tanpa login staf (lihat publicApiPrefixes di proxy.ts);
 * yang menjaga adalah token acak 48 hex per profil.
 *
 * Lihat docs/INTEGRASI-UMRAHME.md untuk kontrak lengkapnya.
 */

type RouteProps = { params: Promise<{ token: string }> };

const NOT_FOUND = "Link pendataan tidak valid atau sudah diganti. Minta link baru ke kantor El Massa.";

/** Field yang boleh diisi jamaah sendiri. `notes` dan tautan penyerta ke profil lain khusus staf. */
const PUBLIC_FIELDS: Array<keyof ProfileFields> = [
  "fullName",
  "passportName",
  "fatherName",
  "gender",
  "birthPlace",
  "birthDate",
  "nik",
  "passportNumber",
  "passportIssuePlace",
  "passportIssueDate",
  "passportExpiry",
  "phone",
  "address",
  "province",
  "regency",
  "district",
  "village",
  "maritalStatus",
  "education",
  "occupation",
  "emergencyName",
  "emergencyRelation",
  "emergencyPhone",
  "companions",
];

export async function OPTIONS(request: Request) {
  return new Response(null, { status: 204, headers: corsHeaders(request) });
}

export async function GET(request: Request, { params }: RouteProps) {
  const headers = { ...corsHeaders(request), "Cache-Control": "no-store" };
  const { token } = await params;
  const jamaah = await findJamaahByToken(token);

  if (!jamaah) return NextResponse.json({ error: NOT_FOUND }, { status: 404, headers });
  return NextResponse.json({ data: toPublicView(jamaah) }, { headers });
}

export async function PUT(request: Request, { params }: RouteProps) {
  const headers = { ...corsHeaders(request), "Cache-Control": "no-store" };
  const { token } = await params;
  const jamaah = await findJamaahByToken(token);
  if (!jamaah) return NextResponse.json({ error: NOT_FOUND }, { status: 404, headers });

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

  // Kolom yang dikirim kosong DIABAIKAN, bukan dikosongkan: form publik tidak
  // menampilkan isi NIK/paspor (hanya versi samaran), jadi kolom kosong di sana
  // berarti "tidak diubah", bukan "hapus".
  const patch: Record<string, unknown> = {};
  for (const key of PUBLIC_FIELDS) {
    const value = body[key];
    if (value === undefined || value === null) continue;
    if (key === "companions") {
      // Jamaah hanya melihat nama + hubungan. Tautan ke profil lain (jamaahId)
      // dibuat staf; pertahankan untuk penyerta yang namanya masih sama.
      const linked = new Map(jamaah.companions.map((c) => [c.name.trim().toLowerCase(), c.jamaahId ?? null]));
      patch.companions = Array.isArray(value)
        ? value.map((raw) => {
            const c = (raw ?? {}) as Record<string, unknown>;
            const name = String(c.name ?? "");
            return { name, relation: c.relation, jamaahId: linked.get(name.trim().toLowerCase()) ?? null };
          })
        : [];
      continue;
    }
    if (String(value).trim() === "") continue;
    patch[key] = String(value);
  }

  const fields = validateFields(patch as Partial<ProfileFields>);
  if (Object.keys(fields).length > 0) {
    return NextResponse.json({ error: Object.values(fields)[0], fields }, { status: 400, headers });
  }

  if (patch.nik !== undefined || patch.passportNumber !== undefined) {
    // Nama pemilik profil lain sengaja TIDAK disebut di jalur publik.
    const duplicate = await findDuplicate(patch as { nik?: string; passportNumber?: string }, jamaah.id);
    if (duplicate) {
      return NextResponse.json(
        { error: "NIK atau nomor paspor ini sudah terdaftar di profil lain. Hubungi kantor El Massa." },
        { status: 409, headers },
      );
    }
  }

  const updated = await updateJamaah(jamaah.id, patch, "umrahme");
  return NextResponse.json({ data: toPublicView(updated!) }, { headers });
}
