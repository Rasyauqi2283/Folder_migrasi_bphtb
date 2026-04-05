import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lengkapi Profil | BPHTB",
  description: "Lengkapi profil akun E-BPHTB",
};

export default function ProfileCompleteTaskLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
