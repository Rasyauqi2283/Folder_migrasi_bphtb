"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { getApiBase } from "../../../../../lib/api";

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
  message?: string;
  data?: BookingRow[];
  pagination?: { page: number; limit: number; total: number; pages: number };
};

type PendingCorrection = {
  nobooking: string;
  no_registrasi?: string | null;
  stpd_code?: string | null;
  catatan_peneliti?: string | null;
  catatan_pu?: string | null;
  bukti_pelunasan_path?: string | null;
  correction_updated_at?: string | null;
};

type BookingDetail = {
  nobooking: string;
  nama_wajib_pajak?: string;
  Alamatop?: string;
  keterangan?: string;
  bphtb_yangtelah_dibayar?: number;
  [key: string]: unknown;
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
  const [wpInviteOpen, setWpInviteOpen] = useState(false);
  const [wpNikNpwp, setWpNikNpwp] = useState("");
  const [wpEmail, setWpEmail] = useState("");
  const [wpInviting, setWpInviting] = useState(false);
  const [wpInviteMessage, setWpInviteMessage] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [quota, setQuota] = useState<{ used: number; limit: number; date: string } | null>(null);
  const [scheduleDate, setScheduleDate] = useState("");
  const [kirimSubmitting, setKirimSubmitting] = useState(false);
  const [docUploading, setDocUploading] = useState<string | null>(null);
  const [cekBookingDetail, setCekBookingDetail] = useState<BookingDetail | null>(null);
  const [detailSectionsOpenFor, setDetailSectionsOpenFor] = useState<string | null>(null);

  const [corrections, setCorrections] = useState<PendingCorrection[]>([]);
  const [correctionsLoading, setCorrectionsLoading] = useState(false);
  const [correctionsErr, setCorrectionsErr] = useState<string | null>(null);
  const [correctionModalOpen, setCorrectionModalOpen] = useState(false);
  const [selectedCorrection, setSelectedCorrection] = useState<PendingCorrection | null>(null);
  const [correctionNote, setCorrectionNote] = useState("");
  const [correctionFile, setCorrectionFile] = useState<File | null>(null);
  const [correctionBusy, setCorrectionBusy] = useState(false);

  const loadCorrections = useCallback(async () => {
    setCorrectionsLoading(true);
    setCorrectionsErr(null);
    try {
      const res = await fetch(`${getApiBase()}/api/ppat/corrections/pending?limit=50`, { credentials: "include" });
      const j = await res.json().catch(() => ({}));
      if (!res.ok || !j?.success) {
        setCorrectionsErr(j?.message || "Gagal memuat notifikasi koreksi.");
        setCorrections([]);
        return;
      }
      setCorrections(Array.isArray(j?.data) ? j.data : []);
    } catch {
      setCorrectionsErr("Gagal memuat notifikasi koreksi.");
      setCorrections([]);
    } finally {
      setCorrectionsLoading(false);
    }
  }, []);

  const setCekBookingNobooking = useCallback((nobooking: string) => {
    setCekBookingDetail(null);
    const base = `${getApiBase()}/api/ppat/booking/${encodeURIComponent(nobooking)}`;
    // Prefer callback endpoint because it contains full joined fields
    // (jenisPerolehan, harga transaksi, luas/njop tanah-bangunan, dll).
    fetch(`${base}/callback`, { credentials: "include" })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("callback fetch failed"))))
      .then((j: { success?: boolean; data?: Record<string, unknown> }) => {
        if (j?.success && j?.data) {
          setCekBookingDetail({ nobooking, ...j.data } as BookingDetail);
          return;
        }
        throw new Error("callback payload invalid");
      })
      .catch(() => {
        // Backward-compatible fallback to basic detail endpoint.
        fetch(base, { credentials: "include" })
          .then((res) => res.json())
          .then((j: { success?: boolean; data?: Record<string, unknown> }) => {
            if (j?.success && j?.data) {
              setCekBookingDetail({ nobooking, ...j.data } as BookingDetail);
              return;
            }
            setCekBookingDetail(null);
          })
          .catch(() => setCekBookingDetail(null));
      });
  }, []);

  const loadTable = useCallback(async (p: number, q?: string) => {
    setLoading(true);
    setError(null);
    try {
      const s = typeof q === "string" ? q : searchQuery;
      const base = getApiBase();
      let url = `${base}/api/ppat/load-all-booking?page=${p}&limit=${LIMIT}&jenis_wajib_pajak=${encodeURIComponent(JENIS_WP)}`;
      if (s.trim()) url += `&search=${encodeURIComponent(s.trim())}`;
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

  useEffect(() => {
    loadCorrections();
  }, [loadCorrections]);

  const status = (s: string) => (s || "").toLowerCase();
  const isLocked = (row: BookingRow) => status(row.trackstatus) !== "draft";
  const canSend = (row: BookingRow) => status(row.trackstatus) === "draft";
  const selectedRow = data.find((r) => r.nobooking === (expandedRow || modalNobooking));
  const selectedLocked = selectedRow ? isLocked(selectedRow) : true;

  const getFileUrl = (path: string) => {
    if (!path) return "";
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    const rel = path.replace(/^\/storage\/ppat\//, "");
    return `${getApiBase()}/api/ppat/file-proxy?relativePath=${encodeURIComponent(rel)}`;
  };
  const getFileName = (path: string) => (path ? path.split("/").pop()?.replace(/^v\d+_/, "") || "File" : "File");
  const fieldLabelStyle: React.CSSProperties = { fontSize: 12, color: "#6b7280", fontWeight: 600, marginBottom: 2 };
  const fieldValueStyle: React.CSSProperties = { fontSize: 14, color: "#0f172a", fontWeight: 500 };
  const sectionCardStyle: React.CSSProperties = {
    border: "1px solid #e5e7eb",
    borderRadius: 10,
    background: "#ffffff",
    padding: 12,
    boxShadow: "0 1px 3px rgba(15, 23, 42, 0.08)",
  };

  const formatMoney = (v: unknown) => {
    const n = typeof v === "number" ? v : Number(v);
    if (Number.isNaN(n)) return "—";
    return `Rp ${n.toLocaleString("id-ID")}`;
  };
  const toNum = (v: unknown) => {
    const n = typeof v === "number" ? v : Number(v);
    return Number.isNaN(n) ? 0 : n;
  };
  const val = (v: unknown) => {
    const s = String(v ?? "").trim();
    if (!s) return "—";
    const lowered = s.toLowerCase();
    if (lowered === "undefined" || lowered === "null" || lowered === "nan") return "—";
    return s;
  };
  const statusBadgeStyle = (trackStatus?: string): React.CSSProperties => {
    const st = status(trackStatus || "");
    if (st === "draft") return { background: "#eef2ff", color: "#3730a3" };
    if (st === "wp_approved") return { background: "#dbeafe", color: "#1d4ed8" };
    if (st.includes("pending")) return { background: "#fff7ed", color: "#9a3412" };
    if (st.includes("valid") || st.includes("diverifikasi")) return { background: "#ecfdf5", color: "#166534" };
    return { background: "#f1f5f9", color: "#334155" };
  };

  const openCorrectionModal = (c: PendingCorrection) => {
    setSelectedCorrection(c);
    setCorrectionNote(String(c.catatan_pu ?? ""));
    setCorrectionFile(null);
    setActionMessage(null);
    setCorrectionModalOpen(true);
  };

  const submitCorrectionProof = async () => {
    if (!selectedCorrection?.nobooking) return;
    if (!correctionFile) {
      setActionMessage("Upload bukti pelunasan (PDF/JPG/PNG) terlebih dahulu.");
      return;
    }
    setCorrectionBusy(true);
    setActionMessage(null);
    try {
      const fd = new FormData();
      fd.append("bukti", correctionFile);
      if (correctionNote.trim()) fd.append("catatan_pu", correctionNote.trim());
      const res = await fetch(`${getApiBase()}/api/ppat/corrections/${encodeURIComponent(selectedCorrection.nobooking)}/upload-proof`, {
        method: "POST",
        credentials: "include",
        body: fd,
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok || !j?.success) {
        setActionMessage(j?.message || "Gagal upload bukti.");
        return;
      }
      await loadCorrections();
      setActionMessage("Bukti berhasil diupload.");
    } catch {
      setActionMessage("Gagal upload bukti.");
    } finally {
      setCorrectionBusy(false);
    }
  };

  const resubmitCorrection = async () => {
    if (!selectedCorrection?.nobooking) return;
    setCorrectionBusy(true);
    setActionMessage(null);
    try {
      const res = await fetch(`${getApiBase()}/api/ppat/corrections/${encodeURIComponent(selectedCorrection.nobooking)}/resubmit`, {
        method: "POST",
        credentials: "include",
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok || !j?.success) {
        setActionMessage(j?.message || "Gagal kirim ulang.");
        return;
      }
      setCorrectionModalOpen(false);
      setSelectedCorrection(null);
      await loadCorrections();
      setActionMessage("Berhasil dikirim ulang ke antrian Peneliti.");
    } catch {
      setActionMessage("Gagal kirim ulang.");
    } finally {
      setCorrectionBusy(false);
    }
  };

  const openModalKirim = (row: BookingRow) => {
    setModal("kirim");
    setModalNobooking(row.nobooking);
    setScheduleDate("");
    setQuota(null);
    const pad = (n: number) => String(n).padStart(2, "0");
    const t = new Date();
    setScheduleDate(`${t.getFullYear()}-${pad(t.getMonth() + 1)}-${pad(t.getDate())}`);
    fetch(`${getApiBase()}/api/ppat/quota?date=${`${t.getFullYear()}-${pad(t.getMonth() + 1)}-${pad(t.getDate())}`}`, { credentials: "include" })
      .then((r) => r.json())
      .then((j) => {
        if (j?.success && j?.data) setQuota({ used: j.data.used ?? 0, limit: j.data.limit ?? 80, date: j.data.date ?? "" });
      })
      .catch(() => setQuota({ used: 0, limit: 80, date: "" }));
  };

  const handleKirimSekarang = async () => {
    const nb = modalNobooking;
    if (!nb) return;
    if (!window.confirm("Ingin kirim sekarang? Tolong cek apakah sudah sesuai dan edit jika tidak benar.")) {
      return;
    }
    setKirimSubmitting(true);
    try {
      const day = new Date().getDay();
      if (day === 0 || day === 6) {
        setActionMessage("Pengiriman tidak tersedia pada hari libur.");
        return;
      }
      const res = await fetch(`${getApiBase()}/api/ppat/send-now?nobooking=${encodeURIComponent(nb)}`, {
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
      const res = await fetch(`${getApiBase()}/api/ppat/upload-documents`, { method: "POST", credentials: "include", body: fd });
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
    const tanggalTeks = new Date(scheduleDate).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
    if (!window.confirm(`Ingin kirim pada ${tanggalTeks} ini? Sudah benarkah dokumen yang dilampirkan dan dibuat? Jika belum, tolong cek kembali dan edit jika tidak benar.`)) {
      return;
    }
    setKirimSubmitting(true);
    try {
      const res = await fetch(`${getApiBase()}/api/ppat/schedule-send`, {
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
    if (nb) window.open(`${getApiBase()}/api/ppat_generate-pdf-badan/${encodeURIComponent(nb)}`, "_blank", "noopener,noreferrer");
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
        fetch(`${getApiBase()}/api/ppat/get-documents?nobooking=${encodeURIComponent(nb)}`, { credentials: "include" })
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
      const res = await fetch(`${getApiBase()}/api/ppat/update-trackstatus/${encodeURIComponent(nb)}`, {
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

      {/* Alert: Pending Correction (STPD Kurang Bayar) */}
      <div style={{ marginBottom: 16 }}>
        {correctionsLoading ? (
          <div style={{ padding: 12, borderRadius: 10, border: "1px solid var(--border_color)", background: "rgba(245,158,11,0.08)" }}>
            <strong style={{ color: "#92400e" }}>Memuat notifikasi STPD/Koreksi...</strong>
          </div>
        ) : correctionsErr ? (
          <div style={{ padding: 12, borderRadius: 10, border: "1px solid rgba(239,68,68,0.35)", background: "rgba(239,68,68,0.08)", color: "#b91c1c", fontWeight: 700 }}>
            {correctionsErr}
          </div>
        ) : corrections.length === 0 ? null : (
          <div style={{ padding: 14, borderRadius: 12, border: "1px solid rgba(245,158,11,0.35)", background: "rgba(245,158,11,0.10)" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontWeight: 900, color: "#92400e", marginBottom: 6 }}>Perlu Koreksi / STPD Kurang Bayar</div>
                <div style={{ fontSize: 13, color: "#78350f" }}>
                  Ada <strong>{corrections.length}</strong> dokumen berstatus <strong>PENDING_CORRECTION</strong> dari Peneliti. Silakan proses pelunasan/koreksi lalu kirim ulang.
                </div>
              </div>
              <button type="button" style={{ ...btnSecondary, border: "1px solid rgba(245,158,11,0.35)" }} onClick={loadCorrections}>
                Refresh
              </button>
            </div>
            <div style={{ marginTop: 12, overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 720 }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: "left", padding: "10px 8px", fontSize: 12, color: "#92400e" }}>No Registrasi</th>
                    <th style={{ textAlign: "left", padding: "10px 8px", fontSize: 12, color: "#92400e" }}>Kode STPD</th>
                    <th style={{ textAlign: "left", padding: "10px 8px", fontSize: 12, color: "#92400e" }}>Catatan Peneliti</th>
                    <th style={{ textAlign: "right", padding: "10px 8px", fontSize: 12, color: "#92400e" }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {corrections.slice(0, 8).map((c) => (
                    <tr key={c.nobooking} style={{ borderTop: "1px solid rgba(245,158,11,0.18)" }}>
                      <td style={{ padding: "10px 8px", fontSize: 13, color: "#0f172a" }}>{c.no_registrasi || "—"}</td>
                      <td style={{ padding: "10px 8px", fontSize: 13, fontWeight: 800, color: "#0f172a" }}>{c.stpd_code || "—"}</td>
                      <td style={{ padding: "10px 8px", fontSize: 13, color: "#0f172a" }}>{(c.catatan_peneliti || "—") as any}</td>
                      <td style={{ padding: "10px 8px", textAlign: "right" }}>
                        <button type="button" style={{ ...btnStyle, background: "#f59e0b", color: "#111827" }} onClick={() => openCorrectionModal(c)}>
                          Proses Pelunasan/Koreksi
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {corrections.length > 8 && (
                <div style={{ marginTop: 8, fontSize: 12, color: "#78350f" }}>
                  Menampilkan 8 dari {corrections.length} item. Gunakan tombol refresh untuk update data terbaru.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 20, alignItems: "center" }}>
        <button type="button" style={btnTambah} onClick={() => setFormVisible((v) => !v)}>
          + Tambah Data
        </button>
        <button type="button" style={btnSecondary} onClick={() => openModal("signature")} disabled={selectedLocked}>
          Tambah Tanda Tangan
        </button>
        <button type="button" style={btnSecondary} onClick={() => (expandedRow || data[0]?.nobooking) ? openPdfBooking() : openModal("documents")}>
          Lihat Dokumen
        </button>
        <button type="button" style={btnSecondary} onClick={() => openModal("delete")} disabled={selectedLocked}>
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
                disabled={selectedLocked}
              >
                {data.map((r) => (
                  <option key={r.nobooking} value={r.nobooking}>{r.nobooking}</option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", marginBottom: 4, fontWeight: 600 }}>File Tanda Tangan (gambar)</label>
              <input type="file" accept="image/*" onChange={(e) => setSignatureFile(e.target.files?.[0] || null)} disabled={selectedLocked} />
            </div>
            {actionMessage && <p style={{ color: "#b91c1c", marginBottom: 8 }}>{actionMessage}</p>}
            <div style={{ display: "flex", gap: 8 }}>
              <button type="button" style={btnTambah} disabled={uploading || selectedLocked} onClick={handleUploadSignature}>
                {uploading ? "Mengunggah..." : "Upload"}
              </button>
              <button type="button" style={btnSecondary} onClick={() => setModal(null)}>Batal</button>
            </div>

            <hr style={{ margin: "18px 0", border: "none", borderTop: "1px solid var(--border_color)" }} />
            <div>
              <button
                type="button"
                style={{ ...btnSecondary, width: "100%", justifyContent: "center" }}
                onClick={() => {
                  setWpInviteOpen((v) => !v);
                  setWpInviteMessage(null);
                }}
                disabled={wpInviting || selectedLocked}
              >
                {wpInviteOpen ? "Tutup Libatkan WP" : "Libatkan WP"}
              </button>

              {wpInviteOpen && (
                <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
                  <div>
                    <label style={{ display: "block", marginBottom: 4, fontWeight: 600, color: "#0f172a" }}>NIK / NPWP</label>
                    <input
                      value={wpNikNpwp}
                      onChange={(e) => setWpNikNpwp(e.target.value)}
                      placeholder="Masukkan NIK atau NPWP"
                      style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid var(--border_color)" }}
                      disabled={selectedLocked}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: 4, fontWeight: 600, color: "#0f172a" }}>Email WP</label>
                    <input
                      value={wpEmail}
                      onChange={(e) => setWpEmail(e.target.value)}
                      placeholder="email@contoh.com"
                      style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid var(--border_color)" }}
                      disabled={selectedLocked}
                    />
                  </div>

                  {wpInviteMessage && (
                    <div style={{ padding: 10, borderRadius: 8, background: wpInviteMessage.startsWith("OK:") ? "#f0fdf4" : "#fef2f2", color: wpInviteMessage.startsWith("OK:") ? "#166534" : "#b91c1c" }}>
                      {wpInviteMessage.replace(/^OK:\s*/, "")}
                    </div>
                  )}

                  <button
                    type="button"
                    style={{ ...btnTambah, width: "100%" }}
                    disabled={wpInviting || selectedLocked || !modalNobooking || !wpNikNpwp.trim() || !wpEmail.trim()}
                    onClick={async () => {
                      setWpInviting(true);
                      setWpInviteMessage(null);
                      try {
                        const res = await fetch(`${getApiBase()}/api/wp/invite-sign`, {
                          method: "POST",
                          credentials: "include",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            nobooking: modalNobooking,
                            nik_npwp: wpNikNpwp.trim(),
                            email: wpEmail.trim(),
                          }),
                        });
                        const j = await res.json().catch(() => ({}));
                        if (!res.ok || !j?.success) {
                          setWpInviteMessage(j?.message ? String(j.message) : "Gagal melibatkan WP.");
                          return;
                        }
                        setWpInviteMessage("OK: Permintaan ke WP berhasil dibuat.");
                      } catch {
                        setWpInviteMessage("Gagal melibatkan WP.");
                      } finally {
                        setWpInviting(false);
                      }
                    }}
                  >
                    {wpInviting ? "Mengirim..." : "Kirim ke WP"}
                  </button>
                </div>
              )}
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
                  fetch(`${getApiBase()}/api/ppat/get-documents?nobooking=${encodeURIComponent(e.target.value)}`, { credentials: "include" })
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
                disabled={selectedLocked}
            >
              {data.map((r) => (
                <option key={r.nobooking} value={r.nobooking}>{r.nobooking} — {r.namawajibpajak}</option>
              ))}
            </select>
            {actionMessage && <p style={{ color: actionMessage.includes("Gagal") ? "#b91c1c" : "#166534", marginBottom: 8 }}>{actionMessage}</p>}
            <div style={{ display: "flex", gap: 8 }}>
              <button type="button" style={{ ...btnStyle, background: "#dc2626", color: "#fff" }} disabled={uploading || selectedLocked} onClick={handleHapusData}>
                {uploading ? "Memproses..." : "Ya, Tandai Dihapus"}
              </button>
              <button type="button" style={btnSecondary} onClick={() => setModal(null)}>Batal</button>
            </div>
          </div>
        </div>
      )}

      {/* Correction modal */}
      {correctionModalOpen && selectedCorrection && (
        <div style={modalOverlayStyle} onClick={() => !correctionBusy && setCorrectionModalOpen(false)}>
          <div style={{ ...modalBoxStyle, maxWidth: 560 }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: "0 0 10px", color: "#0f172a" }}>Proses Pelunasan / Koreksi</h3>
            <div style={{ fontSize: 14, color: "#0f172a", display: "grid", gap: 6 }}>
              <div><strong>No Registrasi:</strong> {selectedCorrection.no_registrasi || "—"}</div>
              <div><strong>No Booking:</strong> {selectedCorrection.nobooking}</div>
              <div><strong>Kode STPD:</strong> <span style={{ fontWeight: 900, color: "#92400e" }}>{selectedCorrection.stpd_code || "—"}</span></div>
              <div><strong>Catatan Peneliti:</strong> {selectedCorrection.catatan_peneliti || "—"}</div>
            </div>

            <div style={{ marginTop: 14, padding: 12, borderRadius: 10, border: "1px solid var(--border_color)", background: "rgba(245,158,11,0.06)" }}>
              <div style={{ fontWeight: 800, marginBottom: 6, color: "#92400e" }}>Upload Bukti Pelunasan</div>
              <input
                type="file"
                accept="application/pdf,image/jpeg,image/png,image/webp"
                onChange={(e) => setCorrectionFile(e.target.files?.[0] || null)}
                disabled={correctionBusy}
              />
              <div style={{ marginTop: 10 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 6 }}>Catatan PU (opsional)</label>
                <textarea
                  value={correctionNote}
                  onChange={(e) => setCorrectionNote(e.target.value)}
                  placeholder="Catatan untuk internal/peneliti..."
                  style={{ width: "100%", minHeight: 70, padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border_color)" }}
                  disabled={correctionBusy}
                />
              </div>
              <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button type="button" style={{ ...btnStyle, background: "#2563eb", color: "#fff" }} disabled={correctionBusy} onClick={submitCorrectionProof}>
                  {correctionBusy ? "Memproses..." : "Upload Bukti"}
                </button>
                <button type="button" style={{ ...btnStyle, background: "#f59e0b", color: "#111827" }} disabled={correctionBusy} onClick={resubmitCorrection}>
                  {correctionBusy ? "Memproses..." : "Kirim Ulang ke Peneliti"}
                </button>
                <button type="button" style={btnSecondary} disabled={correctionBusy} onClick={() => setCorrectionModalOpen(false)}>
                  Tutup
                </button>
              </div>
              {actionMessage && <p style={{ marginTop: 10, fontSize: 13, color: actionMessage.includes("Gagal") ? "#b91c1c" : "#166534" }}>{actionMessage}</p>}
            </div>
          </div>
        </div>
      )}

      {formVisible && (
        <div style={{ marginBottom: 24, padding: 20, background: "var(--card_bg)", border: "1px solid var(--border_color)", borderRadius: 12 }}>
          <p style={{ margin: "0 0 12px", fontSize: 14, color: "#475569" }}>
            Form tambah booking badan.
          </p>
          <a
            href="/pu/booking-sspd/badan/tambah"
            style={{ color: "var(--accent)", fontWeight: 600, cursor: "pointer" }}
            onClick={async (e) => {
              e.preventDefault();
              try {
                const resp = await fetch(`${getApiBase()}/api/check-my-signature`, { credentials: "include" });
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
                    onClick={() => {
                      setExpandedRow((x) => {
                        const next = x === row.nobooking ? null : row.nobooking;
                        setDetailSectionsOpenFor(null);
                        return next;
                      });
                    }}
                  >
                    <td style={tdStyle}>{row.nobooking}</td>
                    <td style={tdStyle}>{row.noppbb || "—"}</td>
                    <td style={tdStyle}>{row.npwpwp || "—"}</td>
                    <td style={tdStyle}>
                      <span
                        style={{
                          ...statusBadgeStyle(row.trackstatus),
                          padding: "4px 10px",
                          borderRadius: 999,
                          fontSize: 12,
                          fontWeight: 700,
                        }}
                      >
                        {row.trackstatus || "—"}
                      </span>
                    </td>
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
                  <tr key={`${row.nobooking}-detail`}>
                    <td colSpan={5} style={{ ...tdStyle, padding: 0, background: "#f8fafc" }}>
                      <div
                        style={{
                          maxHeight: expandedRow === row.nobooking ? 1200 : 0,
                          opacity: expandedRow === row.nobooking ? 1 : 0,
                          transform: expandedRow === row.nobooking ? "translateY(0)" : "translateY(-6px)",
                          transition: "max-height 0.28s ease, opacity 0.22s ease, transform 0.22s ease",
                          overflow: "hidden",
                        }}
                      >
                        {(() => {
                          const detail = cekBookingDetail && cekBookingDetail.nobooking === row.nobooking ? cekBookingDetail : null;
                          const luasTanah = toNum(detail?.luas_tanah);
                          const njopTanah = toNum(detail?.njop_tanah);
                          const luasBangunan = toNum(detail?.luas_bangunan);
                          const njopBangunan = toNum(detail?.njop_bangunan);
                          const totalNjopTanah = luasTanah * njopTanah;
                          const totalNjopBangunan = luasBangunan * njopBangunan;
                          return (
                            <div style={{ padding: 16, display: "grid", gap: 12 }}>
                              <div style={{ ...sectionCardStyle, display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", justifyContent: "space-between" }}>
                                <strong style={{ color: "#0f172a" }}>Detail No. Booking: {row.nobooking}</strong>
                                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                  {status(row.trackstatus) === "draft" && (
                                    <Link
                                      href={`/pu/booking-sspd/badan/tambah?edit=1&nobooking=${encodeURIComponent(row.nobooking)}`}
                                      prefetch={false}
                                      style={{
                                        ...btnStyle,
                                        background: "#2563eb",
                                        color: "#fff",
                                        display: "inline-flex",
                                        alignItems: "center",
                                        textDecoration: "none",
                                      }}
                                    >
                                      Edit Data
                                    </Link>
                                  )}
                                  <button
                                    type="button"
                                    style={btnSecondary}
                                    onClick={() => {
                                      if (detailSectionsOpenFor === row.nobooking) {
                                        setDetailSectionsOpenFor(null);
                                        return;
                                      }
                                      setCekBookingNobooking(row.nobooking);
                                      setDetailSectionsOpenFor(row.nobooking);
                                    }}
                                  >
                                    {detailSectionsOpenFor === row.nobooking ? "Hide Detail" : "Check Detail"}
                                  </button>
                                  <Link
                                    href={`/pu/permohonan-validasi/${encodeURIComponent(row.nobooking)}`}
                                    prefetch={false}
                                    style={{ color: isLocked(row) ? "#94a3b8" : "var(--accent)", fontWeight: 600, pointerEvents: isLocked(row) ? "none" : "auto" }}
                                    aria-disabled={isLocked(row)}
                                  >
                                    Isi Form Permohonan Validasi →
                                  </Link>
                                  <button type="button" style={btnSecondary} onClick={() => window.open(`${getApiBase()}/api/ppat_generate-pdf-badan/${encodeURIComponent(row.nobooking)}`, "_blank", "noopener,noreferrer")}>Lihat Dokumen</button>
                                  <button type="button" style={btnSecondary} onClick={() => window.open(`${getApiBase()}/api/ppat/generate-pdf-mohon-validasi/${encodeURIComponent(row.nobooking)}`, "_blank", "noopener,noreferrer")}>Lihat Dokumen Validasi</button>
                                </div>
                              </div>

                              {detailSectionsOpenFor === row.nobooking && (
                                <>
                                  <div style={{ ...sectionCardStyle }}>
                                    <div style={{ fontWeight: 700, marginBottom: 8, color: "#0f172a" }}>Section 1 - Data Identitas</div>
                                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
                                      <div><div style={fieldLabelStyle}>NIK</div><div style={fieldValueStyle}>{val(detail?.nik)}</div></div>
                                      <div><div style={fieldLabelStyle}>Nama Wajib Pajak</div><div style={fieldValueStyle}>{val(detail?.nama_wajib_pajak ?? row.namawajibpajak)}</div></div>
                                      <div><div style={fieldLabelStyle}>Alamat</div><div style={fieldValueStyle}>{val(detail?.alamatwajibpajak ?? detail?.alamat_wajib_pajak ?? detail?.Alamatop ?? detail?.letaktanahdanbangunan ?? detail?.keterangan)}</div></div>
                                      <div><div style={fieldLabelStyle}>NOP PBB</div><div style={fieldValueStyle}>{val(row.noppbb)}</div></div>
                                    </div>
                                  </div>

                                  <div style={{ ...sectionCardStyle }}>
                                    <div style={{ fontWeight: 700, marginBottom: 8, color: "#0f172a" }}>Section 2 - Data Transaksi</div>
                                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
                                      <div><div style={fieldLabelStyle}>Jenis Perolehan</div><div style={fieldValueStyle}>{val(detail?.jenisPerolehan ?? detail?.jenis_perolehan)}</div></div>
                                      <div><div style={fieldLabelStyle}>Tanggal Perolehan</div><div style={fieldValueStyle}>{val(detail?.tanggal_perolehan)}</div></div>
                                      <div><div style={fieldLabelStyle}>Harga Transaksi</div><div style={fieldValueStyle}>{formatMoney(detail?.hargatransaksi ?? detail?.harga_transaksi)}</div></div>
                                      <div><div style={fieldLabelStyle}>Status Booking</div><div style={fieldValueStyle}>{val(row.trackstatus)}</div></div>
                                    </div>
                                  </div>

                                  <div style={{ ...sectionCardStyle }}>
                                    <div style={{ fontWeight: 700, marginBottom: 8, color: "#0f172a" }}>Section 3 - Perhitungan NJOP</div>
                                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
                                      <div><div style={fieldLabelStyle}>Luas Tanah</div><div style={fieldValueStyle}>{luasTanah ? `${luasTanah} m2` : "—"}</div></div>
                                      <div><div style={fieldLabelStyle}>NJOP Tanah</div><div style={fieldValueStyle}>{njopTanah ? formatMoney(njopTanah) : "—"}</div></div>
                                      <div><div style={fieldLabelStyle}>Total NJOP Tanah</div><div style={fieldValueStyle}>{totalNjopTanah ? formatMoney(totalNjopTanah) : "—"}</div></div>
                                      <div><div style={fieldLabelStyle}>Luas Bangunan</div><div style={fieldValueStyle}>{luasBangunan ? `${luasBangunan} m2` : "—"}</div></div>
                                      <div><div style={fieldLabelStyle}>NJOP Bangunan</div><div style={fieldValueStyle}>{njopBangunan ? formatMoney(njopBangunan) : "—"}</div></div>
                                      <div><div style={fieldLabelStyle}>Total NJOP Bangunan</div><div style={fieldValueStyle}>{totalNjopBangunan ? formatMoney(totalNjopBangunan) : "—"}</div></div>
                                    </div>
                                  </div>
                                </>
                              )}

                              <div style={{ ...sectionCardStyle }}>
                                <div style={{ fontWeight: 700, marginBottom: 8, color: "#0f172a" }}>Section 4 - Dokumen Pendukung</div>
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
                                  {(["akta_tanah_path", "sertifikat_tanah_path", "pelengkap_path"] as const).map((pathKey, idx) => {
                                    const field = (["aktaTanah", "sertifikatTanah", "pelengkap"] as const)[idx];
                                    const label = ["Akta Tanah", "Sertifikat Tanah", "Pelengkap"][idx];
                                    const path = row[pathKey];
                                    return (
                                      <div key={pathKey} style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: 12, background: "#f9fafb" }}>
                                        <div style={{ ...fieldLabelStyle, fontSize: 13, marginBottom: 6 }}>{label}</div>
                                        {path ? (
                                          <div style={{ marginBottom: 8 }}>
                                            <a href={getFileUrl(path)} target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)", fontSize: 13 }}>
                                              {getFileName(path)}
                                            </a>
                                          </div>
                                        ) : (
                                          <div style={{ ...fieldValueStyle, marginBottom: 8 }}>Belum ada file</div>
                                        )}
                                        <input
                                          type="file"
                                          accept="application/pdf,image/jpeg,image/png"
                                          onChange={(e) => {
                                            const f = e.target.files?.[0];
                                            if (f) handleUploadDoc(row.nobooking, field, f);
                                            e.target.value = "";
                                          }}
                                          style={{ fontSize: 12, color: "#0f172a" }}
                                          disabled={isLocked(row)}
                                        />
                                        {docUploading === `${row.nobooking}-${field}` && <span style={{ fontSize: 12, color: "#475569" }}> Mengunggah...</span>}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </td>
                  </tr>
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
