"use client";

import type { ReadonlyURLSearchParams } from "next/navigation";

export type TourRouter = { push: (href: string) => void; replace: (href: string) => void };
import { driver, type Config, type DriveStep } from "driver.js";
import "driver.js/dist/driver.css";

const HEADER_PROFILE_TITLE = "Menu profil & kelengkapan diri";
const HEADER_PROFILE_DESC =
  "Ini area profil Anda di pojok kanan atas. Buka menu ini untuk masuk ke halaman Profil. Pastikan tanda tangan digital dan paraf (jika diperlukan) sudah diunggah dengan benar — tanpa itu, dokumen yang Anda verifikasi bisa tidak diakui sah oleh sistem.";

const TOUR_QUERY_BANK_MAIN = "bank-main";
const TOUR_QUERY_BANK_TABLE = "bank-table";

function baseConfig(overrides?: Partial<Config>): Config {
  return {
    showProgress: true,
    animate: true,
    overlayOpacity: 0.82,
    overlayColor: "#0f172a",
    stagePadding: 10,
    stageRadius: 12,
    allowClose: true,
    overlayClickBehavior: "close",
    smoothScroll: true,
    progressText: "{{current}} dari {{total}}",
    nextBtnText: "Lanjut",
    prevBtnText: "Kembali",
    doneBtnText: "Selesai",
    ...overrides,
  };
}

export function stripTourGuide(router: TourRouter, pathname: string): void {
  router.replace(pathname);
}

function filterSteps(steps: DriveStep[]): DriveStep[] {
  return steps.filter((s) => {
    if (s.element == null) return true;
    if (typeof s.element === "string") return !!document.querySelector(s.element);
    return true;
  });
}

/** Fase 1: dari halaman Informasi & Panduan → header → lanjut ke /bank */
export function runBankDashboardTourFromInfo(router: TourRouter): void {
  const steps: DriveStep[] = filterSteps([
    {
      element: "#header-profile",
      popover: {
        title: HEADER_PROFILE_TITLE,
        description: HEADER_PROFILE_DESC,
        side: "bottom",
        align: "end",
      },
    },
    {
      popover: {
        title: "Mengunjungi Dasbor Bank",
        description:
          "Berikutnya kita akan pindah ke Dasbor Bank. Di sana Anda melihat ringkasan jumlah transaksi. Tekan Lanjut untuk membuka halaman tersebut. Anda bisa membatalkan dengan menutup ikon silang.",
        side: "over",
        align: "center",
        onNextClick: (_el, _step, { driver: d }) => {
          d.destroy();
          router.push(`/bank?tourGuide=${TOUR_QUERY_BANK_MAIN}`);
        },
      },
    },
  ]);

  if (steps.length === 0) return;
  const d = driver(baseConfig({ steps }));
  d.drive();
}

/** Fase 2: di /bank setelah ?tourGuide=bank-main */
export function runBankMainTourIfRequested(
  router: TourRouter,
  pathname: string,
  searchParams: ReadonlyURLSearchParams
): void {
  if (searchParams.get("tourGuide") !== TOUR_QUERY_BANK_MAIN) return;

  stripTourGuide(router, pathname);

  window.setTimeout(() => {
    const steps: DriveStep[] = filterSteps([
      {
        element: "#bank-tour-greeting",
        popover: {
          title: "Sapaan ringkas",
          description:
            "Bagian ini mengingatkan peran Anda sebagai Bank. Gunakan dasbor ini sebagai titik awal sebelum memeriksa transaksi.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#menu-bank-transaksi-section",
        popover: {
          title: "Menu hasil transaksi",
          description:
            "Blok menu ini bernama Transaksi BANK. Klik untuk membuka sub-menu, lalu pilih Hasil transaksi guna melihat semua pembayaran yang perlu Anda verifikasi (bisa juga lewat kartu ringkasan di bawah).",
          side: "right",
          align: "start",
        },
        onHighlightStarted: () => {
          document.getElementById("menu-bank-transaksi-section")?.scrollIntoView({ block: "center", behavior: "smooth" });
        },
      },
      {
        element: "#bank-tour-summary-cards",
        popover: {
          title: "Ringkasan angka di dasbor",
          description:
            "Kartu-kartu ini menampilkan jumlah transaksi menunggu tinjauan (Pending), yang sudah pernah Anda review, yang disetujui, dan yang ditolak. Anda bisa mengetuk salah satu kartu untuk langsung menuju daftar transaksi dengan filter yang sama.",
          side: "top",
          align: "start",
        },
      },
      {
        element: "#bank-tour-card-pending",
        popover: {
          title: "Transaksi menunggu",
          description:
            "Kartu kuning biasanya berisi hitungan yang masih harus Anda telaah — setara dengan status menunggu keputusan di sistem. Klik kartu atau menu Hasil transaksi untuk mulai memverifikasi pembayaran.",
          side: "top",
          align: "start",
        },
      },
      {
        popover: {
          title: "Membuka tabel verifikasi",
          description:
            "Tekan Lanjut untuk membuka halaman Verifikasi Pembayaran Bank. Di sana Anda akan melihat tab, filter pencarian, dan tabel beserta tombol setujui atau tolak.",
          side: "over",
          align: "center",
          onNextClick: (_el, _step, { driver: d }) => {
            d.destroy();
            router.push(`/bank/hasil-transaksi?tourGuide=${TOUR_QUERY_BANK_TABLE}`);
          },
        },
      },
    ]);

    if (steps.length === 0) return;
    const d = driver(baseConfig({ steps }));
    d.drive();
  }, 400);
}

/** Fase 3: di /bank/hasil-transaksi */
export function runBankTableTourIfRequested(router: TourRouter, searchParams: ReadonlyURLSearchParams): void {
  if (searchParams.get("tourGuide") !== TOUR_QUERY_BANK_TABLE) return;

  const pathname = "/bank/hasil-transaksi";
  stripTourGuide(router, pathname);

  window.setTimeout(() => {
    const steps: DriveStep[] = filterSteps([
      {
        element: "#bank-tour-tabs",
        popover: {
          title: "Memisahkan tahapan",
          description:
            "Tab Pending Review berisi pembayaran yang belum Anda putuskan. Tab Sudah di Review menampilkan transaksi yang sudah disetujui atau ditolak. Pindah tab sesuai pekerjaan Anda.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#bank-tour-filters",
        popover: {
          title: "Filter dan pencarian",
          description:
            "Filter status membantu menyaring misalnya hanya Disetujui atau Ditolak. Kolom cari mencocokkan nomor registrasi, booking, nama wajib pajak, atau nomor bukti. Gunakan tombol Cari untuk menjalankan pencarian, dan Muat ulang jika data terasa tidak segar.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#bank-tour-table",
        popover: {
          title: "Tabel transaksi & tindakan",
          description:
            "Kolom status memakai warna: kuning/oranye berarti masih menunggu tindakan Anda (belum disetujui/ditolak). Hijau berarti disetujui, merah berarti ditolak. Pada baris yang masih aktif, tombol hijau menyetujui pembayaran dan tombol merah menolak — saat menolak, Anda wajib mengisi alasan singkat agar pemohon memahami.",
          side: "top",
          align: "start",
        },
      },
      {
        popover: {
          title: "Selesai",
          description:
            "Itu ringkasan alur verifikasi Bank di layar ini. Silakan ulang panduan kapan saja dari menu Informasi & Panduan jika diperlukan.",
          side: "over",
          align: "center",
        },
      },
    ]);

    if (steps.length === 0) return;
    const d = driver(baseConfig({ steps }));
    d.drive();
  }, 100);
}

/** Panduan singkat non-Bank: hanya header profil + penutup */
export function runGenericDashboardIntroTour(): void {
  const steps = filterSteps([
    {
      element: "#header-profile",
      popover: {
        title: HEADER_PROFILE_TITLE,
        description: HEADER_PROFILE_DESC,
        side: "bottom",
        align: "end",
      },
    },
    {
      popover: {
        title: "Lanjutkan dari dasbor Anda",
        description:
          "Panduan langkah demi langkah per peran lain (misalnya Peneliti atau LTB) akan terus kami tambahkan. Untuk saat ini, buka menu samping sesuai tugas Anda — banyak fitur memiliki petunjuk di dalam halaman yang bersangkutan.",
        side: "over",
        align: "center",
      },
    },
  ]);
  if (steps.length === 0) return;
  const d = driver(baseConfig({ steps }));
  d.drive();
}

export function isBankDivisi(divisi: string | undefined): boolean {
  return (divisi ?? "").trim().toUpperCase() === "BANK";
}
