import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile | BPHTB",
  description: "Profil pengguna E-BPHTB",
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
