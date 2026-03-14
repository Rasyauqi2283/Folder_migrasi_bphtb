"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useSidebar } from "../context/SidebarContext";
import FeatherIcon from "./FeatherIcon";
import styles from "./admin/AdminSidebar.module.css";

/** Base path legacy HTML di public. */
const LEGACY = "/html_folder";

const transition = "0.5s cubic-bezier(0.4, 0, 0.2, 1)";
const dropdownTransition = "0.3s ease";
const HOVER_CLOSE_DELAY = 200;
const PORTRAIT_MAX = 640;

function useIsPortrait() {
  const [isPortrait, setIsPortrait] = useState(false);
  useEffect(() => {
    const check = () =>
      setIsPortrait(typeof window !== "undefined" && window.innerWidth <= PORTRAIT_MAX);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isPortrait;
}

/** Feather icon name (sesuai FeatherIcon.tsx) */
type FeatherIconName =
  | "layout"
  | "book"
  | "folder"
  | "send"
  | "scale"
  | "check-circle"
  | "folder-plus"
  | "image"
  | "dollar-sign"
  | "help-circle"
  | "user"
  | "log-out";

interface SidebarLink {
  href: string;
  label: string;
  icon: FeatherIconName;
}

interface SidebarDropdown {
  label: string;
  icon: FeatherIconName;
  children: { href: string; label: string }[];
}

type SidebarEntry = SidebarLink | SidebarDropdown;

function isDropdown(e: SidebarEntry): e is SidebarDropdown {
  return "children" in e && Array.isArray((e as SidebarDropdown).children);
}

const ROLE_SIDEBAR: Record<string, SidebarEntry[]> = {
  PPAT: [
    { href: "/pu", label: "Dashboard", icon: "layout" },
    {
      label: "Booking SSPD",
      icon: "book",
      children: [
        { href: "/pu/booking-sspd/badan", label: "Booking SSPD Badan" },
        { href: "/pu/booking-sspd/perorangan", label: "Booking SSPD Perorangan" },
      ],
    },
    {
      label: "Laporan pu",
      icon: "folder",
      children: [
        { href: "/pu/laporan/rekap", label: "Laporan Rekap PPAT" },
        { href: "/pu/laporan/monitoring-keterlambatan", label: "Monitoring Keterlambatan" },
        { href: "/pu/laporan/rincian", label: "Rincian Laporan Bulanan pu" },
      ],
    },
  ],
  PPATS: [
    { href: "/pu", label: "Dashboard", icon: "layout" },
    {
      label: "Booking SSPD",
      icon: "book",
      children: [
        { href: "/pu/booking-sspd/badan", label: "Booking SSPD Badan" },
        { href: "/pu/booking-sspd/perorangan", label: "Booking SSPD Perorangan" },
      ],
    },
    {
      label: "Laporan pu",
      icon: "folder",
      children: [
        { href: "/pu/laporan/rekap", label: "Laporan Rekap PPAT" },
        { href: "/pu/laporan/monitoring-keterlambatan", label: "Monitoring Keterlambatan" },
        { href: "/pu/laporan/rincian", label: "Rincian Laporan Bulanan pu" },
      ],
    },
  ],
  NOTARIS: [
    { href: "/pu", label: "Dashboard", icon: "layout" },
    {
      label: "Booking SSPD",
      icon: "book",
      children: [
        { href: "/pu/booking-sspd/badan", label: "Booking SSPD Badan" },
        { href: "/pu/booking-sspd/perorangan", label: "Booking SSPD Perorangan" },
      ],
    },
    {
      label: "Laporan pu",
      icon: "folder",
      children: [
        { href: "/pu/laporan/rekap", label: "Laporan Rekap PPAT" },
        { href: "/pu/laporan/monitoring-keterlambatan", label: "Monitoring Keterlambatan" },
        { href: "/pu/laporan/rincian", label: "Rincian Laporan Bulanan pu" },
      ],
    },
  ],
  LTB: [
    { href: "/dashboard", label: "Dashboard", icon: "layout" },
    {
      label: "Terima Berkas SSPD",
      icon: "folder",
      children: [
        { href: `${LEGACY}/LTB/TerimaBerkas-SSPD/terima-berkas-sspd.html`, label: "Permohonan Validasi SSPD" },
      ],
    },
  ],
  LSB: [
    { href: "/dashboard", label: "Dashboard", icon: "layout" },
    {
      label: "Pelayanan Penyerahan SSPD",
      icon: "send",
      children: [
        { href: `${LEGACY}/LSB/Pelayanan_Penyerahan-SSPD/pelayanan-penyerahan-sspd.html`, label: "Pelayanan Penyerahan SSPD" },
        { href: `${LEGACY}/LSB/Pelayanan_Penyerahan-SSPD/monitoring_penyerahan_sspd.html`, label: "Monitoring Penyerahan SSPD" },
      ],
    },
  ],
  Peneliti: [
    { href: "/dashboard", label: "Dashboard", icon: "layout" },
    {
      label: "Verifikasi SSPD",
      icon: "scale",
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
  "Peneliti Validasi": [
    { href: "/dashboard", label: "Dashboard", icon: "layout" },
    {
      label: "Validasi Berkas SSPD",
      icon: "check-circle",
      children: [
        { href: `${LEGACY}/ParafP/Verifikasi_SSPD/Validasi_berkas_online.html`, label: "Validasi Berkas SSPD Online" },
        { href: `${LEGACY}/ParafP/Verifikasi_SSPD/Validasi_berkas_offline.html`, label: "Validasi Berkas SSPD Offline" },
      ],
    },
    {
      label: "Sinkronisasi dan Paraf",
      icon: "folder-plus",
      children: [
        { href: `${LEGACY}/ParafP/Sinkronisasi_validasi/Sertifikat_digital.html`, label: "Sertifikat Digital" },
        { href: `${LEGACY}/ParafP/Sinkronisasi_validasi/tanda_paraf.html`, label: "Tanda Paraf" },
      ],
    },
    {
      label: "Monitoring SSPD",
      icon: "image",
      children: [
        { href: `${LEGACY}/ParafP/Monitoring/monitoring_verifikasi.html`, label: "Monitoring Verifikasi SSPD" },
        { href: `${LEGACY}/ParafP/Monitoring/monitoring_skpd_kurang.html`, label: "Monitoring SKPD Kurang Bayar" },
      ],
    },
  ],
  BANK: [
    { href: "/dashboard", label: "Dashboard", icon: "layout" },
    {
      label: "Transaksi BANK",
      icon: "dollar-sign",
      children: [{ href: `${LEGACY}/Bank/Hasil_Transaksi/hasil_transaksi.html`, label: "Hasil transaksi" }],
    },
  ],
  "Customer Service": [{ href: "/dashboard", label: "Dashboard", icon: "layout" }],
  "Wajib Pajak": [{ href: "/dashboard", label: "Dashboard", icon: "layout" }],
  Administrator: [{ href: "/dashboard", label: "Dashboard", icon: "layout" }],
};

const FAQ_ENTRY: SidebarLink = { href: "/faq", label: "Tanya Jawab (FAQ)", icon: "help-circle" };
const PROFIL_ENTRY: SidebarLink = { href: "/profile", label: "Profil", icon: "user" };

function getEntriesForDivisi(divisi: string | undefined): SidebarEntry[] {
  const role = divisi ? ROLE_SIDEBAR[divisi] ?? [] : [];
  return [...role, FAQ_ENTRY, PROFIL_ENTRY];
}

export default function UserSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { sidebarExpanded, toggleSidebar } = useSidebar();
  const divisi = user?.divisi;
  const isPortrait = useIsPortrait();
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const hoverCloseRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const entries = getEntriesForDivisi(divisi);

  const isActive = (path: string) =>
    path !== "#" && (pathname === path || pathname.startsWith(path + "/"));

  useEffect(() => {
    if (!sidebarExpanded) setOpenDropdownId(null);
  }, [sidebarExpanded]);

  const handleDropdownToggle = (id: string) => {
    if (!sidebarExpanded) {
      toggleSidebar();
      setTimeout(() => setOpenDropdownId((prev) => (prev === id ? null : id)), 350);
    } else {
      setOpenDropdownId((prev) => (prev === id ? null : id));
    }
  };

  const handleDropdownEnter = (id: string) => {
    if (hoverCloseRef.current) {
      clearTimeout(hoverCloseRef.current);
      hoverCloseRef.current = null;
    }
    if (sidebarExpanded && !isPortrait) setOpenDropdownId(id);
  };

  const handleDropdownLeave = () => {
    if (isPortrait) return;
    hoverCloseRef.current = setTimeout(() => setOpenDropdownId(null), HOVER_CLOSE_DELAY);
  };

  const handleBackdropClick = () => {
    setOpenDropdownId(null);
    if (isPortrait) toggleSidebar();
  };

  const baseAsideStyle: React.CSSProperties = {
    width: sidebarExpanded ? 250 : 60,
    minWidth: sidebarExpanded ? 250 : 60,
    background:
      "linear-gradient(180deg, var(--base_dark) 0%, var(--sidebar_wave_25) 25%, var(--sidebar_wave_50) 50%, var(--sidebar_wave_75) 75%, var(--base_dark) 100%)",
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
    transition: `width ${transition}`,
  };

  const menuItemClasses = (active: boolean) =>
    `${styles.menuItem} ${active ? styles.menuItemActive : ""} ${!sidebarExpanded ? styles.menuItemCollapsed : ""}`;

  const radioStyle = (active: boolean): React.CSSProperties => ({
    width: 8,
    height: 8,
    borderRadius: "50%",
    flexShrink: 0,
    background: active ? "var(--accent)" : "var(--color_font_muted)",
  });

  const iconStyle: React.CSSProperties = {
    opacity: sidebarExpanded ? 1 : 0,
    visibility: sidebarExpanded ? "visible" : "hidden",
    transition: `opacity ${dropdownTransition}, visibility ${dropdownTransition}`,
  };

  const textStyle: React.CSSProperties = {
    opacity: sidebarExpanded ? 1 : 0,
    visibility: sidebarExpanded ? "visible" : "hidden",
    whiteSpace: "nowrap",
    overflow: "hidden",
    transition: `opacity ${dropdownTransition}`,
  };

  const dropdownContentClasses = (isOpen: boolean) =>
    `${styles.dropdownContent} ${isOpen ? styles.dropdownContentOpen : styles.dropdownContentClosed}`;

  const backdropStyle: React.CSSProperties = {
    position: "fixed",
    top: 80,
    left: sidebarExpanded ? 250 : 60,
    right: 0,
    bottom: 0,
    transition: `left ${transition}`,
  };

  const dropdownLinkClasses = (active: boolean) =>
    `${styles.dropdownLink} ${active ? styles.dropdownLinkActive : ""}`;

  const logoutStyle: React.CSSProperties = {
    padding: sidebarExpanded ? "12px 20px" : "12px",
    color: "var(--color_logout)",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 12,
    justifyContent: sidebarExpanded ? "flex-start" : "center",
    borderTop: "1px solid var(--border_sidebar)",
  };

  return (
    <>
      {openDropdownId && (
        <div
          className="aside-dropdown-backdrop"
          style={backdropStyle}
          onClick={handleBackdropClick}
          onKeyDown={(e) => e.key === "Enter" && handleBackdropClick()}
          role="button"
          tabIndex={0}
          aria-hidden
        />
      )}
      <aside
        className={`${styles.asideBase} ${!sidebarExpanded ? styles.asideCollapsed : ""}`}
        style={baseAsideStyle}
      >
        <div style={{ overflowY: "auto", overflowX: "hidden", flex: 1 }}>
          {entries.map((entry) => {
            if (isDropdown(entry)) {
              const key = entry.label;
              const isOpen = openDropdownId === key;
              const anyChildActive = entry.children.some((c) => isActive(c.href));
              return (
                <div
                  key={key}
                  style={{ padding: "2px", cursor: "pointer" }}
                  onMouseEnter={() => handleDropdownEnter(key)}
                  onMouseLeave={handleDropdownLeave}
                >
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDropdownToggle(key);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleDropdownToggle(key);
                      }
                    }}
                    className={menuItemClasses(anyChildActive)}
                  >
                    {sidebarExpanded ? (
                      <>
                        <span className={styles.iconWrap} style={iconStyle}>
                          <FeatherIcon name={entry.icon} size={20} />
                        </span>
                        <span style={textStyle}>{entry.label}</span>
                      </>
                    ) : (
                      <span style={radioStyle(anyChildActive)} />
                    )}
                  </div>
                  <div className={dropdownContentClasses(isOpen)}>
                    {entry.children.map((child) => (
                      <Link
                        key={child.href + child.label}
                        href={child.href}
                        className={dropdownLinkClasses(isActive(child.href))}
                        target={child.href.startsWith(LEGACY) ? "_blank" : undefined}
                        rel={child.href.startsWith(LEGACY) ? "noopener noreferrer" : undefined}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            }
            return (
              <div key={entry.href + entry.label} style={{ padding: "2px", cursor: "pointer" }}>
                <Link href={entry.href} className={menuItemClasses(isActive(entry.href))}>
                  {sidebarExpanded ? (
                    <>
                      <span className={styles.iconWrap} style={iconStyle}>
                        <FeatherIcon name={entry.icon} size={20} />
                      </span>
                      <span style={textStyle}>{entry.label}</span>
                    </>
                  ) : (
                    <span style={radioStyle(isActive(entry.href))} />
                  )}
                </Link>
              </div>
            );
          })}
        </div>

        <div
          style={logoutStyle}
          onClick={logout}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && logout()}
        >
          {sidebarExpanded ? (
            <>
              <span className={styles.iconWrap}>
                <FeatherIcon name="log-out" size={20} />
              </span>
              <span style={textStyle}>Log Out</span>
            </>
          ) : (
            <span style={radioStyle(false)} />
          )}
        </div>
      </aside>
    </>
  );
}
