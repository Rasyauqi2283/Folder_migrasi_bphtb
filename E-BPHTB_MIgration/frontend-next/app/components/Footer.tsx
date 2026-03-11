"use client";

export default function Footer() {
  return (
    <footer
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: 40,
        background: "linear-gradient(90deg, var(--footer_teal) 0%, var(--footer_royal) 50%, var(--footer_purple) 100%)",
        borderTop: `1px solid var(--border_light)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--color_font_muted)",
        fontSize: 13,
        zIndex: 50,
        boxShadow: "0 -4px 24px rgba(0,116,154,0.25), 0 -2px 12px rgba(38,0,154,0.2)",
      }}
    >
      <p style={{ margin: 0 }}>© 2025 Pemerintah Kabupaten Bogor – BAPPENDA</p>
    </footer>
  );
}
