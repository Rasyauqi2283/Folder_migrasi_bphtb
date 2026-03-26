import type { Metadata } from "next";
import LayoutClient from "./LayoutClient";

export const metadata: Metadata = {
  title: "LTB",
  description: "Dashboard LTB untuk penerimaan dan pengelolaan berkas SSPD pada E-BPHTB.",
};

export default function LTBLayout({ children }: { children: React.ReactNode }) {
  return <LayoutClient>{children}</LayoutClient>;
}
