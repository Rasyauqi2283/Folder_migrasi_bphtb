"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { useSidebar } from "../../context/SidebarContext";
import FeatherIcon from "../FeatherIcon";
import styles from "./AdminSidebar.module.css";

const transition = "0.5s cubic-bezier(0.4, 0, 0.2, 1)";
const dropdownTransition = "0.3s ease";
const HOVER_CLOSE_DELAY = 200;
const PORTRAIT_MAX = 640;

function useIsPortrait() {
  const [isPortrait, setIsPortrait] = useState(false);
  useEffect(() => {
    const check = () => setIsPortrait(typeof window !== "undefined" && window.innerWidth <= PORTRAIT_MAX);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isPortrait;
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { sidebarExpanded, toggleSidebar } = useSidebar();
  const isPortrait = useIsPortrait();
  const [menuLainOpen, setMenuLainOpen] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const hoverCloseRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + "/");

  // Close dropdown when sidebar collapses
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
    background: "linear-gradient(180deg, var(--base_dark) 0%, var(--sidebar_wave_25) 25%, var(--sidebar_wave_50) 50%, var(--sidebar_wave_75) 75%, var(--base_dark) 100%)",
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

  /** Saat collapse hanya tampil bulat (radio); saat expand tampil icon + teks */
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

  /** Backdrop gelap + blur saat submenu terbuka (Discord-style) */
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

  const tierBoxStyle: React.CSSProperties = {
    background: "var(--surface_light)",
    color: "var(--color_font_dim)",
    padding: 10,
    textAlign: "center",
    fontWeight: 700,
    fontSize: 14,
    opacity: sidebarExpanded ? 1 : 0,
    visibility: sidebarExpanded ? "visible" : "hidden",
    transition: `opacity ${dropdownTransition}`,
  };

  const toggleStyle: React.CSSProperties = {
    padding: sidebarExpanded ? "10px 20px" : "10px",
    color: "var(--color_font_dim)",
    cursor: "pointer",
    fontSize: 13,
    borderTop: "1px solid var(--border_sidebar)",
    display: "flex",
    alignItems: "center",
    justifyContent: sidebarExpanded ? "flex-start" : "center",
    gap: 8,
  };

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
      {/* Backdrop blur gelap saat submenu terbuka (hover trigger, animasi halus) */}
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
        {/* Dashboard - icon 10 */}
        <div style={{ padding: "2px", cursor: "pointer" }}>
          <Link href="/admin" className={menuItemClasses(isActive("/admin") && pathname === "/admin")}>
            {sidebarExpanded ? (
              <>
                <span className={styles.iconWrap} style={iconStyle}><FeatherIcon name="layout" size={20} /></span>
                <span style={textStyle}>Dashboard</span>
              </>
            ) : (
              <span style={radioStyle(isActive("/admin") && pathname === "/admin")} />
            )}
          </Link>
        </div>

        {/* Aplikasi */}
        <div style={{ padding: "2px", cursor: "pointer" }}>
          <Link href="/admin/aplikasi" className={menuItemClasses(isActive("/admin/aplikasi"))}>
            {sidebarExpanded ? (
              <>
                <span className={styles.iconWrap} style={iconStyle}><FeatherIcon name="package" size={20} /></span>
                <span style={textStyle}>Aplikasi</span>
              </>
            ) : (
              <span style={radioStyle(isActive("/admin/aplikasi"))} />
            )}
          </Link>
        </div>

        {/* Permohonan Validasi */}
        <div style={{ padding: "2px", cursor: "pointer" }}>
          <Link href="#" className={menuItemClasses(false)}>
            {sidebarExpanded ? (
              <>
                <span className={styles.iconWrap} style={iconStyle}><FeatherIcon name="file-text" size={20} /></span>
                <span style={textStyle}>Permohonan Validasi</span>
              </>
            ) : (
              <span style={radioStyle(false)} />
            )}
          </Link>
        </div>

        {/* Referensi User - Dropdown - icon 13 (hover trigger + backdrop + sliding SVG) */}
        <div
          style={{ padding: "2px", cursor: "pointer" }}
          onMouseEnter={() => handleDropdownEnter("referensi")}
          onMouseLeave={handleDropdownLeave}
        >
        <div
          role="button"
          tabIndex={0}
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDropdownToggle("referensi"); }}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleDropdownToggle("referensi"); } }}
          className={menuItemClasses(isActive("/admin/referensi"))}
        >
          {sidebarExpanded ? (
            <>
              <span className={styles.iconWrap} style={iconStyle}><FeatherIcon name="folder" size={20} /></span>
              <span style={textStyle}>Referensi User</span>
            </>
          ) : (
            <span style={radioStyle(isActive("/admin/referensi"))} />
          )}
        </div>
          <div className={dropdownContentClasses(openDropdownId === "referensi")}>
            <Link href="/admin/referensi/pemutakhiran-ppat" className={dropdownLinkClasses(isActive("/admin/referensi/pemutakhiran-ppat"))}>
              Pemutakhiran Data PPAT
            </Link>
            <Link href="/admin/referensi/status-ppat" className={dropdownLinkClasses(isActive("/admin/referensi/status-ppat"))}>
              Status PPAT
            </Link>
            <Link href="/admin/referensi/validasi-qr" className={dropdownLinkClasses(isActive("/admin/referensi/validasi-qr"))}>
              Validasi QR
            </Link>
            <Link href="/admin/monitoring-ppat-keterlambatan" className={dropdownLinkClasses(isActive("/admin/monitoring-ppat-keterlambatan"))}>
              Monitoring Keterlambatan PPAT
            </Link>
          </div>
        </div>

        {/* User Data - Dropdown - icon 14 */}
        <div
          style={{ padding: "2px", cursor: "pointer" }}
          onMouseEnter={() => handleDropdownEnter("data-user")}
          onMouseLeave={handleDropdownLeave}
        >
        <div
          role="button"
          tabIndex={0}
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDropdownToggle("data-user"); }}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleDropdownToggle("data-user"); } }}
          className={menuItemClasses(isActive("/admin/data-user"))}
        >
          {sidebarExpanded ? (
            <>
              <span className={styles.iconWrap} style={iconStyle}><FeatherIcon name="users" size={20} /></span>
              <span style={textStyle}>User Data</span>
            </>
          ) : (
            <span style={radioStyle(isActive("/admin/data-user"))} />
          )}
        </div>
          <div className={dropdownContentClasses(openDropdownId === "data-user")}>
            <Link href="/admin/data-user/pending" className={dropdownLinkClasses(pathname === "/admin/data-user/pending")}>
              Verifikasi Data User
            </Link>
            <Link href="/admin/data-user/complete" className={dropdownLinkClasses(pathname === "/admin/data-user/complete")}>
              Data User
            </Link>
          </div>
        </div>

        {/* Group User - Dropdown - icon 15 */}
        <div
          style={{ padding: "2px", cursor: "pointer" }}
          onMouseEnter={() => handleDropdownEnter("group-user")}
          onMouseLeave={handleDropdownLeave}
        >
        <div
          role="button"
          tabIndex={0}
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDropdownToggle("group-user"); }}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleDropdownToggle("group-user"); } }}
          className={menuItemClasses(isActive("/admin/group-user"))}
        >
          {sidebarExpanded ? (
            <>
              <span className={styles.iconWrap} style={iconStyle}><FeatherIcon name="users" size={20} /></span>
              <span style={textStyle}>Group User</span>
            </>
          ) : (
            <span style={radioStyle(isActive("/admin/group-user"))} />
          )}
        </div>
          <div className={dropdownContentClasses(openDropdownId === "group-user")}>
            <Link href="/admin/group-user/users-group" className={dropdownLinkClasses(isActive("/admin/group-user/users-group"))}>
              Users Group
            </Link>
            <Link href="/admin/group-user/group-users" className={dropdownLinkClasses(isActive("/admin/group-user/group-users"))}>
              Group Users
            </Link>
            <Link href="/admin/group-user/group-privilege" className={dropdownLinkClasses(isActive("/admin/group-user/group-privilege"))}>
              Group Privilege
            </Link>
          </div>
        </div>

        {/* Iklan (Banner) */}
        <div style={{ padding: "2px", cursor: "pointer" }}>
          <Link href="/admin/iklan" className={menuItemClasses(isActive("/admin/iklan"))}>
            {sidebarExpanded ? (
              <>
                <span className={styles.iconWrap} style={iconStyle}><FeatherIcon name="image" size={20} /></span>
                <span style={textStyle}>Iklan</span>
              </>
            ) : (
              <span style={radioStyle(isActive("/admin/iklan"))} />
            )}
          </Link>
        </div>

        {/* Menu Lain */}
        <div
          style={toggleStyle}
          onClick={() => setMenuLainOpen(!menuLainOpen)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && setMenuLainOpen(!menuLainOpen)}
        >
          {sidebarExpanded ? (
            <>
              <span className={styles.iconWrap}><FeatherIcon name={menuLainOpen ? "chevron-down" : "chevron-right"} size={16} /></span>
              <span style={textStyle}>Menu Lain</span>
            </>
          ) : (
            <span style={radioStyle(false)} />
          )}
        </div>

        {menuLainOpen && (
          <>
            <div style={tierBoxStyle}>PPAT</div>
            <div style={{ padding: "2px", cursor: "pointer" }}>
              <Link href="#" className={menuItemClasses(false)}>
                <span className={styles.iconWrap} style={iconStyle}><FeatherIcon name="book" size={20} /></span>
                <span style={textStyle}>Booking SSPD</span>
              </Link>
            </div>
            <div style={{ padding: "2px", cursor: "pointer" }}>
              <Link href="#" className={menuItemClasses(false)}>
                <span className={styles.iconWrap} style={iconStyle}><FeatherIcon name="folder-plus" size={20} /></span>
                <span style={textStyle}>Laporan Bulanan PPAT</span>
              </Link>
            </div>

            <div style={tierBoxStyle}>Loket Terima Berkas</div>
            <div style={{ padding: "2px", cursor: "pointer" }}>
              <Link href="#" className={menuItemClasses(false)}>
                <span className={styles.iconWrap} style={iconStyle}><FeatherIcon name="folder" size={20} /></span>
                <span style={textStyle}>Terima Berkas SSPD</span>
              </Link>
            </div>

            <div style={tierBoxStyle}>Loket Serah Berkas</div>
            <div style={{ padding: "2px", cursor: "pointer" }}>
              <Link href="#" className={menuItemClasses(false)}>
                <span className={styles.iconWrap} style={iconStyle}><FeatherIcon name="send" size={20} /></span>
                <span style={textStyle}>Pelayanan Penyerahan SSPD</span>
              </Link>
            </div>

            <div style={tierBoxStyle}>Peneliti</div>
            <div style={{ padding: "2px", cursor: "pointer" }}>
              <Link href="#" className={menuItemClasses(false)}>
                <span className={styles.iconWrap} style={iconStyle}><FeatherIcon name="scale" size={20} /></span>
                <span style={textStyle}>Verifikasi SSPD</span>
              </Link>
            </div>

            <div style={tierBoxStyle}>BANK</div>
            <div style={{ padding: "2px", cursor: "pointer" }}>
              <Link href="#" className={menuItemClasses(false)}>
                <span className={styles.iconWrap} style={iconStyle}><FeatherIcon name="dollar-sign" size={20} /></span>
                <span style={textStyle}>Transaksi Bank</span>
              </Link>
            </div>
          </>
        )}

        {/* FAQ */}
        <div style={{ padding: "2px", cursor: "pointer" }}>
          <Link href="/faq" className={menuItemClasses(isActive("/faq"))}>
            {sidebarExpanded ? (
              <>
                <span className={styles.iconWrap} style={iconStyle}><FeatherIcon name="help-circle" size={20} /></span>
                <span style={textStyle}>FAQ</span>
              </>
            ) : (
              <span style={radioStyle(isActive("/faq"))} />
            )}
          </Link>
        </div>
      </div>

      {/* Logout */}
      <div
        style={logoutStyle}
        onClick={logout}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && logout()}
      >
        {sidebarExpanded ? (
          <>
            <span className={styles.iconWrap}><FeatherIcon name="log-out" size={20} /></span>
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