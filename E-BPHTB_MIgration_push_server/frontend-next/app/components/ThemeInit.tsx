"use client";

import { useEffect } from "react";

const THEME_KEY = "app_theme";
const VALID_THEMES = ["default", "summer", "eid", "trust", "moderngov", "corporate", "midnight", "emerald"] as const;

function applyTheme(theme: string) {
  const val = theme && VALID_THEMES.includes(theme as (typeof VALID_THEMES)[number]) ? theme : "default";
  document.documentElement.setAttribute("data-theme", val);
}

export function ThemeInit() {
  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem(THEME_KEY) : null;
    applyTheme(saved ?? "default");
  }, []);

  useEffect(() => {
    const handler = () => {
      const saved = localStorage.getItem(THEME_KEY);
      applyTheme(saved ?? "default");
    };
    window.addEventListener("app-theme-changed", handler);
    return () => window.removeEventListener("app-theme-changed", handler);
  }, []);

  return null;
}
