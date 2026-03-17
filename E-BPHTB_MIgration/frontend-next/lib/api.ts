/** URL Next.js (3000) untuk static html_folder & dashboard redirect. */
const FRONTEND_BASE =
  process.env.NEXT_PUBLIC_FRONTEND_BASE_URL ||
  (typeof window !== "undefined"
    ? `${window.location.origin}`
    : "http://localhost:3000");

/**
 * Base URL untuk panggilan API. Production: pakai NEXT_PUBLIC_API_BASE_URL (langsung ke Koyeb).
 * Dev tanpa env: di browser "" (proxy Next); di SSR localhost:8000.
 */
export function getApiBase(): string {
  // Browser: selalu gunakan same-origin "/api/*" agar cookie sesi tersimpan untuk domain Vercel
  // (menghindari masalah cross-site cookie + CORS saat memanggil Koyeb langsung).
  if (typeof window !== "undefined") return "";

  // SSR / server-side: boleh pakai base URL langsung (mis. Koyeb) via env.
  const fromEnv = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_LEGACY_BASE_URL;
  if (fromEnv) return fromEnv.replace(/\/+$/, ""); // hapus trailing slash agar tidak jadi .../api/... → ...//api/...
  return "http://localhost:8000";
}

/** Alias untuk getApiBase; dipakai oleh login, daftar, profile, auth, dll. */
export function getBackendBaseUrl(): string {
  return getApiBase();
}

/** Base URL untuk dashboard & static html_folder (dilayani Next.js). */
export function getLegacyBaseUrl(): string {
  return FRONTEND_BASE;
}

export interface ConfigResult {
  ok: boolean;
  status: number;
  data: { apiUrl?: string; environment?: string } | null;
}

export async function fetchBackendConfig(): Promise<ConfigResult> {
  try {
    const base = getBackendBaseUrl();
    const response = await fetch(`${base}/api/config`, { cache: "no-store" });
    if (!response.ok) return { ok: false, status: response.status, data: null };
    const data = await response.json();
    return { ok: true, status: response.status, data };
  } catch {
    return { ok: false, status: 0, data: null };
  }
}

