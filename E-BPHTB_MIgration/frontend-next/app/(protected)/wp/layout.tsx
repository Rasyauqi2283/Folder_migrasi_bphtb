"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { useEffect } from "react";

const WP_DIVISI = "Wajib Pajak";

export default function WpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) return;
    if ((user.divisi ?? "") !== WP_DIVISI) {
      router.replace("/dashboard");
    }
  }, [user, router]);

  if (!user) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <p>Memuat...</p>
        <Link href="/dashboard">← Kembali ke Dashboard</Link>
      </div>
    );
  }

  if ((user.divisi ?? "") !== WP_DIVISI) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <p>Memuat...</p>
        <Link href="/dashboard">← Kembali ke Dashboard</Link>
      </div>
    );
  }

  return <>{children}</>;
}
