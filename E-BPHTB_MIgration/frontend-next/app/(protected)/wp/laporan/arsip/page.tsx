"use client";

import Link from "next/link";

/**
 * Arsip SSPD — daftar SSPD yang sudah disetujui, distempel, dan tervalidasi.
 * PDF siap di-download. Backup resmi jika berkas fisik rusak/hilang.
 * (UI placeholder — integrasi data & download menyusul.)
 */
export default function WpLaporanArsipPage() {
  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ margin: "0 0 8px", color: "var(--color_font_main)" }}>Arsip SSPD</h1>
      <p style={{ margin: 0, color: "var(--color_font_muted)", marginBottom: 24 }}>
        Daftar SSPD yang sudah disetujui, distempel, dan tervalidasi. PDF siap diunduh sebagai backup resmi.
      </p>

      <div
        style={{
          background: "var(--card_bg)",
          border: "1px solid var(--border_color)",
          borderRadius: 12,
          padding: 40,
          textAlign: "center",
          color: "var(--color_font_main_muted)",
        }}
      >
        Daftar arsip dan tombol download PDF akan ditampilkan di sini.
      </div>

      <p style={{ marginTop: 24 }}>
        <Link href="/wp" style={{ color: "var(--accent)", fontWeight: 600 }}>
          ← Kembali ke Dashboard WP
        </Link>
      </p>
    </div>
  );
}
