import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";
import { ThemeInit } from "./components/ThemeInit";
import SystemAlert from "./components/SystemAlert";
import ConsoleNoiseSuppressor from "./components/ConsoleNoiseSuppressor";

export const metadata: Metadata = {
  title: {
    default: "Selamat Datang",
    template: "%s | E-BPHTB",
  },
  description: "Layanan resmi Bea Perolehan Hak atas Tanah dan Bangunan Kabupaten Bogor",
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
        <ConsoleNoiseSuppressor />
        <SystemAlert />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
