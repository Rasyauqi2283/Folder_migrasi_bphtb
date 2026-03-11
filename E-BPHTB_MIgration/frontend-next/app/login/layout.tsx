import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login | BAPPENDA BPHTB",
  description: "Masuk ke sistem E-BPHTB Kabupaten Bogor",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
