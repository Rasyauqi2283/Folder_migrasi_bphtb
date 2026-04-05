"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getApiBase } from "../../lib/api";

type SystemStatusOk = {
  success: true;
  online: true;
  message?: string | null;
  scheduled_at?: string;
  eta_done_at?: string;
};

type SystemStatusDown = {
  success: false;
  online: false;
  message: string;
  scheduled_at?: string;
  eta_done_at?: string;
  reason?: string;
  open_at?: string;
  server_time?: string;
};

type SystemStatus = SystemStatusOk | SystemStatusDown;

function isDownStatus(v: unknown): v is SystemStatusDown {
  return !!v && typeof v === "object" && (v as any).online === false && typeof (v as any).message === "string";
}

function fmtIdDateTime(iso?: string) {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return iso;
  }
}

export default function SystemAlert() {
  const base = getApiBase();
  const router = useRouter();
  const pathname = usePathname() ?? "";
  const [down, setDown] = useState<SystemStatusDown | null>(null);
  const pollRef = useRef<number | null>(null);

  const shouldRender = useMemo(() => {
    // Prevent double-mount when added in multiple layouts.
    if (typeof window === "undefined") return true;
    const w = window as any;
    if (w.__ebphtb_system_alert_mounted) return false;
    w.__ebphtb_system_alert_mounted = true;
    return true;
  }, []);

  useEffect(() => {
    if (!shouldRender) return;

    let cancelled = false;

    const fetchStatus = async () => {
      try {
        const res = await fetch(`${base}/api/system/status`, { cache: "no-store", credentials: "include" });
        const json = (await res.json().catch(() => null)) as SystemStatus | null;

        if (cancelled) return;

        if (res.status === 503 && isDownStatus(json)) {
          setDown(json);
          // Allow admin to stay on admin pages to toggle maintenance back ON.
          const isAdminRoute = pathname.startsWith("/admin");
          if (!isAdminRoute && pathname !== "/maintenance") router.replace("/maintenance");
          return;
        }

        // Any non-503 response: treat as normal.
        setDown(null);
      } catch {
        // Network error: do not force redirect; keep existing state.
      }
    };

    fetchStatus();
    pollRef.current = window.setInterval(fetchStatus, 30000);

    return () => {
      cancelled = true;
      if (pollRef.current != null) window.clearInterval(pollRef.current);
    };
  }, [base, pathname, router, shouldRender]);

  if (!shouldRender) return null;
  if (!down) return null;

  const eta = fmtIdDateTime(down.eta_done_at);

  return (
    <div
      role="status"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        padding: "10px 14px",
        background: "linear-gradient(135deg, #b91c1c, #ef4444)",
        color: "#fff",
        fontWeight: 700,
        fontSize: 13,
        boxShadow: "0 8px 30px rgba(185,28,28,0.35)",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <span>{down.message}</span>
        {eta && <span style={{ opacity: 0.95, fontWeight: 600 }}>Perkiraan selesai: {eta}</span>}
        <span style={{ opacity: 0.9, fontWeight: 600 }}>Halaman: {pathname}</span>
      </div>
    </div>
  );
}

