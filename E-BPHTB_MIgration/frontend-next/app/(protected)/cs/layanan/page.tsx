"use client";

import Link from "next/link";

/**
 * Layanan — menampung input dari Contact Form (Judul, Keluhan, Isi, Email).
 * AI Bot memberi balasan otomatis sementara (Status: Antrian). Balasan resmi oleh CS via email.
 * (UI placeholder — integrasi data & AI/email menyusul.)
 */
export default function CsLayananPage() {
  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ margin: "0 0 8px", color: "var(--color_font_main)" }}>Layanan</h1>
      <p style={{ margin: 0, color: "var(--color_font_muted)", marginBottom: 24 }}>
        Daftar keluhan dari form kontak (Judul, Keluhan, Isi, Email). Status antrian, balasan otomatis sementara, lalu follow-up oleh CS via email.
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
        Daftar tiket/keluhan akan ditampilkan di sini. (Integrasi form kontak &amp; email menyusul.)
      </div>

      <p style={{ marginTop: 24 }}>
        <Link href="/cs" style={{ color: "var(--accent)", fontWeight: 600 }}>
          ← Kembali ke Dashboard CS
        </Link>
      </p>
    </div>
  );
}
