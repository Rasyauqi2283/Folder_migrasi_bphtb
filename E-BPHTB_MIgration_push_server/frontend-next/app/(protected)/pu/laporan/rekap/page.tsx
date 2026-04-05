"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { getApiBase } from "../../../../../lib/api";

const LIMIT = 10;
const MONTHS: { value: string; label: string }[] = [
  { value: "", label: "SEMUA" },
  { value: "01", label: "Januari" }, { value: "02", label: "Februari" }, { value: "03", label: "Maret" },
  { value: "04", label: "April" }, { value: "05", label: "Mei" }, { value: "06", label: "Juni" },
  { value: "07", label: "Juli" }, { value: "08", label: "Agustus" }, { value: "09", label: "September" },
  { value: "10", label: "Oktober" }, { value: "11", label: "November" }, { value: "12", label: "Desember" },
];

type RekapRow = {
  nobooking: string;
  no_registrasi?: string | null;
  noppbb: string;
  tanggal?: string;
  tahunajb: string;
  namawajibpajak: string;
  namapemilikobjekpajak: string;
  npwpwajibpajak: string;
  trackstatus: string;
  status_tertampil?: string | null;
  wp_sign_status?: string | null;
  tanggal_formatted?: string;
  bphtb_yangtelah_dibayar?: number;
  totalNominal?: number;
};

type RekapResponse = {
  success: boolean;
  message?: string;
  rows?: RekapRow[];
  totalNominal?: number;
  pagination?: { page: number; limit: number; total: number; totalPages: number };
};

const tableScrollStyle: React.CSSProperties = {
  background: "#fff",
  borderRadius: 12,
  border: "1px solid var(--border_color)",
  boxShadow: "var(--card_shadow)",
  overflow: "hidden",
  width: "100%",
};
const thStyle: React.CSSProperties = {
  padding: "16px 12px",
  textAlign: "center",
  fontWeight: 600,
  color: "#fff",
  border: "none",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  fontSize: 12,
};
const tdStyle: React.CSSProperties = {
  padding: 12,
  border: "none",
  color: "var(--color_font_main)",
  fontSize: 13,
  verticalAlign: "middle",
  textAlign: "center",
};

function parseMonthYear(tanggal_formatted?: string): { month: number; year: number } | null {
  if (!tanggal_formatted || typeof tanggal_formatted !== "string") return null;
  const m = tanggal_formatted.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) return null;
  const day = parseInt(m[1], 10);
  const month = parseInt(m[2], 10);
  const year = parseInt(m[3], 10);
  if (month >= 1 && month <= 12) return { month, year };
  if (day >= 1 && day <= 31) return { month: day, year: month }; // DD/MM/YYYY
  return null;
}

export default function LaporanRekapPPATPage() {
  const [rows, setRows] = useState<RekapRow[]>([]);
  const [fullRows, setFullRows] = useState<RekapRow[] | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalNominal, setTotalNominal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [invitingNobooking, setInvitingNobooking] = useState<string>("");
  const [search, setSearch] = useState("");
  const [filterTahun, setFilterTahun] = useState("");
  const [filterBulan, setFilterBulan] = useState("");

  const load = useCallback(
    async (p: number, limitOverride?: number) => {
      setLoading(true);
      setError(null);
      try {
        const limit = limitOverride ?? LIMIT;
        const params = new URLSearchParams({
          page: String(limitOverride ? 1 : p),
          limit: String(limit),
          ...(search ? { q: search } : {}),
        });
        const res = await fetch(`${getApiBase()}/api/ppat/rekap/diserahkan?${params}`, { credentials: "include" });
        const json = (await res.json()) as RekapResponse;
        if (!res.ok || !json.success) {
          setError(json?.message || "Gagal memuat data");
          setRows([]);
          if (limitOverride) setFullRows([]);
          return;
        }
        const list = Array.isArray(json.rows) ? json.rows : [];
        setTotalNominal(json.totalNominal ?? 0);
        if (limitOverride) {
          setFullRows(list);
          setTotalPages(1);
        } else {
          setRows(list);
          setTotalPages(json.pagination?.totalPages ?? 1);
        }
      } catch {
        setError("Gagal memuat data");
        setRows([]);
        if (limitOverride) setFullRows([]);
      } finally {
        setLoading(false);
      }
    },
    [search]
  );

  const hasFilter = !!(filterTahun || filterBulan);
  useEffect(() => {
    if (hasFilter) load(1, 10000);
    else load(page);
  }, [hasFilter ? undefined : page, load, hasFilter]);

  useEffect(() => {
    if (hasFilter) return;
    setFullRows(null);
  }, [hasFilter]);

  const filteredRows = (() => {
    const source = hasFilter && fullRows ? fullRows : rows;
    if (!hasFilter) return source;
    return source.filter((r) => {
      const parsed = parseMonthYear(r.tanggal_formatted);
      if (!parsed) return true;
      if (filterTahun && String(parsed.year) !== filterTahun) return false;
      if (filterBulan && String(parsed.month).padStart(2, "0") !== filterBulan) return false;
      return true;
    });
  })();

  const paginatedDisplay = hasFilter
    ? filteredRows.slice((page - 1) * LIMIT, page * LIMIT)
    : filteredRows;
  const effectiveTotalPages = hasFilter
    ? Math.max(1, Math.ceil(filteredRows.length / LIMIT))
    : totalPages;

  const inviteWpSign = async (nobooking: string) => {
    const nikNpwp = window.prompt("Masukkan NIK/NPWP WP untuk undangan tanda tangan:");
    if (!nikNpwp) return;
    const email = window.prompt("Masukkan email WP:");
    if (!email) return;

    setInvitingNobooking(nobooking);
    setActionMessage(null);
    try {
      const res = await fetch(`${getApiBase()}/api/wp/invite-sign`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nobooking,
          nik_npwp: nikNpwp.trim(),
          email: email.trim().toLowerCase(),
        }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok || !j?.success) {
        setActionMessage(j?.error || j?.message || "Gagal membuat undangan tanda tangan WP.");
        return;
      }
      setActionMessage("Undangan tanda tangan WP berhasil dibuat dari modul rekap.");
      await load(page);
    } catch {
      setActionMessage("Gagal mengirim undangan tanda tangan WP.");
    } finally {
      setInvitingNobooking("");
    }
  };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ marginBottom: 8, color: "var(--color_font_main)", fontSize: 28, fontWeight: 700 }}>
        Laporan Rekap Bulanan PPAT
      </div>
      <div style={{ marginBottom: 24, color: "var(--color_font_muted)", fontSize: 14 }}>
        Pemerintah Kabupaten Bogor
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 20,
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <label style={{ fontWeight: 600, fontSize: 14 }}>Tahun Lap PPAT:</label>
          <input
            type="text"
            placeholder="yyyy"
            maxLength={4}
            value={filterTahun}
            onChange={(e) => setFilterTahun(e.target.value.replace(/\D/g, "").slice(0, 4))}
            style={{ width: 80, padding: "8px 12px", borderRadius: 6, border: "1px solid var(--border_color)" }}
          />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <label style={{ fontWeight: 600, fontSize: 14 }}>Bulan:</label>
          <select
            value={filterBulan}
            onChange={(e) => setFilterBulan(e.target.value)}
            style={{ padding: "8px 12px", borderRadius: 6, border: "1px solid var(--border_color)", minWidth: 120 }}
          >
            {MONTHS.map((m) => (
              <option key={m.value || "all"} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <label style={{ fontWeight: 600, fontSize: 14 }}>Cari:</label>
          <input
            type="text"
            placeholder="Cari data..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (setPage(1), load(1))}
            style={{ padding: "8px 12px", borderRadius: 6, border: "1px solid var(--border_color)", minWidth: 200 }}
          />
        </div>
        <button
          type="button"
          onClick={() => { setPage(1); load(1); }}
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
          onClick={() => load(page)}
          style={{
            padding: "8px 16px",
            borderRadius: 8,
            border: "none",
            background: "linear-gradient(135deg, #06b6d4, #0891b2)",
            color: "white",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Refresh
        </button>
      </div>

      {totalNominal > 0 && (
        <p style={{ marginBottom: 12, fontSize: 14, color: "var(--color_font_main)" }}>
          Total nominal: <strong>{new Intl.NumberFormat("id-ID").format(totalNominal)}</strong>
        </p>
      )}

      {error && (
        <div style={{ padding: 12, marginBottom: 16, background: "#fef2f2", color: "#b91c1c", borderRadius: 8 }}>
          {error}
        </div>
      )}
      {actionMessage && (
        <div style={{ padding: 12, marginBottom: 16, background: "#ecfeff", color: "#0f766e", borderRadius: 8 }}>
          {actionMessage}
        </div>
      )}

      <div style={tableScrollStyle}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            padding: "12px 16px",
            background: "var(--accent)",
            color: "#fff",
          }}
        >
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Daftar Rekap Diserahkan</h2>
        </div>
        <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 980 }}>
          <thead>
            <tr style={{ background: "var(--accent)" }}>
              <th style={thStyle}>No. Registrasi</th>
              <th style={thStyle}>No. Booking</th>
              <th style={thStyle}>No. PPBB</th>
              <th style={thStyle}>Tahun AJB</th>
              <th style={thStyle}>Nama Wajib Pajak</th>
              <th style={thStyle}>Nama Pemilik Objek</th>
              <th style={thStyle}>NPWP</th>
              <th style={thStyle}>Output</th>
              <th style={thStyle}>WP Sign</th>
              <th style={thStyle}>Tanggal</th>
              <th style={thStyle}>BPHTB Dibayar</th>
              <th style={thStyle}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={12} style={{ ...tdStyle, textAlign: "center", padding: 32 }}>
                  Memuat...
                </td>
              </tr>
            ) : paginatedDisplay.length === 0 ? (
              <tr>
                <td colSpan={12} style={{ ...tdStyle, textAlign: "center", color: "var(--color_font_muted)", padding: 40 }}>
                  Tidak ada data rekap diserahkan
                </td>
              </tr>
            ) : (
              paginatedDisplay.map((r, i) => (
                <tr
                  key={r.nobooking}
                  style={{
                    background: i % 2 === 0 ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.8)",
                  }}
                >
                  <td style={tdStyle}>{r.no_registrasi || "—"}</td>
                  <td style={tdStyle}>{r.nobooking}</td>
                  <td style={tdStyle}>{r.noppbb || "—"}</td>
                  <td style={tdStyle}>{r.tahunajb || "—"}</td>
                  <td style={tdStyle}>{r.namawajibpajak || "—"}</td>
                  <td style={tdStyle}>{r.namapemilikobjekpajak || "—"}</td>
                  <td style={tdStyle}>{r.npwpwajibpajak || "—"}</td>
                  <td style={tdStyle}>{r.status_tertampil || r.trackstatus || "—"}</td>
                  <td style={tdStyle}>{r.wp_sign_status || "belum_ada"}</td>
                  <td style={tdStyle}>{r.tanggal_formatted || r.tanggal || "—"}</td>
                  <td style={tdStyle}>
                    {r.bphtb_yangtelah_dibayar != null
                      ? new Intl.NumberFormat("id-ID").format(r.bphtb_yangtelah_dibayar)
                      : "—"}
                  </td>
                  <td style={tdStyle}>
                    <button
                      type="button"
                      onClick={() => inviteWpSign(r.nobooking)}
                      disabled={invitingNobooking === r.nobooking}
                      style={{
                        padding: "6px 10px",
                        borderRadius: 6,
                        border: "1px solid #0369a1",
                        background: "#0ea5e9",
                        color: "#fff",
                        cursor: invitingNobooking === r.nobooking ? "not-allowed" : "pointer",
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      {invitingNobooking === r.nobooking ? "Mengirim..." : "Proses TTD WP"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
      </div>

      {effectiveTotalPages > 1 && !loading && (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, marginTop: 20 }}>
          <button
            type="button"
            style={{
              padding: "8px 14px",
              borderRadius: 8,
              border: "1px solid var(--border_color)",
              background: "var(--card_bg)",
              cursor: page <= 1 ? "not-allowed" : "pointer",
            }}
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Sebelumnya
          </button>
          <span style={{ fontSize: 14, color: "var(--color_font_main)" }}>
            Halaman {page} dari {effectiveTotalPages}
          </span>
          <button
            type="button"
            style={{
              padding: "8px 14px",
              borderRadius: 8,
              border: "1px solid var(--border_color)",
              background: "var(--card_bg)",
              cursor: page >= effectiveTotalPages ? "not-allowed" : "pointer",
            }}
            disabled={page >= effectiveTotalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Selanjutnya
          </button>
        </div>
      )}

      <p style={{ marginTop: 24 }}>
        <Link href="/pu/laporan" style={{ color: "var(--accent)" }}>← Kembali ke Laporan PPAT</Link>
      </p>
    </div>
  );
}
