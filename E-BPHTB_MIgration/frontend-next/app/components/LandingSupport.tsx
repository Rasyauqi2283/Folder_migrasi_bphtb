"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import styles from "../landing-stripe.module.css";

type FormValues = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

export default function LandingSupport() {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [doneTicket, setDoneTicket] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: { name: "", email: "", subject: "", message: "" },
  });

  const onSubmit = async (data: FormValues) => {
    setSubmitting(true);
    setFormError(null);
    setDoneTicket(null);
    try {
      const res = await fetch("/api/public/support/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name.trim(),
          email: data.email.trim(),
          subject: data.subject.trim(),
          message: data.message.trim(),
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setFormError(typeof json?.message === "string" ? json.message : "Gagal mengirim. Coba lagi.");
        return;
      }
      if (json?.ticket_id) {
        setDoneTicket(String(json.ticket_id));
        reset();
      } else {
        setFormError("Respons tidak lengkap.");
      }
    } catch {
      setFormError("Koneksi gagal. Periksa jaringan Anda.");
    } finally {
      setSubmitting(false);
    }
  };

  const close = () => {
    setOpen(false);
    setDoneTicket(null);
    setFormError(null);
  };

  return (
    <>
      <button
        type="button"
        className={styles.supportFab}
        onClick={() => {
          setOpen(true);
          setDoneTicket(null);
          setFormError(null);
        }}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        Ada masalah? Hubungi kami
      </button>

      {open && (
        <div
          className={styles.supportBackdrop}
          role="presentation"
          onClick={(e) => e.target === e.currentTarget && close()}
        >
          <div className={styles.supportModal} role="dialog" aria-modal="true" aria-labelledby="support-title">
            <div className={styles.supportModalHeader}>
              <h2 id="support-title" className={styles.supportModalTitle}>
                Bantuan &amp; keluhan
              </h2>
              <button type="button" className={styles.supportClose} onClick={close} aria-label="Tutup">
                ×
              </button>
            </div>
            <p className={styles.supportLead}>
              Jelaskan kendala Anda. Tim kami akan merespons melalui email. Anda akan menerima nomor tiket untuk referensi.
            </p>

            {doneTicket ? (
              <div className={styles.supportSuccess}>
                <p>
                  <strong>Tiket berhasil dibuat.</strong>
                </p>
                <p>
                  Nomor tiket Anda: <code className={styles.supportTicketCode}>{doneTicket}</code>
                </p>
                <p className={styles.supportMuted}>Periksa kotak masuk email (dan folder spam) untuk konfirmasi.</p>
                <button type="button" className={styles.supportPrimaryBtn} onClick={close}>
                  Tutup
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className={styles.supportForm} noValidate>
                {formError && <div className={styles.supportErrorBanner}>{formError}</div>}
                <label className={styles.supportLabel}>
                  Nama
                  <input
                    type="text"
                    autoComplete="name"
                    className={styles.supportInput}
                    {...register("name", { required: "Nama wajib diisi", minLength: { value: 2, message: "Minimal 2 karakter" } })}
                  />
                  {errors.name && <span className={styles.supportFieldError}>{errors.name.message}</span>}
                </label>
                <label className={styles.supportLabel}>
                  Email
                  <input
                    type="email"
                    autoComplete="email"
                    className={styles.supportInput}
                    {...register("email", {
                      required: "Email wajib diisi",
                      pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Format email tidak valid" },
                    })}
                  />
                  {errors.email && <span className={styles.supportFieldError}>{errors.email.message}</span>}
                </label>
                <label className={styles.supportLabel}>
                  Subjek
                  <input
                    type="text"
                    className={styles.supportInput}
                    {...register("subject", { required: "Subjek wajib diisi", minLength: { value: 3, message: "Minimal 3 karakter" } })}
                  />
                  {errors.subject && <span className={styles.supportFieldError}>{errors.subject.message}</span>}
                </label>
                <label className={styles.supportLabel}>
                  Deskripsi masalah
                  <textarea
                    rows={5}
                    className={styles.supportTextarea}
                    placeholder="Jelaskan langkah yang sudah Anda coba dan apa yang terjadi."
                    {...register("message", {
                      required: "Deskripsi wajib diisi",
                      minLength: { value: 10, message: "Minimal 10 karakter agar kami bisa membantu" },
                    })}
                  />
                  {errors.message && <span className={styles.supportFieldError}>{errors.message.message}</span>}
                </label>
                <div className={styles.supportActions}>
                  <button type="button" className={styles.supportSecondaryBtn} onClick={close} disabled={submitting}>
                    Batal
                  </button>
                  <button type="submit" className={styles.supportPrimaryBtn} disabled={submitting}>
                    {submitting ? "Mengirim…" : "Kirim tiket"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
