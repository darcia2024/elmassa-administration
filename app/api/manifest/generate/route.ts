import { NextResponse } from "next/server";
import { MANIFEST_LABELS, MANIFEST_TYPES, loadManifestData, type ManifestType } from "@/lib/manifest/data";
import { buildSiskopatuhXlsm } from "@/lib/manifest/siskopatuh";
import { buildAirlineXlsx } from "@/lib/manifest/airline";

/**
 * POST { packageId, type, participantIds?, pnr?, groupLabels?, format? }
 *   format "json" (bawaan) -> data pratinjau
 *   format "file"          -> berkas Excel siap upload/kirim
 *
 * Pratinjau dan berkas dibangun dari data yang sama, jadi yang dilihat staf
 * sebelum mengunduh persis yang masuk ke berkas.
 */

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "grup";
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const packageId = String(body.packageId ?? "").trim();
  const type = String(body.type ?? "") as ManifestType;

  if (!packageId) {
    return NextResponse.json({ error: "Grup keberangkatan wajib dipilih", fields: { packageId: "Wajib" } }, { status: 400 });
  }
  if (!MANIFEST_TYPES.includes(type)) {
    return NextResponse.json({ error: "Jenis manifest tidak dikenal", fields: { type: MANIFEST_TYPES.join(", ") } }, { status: 400 });
  }

  const participantIds = Array.isArray(body.participantIds)
    ? body.participantIds.map(String).filter((id: string) => /^[0-9a-f-]{36}$/i.test(id))
    : undefined;

  const data = await loadManifestData(packageId, participantIds);
  if (!data) return NextResponse.json({ error: "Grup keberangkatan tidak ditemukan" }, { status: 404 });

  // Label keluarga hasil tebakan sistem boleh dikoreksi staf di pratinjau.
  if (body.groupLabels && typeof body.groupLabels === "object") {
    for (const g of data.groups) {
      const label = body.groupLabels[g.key];
      if (typeof label === "string") g.label = label.trim().toUpperCase().slice(0, 40);
    }
  }

  if (body.format !== "file") {
    return NextResponse.json({ data: { ...data, type, label: MANIFEST_LABELS[type] } }, { headers: { "Cache-Control": "no-store" } });
  }

  if (data.passengers.length === 0) {
    return NextResponse.json({ error: "Tidak ada jamaah tertaut yang bisa dimasukkan ke manifest" }, { status: 400 });
  }

  const stamp = new Date().toISOString().slice(0, 10);
  const base = `${slug(MANIFEST_LABELS[type])}_${slug(data.departure.name)}_${stamp}`;

  if (type === "siskopatuh") {
    const file = await buildSiskopatuhXlsm(data.passengers);
    return new Response(new Uint8Array(file), {
      headers: {
        "Content-Type": "application/vnd.ms-excel.sheet.macroEnabled.12",
        "Content-Disposition": `attachment; filename="${base}.xlsm"`,
        "Cache-Control": "no-store",
      },
    });
  }

  const pnr = String(body.pnr ?? "").trim();
  if (!pnr) {
    return NextResponse.json({ error: "Isi kode PNR dari maskapai dulu", fields: { pnr: "Wajib" } }, { status: 400 });
  }

  const file = await buildAirlineXlsx(type, data.passengers, data.groups, {
    pnr,
    title: `${MANIFEST_LABELS[type]} — ${data.departure.name}`,
  });
  return new Response(new Uint8Array(file), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${base}.xlsx"`,
      "Cache-Control": "no-store",
    },
  });
}
