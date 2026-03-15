"use client";

import { useAuth } from "../../context/AuthContext";
import Link from "next/link";
import { useState, useEffect } from "react";
import GreetingCard from "../../components/GreetingCard";
import { getApiBase } from "../../../lib/api";

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

export default function LSBDashboardPage() {
  const { user } = useAuth();
  const [berkasCount = 0, setBerkasCount] = useState<number | null>(null);
  const [monitoringMonths = 0, setMonitoringMonths] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [r1, r2] = await Promise.all([
          fetch(`${getApiBase()}/api/LSB_berkas-complete`, { credentials: "include" }).catch(() => null),
          fetch(`${getApiBase()}/api/LSB_monitoring-penyerahan`, { credentials: "include" }).catch(() => null),
        ]);
        if (cancelled) return;
        const d1 = r1?.ok ? await r1.json().catch(() => ({})) : {};
        const d2 = r2?.ok ? await r2.json().catch(() => ({})) : {};
        setBerkasCount(Array.isArray(d1?.data) ? d1.data.length : 0);
        setMonitoringMonths(Array.isArray(d2?.months) ? d2.months.length : 0);
      } catch {
        if (!cancelled) {
          setBerkasCount(0);
          setMonitoringMonths(0);
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
        nama={user?.nama || user?.userid || "LSB"}
        pageLabel="LSB"
        subtitle="Pelayanan penyerahan SSPD. Kelola berkas complete dan monitoring penyerahan."
        gender={user?.gender ?? undefined}
      />

      {loading ? (
        <p style={{ marginTop: 24, color: "var(--color_font_main_muted)" }}>Memuat ringkasan...</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 20,
            marginTop: 24,
          }}
        >
          <Link href="/lsb/pelayanan-penyerahan-sspd" style={CARD_STYLE}>
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
                  fontSize: 20,
                }}
              >
                📤
              </div>
              <span style={{ fontSize: 16, fontWeight: 600 }}>Berkas Complete</span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>{berkasCount ?? 0}</div>
            <p style={{ margin: 0, fontSize: 14, color: "var(--color_font_main_muted)" }}>
              Pelayanan penyerahan SSPD
            </p>
            <span style={{ display: "inline-block", marginTop: 12, fontSize: 14, fontWeight: 600, color: "var(--accent)" }}>
              Buka →
            </span>
          </Link>

          <Link href="/lsb/monitoring-penyerahan" style={CARD_STYLE}>
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
                  fontSize: 20,
                }}
              >
                📋
              </div>
              <span style={{ fontSize: 16, fontWeight: 600 }}>Monitoring</span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>{monitoringMonths ?? 0}</div>
            <p style={{ margin: 0, fontSize: 14, color: "var(--color_font_main_muted)" }}>
              Bulan dengan data penyerahan
            </p>
            <span style={{ display: "inline-block", marginTop: 12, fontSize: 14, fontWeight: 600, color: "var(--accent)" }}>
              Monitoring Penyerahan →
            </span>
          </Link>
        </div>
      )}
    </div>
  );
}
