"use client";

import Link from "next/link";

export default function LTBPenginputanOfflinePage() {
  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      <h1 style={{ margin: "0 0 8px", color: "var(--color_font_main)" }}>Penginputan Offline</h1>
      <p style={{ margin: 0, color: "var(--color_font_muted)", marginBottom: 24 }}>
        Input berkas saat WP datang langsung ke kantor. UI/UX dan tabel input mengadopsi pola Role PU (Booking). Penyesuaian jenis dokumen dan perhitungan pajak sesuai berkas fisik. (UI placeholder — integrasi menyusul.)
      </p>

      <div
        style={{
          background: "var(--card_bg)",
          border: "1px solid var(--border_color)",
          borderRadius: 12,
          padding: 32,
          textAlign: "center",
          color: "var(--color_font_main_muted)",
        }}
      >
        Form input offline akan ditampilkan di sini (mirip Tambah Booking PU).
      </div>

      <p style={{ marginTop: 24 }}>
        <Link href="/ltb" style={{ color: "var(--accent)", fontWeight: 600 }}>
          ← Kembali ke Dashboard LTB
        </Link>
      </p>
    </div>
  );
}
