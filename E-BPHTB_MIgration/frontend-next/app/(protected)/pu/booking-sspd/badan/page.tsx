"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";

const LIMIT = 10;
const JENIS_WP = "Badan Usaha";

type BookingRow = {
  nobooking: string;
  noppbb: string;
  tahunajb: string;
  namawajibpajak: string;
  namapemilikobjekpajak: string;
  npwpwp: string;
  trackstatus: string;
  jenis_wajib_pajak?: string;
  akta_tanah_path?: string;
  sertifikat_tanah_path?: string;
  pelengkap_path?: string;
};

type ApiResponse = {
  success: boolean;
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
  color: "#1e293b",
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
const btnSecondary = { ...btnStyle, background: "var(--card_bg_grey)", color: "#0f172a" };
const btnKirim = { ...btnStyle, background: "#059669", color: "#fff" };
const btnKirimDisabled = { ...btnStyle, background: "#9ca3af", color: "#fff", cursor: "not-allowed", opacity: 0.7 };

type ModalType = "signature" | "documents" | "delete" | "kirim" | null;

export default function BookingSSPDBadanPage() {
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
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [quota, setQuota] = useState<{ used: number; limit: number; date: string } | null>(null);
  const [scheduleDate, setScheduleDate] = useState("");
  const [kirimSubmitting, setKirimSubmitting] = useState(false);
  const [docUploading, setDocUploading] = useState<string | null>(null);
  const [cekBookingDetail, setCekBookingDetail] = useState<{
    nobooking: string;
    nama_wajib_pajak?: string;
    Alamatop?: string;
    keterangan?: string;
    bphtb_yangtelah_dibayar?: number;
  } | null>(null);

  const setCekBookingNobooking = useCallback((nobooking: string) => {
    setCekBookingDetail(null);
    fetch(`/api/ppat/booking/${encodeURIComponent(nobooking)}`, { credentials: "include" })
      .then((res) => res.json())
      .then((j: { success?: boolean; data?: Record<string, unknown> }) => {
        if (j?.success && j?.data)
          setCekBookingDetail({ nobooking, ...j.data } as { nobooking: string; nama_wajib_pajak?: string; Alamatop?: string; keterangan?: string; bphtb_yangtelah_dibayar?: number });
      })
      .catch(() => setCekBookingDetail(null));
  }, []);

  const loadTable = useCallback(async (p: number, q?: string) => {
    setLoading(true);
    setError(null);
    try {
      const s = typeof q === "string" ? q : searchQuery;
      let url = `/api/ppat/load-all-booking?page=${p}&limit=${LIMIT}&jenis_wajib_pajak=${encodeURIComponent(JENIS_WP)}`;
      if (s.trim()) url += `&search=${encodeURIComponent(s.trim())}`;
      const res = await fetch(url, { credentials: "include" });
      const json = (await res.json()) as ApiResponse;
      if (!res.ok || !json.success) {
        setError((json as any)?.message || "Gagal memuat data");
        setData([]);
        return;
      }
      const rows = Array.isArray(json.data) ? json.data.filter((r) => (r.jenis_wajib_pajak || "").trim() === JENIS_WP) : [];
      setData(rows);
      setTotalPages(json.pagination?.pages ?? 1);
    } catch (e) {
      setError("Gagal memuat data");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    loadTable(page, searchQuery);
  }, [page, loadTable, searchQuery]);

  const status = (s: string) => (s || "").toLowerCase();
  const canSend = (row: BookingRow) => status(row.trackstatus) === "draft";

  const getFileUrl = (path: string) => {
    if (!path) return "";
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    const rel = path.replace(/^\/storage\/ppat\//, "");
    return `/api/ppat/file-proxy?relativePath=${encodeURIComponent(rel)}`;
  };
  const getFileName = (path: string) => (path ? path.split("/").pop()?.replace(/^v\d+_/, "") || "File" : "File");

  const openModalKirim = (row: BookingRow) => {
    setModal("kirim");
    setModalNobooking(row.nobooking);
    setScheduleDate("");
    setQuota(null);
    const pad = (n: number) => String(n).padStart(2, "0");
    const t = new Date();
    setScheduleDate(`${t.getFullYear()}-${pad(t.getMonth() + 1)}-${pad(t.getDate())}`);
    fetch(`/api/ppat/quota?date=${`${t.getFullYear()}-${pad(t.getMonth() + 1)}-${pad(t.getDate())}`}`, { credentials: "include" })
      .then((r) => r.json())
      .then((j) => {
        if (j?.success && j?.data) setQuota({ used: j.data.used ?? 0, limit: j.data.limit ?? 80, date: j.data.date ?? "" });
      })
      .catch(() => setQuota({ used: 0, limit: 80, date: "" }));
  };

  const handleKirimSekarang = async () => {
    const nb = modalNobooking;
    if (!nb) return;
    setKirimSubmitting(true);
    try {
      const day = new Date().getDay();
      if (day === 0 || day === 6) {
        setActionMessage("Pengiriman tidak tersedia pada hari libur.");
        return;
      }
      const res = await fetch(`/api/ppat/send-now?nobooking=${encodeURIComponent(nb)}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nobooking: nb }),
      });
      const j = await res.json().catch(() => ({}));
      if (j?.success) {
        setModal(null);
        loadTable(page, searchQuery);
      } else setActionMessage(j?.message || "Gagal mengirim.");
    } catch {
      setActionMessage("Gagal mengirim.");
    } finally {
      setKirimSubmitting(false);
    }
  };

  const handleUploadDoc = async (nobooking: string, field: "aktaTanah" | "sertifikatTanah" | "pelengkap", file: File) => {
    if (!file) return;
    setDocUploading(`${nobooking}-${field}`);
    try {
      const fd = new FormData();
      fd.append("nobooking", nobooking);
      fd.append(field, file);
      const res = await fetch("/api/ppat/upload-documents", { method: "POST", credentials: "include", body: fd });
      const j = await res.json().catch(() => ({}));
      if (j?.success) loadTable(page, searchQuery);
    } catch (_) {}
    finally { setDocUploading(null); }
  };

  const handleJadwalkanKirim = async () => {
    const nb = modalNobooking;
    if (!nb || !scheduleDate) {
      setActionMessage("Pilih tanggal terlebih dahulu.");
      return;
    }
    const d = new Date(scheduleDate);
    if (d.getDay() === 0 || d.getDay() === 6) {
      setActionMessage("Bappenda libur pada hari Sabtu & Minggu.");
      return;
    }
    setKirimSubmitting(true);
    try {
      const res = await fetch(`/api/ppat/schedule-send`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nobooking: nb, scheduled_for: scheduleDate }),
      });
      const j = await res.json().catch(() => ({}));
      if (j?.success) {
        setModal(null);
        loadTable(page, searchQuery);
      } else setActionMessage(j?.message || "Gagal menjadwalkan.");
    } catch {
      setActionMessage("Gagal menjadwalkan.");
    } finally {
      setKirimSubmitting(false);
    }
  };

  const openPdfBooking = () => {
    const nb = expandedRow || data[0]?.nobooking;
    if (nb) window.open(`/api/ppat_generate-pdf-badan/${encodeURIComponent(nb)}`, "_blank", "noopener,noreferrer");
    else openModal("documents");
  };

  const openModal = (type: ModalType) => {
    setModal(type);
    setModalNobooking(expandedRow || data[0]?.nobooking || "");
    setActionMessage(null);
    if (type === "documents") {
      setDocuments([]);
      if (expandedRow || data[0]?.nobooking) {
        const nb = expandedRow || data[0]?.nobooking || "";
        setModalNobooking(nb);
        setDocsLoading(true);
        fetch(`/api/ppat/get-documents?nobooking=${encodeURIComponent(nb)}`, { credentials: "include" })
          .then((r) => r.json())
          .then((j) => {
            if (j?.documents) setDocuments(j.documents);
            else if (Array.isArray(j)) setDocuments(j);
            else setDocuments([]);
          })
          .catch(() => setDocuments([]))
          .finally(() => setDocsLoading(false));
      }
    }
    if (type === "signature") setSignatureFile(null);
  };

  const handleUploadSignature = async () => {
    if (!modalNobooking || !signatureFile) {
      setActionMessage("Pilih booking dan file tanda tangan.");
      return;
    }
    setUploading(true);
    setActionMessage(null);
    try {
      const fd = new FormData();
      fd.append("nobooking", modalNobooking);
      fd.append("signature1", signatureFile);
      const res = await fetch("/api/ppat/upload-signatures", { method: "POST", credentials: "include", body: fd });
      const j = await res.json().catch(() => ({}));
      if (j?.success) {
        setActionMessage("Tanda tangan berhasil diunggah.");
        setModal(null);
        loadTable(page);
      } else {
        setActionMessage(j?.message || "Gagal mengunggah.");
      }
    } catch {
      setActionMessage("Gagal mengunggah.");
    } finally {
      setUploading(false);
    }
  };

  const handleHapusData = async () => {
    const nb = expandedRow || modalNobooking;
    if (!nb) {
      setActionMessage("Pilih baris booking yang akan dihapus.");
      return;
    }
    setUploading(true);
    setActionMessage(null);
    try {
      const res = await fetch(`/api/ppat/update-trackstatus/${encodeURIComponent(nb)}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trackstatus: "Dihapus" }),
      });
      const j = await res.json().catch(() => ({}));
      if (j?.success) {
        setActionMessage("Data ditandai dihapus.");
        setModal(null);
        setExpandedRow(null);
        loadTable(page);
      } else {
        setActionMessage(j?.message || "Gagal menghapus.");
      }
    } catch {
      setActionMessage("Gagal menghapus.");
    } finally {
      setUploading(false);
    }
  };

  const modalOverlayStyle: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  };
  const modalBoxStyle: React.CSSProperties = {
    background: "var(--card_bg)",
    borderRadius: 12,
    padding: 24,
    maxWidth: 480,
    width: "90%",
    maxHeight: "90vh",
    overflow: "auto",
  };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>
      <h1 style={{ margin: "0 0 0.5rem", color: "#0f172a" }}>Booking SSPD Badan</h1>
      <p style={{ margin: 0, color: "#475569", fontSize: "0.9rem", marginBottom: 20 }}>
        Kelola booking SSPD untuk wajib pajak badan usaha. Tambah data, upload tanda tangan, lihat dokumen, atau kirim ke Bappenda.
      </p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 20, alignItems: "center" }}>
        <button type="button" style={btnTambah} onClick={() => setFormVisible((v) => !v)}>
          + Tambah Data
        </button>
        <button type="button" style={btnSecondary} onClick={() => openModal("signature")}>
          Tambah Tanda Tangan
        </button>
        <button type="button" style={btnSecondary} onClick={() => (expandedRow || data[0]?.nobooking) ? openPdfBooking() : openModal("documents")}>
          Lihat Dokumen
        </button>
        <button type="button" style={btnSecondary} onClick={() => openModal("delete")}>
          Hapus Data
        </button>
      </div>

      {modal === "signature" && (
        <div style={modalOverlayStyle} onClick={() => !uploading && setModal(null)}>
          <div style={modalBoxStyle} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: "0 0 16px", color: "#0f172a" }}>Upload Tanda Tangan</h3>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", marginBottom: 4, fontWeight: 600, color: "#0f172a" }}>No. Booking</label>
              <select
                style={{ width: "100%", padding: 8, borderRadius: 8, color: "#0f172a", background: "#fff" }}
                value={modalNobooking}
                onChange={(e) => setModalNobooking(e.target.value)}
              >
                {data.map((r) => (
                  <option key={r.nobooking} value={r.nobooking}>{r.nobooking}</option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", marginBottom: 4, fontWeight: 600 }}>File Tanda Tangan (gambar)</label>
              <input type="file" accept="image/*" onChange={(e) => setSignatureFile(e.target.files?.[0] || null)} />
            </div>
            {actionMessage && <p style={{ color: "#b91c1c", marginBottom: 8 }}>{actionMessage}</p>}
            <div style={{ display: "flex", gap: 8 }}>
              <button type="button" style={btnTambah} disabled={uploading} onClick={handleUploadSignature}>
                {uploading ? "Mengunggah..." : "Upload"}
              </button>
              <button type="button" style={btnSecondary} onClick={() => setModal(null)}>Batal</button>
            </div>
          </div>
        </div>
      )}

      {modal === "documents" && (
        <div style={modalOverlayStyle} onClick={() => setModal(null)}>
          <div style={modalBoxStyle} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: "0 0 16px", color: "#0f172a" }}>Lihat Dokumen</h3>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", marginBottom: 4, fontWeight: 600, color: "#0f172a" }}>No. Booking</label>
              <select
                style={{ width: "100%", padding: 8, borderRadius: 8, color: "#0f172a", background: "#fff" }}
                value={modalNobooking}
                onChange={(e) => {
                  setModalNobooking(e.target.value);
                  setDocsLoading(true);
                  fetch(`/api/ppat/get-documents?nobooking=${encodeURIComponent(e.target.value)}`, { credentials: "include" })
                    .then((r) => r.json())
                    .then((j) => {
                      if (j?.documents) setDocuments(j.documents);
                      else if (Array.isArray(j)) setDocuments(j);
                      else setDocuments([]);
                    })
                    .catch(() => setDocuments([]))
                    .finally(() => setDocsLoading(false));
                }}
              >
                {data.map((r) => (
                  <option key={r.nobooking} value={r.nobooking}>{r.nobooking}</option>
                ))}
              </select>
            </div>
            {docsLoading ? <p style={{ color: "#1e293b" }}>Memuat dokumen...</p> : documents.length === 0 ? <p style={{ color: "#475569" }}>Tidak ada dokumen.</p> : (
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                {documents.map((d, i) => (
                  <li key={i}>
                    {d.url ? <a href={d.url.startsWith("http") ? d.url : `/api/ppat/file-proxy?relativePath=${encodeURIComponent(d.url)}`} target="_blank" rel="noopener noreferrer">{d.name || d.url}</a> : String(d.name || d)}
                  </li>
                ))}
              </ul>
            )}
            <button type="button" style={{ ...btnSecondary, marginTop: 16 }} onClick={() => setModal(null)}>Tutup</button>
          </div>
        </div>
      )}

      {modal === "kirim" && (
        <div style={modalOverlayStyle} onClick={() => !kirimSubmitting && setModal(null)}>
          <div style={{ ...modalBoxStyle, maxWidth: 420 }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: "0 0 16px" }}>Kirim ke Bappenda</h3>
            <p style={{ margin: "0 0 8px", fontSize: 14 }}>No. Booking: {modalNobooking}</p>
            {quota && (
              <p style={{ margin: "0 0 12px", fontSize: 14, color: "#1e293b" }}>Kuota hari ini: {quota.used}/{quota.limit}</p>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 12 }}>
              <button type="button" style={btnKirim} disabled={kirimSubmitting} onClick={handleKirimSekarang}>
                {kirimSubmitting ? "Memproses..." : "Kirim Sekarang"}
              </button>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <label style={{ fontSize: 14, color: "#0f172a" }}>Tanggal:</label>
                <input
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  min={new Date().toISOString().slice(0, 10)}
                  style={{ padding: "6px 10px", borderRadius: 6 }}
                />
              </div>
              <button type="button" style={btnSecondary} disabled={kirimSubmitting} onClick={handleJadwalkanKirim}>
                Jadwalkan Kirim
              </button>
            </div>
            {actionMessage && <p style={{ color: actionMessage.includes("Gagal") ? "#b91c1c" : "#166534", marginBottom: 8, fontSize: 13 }}>{actionMessage}</p>}
            <button type="button" style={btnSecondary} onClick={() => setModal(null)}>Batal</button>
          </div>
        </div>
      )}

      {modal === "delete" && (
        <div style={modalOverlayStyle} onClick={() => !uploading && setModal(null)}>
          <div style={modalBoxStyle} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: "0 0 16px", color: "#0f172a" }}>Hapus Data</h3>
            <p style={{ marginBottom: 12, color: "#1e293b" }}>Booking yang dipilih akan ditandai status &quot;Dihapus&quot;. Pilih No. Booking:</p>
            <select
              style={{ width: "100%", padding: 8, marginBottom: 12, color: "#0f172a", background: "#fff" }}
              value={modalNobooking}
              onChange={(e) => setModalNobooking(e.target.value)}
            >
              {data.map((r) => (
                <option key={r.nobooking} value={r.nobooking}>{r.nobooking} — {r.namawajibpajak}</option>
              ))}
            </select>
            {actionMessage && <p style={{ color: actionMessage.includes("Gagal") ? "#b91c1c" : "#166534", marginBottom: 8 }}>{actionMessage}</p>}
            <div style={{ display: "flex", gap: 8 }}>
              <button type="button" style={{ ...btnStyle, background: "#dc2626", color: "#fff" }} disabled={uploading} onClick={handleHapusData}>
                {uploading ? "Memproses..." : "Ya, Tandai Dihapus"}
              </button>
              <button type="button" style={btnSecondary} onClick={() => setModal(null)}>Batal</button>
            </div>
          </div>
        </div>
      )}

      {formVisible && (
        <div style={{ marginBottom: 24, padding: 20, background: "var(--card_bg)", border: "1px solid var(--border_color)", borderRadius: 12 }}>
          <p style={{ margin: "0 0 12px", fontSize: 14, color: "#475569" }}>
            Form tambah booking badan — untuk paritas penuh gunakan field yang sama dengan legacy. Submit memanggil <code>/api/ppat_create-booking-and-bphtb</code>.
          </p>
          <a
            href="/pu/booking-sspd/badan/tambah"
            style={{ color: "var(--accent)", fontWeight: 600, cursor: "pointer" }}
            onClick={async (e) => {
              e.preventDefault();
              try {
                const resp = await fetch("/api/check-my-signature", { credentials: "include" });
                const data = await resp.json().catch(() => ({}));
                if (!resp.ok || data.success === false) {
                  setActionMessage("Gagal memeriksa status tanda tangan. Coba lagi.");
                  return;
                }
                if (!data.has_signature) {
                  if (confirm("Anda belum mengunggah tanda tangan. Buka halaman Profil untuk mengunggah sekarang?")) {
                    window.location.href = "/profile";
                  }
                  return;
                }
                window.location.href = "/pu/booking-sspd/badan/tambah";
              } catch {
                setActionMessage("Tidak bisa memverifikasi tanda tangan saat ini. Coba lagi.");
              }
            }}
          >
            Buka halaman form lengkap Tambah Booking Badan →
          </a>
        </div>
      )}

      {error && (
        <div style={{ padding: 12, marginBottom: 16, background: "#fef2f2", color: "#b91c1c", borderRadius: 8 }}>
          {error}
        </div>
      )}

      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          overflow: "hidden",
          boxShadow: "var(--card_shadow)",
          border: "1px solid var(--border_color)",
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            padding: "12px 16px",
            background: "var(--accent)",
            color: "#fff",
          }}
        >
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Daftar Badan Usaha</h2>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input
              type="text"
              placeholder="Cari data..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { setSearchQuery(searchInput.trim()); setPage(1); } }}
              style={{
                padding: "8px 12px 8px 36px",
                borderRadius: 8,
                border: "none",
                minWidth: 200,
                fontSize: 14,
                color: "#0f172a",
                background: "rgba(255,255,255,0.95)",
              }}
            />
            <button
              type="button"
              onClick={() => { setSearchQuery(searchInput.trim()); setPage(1); }}
              style={{
                ...btnStyle,
                background: "rgba(255,255,255,0.95)",
                color: "#0f172a",
                padding: "8px 14px",
              }}
            >
              Cari
            </button>
            <button
              type="button"
              onClick={() => loadTable(page, searchQuery)}
              style={{
                ...btnStyle,
                background: "rgba(255,255,255,0.95)",
                color: "#0f172a",
                padding: "8px 14px",
              }}
              title="Refresh"
            >
              Refresh
            </button>
          </div>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ ...tableStyle, boxShadow: "none", borderRadius: 0 }}>
            <thead>
              <tr>
                <th style={{ ...thStyle, background: "var(--accent)", color: "#fff", borderColor: "rgba(255,255,255,0.2)" }}>No. Booking</th>
                <th style={{ ...thStyle, background: "var(--accent)", color: "#fff", borderColor: "rgba(255,255,255,0.2)" }}>No. PPBB</th>
                <th style={{ ...thStyle, background: "var(--accent)", color: "#fff", borderColor: "rgba(255,255,255,0.2)" }}>NPWP</th>
                <th style={{ ...thStyle, background: "var(--accent)", color: "#fff", borderColor: "rgba(255,255,255,0.2)" }}>Track Status</th>
                <th style={{ ...thStyle, background: "var(--accent)", color: "#fff", borderColor: "rgba(255,255,255,0.2)" }}>Kirim</th>
              </tr>
            </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} style={{ ...tdStyle, textAlign: "center", padding: 32 }}>
                  Memuat...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ ...tdStyle, textAlign: "center", color: "#475569" }}>
                  Tidak ada data booking badan usaha
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <React.Fragment key={row.nobooking}>
                  <tr
                    style={{ cursor: "pointer" }}
                    onClick={() => setExpandedRow((x) => (x === row.nobooking ? null : row.nobooking))}
                  >
                    <td style={tdStyle}>{row.nobooking}</td>
                    <td style={tdStyle}>{row.noppbb || "—"}</td>
                    <td style={tdStyle}>{row.npwpwp || "—"}</td>
                    <td style={tdStyle}>{row.trackstatus || "—"}</td>
                    <td style={tdStyle}>
                      <button
                        type="button"
                        style={canSend(row) ? btnKirim : btnKirimDisabled}
                        disabled={!canSend(row)}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!canSend(row)) return;
                          openModalKirim(row);
                        }}
                      >
                        {status(row.trackstatus) === "diolah" ? "Sedang Diolah" : status(row.trackstatus) === "pending" ? "Menunggu Kirim" : "Kirim ke Bappenda"}
                      </button>
                    </td>
                  </tr>
                  {expandedRow === row.nobooking && (
                    <tr key={`${row.nobooking}-detail`}>
                      <td colSpan={5} style={{ ...tdStyle, background: "var(--card_bg_grey)", padding: 16 }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                          <strong style={{ color: "#0f172a" }}>Detail No. Booking: {row.nobooking}</strong>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                            <button
                              type="button"
                              style={btnSecondary}
                              onClick={() => setCekBookingNobooking(row.nobooking)}
                            >
                              Cek Booking
                            </button>
                            <Link
                              href={`/pu/permohonan-validasi/${encodeURIComponent(row.nobooking)}`}
                              style={{ color: "var(--accent)", fontWeight: 600 }}
                            >
                              Isi Form Permohonan Validasi →
                            </Link>
                            <button
                              type="button"
                              style={btnSecondary}
                              onClick={() => window.open(`/api/ppat_generate-pdf-badan/${encodeURIComponent(row.nobooking)}`, "_blank", "noopener,noreferrer")}
                            >
                              Lihat Dokumen
                            </button>
                            <button
                              type="button"
                              style={btnSecondary}
                              onClick={() => window.open(`/api/ppat/generate-pdf-mohon-validasi/${encodeURIComponent(row.nobooking)}`, "_blank", "noopener,noreferrer")}
                            >
                              Lihat Dokumen Validasi
                            </button>
                          </div>
                          {cekBookingDetail && cekBookingDetail.nobooking === row.nobooking && (
                            <div style={{ marginTop: 12, padding: 16, background: "var(--card_bg)", borderRadius: 8, border: "1px solid var(--border_color)" }}>
                              <div style={{ fontWeight: 600, marginBottom: 8, color: "#0f172a" }}>Detail Booking</div>
                              <div style={{ display: "grid", gap: 6, fontSize: 14 }}>
                                <div><strong>Nama Wajib Pajak:</strong> {cekBookingDetail.nama_wajib_pajak ?? "—"}</div>
                                <div><strong>Objek Pajak:</strong> {cekBookingDetail.Alamatop ?? cekBookingDetail.keterangan ?? "—"}</div>
                                <div><strong>Biaya (BPHTB):</strong> {typeof cekBookingDetail.bphtb_yangtelah_dibayar === "number" ? `Rp ${cekBookingDetail.bphtb_yangtelah_dibayar.toLocaleString("id-ID")}` : (cekBookingDetail.bphtb_yangtelah_dibayar ?? "—")}</div>
                              </div>
                            </div>
                          )}
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
                            {(["akta_tanah_path", "sertifikat_tanah_path", "pelengkap_path"] as const).map((pathKey, idx) => {
                              const field = (["aktaTanah", "sertifikatTanah", "pelengkap"] as const)[idx];
                              const label = ["Akta Tanah", "Sertifikat Tanah", "Pelengkap"][idx];
                              const path = row[pathKey];
                              return (
                                <div key={pathKey} style={{ border: "1px solid var(--border_color)", borderRadius: 8, padding: 12, background: "var(--card_bg)" }}>
                                  <div style={{ fontWeight: 600, marginBottom: 6, color: "#0f172a" }}>{label}</div>
                                  {path ? (
                                    <div style={{ marginBottom: 8 }}>
                                      <a href={getFileUrl(path)} target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)", fontSize: 13 }}>
                                        {getFileName(path)}
                                      </a>
                                    </div>
                                  ) : null}
                                  <input
                                    type="file"
                                    accept="application/pdf,image/jpeg,image/png"
                                    onChange={(e) => {
                                      const f = e.target.files?.[0];
                                      if (f) handleUploadDoc(row.nobooking, field, f);
                                      e.target.value = "";
                                    }}
                                    style={{ fontSize: 12, color: "#0f172a" }}
                                  />
                                  {docUploading === `${row.nobooking}-${field}` && <span style={{ fontSize: 12, color: "#475569" }}> Mengunggah...</span>}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
        </div>
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
          <span style={{ fontSize: 14, color: "#0f172a" }}>
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
