import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ubah Kata Sandi | BPHTB",
  description: "Buat kata sandi baru untuk akun E-BPHTB",
};

export default function UbahKatasandiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
