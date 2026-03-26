import type { Metadata } from "next";
import LayoutClient from "./LayoutClient";

export const metadata: Metadata = {
  title: "Bank",
  description: "Dashboard Bank untuk verifikasi dan pemantauan transaksi E-BPHTB.",
};

export default function BankLayout({ children }: { children: React.ReactNode }) {
  return <LayoutClient>{children}</LayoutClient>;
}
