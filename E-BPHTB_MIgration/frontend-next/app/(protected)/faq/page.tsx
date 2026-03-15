"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getApiBase } from "../../../lib/api";

interface FAQItem {
  id: number;
  question: string;
  answer_html: string;
  created_at: string;
  updated_at: string;
  expires_at: string | null;
}

export default function FAQPage() {
  const { user } = useAuth();
  const isAdmin = user?.divisi === "Administrator";
  const [list, setList] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [question, setQuestion] = useState("");
  const [answerHtml, setAnswerHtml] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

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
        setList(data.data);
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

  const clearForm = () => {
    setEditingId(null);
    setQuestion("");
    setAnswerHtml("");
  };

  const handleEdit = (item: FAQItem) => {
    setEditingId(item.id);
    setQuestion(item.question);
    setAnswerHtml(item.answer_html);
  };

  const handleSave = async () => {
    const q = question.trim();
    const a = answerHtml.trim();
    if (!q || !a) {
      alert("Pertanyaan dan jawaban wajib diisi.");
      return;
    }
    setSaving(true);
    try {
      const url = editingId ? `/api/faq/${editingId}` : "/api/faq";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ question: q, answer_html: a }),
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

  const cardStyle: React.CSSProperties = {
    background: "var(--card_bg)",
    borderRadius: 12,
    boxShadow: "var(--card_shadow)",
    border: "1px solid var(--border_color)",
    overflow: "hidden",
  };

  const listContainerStyle: React.CSSProperties = {
    maxHeight: "60vh",
    overflowY: "auto",
    scrollbarWidth: "none",
    msOverflowStyle: "none",
    paddingRight: 8,
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 700 }}>Tanya Jawab (FAQ)</h1>
      </div>

      {isAdmin && (
        <section style={{ ...cardStyle, marginBottom: "1.5rem", padding: "1.25rem" }}>
          <h2 style={{ margin: "0 0 1rem", fontSize: "1.1rem", color: "var(--color_accent)" }}>
            {editingId ? "Edit FAQ" : "Tambah FAQ"}
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <label style={{ fontWeight: 600, fontSize: "0.9rem" }}>Pertanyaan</label>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Pertanyaan..."
              className="faq-input"
              style={{
                padding: "10px 12px",
                border: "1px solid var(--border_color)",
                borderRadius: 8,
                fontSize: "1rem",
                background: "#fff",
                color: "#1e293b",
              }}
            />
            <label style={{ fontWeight: 600, fontSize: "0.9rem" }}>Jawaban (HTML didukung)</label>
            <textarea
              value={answerHtml}
              onChange={(e) => setAnswerHtml(e.target.value)}
              placeholder="Jawaban... (bisa pakai tag HTML)"
              rows={6}
              className="faq-input"
              style={{
                padding: "10px 12px",
                border: "1px solid var(--border_color)",
                borderRadius: 8,
                fontSize: "1rem",
                resize: "vertical",
                background: "#fff",
                color: "#1e293b",
              }}
            />
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
                style={{ display: "none" }}
                id="faq-image-upload"
              />
              <label
                htmlFor="faq-image-upload"
                style={{
                  padding: "8px 14px",
                  background: "var(--surface_light)",
                  border: "1px solid var(--border_color)",
                  borderRadius: 8,
                  cursor: uploading ? "not-allowed" : "pointer",
                  fontSize: "0.9rem",
                }}
              >
                {uploading ? "Mengunggah..." : "Sisipkan gambar"}
              </label>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                style={{
                  padding: "8px 18px",
                  background: "var(--accent)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  fontWeight: 600,
                  cursor: saving ? "not-allowed" : "pointer",
                }}
              >
                {saving ? "Menyimpan..." : editingId ? "Perbarui" : "Simpan"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={clearForm}
                  style={{
                    padding: "8px 14px",
                    background: "transparent",
                    border: "1px solid var(--border_color)",
                    borderRadius: 8,
                    cursor: "pointer",
                    fontSize: "0.9rem",
                  }}
                >
                  Batal
                </button>
              )}
            </div>
          </div>
        </section>
      )}

      <section style={cardStyle}>
        <div
          style={{
            padding: "1rem 1.25rem",
            borderBottom: "1px solid var(--border_color)",
            fontWeight: 600,
            color: "var(--color_accent)",
          }}
        >
          Daftar FAQ
        </div>
        <div style={{ padding: "1rem" }}>
          {loading ? (
            <p style={{ margin: 0, color: "var(--color_font_muted)", textAlign: "center", padding: "2rem" }}>
              Memuat...
            </p>
          ) : error ? (
            <p style={{ margin: 0, color: "var(--color_logout)", textAlign: "center", padding: "2rem" }}>
              {error}
            </p>
          ) : list.length === 0 ? (
            <p style={{ margin: 0, color: "var(--color_font_muted)", textAlign: "center", padding: "2rem" }}>
              Belum ada konten FAQ.
            </p>
          ) : (
            <div style={listContainerStyle} className="faq-list-scroll">
              {list.map((item) => (
                <div
                  key={item.id}
                  style={{
                    padding: "1rem",
                    marginBottom: "0.75rem",
                    background: "var(--surface_light)",
                    borderRadius: 8,
                    border: "1px solid var(--border_color)",
                  }}
                >
                  <div style={{ fontWeight: 600, marginBottom: 6, color: "var(--color_font_main)" }}>
                    {item.question}
                  </div>
                  <div
                    style={{
                      fontSize: "0.95rem",
                      color: "var(--color_font_main_muted)",
                      lineHeight: 1.5,
                    }}
                    dangerouslySetInnerHTML={{ __html: item.answer_html }}
                  />
                  {isAdmin && (
                    <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
                      <button
                        type="button"
                        onClick={() => handleEdit(item)}
                        style={{
                          padding: "4px 10px",
                          fontSize: "0.85rem",
                          background: "var(--accent)",
                          color: "#fff",
                          border: "none",
                          borderRadius: 6,
                          cursor: "pointer",
                        }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        style={{
                          padding: "4px 10px",
                          fontSize: "0.85rem",
                          background: "transparent",
                          color: "var(--color_logout)",
                          border: "1px solid var(--color_logout)",
                          borderRadius: 6,
                          cursor: "pointer",
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
      <style dangerouslySetInnerHTML={{ __html: `.faq-input::placeholder { color: #64748b; }` }} />
    </div>
  );
}
