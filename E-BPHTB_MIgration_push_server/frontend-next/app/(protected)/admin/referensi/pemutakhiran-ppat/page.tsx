"use client";

import { useCallback, useEffect, useState } from "react";
import { getApiBase } from "../../../../../lib/api";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface ChartMonth {
  month: number;
  monthName: string;
  jumlah_transaksi: number;
  total_bphtb: number;
}

interface PpatPaymentRow {
  nobooking?: string;
  no_registrasi?: string;
  userid?: string;
  user_nama?: string;
  divisi?: string;
  ppat_khusus?: string;
  nilai_formatted?: string;
  total_nilai_bphtb?: number;
  payment_status?: string;
  status_verifikasi?: string;
  status_dibank?: string;
  paid_at?: string | null;
}

function formatRupiahTooltip(value: unknown): string {
  const raw = Array.isArray(value) ? value[0] : value;
  return `Rp ${Number(raw ?? 0).toLocaleString("id-ID")}`;
}

export default function AdminPemutakhiranPpatPage() {
  const [chartData, setChartData] = useState<ChartMonth[]>([]);
  const [chartSummary, setChartSummary] = useState({
    total_transaksi: 0,
    total_bphtb_formatted: "Rp 0",
  });
  const [list, setList] = useState<PpatPaymentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tahun, setTahun] = useState(new Date().getFullYear());
  const [jangkaWaktu, setJangkaWaktu] = useState("6");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState(10);

  const loadChart = useCallback(async () => {
    try {
      const res = await fetch(
        `${getApiBase()}/api/admin/notification-warehouse/ppat-chart-data?tahun=${tahun}`,
        { credentials: "include" }
      );
      const data = await res.json();
      if (data?.success && Array.isArray(data?.data)) {
        setChartData(data.data);
        if (data.summary) {
          setChartSummary({
            total_transaksi: data.summary.total_transaksi ?? 0,
            total_bphtb_formatted:
              data.summary.total_bphtb_formatted ?? "Rp 0",
          });
        }
      }
    } catch {
      setChartData([]);
    }
  }, [tahun]);

  const loadRenewal = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(limit));
      params.set("tahun", String(tahun));
      params.set("jangka_waktu", jangkaWaktu);
      if (search.trim()) params.set("search", search.trim());

      const res = await fetch(
        `${getApiBase()}/api/admin/notification-warehouse/ppat-renewal?${params}`,
        { credentials: "include" }
      );
      const data = await res.json();

      if (!res.ok) throw new Error(data?.message || "Gagal memuat data");
      if (data?.success && Array.isArray(data?.data)) {
        setList(data.data);
        const pag = data.pagination || {};
        setTotalPages(pag.totalPages ?? 1);
        setTotal(pag.total ?? 0);
      } else {
        setList([]);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Terjadi kesalahan");
      setList([]);
    } finally {
      setLoading(false);
    }
  }, [page, limit, tahun, jangkaWaktu, search]);

  useEffect(() => {
    loadChart();
  }, [loadChart]);

  useEffect(() => {
    loadRenewal();
  }, [page, limit, tahun, jangkaWaktu]);

  const onSearch = () => {
    setPage(1);
    loadRenewal();
  };

  const startIdx = (page - 1) * limit + 1;
  const endIdx = Math.min(page * limit, total);

  const handleExport = async () => {
    try {
      const params = new URLSearchParams();
      params.set("page", "1");
      params.set("limit", "10000");
      params.set("tahun", String(tahun));
      params.set("jangka_waktu", jangkaWaktu);
      if (search.trim()) params.set("search", search.trim());
      const res = await fetch(
        `${getApiBase()}/api/admin/notification-warehouse/ppat-renewal?${params}`,
        { credentials: "include" }
      );
      const data = await res.json();
      if (!data?.success || !Array.isArray(data?.data)) {
        throw new Error(data?.message || "Gagal export");
      }
      const headers = [
        "No Booking",
        "No Registrasi",
        "Nama PPAT",
        "UserID",
        "PPAT Khusus",
        "Status Pembayaran",
        "Status Verifikasi Bank",
        "Status di Bank",
        "Total Nilai Pajak",
        "Waktu Bayar",
      ];
      const csvRows = [
        headers.join(","),
        ...data.data.map(
          (u: PpatPaymentRow) =>
            [
              `"${(u.nobooking ?? "").replace(/"/g, '""')}"`,
              `"${(u.no_registrasi ?? "").replace(/"/g, '""')}"`,
              `"${(u.user_nama ?? "").replace(/"/g, '""')}"`,
              `"${(u.userid ?? "").replace(/"/g, '""')}"`,
              `"${(u.ppat_khusus ?? "").replace(/"/g, '""')}"`,
              `"${(u.payment_status ?? "").replace(/"/g, '""')}"`,
              `"${(u.status_verifikasi ?? "").replace(/"/g, '""')}"`,
              `"${(u.status_dibank ?? "").replace(/"/g, '""')}"`,
              u.total_nilai_bphtb ?? 0,
              `"${(u.paid_at ?? "").replace(/"/g, '""')}"`,
            ].join(",")
        ),
      ];
      const blob = new Blob(["\uFEFF" + csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `ppat_renewal_${tahun}_${jangkaWaktu}bulan.csv`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Gagal mengekspor");
    }
  };

  useEffect(() => {
    const timer = window.setInterval(() => {
      loadChart();
      loadRenewal();
    }, 15000);
    return () => window.clearInterval(timer);
  }, [loadChart, loadRenewal]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 16, justifyContent: "space-between" }}>
        <div>
          <h1 style={{ margin: "0 0 0.25rem", color: "var(--color_font_main)" }}>
            Pemutakhiran Data PPAT
          </h1>
          <p style={{ margin: 0, color: "var(--color_font_muted)", fontSize: "0.9rem" }}>
            Chart bulanan dan rekap transaksi pembayaran BPHTB (real-time)
          </p>
        </div>
        {/* Rekap: jangkawaktu + tahun (sesuai legacy) */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <label style={{ fontWeight: 600, fontSize: "0.9rem" }}>Rekap</label>
          <select
            value={jangkaWaktu}
            onChange={(e) => {
              setJangkaWaktu(e.target.value);
              setPage(1);
            }}
            style={{ padding: "8px 12px", border: "1px solid var(--border_color)", borderRadius: 8 }}
          >
            <option value="6">6 Bulan</option>
            <option value="12">1 Tahun</option>
          </select>
          <select
            value={tahun}
            onChange={(e) => {
              setTahun(Number(e.target.value));
              setPage(1);
            }}
            style={{ padding: "8px 12px", border: "1px solid var(--border_color)", borderRadius: 8 }}
          >
            {Array.from({ length: 8 }, (_, i) => new Date().getFullYear() - i).map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Chart section */}
      <section
        style={{
          background: "var(--card_bg_grey)",
          borderRadius: 12,
          boxShadow: "var(--shadow_card)",
          overflow: "hidden",
          border: "1px solid var(--border_color)",
        }}
      >
        <div
          style={{
            padding: "1rem 1.25rem",
            borderBottom: "1px solid var(--border_color)",
            display: "flex",
            gap: 12,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              fontWeight: 600,
              color: "var(--color_accent)",
              fontSize: "1rem",
            }}
          >
            Grafik Nilai BPHTB per Bulan
          </span>
          <select
            value={tahun}
            onChange={(e) => setTahun(Number(e.target.value))}
            style={{
              padding: "8px 12px",
              border: "1px solid var(--border_color)",
              borderRadius: 8,
              fontSize: "0.9rem",
            }}
          >
            {[2023, 2024, 2025, 2026].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
        <div style={{ padding: "1.5rem", height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border_color)" />
              <XAxis dataKey="monthName" stroke="var(--color_font_muted)" />
              <YAxis
                stroke="var(--color_font_muted)"
                tickFormatter={(v) => `${Math.round(Number(v) / 1_000_000)} jt`}
              />
              <Tooltip
                formatter={(value) => formatRupiahTooltip(value)}
                labelFormatter={(label) => `Bulan: ${String(label)}`}
              />
              <Bar dataKey="total_bphtb" name="Nilai BPHTB" fill="var(--color_accent)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div
          style={{
            padding: "1rem 1.25rem",
            borderTop: "1px solid var(--border_color)",
            display: "flex",
            gap: 24,
            flexWrap: "wrap",
          }}
        >
          <span>
            Total Transaksi: <strong>{chartSummary.total_transaksi}</strong>
          </span>
          <span>
            Total Nilai BPHTB:{" "}
            <strong>{chartSummary.total_bphtb_formatted}</strong>
          </span>
        </div>
      </section>

      {/* Table section */}
      <section
        style={{
          background: "var(--card_bg_grey)",
          borderRadius: 12,
          boxShadow: "var(--shadow_card)",
          overflow: "hidden",
          border: "1px solid var(--border_color)",
        }}
      >
        <div
          style={{
            padding: "1rem 1.25rem",
            borderBottom: "1px solid var(--border_color)",
            display: "flex",
            gap: 12,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <h3 style={{ margin: 0, fontSize: "1rem", color: "var(--color_accent)", flex: "1 1 100%" }}>
            Data rekap pajak by No. Booking
          </h3>
          <input
            type="text"
            placeholder="Cari..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSearch()}
            style={{
              padding: "8px 12px",
              border: "1px solid var(--border_color)",
              borderRadius: 8,
              minWidth: 200,
            }}
          />
          <button
            type="button"
            onClick={onSearch}
            style={{
              padding: "8px 16px",
              background: "var(--color_accent)",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Cari
          </button>
          <button
            type="button"
            onClick={handleExport}
            style={{
              padding: "8px 14px",
              border: "1px solid var(--border_color)",
              borderRadius: 8,
              background: "transparent",
              cursor: "pointer",
              fontSize: "0.9rem",
            }}
          >
            Export
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: "0.9rem", color: "var(--color_font_muted)" }}>Show</span>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              style={{ padding: "6px 10px", border: "1px solid var(--border_color)", borderRadius: 8 }}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span style={{ fontSize: "0.9rem", color: "var(--color_font_muted)" }}>entries</span>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: "2rem", textAlign: "center" }}>Memuat...</div>
        ) : error ? (
          <div
            style={{
              padding: "2rem",
              textAlign: "center",
              color: "var(--danger, #d9534f)",
            }}
          >
            {error}
          </div>
        ) : list.length === 0 ? (
          <div
            style={{
              padding: "2rem",
              textAlign: "center",
              color: "var(--color_font_muted)",
            }}
          >
            Tidak ada data
          </div>
        ) : (
          <>
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "0.9rem",
                }}
              >
                <thead>
                  <tr style={{ borderBottom: "2px solid var(--border_color)" }}>
                    <th style={thStyle}>No. Booking</th>
                    <th style={thStyle}>No. Registrasi</th>
                    <th style={thStyle}>Nama PPAT</th>
                    <th style={thStyle}>UserID</th>
                    <th style={thStyle}>Status Bayar</th>
                    <th style={thStyle}>Verifikasi Bank</th>
                    <th style={thStyle}>Status di Bank</th>
                    <th style={thStyle}>Nilai BPHTB</th>
                    <th style={thStyle}>Waktu Bayar</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((u, i) => (
                    <tr
                      key={`${u.nobooking ?? ""}-${u.userid ?? ""}-${i}`}
                      style={{ borderBottom: "1px solid var(--border_color)" }}
                    >
                      <td style={tdStyle}>{u.nobooking ?? "—"}</td>
                      <td style={tdStyle}>{u.no_registrasi ?? "—"}</td>
                      <td style={tdStyle}>{u.user_nama ?? "—"}</td>
                      <td style={tdStyle}>{u.userid ?? "—"}</td>
                      <td style={tdStyle}>{u.payment_status ?? "—"}</td>
                      <td style={tdStyle}>{u.status_verifikasi ?? "—"}</td>
                      <td style={tdStyle}>{u.status_dibank ?? "—"}</td>
                      <td style={tdStyle}>
                        {u.nilai_formatted ?? "Rp 0"}
                      </td>
                      <td style={tdStyle}>{u.paid_at ? new Date(u.paid_at).toLocaleString("id-ID") : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div
                style={{
                  padding: "1rem 1.25rem",
                  borderTop: "1px solid var(--border_color)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 12,
                }}
              >
                <span style={{ color: "var(--color_font_muted)", fontSize: "0.9rem" }}>
                  Menampilkan {startIdx}–{endIdx} dari {total}
                </span>
                <div style={{ display: "flex", gap: 6 }}>
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    style={pageBtnStyle}
                  >
                    Prev
                  </button>
                  <span style={{ padding: "6px 12px" }}>
                    {page} / {totalPages}
                  </span>
                  <button
                    type="button"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    style={pageBtnStyle}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: "12px 14px",
  textAlign: "left",
  color: "var(--color_font_main)",
  fontWeight: 600,
};
const tdStyle: React.CSSProperties = {
  padding: "12px 14px",
  color: "var(--color_font_main)",
};
const pageBtnStyle: React.CSSProperties = {
  padding: "6px 14px",
  border: "1px solid var(--border_color)",
  borderRadius: 6,
  background: "transparent",
  cursor: "pointer",
};
