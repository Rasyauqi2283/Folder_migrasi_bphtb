"use client";

import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { useSidebar } from "../context/SidebarContext";
import { useState, useEffect, useRef, useId } from "react";
import styles from "./Header.module.css";

interface HeaderProps {
  /** Judul di header (mis. "Dashboard", "Data User") */
  title?: string;
}

interface DivisiMember {
  userid: string;
  nama: string;
  divisi: string;
  statuspengguna?: string;
}

/** Foto default saat user belum punya foto (dilayani dari public/asset, hindari 404). */
const DEFAULT_PHOTO = "/asset/default-foto_when_doesnthavephoto.png";

export default function Header({ title = "Dashboard" }: HeaderProps) {
  const { user, logout } = useAuth();
  const { sidebarExpanded, toggleSidebar } = useSidebar();
  const [foto, setFoto] = useState<string | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [memberOpen, setMemberOpen] = useState(false);
  const [members, setMembers] = useState<DivisiMember[]>([]);
  const profileRef = useRef<HTMLDivElement>(null);
  const memberRef = useRef<HTMLDivElement>(null);
  const waveGradId1 = useId();
  const waveGradId2 = useId();

  useEffect(() => {
    if (typeof window !== "undefined") setFoto(localStorage.getItem("foto"));
  }, [user]);

  useEffect(() => {
    const onFotoUpdate = () => setFoto(localStorage.getItem("foto"));
    window.addEventListener("profile-foto-updated", onFotoUpdate);
    return () => window.removeEventListener("profile-foto-updated", onFotoUpdate);
  }, []);

  // Fetch members by divisi
  useEffect(() => {
    if (!user?.divisi) return;
    fetch("/api/users/complete", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const sameDivisi = data.filter((u: DivisiMember) => u.divisi === user.divisi);
          setMembers(sameDivisi);
        }
      })
      .catch(() => {});
  }, [user?.divisi]);

  // Close dropdowns on outside click
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
      if (memberRef.current && !memberRef.current.contains(e.target as Node)) setMemberOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const transition = "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)";
  const dropdownStyle: React.CSSProperties = {
    position: "absolute",
    top: "100%",
    right: -12,
    marginTop: 20,
    background: "var(--base_dark)",
    border: "1px solid var(--border_light)",
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    boxShadow: "0 12px 32px rgba(0,0,0,0.4)",
    minWidth: 220,
    zIndex: 200,
    overflow: "hidden",
  };
  const profileDropdownStyle: React.CSSProperties = {
    ...dropdownStyle,
    position: "fixed",
    top: 80,
    right: 0,
    marginTop: 0,
  };

  /* Ombak 2 periode identik dalam satu SVG untuk loop seamless kanan → kiri */
  const waveStrip = (gradId: string) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 800 80"
      preserveAspectRatio="none"
      style={{ width: "100%", height: "100%", display: "block", flexShrink: 0 }}
    >
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(0,0,154,0)" />
          <stop offset="40%" stopColor="rgba(0,0,154,0.04)" />
          <stop offset="100%" stopColor="rgba(0,0,154,0.08)" />
        </linearGradient>
      </defs>
      <path fill={`url(#${gradId})`} d="M0,80 L0,48 Q100,24 200,48 T400,48 Q500,24 600,48 T800,48 L800,80 L0,80 Z" />
      <path fill={`url(#${gradId})`} opacity={0.6} d="M0,80 L0,58 Q100,42 200,58 T400,58 Q500,42 600,58 T800,58 L800,80 L0,80 Z" />
    </svg>
  );

  return (
    <header
      className={styles.headerMain}
      style={{
        background: "linear-gradient(105deg, var(--base_dark) 0%, rgba(0,0,154,0.07) 18%, var(--base_dark) 38%, rgba(0,0,154,0.04) 55%, var(--base_dark) 72%, rgba(0,0,154,0.06) 100%)",
        width: "100%",
        position: "fixed",
        top: 0,
        left: 0,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        boxShadow: "0 4px 24px rgba(0,0,0,0.35)",
        borderBottom: "1px solid var(--border_light)",
        zIndex: 100,
        color: "var(--color_font)",
        overflow: "visible",
      }}
    >
      {/* Lapisan ombak CSS-only: kanan → kiri, halus, transparan */}
      <div className="header-wave-track" aria-hidden>
        <div className="header-wave-strip">{waveStrip(waveGradId1)}</div>
        <div className="header-wave-strip header-wave-strip--slow">{waveStrip(waveGradId2)}</div>
      </div>

      {/* Header left: logo, Bappenda, title */}
      <div className={styles.headerLeft}>
        <div
          role="button"
          tabIndex={0}
          onClick={toggleSidebar}
          onKeyDown={(e) => e.key === "Enter" && toggleSidebar()}
          style={{ display: "flex", alignItems: "center", cursor: "pointer", padding: 10 }}
          aria-label="Toggle sidebar"
        >
          <img
            src="/asset/Logo_image.svg"
            alt="Logo"
            style={{
              width: 50,
              height: "auto",
              transform: sidebarExpanded ? "scale(0.8) translateX(-10px)" : "scale(1) translateX(0)",
              transition,
            }}
          />
        </div>
        <div
          role="button"
          tabIndex={0}
          onClick={toggleSidebar}
          onKeyDown={(e) => e.key === "Enter" && toggleSidebar()}
          className={styles.headerBappendaBlock}
          style={{
            opacity: sidebarExpanded ? 1 : 0,
            transform: sidebarExpanded ? "translateX(0)" : "translateX(-20px)",
            transition,
            pointerEvents: sidebarExpanded ? "auto" : "none",
          }}
          aria-label="Toggle sidebar"
        >
          <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.2, marginRight: 10 }}>
            <span style={{ fontSize: 22, fontWeight: 700 }}>Bappenda</span>
            <span style={{ fontSize: 18, opacity: 0.9 }}>Kabupaten Bogor</span>
          </div>
          <img src="/asset/dekorasi_icon.png" alt="" style={{ width: 100, height: "auto", marginTop: 4 }} />
        </div>
        <div
          className={styles.headerTitle}
          style={{
            marginLeft: sidebarExpanded ? 24 : 12,
            paddingLeft: sidebarExpanded ? 20 : 0,
            borderLeft: sidebarExpanded ? "1px solid var(--border_light)" : "none",
            fontSize: 22,
            fontWeight: 700,
            transition,
          }}
        >
          {title}
        </div>
      </div>

      {/* Header right: profile dropdown, member dropdown */}
      <div className={styles.headerRight}>
        {/* Profile button + dropdown */}
        <div ref={profileRef} style={{ position: "relative" }}>
          <button
            type="button"
            onClick={() => { setProfileOpen(!profileOpen); setMemberOpen(false); }}
            aria-expanded={profileOpen}
            aria-haspopup="true"
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              background: "var(--surface_light)",
              border: "none",
              cursor: "pointer",
              overflow: "hidden",
              padding: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img
              src={foto && foto.trim() !== "" ? foto : DEFAULT_PHOTO}
              alt=""
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = DEFAULT_PHOTO;
              }}
            />
          </button>
          {profileOpen && (
            <div className={styles.headerProfileDropdown} style={profileDropdownStyle}>
              <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border_light)" }}>
                <div style={{ fontWeight: 600, fontSize: 16, color: "var(--color_font)" }}>{user?.nama || user?.userid || "—"}</div>
                <div style={{ fontSize: 13, color: "var(--color_font_dim)", marginTop: 4 }}>{user?.divisi || "—"}</div>
              </div>
              <div style={{ padding: 8 }}>
                <Link
                  href="/profile"
                  onClick={() => setProfileOpen(false)}
                  style={{
                    display: "block",
                    padding: "10px 14px",
                    color: "var(--color_font)",
                    textDecoration: "none",
                    borderRadius: 8,
                    fontSize: 14,
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "var(--surface_light)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                >
                  Profil
                </Link>
                <Link
                  href="/faq"
                  onClick={() => setProfileOpen(false)}
                  style={{
                    display: "block",
                    padding: "10px 14px",
                    color: "var(--color_font)",
                    textDecoration: "none",
                    borderRadius: 8,
                    fontSize: 14,
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "var(--surface_light)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                >
                  FAQ
                </Link>
                <button
                  type="button"
                  onClick={() => { setProfileOpen(false); logout(); }}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "10px 14px",
                    background: "transparent",
                    border: "none",
                    color: "var(--color_logout)",
                    fontSize: 14,
                    cursor: "pointer",
                    textAlign: "left",
                    borderRadius: 8,
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(220,38,38,0.15)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                >
                  Keluar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Member button + dropdown */}
        <div ref={memberRef} style={{ position: "relative" }}>
          <button
            type="button"
            onClick={() => { setMemberOpen(!memberOpen); setProfileOpen(false); }}
            aria-expanded={memberOpen}
            aria-haspopup="true"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              background: "none",
              border: "none",
              color: "var(--color_font_muted)",
              cursor: "pointer",
              padding: "4px 8px",
            }}
          >
            <span className={styles.memberLabel}>member</span>
            <span className={styles.memberName} style={{ color: "var(--color_font)" }}>
              {user?.nama || user?.userid || "—"}
            </span>
          </button>
          {memberOpen && (
            <div style={{ ...dropdownStyle, minWidth: 260, maxHeight: 320, overflowY: "auto" }}>
              <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border_light)", fontWeight: 600, fontSize: 14 }}>
                Anggota {user?.divisi || ""}
              </div>
              <ul style={{ listStyle: "none", padding: 8, margin: 0 }}>
                {members.length === 0 ? (
                  <li style={{ padding: "12px 16px", color: "var(--color_font_dim)", fontSize: 14 }}>Memuat...</li>
                ) : (
                  members.map((m) => {
                    const isOnline = (m.statuspengguna || "offline").toLowerCase() === "online";
                    return (
                      <li
                        key={m.userid}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          padding: "10px 14px",
                          borderRadius: 8,
                        }}
                      >
                        <span
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: isOnline ? "#22c55e" : "#94a3b8",
                            flexShrink: 0,
                          }}
                          title={isOnline ? "Online" : "Offline"}
                        />
                        <span style={{ flex: 1, fontSize: 14, color: "var(--color_font)" }}>{m.nama}</span>
                        <span style={{ fontSize: 12, color: "var(--color_font_dim)" }}>{m.userid}</span>
                      </li>
                    );
                  })
                )}
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
