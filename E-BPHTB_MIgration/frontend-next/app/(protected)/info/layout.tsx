import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Informasi & Panduan",
};

export default function InfoLayout({ children }: { children: React.ReactNode }) {
  return children;
}

