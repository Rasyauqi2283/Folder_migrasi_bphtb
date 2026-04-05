"use client";

import { useCallback, useEffect, useMemo, useState, type CSSProperties } from "react";
import { useAuth } from "../../context/AuthContext";
import { getApiBase } from "../../../lib/api";
import { FAQAnswerModal, FAQBubbleTile } from "../../components/faq/FAQBubble";
import {
  type FAQItem,
  faqMatchesSearch,
  faqVisibleForUser,
  FAQ_DIVISI_OPTIONS,
  normalizeFAQItem,
} from "../../components/faq/faqTypes";
import { faqTourAutoRunStorageKey, startFaqGuidedTour } from "../../components/faq/faqTourRunner";

export default function FAQPage() {
  const { user } = useAuth();
  const isAdmin = user?.divisi === "Administrator";
  const [list, setList] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [question, setQuestion] = useState("");
  const [answerHtml, setAnswerHtml] = useState("");
  const [allowedRoles, setAllowedRoles] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedFaqId, setSelectedFaqId] = useState<number | null>(null);

  const loadFaq = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${getApiBase()}/api/faq`, { credentials: "include" });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || "Gagal memuat FAQ");
      }
      if (data?.success && Array.isArray(data?.data)) {
        const parsed: FAQItem[] = [];
        for (const row of data.data) {
          const it = normalizeFAQItem(row);
          if (it) parsed.push(it);
        }
        setList(parsed);
      } else {
        setList([]);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Terjadi kesalahan");
      setList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFaq();
  }, [loadFaq]);

  const runTour = useCallback((markFirstVisitDone: boolean) => {
    const uid = user?.userid?.trim();
    if (!uid) return;
    startFaqGuidedTour({
      isAdmin: !!isAdmin,
      divisi: user?.divisi,
      userId: uid,
      markFirstVisitDone,
    });
  }, [user?.userid, user?.divisi, isAdmin]);

  /* Sekali otomatis per akun (browser); lewati jika sudah pernah | "BANTUAN VISUAL" tidak menulis flag */
  useEffect(() => {
    if (typeof window === "undefined" || loading) return;
    const uid = user?.userid?.trim();
    if (!uid) return;
    try {
      if (localStorage.getItem(faqTourAutoRunStorageKey(uid))) return;
    } catch {
      return;
    }
    let cancelled = false;
    const t = window.setTimeout(() => {
      if (cancelled) return;
      startFaqGuidedTour({
        isAdmin: !!isAdmin,
        divisi: user?.divisi,
        userId: uid,
        markFirstVisitDone: true,
      });
    }, 720);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [loading, user?.userid, user?.divisi, isAdmin]);

  const viewerDivisi = user?.divisi;

  const visibleForUi = useMemo(
    () => list.filter((item) => faqVisibleForUser(item, viewerDivisi, !!isAdmin)),
    [list, viewerDivisi, isAdmin]
  );

  const filteredBubbles = useMemo(
    () => visibleForUi.filter((item) => faqMatchesSearch(item, search)),
    [visibleForUi, search]
  );

  const selectedItem = useMemo(
    () => (selectedFaqId == null ? null : filteredBubbles.find((x) => x.id === selectedFaqId) ?? null),
    [selectedFaqId, filteredBubbles]
  );

  useEffect(() => {
    if (selectedFaqId != null && !filteredBubbles.some((x) => x.id === selectedFaqId)) {
      setSelectedFaqId(null);
    }
  }, [selectedFaqId, filteredBubbles]);

  const clearForm = () => {
    setEditingId(null);
    setQuestion("");
    setAnswerHtml("");
    setAllowedRoles([]);
  };

  const handleEdit = (item: FAQItem) => {
    setEditingId(item.id);
    setQuestion(item.question);
    setAnswerHtml(item.answer_html);
    setAllowedRoles([...(item.allowed_roles ?? [])]);
  };

  const toggleRole = (value: string) => {
    setAllowedRoles((prev) =>
      prev.includes(value) ? prev.filter((x) => x !== value) : [...prev, value]
    );
  };

  const handleSave = async () => {
    const q = question.trim();
    const a = answerHtml.trim();
    if (!q || !a) {
      alert("Pertanyaan dan jawaban wajib diisi.");
      return;
    }
    const base = getApiBase();
    setSaving(true);
    try {
      const url = editingId ? `${base}/api/faq/${editingId}` : `${base}/api/faq`;
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          question: q,
          answer_html: a,
          allowed_roles: allowedRoles,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || "Gagal menyimpan");
      }
      clearForm();
      loadFaq();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Hapus FAQ ini?")) return;
    try {
      const res = await fetch(`${getApiBase()}/api/faq/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || "Gagal menghapus");
      }
      if (editingId === id) clearForm();
      if (selectedFaqId === id) setSelectedFaqId(null);
      loadFaq();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Gagal menghapus");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append("image", file);
      const res = await fetch(`${getApiBase()}/api/faq/upload`, {
        method: "POST",
        credentials: "include",
        body: form,
      });
      const data = await res.json();
      if (!res.ok || !data?.url) {
        throw new Error(data?.message || "Upload gagal");
      }
      setAnswerHtml((prev) => prev + ` <img src="${data.url}" alt="upload" style="max-width:100%;" />`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Upload gagal");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const cardShell: CSSProperties = {
    borderRadius: 12,
    border: "1px solid var(--border_color)",
    background: "var(--card_bg)",
    boxShadow: "var(--shadow_card)",
    overflow: "hidden",
  };

  return (
    <div className="mx-auto max-w-5xl px-1">
      <div
        id="tour-faq-header"
        className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"
      >
        <div className="min-w-0">
          <h1 className="m-0 text-2xl font-bold tracking-tight" style={{ color: "var(--color_font_main)" }}>
            Tanya Jawab (FAQ)
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--color_font_main_muted)" }}>
            Pilih kartu untuk membuka jawaban. Konten dapat dibatasi per divisi (pengaturan admin).
          </p>
        </div>
        <button
          type="button"
          onClick={() => runTour(false)}
          className="shrink-0 rounded-xl border border-slate-300 bg-white/90 px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-white hover:shadow-md"
          style={{ borderColor: "var(--border_color)" }}
        >
          Bantuan visual
        </button>
      </div>

      <div
        id="tour-faq-search-wrap"
        className="mb-6 rounded-2xl border border-slate-200/90 bg-white/70 p-3 shadow-lg backdrop-blur-md sm:p-4 dark:border-slate-600/40 dark:bg-slate-900/35"
        style={{ boxShadow: "var(--shadow_card)" }}
      >
        <label htmlFor="faq-search" className="sr-only">
          Cari FAQ
        </label>
        <div className="relative">
          <span
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            aria-hidden
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </span>
          <input
            id="faq-search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari kata kunci di pertanyaan atau jawaban…"
            className="w-full rounded-xl border border-slate-200/90 bg-white/90 py-3 pl-11 pr-4 text-sm text-slate-900 shadow-inner outline-none ring-blue-500/30 transition placeholder:text-slate-400 focus:ring-2"
          />
        </div>
      </div>

      {isAdmin && (
        <section id="tour-faq-admin-panel" className="mb-8 p-5" style={cardShell}>
          <h2 className="mb-4 text-lg font-semibold" style={{ color: "var(--color_accent)" }}>
            {editingId ? "Edit FAQ" : "Tambah FAQ"}
          </h2>
          <div className="flex flex-col gap-3">
            <label className="text-sm font-semibold" style={{ color: "var(--color_font_main)" }}>
              Pertanyaan
            </label>
            <input
              id="tour-faq-question"
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Pertanyaan..."
              className="faq-input rounded-lg px-3 py-2.5"
              style={{
                border: "1px solid var(--border_color)",
                background: "#fff",
                color: "var(--color_font_main)",
              }}
            />
            <label className="text-sm font-semibold" style={{ color: "var(--color_font_main)" }}>
              Jawaban (HTML didukung)
            </label>
            <textarea
              id="tour-faq-answer"
              value={answerHtml}
              onChange={(e) => setAnswerHtml(e.target.value)}
              placeholder="Jawaban... (bisa pakai tag HTML)"
              rows={6}
              className="faq-input rounded-lg px-3 py-2.5"
              style={{
                border: "1px solid var(--border_color)",
                background: "#fff",
                color: "var(--color_font_main)",
              }}
            />

            <fieldset
              id="tour-faq-roles"
              className="rounded-xl p-4"
              style={{
                border: "1px solid var(--border_color)",
                background: "var(--surface_light)",
              }}
            >
              <legend className="px-1 text-sm font-semibold" style={{ color: "var(--color_font_main)" }}>
                Siapa yang dapat melihat FAQ ini?
              </legend>
              <p className="mb-3 text-xs" style={{ color: "var(--color_font_main_muted)" }}>
                Kosongkan semua centang agar FAQ tampil untuk <strong>semua divisi</strong>. Centang satu atau lebih
                untuk membatasi hanya ke divisi tersebut.
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setAllowedRoles(FAQ_DIVISI_OPTIONS.map((o) => o.value))}
                  className="rounded-lg px-2 py-1 text-xs font-medium"
                  style={{
                    border: "1px solid var(--border_color)",
                    background: "#fff",
                    color: "var(--color_font_main)",
                  }}
                >
                  Pilih semua
                </button>
                <button
                  type="button"
                  onClick={() => setAllowedRoles([])}
                  className="rounded-lg px-2 py-1 text-xs font-medium"
                  style={{
                    border: "1px solid var(--border_color)",
                    background: "#fff",
                    color: "var(--color_font_main)",
                  }}
                >
                  Semua divisi (kosongkan)
                </button>
              </div>
              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {FAQ_DIVISI_OPTIONS.map((opt) => (
                  <label
                    key={opt.value}
                    className="flex cursor-pointer items-center gap-2 rounded-lg border border-transparent bg-white/80 px-2 py-1.5 text-sm hover:border-slate-300"
                  >
                    <input
                      type="checkbox"
                      checked={allowedRoles.includes(opt.value)}
                      onChange={() => toggleRole(opt.value)}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600"
                    />
                    <span style={{ color: "var(--color_font_main)" }}>{opt.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div id="tour-faq-publish-actions" className="flex flex-wrap items-center gap-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
                className="hidden"
                id="faq-image-upload"
              />
              <label
                htmlFor="faq-image-upload"
                className="inline-flex cursor-pointer items-center rounded-lg px-3 py-2 text-sm font-medium"
                style={{
                  cursor: uploading ? "not-allowed" : "pointer",
                  border: "1px solid var(--border_color)",
                  background: "var(--surface_light)",
                  color: "var(--color_font_main)",
                }}
              >
                {uploading ? "Mengunggah..." : "Sisipkan gambar"}
              </label>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="rounded-lg px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
                style={{ background: "var(--accent)" }}
              >
                {saving ? "Menyimpan..." : editingId ? "Perbarui" : "Simpan"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={clearForm}
                  className="rounded-lg bg-transparent px-4 py-2 text-sm"
                  style={{ border: "1px solid var(--border_color)" }}
                >
                  Batal
                </button>
              )}
            </div>
          </div>
        </section>
      )}

      <section id="tour-faq-list-section" style={cardShell}>
        <div
          className="border-b px-5 py-3 font-semibold"
          style={{ borderColor: "var(--border_color)", color: "var(--color_accent)" }}
        >
          Daftar FAQ
          {!loading && !error && (
            <span className="ml-2 text-sm font-normal" style={{ color: "var(--color_font_main_muted)" }}>
              ({filteredBubbles.length} ditampilkan)
            </span>
          )}
        </div>
        <div className="p-4 sm:p-5">
          {loading ? (
            <p className="py-12 text-center" style={{ color: "var(--color_font_muted)" }}>
              Memuat...
            </p>
          ) : error ? (
            <p className="py-12 text-center" style={{ color: "var(--color_logout)" }}>
              {error}
            </p>
          ) : filteredBubbles.length === 0 ? (
            <p className="py-12 text-center" style={{ color: "var(--color_font_muted)" }}>
              {visibleForUi.length === 0
                ? "Tidak ada FAQ untuk divisi Anda, atau belum ada konten."
                : "Tidak ada FAQ yang cocok dengan pencarian."}
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredBubbles.map((item) => (
                <div key={item.id} className="flex min-h-[140px] flex-col">
                  <FAQBubbleTile
                    item={item}
                    onSelect={setSelectedFaqId}
                    showRoleBadges={!!isAdmin}
                  />
                  {isAdmin && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(item)}
                        className="rounded-md px-3 py-1 text-xs font-medium text-white"
                        style={{ background: "var(--accent)" }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="rounded-md border px-3 py-1 text-xs font-medium"
                        style={{
                          borderColor: "var(--color_logout)",
                          color: "var(--color_logout)",
                        }}
                      >
                        Hapus
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <FAQAnswerModal
        item={selectedItem}
        onClose={() => setSelectedFaqId(null)}
      />

      <style dangerouslySetInnerHTML={{ __html: `.faq-input::placeholder { color: #64748b; }` }} />
    </div>
  );
}
