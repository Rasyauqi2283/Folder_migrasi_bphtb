* Ringkasan Alur Proses dan Status *Booking*

Proses *booking* melalui enam tahapan utama yang menggerakkan dokumen antar divisi (PPAT, LTB, BANK, Peneliti, Peneliti Validasi/Pejabat, dan LSB). Alur status ini menggambarkan tanggung jawab dan kemajuan di setiap titik:

### Tahap 1: Inisiasi

* **PPAT** membuat *booking* awal.
* **$trackstatus$** di PPAT:  **Draft** .

### Tahap 2: Pengolahan dan Pengecekan Awal

* *Booking* dikirimkan ke **LTB** dan  **BANK** .
* **$trackstatus$** di PPAT dan LTB:  **Diolah** .
* **$status$** di LTB:  **Diterima** .
* Status di BANK: **$status\_verifikasi$** ('Pending', 'Disetujui', atau 'Ditolak') dan **$status\_dibank$** ('Dicheck' atau 'Tercheck').

### Tahap 3: Pengajuan ke Peneliti

* Setelah pengecekan awal, *booking* dilanjutkan ke  **Peneliti** .
* **$trackstatus$** di PPAT, LTB, dan Peneliti:  **Dilanjutkan** .
* **$status$** di LTB dan Peneliti:  **Diajukan** .

### Tahap 4: Verifikasi oleh Peneliti dan Pengiriman ke Pejabat

* Proses ini mencakup dua kali pengecekan di Peneliti.
* **Pengecekan Pertama:** **$trackstatus$** di PPAT dan Peneliti berubah menjadi  **Diverifikasi** .
* **Pengecekan Kedua:** *Booking* dikirimkan ke  **Peneliti Validasi (Pejabat)** .
* **$trackstatus$** di PPAT dan Peneliti:  **Terverifikasi** .
* **$status$** di Peneliti:  **Dikerjakan** .
* **$trackstatus$** di Peneliti Validasi:  **Terverifikasi** .
* **$status$** di Peneliti Validasi: **Dianalisis** dengan **$status\_tertampil$**  **Menunggu** .

### Tahap 5: Validasi dan Penyelesaian

* **Peneliti Validasi** melakukan pengerjaan dan pengecekan akhir (validasi).
* **$trackstatus$** di PPAT dan Peneliti Validasi:  **Dibaca** .
* **$status$** di Peneliti Validasi: **Divalidasi** dengan **$status\_tertampil$** **Sudah Divalidasi** atau  **Ditolak** .
* *Booking* diserahkan ke  **LSB** .
* **$trackstatus$** di LSB: **Siap Diserahkan** dengan **$status$**  **Terselesaikan** .

### Tahap 6: Serah Terima Berkas Selesai

* **LSB** mengirimkan kembali berkas *booking* yang telah selesai ke  **PPAT** .
* **$trackstatus$** di PPAT dan LSB:  **Diserahkan** .
* **$status$** di LSB:  **Diserahkan** .

---

Ringkasan ini menguraikan secara jelas bahwa PPAT bertindak sebagai titik pusat, sementara status di divisi lain bergerak secara sinkron untuk memajukan *booking* dari **$Draft$** hingga **$Diserahkan$**.
