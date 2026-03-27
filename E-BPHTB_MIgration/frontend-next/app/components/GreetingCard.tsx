"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";
import styles from "./GreetingCard.module.css";
import QuotaCalendar from "./QuotaCalendar";

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
