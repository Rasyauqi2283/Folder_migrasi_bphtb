"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { useSidebar } from "../../context/SidebarContext";
import FeatherIcon from "../FeatherIcon";
import styles from "../admin/AdminSidebar.module.css";

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

export default function BankSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const { sidebarExpanded, toggleSidebar } = useSidebar();
  const isPortrait = useIsPortrait();
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const hoverCloseRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + "/");

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
          <div style={{ padding: "2px", cursor: "pointer" }}>
            <Link
              href="/bank"
              className={menuItemClasses(isActive("/bank") && pathname === "/bank")}
            >
              {sidebarExpanded ? (
                <>
                  <span className={styles.iconWrap} style={iconStyle}>
                    <FeatherIcon name="layout" size={20} />
                  </span>
                  <span style={textStyle}>Dashboard</span>
                </>
              ) : (
                <span style={radioStyle(isActive("/bank") && pathname === "/bank")} />
              )}
            </Link>
          </div>

          <div
            style={{ padding: "2px", cursor: "pointer" }}
            onMouseEnter={() => handleDropdownEnter("transaksi")}
            onMouseLeave={handleDropdownLeave}
          >
            <div
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleDropdownToggle("transaksi");
              }}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleDropdownToggle("transaksi"))}
              className={menuItemClasses(isActive("/bank/hasil-transaksi"))}
            >
              {sidebarExpanded ? (
                <>
                  <span className={styles.iconWrap} style={iconStyle}>
                    <FeatherIcon name="dollar-sign" size={20} />
                  </span>
                  <span style={textStyle}>Transaksi BANK</span>
                </>
              ) : (
                <span style={radioStyle(isActive("/bank/hasil-transaksi"))} />
              )}
            </div>
            <div className={dropdownContentClasses(openDropdownId === "transaksi")}>
              <Link
                href="/bank/hasil-transaksi"
                className={dropdownLinkClasses(pathname === "/bank/hasil-transaksi")}
              >
                Hasil transaksi
              </Link>
            </div>
          </div>

          <div style={{ padding: "2px", cursor: "pointer" }}>
            <Link href="/faq" className={menuItemClasses(isActive("/faq"))}>
              {sidebarExpanded ? (
                <>
                  <span className={styles.iconWrap} style={iconStyle}>
                    <FeatherIcon name="help-circle" size={20} />
                  </span>
                  <span style={textStyle}>FAQ</span>
                </>
              ) : (
                <span style={radioStyle(isActive("/faq"))} />
              )}
            </Link>
          </div>
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
