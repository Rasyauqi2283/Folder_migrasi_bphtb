import Link from "next/link";
import LandingHeader from "./components/LandingHeader";
import RasproLogo from "./components/RasproLogo";
import BackendHealth from "./components/BackendHealth";

const legacyBase = process.env.NEXT_PUBLIC_LEGACY_BASE_URL || "http://localhost:3000";

export default function HomePage() {
  return (
    <div className="landing-page">
      <LandingHeader />
      <main className="landing-main">
        <section className="landing-hero">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/asset/JumlahPenerimaanPajak_dekorasi.svg" alt="Ilustrasi Pajak" className="landing-hero-img" />
        <div className="landing-hero-text">
          <h1>Selamat Datang di E-BPHTB Kabupaten Bogor</h1>
          <p>
            Layanan resmi Bea Perolehan Hak atas Tanah dan Bangunan secara digital, cepat, dan transparan.
          </p>
          <Link href={`${legacyBase}/public-validasi-qr.html`} className="cta">
            Cek Keaslian Dokumen
          </Link>
        </div>
      </section>
      </main>
      <footer className="landing-footer">
        <span className="landing-footer-left"><BackendHealth /></span>
        <span className="landing-footer-center">© 2025 Pemerintah Kabupaten Bogor – BAPPENDA</span>
        <span className="landing-footer-right">
          <RasproLogo size="sm" theme="dark" asLink hrefExternal />
        </span>
      </footer>
    </div>
  );
}
