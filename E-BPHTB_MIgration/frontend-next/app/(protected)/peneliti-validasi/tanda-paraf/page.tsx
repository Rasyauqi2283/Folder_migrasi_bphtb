"use client";

import Link from "next/link";

export default function PenelitiValidasiTandaParafPage() {
  return (
    <div style={{ maxWidth: 700, margin: "0 auto" }}>
      <h2 style={{ marginBottom: 20, fontSize: 24, fontWeight: 700 }}>Tanda Paraf</h2>
      <p style={{ marginBottom: 20, color: "var(--color_font_main_muted)" }}>
        Kelola tanda paraf dan generate QR. Upload paraf dapat dilakukan di halaman Profil atau halaman legacy.
      </p>
      <p>
        <Link href="/profile" style={{ color: "var(--accent)" }}>
          Buka Profil (upload paraf) →
        </Link>
      </p>
      <p style={{ marginTop: 12 }}>
        <a href="/html_folder/ParafP/Sinkronisasi_validasi/tanda_paraf.html" target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)" }}>
          Buka halaman legacy Tanda Paraf (generate QR, dll.) →
        </a>
      </p>
      <p style={{ marginTop: 24 }}>
        <Link href="/peneliti-validasi" style={{ color: "var(--accent)" }}>← Kembali ke Dashboard</Link>
      </p>
    </div>
  );
}
