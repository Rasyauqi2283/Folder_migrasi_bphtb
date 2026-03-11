"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

export default function AdminPemutakhiranPpatByUserPage() {
  const params = useParams();
  const userid = typeof params?.userid === "string" ? params.userid : "";

  return (
    <div>
      <h1 style={{ color: "#fff", margin: "0 0 0.5rem" }}>
        Pemutakhiran Data PPAT — {userid || "User"}
      </h1>
      <p style={{ color: "rgba(255,255,255,0.7)", margin: "0 0 1rem" }}>
        Form pemutakhiran untuk user ini. Gunakan versi legacy untuk fitur lengkap.
      </p>
      <Link
        href={`/html_folder/Admin/referensi_user/admin-datauser-pemutakhiranppat.html?userid=${encodeURIComponent(userid)}`}
        style={{
          display: "inline-block",
          padding: "8px 16px",
          background: "#3b82f6",
          color: "#fff",
          borderRadius: 8,
          textDecoration: "none",
        }}
      >
        Buka form di versi legacy →
      </Link>
      <p style={{ marginTop: "1rem" }}>
        <Link href="/admin/referensi/pemutakhiran-ppat" style={{ color: "#60a5fa", textDecoration: "none" }}>
          ← Kembali ke Pemutakhiran PPAT
        </Link>
      </p>
    </div>
  );
}
