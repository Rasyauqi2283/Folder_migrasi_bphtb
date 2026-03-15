"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface MonItem {
  no_validasi?: string;
  nobooking?: string;
  status?: string;
  [key: string]: unknown;
}

export default function PenelitiValidasiMonitoringSkpdKurangPage() {
  const [docs, setDocs] = useState<MonItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/paraf/get-monitoring-documents", { credentials: "include" });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError((json as { message?: string }).message || "Gagal memuat");
          setDocs([]);
          return;
        }
        const list = (json as { documents?: MonItem[] }).documents ?? (json as { data?: MonItem[] }).data ?? [];
        if (!cancelled) setDocs(Array.isArray(list) ? list : []);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Gagal memuat");
          setDocs([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto" }}>
      <h2 style={{ marginBottom: 20, fontSize: 24, fontWeight: 700 }}>Monitoring SKPD Kurang Bayar</h2>
      <p style={{ marginBottom: 16, color: "var(--color_font_main_muted)" }}>
        Dokumen terkait SKPD Kurang Bayar. Detail lengkap dapat dilihat di halaman legacy.
      </p>
      {loading ? (
        <p>Memuat...</p>
      ) : error ? (
        <p style={{ color: "#ef4444" }}>{error}</p>
      ) : docs.length === 0 ? (
        <p style={{ color: "var(--color_font_main_muted)" }}>Tidak ada dokumen.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--border_color)" }}>
                <th style={{ padding: 12, textAlign: "left" }}>No. Validasi</th>
                <th style={{ padding: 12, textAlign: "left" }}>No. Booking</th>
                <th style={{ padding: 12, textAlign: "left" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {docs.map((d) => (
                <tr key={d.no_validasi ?? d.nobooking ?? ""} style={{ borderBottom: "1px solid var(--border_color)" }}>
                  <td style={{ padding: 12 }}>{d.no_validasi ?? "-"}</td>
                  <td style={{ padding: 12 }}>{d.nobooking ?? "-"}</td>
                  <td style={{ padding: 12 }}>{d.status ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p style={{ marginTop: 24 }}>
        <a href="/html_folder/ParafP/Monitoring/monitoring_skpd_kurang.html" target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)" }}>
          Buka halaman legacy Monitoring SKPD Kurang Bayar →
        </a>
      </p>
      <p style={{ marginTop: 12 }}>
        <Link href="/peneliti-validasi" style={{ color: "var(--accent)" }}>← Kembali ke Dashboard</Link>
      </p>
    </div>
  );
}
