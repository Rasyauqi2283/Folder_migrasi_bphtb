"use client";

import { useAuth } from "../../context/AuthContext";
import Link from "next/link";
import { useState, useEffect } from "react";
import GreetingCard from "../../components/GreetingCard";

const CARD_STYLE: React.CSSProperties = {
  background: "var(--card_bg)",
  border: "1px solid var(--border_color)",
  borderRadius: 12,
  padding: 24,
  boxShadow: "var(--card_shadow)",
  textDecoration: "none",
  color: "var(--color_font_main)",
  borderLeft: "4px solid var(--accent)",
  display: "block",
};

export default function PenelitiValidasiDashboardPage() {
  const { user } = useAuth();
  const [tillVerif = 0, setTillVerif] = useState<number | null>(null);
  const [monitoringCount = 0, setMonitoringCount] = useState<number | null>(null);
  const [certCount = 0, setCertCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [r1, r2, r3] = await Promise.all([
          fetch("/api/peneliti/get-berkas-till-verif", { credentials: "include" }).catch(() => null),
          fetch("/api/paraf/get-monitoring-documents", { credentials: "include" }).catch(() => null),
          fetch("/api/pv/cert/list", { credentials: "include" }).catch(() => null),
        ]);
        if (cancelled) return;
        const d1 = r1?.ok ? await r1.json().catch(() => ({})) : {};
        const d2 = r2?.ok ? await r2.json().catch(() => ({})) : {};
        const d3 = r3?.ok ? await r3.json().catch(() => ({})) : {};
        setTillVerif(Array.isArray(d1?.data) ? d1.data.length : 0);
        setMonitoringCount(Array.isArray(d2?.documents) ? d2.documents.length : Array.isArray(d2?.data) ? d2.data.length : 0);
        setCertCount(Array.isArray(d3?.certs) ? d3.certs.length : Array.isArray(d3?.list) ? d3.list.length : 0);
      } catch {
        if (!cancelled) {
          setTillVerif(0);
          setMonitoringCount(0);
          setCertCount(0);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto" }}>
      <GreetingCard
        nama={user?.nama || user?.userid || "Peneliti Validasi"}
        pageLabel="Peneliti Validasi"
        subtitle="Validasi berkas SSPD, sertifikat digital, dan monitoring."
        gender={user?.gender ?? undefined}
      />

      {loading ? (
        <p style={{ marginTop: 24, color: "var(--color_font_main_muted)" }}>Memuat ringkasan...</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 20,
            marginTop: 24,
          }}
        >
          <Link href="/peneliti-validasi/validasi-online" style={CARD_STYLE}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: "linear-gradient(135deg, var(--accent_hover) 0%, var(--accent) 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                }}
              >
                ✓
              </div>
              <span style={{ fontSize: 16, fontWeight: 600 }}>Berkas till Verif</span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>{tillVerif ?? 0}</div>
            <p style={{ margin: 0, fontSize: 14, color: "var(--color_font_main_muted)" }}>
              Validasi Berkas SSPD Online
            </p>
            <span style={{ display: "inline-block", marginTop: 12, fontSize: 14, fontWeight: 600, color: "var(--accent)" }}>
              Buka →
            </span>
          </Link>

          <Link href="/peneliti-validasi/monitoring-verifikasi" style={CARD_STYLE}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                }}
              >
                📋
              </div>
              <span style={{ fontSize: 16, fontWeight: 600 }}>Monitoring</span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>{monitoringCount ?? 0}</div>
            <p style={{ margin: 0, fontSize: 14, color: "var(--color_font_main_muted)" }}>
              Dokumen monitoring verifikasi
            </p>
            <span style={{ display: "inline-block", marginTop: 12, fontSize: 14, fontWeight: 600, color: "var(--accent)" }}>
              Monitoring Verifikasi →
            </span>
          </Link>

          <Link href="/peneliti-validasi/sertifikat-digital" style={CARD_STYLE}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                }}
              >
                🔐
              </div>
              <span style={{ fontSize: 16, fontWeight: 600 }}>Sertifikat</span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>{certCount ?? 0}</div>
            <p style={{ margin: 0, fontSize: 14, color: "var(--color_font_main_muted)" }}>
              Sertifikat digital
            </p>
            <span style={{ display: "inline-block", marginTop: 12, fontSize: 14, fontWeight: 600, color: "var(--accent)" }}>
              Sertifikat Digital →
            </span>
          </Link>
        </div>
      )}
    </div>
  );
}
