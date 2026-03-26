import Link from "next/link";
import LandingHeader from "./components/LandingHeader";
import LandingBanners from "./components/LandingBanners";
import LandingAmbientEffect from "./components/LandingAmbientEffect";
import LandingSupport from "./components/LandingSupport";
import RasproLogo from "./components/RasproLogo";
import BackendHealth from "./components/BackendHealth";
import styles from "./landing-stripe.module.css";

export const metadata = {
  title: "Selamat Datang",
  description: "Beranda resmi layanan BPHTB digital Kabupaten Bogor (E-BPHTB).",
};

export default function HomePage() {
  return (
    <div className="landing-page">
      <LandingSupport />
      <LandingAmbientEffect />
      <LandingHeader />
      <main className={`landing-main ${styles.landingMain}`}>
        <LandingBanners />

        {/* Hero — Stripe Sessions style, tema BPHTB, navy */}
        <section className={styles.hero}>
          <h1 className={styles.heroHeadline}>
            Layanan BPHTB
            <span className={styles.heroHeadlineAccent}>digital Kabupaten Bogor</span>
          </h1>
          <p className={styles.heroSubline}>
            Bea Perolehan Hak atas Tanah dan Bangunan · Cepat, transparan, terverifikasi
          </p>
          <p className={styles.heroCopy}>
            Layanan resmi Pemerintah Kabupaten Bogor melalui BAPPENDA. Proses pajak BPHTB secara digital, dari booking hingga validasi dokumen, dalam satu ekosistem terpadu.
          </p>
          <div className={styles.heroCtaWrap}>
            <Link href="/validasi-qr" className={styles.ctaPrimary}>
              Cek Keaslian Dokumen
            </Link>
            <Link href="/login" className={styles.ctaSecondary}>
              Masuk
            </Link>
          </div>
          <div className={styles.heroVisual}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/asset/JumlahPenerimaanPajak_dekorasi.svg"
              alt="Ilustrasi Pajak BPHTB"
            />
          </div>
        </section>

        {/* Wave divider — ombak aesthetic antara hero dan section */}
        <div className={styles.waveDivider}>
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 60 Q300 20 600 60 T1200 60 V120 H0 Z" fill="rgba(255,255,255,0.04)" />
            <path d="M0 75 Q300 35 600 75 T1200 75 V120 H0 Z" fill="rgba(255,255,255,0.02)" />
          </svg>
        </div>

        {/* Section: Mengapa E-BPHTB — Stripe "Why attend" style */}
        <section className={styles.section} id="mengapa">
          <h2 className={styles.sectionTitle}>Mengapa E-BPHTB?</h2>
          <p className={styles.sectionSubtitle}>
            Satu pintu untuk layanan BPHTB yang andal dan akuntabel.
          </p>
          <div className={styles.cardsGrid}>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Cepat &amp; digital</h3>
              <p className={styles.cardText}>
                Proses dari booking hingga validasi dapat dilakukan secara online, mengurangi antre dan waktu penyelesaian.
              </p>
            </div>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Transparan</h3>
              <p className={styles.cardText}>
                Status berkas dan tahapan proses dapat dilacak. Dokumen terverifikasi dengan QR untuk cek keaslian.
              </p>
            </div>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Terverifikasi</h3>
              <p className={styles.cardText}>
                Gunakan fitur Cek Keaslian Dokumen untuk memastikan SSPD dan dokumen BPHTB Anda sah dan tercatat.
              </p>
            </div>
          </div>
        </section>
      </main>
      <footer className="landing-footer">
        <span className="landing-footer-left"><BackendHealth /></span>
        <span className="landing-footer-center">2026-Bappenda Kabupaten Bogor</span>
        <span className="landing-footer-right">
          <RasproLogo size="sm" theme="dark" asLink hrefExternal />
        </span>
      </footer>
    </div>
  );
}
