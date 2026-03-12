"use client";

import Header from "../../components/Header";
import { SidebarProvider } from "../../context/SidebarContext";

/** Layout Profile: Header + main. Pakai SidebarProvider agar Header (useSidebar) tidak error. */
export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <Header title="Profile" />
      <main
        style={{
          marginTop: 80,
          minHeight: "calc(100vh - 80px)",
          background: "linear-gradient(0deg, #e8ecf1 0%, #51515f 100%)",
        }}
      >
        {children}
      </main>
    </SidebarProvider>
  );
}
