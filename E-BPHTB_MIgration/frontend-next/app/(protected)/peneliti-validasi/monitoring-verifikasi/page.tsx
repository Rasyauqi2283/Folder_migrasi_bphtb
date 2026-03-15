"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { getApiBase } from "../../../../lib/api";

interface MonRow {
  no_validasi?: string | null;
  no_registrasi?: string | null;
  nobooking?: string | null;
  tahunajb?: string | null;
  status_tertampil?: string | null;
  namapembuat?: string | null;
  updated_at?: string | null;
  keterangan?: string | null;
  namawajibpajak?: string | null;
  namapemilikobjekpajak?: string | null;
  akta_tanah_path?: string | null;
  sertifikat_tanah_path?: string | null;
  pelengkap_path?: string | null;
  peneliti_tanda_tangan_path?: string | null;
}

function getStatusDisplay(s: string | null | undefined): string {
  if (!s) return "Menunggu";
  const t = String(s).trim();
  if (/^sudah\s*divalidasi$/i.test(t)) return "Sudah Divalidasi";
  if (/^ditolak$/i.test(t)) return "Ditolak";
  return "Menunggu";
}

const gothicTable = {
  table: {
    width: "100%" as const,
    borderCollapse: "separate" as const,
    borderSpacing: 0,
    background: "#0b0f1a",
    color: "#e5e7eb",
    border: "1px solid #1f2937",
    borderRadius: 14,
    overflow: "hidden",
    boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
  },
  th: {
    background: "linear-gradient(180deg, #111827 0%, #0b0f1a 100%)",
    color: "#f3f4f6",
    borderBottom: "1px solid #374151",
    padding: "12px 14px",
    textAlign: "center" as const,
    textTransform: "uppercase" as const,
    letterSpacing: "0.03em",
    fontSize: 12,
  },
  td: {
    border: "1px solid #1f2937",
    padding: "10px 12px",
    fontSize: 14,
  },
  trOdd: { background: "#0b0f1a" },
  trEven: { background: "#0e1422" },
  trHover: { background: "#111827" },
};

const badge = {
  success: { background: "#10B981", color: "#fff", padding: "4px 10px", borderRadius: 999, fontSize: 12, fontWeight: 600 },
  error: { background: "#EF4444", color: "#fff", padding: "4px 10px", borderRadius: 999, fontSize: 12, fontWeight: 600 },
  warning: { background: "#F59E0B", color: "#fff", padding: "4px 10px", borderRadius: 999, fontSize: 12, fontWeight: 600 },
};

export default function PenelitiValidasiMonitoringVerifikasiPage() {
  const [allData, setAllData] = useState<MonRow[]>([]);
  const [filteredData, setFilteredData] = useState<MonRow[]>([]);
  const [filter, setFilter] = useState<"all" | "approved" | "rejected">("all");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detailItem, setDetailItem] = useState<MonRow | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${getApiBase()}/api/paraf/get-monitoring-documents`, { credentials: "include" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError((json as { message?: string }).message || "Gagal memuat data");
        setAllData([]);
        return;
      }
      const list = (json as { data?: MonRow[] }).data ?? [];
      setAllData(Array.isArray(list) ? list : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat");
      setAllData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (filter === "all") {
      setFilteredData([...allData]);
    } else if (filter === "approved") {
      setFilteredData(allData.filter((r) => getStatusDisplay(r.status_tertampil) === "Sudah Divalidasi"));
    } else {
      setFilteredData(allData.filter((r) => getStatusDisplay(r.status_tertampil) === "Ditolak"));
    }
    setCurrentPage(1);
  }, [filter, allData]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
  const start = (currentPage - 1) * pageSize;
  const pageData = filteredData.slice(start, start + pageSize);

  const renderBadge = (status: string) => {
    const s = getStatusDisplay(status);
    if (s === "Sudah Divalidasi") return <span style={badge.success}>{s}</span>;
    if (s === "Ditolak") return <span style={badge.error}>{s}</span>;
    return <span style={badge.warning}>{s}</span>;
  };

  const viewPdf = (type: "validasi" | "verif-paraf", nobooking: string) => {
    const nb = encodeURIComponent(String(nobooking || ""));
    if (!nb) return;
    const base = getApiBase();
    const path = type === "validasi"
      ? `${base}/api/ppat/generate-pdf-validasi/${nb}`
      : `${base}/api/ppat/generate-pdf-verif-paraf/${nb}`;
    window.open(path, "_blank");
  };

  return (
    <div style={{ maxWidth: "100%", margin: "0 auto" }}>
      <h2 style={{ marginBottom: 20, fontSize: 24, fontWeight: 700 }}>Monitoring Verifikasi SSPD</h2>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
          gap: 20,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", gap: 8, background: "#111827", borderRadius: 8, padding: 4 }}>
          {(["all", "approved", "rejected"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: "8px 16px",
                border: "none",
                background: filter === f ? "#1d4ed8" : "transparent",
                color: filter === f ? "#fff" : "#9ca3af",
                borderRadius: 6,
                cursor: "pointer",
                fontWeight: 500,
              }}
            >
              {f === "all" ? "Semua" : f === "approved" ? "Sudah Divalidasi" : "Ditolak"}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#9ca3af", fontSize: 14 }}>
          <label style={{ fontWeight: 500 }}>Tampilkan:</label>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            style={{
              background: "#1f2937",
              border: "1px solid #374151",
              borderRadius: 6,
              color: "#e5e7eb",
              padding: "6px 10px",
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            {[5, 10, 25, 50, 100].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
          <span style={{ fontSize: 12, color: "#6b7280" }}>data per halaman</span>
        </div>
      </div>

      {loading ? (
        <p style={{ color: "var(--color_font_main_muted)" }}>Memuat...</p>
      ) : error ? (
        <p style={{ color: "#ef4444" }}>{error}</p>
      ) : (
        <div style={{ overflowX: "auto", borderRadius: 14, overflow: "hidden" }}>
          <table style={gothicTable.table}>
            <thead>
              <tr>
                <th style={gothicTable.th}>No. Validasi</th>
                <th style={gothicTable.th}>No. Registrasi</th>
                <th style={gothicTable.th}>No. Booking</th>
                <th style={gothicTable.th}>Tahun AJB</th>
                <th style={gothicTable.th}>Status</th>
                <th style={gothicTable.th}>Pembuat Booking</th>
                <th style={gothicTable.th}>Tanggal Update</th>
                <th style={gothicTable.th}>Keterangan</th>
                <th style={gothicTable.th}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {pageData.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ ...gothicTable.td, textAlign: "center", padding: 20 }}>
                    Tidak ada data yang ditemukan
                  </td>
                </tr>
              ) : (
                pageData.map((item, idx) => (
                  <tr
                    key={item.no_validasi ?? item.nobooking ?? idx}
                    style={{
                      ...(idx % 2 === 0 ? gothicTable.trOdd : gothicTable.trEven),
                    }}
                  >
                    <td style={gothicTable.td}>{item.no_validasi ?? "-"}</td>
                    <td style={gothicTable.td}>{item.no_registrasi ?? "-"}</td>
                    <td style={gothicTable.td}>{item.nobooking ?? "-"}</td>
                    <td style={gothicTable.td}>{item.tahunajb ?? "-"}</td>
                    <td style={gothicTable.td}>{renderBadge(item.status_tertampil ?? "")}</td>
                    <td style={gothicTable.td}>{item.namapembuat ?? "-"}</td>
                    <td style={gothicTable.td}>
                      {item.updated_at
                        ? new Date(item.updated_at).toLocaleString("id-ID")
                        : "-"}
                    </td>
                    <td style={gothicTable.td}>{item.keterangan ?? "-"}</td>
                    <td style={gothicTable.td}>
                      <button
                        type="button"
                        onClick={() => setDetailItem(item)}
                        style={{
                          padding: "6px 10px",
                          borderRadius: 6,
                          border: "1px solid #334155",
                          background: "#1d4ed8",
                          color: "#fff",
                          cursor: "pointer",
                          fontSize: 12,
                        }}
                      >
                        Lihat Detail
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {!loading && !error && filteredData.length > 0 && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 20,
            padding: "0 4px",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div style={{ color: "#9ca3af", fontSize: 14, fontWeight: 500 }}>
            Menampilkan {start + 1} sampai {Math.min(start + pageSize, filteredData.length)} dari {filteredData.length} data
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              style={{
                minWidth: 34,
                height: 34,
                borderRadius: 8,
                border: "1px solid #374151",
                background: currentPage <= 1 ? "#111827" : "#1f2937",
                color: "#e5e7eb",
                cursor: currentPage <= 1 ? "not-allowed" : "pointer",
                opacity: currentPage <= 1 ? 0.5 : 1,
              }}
            >
              ‹
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || (p >= currentPage - 2 && p <= currentPage + 2))
              .map((p, i, arr) => (
                <span key={p}>
                  {i > 0 && arr[i - 1] !== p - 1 && <span style={{ padding: "0 8px", color: "#9ca3af" }}>...</span>}
                  <button
                    type="button"
                    onClick={() => setCurrentPage(p)}
                    style={{
                      minWidth: 34,
                      height: 34,
                      borderRadius: 8,
                      border: "1px solid #374151",
                      background: currentPage === p ? "#1d4ed8" : "#1f2937",
                      color: "#fff",
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    {p}
                  </button>
                </span>
              ))}
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              style={{
                minWidth: 34,
                height: 34,
                borderRadius: 8,
                border: "1px solid #374151",
                background: currentPage >= totalPages ? "#111827" : "#1f2937",
                color: "#e5e7eb",
                cursor: currentPage >= totalPages ? "not-allowed" : "pointer",
                opacity: currentPage >= totalPages ? 0.5 : 1,
              }}
            >
              ›
            </button>
          </div>
        </div>
      )}

      {detailItem && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.8)",
            zIndex: 1000,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: 16,
          }}
          onClick={(e) => e.target === e.currentTarget && setDetailItem(null)}
        >
          <div
            style={{
              background: "#1f2937",
              color: "#e5e7eb",
              padding: 24,
              borderRadius: 12,
              maxWidth: 600,
              width: "100%",
              maxHeight: "80vh",
              overflowY: "auto",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ margin: 0, color: "#f3f4f6" }}>Detail Dokumen</h3>
              <button
                type="button"
                onClick={() => setDetailItem(null)}
                style={{
                  background: "#ef4444",
                  color: "white",
                  border: "none",
                  padding: "8px 12px",
                  borderRadius: 6,
                  cursor: "pointer",
                }}
              >
                Tutup
              </button>
            </div>
            <div style={{ display: "grid", gap: 12 }}>
              <div><strong>No. Validasi:</strong> {detailItem.no_validasi ?? "-"}</div>
              <div><strong>No. Registrasi:</strong> {detailItem.no_registrasi ?? "-"}</div>
              <div><strong>No. Booking:</strong> {detailItem.nobooking ?? "-"}</div>
              <div><strong>Nama Wajib Pajak:</strong> {detailItem.namawajibpajak ?? "-"}</div>
              <div><strong>Nama Pemilik Objek Pajak:</strong> {detailItem.namapemilikobjekpajak ?? "-"}</div>
              <div><strong>Status:</strong> {renderBadge(detailItem.status_tertampil ?? "")}</div>
              <div><strong>Pembuat:</strong> {detailItem.namapembuat ?? "-"}</div>
              <div><strong>Tanggal Update:</strong> {detailItem.updated_at ? new Date(detailItem.updated_at).toLocaleString("id-ID") : "-"}</div>
              {detailItem.keterangan && <div><strong>Keterangan:</strong> {detailItem.keterangan}</div>}
            </div>
            <div style={{ marginTop: 20, paddingTop: 15, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
              <h4 style={{ margin: "0 0 12px 0", color: "#93c5fd", fontSize: 14, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Dokumen Hasil (PDF):
              </h4>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={() => viewPdf("validasi", detailItem.nobooking ?? "")}
                  style={{
                    background: "linear-gradient(135deg, #10b981, #059669)",
                    border: "none",
                    padding: "8px 16px",
                    borderRadius: 6,
                    color: "#fff",
                    cursor: "pointer",
                    minWidth: 160,
                  }}
                >
                  Lihat PDF Validasi
                </button>
                <button
                  type="button"
                  onClick={() => viewPdf("verif-paraf", detailItem.nobooking ?? "")}
                  style={{
                    background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                    border: "none",
                    padding: "8px 16px",
                    borderRadius: 6,
                    color: "#fff",
                    cursor: "pointer",
                    minWidth: 160,
                  }}
                >
                  Lihat PDF Verif Paraf
                </button>
              </div>
            </div>
            {(detailItem.akta_tanah_path || detailItem.sertifikat_tanah_path || detailItem.pelengkap_path) && (
              <div style={{ marginTop: 16 }}>
                <h4 style={{ margin: "0 0 8px 0" }}>Dokumen Terkait:</h4>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {detailItem.akta_tanah_path && (
                    <a
                      href={detailItem.akta_tanah_path.startsWith("/") ? detailItem.akta_tanah_path : `/${detailItem.akta_tanah_path}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        padding: "6px 10px",
                        borderRadius: 6,
                        border: "1px solid #334155",
                        background: "#1d4ed8",
                        color: "#fff",
                        textDecoration: "none",
                        fontSize: 12,
                      }}
                    >
                      Akta Tanah
                    </a>
                  )}
                  {detailItem.sertifikat_tanah_path && (
                    <a
                      href={detailItem.sertifikat_tanah_path.startsWith("/") ? detailItem.sertifikat_tanah_path : `/${detailItem.sertifikat_tanah_path}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        padding: "6px 10px",
                        borderRadius: 6,
                        border: "1px solid #334155",
                        background: "#1d4ed8",
                        color: "#fff",
                        textDecoration: "none",
                        fontSize: 12,
                      }}
                    >
                      Sertifikat Tanah
                    </a>
                  )}
                  {detailItem.pelengkap_path && (
                    <a
                      href={detailItem.pelengkap_path.startsWith("/") ? detailItem.pelengkap_path : `/${detailItem.pelengkap_path}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        padding: "6px 10px",
                        borderRadius: 6,
                        border: "1px solid #334155",
                        background: "#1d4ed8",
                        color: "#fff",
                        textDecoration: "none",
                        fontSize: 12,
                      }}
                    >
                      Dokumen Pelengkap
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <p style={{ marginTop: 24 }}>
        <Link href="/peneliti-validasi" style={{ color: "var(--accent)" }}>
          ← Kembali ke Dashboard
        </Link>
      </p>
    </div>
  );
}
