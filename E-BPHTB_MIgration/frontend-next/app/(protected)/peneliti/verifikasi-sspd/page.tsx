"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface VerifikasiItem {
  nobooking?: string;
  no_registrasi?: string;
  noppbb?: string;
  namawajibpajak?: string;
  persetujuan?: string;
  pemilihan?: string;
  [key: string]: unknown;
}

interface ApiResponse {
  success: boolean;
  data?: VerifikasiItem[];
  message?: string;
}

const ITEMS_PER_PAGE = 6;

export default function PenelitiVerifikasiSspdPage() {
  const [data, setData] = useState<VerifikasiItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/peneliti_get-berkas-fromltb", { credentials: "include" });
      const json: ApiResponse = await res.json().catch(() => ({ success: false }));
      if (!res.ok) throw new Error(json.message || `HTTP ${res.status}`);
      if (!json.success) throw new Error(json.message || "Gagal memuat data");
      setData(Array.isArray(json.data) ? json.data : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat data");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = search.trim()
    ? data.filter(
        (r) =>
          String(r.nobooking ?? "").toLowerCase().includes(search.toLowerCase()) ||
          String(r.no_registrasi ?? "").toLowerCase().includes(search.toLowerCase()) ||
          String(r.namawajibpajak ?? "").toLowerCase().includes(search.toLowerCase())
      )
    : data;
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const slice = filtered.slice(start, start + ITEMS_PER_PAGE);

  const sendToParaf = async (nobooking: string) => {
    setActionLoading(nobooking);
    try {
      const res = await fetch("/api/peneliti_send-to-paraf", {
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
      const res = await fetch("/api/peneliti_reject-with-reason", {
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
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20, flexWrap: "wrap" }}>
        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>Verifikasi SSPD</h2>
        <input
          type="text"
          placeholder="Cari No. Booking, No. Registrasi, Nama..."
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
      </div>

      {loading ? (
        <p style={{ color: "var(--color_font_main_muted)" }}>Memuat data...</p>
      ) : error ? (
        <p style={{ color: "#ef4444" }}>{error}</p>
      ) : slice.length === 0 ? (
        <p style={{ color: "var(--color_font_main_muted)" }}>Tidak ada data berkas dari LTB.</p>
      ) : (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: 16,
            }}
          >
            {slice.map((r) => (
              <div
                key={r.nobooking ?? ""}
                style={{
                  background: "var(--card_bg)",
                  border: "1px solid var(--border_color)",
                  borderRadius: 12,
                  padding: 16,
                  boxShadow: "var(--card_shadow)",
                }}
              >
                <div style={{ marginBottom: 8 }}>
                  <strong>No. Booking:</strong> {r.nobooking ?? "-"}
                </div>
                <div style={{ marginBottom: 8 }}>
                  <strong>No. Registrasi:</strong> {r.no_registrasi ?? "-"}
                </div>
                <div style={{ marginBottom: 8 }}>
                  <strong>Nama WP:</strong> {r.namawajibpajak ?? "-"}
                </div>
                <div style={{ marginBottom: 12 }}>
                  <strong>Persetujuan:</strong> {r.persetujuan ?? "-"} | <strong>Pemilihan:</strong> {r.pemilihan ?? "-"}
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button
                    type="button"
                    disabled={!!actionLoading}
                    onClick={() => sendToParaf(r.nobooking!)}
                    style={{
                      padding: "6px 12px",
                      borderRadius: 8,
                      border: "none",
                      background: "#10b981",
                      color: "white",
                      fontWeight: 600,
                      cursor: actionLoading ? "not-allowed" : "pointer",
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
                      background: "#ef4444",
                      color: "white",
                      fontWeight: 600,
                      cursor: actionLoading ? "not-allowed" : "pointer",
                    }}
                  >
                    Tolak
                  </button>
                </div>
              </div>
            ))}
          </div>
          {totalPages > 1 && (
            <div style={{ marginTop: 20, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setPage((p) => p - 1)}
                style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border_color)", cursor: currentPage <= 1 ? "not-allowed" : "pointer" }}
              >
                Prev
              </button>
              <span style={{ color: "var(--color_font_main_muted)" }}>
                Halaman {currentPage} dari {totalPages} ({filtered.length} data)
              </span>
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border_color)", cursor: currentPage >= totalPages ? "not-allowed" : "pointer" }}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
      <p style={{ marginTop: 24 }}>
        <Link href="/peneliti" style={{ color: "var(--accent)" }}>← Kembali ke Dashboard Peneliti</Link>
      </p>
    </div>
  );
}
