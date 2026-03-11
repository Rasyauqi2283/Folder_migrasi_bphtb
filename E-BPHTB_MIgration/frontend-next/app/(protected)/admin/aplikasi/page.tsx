"use client";

import Link from "next/link";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/data-user/pending", label: "Verifikasi Data User" },
  { href: "/admin/data-user/complete", label: "Data User" },
  { href: "/admin/referensi/pemutakhiran-ppat", label: "Pemutakhiran Data PPAT" },
  { href: "/admin/referensi/status-ppat", label: "Status PPAT" },
  { href: "/admin/referensi/validasi-qr", label: "Validasi QR" },
  {
    href: "/html_folder/Admin/Aplikasi/aplikasi-admin.html",
    label: "Aplikasi (legacy)",
    external: true,
  },
];

export default function AdminAplikasiPage() {
  return (
    <div>
      <h1 style={{ color: "#fff", margin: "0 0 0.5rem" }}>Aplikasi Admin</h1>
      <p style={{ color: "rgba(255,255,255,0.7)", margin: "0 0 1.5rem" }}>
        Pilih modul di bawah
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: 12,
        }}
      >
        {links.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            style={{
              padding: 16,
              background: "#1b263b",
              borderRadius: 8,
              border: "1px solid rgba(65,90,119,0.3)",
              color: "#fff",
              textDecoration: "none",
            }}
          >
            {item.label}
            {item.external && " →"}
          </Link>
        ))}
      </div>
    </div>
  );
}
