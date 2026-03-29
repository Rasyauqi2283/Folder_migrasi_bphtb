"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "../../../../context/AuthContext";
import { getApiBase } from "../../../../../lib/api";

export default function UnggahLaporanBulananPage() {
  const { refresh } = useAuth();
  const [tahun, setTahun] = useState(() => {
    const d = new Date();
    const p = new Date(d.getFullYear(), d.getMonth() - 1, 1);
    return String(p.getFullYear());
  });
  const [bulan, setBulan] = useState(() => {
    const d = new Date();
    const p = new Date(d.getFullYear(), d.getMonth() - 1, 1);
    return String(p.getMonth() + 1);
  });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    const y = parseInt(tahun, 10);
    const m = parseInt(bulan, 10);
    if (!Number.isFinite(y) || !Number.isFinite(m) || m < 1 || m > 12) {
      setMsg({ type: "err", text: "Periode tidak valid." });
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.set("tahun", String(y));
      fd.set("bulan", String(m));
      if (file) fd.set("dokumen", file);
      const res = await fetch(`${getApiBase()}/api/ppat/laporan-bulanan/submit`, {
        method: "POST",
        credentials: "include",
        body: fd,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsg({ type: "err", text: (data as { message?: string }).message ?? "Gagal mengunggah." });
        return;
      }
      if (typeof window !== "undefined") {
        localStorage.setItem("status_ppat", "aktif");
      }
      refresh();
      setMsg({ type: "ok", text: (data as { message?: string }).message ?? "Laporan tersimpan." });
      setFile(null);
    } catch {
      setMsg({ type: "err", text: "Gagal terhubung ke server." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 560, margin: "0 auto" }}>
      <h1 style={{ fontSize: 26, color: "var(--color_font_main)" }}>Unggah laporan bulanan</h1>
      <p style={{ color: "var(--color_font_muted)", marginBottom: 24 }}>
        Pilih periode aktivitas (bulan berjalan yang dilaporkan) dan lampirkan dokumen (PDF/disarankan). Setelah
        disimpan, status akun diaktifkan kembali.
      </p>
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <label style={{ fontWeight: 600 }}>Tahun</label>
          <input
            type="text"
            inputMode="numeric"
            maxLength={4}
            value={tahun}
            onChange={(e) => setTahun(e.target.value.replace(/\D/g, "").slice(0, 4))}
            style={{ display: "block", width: "100%", marginTop: 6, padding: 10, borderRadius: 8, border: "1px solid var(--border_color)" }}
          />
        </div>
        <div>
          <label style={{ fontWeight: 600 }}>Bulan aktivitas</label>
          <select
            value={bulan}
            onChange={(e) => setBulan(e.target.value)}
            style={{ display: "block", width: "100%", marginTop: 6, padding: 10, borderRadius: 8, border: "1px solid var(--border_color)" }}
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((b) => (
              <option key={b} value={b}>
                {["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"][b - 1]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label style={{ fontWeight: 600 }}>Dokumen (opsional)</label>
          <input
            type="file"
            accept="application/pdf,image/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            style={{ display: "block", marginTop: 6 }}
          />
        </div>
        {msg && (
          <div
            style={{
              padding: 12,
              borderRadius: 8,
              background: msg.type === "ok" ? "rgba(16,185,129,0.12)" : "#fef2f2",
              color: msg.type === "ok" ? "#047857" : "#b91c1c",
            }}
          >
            {msg.text}
          </div>
        )}
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "12px 20px",
            borderRadius: 10,
            border: "none",
            background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
            color: "#fff",
            fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Menyimpan…" : "Submit laporan"}
        </button>
      </form>
      <p style={{ marginTop: 24 }}>
        <Link href="/pu/laporan" style={{ color: "var(--accent)" }}>← Kembali ke Laporan PU</Link>
      </p>
    </div>
  );
}
