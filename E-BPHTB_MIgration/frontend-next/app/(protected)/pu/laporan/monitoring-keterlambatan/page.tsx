"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { getApiBase } from "../../../../../lib/api";

const MONTHS = [
  { value: "", label: "Semua Bulan" },
  { value: "01", label: "Januari" }, { value: "02", label: "Februari" }, { value: "03", label: "Maret" },
  { value: "04", label: "April" }, { value: "05", label: "Mei" }, { value: "06", label: "Juni" },
  { value: "07", label: "Juli" }, { value: "08", label: "Agustus" }, { value: "09", label: "September" },
  { value: "10", label: "Oktober" }, { value: "11", label: "November" }, { value: "12", label: "Desember" },
];

type KeterlambatanRow = {
  nobooking?: string;
  no_registrasi?: string;
  noppbb?: string;
  namawajibpajak?: string;
  tanggal_terima?: string;
  batas_waktu?: string;
  status?: string;
  keterangan?: string;
  [key: string]: unknown;
};

type ApiResponse = {
  success: boolean;
  data?: KeterlambatanRow[];
  rows?: KeterlambatanRow[];
  message?: string;
};

export default function MonitoringKeterlambatanPage() {
  const [rows, setRows] = useState<KeterlambatanRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterTahun, setFilterTahun] = useState(String(new Date().getFullYear()));
  const [filterBulan, setFilterBulan] = useState("");
  const [search, setSearch] = useState("");

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
      const json: ApiResponse = await res.json().catch(() => ({ success: false }));
      if (!res.ok) {
        if (res.status === 404) {
          setRows([]);
          setError(null);
          return;
        }
        throw new Error((json as ApiResponse).message || `HTTP ${res.status}`);
      }
      const data = (json as ApiResponse).rows ?? (json as ApiResponse).data ?? [];
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat data");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [filterTahun, filterBulan, search]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ marginBottom: 8, color: "var(--color_font_main)", fontSize: 28, fontWeight: 700 }}>
        Monitoring Keterlambatan Dokumen PPAT
      </div>
      <p style={{ margin: "0 0 24px", color: "var(--color_font_muted)", fontSize: 14 }}>
        Daftar dokumen PPAT yang melewati batas waktu penyerahan (paritas dengan legacy monitoring_keteralmbatan_dokumen_ppat.html).
      </p>

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
          placeholder="Cari No. Booking, NOP, Nama..."
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
          Refresh
        </button>
      </div>

      {error && (
        <div style={{ padding: 12, marginBottom: 16, background: "#fef2f2", color: "#b91c1c", borderRadius: 8 }}>
          {error}
        </div>
      )}

      <div
        style={{
          overflowX: "auto",
          background: "var(--card_bg)",
          borderRadius: 16,
          border: "1px solid var(--border_color)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
          <thead>
            <tr style={{ background: "linear-gradient(135deg, #0d1b2a 0%, #1b263b 50%, #415a77 100%)" }}>
              <th style={{ padding: "16px 12px", textAlign: "center", color: "#fff", fontWeight: 600, fontSize: 12, textTransform: "uppercase" }}>No</th>
              <th style={{ padding: "16px 12px", textAlign: "center", color: "#fff", fontWeight: 600, fontSize: 12, textTransform: "uppercase" }}>No. Booking</th>
              <th style={{ padding: "16px 12px", textAlign: "center", color: "#fff", fontWeight: 600, fontSize: 12, textTransform: "uppercase" }}>No. Registrasi</th>
              <th style={{ padding: "16px 12px", textAlign: "center", color: "#fff", fontWeight: 600, fontSize: 12, textTransform: "uppercase" }}>NOP PBB</th>
              <th style={{ padding: "16px 12px", textAlign: "center", color: "#fff", fontWeight: 600, fontSize: 12, textTransform: "uppercase" }}>Nama WP</th>
              <th style={{ padding: "16px 12px", textAlign: "center", color: "#fff", fontWeight: 600, fontSize: 12, textTransform: "uppercase" }}>Tanggal Terima</th>
              <th style={{ padding: "16px 12px", textAlign: "center", color: "#fff", fontWeight: 600, fontSize: 12, textTransform: "uppercase" }}>Batas Waktu</th>
              <th style={{ padding: "16px 12px", textAlign: "center", color: "#fff", fontWeight: 600, fontSize: 12, textTransform: "uppercase" }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} style={{ padding: 40, textAlign: "center", color: "var(--color_font_muted)" }}>
                  Memuat...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: 40, textAlign: "center", color: "var(--color_font_muted)" }}>
                  {error ? "Gagal memuat data." : "Tidak ada data keterlambatan. Endpoint backend: GET /api/ppat/monitoring-keterlambatan (opsional)."}
                </td>
              </tr>
            ) : (
              rows.map((r, i) => (
                <tr key={r.nobooking ?? i} style={{ borderBottom: "1px solid var(--border_color)" }}>
                  <td style={{ padding: 12, textAlign: "center", fontSize: 13 }}>{i + 1}</td>
                  <td style={{ padding: 12, fontSize: 13 }}>{r.nobooking ?? "—"}</td>
                  <td style={{ padding: 12, fontSize: 13 }}>{r.no_registrasi ?? "—"}</td>
                  <td style={{ padding: 12, fontSize: 13 }}>{r.noppbb ?? "—"}</td>
                  <td style={{ padding: 12, fontSize: 13 }}>{r.namawajibpajak ?? "—"}</td>
                  <td style={{ padding: 12, fontSize: 13 }}>{r.tanggal_terima ?? "—"}</td>
                  <td style={{ padding: 12, fontSize: 13 }}>{r.batas_waktu ?? "—"}</td>
                  <td style={{ padding: 12, fontSize: 13 }}>
                    <span
                      style={{
                        padding: "4px 10px",
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 600,
                        background: (r.status ?? "").toLowerCase().includes("terlambat") ? "rgba(239,68,68,0.15)" : "rgba(59,130,246,0.15)",
                        color: (r.status ?? "").toLowerCase().includes("terlambat") ? "#dc2626" : "#2563eb",
                      }}
                    >
                      {r.status ?? "—"}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p style={{ marginTop: 24 }}>
        <Link href="/pu/laporan" style={{ color: "var(--accent)" }}>← Kembali ke Laporan PPAT</Link>
      </p>
    </div>
  );
}
