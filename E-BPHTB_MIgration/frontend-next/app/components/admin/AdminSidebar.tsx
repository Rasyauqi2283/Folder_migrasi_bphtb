"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { useSidebar } from "../../context/SidebarContext";

const transition = "0.5s cubic-bezier(0.4, 0, 0.2, 1)";
const dropdownTransition = "0.3s ease";
const HOVER_CLOSE_DELAY = 200;

const DROPDOWN_SVG =
  (gender: string | undefined) =>
  gender === "Perempuan"
    ? "/greeting_svg/design_verse_perempuan.svg"
    : "/greeting_svg/design_verse_laki.svg";

export default function AdminSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { sidebarExpanded, toggleSidebar } = useSidebar();
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
    if (sidebarExpanded) setOpenDropdownId(id);
  };

  const handleDropdownLeave = () => {
    hoverCloseRef.current = setTimeout(() => setOpenDropdownId(null), HOVER_CLOSE_DELAY);
  };

  const baseAsideStyle: React.CSSProperties = {
    width: sidebarExpanded ? 250 : 60,
    minWidth: sidebarExpanded ? 250 : 60,
    background: "linear-gradient(180deg, var(--base_dark) 0%, rgba(0,77,154,0.16) 25%, rgba(0,77,154,0.08) 50%, rgba(0,77,154,0.12) 75%, var(--base_dark) 100%)",
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

  const menuItemStyle = (active: boolean): React.CSSProperties => ({
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: sidebarExpanded ? "12px 20px" : "12px",
    justifyContent: sidebarExpanded ? "flex-start" : "center",
    color: active ? "var(--accent_hover)" : "var(--color_font_muted)",
    textDecoration: "none",
    borderLeft: active ? "3px solid var(--accent)" : "3px solid transparent",
    background: active ? "var(--surface_light)" : "transparent",
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    transition: "all 0.2s",
    width: "100%",
  });

  /** Saat collapse hanya tampil bulat (radio); saat expand tampil icon + teks */
  const radioStyle = (active: boolean): React.CSSProperties => ({
    width: 8,
    height: 8,
    borderRadius: "50%",
    flexShrink: 0,
    background: active ? "var(--accent)" : "var(--color_font_muted)",
  });

  const iconStyle: React.CSSProperties = {
    width: 20,
    height: 20,
    flexShrink: 0,
    objectFit: "contain",
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

  const dropdownContentStyle = (isOpen: boolean): React.CSSProperties => ({
    maxHeight: isOpen ? 280 : 0,
    overflow: "hidden",
    opacity: isOpen ? 1 : 0,
    transition: `max-height ${dropdownTransition}, opacity ${dropdownTransition}`,
    display: "flex",
    flexDirection: "column",
    gap: 2,
    marginLeft: 20,
    marginTop: 4,
  });

  /** Backdrop gelap + blur saat submenu terbuka (Discord-style) */
  const backdropStyle: React.CSSProperties = {
    position: "fixed",
    top: 80,
    left: sidebarExpanded ? 250 : 60,
    right: 0,
    bottom: 0,
    transition: `left ${transition}`,
  };

  const dropdownLinkStyle = (active: boolean): React.CSSProperties => ({
    padding: "8px 16px",
    color: active ? "var(--accent_hover)" : "var(--color_font_dim)",
    textDecoration: "none",
    fontSize: 14,
    borderLeft: active ? "2px solid var(--accent)" : "2px solid transparent",
  });

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
          aria-hidden
        />
      )}
      <aside style={baseAsideStyle}>
      <div style={{ overflowY: "auto", overflowX: "hidden", flex: 1 }}>
        {/* Dashboard - icon 10 */}
        <div style={{ padding: "2px", cursor: "pointer" }}>
          <Link href="/admin" style={menuItemStyle(isActive("/admin") && pathname === "/admin")}>
            {sidebarExpanded ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/design_aside/10.svg" alt="" style={iconStyle} />
                <span style={textStyle}>Dashboard</span>
              </>
            ) : (
              <span style={radioStyle(isActive("/admin") && pathname === "/admin")} />
            )}
          </Link>
        </div>

        {/* Aplikasi - icon 11 */}
        <div style={{ padding: "2px", cursor: "pointer" }}>
          <Link href="/admin/aplikasi" style={menuItemStyle(isActive("/admin/aplikasi"))}>
            {sidebarExpanded ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/design_aside/11.svg" alt="" style={iconStyle} />
                <span style={textStyle}>Aplikasi</span>
              </>
            ) : (
              <span style={radioStyle(isActive("/admin/aplikasi"))} />
            )}
          </Link>
        </div>

        {/* Permohonan Validasi - icon 12 */}
        <div style={{ padding: "2px", cursor: "pointer" }}>
          <Link href="#" style={menuItemStyle(false)}>
            {sidebarExpanded ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/design_aside/12.svg" alt="" style={iconStyle} />
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
            style={{
              ...menuItemStyle(isActive("/admin/referensi")),
              cursor: "pointer",
            }}
          >
            {sidebarExpanded ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/design_aside/13.svg" alt="" style={iconStyle} />
                <span style={textStyle}>Referensi User</span>
              </>
            ) : (
              <span style={radioStyle(isActive("/admin/referensi"))} />
            )}
          </div>
          <div style={dropdownContentStyle(openDropdownId === "referensi")}>
            <div className="aside-dropdown-slide-svg" style={{ marginBottom: 8, display: "flex", justifyContent: "center" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={DROPDOWN_SVG(user?.gender)} alt="" style={{ width: 72, height: "auto", objectFit: "contain" }} />
            </div>
            <Link href="/admin/referensi/pemutakhiran-ppat" style={dropdownLinkStyle(isActive("/admin/referensi/pemutakhiran-ppat"))}>
              Pemutakhiran Data PPAT
            </Link>
            <Link href="/admin/referensi/status-ppat" style={dropdownLinkStyle(isActive("/admin/referensi/status-ppat"))}>
              Status PPAT
            </Link>
            <Link href="/admin/referensi/validasi-qr" style={dropdownLinkStyle(isActive("/admin/referensi/validasi-qr"))}>
              Validasi QR
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
            style={{
              ...menuItemStyle(isActive("/admin/data-user")),
              cursor: "pointer",
            }}
          >
            {sidebarExpanded ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/design_aside/14.svg" alt="" style={iconStyle} />
                <span style={textStyle}>User Data</span>
              </>
            ) : (
              <span style={radioStyle(isActive("/admin/data-user"))} />
            )}
          </div>
          <div style={dropdownContentStyle(openDropdownId === "data-user")}>
            <div className="aside-dropdown-slide-svg" style={{ marginBottom: 8, display: "flex", justifyContent: "center" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={DROPDOWN_SVG(user?.gender)} alt="" style={{ width: 72, height: "auto", objectFit: "contain" }} />
            </div>
            <Link href="/admin/data-user/pending" style={dropdownLinkStyle(pathname === "/admin/data-user/pending")}>
              Verifikasi Data User
            </Link>
            <Link href="/admin/data-user/complete" style={dropdownLinkStyle(pathname === "/admin/data-user/complete")}>
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
            style={{
              ...menuItemStyle(isActive("/admin/group-user")),
              cursor: "pointer",
            }}
          >
            {sidebarExpanded ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/design_aside/15.svg" alt="" style={iconStyle} />
                <span style={textStyle}>Group User</span>
              </>
            ) : (
              <span style={radioStyle(isActive("/admin/group-user"))} />
            )}
          </div>
          <div style={dropdownContentStyle(openDropdownId === "group-user")}>
            <div className="aside-dropdown-slide-svg" style={{ marginBottom: 8, display: "flex", justifyContent: "center" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={DROPDOWN_SVG(user?.gender)} alt="" style={{ width: 72, height: "auto", objectFit: "contain" }} />
            </div>
            <Link href="/admin/group-user/users-group" style={dropdownLinkStyle(isActive("/admin/group-user/users-group"))}>
              Users Group
            </Link>
            <Link href="/admin/group-user/group-users" style={dropdownLinkStyle(isActive("/admin/group-user/group-users"))}>
              Group Users
            </Link>
            <Link href="/admin/group-user/group-privilege" style={dropdownLinkStyle(isActive("/admin/group-user/group-privilege"))}>
              Group Privilege
            </Link>
          </div>
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
              <span>{menuLainOpen ? "▼" : "▶"}</span>
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
              <Link href="#" style={menuItemStyle(false)}>
                <span style={iconStyle}>📒</span>
                <span style={textStyle}>Booking SSPD</span>
              </Link>
            </div>
            <div style={{ padding: "2px", cursor: "pointer" }}>
              <Link href="#" style={menuItemStyle(false)}>
                <span style={iconStyle}>📁</span>
                <span style={textStyle}>Laporan Bulanan PPAT</span>
              </Link>
            </div>

            <div style={tierBoxStyle}>Loket Terima Berkas</div>
            <div style={{ padding: "2px", cursor: "pointer" }}>
              <Link href="#" style={menuItemStyle(false)}>
                <span style={iconStyle}>📂</span>
                <span style={textStyle}>Terima Berkas SSPD</span>
              </Link>
            </div>

            <div style={tierBoxStyle}>Loket Serah Berkas</div>
            <div style={{ padding: "2px", cursor: "pointer" }}>
              <Link href="#" style={menuItemStyle(false)}>
                <span style={iconStyle}>✈</span>
                <span style={textStyle}>Pelayanan Penyerahan SSPD</span>
              </Link>
            </div>

            <div style={tierBoxStyle}>Peneliti</div>
            <div style={{ padding: "2px", cursor: "pointer" }}>
              <Link href="#" style={menuItemStyle(false)}>
                <span style={iconStyle}>⚖</span>
                <span style={textStyle}>Verifikasi SSPD</span>
              </Link>
            </div>

            <div style={tierBoxStyle}>BANK</div>
            <div style={{ padding: "2px", cursor: "pointer" }}>
              <Link href="#" style={menuItemStyle(false)}>
                <span style={iconStyle}>💰</span>
                <span style={textStyle}>Transaksi Bank</span>
              </Link>
            </div>
          </>
        )}

        {/* FAQ */}
        <div style={{ padding: "2px", cursor: "pointer" }}>
          <Link href="/faq" style={menuItemStyle(isActive("/faq"))}>
            {sidebarExpanded ? (
              <>
                <span style={iconStyle}>❓</span>
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
            <span>🚪</span>
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
