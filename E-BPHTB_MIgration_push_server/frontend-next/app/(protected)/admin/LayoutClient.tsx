"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { useEffect } from "react";

import { useSidebar } from "../../context/SidebarContext";
import AdminSidebar from "../../components/admin/AdminSidebar";
import Footer from "../../components/Footer";
import mainStyles from "../../styles/protected-main.module.css";

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { sidebarExpanded } = useSidebar();
  const marginLeft = sidebarExpanded ? 260 : 70;

  return (
    <>
      <AdminSidebar />
      <main
        className={mainStyles.main}
        style={{
          marginLeft,
          marginTop: 0,
          marginBottom: 40,
          padding: "1.5rem 2rem",
          minHeight: "calc(100vh - 80px - 40px)",
          transition: "margin-left 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {children}
      </main>
      <Footer />
    </>
  );
}

export default function LayoutClient({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!user) return;
    if (user.divisi !== "Administrator") {
      router.replace("/dashboard");
    }
  }, [user, router, pathname]);

  if (!user || user.divisi !== "Administrator") {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <p>Memuat...</p>
        <p>
          <Link href="/dashboard">← Kembali ke Dashboard</Link>
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--base_dark)",
      }}
    >
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </div>
  );
}

