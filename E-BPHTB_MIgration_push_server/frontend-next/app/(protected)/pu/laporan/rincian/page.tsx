"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { getApiBase } from "../../../../../lib/api";

const PAGE_SIZE = 10;
const MONTH_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

type RincianRow = {
  nobooking: string;
  noppbb?: string;
  tanggal?: string;
  tahunajb?: string;
  namawajibpajak?: string;
  namapemilikobjekpajak?: string;
  npwpwajibpajak?: string;
  trackstatus?: string;
  tanggal_formatted?: string;
  bphtb_yangtelah_dibayar?: number;
  updated_at?: string;
  created_at?: string;
};

type RincianResponse = {
  success: boolean;
  message?: string;
  rows?: RincianRow[];
  totalNominal?: number;
  pagination?: { page: number; limit: number; total: number; totalPages: number };
};

function parseDateForMonth(item: RincianRow): { year: number; month: number } | null {
  const dateStr = item.tanggal_formatted || item.tanggal || item.updated_at || item.created_at;
  if (!dateStr || typeof dateStr !== "string") return null;
  const m = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (m) {
    const month = parseInt(m[2], 10);
    const year = parseInt(m[3], 10);
    if (month >= 1 && month <= 12 && year > 0) return { year, month };
  }
  const d = new Date(dateStr);
  if (!Number.isNaN(d.getTime())) return { year: d.getFullYear(), month: d.getMonth() + 1 };
  return null;
}

export default function RincianLaporanBulananPage() {
  const [allRows, setAllRows] = useState<RincianRow[]>([]);
  const [totalNominal, setTotalNominal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<{ month: number; year: number; data: RincianRow[] } | null>(null);
  const [tablePage, setTablePage] = useState(1);
  const [tableSearch, setTableSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${getApiBase()}/api/ppat/rekap/diserahkan?page=1&limit=10000`,
        { credentials: "include" }
      );
      const json = (await res.json()) as RincianResponse;
      if (!res.ok || !json.success) {
        setError(json?.message || "Gagal memuat data");
        setAllRows([]);
        return;
      }
      setAllRows(Array.isArray(json.rows) ? json.rows : []);
      setTotalNominal(json.totalNominal ?? 0);
    } catch {
      setError("Gagal memuat data");
      setAllRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const years = (() => {
    const set = new Set<number>();
    allRows.forEach((r) => {
      const p = parseDateForMonth(r);
      if (p) set.add(p.year);
    });
    const currentYear = new Date().getFullYear();
    if (!set.has(currentYear)) set.add(currentYear);
    return Array.from(set).sort((a, b) => b - a);
  })();

  const monthData = (() => {
    const map: Record<string, { month: number; year: number; data: RincianRow[]; count: number; totalNominal: number }> = {};
    for (let i = 1; i <= 12; i++) {
      const key = `${selectedYear}-${String(i).padStart(2, "0")}`;
      map[key] = { month: i, year: selectedYear, data: [], count: 0, totalNominal: 0 };
    }
    allRows.forEach((r) => {
      const p = parseDateForMonth(r);
      if (!p || p.year !== selectedYear) return;
      const key = `${p.year}-${String(p.month).padStart(2, "0")}`;
      if (map[key]) {
        map[key].data.push(r);
        map[key].count++;
        map[key].totalNominal += Number(r.bphtb_yangtelah_dibayar) || 0;
      }
    });
    return map;
  })();

  const tableRows = selectedMonth
    ? selectedMonth.data.filter((r) => {
        if (!tableSearch.trim()) return true;
        const q = tableSearch.toLowerCase();
        return (
          (r.nobooking ?? "").toLowerCase().includes(q) ||
          (r.noppbb ?? "").toLowerCase().includes(q) ||
          (r.namawajibpajak ?? "").toLowerCase().includes(q)
        );
      })
    : [];
  const tablePaginated = tableRows.slice((tablePage - 1) * PAGE_SIZE, tablePage * PAGE_SIZE);
  const tableTotalPages = Math.max(1, Math.ceil(tableRows.length / PAGE_SIZE));

  const baseUrl = getApiBase();
  const pdfUrl = (type: "validasi" | "badan", nobooking: string, download?: boolean) => {
    const nb = encodeURIComponent(nobooking);
    if (type === "validasi") return `${baseUrl}/api/ppat/generate-pdf-mohon-validasi/${nb}${download ? "?download=1" : ""}`;
    return `${baseUrl}/api/ppat_generate-pdf-badan/${nb}${download ? "?download=1" : ""}`;
  };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ marginBottom: 8, color: "var(--color_font_main)", fontSize: 28, fontWeight: 700 }}>
        Rincian Laporan Bulanan PPAT
      </div>
      <p style={{ margin: "0 0 24px", color: "var(--color_font_muted)", fontSize: 14 }}>
        Ringkasan bulanan berkas yang sudah diserahkan
      </p>

      {error && (
        <div style={{ padding: 12, marginBottom: 16, background: "#fef2f2", color: "#b91c1c", borderRadius: 8 }}>
          {error}
        </div>
      )}

      {!error && (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 20,
              marginBottom: 30,
            }}
          >
            <div
              style={{
                padding: 24,
                borderRadius: 16,
                border: "1px solid var(--border_color)",
                background: "linear-gradient(135deg, #fff 0%, #f0fdf4 100%)",
                borderLeft: "4px solid #10b981",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <span style={{ fontSize: 18, fontWeight: 700, color: "var(--color_font_main)" }}>
                  Total Transaksi (Akumulasi)
                </span>
                <span
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: "linear-gradient(135deg, #10b981, #059669)",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 20,
                  }}
                >
                  Rp
                </span>
              </div>
              <div style={{ fontSize: 32, fontWeight: 700, color: "#10b981", marginBottom: 8 }}>
                {loading ? "..." : `Rp ${(totalNominal || 0).toLocaleString("id-ID")}`}
              </div>
              <div style={{ fontSize: 14, color: "var(--color_font_muted)" }}>Total BPHTB yang Telah Dibayar</div>
            </div>
            <div
              style={{
                padding: 24,
                borderRadius: 16,
                border: "1px solid var(--border_color)",
                background: "linear-gradient(135deg, #fff 0%, #eff6ff 100%)",
                borderLeft: "4px solid #3b82f6",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <span style={{ fontSize: 18, fontWeight: 700, color: "var(--color_font_main)" }}>
                  Total Berkas Selesai
                </span>
                <span
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 20,
                  }}
                >
                  ✓
                </span>
              </div>
              <div style={{ fontSize: 32, fontWeight: 700, color: "#3b82f6", marginBottom: 8 }}>
                {loading ? "..." : allRows.length}
              </div>
              <div style={{ fontSize: 14, color: "var(--color_font_muted)" }}>Jumlah Berkas Status &quot;Diserahkan&quot;</div>
            </div>
          </div>

          <div
            style={{
              marginBottom: 20,
              display: "flex",
              alignItems: "center",
              gap: 15,
              flexWrap: "wrap",
              padding: 15,
              background: "var(--card_bg)",
              borderRadius: 12,
              border: "1px solid var(--border_color)",
            }}
          >
            <span style={{ fontWeight: 600, color: "var(--color_font_main)" }}>Pilih Tahun:</span>
            {years.map((y) => (
              <button
                key={y}
                type="button"
                onClick={() => {
                  setSelectedYear(y);
                  setSelectedMonth(null);
                }}
                style={{
                  padding: "8px 16px",
                  borderRadius: 8,
                  border: "1px solid #3b82f6",
                  background: selectedYear === y ? "#3b82f6" : "transparent",
                  color: selectedYear === y ? "#fff" : "#3b82f6",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {y}
              </button>
            ))}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: 20,
              marginBottom: 30,
            }}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => {
              const key = `${selectedYear}-${String(m).padStart(2, "0")}`;
              const info = monthData[key];
              const count = info?.count ?? 0;
              const total = info?.totalNominal ?? 0;
              const hasData = count > 0;
              return (
                <div
                  key={key}
                  onClick={() => hasData && setSelectedMonth(info ? { month: m, year: selectedYear, data: info.data } : null)}
                  style={{
                    padding: 24,
                    borderRadius: 16,
                    border: `1px solid ${selectedMonth?.month === m ? "#3b82f6" : "var(--border_color)"}`,
                    background: "var(--card_bg)",
                    boxShadow: selectedMonth?.month === m ? "0 8px 24px rgba(59,130,246,0.25)" : "0 4px 16px rgba(0,0,0,0.08)",
                    cursor: hasData ? "pointer" : "default",
                    opacity: hasData ? 1 : 0.7,
                    borderTop: "4px solid transparent",
                    borderTopColor: hasData ? "#3b82f6" : "transparent",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                    <span style={{ fontSize: 18, fontWeight: 700, color: "var(--color_font_main)" }}>
                      {MONTH_NAMES[m - 1]} {selectedYear}
                    </span>
                    <span
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 12,
                        background: hasData ? "linear-gradient(135deg, #3b82f6, #2563eb)" : "#d1d5db",
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 20,
                      }}
                    >
                      📅
                    </span>
                  </div>
                  <div style={{ fontSize: 36, fontWeight: 700, color: hasData ? "#3b82f6" : "#9ca3af", marginBottom: 8 }}>
                    {count}
                  </div>
                  <div style={{ fontSize: 14, color: "var(--color_font_muted)", marginBottom: 8 }}>
                    Berkas Diserahkan
                  </div>
                  {hasData && (
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#10b981" }}>
                      Rp {total.toLocaleString("id-ID")}
                    </div>
                  )}
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--border_color)", display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: hasData ? "#3b82f6" : "#9ca3af" }}>
                      {count} item
                    </span>
                    <span style={{ color: "var(--color_font_muted)" }}>→</span>
                  </div>
                </div>
              );
            })}
          </div>

          {allRows.length === 0 && !loading && (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--color_font_muted)" }}>
              <div style={{ fontSize: 64, marginBottom: 16 }}>📊</div>
              <h3 style={{ marginBottom: 8, color: "var(--color_font_main)" }}>Belum ada data laporan</h3>
              <p>Data laporan akan muncul setelah berkas diserahkan</p>
            </div>
          )}

          {selectedMonth && (
            <div
              style={{
                marginTop: 30,
                padding: 20,
                background: "#fff",
                borderRadius: 12,
                border: "1px solid var(--border_color)",
                boxShadow: "var(--card_shadow)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
                <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>
                  Data Laporan - {MONTH_NAMES[selectedMonth.month - 1]} {selectedMonth.year}
                </h3>
                <button
                  type="button"
                  onClick={() => { setSelectedMonth(null); setTablePage(1); }}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 8,
                    border: "1px solid rgba(239,68,68,0.3)",
                    background: "rgba(239,68,68,0.1)",
                    color: "#ef4444",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  ✕ Tutup Tabel
                </button>
              </div>
              <div style={{ marginBottom: 12, display: "flex", gap: 8, alignItems: "center" }}>
                <input
                  type="text"
                  placeholder="Cari data..."
                  value={tableSearch}
                  onChange={(e) => { setTableSearch(e.target.value); setTablePage(1); }}
                  style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border_color)", minWidth: 200 }}
                />
                <button
                  type="button"
                  onClick={() => load()}
                  style={{
                    padding: "8px 14px",
                    borderRadius: 8,
                    border: "none",
                    background: "linear-gradient(135deg, #06b6d4, #0891b2)",
                    color: "#fff",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  🔄 Refresh
                </button>
              </div>
              <div style={{ overflowX: "auto", borderRadius: 10, border: "1px solid var(--border_color)" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 800 }}>
                  <thead>
                    <tr style={{ background: "var(--accent)" }}>
                      <th style={{ padding: "16px 12px", textAlign: "center", color: "#fff", fontWeight: 600, fontSize: 12, textTransform: "uppercase" }}>No Booking</th>
                      <th style={{ padding: "16px 12px", textAlign: "center", color: "#fff", fontWeight: 600, fontSize: 12, textTransform: "uppercase" }}>NOP PBB</th>
                      <th style={{ padding: "16px 12px", textAlign: "center", color: "#fff", fontWeight: 600, fontSize: 12, textTransform: "uppercase" }}>Tanggal</th>
                      <th style={{ padding: "16px 12px", textAlign: "center", color: "#fff", fontWeight: 600, fontSize: 12, textTransform: "uppercase" }}>Tahun AJB</th>
                      <th style={{ padding: "16px 12px", textAlign: "center", color: "#fff", fontWeight: 600, fontSize: 12, textTransform: "uppercase" }}>Nama WP</th>
                      <th style={{ padding: "16px 12px", textAlign: "center", color: "#fff", fontWeight: 600, fontSize: 12, textTransform: "uppercase" }}>Nama Pemilik Objek</th>
                      <th style={{ padding: "16px 12px", textAlign: "center", color: "#fff", fontWeight: 600, fontSize: 12, textTransform: "uppercase" }}>NPWP</th>
                      <th style={{ padding: "16px 12px", textAlign: "center", color: "#fff", fontWeight: 600, fontSize: 12, textTransform: "uppercase" }}>Status</th>
                      <th style={{ padding: "16px 12px", textAlign: "center", color: "#fff", fontWeight: 600, fontSize: 12, textTransform: "uppercase" }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tablePaginated.length === 0 ? (
                      <tr>
                        <td colSpan={9} style={{ padding: 40, textAlign: "center", color: "var(--color_font_muted)" }}>
                          Tidak ada data
                        </td>
                      </tr>
                    ) : (
                      tablePaginated.map((r) => (
                        <tr key={r.nobooking} style={{ borderBottom: "1px solid var(--border_color)" }}>
                          <td style={{ padding: 12, fontSize: 13 }}>{r.nobooking}</td>
                          <td style={{ padding: 12, fontSize: 13 }}>{r.noppbb ?? "—"}</td>
                          <td style={{ padding: 12, fontSize: 13 }}>{r.tanggal_formatted || r.tanggal || "—"}</td>
                          <td style={{ padding: 12, fontSize: 13 }}>{r.tahunajb ?? "—"}</td>
                          <td style={{ padding: 12, fontSize: 13 }}>{r.namawajibpajak ?? "—"}</td>
                          <td style={{ padding: 12, fontSize: 13 }}>{r.namapemilikobjekpajak ?? "—"}</td>
                          <td style={{ padding: 12, fontSize: 13 }}>{r.npwpwajibpajak ?? "—"}</td>
                          <td style={{ padding: 12, fontSize: 13 }}>{r.trackstatus ?? "—"}</td>
                          <td style={{ padding: 12, fontSize: 13 }}>
                            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                              <a
                                href={pdfUrl("validasi", r.nobooking)}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  padding: "6px 10px",
                                  borderRadius: 6,
                                  background: "#4CAF50",
                                  color: "#fff",
                                  fontSize: 12,
                                  fontWeight: 500,
                                  textDecoration: "none",
                                }}
                              >
                                PDF Validasi
                              </a>
                              <a
                                href={pdfUrl("badan", r.nobooking)}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  padding: "6px 10px",
                                  borderRadius: 6,
                                  background: "#2196F3",
                                  color: "#fff",
                                  fontSize: 12,
                                  fontWeight: 500,
                                  textDecoration: "none",
                                }}
                              >
                                PDF Badan
                              </a>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {tableTotalPages > 1 && (
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, marginTop: 16 }}>
                  <button
                    type="button"
                    disabled={tablePage <= 1}
                    onClick={() => setTablePage((p) => p - 1)}
                    style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border_color)", cursor: tablePage <= 1 ? "not-allowed" : "pointer" }}
                  >
                    Prev
                  </button>
                  <span style={{ fontSize: 14 }}>Halaman {tablePage} dari {tableTotalPages}</span>
                  <button
                    type="button"
                    disabled={tablePage >= tableTotalPages}
                    onClick={() => setTablePage((p) => p + 1)}
                    style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border_color)", cursor: tablePage >= tableTotalPages ? "not-allowed" : "pointer" }}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}

      <p style={{ marginTop: 24 }}>
        <Link href="/pu/laporan" style={{ color: "var(--accent)" }}>← Kembali ke Laporan PPAT</Link>
      </p>
    </div>
  );
}
