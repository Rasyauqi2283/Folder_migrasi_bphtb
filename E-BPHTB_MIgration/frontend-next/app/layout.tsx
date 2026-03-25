import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";
import { ThemeInit } from "./components/ThemeInit";
import SystemAlert from "./components/SystemAlert";

export const metadata: Metadata = {
  title: "E-BPHTB | Selamat Datang",
  description: "Layanan resmi Bea Perolehan Hak atas Tanah dan Bangunan Kabupaten Bogor"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>
        <ThemeInit />
        <SystemAlert />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
