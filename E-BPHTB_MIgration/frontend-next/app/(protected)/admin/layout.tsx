import type { Metadata } from "next";
import LayoutClient from "./LayoutClient";

export const metadata: Metadata = {
  title: "Admin",
  description: "Dashboard Admin untuk pengelolaan dan pemantauan sistem E-BPHTB.",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <LayoutClient>{children}</LayoutClient>;
}
