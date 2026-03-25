"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import GreetingCard from "../../components/GreetingCard";
import { getApiBase } from "../../../lib/api";
import QuotaCalendar from "../../components/QuotaCalendar";

interface Stats {
  pending: number;
  complete: number;
  statusPpat: number;
  validasiQr: number;
}

interface TaxSummary {
  total_bphtb_formatted: string;
  total_transaksi: number;
}

interface ValidationStatItem {
  label: string;
  count: number;
  percentage: number;
  description?: string;
}
interface ValidationStats {
  success?: boolean;
  data?: {
    total: number;
    sudahValidasi: ValidationStatItem;
    tinggalVerifikasi: ValidationStatItem;
    belumTerurus: ValidationStatItem;
  };
}

type QuotaPayload = {
  success: boolean;
  mode: "online" | "offline" | string;
  limit: number;
  used: number;
  date?: string;
  tz?: string;
};

type SystemStatusPayload =
  | { success: true; online: true; message?: string | null; scheduled_at?: string; eta_done_at?: string }
  | { success: false; online: false; message: string; scheduled_at?: string; eta_done_at?: string; reason?: string };

function quotaColor(used: number, limit: number) {
  const ratio = limit > 0 ? used / limit : 0;
  if (ratio >= 1) return { bar: "#ef4444", bg: "rgba(239,68,68,0.12)", label: "Kuota penuh" };
  if (ratio >= 0.8) return { bar: "#f59e0b", bg: "rgba(245,158,11,0.12)", label: "Mendekati limit" };
  return { bar: "#10b981", bg: "rgba(16,185,129,0.12)", label: "Aman" };
}

const CARD_STYLES = {
  wrapper: {
    background: "var(--card_bg_grey)",
    border: "1px solid var(--border_color)",
    borderRadius: 12,
    padding: 24,
    boxShadow: "var(--shadow_card)",
    transition: "all 0.3s ease",
    cursor: "pointer",
    position: "relative" as const,
    overflow: "hidden",
  },
  iconBlue: { background: "linear-gradient(135deg, var(--accent_hover) 0%, var(--accent) 100%)" },
  iconGreen: { background: "linear-gradient(135deg, #059669 0%, #047857 100%)" },
  iconPurple: { background: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)" },
  iconOrange: { background: "linear-gradient(135deg, #d97706 0%, #b45309 100%)" },
  iconGold: { background: "linear-gradient(135deg, #d97706 0%, #b45309 100%)" },
};

function CalendarWidget() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
  ];
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = now.getDate();
  const weekDays = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
  const dates: (number | null)[] = [];
  const startOffset = firstDay;
  for (let i = 0; i < startOffset; i++) dates.push(null);
  for (let d = 1; d <= daysInMonth; d++) dates.push(d);

  return (
    <div
      style={{
        minWidth: 220,
        background: "var(--card_bg_grey)",
        border: "1px solid var(--border_color)",
        borderRadius: 12,
        padding: 16,
        boxShadow: "var(--shadow_card)",
      }}
    >
      <p
        style={{
          margin: "0 0 12px",
          fontSize: 15,
          color: "var(--color_font_main)",
          fontWeight: 700,
          letterSpacing: "0.02em",
        }}
      >
        {monthNames[month]} {year}
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6, fontSize: 13 }}>
        {weekDays.map((w) => (
          <div
            key={w}
            style={{
              color: "var(--color_font_main_muted)",
              textAlign: "center",
              fontWeight: 600,
              padding: "4px 0",
            }}
          >
            {w}
          </div>
        ))}
        {dates.map((d, i) => (
          <div
            key={i}
            style={{
              textAlign: "center",
              padding: "8px 0",
              borderRadius: 8,
              color: d === today ? "#fff" : "var(--color_font_main)",
              background: d === today ? "var(--accent)" : "transparent",
              fontWeight: d === today ? 700 : 500,
            }}
          >
            {d ?? ""}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [stats, setStats] = useState<Stats>({
    pending: 0,
    complete: 0,
    statusPpat: 0,
    validasiQr: 0,
  });
  const [taxSummary, setTaxSummary] = useState<TaxSummary | null>(null);
  const [validationStats, setValidationStats] = useState<ValidationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [quotaOnline, setQuotaOnline] = useState<QuotaPayload | null>(null);
  const [quotaErr, setQuotaErr] = useState<string | null>(null);
  const [quotaLoading, setQuotaLoading] = useState(false);

  const [sysLoading, setSysLoading] = useState(false);
  const [sysErr, setSysErr] = useState<string | null>(null);
  const [sysOnline, setSysOnline] = useState<boolean | null>(null);
  const [sysMessage, setSysMessage] = useState<string>("");
  const [sysEta, setSysEta] = useState<string>(""); // datetime-local

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

  const loadSystemStatus = async () => {
    setSysErr(null);
    try {
      const res = await fetch(`${getApiBase()}/api/system/status`, { cache: "no-store", credentials: "include" });
      const json = (await res.json().catch(() => null)) as SystemStatusPayload | null;
      if (json && typeof (json as any).online === "boolean") {
        setSysOnline((json as any).online);
        const msg = typeof (json as any).message === "string" ? (json as any).message : "";
        setSysMessage(msg);
        const eta = typeof (json as any).eta_done_at === "string" ? (json as any).eta_done_at : "";
        if (eta) {
          // convert RFC3339 -> datetime-local (best-effort)
          try {
            const d = new Date(eta);
            const pad = (n: number) => String(n).padStart(2, "0");
            const local = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
            setSysEta(local);
          } catch {
            setSysEta("");
          }
        }
        return;
      }
      setSysErr("Gagal membaca status sistem");
    } catch {
      setSysErr("Gagal membaca status sistem");
    }
  };

  useEffect(() => {
    loadSystemStatus();
  }, []);

  const saveMaintenance = async (online: boolean) => {
    setSysLoading(true);
    setSysErr(null);
    try {
      const body: any = { online, message: sysMessage?.trim() || null };
      if (sysEta?.trim()) {
        const d = new Date(sysEta);
        if (!Number.isNaN(d.getTime())) body.eta_done_at = d.toISOString();
      }
      const res = await fetch(`${getApiBase()}/api/admin/system/maintenance-mode`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.success) {
        setSysErr(typeof json?.message === "string" ? json.message : "Gagal menyimpan status maintenance");
        return;
      }
      await loadSystemStatus();
    } catch {
      setSysErr("Gagal menyimpan status maintenance");
    } finally {
      setSysLoading(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        const currentYear = new Date().getFullYear();
        const [
          pendingRes,
          completeRes,
          ppatStatsRes,
          qrRes,
          taxRes,
          validationRes,
        ] = await Promise.all([
          fetch(`${getApiBase()}/api/users/pending`, { credentials: "include" }).catch(() => null),
          fetch(`${getApiBase()}/api/users/complete`, { credentials: "include" }).catch(() => null),
          fetch(`${getApiBase()}/api/admin/notification-warehouse/ppat-users-stats`, { credentials: "include" }).catch(() => null),
          fetch(`${getApiBase()}/api/admin/validate-qr-search?page=1&limit=1`, { credentials: "include" }).catch(() => null),
          fetch(`${getApiBase()}/api/admin/notification-warehouse/ppat-renewal?page=1&limit=1&jangka_waktu=12&tahun=${currentYear}`, { credentials: "include" }).catch(() => null),
          fetch(`${getApiBase()}/api/admin/validation-statistics`, { credentials: "include" }).catch(() => null),
        ]);

        let pendingCount = 0;
        if (pendingRes?.ok) {
          const data = await pendingRes.json().catch(() => []);
          pendingCount = Array.isArray(data) ? data.length : 0;
        }
        let completeCount = 0;
        if (completeRes?.ok) {
          const data = await completeRes.json().catch(() => []);
          completeCount = Array.isArray(data) ? data.length : 0;
        }
        let ppatTotal = 0;
        if (ppatStatsRes?.ok) {
          const j = await ppatStatsRes.json().catch(() => ({}));
          if (j?.success && j?.data) ppatTotal = j.data.total ?? 0;
        }
        let qrTotal = 0;
        if (qrRes?.ok) {
          const j = await qrRes.json().catch(() => ({}));
          if (j?.success && j?.pagination) qrTotal = j.pagination.total ?? 0;
        }
        setStats({ pending: pendingCount, complete: completeCount, statusPpat: ppatTotal, validasiQr: qrTotal });

        if (taxRes?.ok) {
          const data = await taxRes.json().catch(() => ({}));
          if (data?.success && data?.summary) {
            setTaxSummary({
              total_bphtb_formatted: data.summary.total_bphtb_formatted || "Rp 0",
              total_transaksi: Number(data.summary.total_transaksi || 0),
            });
          }
        }
        if (validationRes?.ok) {
          const data = await validationRes.json().catch(() => ({}));
          setValidationStats(data);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!selectedDateParam) return;
      setQuotaLoading(true);
      setQuotaErr(null);
      try {
        const res = await fetch(`${getApiBase()}/api/admin/quota-today?mode=online&date=${encodeURIComponent(selectedDateParam)}`, {
          credentials: "include",
        }).catch(() => null);
        if (cancelled) return;
        if (!res?.ok) {
          setQuotaErr("Gagal memuat kuota harian");
          return;
        }
        const q = (await res.json().catch(() => null)) as QuotaPayload | null;
        if (q?.success && typeof q.used === "number" && typeof q.limit === "number") {
          setQuotaOnline(q);
        } else {
          setQuotaErr("Gagal memuat kuota harian");
        }
      } catch {
        if (!cancelled) setQuotaErr("Gagal memuat kuota harian");
      } finally {
        if (!cancelled) setQuotaLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedDateParam]);

  const cards = [
    { label: "Verifikasi Data User", value: stats.pending, sub: "User menunggu verifikasi", href: "/admin/data-user/pending", icon: "👤", iconClass: "orange" },
    { label: "Data User", value: stats.complete, sub: "Total user terverifikasi", href: "/admin/data-user/complete", icon: "👥", iconClass: "green" },
    { label: "Status PPAT", value: stats.statusPpat, sub: "Total PPAT/PPATS", href: "/admin/referensi/status-ppat", icon: "📋", iconClass: "blue" },
    { label: "Validasi QR", value: stats.validasiQr, sub: "Total validasi QR", href: "/admin/referensi/validasi-qr", icon: "🔍", iconClass: "purple" },
  ];

  const iconStyle = (c: typeof cards[0]) =>
    c.iconClass === "orange" ? CARD_STYLES.iconOrange :
    c.iconClass === "green" ? CARD_STYLES.iconGreen :
    c.iconClass === "purple" ? CARD_STYLES.iconPurple : CARD_STYLES.iconBlue;

  return (
    <div style={{ maxWidth: 1400, margin: "0 auto" }}>
      {/* Greeting card universal: SVG berdasarkan gender */}
      <GreetingCard
        nama={user?.nama || user?.userid || "Pengguna"}
        pageLabel={user?.divisi || "Admin"}
        subtitle="Ringkasan aktivitas dan statistik administrasi Anda"
        gender={user?.gender ?? undefined}
        rightContent={<QuotaCalendar value={selectedDate} onChange={setSelectedDate} />}
      />

      {/* Summary cards - design serupa HTML */}
      {loading ? (
        <p style={{ color: "var(--color_font_main_muted)", marginBottom: 24 }}>Memuat...</p>
      ) : (
        <>
          {/* Maintenance toggle (Admin) */}
          <div
            style={{
              ...CARD_STYLES.wrapper,
              cursor: "default",
              marginBottom: 20,
              borderLeft: sysOnline === false ? "4px solid #ef4444" : "4px solid #10b981",
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 900, marginBottom: 6 }}>Mode Pemeliharaan</div>
                <div style={{ fontSize: 13, color: "var(--color_font_main_muted)" }}>
                  Status:{" "}
                  <span style={{ fontWeight: 900, color: sysOnline === false ? "#b91c1c" : "#047857" }}>
                    {sysOnline === null ? "—" : sysOnline ? "ONLINE" : "OFFLINE (Maintenance)"}
                  </span>
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button
                  type="button"
                  disabled={sysLoading}
                  onClick={() => saveMaintenance(true)}
                  style={{
                    padding: "10px 14px",
                    borderRadius: 10,
                    border: "1px solid rgba(16,185,129,0.35)",
                    background: "rgba(16,185,129,0.12)",
                    fontWeight: 900,
                    cursor: sysLoading ? "not-allowed" : "pointer",
                  }}
                >
                  Set ONLINE
                </button>
                <button
                  type="button"
                  disabled={sysLoading}
                  onClick={() => saveMaintenance(false)}
                  style={{
                    padding: "10px 14px",
                    borderRadius: 10,
                    border: "1px solid rgba(239,68,68,0.35)",
                    background: "rgba(239,68,68,0.12)",
                    fontWeight: 900,
                    cursor: sysLoading ? "not-allowed" : "pointer",
                  }}
                >
                  Set OFFLINE
                </button>
              </div>
            </div>

            <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(220px, 320px)", gap: 12 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 900, color: "var(--color_font_main_muted)", marginBottom: 6 }}>Pesan banner / maintenance</div>
                <input
                  value={sysMessage}
                  onChange={(e) => setSysMessage(e.target.value)}
                  placeholder="Contoh: Sistem akan diperbarui pada pukul 18:05. Mohon simpan pekerjaan Anda."
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 10,
                    border: "1px solid var(--border_color)",
                    background: "var(--card_bg)",
                  }}
                />
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 900, color: "var(--color_font_main_muted)", marginBottom: 6 }}>Perkiraan selesai (opsional)</div>
                <input
                  type="datetime-local"
                  value={sysEta}
                  onChange={(e) => setSysEta(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 10,
                    border: "1px solid var(--border_color)",
                    background: "var(--card_bg)",
                  }}
                />
              </div>
            </div>

            {sysErr && <div style={{ marginTop: 10, fontSize: 12, color: "#b91c1c", fontWeight: 900 }}>{sysErr}</div>}
          </div>

          {/* Kuota harian (Online + Offline placeholder) */}
          <div
            style={{
              ...CARD_STYLES.wrapper,
              cursor: "default",
              marginBottom: 20,
              borderLeft: "4px solid var(--accent)",
              background: "var(--card_bg_grey)",
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 6 }}>Kuota Harian Sistem</div>
                <div style={{ fontSize: 13, color: "var(--color_font_main_muted)" }}>
                  Menampilkan data untuk <strong>{selectedDateLabel}</strong>. Online (80/hari) dan Offline (40/hari — Coming Soon)
                </div>
              </div>
              {quotaOnline && quotaOnline.used >= quotaOnline.limit && (
                <div
                  style={{
                    padding: "8px 12px",
                    borderRadius: 999,
                    background: "rgba(239,68,68,0.14)",
                    border: "1px solid rgba(239,68,68,0.35)",
                    color: "#b91c1c",
                    fontWeight: 900,
                    fontSize: 12,
                  }}
                >
                  Kuota online hari ini penuh — sistem tidak menerima booking online baru
                </div>
              )}
            </div>

            <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 }}>
              {/* Online */}
              <div
                style={{
                  border: "1px solid var(--border_color)",
                  borderRadius: 12,
                  padding: 14,
                  background: "rgba(10,19,34,0.04)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                  <div style={{ fontWeight: 800 }}>Online</div>
                  <div style={{ fontSize: 12, color: "var(--color_font_main_muted)" }}>{quotaOnline?.date ? `Tanggal: ${quotaOnline.date}` : ""}</div>
                </div>
                {quotaLoading ? (
                  <div style={{ marginTop: 10 }}>
                    <div style={{ height: 28, width: 160, borderRadius: 10, background: "rgba(148,163,184,0.18)" }} />
                    <div style={{ marginTop: 10, height: 10, borderRadius: 999, background: "rgba(148,163,184,0.14)" }} />
                  </div>
                ) : (
                  <div style={{ marginTop: 10, fontSize: 26, fontWeight: 900 }}>
                    {(quotaOnline?.used ?? 0).toLocaleString("id-ID")}/{(quotaOnline?.limit ?? 80).toLocaleString("id-ID")}
                  </div>
                )}
                {quotaErr && <div style={{ marginTop: 6, fontSize: 12, color: "#b91c1c", fontWeight: 800 }}>{quotaErr}</div>}
                {(() => {
                  const used = quotaOnline?.used ?? 0;
                  const limit = quotaOnline?.limit ?? 80;
                  const c = quotaColor(used, limit);
                  const pct = Math.min(100, Math.max(0, limit > 0 ? (used / limit) * 100 : 0));
                  return (
                    <>
                      <div style={{ marginTop: 10, fontSize: 12, fontWeight: 800, color: "var(--color_font_main_muted)" }}>
                        Status: <span style={{ color: c.bar }}>{c.label}</span>
                      </div>
                      <div style={{ marginTop: 8, height: 10, borderRadius: 999, background: c.bg, overflow: "hidden" }}>
                        <div style={{ width: `${pct}%`, height: "100%", background: c.bar, borderRadius: 999 }} />
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Offline placeholder */}
              <div
                style={{
                  border: "1px dashed var(--border_color)",
                  borderRadius: 12,
                  padding: 14,
                  background: "rgba(148,163,184,0.06)",
                  opacity: 0.7,
                }}
                aria-disabled
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                  <div style={{ fontWeight: 800 }}>Offline</div>
                  <div style={{ fontSize: 12, color: "var(--color_font_main_muted)", fontWeight: 900 }}>Coming Soon</div>
                </div>
                <div style={{ marginTop: 10, fontSize: 26, fontWeight: 900 }}>0/40</div>
                <div style={{ marginTop: 8, fontSize: 12, color: "var(--color_font_main_muted)" }}>
                  Slot offline akan tersedia dengan limitasi 40/hari.
                </div>
                <div style={{ marginTop: 10, height: 10, borderRadius: 999, background: "rgba(148,163,184,0.12)", overflow: "hidden" }}>
                  <div style={{ width: "0%", height: "100%", background: "rgba(148,163,184,0.55)", borderRadius: 999 }} />
                </div>
              </div>
            </div>
          </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 20,
            marginBottom: 24,
          }}
        >
          {cards.map((c) => (
            <Link
              key={c.href}
              href={c.href}
              style={{
                ...CARD_STYLES.wrapper,
                borderLeft: "4px solid transparent",
                borderLeftColor: c.iconClass === "orange" ? "#d97706" : c.iconClass === "green" ? "#059669" : c.iconClass === "purple" ? "#7c3aed" : "var(--accent)",
                textDecoration: "none",
                color: "var(--color_font_main)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 20,
                    ...iconStyle(c),
                  }}
                >
                  {c.icon}
                </div>
                <span style={{ fontSize: 16, fontWeight: 600 }}>{c.label}</span>
              </div>
              <div style={{ fontSize: 36, fontWeight: 700, margin: "8px 0", color: "var(--color_font_main)" }}>{c.value}</div>
              <div style={{ fontSize: 14, color: "var(--color_font_main_muted)", marginBottom: 12 }}>{c.sub}</div>
              <div style={{ borderTop: "1px solid var(--border_color)", paddingTop: 16, marginTop: 16 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: "var(--accent)" }}>
                  Lihat Data →
                </span>
              </div>
            </Link>
          ))}
        </div>
        </>
      )}

      {/* Nilai Transaksi Pajak - card gold */}
      <div style={{ marginBottom: 24 }}>
        <Link
          href="/admin/referensi/pemutakhiran-ppat"
          style={{
            ...CARD_STYLES.wrapper,
            display: "block",
            textDecoration: "none",
            color: "var(--color_font_main)",
            borderLeft: "4px solid #b45309",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
                ...CARD_STYLES.iconGold,
              }}
            >
              💰
            </div>
            <span style={{ fontSize: 16, fontWeight: 600 }}>Nilai Transaksi Pajak</span>
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, color: "#047857", margin: "8px 0" }}>
            {taxSummary?.total_bphtb_formatted ?? "Rp 0"}
          </div>
          <div style={{ fontSize: 14, color: "var(--color_font_main_muted)", marginBottom: 12 }}>
            Periode 12 bulan • Tahun {new Date().getFullYear()}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginTop: 14 }}>
            <div style={{ background: "rgba(10,19,34,0.06)", border: "1px solid var(--border_color)", borderRadius: 10, padding: "10px 12px" }}>
              <div style={{ fontSize: 12, color: "var(--color_font_main_muted)" }}>Total Transaksi</div>
              <div style={{ marginTop: 4, fontSize: 16, fontWeight: 700, color: "var(--color_font_main)" }}>
                {(taxSummary?.total_transaksi ?? 0).toLocaleString("id-ID")}
              </div>
            </div>
            <div style={{ background: "rgba(10,19,34,0.06)", border: "1px solid var(--border_color)", borderRadius: 10, padding: "10px 12px" }}>
              <div style={{ fontSize: 12, color: "var(--color_font_main_muted)" }}>Keterangan</div>
              <div style={{ marginTop: 4, fontSize: 14, fontWeight: 600, color: "var(--color_font_main)" }}>Ringkasan dari Pemutakhiran PPAT</div>
            </div>
          </div>
          <div style={{ borderTop: "1px solid var(--border_color)", paddingTop: 16, marginTop: 16 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: "var(--accent)" }}>Lihat Detail →</span>
          </div>
        </Link>
      </div>

      {/* Statistik Total Permohonan Validasi - chart section */}
      <section
        style={{
          background: "var(--card_bg_grey)",
          border: "1px solid var(--border_color)",
          borderRadius: 12,
          padding: 24,
          boxShadow: "var(--shadow_card)",
        }}
      >
        <h3 style={{ margin: "0 0 20px", color: "var(--color_font_main)", fontSize: 20, fontWeight: 700, borderBottom: "2px solid var(--border_color)", paddingBottom: 12 }}>
          Statistik Total Permohonan Validasi
        </h3>
        {validationStats?.success && validationStats.data ? (
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0,200px) 1fr", gap: 32, alignItems: "start" }}>
            <div
              style={{
                width: 200,
                height: 200,
                borderRadius: "50%",
                background: `conic-gradient(
                  #10b981 0% ${validationStats.data.sudahValidasi.percentage}%,
                  #3b82f6 ${validationStats.data.sudahValidasi.percentage}% ${validationStats.data.sudahValidasi.percentage + validationStats.data.tinggalVerifikasi.percentage}%,
                  #f59e0b ${validationStats.data.sudahValidasi.percentage + validationStats.data.tinggalVerifikasi.percentage}% 100%
                )`,
                flexShrink: 0,
              }}
            />
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {[
                { ...validationStats.data.sudahValidasi, color: "#10b981" },
                { ...validationStats.data.tinggalVerifikasi, color: "#3b82f6" },
                { ...validationStats.data.belumTerurus, color: "#f59e0b" },
              ].map((item, i) => (
                <li
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: 12,
                    marginBottom: 8,
                    background: "rgba(10,19,34,0.05)",
                    borderRadius: 8,
                    borderLeft: `4px solid ${item.color}`,
                  }}
                >
                  <span style={{ width: 20, height: 20, borderRadius: 4, background: item.color, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: "var(--color_font_main)" }}>{item.label}</div>
                    <div style={{ fontSize: 12, color: "var(--color_font_main_muted)", marginTop: 4 }}>{item.description ?? ""}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: "var(--color_font_main)" }}>{item.percentage}%</div>
                    <div style={{ fontSize: 14, color: "var(--color_font_main_muted)" }}>{item.count} dokumen</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p style={{ color: "var(--color_font_main_muted)", margin: 0 }}>Memuat statistik validasi...</p>
        )}
      </section>

      <p style={{ marginTop: "2rem" }}>
        <Link href="/dashboard" style={{ color: "var(--accent_hover)", textDecoration: "none" }}>
          ← Kembali ke Dashboard
        </Link>
      </p>
    </div>
  );
}
