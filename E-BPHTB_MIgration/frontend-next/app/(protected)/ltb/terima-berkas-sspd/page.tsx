"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { getApiBase } from "../../../../lib/api";

const PAGE_SIZE = 10;

interface LtbRow {
  no_registrasi?: string | null;
  nobooking?: string;
  noppbb?: string;
  namawajibpajak?: string;
  namapemilikobjekpajak?: string;
  tanggal_terima?: string;
  trackstatus?: string;
  status?: string;
}

interface ApiResponse {
  success: boolean;
  total?: number;
  totalPages?: number;
  rows?: LtbRow[];
  message?: string;
}

const thStyle: React.CSSProperties = {
  padding: "12px 10px",
  textAlign: "center",
  borderBottom: "2px solid var(--border_color)",
  background: "var(--card_bg_grey)",
  fontWeight: 600,
  fontSize: 13,
};
const tdStyle: React.CSSProperties = {
  padding: "10px",
  borderBottom: "1px solid var(--border_color)",
  fontSize: 14,
};

export default function LTBTerimaBerkasSSPDPage() {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rows, setRows] = useState<LtbRow[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchRef = useRef(search);
  searchRef.current = search;

  const load = useCallback(async (page = currentPage) => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("limit", String(PAGE_SIZE));
        const q = searchRef.current.trim();
        if (q) params.set("q", q);
        const res = await fetch(`${getApiBase()}/api/ltb/terima-berkas-sspd?${params.toString()}`, { credentials: "include" });
        const data: ApiResponse = await res.json().catch(() => ({ success: false }));
        if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
        const list = data.rows || [];
        setRows(list);
        setTotalRecords(typeof data.total === "number" ? data.total : list.length);
        setTotalPages(typeof data.totalPages === "number" ? data.totalPages : Math.max(1, Math.ceil((data.total ?? list.length) / PAGE_SIZE)));
      } catch (e) {
        setError(e instanceof Error ? e.message : "Gagal memuat data");
        setRows([]);
      } finally {
        setLoading(false);
      }
  }, [currentPage]);

  useEffect(() => {
    load(currentPage);
  }, [currentPage, load]);

  const handleSearch = () => {
    setCurrentPage(1);
    load(1);
  };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>
      <h1 style={{ margin: "0 0 8px", color: "var(--color_font_main)" }}>Terima Berkas SSPD</h1>
      <p style={{ margin: 0, color: "var(--color_font_muted)", marginBottom: 20 }}>
        Permohonan validasi SSPD — daftar berkas dari PU (sinkron dengan data di LTB setelah PU mengirim berkas).
      </p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", marginBottom: 16 }}>
        <button
          type="button"
          disabled
          title="Menyusul"
          style={{
            padding: "10px 20px",
            borderRadius: 8,
            border: "none",
            background: "linear-gradient(135deg, #93c5fd 0%, #60a5fa 100%)",
            color: "#fff",
            fontWeight: 600,
            cursor: "not-allowed",
            opacity: 0.85,
          }}
        >
          View Dokumen
        </button>
        <button
          type="button"
          disabled
          title="Menyusul"
          style={{
            padding: "10px 20px",
            borderRadius: 8,
            border: "none",
            background: "linear-gradient(135deg, #fca5a5 0%, #f87171 100%)",
            color: "#fff",
            fontWeight: 600,
            cursor: "not-allowed",
            opacity: 0.85,
          }}
        >
          Tolak
        </button>
        <input
          type="text"
          placeholder="Cari No. Registrasi / Booking / NOP / nama..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          style={{
            marginLeft: "auto",
            padding: "10px 14px",
            borderRadius: 8,
            border: "1px solid var(--border_color)",
            minWidth: 200,
            background: "var(--card_bg)",
            color: "var(--color_font_main)",
          }}
        />
        <button
          type="button"
          onClick={() => handleSearch()}
          style={{
            padding: "10px 18px",
            borderRadius: 8,
            border: "none",
            background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
            color: "#fff",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Cari
        </button>
        <button
          type="button"
          onClick={() => load(currentPage)}
          style={{
            padding: "10px 16px",
            borderRadius: 8,
            border: "1px solid var(--border_color)",
            background: "var(--card_bg)",
            color: "var(--color_font_main)",
            cursor: "pointer",
          }}
        >
          Muat ulang
        </button>
      </div>

      <div style={{ overflowX: "auto", border: "1px solid var(--border_color)", borderRadius: 12, background: "var(--card_bg)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={thStyle}>No. Registrasi</th>
              <th style={thStyle}>No. Booking</th>
              <th style={thStyle}>NOP PBB</th>
              <th style={thStyle}>Nama Wajib Pajak</th>
              <th style={thStyle}>Nama Pemilik Objek Pajak</th>
              <th style={thStyle}>Tanggal Terima</th>
              <th style={thStyle}>Track Status</th>
              <th style={thStyle}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} style={{ ...tdStyle, textAlign: "center", padding: 40, color: "var(--color_font_main_muted)" }}>
                  Memuat...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={8} style={{ ...tdStyle, textAlign: "center", padding: 40, color: "#ef4444" }}>
                  {error}
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ ...tdStyle, textAlign: "center", padding: 40, color: "var(--color_font_main_muted)" }}>
                  Tidak ada data
                </td>
              </tr>
            ) : (
              rows.map((r, idx) => (
                <tr key={r.nobooking || String(idx)}>
                  <td style={tdStyle}>{r.no_registrasi || "—"}</td>
                  <td style={tdStyle}>{r.nobooking || "—"}</td>
                  <td style={tdStyle}>{r.noppbb || "—"}</td>
                  <td style={tdStyle}>{r.namawajibpajak || "—"}</td>
                  <td style={tdStyle}>{r.namapemilikobjekpajak || "—"}</td>
                  <td style={tdStyle}>{r.tanggal_terima || "—"}</td>
                  <td style={tdStyle}>{r.trackstatus || "—"}</td>
                  <td style={{ ...tdStyle, textAlign: "center", color: "var(--color_font_main_muted)" }}>—</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && !loading && (
        <div
          style={{
            marginTop: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            style={{
              padding: "8px 16px",
              border: "1px solid var(--border_color)",
              borderRadius: 8,
              background: "var(--card_bg)",
              cursor: currentPage <= 1 ? "not-allowed" : "pointer",
            }}
          >
            Prev
          </button>
          <span style={{ color: "var(--color_font_main_muted)" }}>
            Halaman {currentPage} dari {totalPages}
            {totalRecords > 0 ? ` (Total: ${totalRecords} data)` : ""}
          </span>
          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            style={{
              padding: "8px 16px",
              border: "1px solid var(--border_color)",
              borderRadius: 8,
              background: "var(--card_bg)",
              cursor: currentPage >= totalPages ? "not-allowed" : "pointer",
            }}
          >
            Next
          </button>
        </div>
      )}

      <p style={{ marginTop: 20 }}>
        <Link href="/ltb" style={{ color: "var(--accent)", fontWeight: 600 }}>
          ← Kembali ke Dashboard LTB
        </Link>
      </p>
    </div>
  );
}
