import type { DriveStep } from "driver.js";

function normDivisi(d: string | undefined): string {
  return (d ?? "").trim();
}

/** Teks pembuka disesuaikan peran — bahasa lugas untuk pengguna layanan */
export function getTourCopy(divisi: string | undefined, isAdmin: boolean): {
  welcomeTitle: string;
  welcomeDesc: string;
  searchTitle: string;
  searchDesc: string;
  listTitle: string;
  listDesc: string;
  modalTitle: string;
  modalDesc: string;
  adminPanelTitle: string;
  adminPanelDesc: string;
  questionTitle: string;
  questionDesc: string;
  answerTitle: string;
  answerDesc: string;
  rolesTitle: string;
  rolesDesc: string;
  publishTitle: string;
  publishDesc: string;
  adminListTitle: string;
  adminListDesc: string;
} {
  const d = normDivisi(divisi);

  const roleLine = (() => {
    switch (d) {
      case "Administrator":
        return "Anda sebagai administrator dapat mengelola isi FAQ untuk semua pengguna.";
      case "Peneliti":
        return "Sebagai Peneliti, gunakan halaman ini untuk memahami tata cara verifikasi dan kebijakan yang sering ditanyakan.";
      case "Peneliti Validasi":
        return "Sebagai Peneliti Validasi, FAQ membantu menyelaraskan langkah paraf dan validasi dokumen.";
      case "BANK":
      case "Bank":
        return "Sebagai pihak Bank, gunakan FAQ untuk referensi alur transaksi, pencatatan, dan pertanyaan teknis layanan.";
      case "LTB":
        return "Sebagai petugas LTB, manfaatkan FAQ untuk panduan penginputan offline dan alur penyerahan berkas.";
      case "LSB":
        return "Sebagai petugas LSB, FAQ merangkum informasi seputar penyerahan SSPD dan pelayanan lapangan.";
      case "Wajib Pajak":
        return "Sebagai Wajib Pajak, Anda dapat membaca jawaban umum mengenai BPHTB tanpa harus menghubungi call center.";
      case "Customer Service":
        return "Sebagai Customer Service, FAQ ini menjadi acuan cepat saat membantu pengguna Layanan.";
      case "PPAT":
      case "PPATS":
      case "Notaris":
        return "Sebagai PPAT/Notaris, gunakan FAQ untuk konsistensi informasi kepada klien mengenai proses digital BPHTB.";
      default:
        return "Gunakan halaman ini untuk mencari jawaban atas pertanyaan yang sering diajukan.";
    }
  })();

  const welcomeTitle = isAdmin ? "Panduan singkat: kelola Informasi & FAQ" : "Selamat datang di Informasi & Panduan";
  const welcomeDesc = isAdmin
    ? `${roleLine} Berikut ringkasan area formulir dan daftar pertanyaan. Anda dapat membuka ulang panduan ini kapan saja dari tombol "Bantuan visual".`
    : `${roleLine} Kami akan menunjukkan cara mencari topik dan membaca jawaban. Tombol "Bantuan visual" selalu tersedia jika Anda ingin mengulang panduan.`;

  const searchTitle = "Cari topik dengan cepat";
  const searchDesc =
    "Ketik kata kunci (misalnya: validasi, booking, pajak). Pencarian mencakup judul pertanyaan dan isi jawaban. Kosongkan kolom untuk menampilkan semua kartu yang Anda boleh lihat.";

  const listTitle = "Kartu pertanyaan";
  const listDesc =
    "Setiap kotak adalah satu topik. Klik kartu untuk membuka jawaban lengkap di jendela baru. Anda bisa scroll daftar jika pertanyaan banyak.";

  const modalTitle = "Membaca jawaban";
  const modalDesc =
    "Setelah kartu diklik, jawaban muncul di jendela gelap. Gunakan tombol Tutup atau silang (×) untuk kembali. Jika jawaban berisi gambar atau tautan, Anda dapat mengikutinya seperti halaman biasa.";

  const adminPanelTitle = "Form tambah atau ubah FAQ";
  const adminPanelDesc =
    "Gunakan bagian ini menambah pertanyaan baru atau mengubah yang dipilih dari daftar di bawah. Isi wajib: pertanyaan ringkas dan isi jawaban.";

  const questionTitle = "Judul pertanyaan";
  const questionDesc =
    "Tulis kalimat tanya atau pernyataan singkat yang mudah dikenali pengguna (bukan kode teknis). Contoh: Bagaimana cara mengunggah berkas pendukung?";

  const answerTitle = "Isi jawaban";
  const answerDesc =
    "Anda boleh memakai teks biasa atau format HTML sederhana (misalnya paragraf, daftar). Gunakan tombol sisipkan gambar jika perlu ilustrasi. Pastikan bahasa mudah dipahami wajib pajak dan petugas.";

  const rolesTitle = "Siapa yang melihat FAQ ini";
  const rolesDesc =
    "Kosongkan semua centang artinya semua divisi boleh membaca. Centang hanya divisi tertentu jika konten khusus (misalnya hanya untuk Peneliti). Ini membantu mengurangi kebingungan role lain.";

  const publishTitle = "Simpan dan gambar";
  const publishDesc =
    "Sisipkan gambar bila jawaban membutuhkan tangkapan layar atau diagram. Klik Simpan untuk menambah entri baru, atau Perbarui saat mengedit. Batal mengosongkan formulir tanpa menyimpan.";

  const adminListTitle = "Daftar di layar Anda";
  const adminListDesc =
    "Di setiap kartu: Edit mengisi kembali formulir di atas. Hapus menyingkirkan FAQ secara permanen — pastikan sudah benar, karena pengguna tidak lagi melihatnya. Tombol ini tidak mengirim email otomatis; hanya menghapus entri dari daftar.";

  return {
    welcomeTitle,
    welcomeDesc,
    searchTitle,
    searchDesc,
    listTitle,
    listDesc,
    modalTitle,
    modalDesc,
    adminPanelTitle,
    adminPanelDesc,
    questionTitle,
    questionDesc,
    answerTitle,
    answerDesc,
    rolesTitle,
    rolesDesc,
    publishTitle,
    publishDesc,
    adminListTitle,
    adminListDesc,
  };
}

export function buildFaqTourSteps(isAdmin: boolean, divisi: string | undefined): DriveStep[] {
  const t = getTourCopy(divisi, isAdmin);

  const common: DriveStep[] = [
    {
      element: "#tour-faq-header",
      popover: {
        title: t.welcomeTitle,
        description: t.welcomeDesc,
        side: "bottom",
        align: "start",
      },
    },
    {
      element: "#tour-faq-search-wrap",
      popover: {
        title: t.searchTitle,
        description: t.searchDesc,
        side: "bottom",
        align: "start",
      },
    },
  ];

  const memberRest: DriveStep[] = [
    {
      element: "#tour-faq-list-section",
      popover: {
        title: t.listTitle,
        description: t.listDesc,
        side: "top",
        align: "start",
      },
    },
    {
      popover: {
        title: t.modalTitle,
        description: t.modalDesc,
        side: "over",
        align: "center",
      },
    },
  ];

  const adminSteps: DriveStep[] = [
    {
      element: "#tour-faq-admin-panel",
      popover: {
        title: t.adminPanelTitle,
        description: t.adminPanelDesc,
        side: "bottom",
        align: "start",
      },
    },
    {
      element: "#tour-faq-question",
      popover: {
        title: t.questionTitle,
        description: t.questionDesc,
        side: "right",
        align: "start",
      },
    },
    {
      element: "#tour-faq-answer",
      popover: {
        title: t.answerTitle,
        description: t.answerDesc,
        side: "right",
        align: "start",
      },
    },
    {
      element: "#tour-faq-roles",
      popover: {
        title: t.rolesTitle,
        description: t.rolesDesc,
        side: "top",
        align: "start",
      },
    },
    {
      element: "#tour-faq-publish-actions",
      popover: {
        title: t.publishTitle,
        description: t.publishDesc,
        side: "top",
        align: "start",
      },
    },
    {
      element: "#tour-faq-list-section",
      popover: {
        title: t.adminListTitle,
        description: t.adminListDesc,
        side: "top",
        align: "start",
      },
    },
    {
      popover: {
        title: "Selesai",
        description:
          "Jika ada penyesuaian konten baru nanti, cukup kembali ke halaman ini. Panduan dapat diperluas seiring fitur bertambah.",
        side: "over",
        align: "center",
      },
    },
  ];

  if (isAdmin) {
    return [...common, ...adminSteps];
  }
  return [...common, ...memberRest];
}
