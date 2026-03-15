"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface LSBItem {
  nobooking?: string;
  no_registrasi?: string;
  nama?: string;
  [key: string]: unknown;
}

export default function LSBPelayananPenyerahanSspdPage() {
  const [data, setData] = useState<LSBItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/LSB_berkas-complete", { credentials: "include" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((json as { message?: string }).message || `HTTP ${res.status}`);
      if (!(json as { success?: boolean }).success) throw new Error((json as { message?: string }).message || "Gagal memuat");
      setData(Array.isArray((json as { data?: LSBItem[] }).data) ? (json as { data: LSBItem[] }).data : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat data");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const sendToPpat = async (nobooking: string) => {
    setActionLoading(nobooking);
    try {
      const res = await fetch("/api/LSB_send-to-ppat", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nobooking }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((json as { message?: string }).message || "Gagal kirim");
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Gagal kirim ke PPAT");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto" }}>
      <h2 style={{ marginBottom: 20, fontSize: 24, fontWeight: 700 }}>Pelayanan Penyerahan SSPD</h2>
      {loading ? (
        <p>Memuat...</p>
      ) : error ? (
        <p style={{ color: "#ef4444" }}>{error}</p>
      ) : data.length === 0 ? (
        <p style={{ color: "var(--color_font_main_muted)" }}>Tidak ada berkas complete.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {data.map((r) => (
            <div
              key={r.nobooking ?? ""}
              style={{
                padding: 16,
                background: "var(--card_bg)",
                border: "1px solid var(--border_color)",
                borderRadius: 12,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 12,
              }}
            >
              <div>
                <strong>No. Booking:</strong> {r.nobooking ?? "-"} | <strong>No. Registrasi:</strong> {r.no_registrasi ?? "-"} | <strong>Nama:</strong> {r.nama ?? "-"}
              </div>
              <button
                type="button"
                disabled={!!actionLoading}
                onClick={() => sendToPpat(r.nobooking!)}
                style={{
                  padding: "8px 16px",
                  borderRadius: 8,
                  border: "none",
                  background: "#10b981",
                  color: "white",
                  fontWeight: 600,
                  cursor: actionLoading ? "not-allowed" : "pointer",
                }}
              >
                {actionLoading === r.nobooking ? "..." : "Kirim ke PPAT"}
              </button>
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
