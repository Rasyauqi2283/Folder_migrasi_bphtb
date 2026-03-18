# Naskah Pembahasan — Seminar Hasil (Rekan: Muhammad Hafidz Sidqi Riupassa)

---

## Kalimat Pembuka

Baik, terima kasih. Sebelumnya saya ucapkan terima kasih kepada Ibu A dan Ibu B selaku dosen moderator. Izin menyampaikan diri saya sebagai pembahas. Di sini saya ada 2 poin pertanyaan yang sekiranya mungkin bisa dijawab oleh rekan Hafid, dan beberapa komentar dari hasil materi yang disampaikan.

---

## Pertanyaan 1 — Penanganan Status Pembayaran (Pending / Gagal / Expired)

**Pertanyaan yang disampaikan:**

Pengujian di makalah fokus pada alur sukses. Bagaimana sistem menangani jika pembayaran **pending**, **gagal**, atau **expired**? Apakah status di dashboard admin ikut berubah, dan apakah pelanggan bisa bayar ulang atau harus buat booking baru?

**Jawaban yang disarankan untuk rekan Hafid (agar tidak memicu pertanyaan lanjutan):**

Callback dari Midtrans mengirimkan berbagai status transaksi—bukan hanya success, tapi juga pending, failed, dan expired. Di implementasi, endpoint webhook menerima semua status tersebut, memvalidasi signature, lalu meng-update status order di database sesuai notifikasi dari Midtrans. Jadi di dashboard admin, status order bisa menampilkan misalnya "Menunggu Pembayaran", "Sukses", "Gagal", atau "Kadaluarsa". Untuk perilaku pelanggan saat pending atau expired, kebijakan yang dipakai [sebutkan satu: misalnya "pelanggan bisa akses kembali link pembayaran dari email/riwayat booking selama masa berlaku, dan jika sudah expired harus buat booking baru"]. Pengujian yang terdokumentasi di makalah (Tabel 2) memang fokus pada alur sukses; skenario untuk pending, gagal, dan expired belum tercantum di tabel. Ke depan, skenario tersebut dapat ditambahkan ke dokumentasi pengujian agar klaim penanganan seluruh status transaksi lebih terbukti.

---

## Pertanyaan 2 — Sandbox dan Kesiapan ke Production

**Pertanyaan yang disampaikan:**

Sistem yang didemonstrasikan berjalan di lingkungan localhost dan pembayaran menggunakan mode sandbox Midtrans. Bisa dijelaskan singkat: (1) mengapa pengujian dilakukan di sandbox, dan (2) apa saja yang perlu disiapkan atau diubah jika nanti sistem akan di-deploy ke production misalnya konfigurasi server, domain, atau pengaturan di sisi Midtrans?

**Jawaban yang disarankan untuk rekan Hafid (agar tidak memicu pertanyaan lanjutan):**

Pengujian sengaja memakai sandbox Midtrans agar tidak ada transaksi uang nyata selama pengembangan dan uji coba; ini standar praktik integrasi payment gateway. Di sandbox, alur callback, update status, dan notifikasi email tetap sama dengan production, hanya environment-nya yang berbeda. Untuk ke production, yang perlu disiapkan antara lain: (1) pindah ke Server Key dan Client Key production di dashboard Midtrans, dan simpan aman di environment variabel; (2) deploy aplikasi ke server (shared hosting atau VPS) yang mendukung PHP/MySQL dan Laravel; (3) daftarkan URL webhook production di dashboard Midtrans agar callback dari Midtrans bisa mencapai server; (4) gunakan HTTPS untuk keamanan transaksi. Scope penelitian saat ini sampai pada prototipe fungsional yang diuji di localhost dan sandbox; dokumentasi langkah deploy bisa masuk saran pengembangan atau lampiran.

---

## Komentar dan Saran (berlandaskan materi makalah)

### 1. Apresiasi

 Ruang lingkup penelitian dinyatakan tegas di makalah (hanya modul pemesanan dan pembayaran; pengujian fokus fungsionalitas).

### 2. Saran penguatan dokumentasi pengujian

- Untuk keamanan integrasi payment gateway: pastikan endpoint callback memvalidasi signature/token dari Midtrans agar request palsu tidak dapat mengubah status transaksi.
- Saran pengembangan yang sudah disebutkan di makalah (voucher/diskon, ulasan pelanggan, ekspor laporan PDF/Excel) relevan dan dapat dijadikan roadmap tahap berikutnya.

---

## Catatan singkat untuk pembahas


| Item                 | Keterangan                                                                                                               |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| **Kalimat pembuka**  | Ganti "Ibu A" dan "Ibu B" dengan nama dosen moderator sesuai jadwal.                                                     |
| **Pertanyaan 1 & 2** | Bisa dibacakan verbatim atau dipersingkat; jawaban di atas boleh dibagikan ke rekan Hafid sebagai bahan persiapan.       |
| **Komentar**         | Disampaikan setelah rekan Hafid menjawab, atau digabung setelah kedua pertanyaan; sesuaikan dengan waktu yang diberikan. |


---

*Dokumen ini disusun sebagai panduan pembahasan berdasarkan makalah "Pengembangan Sistem Informasi Pemesanan Jasa Berbasis Web dengan Integrasi Payment Gateway di PT. XYZ".*