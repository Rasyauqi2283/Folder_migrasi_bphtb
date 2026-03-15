"use client";

import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import GreetingCard from "../../components/GreetingCard";

export default function CsDashboardPage() {
  const { user } = useAuth();

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <GreetingCard
        nama={user?.nama || user?.userid || "Customer Service"}
        pageLabel="Customer Service"
        subtitle="Terima kritik, saran, dan keluhan. Kelola layanan dan balas melalui email."
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
        <Link
          href="/cs/layanan"
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
            Layanan
          </div>
          <div style={{ fontSize: 14, color: "var(--color_font_main_muted)" }}>
            Daftar keluhan dari form kontak (Judul, Keluhan, Isi, Email). Balas via email →
          </div>
        </Link>
      </div>
    </div>
  );
}
