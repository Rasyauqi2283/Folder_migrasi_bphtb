"use client";

import Link from "next/link";
import { useState } from "react";
import { getBackendBaseUrl } from "../../lib/api";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setSubmitting(true);

    try {
      const apiBase = getBackendBaseUrl();
      const loginUrl = apiBase ? `${apiBase}/api/v1/auth/login` : "/api/v1/auth/login";
      const res = await fetch(loginUrl, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: "success", text: data.message ?? "Login berhasil." });

        if (typeof window !== "undefined") {
          localStorage.setItem("userid", data.userid ?? "");
          localStorage.setItem("divisi", data.divisi ?? "");
          localStorage.setItem("nama", data.nama ?? "");
          localStorage.setItem("email", data.email ?? "");
          localStorage.setItem("telepon", data.telepon ?? "");
          localStorage.setItem("foto", data.foto ?? "");
          localStorage.setItem("username", data.username ?? "");
          localStorage.setItem("nip", data.nip ?? "");
          localStorage.setItem("special_field", data.special_field ?? "");
          localStorage.setItem("is_profile_complete", data.is_profile_complete ?? "");
          localStorage.setItem("gender", data.gender ?? "");
          localStorage.setItem("status_ppat", data.status_ppat ?? "");
        }

        setTimeout(() => {
          if (!data.is_profile_complete) {
            window.location.href = "/lengkapi-profil";
          } else {
            window.location.href = "/dashboard";
          }
        }, 1000);
      } else {
        let errorText = data.message ?? "Login gagal.";
        if (res.status === 401) {
          errorText = (data.message ?? "").includes("Password")
            ? "Password yang dimasukkan salah"
            : "UserID/Username tidak terdaftar";
        }
        setMessage({ type: "error", text: errorText });
      }
    } catch {
      setMessage({
        type: "error",
        text: "Gagal terhubung ke server. Coba lagi nanti.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <aside className="login-left-panel">
          <div className="login-logo-section">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/asset/Logo_image.svg" alt="Logo Bappenda" className="login-logo" />
            <h3>BAPPENDA<br />KABUPATEN BOGOR</h3>
            <h1>E-BPHTB</h1>
            <p>&quot;E-BPHTB: Layanan Pajak Modern&quot;</p>
          </div>
          <div className="login-form-wrap">
            <form id="loginForm" onSubmit={handleSubmit}>
              <div className="login-input-group">
                <label htmlFor="identifier">UserID</label>
                <div className="login-input-wrapper">
                  <input
                    type="text"
                    id="identifier"
                    placeholder="UserID atau Username"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="login-input-group">
                <label htmlFor="password">Kata Sandi</label>
                <div className="login-input-wrapper">
                  <input
                    type="password"
                    id="password"
                    placeholder="Kata Sandi"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              <Link href="/lupa-katasandi" className="login-forgot">
                Lupa Kata Sandi?
              </Link>
              {message && (
                <div className={`login-message-box ${message.type}`}>
                  <span>{message.text}</span>
                </div>
              )}
              <button type="submit" className="login-submit" disabled={submitting}>
                {submitting ? "Memproses..." : "MASUK"}
              </button>
              <p className="login-register-text">
                Belum Memiliki Akun? <Link href="/daftar">Daftar Disini</Link>
              </p>
            </form>
          </div>
        </aside>

        <div className="login-right-panel">
          <div className="login-right-panel-inner">
            <h2 className="login-welcome-title">SELAMAT DATANG DI E-BPHTB</h2>
            <p className="login-description login-description-footer">
              E-BPHTB adalah sistem elektronik yang digunakan untuk mengelola dan memproses Bea Perolehan Hak atas Tanah dan Bangunan (BPHTB). Sistem ini memungkinkan masyarakat untuk melakukan berbagai transaksi terkait BPHTB secara online, sehingga memudahkan proses pembayaran dan pelaporan.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
