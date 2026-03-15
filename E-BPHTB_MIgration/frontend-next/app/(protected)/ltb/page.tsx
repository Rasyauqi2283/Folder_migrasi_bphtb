"use client";

import { useAuth } from "../../context/AuthContext";
import Link from "next/link";
import GreetingCard from "../../components/GreetingCard";

const CARD_STYLE: React.CSSProperties = {
  background: "var(--card_bg)",
  border: "1px solid var(--border_color)",
  borderRadius: 12,
  padding: 24,
  boxShadow: "var(--card_shadow)",
  textDecoration: "none",
  color: "var(--color_font_main)",
  borderLeft: "4px solid var(--accent)",
  display: "block",
};

export default function LTBDashboardPage() {
  const { user } = useAuth();

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto" }}>
      <GreetingCard
        nama={user?.nama || user?.userid || "LTB"}
        pageLabel="LTB"
        subtitle="Loket Terima Berkas. Kelola permohonan validasi SSPD dan penginputan offline."
        gender={user?.gender ?? undefined}
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 20,
          marginTop: 24,
        }}
      >
        <Link href="/ltb/terima-berkas-sspd" style={CARD_STYLE}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: "linear-gradient(135deg, var(--accent_hover) 0%, var(--accent) 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
              }}
            >
              📁
            </div>
            <span style={{ fontSize: 16, fontWeight: 600 }}>Permohonan Validasi SSPD</span>
          </div>
          <p style={{ margin: 0, fontSize: 14, color: "var(--color_font_main_muted)" }}>
            Daftar berkas dari PU untuk divalidasi. View dokumen, terima, atau tolak.
          </p>
          <span style={{ display: "inline-block", marginTop: 12, fontSize: 14, fontWeight: 600, color: "var(--accent)" }}>
            Buka →
          </span>
        </Link>

        <Link href="/ltb/penginputan-offline" style={CARD_STYLE}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
              }}
            >
              ✏️
            </div>
            <span style={{ fontSize: 16, fontWeight: 600 }}>Penginputan Offline</span>
          </div>
          <p style={{ margin: 0, fontSize: 14, color: "var(--color_font_main_muted)" }}>
            Input berkas saat WP datang ke kantor. Pola mirip booking PU.
          </p>
          <span style={{ display: "inline-block", marginTop: 12, fontSize: 14, fontWeight: 600, color: "var(--accent)" }}>
            Buka →
          </span>
        </Link>
      </div>
    </div>
  );
}
