/** URL backend Go (3005) untuk proxy API. */
const API_BASE =
  process.env.NEXT_PUBLIC_LEGACY_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:3005";

/** URL Next.js (3000) untuk static html_folder & dashboard redirect. */
const FRONTEND_BASE =
  process.env.NEXT_PUBLIC_FRONTEND_BASE_URL ||
  (typeof window !== "undefined"
    ? `${window.location.origin}`
    : "http://localhost:3000");

/**
 * Base URL untuk panggilan API fetch.
 * Di browser: gunakan "" agar fetch ke /api/* lewat proxy Next.js → no CORS.
 * Di SSR: gunakan full URL ke backend.
 */
export function getBackendBaseUrl(): string {
  if (typeof window !== "undefined") return "";
  return API_BASE;
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

