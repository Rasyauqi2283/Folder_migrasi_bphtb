"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getApiBase } from "../../../../lib/api";

interface TicketRow {
  ticket_id: string;
  submitter_name: string;
  user_email: string;
  subject: string;
  message: string;
  status: string;
  unread_by_cs: boolean;
  created_at: string;
  updated_at: string;
}

interface ReplyRow {
  id: number;
  body: string;
  author_type: string;
  created_at: string;
}

interface ReplyTemplateRow {
  id: number;
  title: string;
  content: string;
  created_at: string;
}

const CS_REPLY_FOOTER =
  "(Balas pesan ini untuk menerima jawaban lanjutan apabila permasalahan belum terselesaikan, terimakasih!. Apabila tidak dijawab dalam jangka waktu 2 hari ticket akan dinyatakan hangus dan perlu memperbarui ticket kembali)";

function fmtTime(iso: string) {
  try {
    return new Date(iso).toLocaleString("id-ID", { dateStyle: "short", timeStyle: "short" });
  } catch {
    return iso;
  }
}

function statusLabel(s: string) {
  switch (s) {
    case "open":
      return "Open";
    case "in_progress":
      return "In Progress";
    case "resolved":
      return "Resolved";
    default:
      return s;
  }
}

export default function CsLayananPage() {
  const base = getApiBase();
  const [tickets, setTickets] = useState<TicketRow[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailTicket, setDetailTicket] = useState<TicketRow | null>(null);
  const [replies, setReplies] = useState<ReplyRow[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replyStatus, setReplyStatus] = useState("in_progress");
  const [replySubmitting, setReplySubmitting] = useState(false);

  const [templates, setTemplates] = useState<ReplyTemplateRow[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [templatesError, setTemplatesError] = useState<string | null>(null);
  const [templateSearch, setTemplateSearch] = useState("");
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [tplTitle, setTplTitle] = useState("");
  const [tplContent, setTplContent] = useState("");
  const [tplSubmitting, setTplSubmitting] = useState(false);

  const showToast = useCallback((type: "success" | "error", text: string) => {
    setToast({ type, text });
    window.setTimeout(() => setToast(null), 1800);
  }, []);

  const loadList = useCallback(async () => {
    try {
      const res = await fetch(`${base}/api/cs/support/tickets`, { credentials: "include" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof json?.message === "string" ? json.message : "Gagal memuat tiket");
        return;
      }
      if (json?.success && Array.isArray(json.data)) {
        setTickets(json.data);
        setUnreadCount(typeof json.unread_count === "number" ? json.unread_count : 0);
        setError(null);
      }
    } catch {
      setError("Koneksi gagal");
    } finally {
      setLoading(false);
    }
  }, [base]);

  const loadTemplates = useCallback(async () => {
    setTemplatesLoading(true);
    setTemplatesError(null);
    try {
      const res = await fetch(`${base}/api/cs/templates`, { credentials: "include" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setTemplatesError(typeof json?.message === "string" ? json.message : "Gagal memuat template");
        return;
      }
      if (json?.success && Array.isArray(json.data)) {
        setTemplates(json.data);
      }
    } catch {
      setTemplatesError("Koneksi gagal memuat template");
    } finally {
      setTemplatesLoading(false);
    }
  }, [base]);

  const createTemplate = useCallback(async () => {
    if (!tplTitle.trim() || !tplContent.trim()) return;
    setTplSubmitting(true);
    try {
      const res = await fetch(`${base}/api/cs/templates`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: tplTitle.trim(), content: tplContent.trim() }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        showToast("error", typeof json?.message === "string" ? json.message : "Gagal menyimpan template");
        return;
      }
      showToast("success", "Template berhasil dibuat");
      setTplTitle("");
      setTplContent("");
      await loadTemplates();
    } catch {
      showToast("error", "Gagal menyimpan template");
    } finally {
      setTplSubmitting(false);
    }
  }, [base, loadTemplates, showToast, tplContent, tplTitle]);

  const deleteTemplate = useCallback(
    async (id: number) => {
      if (!id) return;
      try {
        const res = await fetch(`${base}/api/cs/templates/${id}`, {
          method: "DELETE",
          credentials: "include",
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          showToast("error", typeof json?.message === "string" ? json.message : "Gagal menghapus template");
          return;
        }
        showToast("success", "Template berhasil dihapus");
        await loadTemplates();
      } catch {
        showToast("error", "Gagal menghapus template");
      }
    },
    [base, loadTemplates, showToast]
  );

  const loadDetail = useCallback(
    async (ticketId: string) => {
      setDetailLoading(true);
      try {
        const res = await fetch(`${base}/api/cs/support/tickets/${encodeURIComponent(ticketId)}`, {
          credentials: "include",
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(typeof json?.message === "string" ? json.message : "Gagal memuat detail");
          return;
        }
        if (json?.ticket) {
          setDetailTicket(json.ticket);
          setReplies(Array.isArray(json.replies) ? json.replies : []);
          setReplyStatus(json.ticket.status === "open" ? "in_progress" : json.ticket.status);
        }
        await loadList();
      } catch {
        setError("Gagal memuat detail");
      } finally {
        setDetailLoading(false);
      }
    },
    [base, loadList]
  );

  useEffect(() => {
    loadList();
  }, [loadList]);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  useEffect(() => {
    const id = setInterval(() => loadList(), 30000);
    return () => clearInterval(id);
  }, [loadList]);

  const filteredTemplates = useMemo(() => {
    const q = templateSearch.trim().toLowerCase();
    if (!q) return templates;
    return templates.filter((t) => t.title.toLowerCase().includes(q) || t.content.toLowerCase().includes(q));
  }, [templateSearch, templates]);

  const applyTemplate = useCallback(
    (tpl: ReplyTemplateRow) => {
      const namaUser = detailTicket?.submitter_name ?? "";
      const rendered = tpl.content.replaceAll("{{nama_user}}", namaUser);
      setReplyText((prev) => {
        const baseText = prev ?? "";
        if (!baseText.trim()) return rendered;
        return baseText.trimEnd() + "\n\n" + rendered;
      });
      showToast("success", "Template berhasil diterapkan");
    },
    [detailTicket?.submitter_name, showToast]
  );

  const submitReply = async () => {
    if (!selectedId || !replyText.trim()) return;
    setReplySubmitting(true);
    setError(null);
    try {
      const res = await fetch(`${base}/api/cs/support/tickets/${encodeURIComponent(selectedId)}/reply`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reply: replyText.trim(), status: replyStatus }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof json?.message === "string" ? json.message : "Gagal mengirim balasan");
        return;
      }
      setReplyText("");
      await loadDetail(selectedId);
    } catch {
      setError("Gagal mengirim balasan");
    } finally {
      setReplySubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      {toast && (
        <div
          style={{
            position: "fixed",
            top: 16,
            right: 16,
            zIndex: 1000,
            padding: "10px 12px",
            borderRadius: 10,
            background: toast.type === "success" ? "rgba(16,185,129,0.95)" : "rgba(239,68,68,0.95)",
            color: "#fff",
            fontWeight: 700,
            fontSize: 13,
            boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
            maxWidth: 360,
          }}
        >
          {toast.text}
        </div>
      )}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ margin: "0 0 8px", color: "var(--color_font_main)" }}>Layanan — Tiket dukungan</h1>
          <p style={{ margin: 0, color: "var(--color_font_muted)", marginBottom: 0 }}>
            Keluhan dari halaman landing (tanpa login). Balas pengguna lewat email; riwayat tersimpan di sistem.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button
            type="button"
            onClick={() => setTemplateModalOpen(true)}
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid var(--border_color)",
              background: "var(--card_bg)",
              color: "var(--color_font_main)",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Buat Template
          </button>
        {unreadCount > 0 && (
          <div
            style={{
              padding: "8px 14px",
              borderRadius: 999,
              background: "linear-gradient(135deg, #f59e0b, #d97706)",
              color: "#fff",
              fontWeight: 700,
              fontSize: 13,
              boxShadow: "0 4px 12px rgba(245,158,11,0.35)",
            }}
          >
            {unreadCount} tiket belum dibaca
          </div>
        )}
        </div>
      </div>

      {error && (
        <div style={{ marginTop: 16, padding: 12, background: "#fef2f2", color: "#b91c1c", borderRadius: 8 }}>{error}</div>
      )}

      <div
        style={{
          marginTop: 24,
          display: "grid",
          gridTemplateColumns: selectedId ? "minmax(280px, 1fr) minmax(360px, 1.2fr)" : "1fr",
          gap: 20,
          alignItems: "start",
        }}
      >
        <div
          style={{
            background: "var(--card_bg)",
            border: "1px solid var(--border_color)",
            borderRadius: 12,
            overflow: "hidden",
          }}
        >
          <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border_color)", fontWeight: 700 }}>Daftar tiket</div>
          {loading ? (
            <div style={{ padding: 24, textAlign: "center", color: "var(--color_font_main_muted)" }}>Memuat…</div>
          ) : tickets.length === 0 ? (
            <div style={{ padding: 24, textAlign: "center", color: "var(--color_font_main_muted)" }}>Belum ada tiket</div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                <thead>
                  <tr style={{ background: "var(--card_bg_grey)", textAlign: "left" }}>
                    <th style={{ padding: "10px 12px" }}>Tiket</th>
                    <th style={{ padding: "10px 12px" }}>Email</th>
                    <th style={{ padding: "10px 12px" }}>Status</th>
                    <th style={{ padding: "10px 12px" }}>Waktu</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((t) => (
                    <tr
                      key={t.ticket_id}
                      onClick={() => {
                        setSelectedId(t.ticket_id);
                        loadDetail(t.ticket_id);
                      }}
                      style={{
                        borderBottom: "1px solid var(--border_color)",
                        cursor: "pointer",
                        background: selectedId === t.ticket_id ? "rgba(14,165,233,0.1)" : t.unread_by_cs ? "rgba(245,158,11,0.08)" : undefined,
                      }}
                    >
                      <td style={{ padding: "10px 12px", fontWeight: 600 }}>
                        <span style={{ color: "var(--accent)" }}>{t.ticket_id}</span>
                        {t.unread_by_cs && (
                          <span
                            style={{
                              marginLeft: 8,
                              fontSize: 11,
                              padding: "2px 6px",
                              borderRadius: 4,
                              background: "#f59e0b",
                              color: "#fff",
                            }}
                          >
                            baru
                          </span>
                        )}
                        <div style={{ fontWeight: 400, fontSize: 12, color: "var(--color_font_main_muted)", marginTop: 4 }}>{t.subject}</div>
                      </td>
                      <td style={{ padding: "10px 12px", wordBreak: "break-all" }}>{t.user_email}</td>
                      <td style={{ padding: "10px 12px" }}>{statusLabel(t.status)}</td>
                      <td style={{ padding: "10px 12px", whiteSpace: "nowrap" }}>{fmtTime(t.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {selectedId && (
          <div
            style={{
              background: "var(--card_bg)",
              border: "1px solid var(--border_color)",
              borderRadius: 12,
              padding: 20,
              position: "sticky",
              top: 16,
            }}
          >
            {detailLoading || !detailTicket ? (
              <p style={{ color: "var(--color_font_main_muted)" }}>Memuat detail…</p>
            ) : (
              <>
                <h2 style={{ margin: "0 0 12px", fontSize: 18, color: "var(--color_font_main)" }}>{detailTicket.ticket_id}</h2>
                <p style={{ margin: "0 0 8px", fontSize: 14 }}>
                  <strong>{detailTicket.submitter_name}</strong> · {detailTicket.user_email}
                </p>
                <p style={{ margin: "0 0 8px", fontWeight: 600 }}>{detailTicket.subject}</p>
                <div
                  style={{
                    padding: 12,
                    background: "var(--card_bg_grey)",
                    borderRadius: 8,
                    marginBottom: 16,
                    fontSize: 14,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {detailTicket.message}
                </div>

                {replies.length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontWeight: 700, marginBottom: 8, fontSize: 14 }}>Riwayat balasan</div>
                    {replies.map((r) => (
                      <div
                        key={r.id}
                        style={{
                          padding: 10,
                          marginBottom: 8,
                          borderLeft: "3px solid var(--accent)",
                          background: "var(--card_bg_grey)",
                          fontSize: 13,
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        <div style={{ fontSize: 11, color: "var(--color_font_main_muted)", marginBottom: 4 }}>
                          {r.author_type === "cs" ? "CS" : r.author_type} · {fmtTime(r.created_at)}
                        </div>
                        <div style={{ whiteSpace: "pre-wrap" }}>{r.body}</div>
                        {r.author_type === "cs" && (
                          <div
                            style={{
                              marginTop: 10,
                              fontSize: 12,
                              fontWeight: 800,
                              color: "var(--color_font_main)",
                              opacity: 0.95,
                            }}
                          >
                            {CS_REPLY_FOOTER}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ fontWeight: 700, marginBottom: 8, fontSize: 14 }}>Balas pengguna (email)</div>

                <div
                  style={{
                    padding: 12,
                    border: "1px solid var(--border_color)",
                    borderRadius: 10,
                    background: "var(--card_bg_grey)",
                    marginBottom: 10,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                    <div style={{ fontWeight: 800, fontSize: 13 }}>Pesan cepat (template)</div>
                    <input
                      value={templateSearch}
                      onChange={(e) => setTemplateSearch(e.target.value)}
                      placeholder="Cari template…"
                      style={{
                        padding: "7px 10px",
                        borderRadius: 10,
                        border: "1px solid var(--border_color)",
                        background: "var(--card_bg)",
                        minWidth: 200,
                        fontSize: 13,
                      }}
                    />
                  </div>
                  <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 8, maxHeight: 84, overflow: "auto" }}>
                    {templatesLoading ? (
                      <span style={{ fontSize: 12, color: "var(--color_font_main_muted)" }}>Memuat template…</span>
                    ) : templatesError ? (
                      <span style={{ fontSize: 12, color: "#b91c1c" }}>{templatesError}</span>
                    ) : filteredTemplates.length === 0 ? (
                      <span style={{ fontSize: 12, color: "var(--color_font_main_muted)" }}>Belum ada template</span>
                    ) : (
                      filteredTemplates.map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => applyTemplate(t)}
                          style={{
                            border: "1px solid rgba(14,165,233,0.35)",
                            background: "rgba(14,165,233,0.10)",
                            color: "var(--color_font_main)",
                            padding: "6px 10px",
                            borderRadius: 999,
                            fontSize: 12,
                            fontWeight: 800,
                            cursor: "pointer",
                            whiteSpace: "nowrap",
                          }}
                          title="Klik untuk terapkan ke balasan"
                        >
                          {t.title}
                        </button>
                      ))
                    )}
                  </div>
                  <div style={{ marginTop: 8, fontSize: 12, color: "var(--color_font_main_muted)" }}>
                    Tips: gunakan variabel <strong>{"{{nama_user}}"}</strong> untuk auto-isi nama pengirim.
                  </div>
                </div>

                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={5}
                  placeholder="Tulis balasan yang akan dikirim ke email pengguna…"
                  style={{
                    width: "100%",
                    padding: 10,
                    borderRadius: 8,
                    border: "1px solid var(--border_color)",
                    background: "var(--card_bg)",
                    color: "var(--color_font_main)",
                    marginBottom: 10,
                    resize: "vertical",
                  }}
                />
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", marginBottom: 12 }}>
                  <label style={{ fontSize: 14, fontWeight: 600 }}>
                    Set status setelah kirim:{" "}
                    <select
                      value={replyStatus}
                      onChange={(e) => setReplyStatus(e.target.value)}
                      style={{
                        marginLeft: 8,
                        padding: "6px 10px",
                        borderRadius: 8,
                        border: "1px solid var(--border_color)",
                      }}
                    >
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="open">Open</option>
                    </select>
                  </label>
                </div>
                <button
                  type="button"
                  disabled={replySubmitting || !replyText.trim()}
                  onClick={submitReply}
                  style={{
                    padding: "10px 20px",
                    borderRadius: 8,
                    border: "none",
                    background: "var(--accent)",
                    color: "#fff",
                    fontWeight: 600,
                    cursor: replySubmitting || !replyText.trim() ? "not-allowed" : "pointer",
                  }}
                >
                  {replySubmitting ? "Mengirim…" : "Kirim balasan ke email"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedId(null);
                    setDetailTicket(null);
                    setReplies([]);
                    setReplyText("");
                  }}
                  style={{
                    marginLeft: 10,
                    padding: "10px 16px",
                    borderRadius: 8,
                    border: "1px solid var(--border_color)",
                    background: "transparent",
                    cursor: "pointer",
                  }}
                >
                  Tutup panel
                </button>
              </>
            )}
          </div>
        )}
      </div>

      <p style={{ marginTop: 24 }}>
        <Link href="/cs" style={{ color: "var(--accent)", fontWeight: 600 }}>
          ← Kembali ke Dashboard CS
        </Link>
      </p>

      {templateModalOpen && (
        <div
          onClick={() => setTemplateModalOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.35)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "min(760px, 100%)",
              background: "var(--card_bg)",
              border: "1px solid var(--border_color)",
              borderRadius: 14,
              boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
              overflow: "hidden",
            }}
          >
            <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border_color)", display: "flex", justifyContent: "space-between", gap: 12 }}>
              <div>
                <div style={{ fontWeight: 900, fontSize: 16, color: "var(--color_font_main)" }}>Template Balasan</div>
                <div style={{ fontSize: 12, color: "var(--color_font_main_muted)", marginTop: 2 }}>
                  Buat dan kelola pesan cepat untuk mempercepat balasan tiket.
                </div>
              </div>
              <button
                type="button"
                onClick={() => setTemplateModalOpen(false)}
                style={{
                  padding: "8px 12px",
                  borderRadius: 10,
                  border: "1px solid var(--border_color)",
                  background: "transparent",
                  cursor: "pointer",
                  fontWeight: 800,
                }}
              >
                Tutup
              </button>
            </div>

            <div style={{ padding: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <div style={{ fontWeight: 900, marginBottom: 8 }}>Buat template baru</div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Judul Template</label>
                <input
                  value={tplTitle}
                  onChange={(e) => setTplTitle(e.target.value)}
                  placeholder='Contoh: "Panduan Gagal OCR"'
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 10,
                    border: "1px solid var(--border_color)",
                    background: "var(--card_bg)",
                    marginBottom: 10,
                  }}
                />
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Isi Pesan</label>
                <textarea
                  value={tplContent}
                  onChange={(e) => setTplContent(e.target.value)}
                  rows={8}
                  placeholder="Tuliskan isi template… (boleh pakai {{nama_user}})"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 10,
                    border: "1px solid var(--border_color)",
                    background: "var(--card_bg)",
                    resize: "vertical",
                  }}
                />
                <div style={{ display: "flex", gap: 10, marginTop: 10, alignItems: "center" }}>
                  <button
                    type="button"
                    disabled={tplSubmitting || !tplTitle.trim() || !tplContent.trim()}
                    onClick={createTemplate}
                    style={{
                      padding: "10px 14px",
                      borderRadius: 10,
                      border: "none",
                      background: "var(--accent)",
                      color: "#fff",
                      fontWeight: 800,
                      cursor: tplSubmitting || !tplTitle.trim() || !tplContent.trim() ? "not-allowed" : "pointer",
                    }}
                  >
                    {tplSubmitting ? "Menyimpan…" : "Simpan Template"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTplTitle("");
                      setTplContent("");
                    }}
                    style={{
                      padding: "10px 14px",
                      borderRadius: 10,
                      border: "1px solid var(--border_color)",
                      background: "transparent",
                      fontWeight: 800,
                      cursor: "pointer",
                    }}
                  >
                    Reset
                  </button>
                </div>
              </div>

              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                  <div style={{ fontWeight: 900 }}>Daftar template Anda</div>
                  <button
                    type="button"
                    onClick={loadTemplates}
                    style={{
                      padding: "8px 12px",
                      borderRadius: 10,
                      border: "1px solid var(--border_color)",
                      background: "transparent",
                      cursor: "pointer",
                      fontWeight: 800,
                      fontSize: 12,
                    }}
                  >
                    Refresh
                  </button>
                </div>
                <div style={{ marginTop: 10 }}>
                  <input
                    value={templateSearch}
                    onChange={(e) => setTemplateSearch(e.target.value)}
                    placeholder="Cari di template…"
                    style={{
                      width: "100%",
                      padding: "9px 10px",
                      borderRadius: 10,
                      border: "1px solid var(--border_color)",
                      background: "var(--card_bg)",
                      fontSize: 13,
                    }}
                  />
                </div>
                <div style={{ marginTop: 10, maxHeight: 340, overflow: "auto", border: "1px solid var(--border_color)", borderRadius: 12 }}>
                  {templatesLoading ? (
                    <div style={{ padding: 12, color: "var(--color_font_main_muted)" }}>Memuat…</div>
                  ) : templatesError ? (
                    <div style={{ padding: 12, color: "#b91c1c" }}>{templatesError}</div>
                  ) : filteredTemplates.length === 0 ? (
                    <div style={{ padding: 12, color: "var(--color_font_main_muted)" }}>Belum ada template</div>
                  ) : (
                    filteredTemplates.map((t) => (
                      <div key={t.id} style={{ padding: 12, borderBottom: "1px solid var(--border_color)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                          <div style={{ fontWeight: 900 }}>{t.title}</div>
                          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            <button
                              type="button"
                              onClick={() => applyTemplate(t)}
                              style={{
                                padding: "6px 10px",
                                borderRadius: 10,
                                border: "1px solid rgba(14,165,233,0.45)",
                                background: "rgba(14,165,233,0.12)",
                                cursor: "pointer",
                                fontWeight: 900,
                                fontSize: 12,
                              }}
                            >
                              Terapkan
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteTemplate(t.id)}
                              style={{
                                padding: "6px 10px",
                                borderRadius: 10,
                                border: "1px solid rgba(239,68,68,0.45)",
                                background: "rgba(239,68,68,0.10)",
                                cursor: "pointer",
                                fontWeight: 900,
                                fontSize: 12,
                              }}
                            >
                              Hapus
                            </button>
                          </div>
                        </div>
                        <div style={{ marginTop: 8, fontSize: 13, whiteSpace: "pre-wrap", color: "var(--color_font_main)" }}>
                          {t.content.length > 420 ? t.content.slice(0, 420) + "…" : t.content}
                        </div>
                        <div style={{ marginTop: 8, fontSize: 11, color: "var(--color_font_main_muted)" }}>
                          Dibuat: {fmtTime(t.created_at)}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
