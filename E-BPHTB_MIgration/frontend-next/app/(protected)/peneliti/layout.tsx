import type { Metadata } from "next";
import LayoutClient from "./LayoutClient";

export const metadata: Metadata = {
  title: "Peneliti",
  description: "Dashboard Peneliti untuk verifikasi dan pengelolaan berkas E-BPHTB.",
};

export default function PenelitiLayout({ children }: { children: React.ReactNode }) {
  return <LayoutClient>{children}</LayoutClient>;
}
