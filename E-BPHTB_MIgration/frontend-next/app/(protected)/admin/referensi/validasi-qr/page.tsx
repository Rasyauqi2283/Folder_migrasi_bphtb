"use client";

import { useState } from "react";
import Link from "next/link";

export default function AdminValidasiQrPage() {
  const [noValidasi, setNoValidasi] = useState("");
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    const v = noValidasi.trim();
    if (!v) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(
        `/api/admin/validate-qr/${encodeURIComponent(v)}`,
        { credentials: "include" }
      );
      const data = await res.json().catch(() => ({}));
      setResult({ ok: res.ok, status: res.status, ...data });
    } catch {
      setResult({ ok: false, error: "Network error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 style={{ color: "#fff", margin: "0 0 0.5rem" }}>Validasi QR</h1>
      <p style={{ color: "rgba(255,255,255,0.7)", margin: "0 0 1rem" }}>
        Cek validasi berdasarkan nomor validasi
      </p>
      <div style={{ marginBottom: 16 }}>
        <input
          type="text"
          value={noValidasi}
          onChange={(e) => setNoValidasi(e.target.value)}
          placeholder="Nomor validasi"
          style={{
            padding: "8px 12px",
            borderRadius: 6,
            border: "1px solid rgba(65,90,119,0.5)",
            background: "#1b263b",
            color: "#fff",
            marginRight: 8,
            minWidth: 200,
          }}
        />
        <button
          type="button"
          onClick={handleSearch}
          disabled={loading}
          style={{
            padding: "8px 16px",
            background: loading ? "#6b7280" : "#3b82f6",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            cursor: loading ? "wait" : "pointer",
          }}
        >
          {loading ? "Memeriksa..." : "Cek"}
        </button>
      </div>
      {result && (
        <pre
          style={{
            background: "#1b263b",
            padding: 12,
            borderRadius: 8,
            overflow: "auto",
            fontSize: 12,
            color: "rgba(255,255,255,0.9)",
          }}
        >
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
      <p style={{ marginTop: "1rem" }}>
        <Link
          href="/html_folder/Admin/referensi_user/admin-validasi-qr.html"
          style={{ color: "#60a5fa", textDecoration: "none" }}
        >
          Buka versi legacy (fitur lengkap) →
        </Link>
      </p>
    </div>
  );
}
