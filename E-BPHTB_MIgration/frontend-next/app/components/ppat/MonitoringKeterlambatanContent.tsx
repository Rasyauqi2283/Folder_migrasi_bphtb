"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getApiBase } from "../../../lib/api";
import {
  getCountdownToMonthTenth,
  isInPreDeadlineCountdownWindow,
} from "../../../lib/ppatReportingDeadline";

const MONTHS = [
  { value: "", label: "Semua Bulan" },
  { value: "01", label: "Januari" }, { value: "02", label: "Februari" }, { value: "03", label: "Maret" },
  { value: "04", label: "April" }, { value: "05", label: "Mei" }, { value: "06", label: "Juni" },
  { value: "07", label: "Juli" }, { value: "08", label: "Agustus" }, { value: "09", label: "September" },
  { value: "10", label: "Oktober" }, { value: "11", label: "November" }, { value: "12", label: "Desember" },
];

type Row = {
  nama_pejabat?: string;
  nip?: string;
  userid?: string;
  periode?: string;
  jatuh_tempo?: string;
  hari_terlambat?: number;
  status_akun?: string;
  status?: string;
  sudah_lapor?: boolean;
  keterangan?: string;
};

type Summary = {
  total_pejabat?: number;
  sudah_lapor?: number;
  terlambat_atau_terblokir?: number;
  periode_label?: string;
};

type Props = {
  /** Tautan kembali (PU vs admin) */
  backHref: string;
  backLabel: string;
  showCountdownBanner: boolean;
};

export default function MonitoringKeterlambatanContent({ backHref, backLabel, showCountdownBanner }: Props) {
  const { user } = useAuth();
  const isAdmin = (user?.divisi ?? "") === "Administrator";

  const [rows, setRows] = useState<Row[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterTahun, setFilterTahun] = useState(String(new Date().getFullYear()));
  const [filterBulan, setFilterBulan] = useState("");
  const [search, setSearch] = useState("");
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60_000);
    return () => clearInterval(id);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filterTahun) params.set("tahun", filterTahun);
      if (filterBulan) params.set("bulan", filterBulan);
      if (search.trim()) params.set("q", search.trim());
      const url = `${getApiBase()}/api/ppat/monitoring-keterlambatan?${params.toString()}`;
      const res = await fetch(url, { credentials: "include" });
      const json = await res.json().catch(() => ({ success: false }));
      if (!res.ok) {
        throw new Error((json as { message?: string }).message || `HTTP ${res.status}`);
      }
      const data = (json as { rows?: Row[]; summary?: Summary }).rows ?? [];
      setRows(Array.isArray(data) ? data : []);
      setSummary((json as { summary?: Summary }).summary ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat data");
      setRows([]);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }, [filterTahun, filterBulan, search]);

  useEffect(() => {
    load();
  }, [load]);

  const cd = useMemo(() => {
    void tick;
    if (!showCountdownBanner || !isInPreDeadlineCountdownWindow()) return null;
    return getCountdownToMonthTenth();
  }, [showCountdownBanner, tick]);

  const bannerUrgent = cd?.urgent;
  const bannerStyle = cd
    ? {
        padding: 16,
        marginBottom: 16,
        borderRadius: 12,
        border: `2px solid ${bannerUrgent ? "#dc2626" : "#ca8a04"}`,
        background: bannerUrgent ? "rgba(239,68,68,0.12)" : "rgba(234,179,8,0.15)",
        color: "var(--color_font_main)",
      }
    : null;

  const notify = async (targetUserid: string) => {
    try {
      await fetch(`${getApiBase()}/api/ppat/monitoring-keterlambatan/notify`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userid: targetUserid }),
      });
      alert("Notifikasi dicatat.");
    } catch {
      alert("Gagal mengirim permintaan notifikasi.");
    }
  };

  const unblock = async (targetUserid: string) => {
    if (!confirm("Buka blokir manual untuk user ini?")) return;
    try {
      const res = await fetch(`${getApiBase()}/api/ppat/monitoring-keterlambatan/unblock`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userid: targetUserid }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert((j as { message?: string }).message ?? "Gagal");
        return;
      }
      load();
    } catch {
      alert("Gagal membuka blokir.");
    }
  };

  const badgeColor = (akun?: string) => {
    const a = (akun ?? "").toLowerCase();
    if (a === "terblokir") return { bg: "rgba(239,68,68,0.15)", fg: "#b91c1c" };
    if (a === "peringatan") return { bg: "rgba(234,179,8,0.2)", fg: "#a16207" };
    return { bg: "rgba(16,185,129,0.15)", fg: "#047857" };
  };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>
      {showCountdownBanner && cd && bannerStyle && (
        <div style={bannerStyle}>
          <strong>Segera laporkan akta Anda!</strong> Sisa waktu: {cd.days} hari {cd.hours} jam sebelum akses
          pembuatan SSPD baru diblokir (batas tgl 10).{" "}
          <Link href="/pu/laporan/unggah-laporan-bulanan" style={{ color: "var(--accent)" }}>
            Unggah laporan
          </Link>
        </div>
      )}

      {showCountdownBanner && isInPreDeadlineCountdownWindow() && cd && (
        <div
          style={{
            marginBottom: 20,
            padding: 20,
            borderRadius: 16,
            border: `3px solid ${cd.urgent ? "#dc2626" : "#eab308"}`,
            background: cd.urgent ? "linear-gradient(135deg, #fef2f2, #fff)" : "linear-gradient(135deg, #fffbeb, #fff)",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--color_font_muted)" }}>Hitung mundur jatuh tempo (tgl 10)</div>
          <div style={{ fontSize: 42, fontWeight: 800, color: cd.urgent ? "#dc2626" : "#ca8a04" }}>
            {cd.days} <span style={{ fontSize: 20 }}>hari</span> {cd.hours} <span style={{ fontSize: 20 }}>jam</span>
          </div>
        </div>
      )}

      <div style={{ marginBottom: 8, color: "var(--color_font_main)", fontSize: 28, fontWeight: 700 }}>
        Monitoring Keterlambatan Dokumen PPAT
      </div>
      <p style={{ margin: "0 0 24px", color: "var(--color_font_muted)", fontSize: 14 }}>
        Kepatuhan laporan bulanan (jatuh tempo tgl 10). {isAdmin ? "Tampilan administrator: semua pejabat umum." : "Anda melihat data akun Anda."}
      </p>

      {summary && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 16,
            marginBottom: 24,
          }}
        >
          <div style={{ padding: 20, borderRadius: 14, border: "1px solid var(--border_color)", background: "var(--card_bg)" }}>
            <div style={{ fontSize: 13, color: "var(--color_font_muted)" }}>Total pejabat umum</div>
            <div style={{ fontSize: 28, fontWeight: 700 }}>{summary.total_pejabat ?? 0}</div>
          </div>
          <div style={{ padding: 20, borderRadius: 14, border: "1px solid var(--border_color)", background: "linear-gradient(135deg,#fff,#f0fdf4)" }}>
            <div style={{ fontSize: 13, color: "var(--color_font_muted)" }}>Sudah lapor</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#059669" }}>{summary.sudah_lapor ?? 0}</div>
          </div>
          <div style={{ padding: 20, borderRadius: 14, border: "1px solid var(--border_color)", background: "linear-gradient(135deg,#fff,#fef2f2)" }}>
            <div style={{ fontSize: 13, color: "var(--color_font_muted)" }}>Terlambat / terblokir</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#dc2626" }}>{summary.terlambat_atau_terblokir ?? 0}</div>
          </div>
        </div>
      )}

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 20,
          alignItems: "center",
          padding: 16,
          background: "var(--card_bg)",
          borderRadius: 12,
          border: "1px solid var(--border_color)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <label style={{ fontWeight: 600, fontSize: 14 }}>Tahun:</label>
          <input
            type="text"
            placeholder="yyyy"
            maxLength={4}
            value={filterTahun}
            onChange={(e) => setFilterTahun(e.target.value.replace(/\D/g, "").slice(0, 4))}
            style={{ width: 80, padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border_color)" }}
          />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <label style={{ fontWeight: 600, fontSize: 14 }}>Bulan:</label>
          <select
            value={filterBulan}
            onChange={(e) => setFilterBulan(e.target.value)}
            style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border_color)", minWidth: 140 }}
          >
            {MONTHS.map((m) => (
              <option key={m.value || "all"} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>
        <input
          type="text"
          placeholder="Cari nama, NIP, userid…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && load()}
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
            border: "none",
            background: "linear-gradient(135deg, #3b82f6, #2563eb)",
            color: "#fff",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Cari
        </button>
      </div>

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
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            padding: "12px 16px",
            background: "var(--accent)",
            color: "#fff",
          }}
        >
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Daftar monitoring</h2>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}>
            <thead>
              <tr>
                <th style={th}>No</th>
                <th style={th}>Nama pejabat</th>
                <th style={th}>NIP / ID</th>
                <th style={th}>Periode</th>
                <th style={th}>Jatuh tempo</th>
                <th style={th}>Hari terlambat</th>
                <th style={th}>Status akun</th>
                {isAdmin && <th style={th}>Aksi</th>}
                <th style={th}>Rincian</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={isAdmin ? 9 : 8} style={{ padding: 40, textAlign: "center", color: "var(--color_font_muted)" }}>
                    Memuat…
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 9 : 8} style={{ padding: 40, textAlign: "center", color: "var(--color_font_muted)" }}>
                    Tidak ada data.
                  </td>
                </tr>
              ) : (
                rows.map((r, i) => {
                  const colors = badgeColor(r.status_akun);
                  const uid = r.userid ?? "";
                  return (
                    <tr key={`${uid}-${i}`} style={{ borderBottom: "1px solid var(--border_color)" }}>
                      <td style={tdc}>{i + 1}</td>
                      <td style={td}>{r.nama_pejabat ?? "—"}</td>
                      <td style={td}>{r.nip || uid || "—"}</td>
                      <td style={td}>{r.periode ?? "—"}</td>
                      <td style={td}>{r.jatuh_tempo ?? "—"}</td>
                      <td style={tdc}>{r.hari_terlambat ?? 0}</td>
                      <td style={tdc}>
                        <span style={{ padding: "4px 10px", borderRadius: 8, fontSize: 12, fontWeight: 600, background: colors.bg, color: colors.fg }}>
                          {r.status_akun === "terblokir" ? "Terblokir" : r.status_akun === "peringatan" ? "Peringatan" : "Aktif"}
                        </span>
                      </td>
                      {isAdmin && (
                        <td style={td}>
                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                            <button
                              type="button"
                              onClick={() => notify(uid)}
                              style={{ fontSize: 12, padding: "6px 10px", borderRadius: 6, border: "1px solid var(--border_color)", cursor: "pointer" }}
                            >
                              Kirim notifikasi
                            </button>
                            <button
                              type="button"
                              onClick={() => unblock(uid)}
                              style={{ fontSize: 12, padding: "6px 10px", borderRadius: 6, border: "1px solid #fca5a5", background: "#fff1f2", cursor: "pointer" }}
                            >
                              Buka blokir
                            </button>
                          </div>
                        </td>
                      )}
                      <td style={td}>
                        {isAdmin && uid ? (
                          <Link href={`/admin/referensi/pemutakhiran-ppat/${encodeURIComponent(uid)}`} style={{ color: "var(--accent)", fontSize: 13 }}>
                            Data PPAT
                          </Link>
                        ) : (
                          <Link href="/pu/laporan/rincian" style={{ color: "var(--accent)", fontSize: 13 }}>
                            Rincian saya
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p style={{ marginTop: 24 }}>
        <Link href={backHref} style={{ color: "var(--accent)" }}>{backLabel}</Link>
      </p>
    </div>
  );
}

const th: React.CSSProperties = {
  padding: "16px 12px",
  textAlign: "center",
  color: "#fff",
  fontWeight: 600,
  fontSize: 12,
  textTransform: "uppercase",
};

const td: React.CSSProperties = { padding: 12, fontSize: 13 };
const tdc: React.CSSProperties = { ...td, textAlign: "center" };
