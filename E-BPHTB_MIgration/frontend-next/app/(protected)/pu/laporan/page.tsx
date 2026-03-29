"use client";

import Link from "next/link";

const links = [
  { href: "/pu/laporan/rekap", label: "Laporan rekap", desc: "Berkas berstatus diserahkan" },
  { href: "/pu/laporan/rincian", label: "Rincian laporan", desc: "Rincian per bulan" },
  { href: "/pu/laporan/monitoring-keterlambatan", label: "Monitoring keterlambatan", desc: "Status laporan & tenggat" },
  { href: "/pu/laporan/unggah-laporan-bulanan", label: "Unggah laporan bulanan", desc: "Kirim laporan aktivitas" },
];

export default function PuLaporanIndexPage() {
  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      <h1 style={{ fontSize: 26, color: "var(--color_font_main)", marginBottom: 8 }}>Laporan PU</h1>
      <p style={{ color: "var(--color_font_muted)", marginBottom: 28 }}>
        Pilih jenis laporan yang ingin dibuka.
      </p>
      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
        {links.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              style={{
                display: "block",
                padding: "16px 18px",
                borderRadius: 12,
                border: "1px solid var(--border_color)",
                background: "var(--card_bg)",
                textDecoration: "none",
                color: "var(--color_font_main)",
                boxShadow: "var(--card_shadow)",
              }}
            >
              <span style={{ fontWeight: 600 }}>{item.label}</span>
              <span style={{ display: "block", fontSize: 13, color: "var(--color_font_muted)", marginTop: 4 }}>
                {item.desc}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <p style={{ marginTop: 28 }}>
        <Link href="/pu" style={{ color: "var(--accent)" }}>
          ← Kembali ke dashboard PU
        </Link>
      </p>
    </div>
  );
}
