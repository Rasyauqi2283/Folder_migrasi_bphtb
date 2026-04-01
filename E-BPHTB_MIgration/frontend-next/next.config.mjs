import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Backend Go: port 8000 (lokal) / domain deployment.
// Normalisasi target penting untuk mencegah error DNS (ERR_NAME_NOT_RESOLVED)
// saat env mengandung host tidak valid / typo / tanpa protocol.
const RAW_API_PROXY_TARGET =
  process.env.API_PROXY_TARGET ||
  process.env.LEGACY_BASE_URL ||
  process.env.API_BASE_URL ||
  process.env.NEXT_PUBLIC_LEGACY_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://127.0.0.1:8000";

function normalizeProxyTarget(raw) {
  const text = String(raw || "").trim();
  if (!text) return "http://127.0.0.1:8000";
  const withProtocol = /^https?:\/\//i.test(text) ? text : `http://${text}`;
  try {
    const u = new URL(withProtocol);
    // Hindari isu resolusi localhost di beberapa setup Windows/IPv6.
    if (u.hostname === "localhost") u.hostname = "127.0.0.1";
    return u.origin;
  } catch {
    return "http://127.0.0.1:8000";
  }
}

const API_PROXY_TARGET = normalizeProxyTarget(RAW_API_PROXY_TARGET);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  productionBrowserSourceMaps: false,
  async redirects() {
    return [
      { source: "/ppat", destination: "/pu", permanent: true },
      { source: "/ppat/:path*", destination: "/pu/:path*", permanent: true },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${API_PROXY_TARGET}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
