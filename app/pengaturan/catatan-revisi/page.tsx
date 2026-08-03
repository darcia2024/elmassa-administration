"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Filter,
  MessageSquare,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";
import { RevisionNoteItem } from "@/components/floating-revision-notes";

export default function RevisionNotesReviewPage() {
  const [notes, setNotes] = useState<RevisionNoteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [filterPriority, setFilterPriority] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/revision-notes");
      const json = await res.json();
      if (json.ok && Array.isArray(json.data)) {
        setNotes(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleUpdateStatus = async (id: string, status: "Perlu Revisi" | "Sedang Dikerjakan" | "Selesai") => {
    const updated = notes.map((n) => (n.id === id ? { ...n, status } : n));
    setNotes(updated);
    try {
      await fetch("/api/revision-notes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus catatan revisi ini?")) return;
    const updated = notes.filter((n) => n.id !== id);
    setNotes(updated);
    try {
      await fetch(`/api/revision-notes?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    } catch (e) {
      console.error(e);
    }
  };

  const filteredNotes = useMemo(() => {
    return notes.filter((n) => {
      const matchesStatus = filterStatus === "Semua" || n.status === filterStatus;
      const matchesPriority = filterPriority === "Semua" || n.priority === filterPriority;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        n.noteContent.toLowerCase().includes(q) ||
        n.elementTarget.toLowerCase().includes(q) ||
        n.pageUrl.toLowerCase().includes(q) ||
        n.author.toLowerCase().includes(q);

      return matchesStatus && matchesPriority && matchesSearch;
    });
  }, [notes, filterStatus, filterPriority, searchQuery]);

  return (
    <div className="min-h-screen bg-stone-50 font-sans p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white p-5 rounded-2xl border border-stone-200/80 shadow-2xs">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="grid h-9 w-9 place-items-center rounded-xl bg-stone-100 text-stone-600 hover:bg-stone-200 transition"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-brand-cocoa">
                📋 Review Catatan Revisi Klien
              </h1>
              <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-800 border border-amber-200">
                Cloud Supabase DB
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Daftar seluruh masukan dan instruksi revisi dari klien di semua halaman website
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchNotes}
          className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3.5 text-xs font-bold text-stone-700 hover:bg-stone-50 shadow-2xs transition"
        >
          <RefreshCw className={`h-3.5 w-3.5 text-stone-500 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Toolbar Filters */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-2xs flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
          <input
            type="text"
            placeholder="Cari kata kunci revisi, halaman, atau pengirim..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 rounded-xl border border-stone-200 bg-stone-50 pl-9 pr-3 text-xs font-medium text-stone-900 outline-none focus:border-brand-pink transition"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-stone-500">Status:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="h-8 rounded-xl border border-stone-200 bg-white px-2.5 text-xs font-bold text-stone-800 outline-none"
            >
              <option value="Semua">Semua Status</option>
              <option value="Perlu Revisi">⏳ Perlu Revisi</option>
              <option value="Sedang Dikerjakan">⚙️ Sedang Dikerjakan</option>
              <option value="Selesai">✅ Selesai</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-stone-500">Prioritas:</span>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="h-8 rounded-xl border border-stone-200 bg-white px-2.5 text-xs font-bold text-stone-800 outline-none"
            >
              <option value="Semua">Semua Prioritas</option>
              <option value="Tinggi">🔴 Tinggi (Urgent)</option>
              <option value="Sedang">🟡 Sedang</option>
              <option value="Rendah">🟢 Rendah</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Revision Notes */}
      {filteredNotes.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-stone-200 shadow-2xs space-y-2">
          <MessageSquare className="mx-auto h-10 w-10 text-stone-300" />
          <h3 className="text-sm font-bold text-stone-700">Tidak ada catatan revisi yang sesuai</h3>
          <p className="text-xs text-stone-400">Semua revisi telah selesai atau belum ada input baru dari klien.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredNotes.map((note) => {
            const priorityColor =
              note.priority === "Tinggi"
                ? "bg-rose-50 text-rose-700 border-rose-200"
                : note.priority === "Sedang"
                ? "bg-amber-50 text-amber-800 border-amber-200"
                : "bg-emerald-50 text-emerald-700 border-emerald-200";

            return (
              <div
                key={note.id}
                className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-2xs space-y-3 flex flex-col justify-between hover:shadow-md transition"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-extrabold border ${priorityColor}`}>
                      {note.priority}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDelete(note.id)}
                      className="text-stone-300 hover:text-rose-600 transition"
                      title="Hapus"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-stone-400 block">Bagian: {note.elementTarget}</span>
                    <a
                      href={note.pageUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-extrabold text-brand-pink hover:underline font-mono"
                    >
                      📍 {note.pageUrl} ↗
                    </a>
                  </div>

                  <p className="text-xs font-semibold text-stone-800 bg-stone-50 p-3 rounded-xl border border-stone-200/60 leading-relaxed whitespace-pre-line">
                    {note.noteContent}
                  </p>
                </div>

                <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px]">
                  <span className="text-stone-400 font-medium">
                    {note.author} • {new Date(note.createdAt).toLocaleDateString("id-ID")}
                  </span>

                  <select
                    value={note.status}
                    onChange={(e) => handleUpdateStatus(note.id, e.target.value as any)}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-extrabold outline-none border transition cursor-pointer ${
                      note.status === "Selesai"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : note.status === "Sedang Dikerjakan"
                        ? "bg-blue-50 text-blue-700 border-blue-200"
                        : "bg-rose-50 text-rose-700 border-rose-200"
                    }`}
                  >
                    <option value="Perlu Revisi">⏳ Perlu Revisi</option>
                    <option value="Sedang Dikerjakan">⚙️ Sedang Dikerjakan</option>
                    <option value="Selesai">✅ Selesai</option>
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
