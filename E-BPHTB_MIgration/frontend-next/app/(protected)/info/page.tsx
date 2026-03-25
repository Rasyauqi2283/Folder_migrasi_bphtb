"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import {
  isBankDivisi,
  runBankDashboardTourFromInfo,
  runGenericDashboardIntroTour,
} from "../../components/tours/bankDashboardTour";

/**
 * Halaman Informasi & Panduan.
 * Isi (markdown) dapat ditambahkan kemudian.
 */
export default function InfoPage() {
  const router = useRouter();
  const { user } = useAuth();

  const startDashboardTour = () => {
    if (isBankDivisi(user?.divisi)) {
      runBankDashboardTourFromInfo(router);
      return;
    }
    runGenericDashboardIntroTour();
  };

  return (
    <div id="tour-info-root" style={{ maxWidth: 800, margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 12,
        }}
      >
        <h1 style={{ margin: 0, color: "var(--color_font_main)", flex: "1 1 240px" }}>
          Informasi &amp; Panduan
        </h1>
        <button
          type="button"
          onClick={startDashboardTour}
          style={{
            padding: "10px 18px",
            borderRadius: 10,
            border: "1px solid var(--border_color)",
            background: "linear-gradient(135deg, var(--accent), #1e3a8a)",
            color: "#fff",
            fontWeight: 600,
            fontSize: "0.95rem",
            cursor: "pointer",
            boxShadow: "var(--shadow_card)",
          }}
        >
          Mulai Panduan Dashboard
        </button>
      </div>
      <p style={{ margin: 0, color: "var(--color_font_muted)", marginBottom: 24 }}>
        Konten panduan dan informasi akan ditampilkan di sini (dapat berupa markdown).
      </p>

      <div
        className="info-content"
        style={{
          background: "var(--card_bg)",
          border: "1px solid var(--border_color)",
          borderRadius: 12,
          padding: 24,
          minHeight: 200,
          color: "var(--color_font_main)",
        }}
      >
        <p style={{ color: "var(--color_font_main_muted)" }}>
          [Area konten — isi markdown dapat Anda berikan nanti.]
        </p>
        <p style={{ marginTop: 16, fontSize: "0.9rem", color: "var(--color_font_main_muted)" }}>
          Tombol <strong>Mulai Panduan Dashboard</strong> menjalankan panduan visual (layar gelap dan penjelasan
          langkah demi langkah). Untuk peran <strong>Bank</strong>, tur mencakup Dasbor Bank dan halaman verifikasi
          transaksi. Peran lain saat ini menerima panduan profil di header; materi peran lain dapat ditambahkan
          bertahap.
        </p>
      </div>

      <p style={{ marginTop: 24 }}>
        <Link href="/dashboard" style={{ color: "var(--accent)", fontWeight: 600 }}>
          ← Kembali ke Dashboard
        </Link>
      </p>
    </div>
  );
}
