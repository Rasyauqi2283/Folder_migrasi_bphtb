"use client";

import { usePathname } from "next/navigation";
import Header from "../components/Header";
import UserSidebar from "../components/UserSidebar";
import Footer from "../components/Footer";
import mainStyles from "../styles/protected-main.module.css";

function getHeaderTitle(pathname: string): string {
  if (pathname === "/admin") return "Dashboard";
  if (pathname.startsWith("/admin/aplikasi")) return "Aplikasi";
  if (pathname.startsWith("/admin/data-user/pending")) return "Verifikasi Data User";
  if (pathname.startsWith("/admin/data-user/complete")) return "Data User";
  if (pathname.startsWith("/admin/referensi/pemutakhiran-ppat")) return "Pemutakhiran Data PPAT";
  if (pathname.startsWith("/admin/referensi/status-ppat")) return "Status PPAT";
  if (pathname.startsWith("/admin/referensi/validasi-qr")) return "Validasi QR";
  if (pathname.startsWith("/admin/group-user/users-group")) return "Users Group";
  if (pathname.startsWith("/admin/group-user/group-users")) return "Group Users";
  if (pathname.startsWith("/admin/group-user/group-privilege")) return "Group Privilege";
  if (pathname.startsWith("/admin/iklan")) return "Kelola Iklan";
  if (pathname.startsWith("/admin")) return "Admin";
  if (pathname === "/dashboard") return "Dashboard";
  if (pathname.startsWith("/profile")) return "Profil";
  if (pathname.startsWith("/lengkapi-profil")) return "Lengkapi Profil";
  if (pathname === "/faq") return "FAQ";
  return "E-BPHTB";
}

export default function ProtectedWithHeader({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const title = getHeaderTitle(pathname ?? "");
  const isAdminRoute = pathname?.startsWith("/admin") ?? false;

  return (
    <>
      <Header title={title} />
      <div style={{ paddingTop: 80 }} className="protected-wrapper">
        {isAdminRoute ? (
          children
        ) : (
          <>
            <UserSidebar />
            <main
              className={mainStyles.main}
              style={{
                marginLeft: 260,
                minHeight: "calc(100vh - 80px - 40px)",
                padding: "1.5rem 2rem",
                paddingBottom: 48,
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
