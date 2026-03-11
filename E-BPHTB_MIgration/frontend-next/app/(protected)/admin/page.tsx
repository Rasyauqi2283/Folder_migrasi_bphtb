"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import GreetingCard from "../../components/GreetingCard";

interface Stats {
  pending: number;
  complete: number;
  statusPpat: number;
  validasiQr: number;
}

interface TaxSummary {
  total_bphtb_formatted: string;
  total_transaksi: number;
}

interface ValidationStatItem {
  label: string;
  count: number;
  percentage: number;
  description?: string;
}
interface ValidationStats {
  success?: boolean;
  data?: {
    total: number;
    sudahValidasi: ValidationStatItem;
    tinggalVerifikasi: ValidationStatItem;
    belumTerurus: ValidationStatItem;
  };
}

const CARD_STYLES = {
  wrapper: {
    background: "var(--card_bg)",
    border: "1px solid var(--card_border)",
    borderRadius: 12,
    padding: 24,
    boxShadow: "var(--card_shadow)",
    transition: "all 0.3s ease",
    cursor: "pointer",
    position: "relative" as const,
    overflow: "hidden",
  },
  iconBlue: { background: "linear-gradient(135deg, var(--accent_hover) 0%, var(--accent) 100%)" },
  iconGreen: { background: "linear-gradient(135deg, #059669 0%, #047857 100%)" },
  iconPurple: { background: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)" },
  iconOrange: { background: "linear-gradient(135deg, #d97706 0%, #b45309 100%)" },
  iconGold: { background: "linear-gradient(135deg, #d97706 0%, #b45309 100%)" },
};

function CalendarWidget() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
  ];
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = now.getDate();
  const weekDays = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
  const dates: (number | null)[] = [];
  const startOffset = firstDay;
  for (let i = 0; i < startOffset; i++) dates.push(null);
  for (let d = 1; d <= daysInMonth; d++) dates.push(d);

  return (
    <div
      style={{
        minWidth: 220,
        background: "var(--card_bg)",
        border: "1px solid var(--card_border)",
        borderRadius: 12,
        padding: 16,
        boxShadow: "var(--card_shadow)",
      }}
    >
      <p
        style={{
          margin: "0 0 12px",
          fontSize: 15,
          color: "var(--color_font_main)",
          fontWeight: 700,
          letterSpacing: "0.02em",
        }}
      >
        {monthNames[month]} {year}
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6, fontSize: 13 }}>
        {weekDays.map((w) => (
          <div
            key={w}
            style={{
              color: "var(--color_font_main_muted)",
              textAlign: "center",
              fontWeight: 600,
              padding: "4px 0",
            }}
          >
            {w}
          </div>
        ))}
        {dates.map((d, i) => (
          <div
            key={i}
            style={{
              textAlign: "center",
              padding: "8px 0",
              borderRadius: 8,
              color: d === today ? "#fff" : "var(--color_font_main)",
              background: d === today ? "var(--accent)" : "transparent",
              fontWeight: d === today ? 700 : 500,
            }}
          >
            {d ?? ""}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({
    pending: 0,
    complete: 0,
    statusPpat: 0,
    validasiQr: 0,
  });
  const [taxSummary, setTaxSummary] = useState<TaxSummary | null>(null);
  const [validationStats, setValidationStats] = useState<ValidationStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const currentYear = new Date().getFullYear();
        const [
          pendingRes,
          completeRes,
          ppatStatsRes,
          qrRes,
          taxRes,
          validationRes,
        ] = await Promise.all([
          fetch("/api/users/pending", { credentials: "include" }).catch(() => null),
          fetch("/api/users/complete", { credentials: "include" }).catch(() => null),
          fetch("/api/admin/notification-warehouse/ppat-users-stats", { credentials: "include" }).catch(() => null),
          fetch("/api/admin/validate-qr-search?page=1&limit=1", { credentials: "include" }).catch(() => null),
          fetch(`/api/admin/notification-warehouse/ppat-renewal?page=1&limit=1&jangka_waktu=12&tahun=${currentYear}`, { credentials: "include" }).catch(() => null),
          fetch("/api/admin/validation-statistics", { credentials: "include" }).catch(() => null),
        ]);

        let pendingCount = 0;
        if (pendingRes?.ok) {
          const data = await pendingRes.json().catch(() => []);
          pendingCount = Array.isArray(data) ? data.length : 0;
        }
        let completeCount = 0;
        if (completeRes?.ok) {
          const data = await completeRes.json().catch(() => []);
          completeCount = Array.isArray(data) ? data.length : 0;
        }
        let ppatTotal = 0;
        if (ppatStatsRes?.ok) {
          const j = await ppatStatsRes.json().catch(() => ({}));
          if (j?.success && j?.data) ppatTotal = j.data.total ?? 0;
        }
        let qrTotal = 0;
        if (qrRes?.ok) {
          const j = await qrRes.json().catch(() => ({}));
          if (j?.success && j?.pagination) qrTotal = j.pagination.total ?? 0;
        }
        setStats({ pending: pendingCount, complete: completeCount, statusPpat: ppatTotal, validasiQr: qrTotal });

        if (taxRes?.ok) {
          const data = await taxRes.json().catch(() => ({}));
          if (data?.success && data?.summary) {
            setTaxSummary({
              total_bphtb_formatted: data.summary.total_bphtb_formatted || "Rp 0",
              total_transaksi: Number(data.summary.total_transaksi || 0),
            });
          }
        }
        if (validationRes?.ok) {
          const data = await validationRes.json().catch(() => ({}));
          setValidationStats(data);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const cards = [
    { label: "Verifikasi Data User", value: stats.pending, sub: "User menunggu verifikasi", href: "/admin/data-user/pending", icon: "👤", iconClass: "orange" },
    { label: "Data User", value: stats.complete, sub: "Total user terverifikasi", href: "/admin/data-user/complete", icon: "👥", iconClass: "green" },
    { label: "Status PPAT", value: stats.statusPpat, sub: "Total PPAT/PPATS", href: "/admin/referensi/status-ppat", icon: "📋", iconClass: "blue" },
    { label: "Validasi QR", value: stats.validasiQr, sub: "Total validasi QR", href: "/admin/referensi/validasi-qr", icon: "🔍", iconClass: "purple" },
  ];

  const iconStyle = (c: typeof cards[0]) =>
    c.iconClass === "orange" ? CARD_STYLES.iconOrange :
    c.iconClass === "green" ? CARD_STYLES.iconGreen :
    c.iconClass === "purple" ? CARD_STYLES.iconPurple : CARD_STYLES.iconBlue;

  return (
    <div style={{ maxWidth: 1400, margin: "0 auto" }}>
      {/* Greeting card universal: SVG berdasarkan gender */}
      <GreetingCard
        nama={user?.nama || user?.userid || "Pengguna"}
        pageLabel={user?.divisi || "Admin"}
        subtitle="Ringkasan aktivitas dan statistik administrasi Anda"
        gender={user?.gender ?? undefined}
        rightContent={<CalendarWidget />}
      />

      {/* Summary cards - design serupa HTML */}
      {loading ? (
        <p style={{ color: "var(--color_font_main_muted)", marginBottom: 24 }}>Memuat...</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 20,
            marginBottom: 24,
          }}
        >
          {cards.map((c) => (
            <Link
              key={c.href}
              href={c.href}
              style={{
                ...CARD_STYLES.wrapper,
                borderLeft: "4px solid transparent",
                borderLeftColor: c.iconClass === "orange" ? "#d97706" : c.iconClass === "green" ? "#059669" : c.iconClass === "purple" ? "#7c3aed" : "var(--accent)",
                textDecoration: "none",
                color: "var(--color_font_main)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 20,
                    ...iconStyle(c),
                  }}
                >
                  {c.icon}
                </div>
                <span style={{ fontSize: 16, fontWeight: 600 }}>{c.label}</span>
              </div>
              <div style={{ fontSize: 36, fontWeight: 700, margin: "8px 0", color: "var(--color_font_main)" }}>{c.value}</div>
              <div style={{ fontSize: 14, color: "var(--color_font_main_muted)", marginBottom: 12 }}>{c.sub}</div>
              <div style={{ borderTop: "1px solid var(--card_border)", paddingTop: 16, marginTop: 16 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: "var(--accent)" }}>
                  Lihat Data →
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Nilai Transaksi Pajak - card gold */}
      <div style={{ marginBottom: 24 }}>
        <Link
          href="/admin/referensi/pemutakhiran-ppat"
          style={{
            ...CARD_STYLES.wrapper,
            display: "block",
            textDecoration: "none",
            color: "var(--color_font_main)",
            borderLeft: "4px solid #b45309",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
                ...CARD_STYLES.iconGold,
              }}
            >
              💰
            </div>
            <span style={{ fontSize: 16, fontWeight: 600 }}>Nilai Transaksi Pajak</span>
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, color: "#047857", margin: "8px 0" }}>
            {taxSummary?.total_bphtb_formatted ?? "Rp 0"}
          </div>
          <div style={{ fontSize: 14, color: "var(--color_font_main_muted)", marginBottom: 12 }}>
            Periode 12 bulan • Tahun {new Date().getFullYear()}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginTop: 14 }}>
            <div style={{ background: "rgba(10,19,34,0.06)", border: "1px solid var(--card_border)", borderRadius: 10, padding: "10px 12px" }}>
              <div style={{ fontSize: 12, color: "var(--color_font_main_muted)" }}>Total Transaksi</div>
              <div style={{ marginTop: 4, fontSize: 16, fontWeight: 700, color: "var(--color_font_main)" }}>
                {(taxSummary?.total_transaksi ?? 0).toLocaleString("id-ID")}
              </div>
            </div>
            <div style={{ background: "rgba(10,19,34,0.06)", border: "1px solid var(--card_border)", borderRadius: 10, padding: "10px 12px" }}>
              <div style={{ fontSize: 12, color: "var(--color_font_main_muted)" }}>Keterangan</div>
              <div style={{ marginTop: 4, fontSize: 14, fontWeight: 600, color: "var(--color_font_main)" }}>Ringkasan dari Pemutakhiran PPAT</div>
            </div>
          </div>
          <div style={{ borderTop: "1px solid var(--card_border)", paddingTop: 16, marginTop: 16 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: "var(--accent)" }}>Lihat Detail →</span>
          </div>
        </Link>
      </div>

      {/* Statistik Total Permohonan Validasi - chart section */}
      <section
        style={{
          background: "var(--card_bg)",
          border: "1px solid var(--card_border)",
          borderRadius: 12,
          padding: 24,
          boxShadow: "var(--card_shadow)",
        }}
      >
        <h3 style={{ margin: "0 0 20px", color: "var(--color_font_main)", fontSize: 20, fontWeight: 700, borderBottom: "2px solid var(--card_border)", paddingBottom: 12 }}>
          Statistik Total Permohonan Validasi
        </h3>
        {validationStats?.success && validationStats.data ? (
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0,200px) 1fr", gap: 32, alignItems: "start" }}>
            <div
              style={{
                width: 200,
                height: 200,
                borderRadius: "50%",
                background: `conic-gradient(
                  #10b981 0% ${validationStats.data.sudahValidasi.percentage}%,
                  #3b82f6 ${validationStats.data.sudahValidasi.percentage}% ${validationStats.data.sudahValidasi.percentage + validationStats.data.tinggalVerifikasi.percentage}%,
                  #f59e0b ${validationStats.data.sudahValidasi.percentage + validationStats.data.tinggalVerifikasi.percentage}% 100%
                )`,
                flexShrink: 0,
              }}
            />
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {[
                { ...validationStats.data.sudahValidasi, color: "#10b981" },
                { ...validationStats.data.tinggalVerifikasi, color: "#3b82f6" },
                { ...validationStats.data.belumTerurus, color: "#f59e0b" },
              ].map((item, i) => (
                <li
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: 12,
                    marginBottom: 8,
                    background: "rgba(10,19,34,0.05)",
                    borderRadius: 8,
                    borderLeft: `4px solid ${item.color}`,
                  }}
                >
                  <span style={{ width: 20, height: 20, borderRadius: 4, background: item.color, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: "var(--color_font_main)" }}>{item.label}</div>
                    <div style={{ fontSize: 12, color: "var(--color_font_main_muted)", marginTop: 4 }}>{item.description ?? ""}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: "var(--color_font_main)" }}>{item.percentage}%</div>
                    <div style={{ fontSize: 14, color: "var(--color_font_main_muted)" }}>{item.count} dokumen</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p style={{ color: "var(--color_font_main_muted)", margin: 0 }}>Memuat statistik validasi...</p>
        )}
      </section>

      <p style={{ marginTop: "2rem" }}>
        <Link href="/dashboard" style={{ color: "var(--accent_hover)", textDecoration: "none" }}>
          ← Kembali ke Dashboard
        </Link>
      </p>
    </div>
  );
}
