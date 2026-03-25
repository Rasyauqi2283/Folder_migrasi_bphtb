"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getApiBase } from "../../../../lib/api";
import { runBankTableTourIfRequested } from "../../../components/tours/bankDashboardTour";

const PAGE_SIZE = 10;
const TABS = ["pending", "reviewed"] as const;
type TabType = (typeof TABS)[number];

interface BankRow {
  no_registrasi?: string;
  nobooking?: string;
  namawajibpajak?: string;
  nomor_bukti_pembayaran?: string;
  nominal?: number;
  tanggal_pembayaran?: string;
  status_verifikasi?: string;
}

interface ApiResponse {
  success: boolean;
  total?: number;
  totalPages?: number;
  rows?: BankRow[];
  message?: string;
}

function fmtCurrency(n: number | undefined): string {
  if (n == null || Number.isNaN(n)) return "-";
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);
}

function Badge({ status }: { status: string }) {
  const s = String(status || "Pending");
  const isApproved = s === "Disetujui";
  const isRejected = s === "Ditolak";
  const style: React.CSSProperties = {
    padding: "4px 10px",
    borderRadius: 8,
    fontSize: 12,
    fontWeight: 600,
    ...(isApproved
      ? { background: "linear-gradient(135deg, #10b981, #059669)", color: "white" }
      : isRejected
        ? { background: "linear-gradient(135deg, #ef4444, #dc2626)", color: "white" }
        : { background: "linear-gradient(135deg, #f59e0b, #d97706)", color: "white" }),
  };
  return <span style={style}>{s}</span>;
}

export default function BankHasilTransaksiPage() {
  const [currentTab, setCurrentTab] = useState<TabType>("pending");
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState<BankRow[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectTarget, setRejectTarget] = useState<string | null>(null);
  const [realTimeEnabled, setRealTimeEnabled] = useState(true);

  const router = useRouter();
  const searchParams = useSearchParams();

  const rowKey = (r: BankRow, idx = 0) => `${r.nobooking || ""}::${r.no_registrasi || ""}::${idx}`;
  const mergeAppendOnly = (existing: BankRow[], incoming: BankRow[]) => {
    const seen = new Set(existing.map((r, idx) => rowKey(r, idx)));
    const onlyNew = incoming.filter((r, idx) => !seen.has(rowKey(r, idx)));
    return onlyNew.length > 0 ? [...existing, ...onlyNew] : existing;
  };

  const load = useCallback(
    async (
      page = currentPage,
      options?: { silent?: boolean; appendOnly?: boolean }
    ) => {
      const silent = !!options?.silent;
      const appendOnly = !!options?.appendOnly;
      if (!silent) {
        setLoading(true);
        setError(null);
      }
      try {
        const params = new URLSearchParams();
        params.set("tab", currentTab);
        params.set("page", String(page));
        params.set("limit", String(PAGE_SIZE));
        if (statusFilter.trim()) params.set("status", statusFilter.trim());
        if (search.trim()) params.set("q", search.trim());
        const res = await fetch(`${getApiBase()}/api/bank/transaksi?${params.toString()}`, { credentials: "include" });
        const data: ApiResponse = await res.json().catch(() => ({ success: false }));
        if (!res.ok) throw new Error((data as ApiResponse).message || `HTTP ${res.status}`);
        const list = data.rows || [];
        if (appendOnly) {
          setRows((prev) => mergeAppendOnly(prev, list));
        } else {
          setRows(list);
        }
        setTotalRecords((prev) => (typeof data.total === "number" ? data.total : appendOnly ? prev : list.length));
        setTotalPages(typeof data.totalPages === "number" ? data.totalPages : Math.max(1, Math.ceil((data.total ?? list.length) / PAGE_SIZE)));
      } catch (e) {
        if (!silent) {
          setError(e instanceof Error ? e.message : "Gagal memuat data");
          setRows([]);
        }
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [currentTab, currentPage, statusFilter, search]
  );

  useEffect(() => {
    load(currentPage);
  }, [currentTab, currentPage, statusFilter, load]);

  const tourGuideTable = searchParams.get("tourGuide");
  useEffect(() => {
    if (tourGuideTable !== "bank-table") return;
    const t = window.setTimeout(() => {
      runBankTableTourIfRequested(router, searchParams);
    }, 450);
    return () => window.clearTimeout(t);
  }, [router, searchParams, tourGuideTable]);

  useEffect(() => {
    if (!realTimeEnabled) return;
    const canAppendQueue = currentTab === "pending" && currentPage === 1 && !statusFilter.trim() && !search.trim();
    const t = setInterval(() => load(1, { silent: true, appendOnly: canAppendQueue }), 10000);
    return () => clearInterval(t);
  }, [realTimeEnabled, load, currentPage, currentTab, statusFilter, search]);

  const handleSearch = () => {
    setCurrentPage(1);
    load(1);
  };

  const approve = async (nobooking: string) => {
    if (!confirm(`Yakin menyetujui transaksi untuk booking ${nobooking}?`)) return;
    setActionLoading(nobooking);
    try {
      const res = await fetch(`${getApiBase()}/api/bank/transaksi/${encodeURIComponent(nobooking)}/approve`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((data as ApiResponse).message || "Gagal approve");
      await load(currentPage);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Gagal approve");
    } finally {
      setActionLoading(null);
    }
  };

  const openReject = (nobooking: string) => {
    setRejectTarget(nobooking);
    setRejectReason("");
  };

  const submitReject = async () => {
    if (!rejectTarget || !rejectReason.trim()) {
      alert("Alasan penolakan wajib diisi.");
      return;
    }
    if (!confirm(`Yakin menolak booking ${rejectTarget} dengan alasan: "${rejectReason.trim()}"?`)) return;
    setActionLoading(rejectTarget);
    try {
      const res = await fetch(`${getApiBase()}/api/bank/transaksi/${encodeURIComponent(rejectTarget)}/reject`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ catatan: rejectReason.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((data as ApiResponse).message || "Gagal reject");
      setRejectTarget(null);
      setRejectReason("");
      await load(currentPage);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Gagal reject");
    } finally {
      setActionLoading(null);
    }
  };

  const startNumber = (currentPage - 1) * PAGE_SIZE + 1;

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>
      <h2 style={{ marginBottom: 20, fontSize: 24, fontWeight: 700, textAlign: "center" }}>Verifikasi Pembayaran Bank</h2>

      {/* Tabs: Pending Review / Sudah di Review (sama seperti legacy) */}
      <div
        id="bank-tour-tabs"
        style={{
          display: "flex",
          marginBottom: 20,
          background: "var(--card_bg)",
          borderRadius: 12,
          padding: 4,
          border: "1px solid var(--border_color)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        }}
      >
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => {
              setCurrentTab(tab);
              setCurrentPage(1);
            }}
            style={{
              flex: 1,
              padding: "12px 20px",
              border: "none",
              borderRadius: 8,
              fontWeight: 600,
              cursor: "pointer",
              background: currentTab === tab ? "linear-gradient(135deg, #3b82f6, #2563eb)" : "transparent",
              color: currentTab === tab ? "white" : "var(--color_font_main)",
              boxShadow: currentTab === tab ? "0 2px 8px rgba(59,130,246,0.3)" : "none",
            }}
          >
            {tab === "pending" ? "📋 Pending Review" : "✅ Sudah di Review"}
          </button>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          gap: 12,
          marginBottom: 20,
          padding: 16,
          background: "var(--card_bg)",
          borderRadius: 12,
          border: "1px solid var(--border_color)",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <label style={{ fontWeight: 600, marginRight: 8 }}>Filter Status:</label>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          style={{
            padding: "8px 12px",
            borderRadius: 8,
            border: "1px solid var(--border_color)",
            background: "var(--card_bg)",
            color: "var(--color_font_main)",
          }}
        >
          <option value="">Semua</option>
          {currentTab === "pending" ? (
            <option value="Pending">Pending</option>
          ) : (
            <>
              <option value="Disetujui">Disetujui</option>
              <option value="Ditolak">Ditolak</option>
            </>
          )}
        </select>
        <input
          type="text"
          placeholder="Cari No. Registrasi / No. Booking / Nama WP / No. Bukti"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          style={{
            padding: "8px 12px",
            borderRadius: 8,
            border: "1px solid var(--border_color)",
            background: "var(--card_bg)",
            color: "var(--color_font_main)",
            minWidth: 200,
          }}
        />
        <button
          type="button"
          onClick={() => handleSearch()}
          style={{
            padding: "8px 16px",
            borderRadius: 8,
            border: "none",
            background: "linear-gradient(135deg, #3b82f6, #2563eb)",
            color: "white",
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
            padding: "8px 16px",
            borderRadius: 8,
            border: "1px solid var(--border_color)",
            background: "var(--card_bg)",
            color: "var(--color_font_main)",
            cursor: "pointer",
          }}
        >
          🔄 Muat ulang
        </button>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
          <button
            type="button"
            onClick={() => setRealTimeEnabled((v) => !v)}
            style={{
              padding: "8px 14px",
              borderRadius: 8,
              border: "none",
              background: realTimeEnabled ? "#f59e0b" : "#28a745",
              color: "#fff",
              fontWeight: 600,
              cursor: "pointer",
              fontSize: 13,
            }}
          >
            {realTimeEnabled ? "⏸ Pause Real-time" : "▶ Start Real-time"}
          </button>
          <span style={{ fontSize: 12, color: "var(--color_font_main_muted)", display: "flex", alignItems: "center", gap: 6 }}>
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

      <div
        id="bank-tour-table"
        style={{ overflowX: "auto", background: "var(--card_bg)", borderRadius: 16, border: "1px solid var(--border_color)", boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 800 }}>
          <thead>
            <tr style={{ background: "linear-gradient(135deg, #0d1b2a 0%, #1b263b 50%, #415a77 100%)", border: "none" }}>
              <th style={{ padding: "16px 14px", textAlign: "center", fontWeight: 600, color: "#fff", fontSize: 13, textTransform: "uppercase", letterSpacing: "0.05em" }}>No</th>
              <th style={{ padding: "16px 14px", textAlign: "center", fontWeight: 600, color: "#fff", fontSize: 13, textTransform: "uppercase", letterSpacing: "0.05em" }}>No. Registrasi</th>
              <th style={{ padding: "16px 14px", textAlign: "center", fontWeight: 600, color: "#fff", fontSize: 13, textTransform: "uppercase", letterSpacing: "0.05em" }}>No. Booking</th>
              <th style={{ padding: "16px 14px", textAlign: "center", fontWeight: 600, color: "#fff", fontSize: 13, textTransform: "uppercase", letterSpacing: "0.05em" }}>Nama WP</th>
              <th style={{ padding: "16px 14px", textAlign: "center", fontWeight: 600, color: "#fff", fontSize: 13, textTransform: "uppercase", letterSpacing: "0.05em" }}>No. Bukti</th>
              <th style={{ padding: "16px 14px", textAlign: "center", fontWeight: 600, color: "#fff", fontSize: 13, textTransform: "uppercase", letterSpacing: "0.05em" }}>Nominal</th>
              <th style={{ padding: "16px 14px", textAlign: "center", fontWeight: 600, color: "#fff", fontSize: 13, textTransform: "uppercase", letterSpacing: "0.05em" }}>Tanggal Bayar</th>
              <th style={{ padding: "16px 14px", textAlign: "center", fontWeight: 600, color: "#fff", fontSize: 13, textTransform: "uppercase", letterSpacing: "0.05em" }}>Status</th>
              <th style={{ padding: "16px 14px", textAlign: "center", fontWeight: 600, color: "#fff", fontSize: 13, textTransform: "uppercase", letterSpacing: "0.05em" }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} style={{ padding: 40, textAlign: "center", color: "var(--color_font_main_muted)" }}>
                  Memuat...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={9} style={{ padding: 40, textAlign: "center", color: "#ef4444" }}>
                  {error}
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ padding: 40, textAlign: "center", color: "var(--color_font_main_muted)" }}>
                  Tidak ada data
                </td>
              </tr>
            ) : (
              rows.map((r, idx) => (
                <tr key={r.nobooking || idx} style={{ borderBottom: "1px solid var(--border_color)" }}>
                  <td style={{ padding: "12px" }}>{startNumber + idx}</td>
                  <td style={{ padding: "12px" }}>{r.no_registrasi || "-"}</td>
                  <td style={{ padding: "12px" }}>{r.nobooking || "-"}</td>
                  <td style={{ padding: "12px" }}>{r.namawajibpajak || "-"}</td>
                  <td style={{ padding: "12px" }}>{r.nomor_bukti_pembayaran || "-"}</td>
                  <td style={{ padding: "12px", textAlign: "right", fontWeight: 600, color: "#10b981" }}>
                    {fmtCurrency(r.nominal)}
                  </td>
                  <td style={{ padding: "12px" }}>{r.tanggal_pembayaran || "-"}</td>
                  <td style={{ padding: "12px" }}>
                    <Badge status={r.status_verifikasi ?? ""} />
                  </td>
                  <td style={{ padding: "12px", textAlign: "center" }}>
                    {r.status_verifikasi === "Disetujui" || r.status_verifikasi === "Ditolak" ? (
                      "—"
                    ) : (
                      <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                        <button
                          type="button"
                          disabled={actionLoading !== null}
                          onClick={() => approve(r.nobooking!)}
                          style={{
                            padding: "8px 16px",
                            border: "none",
                            borderRadius: 8,
                            background: "linear-gradient(135deg, #10b981, #059669)",
                            color: "white",
                            fontWeight: 600,
                            cursor: actionLoading ? "not-allowed" : "pointer",
                          }}
                        >
                          {actionLoading === r.nobooking ? "..." : "✓ Approve"}
                        </button>
                        <button
                          type="button"
                          disabled={actionLoading !== null}
                          onClick={() => openReject(r.nobooking!)}
                          style={{
                            padding: "8px 16px",
                            border: "none",
                            borderRadius: 8,
                            background: "linear-gradient(135deg, #ef4444, #dc2626)",
                            color: "white",
                            fontWeight: 600,
                            cursor: actionLoading ? "not-allowed" : "pointer",
                          }}
                        >
                          {actionLoading === r.nobooking ? "..." : "✗ Reject"}
                        </button>
                      </div>
                    )}
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

      {rejectTarget && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
          }}
          onClick={() => setRejectTarget(null)}
        >
          <div
            style={{
              background: "var(--card_bg)",
              padding: 24,
              borderRadius: 12,
              maxWidth: 400,
              width: "90%",
              border: "1px solid var(--border_color)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginBottom: 12 }}>Alasan penolakan</h3>
            <p style={{ marginBottom: 8, fontSize: 14, color: "var(--color_font_main_muted)" }}>
              Booking: {rejectTarget}
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Alasan penolakan (wajib)"
              rows={3}
              style={{
                width: "100%",
                padding: 12,
                borderRadius: 8,
                border: "1px solid var(--border_color)",
                marginBottom: 16,
                resize: "vertical",
              }}
            />
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={() => setRejectTarget(null)}
                style={{
                  padding: "8px 16px",
                  border: "1px solid var(--border_color)",
                  borderRadius: 8,
                  background: "var(--card_bg)",
                  cursor: "pointer",
                }}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={submitReject}
                disabled={!rejectReason.trim()}
                style={{
                  padding: "8px 16px",
                  border: "none",
                  borderRadius: 8,
                  background: "#ef4444",
                  color: "white",
                  fontWeight: 600,
                  cursor: rejectReason.trim() ? "pointer" : "not-allowed",
                }}
              >
                Tolak
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
