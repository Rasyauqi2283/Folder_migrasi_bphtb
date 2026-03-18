# E-BPHTB Database Documentation

Database: **bappenda** (PostgreSQL).  
Total tabel: **35** (sesuai `\dt` di psql).

Dokumen ini menjadi referensi untuk migrasi bertahap ke Golang/Next.js. Sumber skema: `bappenda_dump_clean.sql`.

---

## 1. Ringkasan

| Kelompok | Tabel | Keterangan |
|----------|--------|-------------|
| **User** (a_*) | a_1_unverified_users, a_2_verified_users | User belum verifikasi / sudah lengkap |
| **Booking & BPHTB** (pat_*) | pat_1_bookingsspd … pat_8_validasi_tambahan | Inti booking, perhitungan, dokumen, objek pajak, NJOP, tanda tangan, validasi |
| **Alur LTB/LSB** | ltb_1_terima_berkas_sspd, lsb_1_serah_berkas | Terima berkas dari PPAT, serah ke PPAT |
| **Peneliti/Paraf** (p_*) | p_1_verifikasi, p_2_verif_sign, p_3_clear_to_paraf | Verifikasi peneliti, stempel, clear to paraf |
| **Bank** | bank_1_cek_hasil_transaksi | Verifikasi pembayaran bank |
| **BSRE/Signing** (pv_*) | pv_1_debug_log, pv_1_paraf_validate, pv_2_signing_requests, pv_3_bsre_token_cache, pv_4_signing_audit_event, pv_7_audit_log, pv_local_certs | Validasi paraf, signing, token BSRE, audit, sertifikat lokal |
| **Notifikasi & session** | notifications, sys_notifications, user_sessions, password_reset_tokens | Notifikasi in-app, session Express, reset password |
| **Lain** | daily_counter, faqs, notices, file_lengkap_tertandatangani, ttd_paraf_kasie, api_idempotency, backup_* | Counter harian, FAQ, pengumuman, file TTD, idempotency, backup |

---

## 2. Daftar Tabel per Kelompok

### 2.1 User (a_*)

| Tabel | Deskripsi |
|-------|-----------|
| **a_1_unverified_users** | User yang belum verifikasi (registrasi, OTP). |
| **a_2_verified_users** | User yang datanya sudah lengkap (login, profil, divisi, ppat_khusus, tanda tangan). |

### 2.2 Booking & BPHTB (pat_*)

| Tabel | Deskripsi |
|-------|-----------|
| **pat_1_bookingsspd** | Inti booking SSPD: nobooking, wajib pajak, objek, trackstatus, path dokumen, nomor_validasi. |
| **pat_2_bphtb_perhitungan** | Perhitungan BPHTB per booking (nilai perolehan, bphtb_yangtelah_dibayar). |
| **pat_3_documents** | Dokumen tambahan per booking (path_document1/2, booking_id). |
| **pat_4_objek_pajak** | Data objek pajak (letak, status kepemilikan, sertifikat, tanggal, nobooking). |
| **pat_5_penghitungan_njop** | NJOP: luas tanah/bangunan, njop, total_njoppbb, nobooking. |
| **pat_6_sign** | Tanda tangan PPAT/WP (path_ttd_ppatk, path_ttd_wp, nobooking). |
| **pat_7_validasi_surat** | Surat validasi: nomor_validasi (UNIQUE), nama_pemohon, status, nobooking. |
| **pat_8_validasi_tambahan** | Data tambahan validasi (kampungop, kelurahanop, alamat_pemohon, nobooking). |

### 2.3 LTB / LSB

| Tabel | Deskripsi |
|-------|-----------|
| **ltb_1_terima_berkas_sspd** | LTB menerima berkas dari PPAT; no_registrasi, trackstatus, userid. |
| **lsb_1_serah_berkas** | LSB menyerahkan berkas ke PPAT; status, trackstatus, file_withstempel_path. |

### 2.4 Peneliti / Paraf (p_*)

| Tabel | Deskripsi |
|-------|-----------|
| **p_1_verifikasi** | Data verifikasi peneliti: nobooking, nama_pengirim, no_registrasi, persetujuan, tanda_tangan_path. |
| **p_2_verif_sign** | Stempel verifikasi (stempel_booking_path, nobooking). |
| **p_3_clear_to_paraf** | Clear to paraf: nobooking, pemverifikasi, tanda_paraf_path, persetujuan. |

### 2.5 Bank

| Tabel | Deskripsi |
|-------|-----------|
| **bank_1_cek_hasil_transaksi** | Hasil cek transaksi bank: nobooking, bphtb_yangtelah_dibayar, status_verifikasi, no_registrasi. |

### 2.6 BSRE / Signing (pv_*)

| Tabel | Deskripsi |
|-------|-----------|
| **pv_1_debug_log** | Audit status validasi (no_validasi, old_status, new_status). |
| **pv_1_paraf_validate** | Validasi paraf: nobooking, no_validasi (format CHECK), pemverifikasi, pemparaf. |
| **pv_2_signing_requests** | Request signing BSRE: no_validasi, status (Pending/Signing/Signed/…), signed_pdf_path, qr_*. |
| **pv_3_bsre_token_cache** | Cache token BSRE (environment sandbox/prod, access_token, expires_at). |
| **pv_4_signing_audit_event** | Audit event signing (entity_type, event_type, signing_request_id FK). |
| **pv_7_audit_log** | Log audit umum (no_validasi, action, acted_by, reason). |
| **pv_local_certs** | Sertifikat lokal (userid, serial_number, public_key_pem, status active/revoked/expired). |

### 2.7 Notifikasi & Session

| Tabel | Deskripsi |
|-------|-----------|
| **notifications** | Dipakai oleh notification endpoint (unread, mark-read). Struktur: perlu dicek di DB (mungkin id, user/recipient, is_read, message, created_at). |
| **sys_notifications** | Notifikasi sistem: recipient_id (FK a_2_verified_users), recipient_divisi, booking_id (FK pat_1_bookingsspd), is_read, expires_at. |
| **user_sessions** | Session Express (connect-pg-simple): sid, sess, expire. |
| **password_reset_tokens** | Token reset password: email, token, expires_at. |

### 2.8 Lain-lain

| Tabel | Deskripsi |
|-------|-----------|
| **daily_counter** | Counter harian (date, counter) untuk nomor urut. |
| **faqs** | FAQ: question, answer, userid. |
| **notices** | Pengumuman: content, active, userid. |
| **file_lengkap_tertandatangani** | File lengkap tertandatangani: nobooking, tanda_tangan_path, no_validasi. |
| **ttd_paraf_kasie** | Tanda tangan paraf kasie: userid, signfile_path, sign_paraf, nobooking. |
| **api_idempotency** | Idempotency API: endpoint, idempotency_key, response_json, status. |
| **backup_jenis_wajib_pajak** | Backup (id). |
| **backup_jenis_wajib_pajak_ppatk** | Backup (bookingid). |

---

## 3. Skema Ringkas per Tabel (Kolom Penting)

### a_1_unverified_users

| Kolom | Tipe | Constraint |
|-------|------|------------|
| id | integer | PK |
| nama, nik, telepon, email, password | varchar/text | NOT NULL |
| foto, otp, verifiedstatus, fotoprofil | varchar/text | |
| verse | varchar(50) | WP \| Karyawan \| PU (jalur pendaftaran) |
| nip | varchar(20) | Untuk Karyawan |
| special_field, pejabat_umum, divisi | varchar | Untuk PU (PPAT/PPATS) |

### a_2_verified_users

| Kolom | Tipe | Constraint |
|-------|------|------------|
| id | integer | PK |
| nama, nik, telepon, email, password | varchar/text | NOT NULL |
| fotoprofil, userid, divisi | varchar/text | NOT NULL (userid, divisi) |
| **verse** | varchar(50) | CHECK (Karyawan \| PU \| WP) — kategori: Karyawan, PU (PPAT/PPATS), WP (Wajib Pajak) |
| statuspengguna | varchar(50) | DEFAULT 'offline' |
| ppat_khusus, special_field, tanda_tangan_path, tanda_tangan_mime | varchar/text | |
| status_ppat | varchar(100) | |

### pat_1_bookingsspd

| Kolom | Tipe | Constraint |
|-------|------|------------|
| bookingid | integer | PK |
| userid | varchar(50) | NOT NULL |
| jenis_wajib_pajak | enum | 'Badan Usaha' \| 'Perorangan' |
| nobooking | varchar(255) | NOT NULL, UNIQUE |
| noppbb, namawajibpajak, alamatwajibpajak | varchar/text | NOT NULL |
| trackstatus | varchar(50) | DEFAULT 'Draft' |
| akta_tanah_path, sertifikat_tanah_path, pelengkap_path | varchar(255) | |
| created_at | timestamptz | DEFAULT CURRENT_TIMESTAMP |
| file_withstempel_path, nomor_validasi, pdf_dokumen_path | varchar/text | |
| nomor_validasi | varchar(40) | UNIQUE, FK → pat_7_validasi_surat(nomor_validasi) |

### pat_2_bphtb_perhitungan

| Kolom | Tipe | Constraint |
|-------|------|------------|
| calculationid | integer | PK |
| nobooking | varchar(50) | NOT NULL, FK → pat_1_bookingsspd(nobooking) |
| nilaiperolehanobjekpajaktidakkenapajak | numeric(15,2) | NOT NULL |
| bphtb_yangtelah_dibayar | integer | |

### pat_4_objek_pajak

| Kolom | Tipe | Constraint |
|-------|------|------------|
| id | integer | PK |
| nobooking | varchar(255) | FK → pat_1_bookingsspd(nobooking) |
| letaktanahdanbangunan | varchar(255) | NOT NULL |
| status_kepemilikan | varchar(50) | CHECK (Milik Pribadi/Bersama/Sewa/HGB) |

### pat_5_penghitungan_njop

| Kolom | Tipe | Constraint |
|-------|------|------------|
| id | integer | PK |
| nobooking | varchar(255) | NOT NULL, FK → pat_1_bookingsspd(nobooking) |
| luas_tanah, njop_tanah, luas_bangunan, njop_bangunan | numeric | NOT NULL |
| total_njoppbb | numeric(15,2) | |

### pat_7_validasi_surat

| Kolom | Tipe | Constraint |
|-------|------|------------|
| id | integer | PK |
| nomor_validasi | varchar(50) | NOT NULL, UNIQUE |
| nama_pemohon, alamat_pemohon, no_telepon | varchar/text | NOT NULL |
| status | varchar(20) | DEFAULT 'unused', CHECK (used/unused) |
| nobooking | varchar(255) | |

### sys_notifications

| Kolom | Tipe | Constraint |
|-------|------|------------|
| id | integer | PK |
| recipient_id | integer | NOT NULL, FK → a_2_verified_users(id) |
| recipient_divisi | varchar(50) | NOT NULL |
| booking_id | integer | NOT NULL, FK → pat_1_bookingsspd(bookingid) |
| title, message | varchar/text | NOT NULL |
| is_read | boolean | DEFAULT false |
| created_at, expires_at | timestamp | |

### pv_1_paraf_validate

| Kolom | Tipe | Constraint |
|-------|------|------------|
| id | integer | PK |
| nobooking | varchar(50) | NOT NULL |
| no_validasi | varchar(100) | CHECK regex ^[A-Z0-9]{8}-[A-Z0-9]{3}$ |
| pemverifikasi, pemparaf, status_tertampil | varchar(100) | |

### pv_2_signing_requests

| Kolom | Tipe | Constraint |
|-------|------|------------|
| id | integer | PK |
| no_validasi | varchar(100) | NOT NULL, FK → pv_1_paraf_validate(no_validasi), CHECK format |
| status | varchar(20) | NOT NULL, CHECK (Pending/Signing/Signed/Failed/Cancelled/APPROVED) |
| signed_pdf_path, source_pdf_path | text | |
| qr_payload, qr_image_path | text | |

Tabel lain (pat_3, pat_6, pat_8, ltb_1, lsb_1, p_1, p_2, p_3, bank_1, pv_3, pv_4, pv_7, pv_local_certs, user_sessions, password_reset_tokens, faqs, notices, file_lengkap_tertandatangani, ttd_paraf_kasie, api_idempotency, daily_counter): skema lengkap mengacu ke `bappenda_dump_clean.sql`.

---

## 4. Relasi Utama (ER Singkat)

```
a_2_verified_users (id)
  ← user_sessions (via sess)
  ← sys_notifications (recipient_id)
  ← pat_1_bookingsspd (userid = creator)

pat_1_bookingsspd (bookingid, nobooking)
  ← pat_2_bphtb_perhitungan (nobooking)
  ← pat_4_objek_pajak (nobooking)
  ← pat_5_penghitungan_njop (nobooking)
  ← pat_7_validasi_surat (nobooking) → pat_1_bookingsspd.nomor_validasi (FK fk_noval)
  ← sys_notifications (booking_id)
  ← ltb_1_terima_berkas_sspd, lsb_1_serah_berkas (nobooking)
  ← bank_1_cek_hasil_transaksi (nobooking)

pat_7_validasi_surat (nomor_validasi)
  ← pat_1_bookingsspd (nomor_validasi)

pv_1_paraf_validate (no_validasi)
  ← pv_2_signing_requests (no_validasi)

pv_2_signing_requests (id)
  ← pv_4_signing_audit_event (signing_request_id)
```

---

## 5. Trigger & Fungsi Penting

| Nama | Tabel | Kegunaan |
|------|--------|----------|
| **generate_nobooking()** | pat_1_bookingsspd (BEFORE INSERT) | Generate nobooking dari a_2_verified_users.ppat_khusus + tahun + urutan harian. |
| **set_default_status_ppat()** | a_2_verified_users (BEFORE INSERT/UPDATE) | Set status_ppat = 'aktif' untuk divisi PPAT/PPATS jika NULL. |
| **audit_pv1_update()** | pv_1_paraf_validate (AFTER UPDATE) | Insert ke pv_1_debug_log (old_status, new_status). |
| **update_timestamp()** | pat_5_penghitungan_njop (BEFORE UPDATE) | Set updated_at = NOW(). |
| **set_created_at()** | pat_8_validasi_tambahan (BEFORE INSERT) | Set created_at (timezone Asia/Jakarta). |
| **set_updated_at()** | lsb_1_serah_berkas (BEFORE UPDATE) | Set updated_at = now(). |

---

## 6. Catatan Migrasi

- **Tabel paling sering dipakai endpoint:** `pat_1_bookingsspd`, `a_2_verified_users`, `p_1_verifikasi`, `ltb_1_terima_berkas_sspd`, `bank_1_cek_hasil_transaksi`, `pat_7_validasi_surat`, `pv_1_paraf_validate`, `pv_2_signing_requests`, `sys_notifications`. Prioritaskan dokumentasi kontrak (query/response) saat pindah ke Go/Next.
- **Inkonsistensi nama:** Di codebase ada referensi `ppat_*` vs `pat_*` (mis. sequence ppatk_bookingsspd_bookingid_seq untuk pat_1_bookingsspd). Gunakan nama tabel resmi `pat_*` sebagai acuan.
- **Kolom persetujuan:** Di beberapa tempat diperlakukan sebagai string ('Iya') vs boolean; sebaiknya distandarkan di aplikasi atau migrasi skema.
- **Tabel notifications vs sys_notifications:** `notifications` dipakai oleh route notifikasi (unread, mark-read); `sys_notifications` dipakai oleh trigger/notifikasi sistem. Pastikan kedua struktur terdokumentasi jika keduanya ada di DB.
- **Row Level Security:** `pv_1_paraf_validate` mengaktifkan RLS; kebijakan (policy) perlu didokumentasi terpisah jika ada.
