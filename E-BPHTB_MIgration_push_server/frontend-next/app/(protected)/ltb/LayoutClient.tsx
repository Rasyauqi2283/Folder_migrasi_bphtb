"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { useEffect } from "react";
import { useSidebar } from "../../context/SidebarContext";
import LTBSidebar from "../../components/ltb/LTBSidebar";
import Footer from "../../components/Footer";
import mainStyles from "../../styles/protected-main.module.css";

const LTB_DIVISI = "LTB";

function LTBLayoutContent({ children }: { children: React.ReactNode }) {
  const { sidebarExpanded } = useSidebar();
  const marginLeft = sidebarExpanded ? 260 : 70;

  return (
    <>
      <LTBSidebar />
      <main
        className={mainStyles.main}
        style={{
          marginLeft,
          marginTop: 0,
          flex: 1,
          minHeight: 0,
          padding: "1.5rem 2rem",
          paddingBottom: 48,
          overflowY: "auto",
          overflowX: "hidden",
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
  const router = useRouter();

  useEffect(() => {
    if (!user) return;
    if ((user.divisi ?? "") !== LTB_DIVISI) {
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

  if ((user.divisi ?? "") !== LTB_DIVISI) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <p>Memuat...</p>
        <Link href="/dashboard">← Kembali ke Dashboard</Link>
      </div>
    );
  }

  return (
    <div
      style={{
        height: "calc(100vh - 80px)",
        display: "flex",
        flexDirection: "column",
        background: "var(--main_bg)",
      }}
    >
      <LTBLayoutContent>{children}</LTBLayoutContent>
    </div>
  );
}

