"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getBackendBaseUrl } from "../../lib/api";

function UbahKatasandiContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [email, setEmail] = useState("");
  const [nama, setNama] = useState("");
  const [divisi, setDivisi] = useState("");
  const [userid, setUserid] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [tokenValidated, setTokenValidated] = useState(false);
  const [tokenError, setTokenError] = useState(false);

  useEffect(() => {
    if (!token) {
      setTokenError(true);
      setError("Token tidak valid");
      return;
    }

    const verify = async () => {
      try {
        const apiBase = getBackendBaseUrl();
        const url = apiBase ? `${apiBase}/api/v1/auth/verify-reset-token` : "/api/v1/auth/verify-reset-token";
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const result = await res.json();

        if (res.ok) {
          setEmail(result.email ?? "");
          setNama(result.nama ?? "");
          setDivisi(result.divisi ?? "");
          setUserid(result.userid ?? "");
          setTokenValidated(true);
        } else {
          setTokenError(true);
          setError(result.message || "Token tidak valid");
        }
      } catch {
        setTokenError(true);
        setError("Terjadi kesalahan saat memverifikasi token");
      }
    };

    verify();
  }, [token]);

  useEffect(() => {
    if (tokenError && token) {
      const t = setTimeout(() => {
        router.push("/lupa-katasandi");
      }, 3000);
      return () => clearTimeout(t);
    }
  }, [tokenError, token, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Konfirmasi password tidak sesuai");
      return;
    }

    setSubmitting(true);
    try {
      const apiBase = getBackendBaseUrl();
      const url = apiBase ? `${apiBase}/api/v1/auth/reset-password` : "/api/v1/auth/reset-password";
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, email, password }),
      });
      const result = await res.json();

      if (res.ok) {
        alert("Password berhasil direset!");
        router.push("/login");
      } else {
        setError(result.message || "Gagal mereset password");
      }
    } catch {
      setError("Terjadi kesalahan saat mereset password");
    } finally {
      setSubmitting(false);
    }
  };

  if (tokenError && !token) {
    return (
      <div className="ubah-sandi-page">
        <div className="ubah-sandi-container">
          <div className="ubah-sandi-error">{error}</div>
          <Link href="/login" className="ubah-sandi-btn ubah-sandi-btn-primary">
            Ke Login
          </Link>
        </div>
      </div>
    );
  }

  if (!tokenValidated && !tokenError) {
    return (
      <div className="ubah-sandi-page">
        <div className="ubah-sandi-container">
          <p>Memverifikasi token...</p>
        </div>
      </div>
    );
  }

  if (tokenError) {
    return (
      <div className="ubah-sandi-page">
        <div className="ubah-sandi-container">
          <div className="ubah-sandi-error">{error}</div>
          <p>Redirect ke lupa kata sandi...</p>
          <Link href="/login" className="ubah-sandi-btn ubah-sandi-btn-primary">
            Ke Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="ubah-sandi-page">
      <div className="ubah-sandi-container">
        <div className="ubah-sandi-header">
          <div className="ubah-sandi-icon-wrap">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/asset/Logo_image.svg" alt="Logo BAPPENDA" style={{ height: 30 }} />
          </div>
          <h2>Ubah Kata Sandi</h2>
          <p>Pastikan data di bawah adalah akun Anda, lalu isi kata sandi baru.</p>
        </div>

        <div className="ubah-sandi-user-info">
          <div className="ubah-sandi-field">
            <label>Nama</label>
            <input type="text" value={nama} readOnly className="ubah-sandi-readonly" />
          </div>
          <div className="ubah-sandi-field">
            <label>Email</label>
            <input type="email" value={email} readOnly className="ubah-sandi-readonly" />
          </div>
          <div className="ubah-sandi-field">
            <label>Divisi</label>
            <input type="text" value={divisi} readOnly className="ubah-sandi-readonly" />
          </div>
          <div className="ubah-sandi-field">
            <label>User ID</label>
            <input type="text" value={userid} readOnly className="ubah-sandi-readonly" />
          </div>
        </div>

        <form className="ubah-sandi-form" onSubmit={handleSubmit}>
          {error && <div className="ubah-sandi-error">{error}</div>}
          <div className="ubah-sandi-input-group">
            <input
              type="password"
              id="password"
              placeholder="Kata Sandi Baru"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <div className="ubah-sandi-requirements">
              Minimal 8 karakter, mengandung angka dan huruf
            </div>
          </div>
          <div className="ubah-sandi-input-group">
            <input
              type="password"
              id="confirm-password"
              placeholder="Konfirmasi Kata Sandi"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <div className="ubah-sandi-footer">
            <button
              type="button"
              className="ubah-sandi-btn ubah-sandi-btn-secondary"
              onClick={() => router.push("/login")}
            >
              Batal
            </button>
            <button
              type="submit"
              className="ubah-sandi-btn ubah-sandi-btn-primary"
              disabled={submitting}
            >
              {submitting ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function UbahKatasandiPage() {
  return (
    <Suspense
      fallback={
        <div className="ubah-sandi-page">
          <div className="ubah-sandi-container">
            <p>Memuat...</p>
          </div>
        </div>
      }
    >
      <UbahKatasandiContent />
    </Suspense>
  );
}
