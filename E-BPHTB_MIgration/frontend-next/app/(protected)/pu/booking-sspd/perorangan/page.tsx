"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

const LIMIT = 10;
const JENIS_WP = "Perorangan";

type BookingRow = {
  nobooking: string;
  noppbb: string;
  tahunajb: string;
  namawajibpajak: string;
  namapemilikobjekpajak: string;
  npwpwp: string;
  trackstatus: string;
  jenis_wajib_pajak?: string;
};

type ApiResponse = {
  success: boolean;
  message?: string;
  data?: BookingRow[];
  pagination?: { page: number; limit: number; total: number; pages: number };
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
};
const btnTambah = { ...btnStyle, background: "var(--accent)", color: "#fff" };
const btnSecondary = { ...btnStyle, background: "var(--card_bg_grey)", color: "var(--color_font_main)" };
const btnKirim = { ...btnStyle, background: "#059669", color: "#fff" };
const btnKirimDisabled = { ...btnStyle, background: "#9ca3af", color: "#fff", cursor: "not-allowed", opacity: 0.7 };

type ModalType = "signature" | "documents" | "delete" | null;

export default function BookingSSPDPeroranganPage() {
  const [data, setData] = useState<BookingRow[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [formVisible, setFormVisible] = useState(false);
  const [modal, setModal] = useState<ModalType>(null);
  const [modalNobooking, setModalNobooking] = useState("");
  const [documents, setDocuments] = useState<{ url?: string; name?: string }[]>([]);
  const [docsLoading, setDocsLoading] = useState(false);
  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const loadTable = useCallback(async (p: number) => {
    setLoading(true);
    setError(null);
    try {
      const url = `/api/ppat/load-all-booking?page=${p}&limit=${LIMIT}&jenis_wajib_pajak=${encodeURIComponent(JENIS_WP)}`;
      const res = await fetch(url, { credentials: "include" });
      const json = (await res.json()) as ApiResponse;
      if (!res.ok || !json.success) {
        setError(json?.message || "Gagal memuat data");
        setData([]);
        return;
      }
      const rows = Array.isArray(json.data) ? json.data.filter((r) => (r.jenis_wajib_pajak || "").trim() === JENIS_WP) : [];
      setData(rows);
      setTotalPages(json.pagination?.pages ?? 1);
    } catch {
      setError("Gagal memuat data");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTable(page);
  }, [page, loadTable]);

  const status = (s: string) => (s || "").toLowerCase();
  const canSend = (row: BookingRow) => status(row.trackstatus) === "draft";

  const openModal = (type: ModalType) => {
    setModal(type);
    setModalNobooking(expandedRow || data[0]?.nobooking || "");
    setActionMessage(null);
    if (type === "documents" && (expandedRow || data[0]?.nobooking)) {
      const nb = expandedRow || data[0]?.nobooking || "";
      setModalNobooking(nb);
      setDocsLoading(true);
      fetch(`/api/ppat/get-documents?nobooking=${encodeURIComponent(nb)}`, { credentials: "include" })
        .then((r) => r.json())
        .then((j) => { if (j?.documents) setDocuments(j.documents); else if (Array.isArray(j)) setDocuments(j); else setDocuments([]); })
        .catch(() => setDocuments([]))
        .finally(() => setDocsLoading(false));
    }
    if (type === "signature") setSignatureFile(null);
  };
  const handleUploadSignature = async () => {
    if (!modalNobooking || !signatureFile) { setActionMessage("Pilih booking dan file tanda tangan."); return; }
    setUploading(true); setActionMessage(null);
    try {
      const fd = new FormData(); fd.append("nobooking", modalNobooking); fd.append("signature1", signatureFile);
      const res = await fetch("/api/ppat/upload-signatures", { method: "POST", credentials: "include", body: fd });
      const j = await res.json().catch(() => ({}));
      if (j?.success) { setActionMessage("Tanda tangan berhasil diunggah."); setModal(null); loadTable(page); } else { setActionMessage(j?.message || "Gagal mengunggah."); }
    } catch { setActionMessage("Gagal mengunggah."); } finally { setUploading(false); }
  };
  const handleHapusData = async () => {
    const nb = expandedRow || modalNobooking;
    if (!nb) { setActionMessage("Pilih baris booking yang akan dihapus."); return; }
    setUploading(true); setActionMessage(null);
    try {
      const res = await fetch(`/api/ppat/update-trackstatus/${encodeURIComponent(nb)}`, { method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ trackstatus: "Dihapus" }) });
      const j = await res.json().catch(() => ({}));
      if (j?.success) { setActionMessage("Data ditandai dihapus."); setModal(null); setExpandedRow(null); loadTable(page); } else { setActionMessage(j?.message || "Gagal menghapus."); }
    } catch { setActionMessage("Gagal menghapus."); } finally { setUploading(false); }
  };
  const modalOverlayStyle: React.CSSProperties = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 };
  const modalBoxStyle: React.CSSProperties = { background: "var(--card_bg)", borderRadius: 12, padding: 24, maxWidth: 480, width: "90%", maxHeight: "90vh", overflow: "auto" };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>
      <h1 style={{ margin: "0 0 0.5rem", color: "var(--color_font_main)" }}>Booking SSPD Perorangan</h1>
      <p style={{ margin: 0, color: "var(--color_font_muted)", fontSize: "0.9rem", marginBottom: 20 }}>
        Kelola booking SSPD untuk wajib pajak perorangan. Tambah data, upload tanda tangan, lihat dokumen, atau kirim ke Bappenda.
      </p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 20 }}>
        <button type="button" style={btnTambah} onClick={() => setFormVisible((v) => !v)}>+ Tambah Data</button>
        <button type="button" style={btnSecondary} onClick={() => openModal("signature")}>Tambah Tanda Tangan</button>
        <button type="button" style={btnSecondary} onClick={() => openModal("documents")}>Lihat Dokumen</button>
        <button type="button" style={btnSecondary} onClick={() => openModal("delete")}>Hapus Data</button>
      </div>
      {modal === "signature" && (
        <div style={modalOverlayStyle} onClick={() => !uploading && setModal(null)}>
          <div style={modalBoxStyle} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: "0 0 16px" }}>Upload Tanda Tangan</h3>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", marginBottom: 4, fontWeight: 600 }}>No. Booking</label>
              <select style={{ width: "100%", padding: 8, borderRadius: 8 }} value={modalNobooking} onChange={(e) => setModalNobooking(e.target.value)}>
                {data.map((r) => <option key={r.nobooking} value={r.nobooking}>{r.nobooking}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", marginBottom: 4, fontWeight: 600 }}>File Tanda Tangan (gambar)</label>
              <input type="file" accept="image/*" onChange={(e) => setSignatureFile(e.target.files?.[0] || null)} />
            </div>
            {actionMessage && <p style={{ color: "#b91c1c", marginBottom: 8 }}>{actionMessage}</p>}
            <div style={{ display: "flex", gap: 8 }}>
              <button type="button" style={btnTambah} disabled={uploading} onClick={handleUploadSignature}>{uploading ? "Mengunggah..." : "Upload"}</button>
              <button type="button" style={btnSecondary} onClick={() => setModal(null)}>Batal</button>
            </div>
          </div>
        </div>
      )}
      {modal === "documents" && (
        <div style={modalOverlayStyle} onClick={() => setModal(null)}>
          <div style={modalBoxStyle} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: "0 0 16px" }}>Lihat Dokumen</h3>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", marginBottom: 4, fontWeight: 600 }}>No. Booking</label>
              <select style={{ width: "100%", padding: 8, borderRadius: 8 }} value={modalNobooking} onChange={(e) => {
                setModalNobooking(e.target.value);
                setDocsLoading(true);
                fetch(`/api/ppat/get-documents?nobooking=${encodeURIComponent(e.target.value)}`, { credentials: "include" })
                  .then((r) => r.json())
                  .then((j) => { if (j?.documents) setDocuments(j.documents); else if (Array.isArray(j)) setDocuments(j); else setDocuments([]); })
                  .catch(() => setDocuments([]))
                  .finally(() => setDocsLoading(false));
              }}>
                {data.map((r) => <option key={r.nobooking} value={r.nobooking}>{r.nobooking}</option>)}
              </select>
            </div>
            {docsLoading ? <p>Memuat dokumen...</p> : documents.length === 0 ? <p style={{ color: "var(--color_font_muted)" }}>Tidak ada dokumen.</p> : (
              <ul style={{ margin: 0, paddingLeft: 20 }}>{documents.map((d, i) => (
                <li key={i}>{d.url ? <a href={d.url.startsWith("http") ? d.url : `/api/ppat/file-proxy?relativePath=${encodeURIComponent(d.url)}`} target="_blank" rel="noopener noreferrer">{d.name || d.url}</a> : String(d.name || d)}</li>
              ))}</ul>
            )}
            <button type="button" style={{ ...btnSecondary, marginTop: 16 }} onClick={() => setModal(null)}>Tutup</button>
          </div>
        </div>
      )}
      {modal === "delete" && (
        <div style={modalOverlayStyle} onClick={() => !uploading && setModal(null)}>
          <div style={modalBoxStyle} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: "0 0 16px" }}>Hapus Data</h3>
            <p style={{ marginBottom: 12 }}>Booking yang dipilih akan ditandai status &quot;Dihapus&quot;.</p>
            <select style={{ width: "100%", padding: 8, marginBottom: 12 }} value={modalNobooking} onChange={(e) => setModalNobooking(e.target.value)}>
              {data.map((r) => <option key={r.nobooking} value={r.nobooking}>{r.nobooking} — {r.namawajibpajak}</option>)}
            </select>
            {actionMessage && <p style={{ color: actionMessage.includes("Gagal") ? "#b91c1c" : "#166534", marginBottom: 8 }}>{actionMessage}</p>}
            <div style={{ display: "flex", gap: 8 }}>
              <button type="button" style={{ ...btnStyle, background: "#dc2626", color: "#fff" }} disabled={uploading} onClick={handleHapusData}>{uploading ? "Memproses..." : "Ya, Tandai Dihapus"}</button>
              <button type="button" style={btnSecondary} onClick={() => setModal(null)}>Batal</button>
            </div>
          </div>
        </div>
      )}

      {formVisible && (
        <div style={{ marginBottom: 24, padding: 20, background: "var(--card_bg)", border: "1px solid var(--border_color)", borderRadius: 12 }}>
          <p style={{ margin: "0 0 12px", fontSize: 14, color: "var(--color_font_muted)" }}>
            Form tambah booking perorangan — paritas dengan legacy. Submit ke <code>/api/ppat_create-booking-and-bphtb-perorangan</code> atau <code>/api/ppat/create-booking-perorangan</code>.
          </p>
          <Link href="/pu/booking-sspd/perorangan/tambah" style={{ color: "var(--accent)", fontWeight: 600 }}>
            Buka halaman form lengkap Tambah Booking Perorangan →
          </Link>
        </div>
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
              <th style={thStyle}>Track Status</th>
              <th style={thStyle}>Kirim</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} style={{ ...tdStyle, textAlign: "center", padding: 32 }}>
                  Memuat...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ ...tdStyle, textAlign: "center", color: "var(--color_font_muted)" }}>
                  Tidak ada data booking perorangan
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <>
                  <tr
                    key={row.nobooking}
                    style={{ cursor: "pointer" }}
                    onClick={() => setExpandedRow((x) => (x === row.nobooking ? null : row.nobooking))}
                  >
                    <td style={tdStyle}>{row.nobooking}</td>
                    <td style={tdStyle}>{row.noppbb || "—"}</td>
                    <td style={tdStyle}>{row.tahunajb || "—"}</td>
                    <td style={tdStyle}>{row.namawajibpajak || "—"}</td>
                    <td style={tdStyle}>{row.namapemilikobjekpajak || "—"}</td>
                    <td style={tdStyle}>{row.npwpwp || "—"}</td>
                    <td style={tdStyle}>{row.trackstatus || "—"}</td>
                    <td style={tdStyle}>
                      <button
                        type="button"
                        style={canSend(row) ? btnKirim : btnKirimDisabled}
                        disabled={!canSend(row)}
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (!canSend(row)) return;
                          try {
                            const res = await fetch(
                              `/api/ppat/send-now?nobooking=${encodeURIComponent(row.nobooking)}`,
                              { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ nobooking: row.nobooking }) }
                            );
                            const j = await res.json().catch(() => ({}));
                            if (j?.success) loadTable(page);
                          } catch (_) {}
                        }}
                      >
                        {status(row.trackstatus) === "diolah" ? "Sedang Diolah" : status(row.trackstatus) === "pending" ? "Menunggu Kirim" : "Kirim ke Bappenda"}
                      </button>
                    </td>
                  </tr>
                  {expandedRow === row.nobooking && (
                    <tr key={`${row.nobooking}-detail`}>
                      <td colSpan={8} style={{ ...tdStyle, background: "var(--card_bg_grey)", padding: 16 }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          <strong>Detail No. Booking: {row.nobooking}</strong>
                          <div>
                            <Link
                              href={`/pu/permohonan-validasi/${encodeURIComponent(row.nobooking)}`}
                              style={{ color: "var(--accent)", fontWeight: 600 }}
                            >
                              Isi Form Permohonan Validasi →
                            </Link>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, marginTop: 20 }}>
          <button
            type="button"
            style={btnSecondary}
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
            style={btnSecondary}
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Selanjutnya
          </button>
        </div>
      )}
    </div>
  );
}
