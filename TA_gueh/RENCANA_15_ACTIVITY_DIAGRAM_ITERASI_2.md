# 📋 RENCANA 15 ACTIVITY DIAGRAM ITERASI 2

## Status Activity Diagram

### ✅ **Sudah Dibuat (3 diagram):**
1. Activity 18: Upload Tanda Tangan Sekali (PPAT/PPATS)
2. Activity 19: Peneliti Auto Fill Signature (Reusable)
3. Activity 20: Admin Validasi QR Code

### ✅ **Sudah Ada Sebelumnya (2 diagram):**
4. Bank Integration - Verifikasi Pembayaran
5. Peneliti Validasi Final Validation

### ❌ **Perlu Dibuat (12 diagram):**

#### **PRIORITAS TINGGI (5 diagram):**
6. **Activity 21: Generate Sertifikat Digital Lokal** ⭐⭐⭐
   - Proses generate sertifikat digital lokal dengan ECDSA-P256
   - Enkripsi passphrase dengan scrypt
   - Database: `pv_local_certs`, `pv_2_signing_requests`

7. **Activity 22: Generate QR Code** ⭐⭐⭐
   - Proses generate QR code ganda (publik dan internal)
   - Format payload: NIP/tanggal/special_parafv//E-BPHTB BAPPENDA KAB BOGOR|nomor_validasi
   - Database: `pat_7_validasi_surat`, `pv_1_paraf_validate`

8. **Activity 23: Display QR Code di Dokumen** ⭐⭐⭐
   - Proses menampilkan QR code di dokumen PDF
   - Embed QR code ke PDF validasi
   - Database: `pat_7_validasi_surat`, file PDF

9. **Activity 24: Integrasi Bank dengan LTB (Parallel Workflow)** ⭐⭐
   - Proses parallel workflow antara Bank dan LTB
   - Sinkronisasi data pembayaran
   - Database: `bank_1_cek_hasil_transaksi`, `ltb_1_terima_berkas_sspd`

10. **Activity 25: Verifikasi Digital Signature** ⭐⭐
    - Proses verifikasi digital signature dari sertifikat lokal
    - Validasi passphrase dan sertifikat
    - Database: `pv_local_certs`, `pv_2_signing_requests`

#### **PRIORITAS SEDANG (7 diagram):**
11. **Activity 26: Auto Fill Signature (PPAT)** 
    - Sistem otomatis mengisi tanda tangan dari database ke booking
    - Database: `pat_6_sign`, `a_2_verified_users`

12. **Activity 27: Generate Nomor Validasi**
    - Proses generate nomor validasi format 7acak-3acak
    - Database: `pat_7_validasi_surat`, `pv_1_paraf_validate`

13. **Activity 28: Select Reusable Signature (Peneliti Validasi)**
    - Proses memilih tanda tangan reusable untuk validasi
    - Database: `pv_1_paraf_validate`, `a_2_verified_users`

14. **Activity 29: Real-time Notifications**
    - Sistem notifikasi real-time menggunakan long polling
    - Database: `sys_notifications`, `pat_1_bookingsspd`

15. **Activity 30: Cek Validasi Pembayaran (Bank - Detail)**
    - Proses detail verifikasi pembayaran oleh Bank
    - Database: `bank_1_cek_hasil_transaksi`, `pat_2_bphtb_perhitungan`

16. **Activity 31: Hasil Transaksi (Bank)**
    - Proses melihat hasil transaksi pembayaran
    - Database: `bank_1_cek_hasil_transaksi`

17. **Activity 32: Sinkronisasi Bank-LTB**
    - Proses sinkronisasi data antara Bank dan LTB
    - Database: `bank_1_cek_hasil_transaksi`, `ltb_1_terima_berkas_sspd`, `pat_1_bookingsspd`

---

## 📊 RINGKASAN

- **Total Activity Diagram:** 15 diagram
- **Sudah dibuat:** 3 diagram
- **Sudah ada:** 2 diagram
- **Perlu dibuat:** 12 diagram
  - Prioritas tinggi: 5 diagram
  - Prioritas sedang: 7 diagram

---

## ✅ TINDAKAN SELANJUTNYA

1. Buat Activity Diagram Prioritas Tinggi (5 diagram)
2. Buat Activity Diagram Prioritas Sedang (7 diagram)
3. Update tabel Activity Diagram Iterasi 2
4. Update teks Quick Design Iterasi 2
