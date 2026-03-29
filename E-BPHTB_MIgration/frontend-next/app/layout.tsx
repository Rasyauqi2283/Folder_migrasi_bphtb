import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";
import { ThemeInit } from "./components/ThemeInit";
import SystemAlert from "./components/SystemAlert";
import { CHROME_PRELOAD_CONSOLE_SCRIPT } from "../lib/suppressChromePreloadConsole";

export const metadata: Metadata = {
  title: {
    default: "Selamat Datang",
    template: "%s | E-BPHTB",
  },
  description: "Layanan resmi Bea Perolehan Hak atas Tanah dan Bangunan Kabupaten Bogor",
  icons: {
    icon: "/asset/TitleE-bphtb.png",
    shortcut: "/asset/TitleE-bphtb.png",
    apple: "/asset/TitleE-bphtb.png",
  },
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>
        <Script
          id="ebphtb-suppress-chrome-preload-console-noise"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: CHROME_PRELOAD_CONSOLE_SCRIPT }}
        />
        <ThemeInit />
        <SystemAlert />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
