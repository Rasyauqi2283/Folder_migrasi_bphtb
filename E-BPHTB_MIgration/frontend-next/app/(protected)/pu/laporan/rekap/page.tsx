"use client";

import { useEffect, useState, useCallback } from "react";

const LIMIT = 10;

type RekapRow = {
  nobooking: string;
  noppbb: string;
  tanggal?: string;
  tahunajb: string;
  namawajibpajak: string;
  namapemilikobjekpajak: string;
  npwpwajibpajak: string;
  trackstatus: string;
  tanggal_formatted?: string;
  bphtb_yangtelah_dibayar?: number;
  totalNominal?: number;
};

type RekapResponse = {
  success: boolean;
  message?: string;
  rows?: RekapRow[];
  totalNominal?: number;
  pagination?: { page: number; limit: number; total: number; totalPages: number };
};

const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  background: "var(--card_bg)",
  borderRadius: 12,
  overflow: "hidden",
  boxShadow: "var(--card_shadow)",
};
const thStyle: React.CSSProperties = {
  textAlign: "center",
  padding: "12px 8px",
  background: "var(--card_bg_grey)",
  borderBottom: "1px solid var(--border_color)",
  fontWeight: 600,
  fontSize: 14,
};
const tdStyle: React.CSSProperties = {
  padding: "10px 8px",
  borderBottom: "1px solid var(--border_color)",
  fontSize: 14,
};
const btnStyle: React.CSSProperties = {
  padding: "8px 14px",
  borderRadius: 8,
  border: "none",
  cursor: "pointer",
  fontWeight: 600,
  fontSize: 13,
  background: "var(--card_bg_grey)",
  color: "var(--color_font_main)",
};

export default function LaporanRekapPPATPage() {
  const [rows, setRows] = useState<RekapRow[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalNominal, setTotalNominal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const load = useCallback(
    async (p: number) => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          page: String(p),
          limit: String(LIMIT),
          ...(search ? { q: search } : {}),
        });
        const res = await fetch(`/api/ppat/rekap/diserahkan?${params}`, { credentials: "include" });
        const json = (await res.json()) as RekapResponse;
        if (!res.ok || !json.success) {
          setError(json?.message || "Gagal memuat data");
          setRows([]);
          return;
        }
        setRows(Array.isArray(json.rows) ? json.rows : []);
        setTotalPages(json.pagination?.totalPages ?? 1);
        setTotalNominal(json.totalNominal ?? 0);
      } catch {
        setError("Gagal memuat data");
        setRows([]);
      } finally {
        setLoading(false);
      }
    },
    [search]
  );

  useEffect(() => {
    load(page);
  }, [page, load]);

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>
      <h1 style={{ margin: "0 0 0.5rem", color: "var(--color_font_main)" }}>Laporan Rekap PPAT</h1>
      <p style={{ margin: 0, color: "var(--color_font_muted)", fontSize: "0.9rem", marginBottom: 20 }}>
        Daftar berkas berstatus Diserahkan. Data dari <code>/api/ppat/rekap/diserahkan</code>.
      </p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 20, alignItems: "center" }}>
        <input
          type="text"
          placeholder="Cari (nobooking, nama, nop...)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: "8px 12px",
            borderRadius: 8,
            border: "1px solid var(--border_color)",
            minWidth: 220,
            fontSize: 14,
          }}
        />
        <button type="button" style={btnStyle} onClick={() => { setPage(1); load(1); }}>
          Cari
        </button>
      </div>

      {totalNominal > 0 && (
        <p style={{ marginBottom: 12, fontSize: 14, color: "var(--color_font_main)" }}>
          Total nominal: <strong>{new Intl.NumberFormat("id-ID").format(totalNominal)}</strong>
        </p>
      )}

      {error && (
        <div style={{ padding: 12, marginBottom: 16, background: "#fef2f2", color: "#b91c1c", borderRadius: 8 }}>
          {error}
        </div>
      )}

      <div style={{ overflowX: "auto" }}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>No. Booking</th>
              <th style={thStyle}>No. PPBB</th>
              <th style={thStyle}>Tahun AJB</th>
              <th style={thStyle}>Nama Wajib Pajak</th>
              <th style={thStyle}>Nama Pemilik Objek</th>
              <th style={thStyle}>NPWP</th>
              <th style={thStyle}>Tanggal</th>
              <th style={thStyle}>BPHTB Dibayar</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} style={{ ...tdStyle, textAlign: "center", padding: 32 }}>
                  Memuat...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ ...tdStyle, textAlign: "center", color: "var(--color_font_muted)" }}>
                  Tidak ada data rekap diserahkan
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.nobooking}>
                  <td style={tdStyle}>{r.nobooking}</td>
                  <td style={tdStyle}>{r.noppbb || "—"}</td>
                  <td style={tdStyle}>{r.tahunajb || "—"}</td>
                  <td style={tdStyle}>{r.namawajibpajak || "—"}</td>
                  <td style={tdStyle}>{r.namapemilikobjekpajak || "—"}</td>
                  <td style={tdStyle}>{r.npwpwajibpajak || "—"}</td>
                  <td style={tdStyle}>{r.tanggal_formatted || r.tanggal || "—"}</td>
                  <td style={tdStyle}>
                    {r.bphtb_yangtelah_dibayar != null
                      ? new Intl.NumberFormat("id-ID").format(r.bphtb_yangtelah_dibayar)
                      : "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, marginTop: 20 }}>
          <button
            type="button"
            style={btnStyle}
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Sebelumnya
          </button>
          <span style={{ fontSize: 14, color: "var(--color_font_main)" }}>
            Halaman {page} dari {totalPages}
          </span>
          <button
            type="button"
            style={btnStyle}
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Selanjutnya
          </button>
        </div>
      )}
    </div>
  );
}
