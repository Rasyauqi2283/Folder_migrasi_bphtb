"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";
import styles from "./GreetingCard.module.css";
import QuotaCalendar from "./QuotaCalendar";
import { getApiBase } from "../../lib/api";

export interface GreetingCardProps {
  /** Nama user untuk teks "Selamat Datang, {nama}" */
  nama?: string;
  /** Label halaman, e.g. "Administrator", "PPAT" */
  pageLabel?: string;
  /** Subtitle di bawah judul */
  subtitle?: string;
  /** Gender untuk memilih SVG: "Laki-laki" | "Perempuan". Default Laki-laki jika tidak terdeteksi. */
  gender?: string | null;
  /** Konten di sebelah kanan (e.g. CalendarWidget). Opsional. */
  rightContent?: ReactNode;
}

const SVG_LAKI = "/greeting_svg/design_verse_laki.svg";
const SVG_PEREMPUAN = "/greeting_svg/design_verse_perempuan.svg";

export default function GreetingCard({
  nama = "Pengguna",
  pageLabel = "",
  subtitle = "Ringkasan aktivitas dan statistik Anda",
  gender,
  rightContent,
}: GreetingCardProps) {
  const normalizedGender = useMemo(() => (typeof gender === "string" ? gender.trim().toLowerCase() : ""), [gender]);
  const isPerempuan = normalizedGender === "perempuan" || normalizedGender === "female";
  const isLakiLaki = normalizedGender === "laki-laki" || normalizedGender === "laki laki" || normalizedGender === "male";
  const [sapaan, setSapaan] = useState("Halo");
  const [billingReminder, setBillingReminder] = useState<null | { count: number; nearest_expires_at?: string }>(null);

  useEffect(() => {
    if (isPerempuan) {
      setSapaan("Halo, Bu");
      return;
    }
    if (isLakiLaki) {
      setSapaan("Halo, Pak");
      return;
    }
    setSapaan("Halo");
  }, [isLakiLaki, isPerempuan, normalizedGender]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${getApiBase()}/api/ppat/billing/pending`, { credentials: "include" });
        const j = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (res.ok && j?.success && typeof j?.count === "number" && j.count > 0) {
          setBillingReminder({ count: j.count, nearest_expires_at: typeof j.nearest_expires_at === "string" ? j.nearest_expires_at : undefined });
        } else {
          setBillingReminder(null);
        }
      } catch {
        if (!cancelled) setBillingReminder(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const svgSrc = isPerempuan ? SVG_PEREMPUAN : SVG_LAKI;
  const renderKey = `${nama}-${normalizedGender}-${pageLabel}`;
  const [defaultCalendarDate, setDefaultCalendarDate] = useState<Date>(() => new Date());
  const resolvedRightContent =
    rightContent != null ? rightContent : <QuotaCalendar value={defaultCalendarDate} onChange={setDefaultCalendarDate} />;

  return (
    <section key={renderKey} className={styles.card}>
      <div className={styles.left}>
        <div className={styles.copy}>
          <h2 className={styles.title}>
            {sapaan}{" "}
            <span className={styles.name}>{nama}</span>
            {pageLabel ? (
              <>
                {" "}
                dilaman{" "}
                <span className={styles.pageLabel}>{pageLabel}</span>
                .
              </>
            ) : (
              "."
            )}
          </h2>
          <h5 className={styles.subtitle}>{subtitle}</h5>
          {billingReminder && (
            <div style={{ marginTop: 10, padding: "10px 12px", borderRadius: 10, background: "rgba(245,158,11,0.14)", border: "1px solid rgba(245,158,11,0.35)", color: "#92400e", fontWeight: 700, fontSize: 13 }}>
              Anda memiliki <strong>{billingReminder.count}</strong> tagihan dengan status <strong>WAITING_FOR_PAYMENT</strong>.
              {billingReminder.nearest_expires_at ? ` Batas terdekat: ${new Date(billingReminder.nearest_expires_at).toLocaleString("id-ID")}.` : ""}
            </div>
          )}
        </div>
        <div className={styles.heroWrap}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={`hero-${renderKey}`}
            src={svgSrc}
            alt=""
            className={styles.heroImg}
          />
        </div>
      </div>
      <div className={styles.right}>{resolvedRightContent}</div>
    </section>
  );
}
