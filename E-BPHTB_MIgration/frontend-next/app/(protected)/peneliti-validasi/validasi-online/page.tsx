"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface DocItem {
  no_validasi?: string;
  no_registrasi?: string;
  nobooking?: string;
  tahunajb?: string;
  status_tertampil?: string;
  namapembuat?: string;
  namawajibpajak?: string;
  namapemilikobjekpajak?: string;
  keterangan?: string;
  akta_tanah_path?: string;
  sertifikat_tanah_path?: string;
  pelengkap_path?: string;
  [key: string]: unknown;
}

function toHref(p: string): string {
  if (!p) return "";
  return p.startsWith("/") ? p : "/" + p;
}

function transformRow(r: DocItem): DocItem & { status_display: string; pembuat_gelar: string } {
  const raw = String(r.status_tertampil ?? "").trim();
  let status_display = "Menunggu";
  if (/^sudah\s*divalidasi$/i.test(raw)) status_display = "Sudah Divalidasi";
  else if (/^ditolak$/i.test(raw)) status_display = "Ditolak";
  else if (/^menunggu$/i.test(raw)) status_display = "Menunggu";
  const pembuat_gelar = r.namapembuat ?? "-";
  return { ...r, status_display, pembuat_gelar };
}

const PAGE_SIZE = 10;

export default function PenelitiValidasiValidasiOnlinePage() {
  const [docs, setDocs] = useState<(DocItem & { status_display?: string; pembuat_gelar?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNv, setSelectedNv] = useState<string | null>(null);
  const [selectedNb, setSelectedNb] = useState<string | null>(null);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [userMsg, setUserMsg] = useState("");
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [approveLoading, setApproveLoading] = useState(false);
  const [rejectLoading, setRejectLoading] = useState(false);
  const [lastVerifiedNv, setLastVerifiedNv] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const fetchDocs = useCallback(async () => {
    try {
      const res = await fetch("/api/paraf/get-berkas-pending", { credentials: "include" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError((json as { message?: string }).message || "Gagal memuat");
        setDocs([]);
        return;
      }
      const list = (json as { data?: DocItem[] }).data ?? (json as { documents?: DocItem[] }).documents ?? [];
      const arr = Array.isArray(list) ? list.map(transformRow) : [];
      setDocs(arr);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat");
      setDocs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocs();
  }, [fetchDocs]);

  async function callPV(url: string, opts?: { method?: string; body?: unknown }) {
    const res = await fetch(url, {
      method: opts?.method ?? "GET",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      ...(opts?.body != null ? { body: JSON.stringify(opts.body) } : {}),
    });
    const js = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error((js as { message?: string }).message || `HTTP ${res.status}`);
    return js;
  }

  async function handleVerify() {
    if (!selectedNv) {
      setUserMsg("Pilih dokumen dari tabel dulu.");
      return;
    }
    setVerifyLoading(true);
    setUserMsg("");
    try {
      try {
        await callPV(`/api/validasi/${encodeURIComponent(selectedNv)}/claim`);
      } catch {
        /* idempotent */
      }
      await callPV(`/api/validasi/${encodeURIComponent(selectedNv)}/prepare-document`);
      await callPV(`/api/validasi/${encodeURIComponent(selectedNv)}/verify`);
      setLastVerifiedNv(selectedNv);
      setUserMsg("Verifikasi berhasil.");
      await fetchDocs();
    } catch (e) {
      setUserMsg("Gagal verifikasi: " + (e instanceof Error ? e.message : String(e)));
    } finally {
      setVerifyLoading(false);
    }
  }

  async function handleApprove() {
    if (!selectedNv) {
      setUserMsg("Pilih dokumen terlebih dahulu.");
      return;
    }
    if (!confirm("Setujui dokumen ini?")) return;
    setApproveLoading(true);
    setUserMsg("");
    try {
      const js = await callPV(`/api/validasi/${encodeURIComponent(selectedNv)}/decision`, {
        method: "POST",
        body: { decision: "approve" },
      });
      if (js.success) {
        setUserMsg(js.message || "Dokumen disetujui.");
        if (js.lsb_result?.success) {
          setUserMsg(`Dokumen disetujui dan dikirim ke LSB. No. Booking: ${js.nobooking ?? selectedNb}`);
        }
        await fetchDocs();
        setSelectedNv(null);
        setSelectedNb(null);
      } else {
        setUserMsg("Gagal: " + (js.message || "Unknown"));
      }
    } catch (e) {
      setUserMsg("Gagal: " + (e instanceof Error ? e.message : String(e)));
    } finally {
      setApproveLoading(false);
    }
  }

  async function handleReject() {
    if (!selectedNv) return;
    const reason = prompt("Alasan penolakan? (wajib)");
    if (!reason) return;
    setRejectLoading(true);
    setUserMsg("");
    try {
      const js = await callPV("/api/pv/reject-with-auto-delete", {
        method: "POST",
        body: { nobooking: selectedNb || selectedNv, rejectionReason: reason, userid: "current_user" },
      });
      if (js.success) {
        setUserMsg("Dokumen ditolak.");
        await fetchDocs();
        setSelectedNv(null);
        setSelectedNb(null);
      } else {
        setUserMsg("Gagal: " + (js.message || "Unknown"));
      }
    } catch (e) {
      setUserMsg("Gagal: " + (e instanceof Error ? e.message : String(e)));
    } finally {
      setRejectLoading(false);
    }
  }

  const totalPages = Math.max(1, Math.ceil(docs.length / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const pageDocs = docs.slice(start, start + PAGE_SIZE);

  const gothicTable = {
    background: "#0b0f1a",
    color: "#e5e7eb",
    borderCollapse: "separate" as const,
    borderSpacing: 0,
    borderRadius: 14,
    overflow: "hidden",
    boxShadow: "0 10px 30px rgba(0,0,0,.35)",
  };
  const thStyle = {
    background: "linear-gradient(180deg, #111827 0%, #0b0f1a 100%)",
    color: "#f3f4f6",
    borderBottom: "1px solid #374151",
    padding: "12px 14px",
    textAlign: "center" as const,
  };
  const tdStyle = {
    border: "1px solid #1f2937",
    padding: "10px 12px",
  };
  return (
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <Link
          href="/peneliti-validasi/sertifikat-digital"
          style={{
            padding: "10px 20px",
            background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
            color: "white",
            borderRadius: 8,
            fontWeight: 600,
            fontSize: 14,
            textDecoration: "none",
          }}
        >
          Sertifikat Digital
        </Link>
      </div>

      <section style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
      }}>
        <h3 style={{ margin: "0 0 16px 0", fontSize: 18, fontWeight: 700, color: "#1f2937" }}>
          Proses Validasi (PV) - Dokumen Status &quot;Menunggu&quot;
        </h3>
        <div style={{
          padding: "12px 16px",
          background: "#EFF6FF",
          border: "1px solid #93C5FD",
          borderRadius: 8,
          color: "#1E40AF",
          marginBottom: 16,
          fontSize: 14,
          lineHeight: 1.6,
        }}>
          Dokumen dengan status &quot;Menunggu&quot; untuk divalidasi. Yang sudah &quot;Sudah Divalidasi&quot; atau &quot;Ditolak&quot; ada di{" "}
          <Link href="/peneliti-validasi/monitoring-verifikasi" style={{ color: "#1E40AF", fontWeight: 600 }}>Monitoring Verifikasi</Link>.
        </div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", marginBottom: 12 }}>
          <label style={{ minWidth: 100, fontWeight: 600, color: "#374151" }}>No. Validasi</label>
          <input
            type="text"
            readOnly
            value={selectedNv ?? ""}
            placeholder="Klik baris tabel untuk memilih"
            style={{ flex: 1, minWidth: 200, padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: 8 }}
          />
        </div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", marginBottom: 16 }}>
          <label style={{ minWidth: 100, fontWeight: 600, color: "#374151" }}>No. Booking</label>
          <input
            type="text"
            readOnly
            value={selectedNb ?? ""}
            placeholder="Otomatis terisi saat memilih baris"
            style={{ flex: 1, minWidth: 200, padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: 8 }}
          />
        </div>
        <div style={{ marginTop: 20, padding: 15, background: "rgba(30,41,59,0.8)", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)" }}>
          <h4 style={{ margin: "0 0 15px 0", color: "#fff", fontSize: 14 }}>Aksi Validasi:</h4>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={handleVerify}
              disabled={!selectedNv || verifyLoading}
              style={{
                padding: "12px 24px",
                border: "none",
                borderRadius: 8,
                fontWeight: 600,
                fontSize: 14,
                cursor: selectedNv && !verifyLoading ? "pointer" : "not-allowed",
                background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                color: "white",
                opacity: selectedNv && !verifyLoading ? 1 : 0.5,
              }}
            >
              {verifyLoading ? "..." : "🔍 Verify"}
            </button>
            <button
              type="button"
              onClick={handleApprove}
              disabled={!selectedNv || lastVerifiedNv !== selectedNv || approveLoading}
              style={{
                padding: "12px 24px",
                border: "none",
                borderRadius: 8,
                fontWeight: 600,
                fontSize: 14,
                cursor: selectedNv && lastVerifiedNv === selectedNv && !approveLoading ? "pointer" : "not-allowed",
                background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                color: "white",
                opacity: selectedNv && lastVerifiedNv === selectedNv && !approveLoading ? 1 : 0.5,
              }}
            >
              {approveLoading ? "..." : "✅ Setujui & Kirim ke LSB"}
            </button>
            <button
              type="button"
              onClick={handleReject}
              disabled={!selectedNv || rejectLoading}
              style={{
                padding: "12px 24px",
                border: "none",
                borderRadius: 8,
                fontWeight: 600,
                fontSize: 14,
                cursor: selectedNv && !rejectLoading ? "pointer" : "not-allowed",
                background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                color: "white",
                opacity: selectedNv && !rejectLoading ? 1 : 0.5,
              }}
            >
              {rejectLoading ? "..." : "❌ Tolak"}
            </button>
          </div>
          <div style={{ marginTop: 10, fontSize: 12, color: "#94a3b8" }}>
            {selectedNv ? `Dokumen terpilih: ${selectedNv}` : "Pilih dokumen dari tabel untuk mengaktifkan tombol."}
          </div>
        </div>
        {userMsg && <div style={{ marginTop: 12, padding: 10, background: "#f0fdf4", border: "1px solid #a7f3d0", borderRadius: 8, color: "#065f46" }}>{userMsg}</div>}
      </section>

      <div style={{ maxWidth: "100%", overflowX: "auto", marginBottom: 12 }}>
        {loading ? (
          <p>Memuat...</p>
        ) : error ? (
          <p style={{ color: "#ef4444" }}>{error}</p>
        ) : docs.length === 0 ? (
          <p style={{ color: "var(--color_font_main_muted)" }}>Tidak ada data &quot;Menunggu&quot; saat ini.</p>
        ) : (
          <table style={gothicTable}>
            <thead>
              <tr>
                <th style={thStyle}>No. Validasi</th>
                <th style={thStyle}>No. Registrasi</th>
                <th style={thStyle}>No. Booking</th>
                <th style={thStyle}>Tahun AJB</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Pembuat Booking</th>
              </tr>
            </thead>
            <tbody>
              {pageDocs.map((d) => {
                const nv = d.no_validasi ?? "";
                const nb = d.nobooking ?? "";
                const isSelected = selectedNv === nv;
                const isExpanded = expandedRow === nv;
                return (
                  <React.Fragment key={nv || nb || "row"}>
                    <tr
                      onClick={() => {
                        setSelectedNv(nv);
                        setSelectedNb(nb);
                        setExpandedRow(isExpanded ? null : nv);
                      }}
                      style={{
                        background: isSelected ? "linear-gradient(135deg, #1e3a5f 0%, #1e293b 100%)" : undefined,
                        border: isSelected ? "2px solid #3b82f6" : "1px solid #1f2937",
                        cursor: "pointer",
                      }}
                    >
                      <td style={tdStyle}>{nv || "-"}</td>
                      <td style={tdStyle}>{d.no_registrasi ?? "-"}</td>
                      <td style={tdStyle}>{nb || "-"}</td>
                      <td style={tdStyle}>{d.tahunajb ?? "-"}</td>
                      <td style={tdStyle}>
                        <span style={{
                          display: "inline-flex",
                          padding: "4px 10px",
                          borderRadius: 999,
                          fontWeight: 600,
                          background: d.status_display === "Sudah Divalidasi" ? "#ECFDF5" : d.status_display === "Ditolak" ? "#FEF2F2" : "#FEF9C3",
                          color: d.status_display === "Sudah Divalidasi" ? "#065F46" : d.status_display === "Ditolak" ? "#991B1B" : "#854D0E",
                        }}>
                          {d.status_display ?? "Menunggu"}
                        </span>
                      </td>
                      <td style={tdStyle}>{d.pembuat_gelar ?? d.namapembuat ?? "-"}</td>
                    </tr>
                    {isExpanded && (
                      <tr style={{ background: "#0e1422", border: "1px solid #1f2937" }}>
                        <td colSpan={6} style={{ padding: 16, border: "1px solid #1f2937" }}>
                          <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 16, color: "#d1d5db" }}>
                            <div style={{ background: "#0b0f1a", border: "1px solid #1f2937", borderRadius: 10, padding: 14 }}>
                              <p style={{ margin: "6px 0" }}><strong style={{ color: "#e5e7eb" }}>No. Booking:</strong> {nb || "N/A"}</p>
                              <p style={{ margin: "6px 0" }}><strong style={{ color: "#e5e7eb" }}>Nama Wajib Pajak:</strong> {d.namawajibpajak ?? "N/A"}</p>
                              <p style={{ margin: "6px 0" }}><strong style={{ color: "#e5e7eb" }}>Nama Pemilik Objek Pajak:</strong> {d.namapemilikobjekpajak ?? "N/A"}</p>
                              {d.keterangan && <p style={{ margin: "6px 0" }}><strong style={{ color: "#e5e7eb" }}>Keterangan:</strong> {d.keterangan}</p>}
                            </div>
                            <div>
                              <div style={{ marginBottom: 8 }}>
                                <h5 style={{ color: "#e5e7eb", margin: "0 0 8px 0", fontWeight: 600, fontSize: 14 }}>Dokumen</h5>
                                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                  <a href={`/api/ppat/generate-pdf-mohon-validasi/${encodeURIComponent(nb)}`} target="_blank" rel="noopener noreferrer" style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #334155", background: "#1d4ed8", color: "#fff", textDecoration: "none", fontSize: 14 }}>Lihat Dokumen Permohonan</a>
                                  <a href={`/api/Validasi_lanjutan-generate-pdf-bookingsspd/${encodeURIComponent(nb)}`} target="_blank" rel="noopener noreferrer" style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #334155", background: "#1d4ed8", color: "#fff", textDecoration: "none", fontSize: 14 }}>Lihat Dokumen Booking</a>
                                </div>
                              </div>
                              <div style={{ background: "#0b0f1a", border: "1px solid #1f2937", borderRadius: 10, padding: 14 }}>
                                <h6 style={{ color: "#e5e7eb", margin: "0 0 8px 0", fontWeight: 600 }}>Dokumen Terkait</h6>
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
                                  {d.akta_tanah_path && (
                                    <a href={toHref(d.akta_tanah_path)} target="_blank" rel="noopener noreferrer" style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 8, padding: 10, color: "#93c5fd" }}>Akta Tanah</a>
                                  )}
                                  {d.sertifikat_tanah_path && (
                                    <a href={toHref(d.sertifikat_tanah_path)} target="_blank" rel="noopener noreferrer" style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 8, padding: 10, color: "#93c5fd" }}>Sertifikat Tanah</a>
                                  )}
                                  {d.pelengkap_path && (
                                    <a href={toHref(d.pelengkap_path)} target="_blank" rel="noopener noreferrer" style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 8, padding: 10, color: "#93c5fd" }}>Pelengkap</a>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {docs.length > PAGE_SIZE && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "12px 0" }}>
          <span style={{ color: "#9ca3af", fontSize: 14 }}>
            Halaman {page} dari {totalPages} ({docs.length} dokumen)
          </span>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              style={{ padding: "8px 12px", border: "1px solid #374151", borderRadius: 6, background: "#111827", color: "#e5e7eb", cursor: page <= 1 ? "not-allowed" : "pointer" }}
            >
              Sebelumnya
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              style={{ padding: "8px 12px", border: "1px solid #374151", borderRadius: 6, background: "#111827", color: "#e5e7eb", cursor: page >= totalPages ? "not-allowed" : "pointer" }}
            >
              Selanjutnya
            </button>
          </div>
        </div>
      )}

      <p style={{ marginTop: 24 }}>
        <Link href="/peneliti-validasi" style={{ color: "var(--accent)" }}>← Kembali ke Dashboard</Link>
      </p>
    </div>
  );
}
