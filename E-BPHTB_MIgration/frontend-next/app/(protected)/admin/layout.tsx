"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { useEffect } from "react";

import { SidebarProvider, useSidebar } from "../../context/SidebarContext";
import Header from "../../components/Header";
import AdminSidebar from "../../components/admin/AdminSidebar";
import Footer from "../../components/Footer";

/** Map path ke judul header */
function getHeaderTitle(pathname: string): string {
  if (pathname === "/admin") return "Dashboard";
  if (pathname.startsWith("/admin/aplikasi")) return "Aplikasi";
  if (pathname.startsWith("/admin/data-user/pending")) return "Verifikasi Data User";
  if (pathname.startsWith("/admin/data-user/complete")) return "Data User";
  if (pathname.startsWith("/admin/referensi/pemutakhiran-ppat")) return "Pemutakhiran Data PPAT";
  if (pathname.startsWith("/admin/referensi/status-ppat")) return "Status PPAT";
  if (pathname.startsWith("/admin/referensi/validasi-qr")) return "Validasi QR";
  return "Admin";
}

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { sidebarExpanded } = useSidebar();
  const pathname = usePathname();
  const marginLeft = sidebarExpanded ? 260 : 70;

  return (
    <>
      <Header title={getHeaderTitle(pathname)} />
      <AdminSidebar />
      <main
        style={{
          marginLeft,
          marginTop: 80,
          marginBottom: 40,
          padding: "1.5rem 2rem",
          overflow: "auto",
          minHeight: "calc(100vh - 80px - 40px)",
          transition: "margin-left 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
          background: "var(--main_bg)",
          color: "var(--color_font_main)",
        }}
      >
        {children}
      </main>
      <Footer />
    </>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!user) return;
    if (user.divisi !== "Administrator") {
      router.replace("/dashboard");
    }
  }, [user, router]);

  if (!user || user.divisi !== "Administrator") {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <p>Memuat...</p>
        <p><Link href="/dashboard">← Kembali ke Dashboard</Link></p>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div
        style={{
          minHeight: "100vh",
          background: "var(--base_dark)",
        }}
      >
        <AdminLayoutContent>{children}</AdminLayoutContent>
      </div>
    </SidebarProvider>
  );
}
