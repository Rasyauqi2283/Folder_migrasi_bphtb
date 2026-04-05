"use client";

import Link from "next/link";
import { useAuth } from "../../../context/AuthContext";

export default function PuAksesDiblokirPage() {
  const { user } = useAuth();

  return (
    <div
      style={{
        maxWidth: 560,
        margin: "48px auto",
        padding: 32,
        borderRadius: 16,
        border: "1px solid var(--border_color)",
        background: "var(--card_bg)",
        boxShadow: "var(--card_shadow)",
      }}
    >
      <h1 style={{ marginTop: 0, fontSize: 24, color: "var(--color_font_main)" }}>Akses diblokir</h1>
      <p style={{ color: "var(--color_font_muted)", lineHeight: 1.6 }}>
        Akses diblokir karena keterlambatan laporan bulanan. Silakan unggah dokumen laporan periode yang diminta
        untuk membuka akses pembuatan dan pengajuan SSPD baru.
      </p>
      {user?.userid && (
        <p style={{ fontSize: 13, color: "var(--color_font_muted)" }}>
          User: <strong>{user.userid}</strong>
        </p>
      )}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 24 }}>
        <Link
          href="/pu/laporan/unggah-laporan-bulanan"
          style={{
            display: "inline-block",
            padding: "12px 20px",
            borderRadius: 10,
            background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
            color: "#fff",
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          Unggah laporan bulanan
        </Link>
        <Link href="/pu/laporan/monitoring-keterlambatan" style={{ color: "var(--accent)", alignSelf: "center" }}>
          Monitoring keterlambatan
        </Link>
      </div>
    </div>
  );
}
