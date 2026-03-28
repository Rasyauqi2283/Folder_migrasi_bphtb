export type GuideKey =
  | "ADMINISTRATOR"
  | "PPAT"
  | "PPATS"
  | "NOTARIS"
  | "WP_P"
  | "WP_B"
  | "LTB"
  | "LSB"
  | "PENELITI"
  | "PENELITI_VALIDASI"
  | "CUSTOMER_SERVICE"
  | "BANK";

export function normalizeDivisiToGuideKey(divisiRaw: unknown): GuideKey | null {
  const d = String(divisiRaw ?? "").trim();
  if (!d) return null;
  const up = d.toUpperCase();

  if (up === "ADMIN" || up === "ADMINISTRATOR") return "ADMINISTRATOR";
  if (up === "PPAT") return "PPAT";
  if (up === "PPATS") return "PPATS";
  if (up === "NOTARIS") return "NOTARIS";
  if (up === "LTB") return "LTB";
  if (up === "LSB") return "LSB";
  if (up === "PENELITI") return "PENELITI";
  if (up === "PENELITI VALIDASI" || up === "PENELITI_VALIDASI") return "PENELITI_VALIDASI";
  if (up === "CUSTOMER SERVICE" || up === "CUSTOMER_SERVICE") return "CUSTOMER_SERVICE";
  if (up === "BANK") return "BANK";

  // WP variants used in UI / DB
  if (up === "WAJIB PAJAK" || up === "WP") return "WP_P";
  if (up.includes("WAJIB PAJAK") && up.includes("B")) return "WP_B";
  if (up.includes("WAJIB PAJAK") && (up.includes("P") || up.includes("PERORANGAN"))) return "WP_P";

  return null;
}

export const GUIDES: Record<GuideKey, string> = {
  ADMINISTRATOR: `## Panduan Administrator — E‑BPHTB

### Definisi Peran
Administrator adalah **pengelola dan pengendali sistem**. Fokus utama Administrator adalah memastikan layanan berjalan stabil, aman, dan setiap peran mendapat akses menu yang sesuai.

### Menu Utama yang Tersedia
- **Manajemen User**
  - Verifikasi/aktivasi pengguna (Karyawan, PU/PPAT, WP termasuk **WP Badan Usaha** yang perlu approval).
  - Perubahan **divisi** dan pengelolaan status (pending/complete) sesuai kebijakan.
- **Monitoring Kuota Harian**
  - Pantau kuota layanan **Online (80/hari)** dan slot **Offline (40/hari — jika diaktifkan)**.
  - Membaca tren beban layanan per tanggal (real‑time / history) dari dashboard.
- **Maintenance Mode / Status Sistem**
  - Mengaktifkan/menonaktifkan mode pemeliharaan, menambahkan pesan dan ETA agar pengguna mendapat informasi jelas.
- **Audit & Jejak Aktivitas**
  - Memantau perubahan penting (siapa, kapan, apa yang dilakukan) untuk kebutuhan tata kelola.
- **Konten Informasi**
  - Pengelolaan banner/iklan/pengumuman untuk komunikasi operasional.

### Tanggung Jawab Utama
- Menjaga **integritas data** dan akses sesuai peran.
- Memastikan SOP operasional berjalan (jam layanan, pengumuman, maintenance).
- Mengkoordinasikan perbaikan ketika terjadi antrian/kendala (mis. kuota penuh, maintenance, error layanan).

> Tips: Pastikan akun Administrator hanya diberikan ke personel berwenang dan selalu gunakan pesan maintenance yang jelas (jam, ETA, dan dampak).`,

  PPAT: `## Panduan PU — PPAT

### Definisi Peran
PPAT adalah peran PU yang melakukan **pembuatan dan pengelolaan booking SSPD** serta pengajuan permohonan validasi.

### Menu Utama yang Tersedia
- **Booking SSPD**
  - Membuat booking baru, melengkapi data objek pajak, dan mengunggah dokumen pendukung (Akta/Sertifikat/Pelengkap).
  - Mengunggah **tanda tangan WP** saat diperlukan.
- **Callback Data**
  - Menarik data dari booking sebelumnya (callback) untuk mempercepat pengisian (autofill) dan menjaga konsistensi.
- **Kirim ke Bappenda**
  - Pengiriman “kirim sekarang” atau penjadwalan (mengikuti kuota harian).
- **Libatkan WP**
  - Mengundang WP untuk tanda tangan/persetujuan sebagai bukti keterlibatan pihak WP pada proses.

### Tanggung Jawab Utama
- Menjamin data booking akurat (NOP, identitas, nilai, dokumen).
- Menjaga kelengkapan dokumen sebelum pengiriman.
- Menindaklanjuti jika ada **STPD Kurang Bayar / PENDING_CORRECTION** (upload bukti pelunasan dan kirim ulang).

> Tips: Pastikan dokumen PDF/JPG terbaca jelas dan selalu cek status kuota sebelum mengirim.`,

  PPATS: `## Panduan PU — PPATS

### Definisi Peran
PPATS memiliki alur kerja yang setara dengan PPAT, dengan cakupan kewenangan sesuai ketentuan instansi.

### Menu Utama yang Tersedia
- **Booking SSPD** (buat, edit, unggah dokumen)
- **Callback Data** untuk autofill
- **Kirim / Jadwalkan Kirim** sesuai kuota
- **Libatkan WP** untuk persetujuan/tanda tangan

### Tanggung Jawab Utama
- Kualitas data dan dokumen sebelum pengajuan.
- Respons cepat pada status koreksi (**PENDING_CORRECTION**) agar antrian tidak tersendat.

> Tips: Unggah tanda tangan dan dokumen dengan format benar (PDF/JPG/PNG) agar tidak gagal validasi.`,

  NOTARIS: `## Panduan PU — Notaris

### Definisi Peran
Notaris sebagai PU menjalankan alur booking dan validasi serupa PPAT/PPATS dalam konteks layanan E‑BPHTB.

### Menu Utama yang Tersedia
- **Booking SSPD**: buat dan kelola booking, dokumen, dan permohonan validasi.
- **Callback Data**: mempercepat input berdasarkan riwayat booking.
- **Libatkan WP**: menghubungkan WP pada proses persetujuan.
- **Kirim ke Bappenda**: pengiriman sesuai kuota.

### Tanggung Jawab Utama
- Menjaga akurasi dokumen legal dan data pajak.
- Menindaklanjuti koreksi jika terdapat STPD kurang bayar (upload bukti dan kirim ulang).

> Tips: Pastikan identitas WP dan dokumen legal konsisten dengan data yang diinput.`,

  WP_P: `## Panduan Wajib Pajak — Perorangan (WP P)

### Definisi Peran
Wajib Pajak Perorangan adalah pengguna yang **mengajukan dan memantau proses** BPHTB untuk kebutuhan pribadi.

### Menu Utama yang Tersedia
- **Pengajuan/Tracking**
  - Memantau status berkas (dari pengajuan, verifikasi, paraf, hingga validasi).
- **Dokumen & Bukti**
  - Mengakses dokumen yang diterbitkan dan informasi validasi (termasuk QR jika sudah valid).
- **Pembayaran**
  - Mengikuti instruksi pembayaran dan memastikan bukti pembayaran sesuai.

### Tanggung Jawab Utama
- Mengisi data identitas dengan benar (NIK, nama, alamat).
- Memastikan dokumen yang diunggah jelas dan sesuai.
- Menyimpan bukti transaksi untuk sinkronisasi.

> Tips: Pastikan foto KTP jelas saat registrasi dan cek status berkas secara berkala agar tidak tertinggal informasi.`,

  WP_B: `## Panduan Wajib Pajak — Badan Usaha (WP B)

### Definisi Peran
WP Badan Usaha adalah pengguna perusahaan/instansi yang mengajukan BPHTB dengan kebutuhan dokumen legal tambahan.

### Menu Utama yang Tersedia
- **Pengajuan/Tracking**: memantau status proses berkas.
- **Dokumen Perusahaan**
  - Melampirkan dokumen legal (mis. NIB) sesuai kebijakan.
- **Kolaborasi dengan PU**
  - Menerima undangan “Libatkan WP” dari PU agar WP dapat memberikan persetujuan/tanda tangan.

### Tanggung Jawab Utama
- Menyediakan dokumen perusahaan yang valid dan terbaru.
- Menjaga konsistensi data NPWP/NIB dan identitas penanggung jawab.

> Tips: Pastikan dokumen NIB yang diunggah adalah PDF resmi dan mudah dibaca.`,

  LTB: `## Panduan LTB

### Definisi Peran
LTB bertugas sebagai **penerima dan pengelola berkas masuk** serta memastikan berkas diteruskan ke proses verifikasi dengan benar.

### Menu Utama yang Tersedia
- **Terima Berkas SSPD**
  - Review kelengkapan awal.
  - Reject jika tidak memenuhi syarat, atau kirim ke tahap berikutnya.
- **Dokumen Pendukung**
  - Melihat dokumen yang diunggah PU/WP untuk memastikan dapat diproses.

### Tanggung Jawab Utama
- Menjaga kualitas berkas sebelum masuk antrian Peneliti.
- Memastikan status dan trackstatus konsisten agar alur tidak macet.

> Tips: Pastikan penolakan selalu disertai alasan singkat agar pengirim dapat memperbaiki dengan cepat.`,

  LSB: `## Panduan LSB

### Definisi Peran
LSB berperan dalam **monitoring penyerahan dan pelayanan penyerahan SSPD**, memastikan berkas yang selesai diproses teradministrasi dengan baik.

### Menu Utama yang Tersedia
- **Monitoring Penyerahan**
  - Melihat daftar berkas yang sudah melalui tahapan proses.
- **Pelayanan Penyerahan SSPD**
  - Membantu proses serah‑terima sesuai SOP instansi.

### Tanggung Jawab Utama
- Menjaga ketertiban administrasi dan status akhir berkas.
- Mendukung layanan pengguna saat pengambilan/penyerahan dokumen.

> Tips: Selalu cocokkan nomor registrasi dan identitas sebelum menyerahkan dokumen.`,

  PENELITI: `## Panduan Peneliti

### Definisi Peran
Peneliti adalah peran yang melakukan **verifikasi substantif** atas berkas yang masuk dari LTB sebelum diteruskan ke paraf dan validasi.

### Menu Utama yang Tersedia
- **Antrian Verifikasi**
  - Melihat daftar berkas dari LTB.
  - **Penugasan otomatis (LTB → Peneliti):** setiap berkas ditugaskan ke satu Peneliti dengan aturan **kuota maks. 10 berkas aktif** (status Diajukan / Dilanjutkan) per akun. Jika semua Peneliti penuh, berkas masuk antrean **UNASSIGNED** hingga ada slot — Peneliti dapat **Klaim penugasan** dari antrean tersebut.
  - Fitur **Lock Document** agar satu berkas tidak dikerjakan bersamaan oleh dua peneliti (hanya Peneliti yang ditugaskan).
- **Mode Verifikasi & Edit**
  - Koreksi **data booking** (nama/alamat WP & OP, NOP, dll.; **No. Booking tidak diubah**) langsung di layar verifikasi selama masih tahap **Diajukan / Dilanjutkan** dan **belum Kirim ke Paraf**. Field yang pernah dikoreksi ditandai (border) dan sistem mencatat **last_edited_by** untuk audit.
- **Card Verifikasi Kelengkapan**
  - Pilih hasil verifikasi (Sesuai / STPD Kurang Bayar / dll) dan simpan.
- **STPD Kurang Bayar**
  - Saat memilih STPD kurang bayar, sistem membuat **kode STPD sementara** dan memberi status **PENDING_CORRECTION** untuk PU.
- **Kirim ke Paraf**
  - Jika sudah sesuai dan disetujui, kirim ke tahap paraf berikutnya. Setelah itu, data booking mengikuti **read-only** pada tahap ini.

### Tanggung Jawab Utama
- Menjaga integritas verifikasi dan mencatat keputusan dengan jelas.
- Hanya memproses berkas yang menjadi **penugasan Anda** (bukan Peneliti lain), kecuali baris **UNASSIGNED** yang wajib diklaim dulu.
- Mengunci dokumen sebelum memproses dan melepas lock saat selesai.
- Memberikan catatan koreksi yang spesifik untuk PU saat kurang bayar.

> Tips: Pastikan tanda tangan/paraf profil sudah diunggah sebelum mengambil dokumen untuk diperiksa.`,

  PENELITI_VALIDASI: `## Panduan Peneliti Validasi

### Definisi Peran
Peneliti Validasi memegang tahapan **validasi akhir** setelah paraf, termasuk memastikan dokumen siap dinyatakan sah.

### Menu Utama yang Tersedia
- **Berkas Pending Validasi**
  - Mengakses daftar berkas yang statusnya menunggu validasi.
- **Monitoring Dokumen**
  - Melihat berkas yang sudah divalidasi/ditolak untuk kontrol kualitas.
- **QR Code Validasi**
  - Setelah validasi selesai, sistem menghasilkan **no_validasi** yang dapat dicek pada halaman validasi QR untuk membuktikan keaslian dokumen.

### Tanggung Jawab Utama
- Memastikan dokumen yang tervalidasi benar‑benar layak dan sesuai.
- Menjaga konsistensi status agar WP/PU dapat mengunduh bukti sah.

> Tips: Lakukan pengecekan ulang pada dokumen dan jejak paraf sebelum menetapkan status validasi.`,

  CUSTOMER_SERVICE: `## Panduan Customer Service (CS)

### Definisi Peran
Customer Service bertugas menangani **tiket bantuan dan komplain pengguna** agar pengguna mendapat solusi cepat dan terarah.

### Menu Utama yang Tersedia
- **Tiket Bantuan (cs_tickets)**
  - Melihat daftar tiket masuk, status (open/closed), dan prioritas penanganan.
- **Balas Ticket**
  - Memberikan balasan resmi, ringkas, dan jelas kepada pengguna.
  - Menjaga jejak percakapan agar tidak terjadi miskomunikasi.

### Tanggung Jawab Utama
- Menjawab tiket sesuai SOP layanan.
- Mengeskalasi isu teknis ke Admin/Tim terkait jika perlu.
- Menutup tiket ketika masalah selesai, atau minta informasi tambahan jika belum jelas.

> Tips: Gunakan template balasan yang konsisten dan selalu sertakan langkah yang harus dilakukan user (step‑by‑step).`,

  BANK: `## Panduan BANK

### Definisi Peran
BANK bertanggung jawab pada **verifikasi transaksi** dan sinkronisasi data pembayaran agar pengajuan dapat diproses dengan benar.

### Menu Utama yang Tersedia
- **Verifikasi Hasil Transaksi**
  - Menilai status pembayaran (approve/reject) berdasarkan bukti dan data transaksi.
- **Sinkronisasi Pembayaran**
  - Memastikan nilai bayar, nomor bukti, dan tanggal pembayaran sesuai agar alur lanjut ke tahap berikutnya.

### Tanggung Jawab Utama
- Menjaga akurasi status pembayaran.
- Meminimalkan false-approve/false-reject karena berdampak pada antrian verifikasi berikutnya.

> Tips: Jika data pembayaran tidak sinkron, lakukan pengecekan ulang (nomor bukti, tanggal, nominal) sebelum menyetujui.`,
};

