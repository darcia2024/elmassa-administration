"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Link2, Loader2, Unlink, UserPlus, Wand2 } from "lucide-react";
import { STATUS_STYLES, type CompletenessStatus } from "@/lib/jamaah/rules";
import type { GroupParticipant } from "./types";

/**
 * Menautkan peserta booking ke profil master di Database Jamaah. Peserta yang
 * sudah tertaut memberi manifest akses ke tanggal lahir, NIK, masa berlaku
 * paspor, dan dokumen -- data yang tidak pernah ditanyakan form booking.
 */

type ProfileOption = {
  id: string;
  fullName: string;
  passportNumber: string;
  completeness: { status: CompletenessStatus };
};

type Props = {
  packageId: string;
  participants: GroupParticipant[];
  onUpdated: (participant: GroupParticipant) => void;
  onReload: () => void;
};

export function ProfileLinkView({ packageId, participants, onUpdated, onReload }: Props) {
  const [profiles, setProfiles] = useState<ProfileOption[]>([]);
  const [loadError, setLoadError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rowError, setRowError] = useState<Record<string, string>>({});
  const [choice, setChoice] = useState<Record<string, string>>({});
  const [autoResult, setAutoResult] = useState("");
  const [isAutoLinking, setIsAutoLinking] = useState(false);

  const loadProfiles = useCallback(async () => {
    try {
      const res = await fetch("/api/jamaah", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) {
        setLoadError(
          res.status === 403 ? "Role Anda belum punya izin modul Database Jamaah. Minta Admin Master mengaktifkannya di Hak Akses." : json?.error || "Gagal memuat database jamaah",
        );
        return;
      }
      setProfiles(json.data ?? []);
      setLoadError("");
    } catch {
      setLoadError("Gagal memuat database jamaah");
    }
  }, []);

  useEffect(() => {
    loadProfiles();
  }, [loadProfiles]);

  const byId = useMemo(() => new Map(profiles.map((p) => [p.id, p])), [profiles]);
  const linkedCount = participants.filter((p) => p.jamaahId).length;
  const sortedProfiles = useMemo(() => [...profiles].sort((a, b) => a.fullName.localeCompare(b.fullName)), [profiles]);

  const setLink = async (participantId: string, jamaahId: string | null) => {
    setBusyId(participantId);
    setRowError((prev) => ({ ...prev, [participantId]: "" }));
    try {
      const res = await fetch(`/api/manifest/participants/${encodeURIComponent(participantId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jamaahId }),
      });
      const json = await res.json();
      if (!res.ok) {
        setRowError((prev) => ({ ...prev, [participantId]: json?.error || "Gagal menautkan" }));
        return;
      }
      onUpdated(json.data);
    } finally {
      setBusyId(null);
    }
  };

  const createProfile = async (participantId: string) => {
    setBusyId(participantId);
    setRowError((prev) => ({ ...prev, [participantId]: "" }));
    try {
      const res = await fetch("/api/jamaah/from-participant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participantId }),
      });
      const json = await res.json();
      if (!res.ok) {
        setRowError((prev) => ({ ...prev, [participantId]: json?.error || "Gagal membuat profil" }));
        return;
      }
      await loadProfiles();
      onReload();
    } finally {
      setBusyId(null);
    }
  };

  const autoLink = async () => {
    setIsAutoLinking(true);
    setAutoResult("");
    try {
      const res = await fetch("/api/jamaah/auto-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId }),
      });
      const json = await res.json();
      if (!res.ok) {
        setAutoResult(json?.error || "Gagal menautkan otomatis");
        return;
      }
      setAutoResult(
        json.data.linked > 0
          ? `${json.data.linked} peserta tertaut lewat nomor paspor yang sama.`
          : "Tidak ada peserta baru yang paspornya cocok dengan profil di database.",
      );
      onReload();
    } finally {
      setIsAutoLinking(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[11px] text-stone-600">
          <b className="text-brand-cocoa">
            {linkedCount} dari {participants.length}
          </b>{" "}
          peserta sudah tertaut ke profil master. Hanya peserta tertaut yang datanya bisa ditarik lengkap ke manifest.
        </p>
        <button
          type="button"
          onClick={autoLink}
          disabled={isAutoLinking || Boolean(loadError)}
          className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-xl border border-stone-200 bg-stone-50 px-3 text-xs font-bold text-stone-700 transition hover:bg-stone-100 disabled:opacity-40"
        >
          {isAutoLinking ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Wand2 className="h-3.5 w-3.5 text-stone-500" />}
          Tautkan Otomatis (Paspor)
        </button>
      </div>

      {autoResult ? <p className="text-[11px] font-semibold text-emerald-700">{autoResult}</p> : null}
      {loadError ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] font-semibold text-amber-800">{loadError}</p>
      ) : null}

      <ul className="divide-y divide-stone-100 rounded-xl border border-stone-200/60">
        {participants.map((p, index) => {
          const profile = p.jamaahId ? byId.get(p.jamaahId) : undefined;
          const isBusy = busyId === p.id;

          return (
            <li key={p.id} className="flex flex-col gap-2 p-3 lg:flex-row lg:items-center lg:gap-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-brand-cocoa">
                  <span className="font-mono text-stone-400">{index + 1}.</span> {p.name}
                </p>
                <p className="truncate font-mono text-[10px] text-stone-400">
                  {p.bookingCode} · {p.passportNumber || "paspor kosong"}
                </p>
                {rowError[p.id] ? <p className="text-[10px] font-bold text-rose-600">{rowError[p.id]}</p> : null}
              </div>

              {p.jamaahId ? (
                <div className="flex flex-wrap items-center gap-1.5">
                  <Link
                    href={`/jamaah/${p.jamaahId}`}
                    className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 text-[11px] font-bold text-emerald-800 transition hover:bg-emerald-100"
                  >
                    <Link2 className="h-3.5 w-3.5" /> {profile?.fullName ?? "Buka profil"}
                  </Link>
                  {profile ? (
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${STATUS_STYLES[profile.completeness.status]}`}>
                      {profile.completeness.status}
                    </span>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => setLink(p.id, null)}
                    disabled={isBusy}
                    className="grid h-9 w-9 place-items-center rounded-xl border border-stone-200 bg-white text-stone-500 transition hover:bg-stone-50 disabled:opacity-40"
                    title="Lepas tautan"
                    aria-label={`Lepas tautan profil ${p.name}`}
                  >
                    {isBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Unlink className="h-3.5 w-3.5" />}
                  </button>
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-1.5">
                  <select
                    value={choice[p.id] ?? ""}
                    onChange={(e) => setChoice((prev) => ({ ...prev, [p.id]: e.target.value }))}
                    disabled={Boolean(loadError)}
                    className="h-9 w-full min-w-0 rounded-xl border border-stone-200 bg-white px-2 text-[11px] font-medium text-brand-cocoa outline-none focus:border-brand-pink sm:w-56"
                    aria-label={`Pilih profil untuk ${p.name}`}
                  >
                    <option value="">— Pilih profil yang ada —</option>
                    {sortedProfiles.map((j) => (
                      <option key={j.id} value={j.id}>
                        {j.fullName}
                        {j.passportNumber ? ` · ${j.passportNumber}` : ""}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => choice[p.id] && setLink(p.id, choice[p.id])}
                    disabled={isBusy || !choice[p.id]}
                    className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3 text-[11px] font-bold text-stone-700 transition hover:bg-stone-50 disabled:opacity-40"
                  >
                    <Link2 className="h-3.5 w-3.5" /> Tautkan
                  </button>
                  <button
                    type="button"
                    onClick={() => createProfile(p.id)}
                    disabled={isBusy || Boolean(loadError)}
                    className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-brand-pink px-3 text-[11px] font-bold text-white transition hover:bg-brand-pinkHover disabled:opacity-40"
                  >
                    {isBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UserPlus className="h-3.5 w-3.5" />}
                    Buat Profil
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
