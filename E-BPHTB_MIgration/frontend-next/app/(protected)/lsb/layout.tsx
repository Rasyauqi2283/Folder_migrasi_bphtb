import type { Metadata } from "next";
import LayoutClient from "./LayoutClient";

export const metadata: Metadata = {
  title: "LSB",
  description: "Dashboard LSB untuk monitoring dan pelayanan penyerahan SSPD pada E-BPHTB.",
};

export default function LSBLayout({ children }: { children: React.ReactNode }) {
  return <LayoutClient>{children}</LayoutClient>;
}
