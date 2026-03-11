"use client";

import Image from "next/image";
import Link from "next/link";
import AnimatedO from "./AnimatedO";

const LOGO_SRC = "/asset/Logo_sebenarnya.png";

type Size = "sm" | "md" | "lg";

const sizeMap = {
  sm: { img: 24, text: "raspro-size-sm" },
  md: { img: 36, text: "raspro-size-md" },
  lg: { img: 48, text: "raspro-size-lg" },
};

interface RasproLogoProps {
  size?: Size;
  theme?: "dark" | "light" | "inherit";
  asLink?: boolean;
  hrefExternal?: boolean;
  className?: string;
}

export default function RasproLogo({
  size = "md",
  theme = "dark",
  asLink = false,
  hrefExternal = false,
  className = "",
}: RasproLogoProps) {
  const { img, text } = sizeMap[size];
  const textColor = theme === "dark" ? "raspro-theme-dark" : theme === "light" ? "raspro-theme-light" : "";

  const content = (
    <>
      <Image
        src={LOGO_SRC}
        alt=""
        width={img}
        height={img}
        className="shrink-0 object-contain"
        style={{ flexShrink: 0, objectFit: "contain" }}
        aria-hidden
      />
      <span className={`raspro-text ${text} ${textColor}`}>
        Rasya{" "}
        <span className="raspro-accent">
          Pr
          <AnimatedO />
          ducti
          <AnimatedO />
          n
        </span>
      </span>
    </>
  );

  const wrapClass = `raspro-wrap ${className}`.trim();

  if (asLink) {
    if (hrefExternal) {
      return (
        <a
          href="https://raspro.online"
          target="_blank"
          rel="noopener noreferrer"
          className={wrapClass}
          aria-label="Rasya Production — raspro.online"
        >
          {content}
        </a>
      );
    }
    return (
      <Link href="/" className={wrapClass} aria-label="Rasya Production — Beranda">
        {content}
      </Link>
    );
  }

  return <span className={wrapClass}>{content}</span>;
}
