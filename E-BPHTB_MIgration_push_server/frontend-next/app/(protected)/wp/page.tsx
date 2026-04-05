"use client";

import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import { getLegacyBaseUrl } from "../../../lib/api";
import GreetingCard from "../../components/GreetingCard";

export default function WpDashboardPage() {
  const { user } = useAuth();
  const legacyBase = getLegacyBaseUrl();
  const legacyWpUrl = `${legacyBase}/html_folder/WP/wp-dashboard.html`;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <GreetingCard
        nama={user?.nama || user?.userid || "Wajib Pajak"}
        pageLabel="Wajib Pajak"
        subtitle="Dashboard Anda. Cek status berkas dan layanan BPHTB."
        gender={user?.gender ?? undefined}
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 20,
          marginTop: 24,
        }}
      >
        <a
          href={legacyWpUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            background: "var(--card_bg)",
            border: "1px solid var(--border_color)",
            borderRadius: 12,
            padding: 24,
            boxShadow: "var(--card_shadow)",
            textDecoration: "none",
            color: "var(--color_font_main)",
            borderLeft: "4px solid var(--accent)",
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
            Dashboard lengkap (legacy)
          </div>
          <div style={{ fontSize: 14, color: "var(--color_font_main_muted)" }}>
            Buka layanan WP di jendela baru →
          </div>
        </a>
        <Link
          href="/wp/laporan/arsip"
          style={{
            background: "var(--card_bg)",
            border: "1px solid var(--border_color)",
            borderRadius: 12,
            padding: 24,
            boxShadow: "var(--card_shadow)",
            textDecoration: "none",
            color: "var(--color_font_main)",
            borderLeft: "4px solid var(--accent)",
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
            Arsip SSPD
          </div>
          <div style={{ fontSize: 14, color: "var(--color_font_main_muted)" }}>
            Lihat daftar SSPD tervalidasi &amp; unduh PDF →
          </div>
        </Link>
        <Link
          href="/info"
          style={{
            background: "var(--card_bg)",
            border: "1px solid var(--border_color)",
            borderRadius: 12,
            padding: 24,
            boxShadow: "var(--card_shadow)",
            textDecoration: "none",
            color: "var(--color_font_main)",
            borderLeft: "4px solid var(--accent)",
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
            Informasi &amp; Panduan
          </div>
          <div style={{ fontSize: 14, color: "var(--color_font_main_muted)" }}>
            Lihat informasi dan panduan →
          </div>
        </Link>
      </div>
    </div>
  );
}
