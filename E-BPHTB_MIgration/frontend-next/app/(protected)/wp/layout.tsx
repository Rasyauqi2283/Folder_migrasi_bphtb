import type { Metadata } from "next";
import LayoutClient from "./LayoutClient";

export const metadata: Metadata = {
  title: "WP",
  description: "Dashboard Wajib Pajak untuk pemantauan layanan dan kebutuhan E-BPHTB.",
};

export default function WpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <LayoutClient>{children}</LayoutClient>;
}
