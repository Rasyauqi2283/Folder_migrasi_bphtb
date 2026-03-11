"use client";

import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import { getLegacyBaseUrl } from "../../lib/api";

export default function DashboardPage() {
  const { user } = useAuth();
  const legacyBase = getLegacyBaseUrl();

  const legacyDashboardUrl = (() => {
    switch (user?.divisi) {
      case "Administrator":
        return "/admin";
      case "PPAT":
      case "PPATS":
        return `${legacyBase}/html_folder/PPAT/ppat-dashboard.html`;
      case "LTB":
        return `${legacyBase}/html_folder/LTB/ltb-dashboard.html`;
      case "LSB":
        return `${legacyBase}/html_folder/LSB/lsb-dashboard.html`;
      case "Peneliti":
        return `${legacyBase}/html_folder/Peneliti/peneliti-dashboard.html`;
      case "Peneliti Validasi":
        return `${legacyBase}/html_folder/ParafP/penelitiValidasi-dashboard.html`;
      case "BANK":
        return `${legacyBase}/html_folder/Bank/bank-dashboard.html`;
      case "Wajib Pajak":
        return `${legacyBase}/html_folder/WP/wp-dashboard.html`;
      default:
        return `${legacyBase}/login`;
    }
  })();

  return (
    <div style={{ padding: "2rem", maxWidth: 600, margin: "0 auto" }}>
      <h1>Dashboard</h1>
      <p>Anda masuk sebagai: <strong>{user?.nama || user?.userid}</strong> ({user?.divisi})</p>
      <p>
        <a href={legacyDashboardUrl}>
          {user?.divisi === "Administrator"
            ? "Buka dashboard admin →"
            : "Buka dashboard lengkap (legacy) →"}
        </a>
      </p>
      <Link href="/">← Kembali ke beranda</Link>
    </div>
  );
}
