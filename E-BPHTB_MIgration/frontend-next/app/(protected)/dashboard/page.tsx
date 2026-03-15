"use client";

import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import { getLegacyBaseUrl } from "../../../lib/api";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const legacyBase = getLegacyBaseUrl();

  useEffect(() => {
    if (!user) return;
    if (user.divisi === "Administrator") {
      router.replace("/admin");
      return;
    }
    if (["PPAT", "PPATS", "Notaris"].includes(user.divisi ?? "")) {
      router.replace("/pu");
      return;
    }
    if (user.divisi === "Wajib Pajak") {
      router.replace("/wp");
      return;
    }
    if (user.divisi === "LTB") {
      router.replace("/ltb");
      return;
    }
    if (user.divisi === "Customer Service") {
      router.replace("/cs");
      return;
    }
  }, [user, router]);

  const legacyDashboardUrl = (() => {
    switch (user?.divisi) {
      case "Administrator":
        return "/admin";
      case "PPAT":
      case "PPATS":
      case "Notaris":
        return "/pu";
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
        return "/wp";
      case "LTB":
        return "/ltb";
      case "Customer Service":
        return "/cs";
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
