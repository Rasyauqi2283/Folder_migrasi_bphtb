import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verifikasi OTP | BAPPENDA BPHTB",
  description: "Verifikasi kode OTP untuk aktivasi akun E-BPHTB",
};

export default function VerifikasiOtpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
