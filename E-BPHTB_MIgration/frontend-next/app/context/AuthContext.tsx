"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

export interface AuthUser {
  userid: string;
  divisi: string;
  nama: string;
  email: string;
  gender?: string;
  is_profile_complete?: string;
}

const AuthContext = createContext<{
  user: AuthUser | null;
  loading: boolean;
  logout: () => void;
  refresh: () => void;
} | null>(null);

function readUserFromStorage(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const userid = localStorage.getItem("userid");
  if (!userid) return null;
  return {
    userid,
    divisi: localStorage.getItem("divisi") ?? "",
    nama: localStorage.getItem("nama") ?? "",
    email: localStorage.getItem("email") ?? "",
    gender: localStorage.getItem("gender") ?? undefined,
    is_profile_complete: localStorage.getItem("is_profile_complete") ?? "",
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    setUser(readUserFromStorage());
  }, []);

  useEffect(() => {
    setUser(readUserFromStorage());
    setLoading(false);
  }, []);

  const logout = useCallback(() => {
    if (typeof window === "undefined") return;
    localStorage.removeItem("userid");
    localStorage.removeItem("divisi");
    localStorage.removeItem("nama");
    localStorage.removeItem("email");
    localStorage.removeItem("telepon");
    localStorage.removeItem("foto");
    localStorage.removeItem("username");
    localStorage.removeItem("nip");
    localStorage.removeItem("special_field");
    localStorage.removeItem("is_profile_complete");
    localStorage.removeItem("gender");
    setUser(null);
    window.location.href = "/login";
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
