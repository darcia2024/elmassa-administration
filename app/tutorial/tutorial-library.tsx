"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Info,
  ListChecks,
  PlayCircle,
} from "lucide-react";
import {
  TUTORIALS,
  TUTORIAL_CATEGORIES,
  formatDuration,
  posterSrc,
  thumbSrc,
  videoSrc,
  type Tutorial,
  type TutorialCategory,
} from "./data";

const WATCHED_KEY = "el_massa_tutorial_watched";

// Per-browser convenience only: which videos this viewer already finished.
function readWatched(): string[] {
  try {
    const raw = window.localStorage.getItem(WATCHED_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((s) => typeof s === "string") : [];
  } catch {
    return [];
  }
}

function writeWatched(slugs: string[]) {
  try {
    window.localStorage.setItem(WATCHED_KEY, JSON.stringify(slugs));
  } catch {
    // Private mode / blocked storage: progress just isn't remembered.
  }
}

function videoNumber(t: Tutorial) {
  return t.slug.slice(0, 2);
}

export function TutorialLibrary() {
  const [activeSlug, setActiveSlug] = useState(TUTORIALS[0].slug);
  const [category, setCategory] = useState<TutorialCategory | "Semua">("Semua");
  const [watched, setWatched] = useState<string[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [ended, setEnded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const autoplayRef = useRef(false);

  const activeIndex = TUTORIALS.findIndex((t) => t.slug === activeSlug);
  const active = TUTORIALS[activeIndex] ?? TUTORIALS[0];
  const prev = activeIndex > 0 ? TUTORIALS[activeIndex - 1] : null;
  const next = activeIndex < TUTORIALS.length - 1 ? TUTORIALS[activeIndex + 1] : null;

  const totalSeconds = useMemo(() => TUTORIALS.reduce((sum, t) => sum + t.duration, 0), []);
  const visibleList = category === "Semua" ? TUTORIALS : TUTORIALS.filter((t) => t.category === category);

  useEffect(() => {
    setWatched(readWatched());
    // ?v=<slug> lets staff share a link straight to one video.
    const fromUrl = new URLSearchParams(window.location.search).get("v");
    if (fromUrl && TUTORIALS.some((t) => t.slug === fromUrl)) setActiveSlug(fromUrl);
  }, []);

  const markWatched = useCallback((slug: string) => {
    setWatched((prevList) => {
      if (prevList.includes(slug)) return prevList;
      const updated = [...prevList, slug];
      writeWatched(updated);
      return updated;
    });
  }, []);

  const selectVideo = useCallback((slug: string, autoplay: boolean) => {
    autoplayRef.current = autoplay;
    setActiveSlug(slug);
    setCurrentTime(0);
    setEnded(false);
    const url = new URL(window.location.href);
    url.searchParams.set("v", slug);
    window.history.replaceState(null, "", url.toString());
  }, []);

  // A new <video> mounts per slug (keyed); start it when the switch came from a click.
  useEffect(() => {
    if (!autoplayRef.current) return;
    autoplayRef.current = false;
    videoRef.current?.play().catch(() => {});
  }, [activeSlug]);

  const seekTo = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = seconds;
    setEnded(false);
    video.play().catch(() => {});
  };

  const activeChapterIndex = (() => {
    let idx = -1;
    active.chapters.forEach((c, i) => {
      if (currentTime + 0.25 >= c.t) idx = i;
    });
    return idx;
  })();

  const watchedCount = watched.filter((s) => TUTORIALS.some((t) => t.slug === s)).length;

  return (
    <div className="space-y-5">
      {/* Intro */}
      <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-card sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-pinkSoft px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-brand-pink">
              <PlayCircle className="h-3.5 w-3.5" strokeWidth={2} />
              Persiapan Grup Desember 2026
            </span>
            <h1 className="text-xl font-extrabold text-brand-cocoa sm:text-2xl">Video Tutorial Sistem El Massa</h1>
            <p className="text-sm leading-relaxed text-stone-600">
              {TUTORIALS.length} video singkat, satu untuk tiap fitur. Tonton berurutan dari nomor 01 — urutannya mengikuti alur
              kerja satu rombongan. Klik langkah di bawah video untuk melompat ke bagian itu.
            </p>
          </div>

          <div className="w-full shrink-0 rounded-xl border border-stone-200 bg-stone-50 p-4 lg:w-72">
            <div className="flex items-baseline justify-between text-xs font-semibold text-stone-600">
              <span>Progres Anda</span>
              <span className="text-stone-500">
                Total {Math.round(totalSeconds / 60)} menit
              </span>
            </div>
            <p className="mt-1 text-lg font-extrabold text-brand-cocoa">
              {watchedCount} <span className="text-sm font-semibold text-stone-500">dari {TUTORIALS.length} video selesai</span>
            </p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-stone-200">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${(watchedCount / TUTORIALS.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <p className="mt-4 flex items-start gap-2 rounded-xl bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-900">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={2} />
          Nama jamaah, nomor paspor, dan nominal di video adalah data contoh — bukan data jamaah asli.
        </p>
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        {/* Player */}
        <section className="min-w-0 space-y-4">
          <div className="relative overflow-hidden rounded-2xl bg-stone-900 shadow-soft">
            <video
              key={active.slug}
              ref={videoRef}
              className="aspect-video w-full bg-stone-900"
              src={videoSrc(active.slug)}
              poster={posterSrc(active.slug)}
              controls
              playsInline
              preload="metadata"
              onTimeUpdate={(e) => {
                const v = e.currentTarget;
                setCurrentTime(v.currentTime);
                if (v.duration && v.currentTime / v.duration > 0.9) markWatched(active.slug);
              }}
              onPlay={() => setEnded(false)}
              onEnded={() => {
                markWatched(active.slug);
                setEnded(true);
              }}
            />

            {ended && next && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-stone-900/75 p-4 text-center backdrop-blur-sm">
                <p className="text-xs font-semibold uppercase tracking-wider text-stone-300">Video berikutnya</p>
                <p className="max-w-md text-lg font-extrabold text-white">{next.title}</p>
                <div className="flex flex-wrap justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => selectVideo(next.slug, true)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-brand-pink px-4 py-2 text-sm font-bold text-white shadow-glow transition hover:bg-brand-pinkHover"
                  >
                    <PlayCircle className="h-4 w-4" />
                    Putar sekarang
                  </button>
                  <button
                    type="button"
                    onClick={() => seekTo(0)}
                    className="rounded-xl border border-white/30 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                  >
                    Ulangi
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-card">
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-stone-500">
              <span className="rounded-md bg-brand-cocoa px-2 py-0.5 text-white">Video {videoNumber(active)}</span>
              <span>{active.category}</span>
              <span className="inline-flex items-center gap-1 normal-case tracking-normal">
                <Clock className="h-3 w-3" />
                {formatDuration(active.duration)}
              </span>
              {watched.includes(active.slug) && (
                <span className="inline-flex items-center gap-1 normal-case tracking-normal text-emerald-600">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Sudah ditonton
                </span>
              )}
            </div>

            <h2 className="mt-2 text-lg font-extrabold text-brand-cocoa sm:text-xl">{active.title}</h2>
            <p className="mt-1 text-sm leading-relaxed text-stone-600">{active.summary}</p>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Link
                href={active.menuHref}
                className="inline-flex items-center gap-1.5 rounded-xl bg-brand-pink px-3.5 py-2 text-xs font-bold text-white shadow-glow transition hover:bg-brand-pinkHover"
              >
                Buka menu {active.menuLabel}
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
              <div className="ml-auto flex gap-2">
                <button
                  type="button"
                  disabled={!prev}
                  onClick={() => prev && selectVideo(prev.slug, false)}
                  className="inline-flex items-center gap-1 rounded-xl border border-stone-200 px-3 py-2 text-xs font-semibold text-stone-700 transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  Sebelumnya
                </button>
                <button
                  type="button"
                  disabled={!next}
                  onClick={() => next && selectVideo(next.slug, false)}
                  className="inline-flex items-center gap-1 rounded-xl border border-stone-200 px-3 py-2 text-xs font-semibold text-stone-700 transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Berikutnya
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {active.chapters.length > 0 && (
              <div className="mt-5 border-t border-stone-100 pt-4">
                <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-stone-500">
                  <ListChecks className="h-3.5 w-3.5" />
                  Langkah-langkah
                </h3>
                <ol className="mt-2 grid gap-1 sm:grid-cols-2">
                  {active.chapters.map((c, i) => {
                    const isCurrent = i === activeChapterIndex;
                    return (
                      <li key={c.step}>
                        <button
                          type="button"
                          onClick={() => seekTo(c.t)}
                          className={`flex w-full items-start gap-2.5 rounded-xl px-2.5 py-2 text-left text-[13px] leading-snug transition ${
                            isCurrent ? "bg-brand-pinkSoft text-brand-cocoa" : "text-stone-700 hover:bg-stone-50"
                          }`}
                        >
                          <span
                            className={`mt-px flex h-5 min-w-5 shrink-0 items-center justify-center rounded-md px-1 text-[10px] font-extrabold ${
                              isCurrent ? "bg-brand-pink text-white" : "bg-stone-100 text-stone-600"
                            }`}
                          >
                            {c.step}
                          </span>
                          <span className="flex-1">{c.text}</span>
                          <span className="shrink-0 font-mono text-[11px] text-stone-400">{formatDuration(c.t)}</span>
                        </button>
                      </li>
                    );
                  })}
                </ol>
              </div>
            )}
          </div>
        </section>

        {/* Playlist */}
        <aside className="min-w-0 rounded-2xl border border-stone-200 bg-white p-4 shadow-card xl:sticky xl:top-20 xl:max-h-[calc(100vh-6rem)] xl:overflow-y-auto">
          <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-3">
            {(["Semua", ...TUTORIAL_CATEGORIES] as const).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] font-bold transition ${
                  category === c ? "bg-brand-cocoa text-white" : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <ul className="space-y-1.5">
            {visibleList.map((t) => {
              const isActive = t.slug === active.slug;
              const isWatched = watched.includes(t.slug);
              return (
                <li key={t.slug}>
                  <button
                    type="button"
                    onClick={() => selectVideo(t.slug, true)}
                    aria-current={isActive ? "true" : undefined}
                    className={`flex w-full gap-3 rounded-xl p-2 text-left transition ${
                      isActive ? "bg-brand-pinkSoft ring-1 ring-brand-pink/40" : "hover:bg-stone-50"
                    }`}
                  >
                    <span className="relative w-28 shrink-0 overflow-hidden rounded-lg bg-stone-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={thumbSrc(t.slug)} alt="" loading="lazy" className="aspect-video w-full object-cover" />
                      <span className="absolute bottom-1 right-1 rounded bg-stone-900/80 px-1 text-[10px] font-semibold text-white">
                        {formatDuration(t.duration)}
                      </span>
                      {isActive && (
                        <span className="absolute inset-0 flex items-center justify-center bg-brand-cocoa/30">
                          <PlayCircle className="h-6 w-6 text-white drop-shadow" />
                        </span>
                      )}
                    </span>
                    <span className="min-w-0 flex-1 py-0.5">
                      <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-stone-400">
                        {videoNumber(t)}
                        {isWatched && <CheckCircle2 className="h-3 w-3 text-emerald-500" aria-label="Sudah ditonton" />}
                      </span>
                      <span
                        className={`mt-0.5 block text-[13px] font-bold leading-snug ${
                          isActive ? "text-brand-pink" : "text-brand-cocoa"
                        }`}
                      >
                        {t.title}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>
      </div>
    </div>
  );
}
