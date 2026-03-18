[x] artinya sudah
[ ] artinya belum

📝 Status Pengembangan & Spesifikasi Fitur
1. Halaman Awal (Landing Page)
Status: [x] Selesai (UI/UX Adjusted)Catatan: Belum diuji coba pada bagian Submit Button yang mengarah ke fitur Validasi QR Code.

2. Autentikasi (Login)
Status: [x] SelesaiCatatan: Seluruh fungsi tombol clean & clear. Penanganan sesi untuk 2 role spesifik (Karyawan & PU) sudah sesuai jalur.

3. Registrasi (Daftar) - [x] IN PROGRESS (Verse WP selesai)
Terdapat kompleksitas tinggi dengan pembagian 3 jenis entitas (Verse):
A. Verse PU (Pejabat Umum) & Verse Karyawan
Status: [x] Selesai
Flow: Input data standar -> Registrasi masuk ke skema verifikasi admin sebagai approval (mendapatkan 'userid', verse PU ditambahkan mendapatkan 'ppat_khusus') -> dapet izin -> aktif.
B. Verse WP (Wajib Pajak) perlu radio button (Perorangan/Badan usaha)
Terdapat percabangan logika baru berdasarkan tipe identitas:
[x] WP Perorangan:Input: Data NIK dan identitas pribadi (sama dengan Verse Karyawan/PU).Approval: Otomatis. User langsung bisa login setelah daftar tanpa verifikasi admin.
[x] WP Badan Usaha (PT/CV/Firma):Input:NPWP Badan Usaha NIB (Nomor Induk Berusaha)Upload Dokumen: Sertifikat NIB (Format: PDF).Approval: Manual (Admin Review). Akun berstatus Pending sampai admin Bapenda melakukan validasi dokumen. User baru bisa login setelah disetujui.

4. Role Admin (Pusat Kendali)
Dashboard: [x] Selesai (Migration Phase)

Struktur UI sudah siap di lingkungan baru.

Task: Perlu re-aktivasi API dan pembersihan cache agar data sinkron.

Verifikasi & Workflow: [x] Progress (Belum Matang)

Logika Approval/Verification sudah ada tapi butuh optimasi lebih lanjut mengikuti skema WP Badan Usaha yang baru.

Sub-Menu & Navigasi: [x] Selesai (Legacy API Check)

Semua menu sudah terhubung.

Critical Task: Pastikan Endpoint API tidak lagi mengarah ke root lama (Legacy) dan sesuaikan dengan struktur folder/route baru.

5. Role PU (Pejabat Umum / Eks-PPAT)
Fungsional Booking (BPHTB): [x] Selesai (Hybrid Flow)

Mendukung input untuk entitas Perorangan maupun Badan Usaha.

Catatan Penting: Bagian Generate PDF (e-Reporting/Draft) membutuhkan detail layout manual oleh developer (tidak boleh dikerjakan AI sepenuhnya karena presisi format hukum).

Menu Lainnya: [ ] PENDING (laporan bulanan, rekap dan monitoring)
Fitur pendukung lainnya akan dikerjakan setelah core booking benar-benar stabil.

6. Role LTB (Loket Terima Berkas)
Status: [x] UI Selesai (Legacy Migration)

Update Logika: * Penambahan 1 Menu Baru: Penginputan Offline.

Fitur ini digunakan saat WP datang langsung ke kantor. UI/UX dan tabel input akan mengadopsi pola Role PU (Booking).

Penyesuaian pada jenis dokumen dan skema perhitungan pajak sesuai berkas fisik yang dibawa.

7. Role Peneliti, Bank, Peneliti Validasi, & LSB
Status: [x] Migrasi UI Selesai (Next.js)

Catatan: Migrasi murni dari sistem Legacy ke arsitektur baru. Backend: proxy API legacy (/api/bank/*, /api/peneliti*, /api/paraf/*, /api/pv/*, /api/LSB_*, dll.) ke Node via LegacyAPIProxyHandler. Frontend: route group per role (Bank, Peneliti, Peneliti Validasi, LSB) dengan layout, sidebar, dashboard, dan halaman sub-menu; redirect dashboard dan UserSidebar mengarah ke route Next. Beberapa sub-menu (Verifikasi Offline, SKPD Kurang Bayar Offline, Validasi Berkas Offline) tetap link ke legacy HTML.

8. Role Baru: WP (Wajib Pajak) & CS (Customer Service)
A. Role WP (Digitalisasi Total)
Visi Baru: Sebagai validasi entitas. Kedepannya, PU tidak dapat membuat dokumen (Booking) jika WP terkait belum teregistrasi di sistem.

Dashboard WP: [ ] NOT STARTED

Fitur Arsip Digital (Sub-Menu Laporan):

Menampilkan SSPD yang sudah disetujui, distempel, dan tervalidasi.

Output: PDF Siap Download.

Tujuan: Sebagai backup resmi jika berkas fisik rusak/hilang (anti-manipulasi).

B. Role CS (Support System)
Dashboard CS: [x] Selesai (Next.js)

Sub-Menu Layanan:

Menampung input dari Contact Form di Halaman Awal (Judul, Keluhan, Isi, Email).

Integrasi AI Bot: * Memberikan balasan otomatis sementara saat keluhan masuk (Status: In Queue / Antrian).

AI Bot tidak boleh melakukan reply dua arah; hanya sebagai penanganan pertama.

Manual Follow-up: Balasan resmi selanjutnya akan dikirim oleh staff CS melalui email

up domain ke vercel dan koyeb