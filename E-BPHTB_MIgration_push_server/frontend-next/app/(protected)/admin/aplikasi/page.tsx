"use client";

import Link from "next/link";

type MenuItem = {
  label: string;
  href?: string;
  external?: boolean;
  children?: MenuItem[];
};

type MenuSection = {
  title: string;
  items: MenuItem[];
};

const sections: MenuSection[] = [
  {
    title: "Admin",
    items: [
      { label: "Dashboard", href: "/admin" },
      {
        label: "Aplikasi (legacy)",
        href: "/html_folder/Admin/Aplikasi/aplikasi-admin.html",
        external: true,
      },
      {
        label: "Referensi User",
        children: [
          { label: "Pemutakhiran Data PPAT", href: "/admin/referensi/pemutakhiran-ppat" },
          { label: "Status PPAT", href: "/admin/referensi/status-ppat" },
          { label: "Validasi QR", href: "/admin/referensi/validasi-qr" },
        ],
      },
      {
        label: "User Data",
        children: [
          { label: "Verifikasi Data User", href: "/admin/data-user/pending" },
          { label: "Data User", href: "/admin/data-user/complete" },
        ],
      },
      {
        label: "Users & Group",
        children: [
          { label: "Users Group", href: "/admin/group-user/users-group" },
          { label: "Group Users", href: "/admin/group-user/group-users" },
          { label: "Group Privilege", href: "/admin/group-user/group-privilege" },
        ],
      },
      { label: "Iklan", href: "/admin/iklan" },
    ],
  },
  {
    title: "PPAT (PU)",
    items: [
      {
        label: "Booking SSPD",
        children: [
          { label: "Booking SSPD Badan", href: "/pu/booking-sspd/badan" },
          { label: "Booking SSPD Perorangan", href: "/pu/booking-sspd/perorangan" },
        ],
      },
      {
        label: "Laporan Bulanan PPAT",
        children: [
          { label: "Unggah Laporan Bulanan", href: "/pu/laporan/unggah-laporan-bulanan" },
          { label: "Laporan Rekap", href: "/pu/laporan/rekap" },
          { label: "Rincian Laporan", href: "/pu/laporan/rincian" },
          { label: "Monitoring Keterlambatan", href: "/pu/laporan/monitoring-keterlambatan" },
        ],
      },
    ],
  },
  {
    title: "Loket Terima Berkas (LTB)",
    items: [
      { label: "Terima Berkas SSPD", href: "/ltb/terima-berkas-sspd" },
      { label: "Penginputan Offline", href: "/ltb/penginputan-offline" },
    ],
  },
  {
    title: "Loket Serah Berkas (LSB)",
    items: [
      { label: "Pelayanan Penyerahan SSPD", href: "/lsb/pelayanan-penyerahan-sspd" },
      { label: "Monitoring Penyerahan", href: "/lsb/monitoring-penyerahan" },
    ],
  },
  {
    title: "Peneliti",
    items: [
      { label: "Verifikasi SSPD", href: "/peneliti/verifikasi-sspd" },
      { label: "Paraf Kasie", href: "/peneliti/paraf-kasie" },
      {
        label: "Peneliti Validasi",
        children: [
          { label: "Monitoring Verifikasi", href: "/peneliti-validasi/monitoring-verifikasi" },
          { label: "Monitoring SKPD Kurang Bayar", href: "/peneliti-validasi/monitoring-skpd-kurang" },
          { label: "Validasi Online", href: "/peneliti-validasi/validasi-online" },
          { label: "Tanda Paraf", href: "/peneliti-validasi/tanda-paraf" },
          { label: "Sertifikat Digital", href: "/peneliti-validasi/sertifikat-digital" },
        ],
      },
    ],
  },
  {
    title: "Bank",
    items: [{ label: "Hasil Transaksi", href: "/bank/hasil-transaksi" }],
  },
];

function AplikasiLink({ item }: { item: MenuItem }) {
  const baseStyle: React.CSSProperties = {
    padding: "12px 14px",
    borderRadius: 10,
    border: "1px solid rgba(65,90,119,0.35)",
    background: "rgba(27, 38, 59, 0.65)",
    color: "#fff",
    textDecoration: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    fontWeight: 800,
  };

  if (!item.href) {
    return (
      <div style={{ ...baseStyle, opacity: 0.65, cursor: "not-allowed" }}>
        <span>{item.label}</span>
        <span style={{ opacity: 0.75 }}>—</span>
      </div>
    );
  }

  if (item.external) {
    return (
      <a href={item.href} target="_blank" rel="noreferrer" style={baseStyle}>
        <span>{item.label}</span>
        <span style={{ opacity: 0.85 }}>→</span>
      </a>
    );
  }

  return (
    <Link href={item.href} style={baseStyle}>
      <span>{item.label}</span>
      <span style={{ opacity: 0.85 }}>→</span>
    </Link>
  );
}

export default function AdminAplikasiPage() {
  return (
    <div style={{ color: "#fff" }}>
      <h1 style={{ color: "#fff", margin: "0 0 0.5rem" }}>Aplikasi</h1>
      <p style={{ color: "rgba(255,255,255,0.7)", margin: "0 0 1.25rem" }}>
        Menu aplikasi disusun ulang mengikuti struktur legacy, namun seluruh navigasi mengarah ke modul Next.js/Golang.
      </p>

      <div style={{ display: "grid", gap: 14 }}>
        {sections.map((section) => (
          <div
            key={section.title}
            style={{
              borderRadius: 14,
              border: "1px solid rgba(65,90,119,0.35)",
              background: "rgba(13, 27, 42, 0.55)",
              overflow: "hidden",
              boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
            }}
          >
            <div
              style={{
                padding: "12px 16px",
                background: "rgba(27, 38, 59, 0.85)",
                borderBottom: "1px solid rgba(65,90,119,0.35)",
                fontWeight: 900,
                letterSpacing: 0.2,
              }}
            >
              {section.title}
            </div>

            <div style={{ padding: 16, display: "grid", gap: 10 }}>
              {section.items.map((item) => {
                if (item.children && item.children.length > 0) {
                  return (
                    <details
                      key={item.label}
                      style={{
                        borderRadius: 12,
                        border: "1px solid rgba(65,90,119,0.35)",
                        background: "rgba(27, 38, 59, 0.35)",
                        padding: 10,
                      }}
                    >
                      <summary style={{ cursor: "pointer", fontWeight: 900, color: "#fff" }}>{item.label}</summary>
                      <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
                        {item.children.map((child) => (
                          <AplikasiLink key={`${item.label}-${child.label}`} item={child} />
                        ))}
                      </div>
                    </details>
                  );
                }
                return <AplikasiLink key={item.label} item={item} />;
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
