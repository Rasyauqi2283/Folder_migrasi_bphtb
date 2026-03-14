"use client";

import { SidebarProvider } from "../../context/SidebarContext";

/** Layout Profile: satu latar saja (main_bg), no layering. */
export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <main
        style={{
          marginTop: 0,
          minHeight: 0,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          background: "var(--main_bg)",
        }}
      >
        {children}
      </main>
    </SidebarProvider>
  );
}
