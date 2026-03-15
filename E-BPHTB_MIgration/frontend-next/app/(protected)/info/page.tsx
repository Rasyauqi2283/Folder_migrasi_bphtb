"use client";

import Link from "next/link";

/**
 * Halaman Informasi & Panduan.
 * Isi (markdown) dapat ditambahkan kemudian.
 */
export default function InfoPage() {
  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      <h1 style={{ margin: "0 0 0.5rem", color: "var(--color_font_main)" }}>
        Informasi &amp; Panduan
      </h1>
      <p style={{ margin: 0, color: "var(--color_font_muted)", marginBottom: 24 }}>
        Konten panduan dan informasi akan ditampilkan di sini (dapat berupa markdown).
      </p>

      <div
        className="info-content"
        style={{
          background: "var(--card_bg)",
          border: "1px solid var(--border_color)",
          borderRadius: 12,
          padding: 24,
          minHeight: 200,
          color: "var(--color_font_main)",
        }}
      >
        <p style={{ color: "var(--color_font_main_muted)" }}>
          [Area konten — isi markdown dapat Anda berikan nanti.]
        </p>
      </div>

      <p style={{ marginTop: 24 }}>
        <Link href="/dashboard" style={{ color: "var(--accent)", fontWeight: 600 }}>
          ← Kembali ke Dashboard
        </Link>
      </p>
    </div>
  );
}
