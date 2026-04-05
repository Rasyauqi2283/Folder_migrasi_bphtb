"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

const SidebarContext = createContext<{
  sidebarExpanded: boolean;
  toggleSidebar: () => void;
} | null>(null);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  const toggleSidebar = useCallback(() => {
    setSidebarExpanded((prev) => !prev);
  }, []);

  return (
    <SidebarContext.Provider value={{ sidebarExpanded, toggleSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar must be used within SidebarProvider");
  return ctx;
}
