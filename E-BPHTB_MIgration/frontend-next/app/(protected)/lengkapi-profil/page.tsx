"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { getBackendBaseUrl } from "../../../lib/api";

// PU (PPAT, PPATS, Notaris): di laman ini hanya Username; Nama Pejabat & Gelar Pejabat tidak ditampilkan.
// PV (Peneliti Validasi): Username + Nama Paraf Validasi (special_parafv).

/** Karyawan yang isi NIP di laman lengkapi profil: Admin, CS, BANK, LTB, LSB, Peneliti (bukan PV). */
const NIP_DIVISI = ["Administrator", "Customer Service", "BANK", "LTB", "LSB", "Peneliti"];

export default function LengkapiProfilPage() {
  const router = useRouter();
  const { user } = useAuth();
  const divisi = user?.divisi ?? (typeof window !== "undefined" ? localStorage.getItem("divisi") : null) ?? "";

  const [nip, setNip] = useState("");
  const [username, setUsername] = useState("");
  const [specialParafv, setSpecialParafv] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // PU: hanya Username. Tanpa Nama Pejabat & Gelar Pejabat.
  // PV (Peneliti Validasi): Username + Nama Paraf Validasi (special_parafv).
  // Karyawan lain (Admin, CS, BANK, LTB, LSB, Peneliti): NIP + Username.
  // Wajib Pajak: hanya Username.
  const showNip = mounted && NIP_DIVISI.includes(divisi);
  const showParafValidasi = mounted && divisi === "Peneliti Validasi";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setSubmitting(true);

    const userid =
      user?.userid ?? (typeof window !== "undefined" ? localStorage.getItem("userid") : null);
    if (!userid) {
      setMessage({ type: "error", text: "Sesi tidak valid. Silakan login kembali." });
      setSubmitting(false);
      return;
    }

    const formData: Record<string, string> = {
      userid,
      username: username.trim(),
      nip: showNip ? nip.trim() : "",
      special_parafv: showParafValidasi ? specialParafv.trim() : "",
      special_field: "",
      pejabat_umum: "",
    };

    try {
      const apiBase = getBackendBaseUrl();
      const url = apiBase
        ? `${apiBase}/api/v1/auth/complete-profile`
        : "/api/v1/auth/complete-profile";
      const res = await fetch(url, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = (await res.json()) as { message?: string };

      if (res.ok) {
        if (typeof window !== "undefined") {
          localStorage.setItem("is_profile_complete", "true");
          localStorage.setItem("username", username.trim());
          if (showNip) localStorage.setItem("nip", nip.trim());
          if (showParafValidasi) localStorage.setItem("special_parafv", specialParafv.trim());
        }
        setMessage({ type: "success", text: "Profil berhasil dilengkapi!" });
        if (typeof window !== "undefined") {
          sessionStorage.setItem("profile_pending_dashboard", "1");
        }
        setTimeout(() => {
          router.push("/profile?from=lengkapi");
        }, 1500);
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
          {showNip && (
            <div className="profile-complete-form-group">
              <label htmlFor="lengkapi-nip">Nomor Identifikasi Pegawai (NIP)</label>
              <input
                type="text"
                id="lengkapi-nip"
                name="nip"
                placeholder="Masukkan NIP Anda"
                value={nip}
                onChange={(e) => setNip(e.target.value)}
              />
            </div>
          )}
          <div className="profile-complete-form-group">
            <label htmlFor="lengkapi-username">Username</label>
            <input
              type="text"
              id="lengkapi-username"
              name="username"
              placeholder="Buat username unik"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          {showParafValidasi && (
            <div className="profile-complete-form-group">
              <label htmlFor="lengkapi-special_parafv">Nama Pejabat (Paraf Validasi)</label>
              <input
                type="text"
                id="lengkapi-special_parafv"
                name="special_parafv"
                placeholder="Nama + gelar (contoh: Nama Pejabat BAPPENDA)"
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
