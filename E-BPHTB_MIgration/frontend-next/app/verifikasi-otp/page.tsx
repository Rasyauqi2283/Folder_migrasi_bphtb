"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback, useRef } from "react";
import { getBackendBaseUrl } from "../../lib/api";

const OTP_LIMIT_SEC = 600; // 10 menit
const PENDING_REGISTRATION_KEY = "pending_registration_v1";

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export default function VerifikasiOtpPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
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
  const verifyUrl = apiBase ? `${apiBase}/api/v1/auth/verify-otp-finalize` : "/api/v1/auth/verify-otp-finalize";
  const resendUrl = apiBase ? `${apiBase}/api/v1/auth/resend-otp` : "/api/v1/auth/resend-otp";

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("email") : null;
    if (saved) {
      setEmail(saved);
    } else {
      setMessage({ type: "error", text: "Email tidak ditemukan. Silakan registrasi ulang." });
      setTimeout(() => router.push("/daftar"), 2000);
    }
  }, [router]);

  useEffect(() => {
    if (!email || expired) return;
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
  }, [email, expired]);

  const resetTimer = useCallback(() => {
    setTimeLeft(OTP_LIMIT_SEC);
    setExpired(false);
    setOtpDigits(["", "", "", "", "", ""]);
  }, []);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(otp)) {
      setMessage({ type: "error", text: "Kode OTP harus terdiri dari 6 angka." });
      return;
    }

    const pendingRaw = typeof window !== "undefined" ? sessionStorage.getItem(PENDING_REGISTRATION_KEY) : null;
    if (!pendingRaw) {
      setMessage({ type: "error", text: "Data pendaftaran tidak ditemukan. Silakan daftar ulang." });
      setTimeout(() => router.push("/daftar"), 1200);
      return;
    }

    let pendingRegistration: Record<string, unknown> | null = null;
    try {
      pendingRegistration = JSON.parse(pendingRaw) as Record<string, unknown>;
    } catch {
      setMessage({ type: "error", text: "Data pendaftaran rusak. Silakan daftar ulang." });
      if (typeof window !== "undefined") sessionStorage.removeItem(PENDING_REGISTRATION_KEY);
      setTimeout(() => router.push("/daftar"), 1200);
      return;
    }

    setMessage(null);
    setSubmitting(true);
    try {
      const res = await fetch(verifyUrl, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, pendingRegistration }),
      });
      const data = await res.json();
      setMessage({ type: res.ok ? "success" : "error", text: data.message ?? "Terjadi kesalahan." });
      if (res.ok) {
        if (typeof window !== "undefined") {
          sessionStorage.removeItem(PENDING_REGISTRATION_KEY);
        }
        setTimeout(() => router.push("/login"), 1500);
      }
    } catch (err) {
      setMessage({
        type: "error",
        text: "Terjadi kesalahan: " + (err instanceof Error ? err.message : "Coba lagi."),
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setMessage({ type: "error", text: "Email tidak ditemukan." });
      return;
    }
    setMessage(null);
    setResending(true);
    try {
      const res = await fetch(resendUrl, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setMessage({ type: res.ok ? "success" : "error", text: data.message ?? "Gagal kirim ulang." });
      if (res.ok) {
        resetTimer();
      }
    } catch (err) {
      setMessage({
        type: "error",
        text: "Gagal mengirim ulang OTP: " + (err instanceof Error ? err.message : "Coba lagi."),
      });
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
    if (v && idx === 5) inputsRef.current[5]?.blur();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    if (expired) return;
    const paste = e.clipboardData.getData("text").trim();
    if (!/^\d{6}$/.test(paste)) return;
    const digits = paste.split("");
    setOtpDigits(digits);
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

  if (!email && !message?.text) {
    return (
      <main className="otp-page">
        <div className="otp-container">
          <p className="otp-loading">Memuat...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="otp-page">
      <div className="otp-container">
        <div className="otp-card">
          <div className="otp-header">
            <h2 className="otp-title">Verifikasi Keamanan</h2>
            <p className="otp-subtitle">Kami telah mengirimkan kode OTP 6-digit ke email Anda</p>
          </div>

          <form onSubmit={handleVerify} className="otp-form">
            <div className="otp-field">
              <label htmlFor="email">Alamat Email</label>
              <input
                type="email"
                id="email"
                value={email}
                readOnly
                className="otp-input otp-input-email"
              />
            </div>

            <div className={`otp-timer ${expired ? "otp-timer-expired" : ""}`}>
              <p>Kode OTP akan kadaluarsa dalam <span id="countdown">{formatTime(timeLeft)}</span></p>
              {timeLeft <= 60 && timeLeft > 0 && (
                <p className="otp-timer-warning">⚠️ Waktu tersisa kurang dari 1 menit!</p>
              )}
              {expired && (
                <p className="otp-timer-expired-msg">❌ Kode OTP telah kadaluarsa! Silakan kirim ulang.</p>
              )}
            </div>

            <div className="otp-field">
              <label>Kode Verifikasi</label>
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
                    aria-label={`Digit OTP ${i + 1}`}
                  />
                ))}
              </div>
            </div>

            {message && (
              <div className={`otp-message ${message.type}`}>{message.text}</div>
            )}

            <button
              type="submit"
              className="otp-btn otp-btn-verify"
              disabled={submitting || expired || otp.length !== 6}
            >
              {submitting ? "Memverifikasi..." : "Verifikasi Sekarang"}
            </button>
          </form>

          <div className="otp-footer">
            <p>
              Tidak menerima kode?{" "}
              <button
                type="button"
                className="otp-resend"
                onClick={handleResend}
                disabled={resending || !expired}
              >
                {resending ? "Mengirim..." : "Kirim Ulang OTP"}
              </button>
            </p>
          </div>
        </div>

        <Link href="/daftar" className="otp-link-back">
          ← Kembali ke daftar
        </Link>
      </div>
    </main>
  );
}



