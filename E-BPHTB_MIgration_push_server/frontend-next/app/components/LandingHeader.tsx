"use client";

import Link from "next/link";
import { useRef, useEffect, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { getPhpLegacyBaseUrl } from "../../lib/api";

export default function LandingHeader() {
  const { user, logout } = useAuth();
  const menuRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  const phpBase = useMemo(() => getPhpLegacyBaseUrl(), []);
  const regWp = phpBase ? `${phpBase}/registrasi?verse=wp` : "/daftar?verse=wp";
  const regKaryawan = phpBase ? `${phpBase}/registrasi?verse=karyawan` : "/daftar?verse=karyawan";
  const regPu = phpBase ? `${phpBase}/registrasi?verse=pu` : "/daftar?verse=pu";

  useEffect(() => {
    const btn = btnRef.current;
    const menu = menuRef.current;
    if (!btn || !menu) return;

    const toggle = (e: MouseEvent) => {
      e.stopPropagation();
      menu.style.display = menu.style.display === "none" ? "block" : "none";
    };
    const close = () => {
      menu.style.display = "none";
    };

    btn.addEventListener("click", toggle);
    document.addEventListener("click", close);
    return () => {
      btn.removeEventListener("click", toggle);
      document.removeEventListener("click", close);
    };
  }, []);

  return (
    <header className="landing-header">
      <div className="landing-logo-wrap">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/asset/Logo_bappenda.svg" alt="Logo BAPPENDA" className="landing-logo-img" />
        <span className="landing-logo">E-BPHTB</span>
      </div>
      <div className="nav-buttons">
        {user?.userid ? (
          <>
            <span className="nav-user">{user.nama || user.userid}</span>
            <button type="button" onClick={logout} className="nav-btn login">
              Keluar
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="nav-btn login">
              Masuk
            </Link>
            <div className="register-dropdown">
              <button type="button" ref={btnRef} className="nav-btn register">
                Registrasi ▾
              </button>
              <div
                ref={menuRef}
                className="register-menu"
                style={{ display: "none" }}
              >
                <Link href={regWp}>Wajib Pajak (WP)</Link>
                <Link href={regKaryawan}>Karyawan (NIP)</Link>
                <Link href={regPu}>PPAT / PPATS</Link>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
