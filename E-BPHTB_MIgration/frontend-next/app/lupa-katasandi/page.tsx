"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback, useRef } from "react";
import { getBackendBaseUrl } from "../../lib/api";

const OTP_LIMIT_SEC = 600; // 10 menit

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export default function LupaKatasandiPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [nik, setNik] = useState("");
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [timeLeft, setTimeLeft] = useState(OTP_LIMIT_SEC);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [expired, setExpired] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const otp = otpDigits.join("");
  const apiBase = getBackendBaseUrl();
  const requestUrl = apiBase ? `${apiBase}/api/v1/auth/reset-password-request` : "/api/v1/auth/reset-password-request";
  const verifyOtpUrl = apiBase ? `${apiBase}/api/v1/auth/verify-reset-otp` : "/api/v1/auth/verify-reset-otp";

  useEffect(() => {
    if (step !== 2 || !email || expired) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [step, email, expired]);

  const resetTimer = useCallback(() => {
    setTimeLeft(OTP_LIMIT_SEC);
    setExpired(false);
    setOtpDigits(["", "", "", "", "", ""]);
  }, []);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    const trimEmail = email.trim();
    const trimNik = nik.trim();
    if (!trimEmail || !trimNik) {
      setMessage({ type: "error", text: "Email dan NIK wajib diisi." });
      return;
    }
    if (trimNik.length !== 16 || !/^\d+$/.test(trimNik)) {
      setMessage({ type: "error", text: "NIK harus 16 digit angka." });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(requestUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimEmail, nik: trimNik }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStep(2);
        setTimeLeft(OTP_LIMIT_SEC);
        setExpired(false);
        setOtpDigits(["", "", "", "", "", ""]);
        setMessage({ type: "success", text: "OTP telah dikirim ke email Anda. Cek inbox (dan spam)." });
      } else {
        setMessage({ type: "error", text: data.message || "Gagal mengirim OTP." });
      }
    } catch {
      setMessage({ type: "error", text: "Gagal terhubung. Coba lagi." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(otp)) {
      setMessage({ type: "error", text: "Kode OTP harus 6 angka." });
      return;
    }
    setMessage(null);
    setSubmitting(true);
    try {
      const res = await fetch(verifyOtpUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), otp }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.token) {
        router.push(`/ubah-katasandi?token=${encodeURIComponent(data.token)}`);
        return;
      }
      setMessage({ type: "error", text: data.message || "OTP tidak valid atau kadaluarsa." });
    } catch {
      setMessage({ type: "error", text: "Gagal verifikasi. Coba lagi." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    setMessage(null);
    setResending(true);
    try {
      const res = await fetch(requestUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), nik: nik.trim() }),
      });
      const data = await res.json();
      setMessage({ type: res.ok && data.success ? "success" : "error", text: data.message || (res.ok ? "OTP baru telah dikirim." : "Gagal kirim ulang.") });
      if (res.ok && data.success) {
        resetTimer();
      }
    } catch {
      setMessage({ type: "error", text: "Gagal kirim ulang OTP." });
    } finally {
      setResending(false);
    }
  };

  const updateDigit = (idx: number, value: string) => {
    if (expired) return;
    const v = value.replace(/\D/g, "").slice(-1);
    const next = [...otpDigits];
    next[idx] = v;
    setOtpDigits(next);
    if (v && idx < 5) inputsRef.current[idx + 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    if (expired) return;
    const paste = e.clipboardData.getData("text").trim();
    if (!/^\d{6}$/.test(paste)) return;
    setOtpDigits(paste.split(""));
    inputsRef.current[5]?.focus();
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otpDigits[idx] && idx > 0) {
      const next = [...otpDigits];
      next[idx - 1] = "";
      setOtpDigits(next);
      inputsRef.current[idx - 1]?.focus();
    }
  };

  if (step === 1) {
    return (
      <main className="otp-page">
        <div className="otp-container lupa-katasandi-with-video">
          <div className="lupa-katasandi-video-wrap" aria-hidden>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="lupa-katasandi-video"
              src="/GIF_canva/7.gif"
              alt=""
            />
          </div>
          <div className="otp-card">
            <div className="otp-header">
              <h2 className="otp-title">Pemulihan Kata Sandi</h2>
              <p className="otp-subtitle">Masukkan email dan NIK terdaftar. Kami akan mengirim kode OTP ke email Anda (berlaku 10 menit).</p>
            </div>
            <form onSubmit={handleRequestOtp} className="otp-form">
              <div className="otp-field">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Alamat email terdaftar"
                  className="otp-input otp-input-email"
                  required
                />
              </div>
              <div className="otp-field">
                <label htmlFor="nik">NIK (16 digit)</label>
                <input
                  type="text"
                  id="nik"
                  value={nik}
                  onChange={(e) => setNik(e.target.value)}
                  placeholder="Nomor Induk Kependudukan"
                  className="otp-input"
                  maxLength={16}
                  inputMode="numeric"
                  required
                />
              </div>
              {message && <div className={`otp-message ${message.type}`}>{message.text}</div>}
              <button type="submit" className="otp-btn otp-btn-verify" disabled={submitting}>
                {submitting ? "Mengirim..." : "Kirim OTP"}
              </button>
            </form>
          </div>
          <Link href="/login" className="otp-link-back">
            ← Kembali ke login
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="otp-page">
      <div className="otp-container">
        <div className="otp-card">
          <div className="otp-header">
            <h2 className="otp-title">Masukkan Kode OTP</h2>
            <p className="otp-subtitle">Kode 6 digit telah dikirim ke {email}</p>
          </div>
          <form onSubmit={handleVerifyOtp} className="otp-form">
            <div className="otp-field">
              <label>Email</label>
              <input type="email" value={email} readOnly className="otp-input otp-input-email" />
            </div>
            <div className={`otp-timer ${expired ? "otp-timer-expired" : ""}`}>
              <p>Kode OTP kadaluarsa dalam <span>{formatTime(timeLeft)}</span></p>
              {expired && <p className="otp-timer-expired-msg">Kode kadaluarsa. Silakan kirim ulang.</p>}
            </div>
            <div className="otp-field">
              <label>Kode OTP</label>
              <div className="otp-inputs">
                {otpDigits.map((d, i) => (
                  <input
                    key={i}
                    ref={(el) => { inputsRef.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={d}
                    onChange={(e) => updateDigit(i, e.target.value)}
                    onPaste={i === 0 ? handlePaste : undefined}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    disabled={expired || submitting}
                    className="otp-input otp-input-digit"
                    aria-label={`Digit ${i + 1}`}
                  />
                ))}
              </div>
            </div>
            {message && <div className={`otp-message ${message.type}`}>{message.text}</div>}
            <button type="submit" className="otp-btn otp-btn-verify" disabled={submitting || expired || otp.length !== 6}>
              {submitting ? "Memverifikasi..." : "Verifikasi & Lanjut"}
            </button>
          </form>
          <div className="otp-footer">
            <p>
              Tidak menerima kode?{" "}
              <button type="button" className="otp-resend" onClick={handleResend} disabled={resending || submitting}>
                {resending ? "Mengirim..." : "Kirim Ulang OTP"}
              </button>
            </p>
          </div>
        </div>
        <Link href="/login" className="otp-link-back">
          ← Kembali ke login
        </Link>
      </div>
    </main>
  );
}
