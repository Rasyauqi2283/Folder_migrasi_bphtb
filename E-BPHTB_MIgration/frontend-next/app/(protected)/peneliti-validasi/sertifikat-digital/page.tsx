"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface CertItem {
  serial_number?: string;
  subject?: string;
  status?: string;
  [key: string]: unknown;
}

export default function PenelitiValidasiSertifikatDigitalPage() {
  const [certs, setCerts] = useState<CertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/pv/cert/list", { credentials: "include" });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError((json as { message?: string }).message || "Gagal memuat");
          setCerts([]);
          return;
        }
        const list = (json as { certs?: CertItem[] }).certs ?? (json as { list?: CertItem[] }).list ?? [];
        if (!cancelled) setCerts(Array.isArray(list) ? list : []);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Gagal memuat");
          setCerts([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <h2 style={{ marginBottom: 20, fontSize: 24, fontWeight: 700 }}>Sertifikat Digital</h2>
      <p style={{ marginBottom: 20, color: "var(--color_font_main_muted)" }}>
        Daftar sertifikat digital. Issue dan revoke dapat dilakukan di halaman legacy.
      </p>
      {loading ? (
        <p>Memuat...</p>
      ) : error ? (
        <p style={{ color: "#ef4444" }}>{error}</p>
      ) : certs.length === 0 ? (
        <p style={{ color: "var(--color_font_main_muted)" }}>Tidak ada sertifikat.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {certs.map((c) => (
            <div
              key={c.serial_number ?? ""}
              style={{
                padding: 16,
                background: "var(--card_bg)",
                border: "1px solid var(--border_color)",
                borderRadius: 12,
              }}
            >
              <strong>Serial:</strong> {c.serial_number ?? "-"} | <strong>Subject:</strong> {c.subject ?? "-"} | <strong>Status:</strong> {c.status ?? "-"}
            </div>
          ))}
        </div>
      )}
      <p style={{ marginTop: 24 }}>
        <a href="/html_folder/ParafP/Sinkronisasi_validasi/Sertifikat_digital.html" target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)" }}>
          Buka halaman legacy Sertifikat Digital (issue/revoke) →
        </a>
      </p>
      <p style={{ marginTop: 12 }}>
        <Link href="/peneliti-validasi" style={{ color: "var(--accent)" }}>← Kembali ke Dashboard</Link>
      </p>
    </div>
  );
}
