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

interface DocItem {
  url: string;
  name: string;
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
  const [selectedBooking, setSelectedBooking] = useState<string>("");
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [showDocsModal, setShowDocsModal] = useState(false);
  const [docs, setDocs] = useState<DocItem[]>([]);
  const [docsLoading, setDocsLoading] = useState(false);
  const [pbbCheckNo, setPbbCheckNo] = useState("");
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
        if (!selectedBooking && list.length > 0 && list[0].nobooking) {
          setSelectedBooking(list[0].nobooking);
        }
        if (selectedBooking && !list.some((r) => r.nobooking === selectedBooking)) {
          setSelectedBooking(list[0]?.nobooking || "");
        }
        setTotalRecords(typeof data.total === "number" ? data.total : list.length);
        setTotalPages(typeof data.totalPages === "number" ? data.totalPages : Math.max(1, Math.ceil((data.total ?? list.length) / PAGE_SIZE)));
      } catch (e) {
        setError(e instanceof Error ? e.message : "Gagal memuat data");
        setRows([]);
      } finally {
        setLoading(false);
      }
  }, [currentPage, selectedBooking]);

  useEffect(() => {
    load(currentPage);
  }, [currentPage, load]);

  const handleSearch = () => {
    setCurrentPage(1);
    load(1);
  };

  const selectedRow = rows.find((r) => r.nobooking === selectedBooking);
  const canAct = Boolean(selectedBooking) && !actionLoading;

  const openDocuments = async () => {
    if (!selectedBooking) return;
    setDocs([]);
    setDocsLoading(true);
    setShowDocsModal(true);
    try {
      const res = await fetch(`${getApiBase()}/api/ltb/terima-berkas-sspd/${encodeURIComponent(selectedBooking)}/documents`, { credentials: "include" });
      const data = await res.json().catch(() => ({ success: false }));
      if (!res.ok || !data?.success) throw new Error(data?.message || "Gagal mengambil dokumen");
      const list = Array.isArray(data.documents) ? data.documents : [];
      setDocs(list);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Gagal mengambil dokumen");
      setShowDocsModal(false);
    } finally {
      setDocsLoading(false);
    }
  };

  const submitReject = async () => {
    if (!selectedBooking || !rejectReason.trim()) return;
    setActionLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`${getApiBase()}/api/ltb/terima-berkas-sspd/${encodeURIComponent(selectedBooking)}/reject`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: rejectReason.trim() }),
      });
      const data = await res.json().catch(() => ({ success: false }));
      if (!res.ok || !data?.success) throw new Error(data?.message || "Gagal menolak berkas");
      setShowRejectModal(false);
      setRejectReason("");
      setMessage("Berkas berhasil ditolak.");
      await load(currentPage);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Gagal menolak berkas");
    } finally {
      setActionLoading(false);
    }
  };

  const submitSend = async () => {
    if (!selectedBooking || !pbbCheckNo.trim()) {
      setMessage("No PBB pemeriksaan wajib diisi.");
      return;
    }
    setActionLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`${getApiBase()}/api/ltb/terima-berkas-sspd/${encodeURIComponent(selectedBooking)}/send`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pbb_check_no: pbbCheckNo.trim() }),
      });
      const data = await res.json().catch(() => ({ success: false }));
      if (!res.ok || !data?.success) throw new Error(data?.message || "Gagal mengirim ke verifikasi");
      setMessage("Berkas berhasil dikirim ke proses verifikasi.");
      await load(currentPage);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Gagal mengirim ke verifikasi");
    } finally {
      setActionLoading(false);
    }
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
          disabled={!canAct}
          onClick={openDocuments}
          style={{
            padding: "10px 20px",
            borderRadius: 8,
            border: "none",
            background: canAct ? "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)" : "linear-gradient(135deg, #93c5fd 0%, #60a5fa 100%)",
            color: "#fff",
            fontWeight: 600,
            cursor: canAct ? "pointer" : "not-allowed",
            opacity: canAct ? 1 : 0.85,
          }}
        >
          View Dokumen
        </button>
        <button
          type="button"
          disabled={!canAct}
          onClick={() => {
            setRejectReason("");
            setShowRejectModal(true);
          }}
          style={{
            padding: "10px 20px",
            borderRadius: 8,
            border: "none",
            background: canAct ? "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)" : "linear-gradient(135deg, #fca5a5 0%, #f87171 100%)",
            color: "#fff",
            fontWeight: 600,
            cursor: canAct ? "pointer" : "not-allowed",
            opacity: canAct ? 1 : 0.85,
          }}
        >
          Tolak
        </button>
        <input
          type="text"
          placeholder="Tulis disini No pbb yang ada di data untuk diperiksa"
          value={pbbCheckNo}
          onChange={(e) => setPbbCheckNo(e.target.value)}
          style={{
            padding: "10px 14px",
            borderRadius: 8,
            border: "1px solid var(--border_color)",
            minWidth: 320,
            background: "var(--card_bg)",
            color: "var(--color_font_main)",
          }}
        />
        <button
          type="button"
          disabled={!canAct || !pbbCheckNo.trim()}
          onClick={submitSend}
          style={{
            padding: "10px 18px",
            borderRadius: 8,
            border: "none",
            background: canAct && pbbCheckNo.trim() ? "linear-gradient(135deg, #10b981 0%, #059669 100%)" : "#9ca3af",
            color: "#fff",
            fontWeight: 600,
            cursor: canAct && pbbCheckNo.trim() ? "pointer" : "not-allowed",
          }}
        >
          Kirim
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
      {selectedRow?.nobooking && (
        <p style={{ marginTop: -6, marginBottom: 12, color: "var(--color_font_main_muted)", fontSize: 13 }}>
          Booking terpilih: <strong>{selectedRow.nobooking}</strong>
        </p>
      )}
      {message && (
        <div style={{ marginBottom: 12, padding: "10px 12px", borderRadius: 8, border: "1px solid var(--border_color)", background: "var(--card_bg_grey)", color: "var(--color_font_main)" }}>
          {message}
        </div>
      )}

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
                <tr
                  key={r.nobooking || String(idx)}
                  onClick={() => setSelectedBooking(r.nobooking || "")}
                  style={{ background: selectedBooking === r.nobooking ? "rgba(37,99,235,0.12)" : "transparent", cursor: "pointer" }}
                >
                  <td style={tdStyle}>{r.no_registrasi || "—"}</td>
                  <td style={tdStyle}>{r.nobooking || "—"}</td>
                  <td style={tdStyle}>{r.noppbb || "—"}</td>
                  <td style={tdStyle}>{r.namawajibpajak || "—"}</td>
                  <td style={tdStyle}>{r.namapemilikobjekpajak || "—"}</td>
                  <td style={tdStyle}>{r.tanggal_terima || "—"}</td>
                  <td style={tdStyle}>{r.trackstatus || "—"}</td>
                  <td style={{ ...tdStyle, textAlign: "center" }}>
                    <input
                      type="radio"
                      checked={selectedBooking === r.nobooking}
                      onChange={() => setSelectedBooking(r.nobooking || "")}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </td>
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

      {showRejectModal && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}
          onClick={() => setShowRejectModal(false)}
        >
          <div
            style={{ background: "var(--card_bg)", padding: 20, borderRadius: 12, width: "90%", maxWidth: 460, border: "1px solid var(--border_color)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginTop: 0, marginBottom: 8 }}>Alasan Penolakan</h3>
            <p style={{ marginTop: 0, marginBottom: 10, color: "var(--color_font_main_muted)", fontSize: 13 }}>Booking: {selectedBooking || "-"}</p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
              placeholder="Tulis alasan penolakan..."
              style={{ width: "100%", borderRadius: 8, border: "1px solid var(--border_color)", padding: 10, resize: "vertical", marginBottom: 12 }}
            />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button type="button" onClick={() => setShowRejectModal(false)} style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid var(--border_color)", background: "var(--card_bg)", cursor: "pointer" }}>
                Batal
              </button>
              <button type="button" onClick={submitReject} disabled={!rejectReason.trim() || actionLoading} style={{ padding: "8px 14px", borderRadius: 8, border: "none", background: "#ef4444", color: "#fff", cursor: rejectReason.trim() ? "pointer" : "not-allowed" }}>
                Tolak
              </button>
            </div>
          </div>
        </div>
      )}

      {showDocsModal && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}
          onClick={() => setShowDocsModal(false)}
        >
          <div
            style={{ background: "var(--card_bg)", padding: 20, borderRadius: 12, width: "90%", maxWidth: 560, border: "1px solid var(--border_color)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginTop: 0, marginBottom: 12 }}>Dokumen Booking: {selectedBooking || "-"}</h3>
            {docsLoading ? (
              <p style={{ color: "var(--color_font_main_muted)" }}>Memuat dokumen...</p>
            ) : docs.length === 0 ? (
              <p style={{ color: "var(--color_font_main_muted)" }}>Dokumen tidak tersedia.</p>
            ) : (
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                {docs.map((d, idx) => (
                  <li key={`${d.url}-${idx}`} style={{ marginBottom: 6 }}>
                    <a href={`${getApiBase()}/api/ppat/file-proxy?relativePath=${encodeURIComponent(d.url)}`} target="_blank" rel="noopener noreferrer">
                      {d.name || "Dokumen"}
                    </a>
                  </li>
                ))}
              </ul>
            )}
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
              <button type="button" onClick={() => setShowDocsModal(false)} style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid var(--border_color)", background: "var(--card_bg)", cursor: "pointer" }}>
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
