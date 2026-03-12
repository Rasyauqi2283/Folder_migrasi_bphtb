"use client";

import { ReactNode } from "react";
import styles from "./GreetingCard.module.css";

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
  const isPerempuan =
    typeof gender === "string" &&
    (gender.toLowerCase() === "perempuan" || gender.toLowerCase() === "female");
  const svgSrc = isPerempuan ? SVG_PEREMPUAN : SVG_LAKI;

  return (
    <section className={styles.card}>
      <div className={styles.left}>
        <div className={styles.copy}>
          <h2 className={styles.title}>
            Selamat Datang,{" "}
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
            src={svgSrc}
            alt=""
            className={styles.heroImg}
          />
        </div>
      </div>
      {rightContent != null ? <div className={styles.right}>{rightContent}</div> : null}
    </section>
  );
}
