import type { Metadata } from "next";
import LayoutClient from "./LayoutClient";

export const metadata: Metadata = {
  title: "PV",
  description: "Dashboard Peneliti Validasi (PV) untuk monitoring dan validasi dokumen E-BPHTB.",
};

export default function PenelitiValidasiLayout({ children }: { children: React.ReactNode }) {
  return <LayoutClient>{children}</LayoutClient>;
}
