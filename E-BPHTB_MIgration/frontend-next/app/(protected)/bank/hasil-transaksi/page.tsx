"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getApiBase } from "../../../../lib/api";
import { runBankTableTourIfRequested } from "../../../components/tours/bankDashboardTour";

const PAGE_SIZE = 10;
const TABS = ["all", "discrepancy", "matched"] as const;
type TabType = (typeof TABS)[number];

interface BankRow {
  no_registrasi?: string;
  nobooking?: string;
  noppbb?: string;
  namawajibpajak?: string;
  nomor_bukti_pembayaran?: string;
  nominal?: number;
  gateway_nominal_received?: number;
  gateway_status?: string;
  has_discrepancy?: boolean;
  sspd_pembayaran_status?: string;
  tanggal_pembayaran?: string;
  status_verifikasi?: string;
}

interface BankDetail {
  nobooking: string;
  no_registrasi?: string | null;
  noppbb: string;
  namawajibpajak: string;
  tagihan_nominal?: number | null;
  nomor_bukti_pembayaran?: string | null;
  tanggal_pembayaran?: string | null;
  status_verifikasi: string;
  status_dibank: string;
  catatan_bank?: string | null;
  gateway_nominal_received?: number | null;
  gateway_status?: string | null;
  gateway_reference?: string | null;
  gateway_paid_at?: string | null;
  gateway_channel?: string | null;
  has_discrepancy: boolean;
  sspd_pembayaran_status: string;
}

interface ApiResponse {
  success: boolean;
  total?: number;
  totalPages?: number;
  rows?: BankRow[];
  message?: string;
}

function fmtCurrency(n: number | undefined | null): string {
  if (n == null || Number.isNaN(n)) return "-";
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);
}

function monoBigRupiah(n: number | undefined | null): React.ReactNode {
  if (n == null || Number.isNaN(n)) {
    return <span style={{ fontFamily: "ui-monospace, Consolas, monospace", fontSize: 22, fontWeight: 800 }}>—</span>;
  }
  const s = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);
  return (
    <span style={{ fontFamily: "ui-monospace, Consolas, monospace", fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em" }}>
      {s}
    </span>
  );
}

function Badge({ status, hasDisc }: { status: string; hasDisc?: boolean }) {
  const s = String(status || "Pending");
  const isSync = s === "Sinkron Otomatis";
  const isDisc = s === "Selisih" || hasDisc;
  const isApproved = s === "Disetujui";
  const isRejected = s === "Ditolak";
  const style: React.CSSProperties = {
    padding: "4px 10px",
    borderRadius: 8,
    fontSize: 12,
    fontWeight: 600,
    ...(isSync
      ? { background: "linear-gradient(135deg, #0f766e, #0d9488)", color: "white" }
      : isDisc
        ? { background: "linear-gradient(135deg, #ea580c, #c2410c)", color: "white" }
        : isApproved
          ? { background: "linear-gradient(135deg, #10b981, #059669)", color: "white" }
          : isRejected
            ? { background: "linear-gradient(135deg, #ef4444, #dc2626)", color: "white" }
            : { background: "linear-gradient(135deg, #64748b, #475569)", color: "white" }),
  };
  return <span style={style}>{s}</span>;
}

const tabLabel: Record<TabType, string> = {
  all: "Semua transaksi",
  discrepancy: "Ada selisih",
  matched: "Selaras / selesai",
};

export default function BankHasilTransaksiPage() {
  const [currentTab, setCurrentTab] = useState<TabType>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState<BankRow[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [periksaLoading, setPeriksaLoading] = useState<string | null>(null);
  const [detailModal, setDetailModal] = useState<BankDetail | null>(null);
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
    const canAppendQueue = currentTab === "all" && currentPage === 1 && !statusFilter.trim() && !search.trim();
    const t = setInterval(() => load(1, { silent: true, appendOnly: canAppendQueue }), 10000);
    return () => clearInterval(t);
  }, [realTimeEnabled, load, currentPage, currentTab, statusFilter, search]);

  const handleSearch = () => {
    setCurrentPage(1);
    load(1);
  };

  const openPeriksa = async (nobooking: string) => {
    setPeriksaLoading(nobooking);
    try {
      const res = await fetch(`${getApiBase()}/api/bank/transaksi/${encodeURIComponent(nobooking)}/detail`, { credentials: "include" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.success || !data?.data) {
        alert(typeof data?.message === "string" ? data.message : "Gagal memuat detail");
        return;
      }
      setDetailModal(data.data as BankDetail);
    } catch {
      alert("Gagal memuat detail");
    } finally {
      setPeriksaLoading(null);
    }
  };

  const startNumber = (currentPage - 1) * PAGE_SIZE + 1;
  const colCount = 12;

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto" }}>
      <h2 style={{ marginBottom: 12, fontSize: 24, fontWeight: 700, textAlign: "center" }}>Konfirmasi &amp; Rekonsiliasi Pembayaran</h2>
      <p style={{ textAlign: "center", color: "var(--color_font_main_muted)", marginBottom: 8, fontSize: 14, maxWidth: 720, marginLeft: "auto", marginRight: "auto" }}>
        Peran bank: memantau keselarasan nominal payment gateway dengan tagihan di sistem. Pelunasan SSPD di-set otomatis saat gateway melaporkan status PAID.
      </p>
      <p style={{ textAlign: "center", marginBottom: 20, fontSize: 13, color: "var(--color_font_main_muted)" }}>
        Cek NOP PBB di sisi PU untuk melihat nominal/objek yang tercatat di sistem Bappenda:{" "}
        <Link href="/pu/booking-sspd/badan/tambah" prefetch={false} style={{ color: "var(--accent)", fontWeight: 600 }}>
          buka form tambah booking (referensi NOP)
        </Link>
        .
      </p>

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
              padding: "12px 16px",
              border: "none",
              borderRadius: 8,
              fontWeight: 600,
              cursor: "pointer",
              fontSize: 13,
              background: currentTab === tab ? "linear-gradient(135deg, #1e3a5f, #00529B)" : "transparent",
              color: currentTab === tab ? "white" : "var(--color_font_main)",
              boxShadow: currentTab === tab ? "0 2px 8px rgba(0,82,155,0.35)" : "none",
            }}
          >
            {tab === "all" ? "Semua" : tab === "discrepancy" ? "⚠ Selisih" : "✓ Selaras"}
          </button>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          gap: 12,
          marginBottom: 12,
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
          <option value="Pending">Pending</option>
          <option value="Selisih">Selisih</option>
          <option value="Sinkron Otomatis">Sinkron Otomatis</option>
          <option value="Disetujui">Disetujui</option>
          <option value="Ditolak">Ditolak</option>
        </select>
        <input
          type="text"
          placeholder="Cari NOP / No. Registrasi / Booking / Nama WP / No. Bukti"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          style={{
            padding: "8px 12px",
            borderRadius: 8,
            border: "1px solid var(--border_color)",
            background: "var(--card_bg)",
            color: "var(--color_font_main)",
            minWidth: 220,
            flex: "1 1 200px",
          }}
        />
        <button
          type="button"
          onClick={() => handleSearch()}
          style={{
            padding: "8px 16px",
            borderRadius: 8,
            border: "none",
            background: "linear-gradient(135deg, #1e3a5f, #00529B)",
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
          Muat ulang
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
            {realTimeEnabled ? "Pause Real-time" : "Start Real-time"}
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
      <p style={{ fontSize: 12, color: "var(--color_font_main_muted)", marginBottom: 16, paddingLeft: 4 }}>
        Tab aktif: <strong>{tabLabel[currentTab]}</strong>. Kolom &quot;Nominal gateway&quot; berasal dari callback payment gateway (status PAID).
      </p>

      <div
        id="bank-tour-table"
        style={{ overflowX: "auto", background: "var(--card_bg)", borderRadius: 16, border: "1px solid var(--border_color)", boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 980 }}>
          <thead>
            <tr style={{ background: "linear-gradient(135deg, #0a1628 0%, #1e3a5f 50%, #00529B 100%)", border: "none" }}>
              <th style={thStyle}>No</th>
              <th style={thStyle}>No. Reg</th>
              <th style={thStyle}>Booking</th>
              <th style={thStyle}>NOP PBB</th>
              <th style={thStyle}>Nama WP</th>
              <th style={thStyle}>No. Bukti</th>
              <th style={thStyle}>Tagihan sistem</th>
              <th style={thStyle}>Nominal gateway</th>
              <th style={thStyle}>SSPD</th>
              <th style={thStyle}>Tgl bayar</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={colCount} style={{ padding: 40, textAlign: "center", color: "var(--color_font_main_muted)" }}>
                  Memuat...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={colCount} style={{ padding: 40, textAlign: "center", color: "#ef4444" }}>
                  {error}
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={colCount} style={{ padding: 40, textAlign: "center", color: "var(--color_font_main_muted)" }}>
                  Tidak ada data
                </td>
              </tr>
            ) : (
              rows.map((r, idx) => (
                <tr key={r.nobooking || idx} style={{ borderBottom: "1px solid var(--border_color)", background: r.has_discrepancy ? "rgba(234, 88, 12, 0.06)" : undefined }}>
                  <td style={tdStyle}>{startNumber + idx}</td>
                  <td style={tdStyle}>{r.no_registrasi || "-"}</td>
                  <td style={tdStyle}>{r.nobooking || "-"}</td>
                  <td style={{ ...tdStyle, fontFamily: "ui-monospace, Consolas, monospace", fontSize: 12 }}>{r.noppbb || "-"}</td>
                  <td style={tdStyle}>{r.namawajibpajak || "-"}</td>
                  <td style={tdStyle}>{r.nomor_bukti_pembayaran || "-"}</td>
                  <td style={{ ...tdStyle, textAlign: "right", fontWeight: 700, fontFamily: "ui-monospace, Consolas, monospace" }}>{fmtCurrency(r.nominal)}</td>
                  <td style={{ ...tdStyle, textAlign: "right", fontWeight: 800, fontFamily: "ui-monospace, Consolas, monospace", color: "#00529B" }}>
                    {r.gateway_nominal_received != null ? fmtCurrency(r.gateway_nominal_received) : "—"}
                  </td>
                  <td style={tdStyle}>{r.sspd_pembayaran_status || "-"}</td>
                  <td style={tdStyle}>{r.tanggal_pembayaran || "-"}</td>
                  <td style={tdStyle}>
                    <Badge status={r.status_verifikasi ?? ""} hasDisc={r.has_discrepancy} />
                  </td>
                  <td style={{ ...tdStyle, textAlign: "center" }}>
                    <button
                      type="button"
                      disabled={periksaLoading !== null || !r.nobooking}
                      onClick={() => r.nobooking && openPeriksa(r.nobooking)}
                      style={{
                        padding: "8px 14px",
                        border: "2px solid #00529B",
                        borderRadius: 6,
                        background: "#fff",
                        color: "#00529B",
                        fontWeight: 700,
                        cursor: periksaLoading ? "not-allowed" : "pointer",
                        fontSize: 13,
                      }}
                    >
                      {periksaLoading === r.nobooking ? "…" : "Periksa"}
                    </button>
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

      {detailModal && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 80,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
            background: "rgba(10, 22, 40, 0.45)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
          }}
          onClick={() => setDetailModal(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 480,
              borderRadius: 4,
              overflow: "hidden",
              boxShadow: "0 24px 48px rgba(0,0,0,0.35)",
              border: "1px solid #0a1628",
              background: "#ffffff",
            }}
          >
            <div
              style={{
                background: "linear-gradient(180deg, #00529B 0%, #003d73 100%)",
                color: "#fff",
                padding: "14px 18px",
                fontWeight: 800,
                fontSize: 15,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                fontFamily: "system-ui, sans-serif",
              }}
            >
              BCA — Mutasi Digital (preview)
            </div>
            <div style={{ padding: "20px 22px", background: "#fafafa", color: "#0a1628" }}>
              <p style={{ margin: "0 0 6px", fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em" }}>Referensi</p>
              <p style={{ margin: "0 0 16px", fontFamily: "ui-monospace, Consolas, monospace", fontSize: 13, fontWeight: 600 }}>
                {detailModal.gateway_reference || detailModal.nobooking}
              </p>

              <div style={{ display: "grid", gap: 14 }}>
                <div>
                  <p style={{ margin: 0, fontSize: 11, color: "#64748b", fontWeight: 700 }}>NOMINAL MASUK (GATEWAY)</p>
                  <div style={{ marginTop: 4, color: "#00529B" }}>{monoBigRupiah(detailModal.gateway_nominal_received ?? null)}</div>
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: 11, color: "#64748b", fontWeight: 700 }}>TAGIHAN SISTEM (BAPPENDA)</p>
                  <div style={{ marginTop: 4, color: "#0f172a" }}>{monoBigRupiah(detailModal.tagihan_nominal ?? null)}</div>
                </div>
              </div>

              {detailModal.has_discrepancy && (
                <div
                  style={{
                    marginTop: 18,
                    padding: 10,
                    borderRadius: 6,
                    background: "#fff7ed",
                    border: "1px solid #fdba74",
                    color: "#9a3412",
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  Perhatian: terdeteksi selisih antara nominal gateway dan tagihan sistem.
                </div>
              )}

              <hr style={{ margin: "18px 0", border: "none", borderTop: "1px dashed #cbd5e1" }} />

              <dl style={{ margin: 0, display: "grid", gap: 8, fontSize: 13, fontFamily: "ui-monospace, Consolas, monospace" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <dt style={{ color: "#64748b" }}>NOP PBB</dt>
                  <dd style={{ margin: 0, textAlign: "right", fontWeight: 600 }}>{detailModal.noppbb || "—"}</dd>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <dt style={{ color: "#64748b" }}>Nama WP</dt>
                  <dd style={{ margin: 0, textAlign: "right", fontWeight: 600, fontFamily: "system-ui" }}>{detailModal.namawajibpajak || "—"}</dd>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <dt style={{ color: "#64748b" }}>Channel</dt>
                  <dd style={{ margin: 0 }}>{detailModal.gateway_channel || "—"}</dd>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <dt style={{ color: "#64748b" }}>Status gateway</dt>
                  <dd style={{ margin: 0 }}>{detailModal.gateway_status || "—"}</dd>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <dt style={{ color: "#64748b" }}>Waktu PAID</dt>
                  <dd style={{ margin: 0 }}>{detailModal.gateway_paid_at || "—"}</dd>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <dt style={{ color: "#64748b" }}>SSPD</dt>
                  <dd style={{ margin: 0, fontWeight: 700 }}>{detailModal.sspd_pembayaran_status}</dd>
                </div>
              </dl>

              <button
                type="button"
                onClick={() => setDetailModal(null)}
                style={{
                  marginTop: 22,
                  width: "100%",
                  padding: "12px",
                  border: "none",
                  borderRadius: 6,
                  background: "#00529B",
                  color: "#fff",
                  fontWeight: 800,
                  cursor: "pointer",
                  fontSize: 14,
                }}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: "14px 10px",
  textAlign: "center",
  fontWeight: 600,
  color: "#fff",
  fontSize: 11,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
};

const tdStyle: React.CSSProperties = { padding: "10px 8px", fontSize: 13, verticalAlign: "middle" };
