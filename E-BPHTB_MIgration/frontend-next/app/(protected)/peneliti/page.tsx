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

export default function PenelitiDashboardPage() {
  const { user } = useAuth();
  const [fromLtb = 0, setFromLtb] = useState<number | null>(null);
  const [tillVerif = 0, setTillVerif] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [res1, res2] = await Promise.all([
          fetch(`${getApiBase()}/api/peneliti_get-berkas-fromltb`, { credentials: "include" }).catch(() => null),
          fetch(`${getApiBase()}/api/peneliti/get-berkas-till-verif`, { credentials: "include" }).catch(() => null),
        ]);
        if (cancelled) return;
        const data1 = res1?.ok ? await res1.json().catch(() => ({})) : {};
        const data2 = res2?.ok ? await res2.json().catch(() => ({})) : {};
        const arr1 = Array.isArray(data1?.data) ? data1.data : [];
        const arr2 = Array.isArray(data2?.data) ? data2.data : [];
        setFromLtb(arr1.length);
        setTillVerif(arr2.length);
      } catch {
        if (!cancelled) {
          setFromLtb(0);
          setTillVerif(0);
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
        nama={user?.nama || user?.userid || "Peneliti"}
        pageLabel="Peneliti"
        subtitle="Verifikasi SSPD dan Kasie. Kelola berkas dari LTB dan berikan paraf."
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
          <Link href="/peneliti/verifikasi-sspd" style={CARD_STYLE}>
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
                📥
              </div>
              <span style={{ fontSize: 16, fontWeight: 600 }}>Berkas dari LTB</span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>{fromLtb ?? 0}</div>
            <p style={{ margin: 0, fontSize: 14, color: "var(--color_font_main_muted)" }}>
              Daftar berkas masuk untuk verifikasi SSPD
            </p>
            <span style={{ display: "inline-block", marginTop: 12, fontSize: 14, fontWeight: 600, color: "var(--accent)" }}>
              Verifikasi SSPD →
            </span>
          </Link>

          <Link href="/peneliti/paraf-kasie" style={CARD_STYLE}>
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
                  fontSize: 20,
                }}
              >
                ✍️
              </div>
              <span style={{ fontSize: 16, fontWeight: 600 }}>Berkas sampai Verif</span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>{tillVerif ?? 0}</div>
            <p style={{ margin: 0, fontSize: 14, color: "var(--color_font_main_muted)" }}>
              Berkas menunggu paraf Kasie
            </p>
            <span style={{ display: "inline-block", marginTop: 12, fontSize: 14, fontWeight: 600, color: "var(--accent)" }}>
              Kasie Verifikasi SSPD →
            </span>
          </Link>
        </div>
      )}
    </div>
  );
}
