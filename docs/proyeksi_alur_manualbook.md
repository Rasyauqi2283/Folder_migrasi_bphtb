📘 Manual Book Sistem BPHTB
🧾 Deskripsi Umum

Dokumen ini merupakan panduan alur terbaru dari sistem BPHTB yang dikembangkan.
Sistem ini melibatkan banyak peran (role) dengan tanggung jawab yang berbeda-beda dalam satu ekosistem layanan terintegrasi.

Saat ini terdapat 11 role utama dalam sistem:
-Admin atau administrator
-PU (PPAT, PPATS, Notaris)
-LTB (Loket Terima Berkas)
-LSB (Loket Serah Berkas)
-Peneliti
-Peneliti Validasi (Pejabat Bappenda)
-Bank
-WP (Wajib Pajak)
-CS (Customer Service)

👥 Daftar Role dan Tanggung Jawab
🔑 1. Admin

-Peran utama:
Mengelola sistem secara keseluruhan
Monitoring aktivitas sistem
Integrasi antar fitur dan layanan
Melakukan maintenance, perbaikan, dan update sistem
Admin juga berfungsi sebagai kontrol utama untuk memastikan sistem berjalan dengan stabil dan optimal.

🏛️ 2. PU (Pejabat Umum)
(PPAT, PPATS, Notaris)
-Peran utama:
Mengajukan pembuatan dokumen BPHTB
Melakukan booking pelayanan melalui sistem

📥 3. LTB (Loket Terima Berkas)
-Peran utama:
Menerima pengajuan booking
-Melayani pengajuan baik secara:
Online
Offline

📤 4. LSB (Loket Serah Berkas)

-Peran utama:
Menyerahkan dokumen yang sudah:
Diverifikasi
Dinyatakan lengkap
-Memberikan dokumen kepada:
WP (Wajib Pajak)
PPAT / PU

🔍 5. Peneliti
-Peran utama:
Melakukan pengecekan data secara menyeluruh
Menentukan apakah data valid atau tidak
-Struktur verifikasi:
Verifikasi Awal → oleh anggota tim
Verifikasi Utama → oleh kepala bagian (pemparaf)
Role ini adalah salah satu komponen paling krusial dalam menjaga validitas data.

🏢 6. Peneliti Validasi (Pejabat Bappenda)
-Peran utama:
Verifikator terakhir (final validation)
Memberikan tanda tangan akhir pada dokumen
-Posisi:
Setingkat kepala bidang
Satu level di bawah kepala badan

🏦 7. Bank
-Peran utama:
Memverifikasi pembayaran dari WP
Memberikan validasi berupa stempel pada dokumen
-Keterangan:
Bank yang digunakan adalah:
Bank Jawa Barat (BJB / Bank Jabar)

👤 8. WP (Wajib Pajak)
Peran utama:
Melakukan pembayaran transaksi
Menjadi pihak utama dalam proses kepemilikan atau transaksi BPHTB

🎧 9. CS (Customer Service)
Peran utama:
Menangani:
Keluhan
Kritik
Pertanyaan pengguna
Memberikan bantuan terkait penggunaan sistem

📌 Catatan Penting
-Setiap role memiliki keterkaitan satu sama lain dalam alur sistem.
-Validasi dilakukan secara bertahap untuk memastikan keakuratan data.
-Sistem dirancang untuk meminimalisir kesalahan manual dan meningkatkan transparansi layanan.

=================================================
🔄 Alur Booking BPHTB (Success Flow)
🧾 Deskripsi
Bagian ini menjelaskan alur booking BPHTB yang berhasil (success flow), yaitu kondisi di mana:
Tidak ada cancel
Tidak ada penolakan (decline)
Tidak ada kekurangan pembayaran
Notasi alur:
-> menunjukkan perpindahan proses antar role
PU → LTB / BANK → Peneliti → Peneliti Validasi → LSB → PU / WP

===============================================================
🧩 Tahapan Detail Proses
🏛️ 1. PU (PPAT / PPATS / Notaris)
Langkah:
Melengkapi profil secara penuh
Membuat booking BPHTB:
Badan usaha
Perorangan
Sistem menghasilkan dokumen (PDF)
Output:
2 dokumen dari backend:
backend/internal/pdf/sspd.go

✍️ 2. Tanda Tangan WP (Wajib Pajak)
Enhancement yang direncanakan:
WP memiliki fitur upload tanda tangan dan stempel (opsional) di profile, untuk tempat simpan tanda tangan sama seperti tanda tangan yang lain, ada di "a_2_verified_users" bagian kolom "tanda_tangan_path", lalu ketika dilakukan penarikan maka akan masuk di "pat_6_sign" bagian kolom "path_ttd_wp"
Sistem backend akan:
Menarik tanda tangan WP otomatis
Menempatkannya di dokumen (SSPD) bagian kiri bawah
Flow:
WP melakukan pengecekan dokumen
Klik "Setujui"
Tanda tangan otomatis terpasang di PDF

📎 3. Upload Dokumen oleh PU
PU wajib mengunggah:
3 dokumen pendukung
Harus sesuai dengan data input sebelumnya
Menunggu tanda tangan wp di paraf masuk ke pat_6_sign, setelahnya

📤 4. Submit Booking
Setelah semua lengkap:
PU klik tombol "Kirim"
Catatan Kuota:
Maksimal 80 dokumen/hari
Jika kuota penuh:
Dialihkan ke hari berikutnya
Tidak berlaku untuk:
Sabtu ataupun Minggu

🔀 5. Distribusi Awal
Setelah dikirim:
PU → LTB + BANK (paralel)

📥 5A. LTB (Loket Terima Berkas)
Aksi:
Menerima dokumen
Opsi:
Cek awal
Langsung teruskan ke Peneliti
⚠️ Catatan:
Dokumen belum bisa diproses penuh sebelum validasi dari BANK selesai.

🏦 5B. BANK
Aksi:
Verifikasi pembayaran dari WP
Jika dana masuk:
Berikan stempel validasi
Kondisi:
Pembayaran sesuai → disetujui
Pembayaran kurang → tetap diproses (dengan catatan khusus)

🔍 6. Peneliti
Setelah LTB & BANK selesai:
→ Peneliti
Tahapan:
Verifikasi awal (anggota)
Verifikasi lanjutan (kepala bagian / pemparaf)
Aksi:
Pengecekan data menyeluruh
Pemberian paraf (2 tahap)

🏢 7. Peneliti Validasi (Final Stage)
Role ini adalah penentu akhir.
🧾 Proses yang dilakukan:
Input tanda tangan pejabat
Generate sertifikat digital
Validasi akhir dokumen
Generate QR Code (penanda sah)

⚖️ Keputusan Akhir:
✅ Disetujui
Lanjut ke LSB

🔁 Dikembalikan ke Peneliti
❌ Ditolak
Kembali ke PU (dokumen gagal)

📊 8. Monitoring & Distribusi
Jika disetujui:
Masuk ke:
Monitoring Peneliti Validasi
Tabel LSB

📤 9. LSB (Loket Serah Berkas)
Aksi:
Tidak ada pengecekan ulang
Klik "Serahkan"
Hasil:
Email otomatis dikirim ke:
PU
WP
Subjek: No. Booking

📁 10. Arsip & Laporan
📌 Di PU:
Masuk ke:
PU → Laporan → Rekap

📌 Di WP:
Masuk ke:
WP → Laporan → Arsip

📌 Di Admin:
Tercatat sebagai:
Dokumen selesai hari itu
✅ Status Akhir
Dokumen dinyatakan:
Selesai
Tervalidasi
Memiliki QR Code resmi
Tersimpan di seluruh role terkait

⚠️ Catatan Tambahan
Alur ini hanya untuk success case
Untuk kasus:
-Kurang bayar
-Revisi
-Penolakan
➡️ Akan dibahas di flow terpisah


===================
Bahasan Lebih lanjut akan dijelaskan dibawah ini, soon 