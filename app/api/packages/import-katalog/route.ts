import { NextResponse } from "next/server";
import { importKatalogPackages, katalogImportStatus } from "@/lib/katalog/store";

// Staff-only: /api/packages/* is gated to the "paket" module in proxy.ts
// (GET needs view, POST needs edit), so this is never reachable anonymously.

export async function GET() {
  try {
    return NextResponse.json({ ok: true, data: await katalogImportStatus() }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("Status impor katalog gagal:", err);
    return NextResponse.json({ ok: false, error: "Gagal membaca status impor." }, { status: 500 });
  }
}

export async function POST() {
  try {
    const result = await importKatalogPackages();
    return NextResponse.json({ ok: true, data: result });
  } catch (err) {
    console.error("Impor katalog gagal:", err);
    return NextResponse.json({ ok: false, error: "Impor paket katalog gagal. Cek log server." }, { status: 500 });
  }
}
