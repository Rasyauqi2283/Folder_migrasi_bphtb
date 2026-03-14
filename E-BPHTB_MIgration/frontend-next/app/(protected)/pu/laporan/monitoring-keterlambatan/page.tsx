"use client";

export default function MonitoringKeterlambatanPage() {
  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      <h1 style={{ margin: "0 0 0.25rem", color: "var(--color_font_main)" }}>
        Monitoring Keterlambatan
      </h1>
      <p style={{ margin: 0, color: "var(--color_font_muted)", fontSize: "0.9rem", marginBottom: 20 }}>
        Monitoring keterlambatan dokumen PPAT — paritas dengan legacy <code>monitoring_keteralmbatan_dokumen_ppat.html</code>.
      </p>
      <div
        style={{
          padding: "2rem",
          background: "var(--card_bg)",
          borderRadius: 12,
          border: "1px solid var(--border_color)",
          color: "var(--color_font_muted)",
        }}
      >
        Di legacy, halaman ini kosong. Konten (filter, tabel, logika keterlambatan) akan diisi setelah requirement didefinisikan.
      </div>
    </div>
  );
}
