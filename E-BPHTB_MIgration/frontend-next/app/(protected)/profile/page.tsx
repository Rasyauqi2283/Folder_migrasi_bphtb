"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getBackendBaseUrl, getLegacyBaseUrl } from "../../../lib/api";

const DEFAULT_PHOTO = "/penting_F_simpan/profile-photo/default-foto-profile.png";

interface ProfileData {
  userid?: string;
  id?: string;
  nama?: string;
  name?: string;
  divisi?: string;
  email?: string;
  telepon?: string;
  phone?: string;
  username?: string;
  user_name?: string;
  nip?: string;
  special_field?: string;
  special_field_name?: string;
  special_parafv?: string;
  special_parafv_name?: string;
  pejabat_umum?: string;
  pejabat_umum_name?: string;
  fotoprofil?: string;
  password?: string;
  tanda_tangan_path?: string;
}

function useProfile() {
  const [data, setData] = useState<ProfileData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const abortRef = useRef<AbortController | null>(null);

  const load = useCallback(async () => {
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();
    setLoading(true);
    setError(null);
    try {
      const base = getBackendBaseUrl();
      const url = base ? `${base}/api/v1/auth/profile` : "/api/v1/auth/profile";
      const res = await fetch(url, { credentials: "include", signal: abortRef.current.signal });
      const raw = await res.json();
      let profile: ProfileData =
        raw?.user ?? raw?.data?.user ?? raw?.data ?? raw;
      if (!profile || typeof profile !== "object") {
        throw new Error("Data profil tidak valid");
      }
      if (profile.divisi && typeof window !== "undefined") {
        localStorage.setItem("divisi", profile.divisi);
      }
      if (profile.userid && typeof window !== "undefined") {
        localStorage.setItem("userid", profile.userid);
      }
      setData(profile);
    } catch (e: unknown) {
      if ((e as { name?: string })?.name === "AbortError") return;
      setError((e as Error)?.message ?? "Gagal memuat profil");
      if ((e as { response?: { status?: number } })?.response?.status === 401) {
        window.location.href = "/login";
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    return () => {
      abortRef.current?.abort();
    };
  }, [load]);

  return { data, error, loading, reload: load };
}

export default function ProfilePage() {
  const router = useRouter();
  const legacyBase = getLegacyBaseUrl();
  const { data: profile, error: profileError, loading, reload } = useProfile();

  const [photoOverlay, setPhotoOverlay] = useState(false);
  const [passwordOverlay, setPasswordOverlay] = useState(false);
  const [signatureOverlay, setSignatureOverlay] = useState(false);
  const [logoutOverlay, setLogoutOverlay] = useState(false);
  const [imageModal, setImageModal] = useState(false);

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const [photoSuccess, setPhotoSuccess] = useState("");

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordChanging, setPasswordChanging] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null);
  const [signatureUploading, setSignatureUploading] = useState(false);
  const [signatureError, setSignatureError] = useState("");
  const [signatureSuccess, setSignatureSuccess] = useState("");

  const photoInputRef = useRef<HTMLInputElement>(null);
  const signatureInputRef = useRef<HTMLInputElement>(null);

  const divisi = profile?.divisi ?? (typeof window !== "undefined" ? localStorage.getItem("divisi") : null) ?? "";
  const showNip = divisi && !["Wajib Pajak", "PPAT", "PPATS"].includes(divisi);
  const showPejabat = divisi === "PPAT" || divisi === "PPATS";
  const showParafValidasi = divisi === "Peneliti Validasi";
  const showParafButton = ["Peneliti", "PPAT", "PPATS"].includes(divisi ?? "");
  const showPvLink = divisi === "Peneliti Validasi";
  const hideDivisiLabel = divisi === "PPAT" || divisi === "PPATS";

  const photoUrl = profile?.fotoprofil
    ? `${(profile.fotoprofil || "").replace(/\\/g, "/")}?t=${Date.now()}`
    : DEFAULT_PHOTO;

  const closeOverlays = useCallback(() => {
    setPhotoOverlay(false);
    setPasswordOverlay(false);
    setSignatureOverlay(false);
    setLogoutOverlay(false);
    setImageModal(false);
    setPhotoFile(null);
    setPhotoPreview(null);
    setSignatureFile(null);
    setSignaturePreview(null);
    setPhotoError("");
    setPhotoSuccess("");
    setPasswordError("");
    setSignatureError("");
    setSignatureSuccess("");
    if (photoInputRef.current) photoInputRef.current.value = "";
    if (signatureInputRef.current) signatureInputRef.current.value = "";
  }, []);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setPhotoFile(null);
      setPhotoPreview(null);
      return;
    }
    if (!["image/jpeg", "image/jpg", "image/png"].includes(file.type)) {
      setPhotoError("Format: JPG, JPEG, atau PNG");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setPhotoError("Maksimal 2MB");
      return;
    }
    setPhotoError("");
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handlePhotoUpload = async () => {
    if (!photoFile) return;
    setPhotoUploading(true);
    setPhotoError("");
    setPhotoSuccess("");
    try {
      const base = getBackendBaseUrl();
      const url = base ? `${base}/api/v1/auth/profile/upload` : "/api/v1/auth/profile/upload";
      const form = new FormData();
      form.append("fotoprofil", photoFile);
      const res = await fetch(url, { method: "POST", body: form, credentials: "include" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.message ?? "Upload gagal");
      setPhotoSuccess("Foto profil berhasil diupdate");
      setTimeout(() => {
        closeOverlays();
        reload();
      }, 1500);
    } catch (e) {
      setPhotoError((e as Error).message ?? "Gagal mengupload foto");
    } finally {
      setPhotoUploading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      setPasswordError("Konfirmasi password tidak cocok");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError("Password minimal 8 karakter");
      return;
    }
    setPasswordChanging(true);
    setPasswordError("");
    try {
      const base = getBackendBaseUrl();
      const url = base ? `${base}/api/v1/auth/update-password` : "/api/v1/auth/update-password";
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPassword, newPassword }),
        credentials: "include",
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.success) throw new Error(json?.message ?? "Gagal memperbarui password");
      alert("Password berhasil diperbarui.");
      closeOverlays();
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      reload();
    } catch (e) {
      setPasswordError((e as Error).message ?? "Gagal memperbarui password");
    } finally {
      setPasswordChanging(false);
    }
  };

  const handleSignatureSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setSignatureFile(null);
      setSignaturePreview(null);
      return;
    }
    setSignatureError("");
    setSignatureFile(file);
    const reader = new FileReader();
    reader.onload = () => setSignaturePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSignatureUpload = async () => {
    if (!signatureFile) return;
    setSignatureUploading(true);
    setSignatureError("");
    setSignatureSuccess("");
    try {
      const base = getBackendBaseUrl();
      const url = base ? `${base}/api/v1/auth/update-profile-paraf` : "/api/v1/auth/update-profile-paraf";
      const form = new FormData();
      form.append("signature", signatureFile);
      const res = await fetch(url, { method: "POST", body: form, credentials: "include" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.message ?? "Gagal menyimpan paraf");
      setSignatureSuccess("Paraf berhasil disimpan");
      setTimeout(() => {
        closeOverlays();
        reload();
      }, 1500);
    } catch (e) {
      setSignatureError((e as Error).message ?? "Gagal menyimpan paraf");
    } finally {
      setSignatureUploading(false);
    }
  };

  const handleLogout = () => {
    closeOverlays();
    if (typeof window !== "undefined") {
      localStorage.removeItem("userid");
      localStorage.removeItem("divisi");
      localStorage.removeItem("nama");
      localStorage.removeItem("email");
      localStorage.removeItem("telepon");
      localStorage.removeItem("foto");
      localStorage.removeItem("username");
      localStorage.removeItem("nip");
      localStorage.removeItem("special_field");
      localStorage.removeItem("is_profile_complete");
    }
    window.location.href = "/login";
  };

  const [showPassword, setShowPassword] = useState(false);
  const [showOldPwd, setShowOldPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);

  if (loading) {
    return (
      <div className="profile-page-main">
        <div className="profile-card">
          <p style={{ color: "white", textAlign: "center" }}>Memuat profil...</p>
        </div>
      </div>
    );
  }

  if (profileError || !profile) {
    return (
      <div className="profile-page-main">
        <div className="profile-card">
          <p style={{ color: "#ffebee" }}>{profileError ?? "Profil tidak tersedia"}</p>
          <button type="button" className="profile-back-btn" onClick={() => router.back()}>
            ←
          </button>
        </div>
      </div>
    );
  }

  const u = profile;

  return (
    <div className="profile-page-main">
      <div className="profile-card">
        <div className="profile-head">
          <button type="button" className="profile-back-btn" onClick={() => router.back()} aria-label="Kembali">
            ←
          </button>
          <h2>Profile</h2>
          {!hideDivisiLabel && (
            <div className="profile-divisi">
              Divisi: <span>{u.divisi ?? "—"}</span>
            </div>
          )}
        </div>

        <div className="profile-content-wrap">
          <div className="profile-photo-wrap">
            <button
              type="button"
              style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
              onClick={() => setImageModal(true)}
              aria-label="Lihat foto"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photoUrl}
                alt="Profil"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = DEFAULT_PHOTO;
                }}
              />
            </button>
            <button type="button" className="profile-btn-ubah-foto" onClick={() => setPhotoOverlay(true)}>
              Ubah Foto
            </button>
            {showParafButton && (
              <button type="button" className="profile-btn-paraf" onClick={() => setSignatureOverlay(true)}>
                Paraf Khusus
              </button>
            )}
            {showPvLink && (
              <Link
                href={`${legacyBase}/html_folder/ParafP/Sinkronisasi_BSRE/autentikasi_bsre.html`}
                className="profile-pv-link"
              >
                Kelola TTE &amp; QR (PV)
              </Link>
            )}
          </div>

          <div className="profile-details">
            <div className="profile-column">
              <div className="profile-field">
                <label htmlFor="userid">User ID</label>
                <input id="userid" type="text" readOnly value={u.userid ?? u.id ?? "—"} />
              </div>
              <div className="profile-field">
                <label htmlFor="username">Username</label>
                <input id="username" type="text" readOnly value={u.username ?? u.user_name ?? "—"} />
              </div>
              {showNip && (
                <div className="profile-field">
                  <label htmlFor="nip">NIP</label>
                  <input id="nip" type="text" readOnly value={u.nip ?? "—"} />
                </div>
              )}
              {showPejabat && (
                <>
                  <div className="profile-field">
                    <label>Nama PEJABAT</label>
                    <input type="text" readOnly value={u.special_field ?? u.special_field_name ?? "—"} />
                  </div>
                  <div className="profile-field">
                    <label>Gelar Pejabat</label>
                    <input type="text" readOnly value={u.pejabat_umum ?? u.pejabat_umum_name ?? "—"} />
                  </div>
                </>
              )}
              {showParafValidasi && (
                <div className="profile-field">
                  <label>Nama Paraf Validasi</label>
                  <input type="text" readOnly value={u.special_parafv ?? u.special_parafv_name ?? "—"} />
                </div>
              )}
            </div>
            <div className="profile-column">
              <div className="profile-field">
                <label htmlFor="nama">Nama</label>
                <input id="nama" type="text" readOnly value={u.nama ?? u.name ?? "—"} />
              </div>
              <div className="profile-field">
                <label htmlFor="email">Email</label>
                <input id="email" type="text" readOnly value={u.email ?? "—"} />
              </div>
              <div className="profile-field">
                <label htmlFor="telepon">Telepon</label>
                <input id="telepon" type="text" readOnly value={u.telepon ?? u.phone ?? "—"} />
              </div>
              <div className="profile-field">
                <label>Katasandi</label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    readOnly
                    value="••••••••"
                    style={{ paddingRight: 36 }}
                  />
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={() => setShowPassword((p) => !p)}
                    onKeyDown={(e) => e.key === "Enter" && setShowPassword((p) => !p)}
                    style={{
                      position: "absolute",
                      right: 12,
                      top: "50%",
                      transform: "translateY(-50%)",
                      cursor: "pointer",
                    }}
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </span>
                </div>
                <span
                  role="button"
                  tabIndex={0}
                  className="profile-change-pwd-link"
                  onClick={() => setPasswordOverlay(true)}
                  onKeyDown={(e) => e.key === "Enter" && setPasswordOverlay(true)}
                >
                  Ubah katasandi?
                </span>
              </div>
            </div>
          </div>
        </div>

        <div id="profile-error-message" className={`profile-error-msg ${profileError ? "show" : ""}`}>
          {profileError}
        </div>
      </div>

      {/* Backdrop */}
      <div
        className={`profile-overlay-backdrop ${photoOverlay || passwordOverlay || signatureOverlay || logoutOverlay ? "show" : ""}`}
        onClick={closeOverlays}
        role="presentation"
        aria-hidden
      />

      {/* Password overlay */}
      <div className={`profile-modal ${passwordOverlay ? "show" : ""}`} style={{ display: passwordOverlay ? "block" : "none" }}>
        <h3>Ubah Sandi</h3>
        <div className="profile-modal-fields">
          <div className="profile-field">
            <label>Kata Sandi (Lama)</label>
            <div style={{ position: "relative" }}>
              <input
                type={showOldPwd ? "text" : "password"}
                placeholder="Masukkan kata sandi lama"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                style={{ paddingRight: 36 }}
              />
              <span
                role="button"
                tabIndex={0}
                onClick={() => setShowOldPwd((p) => !p)}
                style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", cursor: "pointer" }}
              >
                {showOldPwd ? "🙈" : "👁️"}
              </span>
            </div>
          </div>
          <div className="profile-field">
            <label>Kata Sandi (Baru)</label>
            <div style={{ position: "relative" }}>
              <input
                type={showNewPwd ? "text" : "password"}
                placeholder="Masukkan katasandi baru"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={{ paddingRight: 36 }}
              />
              <span
                role="button"
                tabIndex={0}
                onClick={() => setShowNewPwd((p) => !p)}
                style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", cursor: "pointer" }}
              >
                {showNewPwd ? "🙈" : "👁️"}
              </span>
            </div>
          </div>
          <div className="profile-field">
            <label>Konfirmasi Kata Sandi</label>
            <div style={{ position: "relative" }}>
              <input
                type={showConfirmPwd ? "text" : "password"}
                placeholder="Ulangi katasandi baru"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{ paddingRight: 36 }}
              />
              <span
                role="button"
                tabIndex={0}
                onClick={() => setShowConfirmPwd((p) => !p)}
                style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", cursor: "pointer" }}
              >
                {showConfirmPwd ? "🙈" : "👁️"}
              </span>
            </div>
          </div>
        </div>
        {passwordError && <p style={{ color: "#ffebee", marginTop: 8 }}>{passwordError}</p>}
        <div className="modal-actions">
          <button type="button" onClick={closeOverlays}>Batal</button>
          <button type="button" onClick={handlePasswordChange} disabled={passwordChanging}>
            {passwordChanging ? "Memproses..." : "Iya"}
          </button>
        </div>
      </div>

      {/* Photo overlay */}
      <div className={`profile-modal ${photoOverlay ? "show" : ""}`} style={{ display: photoOverlay ? "block" : "none" }}>
        <h3>Ubah Foto Profil</h3>
        <div style={{ marginBottom: 20 }}>
          <label className="upload-btn" style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "15px 25px", borderRadius: 25, background: "rgba(255,255,255,0.2)", cursor: "pointer" }}>
            Pilih Foto
            <input
              ref={photoInputRef}
              type="file"
              accept=".jpg,.jpeg,.png"
              onChange={handlePhotoSelect}
              style={{ display: "none" }}
            />
          </label>
          <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.9em", marginTop: 8 }}>Format: JPG, PNG (Maks. 2MB)</p>
        </div>
        {photoPreview && (
          <div style={{ textAlign: "center", marginBottom: 15 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photoPreview} alt="Preview" style={{ maxWidth: "100%", maxHeight: 200, borderRadius: 10 }} />
          </div>
        )}
        {photoError && <p style={{ color: "#ffebee" }}>{photoError}</p>}
        {photoSuccess && <p style={{ color: "#c8e6c9" }}>{photoSuccess}</p>}
        <div className="modal-actions">
          <button type="button" onClick={closeOverlays}>Batal</button>
          <button type="button" onClick={handlePhotoUpload} disabled={!photoFile || photoUploading}>
            {photoUploading ? "Mengupload..." : "Simpan Perubahan"}
          </button>
        </div>
      </div>

      {/* Signature overlay */}
      <div className={`profile-modal ${signatureOverlay ? "show" : ""}`} style={{ display: signatureOverlay ? "block" : "none" }}>
        <h3>Upload Tanda Tangan Digital</h3>
        <div className="profile-field">
          <label>Pilih gambar tanda tangan (PNG/JPG/WebP, max 3MB)</label>
          <input
            ref={signatureInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleSignatureSelect}
          />
        </div>
        {signaturePreview && (
          <div style={{ marginTop: 15, textAlign: "center" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={signaturePreview} alt="Preview paraf" style={{ maxWidth: "100%", maxHeight: 200, borderRadius: 8 }} />
          </div>
        )}
        {signatureError && <p style={{ color: "#ffebee" }}>{signatureError}</p>}
        {signatureSuccess && <p style={{ color: "#c8e6c9" }}>{signatureSuccess}</p>}
        <div className="modal-actions">
          <button type="button" onClick={closeOverlays}>Batal</button>
          <button type="button" onClick={handleSignatureUpload} disabled={!signatureFile || signatureUploading}>
            {signatureUploading ? "Menyimpan..." : "Simpan Paraf"}
          </button>
        </div>
      </div>

      {/* Logout overlay */}
      <div className={`profile-modal profile-logout-overlay ${logoutOverlay ? "show" : ""}`} style={{ display: logoutOverlay ? "block" : "none" }}>
        <h3>Konfirmasi</h3>
        <p style={{ color: "white", textAlign: "center" }}>Apakah anda yakin?<br /><span>Keluar dari sistem?</span></p>
        <div className="logout-actions">
          <button type="button" onClick={closeOverlays}>Batal</button>
          <button type="button" onClick={handleLogout}>Iya</button>
        </div>
      </div>

      {/* Image modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Foto profil"
        style={{
          display: imageModal ? "flex" : "none",
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.8)",
          zIndex: 1002,
          alignItems: "center",
          justifyContent: "center",
        }}
        onClick={() => setImageModal(false)}
      >
        <button
          type="button"
          onClick={() => setImageModal(false)}
          style={{
            position: "absolute",
            top: 20,
            right: 30,
            background: "rgba(0,0,0,0.5)",
            color: "white",
            border: "none",
            width: 50,
            height: 50,
            borderRadius: "50%",
            fontSize: 24,
            cursor: "pointer",
          }}
        >
          ×
        </button>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photoUrl}
          alt="Profil"
          onClick={(e) => e.stopPropagation()}
          style={{ maxWidth: "90%", maxHeight: "90%", borderRadius: 15 }}
        />
      </div>
    </div>
  );
}
