"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { getApiBase } from "../../../../lib/api";

interface VerifikasiItem {
  nobooking?: string;
  no_registrasi?: string;
  noppbb?: string;
  namawajibpajak?: string;
  namapemilikobjekpajak?: string;
  persetujuan?: string;
  pemilihan?: string;
  creator_userid?: string;
  userid?: string;
  [key: string]: unknown;
}

interface ApiResponse {
  success: boolean;
  data?: VerifikasiItem[];
  message?: string;
}

const PAGE_SIZE = 10;

const tableScrollStyle: React.CSSProperties = {
  overflowX: "auto",
  width: "100%",
  marginTop: 20,
};
const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  background: "var(--card_bg)",
  borderRadius: 12,
  overflow: "hidden",
  boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
  minWidth: 800,
};
const thStyle: React.CSSProperties = {
  padding: "14px 12px",
  textAlign: "center",
  fontWeight: 600,
  fontSize: 13,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  background: "linear-gradient(135deg, #0d1b2a 0%, #1b263b 50%, #415a77 100%)",
  color: "#fff",
  border: "none",
};
const tdStyle: React.CSSProperties = {
  padding: "12px 14px",
  borderBottom: "1px solid var(--border_color)",
  fontSize: 14,
  color: "var(--color_font_main)",
  verticalAlign: "middle",
};

export default function PenelitiVerifikasiSspdPage() {
  const [data, setData] = useState<VerifikasiItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [realTimeEnabled, setRealTimeEnabled] = useState(true);

  const rowKey = (r: VerifikasiItem, idx = 0) => `${String(r.nobooking ?? "")}::${String(r.no_registrasi ?? "")}::${idx}`;
  const mergeAppendOnly = (existing: VerifikasiItem[], incoming: VerifikasiItem[]) => {
    const seen = new Set(existing.map((r, idx) => rowKey(r, idx)));
    const onlyNew = incoming.filter((r, idx) => !seen.has(rowKey(r, idx)));
    return onlyNew.length > 0 ? [...existing, ...onlyNew] : existing;
  };

  const load = useCallback(async (options?: { silent?: boolean; appendOnly?: boolean }) => {
    const silent = !!options?.silent;
    const appendOnly = !!options?.appendOnly;
    if (!silent) {
      setLoading(true);
      setError(null);
    }
    try {
      const res = await fetch(`${getApiBase()}/api/peneliti_get-berkas-fromltb`, { credentials: "include" });
      const json: ApiResponse = await res.json().catch(() => ({ success: false }));
      if (!res.ok) throw new Error(json.message || `HTTP ${res.status}`);
      if (!json.success) throw new Error(json.message || "Gagal memuat data");
      const incoming = Array.isArray(json.data) ? json.data : [];
      if (appendOnly) setData((prev) => mergeAppendOnly(prev, incoming));
      else setData(incoming);
    } catch (e) {
      if (!silent) {
        setError(e instanceof Error ? e.message : "Gagal memuat data");
        setData([]);
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!realTimeEnabled) return;
    const t = setInterval(() => load({ silent: true, appendOnly: true }), 10000);
    return () => clearInterval(t);
  }, [realTimeEnabled, load]);

  const filtered = search.trim()
    ? data.filter(
        (r) =>
          String(r.nobooking ?? "").toLowerCase().includes(search.toLowerCase()) ||
          String(r.no_registrasi ?? "").toLowerCase().includes(search.toLowerCase()) ||
          String(r.namawajibpajak ?? "").toLowerCase().includes(search.toLowerCase()) ||
          String(r.noppbb ?? "").toLowerCase().includes(search.toLowerCase())
      )
    : data;
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const slice = filtered.slice(start, start + PAGE_SIZE);

  const sendToParaf = async (nobooking: string) => {
    setActionLoading(nobooking);
    try {
      const res = await fetch(`${getApiBase()}/api/peneliti_send-to-paraf`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nobooking }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((json as ApiResponse).message || "Gagal kirim");
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Gagal kirim ke paraf");
    } finally {
      setActionLoading(null);
    }
  };

  const reject = async (nobooking: string) => {
    const reason = prompt("Alasan penolakan:");
    if (!reason?.trim()) return;
    setActionLoading(nobooking);
    try {
      const res = await fetch(`${getApiBase()}/api/peneliti_reject-with-reason`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nobooking, alasan: reason.trim() }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((json as ApiResponse).message || "Gagal tolak");
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Gagal tolak");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
          marginBottom: 20,
        }}
      >
        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>Verifikasi SSPD</h2>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <input
            type="text"
            placeholder="Cari No. Registrasi, No. Booking, Nama WP, NOP..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && setPage(1)}
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              border: "1px solid var(--border_color)",
              minWidth: 220,
            }}
          />
          <button
            type="button"
            onClick={() => load()}
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              border: "1px solid var(--border_color)",
              background: "var(--card_bg)",
              cursor: "pointer",
            }}
          >
            Muat ulang
          </button>
          <button
            type="button"
            onClick={() => setRealTimeEnabled((v) => !v)}
            style={{
              padding: "8px 14px",
              borderRadius: 8,
              border: "none",
              background: realTimeEnabled ? "#f59e0b" : "#10b981",
              color: "#fff",
              fontWeight: 600,
              cursor: "pointer",
              fontSize: 13,
            }}
          >
            {realTimeEnabled ? "⏸ Pause Real-time" : "▶ Start Real-time"}
          </button>
          <span style={{ fontSize: 12, color: "var(--color_font_muted)", display: "flex", alignItems: "center", gap: 6 }}>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: realTimeEnabled ? "#28a745" : "#6c757d",
              }}
            />
            Real-time
          </span>
        </div>
      </div>

      <div style={tableScrollStyle}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>No</th>
              <th style={thStyle}>No. Registrasi</th>
              <th style={thStyle}>No. Booking</th>
              <th style={thStyle}>NOP PBB</th>
              <th style={thStyle}>Nama WP</th>
              <th style={thStyle}>Pembuat Booking</th>
              <th style={thStyle}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ ...tdStyle, textAlign: "center", padding: 40, color: "var(--color_font_muted)" }}>
                  Memuat data...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={7} style={{ ...tdStyle, textAlign: "center", padding: 40, color: "#ef4444" }}>
                  {error}
                </td>
              </tr>
            ) : slice.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ ...tdStyle, textAlign: "center", padding: 40, color: "var(--color_font_muted)" }}>
                  Tidak ada data berkas dari LTB.
                </td>
              </tr>
            ) : (
              slice.map((r, idx) => (
                <tr key={r.nobooking ?? idx} style={{ borderBottom: "1px solid var(--border_color)" }}>
                  <td style={{ ...tdStyle, textAlign: "center" }}>{start + idx + 1}</td>
                  <td style={tdStyle}>{r.no_registrasi ?? "-"}</td>
                  <td style={tdStyle}>{r.nobooking ?? "-"}</td>
                  <td style={tdStyle}>{r.noppbb ?? "-"}</td>
                  <td style={tdStyle}>{r.namawajibpajak ?? "-"}</td>
                  <td style={tdStyle}>{r.creator_userid ?? r.userid ?? "-"}</td>
                  <td style={{ ...tdStyle, textAlign: "center" }}>
                    <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                      <button
                        type="button"
                        disabled={!!actionLoading}
                        onClick={() => sendToParaf(r.nobooking!)}
                        style={{
                          padding: "6px 12px",
                          borderRadius: 8,
                          border: "none",
                          background: "linear-gradient(135deg, #10b981, #059669)",
                          color: "white",
                          fontWeight: 600,
                          cursor: actionLoading ? "not-allowed" : "pointer",
                          fontSize: 13,
                        }}
                      >
                        {actionLoading === r.nobooking ? "..." : "Kirim ke Paraf"}
                      </button>
                      <button
                        type="button"
                        disabled={!!actionLoading}
                        onClick={() => reject(r.nobooking!)}
                        style={{
                          padding: "6px 12px",
                          borderRadius: 8,
                          border: "none",
                          background: "linear-gradient(135deg, #ef4444, #dc2626)",
                          color: "white",
                          fontWeight: 600,
                          cursor: actionLoading ? "not-allowed" : "pointer",
                          fontSize: 13,
                        }}
                      >
                        Tolak
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && !loading && (
        <div style={{ marginTop: 20, display: "flex", alignItems: "center", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => setPage((p) => p - 1)}
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              border: "1px solid var(--border_color)",
              cursor: currentPage <= 1 ? "not-allowed" : "pointer",
              background: "var(--card_bg)",
            }}
          >
            Prev
          </button>
          <span style={{ color: "var(--color_font_muted)" }}>
            Halaman {currentPage} dari {totalPages} ({filtered.length} data)
          </span>
          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              border: "1px solid var(--border_color)",
              cursor: currentPage >= totalPages ? "not-allowed" : "pointer",
              background: "var(--card_bg)",
            }}
          >
            Next
          </button>
        </div>
      )}

      <p style={{ marginTop: 24 }}>
        <Link href="/peneliti" style={{ color: "var(--accent)" }}>
          ← Kembali ke Dashboard Peneliti
        </Link>
      </p>
    </div>
  );
}
