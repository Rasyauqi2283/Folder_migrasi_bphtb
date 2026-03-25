"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
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
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailTicket, setDetailTicket] = useState<TicketRow | null>(null);
  const [replies, setReplies] = useState<ReplyRow[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replyStatus, setReplyStatus] = useState("in_progress");
  const [replySubmitting, setReplySubmitting] = useState(false);

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
    const id = setInterval(() => loadList(), 30000);
    return () => clearInterval(id);
  }, [loadList]);

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
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ margin: "0 0 8px", color: "var(--color_font_main)" }}>Layanan — Tiket dukungan</h1>
          <p style={{ margin: 0, color: "var(--color_font_muted)", marginBottom: 0 }}>
            Keluhan dari halaman landing (tanpa login). Balas pengguna lewat email; riwayat tersimpan di sistem.
          </p>
        </div>
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
                        {r.body}
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ fontWeight: 700, marginBottom: 8, fontSize: 14 }}>Balas pengguna (email)</div>
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
    </div>
  );
}
