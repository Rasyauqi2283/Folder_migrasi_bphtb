"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getApiBase } from "../../lib/api";

type DownPayload = {
  success: false;
  online: false;
  message: string;
  scheduled_at?: string;
  eta_done_at?: string;
  open_at?: string;
  reason?: string;
  server_time?: string;
};

function fmtIdDateTime(iso?: string) {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleString("id-ID", { dateStyle: "full", timeStyle: "short" });
  } catch {
    return iso;
  }
}

export default function MaintenancePage() {
  const base = getApiBase();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [down, setDown] = useState<DownPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${base}/api/system/status`, { cache: "no-store", credentials: "include" });
      const json = (await res.json().catch(() => null)) as any;

      if (res.ok && json?.online === true) {
        router.replace("/");
        return;
      }

      if (res.status === 503 && json?.online === false && typeof json?.message === "string") {
        setDown(json as DownPayload);
        return;
      }

      setError("Tidak bisa membaca status sistem. Silakan coba lagi.");
    } catch {
      setError("Koneksi gagal. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  }, [base, router]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const eta = useMemo(() => fmtIdDateTime(down?.eta_done_at), [down?.eta_done_at]);
  const openAt = useMemo(() => fmtIdDateTime(down?.open_at), [down?.open_at]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: 24,
        background:
          "radial-gradient(1000px 600px at 20% 20%, rgba(239,68,68,0.18), transparent 55%), radial-gradient(900px 520px at 80% 30%, rgba(14,165,233,0.16), transparent 55%), linear-gradient(180deg, #0b1220 0%, #070b13 100%)",
        color: "#e5e7eb",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 780,
          borderRadius: 16,
          border: "1px solid rgba(148,163,184,0.18)",
          background: "rgba(2,6,23,0.6)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
          padding: 22,
        }}
      >
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 12, letterSpacing: 1.2, textTransform: "uppercase", color: "#93c5fd", fontWeight: 800 }}>
              E-BPHTB
            </div>
            <h1 style={{ margin: "6px 0 8px", fontSize: 28, lineHeight: 1.2 }}>Sistem sedang tidak tersedia</h1>
            <p style={{ margin: 0, color: "rgba(226,232,240,0.85)", fontSize: 14 }}>
              Kami sedang melakukan pemeliharaan atau sistem berada di luar jam operasional.
            </p>
          </div>
          <button
            type="button"
            onClick={refresh}
            disabled={loading}
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid rgba(148,163,184,0.25)",
              background: loading ? "rgba(148,163,184,0.12)" : "rgba(14,165,233,0.18)",
              color: "#e5e7eb",
              fontWeight: 800,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Memeriksa…" : "Coba lagi"}
          </button>
        </div>

        <div
          style={{
            marginTop: 18,
            padding: 14,
            borderRadius: 12,
            border: "1px solid rgba(239,68,68,0.28)",
            background: "rgba(239,68,68,0.10)",
          }}
        >
          <div style={{ fontWeight: 900, marginBottom: 6, color: "#fecaca" }}>Info</div>
          <div style={{ color: "rgba(226,232,240,0.95)", whiteSpace: "pre-wrap" }}>
            {down?.message ?? "Sedang memuat informasi…"}
          </div>
          {eta && <div style={{ marginTop: 10, color: "rgba(226,232,240,0.9)" }}>Perkiraan selesai: {eta}</div>}
          {openAt && <div style={{ marginTop: 6, color: "rgba(226,232,240,0.9)" }}>Jam aktif kembali: {openAt}</div>}
          {error && <div style={{ marginTop: 10, color: "#fde68a", fontWeight: 800 }}>{error}</div>}
        </div>

        <div style={{ marginTop: 16, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => router.replace("/")}
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid rgba(148,163,184,0.25)",
              background: "rgba(148,163,184,0.08)",
              color: "#e5e7eb",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            Kembali ke Beranda
          </button>
          <a
            href="mailto:support@bappenda.go.id"
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid rgba(148,163,184,0.25)",
              background: "rgba(16,185,129,0.12)",
              color: "#e5e7eb",
              fontWeight: 800,
              textDecoration: "none",
            }}
          >
            Hubungi bantuan
          </a>
        </div>
      </div>
    </div>
  );
}

