"use client";

import { useAuth } from "../../context/AuthContext";
import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import GreetingCard from "../../components/GreetingCard";
import { getApiBase } from "../../../lib/api";
import { runBankMainTourIfRequested } from "../../components/tours/bankDashboardTour";

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

interface BankSummary {
  pending: number;
  reviewed: number;
  approved: number;
  rejected: number;
}

export default function BankDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname() ?? "";
  const searchParams = useSearchParams();
  const [summary, setSummary] = useState<BankSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const tourGuideMain = searchParams.get("tourGuide");
  useEffect(() => {
    if (tourGuideMain !== "bank-main") return;
    const t = window.setTimeout(() => {
      runBankMainTourIfRequested(router, pathname || "/bank", searchParams);
    }, 380);
    return () => window.clearTimeout(t);
  }, [router, pathname, searchParams, tourGuideMain]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const base = getApiBase();
        const [pendingRes, reviewedRes, approvedRes, rejectedRes] = await Promise.all([
          fetch(`${base}/api/bank/transaksi?tab=pending&page=1&limit=1`, { credentials: "include" }).catch(() => null),
          fetch(`${base}/api/bank/transaksi?tab=reviewed&page=1&limit=1`, { credentials: "include" }).catch(() => null),
          fetch(`${base}/api/bank/transaksi?tab=reviewed&status=Disetujui&page=1&limit=1`, { credentials: "include" }).catch(() => null),
          fetch(`${base}/api/bank/transaksi?tab=reviewed&status=Ditolak&page=1&limit=1`, { credentials: "include" }).catch(() => null),
        ]);

        const getTotal = async (res: Response | null) => {
          if (!res?.ok) return 0;
          const data = await res.json().catch(() => ({ success: false, total: 0 }));
          return data.success ? parseInt(String(data.total), 10) || 0 : 0;
        };

        if (cancelled) return;
        setSummary({
          pending: await getTotal(pendingRes),
          reviewed: await getTotal(reviewedRes),
          approved: await getTotal(approvedRes),
          rejected: await getTotal(rejectedRes),
        });
      } catch {
        if (!cancelled) setSummary({ pending: 0, reviewed: 0, approved: 0, rejected: 0 });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto" }}>
      <div id="bank-tour-greeting">
        <GreetingCard
          nama={user?.nama || user?.userid || "Bank"}
          pageLabel="Bank"
          subtitle="Verifikasi pembayaran transaksi BPHTB. Tinjau dan setujui atau tolak."
          gender={user?.gender ?? undefined}
        />
      </div>

      {loading ? (
        <p style={{ marginTop: 24, color: "var(--color_font_main_muted)" }}>Memuat ringkasan...</p>
      ) : (
        <div
          id="bank-tour-summary-cards"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 20,
            marginTop: 24,
          }}
        >
          <Link id="bank-tour-card-pending" href="/bank/hasil-transaksi" style={CARD_STYLE}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                }}
              >
                ⏱
              </div>
              <span style={{ fontSize: 16, fontWeight: 600 }}>Pending Review</span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>{summary?.pending ?? 0}</div>
            <p style={{ margin: 0, fontSize: 14, color: "var(--color_font_main_muted)" }}>
              Transaksi menunggu verifikasi
            </p>
            <span style={{ display: "inline-block", marginTop: 12, fontSize: 14, fontWeight: 600, color: "var(--accent)" }}>
              Lihat Transaksi →
            </span>
          </Link>

          <Link href="/bank/hasil-transaksi" style={CARD_STYLE}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                }}
              >
                ✓
              </div>
              <span style={{ fontSize: 16, fontWeight: 600 }}>Sudah di Review</span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>{summary?.reviewed ?? 0}</div>
            <p style={{ margin: 0, fontSize: 14, color: "var(--color_font_main_muted)" }}>
              Transaksi sudah direview
            </p>
            <span style={{ display: "inline-block", marginTop: 12, fontSize: 14, fontWeight: 600, color: "var(--accent)" }}>
              Lihat Transaksi →
            </span>
          </Link>

          <Link href="/bank/hasil-transaksi" style={CARD_STYLE}>
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
                ✓
              </div>
              <span style={{ fontSize: 16, fontWeight: 600 }}>Disetujui</span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>{summary?.approved ?? 0}</div>
            <p style={{ margin: 0, fontSize: 14, color: "var(--color_font_main_muted)" }}>
              Transaksi yang disetujui
            </p>
            <span style={{ display: "inline-block", marginTop: 12, fontSize: 14, fontWeight: 600, color: "var(--accent)" }}>
              Lihat Transaksi →
            </span>
          </Link>

          <Link href="/bank/hasil-transaksi" style={CARD_STYLE}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                }}
              >
                ✗
              </div>
              <span style={{ fontSize: 16, fontWeight: 600 }}>Ditolak</span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>{summary?.rejected ?? 0}</div>
            <p style={{ margin: 0, fontSize: 14, color: "var(--color_font_main_muted)" }}>
              Transaksi yang ditolak
            </p>
            <span style={{ display: "inline-block", marginTop: 12, fontSize: 14, fontWeight: 600, color: "var(--accent)" }}>
              Lihat Transaksi →
            </span>
          </Link>
        </div>
      )}
    </div>
  );
}
