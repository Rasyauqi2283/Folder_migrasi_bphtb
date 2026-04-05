import type { Metadata } from "next";
import LayoutClient from "./LayoutClient";

export const metadata: Metadata = {
  title: "PU",
  description: "Dashboard PU (PPAT/PPATS/Notaris) untuk pengajuan dan pemantauan layanan E-BPHTB.",
};

export default function PPATLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <LayoutClient>{children}</LayoutClient>;
}
