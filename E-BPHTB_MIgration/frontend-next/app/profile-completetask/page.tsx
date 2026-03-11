"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getBackendBaseUrl, getLegacyBaseUrl } from "../../lib/api";

function redirectPath(divisi: string, legacyBase: string): string {
  switch (divisi) {
    case "Administrator":
      return "/admin"; // Dashboard TSX migrasi (bukan HTML legacy)
    case "Customer Service":
      return `${legacyBase}/html_folder/CS/cs-dashboard.html`;
    case "PPAT":
    case "PPATS":
      return `${legacyBase}/html_folder/PPAT/ppat-dashboard.html`;
    case "LTB":
      return `${legacyBase}/html_folder/LTB/ltb-dashboard.html`;
    case "LSB":
      return `${legacyBase}/html_folder/LSB/lsb-dashboard.html`;
    case "Peneliti":
      return `${legacyBase}/html_folder/Peneliti/peneliti-dashboard.html`;
    case "Peneliti Validasi":
      return `${legacyBase}/html_folder/ParafP/penelitiValidasi-dashboard.html`;
    case "BANK":
      return `${legacyBase}/html_folder/Bank/bank-dashboard.html`;
    case "Wajib Pajak":
      return `${legacyBase}/html_folder/WP/wp-dashboard.html`;
    default:
      return "/login";
  }
}

export default function ProfileCompleteTaskPage() {
  const router = useRouter();
  const legacyBase = getLegacyBaseUrl();
  const [divisi, setDivisi] = useState<string | null>(null);
  const [nip, setNip] = useState("");
  const [username, setUsername] = useState("");
  const [specialField, setSpecialField] = useState("");
  const [specialParafv, setSpecialParafv] = useState("");
  const [pejabatUmum, setPejabatUmum] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const d = typeof window !== "undefined" ? localStorage.getItem("divisi") : null;
    setDivisi(d ?? null);
    setMounted(true);
  }, []);

  const showNip = mounted && divisi && divisi !== "Wajib Pajak" && divisi !== "PPAT" && divisi !== "PPATS";
  const showPejabat = mounted && (divisi === "PPAT" || divisi === "PPATS");
  const showSpecialField = showPejabat;
  const showContohPemilihan = showPejabat;
  const showParafValidasi = mounted && divisi === "Peneliti Validasi";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setSubmitting(true);

    const userid = typeof window !== "undefined" ? localStorage.getItem("userid") : null;
    if (!userid) {
      setMessage({ type: "error", text: "Sesi tidak valid. Silakan login kembali." });
      setSubmitting(false);
      return;
    }

    const formData = {
      userid,
      nip,
      username,
      special_field: specialField,
      special_parafv: specialParafv,
      pejabat_umum: pejabatUmum,
    };

    try {
      const apiBase = getBackendBaseUrl();
      const url = apiBase ? `${apiBase}/api/v1/auth/complete-profile` : "/api/v1/auth/complete-profile";
      const res = await fetch(url, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        if (typeof window !== "undefined") {
          localStorage.setItem("is_profile_complete", "true");
          localStorage.setItem("nip", nip);
          localStorage.setItem("username", username);
          localStorage.setItem("special_field", specialField);
          localStorage.setItem("special_parafv", specialParafv);
          localStorage.setItem("pejabat_umum", pejabatUmum);
        }
        setMessage({ type: "success", text: "Profil berhasil dilengkapi!" });
        setTimeout(() => {
          const path = redirectPath(divisi ?? "", legacyBase);
          if (path.startsWith("/") && !path.startsWith("http")) {
            router.push(path);
          } else {
            window.location.href = path;
          }
        }, 2000);
      } else {
        setMessage({
          type: "error",
          text: data.message || "Gagal menyimpan profil",
        });
      }
    } catch {
      setMessage({ type: "error", text: "Terjadi kesalahan jaringan." });
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (mounted && !divisi) {
      router.replace("/login");
    }
  }, [mounted, divisi, router]);

  if (!mounted) {
    return (
      <div className="profile-complete-page">
        <div className="profile-complete-container">
          <p>Memuat...</p>
        </div>
      </div>
    );
  }

  if (!divisi) {
    return null;
  }

  return (
    <div className="profile-complete-page">
      <div className="profile-complete-container">
        <div className="profile-complete-logo">
          <span>✧ SISTEM PERPAJAKAN ✧</span>
        </div>
        <h1 className="profile-complete-title">Lengkapi Profil Anda</h1>
        <form onSubmit={handleSubmit}>
          {showContohPemilihan && (
            <div className="profile-complete-example">
              <h3>Contoh: Farras ST. MT/ Notaris</h3>
            </div>
          )}
          {showNip && (
            <div className="profile-complete-form-group">
              <label htmlFor="nip">Nomor Identifikasi Pegawai</label>
              <input
                type="text"
                id="nip"
                name="nip"
                placeholder="Masukkan NIP Anda"
                value={nip}
                onChange={(e) => setNip(e.target.value)}
              />
            </div>
          )}
          <div className="profile-complete-form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              placeholder="Buat username unik"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          {showSpecialField && (
            <div className="profile-complete-form-group">
              <label htmlFor="special_field">Nama Pejabat: (contoh: Farras ST. MT)</label>
              <input
                type="text"
                id="special_field"
                name="special_field"
                placeholder="Nama lengkap + gelar"
                value={specialField}
                onChange={(e) => setSpecialField(e.target.value)}
              />
            </div>
          )}
          {showPejabat && (
            <div className="profile-complete-form-group">
              <label htmlFor="pejabat_umum_input">Gelar Pejabat</label>
              <select
                id="pejabat_umum_input"
                name="pejabat_umum"
                value={pejabatUmum}
                onChange={(e) => setPejabatUmum(e.target.value)}
              >
                <option value="">-- Pilih Gelar --</option>
                <option value="Notaris">Notaris</option>
                <option value="PPAT">PPAT</option>
                <option value="PPATS">PPATS</option>
              </select>
            </div>
          )}
          {showParafValidasi && (
            <div className="profile-complete-form-group">
              <label htmlFor="special_parafv">Nama Paraf Validasi</label>
              <input
                type="text"
                id="special_parafv"
                name="special_parafv"
                placeholder="Nama + gelar"
                value={specialParafv}
                onChange={(e) => setSpecialParafv(e.target.value)}
              />
            </div>
          )}
          <button type="submit" className="profile-complete-submit" disabled={submitting}>
            {submitting ? "Menyimpan..." : "SIMPAN PROFIL"}
          </button>
        </form>
        {message && (
          <div className={`profile-complete-message ${message.type}`} role="alert">
            {message.text}
          </div>
        )}
      </div>
    </div>
  );
}
