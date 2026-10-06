"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Download, FileSpreadsheet, Loader2, Plane, PlaneTakeoff, Printer, Share2 } from "lucide-react";
import type { GroupParticipant, PackageDetail } from "./types";

/**
 * Pilih jamaah -> pilih jenis manifest -> pratinjau -> unduh / cetak / bagikan.
 * Semua kolom ditarik dari Database Jamaah lewat /api/manifest/generate; staf
 * hanya mengisi PNR (manifest maskapai) dan boleh mengoreksi label keluarga.
 */

type ManifestType = "siskopatuh" | "domestik" | "internasional";

type Passenger = {
  participantId: string;
  bookingCode: string;
  title: string;
  name: string;
  fullName: string;
  fatherName: string;
  nik: string;
  passportNumber: string;
  passportIssuePlace: string;
  passportIssueDate: string;
  passportExpiry: string;
  birthPlace: string;
  birthDate: string;
  province: string;
  regency: string;
  maritalStatus: string;
  visaNumber: string;
  visaExpiry: string;
  groupKey: string;
  missing: Record<ManifestType, string[]>;
};

type Preview = {
  type: ManifestType;
  label: string;
  departure: { name: string; departureDate: string | null };
  passengers: Passenger[];
  groups: Array<{ key: string; label: string; participantIds: string[] }>;
  unlinked: Array<{ participantId: string; name: string }>;
};

const TYPES: Array<{ id: ManifestType; label: string; hint: string; icon: typeof Plane }> = [
  { id: "siskopatuh", label: "Buat Manifest Siskopatuh", hint: "Template import Kemenag (.xlsm)", icon: FileSpreadsheet },
  { id: "domestik", label: "Buat Manifest Domestik", hint: "Check-in penerbangan domestik (.xlsx)", icon: Plane },
  { id: "internasional", label: "Buat Manifest Internasional", hint: "Check-in penerbangan internasional (.xlsx)", icon: PlaneTakeoff },
];

/** null = sel tertutup rowSpan sel di atasnya (keterangan keluarga yang digabung). */
type PreviewCell = { text: string; rowSpan?: number } | null;

function escapeHtml(value: string) {
  return value.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
}

export function GenerateManifestView({ pkg, participants }: { pkg: PackageDetail; participants: GroupParticipant[] }) {
  const linked = useMemo(() => participants.filter((p) => p.jamaahId), [participants]);
  const unlinkedCount = participants.length - linked.length;
  const [selected, setSelected] = useState<Set<string>>(() => new Set(linked.map((p) => p.id)));
  const [preview, setPreview] = useState<Preview | null>(null);
  const [labels, setLabels] = useState<Record<string, string>>({});
  const [pnr, setPnr] = useState("");
  const [loadingType, setLoadingType] = useState<ManifestType | null>(null);
  const [busy, setBusy] = useState<"download" | "share" | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // Pratinjau yang sudah tampil tidak lagi cocok begitu pilihan jamaah berubah.
  const changeSelection = (next: Set<string>) => {
    setSelected(next);
    setPreview(null);
  };

  const toggle = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    changeSelection(next);
  };

  const requestBody = (type: ManifestType, format: "json" | "file") =>
    JSON.stringify({ packageId: pkg.id, type, participantIds: [...selected], pnr, groupLabels: labels, format });

  const generate = async (type: ManifestType) => {
    setError("");
    setNotice("");
    if (selected.size === 0) {
      setError("Pilih minimal satu jamaah dulu.");
      return;
    }
    setLoadingType(type);
    try {
      const res = await fetch("/api/manifest/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId: pkg.id, type, participantIds: [...selected], format: "json" }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json?.error || "Gagal menyiapkan manifest");
        return;
      }
      setPreview(json.data);
      setLabels(Object.fromEntries((json.data.groups as Preview["groups"]).map((g) => [g.key, g.label])));
    } finally {
      setLoadingType(null);
    }
  };

  const fetchFile = async (): Promise<File | null> => {
    if (!preview) return null;
    setError("");
    if (preview.type !== "siskopatuh" && !pnr.trim()) {
      setError("Isi kode PNR dari maskapai dulu.");
      return null;
    }
    const res = await fetch("/api/manifest/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: requestBody(preview.type, "file"),
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      setError(json?.error || "Gagal membuat berkas manifest");
      return null;
    }
    const name = /filename="([^"]+)"/.exec(res.headers.get("Content-Disposition") ?? "")?.[1] ?? "manifest.xlsx";
    const blob = await res.blob();
    return new File([blob], name, { type: blob.type });
  };

  const download = async () => {
    setBusy("download");
    try {
      const file = await fetchFile();
      if (!file) return;
      const url = URL.createObjectURL(file);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } finally {
      setBusy(null);
    }
  };

  // Bagikan berkas langsung ke WhatsApp/email lewat menu share bawaan HP.
  const share = async () => {
    setBusy("share");
    setNotice("");
    try {
      const file = await fetchFile();
      if (!file) return;
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: `${preview?.label} — ${pkg.name}` }).catch(() => undefined);
      } else {
        const url = URL.createObjectURL(file);
        const a = document.createElement("a");
        a.href = url;
        a.download = file.name;
        a.click();
        URL.revokeObjectURL(url);
        setNotice("Browser ini tidak bisa membagikan berkas langsung — berkas sudah diunduh, lampirkan manual ke WhatsApp/email.");
      }
    } finally {
      setBusy(null);
    }
  };

  const columns = useMemo(() => {
    if (!preview) return { head: [] as string[], rows: [] as PreviewCell[][], nameCol: 0 };
    const cell = (text: string): PreviewCell => ({ text });
    if (preview.type === "siskopatuh") {
      return {
        head: ["Title", "Nama", "Nama Ayah", "NIK", "Nama Paspor", "No Paspor", "Tgl Paspor", "Kota Paspor", "Tempat Lahir", "Tgl Lahir", "Provinsi", "Kabupaten", "Status", "No Visa"],
        rows: preview.passengers.map((p) =>
          [
            p.title.replace(/\s*\(infant\)/i, ""), p.fullName, p.fatherName, p.nik, p.name, p.passportNumber, p.passportIssueDate,
            p.passportIssuePlace, p.birthPlace, p.birthDate, p.province, p.regency, p.maritalStatus, p.visaNumber,
          ].map(cell),
        ),
        nameCol: 1,
      };
    }
    const byId = new Map(preview.passengers.map((p) => [p.participantId, p]));
    const rows: PreviewCell[][] = [];
    let no = 1;
    for (const g of preview.groups) {
      const members = g.participantIds.map((id) => byId.get(id)).filter((p): p is Passenger => Boolean(p));
      members.forEach((p, i) => {
        // Sama seperti berkas Excel: satu sel keterangan untuk sekeluarga.
        const keterangan: PreviewCell = i === 0 ? { text: labels[g.key] ?? "", rowSpan: members.length } : null;
        rows.push([
          cell(String(no++)), cell(p.title), cell(p.name), keterangan, cell(p.birthDate),
          cell("IDN"), cell(p.passportNumber), cell(p.passportIssueDate), cell(p.passportExpiry),
        ]);
      });
    }
    return {
      head: ["NO", "MR/MRS/MSTR/MISS/INF", "NAME", preview.type === "internasional" ? "EXPLAN" : "KETERANGAN", "DOB(YYYY-MM-DD)", "NATIONALITY", "NOPASSPORT", "DOI", "DOE"],
      rows,
      nameCol: 2,
    };
  }, [preview, labels]);

  const print = () => {
    if (!preview) return;
    const win = window.open("", "_blank");
    if (!win) {
      setError("Pop-up diblokir browser. Izinkan pop-up untuk mencetak.");
      return;
    }
    const pnrLine = preview.type !== "siskopatuh" ? `<h2>PNR : ${escapeHtml(pnr.trim().toUpperCase() || "—")}</h2>` : "";
    win.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(preview.label)} — ${escapeHtml(pkg.name)}</title>
      <style>
        @page { size: A4 landscape; margin: 10mm; }
        body { font-family: Calibri, Arial, sans-serif; font-size: ${preview.type === "siskopatuh" ? 8 : 10}pt; color: #000; }
        h1 { font-size: 12pt; margin: 0 0 2px; } h2 { font-size: 13pt; margin: 4px 0 8px; }
        p { margin: 0 0 6px; color: #444; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #000; padding: 2px 4px; text-align: center; }
        th { background: ${preview.type === "internasional" ? "#4F81BD; color: #fff" : "#fff"}; }
        td.name { text-align: left; }
      </style></head><body>
      <h1>${escapeHtml(preview.label)} — ${escapeHtml(pkg.name)}</h1>
      <p>Berangkat ${escapeHtml(preview.departure.departureDate ?? "-")} · ${preview.passengers.length} jamaah</p>
      ${pnrLine}
      <table><thead><tr>${columns.head.map((h) => `<th>${escapeHtml(h)}</th>`).join("")}</tr></thead>
      <tbody>${columns.rows
        .map(
          (r) =>
            `<tr>${r
              .map((c, i) =>
                c === null
                  ? ""
                  : `<td${c.rowSpan && c.rowSpan > 1 ? ` rowspan="${c.rowSpan}"` : ""}${i === columns.nameCol ? ' class="name"' : ""}>${escapeHtml(c.text)}</td>`,
              )
              .join("")}</tr>`,
        )
        .join("")}</tbody></table>
      <script>window.onload = () => { window.print(); };</script>
      </body></html>`);
    win.document.close();
  };

  const missingRows = preview ? preview.passengers.filter((p) => p.missing[preview.type].length > 0) : [];

  return (
    <div className="space-y-4">
      {/* 1. Pilih jamaah */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-xs font-extrabold text-brand-cocoa">
            1. Pilih jamaah <span className="font-semibold text-stone-500">({selected.size} dari {linked.length} dipilih)</span>
          </h4>
          <div className="flex gap-1.5">
            <button type="button" onClick={() => changeSelection(new Set(linked.map((p) => p.id)))} className="h-8 rounded-lg border border-stone-200 bg-white px-2.5 text-[11px] font-bold text-stone-600 hover:bg-stone-50">
              Pilih semua
            </button>
            <button type="button" onClick={() => changeSelection(new Set())} className="h-8 rounded-lg border border-stone-200 bg-white px-2.5 text-[11px] font-bold text-stone-600 hover:bg-stone-50">
              Kosongkan
            </button>
          </div>
        </div>
        {unlinkedCount > 0 ? (
          <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] font-semibold text-amber-800">
            {unlinkedCount} peserta belum ditautkan ke Database Jamaah, jadi datanya belum bisa masuk manifest. Tautkan dulu di tab <b>Profil Jamaah</b>.
          </p>
        ) : null}
        <ul className="grid max-h-64 gap-1 overflow-y-auto rounded-xl border border-stone-200/60 p-1.5 sm:grid-cols-2">
          {participants.map((p) => {
            const disabled = !p.jamaahId;
            return (
              <li key={p.id}>
                <label className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-[11px] ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:bg-stone-50"}`}>
                  <input type="checkbox" checked={selected.has(p.id)} disabled={disabled} onChange={() => toggle(p.id)} className="h-4 w-4 accent-brand-pink" />
                  <span className="min-w-0 flex-1 truncate font-bold text-brand-cocoa">{p.name}</span>
                  <span className="shrink-0 font-mono text-[10px] text-stone-400">{disabled ? "belum tertaut" : p.bookingCode}</span>
                </label>
              </li>
            );
          })}
        </ul>
      </div>

      {/* 2. Pilih jenis */}
      <div className="space-y-2">
        <h4 className="text-xs font-extrabold text-brand-cocoa">2. Pilih jenis manifest</h4>
        <div className="grid gap-2 sm:grid-cols-3">
          {TYPES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => generate(t.id)}
              disabled={loadingType !== null}
              className={`flex items-start gap-2.5 rounded-xl border p-3 text-left transition disabled:opacity-60 ${
                preview?.type === t.id ? "border-brand-pink bg-brand-pinkSoft" : "border-stone-200 bg-white hover:border-brand-pink"
              }`}
            >
              {loadingType === t.id ? <Loader2 className="mt-0.5 h-4 w-4 shrink-0 animate-spin text-brand-pink" /> : <t.icon className="mt-0.5 h-4 w-4 shrink-0 text-brand-pink" />}
              <span>
                <span className="block text-xs font-extrabold text-brand-cocoa">{t.label}</span>
                <span className="block text-[10px] text-stone-500">{t.hint}</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      {error ? <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-[11px] font-semibold text-rose-700">{error}</p> : null}

      {/* 3. Pratinjau & export */}
      {preview ? (
        <div className="space-y-3 rounded-xl border border-stone-200 bg-stone-50/50 p-3 sm:p-4">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h4 className="text-xs font-extrabold text-brand-cocoa">3. Pratinjau — {preview.label}</h4>
              <p className="text-[11px] text-stone-500">{preview.passengers.length} jamaah · Berangkat {preview.departure.departureDate ?? "—"}</p>
            </div>
            {preview.type !== "siskopatuh" ? (
              <label className="space-y-1">
                <span className="block text-[10px] font-bold uppercase tracking-wide text-stone-500">PNR Maskapai *</span>
                <input
                  value={pnr}
                  onChange={(e) => setPnr(e.target.value.toUpperCase())}
                  placeholder="D6F68D"
                  className="h-9 w-36 rounded-xl border border-stone-200 bg-white px-3 font-mono text-xs font-bold text-brand-cocoa outline-none focus:border-brand-pink"
                />
              </label>
            ) : null}
          </div>

          {missingRows.length > 0 ? (
            <div className="space-y-1 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-900">
              <p className="flex items-center gap-1 font-bold">
                <AlertTriangle className="h-3.5 w-3.5" /> {missingRows.length} jamaah datanya belum lengkap untuk manifest ini — kolomnya akan kosong:
              </p>
              <ul className="list-inside list-disc">
                {missingRows.slice(0, 8).map((p) => (
                  <li key={p.participantId}>
                    <b>{p.fullName}</b>: {p.missing[preview.type].join(", ")}
                  </li>
                ))}
                {missingRows.length > 8 ? <li>…dan {missingRows.length - 8} lainnya</li> : null}
              </ul>
            </div>
          ) : null}

          {preview.type !== "siskopatuh" && preview.groups.some((g) => g.participantIds.length > 1) ? (
            <div className="space-y-1.5">
              <p className="text-[10px] font-bold uppercase tracking-wide text-stone-500">
                Keterangan keluarga (dikelompokkan per booking — boleh diubah)
              </p>
              <div className="flex flex-wrap gap-2">
                {preview.groups
                  .filter((g) => g.participantIds.length > 1)
                  .map((g) => (
                    <label key={g.key} className="flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-2 py-1">
                      <span className="font-mono text-[10px] text-stone-500">{g.key}</span>
                      <input
                        value={labels[g.key] ?? ""}
                        onChange={(e) => setLabels((prev) => ({ ...prev, [g.key]: e.target.value.toUpperCase() }))}
                        list="manifest-group-labels"
                        className="h-7 w-28 rounded-md border border-stone-200 px-1.5 text-[11px] font-bold text-brand-cocoa outline-none focus:border-brand-pink"
                      />
                    </label>
                  ))}
                <datalist id="manifest-group-labels">
                  <option value="FAMILY" />
                  <option value="SUAMI ISTRI" />
                </datalist>
              </div>
            </div>
          ) : null}

          <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white">
            <table className="w-full min-w-[860px] border-collapse text-left text-[11px]">
              <thead>
                <tr className={preview.type === "internasional" ? "bg-[#4F81BD] text-white" : "bg-stone-100 text-stone-700"}>
                  {columns.head.map((h) => (
                    <th key={h} className="whitespace-nowrap border border-stone-200 px-2 py-1.5 font-bold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {columns.rows.map((r, ri) => (
                  <tr key={ri}>
                    {r.map((c, ci) =>
                      c === null ? null : (
                        <td
                          key={ci}
                          rowSpan={c.rowSpan}
                          className={`whitespace-nowrap border border-stone-200 px-2 py-1 align-middle text-stone-800 ${ci === columns.nameCol ? "" : "text-center"}`}
                        >
                          {c.text || <span className="text-stone-300">—</span>}
                        </td>
                      ),
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={download}
              disabled={busy !== null}
              className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-brand-pink px-4 text-xs font-bold text-white shadow-2xs transition hover:bg-brand-pinkHover disabled:opacity-60"
            >
              {busy === "download" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
              Download Excel
            </button>
            <button
              type="button"
              onClick={print}
              className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-4 text-xs font-bold text-stone-700 transition hover:bg-stone-50"
            >
              <Printer className="h-3.5 w-3.5" /> Cetak / PDF
            </button>
            <button
              type="button"
              onClick={share}
              disabled={busy !== null}
              className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-4 text-xs font-bold text-stone-700 transition hover:bg-stone-50 disabled:opacity-60"
            >
              {busy === "share" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Share2 className="h-3.5 w-3.5" />}
              Bagikan
            </button>
          </div>
          {notice ? <p className="text-[11px] font-semibold text-stone-600">{notice}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
