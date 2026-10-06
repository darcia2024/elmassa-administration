import { NextResponse } from "next/server";
import { findJamaahByToken } from "@/lib/jamaah/store";
import { handleDocumentUpload } from "@/lib/jamaah/upload";
import { corsHeaders, toPublicView } from "@/lib/jamaah/public-view";

type RouteProps = { params: Promise<{ token: string }> };

export async function OPTIONS(request: Request) {
  return new Response(null, { status: 204, headers: corsHeaders(request) });
}

/** Upload saja -- jalur publik tidak punya cara mengunduh atau menghapus berkas. */
export async function POST(request: Request, { params }: RouteProps) {
  const headers = corsHeaders(request);
  const { token } = await params;
  const jamaah = await findJamaahByToken(token);
  if (!jamaah) {
    return NextResponse.json({ error: "Link pendataan tidak valid atau sudah diganti." }, { status: 404, headers });
  }

  const res = await handleDocumentUpload(request, jamaah.id, { via: "umrahme", actor: "umrahme", headers });
  if (!res.ok) return res;

  // handleDocumentUpload mengembalikan profil lengkap versi staf; ganti ke versi publik.
  const refreshed = await findJamaahByToken(token);
  return NextResponse.json({ data: refreshed ? toPublicView(refreshed) : null }, { status: 201, headers });
}
