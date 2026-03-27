import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Backend Go: port 8000 (sama untuk lokal & Koyeb). 127.0.0.1 agar proxy stabil (localhost kadang IPv6).
const API_PROXY_TARGET = process.env.NEXT_PUBLIC_LEGACY_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

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
