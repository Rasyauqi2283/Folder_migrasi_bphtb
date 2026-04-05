"use client";

import { useId } from "react";
import RasproLogo from "./RasproLogo";

export default function Footer() {
  const waveGradId1 = useId();
  const waveGradId2 = useId();

  const waveStrip = (gradId: string) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 800 80"
      preserveAspectRatio="none"
      style={{ width: "100%", height: "100%", display: "block", flexShrink: 0 }}
    >
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(255,255,255,0)" />
          <stop offset="40%" stopColor="rgba(255,255,255,0.05)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.1)" />
        </linearGradient>
      </defs>
      <path fill={`url(#${gradId})`} d="M0,80 L0,48 Q100,24 200,48 T400,48 Q500,24 600,48 T800,48 L800,80 L0,80 Z" />
      <path fill={`url(#${gradId})`} opacity={0.6} d="M0,80 L0,58 Q100,42 200,58 T400,58 Q500,42 600,58 T800,58 L800,80 L0,80 Z" />
    </svg>
  );

  return (
    <footer
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: 40,
        background: "linear-gradient(90deg, var(--footer_teal) 0%, var(--footer_royal) 50%, var(--footer_purple) 100%)",
        borderTop: "1px solid var(--border_light)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--color_font_muted)",
        fontSize: 13,
        zIndex: 50,
        boxShadow: "0 -4px 24px rgba(0,116,154,0.25), 0 -2px 12px rgba(38,0,154,0.2)",
        overflow: "hidden",
      }}
    >
      <div className="footer-wave-track" aria-hidden>
        <div className="footer-wave-strip">{waveStrip(waveGradId1)}</div>
        <div className="footer-wave-strip footer-wave-strip--slow">{waveStrip(waveGradId2)}</div>
      </div>
      <p style={{ margin: 0, position: "relative", zIndex: 1 }}>© 2026 BAPPENDA | Kabupaten Bogor</p>

      <div
        className="app-footer-right"
        style={{
          position: "absolute",
          right: 14,
          bottom: 8,
          zIndex: 2,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "flex-end",
          pointerEvents: "auto",
        }}
      >
        <RasproLogo size="sm" theme="dark" asLink hrefExternal />
      </div>
    </footer>
  );
}
