import type { Metadata } from "next";
import LayoutClient from "./LayoutClient";

export const metadata: Metadata = {
  title: "CS",
  description: "Dashboard Customer Service untuk pengelolaan tiket dan balasan pengguna E-BPHTB.",
};

export default function CsLayout({ children }: { children: React.ReactNode }) {
  return <LayoutClient>{children}</LayoutClient>;
}
