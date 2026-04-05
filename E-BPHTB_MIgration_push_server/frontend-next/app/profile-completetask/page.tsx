"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Redirect legacy route /profile-completetask ke /lengkapi-profil (protected).
 * Laman lengkapi profil migrasi: PU hanya Username; PV = Username + Nama Paraf Validasi; lainnya NIP + Username sesuai divisi.
 */
export default function ProfileCompleteTaskRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/lengkapi-profil");
  }, [router]);
  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <p>Mengalihkan ke Lengkapi Profil...</p>
    </div>
  );
}
