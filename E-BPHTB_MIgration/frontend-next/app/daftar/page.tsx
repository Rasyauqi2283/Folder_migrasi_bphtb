"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Suspense, useState, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { getBackendBaseUrl, getLegacyBaseUrl } from "../../lib/api";

type Verse = "wp" | "karyawan" | "pu";

const PENDING_REGISTRATION_KEY = "pending_registration_v1";
/** Batas waktu klien — selaras dengan batas pipeline OCR di server (~15 detik). */
const KTP_OCR_CLIENT_DEADLINE_MS = 15_000;

/** Data hasil OCR: inti NIK & Nama; alamat + wilayah untuk verifikasi (tanpa TTL/JK/agama/dll.). */
interface KTPOcrData {
  nik?: string;
  nama?: string;
  provinsi?: string;
  kabupatenKota?: string;
  alamat?: string;
  rtRw?: string;
  kelurahan?: string;
  kecamatan?: string;
  rawText?: string;
  is_readable?: boolean;
}

function verseToBackend(v: string): "WP" | "Karyawan" | "PU" {
  const s = (v || "wp").toLowerCase();
  if (s === "pu") return "PU";
  if (s === "karyawan") return "Karyawan";
  return "WP";
}

function DaftarContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const legacyBase = getLegacyBaseUrl();
  const apiBase = getBackendBaseUrl();

  const verseParam = (searchParams.get("verse") || "wp").toLowerCase();
  const verse: Verse = verseParam === "pu" || verseParam === "karyawan" ? verseParam : "wp";

  const [nama, setNama] = useState("");
  const [nik, setNik] = useState("");
  const [telepon, setTelepon] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [gender, setGender] = useState("");
  const [nip, setNip] = useState("");
  const [divisiPu, setDivisiPu] = useState("");
  const [specialField, setSpecialField] = useState("");
  const [pejabatUmum, setPejabatUmum] = useState("");

  const [ktpFile, setKtpFile] = useState<File | null>(null);
  const [ktpUploadId, setKtpUploadId] = useState<string | null>(null);
  const [ktpStatus, setKtpStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [ktpMessage, setKtpMessage] = useState("");
  const [ocrData, setOcrData] = useState<KTPOcrData | null>(null);
  const [ocrStats, setOcrStats] = useState<Record<string, unknown> | null>(null);
  const [ktpBwPreviewUrl, setKtpBwPreviewUrl] = useState<string | null>(null);

  const [wpSubtype, setWpSubtype] = useState<"Perorangan" | "Badan Usaha">("Perorangan");
  const [npwpBadan, setNpwpBadan] = useState("");
  const [nib, setNib] = useState("");
  const [nibDocUploadId, setNibDocUploadId] = useState<string | null>(null);
  const [nibDocStatus, setNibDocStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [nibDocMessage, setNibDocMessage] = useState("");

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "email_already" | "">("");
  const [submitting, setSubmitting] = useState(false);

  const isWPBadan = verse === "wp" && wpSubtype === "Badan Usaha";

  const verseLabel =
    verse === "wp"
      ? "Pendaftaran sebagai Wajib Pajak (WP)."
      : verse === "karyawan"
        ? "Pendaftaran Karyawan (LTB, LSB, Peneliti, Peneliti Validasi, Bank) — isi NIP."
        : "Pendaftaran PPAT/PPATS — isi data pejabat pembuat akta.";

  /** Pratinjau KTP warna mentah (tanpa konversi grayscale/biner). */
  useEffect(() => {
    if (!ktpFile) {
      setKtpBwPreviewUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(ktpFile);
    setKtpBwPreviewUrl(objectUrl);
    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [ktpFile]);

  useEffect(() => {
    if (isWPBadan && gender !== "") {
      setGender("");
    }
  }, [isWPBadan, gender]);

  const str = (v: unknown): string | undefined =>
    typeof v === "string" && v.trim() ? v : undefined;

  const uploadKtp = useCallback(async (file: File) => {
    setKtpStatus("loading");
    setKtpMessage("Memproses OCR KTP (maks. 15 detik)…");
    setKtpUploadId(null);
    setOcrData(null);
    setOcrStats(null);
    const base = apiBase || legacyBase;
    const ac = new AbortController();
    const deadline = window.setTimeout(() => ac.abort(), KTP_OCR_CLIENT_DEADLINE_MS);
    try {
      const formData = new FormData();
      formData.append("fotoktp", file);
      const res = await fetch(`${base}/api/v1/auth/upload-ktp`, {
        method: "POST",
        credentials: "include",
        body: formData,
        signal: ac.signal,
      });
      let result: {
        success?: boolean;
        data?: Record<string, unknown>;
        message?: string;
        decision?: string;
        uploadId?: string;
        stats?: Record<string, unknown>;
      } = {};
      try {
        result = await res.json();
      } catch {
        result = {};
      }
      if (!res.ok || !result.success || !result.uploadId || !result.data) {
        setKtpStatus("error");
        setKtpMessage(
          result?.message ||
            (res.status === 502
              ? "Backend tidak menjawab. Pastikan Go (port 8000) sudah jalan."
              : "OCR KTP gagal. Gunakan foto lebih jelas.")
        );
        return;
      }
      const raw = result.data;
      const d: KTPOcrData = {
        nik: str(raw.nik),
        nama: str(raw.nama),
        provinsi: str(raw.provinsi),
        kabupatenKota: str(raw.kabupatenKota),
        alamat: str(raw.alamat),
        rtRw: str(raw.rtRw),
        kelurahan: str(raw.kelurahan),
        kecamatan: str(raw.kecamatan),
        rawText: str(raw.rawText),
        is_readable: typeof raw.is_readable === "boolean" ? raw.is_readable : undefined,
      };
      setKtpUploadId(result.uploadId);
      setOcrData(d);
      setOcrStats(result.stats && typeof result.stats === "object" ? result.stats : null);
      setKtpStatus("success");
      setKtpMessage(
        result.decision === "needs_review"
          ? "OCR diproses, tetapi beberapa field perlu Anda cek manual."
          : "KTP berhasil dipindai."
      );
      if (d.nama) setNama(d.nama);
      if (d.nik) setNik(d.nik);
    } catch (e) {
      setKtpStatus("error");
      if (e instanceof DOMException && e.name === "AbortError") {
        setKtpMessage(
          "Pemindaian memakan waktu lebih dari 15 detik dan dihentikan. Periksa backend (termasuk layanan IndoROBERTa jika aktif), atau gunakan foto lebih kecil."
        );
        return;
      }
      const errMsg = e instanceof Error ? e.message : "";
      setKtpMessage(
        errMsg.includes("fetch") || errMsg.includes("network")
          ? "Tidak bisa terhubung. Pastikan Next.js (port 3000) dan backend Go (port 8000) sudah jalan."
          : "Tidak bisa terhubung ke server. Cek koneksi dan pastikan kedua server berjalan."
      );
    } finally {
      window.clearTimeout(deadline);
    }
  }, [apiBase, legacyBase]);

  const uploadNibDoc = useCallback(async (file: File) => {
    setNibDocStatus("loading");
    setNibDocMessage("Mengupload Sertifikat NIB...");
    setNibDocUploadId(null);
    const base = apiBase || legacyBase;
    try {
      const formData = new FormData();
      formData.append("nib_doc", file);
      const res = await fetch(`${base}/api/v1/auth/upload-nib-doc`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const result: { success?: boolean; uploadId?: string; message?: string } = await res.json().catch(() => ({}));
      if (!res.ok || !result.success || !result.uploadId) {
        setNibDocStatus("error");
        setNibDocMessage(result?.message || "Upload Sertifikat NIB gagal.");
        return;
      }
      setNibDocUploadId(result.uploadId);
      setNibDocStatus("success");
      setNibDocMessage("Sertifikat NIB berhasil diupload.");
    } catch (e) {
      setNibDocStatus("error");
      setNibDocMessage("Tidak bisa terhubung ke server. Cek koneksi.");
    }
  }, [apiBase, legacyBase]);

  const onNibDocChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setNibDocUploadId(null);
    setNibDocStatus("idle");
    setNibDocMessage("");
    if (file) {
      if (file.type !== "application/pdf") {
        setNibDocStatus("error");
        setNibDocMessage("Format harus PDF.");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setNibDocStatus("error");
        setNibDocMessage("Ukuran maksimal 10MB.");
        return;
      }
      uploadNibDoc(file);
    }
  };

  const onKtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setKtpFile(file || null);
    setKtpUploadId(null);
    setOcrData(null);
    setOcrStats(null);
    setKtpStatus("idle");
    setKtpMessage("");
    if (file) {
      const allowed = ["image/jpeg", "image/jpg", "image/png"];
      if (!allowed.includes(file.type)) {
        setKtpStatus("error");
        setKtpMessage("Format tidak didukung. Gunakan JPG atau PNG.");
        return;
      }
      if (file.size > 3 * 1024 * 1024) {
        setKtpStatus("error");
        setKtpMessage("Ukuran maksimal 3MB.");
        return;
      }
      uploadKtp(file);
    }
  };

  const validate = (): boolean => {
    if (!nama.trim() || nama.trim().length < 2) {
      setMessage("Nama lengkap minimal 2 karakter.");
      setMessageType("error");
      return false;
    }
    if (!/^\d{16}$/.test(nik)) {
      setMessage("NIK harus 16 digit.");
      setMessageType("error");
      return false;
    }
    if (!/^08\d{9,11}$/.test(telepon)) {
      setMessage("Nomor telepon harus dimulai 08, 11–13 digit.");
      setMessageType("error");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMessage("Format email tidak valid.");
      setMessageType("error");
      return false;
    }
    if (password.length < 6) {
      setMessage("Password minimal 6 karakter.");
      setMessageType("error");
      return false;
    }
    if (password !== repeatPassword) {
      setMessage("Konfirmasi password tidak cocok.");
      setMessageType("error");
      return false;
    }
    if (!isWPBadan && (!gender || !["Perempuan", "Laki-laki"].includes(gender))) {
      setMessage("Pilih jenis kelamin.");
      setMessageType("error");
      return false;
    }
    if (isWPBadan) {
      if (!npwpBadan.trim()) {
        setMessage("NPWP Badan Usaha wajib diisi.");
        setMessageType("error");
        return false;
      }
      if (!nib.trim()) {
        setMessage("NIB (Nomor Induk Berusaha) wajib diisi.");
        setMessageType("error");
        return false;
      }
      if (!nibDocUploadId) {
        setMessage("Upload Sertifikat NIB (PDF) terlebih dahulu.");
        setMessageType("error");
        return false;
      }
    } else if (!ktpUploadId) {
      setMessage("Upload foto KTP terlebih dahulu.");
      setMessageType("error");
      return false;
    }
    if (verse === "karyawan" && !nip.trim()) {
      setMessage("NIP wajib untuk pendaftaran Karyawan.");
      setMessageType("error");
      return false;
    }
    if (verse === "pu") {
      if (divisiPu !== "PPAT" && divisiPu !== "PPATS" && divisiPu !== "Notaris") {
        setMessage("Pilih jenis akun PPAT, PPATS, atau Notaris.");
        setMessageType("error");
        return false;
      }
      if (!specialField.trim()) {
        setMessage(divisiPu === "Notaris" ? "Nama Notaris/Gelar wajib diisi." : "Nama PPAT/Gelar wajib diisi.");
        setMessageType("error");
        return false;
      }
      if (divisiPu !== "Notaris" && !pejabatUmum.trim()) {
        setMessage("Pejabat Umum wajib diisi.");
        setMessageType("error");
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setMessageType("");
    if (!validate()) return;
    if (!isWPBadan) {
      if (!ktpUploadId) {
        setMessage("KTP harus diupload terlebih dahulu.");
        setMessageType("error");
        return;
      }
      if (!ocrData) {
        setMessage("Data OCR KTP belum tersedia. Upload ulang KTP.");
        setMessageType("error");
        return;
      }
    }

    setSubmitting(true);
    try {
      const pwdEl = document.getElementById("password") as HTMLInputElement | null;
      const pwdVal = (pwdEl?.value || password || "").trim();
      const specialEl = document.getElementById("special_field") as HTMLInputElement | null;
      const pejabatEl = document.getElementById("pejabat_umum") as HTMLInputElement | null;
      const divEl = document.getElementById("divisi_pu") as HTMLSelectElement | null;

      const pendingPayload: Record<string, unknown> = {
        nama: nama.trim(),
        nik,
        telepon,
        email,
        password: pwdVal || password,
        gender: isWPBadan ? "" : gender,
        verse: verseToBackend(verse),
        ktpUploadId: isWPBadan ? "" : ktpUploadId,
        ktpOcrJson: isWPBadan ? "" : JSON.stringify(ocrData),
      };

      if (verse === "wp") {
        pendingPayload.wp_subtype = wpSubtype;
        if (isWPBadan) {
          pendingPayload.npwp_badan = npwpBadan.trim();
          pendingPayload.nib = nib.trim();
          pendingPayload.nib_doc_upload_id = nibDocUploadId;
        }
      }
      if (verse === "karyawan") pendingPayload.nip = nip.trim();
      if (verse === "pu") {
        pendingPayload.divisi = divEl?.value || divisiPu;
        pendingPayload.special_field = ((specialEl?.value ?? specialField) || "").trim();
        pendingPayload.pejabat_umum = ((pejabatEl?.value ?? pejabatUmum) || "").trim();
      }

      if (typeof window !== "undefined") {
        sessionStorage.setItem(PENDING_REGISTRATION_KEY, JSON.stringify(pendingPayload));
        localStorage.setItem("email", email);
      }

      const base = apiBase || legacyBase;
      const requestOtpUrl = `${base}/api/v1/auth/request-otp`;
      const res = await fetch(requestOtpUrl, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, pendingRegistration: pendingPayload }),
      });

      let data: { success?: boolean; message?: string; code?: string } = {};
      try {
        data = await res.json();
      } catch {
        data = { message: "Respons server tidak valid." };
      }

      if (res.ok && data.success) {
        setMessage(data.message || "OTP telah dikirim. Lanjutkan verifikasi OTP.");
        setMessageType("success");
        setTimeout(() => {
          router.push("/verifikasi-otp");
        }, 1000);
      } else {
        const errMsg = data?.message || `Request OTP gagal (${res.status})`;
        const isEmailAlready = data?.code === "EMAIL_ALREADY_REGISTERED" || /sudah terdaftar/i.test(errMsg);
        setMessage(errMsg);
        setMessageType(isEmailAlready ? "email_already" : "error");
        if (typeof window !== "undefined") {
          sessionStorage.removeItem(PENDING_REGISTRATION_KEY);
        }
      }
    } catch {
      setMessage("Gagal terhubung ke server. Pastikan backend Go (port 8000) jalan.");
      setMessageType("error");
      if (typeof window !== "undefined") {
        sessionStorage.removeItem(PENDING_REGISTRATION_KEY);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="daftar-page">
      <div className="daftar-container">
        <h1 className="daftar-title">Pendaftaran Akun BPHTB Online</h1>
        <p className="daftar-verse-label">{verseLabel}</p>

        {verse === "wp" && (
          <div className="daftar-field" style={{ marginBottom: 16 }}>
            <label>Tipe Wajib Pajak</label>
            <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                <input
                  type="radio"
                  name="wp_subtype"
                  checked={wpSubtype === "Perorangan"}
                  onChange={() => setWpSubtype("Perorangan")}
                />
                Perorangan
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                <input
                  type="radio"
                  name="wp_subtype"
                  checked={wpSubtype === "Badan Usaha"}
                  onChange={() => setWpSubtype("Badan Usaha")}
                />
                Badan Usaha (PT/CV/Firma)
              </label>
            </div>
          </div>
        )}

        {verse === "wp" && wpSubtype === "Badan Usaha" && (
          <div className="daftar-ktp-zone" style={{ marginBottom: 16 }}>
            <div className="daftar-field">
              <label htmlFor="nib_doc">Sertifikat NIB (PDF, wajib)</label>
              <input
                type="file"
                id="nib_doc"
                accept=".pdf,application/pdf"
                onChange={onNibDocChange}
              />
            </div>
            {nibDocStatus !== "idle" && (
              <div className={`daftar-ktp-status ${nibDocStatus}`}>{nibDocMessage}</div>
            )}
          </div>
        )}

        <div className={`daftar-ktp-zone ${ktpFile ? "has-file" : ""}`} style={{ display: verse === "wp" && wpSubtype === "Badan Usaha" ? "none" : undefined }}>
          <div className="daftar-field">
            <label htmlFor="fotoktp">Foto KTP (wajib)</label>
            <input
              type="file"
              id="fotoktp"
              accept="image/png,image/jpeg,image/jpg"
              onChange={onKtpChange}
            />
          </div>
          {ktpStatus !== "idle" && (
            <div className={`daftar-ktp-status ${ktpStatus}`}>{ktpMessage}</div>
          )}
          {ktpBwPreviewUrl && (
            <div className="daftar-ktp-preview-bw-wrap">
              <div className="daftar-ktp-preview-bw-label">Pratinjau KTP (warna asli)</div>
              <div className="daftar-ktp-preview-bw-inner">
                <img src={ktpBwPreviewUrl} alt="Pratinjau KTP warna asli" className="daftar-ktp-preview-bw-img" />
              </div>
            </div>
          )}
          {ocrData && (
            <div className="daftar-ktp-lampiran">
              <h4 className="daftar-ktp-lampiran-title">
                Data lampiran (hasil scan KTP)
              </h4>

              <div className="daftar-ktp-lampiran-section">
                <h5 className="daftar-ktp-lampiran-section-title">Identitas (wajib dari OCR)</h5>
                <div className="daftar-ktp-lampiran-grid">
                  {ocrData.nik && (
                    <p><strong>NIK:</strong> <span>{ocrData.nik}</span></p>
                  )}
                  {ocrData.nama && (
                    <p><strong>Nama:</strong> <span>{ocrData.nama}</span></p>
                  )}
                </div>
              </div>

              <div className="daftar-ktp-lampiran-section">
                <h5 className="daftar-ktp-lampiran-section-title">Alamat</h5>
                <div className="daftar-ktp-lampiran-grid">
                  {ocrData.provinsi && (
                    <p><strong>Provinsi:</strong> <span>{ocrData.provinsi}</span></p>
                  )}
                  {ocrData.kabupatenKota && (
                    <p><strong>Kab/Kota:</strong> <span>{ocrData.kabupatenKota}</span></p>
                  )}
                  {ocrData.alamat && (
                    <p><strong>Alamat:</strong> <span>{ocrData.alamat}</span></p>
                  )}
                  {ocrData.rtRw && (
                    <p><strong>RT/RW:</strong> <span>{ocrData.rtRw}</span></p>
                  )}
                  {ocrData.kelurahan && (
                    <p><strong>Kel/Desa:</strong> <span>{ocrData.kelurahan}</span></p>
                  )}
                  {ocrData.kecamatan && (
                    <p><strong>Kecamatan:</strong> <span>{ocrData.kecamatan}</span></p>
                  )}
                </div>
              </div>
            </div>
          )}
          {ocrData && (
            <div className="daftar-ktp-json-block">
              <h4 className="daftar-ktp-json-title">Hasil pembacaan (JSON)</h4>
              <p className="daftar-ktp-json-hint">
                Pipeline membaca NIK &amp; Nama (wajib), lalu alamat, RT/RW, Kel/Desa, Kecamatan (+ Prov/Kab bila ada). Field TTL, JK, golongan darah, agama, dll. tidak diekstrak.
              </p>
              <pre className="daftar-ktp-json-view" tabIndex={0}>
                {JSON.stringify(
                  {
                    fields: ocrData,
                    stats: ocrStats,
                  },
                  null,
                  2
                )}
              </pre>
            </div>
          )}
        </div>

        <form id="registration-form" onSubmit={handleSubmit}>
          <div className="daftar-form-row">
            <div>
              <div className="daftar-field">
                <label htmlFor="nama">{isWPBadan ? "Nama Perusahaan / Penanggung Jawab" : "Nama Lengkap"}</label>
                <input
                  type="text"
                  id="nama"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder={isWPBadan ? "Nama perusahaan atau penanggung jawab" : "Nama Lengkap"}
                  required
                />
                <div className="daftar-validation-zone" aria-live="polite" />
              </div>
              <div className="daftar-field">
                <label htmlFor="nik">{isWPBadan ? "NIK Penanggung Jawab (16 digit)" : "NIK (16 digit)"}</label>
                <input
                  type="text"
                  id="nik"
                  value={nik}
                  onChange={(e) => setNik(e.target.value.replace(/\D/g, "").slice(0, 16))}
                  placeholder={isWPBadan ? "NIK penanggung jawab badan usaha" : "NIK sesuai KTP"}
                  maxLength={16}
                  required
                />
                <div className="daftar-validation-zone daftar-validation-zone-double" aria-live="polite">
                  <small className="daftar-nik-counter">{nik.length}/16 digit</small>
                </div>
              </div>
              {isWPBadan && (
                <>
                  <div className="daftar-field">
                    <label htmlFor="npwp_badan">NPWP Badan Usaha</label>
                    <input
                      type="text"
                      id="npwp_badan"
                      value={npwpBadan}
                      onChange={(e) => setNpwpBadan(e.target.value)}
                      placeholder="Contoh: 12.345.678.9-012.000"
                      maxLength={25}
                    />
                  </div>
                  <div className="daftar-field">
                    <label htmlFor="nib">NIB (Nomor Induk Berusaha)</label>
                    <input
                      type="text"
                      id="nib"
                      value={nib}
                      onChange={(e) => setNib(e.target.value)}
                      placeholder="Nomor Induk Berusaha"
                      maxLength={50}
                    />
                  </div>
                </>
              )}
              <div className="daftar-field">
                <label htmlFor="telepon">Telepon</label>
                <input
                  type="text"
                  id="telepon"
                  value={telepon}
                  onChange={(e) => setTelepon(e.target.value.replace(/\D/g, "").slice(0, 13))}
                  placeholder="08xxxxxxxxxx"
                  maxLength={13}
                  required
                />
                <div className="daftar-validation-zone daftar-validation-zone-double" aria-live="polite">
                  <small className="daftar-telepon-info">Contoh: 08123456789</small>
                </div>
              </div>
            </div>
            <div>
              <div className="daftar-field">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  required
                />
                <div className="daftar-validation-zone" aria-live="polite" />
              </div>
              <div className="daftar-field">
                <label htmlFor="password">Kata Sandi</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 karakter"
                  maxLength={16}
                  required
                />
                <div className="daftar-validation-zone daftar-validation-zone-double" aria-live="polite" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 4 }}>
                  <span className="daftar-password-helper">
                    Buat kata sandi mu disini, penting: buat berbeda dengan sandi pada email anda
                  </span>
                </div>
              </div>
              <div className="daftar-field">
                <label htmlFor="repeatpassword">Ulangi Kata Sandi</label>
                <input
                  type="password"
                  id="repeatpassword"
                  value={repeatPassword}
                  onChange={(e) => setRepeatPassword(e.target.value)}
                  placeholder="Ulangi Kata Sandi"
                  required
                />
                <div className="daftar-validation-zone" aria-live="polite" />
              </div>
            </div>
          </div>

          {verse === "karyawan" && (
            <div className="daftar-field">
              <label htmlFor="nip">NIP (wajib untuk Karyawan)</label>
              <input
                type="text"
                id="nip"
                value={nip}
                onChange={(e) => setNip(e.target.value)}
                placeholder="NIP"
                maxLength={20}
              />
            </div>
          )}

          {verse === "pu" && (
            <>
              <div className="daftar-field">
                <label htmlFor="divisi_pu">Jenis akun</label>
                <select
                  id="divisi_pu"
                  value={divisiPu}
                  onChange={(e) => {
                    const v = e.target.value;
                    setDivisiPu(v);
                    if (v === "PPAT" || v === "PPATS" || v === "Notaris") setPejabatUmum(v);
                    else setPejabatUmum("");
                  }}
                >
                  <option value="">Pilih...</option>
                  <option value="PPAT">PPAT</option>
                  <option value="PPATS">PPATS</option>
                  <option value="Notaris">Notaris</option>
                </select>
              </div>
              <div className="daftar-field">
                <label htmlFor="special_field">{divisiPu === "Notaris" ? "Nama Notaris / Gelar" : "Nama PPAT / Gelar"}</label>
                <input
                  type="text"
                  id="special_field"
                  value={specialField}
                  onChange={(e) => setSpecialField(e.target.value)}
                  placeholder={divisiPu === "Notaris" ? "Contoh: Dr. Ahmad, S.H., M.Kn." : "Contoh: Dr. Ahmad, S.H."}
                  maxLength={255}
                />
              </div>
              <div className="daftar-field">
                <label htmlFor="pejabat_umum">Pejabat Umum (PPAT / Notaris)</label>
                <input
                  type="text"
                  id="pejabat_umum"
                  value={divisiPu === "PPAT" || divisiPu === "PPATS" || divisiPu === "Notaris" ? divisiPu : pejabatUmum}
                  onChange={(e) => setPejabatUmum(e.target.value)}
                  placeholder="Pejabat Umum"
                  maxLength={50}
                  readOnly={divisiPu === "PPAT" || divisiPu === "PPATS" || divisiPu === "Notaris"}
                />
              </div>
            </>
          )}

          <div className="daftar-field">
            <label htmlFor="gender">Jenis Kelamin</label>
            <select
              id="gender"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              required={!isWPBadan}
              disabled={isWPBadan}
            >
              <option value="">{isWPBadan ? "Tidak berlaku untuk WP Badan Usaha" : "Pilih..."}</option>
              <option value="Perempuan">Perempuan</option>
              <option value="Laki-laki">Laki-laki</option>
            </select>
          </div>

          <div className="daftar-actions">
            <button
              type="button"
              className="daftar-btn daftar-btn-cancel"
              onClick={() => router.back()}
            >
              Kembali
            </button>
            <button
              type="submit"
              className="daftar-btn daftar-btn-submit"
              id="submitBtn"
              disabled={submitting}
            >
              {submitting ? "Mengirim..." : "Daftar"}
            </button>
          </div>

          {message && (
            <div className={`daftar-message ${messageType}`}>
              {message}
              {messageType === "email_already" && (
                <div style={{ marginTop: 12 }}>
                  <Link href="/login" className="daftar-btn daftar-btn-submit" style={{ display: "inline-block", textDecoration: "none" }}>
                    Masuk
                  </Link>
                </div>
              )}
            </div>
          )}
        </form>

        <Link href="/" className="daftar-link">
          ← Kembali ke beranda
        </Link>
      </div>
    </div>
  );
}

export default function DaftarPage() {
  return (
    <main className="container">
      <Suspense fallback={<div className="daftar-page" style={{ padding: 48, textAlign: "center" }}>Memuat...</div>}>
        <DaftarContent />
      </Suspense>
    </main>
  );
}





