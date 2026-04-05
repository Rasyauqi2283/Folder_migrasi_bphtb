# Runbook Meeting - Cutover Server, Domain, dan UAT BJB

Dokumen ini dipakai sebagai panduan rapat dan eksekusi teknis saat perpindahan server, pemasangan domain resmi, serta uji payment gateway Bank BJB tanpa menyentuh data asli.

---

## 1) Scope dan Tujuan

- Pindah aplikasi E-BPHTB ke server tujuan.
- Aktifkan domain resmi `bphtb.bappenda.go.id`.
- Jalankan uji end-to-end payment flow (sandbox/UAT) dengan data terisolasi.
- Pastikan rollback plan siap jika ada kendala.

---

## 2) Checklist Pra-Cutover (H-1 / sebelum meeting)

### 2.1 Infrastruktur

- [ ] Server production siap (CPU, RAM, disk, akses SSH).
- [ ] Reverse proxy siap (Nginx/Caddy) untuk frontend + backend API.
- [ ] Port aplikasi internal tidak terekspos langsung ke publik.
- [ ] Log rotation aktif.
- [ ] Backup storage siap (harian + on-demand sebelum cutover).

### 2.2 Aplikasi

- [ ] Backend build sukses (`go build ./...`).
- [ ] Frontend build sukses (`next build`).
- [ ] Semua env var tersedia (DB, JWT, SMTP, API target, CORS).
- [ ] Upload path dokumen writable oleh service user.
- [ ] Health check endpoint aktif: `/api/system/status`.

### 2.3 Database

- [ ] Schema migration sudah up-to-date.
- [ ] Koneksi DB production teruji.
- [ ] Backup DB terakhir tervalidasi (restore test minimal 1x).
- [ ] User role DB dibatasi (least privilege).

---

## 3) Checklist Domain `bphtb.bappenda.go.id`

- [ ] DNS record dibuat:
  - [ ] `A/AAAA` ke IP server, atau
  - [ ] `CNAME` ke endpoint hosting.
- [ ] Sertifikat SSL/TLS aktif (HTTPS).
- [ ] Redirect HTTP -> HTTPS aktif.
- [ ] CORS backend whitelist `https://bphtb.bappenda.go.id`.
- [ ] Cookie/session mode production (`Secure`, `SameSite`, domain sesuai).
- [ ] Verifikasi browser:
  - [ ] Frontend load
  - [ ] API request sukses
  - [ ] Tidak ada mixed-content.

---

## 4) Strategi UAT Payment Gateway BJB (tanpa data asli)

## Prinsip wajib

- Gunakan **credential sandbox/UAT**, bukan credential live.
- Gunakan **database staging terpisah** dari production.
- Callback URL sandbox harus menuju endpoint staging.
- Tidak boleh menulis ke tabel production saat mode sandbox.

## Kontrol teknis

- [ ] `PAYMENT_MODE=sandbox` (atau `mock` untuk fallback demo).
- [ ] Merchant ID / Secret Key sandbox tersimpan di env server staging.
- [ ] Signature verification callback aktif.
- [ ] Idempotency callback aktif (request duplikat tidak double-process).
- [ ] Whitelist IP callback BJB (sandbox/prod dibedakan).
- [ ] Audit log callback disimpan (timestamp, reference, signature result).

---

## 5) Test Scenario Besok (Trial and Error UAT)

## Alur utama booking

1. Buat booking -> status `Terbuat`
2. Minta billing -> status `awaited_billing`
3. Simulasi/gateway callback -> status `in_paid` lalu `paid`
4. Klik "Isi ketika telah bayar" -> simpan perhitungan -> status `Draft`
5. Lanjut kirim sesuai alur operasional

## Skenario wajib diuji

- [ ] Pembayaran sukses nominal pas
- [ ] Kurang bayar (`KURANG_BAYAR`)
- [ ] Callback duplikat (idempotency)
- [ ] Callback telat/tertunda
- [ ] Booking lama (legacy status) tetap bisa diproses
- [ ] Dashboard bank (`hasil-transaksi`) sinkron dengan status booking

## Kriteria lulus UAT

- [ ] Tidak ada loncatan status ilegal.
- [ ] Tidak ada perubahan data di environment production saat uji sandbox.
- [ ] Tabel bank dan booking sinkron berdasarkan `nobooking`.
- [ ] Semua error message mengarah ke panduan operasional (bukan debug teknis).

---

## 6) Rencana Cutover (Hari-H)

1. Freeze perubahan kode sementara.
2. Backup DB production.
3. Deploy backend + frontend ke server baru.
4. Jalankan migration.
5. Validasi smoke test:
   - Login
   - Create booking
   - Request billing
   - Simulasi bayar
   - Save perhitungan
6. Arahkan DNS/domain final.
7. Monitoring intensif 2-4 jam pertama.

---

## 7) Rollback Plan (jika gagal)

- [ ] Kembalikan traffic ke server/domain sebelumnya.
- [ ] Restore DB dari backup pre-cutover (jika perlu).
- [ ] Nonaktifkan callback gateway sementara.
- [ ] Catat insiden + root cause + langkah koreksi.

---

## 8) PIC Meeting (isi sebelum rapat)

- PIC Infra/Server:
- PIC Backend:
- PIC Frontend:
- PIC Database:
- PIC Gateway BJB:
- PIC Verifikasi UAT:

---

## 9) Catatan Hasil Meeting

- Keputusan:
- Risiko terbuka:
- Action item:
- Target waktu go-live:

