"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Fragment, ReactNode, useMemo } from "react";
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
  const isAdmin = String(user?.divisi || "").toLowerCase() === "admin";

  const adminGuideMarkdown = useMemo(
    () => `## Panduan Admin — E-BPHTB

### Apa itu Admin?
Admin adalah **peran pengelola & pemantau sistem**. Fokus utama Admin bukan mengerjakan 1 berkas, tetapi:
- Memantau kondisi aplikasi (kelancaran proses, antrian, kuota).
- Mengelola data pengguna (akun/role/divisi).
- Mengatur informasi yang ditampilkan ke pengguna (mis. iklan/pengumuman) dan membantu koordinasi operasional.

### Kegiatan utama di menu Admin
- **Monitoring & kontrol operasional**: memantau aktivitas layanan harian, memastikan alur kerja berjalan baik.
- **Pengelolaan pengguna**: menambah/mengubah status akun, memastikan divisi yang benar agar akses menu sesuai.
- **Pengaturan konten & komunikasi**: menyampaikan pengumuman/iklan/informasi penting agar pengguna paham kondisi layanan.

### Banyak menu interaktif, maksudnya apa?
Di Admin biasanya ada banyak menu karena Admin adalah “panel kendali”. Menu-menu ini bersifat:
- **Interaktif**: ada form, tombol aksi, filter, dan tabel data.
- **Berisiko tinggi jika salah**: karena perubahan Admin bisa berdampak ke banyak pengguna.

> Prinsipnya: **Admin melihat gambaran besar**, bukan hanya 1 transaksi.

### Apa itu menu Iklan?
Menu **Iklan** (atau Pengumuman/Banner) adalah tempat untuk menampilkan informasi resmi di aplikasi, contohnya:
- Jadwal pelayanan.
- Informasi gangguan.
- Pemberitahuan perubahan prosedur.

**Cara pakainya (umum):**
1. Masuk ke menu **Iklan**.
2. Buat iklan/pengumuman baru (judul, isi, periode tampil).
3. Simpan.
4. Pastikan tampil di halaman yang dituju, lalu nonaktifkan jika sudah tidak relevan.

**Best practice:**
- Tulis singkat, jelas, dan ada tanggal/jam berlaku.
- Hindari informasi ambigu.
- Jika ada ETA (perkiraan selesai), tulis format yang konsisten.

### Apa itu menu User?
Menu **User** adalah tempat Admin mengelola akun pengguna aplikasi.
Biasanya meliputi:
- Melihat daftar user.
- Mengecek divisi/role (mis. admin, cs, peneliti, bank, dll).
- Mengaktifkan/nonaktifkan akun jika diperlukan.

**Cara pakainya (umum):**
1. Masuk menu **User**.
2. Cari user (pakai pencarian/filter).
3. Buka detail user.
4. Periksa dan sesuaikan **divisi** (ini yang menentukan akses menu).
5. Simpan perubahan.

### Catatan keamanan & tanggung jawab Admin
- Jangan bagikan akses Admin ke orang yang tidak berwenang.
- Perubahan di Admin sebaiknya bisa ditelusuri (siapa, kapan, apa yang diubah).
- Jika ada hal sensitif (data pribadi), akses dan ekspor data harus mengikuti kebijakan instansi.
`,
    []
  );

  const adminGuide = useMemo(() => renderSimpleMarkdown(adminGuideMarkdown), [adminGuideMarkdown]);

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
        Halaman ini berisi ringkasan panduan berbentuk markdown. Beberapa konten bersifat khusus sesuai peran.
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
        {!isAdmin ? (
          <div
            style={{
              padding: 14,
              borderRadius: 10,
              border: "1px solid rgba(239, 68, 68, 0.35)",
              background: "rgba(239, 68, 68, 0.08)",
              color: "var(--color_font_main)",
            }}
          >
            <p style={{ margin: 0, fontWeight: 700 }}>Konten Admin tidak tersedia.</p>
            <p style={{ margin: "8px 0 0", color: "var(--color_font_main_muted)" }}>
              Panduan ini hanya dapat dibaca oleh pengguna dengan divisi <strong>admin</strong>.
            </p>
          </div>
        ) : (
          <article style={{ lineHeight: 1.7 }}>{adminGuide}</article>
        )}
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

function renderSimpleMarkdown(md: string): ReactNode {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const out: ReactNode[] = [];

  let paragraph: string[] = [];
  let list: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length === 0) return;
    const text = paragraph.join(" ").trim();
    if (text) out.push(<p key={`p-${out.length}`} style={{ margin: "0 0 12px" }}>{renderInline(text)}</p>);
    paragraph = [];
  };

  const flushList = () => {
    if (list.length === 0) return;
    out.push(
      <ul key={`ul-${out.length}`} style={{ margin: "0 0 12px 18px" }}>
        {list.map((item, idx) => (
          <li key={idx} style={{ margin: "6px 0" }}>
            {renderInline(item)}
          </li>
        ))}
      </ul>
    );
    list = [];
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    const t = line.trim();

    if (!t) {
      flushList();
      flushParagraph();
      continue;
    }

    if (t.startsWith("## ")) {
      flushList();
      flushParagraph();
      out.push(
        <h2 key={`h2-${out.length}`} style={{ margin: "0 0 10px", fontSize: "1.25rem" }}>
          {renderInline(t.slice(3).trim())}
        </h2>
      );
      continue;
    }

    if (t.startsWith("### ")) {
      flushList();
      flushParagraph();
      out.push(
        <h3 key={`h3-${out.length}`} style={{ margin: "14px 0 8px", fontSize: "1.05rem" }}>
          {renderInline(t.slice(4).trim())}
        </h3>
      );
      continue;
    }

    if (t.startsWith("> ")) {
      flushList();
      flushParagraph();
      out.push(
        <blockquote
          key={`bq-${out.length}`}
          style={{
            margin: "10px 0 12px",
            padding: "10px 12px",
            borderLeft: "3px solid var(--accent)",
            background: "rgba(37, 99, 235, 0.08)",
            borderRadius: 10,
          }}
        >
          <p style={{ margin: 0, color: "var(--color_font_main)" }}>{renderInline(t.slice(2).trim())}</p>
        </blockquote>
      );
      continue;
    }

    if (t.startsWith("- ")) {
      flushParagraph();
      list.push(t.slice(2).trim());
      continue;
    }

    flushList();
    paragraph.push(t);
  }

  flushList();
  flushParagraph();

  return <Fragment>{out}</Fragment>;
}

function renderInline(text: string): ReactNode {
  // supports **bold** only (minimal; enough for admin docs)
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((p, idx) => {
        const isBold = p.startsWith("**") && p.endsWith("**") && p.length >= 4;
        if (isBold) return <strong key={idx}>{p.slice(2, -2)}</strong>;
        return <Fragment key={idx}>{p}</Fragment>;
      })}
    </>
  );
}
