"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  FileText,
  MessageSquarePlus,
  Plus,
  Send,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";

export interface RevisionNoteItem {
  id: string;
  pageUrl: string;
  pageTitle: string;
  elementTarget: string;
  noteContent: string;
  priority: "Tinggi" | "Sedang" | "Rendah";
  status: "Perlu Revisi" | "Sedang Dikerjakan" | "Selesai";
  author: string;
  createdAt: string;
}

export function FloatingRevisionNotes() {
  const pathname = usePathname() || "/";
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"current" | "all" | "new">("current");

  const [notes, setNotes] = useState<RevisionNoteItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Form State
  const [elementTarget, setElementTarget] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [priority, setPriority] = useState<"Tinggi" | "Sedang" | "Rendah">("Sedang");
  const [author, setAuthor] = useState("Klien El Massa");
  const [submitting, setSubmitting] = useState(false);

  // Load notes from Supabase & LocalStorage
  const loadNotes = async () => {
    setLoading(true);
    let localData: RevisionNoteItem[] = [];
    try {
      const saved = localStorage.getItem("el_massa_revision_notes");
      if (saved) localData = JSON.parse(saved);
    } catch (e) {}

    try {
      const res = await fetch("/api/revision-notes");
      const json = await res.json();
      if (json.ok && Array.isArray(json.data)) {
        const mergedMap = new Map<string, RevisionNoteItem>();
        json.data.forEach((n: RevisionNoteItem) => mergedMap.set(n.id, n));
        localData.forEach((n: RevisionNoteItem) => mergedMap.set(n.id, n));
        const finalArr = Array.from(mergedMap.values());
        setNotes(finalArr);
        try {
          localStorage.setItem("el_massa_revision_notes", JSON.stringify(finalArr));
        } catch (e) {}
      } else if (localData.length > 0) {
        setNotes(localData);
      }
    } catch (e) {
      if (localData.length > 0) setNotes(localData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotes();
  }, [pathname]);

  const currentPageNotes = useMemo(() => {
    return notes.filter((n) => n.pageUrl === pathname);
  }, [notes, pathname]);

  const pendingCurrentCount = useMemo(() => {
    return currentPageNotes.filter((n) => n.status !== "Selesai").length;
  }, [currentPageNotes]);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim()) return;

    setSubmitting(true);
    const newNote: RevisionNoteItem = {
      id: `rev-${Date.now()}`,
      pageUrl: pathname,
      pageTitle: document.title || pathname,
      elementTarget: elementTarget.trim() || "Umum Halaman",
      noteContent: noteContent.trim(),
      priority,
      status: "Perlu Revisi",
      author: author.trim() || "Klien El Massa",
      createdAt: new Date().toISOString(),
    };

    const updated = [newNote, ...notes];
    setNotes(updated);
    try {
      localStorage.setItem("el_massa_revision_notes", JSON.stringify(updated));
    } catch (e) {}

    try {
      await fetch("/api/revision-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newNote),
      });
    } catch (e) {
      console.error("Save note error:", e);
    }

    setSubmitting(false);
    setElementTarget("");
    setNoteContent("");
    setActiveTab("current");
  };

  const handleUpdateStatus = async (id: string, status: "Perlu Revisi" | "Sedang Dikerjakan" | "Selesai") => {
    const updated = notes.map((n) => (n.id === id ? { ...n, status } : n));
    setNotes(updated);
    try {
      localStorage.setItem("el_massa_revision_notes", JSON.stringify(updated));
    } catch (e) {}

    try {
      await fetch("/api/revision-notes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
    } catch (e) {
      console.error("Update status error:", e);
    }
  };

  const handleDeleteNote = async (id: string) => {
    const updated = notes.filter((n) => n.id !== id);
    setNotes(updated);
    try {
      localStorage.setItem("el_massa_revision_notes", JSON.stringify(updated));
    } catch (e) {}

    try {
      await fetch(`/api/revision-notes?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
    } catch (e) {
      console.error("Delete note error:", e);
    }
  };

  return (
    <>
      {/* 📌 Floating Trigger Button */}
      <div className="fixed bottom-6 right-6 z-[9990] flex items-center gap-2">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="group relative flex h-12 items-center gap-2.5 rounded-full bg-gradient-to-r from-stone-900 via-amber-950 to-brand-cocoa px-4 text-xs font-black text-white shadow-xl shadow-stone-900/30 hover:scale-105 active:scale-95 transition-all border border-amber-400/30 cursor-pointer"
        >
          <div className="relative flex h-7 w-7 items-center justify-center rounded-full bg-amber-400/20 text-amber-300">
            <MessageSquarePlus className="h-4 w-4" />
            {pendingCurrentCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white animate-pulse">
                {pendingCurrentCount}
              </span>
            )}
          </div>

          <div className="text-left leading-tight">
            <span className="block text-[10px] font-bold uppercase text-amber-300 tracking-wider">Catatan Revisi Klien</span>
            <span className="text-[11px] font-extrabold text-white">
              {currentPageNotes.length} Catatan di Halaman Ini
            </span>
          </div>
        </button>
      </div>

      {/* 📝 Slide-Over Revision Panel */}
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex justify-end bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
          <div className="flex h-full w-full max-w-md flex-col bg-white shadow-2xl border-l border-stone-200">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-stone-200/80 bg-stone-900 px-5 py-4 text-white">
              <div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-amber-400" />
                  <h2 className="text-sm font-black tracking-tight text-amber-200">
                    Catatan Revisi Per-Halaman
                  </h2>
                </div>
                <p className="text-[11px] text-stone-400 mt-0.5 font-medium">
                  Halaman Aktif: <code className="bg-stone-800 px-1.5 py-0.5 rounded text-amber-300 font-mono">{pathname}</code>
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-full bg-stone-800 text-stone-400 hover:bg-stone-700 hover:text-white transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex items-center border-b border-stone-200 bg-stone-50 p-2 gap-1">
              <button
                type="button"
                onClick={() => setActiveTab("current")}
                className={`flex-1 h-8 rounded-lg text-[11px] font-bold transition ${
                  activeTab === "current"
                    ? "bg-white text-brand-cocoa shadow-2xs border border-stone-200"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                📌 Halaman Ini ({currentPageNotes.length})
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("all")}
                className={`flex-1 h-8 rounded-lg text-[11px] font-bold transition ${
                  activeTab === "all"
                    ? "bg-white text-brand-cocoa shadow-2xs border border-stone-200"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                🌐 Semua Halaman ({notes.length})
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("new")}
                className={`h-8 px-3 rounded-lg text-[11px] font-bold transition flex items-center gap-1 ${
                  activeTab === "new"
                    ? "bg-brand-pink text-white shadow-2xs"
                    : "bg-rose-50 text-brand-pink hover:bg-rose-100"
                }`}
              >
                <Plus className="h-3.5 w-3.5" />
                <span>+ Catatan</span>
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {activeTab === "new" ? (
                <form onSubmit={handleAddNote} className="space-y-3.5 bg-stone-50 p-4 rounded-2xl border border-stone-200">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 block">
                      Target Elemen / Bagian yang Direvisi
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Header Navbar, Tabel Booking, Tombol HPP..."
                      value={elementTarget}
                      onChange={(e) => setElementTarget(e.target.value)}
                      className="w-full h-9 rounded-xl border border-stone-300 bg-white px-3 text-xs font-semibold text-stone-900 outline-none focus:border-brand-pink transition"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 block">
                      Detail Catatan / Masukan Revisi Klien <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={4}
                      required
                      placeholder="Tuliskan catatan masukan atau instruksi revisi secara detail disini..."
                      value={noteContent}
                      onChange={(e) => setNoteContent(e.target.value)}
                      className="w-full rounded-xl border border-stone-300 bg-white p-3 text-xs font-medium text-stone-900 outline-none focus:border-brand-pink transition resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 block">
                        Tingkat Prioritas
                      </label>
                      <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value as any)}
                        className="w-full h-9 rounded-xl border border-stone-300 bg-white px-2.5 text-xs font-bold text-stone-900 outline-none focus:border-brand-pink transition"
                      >
                        <option value="Tinggi">🔴 Tinggi (Urgent)</option>
                        <option value="Sedang">🟡 Sedang</option>
                        <option value="Rendah">🟢 Rendah (Saran)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 block">
                        Nama Pengirim
                      </label>
                      <input
                        type="text"
                        placeholder="Klien El Massa"
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        className="w-full h-9 rounded-xl border border-stone-300 bg-white px-3 text-xs font-medium text-stone-900 outline-none focus:border-brand-pink transition"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full h-10 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-extrabold transition flex items-center justify-center gap-1.5 shadow-md disabled:opacity-50 cursor-pointer"
                  >
                    <Send className="h-3.5 w-3.5 text-amber-400" />
                    <span>{submitting ? "Kirim Catatan..." : "Simpan Catatan Revisi"}</span>
                  </button>
                </form>
              ) : (
                <>
                  {(activeTab === "current" ? currentPageNotes : notes).length === 0 ? (
                    <div className="py-12 text-center space-y-2">
                      <div className="mx-auto w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-400">
                        💬
                      </div>
                      <p className="text-xs font-bold text-stone-600">
                        {activeTab === "current"
                          ? `Belum ada catatan revisi untuk halaman ${pathname}`
                          : "Belum ada catatan revisi tersimpan"}
                      </p>
                      <button
                        type="button"
                        onClick={() => setActiveTab("new")}
                        className="text-[11px] font-bold text-brand-pink hover:underline"
                      >
                        + Tambah Catatan Revisi Pertama
                      </button>
                    </div>
                  ) : (
                    (activeTab === "current" ? currentPageNotes : notes).map((note) => {
                      const priorityColor =
                        note.priority === "Tinggi"
                          ? "bg-rose-50 text-rose-700 border-rose-200"
                          : note.priority === "Sedang"
                          ? "bg-amber-50 text-amber-800 border-amber-200"
                          : "bg-emerald-50 text-emerald-700 border-emerald-200";

                      return (
                        <div
                          key={note.id}
                          className="rounded-2xl border border-stone-200/90 bg-white p-4 shadow-2xs space-y-3 hover:border-brand-pink/30 transition"
                        >
                          {/* Note Header */}
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold border ${priorityColor}`}>
                                  {note.priority}
                                </span>
                                <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-bold text-stone-700">
                                  {note.elementTarget}
                                </span>
                              </div>
                              {activeTab === "all" && (
                                <p className="text-[10px] font-mono text-stone-400 mt-1">
                                  📍 {note.pageUrl}
                                </p>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={() => handleDeleteNote(note.id)}
                              className="text-stone-300 hover:text-rose-600 transition p-1"
                              title="Hapus Catatan"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          {/* Note Content */}
                          <p className="text-xs font-semibold leading-relaxed text-stone-800 whitespace-pre-line">
                            {note.noteContent}
                          </p>

                          {/* Status & Footer */}
                          <div className="flex items-center justify-between border-t border-stone-100 pt-2 text-[10px]">
                            <span className="text-stone-400 font-medium">
                              Oleh {note.author} • {new Date(note.createdAt).toLocaleDateString("id-ID")}
                            </span>

                            <select
                              value={note.status}
                              onChange={(e) => handleUpdateStatus(note.id, e.target.value as any)}
                              className={`rounded-lg px-2 py-1 text-[10px] font-extrabold outline-none border transition cursor-pointer ${
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
                    })
                  )}
                </>
              )}
            </div>

            {/* Footer Status Bar */}
            <div className="border-t border-stone-200 bg-stone-50 px-4 py-3 text-center">
              <p className="text-[10px] font-bold text-stone-500">
                💡 Catatan revisi tersimpan otomatis ke Cloud Supabase & dapat diakses dari semua device.
              </p>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
