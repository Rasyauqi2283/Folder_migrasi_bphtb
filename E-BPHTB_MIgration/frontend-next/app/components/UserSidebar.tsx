"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";

/** Base path legacy HTML di public (Next.js serve dari /html_folder/...). */
const LEGACY = "/html_folder";

/** Item menu single link. */
interface SidebarLink {
  href: string;
  label: string;
  icon: string;
}

/** Item menu dropdown (punya submenu). */
interface SidebarDropdown {
  label: string;
  icon: string;
  children: { href: string; label: string }[];
}

type SidebarEntry = SidebarLink | SidebarDropdown;

function isDropdown(e: SidebarEntry): e is SidebarDropdown {
  return "children" in e && Array.isArray((e as SidebarDropdown).children);
}

/** Konfigurasi aside per divisi — disesuaikan dari legacy: ppat, ltb, lsb, peneliti, penelitiValidasi, bank. CS & WP masih pengembangan. */
const ROLE_SIDEBAR: Record<string, SidebarEntry[]> = {
  // PPAT — legacy: Dashboard, Booking SSPD (Badan/Perorangan), Laporan PPAT (Rekap, Monitoring Keterlambatan, Rincian Bulanan), FAQ, Log Out
  PPAT: [
    { href: "/dashboard", label: "Dashboard", icon: "🏠" },
    {
      label: "Booking SSPD",
      icon: "📒",
      children: [
        { href: `${LEGACY}/PPAT/BOOKING-SSPD/bookingsspd-badan.html`, label: "Booking SSPD Badan" },
        { href: `${LEGACY}/PPAT/BOOKING-SSPD/bookingsspd-perorangan.html`, label: "Booking SSPD Perorangan" },
      ],
    },
    {
      label: "Laporan PPAT",
      icon: "📁",
      children: [
        { href: `${LEGACY}/PPAT/LAPORAN-PPAT/laporan_rekap.html`, label: "Laporan Rekap PPAT" },
        { href: `${LEGACY}/PPAT/LAPORAN-PPAT/monitoring_keteralmbatan_dokumen_ppat.html`, label: "Monitoring Keterlambatan" },
        { href: `${LEGACY}/PPAT/LAPORAN-PPAT/rincian_laporan_bulanan.html`, label: "Rincian Laporan Bulanan PPAT" },
      ],
    },
  ],
  PPATS: [
    { href: "/dashboard", label: "Dashboard", icon: "🏠" },
    {
      label: "Booking SSPD",
      icon: "📒",
      children: [
        { href: `${LEGACY}/PPAT/BOOKING-SSPD/bookingsspd-badan.html`, label: "Booking SSPD Badan" },
        { href: `${LEGACY}/PPAT/BOOKING-SSPD/bookingsspd-perorangan.html`, label: "Booking SSPD Perorangan" },
      ],
    },
    {
      label: "Laporan PPAT",
      icon: "📁",
      children: [
        { href: `${LEGACY}/PPAT/LAPORAN-PPAT/laporan_rekap.html`, label: "Laporan Rekap PPAT" },
        { href: `${LEGACY}/PPAT/LAPORAN-PPAT/monitoring_keteralmbatan_dokumen_ppat.html`, label: "Monitoring Keterlambatan" },
        { href: `${LEGACY}/PPAT/LAPORAN-PPAT/rincian_laporan_bulanan.html`, label: "Rincian Laporan Bulanan PPAT" },
      ],
    },
  ],
  NOTARIS: [
    { href: "/dashboard", label: "Dashboard", icon: "🏠" },
    {
      label: "Booking SSPD",
      icon: "📒",
      children: [
        { href: `${LEGACY}/PPAT/BOOKING-SSPD/bookingsspd-badan.html`, label: "Booking SSPD Badan" },
        { href: `${LEGACY}/PPAT/BOOKING-SSPD/bookingsspd-perorangan.html`, label: "Booking SSPD Perorangan" },
      ],
    },
    {
      label: "Laporan PPAT",
      icon: "📁",
      children: [
        { href: `${LEGACY}/PPAT/LAPORAN-PPAT/laporan_rekap.html`, label: "Laporan Rekap PPAT" },
        { href: `${LEGACY}/PPAT/LAPORAN-PPAT/monitoring_keteralmbatan_dokumen_ppat.html`, label: "Monitoring Keterlambatan" },
        { href: `${LEGACY}/PPAT/LAPORAN-PPAT/rincian_laporan_bulanan.html`, label: "Rincian Laporan Bulanan PPAT" },
      ],
    },
  ],

  // LTB — legacy: Dashboard, Terima Berkas SSPD (Permohonan Validasi SSPD), FAQ, Log Out
  LTB: [
    { href: "/dashboard", label: "Dashboard", icon: "🏠" },
    {
      label: "Terima Berkas SSPD",
      icon: "📂",
      children: [
        { href: `${LEGACY}/LTB/TerimaBerkas-SSPD/terima-berkas-sspd.html`, label: "Permohonan Validasi SSPD" },
      ],
    },
  ],

  // LSB — legacy: Dashboard, Pelayanan Penyerahan SSPD (2 sub), FAQ, Log Out
  LSB: [
    { href: "/dashboard", label: "Dashboard", icon: "🏠" },
    {
      label: "Pelayanan Penyerahan SSPD",
      icon: "✈",
      children: [
        { href: `${LEGACY}/LSB/Pelayanan_Penyerahan-SSPD/pelayanan-penyerahan-sspd.html`, label: "Pelayanan Penyerahan SSPD" },
        { href: `${LEGACY}/LSB/Pelayanan_Penyerahan-SSPD/monitoring_penyerahan_sspd.html`, label: "Monitoring Penyerahan SSPD" },
      ],
    },
  ],

  // Peneliti — legacy: Dashboard, Verifikasi SSPD (banyak sub), FAQ, Log Out
  Peneliti: [
    { href: "/dashboard", label: "Dashboard", icon: "🏠" },
    {
      label: "Verifikasi SSPD",
      icon: "⚖",
      children: [
        { href: `${LEGACY}/Peneliti/Verifikasi_sspd/verifikasi-data.html`, label: "Verifikasi SSPD" },
        { href: `${LEGACY}/admins_Peneliti/adminv_verifikasisspd/adminv_Verifikasi_SSPD/admin_verifikasisspd_off.html`, label: "Verifikasi SSPD Offline" },
        { href: `${LEGACY}/Peneliti/ParafKasie-sspd/paraf-kasie.html`, label: "Kasie Verifikasi SSPD" },
        { href: `${LEGACY}/admins_Peneliti/adminv_verifikasisspd/adminv_Kasie_Verifikasi_SSPD/admin_kasie_verifikasisspd_off.html`, label: "Kasie Verifikasi SSPD Offline" },
        { href: `${LEGACY}/admins_Peneliti/adminv_verifikasisspd/adminv_Proses_SKPD_KurangBayar/admin_proses_SKPD_kurangbayar.html`, label: "SKPD Kurang Bayar" },
        { href: `${LEGACY}/admins_Peneliti/adminv_verifikasisspd/adminv_Proses_SKPD_KurangBayar/admin_proses_SKPD_kurangbayar_off.html`, label: "SKPD Kurang Bayar Offline" },
      ],
    },
  ],

  // Peneliti Validasi — legacy: Dashboard, Validasi Berkas SSPD, Sinkronisasi dan Paraf, Monitoring SSPD, FAQ, Log Out
  "Peneliti Validasi": [
    { href: "/dashboard", label: "Dashboard", icon: "🏠" },
    {
      label: "Validasi Berkas SSPD",
      icon: "✓",
      children: [
        { href: `${LEGACY}/ParafP/Verifikasi_SSPD/Validasi_berkas_online.html`, label: "Validasi Berkas SSPD Online" },
        { href: `${LEGACY}/ParafP/Verifikasi_SSPD/Validasi_berkas_offline.html`, label: "Validasi Berkas SSPD Offline" },
      ],
    },
    {
      label: "Sinkronisasi dan Paraf",
      icon: "✍",
      children: [
        { href: `${LEGACY}/ParafP/Sinkronisasi_validasi/Sertifikat_digital.html`, label: "Sertifikat Digital" },
        { href: `${LEGACY}/ParafP/Sinkronisasi_validasi/tanda_paraf.html`, label: "Tanda Paraf" },
      ],
    },
    {
      label: "Monitoring SSPD",
      icon: "📺",
      children: [
        { href: `${LEGACY}/ParafP/Monitoring/monitoring_verifikasi.html`, label: "Monitoring Verifikasi SSPD" },
        { href: `${LEGACY}/ParafP/Monitoring/monitoring_skpd_kurang.html`, label: "Monitoring SKPD Kurang Bayar" },
      ],
    },
  ],

  // BANK — legacy: Dashboard, Transaksi BANK (Hasil transaksi), FAQ, Log Out
  BANK: [
    { href: "/dashboard", label: "Dashboard", icon: "🏠" },
    {
      label: "Transaksi BANK",
      icon: "💰",
      children: [
        { href: `${LEGACY}/Bank/Hasil_Transaksi/hasil_transaksi.html`, label: "Hasil transaksi" },
      ],
    },
  ],

  // CS & WP — masih dalam pengembangan: hanya Dashboard, FAQ, Profil
  "Customer Service": [
    { href: "/dashboard", label: "Dashboard", icon: "🏠" },
  ],
  "Wajib Pajak": [
    { href: "/dashboard", label: "Dashboard", icon: "🏠" },
  ],
  Administrator: [
    { href: "/dashboard", label: "Dashboard", icon: "🏠" },
  ],
};

const FAQ_ENTRY: SidebarLink = { href: "/faq", label: "Tanya Jawab (FAQ)", icon: "❓" };
const PROFIL_ENTRY: SidebarLink = { href: "/profile", label: "Profil", icon: "👤" };

function getEntriesForDivisi(divisi: string | undefined): SidebarEntry[] {
  const role = divisi ? ROLE_SIDEBAR[divisi] ?? [] : [];
  return [...role, FAQ_ENTRY, PROFIL_ENTRY];
}

export default function UserSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const divisi = user?.divisi;
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const isActive = useCallback(
    (href: string) => href !== "#" && (pathname === href || pathname.startsWith(href + "/")),
    [pathname]
  );

  const entries = getEntriesForDivisi(divisi);

  const asideStyle: React.CSSProperties = {
    width: 260,
    minWidth: 260,
    background:
      "linear-gradient(180deg, var(--base_dark) 0%, rgba(0,77,154,0.16) 25%, rgba(0,77,154,0.08) 50%, rgba(0,77,154,0.12) 75%, var(--base_dark) 100%)",
    height: "calc(100vh - 80px - 40px)",
    marginTop: 80,
    position: "fixed",
    left: 0,
    top: 0,
    color: "var(--color_font)",
    borderRight: "1px solid var(--border_sidebar)",
    boxShadow: "2px 0 16px rgba(0,0,0,0.4)",
    display: "flex",
    flexDirection: "column",
    paddingTop: 20,
    overflow: "hidden",
    zIndex: 10,
  };

  const linkStyle = (active: boolean): React.CSSProperties => ({
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "12px 20px",
    color: active ? "var(--accent_hover)" : "var(--color_font_muted)",
    textDecoration: "none",
    borderLeft: active ? "3px solid var(--accent)" : "3px solid transparent",
    background: active ? "var(--surface_light)" : "transparent",
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    transition: "all 0.2s",
  });

  const dropdownTriggerStyle = (open: boolean): React.CSSProperties => ({
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "12px 20px",
    color: "var(--color_font_muted)",
    borderLeft: "3px solid transparent",
    background: open ? "var(--surface_light)" : "transparent",
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    cursor: "pointer",
    width: "100%",
    transition: "all 0.2s",
  });

  const subLinkStyle = (active: boolean): React.CSSProperties => ({
    display: "block",
    padding: "8px 20px 8px 44px",
    color: active ? "var(--accent_hover)" : "var(--color_font_dim)",
    textDecoration: "none",
    fontSize: 14,
    borderLeft: active ? "2px solid var(--accent)" : "2px solid transparent",
  });

  const logoutStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "12px 20px",
    color: "var(--color_logout)",
    cursor: "pointer",
    borderTop: "1px solid var(--border_sidebar)",
    marginTop: "auto",
  };

  return (
    <aside style={asideStyle}>
      <nav style={{ display: "flex", flexDirection: "column", gap: 4, padding: "0 8px", flex: 1, overflowY: "auto" }}>
        {entries.map((entry) => {
          if (isDropdown(entry)) {
            const key = entry.label;
            const isOpen = openDropdown === key;
            return (
              <div key={key}>
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setOpenDropdown(isOpen ? null : key)}
                  onKeyDown={(e) => e.key === "Enter" && setOpenDropdown(isOpen ? null : key)}
                  style={dropdownTriggerStyle(isOpen)}
                >
                  <span style={{ fontSize: "1.1rem" }}>{entry.icon}</span>
                  <span style={{ fontWeight: 500 }}>{entry.label}</span>
                  <span style={{ marginLeft: "auto", fontSize: 12 }}>{isOpen ? "▼" : "▶"}</span>
                </div>
                {isOpen && (
                  <div style={{ display: "flex", flexDirection: "column", paddingBottom: 8 }}>
                    {entry.children.map((child) => (
                      <Link
                        key={child.href + child.label}
                        href={child.href}
                        style={subLinkStyle(isActive(child.href))}
                        target={child.href.startsWith(LEGACY) ? "_blank" : undefined}
                        rel={child.href.startsWith(LEGACY) ? "noopener noreferrer" : undefined}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          }
          return (
            <Link
              key={entry.href + entry.label}
              href={entry.href}
              style={linkStyle(isActive(entry.href))}
            >
              <span style={{ fontSize: "1.1rem" }}>{entry.icon}</span>
              <span style={{ fontWeight: 500 }}>{entry.label}</span>
            </Link>
          );
        })}
      </nav>
      <div
        role="button"
        tabIndex={0}
        onClick={logout}
        onKeyDown={(e) => e.key === "Enter" && logout()}
        style={logoutStyle}
      >
        <span style={{ fontSize: "1.1rem" }}>🚪</span>
        <span style={{ fontWeight: 500 }}>Log Out</span>
      </div>
    </aside>
  );
}
