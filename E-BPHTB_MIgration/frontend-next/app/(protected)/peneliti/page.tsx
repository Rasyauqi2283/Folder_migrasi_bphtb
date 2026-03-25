"use client";

import { useAuth } from "../../context/AuthContext";
import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import GreetingCard from "../../components/GreetingCard";
import { getApiBase } from "../../../lib/api";
import QuotaCalendar from "../../components/QuotaCalendar";

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

type PenelitiQuotaPayload = {
  success: boolean;
  mode: "online" | "offline" | string;
  limit: number;
  verified: number;
  date?: string;
  tz?: string;
};

export default function PenelitiDashboardPage() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [fromLtb = 0, setFromLtb] = useState<number | null>(null);
  const [tillVerif = 0, setTillVerif] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [quota, setQuota] = useState<PenelitiQuotaPayload | null>(null);
  const [quotaErr, setQuotaErr] = useState<string | null>(null);
  const [quotaLoading, setQuotaLoading] = useState(false);

  const selectedDateParam = useMemo(() => {
    try {
      return selectedDate.toLocaleDateString("en-CA"); // YYYY-MM-DD
    } catch {
      return "";
    }
  }, [selectedDate]);

  const selectedDateLabel = useMemo(() => {
    try {
      return selectedDate.toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
    } catch {
      return selectedDateParam || "—";
    }
  }, [selectedDate, selectedDateParam]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [res1, res2, quotaRes] = await Promise.all([
          fetch(`${getApiBase()}/api/peneliti_get-berkas-fromltb`, { credentials: "include" }).catch(() => null),
          fetch(`${getApiBase()}/api/peneliti/get-berkas-till-verif`, { credentials: "include" }).catch(() => null),
          fetch(`${getApiBase()}/api/peneliti/quota-today?mode=online&date=${encodeURIComponent(selectedDateParam)}`, { credentials: "include" }).catch(() => null),
        ]);
        if (cancelled) return;
        const data1 = res1?.ok ? await res1.json().catch(() => ({})) : {};
        const data2 = res2?.ok ? await res2.json().catch(() => ({})) : {};
        const arr1 = Array.isArray(data1?.data) ? data1.data : [];
        const arr2 = Array.isArray(data2?.data) ? data2.data : [];
        setFromLtb(arr1.length);
        setTillVerif(arr2.length);

        if (quotaRes?.ok) {
          const q = (await quotaRes.json().catch(() => null)) as PenelitiQuotaPayload | null;
          if (q?.success && typeof q.verified === "number" && typeof q.limit === "number") {
            setQuota(q);
            setQuotaErr(null);
          }
        } else if (quotaRes) {
          setQuotaErr("Gagal memuat progres kuota hari ini");
        }
      } catch {
        if (!cancelled) {
          setFromLtb(0);
          setTillVerif(0);
          setQuotaErr("Gagal memuat progres kuota hari ini");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [selectedDateParam]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!selectedDateParam) return;
      setQuotaLoading(true);
      setQuotaErr(null);
      try {
        const res = await fetch(`${getApiBase()}/api/peneliti/quota-today?mode=online&date=${encodeURIComponent(selectedDateParam)}`, {
          credentials: "include",
        }).catch(() => null);
        if (cancelled) return;
        if (!res?.ok) {
          setQuotaErr("Gagal memuat progres kuota hari ini");
          return;
        }
        const q = (await res.json().catch(() => null)) as PenelitiQuotaPayload | null;
        if (q?.success && typeof q.verified === "number" && typeof q.limit === "number") {
          setQuota(q);
        } else {
          setQuotaErr("Gagal memuat progres kuota hari ini");
        }
      } catch {
        if (!cancelled) setQuotaErr("Gagal memuat progres kuota hari ini");
      } finally {
        if (!cancelled) setQuotaLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedDateParam]);

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto" }}>
      <GreetingCard
        nama={user?.nama || user?.userid || "Peneliti"}
        pageLabel="Peneliti"
        subtitle="Verifikasi SSPD dan Kasie. Kelola berkas dari LTB dan berikan paraf."
        gender={user?.gender ?? undefined}
        rightContent={<QuotaCalendar value={selectedDate} onChange={setSelectedDate} />}
      />

      {loading ? (
        <p style={{ marginTop: 24, color: "var(--color_font_main_muted)" }}>Memuat ringkasan...</p>
      ) : (
        <div style={{ marginTop: 24 }}>
          {/* Personal achievement (Online) + Offline placeholder */}
          <div
            style={{
              background: "var(--card_bg)",
              border: "1px solid var(--border_color)",
              borderRadius: 12,
              padding: 20,
              boxShadow: "var(--card_shadow)",
              marginBottom: 18,
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: "var(--color_font_main)" }}>Progres Anda Hari Ini</div>
                <div style={{ marginTop: 6, fontSize: 13, color: "var(--color_font_main_muted)" }}>
                  {quota
                    ? `Menampilkan data untuk ${selectedDateLabel}. Anda telah memverifikasi ${quota.verified} dari ${quota.limit} berkas online.`
                    : "Memuat progres kuota…"}
                </div>
                {quotaErr && <div style={{ marginTop: 8, fontSize: 12, color: "#b91c1c", fontWeight: 800 }}>{quotaErr}</div>}
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 12, color: "var(--color_font_main_muted)" }}>Online</div>
                {quotaLoading ? (
                  <div style={{ marginTop: 8, height: 28, width: 160, borderRadius: 10, background: "rgba(148,163,184,0.18)" }} />
                ) : (
                  <div style={{ fontSize: 28, fontWeight: 900, color: "var(--color_font_main)" }}>
                    {(quota?.verified ?? 0).toLocaleString("id-ID")}/{(quota?.limit ?? 80).toLocaleString("id-ID")}
                  </div>
                )}
              </div>
            </div>

            {(() => {
              const used = quota?.verified ?? 0;
              const limit = quota?.limit ?? 80;
              const pct = Math.min(100, Math.max(0, limit > 0 ? (used / limit) * 100 : 0));
              const bar = pct >= 100 ? "#10b981" : "var(--accent)";
              return (
                <div style={{ marginTop: 12 }}>
                  <div style={{ height: 10, borderRadius: 999, background: "rgba(148,163,184,0.18)", overflow: "hidden" }}>
                    <div style={{ width: `${pct}%`, height: "100%", background: bar, borderRadius: 999 }} />
                  </div>
                </div>
              );
            })()}

            <div
              style={{
                marginTop: 14,
                padding: 12,
                borderRadius: 12,
                border: "1px dashed var(--border_color)",
                background: "rgba(148,163,184,0.06)",
                opacity: 0.75,
              }}
              aria-disabled
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                <div style={{ fontWeight: 800 }}>Offline</div>
                <div style={{ fontSize: 12, fontWeight: 900, color: "var(--color_font_main_muted)" }}>Coming Soon</div>
              </div>
              <div style={{ marginTop: 6, fontSize: 13, color: "var(--color_font_main_muted)" }}>
                Slot offline akan tersedia dengan limitasi 40/hari.
              </div>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 20,
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
        </div>
      )}
    </div>
  );
}
