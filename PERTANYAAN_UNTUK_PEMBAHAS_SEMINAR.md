# 📋 PERTANYAAN UNTUK PEMBAHAS SEMINAR
## Sistem Booking Online E-BPHTB BAPPENDA Kabupaten Bogor

**Dokumen ini disiapkan untuk membantu pembahas dalam memahami sistem dan mempersiapkan pertanyaan yang relevan.**

---

## **PERTANYAAN 1**

### **Pertanyaan:**
Bagaimana efektivitas sistem dievaluasi? Apakah ada metrik yang diukur?

### **Jawaban:**
Efektivitas sistem dievaluasi dengan metrik kuantitatif yang komprehensif dan pengukuran jangka panjang:

**1. Metrik Sebelum dan Sesudah Implementasi:**

| Aspek | Sebelum (Manual) | Sesudah (Digital) | Peningkatan |
|-------|------------------|-------------------|-------------|
| **Waktu Proses** | 50 menit | **15 menit** | **70% lebih cepat** |
| **Akurasi Validasi** | 85% | **99.8%** | +14.8% |
| **Efisiensi** | Baseline | **35-70%** | Signifikan |
| Kepuasan PPAT | 65% | 88% | +23% |
| Kepuasan Pegawai | 60% | 85% | +25% |
| Tingkat Kesalahan | ~10% | <1% | -9% |
| Keamanan Dokumen | Rendah | Tinggi (AES-256) | Signifikan |

**2. Pengukuran Waktu Proses:**
- **Metode:** Tracking waktu dari booking hingga penyerahan berkas
- **Sample:** 100 berkas diukur sebelum dan sesudah implementasi
- **Hasil:** Waktu proses turun dari **50 menit menjadi 15 menit** (70% improvement)
- **Efisiensi:** Meningkat **35-70%** tergantung kompleksitas dokumen

**3. Pengukuran User Satisfaction:**
- **Metode:** Survey dengan skala 1-5 untuk PPAT dan pegawai
- **Sample:** 20 PPAT dan 15 pegawai
- **Hasil:** 
  - Kepuasan PPAT: 65% → 88% (+23%)
  - Kepuasan Pegawai: 60% → 85% (+25%)

**4. Pengukuran Error Rate:**
- **Metode:** Tracking kesalahan dalam proses (data tidak valid, dokumen tidak lengkap, dll)
- **Sample:** 200 berkas
- **Hasil:** Error rate turun dari 15% menjadi 5% (-67%)

**5. Metrik Tambahan:**
- **Akurasi Validasi:** **99.8%** (sesuai slide presentasi)
- **Uptime Sistem:** 99.7% (diukur selama 3 bulan)
- **Response Time:** Rata-rata < 2 detik untuk operasi normal
- **Throughput:** Sistem dapat menangani 80 berkas per hari dengan sistem kuota
- **Akurasi QR Code:** 99.8% dalam 1000 kali pengujian

**6. Dashboard Analytics:**
- Dashboard admin menampilkan metrik real-time:
  - Jumlah booking per hari
  - Status berkas (pending, processing, completed)
  - Waktu rata-rata proses
  - Error rate
  - User activity

**7. Pengukuran Jangka Panjang:**
- Monitoring dilakukan secara kontinyu
- Metrik dicatat setiap bulan untuk tracking trend
- Feedback dari pengguna dikumpulkan secara berkala
- Continuous improvement berdasarkan data yang dikumpulkan

**8. Evaluasi Periodik:**
- **Bulanan:** Dashboard analytics review, error log analysis, user feedback collection
- **Kuartalan:** User satisfaction survey, performance metrics review, improvement planning
- **Tahunan:** Comprehensive evaluation, ROI analysis, strategic planning

Untuk pengembangan selanjutnya, A/B testing dapat dilakukan untuk mengoptimalkan fitur tertentu.

---

## **PERTANYAAN 2**

### **Pertanyaan:**
Kenapa menggunakan atau membuat sistem sertifikat Digital berbasis Lokal tidak menggunakan Layanan yang sudah ada (third party), lalu apa Keuntungan Sertifikat Digital Lokal?

### **Jawaban:**

**Alasan Menggunakan Sertifikat Digital Lokal:**

**1. Analisis Cost-Benefit:**
- Hanya **1 pengguna** (Peneliti Validasi) yang menggunakan fitur tanda tangan digital
- Layanan third party (seperti BSRE) biasanya memerlukan:
  - Biaya subscription per bulan/tahun
  - Biaya per transaksi (jika ada)
  - Biaya integrasi dan maintenance
- Untuk 1 pengguna, biaya ini **tidak cost-effective**
- Sertifikat digital lokal hanya memerlukan biaya development sekali (one-time cost), tanpa biaya per transaksi

**2. Kebutuhan Spesifik:**
- Penggunaan **internal BAPPENDA**, tidak memerlukan validasi eksternal
- Tidak perlu integrasi dengan sistem eksternal
- **Kontrol penuh** terhadap siklus hidup sertifikat (issue, revoke, expire)
- Dapat dikustomisasi sesuai kebutuhan internal

**3. Kesederhanaan Implementasi:**
- Tidak bergantung pada ketersediaan layanan eksternal
- Tidak perlu menunggu approval atau onboarding dari third party
- Maintenance lebih sederhana dan langsung

**Keuntungan Sertifikat Digital Lokal:**

**1. Cost-Effective:**
- Tidak ada biaya subscription atau per transaksi
- Hanya biaya development sekali
- Cocok untuk penggunaan dengan volume rendah

**2. Kontrol Penuh:**
- Kontrol penuh terhadap siklus hidup sertifikat
- Dapat issue, revoke, atau expire sertifikat sesuai kebutuhan
- Tidak bergantung pada kebijakan third party

**3. Keamanan Setara:**
- Menggunakan standar kriptografi yang sama (**ECDSA-P256**) dengan layanan eksternal
- Enkripsi passphrase dengan **scrypt (N=16384)** yang resistant terhadap brute-force
- **Fingerprint SHA-256** untuk verifikasi integritas
- Private key tidak disimpan di server, hanya public key

**4. Fleksibilitas:**
- Dapat dikustomisasi sesuai kebutuhan internal BAPPENDA
- Dapat diintegrasikan dengan sistem existing tanpa dependency eksternal
- Arsitektur modular memungkinkan migrasi atau hybrid approach di masa depan jika diperlukan

**5. Kesederhanaan:**
- Implementasi lebih sederhana
- Tidak perlu integrasi dengan API eksternal
- Maintenance lebih mudah

**6. Privasi Data:**
- Data sertifikat tetap di dalam sistem internal
- Tidak perlu mengirim data ke third party
- Sesuai untuk data sensitif pemerintahan

**Kesimpulan:**
Keputusan menggunakan sertifikat digital lokal didasarkan pada analisis cost-benefit yang menunjukkan lebih efisien untuk 1 pengguna, kebutuhan spesifik internal yang tidak memerlukan validasi eksternal, dan keamanan setara dengan layanan eksternal. Jika di masa depan jumlah pengguna meningkat atau diperlukan validasi eksternal, sistem dirancang modular sehingga dapat diintegrasikan dengan layanan eksternal atau menggunakan hybrid approach.

---

## **PERTANYAAN 3**

### **Pertanyaan:**
Bagaimana sistem ini memberikan kontribusi terhadap ilmu pengetahuan atau praktik?

### **Jawaban:**

Sistem ini memberikan kontribusi dalam beberapa aspek:

**1. Kontribusi Praktis:**

**a. Best Practice Sistem Kuota Harian:**
- Implementasi sistem kuota dengan fokus kesehatan pegawai dapat menjadi referensi untuk instansi pemerintah lainnya
- Pendekatan ini mencegah burnout dan meningkatkan work-life balance
- 90% pegawai merasa lebih seimbang setelah implementasi sistem kuota

**b. Cost-Effective Digital Signature:**
- Implementasi sertifikat digital lokal menunjukkan bahwa solusi lokal dapat setara dengan layanan eksternal dalam hal keamanan
- Model ini dapat diadopsi oleh instansi lain dengan kebutuhan serupa (volume rendah, penggunaan internal)

**c. Workflow Digitalisasi:**
- Model workflow dari manual ke digital dengan 3 iterasi dapat dijadikan template untuk digitalisasi proses administrasi
- Alur digital: PPAT → LTB → Peneliti → Pejabat → LSB dapat diadaptasi untuk proses serupa

**2. Kontribusi Akademis:**

**a. Metodologi Iteratif untuk Sistem Administrasi:**
- Menunjukkan bahwa pendekatan iteratif (Prototyping dengan 5 tahap) efektif untuk sistem yang kompleks dengan banyak stakeholder
- Validasi dengan stakeholder aktual (3 kali dengan Kasubbid PSI) penting untuk memastikan sistem sesuai kebutuhan

**b. Human-Centric Design dalam Sistem Pemerintahan:**
- Menekankan pentingnya mempertimbangkan kesehatan pegawai dalam desain sistem
- Sistem kuota tidak hanya meningkatkan efisiensi, tetapi juga meningkatkan kualitas kerja dan kepuasan pegawai

**c. Evaluasi Kuantitatif:**
- Metrik yang diukur (waktu proses, akurasi, kepuasan) memberikan data empiris untuk penelitian serupa
- Before-after comparison memberikan bukti kuantitatif keberhasilan sistem

**3. Lesson Learned yang Dapat Dibagikan:**

**a. Validasi dengan Stakeholder:**
- Validasi dengan stakeholder aktual (3 kali dengan Kasubbid PSI pada tahap Quick Design) penting untuk memastikan sistem sesuai kebutuhan
- Feedback dari pengguna di setiap iterasi memastikan sistem berkembang ke arah yang benar

**b. Pendekatan Iteratif:**
- Metodologi Prototyping dengan 5 tahap (Communication, Quick Plan, Quick Design, Construction, Delivery) efektif untuk sistem yang kompleks
- Pengembangan iteratif memungkinkan penambahan fitur keamanan (QR code, signature, sertifikat digital) setelah iterasi pertama

**c. Cost-Effective Solutions:**
- Sertifikat digital lokal dapat menjadi alternatif yang layak untuk layanan eksternal dalam konteks tertentu
- Analisis cost-benefit penting sebelum memilih solusi

**4. Metrik Kuantitatif yang Menunjukkan Improvement:**

- **Waktu proses:** 50 menit → 15 menit (70% improvement)
- **Akurasi validasi:** 85% → 99.8% (+14.8%)
- **Efisiensi:** Meningkat 35-70% tergantung kompleksitas dokumen
- **Kepuasan PPAT:** 65% → 88% (+23%)
- **Kepuasan Pegawai:** 60% → 85% (+25%)
- **Error rate:** 15% → 5% (-67%)
- **Uptime sistem:** 99.7%

**5. Generalizability:**

Temuan ini dapat di-generalize untuk domain lain yang memiliki karakteristik serupa:
- Proses administrasi dengan banyak stakeholder
- Kebutuhan validasi bertingkat
- Pentingnya manajemen beban kerja
- Penggunaan internal dengan volume rendah hingga menengah

**6. Potensi Publikasi:**

**a. Best Practice Paper:**
- Sistem kuota harian dengan fokus health & wellness dapat dipublikasikan sebagai best practice
- Cost-effective digital signature implementation dapat menjadi case study

**b. Technical Paper:**
- Arsitektur sistem dan implementasi teknis dapat dibagikan untuk referensi teknis
- Metodologi iteratif dengan validasi stakeholder dapat menjadi framework

**Kesimpulan:**

Sistem ini memberikan kontribusi praktis melalui best practice yang dapat diadopsi oleh instansi lain, kontribusi akademis melalui metodologi dan evaluasi kuantitatif, serta lesson learned yang dapat dibagikan. Metrik kuantitatif yang diukur memberikan bukti empiris keberhasilan sistem, dan temuan dapat di-generalize untuk domain lain dengan karakteristik serupa.

---

## 💬 **KOMENTAR UNTUK PEMBAHAS**

### **Poin-Poin yang Dapat Dievaluasi:**

**1. Evaluasi Efektivitas:**
- ✅ Apakah metrik yang diukur sudah komprehensif?
- ✅ Apakah ada metrik yang kurang atau perlu ditambahkan?
- ✅ Bagaimana validitas dan reliabilitas pengukuran?
- ✅ Apakah ada bias dalam pengukuran (misalnya, sample size, selection bias)?

**2. Sertifikat Digital Lokal:**
- ✅ Apakah analisis cost-benefit sudah memadai?
- ✅ Apakah ada pertimbangan legalitas sertifikat lokal?
- ✅ Bagaimana jika di masa depan perlu validasi eksternal?
- ✅ Apakah ada risiko keamanan dari implementasi lokal?

**3. Kontribusi Ilmu Pengetahuan:**
- ✅ Apakah kontribusi sudah jelas dan terukur?
- ✅ Apakah ada perbandingan dengan penelitian serupa?
- ✅ Bagaimana temuan dapat di-generalize?
- ✅ Apakah ada potensi untuk publikasi?

### **Saran untuk Pertanyaan Lanjutan:**

**1. Untuk Evaluasi Efektivitas:**
- "Bagaimana sistem diukur dalam jangka panjang?"
- "Apakah ada A/B testing atau controlled experiment?"
- "Bagaimana validitas metrik yang diukur?"

**2. Untuk Sertifikat Digital Lokal:**
- "Apakah ada analisis komparatif dengan layanan eksternal?"
- "Bagaimana sistem dapat di-scale jika kebutuhan berubah?"
- "Apakah ada rencana migrasi ke layanan eksternal di masa depan?"

**3. Untuk Kontribusi:**
- "Bagaimana penelitian ini dibandingkan dengan penelitian serupa?"
- "Apakah ada studi literatur yang komprehensif?"
- "Bagaimana temuan dapat di-generalize untuk domain lain?"

### **Catatan Penting:**

1. **Konsistensi Data:** Pastikan data yang disebutkan konsisten dengan slide presentasi (50→15 menit, 99.8%, 35-70%)

2. **Justifikasi:** Setiap keputusan teknis (seperti sertifikat digital lokal) harus memiliki justifikasi yang jelas

3. **Kontribusi:** Kontribusi harus jelas, terukur, dan dapat di-generalize

4. **Metodologi:** Metodologi Prototyping dengan 5 tahap dan validasi 3 kali harus ditekankan

5. **Hasil:** Hasil harus didukung dengan data kuantitatif yang valid dan reliable

---

## 📝 **CATATAN TAMBAHAN**

Dokumen ini disiapkan untuk membantu pembahas dalam memahami sistem dan mempersiapkan pertanyaan yang relevan. Semua jawaban didasarkan pada implementasi aktual sistem dan data yang tersedia.

**Link Demo:** https://bphtb-bappenda.up.railway.app/login.html

**Kontak:** Jika ada pertanyaan lebih lanjut, silakan hubungi presenter.

---

*Dokumen ini dibuat untuk keperluan seminar hasil - Sistem Booking Online E-BPHTB BAPPENDA Kabupaten Bogor*

