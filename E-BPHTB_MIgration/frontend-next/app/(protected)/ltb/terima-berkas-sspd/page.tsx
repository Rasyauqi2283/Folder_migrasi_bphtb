"use client";

import { useState } from "react";
import Link from "next/link";

const thStyle: React.CSSProperties = {
  padding: "12px 10px",
  textAlign: "center",
  borderBottom: "2px solid var(--border_color)",
  background: "var(--card_bg_grey)",
  fontWeight: 600,
  fontSize: 13,
};
const tdStyle: React.CSSProperties = {
  padding: "10px",
  borderBottom: "1px solid var(--border_color)",
  fontSize: 14,
};

export default function LTBTerimaBerkasSSPDPage() {
  const [search, setSearch] = useState("");

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>
      <h1 style={{ margin: "0 0 8px", color: "var(--color_font_main)" }}>Terima Berkas SSPD</h1>
      <p style={{ margin: 0, color: "var(--color_font_muted)", marginBottom: 20 }}>
        Permohonan Validasi SSPD — daftar berkas dari PU. (UI saja, integrasi API menyusul.)
      </p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", marginBottom: 16 }}>
        <button
          type="button"
          style={{
            padding: "10px 20px",
            borderRadius: 8,
            border: "none",
            background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
            color: "#fff",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          View Dokumen
        </button>
        <button
          type="button"
          style={{
            padding: "10px 20px",
            borderRadius: 8,
            border: "none",
            background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
            color: "#fff",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Tolak
        </button>
        <input
          type="text"
          placeholder="Cari..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            marginLeft: "auto",
            padding: "10px 14px",
            borderRadius: 8,
            border: "1px solid var(--border_color)",
            minWidth: 200,
            background: "var(--card_bg)",
            color: "var(--color_font_main)",
          }}
        />
      </div>

      <div style={{ overflowX: "auto", border: "1px solid var(--border_color)", borderRadius: 12, background: "var(--card_bg)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={thStyle}>No. Registrasi</th>
              <th style={thStyle}>No. Booking</th>
              <th style={thStyle}>NOP PBB</th>
              <th style={thStyle}>Nama Wajib Pajak</th>
              <th style={thStyle}>Nama Pemilik Objek Pajak</th>
              <th style={thStyle}>Tanggal Terima</th>
              <th style={thStyle}>Track Status</th>
              <th style={thStyle}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={8} style={{ ...tdStyle, textAlign: "center", padding: 40, color: "var(--color_font_main_muted)" }}>
                Data akan dimuat dari API. (UI placeholder.)
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p style={{ marginTop: 20 }}>
        <Link href="/ltb" style={{ color: "var(--accent)", fontWeight: 600 }}>
          ← Kembali ke Dashboard LTB
        </Link>
      </p>
    </div>
  );
}
