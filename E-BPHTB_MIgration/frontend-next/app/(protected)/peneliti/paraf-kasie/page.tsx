"use client";

import { Fragment, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { getApiBase } from "../../../../lib/api";

interface ParafItem {
  nobooking?: string;
  no_registrasi?: string;
  noppbb?: string;
  namawajibpajak?: string;
  namapemilikobjekpajak?: string;
  userid?: string;
  tanda_paraf_path?: string;
  signer_userid?: string;
  pemverifikasi_nama?: string;
  tanggal_masuk?: string;
  locked_by_user_id?: string;
  locked_by_nama?: string;
  akta_tanah_path?: string;
  sertifikat_tanah_path?: string;
  pelengkap_path?: string;
  [key: string]: unknown;
}

interface ApiResponse {
  success: boolean;
  data?: ParafItem[];
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
const sectionCardStyle: React.CSSProperties = {
  border: "1px solid var(--border_color)",
  borderRadius: 10,
  padding: 12,
  background: "var(--card_bg)",
};

export default function PenelitiParafKasiePage() {
  const [data, setData] = useState<ParafItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [realTimeEnabled, setRealTimeEnabled] = useState(true);
  const [expandedBooking, setExpandedBooking] = useState<string | null>(null);
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [overlayData, setOverlayData] = useState<Record<string, unknown> | null>(null);
  const [myUserid, setMyUserid] = useState("");
  const [hasSignature, setHasSignature] = useState(true);

  const showVal = (v: unknown) => {
    const s = String(v ?? "").trim();
    return s === "" ? "-" : s;
  };
  const resolveFileUrl = (rawPath?: string) => {
    const p = String(rawPath ?? "").trim();
    if (!p) return "";
    if (/^https?:\/\//i.test(p)) return p;
    const normalized = p.startsWith("/") ? p : `/${p}`;
    return `${getApiBase()}${normalized}`;
  };
  const rowKey = (r: ParafItem) => `${String(r.nobooking ?? "")}::${String(r.no_registrasi ?? "")}`;
  const mergeIncremental = (existing: ParafItem[], incoming: ParafItem[]) => {
    const byKey = new Map(existing.map((r) => [rowKey(r), r]));
    for (const r of incoming) byKey.set(rowKey(r), { ...(byKey.get(rowKey(r)) ?? {}), ...r });
    return Array.from(byKey.values());
  };

  const load = useCallback(async (options?: { silent?: boolean; appendOnly?: boolean }) => {
    const silent = !!options?.silent;
    const appendOnly = !!options?.appendOnly;
    if (!silent) {
      setLoading(true);
      setError(null);
    }
    try {
      const res = await fetch(`${getApiBase()}/api/peneliti/get-berkas-till-verif`, { credentials: "include" });
      const json: ApiResponse = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((json as ApiResponse).message || `HTTP ${res.status}`);
      if (!(json as ApiResponse).success) throw new Error((json as ApiResponse).message || "Gagal memuat data");
      const arr: ParafItem[] = Array.isArray((json as ApiResponse).data) ? ((json as ApiResponse).data ?? []) : [];
      if (appendOnly) setData((prev) => mergeIncremental(prev, arr));
      else setData(arr);
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
    fetch(`${getApiBase()}/api/v1/auth/profile`, { credentials: "include" })
      .then((r) => r.json())
      .then((j) => {
        const uid = String(j?.user?.userid ?? "");
        const signPath = String(j?.user?.tanda_tangan_path ?? "");
        const signMime = String(j?.user?.tanda_tangan_mime ?? "");
        setMyUserid(uid);
        setHasSignature(!!signPath.trim() && !!signMime.trim());
      })
      .catch(() => setHasSignature(false));
  }, []);

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
          String(r.noppbb ?? "").toLowerCase().includes(search.toLowerCase()) ||
          String(r.namawajibpajak ?? "").toLowerCase().includes(search.toLowerCase())
      )
    : data;
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const slice = filtered.slice(start, start + PAGE_SIZE);

  const berikanParaf = async (nobooking: string) => {
    if (!hasSignature) {
      alert("Anda belum mendaftarkan tanda tangan/paraf di profil. Akses ditolak.");
      return;
    }
    setActionLoading(nobooking);
    try {
      const res = await fetch(`${getApiBase()}/api/peneliti/berikan-paraf-kasie`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nobooking }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((json as ApiResponse).message || "Gagal kirim");
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Gagal memberikan paraf");
    } finally {
      setActionLoading(null);
    }
  };
  const openCheckDataOverlay = (row: ParafItem) => {
    const cloned = { ...(row as Record<string, unknown>) };
    delete cloned.akta_tanah_path;
    delete cloned.sertifikat_tanah_path;
    delete cloned.pelengkap_path;
    setOverlayData(cloned);
    setOverlayOpen(true);
  };
  const openViewDocument = (nobooking: string) => {
    window.open(`${getApiBase()}/api/ppat_generate-pdf-badan/${encodeURIComponent(nobooking)}`, "_blank", "noopener,noreferrer");
  };
  const reject = async (nobooking: string) => {
    const confirmReject = window.confirm("Apakah Anda yakin menolak dokumen ini?");
    if (!confirmReject) return;
    const reason = prompt("Masukkan alasan penolakan (singkat):");
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
        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>Kasie Verifikasi SSPD</h2>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <input
            type="text"
            placeholder="Cari No. Registrasi, No. Booking, NOP, Nama..."
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
              <th style={thStyle}>NOP PBB</th>
              <th style={thStyle}>Nama Wajib Pajak</th>
              <th style={thStyle}>Nama Pemilik Objek</th>
              <th style={thStyle}>Pembuat Booking</th>
              <th style={thStyle}>Paraf</th>
              <th style={thStyle}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} style={{ ...tdStyle, textAlign: "center", padding: 40, color: "var(--color_font_muted)" }}>
                  Memuat data...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={8} style={{ ...tdStyle, textAlign: "center", padding: 40, color: "#ef4444" }}>
                  {error}
                </td>
              </tr>
            ) : slice.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ ...tdStyle, textAlign: "center", padding: 40, color: "var(--color_font_muted)" }}>
                  Tidak ada data berkas sampai verif.
                </td>
              </tr>
            ) : (
              slice.map((r, idx) => {
                const lockedBy = String(r.locked_by_user_id ?? "");
                const isLockedByOther = !!lockedBy && !!myUserid && lockedBy !== myUserid;
                return (
                  <Fragment key={r.nobooking ?? idx}>
                    <tr style={{ borderBottom: "1px solid var(--border_color)", cursor: "pointer", opacity: isLockedByOther ? 0.65 : 1 }} onClick={() => setExpandedBooking((p) => (p === r.nobooking ? null : String(r.nobooking ?? "")))}>
                      <td style={{ ...tdStyle, textAlign: "center" }}>{start + idx + 1}</td>
                      <td style={tdStyle}>{r.no_registrasi ?? "-"}</td>
                      <td style={tdStyle}>{r.noppbb ?? "-"}</td>
                      <td style={tdStyle}>{r.namawajibpajak ?? "-"}</td>
                      <td style={tdStyle}>{r.namapemilikobjekpajak ?? "-"}</td>
                      <td style={tdStyle}>{r.userid ?? "-"}</td>
                      <td style={tdStyle}>
                        {r.tanda_paraf_path || r.signer_userid ? <span style={{ color: "#10b981", fontWeight: 600 }}>Sudah</span> : <span style={{ color: "#f59e0b", fontWeight: 600 }}>Belum</span>}
                      </td>
                      <td style={{ ...tdStyle, textAlign: "center", color: "var(--color_font_muted)" }}>Buka detail</td>
                    </tr>
                    {expandedBooking === r.nobooking && (
                      <tr>
                        <td colSpan={8} style={{ ...tdStyle, background: "var(--card_bg_grey)" }}>
                          <div style={{ display: "grid", gap: 10 }}>
                            <div style={sectionCardStyle}>
                              <strong style={{ display: "block", marginBottom: 8 }}>Aksi Dokumen</strong>
                              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                <button
                                  type="button"
                                  disabled={!!actionLoading || isLockedByOther}
                                  onClick={() => berikanParaf(String(r.nobooking ?? ""))}
                                  style={{ padding: "8px 12px", borderRadius: 8, border: "none", background: "linear-gradient(135deg, #8b5cf6, #7c3aed)", color: "white", fontWeight: 600, cursor: actionLoading ? "not-allowed" : "pointer" }}
                                >
                                  {actionLoading === r.nobooking ? "..." : "Berikan Paraf"}
                                </button>
                                <button
                                  type="button"
                                  disabled={!!actionLoading || isLockedByOther}
                                  onClick={() => reject(String(r.nobooking ?? ""))}
                                  style={{ padding: "8px 12px", borderRadius: 8, border: "none", background: "linear-gradient(135deg, #ef4444, #dc2626)", color: "white", fontWeight: 600, cursor: actionLoading ? "not-allowed" : "pointer" }}
                                >
                                  Tolak
                                </button>
                                <button type="button" onClick={() => openViewDocument(String(r.nobooking ?? ""))} style={{ padding: "8px 12px", borderRadius: 8, border: "none", background: "linear-gradient(135deg, #2563eb, #1d4ed8)", color: "white", fontWeight: 600, cursor: "pointer" }}>
                                  View Document
                                </button>
                                <button type="button" onClick={() => openCheckDataOverlay(r)} style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border_color)", background: "var(--card_bg)", color: "var(--color_font_main)", fontWeight: 600, cursor: "pointer" }}>
                                  Check Data Ini
                                </button>
                              </div>
                              {isLockedByOther && <div style={{ fontSize: 12, color: "#b45309", marginTop: 8 }}>🔒 Sedang diperiksa oleh {showVal(r.locked_by_nama || r.locked_by_user_id)}</div>}
                            </div>

                            <div style={sectionCardStyle}>
                              <strong style={{ display: "block", marginBottom: 8 }}>Dokumen Pendukung</strong>
                              <div style={{ display: "grid", gap: 8 }}>
                                {[
                                  { label: "Akta Tanah", value: String(r.akta_tanah_path ?? "") },
                                  { label: "Sertifikat Tanah", value: String(r.sertifikat_tanah_path ?? "") },
                                  { label: "Pelengkap", value: String(r.pelengkap_path ?? "") },
                                ].map((doc) => {
                                  const hasFile = !!String(doc.value).trim();
                                  const url = resolveFileUrl(doc.value);
                                  return (
                                    <div key={doc.label} style={{ display: "grid", gridTemplateColumns: "180px 1fr auto", alignItems: "center", gap: 8 }}>
                                      <strong>{doc.label}</strong>
                                      <span style={{ color: "var(--color_font_muted)" }}>{showVal(doc.value)}</span>
                                      <button
                                        type="button"
                                        disabled={!hasFile}
                                        onClick={() => url && window.open(url, "_blank", "noopener,noreferrer")}
                                        style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid var(--border_color)", background: hasFile ? "var(--card_bg)" : "#eee", cursor: hasFile ? "pointer" : "not-allowed" }}
                                      >
                                        Lihat
                                      </button>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })
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
      {overlayOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 70 }} onClick={() => setOverlayOpen(false)}>
          <div style={{ background: "var(--card_bg)", width: "92%", maxWidth: 720, maxHeight: "86vh", overflow: "auto", borderRadius: 12, border: "1px solid var(--border_color)", padding: 18 }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginTop: 0, marginBottom: 10 }}>Check Data Ini</h3>
            {!overlayData ? (
              <p>Memuat data...</p>
            ) : (
              <div style={{ display: "grid", gap: 8 }}>
                {Object.entries(overlayData).map(([k, v]) => (
                  <div key={k} style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 8, fontSize: 14 }}>
                    <strong>{k}</strong>
                    <span>{v == null || String(v) === "" ? "-" : String(v)}</span>
                  </div>
                ))}
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}>
              <button type="button" onClick={() => setOverlayOpen(false)} style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border_color)", background: "var(--card_bg)", cursor: "pointer" }}>
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
