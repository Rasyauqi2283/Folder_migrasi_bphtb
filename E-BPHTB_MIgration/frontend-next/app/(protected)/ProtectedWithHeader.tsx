"use client";

import { usePathname } from "next/navigation";
import Header from "../components/Header";
import UserSidebar from "../components/UserSidebar";
import { useSidebar } from "../context/SidebarContext";
import Footer from "../components/Footer";
import mainStyles from "../styles/protected-main.module.css";

function getHeaderTitle(pathname: string): string {
  if (pathname === "/admin") return "Dashboard";
  if (pathname?.startsWith("/admin/aplikasi")) return "Aplikasi";
  if (pathname.startsWith("/admin/data-user/pending")) return "Verifikasi Data User";
  if (pathname.startsWith("/admin/data-user/complete")) return "Data User";
  if (pathname.startsWith("/admin/referensi/pemutakhiran-ppat")) return "Pemutakhiran Data PPAT";
  if (pathname.startsWith("/admin/referensi/status-ppat")) return "Status PPAT";
  if (pathname.startsWith("/admin/referensi/validasi-qr")) return "Validasi QR";
  if (pathname.startsWith("/admin/group-user/users-group")) return "Users Group";
  if (pathname.startsWith("/admin/group-user/group-users")) return "Group Users";
  if (pathname.startsWith("/admin/group-user/group-privilege")) return "Group Privilege";
  if (pathname.startsWith("/admin/iklan")) return "Kelola Iklan";
  if (pathname?.startsWith("/admin")) return "Admin";
  if (pathname?.startsWith("/pu")) return "pu";
  if (pathname?.startsWith("/ltb")) return "LTB";
  if (pathname === "/dashboard") return "Dashboard";
  if (pathname?.startsWith("/wp")) return "Wajib Pajak";
  if (pathname?.startsWith("/info")) return "Informasi & Panduan";
  if (pathname?.startsWith("/wp/laporan")) return "Laporan WP";
  if (pathname?.startsWith("/cs")) return "Customer Service";
  if (pathname.startsWith("/profile")) return "Profil";
  if (pathname.startsWith("/lengkapi-profil")) return "Lengkapi Profil";
  if (pathname === "/faq") return "FAQ";
  return "E-BPHTB";
}

export default function ProtectedWithHeader({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { sidebarExpanded } = useSidebar();
  const title = getHeaderTitle(pathname ?? "");
  const isAdminRoute = pathname?.startsWith("/admin") ?? false;
  const isPURoute = pathname?.startsWith("/pu") ?? false;
  const isLtbRoute = pathname?.startsWith("/ltb") ?? false;
  const isLengkapiProfil = pathname === "/lengkapi-profil";
  const isProfileRoute = pathname?.startsWith("/profile") ?? false;

  // Lengkapi Profil: hanya main (tanpa Header, Sidebar, Footer) — seperti legacy profile-completetask.html
  if (isLengkapiProfil) {
    return <>{children}</>;
  }

  // Admin dan PPAT punya layout sendiri (AdminSidebar / PPATSidebar) — tidak pakai UserSidebar agar tidak duplikat
  return (
    <>
      <Header title={title} />
      <div style={{ paddingTop: 80 }} className="protected-wrapper">
        {isAdminRoute || isPURoute || isLtbRoute ? (
          children
        ) : (
          <>
            <UserSidebar />
            <main
              className={mainStyles.main}
              style={{
                marginLeft: sidebarExpanded ? 250 : 60,
                transition: "margin-left 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                minHeight: "calc(100vh - 80px - 40px)",
                paddingTop: isProfileRoute ? "1rem" : "1.5rem",
                paddingRight: isProfileRoute ? "1.5rem" : "2rem",
                paddingBottom: 48,
                paddingLeft: isProfileRoute ? "1.5rem" : "2rem",
                ...(isProfileRoute && { overflow: "hidden", display: "flex", flexDirection: "column" }),
              }}
            >
              {children}
            </main>
            <Footer />
          </>
        )}
      </div>
    </>
  );
}
