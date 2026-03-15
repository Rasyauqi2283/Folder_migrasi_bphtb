"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface DocItem {
  no_validasi?: string;
  nobooking?: string;
  status?: string;
  [key: string]: unknown;
}

export default function PenelitiValidasiValidasiOnlinePage() {
  const [docs, setDocs] = useState<DocItem[]>([]);
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
        const list = (json as { documents?: DocItem[] }).documents ?? (json as { data?: DocItem[] }).data ?? [];
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
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <h2 style={{ marginBottom: 20, fontSize: 24, fontWeight: 700 }}>Validasi Berkas SSPD Online</h2>
      <p style={{ marginBottom: 20, color: "var(--color_font_main_muted)" }}>
        Daftar dokumen untuk validasi. Untuk alur lengkap (claim, prepare, verify, decision, TTE) gunakan halaman legacy jika diperlukan.
      </p>
      {loading ? (
        <p>Memuat...</p>
      ) : error ? (
        <p style={{ color: "#ef4444" }}>{error}</p>
      ) : docs.length === 0 ? (
        <p style={{ color: "var(--color_font_main_muted)" }}>Tidak ada dokumen monitoring.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {docs.slice(0, 50).map((d) => (
            <div
              key={d.no_validasi ?? d.nobooking ?? ""}
              style={{
                padding: 16,
                background: "var(--card_bg)",
                border: "1px solid var(--border_color)",
                borderRadius: 12,
              }}
            >
              <strong>No. Validasi:</strong> {d.no_validasi ?? "-"} | <strong>No. Booking:</strong> {d.nobooking ?? "-"} | <strong>Status:</strong> {d.status ?? "-"}
            </div>
          ))}
          {docs.length > 50 && <p style={{ color: "var(--color_font_main_muted)" }}>... dan {docs.length - 50} lainnya</p>}
        </div>
      )}
      <p style={{ marginTop: 24 }}>
        <a href="/html_folder/ParafP/Verifikasi_SSPD/Validasi_berkas_online.html" target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)" }}>
          Buka halaman legacy Validasi Berkas Online (jendela baru) →
        </a>
      </p>
      <p style={{ marginTop: 12 }}>
        <Link href="/peneliti-validasi" style={{ color: "var(--accent)" }}>← Kembali ke Dashboard</Link>
      </p>
    </div>
  );
}
