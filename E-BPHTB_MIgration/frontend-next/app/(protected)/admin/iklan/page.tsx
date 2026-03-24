"use client";

import { useCallback, useEffect, useState } from "react";
import type { CSSProperties } from "react";

interface BannerItem {
  id: number;
  image_path: string;
  link_url: string | null;
  ttl_type: string;
  ttl_value: number | null;
  expires_at: string | null;
  created_at: string;
}

const TTL_OPTIONS = [
  { value: "lifetime", label: "Lifetime (permanen)" },
  { value: "hours", label: "Jam" },
  { value: "day", label: "Hari" },
];

function getBackendBase(): string {
  if (typeof window === "undefined") return "";
  return "";
}

const overlayBackdropStyle: CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 10000,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "1rem",
  background: "rgba(0, 0, 0, 0.58)",
  backdropFilter: "blur(2px)",
};

export default function AdminIklanPage() {
  const [list, setList] = useState<BannerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [linkUrl, setLinkUrl] = useState("");
  const [ttlType, setTtlType] = useState("lifetime");
  const [ttlValue, setTtlValue] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);

  const loadBanners = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const base = getBackendBase();
      const res = await fetch(`${base}/api/admin/banners`, { credentials: "include" });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || "Gagal memuat banner");
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
    loadBanners();
  }, [loadBanners]);

  const openPreviewAt = useCallback((index: number) => {
    if (list.length === 0) return;
    const i = Math.max(0, Math.min(index, list.length - 1));
    setPreviewIndex(i);
    setPreviewOpen(true);
  }, [list.length]);

  const closePreview = useCallback(() => {
    setPreviewOpen(false);
  }, []);

  const goPrevBanner = useCallback(() => {
    setPreviewIndex((i) => (list.length <= 1 ? 0 : (i - 1 + list.length) % list.length));
  }, [list.length]);

  const goNextBanner = useCallback(() => {
    setPreviewIndex((i) => (list.length <= 1 ? 0 : (i + 1) % list.length));
  }, [list.length]);

  useEffect(() => {
    if (!previewOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closePreview();
      if (list.length > 1 && e.key === "ArrowLeft") goPrevBanner();
      if (list.length > 1 && e.key === "ArrowRight") goNextBanner();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [previewOpen, list.length, closePreview, goPrevBanner, goNextBanner]);

  useEffect(() => {
    if (previewOpen && list.length > 0 && previewIndex >= list.length) {
      setPreviewIndex(list.length - 1);
    }
  }, [previewOpen, list.length, previewIndex]);

  const clearForm = () => {
    setLinkUrl("");
    setTtlType("lifetime");
    setTtlValue("");
    setFile(null);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file && !editingId) {
      alert("Pilih gambar untuk banner baru.");
      return;
    }
    setSaving(true);
    try {
      const base = getBackendBase();
      if (editingId) {
        const body: { link_url?: string; ttl_type?: string; ttl_value?: number } = {
          link_url: linkUrl.trim() || undefined,
          ttl_type: ttlType,
        };
        if (ttlType !== "lifetime" && ttlValue.trim()) {
          const n = parseInt(ttlValue, 10);
          if (!isNaN(n) && n > 0) body.ttl_value = n;
        }
        const res = await fetch(`${base}/api/admin/banners/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.message || "Gagal memperbarui");
      } else {
        const form = new FormData();
        form.append("image", file!);
        form.append("link_url", linkUrl.trim());
        form.append("ttl_type", ttlType);
        if (ttlType !== "lifetime" && ttlValue.trim()) {
          const n = parseInt(ttlValue, 10);
          if (!isNaN(n) && n > 0) form.append("ttl_value", String(n));
        }
        const res = await fetch(`${base}/api/admin/banners`, {
          method: "POST",
          credentials: "include",
          body: form,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.message || "Gagal menyimpan");
      }
      clearForm();
      loadBanners();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Hapus banner ini?")) return;
    try {
      const base = getBackendBase();
      const res = await fetch(`${base}/api/admin/banners/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Gagal menghapus");
      if (editingId === id) clearForm();
      loadBanners();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Gagal menghapus");
    }
  };

  const imageBase = getBackendBase() || (typeof window !== "undefined" ? window.location.origin : "");
  const previewBanner = previewOpen && list.length > 0 ? list[previewIndex] : null;
  const previewImgUrl = previewBanner
    ? `${imageBase}/api/uploads/banners/${previewBanner.image_path}`
    : "";

  const cardStyle: React.CSSProperties = {
    background: "var(--card_bg)",
    borderRadius: 12,
    boxShadow: "var(--shadow_card)",
    border: "1px solid var(--border_color)",
    overflow: "hidden",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div>
        <h1 style={{ margin: "0 0 0.25rem", color: "var(--color_font_main)" }}>Kelola Iklan (Banner)</h1>
        <p style={{ margin: 0, color: "var(--color_font_muted)", fontSize: "0.9rem" }}>
          Unggah gambar banner. Banner aktif akan tampil di Halaman Utama. TTL: Hours / Day / Lifetime.
        </p>
      </div>

      <section style={cardStyle}>
        <div
          style={{
            padding: "1rem 1.25rem",
            borderBottom: "1px solid var(--border_color)",
            fontWeight: 600,
            color: "var(--color_accent)",
          }}
        >
          {editingId ? "Edit Banner" : "Tambah Banner Baru"}
        </div>
        <form onSubmit={handleSubmit} style={{ padding: "1.25rem" }}>
          {!editingId && (
            <div
              style={{
                border: `2px dashed ${dragOver ? "var(--accent)" : "var(--border_color)"}`,
                borderRadius: 12,
                padding: "2rem",
                textAlign: "center",
                background: dragOver ? "rgba(29, 78, 216, 0.08)" : "var(--surface_light)",
                marginBottom: "1rem",
                transition: "all 0.2s",
              }}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                const f = e.dataTransfer.files?.[0];
                if (f && f.type.startsWith("image/")) setFile(f);
              }}
            >
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                style={{ display: "none" }}
                id="banner-file"
              />
              <label htmlFor="banner-file" style={{ cursor: "pointer", display: "block" }}>
                {file ? (
                  <span style={{ color: "var(--accent)" }}>{file.name}</span>
                ) : (
                  <>
                    <span style={{ display: "block", marginBottom: 8 }}>Drag-and-drop gambar di sini atau klik untuk memilih</span>
                    <span style={{ fontSize: "0.85rem", color: "var(--color_font_muted)" }}>JPG, PNG, GIF, WebP</span>
                  </>
                )}
              </label>
            </div>
          )}
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: 6, fontWeight: 600, fontSize: "0.9rem" }}>Link URL (opsional)</label>
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://..."
              style={{
                width: "100%",
                maxWidth: 400,
                padding: "8px 12px",
                border: "1px solid var(--border_color)",
                borderRadius: 8,
                fontSize: "0.95rem",
              }}
            />
          </div>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-end", marginBottom: "1rem" }}>
            <div>
              <label style={{ display: "block", marginBottom: 6, fontWeight: 600, fontSize: "0.9rem" }}>TTL</label>
              <select
                value={ttlType}
                onChange={(e) => setTtlType(e.target.value)}
                style={{
                  padding: "8px 12px",
                  border: "1px solid var(--border_color)",
                  borderRadius: 8,
                  minWidth: 160,
                  fontSize: "0.95rem",
                }}
              >
                {TTL_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            {(ttlType === "hours" || ttlType === "day") && (
              <div>
                <label style={{ display: "block", marginBottom: 6, fontWeight: 600, fontSize: "0.9rem" }}>
                  {ttlType === "hours" ? "Jumlah jam" : "Jumlah hari"}
                </label>
                <input
                  type="number"
                  min={1}
                  value={ttlValue}
                  onChange={(e) => setTtlValue(e.target.value)}
                  placeholder={ttlType === "hours" ? "24" : "7"}
                  style={{
                    width: 80,
                    padding: "8px 12px",
                    border: "1px solid var(--border_color)",
                    borderRadius: 8,
                    fontSize: "0.95rem",
                  }}
                />
              </div>
            )}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="submit"
              disabled={saving || (!file && !editingId)}
              style={{
                padding: "8px 18px",
                background: saving ? "var(--color_font_dim)" : "var(--accent)",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                fontWeight: 600,
                cursor: saving ? "not-allowed" : "pointer",
              }}
            >
              {saving ? "Menyimpan..." : editingId ? "Perbarui" : "Simpan Banner"}
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
                }}
              >
                Batal
              </button>
            )}
          </div>
        </form>
      </section>

      <section style={cardStyle}>
        <div
          style={{
            padding: "1rem 1.25rem",
            borderBottom: "1px solid var(--border_color)",
            fontWeight: 600,
            color: "var(--color_accent)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 10,
          }}
        >
          <span>Daftar Banner</span>
          {!loading && !error && list.length > 0 && (
            <button
              type="button"
              onClick={() => openPreviewAt(0)}
              style={{
                padding: "8px 14px",
                fontSize: "0.85rem",
                fontWeight: 600,
                background: "var(--surface_light)",
                color: "var(--accent)",
                border: "1px solid var(--border_color)",
                borderRadius: 8,
                cursor: "pointer",
              }}
            >
              Pratinjau tampilan iklan
            </button>
          )}
        </div>
        <div style={{ padding: "1rem" }}>
          {loading ? (
            <p style={{ margin: 0, color: "var(--color_font_muted)", textAlign: "center", padding: "2rem" }}>
              Memuat...
            </p>
          ) : error ? (
            <p style={{ margin: 0, color: "var(--color_logout)", textAlign: "center", padding: "2rem" }}>{error}</p>
          ) : list.length === 0 ? (
            <p style={{ margin: 0, color: "var(--color_font_muted)", textAlign: "center", padding: "2rem" }}>
              Belum ada banner.
            </p>
          ) : (
            <div style={{ display: "grid", gap: "1rem" }}>
              {list.map((b, idx) => {
                const isExpired = b.expires_at && new Date(b.expires_at) <= new Date();
                const imgUrl = `${imageBase}/api/uploads/banners/${b.image_path}`;
                return (
                  <div
                    key={b.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 16,
                      padding: "1rem",
                      background: "var(--surface_light)",
                      borderRadius: 8,
                      border: "1px solid var(--border_color)",
                    }}
                  >
                    <div style={{ width: 120, height: 60, flexShrink: 0, borderRadius: 8, overflow: "hidden", background: "#eee" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={imgUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "0.85rem", color: "var(--color_font_muted)" }}>
                        TTL: {b.ttl_type}
                        {b.ttl_value != null && ` (${b.ttl_value})`}
                      </div>
                      <div style={{ fontSize: "0.8rem", color: "var(--color_font_dim)" }}>
                        {b.expires_at
                          ? isExpired
                            ? "Kadaluarsa"
                            : `Berakhir: ${new Date(b.expires_at).toLocaleString("id-ID")}`
                          : "Lifetime"}
                      </div>
                      {b.link_url && (
                        <div style={{ fontSize: "0.8rem", color: "var(--accent)", marginTop: 4 }}>{b.link_url}</div>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <button
                        type="button"
                        onClick={() => openPreviewAt(idx)}
                        style={{
                          padding: "6px 12px",
                          fontSize: "0.85rem",
                          background: "transparent",
                          color: "var(--color_font_main)",
                          border: "1px solid var(--border_color)",
                          borderRadius: 6,
                          cursor: "pointer",
                        }}
                      >
                        Pratinjau
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(b.id);
                          setLinkUrl(b.link_url || "");
                          setTtlType(b.ttl_type);
                          setTtlValue(b.ttl_value != null ? String(b.ttl_value) : "");
                        }}
                        style={{
                          padding: "6px 12px",
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
                        onClick={() => handleDelete(b.id)}
                        style={{
                          padding: "6px 12px",
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
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {previewOpen && previewBanner && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Pratinjau iklan"
          style={overlayBackdropStyle}
          onClick={closePreview}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              width: "100%",
              maxWidth: "min(920px, 96vw)",
              maxHeight: "min(90vh, 900px)",
              display: "flex",
              flexDirection: "column",
              alignItems: "stretch",
              background: "rgba(255,255,255,0.04)",
              borderRadius: 16,
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.45)",
              border: "1px solid rgba(255,255,255,0.12)",
              overflow: "hidden",
            }}
          >
            <button
              type="button"
              onClick={closePreview}
              aria-label="Tutup"
              style={{
                position: "absolute",
                top: 12,
                right: 12,
                zIndex: 2,
                width: 40,
                height: 40,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "none",
                borderRadius: "50%",
                background: "rgba(0,0,0,0.55)",
                color: "#fff",
                fontSize: "1.35rem",
                lineHeight: 1,
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
              }}
            >
              ×
            </button>

            <div
              style={{
                flex: 1,
                minHeight: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "3rem 1.25rem 1rem",
                background: "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(0,0,0,0.15) 100%)",
              }}
            >
              <a
                href={previewBanner.link_url || undefined}
                target={previewBanner.link_url ? "_blank" : undefined}
                rel={previewBanner.link_url ? "noopener noreferrer" : undefined}
                onClick={(e) => {
                  if (!previewBanner.link_url) e.preventDefault();
                }}
                style={{
                  display: "block",
                  maxWidth: "100%",
                  lineHeight: 0,
                  cursor: previewBanner.link_url ? "pointer" : "default",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewImgUrl}
                  alt="Banner"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "min(68vh, 640px)",
                    width: "auto",
                    height: "auto",
                    objectFit: "contain",
                    borderRadius: 12,
                    boxShadow: "0 12px 40px rgba(0,0,0,0.35)",
                  }}
                />
              </a>
            </div>

            <div
              style={{
                padding: "0 1.25rem 1.25rem",
                display: "flex",
                flexDirection: "column",
                gap: 12,
                alignItems: "center",
                background: "rgba(0,0,0,0.35)",
              }}
            >
              {list.length > 1 && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 12,
                    flexWrap: "wrap",
                    width: "100%",
                  }}
                >
                  <button
                    type="button"
                    onClick={goPrevBanner}
                    style={{
                      padding: "10px 18px",
                      fontWeight: 600,
                      fontSize: "0.9rem",
                      borderRadius: 8,
                      border: "1px solid rgba(255,255,255,0.35)",
                      background: "rgba(255,255,255,0.12)",
                      color: "#fff",
                      cursor: "pointer",
                    }}
                  >
                    ← Sebelumnya
                  </button>
                  <span style={{ color: "rgba(255,255,255,0.85)", fontSize: "0.9rem", minWidth: 72, textAlign: "center" }}>
                    {previewIndex + 1} / {list.length}
                  </span>
                  <button
                    type="button"
                    onClick={goNextBanner}
                    style={{
                      padding: "10px 18px",
                      fontWeight: 600,
                      fontSize: "0.9rem",
                      borderRadius: 8,
                      border: "1px solid rgba(255,255,255,0.35)",
                      background: "rgba(255,255,255,0.12)",
                      color: "#fff",
                      cursor: "pointer",
                    }}
                  >
                    Selanjutnya →
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={closePreview}
                style={{
                  width: "100%",
                  maxWidth: 320,
                  padding: "12px 20px",
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  borderRadius: 10,
                  border: "none",
                  background: "#f3f4f6",
                  color: "#111827",
                  cursor: "pointer",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
                }}
              >
                Tutup
              </button>
              {list.length > 1 && (
                <p style={{ margin: 0, fontSize: "0.75rem", color: "rgba(255,255,255,0.55)", textAlign: "center" }}>
                  Tips: gunakan tombol panah kiri/kanan di keyboard
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
