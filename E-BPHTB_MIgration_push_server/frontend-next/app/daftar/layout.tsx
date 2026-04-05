import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Registrasi",
  description: "Registrasi akun E-BPHTB untuk Wajib Pajak, Karyawan, atau PPAT/PPATS.",
};

export default function DaftarLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

