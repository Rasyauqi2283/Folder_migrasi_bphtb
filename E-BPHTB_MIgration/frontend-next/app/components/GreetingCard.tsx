"use client";

import { ReactNode } from "react";

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
    <section
      style={{
        background: "var(--card_bg)",
        border: "1px solid var(--card_border)",
        borderRadius: 12,
        padding: "24px 28px",
        marginBottom: 24,
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 28,
        boxShadow: "var(--card_shadow)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 28,
          flex: "1 1 auto",
          minWidth: 0,
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: "1.35rem",
              color: "var(--color_font_main)",
              fontWeight: 600,
            }}
          >
            Selamat Datang,{" "}
            <span style={{ color: "var(--accent)" }}>{nama}</span>
            {pageLabel ? (
              <>
                {" "}
                dilaman{" "}
                <span style={{ color: "var(--color_font_main_muted)" }}>
                  {pageLabel}
                </span>
                .
              </>
            ) : (
              "."
            )}
          </h2>
          <h5
            style={{
              margin: "8px 0 0",
              fontSize: "0.95rem",
              color: "var(--color_font_main_muted)",
              fontWeight: 400,
            }}
          >
            {subtitle}
          </h5>
        </div>
        <div
          style={{
            width: 320,
            height: 280,
            borderRadius: 12,
            overflow: "hidden",
            background: "transparent",
            flexShrink: 0,
            pointerEvents: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={svgSrc}
            alt=""
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              objectPosition: "center center",
            }}
          />
        </div>
      </div>
      {rightContent != null ? rightContent : null}
    </section>
  );
}
