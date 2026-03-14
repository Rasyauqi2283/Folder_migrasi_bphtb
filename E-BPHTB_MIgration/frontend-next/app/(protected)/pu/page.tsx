"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import GreetingCard from "../../components/GreetingCard";

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
  iconBlue: {
    background:
      "linear-gradient(135deg, var(--accent_hover) 0%, var(--accent) 100%)",
  },
  iconGreen: {
    background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
  },
  iconOrange: {
    background: "linear-gradient(135deg, #d97706 0%, #b45309 100%)",
  },
  iconPurple: {
    background: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)",
  },
};

function CalendarWidget() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const monthNames = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
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
        background: "var(--card_bg_grey)",
        border: "1px solid var(--border_color)",
        borderRadius: 12,
        padding: 16,
        boxShadow: "var(--shadow_card)",
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
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: 6,
          fontSize: 13,
        }}
      >
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

export default function PPATDashboardPage() {
  const { user } = useAuth();
  const [counts, setCounts] = useState({
    bookingBadan: 0,
    bookingPerorangan: 0,
    rekapDiserahkan: 0,
    rincianBulanan: 0,
    laporanRekap: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const qsBadan = new URLSearchParams({
          page: "1",
          limit: "1",
          jenis_wajib_pajak: "Badan Usaha",
        });
        const qsPerorangan = new URLSearchParams({
          page: "1",
          limit: "1",
          jenis_wajib_pajak: "Perorangan",
        });
        const qsRekap = new URLSearchParams({ page: "1", limit: "1" });
        const [badanRes, perorRes, rekapRes] = await Promise.all([
          fetch(`/api/ppat/load-all-booking?${qsBadan}`, { credentials: "include" }).catch(() => null),
          fetch(`/api/ppat/load-all-booking?${qsPerorangan}`, { credentials: "include" }).catch(() => null),
          fetch(`/api/ppat/rekap/diserahkan?${qsRekap}`, { credentials: "include" }).catch(() => null),
        ]);
        const readTotal = async (res: Response | null): Promise<number> => {
          if (!res?.ok) return 0;
          const js = await res.json().catch(() => ({})) as { pagination?: { total?: number; totalCount?: number }; data?: unknown[]; rows?: unknown[] };
          if (js?.pagination && Number.isFinite(Number(js.pagination.total))) return Number(js.pagination.total);
          if (js?.pagination && Number.isFinite(Number(js.pagination.totalCount))) return Number(js.pagination.totalCount);
          if (Array.isArray(js?.data)) return js.data.length;
          if (Array.isArray(js?.rows)) return js.rows.length;
          return 0;
        };
        const bookingBadan = await readTotal(badanRes);
        const bookingPerorangan = await readTotal(perorRes);
        const rekapTotal = await readTotal(rekapRes);
        let laporanRekap = 0;
        try {
          const raw = typeof localStorage !== "undefined" ? localStorage.getItem("laporanRekapData") : null;
          const arr = raw ? JSON.parse(raw) : [];
          laporanRekap = Array.isArray(arr) ? arr.length : 0;
        } catch {
          // ignore
        }
        if (!cancelled) {
          setCounts({
            bookingBadan,
            bookingPerorangan,
            rekapDiserahkan: rekapTotal,
            rincianBulanan: rekapTotal,
            laporanRekap,
          });
        }
      } catch (_) {
        if (!cancelled) setCounts((c) => c);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const cards = [
    {
      label: "Booking SSPD Badan",
      value: counts.bookingBadan,
      sub: "Total booking badan usaha",
      href: "/pu/booking-sspd/badan",
      icon: "🏢",
      iconClass: "blue" as const,
    },
    {
      label: "Booking SSPD Perorangan",
      value: counts.bookingPerorangan,
      sub: "Total booking perorangan",
      href: "/pu/booking-sspd/perorangan",
      icon: "👤",
      iconClass: "green" as const,
    },
    {
      label: "Rekap Diserahkan",
      value: counts.rekapDiserahkan,
      sub: "Total berkas berstatus Diserahkan",
      href: "/pu/laporan/rekap",
      icon: "📦",
      iconClass: "orange" as const,
    },
    {
      label: "Rincian Laporan Bulanan pu",
      value: counts.rincianBulanan,
      sub: "Rincian berkas per bulan",
      href: "/pu/laporan/rincian",
      icon: "📊",
      iconClass: "purple" as const,
    },
    {
      label: "Laporan Rekap pu",
      value: counts.laporanRekap,
      sub: "Total laporan rekap bulanan",
      href: "/pu/laporan/rekap",
      icon: "📋",
      iconClass: "orange" as const,
    },
  ];

  const iconStyle = (c: (typeof cards)[0]) =>
    c.iconClass === "orange"
      ? CARD_STYLES.iconOrange
      : c.iconClass === "green"
        ? CARD_STYLES.iconGreen
        : c.iconClass === "purple"
          ? CARD_STYLES.iconPurple
          : CARD_STYLES.iconBlue;

  return (
    <div style={{ maxWidth: 1400, margin: "0 auto" }}>
      <GreetingCard
        nama={user?.nama || user?.userid || "Pengguna"}
        pageLabel={user?.divisi || "pu"}
        subtitle="Ingin melakukan apa hari ini, Apakah Kamu Ingin Melihat Validasi?"
        gender={user?.gender ?? undefined}
        rightContent={<CalendarWidget />}
      />

      {loading ? (
        <p
          style={{
            color: "var(--color_font_main_muted)",
            marginBottom: 24,
          }}
        >
          Memuat...
        </p>
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
              key={c.href + c.label}
              href={c.href}
              style={{
                ...CARD_STYLES.wrapper,
                borderLeft: "4px solid transparent",
                borderLeftColor:
                  c.iconClass === "orange"
                    ? "#d97706"
                    : c.iconClass === "green"
                      ? "#059669"
                      : c.iconClass === "purple"
                        ? "#7c3aed"
                        : "var(--accent)",
                textDecoration: "none",
                color: "var(--color_font_main)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 16,
                }}
              >
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
              <div
                style={{
                  fontSize: 36,
                  fontWeight: 700,
                  margin: "8px 0",
                  color: "var(--color_font_main)",
                }}
              >
                {c.value}
              </div>
              <div
                style={{
                  fontSize: 14,
                  color: "var(--color_font_main_muted)",
                  marginBottom: 12,
                }}
              >
                {c.sub}
              </div>
              <div
                style={{
                  borderTop: "1px solid var(--border_color)",
                  paddingTop: 16,
                  marginTop: 16,
                }}
              >
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: "var(--accent)",
                  }}
                >
                  Lihat →
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
