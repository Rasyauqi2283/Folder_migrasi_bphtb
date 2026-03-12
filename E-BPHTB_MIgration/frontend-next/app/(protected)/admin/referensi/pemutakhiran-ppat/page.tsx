"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

interface ChartMonth {
  month: number;
  monthName: string;
  jumlah_transaksi: number;
  total_bphtb: number;
}

interface PpatUser {
  userid?: string;
  user_nama?: string;
  divisi?: string;
  ppat_khusus?: string;
  nilai_formatted?: string;
  total_nilai_bphtb?: number;
  total_booking?: number;
}

export default function AdminPemutakhiranPpatPage() {
  const [chartData, setChartData] = useState<ChartMonth[]>([]);
  const [chartSummary, setChartSummary] = useState({
    total_transaksi: 0,
    total_bphtb_formatted: "Rp 0",
  });
  const [list, setList] = useState<PpatUser[]>([]);
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
        `/api/admin/notification-warehouse/ppat-chart-data?tahun=${tahun}`,
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
        `/api/admin/notification-warehouse/ppat-renewal?${params}`,
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

  const maxBphtb = Math.max(
    ...chartData.map((m) => m.total_bphtb),
    1
  );

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
        `/api/admin/notification-warehouse/ppat-renewal?${params}`,
        { credentials: "include" }
      );
      const data = await res.json();
      if (!data?.success || !Array.isArray(data?.data)) {
        throw new Error(data?.message || "Gagal export");
      }
      const headers = ["Nama PPAT", "UserID", "PPAT Khusus", "Total Nilai Pajak", "Total Booking"];
      const csvRows = [
        headers.join(","),
        ...data.data.map(
          (u: PpatUser) =>
            [
              `"${(u.user_nama ?? "").replace(/"/g, '""')}"`,
              `"${(u.userid ?? "").replace(/"/g, '""')}"`,
              `"${(u.ppat_khusus ?? "").replace(/"/g, '""')}"`,
              u.total_nilai_bphtb ?? 0,
              u.total_booking ?? 0,
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

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 16, justifyContent: "space-between" }}>
        <div>
          <h1 style={{ margin: "0 0 0.25rem", color: "var(--color_font_main)" }}>
            Pemutakhiran Data PPAT
          </h1>
          <p style={{ margin: 0, color: "var(--color_font_muted)", fontSize: "0.9rem" }}>
            Chart bulanan dan daftar PPAT renewal
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
        <div
          style={{
            padding: "1.5rem",
            display: "grid",
            gridTemplateColumns: "repeat(12, 1fr)",
            gap: 8,
            alignItems: "end",
            minHeight: 160,
          }}
        >
          {chartData.map((m) => (
            <div
              key={m.month}
              title={`${m.monthName}: Rp ${m.total_bphtb.toLocaleString("id-ID")}`}
              style={{
                height: `${Math.max(4, (m.total_bphtb / maxBphtb) * 100)}%`,
                minHeight: 4,
                background: "var(--color_accent)",
                borderRadius: 4,
                opacity: 0.85,
              }}
            />
          ))}
        </div>
        <div
          style={{
            padding: "0.5rem 1.25rem",
            fontSize: "0.8rem",
            color: "var(--color_font_muted)",
            display: "flex",
            gap: 24,
          }}
        >
          {chartData.map((m) => (
            <span key={m.month} style={{ flex: 1, textAlign: "center" }}>
              {m.monthName}
            </span>
          ))}
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
            Data rekap pajak by nobooking
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
                    <th style={thStyle}>Nama PPAT</th>
                    <th style={thStyle}>UserID</th>
                    <th style={thStyle}>PPAT Khusus</th>
                    <th style={thStyle}>Nilai</th>
                    <th style={thStyle}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((u, i) => (
                    <tr
                      key={u.userid ?? i}
                      style={{ borderBottom: "1px solid var(--border_color)" }}
                    >
                      <td style={tdStyle}>{u.user_nama ?? "—"}</td>
                      <td style={tdStyle}>{u.userid ?? "—"}</td>
                      <td style={tdStyle}>{u.ppat_khusus ?? "—"}</td>
                      <td style={tdStyle}>
                        {u.nilai_formatted ?? "Rp 0"}
                      </td>
                      <td style={tdStyle}>
                        <Link
                          href={`/admin/referensi/pemutakhiran-ppat/${encodeURIComponent(u.userid ?? "")}`}
                          style={{
                            padding: "4px 12px",
                            background: "var(--color_accent)",
                            color: "#fff",
                            borderRadius: 6,
                            textDecoration: "none",
                            fontSize: "0.85rem",
                            display: "inline-block",
                          }}
                        >
                          Lihat
                        </Link>
                      </td>
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
