"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface MonthItem {
  bulan?: string;
  tahun?: string;
  label?: string;
  count?: number;
  [key: string]: unknown;
}

export default function LSBMonitoringPenyerahanPage() {
  const [months, setMonths] = useState<MonthItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/LSB_monitoring-penyerahan", { credentials: "include" });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError((json as { message?: string }).message || "Gagal memuat");
          setMonths([]);
          return;
        }
        if (!(json as { success?: boolean }).success) {
          setError((json as { message?: string }).message || "Gagal memuat");
          setMonths([]);
          return;
        }
        const list = (json as { months?: MonthItem[] }).months ?? [];
        if (!cancelled) setMonths(Array.isArray(list) ? list : []);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Gagal memuat");
          setMonths([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <h2 style={{ marginBottom: 20, fontSize: 24, fontWeight: 700 }}>Monitoring Penyerahan SSPD</h2>
      {loading ? (
        <p>Memuat...</p>
      ) : error ? (
        <p style={{ color: "#ef4444" }}>{error}</p>
      ) : months.length === 0 ? (
        <p style={{ color: "var(--color_font_main_muted)" }}>Tidak ada data monitoring.</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: 16,
          }}
        >
          {months.map((m, i) => (
            <div
              key={m.label ?? m.bulan ?? i}
              style={{
                padding: 16,
                background: "var(--card_bg)",
                border: "1px solid var(--border_color)",
                borderRadius: 12,
              }}
            >
              <div style={{ fontWeight: 600 }}>{(m.label ?? `${m.bulan ?? ""} ${m.tahun ?? ""}`.trim()) || "-"}</div>
              {typeof m.count === "number" && <div style={{ marginTop: 8, color: "var(--color_font_main_muted)" }}>{m.count} dokumen</div>}
            </div>
          ))}
        </div>
      )}
      <p style={{ marginTop: 24 }}>
        <Link href="/lsb" style={{ color: "var(--accent)" }}>← Kembali ke Dashboard LSB</Link>
      </p>
    </div>
  );
}

