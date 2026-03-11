"use client";

import Link from "next/link";
import { useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

export default function LandingHeader() {
  const { user, logout } = useAuth();
  const menuRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

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
                <Link href="/daftar?verse=wp">Wajib Pajak (WP)</Link>
                <Link href="/daftar?verse=karyawan">Karyawan (NIP)</Link>
                <Link href="/daftar?verse=pu">PPAT / PPATS</Link>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
