🧠 Prompt Development – Perbaikan Flow Booking & Validasi BPHTB
Saya sudah mencoba implementasi cookies (akan disesuaikan nanti), jadi untuk sekarang fokus ke perbaikan flow berikut:

📌 1. Status Saat Ini
Mengacu pada:
C:\Users\USER\Downloads\Folder-Farras_bappenda_TA\docs\hasil_dari_production.md:52-68

Hasil testing:
Booking pada role PU (Badan Usaha) sudah berhasil dibuat dengan baik
File terkait:
"C:\Users\USER\Downloads\Folder-Farras_bappenda_TA\E-BPHTB_MIgration\frontend-next\app\(protected)\pu\booking-sspd\badan\tambah\page.tsx"

❌ 2. Issue: Upload Tanda Tangan Error
Problem:
Saat melakukan upload tanda tangan → muncul error:
"failed to update Database"
Action Required:
Perbaiki logic backend/API untuk:
Update database saat upload tanda tangan
Pastikan tidak terjadi failure silent / fallback tanpa logging jelas

✍️ 3. Enhancement: Fitur "Libatkan WP" (Tanda Tangan)
Tambahkan fitur baru pada UI upload tanda tangan:
🎯 Requirement UI:
Tambahkan tombol:
"Libatkan WP"
Saat diklik:
Muncul dropdown/form input:
NIK / NPWP
Email

📩 4. Flow Kirim ke WP
Setelah PU klik Send:
🔍 Validasi (WAJIB):
Cek ke database:
Apakah NIK/NPWP valid
Apakah Email sesuai dengan data tersebut
➡️ Jika tidak valid:

Jangan kirim email
Tampilkan error (misalnya: "Data WP tidak valid")
➡️ Jika valid:
Kirim email ke WP dengan isi:
"Ada dokumen yang perlu disetujui oleh 'PU (nama diambil dari special_field PU)'"

📥 5. Integrasi ke Dashboard WP
Jika valid:
Dokumen otomatis masuk ke:
Submenu WP
File terkait:
C:\Users\USER\Downloads\Folder-Farras_bappenda_TA\E-BPHTB_MIgration\frontend-next\app\(protected)\wp\laporan\arsip\page.tsx
WP dapat:
Melihat dokumen
Melakukan persetujuan

⚠️ 6. Issue: Data Kosong di Form Validasi
Pada halaman:
"Isi Form Permohonan Validasi"
Problem:
Banyak field kosong, padahal seharusnya auto-fill dari database
🗂️ 7. Sumber Data yang Benar
📌 Data PU:
Ambil dari:
a_2_verified_users
alamat_pu
nama pemohon
no telepon

Referensi:
C:\Users\USER\Downloads\Folder-Farras_bappenda_TA\E-BPHTB_MIgration\frontend-next\app\(protected)\pu\permohonan-validasi\[nobooking]\page.tsx

@c:\Users\USER\.cursor\projects\...\terminals\1.txt:752-775

📌 Data Booking & Validasi:
Ambil dari:
pat_1_bookingsspd
hingga
pat_8_validasi_tambahan

Referensi:
@c:\Users\USER\.cursor\projects\...\terminals\1.txt:801-808
🎯 Expected Outcome
Upload tanda tangan tidak error
Fitur "Libatkan WP" berjalan end-to-end:
Input → Validasi → Email → Masuk WP dashboard
Semua field di form validasi:
Terisi otomatis dari database
Tidak ada data kosong yang seharusnya tersedia
🚨 Catatan Penting
Jangan kirim email tanpa validasi database
Pastikan relasi antar tabel benar (user ↔ booking ↔ validasi)
Tambahkan logging untuk debugging (hindari silent error)

🔥 Context Tambahan
Flow ini bagian dari:
PU → LTB/BANK → Peneliti → Peneliti Validasi → LSB → PU/WP
Fokus saat ini hanya di sisi:
PU → WP (tanda tangan & validasi awal)

======================================
hal penting perlu dipahami (krusial yang perlu pahami dengan sprint dan metode EPIC)
🧩 1. BREAKDOWN → Task (Siap jadi Sprint / Jira)
🎯 EPIC 1: Fix Upload Tanda Tangan
Task:
 Audit endpoint upload tanda tangan
 Tambahkan logging detail (error + payload)
 Validasi request body (user_id, file, relasi booking)
 Perbaiki query update database
 Tambahkan response error yang jelas (jangan generic)

🎯 EPIC 2: Fitur "Libatkan WP"
Task:
 Tambahkan button "Libatkan WP" di UI
 Buat modal/dropdown input:
NIK/NPWP
Email
 Endpoint validasi WP:
cek ke tabel a_2_verified_users
 Endpoint kirim email
 Insert data ke tabel relasi (PU ↔ WP ↔ dokumen)
 Push dokumen ke dashboard WP

🎯 EPIC 3: Fix Auto-fill Data Validasi
Task:
 Audit query di halaman "Isi Form Permohonan Validasi"
 Mapping ulang field:
a_2_verified_users
pat_1 → pat_8
 Perbaiki join query
 Tambahkan fallback jika data null
 Testing end-to-end (PU → Peneliti)

🔗 2. MAPPING → API CONTRACT (INI KRITIKAL)
📌 A. Upload Tanda Tangan
Endpoint:
POST /api/signature/upload
Request:
{
  "user_id": "string",
  "booking_id": "string",
  "role": "PU | WP",
  "file": "base64 | multipart"
}
Response (SUCCESS):
{
  "status": "success",
  "message": "Signature uploaded",
  "data": {
    "signature_url": "string"
  }
}
Response (ERROR):
{
  "status": "error",
  "message": "Failed to update database",
  "error_detail": "constraint / null / relation"
}
📌 B. Libatkan WP
Endpoint Validasi:
POST /api/wp/validate
Request:
{
  "nik_npwp": "string",
  "email": "string"
}
Logic:
SELECT * 
FROM a_2_verified_users 
WHERE nik = ? AND email = ?
Endpoint Kirim:
POST /api/wp/invite-sign
Flow:

Validasi user
Insert relasi:

INSERT INTO wp_sign_requests (wp_id, booking_id, status)
VALUES (?, ?, 'pending')

Kirim email
Push ke dashboard WP

📌 C. Auto-fill Validasi
Query Ideal (JOIN):
SELECT 
  u.nama,
  u.alamat_pu,
  u.no_telepon,
  b.*,
  v.*
FROM pat_1_bookingsspd b
LEFT JOIN a_2_verified_users u ON b.userid = u.userid
LEFT JOIN pat_2_bphtb_perhitungan bp ON b.nobooking = bp.nobooking
LEFT JOIN pat_4_objek_pajak op ON b.nobooking 
LEFT JOIN pat_5_penghitungan_njop
LEFT JOIN pat_6_sign
LEFT JOIN pat_7_validasi_surat
LEFT JOIN pat_8_validasi_tambahan vt ON b.nobooking = vt.nobooking
WHERE b.nobooking  
🧨 3. DEBUG → ROOT CAUSE (INI YANG PALING PENTING)
❌ Error: "failed to update Database"

Gue kasih kemungkinan REAL (berdasarkan pengalaman backend production):

🔴 Kemungkinan 1: Constraint Error

Kasus:
userid tidak ada
nobooking tidak valid

👉 Cek:

SELECT * FROM pat_1_bookingsspd WHERE nobooking = ?
SELECT * FROM a_2_verified_users WHERE userid = ?
🔴 Kemungkinan 2: NULL Value

Kasus:
Field wajib tidak diisi (NOT NULL di DB)

👉 Contoh:
signature_url NOT NULL
Tapi backend kirim:

"signature_url": null
🔴 Kemungkinan 3: Transaction Gagal (Silent)
Kalau pakai Go + ORM (kemungkinan besar):

👉 Problem:
tx := db.Begin()
tx.Create(...)
tx.Update(...)
tx.Commit() // ❌ tapi error sebelumnya tidak dicek

👉 Fix:
if err := tx.Create(...).Error; err != nil {
    tx.Rollback()
    return err
}
🔴 Kemungkinan 4: File Upload Gagal Tapi Tetap Save DB

Flow salah:
Upload file gagal
Tapi tetap insert ke DB
Result: error

👉 Fix:
if fileUploadError != nil {
    return error // STOP sebelum DB
}
🔴 Kemungkinan 5: Field Mapping Salah (Frontend vs Backend)

Frontend:
"userid"

Backend expect:
"userid"

👉 Ini sering banget kejadian.
🔍 Debug Cepat (Yang Harus Kamu Lakukan SEKARANG)
Tambahkan log ini di backend:
log.Println("REQUEST:", requestBody)
log.Println("userid:", userid)
log.Println("nobooking:", nobooking)
log.Println("ERROR:", err)

Kalau bisa:
log.Printf("FULL ERROR: %+v\n", err)
⚠️ PRIORITY (JANGAN SALAH URUTAN)

Kalau kamu ngerjain ini random → bakal makin kacau.
Urutan yang BENAR:
✅ Fix upload signature (biar core jalan)
✅ Validasi WP (biar flow aman)
✅ Auto-fill (biar UX rapi)